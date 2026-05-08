#!/bin/bash
# Replace all em dashes (U+2014) with normal dashes (-) in all .md files

find docs -name '*.md' -exec perl -CSDA -0pi -e 's/\x{2014}/-/g' {} +

echo "Done. Replaced all em dashes in docs/**/*.md"
