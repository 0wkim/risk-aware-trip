import React, { useEffect, useState, useRef, useMemo } from "react";
import { Map, Polyline, CustomOverlayMap } from "react-kakao-maps-sdk";

interface MapsProps {
  startPlace?: { lat: number; lng: number; name: string } | null;
  destPlace?: { lat: number; lng: number; name: string } | null;
  alternatives?: Array<{ lat: number; lng: number; name: string; place_type?: string }>;
  routeSegments?: Array<{ polyline: Array<[number, number]> }>; 
}

const startPointToKey = (str: string) => str.replace(/[^a-zA-Z0-9가-힣]/g, "");

const Maps = ({ startPlace, destPlace, alternatives = [], routeSegments = [] }: MapsProps) => {
  const defaultLat = 37.55465000468857;
  const defaultLng = 126.97059787494679;

  const mapRef = useRef<kakao.maps.Map>(null);
  
  const [mapCenter, setMapCenter] = useState({ 
    lat: startPlace?.lat || defaultLat, 
    lng: startPlace?.lng || defaultLng 
  });
  
  const [animatedPath, setAnimatedPath] = useState<Array<{ lat: number; lng: number }>>([]);
  const [arrowPosition, setArrowPosition] = useState<{ lat: number; lng: number } | null>(null);
  
  const [isAnimating, setIsAnimating] = useState(false);

  const fullPath = useMemo(() => {
    if (!routeSegments || routeSegments.length === 0) {
      return [];
    }
    return routeSegments.flatMap((segment) =>
      segment.polyline.map((coord) => ({
        lat: coord[0],
        lng: coord[1],
      }))
    );
  }, [routeSegments]);

  useEffect(() => {
    if (fullPath.length === 0 || !startPlace || !destPlace) {
      // 💡 [에러 1 해결] 동기적 setState로 인한 렌더링 충돌(eslint 경고)을 막기 위해 0초 딜레이의 비동기 처리
      const resetTimer = setTimeout(() => {
        setAnimatedPath([]);
        setArrowPosition(null);
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    let animationInterval: ReturnType<typeof setInterval> | undefined;

    const currentRouteKey = `anim_done_${startPointToKey(startPlace.name)}_${startPointToKey(destPlace.name)}`;
    const isAlreadyAnimated = localStorage.getItem(currentRouteKey) === "true";

    // 💡 [에러 2 해결] let 대신 const를 사용하고 선언과 동시에 할당!
    const initTimer = setTimeout(() => {
      // 카카오맵 렌더링/크기 갱신
      if (mapRef.current) {
        mapRef.current.relayout(); 
      }

      if (isAlreadyAnimated) {
        setAnimatedPath(fullPath);
        setArrowPosition({ lat: destPlace.lat, lng: destPlace.lng });
        setIsAnimating(false);
        setMapCenter({ lat: destPlace.lat, lng: destPlace.lng }); 
        if (mapRef.current) {
          mapRef.current.setCenter(new kakao.maps.LatLng(destPlace.lat, destPlace.lng));
        }
        return;
      }

      setAnimatedPath([fullPath[0]]);
      setArrowPosition(fullPath[0]);
      setIsAnimating(true);
      
      setMapCenter({ lat: fullPath[0].lat, lng: fullPath[0].lng });
      if (mapRef.current) {
        mapRef.current.setCenter(new kakao.maps.LatLng(fullPath[0].lat, fullPath[0].lng));
      }

      let currentIndex = 0;
      const totalPoints = fullPath.length;
      
      const intervalTime = Math.max(8, Math.min(25, Math.floor(1200 / totalPoints))); 
      const cameraUpdateStep = Math.max(3, Math.floor(totalPoints / 30));

      animationInterval = setInterval(() => {
        if (currentIndex >= totalPoints - 1) {
          clearInterval(animationInterval);
          setAnimatedPath(fullPath);
          setIsAnimating(false);
          setArrowPosition({ lat: destPlace.lat, lng: destPlace.lng });
          
          localStorage.setItem(currentRouteKey, "true");
          
          setMapCenter({ lat: destPlace.lat, lng: destPlace.lng });
          if (mapRef.current) {
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

    }, 600); // UI 애니메이션 딜레이

    return () => {
      clearTimeout(initTimer);
      if (animationInterval) clearInterval(animationInterval);
    };
  }, [fullPath, startPlace, destPlace]);

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