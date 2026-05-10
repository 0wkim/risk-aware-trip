import React from 'react';
import { Mail, Lock, MapPin, ArrowRight } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill } from 'react-icons/ri';

interface LoginPageProps {
  onSwitch: () => void;
  onLogin: () => void;
  isDarkMode: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitch, onLogin, isDarkMode }) => {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-500 ${
      isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F4F7F9]'
    }`}>
      {/* 상단 로고 섹션 */}
      <div className="flex flex-col items-center mb-10 animate-in fade-in zoom-in duration-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
            <MapPin size={28} />
          </div>
          <h1 className={`text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            ArriView
          </h1>
        </div>
        <p className="text-emerald-500 font-bold text-xs uppercase tracking-[0.2em]">Smart Route Alternatives</p>
      </div>

      {/* 카드 섹션 */}
      <div className={`w-full max-w-[450px] rounded-[2.5rem] shadow-2xl border transition-all duration-500 p-10 ${
        isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-100'
      }`}>
        {/* 탭 전환 버튼 */}
        <div className={`p-1.5 rounded-full flex gap-1 mb-10 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
          <button className={`flex-1 py-3.5 rounded-full font-black text-sm transition-all shadow-sm ${
            isDarkMode ? 'bg-slate-700 text-emerald-400' : 'bg-white text-emerald-600'
          }`}>
            로그인
          </button>
          <button 
            onClick={onSwitch}
            className={`flex-1 py-3.5 rounded-full font-black text-sm transition-all hover:opacity-70 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* 입력 폼 */}
        <div className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="email" 
              placeholder="이메일" 
              className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border-2 transition-all font-bold text-sm ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 focus:border-emerald-500/50 text-white' 
                  : 'bg-slate-50 border-transparent focus:border-emerald-500 focus:bg-white text-slate-800'
              }`}
            />
          </div>
          
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="password" 
              placeholder="비밀번호" 
              className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border-2 transition-all font-bold text-sm ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 focus:border-emerald-500/50 text-white' 
                  : 'bg-slate-50 border-transparent focus:border-emerald-500 focus:bg-white text-slate-800'
              }`}
            />
          </div>
        </div>

        {/* 보조 도구 */}
        <div className="flex items-center justify-between mt-5 px-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
            <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>로그인 유지</span>
          </label>
          <button className="text-xs text-emerald-500 font-black hover:underline uppercase tracking-tighter">비밀번호 찾기</button>
        </div>

        {/* 로그인 버튼 */}
        <button 
          onClick={onLogin}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-[1.5rem] font-black text-sm mt-8 shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
        >
          Get Started <ArrowRight size={18} />
        </button>

        {/* 구분선 */}
        <div className="relative my-10 text-center">
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

export default LoginPage;