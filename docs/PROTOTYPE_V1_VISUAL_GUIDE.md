# BuildWise Prototype v1 Visual Guide

이 문서는 BuildWise Prototype v1의 시각 디자인 기준을 정리한다.

제품 기능과 카피의 최종 기준은 아래 문서다.

- `PROTOTYPE_V1_DECISION_RULES.md`
- `PROTOTYPE_V1_DECISION_REPORT.md`
- `PROTOTYPE_V1_IA_DESIGN.md`
- `WIREFRAME_01` ~ `WIREFRAME_05`

이 문서와 위 문서의 기능·카피가 충돌하면 위 문서를 따른다.

## 1. Brand Relationship

BuildWise를 화면의 메인 제품 브랜드로 사용한다.

HIMEC은 BuildWise의 PoC / 공모전 맥락을 보여 주는
보조 브랜드로 취급한다.

기본 원칙:

- 제품명은 BuildWise가 가장 먼저 인지되게 한다.
- HIMEC 로고를 BuildWise 로고처럼 재가공하지 않는다.
- HIMEC 로고 원본이 제공된 경우 원본 비율과 형태를 유지한다.
- HIMEC 공식 서비스처럼 오해될 정도로 로고를 과도하게 강조하지 않는다.
- 공모전 로고 사용 조건이 따로 있으면 그 규정을 우선한다.

권장 표현 방향:

> BuildWise
> Prototype for HIMEC document review

또는 이에 준하는 짧은 범위 안내.

현재 단계에서는 새로운 BuildWise 심볼 로고를 임의로 만들지 않는다.
텍스트 워드마크 중심으로 사용한다.

### HIMEC 로고 사용 기준

- 반드시 제공된 원본 로고 파일을 그대로 사용한다.
  - 밝은 배경: Blue 컬러 원본 로고
  - 어두운 배경: 밝은 색(White 계열) 원본 로고
- 참고용 Style Guide 이미지 안에 그려진 로고는 사용하지 않는다.
  해당 이미지 속 로고 하단 문구는 원본 로고와 다르므로,
  로고의 형태·문구 기준으로 삼지 않는다.
- 로고를 다시 그리거나, 색을 바꾸거나, 비율을 바꾸지 않는다.

## 2. Visual Direction

핵심 키워드:

- Trust
- Precision
- Engineering
- Traceable
- Structured
- Report-first
- Professional B2B SaaS

피해야 할 방향:

- 소비자용 앱 같은 과도하게 둥근 카드
- 과한 Gradient
- Neon / Cyberpunk AI 스타일
- 의미 없는 AI sparkle 장식
- Glassmorphism 남발
- 캐릭터 / 일러스트 중심
- 제품 로고를 잔뜩 나열하는 SaaS 비교 사이트 느낌

## 3. Color Roles

첨부 이미지의 컬러는 참고 색이다.
HIMEC 공식 브랜드 HEX라고 표현하지 않는다.

색은 역할 기준으로 정의한다.

### Primary Blue

사용:

- Primary CTA
- Active state
- 링크
- 핵심 숫자 및 강조
- Focus

### Deep Navy

사용:

- 주요 제목
- Header
- 중요한 판단 영역
- Report의 강한 정보 위계

### Light Neutral

사용:

- 섹션 구분
- 입력 영역 배경
- 표 보조 배경
- Evidence / Data Limit 같은 보조 정보 영역

### White

사용:

- 기본 배경
- 문서형 Report 영역

### Gray

사용:

- 보조 텍스트
- 설명
- Divider
- Disabled / secondary 정보

### 참고 HEX 후보

아래 값은 참고용 BuildWise UI Style Guide 이미지에 표기된 값이다.
구현 단계의 시작 후보로만 기록하며,
"HIMEC 공식 컬러"라고 표현하지 않는다.

| 역할 | 참고 HEX 후보 |
| --- | --- |
| Primary Blue | `#1E56A0` |
| Deep Navy | `#0B1F44` |
| Light Neutral | `#E8EAF6` |
| White | `#FFFFFF` |
| Gray | `#2E3440` (Gray 800) |

구현 시 텍스트와 배경의 대비(가독성)를 확인한 뒤 확정한다.

## 4. Status System

상태는 정확히 세 개만 사용한다.

- ✓ 충족
- ? 확인 필요
- ! 예산 초과

색상 + 아이콘 + 텍스트를 항상 함께 사용한다.

색 역할:

| 상태 | 색 역할 |
| --- | --- |
| ✓ 충족 | 안정적인 Green 또는 Blue-Green |
| ? 확인 필요 | Amber |
| ! 예산 초과 | Red |

색만으로 상태를 전달하지 않는다.

아래 같은 상태를 임의로 추가하지 않는다.

- "미지원"
- "실패"
- "부족"

## 5. Typography Hierarchy

정확한 폰트 패밀리는 지금 확정하지 않는다.

위계:

- Display / Hero
- Page Title
- Section Title
- Body
- Supporting Text
- Table Label
- Status / Badge

원칙:

- 한글 가독성 우선
- 과도하게 굵은 Weight 남발 금지
- 숫자와 표가 빠르게 읽히게 함
- 보고서 화면에서는 장식적 타이포보다 문서 가독성 우선

## 6. Grid / Spacing

Desktop-first.

원칙:

