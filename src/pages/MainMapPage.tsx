import React, { useState, useEffect } from 'react';
import { MapPin, ArrowRight, Star, Plus, Minus, Coffee, Utensils, Landmark, HelpCircle, Trash2, Calendar, Clock, Car, Train, Footprints, Navigation } from 'lucide-react';
import Maps from '../Maps/Maps';
import TopBar from '../components/TopBar';

interface Props {
  onSearch: (params: any) => void;
  onGoToMyPage: () => void;
  onLogout: () => void; 
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  initialParams: any;
  seoulData: any[]; 
}

interface BackendPlace {
  lat: number;
  lng: number;
  place_id: string;
  categories: string[];
  name: string;
}

interface FavoriteItem {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  place_id: string;
  categories: string[];
  customCategory: 'cafe' | 'restaurant' | 'spot' | 'other';
}

const mapToBackendCategory = (categoryName: string): string => {
  if (categoryName.includes('카페') || categoryName.includes('디저트')) return 'cafe';
  if (categoryName.includes('음식점')) return 'restaurant';
  if (categoryName.includes('술집') || categoryName.includes('바')) return 'bar';
  if (categoryName.includes('쇼핑') || categoryName.includes('마트')) return 'shopping';
  if (categoryName.includes('관광') || categoryName.includes('문화') || categoryName.includes('명소')) return 'tourist';
  return 'other';
};

const toBackendDay = (date: Date): number => (date.getDay() + 6) % 7;

