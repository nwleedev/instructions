# 샘플 GHG 기준 조사 메모

## 조사 질문

- Scope 1, Scope 2, Scope 3를 구분할 때 무엇을 먼저 결정해야 하는가
- 대학 같은 기관의 보일러, 구매 전기, 직원 통근, 출장, 구매 장비는 일반적으로 어느 스코프에 들어가는가
- 2026-03-25 현재 어떤 기준을 현행 운영 기준으로 읽어야 하는가

## Evidence Notes

### 1. 경계 설정이 먼저다

- GHG Protocol Corporate Standard와 EPA organizational boundaries guidance는 먼저 어떤 엔터티와 자산을 인벤토리에 포함할지 정해야 한다고 본다.
- 따라서 스코프 분류는 단순한 배출 종류 표가 아니라 경계 설정 이후의 단계다.

### 2. Scope 1과 Scope 2의 기본 구분

- EPA guidance는 Scope 1을 조직이 소유 또는 통제하는 직접 배출로 설명한다.
- EPA와 GHG Protocol은 Scope 2를 구매하거나 획득한 전기, 증기, 열, 냉방에서 발생하는 간접 배출로 설명한다.

### 3. Scope 3는 가치사슬 전반의 기타 간접 배출이다

- GHG Protocol Scope 3 Standard는 Scope 2에 들어가지 않는 기타 간접 배출을 가치사슬 기준으로 다룬다.
- 직원 통근, 출장, 구매재, 폐기물, 운송 같은 항목은 일반적으로 Scope 3 예시에 속한다.

### 4. 현재 기준과 개정 진행 상황을 분리해야 한다

- GHG Protocol은 2025-10-20부터 Scope 2 개정 public consultation을 열었고, 2026-02 공개 summary에서 consultation 종료와 후속 revision 작업 진행을 알렸다.
- Corporate Standard도 2025-12 progress update가 공개됐지만, 이 문서는 informational purpose이며 초안이 최종 기준이 아니라고 명시한다.

## Working Interpretation

- 교육용 또는 내부 학습용 메모는 현재 공개된 Corporate Standard, Scope 2 Guidance, Scope 3 Standard를 현행 기준으로 삼는 편이 안전하다.
- 다만 Scope 2와 Corporate Standard는 개정 프로세스가 진행 중이므로 `향후 변경 가능성 있음`을 한 줄 남겨야 한다.
- 이 주제는 학습 전에 조사 하네스를 병행하는 편이 좋다. 이유는 스코프 정의 자체보다 `경계`, `적용 예시`, `현행 기준과 개정 중 문서의 차이`를 먼저 닫아야 하기 때문이다.

## Decision Candidate

- `learning-mode` 단독:
  - 부적합
  - 이유: 기준 충돌과 최신 개정 상태를 먼저 정리하지 않으면 잘못된 설명이 굳을 수 있다.
- `research` + `learning-mode` 병행:
  - 적합
  - 이유: 공식 기준 비교와 최신성 확인을 먼저 수행한 뒤, 학습 루프로 재구성할 수 있다.

## Sources

- https://ghgprotocol.org/corporate-standard
- https://ghgprotocol.org/standards/scope-3-standard
- https://ghgprotocol.org/scope_2_guidance
- https://ghgprotocol.org/ghg-protocol-public-consultations
- https://ghgprotocol.org/corporate-standard-phase-1-progress-update
- https://www.epa.gov/climateleadership/scopes-1-2-and-3-emissions-inventorying-and-guidance
- https://www.epa.gov/climateleadership/determine-organizational-boundaries
