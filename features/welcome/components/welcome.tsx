'use client';

import Image from 'next/image';

import { TextInput } from '@/features/shared/components/text-input';
import type { WelcomeMode } from '../welcome.types';
import { PLAYER_NAME_MAX_LENGTH } from '../welcome.constants';

interface WelcomeProps {
  playerNameError: string | null;
  isSubmitting: boolean;
  mode: WelcomeMode;
  pinError: string | null;
  pin: string;
  playerName: string;
  submitPlayerName: () => Promise<void>;
  toggleMode: () => void;
  updatePin: (value: string) => void;
  updatePlayerName: (value: string) => void;
}

export function Welcome({
  playerNameError,
  isSubmitting,
  mode,
  pinError,
  pin,
  playerName,
  submitPlayerName,
  toggleMode,
  updatePin,
  updatePlayerName,
}: WelcomeProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitPlayerName();
  };

  return (
    <div
      data-testid="welcome-screen"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 px-4"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(#c084fc 2px, transparent 2px)',
          backgroundSize: '30px 30px',
        }}
      />

      <div className="relative z-10 isolate w-full max-w-md rounded-[2rem] border-2 border-pink-100 bg-white/60 p-8 shadow-2xl backdrop-blur-sm transition-transform duration-300 hover:scale-105 md:p-10">
        <Image
          priority
          loading="eager"
          src="/images/idle.png"
          alt=""
          width={1408}
          height={768}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-7rem] z-0 h-[52rem] w-[52rem] max-h-none max-w-none -translate-x-1/2 object-contain drop-shadow-xl animate-floaty"
        />
        <h1 className="relative z-10 mb-2 text-center text-3xl font-black tracking-tight text-gray-800">
          AI EXAM ARENA
        </h1>
        <p className="relative z-10 mb-8 text-center text-xs font-bold uppercase tracking-wider text-purple-500">
          Practice • Play • Pass
        </p>

        <div className="relative z-10 mb-8 flex h-56 justify-center">
          <div className="absolute left-1 -top-4 rounded-xl border-2 border-purple-200/70 bg-white/75 px-3 py-1.5 text-xs font-bold text-gray-600 shadow-md backdrop-blur-sm animate-pulse">
            สวัสดีค่ะ~! 👋
          </div>
        </div>

        <form noValidate onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <TextInput
            id="player-name"
            name="playerName"
            type="text"
            required
            maxLength={PLAYER_NAME_MAX_LENGTH}
            value={playerName}
            onChange={(event) => updatePlayerName(event.target.value)}
            placeholder="PLAYER_NAME"
            className="bg-white/70"
            autoComplete="off"
            error={playerNameError}
            hint="ใช้ A–Z และ _ เท่านั้น"
            showCounter
          />
          <TextInput
            id="player-pin"
            name="pin"
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(event) => updatePin(event.target.value)}
            placeholder="6-DIGIT PIN"
            className="bg-white/70"
            autoComplete="off"
            error={pinError}
            hint="ใช้ตัวเลข 6 หลักสำหรับกลับเข้าเล่น"
            showCounter
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3.5 text-lg font-bold text-white shadow-lg transition-all hover:shadow-pink-500/30 active:scale-95 disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? 'กำลังเตรียมเกม...' : mode === 'register' ? 'สร้างผู้เล่น!' : 'กลับเข้าเล่น!'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </form>

        <button
          type="button"
          onClick={toggleMode}
          className="relative z-10 mt-4 w-full cursor-pointer text-center text-xs font-medium text-purple-500 hover:text-pink-500"
        >
          {mode === 'register' ? 'มีผู้เล่นอยู่แล้ว? กลับเข้าเล่น' : 'ยังไม่มีผู้เล่น? สร้างใหม่'}
        </button>

        <p className="relative z-10 mt-8 text-center text-xs text-gray-400">Powered by your own creativity &amp; love 💖</p>
      </div>
    </div>
  );
}
