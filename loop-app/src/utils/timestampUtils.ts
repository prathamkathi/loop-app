/**
 * timestampUtils.ts
 * Robust timestamp coercion helper for LOOP.
 * 
 * Safely deserializes timestamps from:
 * 1. Live Firestore Timestamps (with .toDate())
 * 2. Serialized objects from AsyncStorage cache ({ seconds, nanoseconds } or { _seconds, _nanoseconds })
 * 3. ISO date strings or Date objects
 * 4. Millisecond epoch numbers
 * 
 * Prevents invalid dates and prevents undated events from sorting to key 0 (Jan 1, 1970).
 */

export function parseEventTimestamp(val: any): Date | null {
  if (!val) return null;

  try {
    // 1. Live Firestore Timestamp
    if (typeof val.toDate === 'function') {
      const d = val.toDate();
      return isNaN(d.getTime()) ? null : d;
    }

    // 2. Serialized Firestore Timestamp from AsyncStorage cache
    if (typeof val === 'object') {
      const sec = val.seconds ?? val._seconds;
      if (typeof sec === 'number' && !isNaN(sec)) {
        return new Date(sec * 1000);
      }
    }

    // 3. Date instance
    if (val instanceof Date) {
      return isNaN(val.getTime()) ? null : val;
    }

    // 4. String or numeric timestamp
    if (typeof val === 'string' || typeof val === 'number') {
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    }
  } catch {
    return null;
  }

  return null;
}

export function getEventTimeMillis(val: any): number | null {
  const d = parseEventTimestamp(val);
  return d ? d.getTime() : null;
}

/**
 * Parse human date strings like "15 Oct", "21 April", "2026-10-15" + time "6:30 PM" into a Date.
 * If year is missing, uses current year (with Nov/Dec -> Jan/Feb rollover).
 */
export function parseDateTimeStrings(dateStr: string, timeStr?: string): Date | null {
  if (!dateStr || dateStr.length < 3) return null;

  try {
    const now = new Date();
    const currentYear = now.getFullYear();

    let normalizedDate = dateStr.trim();
    if (!/\b20\d\d\b/.test(normalizedDate)) {
      normalizedDate = `${normalizedDate} ${currentYear}`;
    }

    let combinedStr = normalizedDate;
    if (timeStr && timeStr !== 'TBA') {
      combinedStr = `${normalizedDate} ${timeStr.trim()}`;
    }

    let parsedTime = Date.parse(combinedStr);
    if (isNaN(parsedTime)) {
      parsedTime = Date.parse(normalizedDate);
    }

    if (!isNaN(parsedTime)) {
      const d = new Date(parsedTime);
      if (now.getMonth() >= 10 && d.getMonth() <= 1) {
        d.setFullYear(currentYear + 1);
      }
      return d;
    }
  } catch {
    return null;
  }

  return null;
}
