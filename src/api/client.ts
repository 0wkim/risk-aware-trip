// 공통 비동기 JSON POST 요청 래퍼
async function requestPost(path: string, bodyData: any) {
  // path가 '/api/evaluate-course' 형태로 들어오므로 url은 바로 '/api/evaluate-course'
  const url = path; 

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyData),
  });

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

export const api = {
  predictBatch: async (data: { places: any[]; day: number; hour: number }) => {
    return requestPost('/api/predict-batch', data);
  },
  evaluateCourse: async (data: { waypoints: any[]; T_max: number; day: number; hour: number }) => {
    return requestPost('/api/evaluate-course', data);
  },
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
  getRoute: async (data: { coords: number[][]; mode?: 'walking' | 'car' | 'transit' }) => {
    return requestPost('/api/route', data);
  }
};