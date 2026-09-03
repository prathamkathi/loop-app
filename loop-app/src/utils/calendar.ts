/**
 * Calendar Utility — Zero-Auth Google Calendar URL
 *
 * Generates a Google Calendar event URL that can be opened via openExternalLink.
 * Handles diverse date/time formats reliably without NaN values.
 */

import { openExternalLink } from './linking';

export type CalendarEvent = {
  title: string;
  date: string;
  time: string;
  venue: string;
  description?: string;
  durationHours?: number;
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

/**
 * Robustly parse date & time strings into a valid Date object.
 */
export function parseDateAndTime(dateStr: string, timeStr: string): Date {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let day = now.getDate();
  let hours = 18;
  let minutes = 0;

  const rawDate = (dateStr || '').trim();
  const rawTime = (timeStr || '').trim();

  // Try direct Date parse first (e.g. ISO format "2026-10-15")
  const directDate = new Date(rawDate);
  if (!isNaN(directDate.getTime()) && rawDate.length >= 8 && (rawDate.includes('-') || rawDate.includes('/'))) {
    year = directDate.getFullYear();
    month = directDate.getMonth();
    day = directDate.getDate();
  } else if (/today/i.test(rawDate)) {
    // Keep today's date
  } else if (/tomorrow/i.test(rawDate)) {
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    year = tomorrow.getFullYear();
    month = tomorrow.getMonth();
    day = tomorrow.getDate();
  } else {
    // Casual formats: "12 Oct", "Oct 24", "12 Oct 2026", "24/10"
    const tokens = rawDate.replace(/,/g, ' ').split(/\s+/).filter(Boolean);

    if (tokens.length >= 2) {
      let explicitYear = false;
      if (/^\d{1,2}$/.test(tokens[0])) {
        // "12 Oct"
        day = parseInt(tokens[0], 10);
        const mKey = tokens[1].toLowerCase().slice(0, 3);
        if (mKey in MONTH_NAMES) month = MONTH_NAMES[mKey];
        if (tokens[2] && /^\d{4}$/.test(tokens[2])) {
          year = parseInt(tokens[2], 10);
          explicitYear = true;
        }
      } else {
        // "Oct 12"
        const mKey = tokens[0].toLowerCase().slice(0, 3);
        if (mKey in MONTH_NAMES) month = MONTH_NAMES[mKey];
        if (/^\d{1,2}$/.test(tokens[1])) day = parseInt(tokens[1], 10);
        if (tokens[2] && /^\d{4}$/.test(tokens[2])) {
          year = parseInt(tokens[2], 10);
          explicitYear = true;
        }
      }

      // F-27: Year wrapping for Dec -> Jan without explicit year
      if (!explicitYear && month < now.getMonth()) {
        year += 1;
      }
    }
  }

  // Parse time: "8:30 PM", "8:30pm", "8 PM", "18:30", "18:00", "6"
  const ampmMatch = rawTime.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (ampmMatch) {
    hours = parseInt(ampmMatch[1], 10);
    minutes = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const isPM = ampmMatch[3].toUpperCase() === 'PM';
    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
  } else {
    // 24h format: "18:30" or "09:00"
    const militaryMatch = rawTime.match(/(\d{1,2}):(\d{2})/);
    if (militaryMatch) {
      hours = parseInt(militaryMatch[1], 10);
      minutes = parseInt(militaryMatch[2], 10);
    }
  }

  const result = new Date(year, month, day, hours, minutes, 0);
  return isNaN(result.getTime()) ? now : result;
}

/**
 * Format a Date to Google Calendar's required format: YYYYMMDDTHHmmSSZ (UTC or local)
 */
function toGoogleCalendarFormat(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

/**
 * Generate a Google Calendar URL for the given event.
 */
export function getGoogleCalendarUrl(event: CalendarEvent): string {
  const start = parseDateAndTime(event.date, event.time);
  const durationMs = (event.durationHours ?? 2) * 60 * 60 * 1000;
  const end = new Date(start.getTime() + durationMs);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || 'Campus Event',
    dates: `${toGoogleCalendarFormat(start)}/${toGoogleCalendarFormat(end)}`,
    location: event.venue || 'IIT Delhi',
    details: event.description ?? `Event at ${event.venue || 'IIT Delhi'}. Curated on Loop.`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Open Google Calendar in the browser with the event pre-filled.
 */
export async function openGoogleCalendar(event: CalendarEvent): Promise<void> {
  const url = getGoogleCalendarUrl(event);
  await openExternalLink(url);
}
