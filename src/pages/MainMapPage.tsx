import React, { useState, useEffect } from 'react';
import { MapPin, ArrowRight, Star, Plus, Minus, Coffee, Utensils, Landmark, HelpCircle, Trash2 } from 'lucide-react';
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
  
  const [activeInput, setActiveInput] = useState<'start' | 'dest'>('dest');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState<'start' | 'dest' | null>(null);

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
    if (!window.kakao || !window.kakao.maps.services) return;
    const ps = new window.kakao.maps.services.Places();

    if (startPoint && !selectedStartPlace) {
      ps.keywordSearch(startPoint, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK && data[0]) {
          const first = data[0];
          setSelectedStartPlace({
            lat: parseFloat(first.y),
            lng: parseFloat(first.x),
            place_id: first.id,
            categories: [mapToBackendCategory(first.category_name)],
            name: first.place_name
          });
        }
      });
    }

    if (destination && !selectedDestPlace) {
      ps.keywordSearch(destination, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK && data[0]) {
          const first = data[0];
          setSelectedDestPlace({
            lat: parseFloat(first.y),
            lng: parseFloat(first.x),
            place_id: first.id,
            categories: [mapToBackendCategory(first.category_name)],
            name: first.place_name
          });
        }
      });
    }
  }, [startPoint, destination, selectedStartPlace, selectedDestPlace]);

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
    if (type === 'start') {
      setStartPoint(keyword);
      if (selectedStartPlace && keyword !== selectedStartPlace.name) setSelectedStartPlace(null); 
    } else if (type === 'dest') {
      setDestination(keyword);
      if (selectedDestPlace && keyword !== selectedDestPlace.name) setSelectedDestPlace(null);
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
    if (!newFavName.trim() || !favSelectedPlace) return alert("추가할 장소를 검색 목록에서 정확히 선택해 주세요.");

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
      lat: fav.lat, lng: fav.lng, place_id: fav.place_id, categories: fav.categories, name: fav.name
    };

    if (activeInput === 'start') {
      setStartPoint(fav.name);
      setSelectedStartPlace(targetPlace);
    } else {
      setDestination(fav.name);
      setSelectedDestPlace(targetPlace);
    }
  };

  const handleSearchClick = () => {
    const now = new Date();
    if (!selectedStartPlace || !selectedDestPlace) return alert("출발지와 도착지를 검색 결과 리스트에서 정확히 선택해주세요.");

    const currentHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
    const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    currentHistory.push({ id: `hist-${Date.now()}`, startPoint, destination, date: formattedDate });
    localStorage.setItem('search_history', JSON.stringify(currentHistory));

    onSearch({
      startPoint, destination,
      places: [
        { lat: Number(selectedStartPlace.lat), lng: Number(selectedStartPlace.lng), place_id: String(selectedStartPlace.place_id), categories: selectedStartPlace.categories, name: String(selectedStartPlace.name) },
        { lat: Number(selectedDestPlace.lat), lng: Number(selectedDestPlace.lng), place_id: String(selectedDestPlace.place_id), categories: selectedDestPlace.categories, name: String(selectedDestPlace.name) }
      ], 
      day: Number(toBackendDay(now)), hour: Number(now.getHours()), maxHours: Number(maxHours), maxMinutes: Number(maxMinutes)
    });
  };

  return (
    <div className="flex h-full animate-in fade-in duration-700">
      <div className={`w-[400px] h-full flex flex-col border-r z-10 shadow-2xl transition-all duration-500 ${isDarkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
        
        <header className="p-6 flex items-center justify-between border-b border-inherit shrink-0">
          <div className="flex items-center gap-2 text-emerald-500">
            <img 
              src="/logo.svg" 
              alt="ArriView Logo" 
              className="w-6 h-6 object-contain drop-shadow-sm" 
            />
            <h1 className="font-bold text-lg tracking-tight">ArriView</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6 text-left">
          <div className="space-y-5">
            <div className="relative search-container">
              <label className={`text-[11px] font-black uppercase tracking-wildest mb-1.5 block ${activeInput === 'start' ? 'text-blue-500' : 'text-slate-400'}`}>Starting Point</label>
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <MapPin size={18} className={`${activeInput === 'start' ? 'text-blue-500' : 'text-slate-400'} shrink-0 transition-colors`} />
                <input type="text" value={startPoint} onChange={(e) => handleInputChange(e.target.value, 'start')} onFocus={() => { setActiveInput('start'); if(searchResults.length) setShowSearchDropdown('start'); }} placeholder="출발지를 입력하세요" className="bg-transparent outline-none w-full font-bold text-sm text-inherit" />
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

            <div className="relative search-container">
              <label className={`text-[11px] font-black uppercase tracking-wildest mb-1.5 block ${activeInput === 'dest' ? 'text-rose-500' : 'text-slate-400'}`}>Destination</label>
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <MapPin size={18} className={`${activeInput === 'dest' ? 'text-rose-500' : 'text-slate-400'} shrink-0 transition-colors`} />
                <input type="text" value={destination} onChange={(e) => handleInputChange(e.target.value, 'dest')} onFocus={() => { setActiveInput('dest'); if(searchResults.length) setShowSearchDropdown('dest'); }} placeholder="도착지를 입력하세요" className="bg-transparent outline-none w-full font-bold text-sm text-inherit" />
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

      <div className="flex-1 relative bg-slate-200 overflow-hidden">
        <Maps 
          startPlace={selectedStartPlace ? { lat: selectedStartPlace.lat, lng: selectedStartPlace.lng, name: startPoint } : null}
          destPlace={selectedDestPlace ? { lat: selectedDestPlace.lat, lng: selectedDestPlace.lng, name: destination } : null}
          alternatives={[]}
          routeSegments={[]}
        />

        <TopBar 
          seoulData={seoulData} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode} 
          onGoToMyPage={onGoToMyPage} 
          onLogout={onLogout} 
        />
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