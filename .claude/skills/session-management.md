---
name: session-management
description: "세션 시작, 세션 종료, SESSION.md, contexts, 스냅샷, 세션 관리, 세션 디렉터리, 컨텍스트 압축 후 재개 — 세션 라이프사이클 규칙. Use when starting, resuming, or ending work sessions."
user-invocable: true
---

# Session Management Rules

세션별 SESSION.md와 contexts/ 폴더를 사용한 세션 관리 규칙이다.
SessionStart 훅으로 자동 주입된다.

---

## Session Setup

- 세션 시작: `claude-scripts/exec.sh <session_id>` 또는 `claude-scripts/init.sh <session_id>` 실행.
- 스크립트가 `.claude/sessions/<session_id>/` 디렉터리와 SESSION.md를 생성한다.
- SessionStart 훅이 `$SESSION_ID` 환경변수 기반으로 해당 SESSION.md를 컨텍스트에 자동 주입한다.
- 세션 ID는 환경변수 `SESSION_ID`로도 확인 가능하다.
- 세션 ID가 없으면 사용자에게 임시 세션을 세팅할지 질문한다.
- 인터넷 연결 확인 요청에는 세션 ID를 확인하지 않는다.

### 동시 사용

- 여러 터미널에서 각각 다른 세션으로 작업할 수 있다.
- 각 터미널에서 `claude-scripts/exec.sh <id>`를 실행하면 `$SESSION_ID` 환경변수가 해당 프로세스에 설정된다.
- SessionStart 훅이 `$SESSION_ID` 기반으로 해당 SESSION.md만 주입하므로, 다른 터미널의 세션과 충돌하지 않는다.

---

## Turn Snapshot (HARD RULE)

**매 턴 종료 시 반드시 `/session-snapshot` 스킬을 호출하여 스냅샷을 생성한다.**

### 턴 시작 시

1. SessionStart 훅이 SESSION.md를 자동 주입한다 (별도 행동 불필요).
2. SESSION.md의 최근 스냅샷을 읽고 이전 맥락을 파악한다.
3. `.claude/plans/` 계획 파일을 확인한다.

### 턴 종료 시

1. 사용자에게 응답을 보내기 직전에 `/session-snapshot` 스킬을 호출한다.
2. 스냅샷 title은 이번 턴의 핵심 작업을 짧게 요약한 영문 제목이다.
3. **이 단계를 건너뛰지 않는다.** "단순한 질문이라 불필요하다"는 합리화를 하지 않는다.

### 스냅샷 생략 가능한 경우 (예외)

- 사용자가 인터넷 연결 확인만 요청한 경우
- 사용자가 단순 질문(예/아니오)만 한 경우
- 세션 ID가 설정되지 않은 경우

---

## SESSION.md 구조

SESSION.md는 스냅샷 요약이 **최신순으로 누적되는 로그**이다.

```markdown
# Session Log

## Goal
(세션의 전체 목표 1-2문장)

## Active Decisions
- (현재 유효한 결정 목록, 각 1줄. 무효화되면 제거)

## Snapshots (newest first)

### <YYYY-MM-DD HH:MM> — <title>
- Done: <완료한 작업>
- Files: <변경 파일>
- Next: <다음 작업>
```

- 각 스냅샷 요약은 3-5줄.
- 80줄 초과 시 오래된 스냅샷부터 삭제 (contexts/에 전체 보존됨).
- Goal 섹션은 세션 시작 시 한 번 설정하고, 목표가 변경될 때만 갱신한다.

---

## Session Directory Structure

```
.claude/sessions/<session_id>/
  SESSION.md          # 스냅샷 요약 누적 로그
  contexts/           # 스냅샷 전체 파일 이력
  notes/              # 상세 리서치, 조사 메모, 중간 산출물
```

---

## Plans

- 계획 파일의 유일한 위치는 `.claude/plans/`이다 (Claude Code 네이티브).
- 별도 PLANS.md 파일을 만들지 않는다.
- 목표, 범위, 완료 기준은 Claude Code Plan 파일에 기록한다.

---

## Goal Alignment Check

- 작업 중 현재 진행 방향이 원래 목표(SESSION.md Goal)와 맞는지 주기적으로 확인한다.
- 목표에서 벗어나는 작업을 발견하면 사용자에게 알리고 방향을 조정한다.
