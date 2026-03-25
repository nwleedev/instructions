# 학습 모드 하네스 PORTABILITY

## 목적

이 문서는 `learning-mode`를 다른 프로젝트에 복사해도 학습 품질이 떨어지지 않도록, 무엇을 그대로 유지하고 무엇을 프로젝트마다 바꿔야 하는지 정의한다.

핵심 원칙은 `portable core는 안정적으로 유지하고, 프로젝트 차이는 얇은 adapter에서만 처리하며, 기존 저장소의 검증 이력은 local evidence pack으로 분리한다`는 것이다.

## 왜 이렇게 나누는가

- GPT-5 계열 모델은 지시를 매우 정밀하게 따르므로, 모순되거나 범위가 흐린 프롬프트는 성능을 크게 떨어뜨릴 수 있다.
- OpenAI는 에이전트형 작업에서 역할, 워크플로, 검증, 진행 추적을 명확히 두라고 권장한다.
- OpenAI는 eval을 통해 작은 변경 뒤 결과를 다시 확인하며 반복 개선하라고 권장한다.
- OpenAI는 구조화된 출력으로 자유형 지시 전파를 줄여야 한다고 권장한다.

따라서 여러 프로젝트에 복사할 때는 아래처럼 나누는 편이 가장 안정적이다.

1. Portable Core
   - 학습 루프, 금지 패턴, 고위험 경계, 일반 검증 규칙처럼 프로젝트와 무관한 부분
2. Project Adapter
   - 이 프로젝트의 목표 문서, 진행 기록, 검증 명령, 도구/권한 규칙, discovery 연결 방식
3. Local Evidence Pack
   - 현재 저장소에서 수행한 드라이런, 샘플 산출물, 런타임 검증, 재개 검증 같은 증빙

## 성능을 유지하는 복사 전략

### 1. Core는 작고 안정적으로 유지한다

- 코어 문서에는 현재 저장소 전용 절대경로, 세션 ID, 샘플 주제명을 필수 규칙처럼 박아 넣지 않는다.
- 코어 문서에는 역할, 단계, 금지 패턴, 출력 기대치, 검증 질문처럼 변하지 않는 규칙만 둔다.
- 새 프로젝트에 붙일 때 코어 문서를 먼저 고치지 말고, adapter 문서에서 로컬 차이를 흡수한다.

### 2. 로컬 차이는 adapter에서만 처리한다

- 목표/진행/근거/결정 문서가 어떤 파일에 있는지 adapter에서 선언한다.
- 로컬 검증 명령, 금지 도구, 승인 규칙, discovery 등록 방식도 adapter에서만 선언한다.
- 프로젝트마다 바뀌는 내용이 코어로 역류하면, 다음 프로젝트로 복사할 때 instruction conflict가 누적된다.

### 3. 증빙은 선택 복사로 분리한다

- 드라이런, 샘플 산출물, 런타임 검증 문서는 코어의 필수 구성요소가 아니다.
- 다른 프로젝트에서는 evidence pack을 통째로 복사하지 않고, 새 프로젝트의 로컬 증빙으로 다시 채우는 편이 맞다.
- 기존 evidence pack은 `이 하네스가 한 저장소에서 실제로 검증된 방식`을 보여주는 참고자료로만 사용한다.

### 4. 출력 계약은 자유형이 아니라 구조형으로 유지한다

- 학습 로그, 계획, 산출물의 최소 필드는 템플릿으로 고정한다.
- 주제별 출력 형식이 달라도 `목표`, `오개념`, `근거`, `산출물 진행 상태`, `다음 단계` 같은 핵심 슬롯은 유지한다.
- 도구 호출이나 후속 자동화가 붙는 경우에는 구조화된 필드나 체크리스트를 유지해 데이터 흐름을 좁힌다.

### 5. 작은 변경 후 eval 성격의 검증을 다시 돌린다

- 코어를 복사한 뒤에는 즉시 큰 재작성부터 하지 않는다.
- 먼저 adapter만 채우고 대표 주제 1개로 드라이런을 수행한다.
- 변경은 작게 하고, 바꾼 뒤에는 같은 체크리스트로 다시 본다.

