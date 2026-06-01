import React, { useEffect, useState } from 'react';
import { ArrowRight, MapPin, Navigation, Cloud, TrendingUp } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  seoulData: any[]; 
}

// 서울시 25개 구 전체 리스트 적용
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

  // 25개 구 전체를 초기 더미 데이터로 세팅 (역 이름이 아닌 구 이름 기준)
  const [allDistrictData, setAllDistrictData] = useState<any[]>(
    DISTRICT_MAPPING.map(d => ({
      district: d.district,
      name: d.district,
      temp: '-',
      condition: '불러오는 중...',
      dust: '-',
      advice: '데이터를 분석 중입니다.'
    }))
  );

  const [crowdedPlaces, setCrowdedPlaces] = useState<any[]>([
    { rank: 1, name: '강남구', district: '강남구', crowdLevel: '데이터 로딩중', congestion: 0 },
    { rank: 2, name: '마포구', district: '마포구', crowdLevel: '데이터 로딩중', congestion: 0 },
    { rank: 3, name: '종로구', district: '종로구', crowdLevel: '데이터 로딩중', congestion: 0 },
  ]);

  const currentLive = allDistrictData[liveIndex] ?? allDistrictData[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 3초마다 25개 구 순환 (fade out → index 변경 → fade in)
  useEffect(() => {
    const cycle = setInterval(() => {
      setLiveVisible(false);
      setTimeout(() => {
        setLiveIndex((prev) => (prev + 1) % allDistrictData.length);
        setLiveVisible(true);
      }, 350);
    }, 3000);
    return () => clearInterval(cycle);
  }, [allDistrictData.length]);

  // App.tsx에서 넘겨준 seoulData가 업데이트될 때마다 갱신 (구 기준)
  useEffect(() => {
    if (!seoulData || seoulData.length === 0) return;

    const processedData = seoulData.map((item) => {
      const congestionRaw = item.congestion || '정보없음';
      
      let congestionValue = 30;
      if (congestionRaw.includes('붐빔') || congestionRaw.includes('혼잡')) congestionValue = 90;
      else if (congestionRaw.includes('약간') || congestionRaw.includes('보통')) congestionValue = 60;
      else if (congestionRaw.includes('여유')) congestionValue = 25;

      return {
        district: item.district,
        name: item.district, // 역 이름이 아닌 '구' 이름 사용
        crowdLevel: congestionRaw,
        congestion: congestionValue,
        temp: item.temp.replace('°C', ''), 
        condition: item.weather,
        dust: '좋음', 
        advice:
          congestionValue >= 80
            ? `${item.district} 일대 혼잡도가 높습니다.`
            : '현재 쾌적한 이동 환경입니다.',
      };
    });

    // 혼잡도 높은 순으로 구 정렬
    const sorted = [...processedData].sort((a, b) => b.congestion - a.congestion);
    const top3 = sorted.slice(0, 3).map((item, index) => ({
      rank: index + 1,
      name: item.district, // 랭킹에도 역 대신 '구' 이름 표시
      district: item.district,
      crowdLevel: item.crowdLevel,
      congestion: item.congestion,
    }));

    setCrowdedPlaces(top3);
    setAllDistrictData(processedData);
  }, [seoulData]);

  const congestionMeta = (level: string) => {
    if (level.includes('붐빔') || level.includes('혼잡'))
      return { label: '매우 혼잡', dot: 'bg-red-400', bar: 'bg-red-400', text: 'text-red-500', badge: 'bg-red-50 text-red-500 border-red-100' };
    if (level.includes('약간') || level.includes('보통'))
      return { label: '보통', dot: 'bg-amber-400', bar: 'bg-amber-400', text: 'text-amber-500', badge: 'bg-amber-50 text-amber-500 border-amber-100' };
    return { label: '여유', dot: 'bg-emerald-400', bar: 'bg-emerald-400', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
  };

  return (
    <div
      style={{ fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif" }}
      className="min-h-screen bg-[#F5F7F5] text-gray-800"
    >
      {/* 스티키 헤더 */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100/80'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-200">
              <Navigation size={13} className="text-white" strokeWidth={2.5} />
            </div>
            <span
              className="tracking-tight text-gray-900"
              style={{ fontWeight: 800, fontSize: '0.95rem' }}
            >
              ArriView
            </span>
          </div>
          <button
            onClick={onStart}
            className={`flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-sm shadow-sm shadow-emerald-200 active:scale-95 transition-all duration-300 ${
              scrolled ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'
            }`}
            style={{ fontWeight: 700 }}
          >
            시작하기 <ArrowRight size={13} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* 히어로 */}
      <section className="relative pt-36 pb-24 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-emerald-100/60 blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-32 h-32 rounded-full bg-emerald-200/30 blur-2xl pointer-events-none" />
        <div className="absolute top-32 right-1/4 w-24 h-24 rounded-full bg-teal-200/30 blur-2xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-emerald-100 text-emerald-600 mb-8 shadow-sm"
            style={{ fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.1em' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            REAL-TIME ROUTE OPTIMIZATION
          </div>

          <h1
            className="text-gray-900 tracking-tight mb-5"
            style={{ fontWeight: 900, fontSize: 'clamp(2.8rem, 7vw, 5rem)', lineHeight: 1.05, letterSpacing: '-0.03em' }}
          >
            인파를 피해,
            <br />
            <span className="text-emerald-500">완벽한 경로</span>로
          </h1>

          <p
            className="text-gray-500 max-w-md mx-auto mb-10"
            style={{ fontWeight: 400, fontSize: '1rem', lineHeight: 1.7 }}
          >
            서울시 실시간 도시 데이터를 분석해<br />
            지금 가장 쾌적한 이동 경로를 안내합니다.
          </p>

          <button
            onClick={onStart}
            className="group inline-flex items-center gap-2.5 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl transition-all hover:shadow-xl hover:shadow-emerald-200 active:scale-95"
            style={{ fontWeight: 700, fontSize: '0.95rem' }}
          >
            지금 시작하기
            <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* 라이브 데이터 섹션 */}
      <section className="max-w-5xl mx-auto px-6 pb-28 grid md:grid-cols-5 gap-4">
        {/* 날씨 카드 */}
        <div className="md:col-span-2 bg-white rounded-[1.75rem] p-7 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span
                className="text-emerald-500 uppercase tracking-widest"
                style={{ fontWeight: 800, fontSize: '0.65rem' }}
              >
                Live Status
              </span>
            </div>
            <span
              className="text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 transition-all duration-300"
              style={{ fontWeight: 600, fontSize: '0.7rem', opacity: liveVisible ? 1 : 0 }}
            >
              {currentLive.name}
            </span>
          </div>

          <div
            className="flex-1 transition-all duration-300"
            style={{ opacity: liveVisible ? 1 : 0, transform: liveVisible ? 'translateY(0)' : 'translateY(6px)' }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Cloud size={13} className="text-gray-300" />
              <span className="text-gray-400" style={{ fontWeight: 500, fontSize: '0.8rem' }}>
                {currentLive.condition}
              </span>
            </div>
            <div
              className="text-gray-900 tracking-tight"
              style={{ fontWeight: 900, fontSize: '3.8rem', lineHeight: 1, letterSpacing: '-0.04em' }}
            >
              {currentLive.temp}
              <span className="text-gray-400" style={{ fontSize: '1.8rem' }}>°C</span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-2">
            <span
              className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-1 rounded-full"
              style={{ fontWeight: 700, fontSize: '0.7rem' }}
            >
              미세먼지 {currentLive.dust}
            </span>
          </div>

          <p
            className="mt-4 text-gray-400 transition-all duration-300"
            style={{ fontWeight: 400, fontSize: '0.75rem', lineHeight: 1.6, opacity: liveVisible ? 1 : 0 }}
          >
            {currentLive.advice}
          </p>
        </div>

        {/* 혼잡도 순위 */}
        <div className="md:col-span-3 bg-white rounded-[1.75rem] p-7 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-emerald-500" />
              <span className="text-gray-900" style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                현재 혼잡 구역 TOP 3
              </span>
            </div>
            <span
              className="text-gray-400"
              style={{ fontWeight: 500, fontSize: '0.7rem' }}
            >
              5분마다 갱신
            </span>
          </div>

          <div className="space-y-3">
            {crowdedPlaces.map((place) => {
              const meta = congestionMeta(place.crowdLevel);
              return (
                <div
                  key={place.rank}
                  className="group flex items-center gap-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all"
                >
                  <span
                    className="text-gray-300 w-5 shrink-0 text-center"
                    style={{ fontWeight: 800, fontSize: '0.8rem' }}
                  >
                    {place.rank}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <MapPin size={11} className="text-gray-300 shrink-0" />
                      <span className="text-gray-800 truncate" style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                        {place.name}
                      </span>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full border text-xs ${meta.badge}`}
                        style={{ fontWeight: 700, fontSize: '0.65rem' }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${meta.bar} rounded-full transition-all duration-1000`}
                        style={{ width: `${place.congestion}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="py-8 text-center border-t border-gray-100">
        <span
          className="text-gray-300 uppercase tracking-widest"
          style={{ fontWeight: 700, fontSize: '0.65rem' }}
        >
          ArriView &copy; 2026
        </span>
      </footer>
    </div>
  );
}