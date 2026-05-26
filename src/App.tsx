import React, { useState, useEffect } from 'react';
import LoadingPage from './pages/LoadingPage';
import MyPage from './pages/MyPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MainMapPage from './pages/MainMapPage';
import ResultPage from './pages/ResultPage';
import { api } from './api/client'; // 기존 단일 predictBatch 메서드만 뚫려있던 객체

interface SearchParams {
  startPoint: string;
  destination: string;
  maxHours: string;
  maxMinutes: string;
  places?: any[]; 
  day?: number;   
  hour?: number;  
}

type PageType = 'login' | 'signup' | 'mainmap' | 'mypage' | 'result';

const SEOUL_API_KEY = import.meta.env.VITE_SEOUL_API_KEY;

const DISTRICT_MAPPING = [
  { district: '강남구', areaNm: '강남역' }, { district: '강동구', areaNm: '천호역' },
  { district: '강북구', areaNm: '미아사거리역' }, { district: '강서구', areaNm: '서울식물원·마곡나루역' },
  { district: '관악구', areaNm: '신림역' }, { district: '광진구', areaNm: '건대입구역' },
  { district: '구로구', areaNm: '신도림역' }, { district: '금천구', areaNm: '안양천' },
  { district: '노원구', areaNm: '북서울꿈의숲' }, { district: '도봉구', areaNm: '쌍문역' },
  { district: '동대문구', areaNm: '청량리 제기동 일대 전통시장' }, { district: '동작구', areaNm: '사당역' },
  { district: '마포구', areaNm: '합정역' }, { district: '서대문구', areaNm: '신촌 스타광장' },
  { district: '서초구', areaNm: '고속터미널역' }, { district: '성동구', areaNm: '왕십리역' },
  { district: '성북구', areaNm: '성신여대입구역' }, { district: '송파구', areaNm: '잠실역' },
  { district: '양천구', areaNm: '오목교역·목동운동장' }, { district: '영등포구', areaNm: '여의도' },
  { district: '용산구', areaNm: '용산역' }, { district: '은평구', areaNm: '연신내역' },
  { district: '종로구', areaNm: '광화문광장' }, { district: '중구', areaNm: '명동 관광특구' },
  { district: '중랑구', areaNm: '장한평역' }
];

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    return (localStorage.getItem('currentPage') as PageType) || 'login';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('isDarkMode') === 'true';
  });

  const [searchParams, setSearchParams] = useState<SearchParams>(() => {
    const saved = localStorage.getItem('searchParams');
    return saved ? JSON.parse(saved) : {
      startPoint: '성수역 3번 출구',
      destination: '까치화방 카페 성수점',
      maxHours: '1',
      maxMinutes: '10'
    };
  });

  const [backendPredictionResult, setBackendPredictionResult] = useState<any>(null);
  const [seoulData, setSeoulData] = useState<any[]>([]);
  const [isSeoulDataLoading, setIsSeoulDataLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('isDarkMode', String(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('searchParams', JSON.stringify(searchParams));
  }, [searchParams]);

  useEffect(() => {
    const fetchCityData = async () => {
      setIsSeoulDataLoading(true);
      try {
        const promises = DISTRICT_MAPPING.map(async (item) => {
          const url = `http://openapi.seoul.go.kr:8088/${SEOUL_API_KEY}/json/citydata/1/5/${encodeURIComponent(item.areaNm)}`;
          const response = await fetch(url);
          const json = await response.json();
          const cityData = json?.CITYDATA;
          const weatherBase = cityData?.WEATHER_STTS?.[0];
          const weatherTxt = weatherBase?.WEATHER_STTUS || weatherBase?.FCST24HOURS?.[0]?.SKY_STTS || '정보없음';
          
          return {
            district: item.district,
            realAreaName: cityData?.AREA_NM || item.areaNm,
            congestion: cityData?.LIVE_PPLTN_STTS?.[0]?.AREA_CONGEST_LVL || '정보없음',
            temp: `${weatherBase?.TEMP || '-'}°C`,
            weather: weatherTxt,
            weatherText: weatherTxt
          };
        });

        const results = await Promise.all(promises);
        setSeoulData(results);
      } catch (error) {
        console.error("Seoul API fetch error:", error);
      } finally {
        setIsSeoulDataLoading(false);
      }
    };

    fetchCityData();
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // ⏪ 원래의 안정적인 더미 믹싱 분석 엔진으로 복구
  const handleStartAnalysis = async (params: any) => {
    setSearchParams(params);
    setIsAnalyzing(true);

    try {
      // 1. 기존의 단일 예측 API 호출 진행 (혹시 서버 켜졌을 때 연동 유지)
      const response = await api.predictBatch({
        places: params.places,
        day: params.day,
        hour: params.hour
      });

      // 2. 출발지와 도착지 좌표 사이에 50개의 미세 경로 디테일 라인을 동적으로 쪼개서 채워 넣기
      const startLat = params.places[0].lat;
      const startLng = params.places[0].lng;
      const destLat = params.places[1].lat;
      const destLng = params.places[1].lng;

      const simulatedCoordinates: Array<[number, number]> = [];
      const steps = 50;
      
      for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        const currentLat = startLat + (destLat - startLat) * ratio;
        const currentLng = startLng + (destLng - startLng) * ratio;
        simulatedCoordinates.push([currentLat, currentLng]);
      }

      // 3. 지도가 인식할 수 있도록 더미 데이터를 포함하여 고유 규격 포맷 패키징
      const combinedData = {
        ...response,
        verdict: response.results[1].prediction > 40 ? "WARNING" : "PASS",
        p_success: response.results[1].prediction > 40 ? 0.62 : 0.94,
        segments: [
          { polyline: simulatedCoordinates }
        ],
        alternatives: response.results[1].prediction > 40 ? [
          { name: `${params.destination} 우회 대안 카페 대시보드`, t_travel: 12, p_success: 0.88, place_type: 'cafe' },
          { name: `${params.destination} 인근 한산한 도심 스팟`, t_travel: 18, p_success: 0.82, place_type: 'tourist' }
        ] : []
      };

      console.log("🔥 이전 데모용 가동 파이프라인 데이터 결합 성공:", combinedData);
      
      setBackendPredictionResult(combinedData);
      setCurrentPage('result');

    } catch (error: any) {
      console.error("🚨 백엔드 통신 실패 (더미 가동 전환):", error);
      
      // 💡 [방어 코드 추가] 백엔드가 안 켜져 있어도 데모가 가능하도록 완벽하게 로컬 가짜 데이터로 우회시킵니다!
      const startLat = params.places?.[0]?.lat || 37.5445;
      const startLng = params.places?.[0]?.lng || 126.9056;
      const destLat = params.places?.[1]?.lat || 37.5489;
      const destLng = params.places?.[1]?.lng || 126.9123;

      const simulatedCoordinates: Array<[number, number]> = [];
      for (let i = 0; i <= 50; i++) {
        const ratio = i / 50;
        simulatedCoordinates.push([startLat + (destLat - startLat) * ratio, startLng + (destLng - startLng) * ratio]);
      }

      const dummyFallback = {
        verdict: "WARNING",
        p_success: 0.58,
        results: params.places,
        segments: [{ polyline: simulatedCoordinates }],
        alternatives: [
          { name: `${params.destination || '목적지'} 대신 가기 좋은 우회 플레이스`, t_travel: 11, p_success: 0.89, place_type: 'cafe' },
          { name: `${params.destination || '목적지'} 근처 쾌적한 힐링 장소`, t_travel: 15, p_success: 0.84, place_type: 'walk' }
        ]
      };

      setBackendPredictionResult(dummyFallback);
      setCurrentPage('result');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) return (
    <LoadingPage 
      message={`Route\nAnalysis`} 
      subMessage="AI 모델이 최적의 대안을 찾고 있습니다" 
      isDarkMode={isDarkMode} 
    />
  );

  return (
    <div className={`App h-screen w-full transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-900' : 'bg-[#F4F7F9]'}`}>
      {currentPage === 'login' && (
        <LoginPage 
          onSwitch={() => setCurrentPage('signup')} 
          onLogin={() => setCurrentPage('mypage')} 
          isDarkMode={isDarkMode} 
        />
      )}
      
      {currentPage === 'signup' && (
        <SignupPage 
          onSwitch={() => setCurrentPage('login')} 
          isDarkMode={isDarkMode} 
        />
      )}

      {currentPage === 'mypage' && (
        <MyPage 
          onGoToMap={() => setCurrentPage('mainmap')} 
          isExternalDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode} 
          seoulData={seoulData}
          isSeoulDataLoading={isSeoulDataLoading}
        />
      )}

      {currentPage === 'mainmap' && (
        <MainMapPage 
          onSearch={handleStartAnalysis}
          onGoToMyPage={() => setCurrentPage('mypage')}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode} 
          initialParams={searchParams}
          seoulData={seoulData}
        />
      )}

      {currentPage === 'result' && (
        <ResultPage 
          searchParams={searchParams}
          backendResult={backendPredictionResult} 
          onBack={() => setCurrentPage('mainmap')} 
          onGoToMyPage={() => setCurrentPage('mypage')}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode} 
          seoulData={seoulData}
        />
      )}
    </div>
  );
}

export default App;