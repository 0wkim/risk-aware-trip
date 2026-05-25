import React, { useState, useEffect } from 'react';
import LoadingPage from './pages/LoadingPage';
import MyPage from './pages/MyPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MainMapPage from './pages/MainMapPage';
import ResultPage from './pages/ResultPage';

interface SearchParams {
  startPoint: string;
  destination: string;
  maxHours: string;
  maxMinutes: string;
}

type PageType = 'login' | 'signup' | 'mainmap' | 'mypage' | 'result';

const SEOUL_API_KEY = import.meta.env.VITE_SEOUL_API_KEY;

// 전체 25개 구 API 타겟 매핑 (App에서 통합 관리)
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

  // 전역 서울시 API 데이터 상태
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

  // App 마운트 시 최초 1회만 API 호출
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

  const handleStartAnalysis = (params: SearchParams) => {
    setSearchParams(params);
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setCurrentPage('result');
    }, 4000);
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