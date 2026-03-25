# 두 번째 주제 드라이런 요약

## 드라이런 목적

`instructions/learning-mode` 하네스가 개발/IT 인접 주제가 아닌 `가설검정과 실험 해석`에도 같은 학습 루프를 유지하는지 확인한다.

검증 대상은 아래 흐름이다.

- 목표와 수준 진단
- 단계적 설명
- 이해도 점검
- 공식 자료 활용
- 최종 산출물 적용

## 가정한 학습자 프로필

- 실무에서 보고서나 실험 결과 요약은 읽어봤지만, 통계 용어를 정확히 구분하지는 못한다.
- `p-value`, `신뢰구간`, `통계적으로 유의하다`를 자주 보지만 뜻을 혼동한다.
- 최종적으로는 실험 결과 메모를 읽고 `무엇을 알 수 있고 무엇은 아직 단정할 수 없는지`를 스스로 설명할 수 있어야 한다.

## 드라이런 결과

### 1. 진단

- 학습자의 강점:
  - 숫자와 비율 비교 자체는 읽을 수 있다.
  - 실험 결과를 의사결정에 써야 한다는 필요성은 이해한다.
- 학습자의 약점:
  - `p-value`를 `귀무가설이 맞을 확률`로 오해한다.
  - `통계적으로 유의`하면 효과가 크고 실무적으로도 중요하다고 섞어서 해석한다.
  - 신뢰구간을 `참값이 들어 있을 확률`처럼 말한다.

### 2. 단계 학습

- Step 1: 질문을 먼저 구조화했다.
  - 어떤 주장에 답하려는 실험인지, 귀무가설과 대립가설이 무엇인지 먼저 분리했다.
  - 실험 해석은 숫자를 읽는 일이 아니라 `어떤 질문에 어떤 증거로 답하는가`를 정리하는 일임을 확인했다.
- Step 2: `가설검정`과 `신뢰구간`의 역할을 연결했다.
  - NIST Handbook을 근거로, 가설검정과 신뢰구간이 같은 추론 문제를 다른 형식으로 표현한다는 점을 설명했다.
  - 학습자가 `유의성 여부만 보는 습관`에서 벗어나 효과 범위와 불확실성을 함께 보도록 조정했다.
- Step 3: `p-value` 오해를 교정했다.
  - ASA statement를 근거로 `p-value`는 데이터와 모델의 비합치 정도를 보는 지표이지, 가설의 참/거짓 확률이나 효과 크기를 직접 말해주지 않는다고 설명했다.
  - 보고서 결론은 `유의/비유의` 이분법이 아니라 효과 크기, 신뢰구간, 맥락, 후속 실험 필요성까지 포함하도록 수정했다.

### 3. 이해도 점검

- 개방형 질문 1:
  - `p-value = 0.03`이라는 사실만으로 무엇을 말할 수 있고 무엇은 말할 수 없는가
- 개방형 질문 2:
  - 왜 `통계적으로 유의`와 `실무적으로 중요`를 같은 뜻으로 쓰면 안 되는가
- 개방형 질문 3:
  - 95% 신뢰구간이 넓게 나왔을 때, 해석과 다음 행동은 어떻게 달라져야 하는가

이 질문들에 답하도록 유도하면서, 학습자가 `검정`, `추정`, `의사결정`을 한 문장으로 뭉개지 않도록 조정했다.

## 생성된 산출물

- [SAMPLE_STATS_INTERPRETATION.md](./SAMPLE_STATS_INTERPRETATION.md)
- [SAMPLE_STATS_LEARNING_LOG.md](./SAMPLE_STATS_LEARNING_LOG.md)

## 검증 판정

- 진단 기록 있음: 통과
- 질문 기반 단계 학습 3회 이상 있음: 통과
- 개방형 이해도 점검 2회 이상 있음: 통과
- 공식 자료 활용: 통과
- 최종 산출물 존재: 통과
- 첫 번째 IT 인접 드라이런과 동일한 학습 루프 유지: 통과

## 남은 한계

- 이 드라이런은 통계 계산 자체를 새로 증명하는 수학 수업이 아니라, 해석과 의사결정 중심 학습 검증이다.
- 합성 예시를 사용했으므로 실제 현업 데이터 품질 문제나 실험 설계 결함까지 모두 다루지는 않는다.

## 사용 근거

- NIST/SEMATECH e-Handbook of Statistical Methods, confidence intervals and hypothesis tests: https://www.itl.nist.gov/div898/handbook/toolaids/pff/prc.pdf
- NIST/SEMATECH e-Handbook of Statistical Methods, choosing an experimental design: https://www.itl.nist.gov/div898/handbook/pri/section3/pri3.htm
- American Statistical Association, Statement on Statistical Significance and P-Values: https://www.amstat.org/asa/files/pdfs/P-ValueStatement.pdf
