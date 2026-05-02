import React, { useEffect, useRef } from 'react';
import { ChevronLeft, Clock, Navigation, CheckCircle2, User, ArrowRight } from 'lucide-react';

const ResultPage = ({ searchParams, onBack, onGoToMyPage, isDarkMode }) => {
  const mapElement = useRef(null);
  
  // 넘겨받은 데이터 구조분해 할당
  const { startPoint, destination, maxHours, maxMinutes } = searchParams;

  const recommendations = [
    { id: 1, name: '카페 A', time: '25분', probability: '92%', type: 'CAFE' },
    { id: 2, name: '레스토랑 B', time: '35분', probability: '78%', type: 'FOOD' },
    { id: 3, name: '공원 C', time: '15분', probability: '95%', type: 'PARK' },
    { id: 4, name: '쇼핑몰 D', time: '45분', probability: '65%', type: 'SHOP' },
  ];

  // 결과 페이지에도 네이버 지도 렌더링
  useEffect(() => {
    const { naver } = window;
    if (!mapElement.current || !naver) return;

    const mapOptions = {
      center: new naver.maps.LatLng(37.5666805, 126.9784147),
      zoom: 13,
    };

    const map = new naver.maps.Map(mapElement.current, mapOptions);
    // TODO: ResultPage에서는 추천 장소들을 마커로 찍어주는 로직이 들어갑니다.
  }, [isDarkMode]);

  return (
    <div className="flex h-full animate-in slide-in-from-right-4 duration-700">
      <div className={`w-[400px] h-full flex flex-col border-r z-10 shadow-2xl transition-all duration-500 ${
        isDarkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'
      }`}>
        <header className="p-6 flex items-center justify-between border-b border-inherit shrink-0">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-black text-lg italic uppercase tracking-tighter">Results</h1>
          <button onClick={onGoToMyPage} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
            <User size={22} />
          </button>
        </header>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar text-left">
          <div className={`p-6 rounded-[2.5rem] border ${
            isDarkMode 
              ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' 
              : 'bg-emerald-50 border-emerald-100 text-emerald-700'
          }`}>
            <div className="flex gap-3">
              <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
              <p className="font-bold text-sm leading-relaxed">
                출발지 '{startPoint}'에서 <br/>
                '{destination}' 주변을 <span className="underline underline-offset-4 font-black">{maxHours}시간 {maxMinutes}분</span> 내에 이용할 수 있는 최적의 경로를 찾았습니다.
              </p>
            </div>
          </div>
          
          <div className="space-y-4 pt-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Recommended Spots</h3>
            {recommendations.map((item) => (
              <div key={item.id} className={`p-5 rounded-3xl border transition-all cursor-pointer group flex items-center justify-between ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 hover:border-emerald-500/50' 
                  : 'bg-white border-slate-100 hover:border-emerald-200 shadow-sm'
              }`}>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-emerald-500 text-white uppercase">{item.type}</span>
                    <h4 className="font-bold text-sm tracking-tight">{item.name}</h4>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Clock size={14} /> {item.time}</span>
                    <span className="flex items-center gap-1 text-emerald-500"><Navigation size={14} /> {item.probability}</span>
                  </div>
                </div>
                <button className="bg-emerald-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 shadow-lg shadow-emerald-500/20">
                  <ArrowRight size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-300 overflow-hidden">
        {/* 결과 페이지 네이버 지도 렌더링 영역 */}
        <div ref={mapElement} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
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