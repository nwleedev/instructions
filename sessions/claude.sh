#!/bin/sh
set -eu

if [ $# -lt 1 ] || [ -z "${1:-}" ]; then
  echo "세션 ID가 없습니다."
  exit 1
fi

SESSION_ID="$1" claude --resume "$1"
