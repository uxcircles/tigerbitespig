#!/bin/sh
# Print the open to-do items from .private/NOTES.md (the "## 待辦" section).
# Overdue items are flagged. Run any time with: sh .githooks/remind.sh
notes="$(git rev-parse --show-toplevel)/.private/NOTES.md"
[ -f "$notes" ] || exit 0
today=$(date +%Y-%m-%d)
awk -v today="$today" '
  /^## / { inside = ($0 ~ /^## 待辦/) ; next }
  inside && /^- \[ \]/ {
    line = substr($0, 7); due = ""
    if (match(line, /\([0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]\)/)) due = substr(line, RSTART + 1, 10)
    mark = "  "
    if (due != "" && due < today) mark = "!!"
    else if (due == today) mark = " >"
    items[++n] = mark " " line
  }
  END {
    if (!n) exit
    print ""
    print "提醒（.private/NOTES.md 待辦）:"
    for (i = 1; i <= n; i++) print items[i]
    print "  (!! = 已過期, > = 今天)"
    print ""
  }
' "$notes" >&2
