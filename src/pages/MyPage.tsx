import React, { useState, useEffect } from 'react';
import { 
  MapPin, Route, Clock, Search, Sun, Moon, CloudSun, LogOut, Settings, ChevronRight, User, Lock, Mail, ChevronLeft, Layout
} from 'lucide-react';

interface MyPageProps {
  onGoToMap: () => void;
  isExternalDarkMode: boolean;
  toggleDarkMode: () => void;
}

const MyPage = ({ onGoToMap, isExternalDarkMode, toggleDarkMode }: MyPageProps) => {
  const isDarkMode = isExternalDarkMode;
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings'>('dashboard');
  
  // 미니멀 모드 토글 상태
  const [isMinimalMode, setIsMinimalMode] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: '최서영',
    email: 'seoyoung8939@gmail.com',
    password: '●●●●●●●●'
  });

  // 실시간 롤링 데이터
  const seoulStatus = [
    { district: '강남구', congestion: '혼잡', temp: '20°C' },
    { district: '마포구', congestion: '보통', temp: '19°C' },
    { district: '종로구', congestion: '여유', temp: '21°C' },
    { district: '성동구', congestion: '보통', temp: '18°C' },
    { district: '영등포구', congestion: '혼잡', temp: '17°C' },
    { district: '송파구', congestion: '여유', temp: '20°C' },
  ];

  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % seoulStatus.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [seoulStatus.length]);

  // 설정 버튼 토글 핸들러
  const handleSettingsToggle = () => {
    setCurrentView(prev => prev === 'settings' ? 'dashboard' : 'settings');
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center p-4 font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F4F7F9]'}`}>
      
      <div className={`w-full max-w-6xl h-[750px] rounded-[2.5rem] shadow-2xl flex overflow-hidden border transition-all duration-500 ${
        isDarkMode ? 'bg-[#1E293B] border-slate-700 shadow-black/40 text-slate-200' : 'bg-white border-slate-100 shadow-slate-200/50 text-slate-700'
      }`}>
        
        {/* [왼쪽] 메인 콘텐츠 영역 */}
        <main className="flex-1 flex flex-col overflow-hidden bg-transparent text-left">
          <header className={`px-12 py-10 flex justify-between items-center shrink-0 border-b transition-colors ${
            isDarkMode ? 'border-slate-700' : 'border-slate-50'
          }`}>
            <div className="flex items-center gap-5">
              {currentView === 'settings' && (
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className={`p-2.5 rounded-xl transition-all active:scale-90 ${
                    isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {currentView === 'dashboard' ? '마이페이지' : '개인정보 수정'}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">내 여행 기록과 선호도를 관리하세요.</p>
              </div>
            </div>
            
            <button 
              onClick={onGoToMap}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md active:scale-95 ${
                isDarkMode ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Search size={16} />
              지도 보기
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
            <div className={`max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all duration-500 ${isMinimalMode ? 'opacity-90 scale-[0.99]' : ''}`}>
              
              {currentView === 'dashboard' ? (
                <div className="space-y-10">
                  {/* 프로필 섹션 */}
                  <section className="flex items-center gap-6 text-left">
                    <div className={`w-24 h-24 rounded-full border-4 shadow-md overflow-hidden shrink-0 transition-colors ${
                      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-emerald-50 border-white'
                    }`}>
                      <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Seoyoung" alt="avatar" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{userInfo.name}</h3>
                      <p className="text-slate-400 font-medium text-sm">{userInfo.email}</p>
                      {!isMinimalMode && (
                        <div className="flex gap-2 mt-3">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>광운대학교</span>
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>데이터 사이언스</span>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* 통계 카드 (미니멀 모드 지원) */}
                  <div className={`grid ${isMinimalMode ? 'grid-cols-1' : 'grid-cols-3'} gap-4 transition-all duration-500`}>
                    <StatCard label="방문한 도시" value="24" color="bg-blue-500" isDarkMode={isDarkMode} isMinimal={isMinimalMode} />
                    <StatCard label="탐색한 경로" value="54" color="bg-emerald-500" isDarkMode={isDarkMode} isMinimal={isMinimalMode} />
                    <StatCard label="저장한 장소" value="12" color="bg-rose-500" isDarkMode={isDarkMode} isMinimal={isMinimalMode} />
                  </div>

                  {/* 최근 검색 기록 (미니멀 모드에서는 숨김) */}
                  {!isMinimalMode && (
                    <section className="space-y-6">
                      <div className="flex justify-between items-end">
                        <h4 className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                          <Clock size={18} className="text-slate-400" /> 최근 검색 기록
                        </h4>
                        <button className="text-xs text-slate-400 hover:text-emerald-500 underline">전체기록 삭제</button>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <HistoryItem from="노원역" to="강남역" date="2026.04.28" isDarkMode={isDarkMode} />
                        <HistoryItem from="성수동" to="홍대입구" date="2026.04.25" isDarkMode={isDarkMode} />
                      </div>
                    </section>
                  )}
                </div>
              ) : (
                /* 환경 설정 뷰 */
                <div className="space-y-6 text-left">
                  <div className={`p-8 rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                    <h5 className="font-bold mb-6 text-emerald-500 flex items-center gap-2"><User size={18} /> 정보 수정</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">이름</label>
                        <input type="text" className={`w-full p-4 rounded-2xl border bg-transparent outline-none font-bold transition-all ${isDarkMode ? 'border-slate-700 text-white bg-slate-900' : 'border-slate-200 text-slate-800 bg-white'}`} value={userInfo.name} onChange={(e) => setUserInfo({...userInfo, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">이메일 주소</label>
                        <input type="email" className={`w-full p-4 rounded-2xl border bg-transparent outline-none font-bold transition-all ${isDarkMode ? 'border-slate-700 text-white bg-slate-900' : 'border-slate-200 text-slate-800 bg-white'}`} value={userInfo.email} onChange={(e) => setUserInfo({...userInfo, email: e.target.value})} />
                      </div>
                    </div>
                    <button className="mt-8 px-8 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95">정보 저장</button>
                  </div>

                  <div className={`p-8 rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                    <h5 className="font-bold mb-6 text-rose-500 flex items-center gap-2"><Lock size={18} /> 보안 설정</h5>
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                      <div>
                        <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>비밀번호 변경</p>
                        <p className="text-xs text-slate-500 mt-1">안전을 위해 주기적으로 변경하세요.</p>
                      </div>
                      <button className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl font-bold text-xs active:scale-95 transition-all">변경하기</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* [오른쪽] 사이드바 영역 */}
        <aside className={`w-80 border-l p-10 flex flex-col transition-colors duration-500 ${
          isDarkMode ? 'bg-[#1E293B]/80 border-slate-700' : 'bg-slate-50 border-slate-100'
        }`}>
          {/* 상단 로고 및 설정 버튼 (토글 기능 포함) */}
          <div className="flex items-center justify-between mb-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Route size={24} />
              </div>
              <span className={`font-bold text-xl tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>ArriView</span>
            </div>
            
            <button 
              onClick={handleSettingsToggle}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 ${
                currentView === 'settings' 
                ? 'bg-emerald-500 text-white' 
                : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-white text-slate-500 hover:text-emerald-500'
              }`}
            >
              <Settings size={20} />
            </button>
          </div>

          {/* 실시간 위젯 */}
          <div className={`mb-10 rounded-[2.5rem] overflow-hidden border aspect-square flex flex-col shadow-xl shrink-0 transition-all ${
            isDarkMode ? 'bg-slate-800 border-slate-700 shadow-black/20' : 'bg-white border-slate-200 shadow-slate-200/50'
          }`}>
            <div className="p-5 border-b border-inherit flex items-center justify-between bg-inherit">
              <span className="text-[11px] font-black uppercase tracking-widest opacity-50">Live Status</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="flex-1 relative overflow-hidden text-center bg-inherit">
              <div className="flex flex-col h-full transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]" style={{ transform: `translateY(-${tickerIndex * 100}%)` }}>
                {seoulStatus.map((item, idx) => (
                  <div key={idx} className="h-full w-full flex flex-col items-center justify-center p-6 gap-3 shrink-0 bg-inherit">
                    <span className="text-sm font-bold text-slate-400">{item.district}</span>
                    <div className={`px-4 py-1.5 rounded-full text-[11px] font-black text-white ${item.congestion === '혼잡' ? 'bg-rose-500' : item.congestion === '보통' ? 'bg-amber-500' : 'bg-blue-500'}`}>{item.congestion}</div>
                    <div className="flex items-center gap-3 mt-2"><CloudSun size={32} className="text-emerald-500" /><span className="text-3xl font-black tracking-tighter">{item.temp}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 개인화 설정 (토글 스위치들) */}
          <div className="flex-1 flex flex-col text-left space-y-6">
            <div>
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4">Display Options</h4>
              <div className="space-y-2">
                {/* 다크모드 설정 */}
                <button 
                  onClick={toggleDarkMode} 
                  className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-bold transition-all border ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-yellow-400' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    <span>다크 모드</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${isDarkMode ? 'bg-yellow-400' : 'bg-slate-200'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isDarkMode ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </button>

                {/* 미니멀 모드 설정 */}
                <button 
                  onClick={() => setIsMinimalMode(!isMinimalMode)} 
                  className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-bold transition-all border ${
                    isMinimalMode 
                    ? (isDarkMode ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm') 
                    : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50 shadow-sm')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layout size={18} />
                    <span>미니멀 모드</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full relative transition-colors ${isMinimalMode ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isMinimalMode ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* 하단 로그아웃 */}
          <div className="pt-6 border-t border-inherit flex justify-center shrink-0">
            <button className="flex items-center gap-2 py-2 px-4 text-slate-400 hover:text-rose-500 transition-colors text-sm font-bold">
              <LogOut size={16} /> 로그아웃
            </button>
          </div>
        </aside>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#334155' : '#E2E8F0'}; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${isDarkMode ? '#475569' : '#CBD5E1'}; }
      `}</style>
    </div>
  );
};

/* 보조 컴포넌트 */
const StatCard = ({ label, value, color, isDarkMode, isMinimal }: any) => (
  <div className={`p-5 rounded-2xl border transition-all duration-500 text-left ${
    isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'
  } ${isMinimal ? 'flex justify-between items-center py-4' : ''}`}>
    <p className={`font-bold text-slate-400 uppercase tracking-wider ${isMinimal ? 'text-[9px] mb-0' : 'text-[10px] mb-1'}`}>{label}</p>
    <div className="flex items-baseline gap-1">
      <span className={`${isMinimal ? 'text-lg' : 'text-2xl'} font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{value}</span>
      <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
    </div>
  </div>
);

const HistoryItem = ({ from, to, date, isDarkMode }: any) => (
  <div className={`group p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${isDarkMode ? 'bg-slate-800/30 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800' : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-md'}`}>
    <div className="flex items-center gap-4 text-left">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50'}`}><MapPin size={18} /></div>
      <div><p className={`font-bold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{from} → {to}</p><p className="text-[11px] text-slate-500 font-medium">{date}</p></div>
    </div>
    <ChevronRight size={18} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
  </div>
);

export default MyPage;