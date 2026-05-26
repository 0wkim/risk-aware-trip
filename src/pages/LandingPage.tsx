import React, { useEffect, useState } from 'react';
import { ChevronRight, ArrowRight, Users } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const SEOUL_API_KEY = import.meta.env.VITE_SEOUL_API_KEY;

const DISTRICT_MAPPING = [
  { district: '강남구', areaNm: '강남역' },
  { district: '마포구', areaNm: '합정역' },
  { district: '종로구', areaNm: '광화문광장' },
  { district: '성동구', areaNm: '왕십리역' },
  { district: '영등포구', areaNm: '여의도' },
  { district: '송파구', areaNm: '잠실역' },
];

const recommendedPlaces = [
  {
    category: '음식점',
    name: '숲속 식탁',
    desc: '대기 50팀인 메인 거리 맛집 대신, 도보 5분 거리의 숨은 로컬 파스타 맛집',
    tag: '웨이팅 제로',
  },
  {
    category: '카페',
    name: '아틀리에 플로우',
    desc: '만석인 대형 카페를 벗어나 잔잔한 LP 음악과 필터 커피를 즐길 수 있는 곳',
    tag: '여유로운 좌석',
  },
  {
    category: '명소',
    name: '하늘마루 정원',
    desc: '인파로 가득 찬 전망대 대신 도심 야경이 한눈에 들어오는 숨겨진 루프탑 공원',
    tag: '야경 히든스팟',
  },
];

