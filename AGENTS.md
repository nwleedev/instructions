# 지시사항 문서

본 문서는 이 레포지토리에서 Codex, Claude가 작업할 때 따라야 할 표준 지시사항을 제공합니다. 사람을 위한 README와 달리, 에이전트가 즉시 실행 가능한 명령·규칙·검증 절차를 중심으로 기술합니다.

**Codex는 Codex CLI를 지칭합니다. Claude는 Claude Code를 지칭합니다.**

**모든 작업에 대해서 공통적으로 적용해야 하는 규칙에 대해서는 `instructions/INDEX.md` 파일을 반드시 따른다.**

Codex, Claude를 처음 실행할 때 & 컨텍스트가 압축되었을 때에도 AGENTS.md, `instructions/INDEX.md` 파일을 **반드시** 읽고 어떻게 작업해야 하는지 파악한다.

## 진입점 규칙

- 이 저장소의 루트 진입점은 `AGENTS.md`다.
- `CLAUDE.md`는 별도 규칙 저장소가 아니라, `AGENTS.md`를 가리키는 얇은 shim으로 유지한다.
- 도구별 예외 규칙이 정말 필요할 때만 `AGENTS.md`와 별도로 분기하고, 가능한 한 공통 규칙은 `AGENTS.md`와 `instructions/*`에만 둔다.

## 작업 분야 하네스 선택

모든 작업은 아래 순서로 필요한 하네스를 추가 적용한다.

1. 공통 필독
   - `AGENTS.md`
   - `instructions/INDEX.md`
   - `instructions/SESSIONS.md`
   - `instructions/FAILURE.md`
2. 프로젝트 로컬 작업 분야 하네스 확인
   - 현재 프로젝트에 `instructions/<task_type>/INDEX.md` 같은 로컬 작업 분야 하네스가 있으면 그것과 그것이 참조하는 상세 지침까지 읽는다.
     - 예를 들어 프론트엔드 작업의 경우에는 `instructions/frontend/INDEX.md` 또는 `instructions/<frontend_like>/INDEX.md` 파일과 해당 파일이 가리키는 상세 지침까지 읽는다.
   - 로컬 하네스가 추가로 읽으라고 지시하는 아키텍처, 안티패턴, 검증, 템플릿 문서를 이어서 읽는다.
3. 로컬 하네스가 없으면 생성 또는 보강
   - 필요한 작업 분야 하네스가 없으면 `harness-engine` 스킬로 생성하거나 보강한다.

규칙:

- 프로젝트별 `instructions/<task_type>/*` 하네스는 portable core가 아닌 repo-local 상세 하네스로 취급한다. 다른 프로젝트의 기본 복사 범위로 가정하지 않는다.
- 사용자가 해당 도메인에 익숙하지 않다고 명시했거나 프로젝트 분야가 낯설면, 주 작업 분야 하네스만 단독 적용하지 말고 `instructions/learning-mode/*`도 함께 적용한다.
- 필요한 로컬 하네스가 없으면 `harness-engine`으로 생성한다.
- 기존 로컬 하네스로 설명 가능한 작업이면 새 작업 분야를 만들지 않는다.
- 기존 로컬 하네스로 설명되지 않는 반복 작업만 새 하네스 후보로 본다.

## 세션

Codex, Claude에서 작업을 진행할 때 장기간 작업 맥락 및 흐름, 대화 맥락 및 흐름의 유지를 하기 위해 **세션**이라는 개념을 사용한다.

**세션의 정의가 무엇인지, 각 세션 파일이 어떤 역할을 하는지에 대해서는 `instructions/SESSIONS.md` 파일을 반드시 참고한다.**

작업을 시작할 때 그리고 끝날 때 해당 파일에 있는 규칙대로 세션을 기록한다.

세션 기록 강행 규칙:

- 세션 기록은 권장이 아니라 작업 게이트다.
- 실질적인 탐색, 조사, 구현, 검증을 시작하기 전에는 다음 preflight를 끝낸다.
  - 현재 세션과 세션 디렉터리를 확인한다.
  - `PLANS.md`를 다시 읽고 작업 시작 가능 여부를 판정한다.
  - `TICKETS.md` 상단의 `Original Goal`, `Current Best Next Ticket`, `Why This Advances The Original Goal`, `Deferred But Important`를 확인하거나 보강한다.
  - 현재 턴의 작업을 `TICKETS.md`와 `PROGRESS.md`에 시작 상태로 기록한다.
