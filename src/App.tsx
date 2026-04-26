import React, { useState, useEffect } from 'react';
import LoadingPage from './pages/LoadingPage';
import MyPage from './pages/MyPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MainMapPage from './pages/MainMapPage';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'login' | 'signup' | 'mainmap'>('login');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <LoadingPage />;

  return (
    <div className="App">
      {currentPage === 'login' && (
        <LoginPage 
          onSwitch={() => setCurrentPage('signup')} 
          onLogin={() => setCurrentPage('mainmap')} // 로그인 성공 시 메인 맵으로
        />
      )}
      
      {currentPage === 'signup' && (
        <SignupPage onSwitch={() => setCurrentPage('login')} />
      )}

      {currentPage === 'mainmap' && (
        <MainMapPage />
      )}
    </div>
  );
}

export default App;