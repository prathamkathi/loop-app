/**
 * Calendar Utility — Zero-Auth Google Calendar URL
 *
 * Generates a Google Calendar event URL that can be opened via openExternalLink.
 * Handles diverse date/time formats and Firestore Timestamp objects reliably.
 */

import { openExternalLink } from './linking';
import type { EventItem } from '../data/events';
import { toValidDate } from './timestampUtils';

export type CalendarEvent = {
  title: string;
  date: string;
  time: string;
  venue: string;
  description?: string;
  durationHours?: number;
  startsAt?: any;
};

import { parseDateAndTimeString, type ParsedDateResult } from './dateParser';

export type ParsedDateTime = ParsedDateResult;

/**
 * Parse date & time strings into a valid Date object.
 * Returns null if the date cannot be parsed, and flags hasTime honestly.
 */
export function parseDateAndTime(dateStr?: string, timeStr?: string): ParsedDateTime | null {
  return parseDateAndTimeString(dateStr, timeStr);
}

/**
 * Format a Date to Google Calendar's timed format: YYYYMMDDTHHmmSSZ
 */
function toGoogleCalendarFormat(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
}

/**
 * Format a Date to Google Calendar's all-day format: YYYYMMDD
 */
function toGoogleCalendarDateOnly(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

/**
 * Generate a Google Calendar URL for the given event (supports both EventItem and CalendarEvent).
 * Emits an all-day entry (dates=YYYYMMDD/YYYYMMDD) if no valid time was announced.
 */
export function getGoogleCalendarUrl(event: CalendarEvent | EventItem): string {
  const parsed = parseDateAndTime((event as any).date, (event as any).time);
  const startsAtDate = toValidDate((event as any).startsAt);

  let startDate: Date;
  let hasTime = false;

  if (startsAtDate && parsed?.hasTime) {
    startDate = startsAtDate;
    hasTime = true;
  } else if (parsed) {
    startDate = parsed.date;
    hasTime = parsed.hasTime;
  } else if (startsAtDate) {
    startDate = startsAtDate;
    const timeParsed = parseDateAndTime('2026-01-01', (event as any).time);
    hasTime = Boolean(timeParsed?.hasTime);
  } else {
    startDate = new Date();
  }

  const title = event.title || 'IIT Delhi Campus Event';
  const location = event.venue && !/^tba$|^venue not announced$/i.test(event.venue) ? `${event.venue}, IIT Delhi` : 'IIT Delhi Campus';
  const description = (event as any).blurb || (event as any).description || `Campus event at ${location}. Curated on LOOP (https://loop-iitd.web.app).`;

  let datesParam: string;
  if (hasTime) {
    const durationMs = ((event as any).durationHours ?? 2) * 60 * 60 * 1000;
    const endDate = new Date(startDate.getTime() + durationMs);
    datesParam = `${toGoogleCalendarFormat(startDate)}/${toGoogleCalendarFormat(endDate)}`;
  } else {
    // All-day event: YYYYMMDD/YYYYMMDD (end date is the next day)
    const nextDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1);
    datesParam = `${toGoogleCalendarDateOnly(startDate)}/${toGoogleCalendarDateOnly(nextDay)}`;
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: datesParam,
    location,
    details: description,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Open Google Calendar in the browser or native calendar app with the event pre-filled.
 */
export async function openGoogleCalendar(event: CalendarEvent | EventItem): Promise<void> {
  const url = getGoogleCalendarUrl(event);
  await openExternalLink(url);
}

export const addToGoogleCalendar = openGoogleCalendar;
