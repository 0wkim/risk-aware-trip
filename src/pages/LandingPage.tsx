import { useEffect, useState, useMemo } from 'react';
import { ArrowRight, MapPin, CloudSun, TrendingUp, Compass, Activity, ArrowUp, Cpu } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  seoulData: any[]; 
}

const DISTRICT_MAPPING = [
  { district: '강남구', areaNm: '강남역' }, { district: '강동구', areaNm: '천호역' },
  { district: '강북구', areaNm: '미아사거리역' }, { district: '강서구', areaNm: '서울식물원·마곡나루역' },
  { district: '관악구', areaNm: '신림역' }, { district: '광진구', areaNm: '건대입구역' },
  { district: '구로구', areaNm: '신도림역' }, { district: '금천구', areaNm: '안양천' },
  { district: '노원구', areaNm: '북서울꿈의숲' }, { district: '도봉구', areaNm: '쌍문역' },
  { district: '동대문구', areaNm: '청량리 제기동 일대 전통시장' }, { district: '동작구', areaNm: '사당역' },
  { district: '마포구', areaNm: '합정역' }, { district: '서대문구', areaNm: '신촌 스타광장' },
  { district: '서초구', areaNm: '고속터미널역' }, { district: '성동구', areaNm: '왕십리역' },
  { district: '성북구', areaNm: '성신여대입구역' }, { district: '송파구', areaNm: '잠실역' },
  { district: '양천구', areaNm: '오목교역·목동운동장' }, { district: '영등포구', areaNm: '여의도' },
  { district: '용산구', areaNm: '용산역' }, { district: '은평구', areaNm: '연신내역' },
  { district: '종로구', areaNm: '광화문광장' }, { district: '중구', areaNm: '명동 관광특구' },
  { district: '중랑구', areaNm: '장한평역' }
];

