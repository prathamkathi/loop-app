/**
 * seed_pulse.js
 * Populates Firestore 'pulse' collection with official IIT Delhi campus notices.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.resolve(__dirname, '../scraper/serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`[Error] Service account key not found at ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Verified real notices only. Mock data removed.
const PULSE_ITEMS = [];

async function seedPulse() {
  if (PULSE_ITEMS.length === 0) {
    console.log('No pulse items to seed. Empty array.');
    return;
  }
  console.log('Seeding Firestore "pulse" collection...');
  const batch = db.batch();
  const now = Date.now();

  for (const item of PULSE_ITEMS) {
    const ref = db.collection('pulse').doc(item.id);
    const createdAt = new Date(now - (item.order * 3600 * 1000));
    batch.set(ref, {
      ...item,
      createdAt: admin.firestore.Timestamp.fromDate(createdAt),
    }, { merge: true });
  }

  await batch.commit();
  console.log(`Successfully seeded ${PULSE_ITEMS.length} items to collection 'pulse'!`);
}

seedPulse().catch(console.error);
