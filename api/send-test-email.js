// Vercel API handler for sending test emails for communication jobs
import { Resend } from 'resend';
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  let serviceAccount;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      // Parse the service account from environment variable
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      console.log('✅ Using FIREBASE_SERVICE_ACCOUNT_KEY from environment');
    } catch (error) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error.message);
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY format');
    }
  } else {
    // Fallback to local service account file for development
    try {
      serviceAccount = require('../serviceAccountKey.json');
      console.log('✅ Using local serviceAccountKey.json');
    } catch (error) {
      console.error('❌ No service account configuration found');
      throw new Error('Firebase service account not configured');
    }
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

/**
 * Generate sample data for testing different email types
 */
function generateSampleData(emailType) {
  const now = new Date();

  switch (emailType) {
    case 'pending_demands_reminder':
      return {
        count: 3,
        items: [
          {
            id: 'sample-1',
            memberName: 'Jean Dupont',
            amount: 45.50,
            description: 'Bouteilles plongée du 15/11',
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            urgency: false,
          },
          {
            id: 'sample-2',
            memberName: 'Marie Martin',
            amount: 120.00,
            description: 'Stage niveau 2',
            createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), // 8 days ago (urgent)
            urgency: true,
          },
          {
            id: 'sample-3',
            memberName: 'Pierre Dubois',
            amount: 35.00,
            description: 'Location matériel',
            createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            urgency: false,
          },
        ],
        totalAmount: 200.50,
      };

    case 'accounting_codes_daily':
      return {
        count: 5,
        items: [
          {
            code: '600-DIVE',
            description: 'Plongées',
            transactionCount: 12,
            totalAmount: 540.00,
          },
          {
            code: '601-EQUIP',
            description: 'Équipement',
            transactionCount: 5,
            totalAmount: 325.00,
          },
          {
            code: '602-TRAIN',
            description: 'Formations',
            transactionCount: 3,
            totalAmount: 450.00,
          },
        ],
        totalTransactions: 20,
        totalAmount: 1315.00,
      };

    case 'weekly_summary':
      return {
        weekNumber: Math.ceil((now.getDate()) / 7),
        newMembers: 2,
        totalDives: 18,
        totalRevenue: 2340.50,
        pendingDemands: 7,
      };

    case 'monthly_report':
      return {
        month: now.toLocaleString('fr-BE', { month: 'long', year: 'numeric' }),
        totalMembers: 45,
        newMembers: 5,
        totalDives: 78,
        totalRevenue: 9850.00,
        totalExpenses: 3200.00,
        pendingDemands: 12,
      };

    default:
      return {
        count: 1,
        message: 'Données de test pour ' + emailType,
      };
  }
}

/**
 * Generate HTML email content based on email type and data
 */
function generateEmailHTML(emailType, data, clubName = 'Calypso Diving Club') {
  const baseStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
  `;

  switch (emailType) {
    case 'pending_demands_reminder':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { ${baseStyles} margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .summary-item { display: flex; justify-content: space-between; margin: 10px 0; }
            .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f8f9fa; font-weight: 600; }
            .urgent { color: #dc3545; font-weight: bold; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 ${data.count} demande(s) de remboursement en attente</h1>
            </div>
            <div class="content">
              <p>Bonjour,</p>
              <p><strong>Ceci est un email de TEST.</strong></p>
              <p>Vous avez actuellement <strong>${data.count} demande(s)</strong> de remboursement en attente d'approbation.</p>

              <div class="summary">
                <div class="summary-item">
                  <span>Nombre de demandes:</span>
                  <strong>${data.count}</strong>
                </div>
                <div class="summary-item">
                  <span>Montant total:</span>
                  <strong>${data.totalAmount.toFixed(2)} €</strong>
                </div>
              </div>

              ${data.items.some(i => i.urgency) ? `
                <div class="alert">
                  ⚠️ <strong>Attention:</strong> Certaines demandes ont plus de 7 jours et nécessitent une action urgente !
                </div>
              ` : ''}

              <h3>Détails des demandes:</h3>
              <table>
                <thead>
                  <tr>
                    <th>Membre</th>
                    <th>Description</th>
                    <th>Montant</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.items.map(item => `
                    <tr>
                      <td>${item.memberName}</td>
                      <td>${item.description}</td>
                      <td ${item.urgency ? 'class="urgent"' : ''}>${item.amount.toFixed(2)} €</td>
                      <td>${item.urgency ? '<span class="urgent">⚠️ </span>' : ''}${item.createdAt.toLocaleDateString('fr-BE')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <a href="https://caly.club/parametres" class="button">📋 Consulter les demandes</a>
            </div>
            <div class="footer">
              <p>${clubName} - Système de gestion automatisée</p>
              <p style="color: #999; margin-top: 10px;">⚠️ Ceci est un email de test envoyé depuis CalyCompta</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'accounting_codes_daily':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { ${baseStyles} margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f8f9fa; font-weight: 600; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Codes comptables - Rapport quotidien</h1>
            </div>
            <div class="content">
              <p>Bonjour,</p>
              <p><strong>Ceci est un email de TEST.</strong></p>
              <p>Voici le rapport quotidien des codes comptables utilisés aujourd'hui.</p>

              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Description</th>
                    <th>Transactions</th>
                    <th>Montant total</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.items.map(item => `
                    <tr>
                      <td><strong>${item.code}</strong></td>
                      <td>${item.description}</td>
                      <td>${item.transactionCount}</td>
                      <td>${item.totalAmount.toFixed(2)} €</td>
                    </tr>
                  `).join('')}
                  <tr style="background: #f8f9fa; font-weight: bold;">
                    <td colspan="2">TOTAL</td>
                    <td>${data.totalTransactions}</td>
                    <td>${data.totalAmount.toFixed(2)} €</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="footer">
              <p>${clubName} - Système de gestion automatisée</p>
              <p style="color: #999; margin-top: 10px;">⚠️ Ceci est un email de test envoyé depuis CalyCompta</p>
            </div>
          </div>
        </body>
        </html>
      `;

    default:
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { ${baseStyles} margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📧 Email de test</h1>
            <p><strong>Ceci est un email de TEST.</strong></p>
            <p>Type d'email: <strong>${emailType}</strong></p>
            <pre>${JSON.stringify(data, null, 2)}</pre>
            <div class="footer">
              <p>${clubName} - Système de gestion automatisée</p>
              <p style="color: #999; margin-top: 10px;">⚠️ Ceci est un email de test envoyé depuis CalyCompta</p>
            </div>
          </div>
        </body>
        </html>
      `;
  }
}

