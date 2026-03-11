#!/bin/bash
# OMA Prototype — Save & Push to GitHub

cd "$(dirname "$0")"

echo "💾 Saving OMA prototype to GitHub..."

git add .

# Commit avec la date et l'heure
MSG="Save $(date '+%Y-%m-%d %H:%M')"
git commit -m "$MSG"

if [ $? -eq 0 ]; then
  git push
  echo ""
  echo "✅ Done! Pushed to GitHub."
else
  echo ""
  echo "ℹ️  Nothing new to save."
fi

echo ""
read -p "Press Enter to close..."