export default function LandingPage({ onStart, seoulData }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [liveVisible, setLiveVisible] = useState(true);
  const [liveIndex, setLiveIndex] = useState(0);

  const { allDistrictData, crowdedPlaces } = useMemo(() => {
    if (!seoulData || seoulData.length === 0) {
      return {
        allDistrictData: DISTRICT_MAPPING.map(d => ({
          district: d.district,
          name: d.district,
          temp: '-',
          condition: '엔진 동기화 중',
          dust: '-',
          advice: '실시간 데이터를 연산하고 있습니다.'
        })),
        crowdedPlaces: [
          { rank: 1, name: '강남구', district: '강남구', crowdLevel: '데이터 로딩중', congestion: 0 },
          { rank: 2, name: '마포구', district: '마포구', crowdLevel: '데이터 로딩중', congestion: 0 },
          { rank: 3, name: '종로구', district: '종로구', crowdLevel: '데이터 로딩중', congestion: 0 },
        ]
      };
    }

    const processedData = seoulData.map((item) => {
      const congestionRaw = item.congestion || '정보없음';
      
      let congestionValue = 30;
      if (congestionRaw.includes('붐빔') || congestionRaw.includes('혼잡')) congestionValue = 90;
      else if (congestionRaw.includes('약간') || congestionRaw.includes('보통')) congestionValue = 60;
      else if (congestionRaw.includes('여유')) congestionValue = 25;

      return {
        district: item.district,
        name: item.district, 
        crowLevel: congestionRaw,
        congestion: congestionValue,
        temp: item.temp.replace('°C', ''), 
        condition: item.weather,
        dust: '좋음', 
        advice: congestionValue >= 80
          ? `⚠️ ${item.district} 부근 밀집도가 임계점을 넘었습니다. 대안 이동망이 작동 중입니다.`
          : '✨ 정체 우려가 없는 최적의 원활한 동선 흐름을 유지 중입니다.',
      };
    });

    const sorted = [...processedData].sort((a, b) => b.congestion - a.congestion);
    const top3 = sorted.slice(0, 3).map((item, index) => ({
      rank: index + 1,
      name: item.district, 
      district: item.district,
      crowdLevel: item.crowLevel,
      congestion: item.congestion,
    }));

    return { allDistrictData: processedData, crowdedPlaces: top3 };
  }, [seoulData]);

  const currentLive = allDistrictData[liveIndex] ?? allDistrictData[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const cycle = setInterval(() => {
      setLiveVisible(false);
      setTimeout(() => {
        setLiveIndex((prev) => (prev + 1) % allDistrictData.length);
        setLiveVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(cycle);
  }, [allDistrictData.length]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const congestionMeta = (level: string) => {
    if (level.includes('붐빔') || level.includes('혼잡'))
      return { label: '혼잡 최고조', bar: 'bg-rose-500 shadow-rose-500/50', badge: 'bg-rose-500/10 text-rose-600 border-rose-500/20' };
    if (level.includes('약간') || level.includes('보통'))
      return { label: '유동성 보통', bar: 'bg-amber-500 shadow-amber-500/50', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    return { label: '안정·여유', bar: 'bg-emerald-500 shadow-emerald-500/50', badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
  };

  const titleLetters1 = "인파를".split("");
  const titleLetters2 = "피해,".split("");
  const targetLetters = "완벽한경로".split("");

  return (
    <div
      style={{ fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif" }}
      className="flex flex-col min-h-screen w-full bg-[#F8FAF9] text-slate-800 relative selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[100vw] h-[100vw] md:w-[70vw] md:h-[70vw] rounded-full bg-gradient-to-tr from-emerald-200/30 to-teal-100/20 blur-[130px] animate-pulse pointer-events-none" style={{ animationDuration: '9s' }} />
        <div className="absolute top-[30%] right-[-10%] w-[90vw] h-[90vw] md:w-[60vw] md:h-[60vw] rounded-full bg-gradient-to-br from-teal-200/20 to-emerald-100/30 blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '14s' }} />
      </div>
      
      {/* 스마트 헤더 내비게이션 */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-center transition-all duration-500 ${
          scrolled
            ? 'h-[60px] bg-white/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] border-b border-slate-200/50'
            : 'h-[73px] bg-[#F8FAF9]/90 backdrop-blur-md border-b border-slate-200/30'
        }`}
      >
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 group cursor-pointer" onClick={scrollToTop}>
            <img 
              src="/logo.svg" 
              alt="ArriView Logo" 
              className="w-8 h-8 md:w-9 md:h-9 object-contain drop-shadow-md group-hover:rotate-12 transition-transform duration-300"
            />
            
            <span className="leading-none pt-[2px] tracking-tight text-slate-900 font-black text-lg md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-800">
              ArriView
            </span>
          </div>
          
          <button
            onClick={onStart}
            className="group flex items-center justify-center gap-1.5 md:gap-2 px-4 md:px-6 h-9 md:h-10 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-[11px] md:text-xs font-bold transition-all duration-300 shadow-md active:scale-95 hover:translate-y-[-2px]"
          >
            시작하기
            <ArrowRight size={14} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* 실시간 띠 배너 전광판 */}
      <div className="mt-[73px] w-full bg-slate-900 text-slate-400 py-2.5 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.25em] relative select-none overflow-hidden z-40 max-w-full">
        <div className="w-full overflow-hidden flex items-center relative max-w-full">
          <div className="animate-[ticker_22s_linear_infinite] flex items-center whitespace-nowrap gap-8 md:gap-16 shrink-0 pr-8 md:pr-16">
            <span className="flex items-center gap-2 text-emerald-400">
              <Cpu size={12} className="animate-spin" style={{ animationDuration: '4s' }} /> 
              LIVE: REALTIME SEOUL ENGINE CONNECTED
            </span>
            <span className="text-teal-400 font-extrabold">데이터 실시간 안전 가동 및 동기화 중</span>
            <span className="text-slate-500">SYSTEM CHANNELS: 25 DISTRICT DATA LIVE FEEDS CLOUD ACTIVE</span>
          </div>
          
          <div className="animate-[ticker_22s_linear_infinite] flex items-center whitespace-nowrap gap-8 md:gap-16 shrink-0 pr-8 md:pr-16" aria-hidden="true">
            <span className="flex items-center gap-2 text-emerald-400">
              <Cpu size={12} className="animate-spin" style={{ animationDuration: '4s' }} /> 
              LIVE: REALTIME SEOUL ENGINE CONNECTED
            </span>
            <span className="text-teal-400 font-extrabold">데이터 실시간 안전 가동 및 동기화 중</span>
            <span className="text-slate-500">SYSTEM CHANNELS: 25 DISTRICT DATA LIVE FEEDS CLOUD ACTIVE</span>
          </div>
        </div>
      </div>

      {/* 히어로 존 */}
      <section className="relative pt-8 pb-10 px-4 md:px-6 max-w-6xl mx-auto z-10 w-full">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8 lg:gap-8 items-center bg-white/40 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.02)]">
          
          {/* 왼쪽 레이아웃 */}
          <div className="lg:col-span-8 text-center lg:text-left space-y-6 w-full flex flex-col items-center lg:items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-emerald-400 transition-colors cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-extrabold text-[9px] md:text-[10px] tracking-widest text-emerald-600 uppercase">
                AI-Driven Flow Optimization
              </span>
            </div>

            <h1 className="text-slate-900 tracking-tighter font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.15] lg:leading-[1.08] select-none">
              <div className="block mb-1 md:mb-2">
                {titleLetters1.map((c, i) => (
                  <span key={i} className="inline-block hover:text-emerald-500 hover:scale-110 transition-transform cursor-pointer origin-center">{c}</span>
                ))}
                <span className="inline-block w-2 md:w-3" />
                {titleLetters2.map((c, i) => (
                  <span key={i} className="inline-block hover:text-emerald-500 hover:scale-110 transition-transform cursor-pointer origin-center">{c}</span>
                ))}
              </div>
              <div className="relative inline-block">
                {targetLetters.map((c, i) => (
                  <span key={i} className="inline-block text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-teal-600 transform hover:scale-110 md:hover:scale-125 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer origin-bottom drop-shadow-[0_2px_8px_rgba(16,185,129,0.1)]">{c}</span>
                ))}
                <span className="text-slate-900">로</span>
                <span className="absolute bottom-1 md:bottom-2 left-0 w-full h-[5px] md:h-[6px] bg-emerald-400/15 rounded-full -z-10" />
              </div>
            </h1>

            <p className="text-slate-500 max-w-xl font-medium text-sm sm:text-base leading-relaxed md:leading-relaxed">
              서울시 실시간 도시 정체 빅데이터를 실시간 추적 연산합니다.<br className="hidden sm:block" />
              지체되고 인파가 붐비는 구역은 우회 인프라 필터가 자동 선별하여<br className="hidden sm:block" />
              완벽한 타이밍에 원활히 주행·산책할 수 있는 대안 루트를 구축합니다.
            </p>

            <div className="pt-2 w-full lg:w-auto">
              <button
                onClick={onStart}
                className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/30 active:scale-[0.98] transition-all hover:translate-y-[-2px] overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <Compass size={18} className="group-hover:rotate-45 transition-transform duration-500" />
                <span>대안 경로 탐색하기</span>
                <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* 오른쪽 레이아웃: 모바일에서는 위쪽으로 배치되도록 flex-col-reverse 적용됨 */}
          <div className="lg:col-span-4 flex items-center justify-center p-2 md:p-4 mb-4 lg:mb-0">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-center justify-center bg-slate-50/60 rounded-full border border-slate-200/80 shadow-inner group">
              <svg className="w-full h-full animate-[spin_12s_infinite_linear] pointer-events-none" viewBox="0 0 100 100">
                <path id="heroCirclePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="transparent" />
                <text className="fill-slate-400 font-black tracking-[0.15em] uppercase text-[6px] sm:text-[6.5px]">
                  <textPath href="#heroCirclePath">ArriView Systems &bull; Live Routing Engine &bull; </textPath>
                </text>
              </svg>
              <div className="absolute w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Compass size={20} className="text-emerald-500 animate-pulse sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 메인 스택 라운지 */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-24 md:pb-32 grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 z-10 relative w-full">
        
        {/* 리얼타임 날씨 보드 */}
        <div className="md:col-span-2 bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200/60 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex flex-col justify-between relative group hover:shadow-[0_20px_50px_rgba(16,185,129,0.08)] hover:border-emerald-500/20 md:hover:translate-y-[-4px] transition-all duration-500">
          <div>
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-emerald-500 animate-pulse" />
                <span className="text-slate-400 uppercase tracking-widest font-black text-[10px] md:text-[11px]">
                  City Dashboard
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/40 text-slate-700 font-extrabold text-[11px] md:text-xs">
                <MapPin size={12} className="text-emerald-500" />
                <span className="transition-all duration-500" style={{ opacity: liveVisible ? 1 : 0.3 }}>
                  {currentLive.name}
                </span>
              </div>
            </div>

            <div className="transition-all duration-500" style={{ opacity: liveVisible ? 1 : 0, transform: liveVisible ? 'translateY(0)' : 'translateY(8px)' }}>
              <div className="flex items-center gap-2 mb-2 md:mb-3 bg-slate-50 w-max px-3 py-1 rounded-xl border border-slate-100">
                <CloudSun size={15} className="text-teal-500" />
                <span className="text-slate-600 font-bold text-[11px] md:text-xs">
                  {currentLive.condition}
                </span>
              </div>
              
              <div className="text-slate-900 tracking-tighter font-black text-5xl sm:text-6xl lg:text-7xl flex items-baseline gap-1">
                {currentLive.temp}
                <span className="text-slate-300 font-light text-2xl md:text-3xl">°C</span>
              </div>
            </div>
          </div>

          <div className="mt-6 md:mt-8">
            <div className="pt-5 md:pt-6 border-t border-slate-100 flex flex-wrap gap-2">
              <span className="bg-emerald-50 text-emerald-600 border border-emerald-100/50 px-3 py-1 rounded-xl font-bold text-[10px] md:text-[11px]">
                🍃 대기질 {currentLive.dust}
              </span>
            </div>

            <div className="mt-4 p-3.5 md:p-4 rounded-2xl bg-slate-50 border border-slate-100 min-h-[60px] md:min-h-[64px] flex items-center transition-all duration-500" style={{ opacity: liveVisible ? 1 : 0.4 }}>
              <p className="text-slate-500 font-semibold text-[11px] md:text-xs leading-relaxed">
                {currentLive.advice}
              </p>
            </div>
          </div>
        </div>

        {/* 혼잡도 트래킹 보드 */}
        <div className="md:col-span-3 bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200/60 shadow-[0_10px_40px_rgba(0,0,0,0.02)] group hover:shadow-[0_20px_50px_rgba(16,185,129,0.08)] hover:border-emerald-500/20 md:hover:translate-y-[-4px] transition-all duration-500">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-2 md:gap-2.5">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                <TrendingUp size={14} className="md:w-4 md:h-4" />
              </div>
              <span className="text-slate-800 font-black text-sm md:text-base tracking-tight">
                현재 혼잡 위험지대
              </span>
            </div>
            <span className="text-[10px] md:text-[11px] font-extrabold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              LIVE SYNCED
            </span>
          </div>

          <div className="space-y-3 md:space-y-4">
            {crowdedPlaces.map((place) => {
              const meta = congestionMeta(place.crowdLevel);
              return (
                <div
                  key={place.rank}
                  className="group/item flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-slate-50/50 border border-slate-200/40 hover:border-emerald-500/30 hover:bg-white hover:shadow-[0_8px_25px_rgba(0,0,0,0.02)] transition-all duration-300"
                >
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg md:rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-[10px] md:text-xs shadow-sm group-hover/item:bg-emerald-500 transition-colors shrink-0">
                    {place.rank}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-1 md:gap-2 mb-2 md:mb-2.5">
                      <div className="flex items-center gap-1.5 min-w-0 max-w-[60%] sm:max-w-none">
                        <MapPin size={12} className="text-slate-400 shrink-0 md:w-[13px] md:h-[13px]" />
                        <span className="text-slate-800 font-extrabold text-xs md:text-sm truncate">
                          {place.name}
                        </span>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 md:px-2.5 md:py-0.5 rounded-md md:rounded-lg border text-[9px] md:text-[10px] font-black ${meta.badge}`}>
                        {meta.label}
                      </span>
                    </div>
                    
                    <div className="w-full h-1.5 md:h-2 bg-slate-100 rounded-full overflow-hidden p-[1px] md:p-[2px]">
                      <div
                        className={`h-full ${meta.bar} rounded-full transition-all shadow-sm`}
                        style={{ 
                          width: `${place.congestion}%`,
                          transitionDuration: '1.5s'
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="mt-auto py-5 md:py-6 text-center border-t border-slate-200/60 bg-white/40 backdrop-blur-md px-4">
        <span className="text-slate-400 font-black text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.25em] uppercase">
          ArriView Systems &copy; 2026 &bull; Realtime City Engine
        </span>
      </footer>

      {/* 상단 스크롤 버튼 */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 p-3 md:p-4 bg-slate-950 text-white rounded-xl md:rounded-2xl shadow-2xl shadow-slate-950/20 hover:bg-emerald-500 hover:shadow-emerald-500/30 active:scale-90 transition-all duration-300 border border-slate-800 hover:border-emerald-400 group ${
          scrolled ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        title="맨 위로 스크롤"
      >
        <ArrowUp size={16} strokeWidth={2.5} className="md:w-[18px] md:h-[18px] group-hover:-translate-y-1 transition-transform duration-300" />
      </button>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes ticker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
      `}</style>
    </div>
  );
}