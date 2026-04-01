# 지시사항 문서

본 문서는 이 레포지토리에서 Codex, Claude가 작업할 때 따라야 할 표준 지시사항을 제공합니다.
사람을 위한 README와 달리, 에이전트가 즉시 실행 가능한 명령, 규칙, 검증 절차 중심으로 유지합니다.

**Codex는 Codex CLI를 지칭합니다. Claude는 Claude Code를 지칭합니다.**

**모든 작업에 대해서 공통적으로 적용해야 하는 규칙에 대해서는 `instructions/INDEX.md` 파일을 반드시 따른다.**

Codex, Claude를 처음 실행할 때 & 컨텍스트가 압축되었을 때에도 AGENTS.md, `instructions/INDEX.md` 파일을 **반드시** 읽고 어떻게 작업해야 하는지 파악한다.

## 진입점 규칙

- 이 프로젝트의 루트 진입점은 `AGENTS.md`입니다.
- `CLAUDE.md`는 별도 규칙 저장소가 아니라 `AGENTS.md`를 가리키는 얇은 shim으로 유지합니다.
- 공통 규칙은 가능한 한 `AGENTS.md`와 `instructions/*`에만 두고, 도구별 예외 규칙은 최소화합니다.

## 작업 분야 하네스 선택

모든 작업은 아래 순서로 필요한 하네스를 추가 적용합니다.

1. 공통 필독
   - `AGENTS.md`
   - `instructions/INDEX.md`
   - `instructions/SESSIONS.md`
   - `instructions/FAILURE.md`
2. 프로젝트 로컬 작업 분야 하네스 확인
   - `instructions/<task_type>/INDEX.md` 같은 로컬 하네스가 있으면 그것과 연결된 상세 문서까지 읽습니다.
   - 로컬 하네스가 추가로 읽으라고 지시하는 아키텍처, 안티패턴, 검증, 템플릿 문서를 이어서 읽습니다.
3. 도메인이 낯선 경우 학습 모드 병행 여부 판정
   - 사용자가 해당 분야에 익숙하지 않다고 밝혔거나 프로젝트 분야가 낯설면 `instructions/learning-mode/*`를 주 작업 하네스와 함께 적용합니다.
4. 로컬 하네스가 없으면 생성 또는 보강
   - 필요한 작업 분야 하네스가 없으면 `harness-engine` 스킬로 생성하거나 보강합니다.

규칙:

- 프로젝트별 `instructions/<task_type>/*` 하네스는 portable core가 아닌 repo-local 상세 하네스로 취급합니다. 다른 프로젝트의 기본 복사 범위로 가정하지 않습니다.
- 필요한 로컬 하네스가 없으면 `harness-engine`으로 생성합니다.
- 기존 로컬 하네스로 설명 가능한 작업이면 새 작업 분야를 만들지 않습니다.
- 기존 로컬 하네스로 설명되지 않는 반복 작업만 새 하네스 후보로 봅니다.
- 하네스 생성/보강/감사 뒤 다음 구현 티켓을 열기 전에는 validation artifact를 남깁니다.

## 세션

장시간 작업과 컨텍스트 압축 이후 재개를 위해 세션을 사용합니다.

**세션의 정의가 무엇인지, 각 세션 파일이 어떤 역할을 하는지에 대해서는 `instructions/SESSIONS.md` 파일을 반드시 참고한다.**

세션 기록 강행 규칙:

- 세션 기록은 권장이 아니라 작업 게이트입니다.
- 실질적인 탐색, 조사, 구현, 검증을 시작하기 전에는 다음 preflight를 끝냅니다.
  - 현재 세션과 세션 디렉터리를 확인합니다.
  - `PLANS.md`를 다시 읽고 작업 시작 가능 여부를 판정합니다.
  - `TICKETS.md` 상단의 `Original Goal`, `Current Best Next Ticket`, `Why This Advances The Original Goal`, `Deferred But Important`를 확인하거나 보강합니다.
  - 현재 턴의 작업을 `TICKETS.md`와 `PROGRESS.md`에 시작 상태로 기록합니다.
- `harness-engine`으로 하네스를 생성/보강/감사했다면, 다음 구현 티켓을 열기 전에 세션 validation artifact를 남깁니다.
- 사용자가 새 프롬프트를 주거나 `PLANS.md`에 내용을 추가하면, 기존 판정을 재사용하지 않고 `PLANS.md`를 다시 읽어 추가 정보 필요 여부를 재판정합니다.
- 작업 중 세션 기록 누락을 발견하면, 본 작업보다 먼저 세션 파일을 보정합니다.
- 사용자에게 완료를 보고하기 전에는 다음 postflight를 끝냅니다.
  - `TICKETS.md` 상태와 다음 티켓을 갱신합니다.
  - `PROGRESS.md`의 `Done`, `In progress`, `Blocked`, `Next`를 갱신합니다.
  - 필요 시 `DECISIONS.md`, `RESEARCH.md`를 반영합니다.
