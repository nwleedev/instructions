#!/bin/sh
set -eu

if [ $# -lt 1 ] || [ -z "${1:-}" ]; then
  echo "세션 ID가 없습니다."
  echo "사용법: claude-scripts/exec.sh <session_id>"
  exit 1
fi

SESSION_ID="$1"

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
STORE_DIR="$ROOT_DIR/.claude/sessions/$SESSION_ID"

# 세션 디렉터리가 없으면 자동 생성
if [ ! -d "$STORE_DIR" ]; then
  echo "세션 디렉터리가 없어 자동 생성합니다..."
  "$SCRIPT_DIR/init.sh" "$SESSION_ID"
fi

SESSION_ID="$SESSION_ID" claude --resume "$SESSION_ID"