### 6. API 기반 환경에서는 stable prefix를 유지한다

- OpenAI API로 이 하네스를 developer/system instructions로 주입한다면, 코어 지침은 가능한 한 안정적인 prefix로 유지한다.
- 프로젝트마다 달라지는 내용은 adapter 또는 user/task 입력 쪽으로 밀어, 코어 prefix의 변동 폭을 줄인다.
- Responses API를 쓰는 경우 `prompt_cache_key`와 extended prompt caching 같은 기능은 반복되는 prefix가 안정적일수록 유리하다.
- 모델 변경이나 큰 프롬프트 수정 시에는 먼저 동일 기능의 eval을 돌리고, 작은 변경 단위로 다시 측정한다.

## 다른 프로젝트에 복사할 때의 권장 복사 범위

현재 저장소 대표 구조 예시:

- 루트 진입점:
  - [INDEX.md](../INDEX.md)
- reusable core:
  - [ARCHITECTURE.md](./ARCHITECTURE.md)
  - [ANTI_PATTERNS.md](./ANTI_PATTERNS.md)
  - [VALIDATION.md](./VALIDATION.md)
- local evidence pack:
  - [EVIDENCE_INDEX.md](../evidence/EVIDENCE_INDEX.md)
  - [DRY_RUN.md](../evidence/DRY_RUN.md)
  - [HIGH_RISK_CONCEPT_DRY_RUN.md](../evidence/HIGH_RISK_CONCEPT_DRY_RUN.md)

### 필수 복사: Portable Core

- `INDEX.md`
- `core/ARCHITECTURE.md`
- `core/ANTI_PATTERNS.md`
- `core/PORTABILITY.md`
- `core/VALIDATION.md`
- `core/HIGH_RISK_BOUNDARIES.md`
- `core/GENERALIZATION_CHECKLIST.md`
- `templates/LEARNING-PLAN-TEMPLATE.md`
- `templates/LEARNING-LOG-TEMPLATE.md`
- `templates/PROJECT-ADAPTER-TEMPLATE.md`

### 선택 복사: Local Evidence Pack

- `evidence/REPORT.md`
- `evidence/EVIDENCE_INDEX.md`
- `evidence/*_DRY_RUN.md`
- `evidence/SAMPLE_*.md`
- `evidence/RESUME_VALIDATION.md`
- `evidence/RUNTIME_COMPACTION_VALIDATION.md`

규칙:

- 선택 복사 문서는 참고용이다.
- 새 프로젝트의 통과 기준은 그 프로젝트의 local evidence로 다시 채운다.

## 복사 후 반드시 해야 하는 일

1. `PROJECT-ADAPTER-TEMPLATE.md`를 복사해 로컬 adapter 문서를 만든다.
2. 현재 프로젝트의 목표/진행/근거/결정 문서를 adapter에 연결한다.
3. 로컬 검증 명령과 수동 검증 포인트를 adapter에 적는다.
4. 대표 주제 1개로 학습 로그 + 최종 산출물 + 드라이런 요약을 새로 만든다.
5. 고위험 주제를 다룰 예정이면 `HIGH_RISK_BOUNDARIES.md`를 로컬 정책에 맞게 재확인한다.

## 복사 후 성능 저하를 부르는 대표 실수

- 코어 문서에 현재 프로젝트 경로와 파일명을 직접 써넣는다.
- 기존 저장소의 드라이런 수와 샘플 주제를 새 프로젝트의 필수 통과 기준으로 강제한다.
- adapter 없이 코어 문서를 직접 뜯어고쳐 로컬 예외를 반영한다.
- 검증 없이 문서만 복사하고 실제 드라이런을 생략한다.
- 고위험 경계를 제거한 채 일반 주제처럼 사용한다.

## 사용 근거

- Prompt engineering guide: https://developers.openai.com/api/docs/guides/prompt-engineering/
- Working with evals: https://developers.openai.com/api/docs/guides/evals/
- Safety in building agents: https://developers.openai.com/api/docs/guides/agent-builder-safety/
- Codex config reference: https://developers.openai.com/codex/config-reference/
