import React, { useEffect, useState, useRef } from "react";
import { Map, Polyline, CustomOverlayMap } from "react-kakao-maps-sdk";

interface MapsProps {
  startPlace?: { lat: number; lng: number; name: string } | null;
  destPlace?: { lat: number; lng: number; name: string } | null;
  alternatives?: Array<{ lat: number; lng: number; name: string; place_type?: string }>;
  routeSegments?: Array<{ polyline: Array<[number, number]> }>; // 백엔드가 주는 실제 구불구불한 도로 좌표
}

const Maps = ({ startPlace, destPlace, alternatives = [], routeSegments = [] }: MapsProps) => {
  const defaultLat = 37.55465000468857;
  const defaultLng = 126.97059787494679;

  const mapRef = useRef<kakao.maps.Map>(null);
  const [mapCenter, setMapCenter] = useState({ lat: defaultLat, lng: defaultLng });
  
  const [fullPath, setFullPath] = useState<Array<{ lat: number; lng: number }>>([]);
  const [animatedPath, setAnimatedPath] = useState<Array<{ lat: number; lng: number }>>([]);
  const [arrowPosition, setArrowPosition] = useState<{ lat: number; lng: number } | null>(null);
  
  // 무한 반복을 막고 딱 '한 번만' 가동하기 위한 추적 플래그 변수
  const [isAnimating, setIsAnimating] = useState(false);
  const hasAnimated = useRef<string | null>(null); // 현재 경로 ID를 기억해서 중복 실행 방지

  // 1. 실제 구불구불한 도로 폴리라인 배열 평탄화 처리
  useEffect(() => {
    if (!routeSegments || routeSegments.length === 0) {
      setFullPath([]);
      setAnimatedPath([]);
      setArrowPosition(null);
      return;
    }
    const paths = routeSegments.flatMap((segment) =>
      segment.polyline.map((coord) => ({
        lat: coord[0],
        lng: coord[1],
      }))
    );
    setFullPath(paths);
  }, [routeSegments]);

  // 2. 🔥 [완주 보정 완료] 경로 드로잉 및 화살표 헤드 주행 엔진
  useEffect(() => {
    if (fullPath.length === 0 || !startPlace || !destPlace) return;

    // 고유 경로 식별 키 생성 (출발지명+도착지명)
    const currentRouteKey = `${startPlace.name}-${destPlace.name}`;
    
    // 💡 [중복 방지 장치] 이미 이 경로에 대해 애니메이션을 보여줬다면 다시 실행하지 않고 최종 선만 유지
    if (hasAnimated.current === currentRouteKey) {
      setAnimatedPath(fullPath);
      setArrowPosition(null);
      setIsAnimating(false);
      if (mapRef.current) {
        mapRef.current.setCenter(new kakao.maps.LatLng(destPlace.lat, destPlace.lng));
      }
      return;
    }

    // 처음 보여주는 경로라면 애니메이션 가동 시작!
    setAnimatedPath([fullPath[0]]);
    setArrowPosition(fullPath[0]);
    setIsAnimating(true);

    let currentIndex = 0;
    const totalPoints = fullPath.length;
    
    // 💡 [버그 수정]: 대량의 데이터가 몰릴 때 타임아웃 누수로 끊기지 않도록 인터벌 주기를 최적화 압축합니다.
    const intervalTime = Math.max(10, Math.min(30, Math.floor(1800 / totalPoints))); 

    const timer = setInterval(() => {
      // 💡 [완주 보정]: 조건문을 검사할 때 현재 인덱스가 끝에 정확히 다다랐는지 안전장치를 강화합니다.
      if (currentIndex >= totalPoints - 1) {
        clearInterval(timer);
        
        // 최종 패스를 빈틈 없이 100% 꽉 채워줍니다.
        setAnimatedPath(fullPath);
        setIsAnimating(false);
        setArrowPosition(null); 
        hasAnimated.current = currentRouteKey; 
        
        if (destPlace && mapRef.current) {
          // 마지막 목적지 순간에는 panTo 대신 확실하게 즉시 이동시켜 중심을 잡습니다.
          mapRef.current.setCenter(new kakao.maps.LatLng(destPlace.lat, destPlace.lng));
        }
        return;
      }

      currentIndex++;
      const nextPoint = fullPath[currentIndex];
      
      if (nextPoint) {
        setAnimatedPath((prev) => [...prev, nextPoint]);
        setArrowPosition(nextPoint);

        // 실제 도로 곡선 굴곡에 맞춰 카메라가 부드럽게 트래킹 (panTo)
        if (mapRef.current && currentIndex % 2 === 0) { // 💡 프레임 드랍(Forced Reflow) 방지를 위해 2턴에 한 번씩만 카메라 무브
          mapRef.current.panTo(new kakao.maps.LatLng(nextPoint.lat, nextPoint.lng));
        }
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [fullPath, startPlace, destPlace]);

  return (
    <div className="w-full h-full relative">
      <Map
        center={mapCenter}
        style={{ width: "100%", height: "100%" }}
        level={4}
        ref={mapRef}
      >
        {/* 출발지 커스텀 핀 (Deep Blue) */}
        {startPlace && (
          <CustomOverlayMap position={{ lat: startPlace.lat, lng: startPlace.lng }} yAnchor={1}>
            <div className="flex flex-col items-center select-none animate-bounce-short">
              <div className="backdrop-blur-md bg-blue-600/95 text-white text-xs font-bold px-3 py-2 rounded-full shadow-[0_4px_20px_rgba(37,99,235,0.4)] flex items-center gap-1.5 border border-blue-400/30 whitespace-nowrap">
                <span className="bg-white text-blue-600 text-[10px] px-1 py-0.5 rounded-md font-black shadow-sm">출발</span>
                <span className="max-w-[120px] truncate">{startPlace.name}</span>
              </div>
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-600/95 -mt-[1px]" />
            </div>
          </CustomOverlayMap>
        )}

        {/* 도착지 커스텀 핀 (Neo Rose) */}
        {destPlace && (
          <CustomOverlayMap position={{ lat: destPlace.lat, lng: destPlace.lng }} yAnchor={1}>
            <div className="flex flex-col items-center select-none animate-bounce-short">
              <div className="backdrop-blur-md bg-rose-600/95 text-white text-xs font-bold px-3 py-2 rounded-full shadow-[0_4px_20px_rgba(225,29,72,0.4)] flex items-center gap-1.5 border border-rose-400/30 whitespace-nowrap">
                <span className="bg-white text-rose-600 text-[10px] px-1 py-0.5 rounded-md font-black shadow-sm">목표</span>
                <span className="max-w-[120px] truncate">{destPlace.name}</span>
              </div>
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-rose-600/95 -mt-[1px]" />
            </div>
          </CustomOverlayMap>
        )}

        {/* 대안 장소 스퀘어 핀 레이어 */}
        {alternatives.map((alt, idx) => (
          <CustomOverlayMap key={`alt-layer-${idx}`} position={{ lat: alt.lat, lng: alt.lng }} yAnchor={1}>
            <div className="flex flex-col items-center select-none transition-all duration-300 hover:scale-105">
              <div className="backdrop-blur-md bg-emerald-500/95 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(16,185,129,0.3)] flex items-center gap-1 border border-emerald-400/20 whitespace-nowrap">
                <span className="bg-emerald-700/60 text-[9px] px-1 py-0.5 rounded font-black uppercase tracking-tight">{alt.place_type || 'ALT'}</span>
                <span className="max-w-[100px] truncate">{alt.name}</span>
              </div>
              <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-emerald-500/95 -mt-[1px]" />
            </div>
          </CustomOverlayMap>
        ))}

        {/* 실제 도로를 따라 한 칸씩 늘어나는 드로잉 라인 */}
        {animatedPath.length > 0 && (
          <Polyline
            path={[animatedPath]}
            strokeWeight={6}
            strokeColor="#10b981"
            strokeOpacity={0.95}
            strokeStyle="solid"
          />
        )}

        {/* 선의 맨 앞머리에서만 레이싱하듯 달리다가 목적지 도착 시 소멸되는 도트 헤드 */}
        {isAnimating && arrowPosition && (
          <CustomOverlayMap position={arrowPosition} zIndex={50}>
            <div className="relative flex items-center justify-center">
              <div className="absolute w-8 h-8 bg-emerald-400 rounded-full animate-ping opacity-40" />
              <div className="w-5 h-5 bg-emerald-500 rounded-full border-2 border-white shadow-[0_0_15px_#10b981] flex items-center justify-center">
                <div className="w-1.5 h-1.5 border-t-2 border-r-2 border-white transform rotate-45 -ml-[1px]" />
              </div>
            </div>
          </CustomOverlayMap>
        )}
      </Map>
    </div>
  );
};

export default Maps;