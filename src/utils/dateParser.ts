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

/**
 * Parses human campus date and time strings into a valid Date and hasTime boolean.
 * Returns null if the date is invalid or unparseable.
 */
export function parseDateAndTimeString(
  dateStr?: string | null,
  timeStr?: string | null
): ParsedDateResult | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();
  if (UNUSABLE_DATES.has(clean.toLowerCase())) return null;

  // Strip ordinal suffixes: 1st, 2nd, 3rd, 4th, etc.
  const rawDate = clean.replace(/(\d+)(st|nd|rd|th)/gi, '$1');
  const rawTime = (timeStr || '').trim();

  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let day = now.getDate();
  let hours = 0;
  let minutes = 0;
  let hasTime = false;

  // 1. ISO 8601: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = rawDate.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    month = parseInt(isoMatch[2], 10) - 1;
    day = parseInt(isoMatch[3], 10);
  } else if (/^today$/i.test(rawDate)) {
    // Keep today's date
  } else if (/^tomorrow$/i.test(rawDate)) {
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    year = tomorrow.getFullYear();
    month = tomorrow.getMonth();
    day = tomorrow.getDate();
  } else {
    // 2. Tokenized format: "5 September 2026", "02 Sep", "16 August", "Oct 24", "12 Oct 2026"
    const tokens = rawDate.replace(/,/g, ' ').split(/\s+/).filter(Boolean);
    if (tokens.length >= 2) {
      let explicitYear = false;
      if (/^\d{1,2}$/.test(tokens[0])) {
        // "5 September [2026]" or "02 Sep"
        day = parseInt(tokens[0], 10);
        const mKey = tokens[1].toLowerCase().slice(0, 3);
        if (mKey in MONTH_NAMES) {
          month = MONTH_NAMES[mKey];
        } else {
          return null;
        }
        if (tokens[2] && /^\d{4}$/.test(tokens[2])) {
          year = parseInt(tokens[2], 10);
          explicitYear = true;
        }
      } else {
        // "September 5 [2026]" or "Oct 24"
        const mKey = tokens[0].toLowerCase().slice(0, 3);
        if (mKey in MONTH_NAMES) {
          month = MONTH_NAMES[mKey];
        } else {
          return null;
        }
        if (/^\d{1,2}$/.test(tokens[1])) {
          day = parseInt(tokens[1], 10);
        } else {
          return null;
        }
        if (tokens[2] && /^\d{4}$/.test(tokens[2])) {
          year = parseInt(tokens[2], 10);
          explicitYear = true;
        }
      }

      // Rollover: If month has passed (e.g. current Nov, event is Jan), assume next year if no explicit year
      if (!explicitYear && month < now.getMonth()) {
        year += 1;
      }
    } else {
      return null;
    }
  }

  // Parse time: "8:30 PM", "8:30pm", "8 PM", "18:30", "18:00"
  if (rawTime && !UNUSABLE_DATES.has(rawTime.toLowerCase())) {
    const ampmMatch = rawTime.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (ampmMatch) {
      hours = parseInt(ampmMatch[1], 10);
      minutes = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
      const isPM = ampmMatch[3].toUpperCase() === 'PM';
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      hasTime = true;
    } else {
      const militaryMatch = rawTime.match(/^(\d{1,2}):(\d{2})$/);
      if (militaryMatch) {
        hours = parseInt(militaryMatch[1], 10);
        minutes = parseInt(militaryMatch[2], 10);
        hasTime = true;
      }
    }
  }

  const result = new Date(year, month, day, hours, minutes, 0);
  if (isNaN(result.getTime())) return null;

  return { date: result, hasTime };
}
