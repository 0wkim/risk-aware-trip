import React, { useEffect, useState, useRef } from "react";
import { Map, Polyline, CustomOverlayMap } from "react-kakao-maps-sdk";

interface MapsProps {
  startPlace?: { lat: number; lng: number; name: string } | null;
  destPlace?: { lat: number; lng: number; name: string } | null;
  alternatives?: Array<{ lat: number; lng: number; name: string; place_type?: string }>;
  routeSegments?: Array<{ polyline: Array<[number, number]> }>; 
}

const Maps = ({ startPlace, destPlace, alternatives = [], routeSegments = [] }: MapsProps) => {
  const defaultLat = 37.55465000468857;
  const defaultLng = 126.97059787494679;

  const mapRef = useRef<kakao.maps.Map>(null);
  const [mapCenter, setMapCenter] = useState({ lat: defaultLat, lng: defaultLng });
  
  const [fullPath, setFullPath] = useState<Array<{ lat: number; lng: number }>>([]);
  const [animatedPath, setAnimatedPath] = useState<Array<{ lat: number; lng: number }>>([]);
  const [arrowPosition, setArrowPosition] = useState<{ lat: number; lng: number } | null>(null);
  
  const [isAnimating, setIsAnimating] = useState(false);

  // 실제 구불구불한 도로 폴리라인 배열 평탄화 처리
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

  // 로컬스토리지 기반 최초 1회 애니메이션 잠금 엔진
  useEffect(() => {
    if (fullPath.length === 0 || !startPlace || !destPlace) return;

    // 현재 출발지-목적지를 기준으로 한 고유 경로 키 생성
    const currentRouteKey = `anim_done_${startPointToKey(startPlace.name)}_${startPointToKey(destPlace.name)}`;
    
    // 컴포넌트가 소멸 후 부활해도 로컬스토리지 기억을 조회하여 이미 끝난 주행이면 패스
    const isAlreadyAnimated = localStorage.getItem(currentRouteKey) === "true";

    if (isAlreadyAnimated) {
      setAnimatedPath(fullPath);
      setArrowPosition({ lat: destPlace.lat, lng: destPlace.lng }); // 목적지 자리에 고정 대기
      setIsAnimating(false);
      if (mapRef.current) {
        mapRef.current.setCenter(new kakao.maps.LatLng(destPlace.lat, destPlace.lng));
      }
      return;
    }

    // 완전히 처음 보여주는 대안 경로일 때만 인터벌 주행 스타트
    setAnimatedPath([fullPath[0]]);
    setArrowPosition(fullPath[0]);
    setIsAnimating(true);

    let currentIndex = 0;
    const totalPoints = fullPath.length;
    
    const intervalTime = Math.max(8, Math.min(25, Math.floor(1200 / totalPoints))); 
    const cameraUpdateStep = Math.max(3, Math.floor(totalPoints / 30));

    const timer = setInterval(() => {
      if (currentIndex >= totalPoints - 1) {
        clearInterval(timer);
        setAnimatedPath(fullPath);
        setIsAnimating(false);
        setArrowPosition({ lat: destPlace.lat, lng: destPlace.lng }); // 골인 지점에 안착
        
        // 주행이 완료되는 순간 로컬스토리지에 영구 각인 처리
        localStorage.setItem(currentRouteKey, "true");
        
        if (destPlace && mapRef.current) {
          mapRef.current.setCenter(new kakao.maps.LatLng(destPlace.lat, destPlace.lng));
        }
        return;
      }

      currentIndex++;
      const nextPoint = fullPath[currentIndex];
      
      if (nextPoint) {
        setAnimatedPath((prev) => prev.concat(nextPoint));
        setArrowPosition(nextPoint);

        if (mapRef.current && (currentIndex % cameraUpdateStep === 0 || currentIndex === totalPoints - 2)) {
          mapRef.current.panTo(new kakao.maps.LatLng(nextPoint.lat, nextPoint.lng));
        }
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [fullPath, startPlace, destPlace]);

  // 키 값에 공백이나 특수문자가 섞여 영구 디스크 저장 시 깨지는 현상을 방어하는 헬퍼 함수
  const startPointToKey = (str: string) => str.replace(/[^a-zA-Z0-9가-힣]/g, "");

  return (
    <div className="w-full h-full relative">
      <Map
        center={mapCenter}
        style={{ width: "100%", height: "100%" }}
        level={4}
        ref={mapRef}
      >
        {/* 출발지 커스텀 핀 */}
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

        {/* 도착지 커스텀 핀 */}
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

        {/* 대안 장소 스퀘어 핀 */}
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

        {/* 실제 도로 드로잉 라인 */}
        {animatedPath.length > 0 && (
          <Polyline
            path={[animatedPath]}
            strokeWeight={6}
            strokeColor="#10b981"
            strokeOpacity={0.95}
            strokeStyle="solid"
          />
        )}

        {/* 목적지에 정지해 있는 화살표 도트 헤드 */}
        {arrowPosition && (
          <CustomOverlayMap position={arrowPosition} zIndex={50}>
            <div className="relative flex items-center justify-center">
              {isAnimating && <div className="absolute w-8 h-8 bg-emerald-400 rounded-full animate-ping opacity-40" />}
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