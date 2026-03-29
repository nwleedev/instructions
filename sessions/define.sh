#!/bin/sh
set -eu

usage() {
  cat <<'EOF'
사용법:
  scripts/create-session.sh <session_id>

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

## 유의점
"

write_if_missing "$STORE_DIR/TICKETS.md" "# TICKETS.md
> 작업 상태의 단일 진실원천(SSOT)  
> 현재 무엇이 남아 있고, 무엇이 완료되었는지를 판단할 때 이 파일을 기준으로 한다.

## Active

- [ ] T-001 사용자 로그인 API 구현  
  - tickets/T-001-login-api.md  
- [ ] T-002 에러 처리 공통 모듈 정리 (Blocked: 스펙 미확정)  
  - tickets/T-002-error-handling.md  

## Done

- [x] T-000 프로젝트 초기 세팅  
  - tickets/T-000-bootstrap.md
"

write_if_missing "$STORE_DIR/PROGRESS.md" "# PROGRESS.md
## 2026-01-22 00:00
### Done
- T-000 초기 세팅 완료 (PR #12)

### In Progress
- T-001 로그인 API 구현

### Blocked
- 없음

### Next
- 인증 토큰 설계 검토

---

## 2026-01-23 00:01
### Done
- 없음

### In Progress
- T-001

### Blocked
- T-002 (에러 정책 미확정)

### Notes
- 에러 코드 체계 결정 필요 (DECISIONS 예정)
"

write_if_missing "$STORE_DIR/DECISIONS.md" "# DECISIONS.md
## Active
- D-001 인증 방식으로 JWT 사용  
  - decisions/D-001-jwt-auth.md

## Superseded
- D-000 세션 기반 인증  
  - decisions/D-000-session-auth.md
"

write_if_missing "$STORE_DIR/UPDATES.md" "# UPDATES.md
# UPDATES.md

| 파일                                    | 마지막 확인 날짜(\`Last Read\`) | 마지막 수정 날짜 |
| --------------------------------------- | ----------------------------- | ---------------- |
| \`AGENTS.md\`                             | 2026-03-15 00:29              | 2026-03-14 19:42 |
| \`.agents/skills/code-writing/SKILL.md\`  | 2026-03-15 00:29              | 2026-03-10 16:44 |
| \`.agents/skills/plan-tickets/SKILL.md\`  | 2026-03-14 22:46              | 2026-03-13 23:46 |
| \`.agents/skills/goal-review/SKILL.md\`   | 2026-03-15 00:29              | 2026-03-13 23:45 |
| \`.agents/skills/task-prep/SKILL.md\`     | 2026-03-15 00:29              | 2026-03-13 23:46 |
| \`.agents/skills/ticket-review/SKILL.md\` | 2026-03-14 19:36              | 2026-03-13 23:45 |

## 운용 메모

- \`AGENTS.md\`와 실제로 읽은 skill 파일 또는 폴더만 기록한다.
- 수정 시각이 \`Last Read\`보다 뒤라면 stale로 보고 다시 읽은 뒤 갱신한다.
- 읽지 않은 파일을 미리 적지 않는다.

"

write_if_missing "$STORE_DIR/RESEARCH.md" "# RESEARCH.md
## Authentication
### JWT Best Practices
- Source: https://example.com/jwt-best-practices
- Key Takeaways:
  - 토큰 만료 시간은 짧게
  - 알고리즘 명시
- How We Use This:
  - 로그인 API 토큰 만료 15분 적용
- Related Decisions:
  - D-001

---

## Error Handling
### REST API Error Codes
- Source: https://example.com/api-errors
- Key Takeaways:
  - 표준 HTTP 상태 코드 사용
- How We Use This:
  - 공통 에러 응답 포맷 설계 참고
"

echo "완료: $STORE_DIR"
echo "생성됨(또는 기존 유지):"
echo "  - PLANS.md / PROGRESS.md / TICKETS.md / RESEARCH.md / DECISIONS.md / UPDATES.md"
echo "  - tickets/ temps/ decisions/"
