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

const PULSE_ITEMS = [
  {
    id: 'p1',
    kind: 'Deadline',
    title: 'Semester course add/drop closes tonight at 11:59 PM',
    source: 'Academic Section (eCampus)',
    time: '2h ago',
    body: 'All schedule modifications must be finalized through the registrar portal. Exceptions will only be granted under extraordinary circumstances via academic advising.',
    action: 'Open eCampus Portal →',
    urgent: true,
    span: 'full',
    url: 'https://ecampus.iitd.ac.in/',
    order: 1,
  },
  {
    id: 'p2',
    kind: 'Recruitment',
    title: 'BSW Student Mentorship Applications Live',
    source: 'Board for Student Welfare (@bsw_iitd)',
    time: '4h ago',
    body: 'Applications for senior student mentors for incoming first-year batches are now open on the BSW portal.',
    action: 'Apply on BSW Portal →',
    span: 'standard',
    url: 'https://bsw.iitd.ac.in/',
    order: 2,
  },
  {
    id: 'p3',
    kind: 'Announcement',
    title: 'eDC E-Summit 2026 Core Team Recruitment',
    source: 'Entrepreneurship Development Cell (@edc_iitd)',
    time: '6h ago',
    body: 'Join the organizing team for North India\'s premier collegiate entrepreneurship summit across PR, Events, and Tech.',
    action: 'View Open Roles →',
    span: 'major',
    url: 'https://edc.iitd.ac.in/',
    order: 3,
  },
  {
    id: 'p4',
    kind: 'Deadline',
    title: 'Hostel Mess Rebate Submission for Mid-Semester Break',
    source: 'Board for Hostel Management (@bhmiitd)',
    time: '1d ago',
    body: 'Submit your rebate applications through the BHM online portal before leaving campus for the recess.',
    action: 'Submit Rebate →',
    span: 'minor',
    url: 'https://bhm.iitd.ac.in/',
    order: 4,
  },
  {
    id: 'p5',
    kind: 'Notice',
    title: 'Central Library extends 24×7 reading hall access',
    source: 'Central Library Administration',
    time: 'Yesterday',
    body: 'All 6 reading floors will remain operational around the clock with uninterrupted high-speed Wi-Fi throughout exam period.',
    action: 'Check Library Status →',
    span: 'full',
    url: 'https://library.iitd.ac.in/',
    order: 5,
  },
  {
    id: 'p6',
    kind: 'Deadline',
    title: 'MCM scholarship document submission — last date 15 October',
    source: 'Dean of Student Affairs (DoSA)',
    time: '2d ago',
    body: 'Eligible undergraduate students must upload family income proofs and academic transcripts to the DoSA portal.',
    action: 'DoSA Scholarship Form →',
    span: 'standard',
    url: 'https://dosa.iitd.ac.in/',
    order: 6,
  },
  {
    id: 'p7',
    kind: 'Announcement',
    title: 'Inter-IIT Sports Selection Trials (BSA)',
    source: 'Board for Sports Activities (@bsa.iitd)',
    time: '2d ago',
    body: 'Selection trials for institute athletics, swimming, and badminton teams scheduled at Mittal Sports Complex.',
    action: 'View Trial Timetable →',
    span: 'standard',
    url: 'https://bsa.iitd.ac.in/',
    order: 7,
  },
];

async function seedPulse() {
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
