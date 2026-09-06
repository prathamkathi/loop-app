import argparse
import sys

def main():
    parser = argparse.ArgumentParser(description="Loop Scraper CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Scrape command
    scrape_parser = subparsers.add_parser("scrape", help="Run the Apify Instagram scraper")

    # Harvest avatars command
    harvest_parser = subparsers.add_parser("harvest-avatars", help="Harvest and upload Instagram avatars")

    # Purge command
    purge_parser = subparsers.add_parser("purge", help="Purge soft-deleted and old events")

    # Wipe command
    wipe_parser = subparsers.add_parser("wipe", help="Wipe all data from the database (CAUTION)")

    # Seed command
    seed_parser = subparsers.add_parser("seed", help="Seed the database with sample data")

    # Stock scraper command
    stock_parser = subparsers.add_parser("stock", help="Run the stock Apify scraper")

    # Generate offline events command
    gen_offline_parser = subparsers.add_parser("gen-offline", help="Generate offline events")

    # Generate real events command
    gen_real_parser = subparsers.add_parser("gen-real", help="Generate real events")

    args = parser.parse_args()

    if args.command == "scrape":
        from scraper import run_apify_pipeline
        run_apify_pipeline()
    elif args.command == "harvest-avatars":
        from harvest_avatars import main as harvest_main
        harvest_main()
    elif args.command == "purge":
        print("[Notice] Python purge script was consolidated into the safe db maintenance tool.")
        print("Run: node scripts/db_maintenance.js --action=cleanup --confirm")
    elif args.command == "wipe":
        print("[Notice] Python wipe script was consolidated into the safe db maintenance tool.")
        print("Run: node scripts/db_maintenance.js --action=status")
        print("Or for maintenance: node scripts/db_maintenance.js --action=cleanup --confirm")
    elif args.command == "seed":
        from seed_data import seed_database
        seed_database()
    elif args.command == "stock":
        from stock_scraper import run_stock_pipeline
        run_stock_pipeline()
    elif args.command == "gen-offline":
        from generate_events_offline import main as gen_offline_main
        gen_offline_main()
    elif args.command == "gen-real":
        from generate_real_events import main as gen_real_main
        gen_real_main()

if __name__ == "__main__":
    main()
