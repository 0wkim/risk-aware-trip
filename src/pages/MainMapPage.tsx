import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ArrowRight, User, Moon, Sun, Route, Star, Home, Briefcase, LogOut, CloudSun, Trash2, Plus, Minus, Coffee, Utensils, Landmark, HelpCircle } from 'lucide-react';
import Maps from '../Maps/Maps';

interface Props {
  onSearch: (params: any) => void;
  onGoToMyPage: () => void;
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

const MainMapPage = ({ onSearch, onGoToMyPage, isDarkMode, toggleDarkMode, initialParams, seoulData }: Props) => {
  // ── 💡 [안전 장치]: 자바스크립트 호이스팅 에러 차단을 위해 아이콘 매핑 함수를 컴포넌트 최상단으로 격리 배치 ──
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
  
  const [activeInput, setActiveInput] = useState<'start' | 'dest'>('dest');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [tickerIndex, setTickerIndex] = useState(0);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState<'start' | 'dest' | null>(null);

  // ── 💡 [뒤로가기 방어 코드]: 결과창에서 뒤로 돌아올 때 기존의 위경도 데이터 패키지 세션을 복원 ──
  const [selectedStartPlace, setSelectedStartPlace] = useState<BackendPlace | null>(() => {
    return initialParams.places?.[0] || null;
  });
  const [selectedDestPlace, setSelectedDestPlace] = useState<BackendPlace | null>(() => {
    return initialParams.places?.[1] || null;
  });

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

  useEffect(() => {
    localStorage.setItem('custom_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const targetDistricts = ['강남구', '마포구', '종로구', '성동구', '영등포구', '송파구'];
  const displayData = seoulData ? seoulData.filter(item => targetDistricts.includes(item.district)) : [];

  const mapToBackendCategory = (categoryName: string): string => {
    if (categoryName.includes('카페') || categoryName.includes('디저트')) return 'cafe';
    if (categoryName.includes('음식점')) return 'restaurant';
    if (categoryName.includes('술집') || categoryName.includes('바')) return 'bar';
    if (categoryName.includes('쇼핑') || categoryName.includes('마트')) return 'shopping';
    if (categoryName.includes('관광') || categoryName.includes('문화') || categoryName.includes('명소')) return 'tourist';
    return 'other';
  };

  // ── 💡 [백엔드 규격 맞춤]: 0=월요일 ~ 6=일요일을 정확히 준수하는 정수형 요일 처리 ──
  const toBackendDay = (date: Date): number => (date.getDay() + 6) % 7;

  const handleInputChange = (keyword: string, type: 'start' | 'dest' | 'fav') => {
    if (type === 'start') {
      setStartPoint(keyword);
      if (selectedStartPlace && keyword !== selectedStartPlace.name) {
        setSelectedStartPlace(null); 
      }
    } else if (type === 'dest') {
      setDestination(keyword);
      if (selectedDestPlace && keyword !== selectedDestPlace.name) {
        setSelectedDestPlace(null);
      }
    } else {
      setNewFavName(keyword);
      setFavSelectedPlace(null);
    }

    if (!keyword.trim()) {
      if (type !== 'fav') {
        setSearchResults([]);
        setShowSearchDropdown(null);
      }
      return;
    }

    if (!window.kakao || !window.kakao.maps.services) return;
    const ps = new window.kakao.maps.services.Places();

    ps.keywordSearch(keyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data);
        if (type !== 'fav') setShowSearchDropdown(type);
        else setShowSearchDropdown('start'); 
      } else {
        setSearchResults([]);
        setShowSearchDropdown(null);
      }
    });
  };

  const handleSelectPlace = (place: any, type: 'start' | 'dest' | 'fav') => {
    const formattedPlace: BackendPlace = {
      lat: parseFloat(place.y),
      lng: parseFloat(place.x),
      place_id: place.id,
      categories: [mapToBackendCategory(place.category_name)],
      name: place.place_name 
    };

    if (type === 'start') {
      setStartPoint(place.place_name); 
      setSelectedStartPlace(formattedPlace); 
    } else if (type === 'dest') {
      setDestination(place.place_name); 
      setSelectedDestPlace(formattedPlace); 
    } else if (type === 'fav') {
      setNewFavName(place.place_name);
      setFavSelectedPlace(place);
      
      const cat = place.category_name;
      if (cat.includes('카페')) setSelectedFavCategory('cafe');
      else if (cat.includes('음식점')) setSelectedFavCategory('restaurant');
      else if (cat.includes('관광') || cat.includes('문화')) setSelectedFavCategory('spot');
      else setSelectedFavCategory('other');
    }
    setShowSearchDropdown(null);
    setSearchResults([]);
  };

  const handleAddFavorite = () => {
    if (!newFavName.trim() || !favSelectedPlace) {
      alert("추가할 장소를 검색 목록에서 정확히 선택해 주세요.");
      return;
    }

    const newFav: FavoriteItem = {
      id: `fav-${Date.now()}`,
      name: newFavName,
      address: favSelectedPlace.address_name || favSelectedPlace.road_address_name || '주소 정보 없음',
      lat: parseFloat(favSelectedPlace.y),
      lng: parseFloat(favSelectedPlace.x),
      place_id: favSelectedPlace.id,
      categories: [mapToBackendCategory(favSelectedPlace.category_name)],
      customCategory: selectedFavCategory
    };

    setFavorites((prev) => [newFav, ...prev]);
    setNewFavName('');
    setFavSelectedPlace(null);
    setIsAddingFav(false);
  };

  const handleDeleteFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setFavorites((prev) => prev.filter(item => item.id !== id));
  };

