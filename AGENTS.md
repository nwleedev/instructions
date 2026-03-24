# 지시사항 문서

본 문서는 이 레포지토리에서 Codex가 작업할 때 따라야 할 표준 지시사항을 제공합니다. 사람을 위한 README와 달리, 에이전트가 즉시 실행 가능한 명령·규칙·검증 절차를 중심으로 기술합니다.

Codex는 Codex CLI를 지칭합니다.

**모든 작업에 대해서 공통적으로 적용해야 하는 규칙에 대해서는 `instructions/INDEX.md` 파일을 반드시 따른다.**

Codex를 처음 실행할 때 & 컨텍스트가 압축되었을 때에도 AGENTS.md, `instructions/INDEX.md` 파일을 **반드시** 읽고 어떻게 작업해야 하는지 파악한다.

## 세션

Codex에서 작업을 진행할 때 장기간 작업 맥락 및 흐름, 대화 맥락 및 흐름의 유지를 하기 위해 **세션**이라는 개념을 사용한다.

**세션의 정의가 무엇인지, 각 세션 파일이 어떤 역할을 하는지에 대해서는 `instructions/SESSIONS.md` 파일을 반드시 참고한다.**

작업을 시작할 때 그리고 끝날 때 해당 파일에 있는 규칙대로 세션을 기록한다.

## 실패 대응 원칙

**Codex CLI가 특정 작업에 실패했을 때 다음과 같은 상황을 방지하기 위함입니다.**

- 사용자가 제시한 요구사항을 무시하고 사용자에게는 작업이 끝났다고 보고하는 상황
- 문제의 원인을 정확히 파악하지 않고 문제를 덮어쓰는 방식으로 개발해서 기술 부채 유발

**문제를 해결하지 못했다고 해서 문제를 숨기거나 회피하는 방식으로 작업을 완료 처리하는 대신 `instructions/FAILURE.md` 파일을 참고한다.**

## 레포지터리 추가 지침

- `AGENTS.repository.md` 파일이 없으면 지나친다.
- `AGENTS.repository.md` 파일이 있으면 반드시 내용을 파악한다.
  - **해당 파일은 각 레포지터리마다 추가적으로 세팅하는 지침이기 때문에 각 레포지터리마다 추가된 지시사항을 반드시 파악하고 작업에 반영한다.**

## 프론트엔드

**프론트엔드에 대한 상세 지침은 다음과 같은 파일을 참고한다.**

- **`instructions/frontend/INDEX.md`**
- **`instructions/frontend/ARCHITECTURE.md`**

**금지 패턴과 동일한 구조를 코드 작성 및 코드 수정에 반영하지 않는다.**

- `instructions/frontend/ANTI_PATTERNS.md`

**프론트엔드 테스트에 대한 상세 지침은 다음과 같은 파일을 참고한다.**

- **`instructions/frontend/TESTING.md`**

**금지 패턴에 해당하는 구조를 테스트 코드 작성 및 수정, 그리고 테스트 실행에 반영하지 않는다.**

- `instructions/frontend/TEST_ANTI_PATTERNS.md`

## 자료 조사 하네스

**자료 조사 하네스에 대한 상세 지침은 다음과 같은 파일을 참고한다.**

- **`instructions/research/INDEX.md`**
- **`instructions/research/ARCHITECTURE.md`**

**금지 패턴과 동일한 구조를 조사 수행 및 조사 결과 문서화에 반영하지 않는다.**

- `instructions/research/ANTI_PATTERNS.md`

**자료 조사 결과의 완료 기준과 검증 기준은 다음 파일을 참고한다.**

- **`instructions/research/VALIDATION.md`**

**조사 계획과 조사 기록 템플릿은 다음 파일을 참고한다.**

- `instructions/research/templates/PLANS-RESEARCH-TEMPLATE.md`
- `instructions/research/templates/RESEARCH-ENTRY-TEMPLATE.md`
- `instructions/research/templates/CLAIM-MAP-TEMPLATE.md`

## 주석

- 코드 추가 또는 수정 시 처음 보는 사람이 코드의 동작과 설계 의도를 이해할 수 있도록 필요한 주석을 유지한다.
- 주석은 코드의 동작 설명뿐 아니라 설계 의도, 제약 조건, 입력 가정 등 유지보수에 필요한 정보를 제공해야 한다.

**주석에 대한 상세 지침은 `instructions/COMMENTS.md` 파일을 참고한다.**
