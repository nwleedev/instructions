# Output Contract

## 목적

`harness-engine` 작업의 최종 산출물과 임시 산출물을 분리하고, `instructions/<task_type>` 아래에 어떤 문서를 남겨야 하는지 정의한다.

## 경로 규칙

- 최종 산출물: `instructions/<task_type>/*.md`
- 임시 메모: `store/<session_id>/temps/*`
- 스킬 자체 보강 지침: `.claude/skills/harness-engine/**`
- 새 `task_type` 생성 시 discovery용 루트 진입점으로 `AGENTS.md`와 `instructions/INDEX.md`를 함께 갱신

## discovery 등록 형식

- `AGENTS.md` 등록 시 현재 문서가 사용하는 섹션형 서술 포맷을 따른다.
- 새 하네스가 기존 큰 범주에 자연스럽게 들어가면 해당 범주 아래 참고 문서 목록에 추가한다.
- 기존 큰 범주로 설명되지 않으면 현재 `AGENTS.md`와 같은 톤의 새 섹션을 추가한다.
- `instructions/INDEX.md`에는 공통 규칙 진입점 성격을 해치지 않는 짧은 안내 또는 링크만 추가한다.

## 최종 산출물 기본 묶음

새 하네스를 만들 때 기본 후보는 아래와 같다.

- `INDEX.md`
- `ARCHITECTURE.md`
- `ANTI_PATTERNS.md`
- `VALIDATION.md`

필요할 때만 추가:

- `templates/*.md`
- 테스트 전용 문서
- 도메인별 세부 문서

## 각 문서의 역할

- `INDEX.md`
  - 목적, 적용 대상, 시작 전 확인, 문서 안내, 참고 출처
- `ARCHITECTURE.md`
  - 작업 흐름, 계층, 역할 분리, 세션/도구 사용 방식, 설계 근거
- `ANTI_PATTERNS.md`
  - 피해야 할 구현/조사/운영 패턴과 차단 규칙, 근거 출처
- `VALIDATION.md`
  - 완료 기준, 드라이런, 검증 체크리스트, 검증 근거

## 최소 섹션 계약

최종 문서 묶음에는 아래 정보가 드러나야 한다.

- 무엇을 위한 하네스인가
- 언제 적용하는가
- 어떤 절차로 진행하는가
- 무엇을 금지하는가
- 무엇을 보면 완료라고 판단하는가
- 세션 재개 시 무엇을 읽으면 되는가
- 출처와 설계 근거가 어디에 있는가

## Anti/Good 쌍 완성도 규칙

- 어댑터가 정의한 Anti/Good 필수 쌍 목록의 모든 케이스에 대해, ANTI_PATTERNS.md에 Anti와 Good이 **반드시 쌍으로** 존재해야 한다.
- 한쪽(Anti만 또는 Good만)만 있으면 산출물이 불완전한 것으로 판정한다.
- 어댑터 필수 쌍 외에 프로젝트 고유 쌍을 추가할 수 있다.
- 각 쌍에는 케이스명을 명시하여 Anti와 Good의 대응 관계가 명확해야 한다.

출처: OpenAI GPT-5 Prompting Guide (XML-Tagged Instruction Blocks) + Addyosmani 3-Tier Boundary System

## 예시 코드 규칙

- 예시 코드는 Markdown 코드 블록으로 제시한다.
- 소스 코드 파일을 예시 용도로 직접 생성하지 않는다.
- 예시가 특정 프레임워크나 도구에 묶이면, 그 전제 조건을 함께 적는다.

## 어댑터 연동 규칙

- 하네스 생성 시 해당 도메인 어댑터의 Coverage Contract 필수 축이 모두 산출물에 반영되어야 한다.
- 어댑터가 정의한 1차 근거 소스를 산출물의 출처 체계에 반영한다.
- 어댑터 없이 하네스를 생성한 경우, 하네스 완성 후 어댑터 파일도 함께 생성하여 재사용 가능하게 한다.

## 서브에이전트 산출물 규칙

- 하네스 생성 서브에이전트는 `instructions/<task_type>/*.md` 파일만 생성/수정한다.
- 세션 파일(TICKETS.md, PROGRESS.md, DECISIONS.md)은 서브에이전트가 갱신하지 않는다 (본 에이전트 책임).
- AGENTS.md, instructions/INDEX.md는 서브에이전트가 갱신하지 않는다 (본 에이전트 책임).
- worktree 격리 사용 시, 산출물은 worktree 내 `instructions/<task_type>/` 경로에 생성된다.
- 서브에이전트는 완료 시 생성/수정 파일 목록, Coverage 충족 상태, Anti/Good 쌍 충족 상태, 미충족 항목을 보고한다.
