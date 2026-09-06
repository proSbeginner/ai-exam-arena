'use client';

import Image from 'next/image';

import { TextInput } from '@/features/shared/components/text-input';

interface WelcomeProps {
  error: string | null;
  isSubmitting: boolean;
  playerName: string;
  submitPlayerName: () => Promise<void>;
  updatePlayerName: (value: string) => void;
}

export function Welcome({
  error,
  isSubmitting,
  playerName,
  submitPlayerName,
  updatePlayerName,
}: WelcomeProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitPlayerName();
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

        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            id="player-name"
            name="playerName"
            type="text"
            required
            maxLength={20}
            value={playerName}
            onChange={(event) => updatePlayerName(event.target.value)}
            placeholder="PLAYER_NAME"
            autoComplete="off"
            error={error}
            hint="ใช้ A–Z และ _ เท่านั้น"
            showCounter
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3.5 text-lg font-bold text-white shadow-lg transition-all hover:shadow-pink-500/30 active:scale-95"
          >
            <span>{isSubmitting ? 'กำลังเตรียมเกม...' : 'เริ่มฝึกฝน!'}</span>
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
