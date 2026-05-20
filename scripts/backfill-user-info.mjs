/**
 * Backfill script: Adds email and displayName from Firebase Auth to Firestore user documents.
 * Run with: node scripts/backfill-user-info.mjs
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Load service account
const serviceAccount = JSON.parse(
    readFileSync(new URL('../service-account-key.json', import.meta.url), 'utf-8')
);

initializeApp({
    credential: cert(serviceAccount),
});

const auth = getAuth();
const db = getFirestore();

async function backfill() {
    console.log('🔄 Fetching all Firebase Auth users...');
    const listResult = await auth.listUsers(1000);
    console.log(`Found ${listResult.users.length} users in Auth.`);

    let updated = 0;
    for (const user of listResult.users) {
        const docRef = db.collection('users').doc(user.uid);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data();
            const updates = {};

            if (!data.email && user.email) {
                updates.email = user.email;
            }
            if (!data.displayName && user.displayName) {
                updates.displayName = user.displayName;
            }
            if (!data.photoURL && !data.photoUrl && user.photoURL) {
                updates.photoUrl = user.photoURL;
            }

            if (Object.keys(updates).length > 0) {
                await docRef.update(updates);
                console.log(`✅ Updated ${user.uid}: ${JSON.stringify(updates)}`);
                updated++;
            } else {
                console.log(`⏭️  Skipped ${user.uid} (already has email/displayName or no Auth data)`);
            }
        } else {
            console.log(`⚠️  No Firestore doc for ${user.uid} — creating minimal doc`);
            await docRef.set({
                email: user.email || null,
                displayName: user.displayName || null,
                createdAt: user.metadata.creationTime,
            }, { merge: true });
            updated++;
        }
    }

    console.log(`\n🎉 Done! Updated ${updated} user(s).`);
}

backfill().catch(console.error);
