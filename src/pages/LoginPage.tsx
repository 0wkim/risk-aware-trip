import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
// import { FcGoogle } from 'react-icons/fc';
// import { RiKakaoTalkFill } from 'react-icons/ri';

interface LoginPageProps {
  onSwitch: () => void;
  onLogin: () => void;
  isDarkMode: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitch, onLogin, isDarkMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    // 로컬스토리지 가상 가입 유저 풀(DB) 조회
    const users = JSON.parse(localStorage.getItem('user_db') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    // 디버깅 및 개발 편의용 마스터 계정 허용 
    const isMasterAccount = email === 'seoyoung8939@gmail.com' && password === '1234';

    if (user || isMasterAccount) {
      const loggedInUser = user || { name: '최서영', email: 'seoyoung8939@gmail.com' };
      
      // 만료일 관리를 위한 로컬스토리지 세션 패키징
      const sessionData = {
        userId: loggedInUser.email,
        userName: loggedInUser.name,
        expiresAt: rememberMe ? Date.now() + 7 * 24 * 60 * 60 * 1000 : Date.now() + 1 * 24 * 60 * 60 * 1000 // 7일 vs 1일 가상 쿠키 만료일
      };
      
      localStorage.setItem('user_session', JSON.stringify(sessionData));
      onLogin(); // App.tsx의 마이페이지 뷰 체인 트리거
    } else {
      setError('등록되지 않은 이메일이거나 비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-500 ${
      isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F4F7F9]'
    }`}>
      {/* 상단 로고 섹션 */}
      <div className="flex flex-col items-center mb-8 sm:mb-10 animate-in fade-in zoom-in duration-700">
        <div className="flex items-center gap-2.5 sm:gap-3 mb-2 sm:mb-3">
          <img 
            src="/logo.svg" 
            alt="ArriView Logo" 
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md hover:scale-105 transition-transform duration-300" 
          />
          
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            ArriView
          </h1>
        </div>
        <p className="text-emerald-500 font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em]">Smart Route Alternatives</p>
      </div>

      {/* 카드 섹션 */}
      <div className={`w-full max-w-[450px] rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border transition-all duration-500 p-6 sm:p-8 md:p-10 ${
        isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-100'
      }`}>
        {/* 탭 전환 버튼 */}
        <div className={`p-1.5 rounded-full flex gap-1 mb-6 sm:mb-8 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
          <button className={`flex-1 py-3 sm:py-3.5 rounded-full font-black text-xs sm:text-sm transition-all shadow-sm ${
            isDarkMode ? 'bg-slate-700 text-emerald-400' : 'bg-white text-emerald-600'
          }`}>
            로그인
          </button>
          <button 
            onClick={onSwitch}
            className={`flex-1 py-3 sm:py-3.5 rounded-full font-black text-xs sm:text-sm transition-all hover:opacity-70 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            회원가입
          </button>
        </div>

        {error && (
          <div className="mb-4 text-[11px] sm:text-xs font-bold text-rose-500 bg-rose-500/10 p-3 sm:p-3.5 rounded-xl text-center border border-rose-500/20">
            {error}
          </div>
        )}

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="relative group">
            <Mail className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
            <input 
              type="email" 
              placeholder="이메일" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl outline-none border-2 transition-all font-bold text-xs sm:text-sm ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 focus:border-emerald-500/50 text-white' 
                  : 'bg-slate-50 border-transparent focus:border-emerald-500 focus:bg-white text-slate-800'
              }`}
            />
          </div>
          
          <div className="relative group">
            <Lock className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-4 h-4 sm:w-5 sm:h-5" />
            <input 
              type="password" 
              placeholder="비밀번호" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-10 sm:pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl outline-none border-2 transition-all font-bold text-xs sm:text-sm ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 focus:border-emerald-500/50 text-white' 
                  : 'bg-slate-50 border-transparent focus:border-emerald-500 focus:bg-white text-slate-800'
              }`}
            />
          </div>

          {/* 보조 도구 */}
          <div className="flex items-center justify-between mt-4 sm:mt-5 px-1">
            <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 accent-emerald-500" 
              />
              <span className={`text-[11px] sm:text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>로그인 유지</span>
            </label>
            <button type="button" className="text-[11px] sm:text-xs text-emerald-500 font-black hover:underline uppercase tracking-tighter">비밀번호 찾기</button>
          </div>

          {/* 로그인 버튼 */}
          <button 
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 sm:py-5 rounded-2xl sm:rounded-[1.5rem] font-black text-xs sm:text-sm mt-6 sm:mt-8 shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            Get Started <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default LoginPage;