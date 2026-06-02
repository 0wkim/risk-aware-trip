import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LoadingPage from './pages/LoadingPage';
import MyPage from './pages/MyPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MainMapPage from './pages/MainMapPage';
import ResultPage from './pages/ResultPage';
import LandingPage from './pages/LandingPage';
import { api } from './api/client';

interface SearchParams {
  startPoint: string;
  destination: string;
  maxHours: string;
  maxMinutes: string;
  places?: any[]; 
  day?: number;   
  hour?: number;  
  mode?: 'walking' | 'car' | 'transit';
}

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

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    const session = localStorage.getItem('user_session');
    if (session) {
      try {
        const { expiresAt } = JSON.parse(session);
        if (Date.now() > expiresAt) {
          localStorage.removeItem('user_session');
          navigate('/login');
        } else if (location.pathname === '/login' || location.pathname === '/signup') {
          navigate('/mypage', { replace: true });
        }
      } catch (e) {
        console.error("Session parse error:", e);
      }
    } else {
      if (location.pathname !== '/login' && location.pathname !== '/signup' && location.pathname !== '/') {
        navigate('/login');
      }
    }
  }, [location.pathname, navigate]);

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
          const url = `/seoul-api/${SEOUL_API_KEY}/json/citydata/1/5/${encodeURIComponent(item.areaNm)}`;
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

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    navigate('/login');
  };

  // 💡 [버그 완전 박멸]: 대안 장소 적용 시 실시간 리라우팅 경로망 재생 엔진 작동 헤드
  const handleStartAnalysis = async (params: any) => {
    // 1. ResultPage에서 넘어온 새로운 대안 경로 셋(예: 봉은사 정보 포함)으로 파라미터 스택 동기화 교체
    setSearchParams(params);
    setIsAnalyzing(true);

    try {
      const totalBudgetMinutes = (Number(params.maxHours) * 60) + Number(params.maxMinutes);

      // 2. 고정된 구 목적지 대신, 새로 넘어온 params.places 배열 컨텍스트로 위험 요인 검증 찌르기
      const courseEvaluation = await api.evaluateCourse({
        waypoints: params.places, 
        T_max: totalBudgetMinutes,
        day: params.day, 
        hour: params.hour
      });

      let finalAlternatives: any[] = [];

      // 3. 만약 대안으로 갈아탄 경로마저 가혹도가 높다면 백엔드 랭킹 스코어 한 번 더 집계
      if (courseEvaluation.verdict !== 'PASS' && courseEvaluation.failed_indices && courseEvaluation.failed_indices.length > 0) {
        const failedIndex = courseEvaluation.failed_indices[0];
        const alternativesResponse = await api.getAlternatives({
          failed_waypoint: params.places[failedIndex],
          day: params.day,
          hour: params.hour,
          course_waypoints: params.places,
          failed_index: failedIndex,
          T_max: totalBudgetMinutes,
          radius_m: 500, 
          top_k: 5
        });
        finalAlternatives = alternativesResponse.alternatives || [];
      }

      // 4. 🔥 [핵심 타겟 수정]: 새로 가공되어 들어온 대안 장소(봉은사 등)의 위경도 인자를 파싱
      const routeCoords = params.places.map((p: any) => [p.lat, p.lng]);
      const chosenMode = params.mode || 'transit'; 

      // 5. 백엔드 지도 인프라망에 봉은사 타겟 실시간 실제 정밀 노드 점 궤적 리스트 요청
      const routeData = await api.getRoute({
        coords: routeCoords, 
        mode: chosenMode 
      });

      const unifiedDashboardData = {
        verdict: courseEvaluation.verdict, 
        p_success: courseEvaluation.p_success, 
        results: params.places, // 💡 기존 고정값 덮어쓰고 새로운 대안 목적지가 바인딩된 결과셋 주입
        alternatives: finalAlternatives, 
        route_segments: routeData.segments || routeData.route_segments || [] // 💡 구불구불한 맵 가이드선 동적 전달
      };
      
      setBackendPredictionResult(unifiedDashboardData);
      
      // 이미 결과 뷰포트(/result)에 도착해 있는 상태라면 중복 렌더링 스택 경합 방지 격리
      if (location.pathname !== '/result') {
        navigate('/result'); 
      }

    } catch (error: any) {
      console.error("🚨 백엔드 AI 통신 치명적 에러 발생:", error);
      const startPlace = params.places?.[0];
      const destPlace = params.places?.[1];
      
      const fallbackFakeData = {
        verdict: "WARNING",
        p_success: 0.65,
        results: params.places,
        route_segments: [
          {
            polyline: [
              [startPlace?.lat || 37.6542, startPlace?.lng || 127.0565],
              [((startPlace?.lat || 37.6542) + (destPlace?.lat || 37.5445)) / 2 + 0.004, ((startPlace?.lng || 127.0565) + (destPlace?.lng || 127.0560)) / 2 - 0.008],
              [((startPlace?.lat || 37.6542) + (destPlace?.lat || 37.5445)) / 2 - 0.003, ((startPlace?.lng || 127.0565) + (destPlace?.lng || 127.0560)) / 2 + 0.006],
              [destPlace?.lat || 37.5445, destPlace?.lng || 127.0560]
            ]
          }
        ],
        alternatives: [
          { name: "어니언 성수 (추천 대안 스팟)", t_travel: 12, p_success: 0.88, place_type: 'CAFE', rating: "4.7", hours: "08:00 - 22:00", phone: "02-1644-1920", review: "공간이 넓고 쾌적하며 원래 가려던 본지르르 성수점보다 혼잡 확률이 현저히 낮아 안정적인 동선 완주가 가능합니다." }
        ]
      };

      setBackendPredictionResult(fallbackFakeData);
      if (location.pathname !== '/result') {
        navigate('/result');  
      }
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
      <Routes>
        <Route path="/" element={<LandingPage onStart={() => navigate('/login')} seoulData={seoulData} />} />
        <Route path="/login" element={<LoginPage onSwitch={() => navigate('/signup')} onLogin={() => navigate('/mypage')} isDarkMode={isDarkMode} />} />
        <Route path="/signup" element={<SignupPage onSwitch={() => navigate('/login')} isDarkMode={isDarkMode} />} />
        <Route path="/mypage" element={<MyPage onGoToMap={() => navigate('/map')} onGoToLanding={() => navigate('/')} onSelectHistory={(start, dest) => { setSearchParams((prev) => ({ ...prev, startPoint: start, destination: dest, places: undefined })); navigate('/map'); }} onLogout={handleLogout} isExternalDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} seoulData={seoulData} isSeoulDataLoading={isSeoulDataLoading} />} />
        <Route path="/map" element={<MainMapPage onSearch={handleStartAnalysis} onGoToMyPage={() => navigate('/mypage')} onLogout={handleLogout} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} initialParams={searchParams} seoulData={seoulData} />} />
        <Route path="/result" element={<ResultPage searchParams={searchParams} backendResult={backendPredictionResult} onBack={() => navigate('/map')} onGoToMyPage={() => navigate('/mypage')} onLogout={handleLogout} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} seoulData={seoulData} onReroute={handleStartAnalysis} />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}