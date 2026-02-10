#!/bin/sh
# Auto-commit and push changes on file updates
# Uses fswatch; safe for static sites, but ensure you review commits periodically.

REPO_DIR="/Users/anand-mba/mydesigner-website"
BRANCH="main"
REMOTE="origin"

cd "$REPO_DIR" || exit 1

# Run forever; debounce with a short sleep to coalesce changes
fswatch -o -r "$REPO_DIR" | while read -r _; do
  # Ignore changes inside .git
  if git status --porcelain | grep -q .; then
    # Add all changes, including untracked files
    git add -A

    # Commit if there is still something to commit
    if git diff --cached --quiet; then
      continue
    fi

    ts=$(date "+%Y-%m-%d %H:%M:%S")
    git commit -m "chore: auto update $ts" >/dev/null 2>&1 || continue

    # Push only if on main
    current_branch=$(git symbolic-ref --short HEAD 2>/dev/null)
    if [ "$current_branch" = "$BRANCH" ]; then
      git push "$REMOTE" "$BRANCH" >/dev/null 2>&1 || true
    fi
  fi

  # Debounce
  sleep 2
 done
