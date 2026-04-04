---
name: harness-fe-fsd
description: "Feature-Sliced Design, FSD, app, pages, widgets, features, entities, shared, 레이어, 슬라이스, public API, 폴더 구조, import 규칙 작업 시 활성화. FSD 규칙을 제공."
user-invocable: true
---

# Feature-Sliced Design Rules

FSD 공식 문서를 우선 참조한다.

## 레이어 구조

```txt
src/
  app/        # 라우터, provider, 앱 전역 설정
  pages/      # 라우트 진입점
  widgets/    # 페이지를 구성하는 큰 UI 블록
  features/   # 사용자 행동 단위 기능
  entities/   # 비즈니스 개체
  shared/     # 외부 세계 연결, 공용 UI, 유틸
```

## Import 규칙

- 상위 레이어는 하위 레이어를 import 가능.
- **하위 레이어는 상위 레이어 import 금지.**
- **같은 레이어의 다른 slice 직접 import 금지.**
- slice 외부에서는 **public API만** import.
- 같은 slice 내부 참조는 상대 경로를 우선 사용.
- shared/app은 segment 간 자유 import 허용.
- cross-import가 꼭 필요하면 명시적 public API 계약을 먼저 설계.

## 레이어별 규칙

- **pages**: 라우트 진입점. 다른 pages를 import하지 않는다.
- **widgets**: pages에 의존하지 않는다.
- **features**: widgets/pages/다른 features에 직접 의존하지 않는다.
- **entities**: features/widgets/pages에 의존하지 않는다.
- 외부에서 각 slice 내부 파일로 **deep import 금지**. public API만 사용.

## 구현 전 체크리스트

- [ ] 새 props를 추가하는 대신 context/store/route data/public API로 해결 가능한가?
- [ ] FSD layer import rule과 public API rule을 깨지 않는가?
- [ ] 페이지 컴포넌트가 비즈니스 로직을 직접 담고 있지 않은가? (features/entities로 내릴 것)
