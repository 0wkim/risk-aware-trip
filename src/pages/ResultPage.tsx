import React from 'react';
// ArrowRight 아이콘을 import 목록에 추가했습니다.
import { ChevronLeft, Clock, Navigation, CheckCircle2, User, ArrowRight } from 'lucide-react';

interface Props {
  onBack: () => void;
  onGoToMyPage: () => void;
  isDarkMode: boolean;
}

const ResultPage = ({ onBack, onGoToMyPage, isDarkMode }: Props) => {
  const recommendations = [
    { id: 1, name: '카페 A', time: '25분', probability: '92%', type: 'CAFE' },
    { id: 2, name: '레스토랑 B', time: '35분', probability: '78%', type: 'FOOD' },
    { id: 3, name: '공원 C', time: '15분', probability: '95%', type: 'PARK' },
    { id: 4, name: '쇼핑몰 D', time: '45분', probability: '65%', type: 'SHOP' },
  ];

  return (
    <div className="flex h-full animate-in slide-in-from-right-4 duration-700">
      {/* 왼쪽 사이드바 영역 */}
      <div className={`w-[400px] h-full flex flex-col border-r z-10 shadow-2xl transition-all duration-500 ${
        isDarkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'
      }`}>
        <header className="p-6 flex items-center justify-between border-b border-inherit">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-black text-lg italic uppercase tracking-tighter">Results</h1>
          <button onClick={onGoToMyPage} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
            <User size={22} />
          </button>
        </header>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar text-left">
          {/* 상단 요약 카드 */}
          <div className={`p-6 rounded-[2.5rem] border ${
            isDarkMode 
              ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' 
              : 'bg-emerald-50 border-emerald-100 text-emerald-700'
          }`}>
            <div className="flex gap-3">
              <CheckCircle2 size={20} className="shrink-0" />
              <p className="font-bold text-sm leading-relaxed">
                '자매국수'를 <span className="underline underline-offset-4 font-black">1시간 10분</span> 내에 이용할 수 있는 최적의 경로를 찾았습니다.
              </p>
            </div>
          </div>
          
          {/* 추천 리스트 섹션 */}
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
                {/* 핀 포인트: ArrowRight 아이콘 사용 */}
                <button className="bg-emerald-500 text-white w-10 h-10 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 shadow-lg shadow-emerald-500/20">
                  <ArrowRight size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 오른쪽 지도 영역 */}
      <div className="flex-1 relative bg-slate-300 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover grayscale-[0.6]" 
          alt="Result Map" 
        />
        {/* 지도 위 오버레이 (디자인 포인트) */}
        <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
      </div>

      {/* 커스텀 스크롤바 스타일링 */}
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