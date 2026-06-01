import React, { useState } from 'react';
import { Mail, Lock, User, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill } from 'react-icons/ri';

interface SignupPageProps {
  onSwitch: () => void;
  isDarkMode: boolean;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSwitch, isDarkMode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 유효성 검증
    if (!name || !email || !password || !confirmPassword) {
      setError('모든 필드를 입력해 주세요.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호와 확인 비밀번호가 완벽하게 일치하지 않습니다.');
      return;
    }

    // 로컬스토리지 가상 저장소(DB) 연동
    const currentUsers = JSON.parse(localStorage.getItem('user_db') || '[]');
    
    // 이메일 중복 체크
    const isExist = currentUsers.some((user: any) => user.email === email);
    if (isExist) {
      setError('이미 가입된 이메일 주소입니다.');
      return;
    }

    // 새로운 회원 데이터 푸시
    const newUser = { name, email, password };
    currentUsers.push(newUser);
    localStorage.setItem('user_db', JSON.stringify(currentUsers));

    setSuccess('회원가입이 완료되었습니다! 잠시 후 로그인 창으로 이동합니다.');
    
    // 가입 성공 시 1.5초 후 로그인 탭으로 자동 롤백 스위칭
    setTimeout(() => {
      onSwitch();
    }, 1500);
  };

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
            ArriView
          </h1>
        </div>
        <p className="text-emerald-500 font-bold text-xs uppercase tracking-[0.2em]">Create New Account</p>
      </div>

      <div className={`w-full max-w-[450px] rounded-[2.5rem] shadow-2xl border transition-all duration-500 p-10 ${
        isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-100'
      }`}>
        {/* 탭 전환 */}
        <div className={`p-1.5 rounded-full flex gap-1 mb-8 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
          <button 
            onClick={onSwitch}
            type="button"
            className={`flex-1 py-3.5 rounded-full font-black text-sm transition-all hover:opacity-70 ${
              isDarkMode ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            로그인
          </button>
          <button type="button" className={`flex-1 py-3.5 rounded-full font-black text-sm transition-all shadow-sm ${
            isDarkMode ? 'bg-slate-700 text-emerald-400' : 'bg-white text-emerald-600'
          }`}>
            회원가입
          </button>
        </div>

        {error && (
          <div className="mb-4 text-xs font-bold text-rose-500 bg-rose-500/10 p-3.5 rounded-xl text-center border border-rose-500/20">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 text-xs font-bold text-emerald-500 bg-emerald-500/10 p-3.5 rounded-xl text-center border border-emerald-500/20">
            {success}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1.5 block ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="이름" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none border-2 transition-all font-bold text-sm ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50' : 'bg-slate-50 border-transparent focus:border-emerald-500 focus:bg-white text-slate-800'
                }`} 
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1.5 block ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="email" 
                placeholder="이메일" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none border-2 transition-all font-bold text-sm ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50' : 'bg-slate-50 border-transparent focus:border-emerald-500 focus:bg-white text-slate-800'
                }`} 
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1.5 block ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="password" 
                placeholder="비밀번호" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none border-2 transition-all font-bold text-sm ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50' : 'bg-slate-50 border-transparent focus:border-emerald-500 focus:bg-white text-slate-800'
                }`} 
              />
            </div>
          </div>

          {/* 비밀번호 확인 필드 */}
          <div>
            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1.5 block ml-1">Confirm Password</label>
            <div className="relative group">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="password" 
                placeholder="비밀번호 확인" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none border-2 transition-all font-bold text-sm ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500/50' : 'bg-slate-50 border-transparent focus:border-emerald-500 focus:bg-white text-slate-800'
                }`} 
              />
            </div>
          </div>
        </form>

        <button 
          onClick={handleSignup}
          type="button"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-[1.5rem] font-black text-sm mt-8 shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
        >
          Join Community <ArrowRight size={18} />
        </button>

        {/* ─── 소셜 로그인 영역 주석 처리 시작 ─── */}
        {/* <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}></div>
          </div>
          <span className={`relative px-4 text-[10px] font-black uppercase tracking-[0.3em] ${
            isDarkMode ? 'bg-[#1E293B] text-slate-500' : 'bg-white text-slate-400'
          }`}>Social Connect</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onSwitch} type="button" className={`flex items-center justify-center gap-2 py-4 border rounded-2xl font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] ${
            isDarkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-700 shadow-sm'
          }`}>
            <FcGoogle size={20} /> 
            <span>Google</span>
          </button>

          <button onClick={onSwitch} type="button" className="flex items-center justify-center gap-2 py-4 bg-[#FEE500] rounded-2xl font-bold text-xs text-[#3C1E1E] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm">
            <RiKakaoTalkFill size={20} /> 
            <span>Kakao</span>
          </button>
        </div>
        */}
        {/* ─── 소셜 로그인 영역 주석 처리 끝 ─── */}
      </div>
    </div>
  );
};

export default SignupPage;