- 넓은 좌우 여백
- 명확한 Column Grid
- 섹션 간 충분한 간격
- 요소를 억지로 카드 안에 넣지 않음
- Divider와 공간으로 정보 그룹을 구분
- 화면 전체 폭을 지나치게 꽉 채우지 않음

화면별 밀도:

| 화면 | 밀도 |
| --- | --- |
| Home | 가장 여백이 넓다 |
| Compare | 입력 집중 |
| Decision | 비교 정보 밀도가 높다 |
| Decision Report | 가장 문서형이고 차분한 레이아웃 |

## 7. Buttons

### Primary

Blue filled button.

사용:

- 우리 조건으로 비교하기
- 조건 비교 시작
- Decision Report 보기

### Secondary

White 또는 Light Neutral 배경 + Blue/Navy border.

사용:

- 조건 다시 입력하기
- 보조 이동

### Text Link

근거 원문 보기 등
낮은 위계의 액션에 사용한다.

한 화면에 Primary CTA를 과도하게 여러 개 두지 않는다.

## 8. Inputs

Compare 화면은 입력 3개가 한 화면에서 보이게 한다.

- 월 예산
- 출처 인용
- OCR

스타일:

- 명확한 Label
- 도움말은 Secondary text
- 선택 상태가 분명해야 함
- 과도하게 큰 Form component 금지

출처 인용 / OCR에는
기본 선택값을 시각적으로 미리 선택하지 않는다.

## 9. Tables

BuildWise의 핵심 UI 중 하나다.

원칙:

- 가독성 우선
- 불필요한 세로선 최소화
- 행 간격 충분히 확보
- 숫자 정렬 일관성 유지
- 상태 Badge를 빠르게 스캔 가능하게 함
- 제품 설명을 표 안에 길게 넣지 않음

Candidate Comparison에서는
사용자가 아래 질문에 바로 답할 수 있어야 한다.

- 우리 조건에 맞는가?
- 무엇이 확인됐는가?
- 무엇을 더 확인해야 하는가?
- 근거는 어디인가?

## 10. Evidence UI

현재 v1에서 Evidence는 별도 페이지가 아니라
관련 화면 안의 근거 영역으로 표현한다.

시각적으로 다른 정보보다 숨기지 않는다.

표시 우선순위:

1. 원문 출처
2. 수집 시점
3. 가격 원문
4. 기능 확인 상태
5. 데이터 한계

Evidence 영역은
Light Neutral 배경이나 Divider를 활용해
본문과 구분할 수 있다.

## 11. Page-specific Density

### Home

가장 넓고 브랜드 중심.

- Hero
- 핵심 문제
- Process Preview
- Evidence Preview
- CTA

텍스트와 여백 중심으로 구성한다.

### How it works

Process / Flow 중심.

4개의 장식 카드 나열보다는
단계가 이어지는 구조를 강조한다.

### Compare

입력 집중.

한 화면에서 세 입력과 입력 요약을 볼 수 있게 한다.

### Decision

가장 정보 밀도가 높다.

순서:

1. 한 줄 판단
2. 입력 조건 요약
3. 후보 수 요약
4. Recommended Direction
5. Candidate Comparison
6. Gap / 추가 확인
7. Evidence
8. Next Action
9. Decision Report CTA

제품 목록보다 판단이 먼저 보인다.

### Decision Report

대시보드보다 문서에 가깝게 만든다.

- Executive Summary
- 입력 조건
- 판단 숫자 요약
- What We Know / What We Need to Check
- Candidate Shortlist
- Evidence Summary
- Market Context
- Next Action
- Data Limit

회의 자료처럼 위에서 아래로 읽을 수 있어야 한다.

## 12. Border / Radius / Shadow

과도하게 둥근 SaaS 카드 스타일을 피한다.

- 작은 Radius 또는 거의 직선적인 형태
- Shadow 최소화
- Border / Divider 중심
- 핵심 CTA 정도만 명확하게 분리

정확한 px 값은 구현 단계에서 결정한다.

## 13. Imagery

이미지는 꼭 필요한 경우에만 사용한다.

Home Hero에서 사용할 경우
아래를 연상시키는 시각 요소를 사용한다.

- 엔지니어링
- 도면
- 구조
- 데이터
- 문서
- 정밀함

사람 사진이나
일반적인 AI 로봇 이미지는 우선 사용하지 않는다.

Decision / Report 화면은
이미지보다 데이터와 정보 구조가 우선이다.

## 14. Reference Image Usage Rule

첨부된 BuildWise UI Style Guide와 HIMEC 홈페이지 스크린샷은
시각 참고 이미지다.

참고할 것:

- 색 역할
- 레이아웃
- 정보 위계
- 버튼 / 입력 / Badge / Table 분위기
- B2B Engineering tone

참고하지 않을 것:

- 이미지 속 카피
- 이미지 속 숫자
- 이미지 속 제품 기능
- 이미지 속 Report 기능
- 이미지 속 화면별 임의 설명

기능과 카피가 이미지와 문서에서 충돌하면
반드시 v1 문서를 따른다.

## 15. 구현 시 지켜야 할 핵심

사용자가 첫눈에 느껴야 하는 것:

> "AI 추천 사이트"가 아니라
> "근거를 기반으로 회사의 AI 활용 방향을 판단하는 업무 도구"

화면은 화려함보다 아래를 우선한다.

- 빠른 이해
- 빠른 비교
- 근거 확인
- 다음 액션