- 종료 기록이 비어 있으면 완료, 해결, 끝남처럼 작업이 종료된 것처럼 보고하지 않습니다.

## 실패 대응 원칙

**Codex, Claude가 특정 작업에 실패했을 때 다음과 같은 상황을 방지하기 위함입니다.**

- 사용자가 제시한 요구사항을 무시하고 사용자에게는 작업이 끝났다고 보고하는 상황
- 문제의 원인을 정확히 파악하지 않고 문제를 덮어쓰는 방식으로 개발해서 기술 부채 유발

**문제를 해결하지 못했다고 해서 문제를 숨기거나 회피하는 방식으로 작업을 완료 처리하는 대신 `instructions/FAILURE.md` 파일을 참고한다.**

## 레포지터리 추가 지침

- `instructions/REPOSITORY.md` 파일이 없으면 지나칩니다.
- `instructions/REPOSITORY.md` 파일이 있으면 반드시 내용을 파악합니다.
  - **해당 파일은 각 레포지터리마다 추가적으로 세팅하는 지침이기 때문에 각 레포지터리마다 추가된 지시사항을 반드시 파악하고 작업에 반영합니다.**

## 주석

- 코드 추가 또는 수정 시 필요한 주석을 유지합니다.
- 주석은 동작 설명만이 아니라 설계 의도, 제약 조건, 입력 가정까지 포함해야 합니다.
- 상세 기준은 `instructions/COMMENTS.md`를 따릅니다.

## AI 행동 품질 규칙

**상세 지침은 `instructions/AI-BEHAVIOR.md` 파일을 참고합니다.**

핵심 요약:

- **출력 스타일**: 사람에게 쓰는 것이지 콘솔 로그가 아닙니다. 산문 중심, 완전한 문장, 전문 용어 풀어 설명.
- **작업 완료 전 검증 강제**: 완료 보고 전에 반드시 실제 동작 검증. 검증할 수 없으면 명시.
- **결과 충실 보고**: 테스트 실패를 숨기거나 성공으로 포장 금지. 정확한 보고가 목표.
- **적극적 협력**: 오해 발견 시 알려주고, 지시만 따르는 것이 아닌 협력자로 행동.
- **비사소한 구현의 독립 검증**: 3+ 파일 수정 시 별도 검증 에이전트로 독립 확인.

## 이식성과 환류

- 여러 프로젝트로 복사해서 쓰는 하네스는 `portable core`, `project adapter`, `local evidence pack`을 분리해 관리합니다.
- 프로젝트마다 달라지는 경로, 검증 명령, 예시, 과거 증빙은 코어 규칙으로 승격하지 않습니다.
- 다른 프로젝트에서 발견한 문제를 원본 저장소로 되돌릴 때는 `instructions/harness/PORTABILITY.md`의 change request packet 형식을 따릅니다. (이 파일은 원본 하네스 저장소에만 존재하며 sync-harness.sh 배포 범위에 포함되지 않습니다.)

## 하네스 문제 자동 보고

- 실제 프로젝트에서 작업 중 하네스 계층(`AGENTS.md`, `instructions/*`, `harness-engine`, 세션 규칙)에 문제가 발생하면, 에이전트는 먼저 구조화 리포트를 작성합니다.
- 기본 템플릿은 `instructions/templates/HARNESS-ISSUE-REPORT-TEMPLATE.md`를 사용합니다.
- 기본 저장 경로는 `store/<session_id>/temps/harness-issues/`입니다. 세션 디렉터리가 없는 환경에서는 프로젝트의 `temps/harness-issues/`를 사용합니다.
- 보고서에는 최소한 사용자 목표, 읽은 규칙 파일, 실제 실패 동작, 기대 동작, 재현 절차, 로컬 제약, 일반화 후보를 포함합니다.
- 보고서 작성 없이 코어 하네스 문제를 구두 설명만 남기고 종료하지 않습니다.

<!-- HARNESS-SYNC-CORE-END -->
<!-- HARNESS-SYNC-PROJECT-START -->

<!--
프로젝트 전용 작업 분야 하네스가 안정화되면 아래처럼 명시 섹션을 추가합니다.

## 프론트엔드

- `instructions/frontend/INDEX.md`
- `instructions/frontend/ARCHITECTURE.md`
- `instructions/frontend/ANTI_PATTERNS.md`
- `instructions/frontend/VALIDATION.md`

## 백엔드

- `instructions/backend/INDEX.md`
- `instructions/backend/ARCHITECTURE.md`
- `instructions/backend/ANTI_PATTERNS.md`
- `instructions/backend/VALIDATION.md`
-->
