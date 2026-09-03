export type PulseItem = {
  id: string;
  kind: 'Deadline' | 'Recruitment' | 'Notice' | 'Announcement' | 'Event';
  title: string;
  source: string;
  time: string;
  body?: string;
  action?: string;
  urgent?: boolean;
  span?: 'full' | 'major' | 'minor' | 'standard';
  url: string;
};

export const PULSE: PulseItem[] = [
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
  },
];