/**
 * Generate email subject based on email type
 */
function generateSubject(emailType, data) {
  switch (emailType) {
    case 'pending_demands_reminder':
      return `[TEST] 📧 ${data.count} demande(s) de remboursement en attente`;
    case 'accounting_codes_daily':
      return `[TEST] 📊 Codes comptables - Rapport quotidien`;
    case 'weekly_summary':
      return `[TEST] 📈 Résumé hebdomadaire - Semaine ${data.weekNumber}`;
    case 'monthly_report':
      return `[TEST] 📊 Rapport mensuel - ${data.month}`;
    default:
      return `[TEST] 📧 Email de test - ${emailType}`;
  }
}

/**
 * Send test email API endpoint
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { clubId, jobId, testEmail, authToken } = req.body;

    console.log('📧 [TEST-EMAIL] Starting test email request');
    console.log('📧 [TEST-EMAIL] Request details:', {
      clubId,
      jobId,
      testEmail,
      hasAuthToken: !!authToken,
    });

    // Validate required fields
    if (!clubId || !jobId || !testEmail || !authToken) {
      console.error('❌ Missing required fields:', {
        clubId: !!clubId,
        jobId: !!jobId,
        testEmail: !!testEmail,
        authToken: !!authToken,
      });
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['clubId', 'jobId', 'testEmail', 'authToken'],
      });
    }

    // Verify Firebase Auth token
    console.log('🔐 [TEST-EMAIL] Verifying Firebase Auth token...');
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(authToken);
      console.log('✅ [TEST-EMAIL] Auth token verified for user:', decodedToken.uid);
    } catch (error) {
      console.error('❌ [TEST-EMAIL] Invalid auth token:', error.message);
      return res.status(401).json({
        error: 'Unauthorized',
        details: 'Invalid authentication token',
      });
    }

    // Load club settings to get club name and logo
    console.log('📂 [TEST-EMAIL] Loading club settings...');
    const clubDoc = await db.collection('clubs').doc(clubId).get();
    if (!clubDoc.exists) {
      console.error('❌ [TEST-EMAIL] Club not found:', clubId);
      return res.status(404).json({
        error: 'Club not found',
      });
    }
    const clubData = clubDoc.data();
    const clubName = clubData.name || 'Calypso Diving Club';

    // Load communication settings to get the job details
    console.log('📂 [TEST-EMAIL] Loading communication settings...');
    const settingsDoc = await db.collection('clubs').doc(clubId).collection('settings').doc('communication').get();
    if (!settingsDoc.exists) {
      console.error('❌ [TEST-EMAIL] Communication settings not found');
      return res.status(404).json({
        error: 'Communication settings not found',
      });
    }

    const settings = settingsDoc.data();
    const job = settings.jobs?.find(j => j.id === jobId);
    if (!job) {
      console.error('❌ [TEST-EMAIL] Job not found:', jobId);
      return res.status(404).json({
        error: 'Job not found',
      });
    }

    console.log('📧 [TEST-EMAIL] Job found:', {
      name: job.name,
      emailType: job.emailType,
      templateId: job.templateId,
    });

    // Generate sample data for the email type
    console.log('📊 [TEST-EMAIL] Generating sample data...');
    const sampleData = generateSampleData(job.emailType);

    // Check if job has a custom template
    let htmlContent, subject;
    if (job.templateId) {
      console.log('📄 [TEST-EMAIL] Loading custom template:', job.templateId);
      const templateDoc = await db.collection('clubs').doc(clubId).collection('email_templates').doc(job.templateId).get();

      if (templateDoc.exists) {
        const template = templateDoc.data();
        htmlContent = template.htmlContent;
        subject = `[TEST] ${template.subject}`;

        // TODO: Replace template variables with sample data
        // For now, just use the template as-is
        console.log('✅ [TEST-EMAIL] Using custom template');
      } else {
        console.log('⚠️ [TEST-EMAIL] Custom template not found, using hardcoded template');
        htmlContent = generateEmailHTML(job.emailType, sampleData, clubName);
        subject = generateSubject(job.emailType, sampleData);
      }
    } else {
      console.log('📄 [TEST-EMAIL] Using hardcoded template');
      htmlContent = generateEmailHTML(job.emailType, sampleData, clubName);
      subject = generateSubject(job.emailType, sampleData);
    }

    // Load email configuration from Firestore (same as GoogleMailService)
    console.log('📧 [TEST-EMAIL] Loading email configuration...');
    const settingsRef = db.collection('clubs').doc(clubId).collection('settings').doc('email_config');
    const settingsSnap = await settingsRef.get();

    if (!settingsSnap.exists) {
      console.error('❌ [TEST-EMAIL] Email configuration not found');
      return res.status(500).json({
        error: 'Email service not configured',
        details: 'Please configure your email provider in Settings > Integrations',
      });
    }

    const emailConfig = settingsSnap.data();
    const provider = emailConfig.provider || 'resend';

    console.log('📧 [TEST-EMAIL] Email provider:', provider);

    let emailData;
    if (provider === 'resend') {
      // Use Resend API
      const resendConfig = emailConfig.resend || {};
      const apiKey = resendConfig.apiKey || process.env.RESEND_API_KEY;

      if (!apiKey) {
        console.error('❌ [TEST-EMAIL] Resend API key not configured');
        return res.status(500).json({
          error: 'Resend API key not configured',
          details: 'Please configure your Resend API key in Settings > Integrations',
        });
      }

      console.log('📧 [TEST-EMAIL] Sending email via Resend...');
      const resend = new Resend(apiKey);

      const fromEmail = resendConfig.fromEmail || 'jan@h2m.ai';
      const fromName = resendConfig.fromName || clubName;

      emailData = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: testEmail,
        subject,
        html: htmlContent,
      });

      console.log('✅ [TEST-EMAIL] Email sent successfully via Resend!');
      console.log('✅ [TEST-EMAIL] Resend response:', emailData);
    } else {
      // Use Gmail API (call the existing /api/send-gmail endpoint)
      const gmailConfig = emailConfig.gmail || {};

      if (!gmailConfig.clientId || !gmailConfig.clientSecret || !gmailConfig.refreshToken) {
        console.error('❌ [TEST-EMAIL] Gmail configuration incomplete');
        return res.status(500).json({
          error: 'Gmail configuration incomplete',
          details: 'Please configure your Gmail credentials in Settings > Integrations',
        });
      }

      console.log('📧 [TEST-EMAIL] Sending email via Gmail...');

      // We can't directly use the Gmail API here, but we could call the /api/send-gmail endpoint
      // For simplicity, we'll just use the Resend approach if Gmail is selected
      // You can extend this to call /api/send-gmail if needed
      console.log('⚠️ [TEST-EMAIL] Gmail provider detected, but using Resend for test emails');

      // Fallback to Resend if available
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        const resend = new Resend(apiKey);
        emailData = await resend.emails.send({
          from: `${clubName} <jan@h2m.ai>`,
          to: testEmail,
          subject,
          html: htmlContent,
        });
      } else {
        return res.status(500).json({
          error: 'Gmail test emails not yet supported',
          details: 'Please configure Resend for test emails',
        });
      }
    }

    return res.status(200).json({
      success: true,
      messageId: emailData.id,
      details: {
        to: testEmail,
        subject,
        emailType: job.emailType,
        sampleDataCount: sampleData.count || 0,
      },
    });

  } catch (error) {
    console.error('❌ [TEST-EMAIL] Error:', error);
    console.error('❌ [TEST-EMAIL] Error message:', error.message);
    console.error('❌ [TEST-EMAIL] Error stack:', error.stack);

    return res.status(500).json({
      error: error.message || 'Failed to send test email',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
