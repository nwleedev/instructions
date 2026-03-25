# 학습 모드 하네스 ARCHITECTURE

## 목표

이 하네스는 Codex가 긴 세션에서도 학습 맥락을 유지하면서, 학습자의 현재 수준에 맞는 안내와 적용 과제를 제공하도록 구조를 고정한다.

## 패키징 원칙

`learning-mode`는 아래 3층으로 나눌 때 가장 안정적으로 이식된다.

1. Portable Core
   - 학습 루프, 금지 패턴, 고위험 경계, 일반 검증 규칙처럼 프로젝트와 무관한 부분
2. Project Adapter
   - 목표/진행/근거/결정 문서의 위치, 로컬 검증 명령, discovery 연결 방식, 도구 제약
3. Local Evidence Pack
   - 드라이런, 샘플 산출물, 런타임 검증, 재개 검증 같은 저장소 전용 증빙

규칙:

- 코어는 가능한 한 작고 안정적으로 유지한다.
- 프로젝트별 차이는 adapter에서만 처리한다.
- evidence pack은 성능 회귀를 막는 참고자료이지 코어의 필수 부분이 아니다.

## 핵심 판단

- 이 작업은 기존 `instructions/research`만으로는 충분하지 않다.
- 이유는 조사 하네스가 `질문 -> 근거 -> 결론` 중심이라면, 학습 모드 하네스는 `진단 -> 단계적 설명 -> 이해도 점검 -> 적용 -> 회고`라는 별도 루프를 반복해야 하기 때문이다.
- 따라서 `learning-mode`는 대표 분류 집합의 예외적 새 `task_type`로 두되, 조사 하네스를 하위 보조 계층으로 재사용한다.

## 구성 요소

### 1. Intake Layer

- 학습 목표를 `무엇을 이해해야 하는가`와 `무엇을 실제로 할 수 있어야 하는가`로 분리한다.
- 학습 대상자의 현재 수준을 아래 축으로 파악한다.
  - 선행지식
  - 용어 이해
  - 실무 적용 경험
  - 시간 제약
  - 산출물 기대치
- 주제를 아래 중 하나 이상으로 분류한다.
  - 개념 이해 중심
  - 설계 판단 중심
  - 구현 준비 중심
  - 비교/조사 중심
  - 프로젝트 적용 중심

### 2. Diagnosis Layer

- 설명 전에 현재 오개념, 비어 있는 전제지식, 과도한 자신감 또는 과소평가를 점검한다.
- 진단 질문은 3~7개 범위로 좁히고, 학습 결과를 실질적으로 바꾸는 질문만 남긴다.
- 학습자를 불필요하게 시험하지 않고, 다음 설명의 난이도를 정하기 위한 정보만 수집한다.

권장 진단 질문 유형:
- 이 주제를 왜 지금 배우려 하는가
- 지금 알고 있다고 생각하는 것은 무엇인가
- 설명 없이 직접 해보라고 하면 어디서 막히는가
- 최종적으로 어떤 산출물을 만들 수 있어야 하는가

대표 예시:
- [DRY_RUN.md](../evidence/DRY_RUN.md)
- [BEGINNER_PROFILE_DRY_RUN.md](../evidence/BEGINNER_PROFILE_DRY_RUN.md)

### 3. Guided Learning Layer

- ChatGPT Study Mode의 공식 설명처럼 질문 기반, 단계적 분해, 이해도 점검을 기본으로 사용한다.
- 한 루프는 아래 5단계로 고정한다.
  1. 현재 목표 재확인
  2. 작은 단위 설명
  3. 이해도 점검 질문
  4. 짧은 적용 과제
  5. 다음 단계 진입 여부 판단
- 한 번에 긴 강의를 제공하지 않는다.
- 이해도 점검에서 막히면 같은 설명을 반복하지 말고 예시, 비유, 반례, 더 작은 문제로 다시 진입한다.

대표 예시:
- [SECOND_SUBJECT_DRY_RUN.md](../evidence/SECOND_SUBJECT_DRY_RUN.md)
- [HIGH_RISK_CONCEPT_DRY_RUN.md](../evidence/HIGH_RISK_CONCEPT_DRY_RUN.md)

### 4. Evidence and Materials Layer

- 근거가 필요한 설명은 공식 문서, 표준, 실제 코드, 1차 자료를 우선 사용한다.
- 사용자가 제공한 PDF, 이미지, 메모, 기존 설계 문서가 있으면 우선 참고 대상으로 삼는다.
- 자료가 없을 때는 학습 하네스가 바로 설명으로 뛰지 말고 먼저 필요한 참고 자료를 제안한다.

대표 예시:
- [THIRD_SUBJECT_DRY_RUN.md](../evidence/THIRD_SUBJECT_DRY_RUN.md)
- [SAMPLE_GHG_RESEARCH.md](../evidence/SAMPLE_GHG_RESEARCH.md)

### 5. Artifact Application Layer

- 학습의 종료 조건을 `설명을 들음`이 아니라 `산출물을 만들 수 있음`으로 둔다.
- 산출물은 주제에 맞게 아래 후보 중 선택한다.
  - 요약 메모
  - 비교표
  - 설계 문서
  - 체크리스트
  - 코드/쿼리/구성 초안
  - 실행 계획
