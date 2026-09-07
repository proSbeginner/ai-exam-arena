'use client';

import Image from 'next/image';

import { MOOD_IMAGES } from '../quiz.assets';
import { ATTEMPT_STATUS } from '../quiz.constants';
import type { ExamQuestion, QuizState } from '../quiz.types';
import { QuizHeader } from './quiz-header';

interface QuizResultProps {
  answeredCount: number;
  changePlayerName: () => void;
  currentRank: { emoji: string; title: string };
  onResume: () => void;
  playerName: string;
  questions: ExamQuestion[];
  quizState: QuizState;
  restartGame: () => void;
}

export function QuizResult({
  answeredCount,
  changePlayerName,
  currentRank,
  onResume,
  playerName,
  questions,
  quizState,
  restartGame,
}: QuizResultProps) {
  const isCompleted = quizState.gameOver || quizState.attemptStatus === ATTEMPT_STATUS.COMPLETED;
  const passed = isCompleted && quizState.score >= Math.ceil(questions.length / 2);
  const percentage = questions.length > 0 ? Math.round((quizState.score / questions.length) * 100) : 0;

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 font-sans">
      <div className="relative z-10 flex w-full max-w-lg items-center justify-center">
        <div className="relative isolate w-full space-y-4 rounded-3xl bg-white/60 p-8 text-center shadow-2xl backdrop-blur-xl animate-bounce-in">
          <Image
            src={MOOD_IMAGES[quizState.mood]}
            alt=""
            width={1408}
            height={768}
            loading="eager"
            aria-hidden
            className={`pointer-events-none absolute left-1/2 top-[-2rem] z-0 h-[36rem] w-[36rem] max-h-none max-w-none -translate-x-1/2 object-contain drop-shadow-xl ${passed ? 'animate-wiggle' : ''}`}
          />
          <div className="relative z-10">
            <QuizHeader changePlayerName={changePlayerName} currentRank={currentRank} />
          </div>
          <div className="relative z-10 h-40" aria-hidden />
          <div className="relative z-10 space-y-1 rounded-2xl border-2 border-pink-400/70 bg-transparent backdrop-blur-sm animate-stamp-in">
            <h1 className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
              {isCompleted ? (passed ? '🎉 PASSED!' : '😭 TRY AGAIN') : 'สรุปผลการทำข้อสอบ'}
            </h1>
            <p className="text-sm font-medium text-purple-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">{isCompleted ? 'คุณได้คะแนน' : 'หยุดทำไว้ก่อนหน้านี้'}</p>
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-5xl font-black text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
              {percentage}%
            </div>
          </div>
      <div className="relative z-10 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-purple-50 p-3 text-purple-700">
          <span className="block text-xs text-purple-400">ทำไปแล้ว</span>
          <span className="font-bold">{answeredCount}/{questions.length} ข้อ</span>
        </div>
        <div className="rounded-xl bg-green-50 p-3 text-green-700">
          <span className="block text-xs text-green-400">ตอบถูก</span>
          <span className="font-bold">{quizState.score} ข้อ</span>
        </div>
      </div>
      <p className="relative z-10 text-sm text-gray-600">
        {!isCompleted
          ? `${playerName} สามารถกลับมาทำต่อจากจุดเดิมได้`
          : passed
          ? `${playerName} เก่งมาก! พร้อมไปสอบจริงแล้ว~ ✨`
          : `${playerName} อย่าท้อใจนะ ลองทบทวนแล้วมาใหม่! 💪`}
      </p>
      <div className="relative z-10 flex gap-3 pt-2">
        {!isCompleted && (
          <button
            type="button"
            onClick={onResume}
            className="flex-1 cursor-pointer rounded-xl border-2 border-purple-200 bg-white py-3 font-bold text-purple-600 transition-all hover:border-purple-400 active:scale-95"
          >
            ทำต่อ
          </button>
        )}
        <button
          type="button"
          onClick={restartGame}
          className="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 font-bold text-white shadow-lg transition-all hover:shadow-pink-500/30 active:scale-95"
        >
          เล่นอีกครั้ง 🚀
        </button>
      </div>
        </div>
      </div>
    </main>
  );
}
