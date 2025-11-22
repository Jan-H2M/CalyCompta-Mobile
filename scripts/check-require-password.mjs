#!/usr/bin/env node

/**
 * Check requirePasswordChange flag in Firestore
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account
const serviceAccountPath = join(__dirname, '../serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const clubId = 'calypso';
const userId = 'wXaHiVHWJxFxwi0FnrCZ'; // H2M user ID

console.log('🔍 Checking requirePasswordChange flag in Firestore...');
console.log('📧 User:', userId);
console.log('🏢 Club:', clubId);
console.log('');

try {
  const userDoc = await db.collection('clubs').doc(clubId).collection('members').doc(userId).get();

  if (!userDoc.exists) {
    console.error('❌ User document does NOT exist in Firestore');
    process.exit(1);
  }

  const userData = userDoc.data();
  console.log('✅ User document found');
  console.log('');
  console.log('📋 Full user data:');
  console.log(JSON.stringify(userData, null, 2));
  console.log('');
  console.log('🔐 Security field:');
  console.log(JSON.stringify(userData.security, null, 2));
  console.log('');
  console.log('🎯 requirePasswordChange value:', userData?.security?.requirePasswordChange);

  if (userData?.security?.requirePasswordChange === true) {
    console.log('✅ requirePasswordChange is TRUE (correct!)');
  } else {
    console.log('❌ requirePasswordChange is FALSE or missing (WRONG!)');
  }

  process.exit(0);
} catch (error) {
  console.error('❌ FAILED!', error.message);
  process.exit(1);
}
