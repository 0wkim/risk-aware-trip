import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ArrowRight, User, Moon, Sun, Route, Star, Home, Briefcase, LogOut, CloudSun } from 'lucide-react';

interface Props {
  onSearch: (params: any) => void;
  onGoToMyPage: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  initialParams: any;
}

const SEOUL_API_KEY = import.meta.env.VITE_SEOUL_API_KEY;

const DISTRICT_MAPPING = [
  { district: '강남구', areaNm: '강남역' },
  { district: '강동구', areaNm: '천호역' },
  { district: '강북구', areaNm: '미아사거리역' },
  { district: '강서구', areaNm: '서울식물원·마곡나루역' },
  { district: '관악구', areaNm: '신림역' },
  { district: '광진구', areaNm: '건대입구역' },
  { district: '구로구', areaNm: '신도림역' },
  { district: '금천구', areaNm: '안양천' },
  { district: '노원구', areaNm: '북서울꿈의숲' },
  { district: '도봉구', areaNm: '쌍문역' },
  { district: '동대문구', areaNm: '청량리 제기동 일대 전통시장' },
  { district: '동작구', areaNm: '사당역' },
  { district: '마포구', areaNm: '합정역' },
  { district: '서대문구', areaNm: '신촌 스타광장' },
  { district: '서초구', areaNm: '고속터미널역' },
  { district: '성동구', areaNm: '왕십리역' },
  { district: '성북구', areaNm: '성신여대입구역' },
  { district: '송파구', areaNm: '잠실역' },
  { district: '양천구', areaNm: '오목교역·목동운동장' },
  { district: '영등포구', areaNm: '여의도' },
  { district: '용산구', areaNm: '용산역' },
  { district: '은평구', areaNm: '연신내역' },
  { district: '종로구', areaNm: '광화문광장' },
  { district: '중구', areaNm: '명동 관광특구' },
  { district: '중랑구', areaNm: '장한평역' }
];

