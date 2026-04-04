---
name: session-snapshot
description: "세션 스냅샷 생성. 매 턴 종료 시 contexts/ 폴더에 스냅샷 파일을 생성하고 SESSION.md에 요약을 추가한다. Use at the end of every turn to record session state."
user-invocable: true
argument-hint: "[snapshot title]"
---

# Session Snapshot

매 턴 종료 시 호출하여 세션 상태를 기록하는 스킬이다.

## 수행 작업

### 1. contexts/ 스냅샷 파일 생성

`.claude/sessions/<session_id>/contexts/CONTEXT-<YYYYMMDD>-<HHMM>-<title>.md` 파일을 생성한다.

스냅샷 파일 내용:

```markdown
# Snapshot: <title>
Date: <YYYY-MM-DD HH:MM>

## What was done
- (이번 턴에서 수행한 작업 목록)

## Files changed
- (변경된 파일 경로 목록)

## Key decisions
- (이번 턴에서 내린 주요 결정, 있으면)

## Next steps
- (다음에 해야 할 작업)

## Recovery info
- Working on: (현재 작업 중인 대상)
- Last verified: (마지막으로 확인한 상태)
```

### 2. SESSION.md에 요약 추가

`.claude/sessions/<session_id>/SESSION.md`의 `## Snapshots (newest first)` 섹션 최상단에 스냅샷 요약을 prepend한다.

요약 형식 (3-5줄):

```markdown
### <YYYY-MM-DD HH:MM> — <title>
- Done: <완료한 작업 요약 1줄>
- Files: <변경된 파일명 나열>
- Next: <다음 작업 1줄>
```

### 3. Active Decisions 갱신

이번 턴에서 중요한 결정이 있었으면 SESSION.md의 `## Active Decisions` 섹션에 추가한다. 무효화된 결정은 제거한다.

중요한 결정의 기준:
- 아키텍처, 라이브러리, 접근 방식 선택
- 사용자가 명시적으로 확정한 사항
- 이후 작업에 영향을 미치는 제약

## SESSION.md 형식

SESSION.md가 아래 형식이 아니면 변환한다:

```markdown
# Session Log

## Goal
(세션의 전체 목표)

## Active Decisions
- (현재 유효한 결정 목록, 각 1줄. 무효화되면 제거)

## Snapshots (newest first)

### <최신 스냅샷>
- Done: ...
- Files: ...
- Next: ...
```

## 용량 관리

SESSION.md가 80줄을 초과하면:
1. 가장 오래된 스냅샷 요약부터 삭제한다.
2. 삭제해도 contexts/ 폴더에 전체 스냅샷이 보존되어 있으므로 정보 손실이 없다.

## 사전 조건

- `$SESSION_ID` 환경변수가 설정되어 있어야 한다.
- 없으면 세션 ID를 사용자에게 확인한다.
- `.claude/sessions/<session_id>/` 디렉터리가 있어야 한다. 없으면 `contexts/`와 `notes/` 하위 디렉터리를 함께 생성한다.
