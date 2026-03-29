#!/bin/sh
set -eu

usage() {
  cat <<'EOF'
사용법:
  sessions/define.sh <session_id>

설명:
  ./store/<session_id>/ 아래에 세션 기록용 표준 파일/폴더 구조를 생성합니다.
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
STORE_DIR="$ROOT_DIR/store/$SESSION_ID"

mkdir -p "$STORE_DIR"
mkdir -p "$STORE_DIR/tickets"
mkdir -p "$STORE_DIR/decisions"
mkdir -p "$STORE_DIR/temps"

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

write_if_missing "$STORE_DIR/PLANS.md" "# PLANS.md

## 목표

- (여기에 이번 세션의 목표를 적습니다.)

## 범위

- 포함:
- 제외:

## 완료 기준

- (검증 가능한 완료 기준을 적습니다.)

## 관련 경로 / 문서

- 관련 파일:
- 참고 문서:

## 작업 계획

- 1.
- 2.
- 3.

## 미정 사항 처리 방식

- (보수적 기본값 / 중요한 항목만 질문 / 모든 미정 항목 질문 중 선택)
"

write_if_missing "$STORE_DIR/TICKETS.md" "# TICKETS.md
> 작업 상태의 단일 진실원천(SSOT)  
> 현재 무엇이 남아 있고, 무엇이 완료되었는지를 판단할 때 이 파일을 기준으로 한다.

## Original Goal

- (사용자의 원래 목표를 적습니다.)

## Current Best Next Ticket

- T-0001 (다음에 바로 수행할 티켓을 적습니다.)

## Why This Advances The Original Goal

- (왜 지금 이 티켓이 원래 목표를 진전시키는지 적습니다.)

## Deferred But Important

- 없음

## Active

- 없음

## Done

- 없음
"

write_if_missing "$STORE_DIR/PROGRESS.md" "# PROGRESS.md
## 2026-01-01 00:00
### Done
- 없음

### In Progress
- 없음

### Blocked
- 없음

### Next
- (다음 세션에서 바로 할 일을 적습니다.)
"

write_if_missing "$STORE_DIR/DECISIONS.md" "# DECISIONS.md
## Active
- 없음

## Superseded
- 없음
"

write_if_missing "$STORE_DIR/UPDATES.md" "# UPDATES.md

| 파일                                    | 마지막 확인 날짜(\`Last Read\`) | 마지막 수정 날짜 |
| --------------------------------------- | ----------------------------- | ---------------- |
| \`AGENTS.md\`                           |                             |                  |
| \`instructions/INDEX.md\`               |                             |                  |
| \`instructions/SESSIONS.md\`            |                             |                  |

## 운용 메모

- \`AGENTS.md\`와 실제로 읽은 skill 파일 또는 폴더만 기록한다.
- 수정 시각이 \`Last Read\`보다 뒤라면 stale로 보고 다시 읽은 뒤 갱신한다.
- 읽지 않은 파일을 미리 적지 않는다.

"

write_if_missing "$STORE_DIR/RESEARCH.md" "# RESEARCH.md
## Topic

### Claim or Question

- Source:
- Evidence Notes:
- Working Interpretation:
- How We Use This:
- Related Decisions:
"

echo "완료: $STORE_DIR"
echo "생성됨(또는 기존 유지):"
echo "  - PLANS.md / PROGRESS.md / TICKETS.md / RESEARCH.md / DECISIONS.md / UPDATES.md"
echo "  - tickets/ temps/ decisions/"
