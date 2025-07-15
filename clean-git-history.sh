#!/bin/bash

# Git History Cleaner for Sensitive Data
# This script removes sensitive files from Git history

echo "🧹 Cleaning Git history of sensitive data..."
echo "=============================================="

# Remove sensitive files from all commits
echo "Removing jarvis.db from all commits..."
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch backend/jarvis.db' --prune-empty --tag-name-filter cat -- --all

echo "Removing .env files from all commits..."
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch backend/.env' --prune-empty --tag-name-filter cat -- --all
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch frontend/.env' --prune-empty --tag-name-filter cat -- --all

echo "Removing test files from all commits..."
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch backend_test.py' --prune-empty --tag-name-filter cat -- --all

# Force garbage collection
echo "Cleaning up Git objects..."
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now

echo "✅ Git history cleaned!"
echo "⚠️  IMPORTANT: Use 'git push --force' to update remote repository"
echo "⚠️  WARNING: This will rewrite history - inform all collaborators"