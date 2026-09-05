import React from 'react';
import {
  Megaphone,
  Trophy,
  Barbell,
  MicrophoneStage,
  PaintBrushBroad,
  Cpu,
  Heart,
  Sparkle,
  CalendarBlank,
} from 'phosphor-react-native';

export type CategoryMeta = {
  label: string;
  tag: string;
  color: string;
  bgLight: string;
  bgDark: string;
  icon: any;
  isNotice: boolean;
  actionText?: string;
};

export const CATEGORY_META_MAP: Record<string, CategoryMeta> = {
  'Campus Notices': {
    label: 'Campus Notice',
    tag: 'NOTICE',
    color: '#E07A5F', // Warm terracotta / alert amber
    bgLight: 'rgba(224, 122, 95, 0.12)',
    bgDark: 'rgba(224, 122, 95, 0.22)',
    icon: Megaphone,
    isNotice: true,
    actionText: 'Open Official Notice / Form',
  },
  'Competitions & Quizzes': {
    label: 'Competition & Quiz',
    tag: 'COMPETE',
    color: '#8B5CF6', // Royal violet
    bgLight: 'rgba(139, 92, 246, 0.12)',
    bgDark: 'rgba(139, 92, 246, 0.22)',
    icon: Trophy,
    isNotice: false,
    actionText: 'Register / Rulebook',
  },
  'Sports & Fitness': {
    label: 'Sports & Fitness',
    tag: 'SPORTS',
    color: '#2563EB', // Cobalt athletic blue
    bgLight: 'rgba(37, 99, 235, 0.12)',
    bgDark: 'rgba(37, 99, 235, 0.22)',
    icon: Barbell,
    isNotice: false,
    actionText: 'View Fixtures / Register',
  },
  'Talks & Workshops': {
    label: 'Talk & Workshop',
    tag: 'TALK',
    color: '#0D9488', // Intellectual teal
    bgLight: 'rgba(13, 148, 136, 0.12)',
    bgDark: 'rgba(13, 148, 136, 0.22)',
    icon: MicrophoneStage,
    isNotice: false,
    actionText: 'Register for Talk',
  },
  'Cultural & Arts': {
    label: 'Cultural & Arts',
    tag: 'CULTURE',
    color: '#C44D6A', // Loop signature crimson rose
    bgLight: 'rgba(196, 77, 106, 0.12)',
    bgDark: 'rgba(196, 77, 106, 0.22)',
    icon: PaintBrushBroad,
    isNotice: false,
    actionText: 'Event Details',
  },
  'Tech & Innovation': {
    label: 'Tech & Innovation',
    tag: 'TECH',
    color: '#0284C7', // Cyber blue
    bgLight: 'rgba(2, 132, 199, 0.12)',
    bgDark: 'rgba(2, 132, 199, 0.22)',
    icon: Cpu,
    isNotice: false,
    actionText: 'Join Tech Session',
  },
  'Social & Wellness': {
    label: 'Social & Wellness',
    tag: 'WELLNESS',
    color: '#059669', // Emerald health green
    bgLight: 'rgba(5, 150, 105, 0.12)',
    bgDark: 'rgba(5, 150, 105, 0.22)',
    icon: Heart,
    isNotice: false,
    actionText: 'Participate',
  },
  'Fests & Major Events': {
    label: 'Major Fest',
    tag: 'FEST',
    color: '#EA580C', // Festive flame orange
    bgLight: 'rgba(234, 88, 12, 0.12)',
    bgDark: 'rgba(234, 88, 12, 0.22)',
    icon: Sparkle,
    isNotice: false,
    actionText: 'Fest Schedule',
  },
};

const DEFAULT_META: CategoryMeta = {
  label: 'Campus Event',
  tag: 'EVENT',
  color: '#C44D6A',
  bgLight: 'rgba(196, 77, 106, 0.12)',
  bgDark: 'rgba(196, 77, 106, 0.22)',
  icon: CalendarBlank,
  isNotice: false,
  actionText: 'View Details',
};

export function normalizeCategory(category?: string | null): string {
  if (!category) return 'Campus Notices';
  const c = category.trim();
  if (c === 'Workshops & Talks' || c === 'Academic & Career' || c === 'Workshops') return 'Talks & Workshops';
  if (c === 'Competitions & Fests' || c === 'Competitions') return 'Competitions & Quizzes';
  if (c === 'Health & Social' || c === 'Social & Volunteering' || c === 'Wellness') return 'Social & Wellness';
  if (c === 'Cultural' || c === 'Arts') return 'Cultural & Arts';
  if (c === 'Tech' || c === 'Technical') return 'Tech & Innovation';
  if (c === 'Sports') return 'Sports & Fitness';
  if (c === 'Fests') return 'Fests & Major Events';
  return c;
}

export function getCategoryMeta(category?: string | null): CategoryMeta {
  if (!category) return DEFAULT_META;
  const normalized = normalizeCategory(category);
  return CATEGORY_META_MAP[normalized] || DEFAULT_META;
}

/**
 * Format primary date line so notices don't awkwardly show "Time TBA".
 */
export function formatCardDateLine(event: {
  category?: string;
  date?: string;
  time?: string;
  deadline?: string;
}): { primary: string; secondary: string; isNotice: boolean } {
  const meta = getCategoryMeta(event.category);
  const cleanDate = (event.date || '').trim();
  const cleanTime = (event.time || '').trim();
  const isTimeEmptyOrTba = !cleanTime || /^tba$|^time\s*tba$/i.test(cleanTime);
  const isDateEmptyOrTba = !cleanDate || /^tba$|^date\s*tba$/i.test(cleanDate);

  if (meta.isNotice) {
    const primary = isDateEmptyOrTba ? 'Date not announced' : cleanDate;
    let secondary = 'Campus Circular';
    if (event.deadline) {
      secondary = `Deadline: ${event.deadline}`;
    } else if (!isTimeEmptyOrTba) {
      secondary = cleanTime;
    } else {
      secondary = 'Action Required';
    }
    return { primary, secondary, isNotice: true };
  }

  const primary = isDateEmptyOrTba ? 'Date not announced' : cleanDate;
  const secondary = isTimeEmptyOrTba ? 'Time not announced' : cleanTime;
  return { primary, secondary, isNotice: false };
}

/**
 * Format venue honestly — never invent a fake default venue.
 */
export function formatCardVenue(rawVenue?: string | null, _category?: string): string {
  const trimmed = (rawVenue || '').trim();
  if (!trimmed || /^tba$|^venue\s*tba$/i.test(trimmed)) {
    return 'Venue not announced';
  }
  return trimmed;
}
