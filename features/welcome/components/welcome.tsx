'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  normalizePlayerName,
  savePlayerName,
  validatePlayerName,
} from '../welcome.store';

export function Welcome() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const playerName = normalizePlayerName(name);
    const validation = validatePlayerName(playerName);

    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    savePlayerName(playerName);
    router.replace('/quiz');
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(#c084fc 2px, transparent 2px)',
          backgroundSize: '30px 30px',
        }}
      />

      <div className="z-10 w-full max-w-md rounded-[2rem] border-2 border-pink-100 bg-white p-8 shadow-2xl transition-transform duration-300 hover:scale-105 md:p-10">
        <h1 className="mb-2 text-center text-3xl font-black tracking-tight text-gray-800">
          AI EXAM ARENA
        </h1>
        <p className="mb-8 text-center text-xs font-bold uppercase tracking-wider text-purple-500">
          Practice • Play • Pass
        </p>

        <div className="mb-8 flex justify-center">
          <div className="group relative cursor-pointer">
            <Image
              priority
              src="/images/idle.png"
              alt="Mascot waiting to welcome the player"
              width={1408}
              height={768}
              className="h-56 w-56 object-contain drop-shadow-xl transition-transform duration-500 group-hover:rotate-6 animate-floaty"
            />
            <div className="absolute -right-8 -top-4 rounded-xl border-2 border-purple-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 shadow-md animate-pulse">
              สวัสดีค่ะ~! 👋
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg bg-red-50 p-2 text-center text-sm font-medium text-red-500" role="alert">
              {error}
            </p>
          )}
          <div className="relative">
            <input
              id="player-name"
              name="playerName"
              type="text"
              required
              maxLength={20}
              value={name}
              onChange={(event) => {
                setName(normalizePlayerName(event.target.value));
                setError(null);
              }}
              placeholder="PLAYER_NAME"
              autoComplete="username"
              className="w-full rounded-xl border-2 border-purple-200 bg-purple-50 py-3 pl-4 pr-14 font-medium text-gray-700 outline-none transition-colors placeholder:text-purple-300 focus:border-pink-400 focus:ring-0"
              aria-describedby="player-name-rules"
            />
            <span className="absolute right-4 top-3.5 text-xs text-gray-400">/20</span>
          </div>
          <p id="player-name-rules" className="text-center text-xs text-gray-400">
            ใช้ A–Z และ _ เท่านั้น
          </p>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3.5 text-lg font-bold text-white shadow-lg transition-all hover:shadow-pink-500/30 active:scale-95"
          >
            <span>เริ่มฝึกฝน!</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-gray-400">Powered by your own creativity &amp; love 💖</p>
      </div>
    </div>
  );
}
