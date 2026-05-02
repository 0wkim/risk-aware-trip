import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Route, CloudSun, Clock3, LoaderCircle, Sparkles } from 'lucide-react';

interface LoadingProps {
  message?: string;
  subMessage?: string;
  isDarkMode?: boolean; // 다크모드 대응 추가
}

const LoadingPage = ({ 
  message = "Travel Route Analysis", 
  subMessage = "Powered by advanced algorithms",
  isDarkMode = false 
}: LoadingProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 5));
    }, 150);
    return () => clearInterval(timer);
  }, []);

  const CX = 200;
  const CY = 200;
  const OFFSET = 120;
  const PIN_SIZE = 48;

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
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-6xl h-[750px] rounded-[2.5rem] shadow-2xl flex items-center p-12 relative border transition-all duration-500 ${
          isDarkMode ? 'bg-[#1E293B] border-slate-700 shadow-black/40' : 'bg-white border-white shadow-slate-200/50'
        }`}
      >
        
        {/* 왼쪽: 애니메이션 영역 */}
        <div className="flex-1 flex items-center justify-center relative h-full">
          {/* SVG 점선 애니메이션 - 에메랄드 톤으로 변경 */}
          <svg width="400" height="400" viewBox="0 0 400 400" className="absolute z-10">
            {lineEnds.map((end, i) => (
              <motion.line
                key={i}
                x1={CX} y1={CY}
                x2={end.x} y2={end.y}
                stroke={isDarkMode ? "#059669" : "#10B981"} 
                strokeWidth="2"
                strokeDasharray="6 6"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.3 }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
              />
            ))}
          </svg>

          {/* 핀 아이콘 - MyPage 카드 스타일 적용 */}
          {lineEnds.map((end, i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.3 + i * 0.1, type: 'spring', stiffness: 100 }}
              className={`absolute rounded-2xl border flex items-center justify-center z-20 shadow-lg ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-white border-slate-100 text-emerald-500'
              }`}
              style={getPinStyle(end.x, end.y)}
            >
              <MapPin size={22} />
            </motion.div>
          ))}

          {/* 중앙 로고 - 에메랄드 포인트 */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="relative w-24 h-24 rounded-[2rem] bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/20 border-4 border-white z-30"
          >
            <Route size={40} className="text-white" strokeWidth={2.5} />
            <LoaderCircle 
              size={110} 
              className={`absolute opacity-20 animate-spin ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} 
              style={{ animationDuration: '3s' }} 
              strokeWidth={1.5} 
            />
          </motion.div>
        </div>

        {/* 오른쪽 정보 영역 - MyPage Dashboard 스타일 적용 */}
        <div className={`w-[450px] h-full flex flex-col justify-center pl-16 border-l shrink-0 text-left ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="mb-10">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-widest mb-4 ${
              isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <Sparkles size={12} /> System Processing
            </div>
            <h1 className={`text-4xl font-black tracking-tight mb-3 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {message}
            </h1>
            <p className="text-slate-400 font-bold text-sm">
              {subMessage}
            </p>
          </div>

          <div className={`p-6 rounded-[2rem] border flex items-center gap-4 mb-10 transition-colors ${
            isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-100 shadow-inner'
          }`}>
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
              <Route size={20} className="animate-pulse" />
            </div>
            <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {progress < 100 ? "AI 모델이 최적의 대안을 분석 중입니다..." : "모든 경로 분석이 완료되었습니다!"}
            </p>
          </div>

          {/* 프로그레스 바 - 에메랄드 테마 */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4 text-[11px] font-black uppercase tracking-widest">
              <span className="text-slate-400">Analysis Progress</span>
              <span className="text-emerald-500 font-black">{progress}%</span>
            </div>
            <div className={`h-2.5 rounded-full w-full relative overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <motion.div 
                className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* 하단 요약 카드 - StatCard 스타일 이식 */}
          <div className="grid grid-cols-3 gap-4">
            <MiniStatCard icon={<Route size={16} />} label="Routes" value="247" isDarkMode={isDarkMode} />
            <MiniStatCard icon={<CloudSun size={16} />} label="Weather" value="Clear" isDarkMode={isDarkMode} />
            <MiniStatCard icon={<Clock3 size={16} />} label="Est." value="2m 34s" isDarkMode={isDarkMode} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* 보조 컴포넌트: MyPage의 StatCard와 통일감 있는 디자인 */
const MiniStatCard = ({ icon, label, value, isDarkMode }: any) => (
  <div className={`p-5 rounded-2xl border transition-all ${
    isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'
  }`}>
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${
      isDarkMode ? 'bg-slate-700 text-emerald-400' : 'bg-emerald-50 text-emerald-500'
    }`}>
      {icon}
    </div>
    <p className={`text-lg font-black tracking-tight mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{value}</p>
    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{label}</p>
  </div>
);

export default LoadingPage;