- `harness-engine`으로 하네스를 생성/보강/감사했다면, 다음 구현 티켓을 열기 전에 세션 validation artifact를 남긴다.
- 사용자가 새 프롬프트를 주거나 `PLANS.md`에 내용을 추가하면, 기존 판정을 재사용하지 않고 `PLANS.md`를 다시 읽어 추가 정보 필요 여부를 재판정한다.
- 작업 중 세션 기록 누락을 발견하면, 본 작업보다 먼저 세션 파일을 보정한다.
- 사용자에게 완료를 보고하기 전에는 다음 postflight를 끝낸다.
  - `TICKETS.md` 상태와 다음 티켓을 갱신한다.
  - `PROGRESS.md`의 `Done`, `In progress`, `Blocked`, `Next`를 갱신한다.
  - 필요 시 `DECISIONS.md`, `RESEARCH.md`를 반영한다.
- 종료 기록이 비어 있으면 완료, 해결, 끝남처럼 작업이 종료된 것처럼 보고하지 않는다.

## 실패 대응 원칙

**Codex, Claude가 특정 작업에 실패했을 때 다음과 같은 상황을 방지하기 위함입니다.**

- 사용자가 제시한 요구사항을 무시하고 사용자에게는 작업이 끝났다고 보고하는 상황
- 문제의 원인을 정확히 파악하지 않고 문제를 덮어쓰는 방식으로 개발해서 기술 부채 유발

**문제를 해결하지 못했다고 해서 문제를 숨기거나 회피하는 방식으로 작업을 완료 처리하는 대신 `instructions/FAILURE.md` 파일을 참고한다.**

## 레포지터리 추가 지침

- `instructions/REPOSITORY.md` 파일이 없으면 지나친다.
- `instructions/REPOSITORY.md` 파일이 있으면 반드시 내용을 파악한다.
  - **해당 파일은 각 레포지터리마다 추가적으로 세팅하는 지침이기 때문에 각 레포지터리마다 추가된 지시사항을 반드시 파악하고 작업에 반영한다.**

## 주석

- 코드 추가 또는 수정 시 처음 보는 사람이 코드의 동작과 설계 의도를 이해할 수 있도록 필요한 주석을 유지한다.
- 주석은 코드의 동작 설명뿐 아니라 설계 의도, 제약 조건, 입력 가정 등 유지보수에 필요한 정보를 제공해야 한다.

**주석에 대한 상세 지침은 `instructions/COMMENTS.md` 파일을 참고한다.**

## 이식성과 환류

- 여러 프로젝트로 복사해서 쓰는 하네스는 `portable core`, `project adapter`, `local evidence pack`을 분리해 관리한다.
- 프로젝트마다 달라지는 경로, 검증 명령, 예시, 과거 증빙은 코어 규칙으로 승격하지 않는다.
- 다른 프로젝트에서 발견한 문제나 요구사항을 이 저장소로 되돌릴 때는 source-side 메타 문서인 `instructions/harness/PORTABILITY.md`의 change request packet 형식을 따른다.

## 하네스 문제 자동 보고

- 실제 프로젝트에서 작업 중 하네스 계층(`AGENTS.md`, `instructions/*`, `harness-engine`, 세션 규칙)에 문제가 발생하면, 에이전트는 먼저 구조화 리포트를 작성한다.
- 기본 템플릿은 `instructions/templates/HARNESS-ISSUE-REPORT-TEMPLATE.md`를 사용한다.
- 기본 저장 경로는 `store/<session_id>/temps/harness-issues/`다. 세션 디렉터리가 없는 프로젝트에서는 `temps/harness-issues/`를 사용한다.
- 보고서에는 최소한 사용자 목표, 읽은 규칙 파일, 실제 실패 동작, 기대 동작, 재현 절차, 로컬 제약, 일반화 후보를 포함한다.
- 보고서 작성 없이 코어 하네스 문제를 구두 설명만 남기고 종료하지 않는다.

<!-- HARNESS-SYNC-CORE-END -->
<!-- HARNESS-SYNC-PROJECT-START -->

## 프로젝트 로컬 하네스

이 저장소에 있는 아래 하네스는 repo-local 상세 하네스다. portable core가 아니며, 다른 프로젝트의 기본 복사 범위로 가정하지 않는다.

- `instructions/frontend/*`
- `instructions/research/*`
- `instructions/learning-mode/*`
- `instructions/source-analysis/*`
- `instructions/operator-stack/*`
