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

// Initialized to empty array. Real notices will be populated by verified institute feeds.
export const PULSE: PulseItem[] = [];
