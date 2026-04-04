# Instructions

본 문서는 이 레포지토리에서 AI 에이전트가 작업할 때 따라야 할 진입점이다.
상세 규칙은 CLAUDE.md의 @참조를 통해 자동 주입된다.

## Entry Point

- 루트 진입점: `AGENTS.md` (CLAUDE.md @참조로 자동 주입)
- 핵심 규칙: `.claude/skills/core-rules.md` (CLAUDE.md @참조로 자동 주입)
- 실패 대응: `.claude/skills/failure-response.md` (오류 시 description 매칭 자동 활성화)
- 세션 관리: `.claude/skills/session-management.md` (SessionStart 훅으로 자동 주입)
- 스킬 사용: `.claude/skills/use-skills.md` (SessionStart 훅으로 자동 주입)

## Domain Harness Skills

도메인별 하네스는 `.claude/skills/harness-*.md` 스킬로 관리된다.

- 작업 유형에 따라 description 필드 매칭으로 자동 활성화된다.
- 자동 활성화가 안 되면 `/harness-<domain>` 명령으로 수동 활성화할 수 있다.
- 사용 가능한 하네스는 `.claude/skills/` 폴더를 확인한다.

## Portable Core

다른 프로젝트로 배포되는 파일 (claude-scripts/sync.sh):
- `.claude/skills/core-rules.md`, `failure-response.md`, `session-management.md`, `use-skills.md`
- AGENTS.md, CLAUDE.md (템플릿), claude-scripts/*

프로젝트별 로컬 파일 (배포 제외):
- `.claude/skills/harness-*.md` (도메인 하네스)
- `.claude/settings.json`, `.claude/sessions/`
