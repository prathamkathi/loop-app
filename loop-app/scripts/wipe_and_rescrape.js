/**
 * wipe_and_rescrape.js
 * 
 * 1. Fully purges the 'events' collection in Firestore.
 * 2. Seeds high-fidelity campus events:
 *    - Upcoming approved events (Today, This Weekend, Next Week)
 *    - Past concluded events (for the Luma-style Past Archive)
 *    - Exactly 3 pending events (for Club Studio moderation testing)
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

// Load avatars
let avatars = {};
try {
  avatars = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../scraper/avatars_map.json'), 'utf8'));
} catch (e) {
  console.warn('Could not load avatars_map.json:', e.message);
}

function getAvatar(handle) {
  const clean = handle.replace('@', '').toLowerCase().trim();
  return avatars[clean] || 'https://res.cloudinary.com/dnse1yvqq/image/upload/v1788420220/loop_avatars/avatar_iitdelhi.jpg';
}

// 2026 Reference Date: 5 September 2026 (Saturday)
const REFRESHED_EVENTS = [
  // ==========================================
  // UPCOMING APPROVED EVENTS
  // ==========================================
  {
    id: 'ev_today_music_jam',
    title: 'Acoustic Jam Night & Open Mic',
    host: '@iitdmusicclub',
    date: '5 September 2026',
    time: '7:30 PM',
    venue: 'SAC Amphitheatre, IIT Delhi',
    category: 'Cultural & Arts',
    blurb: 'Unplugged acoustic jam night hosted by the Music Club. Open mic slots available for vocalists, guitarists, and percussionists. Guitars and basic rhythm section provided.',
    image: 'https://res.cloudinary.com/dnse1yvqq/image/upload/v1788544465/loop_events/gemini_fl_3829039697754709975.jpg',
    status: 'approved',
    confidence: 0.95,
    startsAtIso: '2026-09-05T14:00:00.000Z', // 7:30 PM IST (14:00 UTC)
    featured: true,
    aspect: 'tall',
    aspectRatio: 0.85,
    contacts: [{ name: 'Aditya Sharma', phone: '9811223344', role: 'Convenor' }],
  },
  {
    id: 'ev_today_debsoc_prelims',
    title: 'Inter-Hostel Parliamentary Debate 2026',
    host: '@debsoc_iitd',
    date: '5 September 2026',
    time: '5:00 PM',
    venue: 'Seminar Hall, Main Building',
    category: 'Competitions & Fests',
    blurb: 'Annual Asian Parliamentary Debate tournament kicks off. Topics spanning policy, economics, and ethics. Cross-hostel adjudication panels active.',
    image: 'https://res.cloudinary.com/dnse1yvqq/image/upload/v1788544470/loop_events/gemini_fl_3808413154569870996.jpg',
    status: 'approved',
    confidence: 0.94,
    startsAtIso: '2026-09-05T11:30:00.000Z', // 5:00 PM IST
    featured: false,
    aspect: 'square',
    aspectRatio: 1.0,
    contacts: [{ name: 'Rohan Sen', phone: '9876543210', role: 'Debate Captain' }],
  },
  {
    id: 'ev_weekend_qc_workshop',
    title: 'Quantum Algorithms & Qiskit Bootcamp',
    host: '@iitdqc',
    date: '6 September 2026',
    time: '2:00 PM',
    venue: 'LHC 121, Lecture Hall Complex',
    category: 'Workshops & Talks',
    blurb: 'Hands-on bootcamp on quantum circuit synthesis, Shor\'s algorithm implementation, and cloud deployment on IBM Quantum machines. Open to all students.',
    image: 'https://res.cloudinary.com/dnse1yvqq/image/upload/v1788544485/loop_events/gemini_fl_3843694689413906115.jpg',
    status: 'approved',
    confidence: 0.92,
    startsAtIso: '2026-09-06T08:30:00.000Z', // 2:00 PM IST
    featured: false,
    aspect: 'tall',
    aspectRatio: 0.85,
    contacts: [{ name: 'Pooja Nair', phone: '9899001122', role: 'Lead Instructor' }],
  },
  {
    id: 'ev_weekend_dance_cypher',
    title: 'Campus Street Dance Cypher & Battle',
    host: '@iitddanceclub',
    date: '6 September 2026',
    time: '6:30 PM',
    venue: 'Red Square / Dogra Steps',
    category: 'Cultural & Arts',
    blurb: 'All-styles cypher, 1v1 popping & breaking battles, and showcase routines by V-Defyn. Live DJ set by IITD On-Air.',
    image: 'https://res.cloudinary.com/dnse1yvqq/image/upload/v1788544495/loop_events/gemini_fl_3978048559458721121.jpg',
    status: 'approved',
    confidence: 0.96,
    startsAtIso: '2026-09-06T13:00:00.000Z', // 6:30 PM IST
    featured: true,
    aspect: 'tall',
    aspectRatio: 0.85,
    contacts: [{ name: 'Kavya Verma', phone: '9988776655', role: 'Dance Club Head' }],
  },
  {
    id: 'ev_week_three_body_problem',
    title: 'The Three Body Problem: QMed Tech Symposium',
    host: '@iitdqc',
    date: '7 September 2026',
    time: '4:30 PM',
    venue: 'Bharti School Auditorium',
    category: 'Tech & Innovation',
    blurb: 'Interdisciplinary symposium exploring orbital mechanics, chaotic systems, and quantum simulation techniques with guest faculty from Physics and CSE.',
    image: 'https://res.cloudinary.com/dnse1yvqq/image/upload/v1788544510/loop_events/gemini_fl_3978811906328369471.jpg',
    status: 'approved',
    confidence: 0.93,
    startsAtIso: '2026-09-07T11:00:00.000Z', // 4:30 PM IST
    featured: false,
    aspect: 'tall',
    aspectRatio: 0.85,
    contacts: [{ name: 'Ananya Gupta', phone: '9822334455', role: 'Coordinator' }],
  },
  {
    id: 'ev_week_edc_esummit',
    title: 'eDC Founder Keynote: DeepTech in India',
    host: '@edc_iitd',
    date: '10 September 2026',
    time: '5:30 PM',
    venue: 'Dogra Hall, IIT Delhi',
    category: 'Workshops & Talks',
    blurb: 'Kickoff lecture for E-Summit 2026 featuring alumni unicorn founders discussing semiconductor supply chains, generative robotics, and venture funding.',
    image: 'https://res.cloudinary.com/dnse1yvqq/image/upload/v1788544520/loop_events/gemini_fl_3820039697754709975.jpg',
    status: 'approved',
    confidence: 0.97,
    startsAtIso: '2026-09-10T12:00:00.000Z', // 5:30 PM IST
    featured: true,
    aspect: 'wide',
    aspectRatio: 1.33,
    contacts: [{ name: 'Aryan Mehta', phone: '9810123456', role: 'eDC Overall Coordinator' }],
  },
  {
    id: 'ev_week_blood_drive',
    title: 'Campus Mega Blood Donation Camp',
    host: '@humans_of_bloodconnect',
    date: '11 September 2026',
    time: '10:00 AM',
    venue: 'IIT Hospital & Red Cross Centre',
    category: 'Campus Notices',
    blurb: 'Institute-wide voluntary blood donation camp in association with AIIMS New Delhi and BloodConnect. Health checks and donor refreshment certificates provided.',
    image: 'https://res.cloudinary.com/dnse1yvqq/image/upload/v1788544530/loop_events/gemini_fl_3808413154569870996.jpg',
    status: 'approved',
    confidence: 0.98,
    startsAtIso: '2026-09-11T04:30:00.000Z', // 10:00 AM IST
    featured: false,
    aspect: 'square',
    aspectRatio: 1.0,
    contacts: [{ name: 'Sneha Kapoor', phone: '9911224466', role: 'BloodConnect Lead' }],
  },
  {
    id: 'ev_week_formula_racing',
    title: 'Axlr8r Formula EV Vehicle Unveiling',
    host: '@axlr8r.formula.racing',
    date: '12 September 2026',
    time: '4:00 PM',
    venue: 'SAC Lawn & Workshop Bay',
    category: 'Tech & Innovation',
    blurb: 'Unveiling the 2026 electric racecar engineered for Formula Student Germany. Live battery pack walkthrough, aerodynamic telemetry review, and engine run.',
    image: 'https://res.cloudinary.com/dnse1yvqq/image/upload/v1788544540/loop_events/gemini_fl_3843694689413906115.jpg',
    status: 'approved',
    confidence: 0.95,
    startsAtIso: '2026-09-12T10:30:00.000Z', // 4:00 PM IST
    featured: false,
    aspect: 'tall',
    aspectRatio: 0.85,
    contacts: [{ name: 'Kartik Varma', phone: '9871122334', role: 'Team Captain' }],
  },

  // ==========================================
  // PAST / CONCLUDED EVENTS (Luma-Style Archive)
  // ==========================================
  {
    id: 'ev_past_debutant_debate',
    title: 'Debutant 11.0: National Freshers Debate',
    host: '@debsoc_iitd',
    date: '16 August 2026',
    time: '10:00 AM',
    venue: 'LHC Complex, IIT Delhi',
    category: 'Competitions & Fests',
    blurb: 'North India\'s premier novice debating tournament with over 80 teams competing across 5 preliminary rounds and national finals.',
    image: 'https://res.cloudinary.com/dnse1yvqq/image/upload/v1788544470/loop_events/gemini_fl_3808413154569870996.jpg',
    status: 'approved',
    confidence: 0.99,
    startsAtIso: '2026-08-16T04:30:00.000Z',
    featured: false,
    aspect: 'square',
    aspectRatio: 1.0,
    contacts: [{ name: 'Debating Society', phone: '9876543210', role: 'Tournament Secretariat' }],
  },
  {
    id: 'ev_past_virasat_classical',
    title: 'VIRASAT 2026: Hindustani Classical Vocal Night',
    host: '@spicmacay_iitd',
    date: '3 March 2026',
    time: '6:00 PM',
    venue: 'Dogra Hall, IIT Delhi',
    category: 'Cultural & Arts',
    blurb: 'Enchanting evening of classical ragas and thumri renditions organized by SPIC MACAY for youth cultural heritage promotion.',
    image: 'https://res.cloudinary.com/dnse1yvqq/image/upload/v1788544485/loop_events/gemini_fl_3843694689413906115.jpg',
    status: 'approved',
    confidence: 0.98,
    startsAtIso: '2026-03-03T12:30:00.000Z',
    featured: false,
    aspect: 'tall',
    aspectRatio: 0.85,
    contacts: [{ name: 'SPIC MACAY', phone: '9811223344', role: 'Secretariat' }],
  },
  {
    id: 'ev_past_interview_workshop',
    title: 'Personal Interview Masterclass: Say It Better',
    host: '@bsw_iitd',
    date: '30 January 2026',
    time: '6:30 PM',
    venue: 'LHC 121, IIT Delhi',
    category: 'Workshops & Talks',
    blurb: 'Comprehensive soft skills and situational interview preparation conducted by industry mentors for graduating batches.',
    image: 'https://res.cloudinary.com/dnse1yvqq/image/upload/v1788544465/loop_events/gemini_fl_3829039697754709975.jpg',
    status: 'approved',
    confidence: 0.96,
    startsAtIso: '2026-01-30T13:00:00.000Z',
    featured: false,
    aspect: 'tall',
    aspectRatio: 0.85,
    contacts: [{ name: 'BSW Mentorship', phone: '9899001122', role: 'Student Team' }],
  },
  {
    id: 'ev_past_singapore_talk',
    title: 'Decoding Global Education: Singapore Tech Ecosystem',
    host: '@iitdelhialumnirelations',
    date: '13 January 2026',
    time: '6:00 PM',
    venue: 'Seminar Hall, Main Building',
    category: 'Academic & Career',
    blurb: 'Interactive session with NUS and NTU alumni highlighting post-graduate fellowships, research stipends, and Singapore employment visas.',
    image: 'https://res.cloudinary.com/dnse1yvqq/image/upload/v1788544520/loop_events/gemini_fl_3820039697754709975.jpg',
    status: 'approved',
    confidence: 0.95,
    startsAtIso: '2026-01-13T12:30:00.000Z',
    featured: false,
    aspect: 'wide',
    aspectRatio: 1.33,
    contacts: [{ name: 'Alumni Office', phone: '01126591000', role: 'Dean Alumni Relations' }],
  },

  // ==========================================
  // PENDING EVENTS (For Moderation Queue Testing)
  // ==========================================
  {
    id: 'ev_pending_trojan_war',
    title: 'THE TROJAN WAR: Annual Dramatic Stage Production',
    host: '@envogueiitd',
    date: '15 September 2026',
    time: '6:30 PM',
    venue: 'Open Air Theatre (OAT), SAC',
    category: 'Cultural & Arts',
    blurb: 'Grand mythological adaptation of Homer\'s Iliad featuring original score, period costume design, and intensive stage choreography.',
    image: 'https://res.cloudinary.com/dnse1yvqq/image/upload/v1788544495/loop_events/gemini_fl_3978048559458721121.jpg',
    status: 'pending', // Staged in Queue
    confidence: 0.88,
    startsAtIso: '2026-09-15T13:00:00.000Z',
    featured: false,
    aspect: 'tall',
    aspectRatio: 0.85,
    contacts: [{ name: 'En Vogue Dramatic Society', phone: '9988776611', role: 'Director' }],
  },
  {
    id: 'ev_pending_padma_samvaad',
    title: 'Padma Samvaad: National Leadership Dialogue',
    host: '@nssiitd',
    date: '18 September 2026',
    time: '3:30 PM',
    venue: 'Dogra Hall, IIT Delhi',
    category: 'Workshops & Talks',
    blurb: 'Fireside dialogue with Padma Shri awardees on grassroots rural sanitation, indigenous water preservation, and social governance.',
    image: 'https://res.cloudinary.com/dnse1yvqq/image/upload/v1788544510/loop_events/gemini_fl_3978811906328369471.jpg',
    status: 'pending', // Staged in Queue
    confidence: 0.84,
    startsAtIso: '2026-09-18T10:00:00.000Z',
    featured: false,
    aspect: 'tall',
    aspectRatio: 0.85,
    contacts: [{ name: 'NSS IIT Delhi', phone: '9811224455', role: 'General Secretary' }],
  },
  {
    id: 'ev_pending_robotics_hack',
    title: 'Autonomous Rover & Sensor Fusion Challenge',
    host: '@pac_iitd',
    date: '20 September 2026',
    time: '11:00 AM',
    venue: 'Robotics Research Arena, Block IV',
    category: 'Tech & Innovation',
    blurb: '36-hour sprint: Build real-time obstacle avoidance and SLAM algorithms for quadruped and wheeled rover prototypes.',
    image: 'https://res.cloudinary.com/dnse1yvqq/image/upload/v1788544530/loop_events/gemini_fl_3808413154569870996.jpg',
    status: 'pending', // Staged in Queue
    confidence: 0.82,
    startsAtIso: '2026-09-20T05:30:00.000Z',
    featured: false,
    aspect: 'square',
    aspectRatio: 1.0,
    contacts: [{ name: 'PAC Robotics', phone: '9871122998', role: 'Lab Coordinator' }],
  },
];

async function wipeAndRescrape() {
  console.log('='.repeat(60));
  console.log('LOOP DATABASE WIPE & RESCRAPE');
  console.log('='.repeat(60));

  // 1. Wipe existing events collection
  console.log('1. Purging existing documents in collection "events"...');
  const existingSnapshot = await db.collection('events').get();
  console.log(`Found ${existingSnapshot.size} documents to delete.`);

  const deleteBatch = db.batch();
  existingSnapshot.forEach((doc) => {
    deleteBatch.delete(doc.ref);
  });
  await deleteBatch.commit();
  console.log('Purge completed. "events" collection is completely clean.\n');

  // 2. Ingest refreshed campus events
  console.log(`2. Ingesting ${REFRESHED_EVENTS.length} refreshed campus events...`);
  const writeBatch = db.batch();

  let approvedCount = 0;
  let pendingCount = 0;
  let pastCount = 0;

  for (const item of REFRESHED_EVENTS) {
    const ref = db.collection('events').doc(item.id);
    const startsAt = admin.firestore.Timestamp.fromDate(new Date(item.startsAtIso));

    const docData = {
      title: item.title,
      host: item.host,
      hostAvatar: getAvatar(item.host),
      date: item.date,
      time: item.time,
      venue: item.venue,
      category: item.category,
      blurb: item.blurb,
      image: item.image,
      status: item.status,
      confidence: item.confidence,
      startsAt: startsAt,
      featured: item.featured || false,
      aspect: item.aspect || 'tall',
      aspectRatio: item.aspectRatio || 0.85,
      contacts: item.contacts || [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    writeBatch.set(ref, docData);

    if (item.status === 'pending') {
      pendingCount++;
    } else {
      approvedCount++;
      if (new Date(item.startsAtIso).getTime() < Date.now()) {
        pastCount++;
      }
    }
  }

  await writeBatch.commit();
  console.log('Ingestion completed successfully!');
  console.log(`- Approved Upcoming Events: ${approvedCount - pastCount}`);
  console.log(`- Approved Concluded/Past Events: ${pastCount}`);
  console.log(`- Staged Pending Events (for Queue testing): ${pendingCount}`);
  console.log(`- Total Ingested: ${REFRESHED_EVENTS.length}`);
}

wipeAndRescrape().catch(console.error);
