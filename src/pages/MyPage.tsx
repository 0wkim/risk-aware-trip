import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, Clock, Search, Sun, Moon, CloudSun, LogOut, Settings, 
  ChevronRight, User, Maximize2, Minimize2, X, Thermometer, Users, Trash2, Coffee, Utensils, Landmark, HelpCircle, ChevronLeft
} from 'lucide-react';

export interface SeoulDataItem {
  district: string;
  congestion: string;
  temp: string;
  realAreaName?: string;
  weatherText?: string;
  [key: string]: unknown;
}

interface MyPageProps {
  onGoToMap: () => void;
  onLogout: () => void;
  onGoToLanding: () => void;
  isExternalDarkMode: boolean;
  toggleDarkMode: () => void;
  seoulData: SeoulDataItem[]; 
  isSeoulDataLoading: boolean; 
  onSelectHistory?: (start: string, dest: string) => void;
}

interface FavoriteItem {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  place_id: string;
  categories: string[];
  customCategory: 'cafe' | 'restaurant' | 'spot' | 'other';
}

interface SearchHistoryItem {
  id: string;
  startPoint: string;
  destination: string;
  date: string;
}

const MyPage = ({ 
  onGoToMap, 
  onLogout, 
  onGoToLanding, 
  isExternalDarkMode, 
  toggleDarkMode, 
  seoulData, 
  isSeoulDataLoading, 
  onSelectHistory 
}: MyPageProps) => {
  const isDarkMode = isExternalDarkMode;
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings'>('dashboard');
  const [isMinimalMode, setIsMinimalMode] = useState(false);
  
  const [tickerIndex, setTickerIndex] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false); 
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [userInfo, setUserInfo] = useState(() => {
    const session = localStorage.getItem('user_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        return {
          name: parsed.userName || '사용자',
          email: parsed.userId || 'unknown@domain.com',
          loginType: parsed.loginType || 'email',
          department: parsed.department || '여유로운 산책파' 
        };
      } catch (e) {
        console.error(e);
      }
    }
    return {
      name: '홍길동',
      email: 'seoyoung8939@gmail.com',
      loginType: 'email',
      department: '여유로운 산책파'
    };
  });

  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    const saved = localStorage.getItem('custom_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(() => {
    const saved = localStorage.getItem('search_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    Promise.resolve().then(() => {
      const savedFavs = localStorage.getItem('custom_favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedHistory = localStorage.getItem('search_history');
      if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
    });
  }, [currentView, showFavoriteModal]);

  const handleUpdateUserInfo = (field: 'name' | 'email' | 'department', value: string) => {
    const updated = { ...userInfo, [field]: value };
    setUserInfo(updated);

    const session = localStorage.getItem('user_session');
    if (session) {
      const parsed = JSON.parse(session);
      if (field === 'name') parsed.userName = value;
      if (field === 'email') parsed.userId = value;
      if (field === 'department') parsed.department = value;
      localStorage.setItem('user_session', JSON.stringify(parsed));
      
      window.dispatchEvent(new Event('userInfoUpdated'));
    }

    if (field !== 'department') {
      const users = JSON.parse(localStorage.getItem('user_db') || '[]');
      const userIndex = users.findIndex((u: Record<string, unknown>) => u.email === userInfo.email);
      if (userIndex !== -1) {
        users[userIndex][field] = value;
        localStorage.setItem('user_db', JSON.stringify(users));
      }
    }
  };

  const handleDeleteFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.filter(item => item.id !== id);
    setFavorites(updated);
    localStorage.setItem('custom_favorites', JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    if (window.confirm('모든 검색 기록을 삭제하시겠습니까?')) {
      localStorage.removeItem('search_history');
      setSearchHistory([]);
    }
  };

  const getFavoriteIcon = (cat: string) => {
    switch (cat) {
      case 'cafe': return <Coffee size={16} className="w-4 h-4" />;
      case 'restaurant': return <Utensils size={16} className="w-4 h-4" />;
      case 'spot': return <Landmark size={16} className="w-4 h-4" />;
      default: return <HelpCircle size={16} className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    if (seoulData.length === 0 || showDetailModal) return;
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % seoulData.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [seoulData.length, showDetailModal]);

  const filteredStatus = useMemo(() => {
    return seoulData.filter(s => s.district.includes(searchTerm));
  }, [seoulData, searchTerm]);

  const loginTypeBadge = useMemo(() => {
    if (userInfo.loginType === 'google') {
      return <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 whitespace-nowrap">Google 연동됨</span>;
    }
    if (userInfo.loginType === 'kakao') {
      return <span className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#FEE500]/20 text-[#3C1E1E] dark:text-[#FEE500] border border-[#FEE500]/30 whitespace-nowrap">Kakao 연동됨</span>;
    }
    return null;
  }, [userInfo.loginType, isDarkMode]);

  return (
    <div className={`fixed inset-0 flex items-center justify-center p-0 lg:p-4 font-sans transition-all duration-500 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F4F7F9]'}`}>
      
      {/* 모바일에서는 전체 뷰포트를 채우며 스크롤이 가능하도록 변경 (w-full h-full rounded-none overflow-y-auto).
        데스크탑에서는 기존의 둥근 모서리와 고정된 높이(h-[750px])를 유지.
      */}
      <div className={`w-full h-full lg:max-w-6xl lg:h-[750px] lg:rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden border-0 lg:border transition-all duration-500 ${showDetailModal || showFavoriteModal ? 'scale-[0.98] blur-sm lg:scale-95 lg:blur-md' : 'scale-100'} ${
        isDarkMode ? 'bg-[#1E293B] lg:border-slate-700 text-slate-200' : 'bg-white lg:border-slate-100 text-slate-700'
      }`}>
        
        {/* 왼쪽 메인 컨텐츠 영역 */}
        <main className="flex-1 flex flex-col lg:overflow-hidden bg-transparent text-left h-auto lg:h-full shrink-0">
          <header className={`px-5 py-4 md:px-12 md:py-10 flex justify-between items-center shrink-0 border-b transition-colors sticky top-0 z-10 backdrop-blur-md ${
            isDarkMode ? 'border-slate-700 bg-[#1E293B]/90' : 'border-slate-50 bg-white/90'
          }`}>
            <div className="flex items-center gap-3 md:gap-5">
              {currentView === 'settings' && (
                <button onClick={() => setCurrentView('dashboard')} className={`p-2 md:p-2.5 rounded-xl transition-all active:scale-90 ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                  <ChevronLeft size={20} className="w-5 h-5 md:w-5 md:h-5" />
                </button>
              )}
              <div>
                <h2 className={`text-lg md:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {currentView === 'dashboard' ? '마이페이지' : '개인정보 및 환경 설정'}
                </h2>
                <p className="text-xs md:text-sm text-slate-400 mt-0.5">내 여행 기록과 선호도를 관리하세요.</p>
              </div>
            </div>
            <button onClick={onGoToMap} className={`flex items-center gap-1.5 md:gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all shadow-md active:scale-95 ${
                isDarkMode ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}>
              <Search size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">지도 보기</span><span className="sm:hidden">지도</span>
            </button>
          </header>

          <div className="flex-1 lg:overflow-y-auto p-5 md:p-12 custom-scrollbar">
            <div className={`max-w-3xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all ${isMinimalMode ? 'opacity-80 scale-[0.98]' : ''}`}>
              {currentView === 'dashboard' ? (
                <div className="space-y-8 md:space-y-10">
                  {/* 프로필 섹션 */}
                  <section className="flex flex-col sm:flex-row items-center sm:items-center gap-4 md:gap-6 text-center sm:text-left">
                    <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-4 shadow-md overflow-hidden shrink-0 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-emerald-50 border-white'}`}>
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userInfo.name)}`} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col items-center sm:items-start">
                      <h3 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{userInfo.name}</h3>
                      <p className="text-slate-400 font-medium text-xs md:text-sm">{userInfo.email}</p>
                      {!isMinimalMode && (
                        <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 md:gap-2 mt-2.5 md:mt-3">
                          {loginTypeBadge}
                          <span className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                            {userInfo.department}
                          </span>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* 통계 카드 */}
                  <div className={`grid ${isMinimalMode ? 'grid-cols-1' : 'grid-cols-2'} gap-4 md:gap-6 transition-all duration-500`}>
                    <StatCard label="총 검색 횟수" value={searchHistory.length.toString()} color="bg-blue-500" isDarkMode={isDarkMode} isMinimal={isMinimalMode} />
                    <div onClick={() => setShowFavoriteModal(true)} className="cursor-pointer group">
                      <StatCard label="저장한 장소 (확인)" value={favorites.length.toString()} color="bg-rose-500" isDarkMode={isDarkMode} isMinimal={isMinimalMode} />
                    </div>
                  </div>

                  {/* 최근 검색 기록 */}
                  {!isMinimalMode && (
                    <section className="space-y-4 md:space-y-6">
                      <div className="flex justify-between items-end">
                        <h4 className={`font-bold flex items-center gap-2 text-sm md:text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                          <Clock size={16} className="text-slate-400 md:w-[18px] md:h-[18px]" /> 최근 검색 기록
                        </h4>
                        {searchHistory.length > 0 && (
                          <button onClick={handleClearHistory} className="text-[11px] md:text-xs text-slate-400 hover:text-rose-500 underline transition-colors">전체기록 삭제</button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {searchHistory.length === 0 ? (
                          <div className={`text-center py-8 md:py-10 rounded-2xl border border-dashed text-xs md:text-sm font-semibold text-slate-400 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                            최근 주행 교차 탐색 분석 기록이 존재하지 않습니다.
                          </div>
                        ) : (
                          [...searchHistory].reverse().slice(0, 4).map((hist) => (
                            <HistoryItem 
                              key={hist.id} 
                              from={hist.startPoint} 
                              to={hist.destination} 
                              date={hist.date} 
                              isDarkMode={isDarkMode}
                              onClick={() => onSelectHistory && onSelectHistory(hist.startPoint, hist.destination)}
                            />
                          ))
                        )}
                      </div>
                    </section>
                  )}
                </div>
              ) : (
                <div className="space-y-6 text-left">
                  <div className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                    <h5 className="font-bold mb-5 md:mb-6 text-emerald-500 flex items-center gap-2 text-sm md:text-base"><User size={16} className="md:w-[18px] md:h-[18px]" /> 정보 수정</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">이름</label>
                        <input type="text" className={`w-full p-3.5 md:p-4 rounded-xl md:rounded-2xl border bg-transparent outline-none font-bold text-xs md:text-sm transition-all ${isDarkMode ? 'border-slate-700 text-white bg-slate-900' : 'border-slate-200 text-slate-800 bg-white'}`} value={userInfo.name} onChange={(e) => handleUpdateUserInfo('name', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">이메일 주소</label>
                        <input type="email" className={`w-full p-3.5 md:p-4 rounded-xl md:rounded-2xl border bg-transparent outline-none font-bold text-xs md:text-sm transition-all ${isDarkMode ? 'border-slate-700 text-white bg-slate-900' : 'border-slate-200 text-slate-800 bg-white'}`} value={userInfo.email} onChange={(e) => handleUpdateUserInfo('email', e.target.value)} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                          나의 여행 및 이동 성향 (프로필 반영)
                        </label>
                        <select 
                          className={`w-full p-3.5 md:p-4 rounded-xl md:rounded-2xl border outline-none font-bold text-xs md:text-sm transition-all appearance-none ${
                            isDarkMode ? 'border-slate-700 text-white bg-slate-900 focus:border-emerald-500' : 'border-slate-200 text-slate-800 bg-white focus:border-emerald-500'
                          }`}
                          value={userInfo.department} 
                          onChange={(e) => handleUpdateUserInfo('department', e.target.value)}
                        >
                          <option value="여유로운 산책파">🍃 여유로운 산책파</option>
                          <option value="핫플레이스 탐험가">🔥 핫플레이스 탐험가</option>
                          <option value="카페/맛집 투어러">☕ 카페·맛집 투어러</option>
                          <option value="뚜벅이 여행자">🚶‍♂️ 대중교통 중심 뚜벅이</option>
                          <option value="빠른 이동 최우선">⚡ 번잡해도 무조건 빠른 길</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* 오른쪽 설정 탭 영역 (모바일에서는 스크롤 밑으로 빠짐) */}
        <aside className={`w-full lg:w-80 border-t lg:border-t-0 lg:border-l p-6 md:p-10 flex flex-col shrink-0 transition-colors duration-500 pb-12 lg:pb-10 ${isDarkMode ? 'bg-[#1E293B]/80 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center justify-between mb-8 md:mb-10 shrink-0">
            <button 
              onClick={onGoToLanding} 
              className="group flex items-center gap-2.5 md:gap-3 cursor-pointer active:scale-95 transition-all hover:opacity-80 bg-transparent border-none outline-none focus:outline-none"
            >
              <img 
                src="/logo.svg" 
                alt="ArriView Logo" 
                className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-md group-hover:rotate-12 transition-transform duration-300"
              />
              <span className={`font-bold text-lg md:text-xl tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                ArriView
              </span>
            </button>
            <button onClick={() => setCurrentView(v => v === 'dashboard' ? 'settings' : 'dashboard')} className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-md transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-white text-slate-500 hover:text-emerald-500'} ${currentView === 'settings' ? 'ring-2 ring-emerald-500' : ''}`}><Settings size={18} className="md:w-5 md:h-5" /></button>
          </div>

          <div onClick={() => setShowDetailModal(true)} className={`mb-8 md:mb-10 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border aspect-[2/1] lg:aspect-square flex flex-col shadow-xl cursor-pointer group transition-all lg:hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-black/20' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
            <div className="p-4 md:p-5 border-b border-inherit flex items-center justify-between bg-inherit group-hover:bg-emerald-500/5 transition-colors">
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest opacity-50">Live Status</span>
              <Maximize2 size={14} className="text-emerald-500 animate-pulse" />
            </div>
            <div className="flex-1 relative overflow-hidden text-center bg-inherit">
              {isSeoulDataLoading ? (
                <div className="h-full flex items-center justify-center text-[11px] md:text-xs animate-pulse">데이터 로드 중...</div>
              ) : (
                <div className="flex flex-col h-full transition-transform duration-1000 ease-in-out" style={{ transform: `translateY(-${tickerIndex * 100}%)` }}>
                  {seoulData.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="h-full w-full flex flex-col lg:flex-col items-center justify-center p-4 md:p-6 gap-2 md:gap-3 shrink-0">
                      <span className="text-xs md:text-sm font-bold text-slate-400">{item.district}</span>
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-[11px] font-black text-white ${item.congestion.includes('혼잡') ? 'bg-rose-500' : 'bg-blue-500'}`}>{item.congestion}</div>
                        <div className="flex items-center gap-1.5 md:gap-3"><CloudSun size={24} className="text-emerald-500 md:w-8 md:h-8" /><span className="text-2xl md:text-3xl font-black">{item.temp}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col text-left space-y-6 md:space-y-8">
            <div>
              <h4 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3 md:mb-4">Theme Mode</h4>
              <div className={`flex p-1.5 rounded-[1rem] md:rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-200 border-slate-200'}`}>
                <button onClick={() => { if (isDarkMode) toggleDarkMode(); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 md:py-3 rounded-[0.85rem] md:rounded-xl font-bold text-xs md:text-sm transition-all ${!isDarkMode ? 'bg-white text-amber-500 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}><Sun size={16} className="md:w-[18px] md:h-[18px]" /><span>Light</span></button>
                <button onClick={() => { if (!isDarkMode) toggleDarkMode(); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 md:py-3 rounded-[0.85rem] md:rounded-xl font-bold text-xs md:text-sm transition-all ${isDarkMode ? 'bg-slate-800 text-indigo-400 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}><Moon size={16} className="md:w-[18px] md:h-[18px]" /><span>Dark</span></button>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3 md:mb-4">Layout View</h4>
              <div className={`flex p-1.5 rounded-[1rem] md:rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-200 border-slate-200'}`}>
                <button onClick={() => setIsMinimalMode(false)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 md:py-3 rounded-[0.85rem] md:rounded-xl font-bold text-xs md:text-sm transition-all ${!isMinimalMode ? (isDarkMode ? 'bg-slate-800 text-emerald-400 shadow-md' : 'bg-white text-emerald-600 shadow-md') : 'text-slate-500 hover:text-slate-400'}`}><Maximize2 size={14} className="md:w-4 md:h-4" /><span>Default</span></button>
                <button onClick={() => setIsMinimalMode(true)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 md:py-3 rounded-[0.85rem] md:rounded-xl font-bold text-xs md:text-sm transition-all ${isMinimalMode ? (isDarkMode ? 'bg-slate-800 text-emerald-400 shadow-md' : 'bg-white text-emerald-600 shadow-md') : 'text-slate-500 hover:text-slate-400'}`}><Minimize2 size={14} className="md:w-4 md:h-4" /><span>Focus</span></button>
              </div>
            </div>
          </div>

          <div className="pt-8 md:pt-6 border-t border-inherit flex justify-center shrink-0 mt-8 md:mt-0">
            <button onClick={onLogout} className="flex items-center gap-2 py-2 px-4 text-slate-400 hover:text-rose-500 transition-colors text-xs md:text-sm font-bold"><LogOut size={14} className="md:w-4 md:h-4" /> 로그아웃</button>
          </div>
        </aside>
      </div>

      {/* 즐겨찾기 모달 (모바일에서는 바텀 시트 형태로 아래서 위로 올라옴) */}
      {showFavoriteModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowFavoriteModal(false)} />
          <div className={`relative w-full max-w-xl h-[85vh] sm:h-[70vh] rounded-t-[2rem] sm:rounded-b-[2rem] sm:rounded-[3rem] mt-auto sm:mt-0 shadow-2xl flex flex-col overflow-hidden border transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-[#F2F2F7] border-white'}`}>
            <div className="w-12 h-1.5 bg-slate-300/50 dark:bg-slate-600/50 rounded-full mx-auto mt-3 sm:hidden" />
            <div className="p-6 sm:p-8 pb-4 flex items-center justify-between">
              <div>
                <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>즐겨찾는 스팟 목록</h3>
                <p className="text-slate-400 text-[11px] sm:text-xs font-medium mt-1">MainMapPage에서 추가 및 연동 관리되는 청정 구역 리스트입니다.</p>
              </div>
              <button onClick={() => setShowFavoriteModal(false)} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-white text-slate-900 hover:bg-slate-100'}`}>
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-8 custom-scrollbar space-y-3 mt-2 sm:mt-4">
              {favorites.length === 0 ? (
                <div className="py-20 text-center text-slate-400 font-bold text-xs sm:text-sm">등록된 즐겨찾는 장소가 없습니다.</div>
              ) : (
                favorites.map(fav => (
                  <div key={fav.id} className={`group w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1 text-left">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        fav.customCategory === 'cafe' ? (isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600') :
                        fav.customCategory === 'restaurant' ? (isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600') :
                        fav.customCategory === 'spot' ? (isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600') :
                        (isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-50 text-slate-500')
                      }`}>
                        {getFavoriteIcon(fav.customCategory)}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className={`font-black text-xs sm:text-sm tracking-tight truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{fav.name}</p>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0 ${
                            fav.customCategory === 'cafe' ? 'bg-amber-500/10 text-amber-500' :
                            fav.customCategory === 'restaurant' ? 'bg-blue-500/10 text-blue-500' :
                            fav.customCategory === 'spot' ? 'bg-purple-500/10 text-purple-500' : 'bg-slate-500/10 text-slate-400'
                          }`}>{fav.customCategory || 'OTHER'}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5 w-full">{fav.address}</p>
                      </div>
                    </div>
                    <button onClick={(e) => handleDeleteFavorite(fav.id, e)} className="p-2 sm:p-2 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 라이브 디테일 모달 (모바일 바텀 시트) */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowDetailModal(false)} />
          <div className={`relative w-full max-w-2xl h-[90vh] sm:h-[85vh] rounded-t-[2rem] sm:rounded-b-[2rem] sm:rounded-[3rem] mt-auto sm:mt-0 shadow-2xl flex flex-col overflow-hidden border transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-[#F2F2F7] border-white'}`}>
            <div className="w-12 h-1.5 bg-slate-300/50 dark:bg-slate-600/50 rounded-full mx-auto mt-3 sm:hidden" />
            <div className="p-6 sm:p-8 pb-4 flex items-center justify-between">
              <div>
                <h3 className={`text-xl sm:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>서울 실시간 현황</h3>
                <p className="text-slate-400 font-medium text-[11px] sm:text-sm mt-1">전체 구의 날씨와 혼잡도를 확인하세요.</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-lg ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-white text-slate-900 hover:bg-slate-100'}`}>
                <X size={20} strokeWidth={2.5} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="px-6 sm:px-8 mb-5 sm:mb-6">
              <div className={`flex items-center gap-2.5 sm:gap-3 px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                <Search size={16} className="text-slate-400 sm:w-[18px] sm:h-[18px]" />
                <input autoFocus placeholder="구 이름 검색..." className="bg-transparent outline-none w-full font-bold text-xs sm:text-sm text-inherit" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-12 custom-scrollbar space-y-3 sm:space-y-4">
              {filteredStatus.length > 0 ? (
                filteredStatus.map((item, idx) => (
                  <div key={idx} className={`group p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 transition-all sm:hover:scale-[1.02] shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}>
                    <div className="space-y-1">
                      <p className="text-[10px] sm:text-xs font-black text-emerald-500 uppercase tracking-widest">{item.realAreaName}</p>
                      <h4 className="text-lg sm:text-xl font-black">{item.district}</h4>
                      <p className={`text-xs sm:text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500 opacity-80'}`}>{item.weatherText}</p>
                    </div>
                    <div className="flex items-center gap-6 sm:gap-8 text-right sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-700">
                      <div className="space-y-0.5 sm:space-y-1">
                        <div className="flex items-center justify-start sm:justify-end gap-1 text-slate-400 font-black text-[9px] sm:text-[10px] uppercase"><Users size={10} className="sm:w-3 sm:h-3" /> Congestion</div>
                        <p className={`text-xs sm:text-sm font-black text-left sm:text-right ${item.congestion.includes('혼잡') ? 'text-rose-500' : item.congestion.includes('보통') ? 'text-amber-500' : 'text-blue-500'}`}>{item.congestion}</p>
                      </div>
                      <div className="space-y-0.5 sm:space-y-1 min-w-[60px]">
                        <div className="flex items-center justify-start sm:justify-end gap-1 text-slate-400 font-black text-[9px] sm:text-[10px] uppercase"><Thermometer size={10} className="sm:w-3 sm:h-3" /> Temp</div>
                        <p className="text-xl sm:text-2xl font-black italic tracking-tighter text-left sm:text-right">{item.temp}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-slate-400 font-bold text-xs sm:text-sm">검색 결과가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        @media (min-width: 640px) { .custom-scrollbar::-webkit-scrollbar { width: 6px; } }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  color: string;
  isDarkMode: boolean;
  isMinimal: boolean;
}

const StatCard = ({ label, value, color, isDarkMode, isMinimal }: StatCardProps) => (
  <div className={`p-5 md:p-6 rounded-2xl md:rounded-3xl border transition-all duration-500 text-left ${isDarkMode ? 'bg-slate-800/50 border-slate-700 group-hover:border-slate-500' : 'bg-slate-50 border-slate-100 group-hover:shadow-md'} ${isMinimal ? 'flex justify-between items-center py-3 md:py-4' : ''}`}>
    <p className={`font-bold text-slate-400 uppercase tracking-widest ${isMinimal ? 'text-[9px]' : 'text-[10px] md:text-[11px] mb-2'}`}>{label}</p>
    <div className="flex items-baseline gap-1.5">
      <span className={`${isMinimal ? 'text-base md:text-lg' : 'text-2xl md:text-3xl'} font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{value}</span>
      <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${color}`} />
    </div>
  </div>
);

interface HistoryItemProps {
  from: string;
  to: string;
  date: string;
  isDarkMode: boolean;
  onClick: () => void;
}

const HistoryItem = ({ from, to, date, isDarkMode, onClick }: HistoryItemProps) => (
  <div 
    onClick={onClick}
    className={`group p-3.5 md:p-4 rounded-xl md:rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${isDarkMode ? 'bg-slate-800/30 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800' : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-md'}`}
  >
    <div className="flex items-center gap-3 md:gap-4 text-left min-w-0 pr-4">
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isDarkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50'}`}><MapPin size={16} className="md:w-[18px] md:h-[18px]" /></div>
      <div className="min-w-0">
        <p className={`font-bold text-xs md:text-sm truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{from} → {to}</p>
        <p className="text-[10px] md:text-[11px] text-slate-500 font-medium mt-0.5 md:mt-0">{date}</p>
      </div>
    </div>
    <ChevronRight size={16} className="text-slate-400 md:w-[18px] md:h-[18px] group-hover:text-emerald-500 group-hover:translate-x-1 transition-transform shrink-0" />
  </div>
);

export default MyPage;