const MainMapPage = ({ onSearch, onGoToMyPage, isDarkMode, toggleDarkMode, initialParams }: Props) => {
  const [startPoint, setStartPoint] = useState(initialParams.startPoint);
  const [destination, setDestination] = useState(initialParams.destination);
  const [maxHours, setMaxHours] = useState(initialParams.maxHours);
  const [maxMinutes, setMaxMinutes] = useState(initialParams.maxMinutes);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mapElement = useRef(null);

  const [seoulStatus, setSeoulStatus] = useState<any[]>([]);
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const promises = DISTRICT_MAPPING.map(async (item) => {
          const url = `http://openapi.seoul.go.kr:8088/${SEOUL_API_KEY}/json/citydata/1/5/${encodeURIComponent(item.areaNm)}`;
          const response = await fetch(url);
          const json = await response.json();
          const cityData = json?.CITYDATA;
          const weatherBase = cityData?.WEATHER_STTS?.[0];
          
          return {
            district: item.district,
            congestion: cityData?.LIVE_PPLTN_STTS?.[0]?.AREA_CONGEST_LVL || '정보없음',
            temp: `${weatherBase?.TEMP || '-'}°C`,
            weather: weatherBase?.WEATHER_STTUS || weatherBase?.FCST24HOURS?.[0]?.SKY_STTS || '정보없음'
          };
        });

        const results = await Promise.all(promises);
        setSeoulStatus(results);
      } catch (error) {
        console.error("Seoul API fetch error:", error);
      }
    };

    fetchCityData();
  }, []);

  useEffect(() => {
    if (seoulStatus.length === 0) return;
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % seoulStatus.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [seoulStatus.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const { naver } = window as any;
    if (!mapElement.current || !naver) return;

    const mapOptions = {
      center: new naver.maps.LatLng(37.5666805, 126.9784147),
      zoom: 13,
    };
    const map = new naver.maps.Map(mapElement.current, mapOptions);
  }, [isDarkMode]);

  const handleSearchClick = () => {
    onSearch({ startPoint, destination, maxHours, maxMinutes });
  };

  const favorites = [
    { id: 1, name: '집', address: '서울특별시 강남구 테헤란로 123', icon: <Home size={16} /> },
    { id: 2, name: '회사', address: '경기도 성남시 분당구 판교역로 166', icon: <Briefcase size={16} /> }
  ];

  return (
    <div className="flex h-full animate-in fade-in duration-700">
      
      {/* 1. 왼쪽 사이드바 */}
      <div className={`w-[400px] h-full flex flex-col border-r z-10 shadow-2xl transition-all duration-500 ${
        isDarkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'
      }`}>
        <header className="p-6 flex items-center justify-between border-b border-inherit shrink-0">
          <div className="flex items-center gap-2 text-emerald-500">
            <Route size={24} />
            <h1 className="font-bold text-lg tracking-tight">스마트 경로 대안</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex flex-col gap-8 text-left">
          <div className="space-y-6">
            <div>
              <label className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-2 block">Starting Point</label>
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <MapPin size={18} className="text-blue-500 shrink-0" />
                <input type="text" value={startPoint} onChange={(e) => setStartPoint(e.target.value)} placeholder="출발지를 입력하세요" className="bg-transparent outline-none w-full font-bold text-sm text-inherit" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-black text-rose-500 uppercase tracking-widest mb-2 block">Destination</label>
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <MapPin size={18} className="text-rose-500 shrink-0" />
                <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="도착지를 입력하세요" className="bg-transparent outline-none w-full font-bold text-sm text-inherit" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Max Travel Time</label>
            <div className="flex gap-3">
              <div className={`flex-1 flex items-center p-4 rounded-2xl border transition-all focus-within:border-emerald-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <input type="number" value={maxHours} onChange={(e) => setMaxHours(e.target.value)} min="0" className="bg-transparent outline-none w-full text-xl font-black text-emerald-500 text-center" />
                <span className="ml-1 text-xs font-bold opacity-50 uppercase">Hr</span>
              </div>
              <div className={`flex-1 flex items-center p-4 rounded-2xl border transition-all focus-within:border-emerald-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <input type="number" value={maxMinutes} onChange={(e) => setMaxMinutes(e.target.value)} min="0" max="59" className="bg-transparent outline-none w-full text-xl font-black text-emerald-500 text-center" />
                <span className="ml-1 text-xs font-bold opacity-50 uppercase">Min</span>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center gap-2 mb-4">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <h3 className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>즐겨찾는 장소</h3>
            </div>
            <div className="space-y-3">
              {favorites.map(fav => (
                <button key={fav.id} onClick={() => setDestination(fav.name)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:border-emerald-500/50' : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-md'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-slate-700 text-slate-400 group-hover:text-emerald-400' : 'bg-slate-50 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>{fav.icon}</div>
                  <div><p className={`font-bold text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{fav.name}</p><p className="text-[10px] text-slate-500 truncate w-40 mt-0.5">{fav.address}</p></div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1"></div>
          <button onClick={handleSearchClick} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-3xl font-black shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm shrink-0">
            Check Alternatives <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* 2. 오른쪽 지도 영역 */}
      <div className="flex-1 relative bg-slate-200 overflow-hidden">
        <div ref={mapElement} className="w-full h-full object-cover" />

        {/* 3. 지도 위 상단 바 */}
        <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center gap-6">
          <div className={`flex-1 h-14 rounded-full shadow-lg overflow-hidden backdrop-blur-md px-6 ${isDarkMode ? 'bg-slate-800/90 border border-slate-700 text-slate-200' : 'bg-white/90 border border-slate-100 text-slate-700'}`}>
            <div className="flex flex-col transition-transform duration-500 ease-in-out" style={{ transform: `translateY(-${tickerIndex * 56}px)` }}>
              {seoulStatus.length === 0 ? (
                <div className="h-14 w-full flex items-center justify-center text-sm font-semibold text-slate-400">실시간 도시 데이터를 불러오는 중입니다...</div>
              ) : (
                seoulStatus.map((item, idx) => (
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
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`h-14 flex items-center gap-3 pr-2 pl-5 rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95 ${isDarkMode ? 'bg-slate-800/90 border border-slate-700 hover:bg-slate-700' : 'bg-white/90 border border-slate-100 hover:bg-slate-50'}`}>
              <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>최서영</span>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border-2 border-emerald-500 shrink-0">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Seoyoung" alt="profile" />
              </div>
            </button>

            {isDropdownOpen && (
              <div className={`absolute right-0 mt-3 w-56 rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 p-2 border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-100 text-slate-700'}`}>
                
                {/* ☀️/🌙 테마 세그먼트 버튼 */}
                <div className={`flex p-1 mb-2 rounded-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
                  <button 
                    onClick={() => isDarkMode && toggleDarkMode()} 
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all ${!isDarkMode ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Sun size={18} />
                  </button>
                  <button 
                    onClick={() => !isDarkMode && toggleDarkMode()} 
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Moon size={18} />
                  </button>
                </div>

                <button onClick={() => { onGoToMyPage(); setIsDropdownOpen(false); }} className={`w-full px-4 py-3 text-left flex items-center gap-3 rounded-2xl transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
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

export default MainMapPage;