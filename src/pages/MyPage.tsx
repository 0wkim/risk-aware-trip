import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, Route, Clock, Search, Sun, Moon, CloudSun, LogOut, Settings, 
  ChevronRight, User, Lock, Mail, ChevronLeft, Layout, Maximize2, Minimize2, X, Thermometer, Users, Star, Trash2, Coffee, Utensils, Landmark, HelpCircle
} from 'lucide-react';

interface MyPageProps {
  onGoToMap: () => void;
  onLogout: () => void;
  isExternalDarkMode: boolean;
  toggleDarkMode: () => void;
  seoulData: any[]; 
  isSeoulDataLoading: boolean; 
}

// 즐겨찾기 아이템 인터페이스 명시
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

// 검색 기록 인터페이스 명시
interface SearchHistoryItem {
  id: string;
  startPoint: string;
  destination: string;
  date: string;
}

const MyPage = ({ onGoToMap, onLogout, isExternalDarkMode, toggleDarkMode, seoulData, isSeoulDataLoading }: MyPageProps) => {
  const isDarkMode = isExternalDarkMode;
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings'>('dashboard');
  const [isMinimalMode, setIsMinimalMode] = useState(false);
  
  const [tickerIndex, setTickerIndex] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false); 
  const [showFavoriteModal, setShowFavoriteModal] = useState(false); // 💡 즐겨찾기 모달 제어 상태 추가
  const [searchTerm, setSearchTerm] = useState('');

  // ── 👤 로컬스토리지의 user_session에서 동적으로 유저 데이터 로드 ──
  const [userInfo, setUserInfo] = useState(() => {
    const session = localStorage.getItem('user_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        return {
          name: parsed.userName || '사용자',
          email: parsed.userId || 'unknown@domain.com',
          loginType: parsed.loginType || 'email',
          department: parsed.department || '데이터 사이언스' // 💡 기본값 설정
        };
      } catch (e) {
        console.error(e);
      }
    }
    return {
      name: '최서영',
      email: 'seoyoung8939@gmail.com',
      loginType: 'email',
      department: '데이터 사이언스'
    };
  });

  // ── 📊 실시간 로컬스토리지 데이터 상태 관리 ──
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  // 화면 진입 시 및 대시보드 복귀 시 데이터 최신화 구역
  useEffect(() => {
    // 1) 즐겨찾기 로드
    const savedFavs = localStorage.getItem('custom_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    // 2) 검색 기록 로드
    const savedHistory = localStorage.getItem('search_history');
    if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
  }, [currentView, showFavoriteModal]);

  // 정보 수정 및 소속 카테고리 업데이트 핸들러
  const handleUpdateUserInfo = (field: 'name' | 'email' | 'department', value: string) => {
    const updated = { ...userInfo, [field]: value };
    setUserInfo(updated);

    // 1) 현재 세션 세부 패키지 동기화
    const session = localStorage.getItem('user_session');
    if (session) {
      const parsed = JSON.parse(session);
      if (field === 'name') parsed.userName = value;
      if (field === 'email') parsed.userId = value;
      if (field === 'department') parsed.department = value;
      localStorage.setItem('user_session', JSON.stringify(parsed));
    }

    // 2) 회원 DB(user_db) 내의 정보도 함께 동기화 업데이트 (이름, 이메일 한정)
    if (field !== 'department') {
      const users = JSON.parse(localStorage.getItem('user_db') || '[]');
      const userIndex = users.findIndex((u: any) => u.email === userInfo.email);
      if (userIndex !== -1) {
        users[userIndex][field] = value;
        localStorage.setItem('user_db', JSON.stringify(users));
      }
    }
  };

  // 즐겨찾기 모달 안에서 바로 삭제 처리를 지원하기 위한 핸들러
  const handleDeleteFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.filter(item => item.id !== id);
    setFavorites(updated);
    localStorage.setItem('custom_favorites', JSON.stringify(updated));
  };

  // 전체 검색 기록 삭제 핸들러
  const handleClearHistory = () => {
    if (window.confirm('모든 검색 기록을 삭제하시겠습니까?')) {
      localStorage.removeItem('search_history');
      setSearchHistory([]);
    }
  };

  // 즐겨찾기 아이콘 매퍼
  const getFavoriteIcon = (cat: string) => {
    switch (cat) {
      case 'cafe': return <Coffee size={16} />;
      case 'restaurant': return <Utensils size={16} />;
      case 'spot': return <Landmark size={16} />;
      default: return <HelpCircle size={16} />;
    }
  };

  // 롤링 타이머
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
      return <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">Google 연동됨</span>;
    }
    if (userInfo.loginType === 'kakao') {
      return <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#FEE500]/20 text-[#3C1E1E] dark:text-[#FEE500] border border-[#FEE500]/30">Kakao 연동됨</span>;
    }
    return <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>일반 회원</span>;
  }, [userInfo.loginType, isDarkMode]);

  return (
    <div className={`fixed inset-0 flex items-center justify-center p-4 font-sans transition-all duration-500 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F4F7F9]'}`}>
      
      {/* 메인 레이아웃 */}
      <div className={`w-full max-w-6xl h-[750px] rounded-[2.5rem] shadow-2xl flex overflow-hidden border transition-all duration-500 ${showDetailModal || showFavoriteModal ? 'scale-95 blur-md' : 'scale-100'} ${
        isDarkMode ? 'bg-[#1E293B] border-slate-700 text-slate-200' : 'bg-white border-slate-100 text-slate-700'
      }`}>
        
        {/* [왼쪽] 콘텐츠 영역 */}
        <main className="flex-1 flex flex-col overflow-hidden bg-transparent text-left">
          <header className={`px-12 py-10 flex justify-between items-center shrink-0 border-b transition-colors ${
            isDarkMode ? 'border-slate-700' : 'border-slate-50'
          }`}>
            <div className="flex items-center gap-5">
              {currentView === 'settings' && (
                <button onClick={() => setCurrentView('dashboard')} className={`p-2.5 rounded-xl transition-all active:scale-90 ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                  <ChevronLeft size={20} />
                </button>
              )}
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {currentView === 'dashboard' ? '마이페이지' : '개인정보 및 환경 설정'}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">내 여행 기록과 선호도를 관리하세요.</p>
              </div>
            </div>
            
            <button onClick={onGoToMap} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md active:scale-95 ${
                isDarkMode ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}>
              <Search size={16} /> 지도 보기
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
            <div className={`max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all ${isMinimalMode ? 'opacity-80 scale-[0.98]' : ''}`}>
              {currentView === 'dashboard' ? (
                <div className="space-y-10">
                  <section className="flex items-center gap-6 text-left">
                    <div className={`w-24 h-24 rounded-full border-4 shadow-md overflow-hidden shrink-0 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-emerald-50 border-white'}`}>
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userInfo.name)}`} alt="avatar" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{userInfo.name}</h3>
                      <p className="text-slate-400 font-medium text-sm">{userInfo.email}</p>
                      {!isMinimalMode && (
                        <div className="flex gap-2 mt-3">
                          {loginTypeBadge}
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                            {userInfo.department}
                          </span>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* 💡 1번 구역 수정: 검색 기록 수와 즐겨찾기 개수로 동적 변환 */}
                  <div className={`grid ${isMinimalMode ? 'grid-cols-1' : 'grid-cols-2'} gap-6 transition-all duration-500`}>
                    <StatCard label="총 검색 횟수" value={searchHistory.length.toString()} color="bg-blue-500" isDarkMode={isDarkMode} isMinimal={isMinimalMode} />
                    <div onClick={() => setShowFavoriteModal(true)} className="cursor-pointer group">
                      <StatCard label="저장한 장소 (클릭 시 확인)" value={favorites.length.toString()} color="bg-rose-500" isDarkMode={isDarkMode} isMinimal={isMinimalMode} />
                    </div>
                  </div>

                  {/* 💡 2번 구역 수정: 실제 저장된 검색 기록 반영 */}
                  {!isMinimalMode && (
                    <section className="space-y-6">
                      <div className="flex justify-between items-end">
                        <h4 className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                          <Clock size={18} className="text-slate-400" /> 최근 검색 기록
                        </h4>
                        {searchHistory.length > 0 && (
                          <button onClick={handleClearHistory} className="text-xs text-slate-400 hover:text-rose-500 underline transition-colors">전체기록 삭제</button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {searchHistory.length === 0 ? (
                          <div className={`text-center py-10 rounded-2xl border border-dashed text-sm font-semibold text-slate-400 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                            최근 주행 교차 탐색 분석 기록이 존재하지 않습니다.
                          </div>
                        ) : (
                          // 최신순 정렬 후 상위 4개 렌더링
                          [...searchHistory].reverse().slice(0, 4).map((hist) => (
                            <HistoryItem key={hist.id} from={hist.startPoint} to={hist.destination} date={hist.date} isDarkMode={isDarkMode} />
                          ))
                        )}
                      </div>
                    </section>
                  )}
                </div>
              ) : (
                /* 💡 3번 구역 수정: 설정 탭에서 직접 사용자 전공/카테고리를 셀렉트박스로 선택 가능하도록 구현 */
                <div className="space-y-6 text-left">
                  <div className={`p-8 rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                    <h5 className="font-bold mb-6 text-emerald-500 flex items-center gap-2"><User size={18} /> 정보 수정</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">이름</label>
                        <input type="text" className={`w-full p-4 rounded-2xl border bg-transparent outline-none font-bold transition-all ${isDarkMode ? 'border-slate-700 text-white bg-slate-900' : 'border-slate-200 text-slate-800 bg-white'}`} value={userInfo.name} onChange={(e) => handleUpdateUserInfo('name', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">이메일 주소</label>
                        <input type="email" className={`w-full p-4 rounded-2xl border bg-transparent outline-none font-bold transition-all ${isDarkMode ? 'border-slate-700 text-white bg-slate-900' : 'border-slate-200 text-slate-800 bg-white'}`} value={userInfo.email} onChange={(e) => handleUpdateUserInfo('email', e.target.value)} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">사용자 소속 카테고리 (프로필 배지 반영)</label>
                        <select 
                          className={`w-full p-4 rounded-2xl border outline-none font-bold transition-all appearance-none ${
                            isDarkMode ? 'border-slate-700 text-white bg-slate-900 focus:border-emerald-500' : 'border-slate-200 text-slate-800 bg-white focus:border-emerald-500'
                          }`}
                          value={userInfo.department} 
                          onChange={(e) => handleUpdateUserInfo('department', e.target.value)}
                        >
                          <option value="데이터 사이언스">데이터 사이언스 (Data Science)</option>
                          <option value="컴퓨터 공학">컴퓨터 공학 (Computer Engineering)</option>
                          <option value="프론트엔드 개발자">프론트엔드 개발자 (Frontend Developer)</option>
                          <option value="비즈니스 기획">비즈니스 기획 (Business Strategy)</option>
                          <option value="일반 여행자">일반 여행자 (General Traveler)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* [오른쪽] 사이드바 영역 */}
        <aside className={`w-80 border-l p-10 flex flex-col transition-colors duration-500 ${isDarkMode ? 'bg-[#1E293B]/80 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center justify-between mb-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg"><Route size={24} /></div>
              <span className={`font-bold text-xl tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>ArriView</span>
            </div>
            <button onClick={() => setCurrentView(v => v === 'dashboard' ? 'settings' : 'dashboard')} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-white text-slate-500 hover:text-emerald-500'} ${currentView === 'settings' ? 'ring-2 ring-emerald-500' : ''}`}><Settings size={20} /></button>
          </div>

          <div onClick={() => setShowDetailModal(true)} className={`mb-10 rounded-[2.5rem] overflow-hidden border aspect-square flex flex-col shadow-xl cursor-pointer group transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-black/20' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
            <div className="p-5 border-b border-inherit flex items-center justify-between bg-inherit group-hover:bg-emerald-500/5 transition-colors">
              <span className="text-[11px] font-black uppercase tracking-wildest opacity-50">Live Status</span>
              <Maximize2 size={14} className="text-emerald-500 animate-pulse" />
            </div>
            <div className="flex-1 relative overflow-hidden text-center bg-inherit">
              {isSeoulDataLoading ? (
                <div className="h-full flex items-center justify-center text-xs animate-pulse">데이터 로드 중...</div>
              ) : (
                <div className="flex flex-col h-full transition-transform duration-1000 ease-in-out" style={{ transform: `translateY(-${tickerIndex * 100}%)` }}>
                  {seoulData.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="h-full w-full flex flex-col items-center justify-center p-6 gap-3 shrink-0">
                      <span className="text-sm font-bold text-slate-400">{item.district}</span>
                      <div className={`px-4 py-1.5 rounded-full text-[11px] font-black text-white ${item.congestion.includes('혼잡') ? 'bg-rose-500' : 'bg-blue-500'}`}>{item.congestion}</div>
                      <div className="flex items-center gap-3 mt-2"><CloudSun size={32} className="text-emerald-500" /><span className="text-3xl font-black">{item.temp}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col text-left space-y-8">
            <div>
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wildest px-2 mb-4">Theme Mode</h4>
              <div className={`flex p-1.5 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-200 border-slate-200'}`}>
                <button onClick={() => { if (isDarkMode) toggleDarkMode(); }} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${!isDarkMode ? 'bg-white text-amber-500 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}><Sun size={18} /><span>Light</span></button>
                <button onClick={() => { if (!isDarkMode) toggleDarkMode(); }} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${isDarkMode ? 'bg-slate-800 text-indigo-400 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}><Moon size={18} /><span>Dark</span></button>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wildest px-2 mb-4">Layout View</h4>
              <div className={`flex p-1.5 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-200 border-slate-200'}`}>
                <button onClick={() => setIsMinimalMode(false)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${!isMinimalMode ? (isDarkMode ? 'bg-slate-800 text-emerald-400 shadow-md' : 'bg-white text-emerald-600 shadow-md') : 'text-slate-500 hover:text-slate-400'}`}><Maximize2 size={16} /><span>Default</span></button>
                <button onClick={() => setIsMinimalMode(true)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${isMinimalMode ? (isDarkMode ? 'bg-slate-800 text-emerald-400 shadow-md' : 'bg-white text-emerald-600 shadow-md') : 'text-slate-500 hover:text-slate-400'}`}><Minimize2 size={16} /><span>Focus</span></button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-inherit flex justify-center shrink-0">
            <button onClick={onLogout} className="flex items-center gap-2 py-2 px-4 text-slate-400 hover:text-rose-500 transition-colors text-sm font-bold"><LogOut size={16} /> 로그아웃</button>
          </div>
        </aside>
      </div>

      {/* 💡 즐겨찾기 목록 팝업 모달 추가 */}
      {showFavoriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowFavoriteModal(false)} />
          <div className={`relative w-full max-w-xl h-[70vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-[#F2F2F7] border-white'}`}>
            <div className="p-8 pb-4 flex items-center justify-between">
              <div>
                <h3 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>즐겨찾는 스팟 목록</h3>
                <p className="text-slate-400 text-xs font-medium">MainMapPage에서 추가 및 연동 관리되는 청정 구역 리스트입니다.</p>
              </div>
              <button onClick={() => setShowFavoriteModal(false)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-white text-slate-900 hover:bg-slate-100'}`}>
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar space-y-3 mt-4">
              {favorites.length === 0 ? (
                <div className="py-20 text-center text-slate-400 font-bold text-sm">등록된 즐겨찾는 장소가 없습니다.</div>
              ) : (
                favorites.map(fav => (
                  <div key={fav.id} className={`group w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div className="flex items-center gap-3.5 min-w-0 flex-1 text-left">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        fav.customCategory === 'cafe' ? (isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600') :
                        fav.customCategory === 'restaurant' ? (isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600') :
                        fav.customCategory === 'spot' ? (isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600') :
                        (isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-50 text-slate-500')
                      }`}>
                        {getFavoriteIcon(fav.customCategory)}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className={`font-black text-sm tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{fav.name}</p>
                          <span className={`text-[8px] font-black px-1 rounded uppercase tracking-tighter ${
                            fav.customCategory === 'cafe' ? 'bg-amber-500/10 text-amber-500' :
                            fav.customCategory === 'restaurant' ? 'bg-blue-500/10 text-blue-500' :
                            fav.customCategory === 'spot' ? 'bg-purple-500/10 text-purple-500' : 'bg-slate-500/10 text-slate-400'
                          }`}>{fav.customCategory || 'OTHER'}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5 w-full">{fav.address}</p>
                      </div>
                    </div>
                    <button onClick={(e) => handleDeleteFavorite(fav.id, e)} className="p-2 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 서울 실시간 데이터 모달 */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowDetailModal(false)} />
          <div className={`relative w-full max-w-2xl h-[85vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-[#F2F2F7] border-white'}`}>
            <div className="p-8 pb-4 flex items-center justify-between">
              <div>
                <h3 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>서울 실시간 현황</h3>
                <p className="text-slate-400 font-medium">전체 구의 날씨와 혼잡도를 확인하세요.</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-lg ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-white text-slate-900 hover:bg-slate-100'}`}>
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <div className="px-8 mb-6">
              <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                <Search size={18} className="text-slate-400" />
                <input autoFocus placeholder="구 이름 검색..." className="bg-transparent outline-none w-full font-bold text-inherit" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar space-y-4">
              {filteredStatus.length > 0 ? (
                filteredStatus.map((item, idx) => (
                  <div key={idx} className={`group p-6 rounded-[2rem] flex items-center justify-between transition-all hover:scale-[1.02] shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">{item.realAreaName}</p>
                      <h4 className="text-xl font-black">{item.district}</h4>
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500 opacity-80'}`}>{item.weatherText}</p>
                    </div>
                    <div className="flex items-center gap-8 text-right">
                      <div className="space-y-1">
                        <div className="flex items-center justify-end gap-1 text-slate-400 font-black text-[10px] uppercase"><Users size={12} /> Congestion</div>
                        <p className={`text-sm font-black ${item.congestion.includes('혼잡') ? 'text-rose-500' : item.congestion.includes('보통') ? 'text-amber-500' : 'text-blue-500'}`}>{item.congestion}</p>
                      </div>
                      <div className="space-y-1 min-w-[60px]">
                        <div className="flex items-center justify-end gap-1 text-slate-400 font-black text-[10px] uppercase"><Thermometer size={12} /> Temp</div>
                        <p className="text-2xl font-black italic tracking-tighter">{item.temp}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-slate-400 font-bold">검색 결과가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
};

const StatCard = ({ label, value, color, isDarkMode, isMinimal }: any) => (
  <div className={`p-6 rounded-3xl border transition-all duration-500 text-left ${isDarkMode ? 'bg-slate-800/50 border-slate-700 group-hover:border-slate-500' : 'bg-slate-50 border-slate-100 group-hover:shadow-md'} ${isMinimal ? 'flex justify-between items-center py-4' : ''}`}>
    <p className={`font-bold text-slate-400 uppercase tracking-wider ${isMinimal ? 'text-[9px]' : 'text-[11px] mb-2'}`}>{label}</p>
    <div className="flex items-baseline gap-1.5">
      <span className={`${isMinimal ? 'text-lg' : 'text-3xl'} font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{value}</span>
      <div className={`w-2 h-2 rounded-full ${color}`} />
    </div>
  </div>
);

const HistoryItem = ({ from, to, date, isDarkMode }: any) => (
  <div className={`group p-4 rounded-2xl border transition-all flex items-center justify-between ${isDarkMode ? 'bg-slate-800/30 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800' : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-md'}`}>
    <div className="flex items-center gap-4 text-left">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50'}`}><MapPin size={18} /></div>
      <div><p className={`font-bold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{from} → {to}</p><p className="text-[11px] text-slate-500 font-medium">{date}</p></div>
    </div>
    <ChevronRight size={18} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
  </div>
);

export default MyPage;