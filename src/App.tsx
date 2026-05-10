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

function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPage, setCurrentPage] = useState<'login' | 'signup' | 'mainmap' | 'mypage' | 'result'>('login');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    startPoint: '성수역 3번 출구',
    destination: '까치화방 카페 성수점',
    maxHours: '1',
    maxMinutes: '10'
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 3500);
    return () => clearTimeout(timer);
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

  // 수정된 조건문: 중괄호와 백틱을 사용하여 더 명확하게 전달
  if (isInitialLoading) return <LoadingPage message={`ArriView\nWelcome`} isDarkMode={isDarkMode} />;
  
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
        <LoginPage onSwitch={() => setCurrentPage('signup')} onLogin={() => setCurrentPage('mypage')} />
      )}
      
      {currentPage === 'signup' && (
        <SignupPage onSwitch={() => setCurrentPage('login')} />
      )}

      {currentPage === 'mypage' && (
        <MyPage 
          onGoToMap={() => setCurrentPage('mainmap')} 
          isExternalDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode} 
        />
      )}

      {currentPage === 'mainmap' && (
        <MainMapPage 
          onSearch={handleStartAnalysis}
          onGoToMyPage={() => setCurrentPage('mypage')}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode} 
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