#!/bin/sh
# Start the MKP site preview at http://localhost:4173 (serves site/, forwards /api/* to the live backend)
cd "$(dirname "$0")" && exec python3 tools/dev-server.py 4173
