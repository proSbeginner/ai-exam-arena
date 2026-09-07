'use client';

import Image from 'next/image';

import { MOOD_IMAGES } from '../quiz.assets';
import type { ExamQuestion, QuizState } from '../quiz.types';

interface QuizResultProps {
  changePlayerName: () => void;
  playerName: string;
  questions: ExamQuestion[];
  quizState: QuizState;
  restartGame: () => void;
}

export function QuizResult({
  changePlayerName,
  playerName,
  questions,
  quizState,
  restartGame,
}: QuizResultProps) {
  const passed = quizState.score >= Math.ceil(questions.length / 2);

  return (
    <div className="w-full max-w-lg space-y-4 rounded-3xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur-xl animate-bounce-in">
      <Image
        src={MOOD_IMAGES[quizState.mood]}
        alt="Quiz result mascot"
        width={1408}
        height={768}
        className={`mx-auto h-40 w-40 object-contain drop-shadow-xl ${passed ? 'animate-wiggle' : ''}`}
      />
      <h1 className="text-3xl font-extrabold text-gray-800">{passed ? '🎉 PASSED!' : '😭 TRY AGAIN'}</h1>
      <p className="text-sm text-gray-500">คุณได้คะแนน</p>
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-5xl font-black text-transparent">
        {quizState.score}/{questions.length}
      </div>
      <p className="text-sm text-gray-600">
        {passed
          ? `${playerName} เก่งมาก! พร้อมไปสอบจริงแล้ว~ ✨`
          : `${playerName} อย่าท้อใจนะ ลองทบทวนแล้วมาใหม่! 💪`}
      </p>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={restartGame}
          className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 font-bold text-white shadow-lg transition-all hover:shadow-pink-500/30 active:scale-95"
        >
          เล่นอีกครั้ง 🚀
        </button>
      </div>
      <button
        type="button"
        onClick={changePlayerName}
        className="mt-2 block w-full text-xs text-gray-400 underline hover:text-pink-500"
      >
        เปลี่ยนชื่อเล่น
      </button>
    </div>
  );
}
