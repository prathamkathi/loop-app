import * as admin from 'firebase-admin';
import * as path from 'path';

// Idempotent backfill script to migrate existing Firestore event documents 
// to the new schema containing `startsAt` and normalized `createdAt`.
// Run with: npx ts-node scripts/backfill_events.ts [--apply]

// Configure Firebase Admin
const serviceAccountPath = path.resolve(__dirname, '../scraper/serviceAccountKey.json');
let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (e) {
  console.error(`Could not load service account key at ${serviceAccountPath}`);
  console.error('Please ensure the key exists before running the script.');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function backfillEvents() {
  const args = process.argv.slice(2);
  const isApply = args.includes('--apply');

  console.log(`Starting event backfill... Mode: ${isApply ? 'APPLY (Writing to DB)' : 'DRY RUN (No changes will be saved)'}`);

  const eventsRef = db.collection('events');
  const snapshot = await eventsRef.get();

  if (snapshot.empty) {
    console.log('No events found.');
    return;
  }

  let totalProcessed = 0;
  let totalModified = 0;
  const batchArray: admin.firestore.WriteBatch[] = [];
  let currentBatch = db.batch();
  let operationCount = 0;

  for (const doc of snapshot.docs) {
    totalProcessed++;
    const data = doc.data();
    const updateData: any = {};
    let needsUpdate = false;

    // 1. Fix startsAt
    if (!data.startsAt && data.date) {
      try {
        const timeStr = data.time || '18:00';
        let dateStr = data.date;
        
        // If date doesn't contain a year, append the current year
        const year = new Date().getFullYear();
        if (!dateStr.includes(year.toString())) {
          dateStr = `${dateStr} ${year}`;
        }
        
        const combined = new Date(`${dateStr} ${timeStr}`);
        if (!isNaN(combined.getTime())) {
          updateData.startsAt = admin.firestore.Timestamp.fromDate(combined);
          needsUpdate = true;
        } else {
          console.log(`[Warning] Could not parse date for doc ${doc.id}: "${data.date} ${data.time}"`);
        }
      } catch (e) {
        console.log(`[Warning] Error parsing date for doc ${doc.id}:`, e);
      }
    }

    // 2. Fix createdAt (from ISO string to Timestamp)
    if (data.createdAt && typeof data.createdAt === 'string') {
      try {
        const createdDate = new Date(data.createdAt);
        if (!isNaN(createdDate.getTime())) {
          updateData.createdAt = admin.firestore.Timestamp.fromDate(createdDate);
          needsUpdate = true;
        }
      } catch (e) {
        console.log(`[Warning] Error parsing createdAt for doc ${doc.id}`);
      }
    }

    // 3. Normalise confidence
    if (data.confidence !== undefined && data.confidence > 1) {
      updateData.confidence = data.confidence / 100;
      needsUpdate = true;
    }

    if (needsUpdate) {
      totalModified++;
      console.log(`[Diff] Doc ${doc.id} ("${data.title}") will be updated:`);
      for (const [key, value] of Object.entries(updateData)) {
        console.log(`  + ${key}: ${value instanceof admin.firestore.Timestamp ? value.toDate().toISOString() : value}`);
      }
      
      currentBatch.update(eventsRef.doc(doc.id), updateData);
      operationCount++;

      if (operationCount === 500) {
        batchArray.push(currentBatch);
        currentBatch = db.batch();
        operationCount = 0;
      }
    }
  }

  if (operationCount > 0) {
    batchArray.push(currentBatch);
  }

  console.log(`\nSummary:`);
  console.log(`Total events checked: ${totalProcessed}`);
  console.log(`Total events needing update: ${totalModified}`);

  if (isApply) {
    if (batchArray.length > 0) {
      console.log('Writing changes to Firestore...');
      for (let i = 0; i < batchArray.length; i++) {
        await batchArray[i].commit();
        console.log(`Committed batch ${i + 1}/${batchArray.length}`);
      }
      console.log('Backfill complete!');
    } else {
      console.log('No updates required. Database is already fully compliant.');
    }
  } else {
    console.log('\nThis was a DRY RUN. Run with --apply to save these changes to Firestore.');
  }
}

backfillEvents()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Backfill failed:', err);
    process.exit(1);
  });
