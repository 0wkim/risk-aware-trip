# RiskAwareTrip

## 📌 Overview
RiskAwareTrip은 시간 제약과 혼잡도 불확실성을 고려하여  
여행 일정의 **실행 가능성(feasibility)**을 평가하고,  
실패 가능성이 높은 경우 **대안 장소를 추천**하는 의사결정 지원 시스템입니다.

기존의 여행 서비스가 단순 경로 탐색이나 장소 추천에 집중했다면,  
본 프로젝트는 **“이 일정이 실제로 가능한가?”**에 집중합니다.

---

## 🎯 Problem Statement
사용자가 설정한 제한된 시간 내에  
특정 목적지를 성공적으로 이용할 수 있는지를 정량적으로 평가하고,

실패 리스크가 높은 경우  
사용자의 원래 의도를 유지하는 최적의 대안을 제시하는 문제

→ 본 문제를 **확률적 제약 기반 의사결정 문제**로 정의

---

## 💡 Key Features

### 1. Travel Feasibility Evaluation
- 이동 시간 + 혼잡도 + 체류 시간 반영
- 일정 성공 확률 계산
- 결과를 success / warning / fail로 분류

### 2. Risk-Aware Recommendation
- 일정 실패 시 대안 장소 추천
- 기존 목적과 유사한 장소 필터링
- 거리 + 혼잡도 + 시간 제약 반영

### 3. Real-Time Data Integration
- 지도 API 기반 이동 시간 반영
- 혼잡도 데이터 기반 위험도 계산

### 4. Web-Based Visualization
- 사용자 입력 기반 결과 시각화
- 대안 추천 UI 제공
- 수정된 경로 확인 기능

---

## 🧠 Approach

본 프로젝트는 다음과 같은 구조로 구성됩니다.
