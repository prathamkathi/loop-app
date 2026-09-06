import type { CanonicalCategory } from './categories';

export type EventContact = {
  name: string;
  phone: string;
  role?: string;
};

export type EventItem = {
  id: string;
  title: string;
  host: string;
  hostAvatar?: string;
  category: CanonicalCategory;
  date: string;            // Human-readable display string ("21 Apr" or "2026-04-21")
  day?: string;
  time: string;            // Start time for display
  startTime?: string;      // Backwards-compatible alias for time
  endTime?: string;
  venue: string;
  image: string;
  featured?: boolean;
  aspect?: 'tall' | 'wide' | 'square';
  aspectRatio?: number;
  blurb?: string;
  rawCaption?: string;     // Backwards-compatible alias for blurb
  sourceHandle?: string;   // Backwards-compatible alias for host
  sourceTimestamp?: string;
  tags?: string[];
  fillingFast?: boolean;
  contacts?: EventContact[];
  startsAt?: any;          // Firestore Timestamp — used for sort + expiry
  createdAt?: any;         // Firestore Timestamp — replaces ISO string
  confidence?: number;     // 0–1 scale, normalised at both writers
  status?: 'pending' | 'approved' | 'rejected';
  igPostId?: string;       // Scraper dedup key
  approvedAt?: any;        // Firestore Timestamp, set on approve
  rejectedAt?: any;        // Firestore Timestamp, set on soft-reject
  actionUrl?: string;      // Optional registration link, survey form, or circular doc
  deadline?: string;       // Explicit deadline date for notices/surveys
  eventType?: CanonicalCategory; // Backwards-compatible alias for category
};
