#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PID_FILE="$DIR/scraper.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        kill "$PID" 2>/dev/null
        # Also kill any active scraper.py child process
        pkill -P "$PID" 2>/dev/null
        pkill -f "scraper.py" 2>/dev/null
        rm -f "$PID_FILE"
        echo "Background scraper (PID $PID) stopped successfully."
        exit 0
    else
        echo "Process $PID not running. Cleaning up PID file."
        rm -f "$PID_FILE"
        exit 0
    fi
else
    # Fallback to pkill if no pidfile
    if pgrep -f "scraper.py" > /dev/null; then
        pkill -f "scraper.py"
        echo "Stopped running scraper process(es)."
    else
        echo "No scraper process is currently running."
    fi
fi
