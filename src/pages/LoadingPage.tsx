import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Route, CloudSun, Clock3, LoaderCircle } from 'lucide-react';

const LoadingPage = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 5));
    }, 150);
    return () => clearInterval(timer);
  }, []);

  /* [수학적 계산 영역 - 절대 수정 금지]
    SVG 컨테이너 크기: 400x400
    중앙 좌표 (CX, CY): 200, 200
    선을 뻗을 거리 (Offset): 120
    핀 아이콘 크기 (PinSize): 48 (Tailwind w-12 = 3rem = 48px)
  */
  const CX = 200;
  const CY = 200;
  const OFFSET = 120;
  const PIN_SIZE = 48;

  // 1. 선이 끝나는 정확한 SVG 좌표 계산
  const lineEnds = [
    { x: CX - OFFSET, y: CY - OFFSET }, // 좌상
    { x: CX + OFFSET, y: CY - OFFSET }, // 우상
    { x: CX - OFFSET, y: CY + OFFSET }, // 좌하
    { x: CX + OFFSET, y: CY + OFFSET }, // 우하
  ];

  /* 2. 핀 아이콘의 정중앙을 선 끝에 맞추기 위한 CSS 절대 위치 계산
    기준점(50%)에서 {좌표차이 - 핀반지름} 만큼 이동해야 정중앙에 옵니다.
  */
  const getPinStyle = (locX: number, locY: number) => {
    const adjust = PIN_SIZE / 2; // 핀 크기의 절반 (24px)
    return {
      left: `calc(50% + ${locX - CX - adjust}px)`,
      top: `calc(50% + ${locY - CY - adjust}px)`,
      width: `${PIN_SIZE}px`,
      height: `${PIN_SIZE}px`,
    };
  };

  return (
    <div className="fixed inset-0 bg-[#F0F2F5] flex items-center justify-center p-6 z-50 font-sans text-left overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-6xl h-[720px] bg-white rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.1)] flex items-center p-12 relative border border-white overflow-hidden"
      >
        
        {/* 왼쪽: 애니메이션 영역 (여기가 핵심 수정 부위!) */}
        <div className="flex-1 flex items-center justify-center relative h-full">
          
          {/* SVG 선: (200, 200)에서 각 끝점으로 정확히 연결 */}
          <svg width="400" height="400" viewBox="0 0 400 400" className="absolute z-10">
            {lineEnds.map((end, i) => (
              <motion.line
                key={i}
                x1={CX} y1={CY}
                x2={end.x} y2={end.y}
                stroke="#D8B4FE" // 좀 더 연한 보라색으로 변경
                strokeWidth="2"
                strokeDasharray="6 6" // 점선 간격 살짝 조정
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
              />
            ))}
          </svg>

          {/* 핀 아이콘: 계산된 getPinStyle을 적용해 정중앙 정렬 */}
          {lineEnds.map((end, i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.3 + i * 0.1, type: 'spring', stiffness: 100 }}
              className="absolute bg-white rounded-2xl border border-slate-100 shadow-lg flex items-center justify-center z-20"
              style={getPinStyle(end.x, end.y)}
            >
              <MapPin size={22} className="text-indigo-400" />
            </motion.div>
          ))}

          {/* 중앙 로고 */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-2xl shadow-indigo-200 border-4 border-white z-30"
          >
            <Route size={44} className="text-white" strokeWidth={2.5} />
            <LoaderCircle size={110} className="absolute text-indigo-100 opacity-40 animate-spin" style={{ animationDuration: '5s' }} strokeWidth={1} />
          </motion.div>
        </div>

        {/* 오른쪽 정보 영역 (기존 유지) */}
        <div className="w-[450px] h-full flex flex-col justify-center pl-12 border-l border-slate-100 shrink-0">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2 italic uppercase leading-tight">Travel Route<br/>Analysis</h1>
            <p className="text-slate-400 font-bold text-xs tracking-widest uppercase">Powered by advanced algorithms</p>
          </div>

          <div className="bg-[#F8FAFC] p-6 rounded-3xl border border-slate-50 flex items-center gap-4 mb-8 shadow-inner">
            <Route size={20} className="text-indigo-400 animate-pulse" />
            <p className="text-sm font-bold text-slate-600">Checking road conditions...</p>
          </div>

          <div className="mb-12">
            <div className="flex justify-between items-center mb-3 text-[11px] font-black uppercase tracking-widest">
              <span className="text-slate-300">Analysis Progress</span>
              <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg font-bold">{progress}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full w-full relative overflow-hidden">
              <motion.div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeInOut" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <InfoCard icon={<Route size={16} />} label="Routes" value="247" color="text-purple-500" bg="bg-purple-50" />
            <InfoCard icon={<CloudSun size={16} />} label="Weather" value="Clear" color="text-emerald-500" bg="bg-emerald-50" />
            <InfoCard icon={<Clock3 size={16} />} label="Est. Time" value="2m 34s" color="text-blue-500" bg="bg-blue-50" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const InfoCard = ({ icon, label, value, color, bg }: any) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-100 text-center shadow-sm">
    <div className={`${bg} ${color} w-10 h-10 rounded-xl flex items-center justify-center mb-4 mx-auto`}>
      {icon}
    </div>
    <p className="text-xl font-black text-slate-800 italic mb-1 tracking-tight">{value}</p>
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</p>
  </div>
);

export default LoadingPage;