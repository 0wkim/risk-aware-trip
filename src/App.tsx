import React, { useState, useEffect } from 'react';
import LoadingPage from './pages/LoadingPage';
import MyPage from './pages/MyPage';
import './App.css';

function App() {
  // 처음에는 로딩 상태를 true로 설정합니다.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 실제 서비스에서는 여기서 API 데이터를 불러오거나 분석을 수행합니다.
    // 지금은 애니메이션을 충분히 보여주기 위해 3.5초 뒤에 로딩을 종료합니다.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App">
      {isLoading ? (
        /* 로딩 중일 때 보여줄 화면 */
        <LoadingPage />
      ) : (
        /* 로딩이 완료된 후 보여줄 화면 */
        <MyPage />
      )}
    </div>
  );
}

export default App;