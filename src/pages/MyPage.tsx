import React, { useState } from 'react';
import { MapPin, Route, Clock, TrendingUp, Mail, User, LogOut, Settings, ChevronLeft, Trees, Car, Train, X, Bell } from 'lucide-react';

const MyPage = () => {
  /* 탭 상태 관리 */
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'all-searches'>('profile');

  /* 대시보드 데이터 */
  const stats = [
    { label: 'Cities', value: '24', icon: <MapPin size={16} />, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Routes', value: '54', icon: <Route size={16} />, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Saved', value: '48h', icon: <Clock size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Growth', value: '+32%', icon: <TrendingUp size={16} />, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  /* 검색 기록 데이터 */
  const allSearches = Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    from: 'Nowon',
    to: 'Gangnam',
    date: `Apr ${14 - i}, 2026`,
    img: `https://picsum.photos/seed/${i + 90}/400/300`,
    tags: ['#FASTEST', '#SAFE']
  }));

  return (
    /* 화면 전체 스크롤 방지 */
    <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm flex items-center justify-center p-4 font-sans overflow-hidden text-left">
      
      {/* 팝업 컨테이너 (고정 높이 설정) */}
      <div className="w-full max-w-7xl h-[720px] bg-white rounded-[2.5rem] shadow-2xl flex overflow-hidden border border-white relative animate-in zoom-in-95 duration-500">
        
        {/* 왼쪽 사이드바 (슬림화) */}
        <aside className="w-56 flex flex-col bg-[#F8FAFC] p-6 border-r border-slate-100 shrink-0">
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black shadow-lg">
              <Route size={18} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-800 italic">My Trips</span>
          </div>
          
          <nav className="flex-1 space-y-1">
            <NavItem 
              icon={<User size={16} />} 
              label="My Profile" 
              active={activeTab === 'profile' || activeTab === 'all-searches'} 
              onClick={() => setActiveTab('profile')} 
            />
            <NavItem 
              icon={<Settings size={16} />} 
              label="Preferences" 
              active={activeTab === 'preferences'} 
              onClick={() => setActiveTab('preferences')} 
            />
          </nav>

          <button className="flex items-center gap-3 p-4 text-slate-400 hover:text-red-500 font-bold text-xs mt-auto">
            <LogOut size={16} /> Logout
          </button>
        </aside>

        {/* 메인 영역 */}
        <main className="flex-1 flex flex-col min-w-0 bg-white relative">
          
          {/* 상단 닫기 버튼 */}
          <button className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 text-slate-300 transition-all z-10">
            <X size={20} />
          </button>

          {/* 내부 패딩 조절로 컴팩트하게 변경 */}
          <div className="p-10 flex-1 flex flex-col overflow-hidden">
            
            {(activeTab === 'profile' || activeTab === 'all-searches') && (
              <div className="flex flex-col h-full">
                
                {/* 헤더 섹션 (높이 축소) */}
                <header className="flex items-center justify-between mb-8 shrink-0">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                      <User size={36} className="text-slate-200" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-black text-slate-800 tracking-tight italic">Seoyoung Choi</h1>
                      <p className="text-slate-400 text-xs font-bold">seoyoung8939@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="bg-slate-900 px-6 py-3 rounded-2xl text-white text-center min-w-[90px]">
                      <p className="text-[9px] font-bold opacity-50 uppercase mb-0.5">Cities</p>
                      <p className="text-xl font-black italic">24</p>
                    </div>
                    <div className="bg-indigo-50 px-6 py-3 rounded-2xl text-indigo-600 border border-indigo-100 text-center min-w-[90px]">
                      <p className="text-[9px] font-bold opacity-60 uppercase mb-0.5">Routes</p>
                      <p className="text-xl font-black italic">54</p>
                    </div>
                  </div>
                </header>

                {activeTab === 'profile' ? (
                  <div className="flex flex-col flex-1 overflow-hidden">
                    {/* 대시보드 그리드 */}
                    <section className="mb-8 shrink-0">
                      <h2 className="text-[11px] font-black text-slate-300 uppercase tracking-widest mb-4 ml-1">Dashboard</h2>
                      <div className="grid grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                          <div key={i} className="bg-white p-4 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50 transition-all group">
                            <div className={`${stat.bg} ${stat.color} w-9 h-9 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                              {stat.icon}
                            </div>
                            <p className="text-lg font-black text-slate-800 italic">{stat.value}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* 최근 검색 섹션 (여기만 개별 스크롤) */}
                    <section className="flex-1 flex flex-col min-h-0">
                      <div className="flex justify-between items-center mb-4 px-1 shrink-0">
                        <h2 className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Recent Explorations</h2>
                        <button onClick={() => setActiveTab('all-searches')} className="text-[10px] font-black text-indigo-600 tracking-widest">VIEW ALL</button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {allSearches.slice(0, 2).map((item) => (
                          <SearchCard key={item.id} item={item} />
                        ))}
                      </div>
                    </section>
                  </div>
                ) : (
                  /* 전체 기록 모드 (역시 내부 스크롤) */
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center gap-3 mb-6 shrink-0">
                      <button onClick={() => setActiveTab('profile')} className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-full hover:bg-slate-100 transition-all border border-slate-100">
                          <ChevronLeft size={16} />
                      </button>
                      <h2 className="text-xl font-black text-slate-800 italic uppercase">All History</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 gap-4 custom-scrollbar">
                      {allSearches.map((item) => <SearchCard key={item.id} item={item} />)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 환경 설정 탭 (역시 한 화면에 고정) */}
            {activeTab === 'preferences' && (
              <div className="animate-in fade-in duration-500 max-w-2xl">
                <h2 className="text-3xl font-black text-slate-800 mb-2 italic uppercase">Preferences</h2>
                <p className="text-slate-300 font-bold text-[10px] tracking-widest mb-8 uppercase">Customize your trip</p>

                <div className="space-y-6">
                  <div className="bg-[#F8FAFC] p-8 rounded-[2.5rem] border border-slate-50">
                    <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Trees className="text-emerald-500" size={18} /> Atmosphere
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {['Calm', 'Lively', 'Nature', 'Modern'].map((tag) => (
                        <button key={tag} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${tag === 'Lively' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-300 border border-slate-100 hover:text-indigo-400'}`}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-[#F8FAFC] p-8 rounded-[2.5rem] border border-slate-50">
                      <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2"><Car className="text-blue-500" size={16} /> Transport</h3>
                      <div className="flex gap-2">
                        <button className="flex-1 p-4 bg-white rounded-2xl border-2 border-indigo-600 text-indigo-600 font-black text-[10px]">PUBLIC</button>
                        <button className="flex-1 p-4 bg-white rounded-2xl border-2 border-transparent text-slate-200 font-black text-[10px] opacity-50">PRIVATE</button>
                      </div>
                    </div>
                    <div className="bg-[#F8FAFC] p-8 rounded-[2.5rem] border border-slate-50 flex flex-col justify-center">
                      <h3 className="text-sm font-bold text-slate-800 mb-4 italic tracking-tight uppercase">Budget</h3>
                      <div className="h-2 bg-slate-200 rounded-full w-full relative mb-4">
                        <div className="absolute left-0 top-0 h-full w-2/3 bg-indigo-500 rounded-full"></div>
                        <div className="absolute left-[66%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-indigo-600 rounded-full shadow-md"></div>
                      </div>
                      <p className="text-[10px] font-black text-indigo-600 uppercase">₩ 300,000</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 커스텀 스크롤바 스타일링을 위한 스타일 태그 */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold transition-all text-xs ${active ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:bg-slate-50'}`}>
    {icon} {label}
  </button>
);

const SearchCard = ({ item }: { item: any }) => (
  <div className="bg-white rounded-3xl p-4 border border-slate-50 shadow-sm hover:border-indigo-100 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-4 cursor-pointer group">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
      <img src={item.img} alt="place" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
    </div>
    <div className="flex-1 min-w-0 text-left">
      <h3 className="font-black text-slate-800 text-sm truncate italic mb-0.5">{item.from} → {item.to}</h3>
      <p className="text-[9px] text-slate-400 font-bold mb-2 uppercase tracking-tighter">{item.date}</p>
      <div className="flex gap-1.5">
        {item.tags?.map((tag: string) => (
          <span key={tag} className="text-[8px] font-black bg-slate-50 text-slate-300 px-2 py-0.5 rounded-md uppercase">{tag}</span>
        ))}
      </div>
    </div>
  </div>
);

export default MyPage;