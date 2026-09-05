export const CANONICAL_CATEGORIES = [
  'Cultural & Arts',
  'Tech & Innovation',
  'Fests & Major Events',
  'Competitions & Quizzes',
  'Talks & Workshops',
  'Sports & Fitness',
  'Social & Wellness',
  'Campus Notices',
] as const;

export type CanonicalCategory = (typeof CANONICAL_CATEGORIES)[number];

export const CATEGORIES = ['All', ...CANONICAL_CATEGORIES] as const;
export type CategoryFilter = (typeof CATEGORIES)[number];
