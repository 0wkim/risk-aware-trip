import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, Route, Clock, Search, Sun, Moon, CloudSun, LogOut, Settings, 
  ChevronRight, User, Lock, Mail, ChevronLeft, Layout, Maximize2, Minimize2, X, Thermometer, Users
} from 'lucide-react';

interface MyPageProps {
  onGoToMap: () => void;
  isExternalDarkMode: boolean;
  toggleDarkMode: () => void;
  seoulData: any[]; // 프롭스 추가됨
  isSeoulDataLoading: boolean; // 프롭스 추가됨
}

const MyPage = ({ onGoToMap, isExternalDarkMode, toggleDarkMode, seoulData, isSeoulDataLoading }: MyPageProps) => {
  const isDarkMode = isExternalDarkMode;
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings'>('dashboard');
  const [isMinimalMode, setIsMinimalMode] = useState(false);
  
  const [tickerIndex, setTickerIndex] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false); 
  const [searchTerm, setSearchTerm] = useState('');

  const [userInfo, setUserInfo] = useState({
    name: '최서영',
    email: 'seoyoung8939@gmail.com',
    password: '●●●●●●●●'
  });

  // 롤링 타이머 (모달 열릴 때는 중지)
  useEffect(() => {
    if (seoulData.length === 0 || showDetailModal) return;
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % seoulData.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [seoulData.length, showDetailModal]);

  // 상세 모달 내 검색 필터
  const filteredStatus = useMemo(() => {
    return seoulData.filter(s => s.district.includes(searchTerm));
  }, [seoulData, searchTerm]);

  return (
    <div className={`fixed inset-0 flex items-center justify-center p-4 font-sans transition-all duration-500 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F4F7F9]'}`}>
      
      {/* 메인 레이아웃 (모달 오픈 시 스케일 감소 및 블러) */}
      <div className={`w-full max-w-6xl h-[750px] rounded-[2.5rem] shadow-2xl flex overflow-hidden border transition-all duration-500 ${showDetailModal ? 'scale-95 blur-md' : 'scale-100'} ${
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
                  {currentView === 'dashboard' ? '마이페이지' : '개인정보 수정'}
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

                  <div className={`grid ${isMinimalMode ? 'grid-cols-1' : 'grid-cols-3'} gap-4 transition-all duration-500`}>
                    <StatCard label="방문한 도시" value="24" color="bg-blue-500" isDarkMode={isDarkMode} isMinimal={isMinimalMode} />
                    <StatCard label="탐색한 경로" value="54" color="bg-emerald-500" isDarkMode={isDarkMode} isMinimal={isMinimalMode} />
                    <StatCard label="저장한 장소" value="12" color="bg-rose-500" isDarkMode={isDarkMode} isMinimal={isMinimalMode} />
                  </div>

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
            <button onClick={() => setCurrentView(v => v === 'dashboard' ? 'settings' : 'dashboard')} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-white text-slate-500 hover:text-emerald-500'}`}><Settings size={20} /></button>
          </div>

          <div onClick={() => setShowDetailModal(true)} className={`mb-10 rounded-[2.5rem] overflow-hidden border aspect-square flex flex-col shadow-xl cursor-pointer group transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-black/20' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
            <div className="p-5 border-b border-inherit flex items-center justify-between bg-inherit group-hover:bg-emerald-500/5 transition-colors">
              <span className="text-[11px] font-black uppercase tracking-widest opacity-50">Live Status</span>
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
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4">Theme Mode</h4>
              <div className={`flex p-1.5 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-200 border-slate-200'}`}>
                <button onClick={() => { if (isDarkMode) toggleDarkMode(); }} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${!isDarkMode ? 'bg-white text-amber-500 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}><Sun size={18} /><span>Light</span></button>
                <button onClick={() => { if (!isDarkMode) toggleDarkMode(); }} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${isDarkMode ? 'bg-slate-800 text-indigo-400 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}><Moon size={18} /><span>Dark</span></button>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4">Layout View</h4>
              <div className={`flex p-1.5 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-200 border-slate-200'}`}>
                <button onClick={() => setIsMinimalMode(false)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${!isMinimalMode ? (isDarkMode ? 'bg-slate-800 text-emerald-400 shadow-md' : 'bg-white text-emerald-600 shadow-md') : 'text-slate-500 hover:text-slate-400'}`}><Maximize2 size={16} /><span>Default</span></button>
                <button onClick={() => setIsMinimalMode(true)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${isMinimalMode ? (isDarkMode ? 'bg-slate-800 text-emerald-400 shadow-md' : 'bg-white text-emerald-600 shadow-md') : 'text-slate-500 hover:text-slate-400'}`}><Minimize2 size={16} /><span>Focus</span></button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-inherit flex justify-center shrink-0">
            <button className="flex items-center gap-2 py-2 px-4 text-slate-400 hover:text-rose-500 transition-colors text-sm font-bold"><LogOut size={16} /> 로그아웃</button>
          </div>
        </aside>
      </div>

      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowDetailModal(false)} />
          <div className={`relative w-full max-w-2xl h-[85vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-[#F2F2F7] border-white'}`}>
            <div className="p-8 pb-4 flex items-center justify-between">
              <div>
                <h3 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>서울 실시간 현황</h3>
                <p className="text-slate-400 font-medium">전체 구의 날씨와 혼잡도를 확인하세요.</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:rotate-90 hover:scale-110 active:scale-90 shadow-lg ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-white text-slate-900 hover:bg-slate-100'}`}>
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
  <div className={`p-5 rounded-2xl border transition-all duration-500 text-left ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'} ${isMinimal ? 'flex justify-between items-center py-4' : ''}`}>
    <p className={`font-bold text-slate-400 uppercase tracking-wider ${isMinimal ? 'text-[9px]' : 'text-[10px] mb-1'}`}>{label}</p>
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