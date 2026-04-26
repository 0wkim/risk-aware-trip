 import React from 'react';
import { FaMapMarkerAlt, FaEnvelope, FaLock } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill } from 'react-icons/ri';

interface LoginPageProps {
  onSwitch: () => void; // 회원가입 페이지로 이동
  onLogin: () => void;  // 메인 맵 페이지로 이동 
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitch, onLogin }) => {
  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center p-4">
      {/* 상단 로고 섹션 */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-[#7c4dff] p-2 rounded-lg text-white">
            <FaMapMarkerAlt size={24} />
          </div>
          <h1 className="text-3xl font-bold text-[#4a3aff]">PlaceFinder</h1>
        </div>
        <p className="text-gray-500 font-medium text-sm">Lorem, ipsum dolor.</p>
      </div>

      {/* 카드 섹션 */}
      <div className="bg-white w-full max-w-[450px] rounded-[32px] shadow-sm border border-gray-100 p-8">
        {/* 탭 전환 버튼 */}
        <div className="bg-[#f3f4f8] p-1.5 rounded-full flex gap-1 mb-10">
          <button className="flex-1 py-3 bg-white text-[#4a3aff] rounded-full font-bold shadow-sm">
            로그인
          </button>
          <button 
            onClick={onSwitch}
            className="flex-1 py-3 text-gray-400 rounded-full font-bold hover:bg-gray-100 transition"
          >
            회원가입
          </button>
        </div>

        {/* 입력 폼 */}
        <div className="space-y-4">
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="email" 
              placeholder="이메일" 
              className="w-full bg-[#f3f4f8] pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7c4dff] transition-all"
            />
          </div>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="password" 
              placeholder="비밀번호" 
              className="w-full bg-[#f3f4f8] pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7c4dff] transition-all"
            />
          </div>
        </div>

        {/* 하단 보조 도구 */}
        <div className="flex items-center justify-between mt-4 px-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-[#7c4dff]" />
            <span className="text-sm text-gray-500">로그인 유지</span>
          </label>
          <button className="text-sm text-[#7c4dff] font-semibold hover:underline">비밀번호 찾기</button>
        </div>

        {/* 로그인 버튼 */}
        <button 
          onClick={onLogin} // 클릭 시 onLogin 함수 실행
          className="w-full bg-gradient-to-r from-[#7c4dff] to-[#4a3aff] text-white py-4 rounded-2xl font-bold text-lg mt-8 shadow-lg shadow-indigo-100 hover:opacity-90 transition"
        >
          로그인
        </button>

        {/* 구분선 */}
        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <span className="relative px-4 bg-white text-gray-400 text-sm">또는</span>
        </div>

        {/* 소셜 로그인 */}
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-100 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 transition">
            <FcGoogle size={22} /> Google로 계속하기
          </button>
          <button className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#ffe812] rounded-2xl font-semibold text-[#3c1e1e] hover:bg-[#fddc00] transition">
            <RiKakaoTalkFill size={22} /> 카카오로 계속하기
          </button>
        </div>
      </div>

      {/* 푸터 정보 */}
      <p className="mt-8 text-xs text-gray-400">
        가입 시 <span className="text-[#7c4dff] underline">이용약관</span> 및 <span className="text-[#7c4dff] underline">개인정보처리방침</span>에 동의하게 됩니다.
      </p>
    </div>
  );
};

export default LoginPage;