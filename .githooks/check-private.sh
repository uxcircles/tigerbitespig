#!/bin/sh
# Read added lines on stdin; fail if any contains a phrase from .private/blocklist.txt.
list="$(git rev-parse --show-toplevel)/.private/blocklist.txt"
[ -f "$list" ] || exit 0
patterns=$(mktemp)
grep -v '^[[:space:]]*#' "$list" | grep -v '^[[:space:]]*$' > "$patterns"
if [ ! -s "$patterns" ]; then rm -f "$patterns"; exit 0; fi
hits=$(grep -n -i -F -f "$patterns")
rm -f "$patterns"
if [ -n "$hits" ]; then
  echo "" >&2
  echo "已擋下：新增的內容包含 .private/blocklist.txt 裡的敏感字詞：" >&2
  echo "$hits" | head -20 | sed 's/^/  /' >&2
  echo "這類內容請寫在 .private/NOTES.md。確定要送出可加 --no-verify。" >&2
  echo "" >&2
  exit 1
fi
