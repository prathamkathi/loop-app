"""
test_completeness_gate.py
Unit tests for the scraper completeness evaluation gate (D-3, T2.2).
"""

import sys
import os
import unittest
from datetime import datetime

# Add scraper dir to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from completeness_gate import evaluate_completeness, usable, FILLER, ALLOWED_CATEGORIES

class TestCompletenessGate(unittest.TestCase):
    def setUp(self):
        self.sample_datetime = datetime(2026, 9, 5, 19, 30)

    def test_complete_event_approves(self):
        parsed = {
            "isEvent": True,
            "postKind": "event",
            "title": "Acoustic Jam Night",
            "date": "5 September 2026",
            "startTime": "7:30 PM",
            "venue": "SAC Amphitheatre",
            "category": "Cultural & Arts",
            "confidenceScore": 95
        }
        is_complete, status = evaluate_completeness(parsed, self.sample_datetime)
        self.assertTrue(is_complete)
        self.assertEqual(status, "approved")

    def test_sponsor_post_routes_to_pending(self):
        parsed = {
            "isEvent": False,
            "postKind": "sponsor",
            "title": "Official Energy Drink Partner Announcement",
            "date": "5 September 2026",
            "startTime": "10:00 AM",
            "venue": "Campus Grounds",
            "category": "Campus Notices",
            "confidenceScore": 90
        }
        is_complete, status = evaluate_completeness(parsed, self.sample_datetime)
        self.assertFalse(is_complete)
        self.assertEqual(status, "pending")

    def test_recruitment_drive_routes_to_pending(self):
        parsed = {
            "isEvent": False,
            "postKind": "recruitment",
            "title": "Robotics Club Inductions 2026",
            "date": "6 September 2026",
            "startTime": "5:00 PM",
            "venue": "LHC 121",
            "category": "Tech & Innovation",
            "confidenceScore": 90
        }
        is_complete, status = evaluate_completeness(parsed, self.sample_datetime)
        self.assertFalse(is_complete)
        self.assertEqual(status, "pending")

    def test_unspecified_time_routes_to_pending(self):
        # D-3: 5 of 6 real extractions had 'Not specified' as the time
        for filler_time in ["Not specified", "not available", "TBD", "tba", "", "none"]:
            parsed = {
                "isEvent": True,
                "postKind": "event",
                "title": "Tech Talk by Google",
                "date": "5 September 2026",
                "startTime": filler_time,
                "venue": "Dogra Hall",
                "category": "Talks & Workshops",
                "confidenceScore": 85
            }
            is_complete, status = evaluate_completeness(parsed, self.sample_datetime)
            self.assertFalse(is_complete, f"Failed for filler time: '{filler_time}'")
            self.assertEqual(status, "pending")

    def test_unannounced_venue_routes_to_pending(self):
        for filler_venue in ["", "TBA", "tbd", "unknown", "none", "not provided"]:
            parsed = {
                "isEvent": True,
                "postKind": "event",
                "title": "Inter-Hostel Debate",
                "date": "5 September 2026",
                "startTime": "5:00 PM",
                "venue": filler_venue,
                "category": "Competitions & Quizzes",
                "confidenceScore": 85
            }
            is_complete, status = evaluate_completeness(parsed, self.sample_datetime)
            self.assertFalse(is_complete, f"Failed for filler venue: '{filler_venue}'")
            self.assertEqual(status, "pending")

    def test_unparseable_date_routes_to_pending(self):
        parsed = {
            "isEvent": True,
            "postKind": "event",
            "title": "Marathon Run 2026",
            "date": "Date TBA",
            "startTime": "6:00 AM",
            "venue": "Main Football Ground",
            "category": "Sports & Fitness",
            "confidenceScore": 85
        }
        is_complete, status = evaluate_completeness(parsed, starts_at=None)
        self.assertFalse(is_complete)
        self.assertEqual(status, "pending")

    def test_invalid_category_routes_to_pending(self):
        # D-3: out-of-enum category must not auto-publish
        parsed = {
            "isEvent": True,
            "postKind": "event",
            "title": "General Student Gathering",
            "date": "5 September 2026",
            "startTime": "6:00 PM",
            "venue": "SAC",
            "category": "NonExistentCategory",
            "confidenceScore": 85
        }
        is_complete, status = evaluate_completeness(parsed, self.sample_datetime)
        self.assertFalse(is_complete)
        self.assertEqual(status, "pending")

    def test_short_or_empty_title_routes_to_pending(self):
        for bad_title in ["", "   ", "Hi", "Jam"]:
            parsed = {
                "isEvent": True,
                "postKind": "event",
                "title": bad_title,
                "date": "5 September 2026",
                "startTime": "6:00 PM",
                "venue": "SAC",
                "category": "Cultural & Arts",
                "confidenceScore": 85
            }
            is_complete, status = evaluate_completeness(parsed, self.sample_datetime)
            self.assertFalse(is_complete, f"Failed for title: '{bad_title}'")
            self.assertEqual(status, "pending")

if __name__ == "__main__":
    unittest.main()