export default function LandingPage({ onStart }: LandingPageProps) {
  const [weatherData, setWeatherData] = useState({
    temp: '-',
    condition: '불러오는 중...',
    dust: '-',
    advice: '실시간 도시 데이터를 분석 중입니다.',
  });

  const [crowdedPlaces, setCrowdedPlaces] = useState<any[]>([]);

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const promises = DISTRICT_MAPPING.map(async (item) => {
          const url = `http://openapi.seoul.go.kr:8088/${SEOUL_API_KEY}/json/citydata/1/5/${encodeURIComponent(
            item.areaNm
          )}`;

          const response = await fetch(url);
          const json = await response.json();

          const cityData = json?.CITYDATA;
          const weatherBase = cityData?.WEATHER_STTS?.[0];
          const peopleBase = cityData?.LIVE_PPLTN_STTS?.[0];

          const congestionRaw = peopleBase?.AREA_CONGEST_LVL || '정보없음';

          let congestionValue = 30;

          if (
            congestionRaw.includes('붐빔') ||
            congestionRaw.includes('혼잡')
          ) {
            congestionValue = 90;
          } else if (
            congestionRaw.includes('약간') ||
            congestionRaw.includes('보통')
          ) {
            congestionValue = 60;
          } else if (congestionRaw.includes('여유')) {
            congestionValue = 25;
          }

          return {
            district: item.district,
            name: item.areaNm,
            crowdLevel: congestionRaw,
            congestion: congestionValue,
            temp: `${weatherBase?.TEMP || '-'}°C`,
            weather:
              weatherBase?.WEATHER_STTUS ||
              weatherBase?.FCST24HOURS?.[0]?.SKY_STTS ||
              '정보없음',
          };
        });

        const results = await Promise.all(promises);

        const sorted = [...results].sort(
          (a, b) => b.congestion - a.congestion
        );

        const top3 = sorted.slice(0, 3);

        setCrowdedPlaces(
          top3.map((item, index) => ({
            rank: index + 1,
            name: item.name,
            crowdLevel: item.crowdLevel,
            congestion: item.congestion,
            alternative:
              item.congestion >= 80 ? '근처 한산한 지역 추천' : '현재 이동 가능',
          }))
        );

        setWeatherData({
          temp: results[0]?.temp || '-',
          condition: results[0]?.weather || '정보없음',
          dust: '좋음',
          advice:
            top3[0]?.congestion >= 80
              ? `${top3[0]?.name} 주변 혼잡도가 높습니다. 대안 장소를 미리 확인하세요!`
              : '현재 주요 목적지 주변은 비교적 원활합니다.',
        });
      } catch (error) {
        console.error('Seoul API fetch error:', error);
      }
    };

    fetchCityData();

    const interval = setInterval(fetchCityData, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* 헤더 섹션 */}
      <header className="relative min-h-[80vh] flex flex-col justify-center items-center px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]" />

        <div className="z-10 max-w-4xl space-y-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 text-xs font-bold tracking-widest uppercase">
            Real-time Route Optimization
          </span>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]">
            인파를 피해,
            <br />
            <span className="text-emerald-500">완벽한 경로</span>로
          </h1>

          <p className="text-lg text-slate-400 font-medium max-w-xl mx-auto">
            서울시 실시간 도시 데이터를 분석하여 지금 가장 쾌적한 장소를 추천합니다.
          </p>

          <button
            onClick={onStart}
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          >
            지금 시작하기
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-24 space-y-32">
        {/* 날씨 카드 */}
        <section className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white">
              도시의 흐름을
              <br />
              <span className="text-emerald-500">읽어내는 정밀함</span>
            </h2>
            <p className="text-slate-400">
              날씨와 인파 데이터를 결합하여 당신의 이동을 최적화합니다.
            </p>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-slate-800/50 border border-slate-700 backdrop-blur-md shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <span className="text-emerald-500 font-black text-xs uppercase tracking-widest">
                Live Weather
              </span>
              <span className="text-xs bg-slate-700 px-3 py-1 rounded-full text-slate-300">
                미세먼지 {weatherData.dust}
              </span>
            </div>

            <div className="text-7xl font-black tracking-tighter text-white">
              {weatherData.temp}
            </div>

            <div className="text-xl text-slate-400 mt-2">
              {weatherData.condition}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700 text-sm text-slate-500 font-medium italic">
              💡 {weatherData.advice}
            </div>
          </div>
        </section>

        {/* 혼잡도 순위 */}
        <section>
          <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-white">
            <Users className="text-emerald-500" />
            현재 피해야 할 구역
          </h3>

          <div className="space-y-4">
            {crowdedPlaces.length === 0 ? (
              <div className="p-6 rounded-[2rem] bg-slate-800/30 border border-slate-700 text-slate-400 font-bold">
                실시간 혼잡 데이터를 불러오는 중입니다...
              </div>
            ) : (
              crowdedPlaces.map((place) => (
                <div
                  key={place.rank}
                  className="p-6 rounded-[2rem] bg-slate-800/30 border border-slate-700 hover:border-emerald-500/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-900 font-black text-emerald-500">
                      0{place.rank}
                    </div>

                    <div>
                      <h4 className="font-bold text-lg text-white">
                        {place.name}
                      </h4>
                      <p className="text-xs text-rose-400 font-bold">
                        {place.crowdLevel}
                      </p>
                    </div>
                  </div>

                  <div className="hidden md:block w-48 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-1000"
                      style={{ width: `${place.congestion}%` }}
                    />
                  </div>

                  <button
                    onClick={onStart}
                    className="text-sm font-bold flex items-center gap-2 text-slate-300 hover:text-emerald-500 transition-colors"
                  >
                    대안 보기 <ChevronRight size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 추천 카드 */}
        <section>
          <div className="mb-10 text-center">
            <h3 className="text-3xl font-black text-white">
              스트레스 없는 대체 장소
            </h3>
            <p className="text-slate-400 mt-3">
              혼잡한 장소 대신 선택할 수 있는 추천 카테고리입니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {recommendedPlaces.map((place) => (
              <div
                key={place.category}
                onClick={onStart}
                className="p-6 rounded-[2rem] bg-slate-800/30 border border-slate-700 hover:border-emerald-500/50 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-center mb-5">
                  <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-900/50 text-emerald-400">
                    {place.category}
                  </span>
                  <ArrowRight
                    size={17}
                    className="text-slate-500 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all"
                  />
                </div>

                <h4 className="text-xl font-black text-white mb-3">
                  {place.name}
                </h4>

                <p className="text-sm text-slate-400 leading-relaxed mb-5">
                  {place.desc}
                </p>

                <span className="text-xs font-bold text-emerald-400">
                  {place.tag}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-20 text-center border-t border-slate-800 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
        Alternative Recommendation System &copy; 2026
      </footer>
    </div>
  );
}