const MainMapPage = ({ onSearch, onGoToMyPage, onLogout, isDarkMode, toggleDarkMode, initialParams, seoulData }: Props) => {
  const getFavoriteIcon = (cat: string) => {
    switch (cat) {
      case 'cafe': return <Coffee size={15} />;
      case 'restaurant': return <Utensils size={15} />;
      case 'spot': return <Landmark size={15} />;
      default: return <HelpCircle size={15} />;
    }
  };

  const [startPoint, setStartPoint] = useState(initialParams.startPoint || '');
  const [destination, setDestination] = useState(initialParams.destination || '');
  const [maxHours, setMaxHours] = useState(initialParams.maxHours || '0');
  const [maxMinutes, setMaxMinutes] = useState(initialParams.maxMinutes || '0');
  
  // 이동 수단 및 시뮬레이션 환경 제어용 상태
  const [travelMode, setTravelMode] = useState<'walking' | 'car' | 'transit'>(initialParams.mode || 'transit');
  const [simulatedDay, setSimulatedDay] = useState<number>(() => initialParams.day ?? toBackendDay(new Date()));
  const [simulatedHour, setSimulatedHour] = useState<number>(() => initialParams.hour ?? new Date().getHours());

  const [activeInput, setActiveInput] = useState<'start' | 'dest'>('dest');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState<'start' | 'dest' | null>(null);

  const [selectedStartPlace, setSelectedStartPlace] = useState<BackendPlace | null>(() => initialParams.places?.[0] || null);
  const [selectedDestPlace, setSelectedDestPlace] = useState<BackendPlace | null>(() => initialParams.places?.[1] || null);

  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    const saved = localStorage.getItem('custom_favorites');
    return saved ? JSON.parse(saved) : [
      { id: 'fav-1', name: '강남역 스타벅스', address: '서울특별시 강남구 테헤란로 123', lat: 37.5012, lng: 127.0396, place_id: '12345', categories: ['cafe'], customCategory: 'cafe' },
      { id: 'fav-2', name: '맥도날드 성수점', address: '서울특별시 성동구 성수이로 88', lat: 37.5445, lng: 127.0560, place_id: '67890', categories: ['restaurant'], customCategory: 'restaurant' }
    ];
  });

  const [newFavName, setNewFavName] = useState('');
  const [isAddingFav, setIsAddingFav] = useState(false);
  const [favSelectedPlace, setFavSelectedPlace] = useState<any>(null);
  const [selectedFavCategory, setSelectedFavCategory] = useState<'cafe' | 'restaurant' | 'spot' | 'other'>('cafe');

  // 💡 [추가 기능]: 브라우저 Geolocation 및 카카오맵 Geocoder 연동 현재 위치 탐색 엔진
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      return alert("이 브라우저에서는 GPS 현재 위치 기능을 지원하지 않습니다.");
    }

    if (!window.kakao || !window.kakao.maps.services) {
      return alert("카카오 맵 서비스 스크립트 라이브러리가 로드되지 않았습니다.");
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // 카카오 주소 좌표 변환(Geocoder) 모듈 선언
        const geocoder = new window.kakao.maps.services.Geocoder();
        
        // 위경도 좌표를 한글 법정동/도로명 주소 텍스트명으로 역산 변환
        geocoder.coord2Address(lng, lat, (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK && result[0]) {
            const addressName = result[0].road_address?.address_name || result[0].address.address_name;
            const fullDisplayName = `📍 현재 위치 (${addressName})`;

            setStartPoint(fullDisplayName);
            setSelectedStartPlace({
              lat: lat,
              lng: lng,
              place_id: 'live_gps_node',
              categories: ['other'],
              name: fullDisplayName
            });
            setShowSearchDropdown(null);
          } else {
            // 주소 변환 실패 시 위경도 텍스트 대체 주입
            const fallbackName = `📍 현재 위치 (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            setStartPoint(fallbackName);
            setSelectedStartPlace({
              lat: lat,
              lng: lng,
              place_id: 'live_gps_node',
              categories: ['other'],
              name: fallbackName
            });
          }
        });
      },
      (error) => {
        console.error("GPS Error:", error);
        alert("GPS 현재 위치 정보를 가져오는데 실패했습니다. 권한 허용 상태를 확인해 주세요.");
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  };

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps.services) return;
    const ps = new window.kakao.maps.services.Places();

    if (startPoint && !selectedStartPlace) {
      ps.keywordSearch(startPoint, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK && data[0]) {
          const first = data[0];
          setSelectedStartPlace({ lat: parseFloat(first.y), lng: parseFloat(first.x), place_id: first.id, categories: [mapToBackendCategory(first.category_name)], name: first.place_name });
        }
      });
    }

    if (destination && !selectedDestPlace) {
      ps.keywordSearch(destination, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK && data[0]) {
          const first = data[0];
          setSelectedDestPlace({ lat: parseFloat(first.y), lng: parseFloat(first.x), place_id: first.id, categories: [mapToBackendCategory(first.category_name)], name: first.place_name });
        }
      });
    }
  }, [startPoint, destination]);

  useEffect(() => {
    localStorage.setItem('custom_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSearchDropdown && !((event.target as HTMLElement).closest('.search-container'))) {
        setShowSearchDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearchDropdown]);

  const handleInputChange = (keyword: string, type: 'start' | 'dest' | 'fav') => {
    if (type === 'start') { setStartPoint(keyword); if (selectedStartPlace && keyword !== selectedStartPlace.name) setSelectedStartPlace(null); } 
    else if (type === 'dest') { setDestination(keyword); if (selectedDestPlace && keyword !== selectedDestPlace.name) setSelectedDestPlace(null); } 
    else { setNewFavName(keyword); setFavSelectedPlace(null); }

    if (!keyword.trim()) { if (type !== 'fav') { setSearchResults([]); setShowSearchDropdown(null); } return; }

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) { setSearchResults(data); if (type !== 'fav') setShowSearchDropdown(type); else setShowSearchDropdown('start'); } 
      else { setSearchResults([]); setShowSearchDropdown(null); }
    });
  };

  const handleSelectPlace = (place: any, type: 'start' | 'dest' | 'fav') => {
    const formattedPlace: BackendPlace = { lat: parseFloat(place.y), lng: parseFloat(place.x), place_id: place.id, categories: [mapToBackendCategory(place.category_name)], name: place.place_name };
    if (type === 'start') { setStartPoint(place.place_name); setSelectedStartPlace(formattedPlace); } 
    else if (type === 'dest') { setDestination(place.place_name); setSelectedDestPlace(formattedPlace); } 
    else if (type === 'fav') { setNewFavName(place.place_name); setFavSelectedPlace(place); const cat = place.category_name; if (cat.includes('카페')) setSelectedFavCategory('cafe'); else if (cat.includes('음식점')) setSelectedFavCategory('restaurant'); else if (cat.includes('관광') || cat.includes('문화')) setSelectedFavCategory('spot'); else setSelectedFavCategory('other'); }
    setShowSearchDropdown(null);
    setSearchResults([]);
  };

  const handleAddFavorite = () => {
    if (!newFavName.trim() || !favSelectedPlace) return alert("추가할 장소를 검색 목록에서 정확히 선택해 주세요.");
    const newFav: FavoriteItem = { id: `fav-${Date.now()}`, name: newFavName, address: favSelectedPlace.address_name || favSelectedPlace.road_address_name || '주소 정보 없음', lat: parseFloat(favSelectedPlace.y), lng: parseFloat(favSelectedPlace.x), place_id: favSelectedPlace.id, categories: [mapToBackendCategory(favSelectedPlace.category_name)], customCategory: selectedFavCategory };
    setFavorites((prev) => [newFav, ...prev]);
    setNewFavName(''); setFavSelectedPlace(null); setIsAddingFav(false);
  };

  const handleDeleteFavorite = (id: string, e: React.MouseEvent) => { e.stopPropagation(); setFavorites((prev) => prev.filter(item => item.id !== id)); };
  const handleFavoriteClick = (fav: FavoriteItem) => { const targetPlace: BackendPlace = { lat: fav.lat, lng: fav.lng, place_id: fav.place_id, categories: fav.categories, name: fav.name }; if (activeInput === 'start') { setStartPoint(fav.name); setSelectedStartPlace(targetPlace); } else { setDestination(fav.name); setSelectedDestPlace(targetPlace); } };

  const handleSearchClick = () => {
    if (!selectedStartPlace || !selectedDestPlace) return alert("출발지와 도착지를 검색 결과 리스트에서 정확히 선택해주세요.");
    const currentHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
    const formattedDate = `${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, '0')}.${String(new Date().getDate()).padStart(2, '0')}`;
    currentHistory.push({ id: `hist-${Date.now()}`, startPoint, destination, date: formattedDate });
    localStorage.setItem('search_history', JSON.stringify(currentHistory));

    onSearch({
      startPoint, destination,
      mode: travelMode, 
      day: Number(simulatedDay), 
      hour: Number(simulatedHour), 
      maxHours: Number(maxHours), maxMinutes: Number(maxMinutes),
      places: [
        { lat: Number(selectedStartPlace.lat), lng: Number(selectedStartPlace.lng), place_id: String(selectedStartPlace.place_id), categories: selectedStartPlace.categories, name: String(selectedStartPlace.name) },
        { lat: Number(selectedDestPlace.lat), lng: Number(selectedDestPlace.lng), place_id: String(selectedDestPlace.place_id), categories: selectedDestPlace.categories, name: String(selectedDestPlace.name) }
      ]
    });
  };

  return (
    <div className="flex h-full animate-in fade-in duration-700">
      <div className={`w-[400px] h-full flex flex-col border-r z-10 shadow-2xl transition-all duration-500 ${isDarkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
        
        <header className="p-6 flex items-center justify-between border-b border-inherit shrink-0">
          <div className="flex items-center gap-2 text-emerald-500">
            <img src="/logo.svg" alt="ArriView Logo" className="w-6 h-6 object-contain drop-shadow-sm" />
            <h1 className="font-bold text-lg tracking-tight">ArriView</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-5 text-left">
          
          {/* 이동 수단 선택 세션 */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-wildest text-slate-400 mb-1.5 block">이동 수단 선택</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'walking', label: '도보', icon: <Footprints size={14} /> },
                { key: 'car', label: '차량', icon: <Car size={14} /> },
                { key: 'transit', label: '대중교통', icon: <Train size={14} /> }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setTravelMode(item.key as any)}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    travelMode === item.key
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                      : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 시뮬레이션 환경 드롭다운 세션 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wildest mb-1.5 flex items-center gap-1"><Calendar size={13} /> 기준 요일</label>
              <select value={simulatedDay} onChange={(e) => setSimulatedDay(Number(e.target.value))} className={`w-full p-3 rounded-2xl border font-bold text-xs outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                {['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'].map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wildest mb-1.5 flex items-center gap-1"><Clock size={13} /> 출발 시각</label>
              <select value={simulatedHour} onChange={(e) => setSimulatedHour(Number(e.target.value))} className={`w-full p-3 rounded-2xl border font-bold text-xs outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                {Array.from({ length: 24 }).map((_, h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00 출발</option>)}
              </select>
            </div>
          </div>

          {/* 폼 블록 */}
          <div className="space-y-4">
            <div className="relative search-container">
              {/* 💡 [수정]: 헤더 구조에 백엔드 디버그 맵과 동일한 현재위치 핫 스위치 피드백 마크업 배치 */}
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-[11px] font-black uppercase tracking-wildest ${activeInput === 'start' ? 'text-blue-500' : 'text-slate-400'}`}>Starting Point</label>
                <button 
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="text-[10px] font-black bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <Navigation size={10} className="fill-current" /> 현재 위치
                </button>
              </div>

              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <MapPin size={18} className={`${activeInput === 'start' ? 'text-blue-500' : 'text-slate-400'} shrink-0`} />
                <input type="text" value={startPoint} onChange={(e) => handleInputChange(e.target.value, 'start')} onFocus={() => { setActiveInput('start'); if(searchResults.length) setShowSearchDropdown('start'); }} placeholder="출발지를 입력하거나 현재 위치 버튼을 누르세요" className="bg-transparent outline-none w-full font-bold text-sm text-inherit" />
              </div>
              {showSearchDropdown === 'start' && !isAddingFav && (
                <div className={`absolute left-0 right-0 mt-2 max-h-48 overflow-y-auto rounded-2xl shadow-xl z-50 border p-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white text-slate-700'}`}>
                  {searchResults.map((place) => <button key={place.id} onClick={() => handleSelectPlace(place, 'start')} className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex flex-col gap-0.5 ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}><span className="font-bold text-sm">{place.place_name}</span><span className="text-slate-400 text-[10px] truncate w-full">{place.address_name}</span></button>)}
                </div>
              )}
            </div>

            <div className="relative search-container">
              <label className={`text-[11px] font-black uppercase tracking-wildest mb-1.5 block ${activeInput === 'dest' ? 'text-rose-500' : 'text-slate-400'}`}>Destination</label>
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <MapPin size={18} className={`${activeInput === 'dest' ? 'text-rose-500' : 'text-slate-400'} shrink-0`} />
                <input type="text" value={destination} onChange={(e) => handleInputChange(e.target.value, 'dest')} onFocus={() => { setActiveInput('dest'); if(searchResults.length) setShowSearchDropdown('dest'); }} placeholder="도착지를 입력하세요" className="bg-transparent outline-none w-full font-bold text-sm text-inherit" />
              </div>
              {showSearchDropdown === 'dest' && (
                <div className={`absolute left-0 right-0 mt-2 max-h-48 overflow-y-auto rounded-2xl shadow-xl z-50 border p-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white text-slate-700'}`}>
                  {searchResults.map((place) => <button key={place.id} onClick={() => handleSelectPlace(place, 'dest')} className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex flex-col gap-0.5 ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}><span className="font-bold text-sm">{place.place_name}</span><span className="text-slate-400 text-[10px] truncate w-full">{place.address_name}</span></button>)}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wildest mb-2 block">설정 시간</label>
            <div className="flex gap-3">
              <div className={`flex-1 flex items-center p-3.5 rounded-2xl border transition-all focus-within:border-emerald-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <input 
                  type="number" 
                  value={maxHours} 
                  onChange={(e) => setMaxHours(e.target.value)} 
                  min="0" 
                  className="bg-transparent outline-none w-full text-lg font-black text-emerald-500 text-center" 
                />
                <span className="ml-1 text-[10px] font-bold opacity-50 uppercase text-slate-400">Hr</span>
              </div>
              <div className={`flex-1 flex items-center p-3.5 rounded-2xl border transition-all focus-within:border-emerald-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <input 
                  type="number" 
                  value={maxMinutes} 
                  onChange={(e) => setMaxMinutes(e.target.value)} 
                  min="0" 
                  max="59" 
                  className="bg-transparent outline-none w-full text-lg font-black text-emerald-500 text-center" 
                />
                <span className="ml-1 text-[10px] font-bold opacity-50 uppercase text-slate-400">Min</span>
              </div>
            </div>
          </div>

          <div className="mt-1 flex-1 flex flex-col min-h-[180px]">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Star size={15} className="text-yellow-500 fill-yellow-500" />
                <h3 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>즐겨찾는 장소</h3>
              </div>
              <button onClick={() => setIsAddingFav(!isAddingFav)} className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg border transition-all ${isAddingFav ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>{isAddingFav ? <Minus size={12} /> : <Plus size={12} />} {isAddingFav ? '닫기' : '추가'}</button>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[160px] pr-1 custom-scrollbar">
              {favorites.map(fav => (
                <div key={fav.id} onClick={() => handleFavoriteClick(fav)} className={`group w-full flex items-center justify-between p-3.5 rounded-2xl border text-left cursor-pointer ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">{getFavoriteIcon(fav.customCategory)}</div>
                    <div className="min-w-0 flex-1"><p className="font-black text-sm tracking-tight">{fav.name}</p><p className="text-[10px] text-slate-400 truncate mt-0.5 w-full">{fav.address}</p></div>
                  </div>
                  <button onClick={(e) => handleDeleteFavorite(fav.id, e)} className="p-2 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-rose-500"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={handleSearchClick} 
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-14 rounded-2xl font-black shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs shrink-0 mt-4"
          >
            <span>Check Alternatives</span>
            <ArrowRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-200 overflow-hidden flex flex-col h-full">
        <div className="w-full z-20 shrink-0">
          <TopBar seoulData={seoulData} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} onGoToMyPage={onGoToMyPage} onLogout={onLogout} />
        </div>
        <div className="flex-1 w-full relative z-10">
          <Maps 
            startPlace={selectedStartPlace ? { lat: selectedStartPlace.lat, lng: selectedStartPlace.lng, name: startPoint } : null} 
            destPlace={selectedDestPlace ? { lat: selectedDestPlace.lat, lng: selectedDestPlace.lng, name: destination } : null} 
            alternatives={[]}
            routeSegments={[]} 
          />
        </div>
      </div>
    </div>
  );
};

export default MainMapPage;