- 산출물은 학습자가 다음 세션 또는 실제 프로젝트에서 재사용 가능해야 한다.

대표 예시:
- [SAMPLE_AGENT_DESIGN.md](../evidence/SAMPLE_AGENT_DESIGN.md)
- [SAMPLE_BEGINNER_STATS_MEMO.md](../evidence/SAMPLE_BEGINNER_STATS_MEMO.md)
- [SAMPLE_INVESTMENT_DECISION_FRAME.md](../evidence/SAMPLE_INVESTMENT_DECISION_FRAME.md)

### 6. Session Persistence Layer

- 긴 세션에서는 각 마일스톤 후 아래를 세션 문서에 남긴다.
  - 현재 학습 목표
  - 확인된 사실과 출처
  - 이해도 점검 결과
  - 완료한 단계와 남은 단계
  - 다음 즉시 실행 항목
- Codex App Server와 Codex CLI는 `thread/resume`, `thread/compact/start`, `codex resume` 같은 재개 흐름을 지원하므로, 하네스도 압축 이후 재시작을 전제해야 한다.
- 압축 전에는 전체 대화를 보존하려 하지 말고, 재개에 필요한 핵심 상태를 문서로 요약한다.

대표 예시:
- [RESUME_VALIDATION.md](../evidence/RESUME_VALIDATION.md)
- [RUNTIME_COMPACTION_VALIDATION.md](../evidence/RUNTIME_COMPACTION_VALIDATION.md)

### 7. Validation Layer

- 검증은 `설명이 자연스럽다`가 아니라 아래 질문으로 본다.
  - 학습자의 출발 수준에 맞는가
  - 설명이 단계적으로 조정되는가
  - 이해도 점검이 실제로 있었는가
  - 산출물이 학습 목표와 연결되는가
  - 세션 압축 후에도 다음 단계가 보이는가

대표 예시:
- [EVIDENCE_INDEX.md](../evidence/EVIDENCE_INDEX.md)

### 8. Portability Layer

- 코어 문서에는 절대경로, 현재 저장소 전용 세션 ID, 특정 샘플 주제 개수를 필수 규칙처럼 두지 않는다.
- 로컬 파일명과 검증 명령은 adapter 문서에서만 연결한다.
- 새 프로젝트로 복사할 때는 코어를 고친 뒤 증빙을 맞추는 방식이 아니라, adapter를 먼저 채우고 local evidence를 새로 생성한다.

대표 예시:
- [PORTABILITY.md](./PORTABILITY.md)
- [EVIDENCE_INDEX.md](../evidence/EVIDENCE_INDEX.md)

## 권장 진행 순서

1. 학습 목표와 산출물 확정
2. 현재 수준과 제약 진단
3. 핵심 하위 질문 분해
4. 질문 기반 단계 학습 루프 수행
5. 중간 적용 과제로 이해도 검증
6. 최종 산출물 작성
7. 회고와 다음 학습 계획 기록

## 연구 하네스와의 관계

- `research`는 근거 수집과 비교 판단을 담당하는 보조 계층이다.
- `learning-mode`는 연구 결과를 학습 단계와 적용 과제로 재배열하는 상위 학습 계층이다.
- 따라서 조사 품질이 중요한 주제에서는 `research`의 Source Fallback Rule과 Validation 규칙을 그대로 참고한다.

## 이식 규칙

- 다른 프로젝트에 붙일 때는 `Portable Core + Project Adapter`를 먼저 배치한다.
- 현재 저장소의 드라이런과 샘플 산출물은 local evidence pack으로만 취급한다.
- 성능 유지가 중요하면 코어 텍스트를 큰 폭으로 다시 쓰지 말고, adapter와 local evidence만 프로젝트에 맞게 교체한다.

## 설계 근거

- Study Mode FAQ는 목표/수준 파악, 소크라테스식 질문, 단계적 설명, 이해도 점검, 업로드 자료 활용을 명시한다.
- 2026-03-10 OpenAI 제품 글은 concept exploration과 exploratory learning을 강조한다.
- Responses Overview는 상태 유지형 상호작용과 도구 확장을 지원하므로, 장기 학습 흐름을 설계하기에 적합하다.
- Codex App Server는 `thread/resume`과 `thread/compact/start`를 제공하므로 세션 재개형 학습 하네스와 잘 맞는다.
- Worked-example/self-explanation 연구는 예시 제공만으로는 부족하고, 학습자의 자기설명과 구조화된 설명이 중요함을 보여준다.

## 설계 근거 링크

- https://help.openai.com/en/articles/11780217-chatgpt-study-mode-faq
- https://help.openai.com/en/articles/6825453-chatgpt-user-guide
- https://openai.com/index/new-ways-to-learn-math-and-science-in-chatgpt/
- https://developers.openai.com/api/reference/responses/overview/
- https://developers.openai.com/codex/app-server/
- https://www.sciencedirect.com/science/article/abs/pii/S0959475201000305
