import React from 'react';
import { Mail, Lock, User, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill } from 'react-icons/ri';

interface SignupPageProps {
  onSwitch: () => void;
  isDarkMode: boolean;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSwitch, isDarkMode }) => {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 ${
      isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F4F7F9]'
    }`}>
      {/* 상단 로고 */}
      <div className="flex flex-col items-center mb-10 animate-in fade-in zoom-in duration-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
            <MapPin size={28} />
          </div>
          <h1 className={`text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            VibeMap
          </h1>
        </div>
        <p className="text-emerald-500 font-bold text-xs uppercase tracking-[0.2em]">Create New Account</p>
      </div>

      <div className={`w-full max-w-[450px] rounded-[2.5rem] shadow-2xl border transition-all duration-500 p-10 ${
        isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-100'
      }`}>
        {/* 탭 전환 */}
        <div className={`p-1.5 rounded-full flex gap-1 mb-10 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
          <button 
            onClick={onSwitch}
            className={`flex-1 py-3.5 rounded-full font-black text-sm transition-all hover:opacity-70 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            로그인
          </button>
          <button className={`flex-1 py-3.5 rounded-full font-black text-sm transition-all shadow-sm ${
            isDarkMode ? 'bg-slate-700 text-emerald-400' : 'bg-white text-emerald-600'
          }`}>
            회원가입
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1.5 block ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input type="text" placeholder="이름" className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none border-2 transition-all font-bold text-sm ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50' : 'bg-slate-50 border-transparent focus:border-emerald-500 focus:bg-white text-slate-800'
              }`} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1.5 block ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input type="email" placeholder="이메일" className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none border-2 transition-all font-bold text-sm ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50' : 'bg-slate-50 border-transparent focus:border-emerald-500 focus:bg-white text-slate-800'
              }`} />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1.5 block ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input type="password" placeholder="비밀번호" className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none border-2 transition-all font-bold text-sm ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50' : 'bg-slate-50 border-transparent focus:border-emerald-500 focus:bg-white text-slate-800'
              }`} />
            </div>
          </div>

          {/* 비밀번호 확인 필드 */}
          <div>
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1.5 block ml-1">Confirm Password</label>
            <div className="relative group">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input type="password" placeholder="비밀번호 확인" className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none border-2 transition-all font-bold text-sm ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50' : 'bg-slate-50 border-transparent focus:border-emerald-500 focus:bg-white text-slate-800'
              }`} />
            </div>
          </div>
        </div>

        <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-[1.5rem] font-black text-sm mt-8 shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
          Join Community <ArrowRight size={18} />
        </button>

        {/* 구분선 */}
        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}></div>
          </div>
          <span className={`relative px-4 text-[10px] font-black uppercase tracking-[0.3em] ${
            isDarkMode ? 'bg-[#1E293B] text-slate-500' : 'bg-white text-slate-400'
          }`}>Social Connect</span>
        </div>

        {/* 소셜 로그인 - 가로 평행 배치 */}
        <div className="grid grid-cols-2 gap-3">
          <button className={`flex items-center justify-center gap-2 py-4 border rounded-2xl font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] ${
            isDarkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-700 shadow-sm'
          }`}>
            <FcGoogle size={20} /> 
            <span>Google</span>
          </button>

          <button className="flex items-center justify-center gap-2 py-4 bg-[#FEE500] rounded-2xl font-bold text-xs text-[#3C1E1E] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm">
            <RiKakaoTalkFill size={20} /> 
            <span>Kakao</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;