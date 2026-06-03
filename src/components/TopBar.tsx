import React, { useState, useEffect, useRef } from 'react';
import { CloudSun, Sun, Moon, User, LogOut } from 'lucide-react';

interface TopBarProps {
  seoulData: any[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onGoToMyPage: () => void;
  onLogout?: () => void;
}

const TopBar = ({ seoulData, isDarkMode, toggleDarkMode, onGoToMyPage, onLogout }: TopBarProps) => {
  const [userName, setUserName] = useState('최서영');
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 로컬 스토리지에서 이름을 불러오고, MyPage의 변경 이벤트를 실시간으로 감지
  useEffect(() => {
    const loadUserName = () => {
      const session = localStorage.getItem('user_session');
      if (session) {
        try {
          const parsed = JSON.parse(session);
          setUserName(parsed.userName || '최서영');
        } catch (e) {
          console.error(e);
        }
      }
    };
    
    // 최초 렌더링 시 이름 로드
    loadUserName();
    
    // MyPage에서 정보가 수정될 때 발생하는 커스텀 이벤트 리스너 등록
    window.addEventListener('userInfoUpdated', loadUserName);
    return () => window.removeEventListener('userInfoUpdated', loadUserName);
  }, []);

  // 티커 데이터 필터링 (강남구, 마포구 등 주요 구역)
  const targetDistricts = ['강남구', '마포구', '종로구', '성동구', '영등포구', '송파구'];
  const displayData = Array.isArray(seoulData) 
    ? seoulData.filter(item => item && item.district && targetDistricts.includes(item.district)) 
    : [];

  // 티커 애니메이션 타이머
  useEffect(() => {
    if (displayData.length === 0) return;
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % displayData.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [displayData.length]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="absolute top-4 left-4 right-4 md:top-6 md:left-6 md:right-6 z-20 flex justify-between items-center gap-2.5 md:gap-6 pointer-events-none">
      
      {/* 날씨 및 혼잡도 티커 영역 */}
      <div className={`ticker-container flex-1 h-12 md:h-14 rounded-full shadow-lg overflow-hidden backdrop-blur-md px-4 md:px-6 pointer-events-auto ${isDarkMode ? 'bg-slate-800/90 border border-slate-700 text-slate-200' : 'bg-white/90 border border-slate-100 text-slate-700'}`}>
        <div className="flex flex-col transition-transform duration-500 ease-in-out" style={{ transform: `translateY(calc(-${tickerIndex} * var(--ticker-h)))` }}>
          {displayData.length === 0 ? (
            <div className="h-12 md:h-14 w-full flex items-center justify-center text-[11px] md:text-sm font-semibold text-slate-400">데이터 로딩중...</div>
          ) : (
            displayData.map((item, idx) => (
              <div key={idx} className="h-12 md:h-14 w-full flex items-center justify-center gap-1.5 sm:gap-3 shrink-0 text-[11px] sm:text-sm font-semibold">
                <span className="font-black text-emerald-500 truncate">{item.district}</span>
                <span className={`px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-md text-[9px] sm:text-xs text-white shrink-0 ${item.congestion.includes('붐빔') || item.congestion.includes('혼잡') ? 'bg-rose-500' : item.congestion.includes('보통') ? 'bg-amber-500' : 'bg-blue-500'}`}>{item.congestion}</span>
                <CloudSun size={14} className="ml-1 sm:ml-3 text-slate-400 sm:w-4 sm:h-4 w-3 h-3 shrink-0" />
                <span className="truncate flex items-center gap-1">
                  <span className="hidden sm:inline">{item.weather}</span> 
                  <span>{item.temp}</span>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 프로필 및 드롭다운 영역 */}
      <div className="relative pointer-events-auto shrink-0" ref={dropdownRef}>
        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`h-12 md:h-14 flex items-center gap-2 md:gap-3 px-1.5 md:pr-2 md:pl-5 rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95 border ${isDarkMode ? 'bg-slate-800/90 border border-slate-700 hover:bg-slate-700' : 'bg-white/90 border border-slate-100 hover:bg-slate-50'}`}>
          <span className={`hidden sm:block text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{userName}</span>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-slate-200 border-2 border-emerald-500 shrink-0">
            {/* 이름 기반으로 아바타 동적 생성 */}
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userName)}`} alt="profile" className="w-full h-full object-cover" />
          </div>
        </button>

        {isDropdownOpen && (
          <div className={`absolute right-0 mt-3 w-48 sm:w-56 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 p-2 border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-100 text-slate-700'}`}>
            <div className={`flex p-1 mb-2 rounded-xl sm:rounded-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
              <button onClick={() => { if(isDarkMode) toggleDarkMode(); }} className={`flex-1 flex items-center justify-center py-2 md:py-2.5 rounded-lg sm:rounded-xl transition-all ${!isDarkMode ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><Sun size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
              <button onClick={() => { if(!isDarkMode) toggleDarkMode(); }} className={`flex-1 flex items-center justify-center py-2 md:py-2.5 rounded-lg sm:rounded-xl transition-all ${isDarkMode ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Moon size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
            </div>
            <button onClick={() => { onGoToMyPage(); setIsDropdownOpen(false); }} className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 text-left flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}><User size={16} className="text-emerald-500 sm:w-[18px] sm:h-[18px]" /><span className="text-xs sm:text-sm font-semibold">마이페이지</span></button>
            <div className={`h-px w-full my-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
            <button onClick={() => { setIsDropdownOpen(false); if(onLogout) onLogout(); }} className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 text-left flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl transition-colors text-rose-500 ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}><LogOut size={16} className="sm:w-[18px] sm:h-[18px]" /><span className="text-xs sm:text-sm font-semibold">로그아웃</span></button>
          </div>
        )}
      </div>

      <style>{`
        .ticker-container { --ticker-h: 3rem; } /* h-12 = 48px = 3rem */
        @media (min-width: 768px) { 
          .ticker-container { --ticker-h: 3.5rem; } /* md:h-14 = 56px = 3.5rem */
        }
      `}</style>
    </div>
  );
};

export default TopBar;