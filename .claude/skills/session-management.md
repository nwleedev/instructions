---
name: session-management
description: "세션 시작, 세션 종료, SESSION.md, contexts, preflight, postflight, 세션 관리, 세션 디렉터리, 80줄 제한, 컨텍스트 압축 후 재개 — 세션 라이프사이클 규칙. Use when starting, resuming, or ending work sessions."
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

## SESSION.md Overview

- 세션 상태 파일 경로: `.claude/sessions/<session_id>/SESSION.md`
- SessionStart 훅이 startup, resume, compact, clear 시 `$SESSION_ID` 기반으로 자동 주입한다.
- **매 턴 전체 덮어쓰기**한다. append 금지. **80줄 제한**.
- 덮어쓰기 전에 `.claude/sessions/<session_id>/contexts/CONTEXT-<YYYYMMDD>-<HHMM>-<title>.md`로 스냅샷 저장.

---

## Session Lifecycle

### Turn Start (Preflight)
1. `.claude/sessions/<session_id>/SESSION.md`를 읽고 현재 상태를 확인한다.
2. `.claude/plans/` 계획 파일을 확인한다.
3. 현재 작업할 티켓을 SESSION.md의 Current Ticket에 기록한다.
4. SESSION.md를 덮어쓰기 전에 contexts/로 스냅샷을 저장한다.

### Turn End (Postflight)
1. SESSION.md를 최신 상태로 덮어쓴다 (Completed, Next, Key Decisions 갱신).
2. Recovery Info를 갱신한다.
3. 종료 기록이 비어 있으면 완료 보고하지 않는다.

### After Compaction
- SessionStart 훅이 SESSION.md를 자동으로 컨텍스트에 재주입한다.
- Recovery Info 섹션만으로 즉시 재개 가능해야 한다.

---

## SESSION.md Format

```markdown
# Session State
<!-- 매 턴 전체 덮어쓰기. append 금지. 80줄 제한. -->

## Goal
(1-2문장: 사용자의 목표)

## Current Ticket
(지금 작업 중인 것 - 1-2문장)

## Completed
- (완료된 티켓 제목만)

## Blocked
- (차단 사항과 이유 - 각 1줄)

## Next
- (현재 티켓 완료 후 다음 행동)

## Key Decisions
- (최근 결정 최대 5개, 각 1줄. 오래된 것은 탈락)

## Recovery Info
- Working on: (파일 경로, 함수명)
- Last verified: (마지막으로 확인한 동작 상태)
- Next step: (다음에 실행할 정확한 명령 또는 편집)
```

---

## Session Directory Structure

```
.claude/sessions/<session_id>/
  SESSION.md          # 현재 세션 상태 (80줄 제한, 매 턴 덮어쓰기)
  contexts/           # SESSION.md 스냅샷 이력
  notes/              # 상세 리서치, 조사 메모, 중간 산출물
```

---

## Plans

- 계획 파일의 유일한 위치는 `.claude/plans/`이다 (Claude Code 네이티브).
- 별도 PLANS.md 파일을 만들지 않는다.
- 목표, 범위, 완료 기준은 Claude Code Plan 파일에 기록한다.
- 사용자도 직접 수정 가능하다 (일반 마크다운 파일).
- 계획이 불완전하면 사용자에게 선택지를 제시하고 대기한다.

---

## contexts/ Folder

- SESSION.md 덮어쓰기 전에 스냅샷을 저장하는 이력 폴더이다.
- 파일명: `CONTEXT-<YYYYMMDD>-<HHMM>-<title>.md`
- SessionEnd 훅이 세션 종료 시 자동으로 스냅샷을 저장한다.

---

## 80-Line Enforcement

- SESSION.md가 80줄을 초과하면:
  1. Completed 리스트에서 오래된 항목을 삭제한다.
  2. Key Decisions에서 오래된 결정을 삭제한다.
  3. 삭제된 내용은 contexts/ 스냅샷에 보존되어 있다.

---

## Goal Alignment Check

- 작업 중 현재 진행 방향이 원래 목표(SESSION.md Goal)와 맞는지 주기적으로 확인한다.
- 목표에서 벗어나는 작업을 발견하면 사용자에게 알리고 방향을 조정한다.
