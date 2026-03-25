# 세 번째 주제 드라이런 요약

## 드라이런 목적

`instructions/learning-mode` 하네스가 조사 의존성이 큰 비IT 주제에서도 작동하는지 확인한다. 이번 주제는 `기업/기관의 온실가스 배출에서 Scope 1/2/3를 구분하고 해석하는 법`이며, `research` 하네스를 먼저 병행해야 하는 사례로 설정한다.

검증 대상은 아래 흐름이다.

- 조사 질문 정의
- 공식 기준 비교
- 단계적 설명
- 이해도 점검
- 최종 산출물 적용

## 가정한 학습자 프로필

- 지속가능성 보고서나 ESG 기사 정도는 읽어봤다.
- `Scope 1`, `Scope 2`, `Scope 3`라는 말을 들어봤지만 경계 설정 기준은 모른다.
- 최종적으로는 기관 수준의 온실가스 인벤토리 킥오프 메모를 읽고 어떤 항목이 어느 스코프에 들어가는지 설명할 수 있어야 한다.

## `research` 병행 여부와 이유

- 병행 여부:
  - 필요
- 이유:
  - GHG Protocol Corporate Standard, Scope 2 Guidance, Scope 3 Standard, EPA guidance를 함께 읽어야 한다.
  - 현재 기준으로 GHG Protocol 개정 프로세스가 진행 중이므로, 현재 유효 기준과 향후 변경 가능성을 분리해야 한다.
  - 단순 개념 설명 전에 `현재 표준`, `운영상 경계`, `개정 중인 부분`을 조사로 먼저 닫아야 오학습을 줄일 수 있다.

## 드라이런 결과

### 1. 진단

- 학습자의 강점:
  - 지속가능성 관련 용어를 전혀 처음 듣는 상태는 아니다.
  - 배출을 직접/간접으로 나눠야 한다는 직관은 있다.
- 학습자의 약점:
  - 조직 경계와 운영 경계를 구분하지 못한다.
  - 구매 전기와 통근을 모두 `간접 배출`로 묶고, Scope 2와 Scope 3의 차이를 흐린다.
  - 개정 중인 문서를 현재 확정 기준처럼 읽을 위험이 있다.

### 2. 단계 학습

- Step 1: 경계부터 정리했다.
  - EPA와 GHG Protocol Corporate Standard를 기준으로 `조직 경계`와 `운영 경계`를 먼저 분리했다.
  - 스코프 분류는 숫자 암기가 아니라 경계 설정의 결과라는 점을 확인했다.
- Step 2: Scope 1/2/3를 역할별로 분리했다.
  - Scope 1은 조직이 소유/통제하는 직접 배출, Scope 2는 구매한 전기·열·증기·냉방, Scope 3은 나머지 가치사슬 배출이라는 구조로 설명했다.
  - EPA와 GHG Protocol Scope 3 Standard를 함께 사용해 통근, 출장, 구매재, 폐기물 같은 예시를 재분류하게 했다.
- Step 3: 현재 표준과 개정 진행 상황을 분리했다.
  - GHG Protocol의 2025-10-20 공지와 2026-02 공개 consultation summary, 2025-12 Corporate Standard progress update를 근거로, 현재 공개 표준이 기준이되 개정이 진행 중이라는 점을 설명했다.
  - 학습자가 draft나 consultation 문구를 곧바로 내부 운영 기준으로 확정하지 않도록 조정했다.

### 3. 이해도 점검

- 개방형 질문 1:
  - 왜 `직접/간접`만으로는 Scope 2와 Scope 3를 구분할 수 없는가
- 개방형 질문 2:
  - 왜 직원 통근은 보통 Scope 3인데 구매 전기는 Scope 2인가
- 개방형 질문 3:
  - 개정 진행 문서가 있어도 현재 운영 메모는 왜 공개된 현행 표준 기준으로 써야 하는가

이 질문들에 답하도록 유도하면서, 학습자가 `스코프 정의`, `경계 설정`, `현재 기준`, `향후 변경 가능성`을 섞지 않도록 조정했다.

## 생성된 산출물

- [SAMPLE_GHG_RESEARCH.md](./SAMPLE_GHG_RESEARCH.md)
- [SAMPLE_GHG_SCOPE_MEMO.md](./SAMPLE_GHG_SCOPE_MEMO.md)
- [SAMPLE_GHG_LEARNING_LOG.md](./SAMPLE_GHG_LEARNING_LOG.md)

## 검증 판정

- 조사 하네스 병행 필요성 설명됨: 통과
- 진단 기록 있음: 통과
- 질문 기반 단계 학습 3회 이상 있음: 통과
- 개방형 이해도 점검 2회 이상 있음: 통과
- 공식 기준과 최신 개정 상태 구분: 통과
- 최종 산출물 존재: 통과

## 남은 한계

- 이 드라이런은 교육용 경계 해석 메모이며, 실제 규제 공시나 제3자 검증을 위한 완전한 회계 지침은 아니다.
- 조직별 경계 선택, 리스 자산 처리, 프로그램별 추가 요구사항은 별도 판단이 필요하다.

## 사용 근거

- GHG Protocol Corporate Standard: https://ghgprotocol.org/corporate-standard
- GHG Protocol Scope 3 Standard: https://ghgprotocol.org/standards/scope-3-standard
- GHG Protocol Scope 2 Guidance: https://ghgprotocol.org/scope_2_guidance
- GHG Protocol Public Consultations: https://ghgprotocol.org/ghg-protocol-public-consultations
- Corporate Standard Phase 1 Progress Update, December 2025: https://ghgprotocol.org/corporate-standard-phase-1-progress-update
- EPA Scopes 1 and 2 Emissions Inventorying and Guidance: https://www.epa.gov/climateleadership/scopes-1-2-and-3-emissions-inventorying-and-guidance
- EPA Determine Organizational Boundaries: https://www.epa.gov/climateleadership/determine-organizational-boundaries
