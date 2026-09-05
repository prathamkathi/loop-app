"""Grant or revoke Club Studio coordinator and admin access.

The Firestore rules and the serverless API gate on `coordinator` and `admin` custom
claims, so an admin or coordinator cannot approve or manage events until this runs.

Usage:
    python set_admin.py <uid> --admin       # grant full admin privileges
    python set_admin.py <uid> <clubId>      # grant coordinator access for a specific club
    python set_admin.py <uid> --revoke      # revoke all claims
    python set_admin.py --list              # show everyone who currently has roles

The user must already exist in Firebase Auth (create them in the console, or
have them sign in once through the Studio portal).
"""

import sys
import os
import firebase_admin
from firebase_admin import credentials, auth

CRED_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "serviceAccountKey.json")


def init():
    if not os.path.exists(CRED_PATH):
        sys.exit(f"Credential file not found: {CRED_PATH}")
    if not firebase_admin._apps:
        firebase_admin.initialize_app(credentials.Certificate(CRED_PATH))


def list_users():
    found = 0
    page = auth.list_users()
    while page:
        for user in page.users:
            claims = user.custom_claims or {}
            is_admin = claims.get("admin") is True
            is_coord = claims.get("coordinator") is True
            if is_admin or is_coord:
                found += 1
                role_str = "Admin + Coordinator" if (is_admin and is_coord) else "Admin" if is_admin else f"Coordinator (club={claims.get('clubId')})"
                print(f"  {user.email or '(no email)':<40} {user.uid}  {role_str}")
        page = page.get_next_page()
    if not found:
        print("  no users with admin or coordinator claims found")


def main():
    args = sys.argv[1:]
    if not args or args[0] in ("-h", "--help"):
        sys.exit(__doc__)

    init()

    if args[0] == "--list":
        print("Configured Roles:")
        list_users()
        return

    if len(args) < 2:
        sys.exit("Usage: python set_admin.py <uid> --admin | <uid> <clubId> | <uid> --revoke | --list")

    uid = args[0]

    try:
        user = auth.get_user(uid)
    except auth.UserNotFoundError:
        sys.exit(f"No Firebase Auth user with uid {uid}. Create the account first.")

    action = args[1].lower()

    if action == "--revoke":
        auth.set_custom_user_claims(uid, None)
        auth.revoke_refresh_tokens(uid)
        print(f"Revoked all access claims for {user.email or uid}.")
        return

    if action == "--admin":
        auth.set_custom_user_claims(uid, {"admin": True, "coordinator": True})
        auth.revoke_refresh_tokens(uid)
        print(f"Granted ADMIN access to {user.email or uid}.")
        print("They must sign out and back in for the claim to apply.")
        return

    club_id = args[1].lstrip("@").strip()
    auth.set_custom_user_claims(uid, {"coordinator": True, "clubId": club_id})
    auth.revoke_refresh_tokens(uid)
    print(f"Granted coordinator access to {user.email or uid} for club '{club_id}'.")
    print("They must sign out and back in for the claim to apply.")


if __name__ == "__main__":
    main()
