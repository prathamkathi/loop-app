export type EventContact = {
  name: string;
  phone: string;
  role?: string;
};

export type EventItem = {
  id: string;
  title: string;
  host: string;
  hostAvatar: string;
  category: string;
  date: string;            // Human-readable display string ("21 Apr" or "2026-04-21")
  day: string;
  time: string;            // Start time for display
  venue: string;
  image: string;
  featured?: boolean;
  aspect?: 'tall' | 'wide' | 'square';
  aspectRatio?: number;
  blurb: string;
  fillingFast?: boolean;
  contacts?: EventContact[];
  // Phase 2 additions — canonical fields for sorting, filtering, and status
  startsAt?: any;          // Firestore Timestamp — used for sort + expiry
  createdAt?: any;         // Firestore Timestamp — replaces ISO string
  confidence?: number;     // 0–1 scale, normalised at both writers
  status?: 'pending' | 'approved' | 'rejected';
  igPostId?: string;       // Scraper dedup key
  approvedAt?: any;        // Firestore Timestamp, set on approve
  actionUrl?: string;      // Optional registration link, survey form, or circular doc
  deadline?: string;       // Explicit deadline date for notices/surveys
};
