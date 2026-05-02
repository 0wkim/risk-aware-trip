import React, { useState, useEffect } from 'react';
import LoadingPage from './pages/LoadingPage';
import MyPage from './pages/MyPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MainMapPage from './pages/MainMapPage';
import ResultPage from './pages/ResultPage';

// 검색 파라미터 타입 정의
interface SearchParams {
  startPoint: string;
  destination: string;
  maxHours: string;
  maxMinutes: string;
}

function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPage, setCurrentPage] = useState<'login' | 'signup' | 'mainmap' | 'mypage' | 'result'>('login');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 검색 파라미터 상태
  const [searchParams, setSearchParams] = useState<SearchParams>({
    startPoint: '제주공항',
    destination: '자매국수',
    maxHours: '1',
    maxMinutes: '10'
  });

  // 초기 진입 로딩 (3.5초)
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  // 모드 변경 함수 정의 (가독성을 위해 분리)
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // 검색 시 분석 로딩 (4초)
  const handleStartAnalysis = (params: SearchParams) => {
    setSearchParams(params);
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setCurrentPage('result');
    }, 4000);
  };

  if (isInitialLoading) return <LoadingPage message="VibeMap\nWelcome" />;
  if (isAnalyzing) return <LoadingPage message="Route\nAnalysis" subMessage="AI 모델이 최적의 대안을 찾고 있습니다" />;

  return (
    <div className={`App h-screen w-full transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-900' : 'bg-[#F4F7F9]'}`}>
      {currentPage === 'login' && (
        <LoginPage onSwitch={() => setCurrentPage('signup')} onLogin={() => setCurrentPage('mypage')} />
      )}
      
      {currentPage === 'signup' && (
        <SignupPage onSwitch={() => setCurrentPage('login')} />
      )}

      {currentPage === 'mypage' && (
        <MyPage 
          onGoToMap={() => setCurrentPage('mainmap')} 
          isExternalDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode} // 일관된 함수 사용
        />
      )}

      {currentPage === 'mainmap' && (
        <MainMapPage 
          onSearch={handleStartAnalysis}
          onGoToMyPage={() => setCurrentPage('mypage')}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode} // 전달 확인!
          initialParams={searchParams}
        />
      )}

      {currentPage === 'result' && (
        <ResultPage 
          searchParams={searchParams}
          onBack={() => setCurrentPage('mainmap')} 
          onGoToMyPage={() => setCurrentPage('mypage')}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode} 
        />
      )}
    </div>
  );
}

export default App;