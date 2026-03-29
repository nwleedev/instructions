# 하네스 이식성과 환류

이 문서는 이 저장소의 하네스를 여러 프로젝트에 복사해 사용할 때,
무엇을 그대로 유지하고 무엇을 프로젝트별로 분리해야 하는지,
그리고 복사한 프로젝트에서 생긴 요구사항을 어떻게 원본 저장소로 되돌릴지 정의한다.

## 핵심 원칙

- 공통 규칙은 `portable core`에 둔다.
- 프로젝트마다 달라지는 연결 지점은 `project adapter`에만 둔다.
- 현재 저장소에서만 의미 있는 드라이런, 예시, 과거 검증 기록은 `local evidence pack`으로 분리한다.

## 3층 패키징

### 1. Portable Core

다른 프로젝트에 그대로 복사해도 유지되어야 하는 규칙 묶음이다.

- 루트 진입점 규칙
- 작업 분야 판정 규칙
- 공통 세션 규칙
- 실패 대응 원칙
- 작업 분야별 코어 하네스 (`instructions/research/*`, `instructions/frontend/*`, `instructions/learning-mode/core/*`)

규칙:

- 절대경로, 현재 저장소 전용 파일명, 현재 프로젝트 예시를 필수 규칙처럼 적지 않는다.
- 특정 저장소의 과거 이슈를 코어 규칙으로 올리지 않는다.

### 2. Project Adapter

프로젝트마다 달라지는 연결 지점이다.

- 목표/진행/근거/결정 문서의 실제 경로
- 로컬 검증 명령
- 기술 스택 선언
- 금지 도구 또는 승인 규칙
- 로컬 팀의 추가 제약

규칙:

- 코어를 바로 뜯어고치기 전에 adapter에서 흡수할 수 있는지 먼저 본다.
- `CLAUDE.md`처럼 도구 진입점이 필요하면 adapter에서 연결하되, 공통 규칙은 계속 `AGENTS.md`를 기준으로 유지한다.

### 3. Local Evidence Pack

현재 프로젝트에서만 재현 가능한 증빙 묶음이다.

- 드라이런 결과
- 샘플 산출물
- 검증 보고서
- 실제 실패 사례와 회고

규칙:

- 다른 프로젝트에 통째로 복사하지 않는다.
- 복사하더라도 참고용으로만 두고, 새 프로젝트에서 다시 검증한다.

## 권장 복사 범위

### 필수 복사

- `AGENTS.md`
- `CLAUDE.md`
- `instructions/INDEX.md`
- `instructions/SESSIONS.md`
- `instructions/FAILURE.md`
- `instructions/COMMENTS.md`
- 필요한 작업 분야의 코어 하네스

### 조건부 복사

- 특정 프로젝트용 adapter 문서
- 팀 운영 규칙
- 도메인별 템플릿

### 선택 복사

- 과거 드라이런
- 샘플 산출물
- 현재 저장소 전용 evidence 문서

## 복사 후 반드시 해야 하는 일

1. 주도 작업 분야를 판정하고 필요한 코어 하네스를 읽는다.
2. 현재 프로젝트의 세션 문서, 검증 명령, 기술 스택을 adapter에 연결한다.
3. 대표 작업 1개로 드라이런을 수행해 코어와 adapter의 경계를 검증한다.
4. 현재 프로젝트에서만 필요한 예시나 증빙은 local evidence로 따로 둔다.

## 하네스 동기화 스크립트

현재 저장소에서 다른 프로젝트로 하네스 자산을 설치하거나 업데이트할 때는 `scripts/sync-harness.sh`를 사용한다.

### 기본 사용법

- `scripts/sync-harness.sh --target ../some-project`
- `scripts/sync-harness.sh --target ../some-project --dry-run`
- `scripts/sync-harness.sh --source /path/to/instructions --target ../some-project`

### v1 관리 대상

- 루트 `AGENTS.md`
- 루트 `CLAUDE.md`
- `sessions/*`
- `instructions/*.md`
- `instructions/templates/*`
- 현재 저장소가 소유한 `.agents` 하위 자산

### v1 비관리 대상

- `store/*`
- `instructions/research/*`
- `instructions/frontend/*`
- `instructions/learning-mode/*`
- 대상 프로젝트의 다른 `.agents` 스킬, 에이전트, 로컬 자산

### 소유권 추적

- 대상 프로젝트 루트에 `.harness-sync-manifest.json`을 생성한다.
- manifest에는 현재 스크립트가 관리하는 파일 경로와 마지막 동기화 커밋을 기록한다.
- 이후 업데이트는 manifest에 기록된 경로만 정리하거나 갱신한다.
- manifest에 없는 대상 프로젝트의 파일은 비관리 자산으로 간주하고 건드리지 않는다.