  const handleFavoriteClick = (fav: FavoriteItem) => {
    const targetPlace: BackendPlace = {
      lat: fav.lat,
      lng: fav.lng,
      place_id: fav.place_id,
      categories: fav.categories,
      name: fav.name
    };

    if (activeInput === 'start') {
      setStartPoint(fav.name);
      setSelectedStartPlace(targetPlace);
    } else {
      setDestination(fav.name);
      setSelectedDestPlace(targetPlace);
    }
  };

  // ── 🎯 디자인 원본을 완벽히 지키며, 백엔드 데이터 전송 규격을 엄격하게 맞춘 공간 ──
  const handleSearchClick = () => {
    const now = new Date();
    if (!selectedStartPlace || !selectedDestPlace) {
      alert("출발지와 도착지를 검색 결과 리스트에서 정확히 선택해주세요.");
      return;
    }

    // [마이페이지 실시간 연동 로직]
    const currentHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
    const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    currentHistory.push({
      id: `hist-${Date.now()}`,
      startPoint: startPoint,
      destination: destination,
      date: formattedDate
    });
    localStorage.setItem('search_history', JSON.stringify(currentHistory));

    // 💡 [치명적 에러 해결선]: 백엔드가 100% 신뢰할 수 있는 데이터 구조로 캐스팅하여 주입
    onSearch({
      startPoint: startPoint, 
      destination: destination,
      // 백엔드 Pydantic 검증 오류를 우회하기 위해 단일 category 문자열 처리도 병행할 수 있도록 깔끔한 배열 구조화 전달
      places: [
        {
          lat: Number(selectedStartPlace.lat),
          lng: Number(selectedStartPlace.lng),
          place_id: String(selectedStartPlace.place_id),
          categories: selectedStartPlace.categories,
          name: String(selectedStartPlace.name)
        },
        {
          lat: Number(selectedDestPlace.lat),
          lng: Number(selectedDestPlace.lng),
          place_id: String(selectedDestPlace.place_id),
          categories: selectedDestPlace.categories,
          name: String(selectedDestPlace.name)
        }
      ], 
      day: Number(toBackendDay(now)), // 💥 422 오류 원인 제거: 확실하게 정수형 넘버(0~6)로 주입!
      hour: Number(now.getHours()),   // 확실하게 정수형 넘버로 주입!
      maxHours: Number(maxHours), 
      maxMinutes: Number(maxMinutes)
    });
  };

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
      if (showSearchDropdown && !((event.target as HTMLElement).closest('.search-container'))) {
        setShowSearchDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearchDropdown]);

  return (
    <div className="flex h-full animate-in fade-in duration-700">
      
      {/* 1. 왼쪽 사이드바 */}
      <div className={`w-[400px] h-full flex flex-col border-r z-10 shadow-2xl transition-all duration-500 ${
        isDarkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'
      }`}>
        <header className="p-6 flex items-center justify-between border-b border-inherit shrink-0">
          <div className="flex items-center gap-2 text-emerald-500">
            <Route size={24} />
            <h1 className="font-bold text-lg tracking-tight">스마트 경로 대안</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6 text-left">
          <div className="space-y-5">
            {/* 출발지 인풋 */}
            <div className="relative search-container">
              <label className={`text-[11px] font-black uppercase tracking-wildest mb-1.5 block ${activeInput === 'start' ? 'text-blue-500' : 'text-slate-400'}`}>Starting Point</label>
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <MapPin size={18} className={`${activeInput === 'start' ? 'text-blue-500' : 'text-slate-400'} shrink-0 transition-colors`} />
                <input 
                  type="text" 
                  value={startPoint} 
                  onChange={(e) => handleInputChange(e.target.value, 'start')} 
                  onFocus={() => { setActiveInput('start'); if(searchResults.length) setShowSearchDropdown('start'); }}
                  placeholder="출발지를 입력하세요" 
                  className="bg-transparent outline-none w-full font-bold text-sm text-inherit" 
                />
              </div>
              {showSearchDropdown === 'start' && !isAddingFav && (
                <div className={`absolute left-0 right-0 mt-2 max-h-48 overflow-y-auto rounded-2xl shadow-xl z-50 border p-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-100 text-slate-700'}`}>
                  {searchResults.map((place) => (
                    <button key={place.id} onClick={() => handleSelectPlace(place, 'start')} className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-colors flex flex-col gap-0.5 ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                      <span className="font-bold text-sm text-inherit">{place.place_name}</span>
                      <span className="text-slate-400 text-[10px] truncate w-full">{place.address_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 도착지 인풋 */}
            <div className="relative search-container">
              <label className={`text-[11px] font-black uppercase tracking-wildest mb-1.5 block ${activeInput === 'dest' ? 'text-rose-500' : 'text-slate-400'}`}>Destination</label>
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <MapPin size={18} className={`${activeInput === 'dest' ? 'text-rose-500' : 'text-slate-400'} shrink-0 transition-colors`} />
                <input 
                  type="text" 
                  value={destination} 
                  onChange={(e) => handleInputChange(e.target.value, 'dest')} 
                  onFocus={() => { setActiveInput('dest'); if(searchResults.length) setShowSearchDropdown('dest'); }}
                  placeholder="도착지를 입력하세요" 
                  className="bg-transparent outline-none w-full font-bold text-sm text-inherit" 
                />
              </div>
              {showSearchDropdown === 'dest' && (
                <div className={`absolute left-0 right-0 mt-2 max-h-48 overflow-y-auto rounded-2xl shadow-xl z-50 border p-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-100 text-slate-700'}`}>
                  {searchResults.map((place) => (
                    <button key={place.id} onClick={() => handleSelectPlace(place, 'dest')} className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-colors flex flex-col gap-0.5 ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                      <span className="font-bold text-sm text-inherit">{place.place_name}</span>
                      <span className="text-slate-400 text-[10px] truncate w-full">{place.address_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 설정 시간 */}
          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wildest mb-2 block">설정 시간</label>
            <div className="flex gap-3">
              <div className={`flex-1 flex items-center p-3.5 rounded-2xl border transition-all focus-within:border-emerald-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <input type="number" value={maxHours} onChange={(e) => setMaxHours(e.target.value)} min="0" className="bg-transparent outline-none w-full text-lg font-black text-emerald-500 text-center" />
                <span className="ml-1 text-[10px] font-bold opacity-50 uppercase">Hr</span>
              </div>
              <div className={`flex-1 flex items-center p-3.5 rounded-2xl border transition-all focus-within:border-emerald-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <input type="number" value={maxMinutes} onChange={(e) => setMaxMinutes(e.target.value)} min="0" max="59" className="bg-transparent outline-none w-full text-lg font-black text-emerald-500 text-center" />
                <span className="ml-1 text-[10px] font-bold opacity-50 uppercase">Min</span>
              </div>
            </div>
          </div>

          {/* 즐겨찾기 CRUD 섹션 */}
          <div className="mt-1 flex-1 flex flex-col min-h-[220px]">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Star size={15} className="text-yellow-500 fill-yellow-500" />
                <h3 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>즐겨찾는 장소</h3>
              </div>
              <button 
                onClick={() => setIsAddingFav(!isAddingFav)}
                className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg border transition-all ${
                  isAddingFav 
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500 hover:text-white' 
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                }`}
              >
                {isAddingFav ? <Minus size={12} /> : <Plus size={12} />} {isAddingFav ? '닫기' : '추가'}
              </button>
            </div>

            {/* 즐겨찾기 생성 폼 구조 */}
            {isAddingFav && (
              <div className={`p-4 rounded-3xl border mb-3 space-y-3.5 animate-in slide-in-from-top-2 duration-200 relative ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/60'}`}>
                
                <div className="space-y-1.5 relative search-container">
                  <div className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">새 장소 키워드 검색</div>
                  <input 
                    type="text"
                    value={newFavName}
                    onChange={(e) => handleInputChange(e.target.value, 'fav')}
                    placeholder="예: 성수 스타벅스, 우리집"
                    className={`w-full p-2.5 rounded-xl text-xs font-bold outline-none border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                  />

                  {/* 인풋 전용 자동완성 드롭다운 */}
                  {newFavName && !favSelectedPlace && searchResults.length > 0 && (
                    <div className={`absolute left-0 right-0 top-[62px] max-h-40 overflow-y-auto rounded-xl shadow-2xl z-[60] border p-1 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-100 text-slate-700'}`}>
                      {searchResults.map((place) => (
                        <button key={place.id} onClick={() => handleSelectPlace(place, 'fav')} className={`w-full text-left p-2 rounded-lg text-[11px] font-semibold transition-colors flex flex-col ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                          <span className="font-bold text-inherit">{place.place_name}</span>
                          <span className="text-[9px] opacity-50 truncate w-full">{place.address_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 카테고리 분류 배너 */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">장소 카테고리 분류</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { key: 'cafe', label: '카페', color: 'hover:text-amber-500 active:bg-amber-500/10', activeClass: 'bg-amber-500 text-white border-amber-500' },
                      { key: 'restaurant', label: '맛집', color: 'hover:text-blue-500 active:bg-blue-500/10', activeClass: 'bg-blue-500 text-white border-blue-500' },
                      { key: 'spot', label: '명소', color: 'hover:text-purple-500 active:bg-purple-500/10', activeClass: 'bg-purple-500 text-white border-purple-500' },
                      { key: 'other', label: '기타', color: 'hover:text-slate-500 active:bg-slate-500/10', activeClass: 'bg-slate-500 text-white border-slate-500' }
                    ].map((chip) => (
                      <button
                        key={chip.key}
                        type="button"
                        onClick={() => setSelectedFavCategory(chip.key as any)}
                        className={`py-1.5 rounded-lg border text-[11px] font-bold text-center transition-all ${
                          selectedFavCategory === chip.key 
                            ? chip.activeClass 
                            : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                        } ${chip.color}`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleAddFavorite} className="w-full bg-emerald-500 text-white py-2 rounded-xl text-xs font-black shadow-md hover:bg-emerald-600 transition-colors">
                  리스트에 등록하기
                </button>
              </div>
            )}

            {/* 즐겨찾기 스크롤 리스트 */}
            <div className="space-y-2.5 overflow-y-auto max-h-[260px] pr-1 custom-scrollbar">
              {favorites.length === 0 ? (
                <div className="text-center py-8 text-xs font-bold text-slate-400 opacity-60">등록된 즐겨찾는 장소가 없습니다.</div>
              ) : (
                favorites.map(fav => (
                  <div key={fav.id} onClick={() => handleFavoriteClick(fav)} className={`group w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:border-emerald-500/50' : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-md'}`}>
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        fav.customCategory === 'cafe' ? (isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600') :
                        fav.customCategory === 'restaurant' ? (isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600') :
                        fav.customCategory === 'spot' ? (isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600') :
                        (isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-50 text-slate-500')
                      }`}>
                        {getFavoriteIcon(fav.customCategory)}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className={`font-black text-sm tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{fav.name}</p>
                          <span className={`text-[8px] font-black px-1 rounded uppercase tracking-tighter ${
                            fav.customCategory === 'cafe' ? 'bg-amber-500/10 text-amber-500' :
                            fav.customCategory === 'restaurant' ? 'bg-blue-500/10 text-blue-500' :
                            fav.customCategory === 'spot' ? 'bg-purple-500/10 text-purple-500' : 'bg-slate-500/10 text-slate-400'
                          }`}>{fav.customCategory || 'OTHER'}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5 w-full">{fav.address}</p>
                      </div>
                    </div>
                    <button onClick={(e) => handleDeleteFavorite(fav.id, e)} className="p-2 rounded-xl text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 transition-all shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <button onClick={handleSearchClick} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4.5 rounded-2xl font-black shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs shrink-0 mt-2">
            Check Alternatives <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* 2. 오른쪽 지도 영역 */}
      <div className="flex-1 relative bg-slate-200 overflow-hidden">
        <Maps 
          startPlace={selectedStartPlace ? { lat: selectedStartPlace.lat, lng: selectedStartPlace.lng, name: startPoint } : null}
          destPlace={selectedDestPlace ? { lat: selectedDestPlace.lat, lng: selectedDestPlace.lng, name: destination } : null}
          alternatives={[]}
          routeSegments={[]}
        />

        {/* 3. 지도 위 상단 바 */}
        <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center gap-6 pointer-events-none">
          <div className={`flex-1 h-14 rounded-full shadow-lg overflow-hidden backdrop-blur-md px-6 pointer-events-auto ${isDarkMode ? 'bg-slate-800/90 border border-slate-700 text-slate-200' : 'bg-white/90 border border-slate-100 text-slate-700'}`}>
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

          <div className="relative pointer-events-auto" ref={dropdownRef}>
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

export default MainMapPage;