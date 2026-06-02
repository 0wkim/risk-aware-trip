import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, Clock, Navigation, CheckCircle2, XCircle,
  ArrowRight, Sparkles, X, Info,
  Car, Train, Footprints, RefreshCw
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
  time: string;
  probability: string;
  type: string;
  congestion?: number;
  t_wait?: number;
  t_travel?: number;
  lat: number;
  lng: number;
  place_id?: string;
  categories?: string[];
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

  const [selectedPoi, setSelectedPoi] = useState<any | null>(null);

  const cachedRouteSegments = useMemo(() => {
    return backendResult?.route_segments || backendResult?.segments || [];
  }, [backendResult]);

  const cachedStartPlace = useMemo(() => {
    return {
      lat: searchParams?.places?.[0]?.lat || backendResult?.results?.[0]?.lat || 37.55465,
      lng: searchParams?.places?.[0]?.lng || backendResult?.results?.[0]?.lng || 126.97059,
      name: startPoint
    };
  }, [backendResult, searchParams, startPoint]);

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
    if (chosenMode === 'car') {
      return { mode: 'car', label: '자동차', icon: <Car size={14} className="text-indigo-400" />, themeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
    }
    if (chosenMode === 'walking') {
      return { mode: 'walking', label: '도보 이동', icon: <Footprints size={14} className="text-amber-400" />, themeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    }
    return { mode: 'transit', label: '대중교통', icon: <Train size={14} className="text-emerald-400" />, themeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  })();

  const successRate = backendResult?.p_success != null ? Math.round(backendResult.p_success * 100) : 92; 
  const SAFETY_THRESHOLD = 70; 
  const verdict: 'PASS' | 'FAIL' = successRate >= SAFETY_THRESHOLD ? 'PASS' : 'FAIL';

  const themeStyles = {
    PASS: { 
      bg: isDarkMode ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-emerald-50 border-emerald-100', 
      text: 'text-emerald-500', 
      icon: <CheckCircle2 size={22} className="shrink-0 mt-0.5 text-emerald-500 animate-pulse" />, 
      message: `목적지 내에 원활하게 도착할 확률이 높습니다 (${successRate}%).\nAI가 검증을 완료했으니 기존 계획 그대로 실행하세요!` 
    },
    FAIL: { 
      bg: isDarkMode ? 'bg-rose-950/40 border-rose-500/30' : 'bg-rose-50 border-rose-100', 
      text: 'text-rose-500', 
      icon: <XCircle size={22} className="shrink-0 mt-0.5 text-rose-500" />, 
      message: `혼잡 및 지연 가능성이 존재합니다 (성공률 ${successRate}%). 아래의 우회 대안 장소 이용을 권장합니다.` 
    }
  }[verdict];

  const recommendations = useMemo<Recommendation[]>(() => {
    if (verdict !== 'FAIL') return [];
    const backendAlts = backendResult?.alternatives || [];
    
    if (backendAlts.length > 0) {
      return backendAlts.map((alt: any, index: number) => ({ 
        id: index + 1, 
        name: alt.name || alt.place?.name || '대안 추천 장소', 
        time: `${alt.t_travel ? Math.round(alt.t_travel) : 15}분 소요`, 
        probability: alt.p_success ? `완주율 ${Math.round(alt.p_success * 100)}%` : '안전 경로', 
        type: alt.place_type ? alt.place_type.toUpperCase() : 'ALT', 
        congestion: alt.congestion,
        t_wait: alt.t_wait,
        t_travel: alt.t_travel,
        lat: alt.place?.lat !== undefined ? alt.place.lat : alt.lat,
        lng: alt.place?.lng !== undefined ? alt.place.lng : alt.lng,
        place_id: alt.place?.place_id || alt.place_id,
        categories: alt.place?.categories || alt.categories,
        course_delta: alt.course_delta,
        p_success: alt.p_success,
        p_success_delta: alt.p_success_delta,
        alt_verdict: alt.verdict,
        is_anchor: alt.is_anchor,
        confidence: alt.confidence,
        score: alt.score
      }));
    } else {
      return [
        { id: 1, name: `${destination} 대체 우회지 A`, time: '도보 10분', probability: '완주율 88%', type: 'ALT', congestion: 45.2, t_wait: 5.3, t_travel: 2.1, p_success: 0.82, p_success_delta: 0.14, confidence: 'high', score: 0.91, lat: 37.5565, lng: 126.9725, place_id: 'mock_alt_1' },
        { id: 2, name: `${destination} 인근 회피처 B`, time: '도보 14분', probability: '완주율 82%', type: 'ALT', congestion: 38.5, t_wait: 2.5, t_travel: 4.1, p_success: 0.78, p_success_delta: 0.10, confidence: 'medium', score: 0.85, lat: 37.5505, lng: 126.9685, place_id: 'mock_alt_2' }
      ];
    }
  }, [backendResult, verdict, destination]);

  const handleRerouteTarget = (poi: any) => {
    if (!onReroute) {
      alert("재라우팅 분석 처리 연동 콜백 함수가 누락되었습니다. App.tsx 프롭스를 확인하세요.");
      return;
    }

    const targetLat = poi.lat;
    const targetLng = poi.lng;
    const targetId = poi.place_id || 'alt_generated_node';

    const finalLat = targetLat !== undefined && targetLat !== null ? Number(targetLat) : cachedDestPlace.lat;
    const finalLng = targetLng !== undefined && targetLng !== null ? Number(targetLng) : cachedDestPlace.lng;

    let formattedCategories = ['spot'];
    if (Array.isArray(poi.categories) && poi.categories.length > 0) {
      formattedCategories = poi.categories;
    } else if (poi.type || poi.place_type) {
      formattedCategories = [String(poi.type || poi.place_type).toLowerCase()];
    }

    const nextDestinationNode = {
      lat: finalLat,
      lng: finalLng,
      place_id: String(targetId),
      categories: formattedCategories, 
      name: poi.name || '대체 우회지 장소'
    };

    const updatedParams = {
      ...searchParams,
      destination: poi.name || destination,
      dest_point: poi.name || destination,
      places: [
        searchParams?.places?.[0] || cachedStartPlace, 
        nextDestinationNode 
      ]
    };

    setSelectedPoi(null); 
    onReroute(updatedParams); 
  };

  return (
    <div className={`flex h-full animate-in fade-in slide-in-from-right-10 duration-700 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
      
      {/* 400px 가로 너비 분할 사이드 패널 바디 */}
      <div className={`w-[400px] h-full flex flex-col border-r z-10 shadow-2xl transition-all duration-500 ${isDarkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
        <header className="p-6 flex items-center gap-4 border-b border-inherit shrink-0">
          <button onClick={onBack} className={`p-2.5 rounded-xl transition-all active:scale-90 ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}>
            <ChevronLeft size={20} />
          </button>
          <div className="text-left">
            <h1 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>분석 결과</h1>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Analysis Dashboard</p>
          </div>
        </header>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar text-left">
          
          {/* AI 스코어 메인 보드 대형 카드 단 한 개만 렌더링 */}
          <div className={`p-5 rounded-3xl border shadow-lg transition-all duration-500 ${themeStyles.bg}`}>
            <div className="flex gap-3">
              {themeStyles.icon}
              <div className="space-y-4 w-full overflow-hidden">
                
                {/* 1. 세로 배치 타임라인 레이아웃 (글자 짤림 방지 패치) */}
                <div className="flex flex-col gap-2 pb-3 border-b border-slate-500/10 w-full">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-black shadow-sm text-xs w-full ${isDarkMode ? 'bg-blue-950/60 text-blue-400 border border-blue-800/50' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                    <span className="opacity-60 text-[9px] font-medium uppercase shrink-0">출발</span>
                    <span className="tracking-tight truncate block flex-1 text-left">{startPoint}</span>
                  </div>
                  
                  <div className="flex items-center pl-4 text-slate-400/80 dark:text-slate-500/80 my-0.5">
                    <ArrowRight size={12} className="transform rotate-90" />
                  </div>
                  
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-black shadow-sm text-xs w-full ${isDarkMode ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                    <span className="opacity-60 text-[9px] font-medium uppercase shrink-0">도착</span>
                    <span className="tracking-tight truncate block flex-1 text-left">{destination}</span>
                  </div>
                </div>

                {/* 2. AI 분석 코멘트 말풍선 컨텐츠 (중복 발생 소스 원천 도려내기 완료) */}
                <div className="font-bold text-sm leading-relaxed text-left">
                  <span className={`block text-[10px] font-black uppercase tracking-wildest mb-0.5 ${themeStyles.text}`}>AI 분석 코멘트</span>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{themeStyles.message}</p>
                </div>
                
                {/* 3. 수단 표출 뱃지 폼 */}
                <div className={`flex items-center gap-2 p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/60'}`}>
                  <span className={`p-2 rounded-xl border flex items-center justify-center shrink-0 ${detectedVehicle.themeClass}`}>
                    {detectedVehicle.icon}
                  </span>
                  <div className="text-left">
                    <span className="block text-[8px] font-black uppercase tracking-wider text-slate-400">AI 권장 수단</span>
                    <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{detectedVehicle.label}</span>
                  </div>
                </div>

                {/* 4. 시간 스펙 및 완주 확률 요약 푸터 레벨 */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-500/10 text-[11px]">
                   <span className="px-1.5 py-0.5 rounded bg-slate-500/10 border border-slate-500/20 text-slate-400 text-[9px] font-black uppercase">설정 시간</span>
                   <span className="font-black text-slate-500 mr-1">{maxHours}시간 {maxMinutes}분</span>
                   <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-black uppercase">성공률</span>
                   <span className="font-black text-emerald-500">{successRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 기존 동선 안정화 시 패스 유도 얼럿 카드 */}
          {verdict === 'PASS' && (
            <div className={`p-5 rounded-2xl border flex flex-col gap-1.5 text-xs font-bold leading-relaxed transition-all ${isDarkMode ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
              <div className="flex items-center gap-1.5 text-emerald-500 font-black text-xs"><Sparkles size={14} /> 기존 경로 유지 권장</div>
              현재 설정하신 예산 시간 대비 코스 완주 가능성이 안정적입니다. 무리하게 동선을 우회하거나 변경할 필요가 없습니다.
            </div>
          )}
          
          {/* 위험 감지 시 우회 대안 추천 리스트 카드 뷰 */}
          {verdict === 'FAIL' && recommendations.length > 0 && (
            <div className="space-y-4 pb-10 animate-in fade-in duration-300">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wildest ml-1">
                Recommended Alternatives
              </h3>
              <div className="space-y-3">
                {recommendations.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedPoi(item)} 
                    className={`group p-5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${isDarkMode ? 'bg-slate-800/40 border-slate-700 hover:border-emerald-500/50' : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-md'}`}
                  >
                    <div className="flex items-center gap-4 text-left min-w-0 flex-1">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${isDarkMode ? 'bg-slate-700 text-slate-300 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>
                        {detectedVehicle.mode === 'car' ? <Car size={18} /> : 
                         detectedVehicle.mode === 'walking' ? <Footprints size={18} /> : <Train size={18} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border border-current ${isDarkMode ? 'text-emerald-400/70' : 'text-emerald-600/70'}`}>{item.type}</span>
                          <h4 className={`font-bold text-sm tracking-tight truncate max-w-[150px] ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.name}</h4>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                          <span className="flex items-center gap-1"><Clock size={13} /> {item.time}</span>
                          <span className={`flex items-center gap-1 font-black ${themeStyles.text}`}><Navigation size={13} /> {item.probability}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleRerouteTarget(item);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-tight transition-all shrink-0 hover:scale-105 active:scale-95 ${detectedVehicle.themeClass}`}
                    >
                       선택하기
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 우측 전면 카카오맵 주행선 렌더링 영역 */}
      <div className="flex-1 relative bg-slate-200 overflow-hidden flex flex-col h-full">
        <div className="w-full z-20 shrink-0">
          <TopBar 
            seoulData={seoulData} 
            isDarkMode={isDarkMode} 
            toggleDarkMode={toggleDarkMode} 
            onGoToMyPage={onGoToMyPage} 
            onLogout={onLogout} 
          />
        </div>
        <div className="flex-1 w-full relative z-10">
          <Maps 
            startPlace={cachedStartPlace}
            destPlace={cachedDestPlace} 
            alternatives={recommendations} 
            routeSegments={cachedRouteSegments} 
          />
        </div>

        {selectedPoi && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className={`w-[420px] rounded-3xl p-6 shadow-2xl border flex flex-col gap-4 text-left animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
              <div className="flex items-center justify-between border-b pb-3 border-slate-500/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center"><Info size={16} /></div>
                  <h3 className="font-black text-base tracking-tight truncate max-w-[280px]">{selectedPoi.name}</h3>
                </div>
                <button onClick={() => setSelectedPoi(null)} className={`p-1.5 rounded-xl transition-all hover:scale-95 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'}`}>
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs font-semibold text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="w-24 shrink-0 font-black tracking-wider uppercase text-[10px]">예측 혼잡도</span>
                  <div className={`flex items-center gap-1 font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{selectedPoi.congestion !== undefined ? selectedPoi.congestion : '-'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-24 shrink-0 font-black tracking-wider uppercase text-[10px]">예상 대기</span>
                  <div className={`flex items-center gap-1.5 font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}><Clock size={14} className="opacity-60" /> {selectedPoi.t_wait !== undefined ? `${selectedPoi.t_wait}분` : '-'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-24 shrink-0 font-black tracking-wider uppercase text-[10px]">접근 이동 시간</span>
                  <div className={`flex items-center gap-1.5 font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}><Navigation size={14} className="opacity-60" /> {selectedPoi.t_travel !== undefined ? `${selectedPoi.t_travel}분` : '-'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-24 shrink-0 font-black tracking-wider uppercase text-[10px]">코스 완주율</span>
                  <div className={`flex items-center gap-1.5 font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{selectedPoi.p_success !== undefined ? `${Math.round(selectedPoi.p_success * 100)}%` : '-'}</div>
                </div>
              </div>

              <button 
                onClick={() => handleRerouteTarget(selectedPoi)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-2xl text-xs tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={13} /> 이 장소로 목적지 변경하여 재계산
              </button>
            </div>
          </div>
        )}
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