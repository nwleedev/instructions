# 학습 모드 하네스 ANTI_PATTERNS

## 목적

학습 하네스를 조사 하네스나 일반 질의응답처럼 다루면서 발생하는 품질 저하 패턴을 막는다.

## 금지 패턴

### 1. 진단 없는 답변 투하

- 학습자의 수준, 목표, 산출물 기대치를 확인하지 않고 정답형 설명부터 시작한다.
- 왜 문제인가:
  - Study Mode의 공식 동작은 목표와 수준을 먼저 파악한 뒤 단계적으로 진행하는 방식이다.
  - 선행지식이 다른 사용자에게 같은 설명을 반복하면 과잉 설명 또는 이해 실패가 발생한다.
- 차단 규칙:
  - 첫 응답에서 최소한 목표, 현재 수준, 최종 산출물 중 2개 이상을 확인하지 못했다면 학습 모드로 간주하지 않는다.
- 실제 사례:
  - [DRY_RUN.md](../evidence/DRY_RUN.md), [BEGINNER_PROFILE_DRY_RUN.md](../evidence/BEGINNER_PROFILE_DRY_RUN.md)

### 2. 긴 강의형 단일 응답

- 이해도 점검 없이 긴 설명을 한 번에 쏟아낸다.
- 왜 문제인가:
  - 공식 Study Mode는 step by step 진행과 open-ended checks를 강조한다.
  - worked example 연구도 구조화된 예시와 자기설명이 중요하다고 본다.
- 차단 규칙:
  - 한 단계가 끝날 때마다 이해도 점검 질문, 요약 요청, 짧은 적용 과제 중 하나를 넣는다.
- 실제 사례:
  - [DRY_RUN.md](../evidence/DRY_RUN.md), [SECOND_SUBJECT_DRY_RUN.md](../evidence/SECOND_SUBJECT_DRY_RUN.md)

### 3. 정답만 주고 사고 과정을 닫아버림

- 학습자가 스스로 추론할 기회를 주지 않고 결론만 전달한다.
- 왜 문제인가:
  - 소크라테스식 질문과 자기설명은 깊은 이해 형성의 핵심이다.
- 차단 규칙:
  - 즉답이 필요한 안전/시간 민감 상황이 아니면, 설명 전에 추론 질문이나 예측 질문을 한 번 이상 넣는다.
- 실제 사례:
  - [DRY_RUN.md](../evidence/DRY_RUN.md), [HIGH_RISK_CONCEPT_DRY_RUN.md](../evidence/HIGH_RISK_CONCEPT_DRY_RUN.md)

### 4. 출처 없는 개념 설명

- 정의, 비교, 실무 조언을 출처 없이 단정한다.
- 왜 문제인가:
  - 학습자는 잘못 배운 내용을 실제 프로젝트에 옮길 위험이 크다.
- 차단 규칙:
  - 고영향 개념 설명과 실무 조언은 공식 문서 또는 1차 자료를 붙인다.
- 실제 사례:
  - [THIRD_SUBJECT_DRY_RUN.md](../evidence/THIRD_SUBJECT_DRY_RUN.md), [MEDICAL_HIGH_RISK_DRY_RUN.md](../evidence/MEDICAL_HIGH_RISK_DRY_RUN.md)

### 5. 적용 과제 없는 학습 종료

- 개념을 설명하고 끝내며, 실제 산출물이나 적용 문제를 만들지 않는다.
- 왜 문제인가:
  - 사용자의 목표는 `배웠다`가 아니라 `실제 프로젝트를 진행할 수 있다`이다.
- 차단 규칙:
  - 각 학습 세션의 끝에는 적용 과제, 산출물 초안, 다음 실행 계획 중 하나를 남긴다.
- 실제 사례:
  - [SAMPLE_AGENT_DESIGN.md](../evidence/SAMPLE_AGENT_DESIGN.md), [SAMPLE_BEGINNER_STATS_MEMO.md](../evidence/SAMPLE_BEGINNER_STATS_MEMO.md)

### 6. 범위를 무한 확장하는 탐색

- 궁금한 파생 주제를 계속 붙여 본래 목표와 산출물을 잃어버린다.
- 왜 문제인가:
  - 장기 세션일수록 맥락 유지 비용이 커지고, 학습 목표가 흐려진다.
- 차단 규칙:
  - 파생 주제는 `지금 바로 필요한가`, `현재 산출물 품질을 바꾸는가` 두 기준으로만 추가한다.
- 실제 사례:
  - [THIRD_SUBJECT_DRY_RUN.md](../evidence/THIRD_SUBJECT_DRY_RUN.md), [SAMPLE_GHG_SCOPE_MEMO.md](../evidence/SAMPLE_GHG_SCOPE_MEMO.md)

### 7. 세션 기록 없이 메모리만 믿음

- 현재 이해도, 다음 단계, 핵심 근거를 세션 문서에 남기지 않는다.
- 왜 문제인가:
  - ChatGPT Study Mode는 제품 경험 내부에서 연속성을 지원하지만, Codex에서는 세션 문서가 연속성의 핵심이다.
- 차단 규칙:
  - 마일스톤마다 목표/진행/근거 역할을 맡는 로컬 문서에 재개 정보를 남긴다.
- 실제 사례:
  - [RESUME_VALIDATION.md](../evidence/RESUME_VALIDATION.md), [SAMPLE_STATS_LEARNING_LOG.md](../evidence/SAMPLE_STATS_LEARNING_LOG.md)

### 8. 학습 하네스를 자동화 제품 설계와 혼동

