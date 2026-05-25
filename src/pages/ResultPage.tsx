import React, { useEffect, useRef, useState } from 'react';
import { 
  ChevronLeft, Clock, Navigation, CheckCircle2, 
  User, ArrowRight, MapPin, CloudSun, Sun, Moon, LogOut 
} from 'lucide-react';

interface Props {
  searchParams: any;
  onBack: () => void;
  onGoToMyPage: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  seoulData: any[]; // 프롭스 추가됨
}

const ResultPage = ({ searchParams, onBack, onGoToMyPage, isDarkMode, toggleDarkMode, seoulData }: Props) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { startPoint, destination, maxHours, maxMinutes } = searchParams;

  const [tickerIndex, setTickerIndex] = useState(0);

  // 결과 페이지의 감성을 위해 기존처럼 주요 6개 구만 필터링해서 보여주기
  const targetDistricts = ['강남구', '마포구', '종로구', '성동구', '영등포구', '송파구'];
  const displayData = seoulData.filter(item => targetDistricts.includes(item.district));

  useEffect(() => {
    if (displayData.length === 0) return;
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % displayData.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [displayData.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const recommendations = [
    { id: 1, name: '어반누크 성수', time: '25분', probability: '92%', type: 'CAFE' },
    { id: 2, name: '이태리국시 성수', time: '35분', probability: '78%', type: 'FOOD' },
    { id: 3, name: '서울숲', time: '15분', probability: '95%', type: 'PARK' },
    { id: 4, name: 'LCDC Seoul', time: '45분', probability: '65%', type: 'SHOP' },
  ];

  useEffect(() => {
    const { naver } = window as any;
    if (!mapElement.current || !naver) return;

    const mapOptions = {
      center: new naver.maps.LatLng(37.5666805, 126.9784147),
      zoom: 13,
    };
    
    mapInstance.current = new naver.maps.Map(mapElement.current, mapOptions);
  }, [isDarkMode]);

  return (
    <div className={`flex h-full animate-in fade-in slide-in-from-right-10 duration-700 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
      
      {/* 1. 사이드바 */}
      <div className={`w-[400px] h-full flex flex-col border-r z-20 shadow-2xl transition-all duration-500 ${
        isDarkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'
      }`}>
        <header className="p-6 flex items-center gap-4 border-b border-inherit shrink-0">
          <button 
            onClick={onBack} 
            className={`p-2.5 rounded-xl transition-all active:scale-90 ${
              isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-left">
            <h1 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>검색 결과</h1>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Optimal Alternatives</p>
          </div>
        </header>

        <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar text-left">
          <div className={`p-6 rounded-3xl border transition-all ${
            isDarkMode 
              ? 'bg-slate-800/50 border-emerald-500/30 text-slate-200' 
              : 'bg-emerald-50/50 border-emerald-100 text-slate-700'
          }`}>
            <div className="flex gap-4">
              <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-emerald-500" />
              <div className="space-y-2">
                <p className="font-bold text-sm leading-relaxed">
                  <span className="opacity-50 font-medium">'{startPoint}' → '{destination}'</span><br/>
                  최적의 경로 대안을 찾았습니다.
                </p>
                <div className="flex items-center gap-2">
                   <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-black uppercase tracking-tight">설정 시간</span>
                   <span className="font-black text-sm text-emerald-500">{maxHours}시간 {maxMinutes}분</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 pb-10">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Recommended Spots</h3>
            <div className="space-y-3">
              {recommendations.map((item) => (
                <div key={item.id} className={`group p-5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isDarkMode ? 'bg-slate-800/40 border-slate-700 hover:border-emerald-500/50' : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-md'
                  }`}>
                  <div className="flex items-center gap-4 text-left">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isDarkMode ? 'bg-slate-700 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white'
                    }`}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border border-current ${isDarkMode ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>{item.type}</span>
                        <h4 className={`font-bold text-sm tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.name}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-1"><Clock size={14} /> {item.time}</span>
                        <span className="flex items-center gap-1 text-emerald-500 font-black"><Navigation size={14} /> {item.probability}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-50 text-slate-400'} group-hover:bg-emerald-500 group-hover:text-white group-hover:translate-x-1`}>
                    <ArrowRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. 지도 영역 */}
      <div className="flex-1 relative bg-slate-200 overflow-hidden">
        <div className="absolute top-6 left-6 right-6 z-30 flex justify-between items-center gap-6">
          <div className={`flex-1 h-14 rounded-full shadow-lg overflow-hidden backdrop-blur-md px-6 ${
            isDarkMode ? 'bg-slate-800/90 border border-slate-700 text-slate-200' : 'bg-white/90 border border-slate-100 text-slate-700'
          }`}>
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

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
              className={`h-14 flex items-center gap-3 pr-2 pl-5 rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95 border ${
                isDarkMode ? 'bg-slate-800/90 border border-slate-700 hover:bg-slate-700' : 'bg-white/90 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>최서영</span>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border-2 border-emerald-500 shrink-0">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Seoyoung" alt="profile" />
              </div>
            </button>

            {isDropdownOpen && (
              <div className={`absolute right-0 mt-3 w-56 rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 p-2 border z-[100] ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-100 text-slate-700'
              }`}>
                <div className={`flex p-1 mb-2 rounded-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
                  <button 
                    onClick={() => isDarkMode && toggleDarkMode?.()} 
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all ${!isDarkMode ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Sun size={18} />
                  </button>
                  <button 
                    onClick={() => !isDarkMode && toggleDarkMode?.()} 
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Moon size={18} />
                  </button>
                </div>

                <button 
                  onClick={() => { onGoToMyPage(); setIsDropdownOpen(false); }} 
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 rounded-2xl transition-colors ${
                    isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
                  }`}
                >
                  <User size={18} className="text-emerald-500" />
                  <span className="text-sm font-semibold">마이페이지</span>
                </button>
                <div className={`h-px w-full my-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
                <button className={`w-full px-4 py-3 text-left flex items-center gap-3 rounded-2xl transition-colors text-rose-500 ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                  <LogOut size={18} />
                  <span className="text-sm font-semibold">로그아웃</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div ref={mapElement} className="w-full h-full object-cover" />
        
        {isDarkMode && <div className="absolute inset-0 bg-black/20 pointer-events-none transition-opacity duration-500 z-10" />}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#334155' : '#E2E8F0'}; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${isDarkMode ? '#475569' : '#CBD5E1'}; }
      `}</style>
    </div>
  );
};

export default ResultPage;