### 업데이트 정책

- 관리 대상 파일은 source의 최신 내용으로 덮어쓴다.
- source에서 사라진 관리 대상 파일은 manifest 기준으로만 제거한다.
- `.agents` 아래에서는 현재 저장소가 소유한 경로만 갱신한다.
- 대상 프로젝트에 이미 있던 다른 `.agents` 자산은 유지한다.

## Change Request Packet

다른 프로젝트에서 하네스를 사용하다가 이 저장소에 반영할 변경이 필요하면,
아래 형식으로 요구사항을 정리해서 되돌린다.

### 필수 항목

- Source Project
  - 어떤 저장소/팀/작업 분야에서 발생했는가
- Copied Artifact Scope
  - 어떤 파일 또는 하네스 묶음을 복사해 사용 중인가
- User-Visible Goal
  - 원래 달성하려던 목표가 무엇인가
- Failure or Friction
  - 실제로 어디서 막혔는가
- Expected Behavior
  - 어떤 규칙 또는 문서가 있었으면 해결되었는가
- Reproduction Task
  - 어떤 사용자 요청 또는 작업 시나리오에서 재현되는가
- Local Constraint
  - 현재 프로젝트만의 제약인가, 다른 프로젝트에도 일반화 가능한가
- Proposed Generalization
  - 코어 규칙 보강인지, adapter 보강인지, local evidence 추가인지
- Evidence
  - 공식 문서, 실제 실패 로그, 재현 절차, 비교 근거

### 분류 규칙

- 현재 프로젝트에만 해당하면 upstream 코어가 아니라 adapter 변경 후보로 본다.
- 두 개 이상 프로젝트에서 반복되면 코어 승격 후보로 본다.
- 재현 절차와 기대 동작이 없으면 change request로 닫지 않는다.

## 실제 프로젝트 보고 절차

실제 프로젝트에서 하네스 계층 문제가 발생하면 아래 순서로 처리한다.

1. 먼저 로컬 보고서 파일을 생성한다.
2. 현재 작업을 막는지, 품질 저하만 있는지, 단순 권고 수준인지 분류한다.
3. 현재 작업 영향은 로컬 `PROGRESS.md` 또는 동급 진행 기록에 남긴다.
4. 일반화 가능성이 있으면 change request packet으로 압축해 이 원본 저장소에 가져온다.

### 로컬 보고서 파일

- 템플릿: `instructions/templates/HARNESS-ISSUE-REPORT-TEMPLATE.md`
- 권장 경로:
  - `store/<session_id>/temps/harness-issues/`
  - 세션 디렉터리가 없으면 `temps/harness-issues/`
- 권장 파일명:
  - `HARNESS-ISSUE-YYYYMMDD-HHMM-{slug}.md`

### 자동 작성 규칙

- 에이전트는 하네스 계층 문제를 확인하면 같은 세션 안에서 즉시 보고서를 작성한다.
- 프롬프트 전문을 그대로 복사하는 대신, 재현에 필요한 요약과 발췌만 남긴다.
- 민감한 경로나 토큰, 사용자 데이터는 마스킹한다.
- 현재 프로젝트에만 해당하는 내용은 먼저 `local adapter fix candidate`로 표시하고, 코어 변경 후보와 분리한다.

## 코어로 올리면 안 되는 대표 사례

- 현재 저장소의 절대경로 또는 세션 ID
- 특정 프로젝트 예시만 성립하는 bootstrap 흐름
- 한 번의 드라이런에서만 본 실패를 범용 규칙처럼 일반화한 문장
- 현재 팀만 쓰는 검증 명령을 모든 프로젝트의 필수 검증으로 승격한 규칙

## 설계 근거

- Codex는 `AGENTS.md` 스캐폴드, 세션 재개, 컴팩션, 포크, 서브에이전트 분리를 공식적으로 지원하므로 코어/로컬 상태 분리가 중요하다.
- Claude Code는 `CLAUDE.md`, session resume, subagent scope, project/user memory, worktree 격리를 제공하므로 공통 규칙과 프로젝트 연결부를 분리하는 편이 안정적이다.
- 장기 세션 도구일수록 과거 증빙을 코어 규칙과 섞지 않고, 재개용 상태와 로컬 증빙을 따로 다뤄야 품질 저하가 줄어든다.

## 근거 링크

- https://developers.openai.com/codex/learn/best-practices/
- https://developers.openai.com/codex/cli/features/
- https://developers.openai.com/codex/cli/slash-commands/
- https://developers.openai.com/codex/app-server/
- https://docs.anthropic.com/en/docs/claude-code/overview
- https://docs.anthropic.com/en/docs/claude-code/cli-reference
- https://docs.anthropic.com/en/docs/claude-code/sub-agents
