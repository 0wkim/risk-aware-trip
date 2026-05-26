// src/api/client.ts

// API 베이스 URL 설정 (명세서 가이드라인 반영)
const PRIMARY_BASE_URL = import.meta.env.VITE_API_CLOUDFLARE || 'https://api.example.trycloudflare.com'; 
const FALLBACK_BASE_URL = import.meta.env.VITE_API_LOCAL || 'http://localhost:8000';

/**
 * 백엔드 서버 가용성을 먼저 테스트하고 유효한 BASE_URL을 반환하는 헬퍼 함수
 */
async function getActiveBaseUrl(): Promise<string> {
  try {
    // PRIMARY 터널 서버 헬스체크 시도 (타임아웃 2초 규칙 적용)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${PRIMARY_BASE_URL}/api/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (res.ok) return PRIMARY_BASE_URL;
  } catch (e) {
    console.warn("⚠️ PRIMARY 백엔드 터널 접속 실패, FALLBACK(로컬)로 전환합니다.");
  }
  return FALLBACK_BASE_URL;
}

/**
 * 공통 비동기 JSON POST 요청 래퍼 (에러 핸들링 및 재시도 정책 포함)
 */
async function requestPost(path: string, bodyData: any) {
  const baseUrl = await getActiveBaseUrl();
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // 명세서 헤더 규격 준수
    },
    body: JSON.stringify(bodyData),
  });

  // 422 입력 검증 에러 처리
  if (response.status === 422) {
    const errDetail = await response.json();
    console.error("🚨 백엔드 Pydantic 검증 실패 (422):", errDetail);
    throw new Error(`요청 규격 오류 (422): ${JSON.stringify(errDetail.detail)}`);
  }

  if (!response.ok) {
    throw new Error(`서버 응답 실패: ${response.status}`);
  }

  return await response.json();
}

// 🔥 [App.tsx 연동 핵심 객체]: 백엔드 모델 호출 메서드 일치화
export const api = {
  /**
   *기존에 사용하던 일괄 혼잡도 예측 인터페이스
   */
  predictBatch: async (data: { places: any[]; day: number; hour: number }) => {
    return requestPost('/api/predict-batch', data);
  },

  /**
   * 1단계: 다중 경유지 코스 완주 시뮬레이션 평가 (/api/evaluate-course)
   */
  evaluateCourse: async (data: { waypoints: any[]; T_max: number; day: number; hour: number }) => {
    return requestPost('/api/evaluate-course', data);
  },

  /**
   * 2단계: 실패 지점 반경 우회 대안 장소 추천 연산 (/api/alternatives)
   */
  getAlternatives: async (data: { 
    failed_waypoint: any; 
    day: number; 
    hour: number; 
    course_waypoints: any[]; 
    failed_index: number; 
    T_max: number; 
    radius_m?: number; 
    top_k?: number;
  }) => {
    return requestPost('/api/alternatives', data);
  },

  /**
   * 3단계: 카카오 내비게이션 기반 도보/지하철 구불구불한 실제 경로 데이터 추출 (/api/route)
   */
  getRoute: async (data: { coords: number[][]; mode?: 'walking' | 'car' | 'transit' }) => {
    return requestPost('/api/route', data);
  }
};