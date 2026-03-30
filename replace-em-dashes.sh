#!/bin/bash
# Replace all em dashes (—) with normal dashes (-) in all .md files

find docs -name '*.md' -exec sed -i '' 's/—/-/g' {} +

echo "Done. Replaced all em dashes in docs/**/*.md"
