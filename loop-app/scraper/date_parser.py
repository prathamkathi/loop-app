"""Canonical date and time parsing for LOOP scraper."""

from datetime import datetime, timedelta
import re

MONTH_NAMES = {
    "jan": 1, "january": 1,
    "feb": 2, "february": 2,
    "mar": 3, "march": 3,
    "apr": 4, "april": 4,
    "may": 5,
    "jun": 6, "june": 6,
    "jul": 7, "july": 7,
    "aug": 8, "august": 8,
    "sep": 9, "sept": 9, "september": 9,
    "oct": 10, "october": 10,
    "nov": 11, "november": 11,
    "dec": 12, "december": 12,
}

UNUSABLE_DATES = {
    "", "not specified", "not available", "none", "null", "tbd", "tba",
    "unknown", "n/a", "not provided", "tbc", "ongoing"
}


def parse_date_and_time(date_str: str | None, time_str: str | None = None) -> datetime | None:
    if not date_str:
        return None
    clean = str(date_str).strip()
    if clean.lower() in UNUSABLE_DATES:
        return None

    # Strip ordinal suffixes: 1st, 2nd, 3rd, 4th, etc.
    raw_date = re.sub(r"(\d+)(st|nd|rd|th)", r"\1", clean, flags=re.IGNORECASE)
    raw_time = str(time_str).strip() if time_str else ""

    now = datetime.now()
    year = now.year
    month = now.month
    day = now.day
    hour = 0
    minute = 0

    # 1. ISO 8601: YYYY-MM-DD or YYYY/MM/DD
    iso_match = re.match(r"^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$", raw_date)
    if iso_match:
        year = int(iso_match.group(1))
        month = int(iso_match.group(2))
        day = int(iso_match.group(3))
    elif raw_date.lower() == "today":
        pass
    elif raw_date.lower() == "tomorrow":
        tomorrow = now + timedelta(days=1)
        year, month, day = tomorrow.year, tomorrow.month, tomorrow.day
    else:
        # 2. Tokenized: "5 September 2026", "02 Sep", "16 August", "Oct 24", "12 Oct 2026"
        tokens = re.split(r"\s+", raw_date.replace(",", " ").strip())
        tokens = [t for t in tokens if t]
        if len(tokens) >= 2:
            explicit_year = False
            if re.match(r"^\d{1,2}$", tokens[0]):
                day = int(tokens[0])
                m_key = tokens[1].lower()[:3]
                if m_key in MONTH_NAMES:
                    month = MONTH_NAMES[m_key]
                else:
                    return None
                if len(tokens) > 2 and re.match(r"^\d{4}$", tokens[2]):
                    year = int(tokens[2])
                    explicit_year = True
            else:
                m_key = tokens[0].lower()[:3]
                if m_key in MONTH_NAMES:
                    month = MONTH_NAMES[m_key]
                else:
                    return None
                if re.match(r"^\d{1,2}$", tokens[1]):
                    day = int(tokens[1])
                else:
                    return None
                if len(tokens) > 2 and re.match(r"^\d{4}$", tokens[2]):
                    year = int(tokens[2])
                    explicit_year = True

            if not explicit_year and month < now.month:
                year += 1
        else:
            return None

    # Parse time
    if raw_time and raw_time.lower() not in UNUSABLE_DATES:
        ampm_match = re.search(r"(\d{1,2})(?::(\d{2}))?\s*(am|pm)", raw_time, re.IGNORECASE)
        if ampm_match:
            hour = int(ampm_match.group(1))
            minute = int(ampm_match.group(2)) if ampm_match.group(2) else 0
            is_pm = ampm_match.group(3).upper() == "PM"
            if is_pm and hour != 12:
                hour += 12
            if not is_pm and hour == 12:
                hour = 0
        else:
            military_match = re.match(r"^(\d{1,2}):(\d{2})$", raw_time)
            if military_match:
                hour = int(military_match.group(1))
                minute = int(military_match.group(2))

    try:
        return datetime(year, month, day, hour, minute)
    except Exception:
        return None
