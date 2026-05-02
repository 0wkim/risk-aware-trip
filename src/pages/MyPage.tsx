import React, { useState } from 'react';
import { 
  MapPin, Route, Clock, User, LogOut, 
  Settings, ChevronRight, Trees, Search, Sun, Moon
} from 'lucide-react';

// Props 타입 정의 추가
interface MyPageProps {
  onGoToMap: () => void;
  isExternalDarkMode: boolean;
  toggleDarkMode: () => void;
}

const MyPage = ({ onGoToMap, isExternalDarkMode, toggleDarkMode }: MyPageProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');
  
  // App.tsx에서 받아온 전역 다크모드 상태를 사용
  const isDarkMode = isExternalDarkMode;

  return (
    <div className={`fixed inset-0 flex items-center justify-center p-4 font-sans text-left transition-colors duration-500 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F4F7F9]'}`}>
      
      <div className={`w-full max-w-5xl h-[750px] rounded-[2rem] shadow-xl flex overflow-hidden border transition-all duration-500 ${
        isDarkMode 
        ? 'bg-[#1E293B] border-slate-700 shadow-black/20 text-slate-200' 
        : 'bg-white border-slate-100 shadow-slate-200/50 text-slate-700'
      }`}>
        
        <aside className={`w-64 border-r p-8 flex flex-col transition-colors duration-500 ${
          isDarkMode ? 'bg-[#1E293B]/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'
        }`}>
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
              <Route size={20} />
            </div>
            <span className={`font-bold text-lg tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>VibeMap</span>
          </div>
          
          <nav className="flex-1 space-y-1">
            <SidebarItem 
              icon={<User size={18} />} 
              label="프로필" 
              active={activeTab === 'profile'} 
              isDarkMode={isDarkMode}
              onClick={() => setActiveTab('profile')} 
            />
            <SidebarItem 
              icon={<Settings size={18} />} 
              label="여행 설정" 
              active={activeTab === 'preferences'} 
              isDarkMode={isDarkMode}
              onClick={() => setActiveTab('preferences')} 
            />
          </nav>

          {/* 전역 toggleDarkMode 함수 실행 */}
          <button 
            onClick={toggleDarkMode}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-2 ${
              isDarkMode ? 'text-yellow-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            {isDarkMode ? '라이트모드로' : '다크모드로'}
          </button>

          <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-500 transition-colors text-sm font-medium">
            <LogOut size={18} /> 로그아웃
          </button>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className={`px-10 py-8 flex justify-between items-center shrink-0 border-b transition-colors ${
            isDarkMode ? 'border-slate-700' : 'border-slate-50'
          }`}>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>마이페이지</h2>
              <p className="text-sm text-slate-400 mt-0.5">내 여행 기록과 선호도를 관리하세요.</p>
            </div>
            
            <button 
              onClick={onGoToMap}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md active:scale-95 ${
                isDarkMode ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Search size={16} />
              검색하러 가기
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            {activeTab === 'profile' ? (
              <div className="space-y-10 animate-in fade-in duration-500">
                <section className="flex items-center gap-6">
                  <div className={`w-24 h-24 rounded-full border-4 shadow-md overflow-hidden transition-colors ${
                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-emerald-50 border-white'
                  }`}>
                    <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Seoyoung" alt="avatar" />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>최서영</h3>
                    <p className="text-slate-400 font-medium text-sm">seoyoung8939@gmail.com</p>
                    <div className="flex gap-2 mt-3">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>광운대학교</span>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>데이터 사이언스</span>
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-3 gap-4">
                  <StatCard label="방문한 도시" value="24" color="bg-blue-500" isDarkMode={isDarkMode} />
                  <StatCard label="탐색한 경로" value="54" color="bg-emerald-500" isDarkMode={isDarkMode} />
                  <StatCard label="저장한 장소" value="12" color="bg-rose-500" isDarkMode={isDarkMode} />
                </div>

                <section>
                  <div className="flex justify-between items-end mb-5">
                    <h4 className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                      <Clock size={18} className="text-slate-400" /> 최근 검색 기록
                    </h4>
                    <button className="text-xs text-slate-400 hover:text-slate-200 underline">전체보기</button>
                  </div>
                  <div className="space-y-3">
                    <HistoryItem from="노원역" to="강남역" date="2026.04.28" isDarkMode={isDarkMode} />
                    <HistoryItem from="성수동" to="홍대입구" date="2026.04.25" isDarkMode={isDarkMode} />
                  </div>
                </section>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                <section>
                  <h4 className={`font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                    <Trees size={18} className="text-emerald-500" /> 선호하는 분위기
                  </h4>
                  <div className="flex gap-2">
                    {['차분한', '활기찬', '자연친화적', '모던한'].map((vibe) => (
                      <button key={vibe} className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        vibe === '활기찬' 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-200'
                      }`}>
                        {vibe}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#334155' : '#E2E8F0'}; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${isDarkMode ? '#475569' : '#CBD5E1'}; }
      `}</style>
    </div>
  );
};

/* 보조 컴포넌트 */
const SidebarItem = ({ icon, label, active, onClick, isDarkMode }: any) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
      active 
      ? (isDarkMode ? 'bg-slate-800 text-emerald-400 shadow-lg' : 'bg-white text-slate-900 shadow-sm border border-slate-100') 
      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
    }`}
  >
    {icon} {label}
  </button>
);

const StatCard = ({ label, value, color, isDarkMode }: any) => (
  <div className={`p-5 rounded-2xl border transition-colors ${
    isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'
  }`}>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <div className="flex items-baseline gap-1">
      <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{value}</span>
      <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
    </div>
  </div>
);

const HistoryItem = ({ from, to, date, isDarkMode }: any) => (
  <div className={`group p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
    isDarkMode ? 'bg-slate-800/30 border-slate-700 hover:border-emerald-500/50' : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-md'
  }`}>
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
        isDarkMode ? 'bg-slate-800 text-slate-500 group-hover:text-emerald-400' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'
      }`}>
        <MapPin size={18} />
      </div>
      <div>
        <p className={`font-bold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{from} → {to}</p>
        <p className="text-[11px] text-slate-500 font-medium">{date}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
  </div>
);

export default MyPage;