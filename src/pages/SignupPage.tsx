import React from 'react';
import { FaMapMarkerAlt, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill } from 'react-icons/ri';

interface SignupPageProps {
  onSwitch: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSwitch }) => {
  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-[#7c4dff] p-2 rounded-lg text-white"><FaMapMarkerAlt size={24} /></div>
          <h1 className="text-3xl font-bold text-[#4a3aff]">PlaceFinder</h1>
        </div>
        <p className="text-gray-500 font-medium text-sm">Lorem, ipsum dolor.</p>
      </div>

      <div className="bg-white w-full max-w-[450px] rounded-[32px] shadow-sm border border-gray-100 p-8">
        <div className="bg-[#f3f4f8] p-1.5 rounded-full flex gap-1 mb-10">
          <button onClick={onSwitch} className="flex-1 py-3 text-gray-400 rounded-full font-bold hover:bg-gray-100 transition">
            로그인
          </button>
          <button className="flex-1 py-3 bg-white text-[#4a3aff] rounded-full font-bold shadow-sm">
            회원가입
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="이름" className="w-full bg-[#f3f4f8] pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7c4dff]" />
          </div>
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" placeholder="이메일" className="w-full bg-[#f3f4f8] pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7c4dff]" />
          </div>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="password" placeholder="비밀번호" className="w-full bg-[#f3f4f8] pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7c4dff]" />
          </div>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="password" placeholder="비밀번호 확인" className="w-full bg-[#f3f4f8] pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#7c4dff]" />
          </div>
        </div>

        <button className="w-full bg-gradient-to-r from-[#7c4dff] to-[#4a3aff] text-white py-4 rounded-2xl font-bold text-lg mt-8 shadow-lg hover:opacity-90 transition">
          가입하기
        </button>

        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <span className="relative px-4 bg-white text-gray-400 text-sm">또는</span>
        </div>

        <div className="space-y-3">
          <button className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-100 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 transition">
            <FcGoogle size={22} /> Google로 계속하기
          </button>
          <button className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#ffe812] rounded-2xl font-semibold text-[#3c1e1e] hover:bg-[#fddc00] transition">
            <RiKakaoTalkFill size={22} /> 카카오로 계속하기
          </button>
        </div>
      </div>

      <p className="mt-8 text-xs text-gray-400 text-center">
        가입 시 <span className="text-[#7c4dff] underline">이용약관</span> 및 <span className="text-[#7c4dff] underline">개인정보처리방침</span>에 동의하게 됩니다.
      </p>
    </div>
  );
};

export default SignupPage;