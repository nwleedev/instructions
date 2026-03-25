# 학습 모드 세션 재개 검증

이 문서는 `portable core`의 필수 규칙 문서가 아니라 현재 저장소의 `local evidence pack`에 속한 재개 검증 기록이다.

새 프로젝트에서는 아래 예시 파일명을 그대로 따르기보다, 같은 역할을 담당하는 로컬 문서 집합이 있는지 adapter에서 선언하고 그 기준으로 다시 검증한다.

## 목적

`learning-mode` 하네스의 핵심 주장 중 하나는 긴 세션이나 컨텍스트 압축 이후에도 학습 흐름을 다시 이어갈 수 있다는 점이다. 이 문서는 실제 세션 재개 시 어떤 문서만 있으면 되는지, 그 문서들로 바로 다음 학습 행동을 복원할 수 있는지 검증한 결과를 기록한다.

## 검증 시나리오

- 주제:
  - `가설검정과 실험 해석`
- 재개 시점 가정:
  - 학습자가 `p-value`와 `신뢰구간` 해석을 한 차례 교정한 뒤 세션이 압축되었고, 다음 세션에서 같은 주제를 이어가야 한다.
- 기대 결과:
  - 현재 목표, 오개념, 사용 근거, 산출물 상태, 다음 즉시 실행 단계가 복원되어야 한다.

## 사용한 최소 재개 문서 집합

현재 저장소에서는 아래 역할 조합으로 재개를 검증했다.

- 목표와 범위 문서:
  - `store/<session_id>/PLANS.md`
- 현재 해야 할 일 문서:
  - `store/<session_id>/TICKETS.md`
- 시간순 진행 로그:
  - `store/<session_id>/PROGRESS.md`
- 핵심 근거 기록:
  - `store/<session_id>/RESEARCH.md`
- 주제별 학습 로그:
  - [SAMPLE_STATS_LEARNING_LOG.md](./SAMPLE_STATS_LEARNING_LOG.md)
- 주제별 산출물:
  - [SAMPLE_STATS_INTERPRETATION.md](./SAMPLE_STATS_INTERPRETATION.md)
- 재사용 판정 규칙:
  - [GENERALIZATION_CHECKLIST.md](../core/GENERALIZATION_CHECKLIST.md)

새 프로젝트에서는 위 파일명 자체가 아니라, 이 역할을 담당하는 로컬 문서가 있으면 된다.

## 재개 시 확인한 질문과 결과

### 1. 현재 학습 목표와 최종 산출물은 복원되는가

- 결과:
  - 통과
- 근거:
  - `SAMPLE_STATS_LEARNING_LOG.md`의 `Session Goal`에 목표와 산출물이 모두 기록돼 있다.
  - `PLANS.md`와 `PROGRESS.md`가 이 작업이 `learning-mode` 범용 검증의 일부라는 큰 맥락을 보존한다.

### 2. 마지막 오개념과 막힘 지점을 복원할 수 있는가

- 결과:
  - 통과
- 근거:
  - 학습 로그의 `Diagnosis`와 `Step Log`에 `p-value` 오해, 신뢰구간 오해, 유의성과 중요성 혼동이 남아 있다.
  - 따라서 재개 직후 무엇을 다시 설명해야 하는지 추론 가능하다.

### 3. 사용한 핵심 근거를 복원할 수 있는가

- 결과:
  - 통과
- 근거:
  - `RESEARCH.md`에 NIST와 ASA 공식 근거가 정리되어 있다.
  - 최종 산출물 문서에도 같은 출처가 직접 포함되어 있어 추적이 쉽다.

### 4. 산출물 진행 상태를 복원할 수 있는가

- 결과:
  - 통과
- 근거:
  - 학습 로그의 `Artifact Progress`에 현재 초안과 부족한 항목이 기록돼 있다.
  - `SAMPLE_STATS_INTERPRETATION.md`를 바로 열어 현재 완성도를 확인할 수 있다.

### 5. 다음 즉시 실행 단계를 복원할 수 있는가

- 결과:
  - 통과
- 근거:
  - 학습 로그의 `Next`에 다음 질문과 즉시 실행 작업이 분리되어 있다.
  - `PROGRESS.md`도 현재 활성 티켓과 다음 작업을 별도로 보여준다.

## 판정

- 현재 문서 구조만으로도 주제 수준의 재개는 가능하다.
- 특히 `학습 로그 + RESEARCH + PROGRESS` 조합이 재개 핵심이다.
- `PLANS.md`와 `TICKETS.md`는 주제 단위 세부 상태보다 세션 전체 맥락을 고정하는 역할이 강하다.

## 확인된 운영 규칙

- 샘플이나 실제 학습 로그에는 반드시 아래 5개가 남아 있어야 한다.
  - 현재 목표
  - 마지막 오개념 또는 막힘
  - 핵심 근거
  - 산출물 진행 상태
  - 다음 즉시 실행 단계
- 최종 산출물 문서에도 핵심 출처를 직접 남겨야 재개 시 왕복 비용이 줄어든다.
- 세션 전체 맥락은 `PROGRESS.md`와 `TICKETS.md`가, 주제별 재개는 학습 로그가 책임지는 구조가 가장 안정적이다.

## 남은 한계

- 이번 검증은 문서 기반 재개 판정이며, 실제 `thread/compact/start` 이후 대화 품질까지 직접 측정한 것은 아니다.
- 한 주제의 재개 시나리오만 검증했으므로, 다른 유형의 주제에서도 같은 구조가 유지되는지 후속 확인이 필요하다.

## 사용 근거

- ChatGPT Study Mode FAQ: https://help.openai.com/en/articles/11780217-chatgpt-study-mode-faq
- OpenAI Responses Overview: https://developers.openai.com/api/reference/responses/overview/
- OpenAI Codex App Server API overview: https://developers.openai.com/codex/app-server/
