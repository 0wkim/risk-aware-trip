import React, { useState, useMemo, useRef } from 'react';
import { 
  ChevronLeft, Clock, Navigation, CheckCircle2, XCircle,
  ArrowRight, Sparkles, X, Info,
  Car, Train, Footprints, RefreshCw, BarChart3, Network
} from 'lucide-react';
import Maps from '../Maps/Maps';
import TopBar from '../components/TopBar';

interface Props {
  searchParams: any;
  backendResult: any; 
  onBack: () => void;
  onGoToMyPage: () => void;
  onLogout: () => void; 
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  seoulData: any[];
  onReroute?: (updatedParams: any) => void; 
}

interface Recommendation {
  id: number;
  name: string;
  probability: string;
  type: string;
  congestion?: number;
  t_wait: number;   
  t_travel: number; 
  lat: number;
  lng: number;
  place_id: string;
  categories: string[];
  course_delta?: any;
  p_success?: number;
  p_success_delta?: number;
  alt_verdict?: string;
  is_anchor?: boolean;
  confidence?: string;
  score?: number;
}

const ResultPage = ({ searchParams, backendResult, onBack, onGoToMyPage, onLogout, isDarkMode, toggleDarkMode, seoulData, onReroute }: Props) => {
  const startPoint = searchParams?.startPoint || searchParams?.start_point || '출발지';
  const destination = searchParams?.destination || searchParams?.dest_point || '도착지';
  const maxHours = searchParams?.maxHours || '0';
  const maxMinutes = searchParams?.maxMinutes || '0';

  const [selectedPoi, setSelectedPoi] = useState<Recommendation | null>(null);

  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const onTouchEnd = () => {
    const deltaY = touchEndY.current - touchStartY.current;
    if (deltaY > 40) setIsPanelExpanded(false);
    else if (deltaY < -40) setIsPanelExpanded(true);
  };

  const togglePanel = () => setIsPanelExpanded(prev => !prev);

  const isDataReady = useMemo(() => backendResult && Object.keys(backendResult).length > 0, [backendResult]);

  const cachedRouteSegments = useMemo(() => backendResult?.route_segments || backendResult?.segments || [], [backendResult]);

  const cachedStartPlace = useMemo(() => ({
    lat: searchParams?.places?.[0]?.lat || backendResult?.results?.[0]?.lat || 37.55465,
    lng: searchParams?.places?.[0]?.lng || backendResult?.results?.[0]?.lng || 126.97059,
    name: startPoint
  }), [backendResult, searchParams, startPoint]);

  const cachedDestPlace = useMemo(() => {
    const directParamsDest = searchParams?.places?.[1];
    return {
      lat: directParamsDest?.lat !== undefined ? Number(directParamsDest.lat) : (backendResult?.results?.[1]?.lat || 37.5796),
      lng: directParamsDest?.lng !== undefined ? Number(directParamsDest.lng) : (backendResult?.results?.[1]?.lng || 126.9770),
      name: destination
    };
  }, [backendResult, searchParams, destination]);

  const detectedVehicle = (() => {
    if (!backendResult || !searchParams?.places) return { mode: 'transit', label: '대중교통', icon: <Train size={14} className="text-emerald-400" />, themeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    const chosenMode = searchParams?.mode || 'transit';
    if (chosenMode === 'car') return { mode: 'car', label: '자동차', icon: <Car size={14} className="text-indigo-400" />, themeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
    if (chosenMode === 'walking') return { mode: 'walking', label: '도보 이동', icon: <Footprints size={14} className="text-amber-400" />, themeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    return { mode: 'transit', label: '대중교통', icon: <Train size={14} className="text-emerald-400" />, themeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  })();

  const successRate = backendResult?.p_success != null ? Math.round(backendResult.p_success * 100) : 92; 
  const SAFETY_THRESHOLD = 70; 
  const verdict: 'PASS' | 'FAIL' = successRate >= SAFETY_THRESHOLD ? 'PASS' : 'FAIL';

  // 💡 [여기가 핵심 수정 부분!] 백엔드 명세서에 맞게 Key 값들을 싹 매핑했어
  const originalMetrics = useMemo(() => {
    // 1. 총 예상 이동 시간
    const origTravel = backendResult?.total_time_expected ?? 0;
    // 2. 총 예상 대기/지연 시간
    const origWait = backendResult?.waypoints?.[1]?.t_wait ?? 0;
    
    // 3. 목적지 혼잡도 (waypoints 배열에서 도착지 데이터 뽑기)
    const waypoints = backendResult?.waypoints || [];
    const destCongestion = waypoints.length > 0 ? waypoints[waypoints.length - 1]?.congestion : 0;
    const origCong = destCongestion ?? 0;

    return {
      t_travel: Math.round(Number(origTravel)),
      t_wait: Math.round(Number(origWait)),
      congestion: Math.round(Number(origCong))
    };
  }, [backendResult]);

  const timeSeriesData = useMemo(() => {
    const baseHour = searchParams?.hour || 14;
    return [
      { time: `${baseHour - 1}시`, value: Math.max(15, originalMetrics.congestion - 28) },
      { time: `${baseHour}시`, value: originalMetrics.congestion },
      { time: `${baseHour + 1}시`, value: Math.min(100, originalMetrics.congestion + 14) },
      { time: `${baseHour + 2}시`, value: Math.max(25, originalMetrics.congestion - 15) },
    ];
  }, [searchParams, originalMetrics]);

  const themeStyles = {
    PASS: { 
      bg: isDarkMode ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-emerald-50 border-emerald-100', 
      text: 'text-emerald-500', 
      icon: <CheckCircle2 className="shrink-0 mt-0.5 text-emerald-500 animate-pulse md:w-[22px] md:h-[22px] w-5 h-5" />, 
      message: `목적지 내에 원활하게 도착할 확률이 높습니다 (${successRate}%).\nAI가 검증을 완료했으니 기존 계획 그대로 실행하세요!` 
    },
    FAIL: { 
      bg: isDarkMode ? 'bg-rose-950/40 border-rose-500/30' : 'bg-rose-50 border-rose-100', 
      text: 'text-rose-500', 
      icon: <XCircle className="shrink-0 mt-0.5 text-rose-500 md:w-[22px] md:h-[22px] w-5 h-5" />, 
      message: `혼잡 및 지연 가능성이 존재합니다 (성공률 ${successRate}%). 아래의 우회 대안 장소 이용을 권장합니다.` 
    }
  }[verdict];

  const recommendations = useMemo<Recommendation[]>(() => {
    if (verdict !== 'FAIL') return [];
    const backendAlts = backendResult?.alternatives || [];
    
    if (backendAlts.length > 0) {
      return backendAlts.map((alt: any, index: number): Recommendation => {
        const finalLat = alt.place?.lat !== undefined ? Number(alt.place.lat) : (alt.lat !== undefined ? Number(alt.lat) : 37.5546);
        const finalLng = alt.place?.lng !== undefined ? Number(alt.place.lng) : (alt.lng !== undefined ? Number(alt.lng) : 126.9705);
        const finalId = alt.place?.place_id || alt.place_id || `alt_node_${index}`;

        let formattedCategories: string[] = ['spot'];
        if (Array.isArray(alt.place?.categories) && alt.place.categories.length > 0) formattedCategories = alt.place.categories;
        else if (Array.isArray(alt.categories) && alt.categories.length > 0) formattedCategories = alt.categories;
        else if (alt.place_type || alt.type) formattedCategories = [String(alt.place_type || alt.type).toLowerCase()];

        return { 
          id: index + 1, 
          name: alt.name || alt.place?.name || '대안 추천 장소', 
          probability: alt.p_success != null ? `완주율 ${Math.round(alt.p_success * 100)}%` : '안전 경로', 
          type: alt.place_type ? String(alt.place_type).toUpperCase() : 'ALT', 
          congestion: alt.congestion,
          t_wait: alt.t_wait !== undefined && alt.t_wait !== null ? Number(alt.t_wait) : 0,
          t_travel: alt.t_travel !== undefined && alt.t_travel !== null ? Number(alt.t_travel) : 0,
          lat: finalLat,
          lng: finalLng,
          place_id: String(finalId),
          categories: formattedCategories,
          course_delta: alt.course_delta,
          p_success: alt.p_success,
          p_success_delta: alt.p_success_delta,
          alt_verdict: alt.alt_verdict || alt.verdict,
          is_anchor: alt.is_anchor,
          confidence: alt.confidence,
          score: alt.score
        };
      });
    } else {
      return [];
    }
  }, [backendResult, verdict, destination]);

  const handleRerouteTarget = (poi: Recommendation) => {
    if (!onReroute) return alert("재라우팅 분석 처리 연동 콜백 함수가 누락되었습니다. App.tsx 프롭스를 확인하세요.");
    const nextDestinationNode = { lat: poi.lat, lng: poi.lng, place_id: poi.place_id, categories: poi.categories, name: poi.name };
    const updatedParams = { ...searchParams, mode: searchParams?.mode || 'transit', destination: poi.name || destination, dest_point: poi.name || destination, places: [ searchParams?.places?.[0] || cachedStartPlace, nextDestinationNode ] };
    setSelectedPoi(null); 
    onReroute(updatedParams); 
  };

  const dashboardWidgets = (
    <div className="flex flex-col gap-3.5 w-full">
      <div className={`p-4 rounded-2xl shadow-lg md:shadow-2xl border backdrop-blur-md flex flex-col gap-2.5 text-left ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white/95 border-slate-100 text-slate-800'}`}>
        <div className="flex items-center gap-1.5 text-blue-500 font-black text-[10px] md:text-[11px] uppercase tracking-wider"><BarChart3 className="md:w-[13px] md:h-[13px] w-3 h-3" /> Time-Series Predict</div>
        <div className="flex items-end justify-between h-16 md:h-20 w-full pt-4 px-1 border-b border-slate-500/10">
          {timeSeriesData.map((data, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group relative">
              <span className="absolute -top-5 text-[9px] font-black opacity-0 group-hover:opacity-100 transition-all bg-slate-800 text-white px-1 rounded text-center z-40 shadow">{data.value}%</span>
              <div style={{ height: `${data.value}%` }} className={`w-4 md:w-5 rounded-t-sm transition-all duration-500 shrink-0 ${idx === 1 ? 'bg-gradient-to-t from-rose-500 to-rose-400 shadow-md shadow-rose-500/20' : 'bg-gradient-to-t from-blue-500/50 to-blue-400/50 group-hover:from-blue-500'}`} />
              <span className="text-[7px] md:text-[8px] text-slate-400 font-bold mt-1 md:mt-1.5 shrink-0 block">{data.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`p-4 rounded-2xl shadow-lg md:shadow-2xl border backdrop-blur-md flex flex-col gap-3 text-left ${isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white/95 border-slate-100 text-slate-800'}`}>
        <div className="flex items-center gap-1.5 text-indigo-500 font-black text-[10px] md:text-[11px] uppercase tracking-wider"><Network className="md:w-[13px] md:h-[13px] w-3 h-3" /> Topological Route Chain</div>
        <div className="flex flex-col gap-2.5 relative pl-0.5">
          <div className="absolute left-2.5 top-1.5 bottom-1.5 w-0.5 border-l border-dashed border-slate-500/20 z-0" />
          <div className="flex items-center gap-2 md:gap-2.5 relative z-10 text-[9px] md:text-[10px]">
            <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center text-[7px] md:text-[8px] font-black shrink-0">N1</div>
            <div className="truncate"><span className="text-slate-400 text-[7px] md:text-[8px] block font-medium">START NODE</span><b className="font-bold text-inherit truncate max-w-[200px] md:max-w-[260px] block">{startPoint}</b></div>
          </div>
          <div className="flex items-center gap-2 md:gap-2.5 relative z-10 text-[9px] md:text-[10px]">
            <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center text-[7px] md:text-[8px] font-black shrink-0">E1</div>
            <div className="truncate"><span className="text-slate-400 text-[7px] md:text-[8px] block font-medium">TRANSIT LINK</span><span className="text-slate-400 font-bold">확률 밀도 함수 결합 추정 중</span></div>
          </div>
          <div className="flex items-center gap-2 md:gap-2.5 relative z-10 text-[9px] md:text-[10px]">
            <div className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center text-[7px] md:text-[8px] font-black shrink-0">N2</div>
            <div className="truncate"><span className="text-slate-400 text-[7px] md:text-[8px] block font-medium">END NODE</span><b className="font-bold text-inherit truncate max-w-[200px] md:max-w-[260px] block">{destination}</b></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col md:flex-row h-[100dvh] md:h-screen animate-in fade-in slide-in-from-right-10 duration-700 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
      <div className={`order-2 md:order-1 w-full md:w-[400px] flex flex-col border-t md:border-t-0 md:border-r z-30 md:z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] md:shadow-2xl transition-[height] duration-500 ease-in-out rounded-t-[2rem] md:rounded-none relative -mt-6 md:mt-0 overflow-hidden ${isPanelExpanded ? 'h-[60vh] md:h-full' : 'h-[85px] md:h-full'} ${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="shrink-0 w-full cursor-pointer touch-none" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onClick={togglePanel}>
          <div className="w-12 h-1.5 bg-slate-300/50 dark:bg-slate-600/50 rounded-full mx-auto mt-3 mb-2 md:hidden" />
          <header className="px-5 pb-3 md:p-6 flex items-center gap-3 md:gap-4 border-b border-inherit">
            <button onClick={(e) => { e.stopPropagation(); onBack(); }} className={`p-2 md:p-2.5 rounded-xl transition-all active:scale-90 ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}><ChevronLeft className="md:w-5 md:h-5 w-4 h-4" /></button>
            <div className="text-left flex-1"><h1 className={`text-base md:text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>분석 결과</h1><p className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest">Analysis Dashboard</p></div>
          </header>
        </div>
        <div className={`flex-1 p-5 md:p-6 space-y-5 md:space-y-6 overflow-y-auto custom-scrollbar text-left transition-opacity duration-300 ${!isPanelExpanded ? 'opacity-0 md:opacity-100' : 'opacity-100'}`}>
          <div className={`p-4 md:p-5 rounded-2xl md:rounded-3xl border shadow-lg transition-all duration-500 ${themeStyles.bg}`}>
            <div className="flex gap-2.5 md:gap-3">
              {themeStyles.icon}
              <div className="space-y-3.5 md:space-y-4 w-full overflow-hidden">
                <div className="flex flex-col gap-1.5 md:gap-2 pb-2.5 md:pb-3 border-b border-slate-500/10 w-full">
                  <div className={`flex items-center gap-2 px-2.5 md:px-3 py-1.5 rounded-lg md:rounded-xl font-black shadow-sm text-[11px] md:text-xs w-full ${isDarkMode ? 'bg-blue-950/60 text-blue-400 border border-blue-800/50' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" /><span className="opacity-60 text-[8px] md:text-[9px] font-medium uppercase shrink-0">출발</span><span className="tracking-tight truncate block flex-1 text-left">{startPoint}</span></div>
                  <div className="flex items-center pl-3 md:pl-4 text-slate-400/80 dark:text-slate-500/80 my-0"><ArrowRight size={12} className="transform rotate-90 md:w-3 md:h-3 w-2.5 h-2.5" /></div>
                  <div className={`flex items-center gap-2 px-2.5 md:px-3 py-1.5 rounded-lg md:rounded-xl font-black shadow-sm text-[11px] md:text-xs w-full ${isDarkMode ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}><span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" /><span className="opacity-60 text-[8px] md:text-[9px] font-medium uppercase shrink-0">도착</span><span className="tracking-tight truncate block flex-1 text-left">{destination}</span></div>
                </div>
                <div className="font-bold text-xs md:text-sm leading-relaxed text-left"><span className={`block text-[9px] md:text-[10px] font-black uppercase tracking-wildest mb-0.5 ${themeStyles.text}`}>AI 분석 코멘트</span><p className={`text-[11px] md:text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{themeStyles.message}</p></div>
                <div className={`p-3 md:p-3.5 rounded-xl md:rounded-2xl border text-[11px] md:text-xs font-semibold flex flex-col gap-1.5 md:gap-2 ${isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200/70 text-slate-700'}`}>
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-slate-400 block pb-1 border-b border-inherit">기존 목적지 예측 지표 요약</span>
                  <div className="grid grid-cols-2 gap-1.5 md:gap-2 text-[10px] md:text-[11px]">
                    <div className="flex items-center gap-1 md:gap-1.5"><Clock size={10} className="text-slate-400 md:w-3 md:h-3" /><span>예상 이동: <b className="font-black text-inherit">{originalMetrics.t_travel}분</b></span></div>
                    <div className="flex items-center gap-1 md:gap-1.5"><Clock size={10} className="text-amber-500 md:w-3 md:h-3" /><span>예상 대기: <b className="font-black text-inherit">{originalMetrics.t_wait}분</b></span></div>
                    <div className="flex items-center gap-1 md:gap-1.5 col-span-2 pt-1 border-t border-dashed border-slate-500/10"><Navigation size={10} className="text-rose-500 md:w-3 md:h-3" /><span>도착 시 예측 혼잡도: <b className="font-black text-rose-500">{originalMetrics.congestion}%</b></span></div>
                  </div>
                </div>
                <div className={`flex items-center gap-2 p-2 md:p-3 rounded-xl md:rounded-2xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/60'}`}><span className={`p-1.5 md:p-2 rounded-lg md:rounded-xl border flex items-center justify-center shrink-0 ${detectedVehicle.themeClass}`}>{detectedVehicle.icon}</span><div className="text-left"><span className="block text-[7px] md:text-[8px] font-black uppercase tracking-wider text-slate-400">AI 권장 수단</span><span className={`text-[11px] md:text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{detectedVehicle.label}</span></div></div>
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-500/10 text-[10px] md:text-[11px]">
                   <span className="px-1.5 py-0.5 rounded bg-slate-500/10 border border-slate-500/20 text-slate-400 text-[8px] md:text-[9px] font-black uppercase">가용 예산</span><span className="font-black text-slate-500 mr-0.5 md:mr-1">{maxHours}시간 {maxMinutes}분</span><span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[8px] md:text-[9px] font-black uppercase">성공률</span><span className="font-black text-emerald-500">{successRate}%</span>
                </div>
              </div>
            </div>
          </div>
          {verdict === 'PASS' && (
            <div className={`p-4 md:p-5 rounded-xl md:rounded-2xl border flex flex-col gap-1.5 text-[11px] md:text-xs font-bold leading-relaxed transition-all ${isDarkMode ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-600'}`}><div className="flex items-center gap-1.5 text-emerald-500 font-black text-[11px] md:text-xs"><Sparkles className="md:w-3.5 md:h-3.5 w-3 h-3" /> 기존 경로 유지 권장</div>현재 설정하신 가용 시간 예산 대비 코스 완주 가능성이 안정적입니다. 무리하게 동선을 우회하거나 변경할 필요가 없습니다.</div>
          )}
          {verdict === 'FAIL' && recommendations.length > 0 && (
            <div className="space-y-3 md:space-y-4 pb-4 animate-in fade-in duration-300">
              <h3 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-wildest ml-1">Recommended Alternatives</h3>
              <div className="space-y-2.5 md:space-y-3">
                {recommendations.map((item: Recommendation) => (
                  <div key={item.id} onClick={() => setSelectedPoi(item)} className={`group p-3.5 md:p-5 rounded-xl md:rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${isDarkMode ? 'bg-slate-800/40 border-slate-700 hover:border-emerald-500/50' : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-md'}`}>
                    <div className="flex items-center gap-3 md:gap-4 text-left min-w-0 flex-1">
                      <div className={`w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${isDarkMode ? 'bg-slate-700 text-slate-300 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>{detectedVehicle.mode === 'car' ? <Car size={16} className="md:w-[18px] md:h-[18px]" /> : detectedVehicle.mode === 'walking' ? <Footprints size={16} className="md:w-[18px] md:h-[18px]" /> : <Train size={16} className="md:w-[18px] md:h-[18px]" />}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 md:gap-2 mb-1"><span className={`text-[8px] md:text-[9px] font-black px-1.5 py-0.5 rounded border border-current ${isDarkMode ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>{item.type}</span><h4 className={`font-bold text-xs md:text-sm tracking-tight truncate max-w-[120px] md:max-w-[150px] ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.name}</h4></div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 md:gap-3 text-[10px] md:text-[11px] font-bold text-slate-500"><span className="flex items-center gap-1"><Clock size={10} className="text-slate-400 shrink-0 md:w-[13px] md:h-[13px]" /> 이동 {Math.round(item.t_travel)}분 / 대기 {Math.round(item.t_wait)}분</span><span className={`flex items-center gap-1 font-black ${themeStyles.text}`}><Navigation size={10} className="shrink-0 md:w-[13px] md:h-[13px]" /> {item.probability}</span></div>
                      </div>
                    </div>
                    <div onClick={(e) => { e.stopPropagation(); handleRerouteTarget(item); }} className={`px-2 py-1.5 md:px-2.5 md:py-1.5 rounded-md md:rounded-lg border text-[8px] md:text-[9px] font-black uppercase tracking-tight transition-all shrink-0 hover:scale-105 active:scale-95 ${detectedVehicle.themeClass}`}>선택</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="md:hidden pt-4 pb-6 w-full">{dashboardWidgets}</div>
        </div>
      </div>
      <div className="order-1 md:order-2 flex-1 relative bg-slate-200 overflow-hidden flex flex-col h-full z-10">
        <div className="w-full z-20 shrink-0"><TopBar seoulData={seoulData} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} onGoToMyPage={onGoToMyPage} onLogout={onLogout} /></div>
        <div className="flex-1 w-full relative z-10">
          {!isDataReady ? (
            <div className={`w-full h-full flex flex-col items-center justify-center gap-3 ${isDarkMode ? 'bg-[#0F172A] text-slate-400' : 'bg-slate-100 text-slate-500'}`}><div className="w-8 h-8 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" /><span className="text-[11px] font-bold animate-pulse">경로 분석 및 지도 세팅 중...</span></div>
          ) : (
            <Maps startPlace={cachedStartPlace} destPlace={cachedDestPlace} alternatives={recommendations} routeSegments={cachedRouteSegments} />
          )}
        </div>
        <div className="hidden md:flex absolute bottom-5 right-5 z-30 flex-col gap-3.5 max-w-[340px] w-full animate-in slide-in-from-bottom-5 duration-500">{dashboardWidgets}</div>
      </div>
      {selectedPoi && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-[420px] rounded-[2rem] md:rounded-3xl p-5 md:p-6 shadow-2xl border flex flex-col gap-3.5 md:gap-4 text-left animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-500/10">
              <div className="flex items-center gap-2 min-w-0 pr-2"><div className="w-6 h-6 md:w-7 md:h-7 rounded-md md:rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0"><Info size={14} className="md:w-4 md:h-4" /></div><h3 className="font-black text-sm md:text-base tracking-tight truncate">{selectedPoi.name}</h3></div>
              <button onClick={() => setSelectedPoi(null)} className={`p-1.5 rounded-xl transition-all hover:scale-95 shrink-0 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'}`}><X size={16} /></button>
            </div>
            <div className="space-y-3 md:space-y-3.5 text-[11px] md:text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-2 md:gap-3"><span className="w-20 md:w-24 shrink-0 font-black tracking-wider uppercase text-[9px] md:text-[10px]">예측 혼잡도</span><div className={`flex items-center gap-1 font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{selectedPoi.congestion !== undefined ? selectedPoi.congestion : '-'}</div></div>
              <div className="flex items-center gap-2 md:gap-3"><span className="w-20 md:w-24 shrink-0 font-black tracking-wider uppercase text-[9px] md:text-[10px]">예상 대기</span><div className={`flex items-center gap-1.5 font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}><Clock size={12} className="opacity-60 md:w-3.5 md:h-3.5" /> {Math.round(selectedPoi.t_wait)}분</div></div>
              <div className="flex items-center gap-2 md:gap-3"><span className="w-20 md:w-24 shrink-0 font-black tracking-wider uppercase text-[9px] md:text-[10px]">출발지 이동</span><div className={`flex items-center gap-1.5 font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}><Navigation size={12} className="opacity-60 md:w-3.5 md:h-3.5" /> {Math.round(selectedPoi.t_travel)}분</div></div>
              <div className="flex items-center gap-2 md:gap-3"><span className="w-20 md:w-24 shrink-0 font-black tracking-wider uppercase text-[9px] md:text-[10px]">코스 완주율</span><div className={`flex items-center gap-1.5 font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{selectedPoi.p_success !== undefined ? `${Math.round(selectedPoi.p_success * 100)}%` : '-'}</div></div>
            </div>
            <button onClick={() => handleRerouteTarget(selectedPoi)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 md:py-3.5 rounded-xl md:rounded-2xl text-[11px] md:text-xs tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-1.5 mt-1"><RefreshCw size={12} className="md:w-[13px] md:h-[13px]" /> 이 장소로 목적지 변경</button>
          </div>
        </div>
      )}
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 5px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#334155' : '#E2E8F0'}; border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${isDarkMode ? '#475569' : '#CBD5E1'}; }`}</style>
    </div>
  );
};

export default ResultPage;