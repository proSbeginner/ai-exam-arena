'use client';

import Image from 'next/image';

import { MOOD_IMAGES } from '../quiz.assets';
import type { ExamQuestion, QuizState } from '../quiz.types';

interface QuizResultProps {
  answeredCount: number;
  changePlayerName: () => void;
  onResume: () => void;
  playerName: string;
  questions: ExamQuestion[];
  quizState: QuizState;
  restartGame: () => void;
}

export function QuizResult({
  answeredCount,
  changePlayerName,
  onResume,
  playerName,
  questions,
  quizState,
  restartGame,
}: QuizResultProps) {
  const isCompleted = quizState.attemptStatus === 'completed';
  const passed = isCompleted && quizState.score >= Math.ceil(questions.length / 2);
  const percentage = questions.length > 0 ? Math.round((quizState.score / questions.length) * 100) : 0;

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 font-sans">
      <div className="w-full max-w-lg space-y-4 rounded-3xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur-xl animate-bounce-in">
      <Image
        src={MOOD_IMAGES[quizState.mood]}
        alt="Quiz result mascot"
        width={1408}
        height={768}
        className={`mx-auto h-40 w-40 object-contain drop-shadow-xl ${passed ? 'animate-wiggle' : ''}`}
      />
      <h1 className="text-3xl font-extrabold text-gray-800">
        {isCompleted ? (passed ? '🎉 PASSED!' : '😭 TRY AGAIN') : 'สรุปผลการทำข้อสอบ'}
      </h1>
      <p className="text-sm text-gray-500">{isCompleted ? 'คุณได้คะแนน' : 'หยุดทำไว้ก่อนหน้านี้'}</p>
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-5xl font-black text-transparent">
        {percentage}%
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-purple-50 p-3 text-purple-700">
          <span className="block text-xs text-purple-400">ทำไปแล้ว</span>
          <span className="font-bold">{answeredCount}/{questions.length} ข้อ</span>
        </div>
        <div className="rounded-xl bg-green-50 p-3 text-green-700">
          <span className="block text-xs text-green-400">ตอบถูก</span>
          <span className="font-bold">{quizState.score} ข้อ</span>
        </div>
      </div>
      <p className="text-sm text-gray-600">
        {!isCompleted
          ? `${playerName} สามารถกลับมาทำต่อจากจุดเดิมได้`
          : passed
          ? `${playerName} เก่งมาก! พร้อมไปสอบจริงแล้ว~ ✨`
          : `${playerName} อย่าท้อใจนะ ลองทบทวนแล้วมาใหม่! 💪`}
      </p>
      <div className="flex gap-3 pt-2">
        {!isCompleted && (
          <button
            type="button"
            onClick={onResume}
            className="flex-1 rounded-xl border-2 border-purple-200 bg-white py-3 font-bold text-purple-600 transition-all hover:border-purple-400 active:scale-95"
          >
            ทำต่อ
          </button>
        )}
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
    </main>
  );
}
