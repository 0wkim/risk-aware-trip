import React, { useEffect, useRef, useState } from 'react';
import { 
  ChevronLeft, Clock, Navigation, CheckCircle2, AlertTriangle, XCircle,
  MapPin, CloudSun, Sun, Moon, LogOut, User, ArrowRight, Sparkles, X, Phone, Star, Info
} from 'lucide-react';
import Maps from '../Maps/Maps';

interface Props {
  searchParams: any;
  backendResult: any; 
  onBack: () => void;
  onGoToMyPage: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  seoulData: any[];
}

const ResultPage = ({ searchParams, backendResult, onBack, onGoToMyPage, isDarkMode, toggleDarkMode, seoulData }: Props) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const startPoint = searchParams?.startPoint || searchParams?.start_point || '출발지';
  const destination = searchParams?.destination || searchParams?.dest_point || '도착지';
  const maxHours = searchParams?.maxHours || '0';
  const maxMinutes = searchParams?.maxMinutes || '0';

  const [tickerIndex, setTickerIndex] = useState(0);

  // ── 💡 [핵심 추가 1] 상세 POI 정보 조회를 위한 모달 제어 상태 변수 ──
  const [selectedPoi, setSelectedPoi] = useState<any | null>(null);

  const targetDistricts = ['강남구', '마포구', '종로구', '성동구', '영등포구', '송파구'];
  const displayData = seoulData ? seoulData.filter(item => targetDistricts.includes(item.district)) : [];

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

  // AI 혼잡도 임계값 연산
  const rawVerdict = backendResult?.verdict || 'PASS';
  const successRate = backendResult?.p_success != null ? Math.round(backendResult.p_success * 100) : 92; 

  let verdict: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
  if (rawVerdict === 'FAIL' || successRate < 50) {
    verdict = 'FAIL';
  } else if (rawVerdict === 'WARNING' || (successRate >= 50 && successRate <= 75)) {
    verdict = 'WARNING';
  } else {
    verdict = 'PASS';
  }

  const themeStyles = {
    PASS: {
      bg: isDarkMode ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-emerald-50 border-emerald-100',
      text: 'text-emerald-500',
      icon: <CheckCircle2 size={22} className="shrink-0 mt-0.5 text-emerald-500 animate-pulse" />,
      message: `목적지 내에 원활하게 도착할 확률이 매우 높습니다.\nAI가 검증을 완료했으니 기존 계획 그대로 실행하세요!`
    },
    WARNING: {
      bg: isDarkMode ? 'bg-amber-950/40 border-amber-500/30' : 'bg-amber-50 border-amber-100',
      text: 'text-amber-500',
      icon: <AlertTriangle size={22} className="shrink-0 mt-0.5 text-amber-500" />,
      message: `설정 시간 내 도착이 가능하나 밀집 정체 위험이 존재합니다. 만약을 대비한 대체 우회 장소들을 확인하세요.`
    },
    FAIL: {
      bg: isDarkMode ? 'bg-rose-950/40 border-rose-500/30' : 'bg-rose-50 border-rose-100',
      text: 'text-rose-500',
      icon: <XCircle size={22} className="shrink-0 mt-0.5 text-rose-500" />,
      message: `혼잡도 가중치 초과로 기존 계획 실행 시 지연이 확실시됩니다. 아래의 우회 대안 장소 이용을 권장합니다.`
    }
  }[verdict];

  // --- [💡 핵심 추가 2] 명세 스펙 충족용 POI 상세 더미 메타데이터 빌더 맵 ──
  let recommendations: any[] = [];

  if (verdict === 'PASS') {
    recommendations = [
      { 
        id: 1, name: `${destination} 근처 핫플 팝업`, time: '동선 내 위치', probability: '여유로움', type: 'TREND',
        phone: '02-555-1212', rating: '4.8', hours: '11:00 - 21:00', review: '인스타 감성 낭낭하고 웨이팅도 없어서 너무 쾌적해요!'
      },
      { 
        id: 2, name: '이동 경로 상 산책 가로수길', time: '도보 3분 거리', probability: '쾌적함', type: 'WALK',
        phone: '정보없음', rating: '4.9', hours: '24시간 개방', review: '복잡한 인파 피해서 가볍게 걷기 좋은 우회 산책로입니다.'
      }
    ];
  } else {
    const backendAlts = backendResult?.alternatives || [];
    if (backendAlts.length > 0) {
      recommendations = backendAlts.map((alt: any, index: number) => ({
        id: index + 1,
        name: alt.name || '대안 추천 장소',
        time: `${alt.t_travel ? Math.round(alt.t_travel) : 15}분 소요`,
        probability: alt.p_success ? `완주율 ${Math.round(alt.p_success * 100)}%` : '안전 경로',
        type: alt.place_type ? alt.place_type.toUpperCase() : 'ALT',
        phone: '02-1588-3366', rating: '4.5', hours: '10:00 - 22:00', review: '원래 가려던 곳보다 혼잡도가 절반 이하 수준이라 훨씬 조용하고 좋아요.'
      }));
    } else {
      recommendations = [
        { 
          id: 1, name: `${destination} 대체 우회지 A`, time: '도보 10분', probability: '완주율 88%', type: 'ALT',
          phone: '02-333-7788', rating: '4.6', hours: '09:00 - 21:00', review: '백엔드가 추천해준 대로 정체가 아예 없는 청정 플레이스 인증입니다.'
        },
        { 
          id: 2, name: `${destination} 인근 회피처 B`, time: '도보 14분', probability: '완주율 82%', type: 'ALT',
          phone: '02-777-9900', rating: '4.4', hours: '10:30 - 21:30', review: '유동 인구 분산도가 훌륭해서 여유롭게 머무르기 딱 맞춤이에요.'
        }
      ];
    }
  }

  return (
    <div className={`flex h-full animate-in fade-in slide-in-from-right-10 duration-700 ${isDarkMode ? 'bg-[#0F172A]' : 'bg-white'}`}>
      
      {/* 1. 사이드바 */}
      <div className={`w-[400px] h-full flex flex-col border-r z-20 shadow-2xl transition-all duration-500 ${
        isDarkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'
      }`}>
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
          
          {/* 상단 통합 판정 카드 */}
          <div className={`p-5 rounded-3xl border shadow-lg transition-all duration-500 ${themeStyles.bg}`}>
            <div className="flex gap-3">
              {themeStyles.icon}
              <div className="space-y-4 w-full overflow-hidden">
                <div className="flex items-center flex-nowrap gap-1.5 pb-2 border-b border-slate-500/10 w-full overflow-hidden">
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-black shrink-0 shadow-sm text-xs ${
                    isDarkMode ? 'bg-blue-950/60 text-blue-400 border border-blue-800/50' : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse shrink-0" />
                    <span className="opacity-60 text-[9px] font-medium uppercase shrink-0">출발</span>
                    <span className="tracking-tight max-w-[95px] truncate">{startPoint}</span>
                  </div>

                  <div className="flex items-center shrink-0 text-slate-400 font-bold animate-pulse">
                    <ArrowRight size={14} className="animate-bounce-horizontal" />
                  </div>

                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-black shrink-0 shadow-sm text-xs ${
                    isDarkMode ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50' : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}>
                    <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse shrink-0" />
                    <span className="opacity-60 text-[9px] font-medium uppercase shrink-0">도착</span>
                    <span className="tracking-tight max-w-[95px] truncate">{destination}</span>
                  </div>
                </div>

                <div className="font-bold text-sm leading-relaxed text-left">
                  <span className={`block text-[10px] font-black uppercase tracking-widest mb-0.5 ${themeStyles.text}`}>AI 분석 코멘트</span>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{themeStyles.message}</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-500/10 text-[11px]">
                   <span className="px-1.5 py-0.5 rounded bg-slate-500/10 border border-slate-500/20 text-slate-400 text-[9px] font-black uppercase">설정 시간</span>
                   <span className="font-black text-slate-500 mr-1">{maxHours}시간 {maxMinutes}분</span>
                   <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-black uppercase">성공률</span>
                   <span className="font-black text-emerald-500">{successRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {verdict === 'PASS' && (
            <div className={`p-5 rounded-2xl border flex flex-col gap-1.5 text-xs font-bold leading-relaxed transition-all ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-600'
            }`}>
              <div className="flex items-center gap-1.5 text-emerald-500 font-black text-xs"><Sparkles size={14} /> 기존 경로 유지 권장</div>
              현재 시간대 분석 결과, 목적지 일대의 교통 및 유동인구 혼잡 지수가 매우 쾌적합니다. 동선을 변경할 필요가 전혀 없습니다.
            </div>
          )}
          
          {/* 하단 카드 리스트 (클릭 시 모달 트리거 바인딩 완료) */}
          <div className="space-y-4 pb-10">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wildest ml-1">
              {verdict === 'PASS' ? '가는 길 보너스 스팟 추천' : 'Recommended Alternatives'}
            </h3>
            <div className="space-y-3">
              {recommendations.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedPoi(item)} // ✅ 클릭하면 해당 POI 패키지 상태값 저장
                  className={`group p-5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isDarkMode ? 'bg-slate-800/40 border-slate-700 hover:border-emerald-500/50' : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      item.type === 'TREND' || item.type === 'WALK' ? 'bg-emerald-500 text-white' :
                      isDarkMode ? 'bg-slate-700 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-white'
                    }`}>
                      <MapPin size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border border-current ${
                          item.type === 'TREND' || item.type === 'WALK' ? 'text-emerald-400 border-emerald-400 bg-emerald-500/10' :
                          isDarkMode ? 'text-emerald-400/70' : 'text-emerald-600/70'
                        }`}>{item.type}</span>
                        <h4 className={`font-bold text-sm tracking-tight truncate w-44 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.name}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-1"><Clock size={13} /> {item.time}</span>
                        <span className={`flex items-center gap-1 font-black ${themeStyles.text}`}><Navigation size={13} /> {item.probability}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-50 text-slate-400'} group-hover:bg-emerald-500 group-hover:text-white group-hover:translate-x-1`}>
                    <ArrowRight size={15} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. 오른쪽 지도 영역 */}
      <div className="flex-1 relative bg-slate-200 overflow-hidden">
        <Maps 
          startPlace={{ lat: backendResult?.results?.[0]?.lat || searchParams?.places?.[0]?.lat || 37.55465, lng: backendResult?.results?.[0]?.lng || searchParams?.places?.[0]?.lng || 126.97059, name: startPoint }}
          destPlace={{ lat: backendResult?.results?.[1]?.lat || searchParams?.places?.[1]?.lat || 37.55465, lng: backendResult?.results?.[1]?.lng || searchParams?.places?.[1]?.lng || 126.97059, name: destination }}
          alternatives={verdict === 'PASS' ? [] : (backendResult?.alternatives || [])} 
          routeSegments={backendResult?.route_segments || backendResult?.segments || []} 
        />

        {/* 상단 오버레이 헤더 티커 & 유저 허브 */}
        <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center gap-6">
          <div className={`flex-1 h-14 rounded-full shadow-lg overflow-hidden backdrop-blur-md px-6 ${isDarkMode ? 'bg-slate-800/90 border border-slate-700 text-slate-200' : 'bg-white/90 border border-slate-100 text-slate-700'}`}>
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
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`h-14 flex items-center gap-3 pr-2 pl-5 rounded-full shadow-lg backdrop-blur-md transition-all active:scale-95 border ${isDarkMode ? 'bg-slate-800/90 border border-slate-700 hover:bg-slate-700' : 'bg-white/90 border border-slate-100 hover:bg-slate-50'}`}>
              <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>최서영</span>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border-2 border-emerald-500 shrink-0">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Seoyoung" alt="profile" />
              </div>
            </button>
            {isDropdownOpen && (
              <div className={`absolute right-0 mt-3 w-56 rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 p-2 border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-100 text-slate-700'}`}>
                <div className={`flex p-1 mb-2 rounded-2xl ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
                  <button onClick={() => isDarkMode && toggleDarkMode()} className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all ${!isDarkMode ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><Sun size={18} /></button>
                  <button onClick={() => !isDarkMode && toggleDarkMode()} className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Moon size={18} /></button>
                </div>
                <button onClick={() => { onGoToMyPage(); setIsDropdownOpen(false); }} className={`w-full px-4 py-3 text-left flex items-center gap-3 rounded-2xl transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}><User size={18} className="text-emerald-500" /><span className="text-sm font-semibold">마이페이지</span></button>
                <div className={`h-px w-full my-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
                <button className={`w-full px-4 py-3 text-left flex items-center gap-3 rounded-2xl transition-colors text-rose-500 ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}><LogOut size={18} /><span className="text-sm font-semibold">로그아웃</span></button>
              </div>
            )}
          </div>
        </div>

        {/* ── 💡 [핵심 추가 3] 백엔드 미보유 POI 전용 테일윈드 프리미엄 팝업 모달 레이어 ── */}
        {selectedPoi && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className={`w-[420px] rounded-3xl p-6 shadow-2xl border flex flex-col gap-4 text-left animate-in zoom-in-95 duration-300 ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-800'
            }`}>
              {/* 모달 상단 헤더 */}
              <div className="flex items-center justify-between border-b pb-3 border-slate-500/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                    <Info size={16} />
                  </div>
                  <h3 className="font-black text-base tracking-tight truncate max-w-[280px]">{selectedPoi.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedPoi(null)}
                  className={`p-1.5 rounded-xl transition-all hover:scale-95 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'}`}
                >
                  <X size={16} />
                </button>
              </div>

              {/* 상세 메타 속성 리스트 영역 */}
              <div className="space-y-3.5 text-xs font-semibold text-slate-400">
                <div className="flex items-center gap-3">
                  <span className={`w-14 shrink-0 font-black tracking-wider uppercase text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>가게 정보</span>
                  <div className={`flex items-center gap-1 font-black ${verdict === 'PASS' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    <Star size={14} className="fill-current" /> {selectedPoi.rating} <span className="opacity-40 font-medium">/ 5.0</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-14 shrink-0 font-black tracking-wider uppercase text-[10px]">영업 시간</span>
                  <div className={`flex items-center gap-1.5 font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    <Clock size={14} className="opacity-60" /> {selectedPoi.hours}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-14 shrink-0 font-black tracking-wider uppercase text-[10px]">전화 번호</span>
                  <div className={`flex items-center gap-1.5 font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    <Phone size={14} className="opacity-60" /> {selectedPoi.phone}
                  </div>
                </div>

                {/* 한 줄 상세 후기 피드백 */}
                <div className={`p-4 rounded-2xl border flex flex-col gap-1.5 leading-relaxed mt-2 ${
                  isDarkMode ? 'bg-slate-800/40 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200/60 text-slate-600'
                }`}>
                  <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">대표 리뷰 스포일러</span>
                  <p className="font-bold text-xs">"{selectedPoi.review}"</p>
                </div>
              </div>

              {/* 하단 닫기 단일 컴팩트 액션 */}
              <button 
                onClick={() => setSelectedPoi(null)}
                className="w-full bg-emerald-500 text-white font-black py-3 rounded-2xl text-xs tracking-wider uppercase shadow-md hover:bg-emerald-600 transition-colors"
              >
                상세 정보 닫기
              </button>
            </div>
          </div>
        )}
        {/* ───────────────────────────────────────────────────────────────────────────── */}

        {isDarkMode && <div className="absolute inset-0 bg-black/20 pointer-events-none transition-opacity duration-500 z-10" />}
      </div>

      <style>{`
        @keyframes bounceHorizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        .animate-bounce-horizontal {
          animation: bounceHorizontal 1s infinite;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#334155' : '#E2E8F0'}; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${isDarkMode ? '#475569' : '#CBD5E1'}; }
      `}</style>
    </div>
  );
};

export default ResultPage;