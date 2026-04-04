#!/bin/sh
set -eu

usage() {
  cat <<'EOF'
사용법:
  claude-scripts/init.sh <session_id>

설명:
  .claude/sessions/<session_id>/ 아래에 세션 기록용 표준 파일/폴더 구조를 생성합니다.
  (기존 파일이 있으면 덮어쓰지 않습니다.)
EOF
}

if [ $# -lt 1 ] || [ -z "${1:-}" ]; then
  usage
  exit 1
fi

SESSION_ID="$1"

case "$SESSION_ID" in
  *"/"* | *".."* )
    echo "잘못된 session_id 입니다: $SESSION_ID" >&2
    exit 1
    ;;
esac

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
STORE_DIR="$ROOT_DIR/.claude/sessions/$SESSION_ID"

# 세션 디렉터리 생성
mkdir -p "$STORE_DIR"
mkdir -p "$STORE_DIR/contexts"
mkdir -p "$STORE_DIR/notes"

write_if_missing() {
  path="$1"
  shift

  if [ -f "$path" ]; then
    return 0
  fi

  tmp="$path.tmp.$$"
  cat > "$tmp" <<EOF
$*
EOF
  mv "$tmp" "$path"
}

# SESSION.md — 세션 상태 파일 (80줄 제한, 매 턴 덮어쓰기)
write_if_missing "$STORE_DIR/SESSION.md" "# Session State
<!-- 매 턴 전체 덮어쓰기. append 금지. 80줄 제한. -->
<!-- 덮어쓰기 전 contexts/CONTEXT-<YYYYMMDD>-<HHMM>-<title>.md로 스냅샷 저장 -->

## Goal
(아직 세션이 시작되지 않음)

## Current Ticket
(없음)

## Completed
(없음)

## Blocked
(없음)

## Next
(없음)

## Key Decisions
(없음)

## Recovery Info
- Working on: N/A
- Last verified: N/A
- Next step: N/A"

echo "완료: $STORE_DIR"
echo "생성됨(또는 기존 유지):"
echo "  - SESSION.md (세션 상태, 80줄 제한)"
echo "  - contexts/ (SESSION.md 스냅샷 이력)"
echo "  - notes/ (리서치, 조사 메모)"
echo ""
echo "사용법:"
echo "  SESSION_ID=$SESSION_ID claude --resume $SESSION_ID"
