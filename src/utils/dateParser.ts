/**
 * dateParser.ts — Canonical date & time parsing module for LOOP.
 *
 * Fully avoids implementation-defined Date.parse() on non-ISO strings
 * ensuring deterministic behavior across Safari, Chrome, iOS Hermes, and Node.js.
 */

export type ParsedDateResult = {
  date: Date;
  hasTime: boolean;
};

const MONTH_NAMES: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

const UNUSABLE_DATES = new Set([
  '',
  'not specified',
  'not available',
  'none',
  'null',
  'tbd',
  'tba',
  'unknown',
  'n/a',
  'not provided',
  'tbc',
  'ongoing',
]);

export function parseDateAndTimeString(
  dateStr?: string | null,
  timeStr?: string | null
): ParsedDateResult | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();
  if (UNUSABLE_DATES.has(clean.toLowerCase())) return null;

  const rawTime = (timeStr || '').trim();
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let day = now.getDate();
  let hours = 0;
  let minutes = 0;
  let hasTime = false;

  // 1. ISO 8601: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    month = parseInt(isoMatch[2], 10) - 1;
    day = parseInt(isoMatch[3], 10);
  } else if (/^today$/i.test(clean)) {
    // Keep today's date
  } else if (/^tomorrow$/i.test(clean)) {
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    year = tomorrow.getFullYear();
    month = tomorrow.getMonth();
    day = tomorrow.getDate();
  } else {
    // 2. Fuzzy match day and month
    const monthRegexStr = Object.keys(MONTH_NAMES).join('|');
    // Match "12 Sep" or "Sep 12"
    const regex1 = new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\s*(?:-|to)?\\s*(?:\\d{1,2}(?:st|nd|rd|th)?\\s*)?(${monthRegexStr})`, 'i');
    const regex2 = new RegExp(`(${monthRegexStr})\\s*(\\d{1,2})`, 'i');
    
    let matched = false;
    const match1 = clean.match(regex1);
    if (match1) {
      day = parseInt(match1[1], 10);
      month = MONTH_NAMES[match1[2].toLowerCase()];
      matched = true;
    } else {
      const match2 = clean.match(regex2);
      if (match2) {
        month = MONTH_NAMES[match2[1].toLowerCase()];
        day = parseInt(match2[2], 10);
        matched = true;
      }
    }
    
    if (!matched) return null;

    const yearMatch = clean.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      year = parseInt(yearMatch[1], 10);
    } else if (now.getMonth() >= 10 && month <= 1) {
      year += 1;
    }
  }

  // Parse time
  if (rawTime && !UNUSABLE_DATES.has(rawTime.toLowerCase())) {
    const ampmMatch = rawTime.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (ampmMatch) {
      hours = parseInt(ampmMatch[1], 10);
      minutes = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
      if (hours >= 1 && hours <= 12 && minutes <= 59) {
        const isPM = ampmMatch[3].toUpperCase() === 'PM';
        if (isPM && hours !== 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
        hasTime = true;
      }
    } else {
      const militaryMatch = rawTime.match(/(\d{1,2}):(\d{2})/);
      if (militaryMatch) {
        const h = parseInt(militaryMatch[1], 10);
        const m = parseInt(militaryMatch[2], 10);
        if (h <= 23 && m <= 59) {
          hours = h;
          minutes = m;
          hasTime = true;
        }
      }
    }
  }

  const result = new Date(year, month, day, hours, minutes, 0);
  if (isNaN(result.getTime())) return null;

  return { date: result, hasTime };
}
