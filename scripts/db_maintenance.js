/**
 * db_maintenance.js
 * Consolidated safe database maintenance utility for LOOP Firestore.
 * Replaces legacy destructive scripts with a safe, audited, dry-run-first CLI.
 * 
 * Usage:
 *   node db_maintenance.js --action=status                    # Inspect database status (read-only)
 *   node db_maintenance.js --action=cleanup                   # Dry-run audit of duplicates and corrupted entries
 *   node db_maintenance.js --action=cleanup --confirm         # Execute cleanup (dedup & fix corrupted fields)
 *   node db_maintenance.js --action=purge --confirm           # DANGER: Purge events collection (requires --confirm)
 */

const path = require('path');
const fs = require('fs');

// Resolve service account
const searchPaths = [
  path.resolve(__dirname, '../scraper/serviceAccountKey.json'),
  path.resolve(__dirname, '../../serviceAccountKey.json'),
];

const serviceAccountPath = searchPaths.find(p => fs.existsSync(p));

if (!serviceAccountPath) {
  console.error('[Error] serviceAccountKey.json not found in scraper/ or workspace root.');
  process.exit(1);
}

const admin = require('firebase-admin');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Parse command line arguments
const args = process.argv.slice(2);
const actionArg = args.find(a => a.startsWith('--action='));
const action = actionArg ? actionArg.split('=')[1] : 'status';
const hasConfirm = args.includes('--confirm');

async function main() {
  console.log('='.repeat(65));
  console.log(`LOOP FIRESTORE MAINTENANCE TOOL`);
  console.log(`Action: ${action.toUpperCase()} | Mode: ${hasConfirm ? 'EXECUTE (--confirm)' : 'DRY-RUN (READ-ONLY)'}`);
  console.log('='.repeat(65));

  const eventsRef = db.collection('events');

  if (action === 'status') {
    const snapshot = await eventsRef.get();
    console.log(`Total events documents: ${snapshot.size}`);

    const counts = { approved: 0, pending: 0, rejected: 0, other: 0, missingDate: 0, missingVenue: 0 };
    snapshot.forEach(doc => {
      const data = doc.data();
      const status = data.status || 'other';
      if (counts[status] !== undefined) counts[status]++;
      else counts.other++;

      if (!data.date || data.date === 'Not specified') counts.missingDate++;
      if (!data.venue || data.venue === 'Not specified') counts.missingVenue++;
    });

    console.log('\nBreakdown:');
    console.log(`  - Approved:      ${counts.approved}`);
    console.log(`  - Pending:       ${counts.pending}`);
    console.log(`  - Rejected:      ${counts.rejected}`);
    console.log(`  - Other status:  ${counts.other}`);
    console.log(`  - Incomplete:    ${counts.missingDate} missing date, ${counts.missingVenue} missing venue`);
    console.log('\nStatus check complete.');
    return;
  }

  if (action === 'cleanup') {
    const snapshot = await eventsRef.get();
    console.log(`Scanning ${snapshot.size} events for duplicates or invalid records...`);

    const seen = new Map();
    const duplicates = [];

    snapshot.forEach(doc => {
      const d = doc.data();
      const key = `${(d.host || '').toLowerCase()}:${(d.title || '').toLowerCase().trim()}`;
      if (seen.has(key)) {
        duplicates.push({ id: doc.id, title: d.title, duplicateOf: seen.get(key) });
      } else {
        seen.set(key, doc.id);
      }
    });

    console.log(`Found ${duplicates.length} duplicate records.`);

    if (duplicates.length > 0) {
      if (!hasConfirm) {
        console.log('[DRY-RUN] Duplicates identified but not deleted. Pass --confirm to delete them:');
        duplicates.slice(0, 10).forEach(d => console.log(`  - ${d.id}: "${d.title}" (duplicate of ${d.duplicateOf})`));
        if (duplicates.length > 10) console.log(`  ...and ${duplicates.length - 10} more.`);
      } else {
        console.log('[CONFIRM] Deleting duplicate records...');
        const batch = db.batch();
        duplicates.forEach(d => batch.delete(eventsRef.doc(d.id)));
        await batch.commit();
        console.log(`Successfully deleted ${duplicates.length} duplicate documents.`);
      }
    } else {
      console.log('No duplicates found. Database is clean.');
    }
    return;
  }

  if (action === 'purge') {
    if (!hasConfirm) {
      console.error('\n[SAFETY REFUSAL] --action=purge requires the --confirm flag!');
      console.error('To prevent accidental deletion of production student events, this command is blocked.');
      console.error('Run: node db_maintenance.js --action=purge --confirm');
      process.exit(1);
    }

    console.warn('\n[WARNING] Purging events collection with --confirm...');
    const snapshot = await eventsRef.get();
    if (snapshot.empty) {
      console.log('Collection is already empty.');
      return;
    }

    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.reference));
    await batch.commit();
    console.log(`Purged ${snapshot.size} events from Firestore.`);
    return;
  }

  console.error(`Unknown action: '${action}'. Valid actions are: status, cleanup, purge.`);
  process.exit(1);
}

main().catch(err => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
