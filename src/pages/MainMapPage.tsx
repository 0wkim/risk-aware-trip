import React from 'react';
import { MapPin, Clock, ArrowRight, User, Moon, Sun, Route } from 'lucide-react';

interface Props {
  onSearch: () => void;
  onGoToMyPage: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const MainMapPage = ({ onSearch, onGoToMyPage, isDarkMode, toggleDarkMode }: Props) => {
  return (
    <div className="flex h-full animate-in fade-in duration-700">
      <div className={`w-[400px] h-full flex flex-col border-r z-10 shadow-2xl transition-all duration-500 ${
        isDarkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-800'
      }`}>
        <header className="p-6 flex items-center justify-between border-b border-inherit">
          <div className="flex items-center gap-2 text-emerald-500">
            <Route size={24} />
            <h1 className="font-bold text-lg tracking-tight">스마트 경로 대안</h1>
          </div>
          <button onClick={toggleDarkMode} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-400" />}
          </button>
        </header>

        <div className="flex-1 p-8 space-y-8 text-left">
          <div className="space-y-6">
            <div>
              <label className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-2 block">Starting Point</label>
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <MapPin size={18} className="text-blue-500" />
                <input type="text" defaultValue="제주공항" className="bg-transparent outline-none w-full font-bold text-sm" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-black text-rose-500 uppercase tracking-widest mb-2 block">Destination</label>
              <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <MapPin size={18} className="text-rose-500" />
                <input type="text" defaultValue="자매국수" className="bg-transparent outline-none w-full font-bold text-sm" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Max Travel Time</label>
            <div className="flex gap-3">
              <div className={`flex-1 p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <span className="text-xl font-black text-emerald-500">1</span><span className="ml-1 text-xs font-bold opacity-50 uppercase">Hr</span>
              </div>
              <div className={`flex-1 p-4 rounded-2xl border text-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <span className="text-xl font-black text-emerald-500">10</span><span className="ml-1 text-xs font-bold opacity-50 uppercase">Min</span>
              </div>
            </div>
          </div>

          <button onClick={onSearch} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-3xl font-black shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
            Check Alternatives <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-200">
        <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover grayscale-[0.2]" alt="Map" />
        <button onClick={onGoToMyPage} className="absolute top-8 right-8 w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-800 hover:scale-110 transition-transform">
          <User size={24} />
        </button>
      </div>
    </div>
  );
};

export default MainMapPage;