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
    <div className={`fixed inset-0 flex items-center justify-center p-6 z-50 font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F4F7F9]'}`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
        className={`w-full max-w-5xl h-[680px] rounded-[3rem] shadow-2xl flex items-center p-12 relative border transition-all duration-500 ${
          isDarkMode ? 'bg-[#1E293B] border-slate-700 shadow-black/40' : 'bg-white border-white shadow-slate-200/50'
        }`}
      >
        
        {/* 왼쪽 그래픽 영역 */}
        <div className="flex-1 flex items-center justify-center relative h-full">
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

        {/* 오른쪽 텍스트 및 대시보드 영역 */}
        <div className={`w-[420px] h-full flex flex-col justify-center pl-12 border-l shrink-0 text-left ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="mb-8">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-4 ${
              isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <Sparkles size={12} className="animate-pulse" /> 요리조리 분석 중
            </div>
            
            <h1 className={`text-4xl font-black tracking-tight mb-3 leading-tight whitespace-pre-line ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {message}
            </h1>
            
            <p className="text-slate-400 font-bold text-xs leading-relaxed">
              {subMessage}
            </p>
          </div>

          {/* 중앙 한글 상태 메시지바 */}
          <div className={`p-5 rounded-[2rem] border flex items-center gap-4 mb-8 transition-colors ${
            isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-[#F8FAFC] border-slate-200/60 shadow-inner'
          }`}>
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-500/20">
              <Route size={18} className="animate-pulse" />
            </div>
            <p className={`text-xs font-black ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              {progress < 40 ? "📍 출발지와 목적지 확인하는 중..." : 
               progress < 85 ? "🔥 실시간 혼잡도를 체크하고 있어요..." : 
               progress < 100 ? "✨ 가장 쾌적한 길로 쏙쏙 매칭 중!" : "🎉 경로 분석 완료! 금방 보여드릴게요!"}
            </p>
          </div>

          {/* 진행률 바 */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3 text-[10px] font-black uppercase tracking-wildest">
              <span className="text-slate-400">실시간 진행률</span>
              <span className="text-emerald-500 font-black">{progress}%</span>
            </div>
            <div className={`h-3 rounded-full w-full relative overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <motion.div 
                className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* 귀여운 단일 날씨 스탯 카드 */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-100 shadow-sm'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDarkMode ? 'bg-slate-700 text-amber-400' : 'bg-amber-50 text-amber-500'
              }`}>
                <CloudSun size={20} />
              </div>
              <div className="text-left">
                <p className={`text-xs font-black ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>오늘의 날씨</p>
                <p className={`text-sm font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>하늘 파랗고 맑음! ☀️</p>
              </div>
            </div>
            <span className="text-[11px] font-black bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/10 animate-pulse">
              나들이 가기 딱 좋은 날
            </span>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default LoadingPage;