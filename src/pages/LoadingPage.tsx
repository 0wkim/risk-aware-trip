import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Route, CloudSun, LoaderCircle, Sparkles } from 'lucide-react';

interface LoadingProps {
  message?: string;
  subMessage?: string;
  isDarkMode?: boolean;
}

const LoadingPage = ({ 
  message = "대안 경로\n분석 중!", 
  subMessage = "AI가 가장 쾌적하고 빠른 길을 찾아내고 있어요",
  isDarkMode = false 
}: LoadingProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 4));
    }, 150);
    return () => clearInterval(timer);
  }, []);

  const CX = 200;
  const CY = 200;
  const OFFSET = 120;
  const PIN_SIZE = 52;

  const lineEnds = [
    { x: CX - OFFSET, y: CY - OFFSET },
    { x: CX + OFFSET, y: CY - OFFSET },
    { x: CX - OFFSET, y: CY + OFFSET },
    { x: CX + OFFSET, y: CY + OFFSET },
  ];

  const getPinStyle = (locX: number, locY: number) => {
    const adjust = PIN_SIZE / 2;
    return {
      left: `calc(50% + ${locX - CX - adjust}px)`,
      top: `calc(50% + ${locY - CY - adjust}px)`,
      width: `${PIN_SIZE}px`,
      height: `${PIN_SIZE}px`,
    };
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center p-4 sm:p-6 z-50 font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F4F7F9]'}`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
        className={`w-full max-w-5xl min-h-[500px] lg:h-[680px] rounded-[2rem] lg:rounded-[3rem] shadow-2xl flex flex-col lg:flex-row items-center p-6 lg:p-12 relative border transition-all duration-500 overflow-hidden lg:overflow-visible ${
          isDarkMode ? 'bg-[#1E293B] border-slate-700 shadow-black/40' : 'bg-white border-white shadow-slate-200/50'
        }`}
      >
        
        {/* 그래픽 영역 (모바일: 상단, 데스크탑: 좌측) */}
        <div className="w-full lg:flex-1 flex items-center justify-center relative h-[220px] sm:h-[300px] lg:h-full shrink-0">
          {/* scale 속성을 이용해 복잡한 좌표 수정 없이 모바일에서 전체 그래픽 크기 축소 */}
          <div className="relative w-[400px] h-[400px] scale-[0.55] sm:scale-[0.75] lg:scale-100 flex items-center justify-center origin-center">
            <svg width="400" height="400" viewBox="0 0 400 400" className="absolute z-10">
              {lineEnds.map((end, i) => (
                <motion.line
                  key={i}
                  x1={CX} y1={CY}
                  x2={end.x} y2={end.y}
                  stroke={isDarkMode ? "#34D399" : "#10B981"} 
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="8 8"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
                />
              ))}
            </svg>

            {lineEnds.map((end, i) => (
              <motion.div 
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  y: [0, -6, 0]
                }}
                transition={{ 
                  scale: { delay: 0.8 + i * 0.1, type: 'spring', stiffness: 120 },
                  y: { repeat: Infinity, duration: 2, delay: i * 0.3, ease: "easeInOut" }
                }}
                className={`absolute rounded-2xl border flex items-center justify-center z-20 shadow-md ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-slate-50 border-emerald-100 text-emerald-500'
                }`}
                style={getPinStyle(end.x, end.y)}
              >
                <MapPin size={24} className="fill-emerald-500/10" />
              </motion.div>
            ))}

            <motion.div 
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
              className="relative w-24 h-24 rounded-[2.2rem] bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 border-4 border-white z-30"
            >
              <Route size={42} className="text-white" strokeWidth={2.5} />
              <LoaderCircle 
                size={115} 
                className={`absolute opacity-25 animate-spin ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`} 
                style={{ animationDuration: '2.5s' }} 
                strokeWidth={2} 
              />
            </motion.div>
          </div>
        </div>

        {/* 텍스트 및 대시보드 영역 (모바일: 하단, 데스크탑: 우측) */}
        <div className={`w-full lg:w-[420px] h-auto lg:h-full flex flex-col justify-center pt-6 lg:pt-0 lg:pl-12 border-t lg:border-t-0 lg:border-l shrink-0 text-left z-10 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="mb-6 lg:mb-8 text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] lg:text-[11px] font-black uppercase tracking-wider mb-3 lg:mb-4 ${
              isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <Sparkles size={12} className="animate-pulse" /> 요리조리 분석 중
            </div>
            
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-2 lg:mb-3 leading-tight whitespace-pre-line ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {message}
            </h1>
            
            <p className="text-slate-400 font-bold text-[11px] lg:text-xs leading-relaxed max-w-[250px] lg:max-w-none text-center lg:text-left">
              {subMessage}
            </p>
          </div>

          {/* 중앙 한글 상태 메시지바 */}
          <div className={`p-4 lg:p-5 rounded-2xl lg:rounded-[2rem] border flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8 transition-colors ${
            isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-[#F8FAFC] border-slate-200/60 shadow-inner'
          }`}>
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-500/20">
              <Route size={16} className="animate-pulse lg:w-[18px] lg:h-[18px]" />
            </div>
            <p className={`text-[11px] lg:text-xs font-black truncate w-full ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {progress < 40 ? "📍 출발지와 목적지 확인하는 중..." : 
               progress < 85 ? "🔥 실시간 혼잡도를 체크하고 있어요..." : 
               progress < 100 ? "✨ 가장 쾌적한 길로 쏙쏙 매칭 중!" : "🎉 경로 분석 완료! 금방 보여드릴게요!"}
            </p>
          </div>

          {/* 진행률 바 */}
          <div className="mb-6 lg:mb-8 px-1 lg:px-0">
            <div className="flex justify-between items-center mb-2 lg:mb-3 text-[9px] lg:text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-400">실시간 진행률</span>
              <span className="text-emerald-500 font-black">{progress}%</span>
            </div>
            <div className={`h-2.5 lg:h-3 rounded-full w-full relative overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <motion.div 
                className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* 귀여운 단일 날씨 스탯 카드 */}
          <div className={`p-3.5 lg:p-4 rounded-xl lg:rounded-2xl border flex flex-row items-center justify-between gap-2 lg:gap-0 ${
            isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-100 shadow-sm'
          }`}>
            <div className="flex items-center gap-2.5 lg:gap-3 min-w-0">
              <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-slate-700 text-amber-400' : 'bg-amber-50 text-amber-500'
              }`}>
                <CloudSun size={18} className="lg:w-5 lg:h-5" />
              </div>
              <div className="text-left min-w-0">
                <p className={`text-[10px] lg:text-xs font-black truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>오늘의 날씨</p>
                <p className={`text-xs lg:text-sm font-black tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>하늘 파랗고 맑음! ☀️</p>
              </div>
            </div>
            <span className="text-[9px] lg:text-[11px] font-black bg-amber-500/10 text-amber-500 px-2 py-1 lg:px-3 lg:py-1 rounded-md lg:rounded-full border border-amber-500/10 animate-pulse whitespace-nowrap shrink-0">
              <span className="hidden sm:inline">나들이 가기 딱 좋은 날</span>
              <span className="sm:hidden">쾌적함</span>
            </span>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default LoadingPage;