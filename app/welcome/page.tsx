'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('nickname') as string;
    if (!name || name.trim().length === 0 || name.length > 20) {
      setError("ต้องมีชื่อเล่นนะ!! (สูงสุด 20 ตัวอักษร)" + " 😤");
      return;
    }
    sessionStorage.setItem('quiz_player_name', name);
    router.push('/quiz');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 relative overflow-hidden">
      {/* Pattern background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#c084fc 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>

      {/* Card */}
      <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl w-full max-w-md border-2 border-pink-100 z-10 transform transition-all hover:scale-105 duration-300">
        <h1 className="text-3xl font-black text-gray-800 text-center mb-2 tracking-tight">AI EXAM ARENA</h1>
        <p className="text-purple-500 text-center font-bold mb-8 tracking-wider uppercase text-xs">Practice • Play • Pass</p>

        {/* Mascot idle animation */}
        <div className="flex justify-center mb-8">
          <div className="relative group cursor-pointer">
            <img src="/images/idle.png" alt="Waiting..." className="w-56 h-56 object-contain drop-shadow-xl transition-transform duration-500 group-hover:rotate-6 animate-floaty" />
            <div className="absolute -top-4 -right-8 bg-white px-3 py-1.5 rounded-xl shadow-md border-2 border-purple-200 text-xs font-bold text-gray-600 animate-pulse">สวัสดีค่ะ~! 👋</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">{error}</p>
          )}
          <div className="relative">
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              maxLength={20}
              placeholder="พิมพ์ชื่อเล่นของคุณ..."
              className="w-full pl-4 pr-14 py-3 bg-purple-50 border-2 border-purple-200 rounded-xl focus:border-pink-400 focus:ring-0 outline-none transition-colors font-medium text-gray-700 placeholder-purple-300"
            />
            <span className="absolute right-4 top-3.5 text-gray-400 text-xs">/20</span>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-pink-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 text-lg"
          >
            <span>เริ่มฝึกฝน!</span>{' '}
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-8">Powered by your own creativity & love 💖</p>
      </div>
    </div>
  );
}
