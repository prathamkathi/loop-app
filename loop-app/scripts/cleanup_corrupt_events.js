/**
 * cleanup_corrupt_events.js
 * Node.js runner for LOOP Firestore cleanup using firebase-admin.
 * 
 * Usage:
 *   node cleanup_corrupt_events.js          # Dry-run
 *   node cleanup_corrupt_events.js --commit # Apply changes to live Firestore
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

async function runCleanup(commit = false) {
  console.log('='.repeat(60));
  console.log(`LOOP FIRESTORE CLEANUP — Mode: ${commit ? 'COMMIT (APPLYING CHANGES)' : 'DRY-RUN (READ-ONLY)'}`);
  console.log('='.repeat(60));

  const eventsRef = db.collection('events');
  const snapshot = await eventsRef.get();
  console.log(`Fetched ${snapshot.size} total event documents from Firestore.\n`);

  const currentYear = new Date().getFullYear();
  const seenHostTitles = new Map();
  const toUpdate = [];
  const toArchive = [];

  snapshot.forEach((doc) => {
    const d = doc.data();
    const docId = doc.id;
    const title = (d.title || '').trim();
    const host = (d.host || '').trim();
    const dateStr = String(d.date || '').trim().toLowerCase();
    const startsAt = d.startsAt;
    const image = d.image || '';
    const status = d.status || '';

    // If already archived, skip
    if (status === 'archived') return;

    const normKey = `${host.toLowerCase()}:${title.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    // 1. Check for duplicates
    if (seenHostTitles.has(normKey)) {
      const prevId = seenHostTitles.get(normKey);
      console.log(`[Duplicate Found] Doc '${docId}' duplicates '${prevId}' ('${title}' by ${host})`);
      toArchive.push({
        id: docId,
        reason: 'duplicate_event',
        details: `Duplicates document ${prevId}`,
      });
      return;
    } else {
      seenHostTitles.set(normKey, docId);
    }

    // 2. Check for missing/invalid poster image
    if (!image || !image.includes('res.cloudinary.com')) {
      console.log(`[Missing Poster] Doc '${docId}' ('${title}') has no Cloudinary image.`);
      toArchive.push({
        id: docId,
        reason: 'missing_poster',
        details: 'No valid Cloudinary image URL',
      });
      return;
    }

    // 3. Check for invalid date strings
    const invalidMarkers = ['not available', 'ongoing', 'not specified', 'none', 'tbd', 'tba'];
    if (invalidMarkers.some((marker) => dateStr.includes(marker))) {
      console.log(`[Invalid Date] Doc '${docId}' ('${title}') has invalid date string '${d.date}'.`);
      toArchive.push({
        id: docId,
        reason: 'invalid_date',
        details: `Date string is '${d.date}'`,
      });
      return;
    }

    // 4. Check for 2027 year-rollover bug in startsAt
    if (startsAt) {
      let dt = null;
      if (typeof startsAt.toDate === 'function') {
        dt = startsAt.toDate();
      } else if (startsAt._seconds) {
        dt = new Date(startsAt._seconds * 1000);
      } else if (typeof startsAt === 'string') {
        dt = new Date(startsAt);
      }

      if (dt && !isNaN(dt.getTime()) && dt.getFullYear() > currentYear) {
        const corrected = new Date(dt);
        corrected.setFullYear(currentYear);
        console.log(`[Year Rollover Bug] Doc '${docId}' ('${title}') has year ${dt.getFullYear()} -> Correcting to ${corrected.getFullYear()}.`);
        toUpdate.push({
          id: docId,
          data: {
            startsAt: admin.firestore.Timestamp.fromDate(corrected),
          },
        });
      }
    }
  });

  console.log('\n' + '-'.repeat(60));
  console.log(`Summary: ${toUpdate.length} document(s) to fix year, ${toArchive.length} document(s) to archive.`);
  console.log('-'.repeat(60));

  if (!commit) {
    console.log('\n[Dry Run Complete] No changes written to Firestore. Pass --commit to apply.');
    return;
  }

  const batch = db.batch();
  let count = 0;

  for (const item of toUpdate) {
    const ref = eventsRef.doc(item.id);
    batch.update(ref, item.data);
    count++;
  }

  for (const item of toArchive) {
    const ref = eventsRef.doc(item.id);
    batch.update(ref, {
      status: 'archived',
      archivedReason: item.reason,
      archivedDetails: item.details,
      archivedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    count++;
  }

  if (count > 0) {
    await batch.commit();
    console.log(`\n[Committed] Successfully updated/archived ${count} documents in live Firestore!`);
  } else {
    console.log('\n[Clean] Database is already clean. No changes necessary.');
  }
}

const isCommit = process.argv.includes('--commit');
runCleanup(isCommit).catch((err) => {
  console.error('[Error] Cleanup failed:', err);
  process.exit(1);
});
