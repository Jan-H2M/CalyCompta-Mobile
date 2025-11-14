import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  // In production, Vercel will use service account from environment variables
  // In development, you can use a service account key file
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || 'calycompta'
    });
  } else {
    // Fallback to default credentials (works in Cloud environments)
    initializeApp();
  }
}

/**
 * Vercel Serverless Function to activate a pending user
 * This endpoint wraps the Firebase Cloud Function activateUser
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { userId, clubId, authToken } = req.body;

    // Validate request body
    if (!userId || !clubId || !authToken) {
      return res.status(400).json({
        error: 'Missing required fields: userId, clubId, authToken'
      });
    }

    console.log('🔑 [activate-user API] Request:', { userId, clubId });

    // Verify the auth token
    const auth = getAuth();
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(authToken);
    } catch (error) {
      console.error('❌ [activate-user API] Invalid auth token:', error);
      return res.status(401).json({ error: 'Invalid or expired auth token' });
    }

    // Check if user has admin/superadmin role
    const userRole = decodedToken.role || 'user';
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      console.error('❌ [activate-user API] Insufficient permissions:', { userRole });
      return res.status(403).json({
        error: 'Insufficient permissions. Admin or superadmin role required.'
      });
    }

    // Call the Firebase Cloud Function directly
    // Since we're using Firebase Admin SDK, we'll replicate the logic here
    // or use the httpsCallable approach

    // Import Firebase Firestore
    const { getFirestore, FieldValue } = await import('firebase-admin/firestore');
    const db = getFirestore();

    const DEFAULT_PASSWORD = "Calypso2024!";
    const now = new Date();

    // 1. Get member data from Firestore
    const memberRef = db.collection('clubs').doc(clubId).collection('members').doc(userId);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists) {
      return res.status(404).json({ error: 'Membre non trouvé dans Firestore' });
    }

    const memberData = memberDoc.data();

    if (!memberData) {
      return res.status(404).json({ error: 'Données du membre introuvables' });
    }

    // Check if already activated
    if (!memberData.metadata?.pendingActivation) {
      return res.status(400).json({
        error: 'Ce membre est déjà activé ou n\'est pas en attente d\'activation'
      });
    }

    // 2. Create Firebase Auth user
    let authUser;
    try {
      authUser = await auth.createUser({
        uid: userId,
        email: memberData.email,
        password: DEFAULT_PASSWORD,
        displayName: memberData.displayName,
        emailVerified: false,
      });

      console.log('✅ [activate-user API] Firebase Auth user created:', authUser.uid);
    } catch (error: any) {
      console.error('❌ [activate-user API] Error creating Firebase Auth user:', error);

      if (error.code === 'auth/email-already-exists') {
        return res.status(409).json({
          error: 'Un compte Firebase Auth existe déjà avec cet email'
        });
      }

      throw error;
    }

    // 3. Set custom claims
    try {
      await auth.setCustomUserClaims(userId, {
        role: memberData.role || 'user',
        clubId: clubId
      });
      console.log('✅ [activate-user API] Custom claims set');
    } catch (error) {
      console.error('❌ [activate-user API] Error setting custom claims:', error);
      // Continue anyway - claims can be set later
    }

    // 4. Update Firestore member document
    await memberRef.update({
      isActive: true,
      'metadata.pendingActivation': FieldValue.delete(),
      'metadata.activatedAt': now,
      'metadata.activatedBy': decodedToken.uid,
      updatedAt: now
    });

    console.log('✅ [activate-user API] Firestore updated');

    // 5. Create audit log
    try {
      await db.collection('clubs')
        .doc(clubId)
        .collection('auditLogs')
        .add({
          action: 'user.activated',
          userId: decodedToken.uid,
          userName: decodedToken.name || decodedToken.email,
          targetId: userId,
          targetType: 'user',
          targetName: memberData.displayName,
          details: {
            activatedBy: 'Vercel API',
            activatedVia: 'UserDetailView button',
            defaultPassword: DEFAULT_PASSWORD,
          },
          timestamp: now,
          clubId: clubId,
          severity: 'info',
        });

      console.log('✅ [activate-user API] Audit log created');
    } catch (error) {
      console.error('❌ [activate-user API] Error creating audit log:', error);
      // Continue anyway
    }

    // Return success
    return res.status(200).json({
      success: true,
      message: 'Utilisateur activé avec succès',
      email: memberData.email,
      defaultPassword: DEFAULT_PASSWORD,
      userId: userId
    });

  } catch (error: any) {
    console.error('❌ [activate-user API] Unexpected error:', error);
    return res.status(500).json({
      error: 'Erreur lors de l\'activation de l\'utilisateur',
      details: error.message
    });
  }
}
