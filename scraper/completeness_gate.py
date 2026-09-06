"""
completeness_gate.py
Canonical event completeness evaluation gate for the LOOP Instagram scraper.
Implements the defect-corrected gate (D-3, T2.2).
"""

FILLER = {
    "", "not specified", "not available", "none", "null", "tbd", "tba",
    "unknown", "n/a", "not provided", "tbc", "ongoing"
}

ALLOWED_CATEGORIES = {
    "Cultural & Arts",
    "Tech & Innovation",
    "Fests & Major Events",
    "Competitions & Quizzes",
    "Talks & Workshops",
    "Sports & Fitness",
    "Social & Wellness",
    "Campus Notices"
}

def usable(v) -> bool:
    """Returns True if a string is non-empty and not a known placeholder string."""
    return bool(v) and str(v).strip().lower() not in FILLER

def evaluate_completeness(parsed_data: dict, starts_at) -> tuple[bool, str]:
    """
    Evaluates whether an extracted event has all mandatory attributes to auto-publish.
    
    Conditions for status='approved':
    1. isEvent is True (sponsor ads, notices, and recruitment drives stay 'pending')
    2. title is usable and longer than 3 characters
    3. startTime is usable (cannot be 'Not specified' or empty)
    4. venue is usable (cannot be empty, 'TBD', or filler)
    5. category is in ALLOWED_CATEGORIES (canonical vocabulary)
    6. starts_at parsed successfully into a valid datetime
    
    Returns:
        (is_complete: bool, status: 'approved' | 'pending')
    """
    if not isinstance(parsed_data, dict):
        return False, "pending"

    is_event = parsed_data.get("isEvent") is True
    title = str(parsed_data.get("title") or "").strip()
    time_str = str(parsed_data.get("startTime") or "").strip()
    venue = str(parsed_data.get("venue") or "").strip()
    category = str(parsed_data.get("category") or "").strip()

    is_complete = (
        is_event is True
        and usable(title) and len(title) > 3
        and usable(time_str)
        and usable(venue)
        and category in ALLOWED_CATEGORIES
        and starts_at is not None
    )

    status = "approved" if is_complete else "pending"
    return is_complete, status
