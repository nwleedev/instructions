# 학습 모드 하네스 INDEX

이 문서는 Codex가 ChatGPT Study Mode와 유사한 학습 성과를 목표로, `진단 -> 단계적 학습 -> 이해도 점검 -> 산출물 적용 -> 세션 보존` 흐름을 반복 가능하게 운영하기 위한 기본 진입점이다.

## 목적

- 사용자의 목표, 현재 수준, 제약을 먼저 진단하고 그에 맞는 학습 경로를 설계한다.
- 단순 설명 제공이 아니라, 학습자가 스스로 생각하고 설명하고 적용하도록 유도한다.
- 긴 작업이나 컨텍스트 압축 이후에도 세션 문서만으로 학습 흐름을 이어갈 수 있게 한다.
- 학습 결과를 실제 산출물로 연결해 `알게 됨`이 아니라 `할 수 있게 됨`을 목표로 삼는다.

## 적용 대상

- 새 분야를 빠르게 학습해야 하는 실무형 자기주도 학습
- 프로젝트 착수 전에 개념, 용어, 설계 기준을 익혀야 하는 경우
- 문서, 코드, 아키텍처, 제품 설계 같은 산출물을 학습의 결과로 남겨야 하는 경우
- 개발/IT뿐 아니라 비개발 주제까지 확장 가능한 범용 학습 흐름이 필요한 경우

## ChatGPT Study Mode와의 관계

- OpenAI Help Center FAQ와 2025-07-29 릴리스 노트 기준으로, Study Mode는 목표/수준 파악, 소크라테스식 질문, 단계적 설명, 이해도 점검, 업로드 자료 활용을 핵심 동작으로 설명한다.
- OpenAI는 해당 기능이 커스텀 시스템 지침 기반이며 대화마다 다소 일관되지 않을 수 있다고 밝힌다.
- 따라서 이 하네스는 ChatGPT UI나 토글 자체를 복제하는 것이 아니라, 학습 성과 동등성을 목표로 위 동작 원칙을 Codex용 작업 절차와 문서 구조로 재구성한다.

## 시작 전 필수 확인

1. 로컬 목표 기준 문서에 학습 목표, 범위, 범위 밖, 검증 강도, 샘플 주제가 있는지 확인한다.
2. 학습 결과를 어떤 산출물로 남길지 확인한다.
3. 세션 재개를 위해 목표, 현재 작업, 진행 상태, 근거, 결정 사항을 기록할 로컬 구조가 있는지 확인한다.
4. 학습 대상자의 현재 수준, 마감, 선행지식, 금지 사항을 확인한다.
5. 외부 도구나 자료 업로드가 필요한지 확인한다.

프로젝트마다 세션 파일 체계가 다를 수 있으므로, 이 하네스를 새 프로젝트에 붙일 때는 코어 문서를 직접 바꾸지 말고 `templates/PROJECT-ADAPTER-TEMPLATE.md`를 채워 로컬 연결부를 분리한다.

## 최소 운영 원칙

- 먼저 진단하고, 그 다음 설명한다.
- 한 번에 답을 몰아주지 않고, 이해 가능한 단계로 나눈다.
- 각 단계마다 이해도 점검 질문 또는 작은 적용 과제를 넣는다.
- 근거가 필요한 설명은 출처를 붙인다.
- 학습 세션의 끝은 설명 종료가 아니라 산출물 적용 또는 다음 학습 행동 정의로 마감한다.

## Portable Core

다른 프로젝트에 복사할 때 기본으로 가져가야 하는 문서 묶음이다.

1. [ARCHITECTURE.md](./core/ARCHITECTURE.md)
2. [ANTI_PATTERNS.md](./core/ANTI_PATTERNS.md)
3. [PORTABILITY.md](./core/PORTABILITY.md)
4. [VALIDATION.md](./core/VALIDATION.md)
5. [HIGH_RISK_BOUNDARIES.md](./core/HIGH_RISK_BOUNDARIES.md)
6. [GENERALIZATION_CHECKLIST.md](./core/GENERALIZATION_CHECKLIST.md)

## Project Adapter

프로젝트마다 달라지는 연결 지점은 코어가 아니라 adapter에서 처리한다.

- [PROJECT-ADAPTER-TEMPLATE.md](./templates/PROJECT-ADAPTER-TEMPLATE.md)

## Core Templates

- [LEARNING-PLAN-TEMPLATE.md](./templates/LEARNING-PLAN-TEMPLATE.md)
- [LEARNING-LOG-TEMPLATE.md](./templates/LEARNING-LOG-TEMPLATE.md)

## Optional Local Evidence Pack

현재 저장소에서 이 하네스가 실제로 검증된 증빙 묶음이다. 새 프로젝트에서는 선택 복사다.

- [EVIDENCE_INDEX.md](./evidence/EVIDENCE_INDEX.md)
- [REPORT.md](./evidence/REPORT.md)

## 세션 재개 우선순위

1. 현재 프로젝트에서 목표와 완료 기준을 저장하는 로컬 문서
2. 현재 해야 할 일을 저장하는 로컬 문서
3. 진행 상태를 저장하는 로컬 문서
4. 근거와 출처를 저장하는 로컬 문서
5. 중요한 선택과 트레이드오프를 저장하는 로컬 문서
6. 실제 학습 절차와 금지 패턴을 담은 `learning-mode` 코어 문서

현재 저장소에서는 전용 세션 파일 묶음이 위 역할을 맡고 있지만, 다른 프로젝트에서는 adapter에서 해당 역할만 매핑하면 된다.

## 설계 근거

- ChatGPT Study Mode FAQ: https://help.openai.com/en/articles/11780217-chatgpt-study-mode-faq
- ChatGPT Release Notes, 2025-07-29 Study Mode: https://help.openai.com/en/articles/6825453-chatgpt-user-guide
- OpenAI product post, 2026-03-10 interactive learning: https://openai.com/index/new-ways-to-learn-math-and-science-in-chatgpt/
- OpenAI Responses Overview: https://developers.openai.com/api/reference/responses/overview/
- OpenAI Codex App Server API overview: https://developers.openai.com/codex/app-server/
- Renkl, 2002, worked examples and self-explanations: https://www.sciencedirect.com/science/article/abs/pii/S0959475201000305
