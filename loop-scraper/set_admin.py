"""Grant or revoke Club Studio coordinator access.

The Firestore rules and the serverless API both gate on a `coordinator` custom
claim, so a new coordinator cannot approve or submit events until this runs.

Usage:
    python set_admin.py <uid> <clubId>      # grant
    python set_admin.py <uid> --revoke      # revoke
    python set_admin.py --list              # show everyone who currently has it

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


def list_coordinators():
    found = 0
    page = auth.list_users()
    while page:
        for user in page.users:
            claims = user.custom_claims or {}
            if claims.get("coordinator"):
                found += 1
                print(f"  {user.email or '(no email)':<40} {user.uid}  club={claims.get('clubId')}")
        page = page.get_next_page()
    if not found:
        print("  no coordinators set")


def main():
    args = sys.argv[1:]
    if not args or args[0] in ("-h", "--help"):
        sys.exit(__doc__)

    init()

    if args[0] == "--list":
        print("Coordinators:")
        list_coordinators()
        return

    if len(args) < 2:
        sys.exit("Usage: python set_admin.py <uid> <clubId> | <uid> --revoke | --list")

    uid = args[0]

    try:
        user = auth.get_user(uid)
    except auth.UserNotFoundError:
        sys.exit(f"No Firebase Auth user with uid {uid}. Create the account first.")

    if args[1] == "--revoke":
        auth.set_custom_user_claims(uid, None)
        auth.revoke_refresh_tokens(uid)
        print(f"Revoked coordinator access for {user.email or uid}.")
        return

    club_id = args[1]
    auth.set_custom_user_claims(uid, {"coordinator": True, "clubId": club_id})
    # Force a token refresh so the claim takes effect on the next request
    # rather than after the current hour-long token expires.
    auth.revoke_refresh_tokens(uid)
    print(f"Granted coordinator access to {user.email or uid} for club '{club_id}'.")
    print("They must sign out and back in for the claim to apply.")


if __name__ == "__main__":
    main()
