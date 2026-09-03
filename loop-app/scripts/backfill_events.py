"""Backfill startsAt on events that predate the schema change (Phase 2, F-14).
Dry-run by default; pass --apply to write."""
import sys, re, os
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

APPLY = "--apply" in sys.argv
firebase_admin.initialize_app(credentials.Certificate("serviceAccountKey.json"))
db = firestore.client()

MONTHS = {m: i+1 for i, m in enumerate(
    ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"])}

def parse(date_s, time_s):
    if not date_s: return None
    d = date_s.strip()
    m = re.match(r"^(\d{4})-(\d{2})-(\d{2})$", d)
    if m:
        y, mo, day = int(m[1]), int(m[2]), int(m[3])
    else:
        t = re.findall(r"[A-Za-z]+|\d+", d)
        day = next((int(x) for x in t if x.isdigit() and len(x) <= 2), None)
        mon = next((MONTHS.get(x[:3].lower()) for x in t if not x.isdigit() and x[:3].lower() in MONTHS), None)
        yr  = next((int(x) for x in t if x.isdigit() and len(x) == 4), None)
        if not day or not mon: return None
        y, mo = yr or datetime.now().year, mon
    hh, mi = 18, 0
    if time_s:
        am = re.search(r"(\d{1,2})(?::(\d{2}))?\s*([ap])m", time_s, re.I)
        if am:
            hh, mi = int(am[1]), int(am[2] or 0)
            if am[3].lower() == "p" and hh != 12: hh += 12
            if am[3].lower() == "a" and hh == 12: hh = 0
        else:
            mil = re.search(r"(\d{1,2}):(\d{2})", time_s)
            if mil: hh, mi = int(mil[1]), int(mil[2])
    try: return datetime(y, mo, day, hh, mi)
    except ValueError: return None

changed = skipped = 0
for doc in db.collection("events").stream():
    d = doc.to_dict() or {}
    if d.get("startsAt"): continue
    dt = parse(d.get("date"), d.get("time"))
    if not dt:
        skipped += 1
        print(f"  SKIP  {doc.id}: cannot parse date={d.get('date')!r} time={d.get('time')!r}")
        continue
    changed += 1
    print(f"  {'SET ' if APPLY else 'WOULD SET'} {doc.id}: {d.get('date')!r} {d.get('time')!r} -> {dt.isoformat()}")
    if APPLY: doc.reference.update({"startsAt": dt})

print(f"\n{'Applied' if APPLY else 'Dry run'}: {changed} to update, {skipped} unparseable")
if not APPLY: print("Re-run with --apply to write.")
