#!/bin/bash

# Navigate to scraper directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

PID_FILE="$DIR/scraper.pid"
LOG_FILE="$DIR/scraper_bg.log"

# Interval in seconds (default: 4 hours = 14400 seconds)
INTERVAL=${SCRAPER_INTERVAL:-14400}

# Check if already running
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "Scraper is already running with PID $OLD_PID."
        exit 1
    else
        rm -f "$PID_FILE"
    fi
fi

echo $$ > "$PID_FILE"
echo "=== [$(date)] Background scraper started (PID: $$), interval: ${INTERVAL}s ===" >> "$LOG_FILE"

# Determine python executable
if [ -f "$DIR/venv/bin/python" ]; then
    PY="$DIR/venv/bin/python"
elif [ -f "$DIR/venv/bin/python3" ]; then
    PY="$DIR/venv/bin/python3"
else
    PY="python3"
fi

cleanup() {
    echo "=== [$(date)] Stopping background scraper ===" >> "$LOG_FILE"
    rm -f "$PID_FILE"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

while true; do
    echo "=== [$(date)] Starting scraping cycle ===" >> "$LOG_FILE"
    "$PY" scraper.py >> "$LOG_FILE" 2>&1
    EXIT_CODE=$?
    echo "=== [$(date)] Cycle finished with code $EXIT_CODE. Next run in $INTERVAL seconds. ===" >> "$LOG_FILE"
    sleep "$INTERVAL" &
    wait $!
done