- 문서 하네스 작업인데 CLI/UI 기능 구현, 런타임 자동화, 새 제품 기능 개발로 바로 뛰어든다.
- 왜 문제인가:
  - 현재 범위 밖 항목을 침범하면 하네스 품질 검증보다 제품 구현이 커진다.
- 차단 규칙:
  - 자동화나 제품 기능은 별도 후속 작업으로 분리한다.
- 실제 사례:
  - [REPORT.md](../evidence/REPORT.md)

### 9. 고위험 주제를 일반 튜터링처럼 처리

- 의료, 법률, 투자, 안전 임계 작업을 일반 개념 학습과 같은 강도로 답한다.
- 왜 문제인가:
  - OpenAI 안전 가이드는 고위험 영역에서 사람 검토가 특히 중요하다고 명시한다.
  - 잘못된 설명이 곧바로 행동 지시나 최종 판단으로 오해될 가능성이 크다.
- 차단 규칙:
  - 고위험 주제에서는 먼저 `개념 학습`과 `개인 상황 판단`을 구분한다.
  - 개인화된 결론, 즉시 실행 지시, 전문 판정 대체는 `learning-mode` 단독 범위 밖으로 처리한다.
- 실제 사례:
  - [HIGH_RISK_CONCEPT_DRY_RUN.md](../evidence/HIGH_RISK_CONCEPT_DRY_RUN.md), [MEDICAL_HIGH_RISK_DRY_RUN.md](../evidence/MEDICAL_HIGH_RISK_DRY_RUN.md)

### 10. 고위험 입력과 도구 사용에 승인·가드레일을 생략

- 민감 입력, 외부 자료, MCP 도구를 쓰면서 승인과 입력 검사를 생략한다.
- 왜 문제인가:
  - OpenAI 문서는 고위험 출력에 사람 검토, MCP 작업에는 승인, 사용자 입력에는 가드레일을 권장한다.
  - 고위험 주제일수록 잘못된 입력과 잘못된 실행이 함께 증폭될 수 있다.
- 차단 규칙:
  - 고위험 주제에서 외부 자료나 도구를 쓰면 승인, 입력 가드레일, 근거 접근 경로를 함께 남긴다.
- 실제 사례:
  - [HIGH_RISK_CONCEPT_DRY_RUN.md](../evidence/HIGH_RISK_CONCEPT_DRY_RUN.md), [MEDICAL_HIGH_RISK_DRY_RUN.md](../evidence/MEDICAL_HIGH_RISK_DRY_RUN.md)

### 11. 코어 하네스와 저장소 전용 증빙을 섞어버림

- 코어 지침 문서에 현재 저장소의 드라이런 수, 샘플 주제, 검증 이력을 필수 규칙처럼 섞는다.
- 왜 문제인가:
  - 다른 프로젝트로 복사할 때 불필요한 이력까지 함께 강제되어 이식성이 크게 떨어진다.
  - 새 프로젝트의 local evidence를 만들어야 할 자리에 과거 저장소의 증빙이 규칙처럼 남아 instruction conflict를 만든다.
- 차단 규칙:
  - 코어 문서와 local evidence pack을 분리한다.
  - 현재 저장소의 증빙은 `evidence/EVIDENCE_INDEX.md` 같은 별도 묶음으로만 노출한다.
- 실제 사례:
  - [EVIDENCE_INDEX.md](../evidence/EVIDENCE_INDEX.md), [REPORT.md](../evidence/REPORT.md)

### 12. 절대경로와 현재 세션 구조를 코어 문서에 박아넣음

- `/Users/...` 절대경로, 특정 `store/<session_id>` 경로, 현재 저장소 전용 파일명을 코어 문서에 직접 넣는다.
- 왜 문제인가:
  - 다른 프로젝트나 다른 머신으로 복사하면 링크와 절차가 즉시 깨진다.
  - 파일 역할과 파일 경로가 분리되지 않아 adapter 계층 없이 코어를 다시 뜯어고쳐야 한다.
- 차단 규칙:
  - 코어 문서에서는 파일의 `역할`만 정의하고, 로컬 파일 매핑은 adapter에 둔다.
  - 코어 문서 내부 링크는 상대경로를 사용한다.
- 실제 사례:
  - [PORTABILITY.md](./PORTABILITY.md), [EVIDENCE_INDEX.md](../evidence/EVIDENCE_INDEX.md)

## 경고 신호

- 질문보다 설명이 먼저 길어진다.
- 학습자의 막힘 지점이 문서에 남지 않는다.
- 중간 이해도 점검이 모두 `이해됐나요?` 같은 예/아니오 질문뿐이다.
- 세션이 길어질수록 다음 단계가 아니라 과거 설명 복붙이 늘어난다.
- 최종 산출물이 학습 목표와 분리된다.
- 고위험 주제인데도 경계 문구, 공식 출처, 사람 검토 조건이 없다.
- 새 프로젝트에 복사했는데도 이전 저장소 이름, 절대경로, 샘플 주제가 그대로 남아 있다.

## 근거 링크

- https://help.openai.com/en/articles/11780217-chatgpt-study-mode-faq
- https://help.openai.com/en/articles/6825453-chatgpt-user-guide
- https://openai.com/index/new-ways-to-learn-math-and-science-in-chatgpt/
- https://developers.openai.com/api/docs/guides/safety-best-practices/
- https://developers.openai.com/api/docs/guides/agent-builder-safety/
- https://developers.openai.com/api/docs/guides/images-vision/#limitations
- https://www.sciencedirect.com/science/article/abs/pii/S0959475201000305
