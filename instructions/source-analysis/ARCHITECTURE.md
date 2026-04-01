# 소스 분석 하네스 ARCHITECTURE

## 목표

이 하네스는 `입력 소스 확정 -> 파일 전수 순회 -> 심볼 추출 -> 표현식 추출 -> 서브시스템 요약 -> 공개 표면 비교 -> claim overlay -> validation` 흐름을 끊기지 않게 유지하기 위한 구조다.

## 계층

### 1. Intake Layer

- 분석 대상 루트와 비교 대상 루트를 고정한다.
- “무엇을 밝히려는가”보다 먼저 “무엇을 전부 읽어야 하는가”를 닫는다.
- 목표는 두 층으로 나눈다.
  - exhaustive catalog
  - 사람이 읽는 해설과 판정

### 2. Inventory Layer

- 모든 파일을 경로 기준으로 순회한다.
- 각 파일마다 아래를 수집한다.
  - 상대 경로
  - 서브시스템
  - 파일 역할
  - import/export 요약
  - 라인 수와 기초 메타데이터
  - 직원 전용, 내부 인프라, 공개 표면 관련 신호
- 이 단계는 “파일이 존재했다”는 ledger의 기초다.
- 이 계층의 파일 설명은 먼저 쉬운 한국어로, 그 다음 기술 설명으로 쓴다.

### 3. Symbol Layer

- 선언 심볼을 파일별로 추출한다.
- 심볼 종류는 함수, 클래스, 메서드, 타입, 인터페이스, enum, 상수, hook, command entry, 지역 헬퍼, 중첩 함수, 콜백 등으로 분류한다.
- 심볼 설명은 코드 구조와 인접 문맥에서 직접 관찰 가능한 범위로 제한한다.
- 메서드나 내부 함수가 많아도 카탈로그에서 생략하지 않는다. 다만 해설 강도는 서브시스템 중요도에 따라 달리할 수 있다.

### 4. Expression Layer

- 파일 내부의 핵심 AST 노드를 순서대로 설명한다.
- 최소 대상은 호출식, 조건식, 분기문, 루프, 할당/초기화, 객체/배열 조립, return 식, async/await, try/catch/finally, JSX 트리다.
- 지나치게 사소한 하위 식은 부모 노드 아래 `expression cluster`로 묶되, 존재 자체를 지우지 않는다.
- 각 노드에는 아래를 남긴다.
  - 원문 코드
  - 쉬운 설명
  - 기술 설명
  - 상위 문맥
  - 부작용
  - 관련 신호

### 5. Subsystem Layer

- top-level 디렉터리 또는 도메인 묶음별로 책임을 요약한다.
- 서브시스템 문서는 다음 질문에 답해야 한다.
  - 어디가 진입점인가
  - 어떤 서비스/도구/컴포넌트가 중심인가
  - 어떤 흐름이 다른 서브시스템으로 이어지는가
  - 내부 전용 신호가 집중되는 곳은 어디인가

### 6. Surface Diff Layer

- 원본 소스와 공개 배포물의 차이를 분리한다.
- 대응 관계는 세 가지로 나눈다.
  - 공개 배포물에서 직접 대응됨
  - 번들 안에 문자열/코드 흔적은 있으나 직접 파일 대응은 약함
  - 원본 소스에서만 관찰됨
- 이 차이는 내부 기능 판정이 아니라 “표면 노출 강도” 판정용이다.

### 7. Claim Overlay Layer

- 기존 조사 문서나 주장 문서를 전수 분석 결과에 매핑한다.
- claim overlay는 사실 요약이 아니라 “이 claim이 어느 파일/심볼/번들 차이에 의해 지지되는가”를 연결하는 층이다.
- 공개 근거가 없는 고영향 결론은 overlay만으로 확정하지 않는다.

### 8. Validation Layer

- 실제 파일 수와 카탈로그 수를 대조한다.
- 심볼 0개 파일도 누락이 아니라 명시적 결과인지 확인한다.
- 표현식 0개 파일도 누락이 아니라 명시적 결과인지 확인한다.
- 핵심 파일 몇 개를 골라 사람이 직접 선언 수와 카탈로그 수를 비교한다.
- 세션 validation artifact를 남겨 다음 구현 티켓의 입력으로 쓴다.

## 데이터 모델 원칙

### 파일 엔트리

- `path`
- `subsystem`
- `file_role`
- `plain_summary`
- `technical_summary`
- `imports_summary`
- `exports_summary`
- `symbol_count`
- `expression_node_count`
- `npm_parity`
- `employee_only_signals`
- `internal_infra_signals`
- `notes`

### 심볼 엔트리

- `path`
- `symbol_name`
- `symbol_kind`
- `signature_or_decl`
- `role`
- `dependencies`
- `side_effects`
- `employee_only_relevance`
- `public_surface_relevance`

### 표현식 엔트리

- `path`
- `node_kind`
- `source_span`
- `source_text`
- `plain_explanation`
- `technical_explanation`
- `parent_context`
- `side_effects`
- `related_signals`

## 규모 제어 방식

- 한 문서에 모든 내용을 넣지 않는다.
- 전체 개요는 루트 문서에 두고, exhaustive한 세부 내용은 shard로 쪼갠다.
- shard 기준은 보통 top-level subsystem이다.
- 사람이 읽는 요약과 exhaustive한 ledger를 섞지 않는다.
- 초대형 파일은 `deep-dives/`와 `batches/` 문서로 보조해 재개 가능성을 높인다.

## 해석 안전장치

- 문자열 존재만으로 런타임 동작을 단정하지 않는다.
- 공개 번들에 없다고 해서 dead code였다고 단정하지 않는다.
- 내부 신호가 있다고 해서 곧바로 직원 전용 기능 또는 정책 차별로 결론 내리지 않는다.
- 반대로 일부 공개 문서가 있다고 해서 내부 확장층이 없다고 단정하지 않는다.

## 세션 지속성

- 분석 중간 산출물은 세션 경로 `temps/`에 둔다.
- 긴 작업에서는 coverage ledger가 먼저 존재해야 한다.
- 이후 단계는 ledger를 바탕으로 언제든 재개 가능해야 한다.
- 가능하면 `manifest.json`과 `coverage.json`을 함께 생성해 배치 재시작과 품질 검증 근거로 쓴다.
