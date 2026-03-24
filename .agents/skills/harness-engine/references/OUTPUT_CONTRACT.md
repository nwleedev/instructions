# Output Contract

## 목적

`harness-engine` 작업의 최종 산출물과 임시 산출물을 분리하고, `instructions/<task_type>` 아래에 어떤 문서를 남겨야 하는지 정의한다.

## 경로 규칙

- 최종 산출물: `instructions/<task_type>/*.md`
- 임시 메모: `store/<session_id>/temps/*`
- 스킬 자체 보강 지침: `.agents/skills/harness-engine/**`

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
  - 목적, 적용 대상, 시작 전 확인, 문서 안내
- `ARCHITECTURE.md`
  - 작업 흐름, 계층, 역할 분리, 세션/도구 사용 방식
- `ANTI_PATTERNS.md`
  - 피해야 할 구현/조사/운영 패턴과 차단 규칙
- `VALIDATION.md`
  - 완료 기준, 드라이런, 검증 체크리스트

## 최소 섹션 계약

최종 문서 묶음에는 아래 정보가 드러나야 한다.

- 무엇을 위한 하네스인가
- 언제 적용하는가
- 어떤 절차로 진행하는가
- 무엇을 금지하는가
- 무엇을 보면 완료라고 판단하는가
- 세션 재개 시 무엇을 읽으면 되는가

## 예시 코드 규칙

- 예시 코드는 Markdown 코드 블록으로 제시한다.
- 소스 코드 파일을 예시 용도로 직접 생성하지 않는다.
- 예시가 특정 프레임워크나 도구에 묶이면, 그 전제 조건을 함께 적는다.
