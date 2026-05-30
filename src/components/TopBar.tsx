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
    <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center gap-6 pointer-events-none">
      
      {/* 날씨 및 혼잡도 티커 영역 */}
      <div className={`flex-1 h-14 rounded-full shadow-lg overflow-hidden backdrop-blur-md px-6 pointer-events-auto ${isDarkMode ? 'bg-slate-800/90 border border-slate-700 text-slate-200' : 'bg-white/90 border border-slate-100 text-slate-700'}`}>
        <div className="flex flex-col transition-transform duration-500 ease-in-out" style={{ transform: `translateY(-${tickerIndex * 56}px)` }}>
          {displayData.length === 0 ? (
            <div className="h-14 w-full flex items-center justify-center text-sm font-semibold text-slate-400">실시간 도시 데이터를 불러오는 중입니다...</div>
          ) : (
            displayData.map((item, idx) => (
              <div key={idx} className="h-14 w-full flex items-center justify-center gap-3 shrink-0 text-sm font-semibold">
                <span className="font-black text-emerald-500">{item.district}</span>
                <span className={`px-2 py-0.5 rounded-md text-xs text-white ${item.congestion.includes('붐빔') || item.congestion.includes('혼잡') ? 'bg-rose-500' : item.congestion.includes('보통') ? 'bg-amber-500' : 'bg-blue-500'}`}>{item.congestion}</span>
                <CloudSun size={16} className="ml-3 text-slate-400" />
                <span>{item.weather} {item.temp}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 프로필 및 드롭다운 영역 */}
      <div className="relative pointer-events-auto" ref={dropdownRef}>
        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`h-14 flex items-center gap-3 pr-2 pl-5 rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95 border ${isDarkMode ? 'bg-slate-800/90 border border-slate-700 hover:bg-slate-700' : 'bg-white/90 border border-slate-100 hover:bg-slate-50'}`}>
          <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{userName}</span>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border-2 border-emerald-500 shrink-0">
            {/* 이름 기반으로 아바타 동적 생성 */}
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userName)}`} alt="profile" />
          </div>
        </button>

        {isDropdownOpen && (
          <div className={`absolute right-0 mt-3 w-56 rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 p-2 border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-100 text-slate-700'}`}>
            <div className={`flex p-1 mb-2 rounded-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
              <button onClick={() => { if(isDarkMode) toggleDarkMode(); }} className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all ${!isDarkMode ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><Sun size={18} /></button>
              <button onClick={() => { if(!isDarkMode) toggleDarkMode(); }} className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Moon size={18} /></button>
            </div>
            <button onClick={() => { onGoToMyPage(); setIsDropdownOpen(false); }} className={`w-full px-4 py-3 text-left flex items-center gap-3 rounded-2xl transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}><User size={18} className="text-emerald-500" /><span className="text-sm font-semibold">마이페이지</span></button>
            <div className={`h-px w-full my-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
            <button onClick={() => { setIsDropdownOpen(false); if(onLogout) onLogout(); }} className={`w-full px-4 py-3 text-left flex items-center gap-3 rounded-2xl transition-colors text-rose-500 ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}><LogOut size={18} /><span className="text-sm font-semibold">로그아웃</span></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;