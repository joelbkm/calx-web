/**
 * Set Super Admin Custom Claims
 *
 * Usage:
 *   1. Download your Firebase service account key from
 *      Firebase Console → Project Settings → Service Accounts → Generate new private key
 *   2. Save it as calx-web/service-account-key.json
 *   3. Run: npx ts-node scripts/set-super-admin.ts
 *
 * This script sets the Custom Claim { role: 'super_admin' } on joelbokomo@gmail.com
 */

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const SUPER_ADMIN_EMAIL = 'joelbokomo@gmail.com';

async function main() {
    // Load service account key
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const keyPath = resolve(__dirname, '../service-account-key.json');

    let serviceAccount: ServiceAccount;
    try {
        serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8')) as ServiceAccount;
    } catch {
        console.error('❌ Service account key not found at:', keyPath);
        console.error('');
        console.error('📋 Steps to fix:');
        console.error('  1. Go to Firebase Console → Project Settings → Service Accounts');
        console.error('  2. Click "Generate new private key"');
        console.error('  3. Save the JSON file as: calx-web/service-account-key.json');
        console.error('  4. Run this script again');
        process.exit(1);
    }

    // Initialize Firebase Admin
    const app = initializeApp({
        credential: cert(serviceAccount),
    });

    const auth = getAuth(app);

    try {
        // Find user by email
        const user = await auth.getUserByEmail(SUPER_ADMIN_EMAIL);
        console.log(`\n👤 Found user: ${user.displayName || user.email} (${user.uid})`);

        // Check current claims
        const currentClaims = user.customClaims || {};
        console.log('📌 Current claims:', JSON.stringify(currentClaims));

        // Set Super Admin claim
        await auth.setCustomUserClaims(user.uid, {
            ...currentClaims,
            role: 'super_admin',
        });

        // Verify
        const updatedUser = await auth.getUser(user.uid);
        console.log('✅ Updated claims:', JSON.stringify(updatedUser.customClaims));
        console.log('');
        console.log(`🎉 ${SUPER_ADMIN_EMAIL} is now Super Admin!`);
        console.log('');
        console.log('⚠️  The user must sign out and sign back in for changes to take effect.');
    } catch (error: unknown) {
        const err = error as { code?: string; message?: string };
        if (err.code === 'auth/user-not-found') {
            console.error(`❌ No user found with email: ${SUPER_ADMIN_EMAIL}`);
            console.error('   Make sure this account exists in Firebase Auth.');
        } else {
            console.error('❌ Error:', err.message);
        }
        process.exit(1);
    }

    process.exit(0);
}

main();
