'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { MOOD_IMAGES } from '../quiz.assets';
import { ATTEMPT_STATUS } from '../quiz.constants';
import { hasPassedQuiz } from '../quiz.logic';
import type { ExamQuestion, QuizState } from '../quiz.types';
import { QuizHeader } from './quiz-header';
import { QuizRestartDialog } from '@/features/shared/components/quiz-restart-dialog';
import { QuizResultSummary } from './quiz-result-summary';
import { APP_ROUTES } from '@/features/shared/routes';

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
  const [showRestartConfirmation, setShowRestartConfirmation] = useState(false);
  const isCompleted = quizState.gameOver || quizState.attemptStatus === ATTEMPT_STATUS.COMPLETED;
  const passed = isCompleted && hasPassedQuiz(quizState.score, questions.length);
  const percentage = questions.length > 0 ? Math.round((quizState.score / questions.length) * 100) : 0;
  return (
    <main
      data-testid="quiz-result"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 font-sans"
    >
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
          <QuizResultSummary
            answeredCount={answeredCount}
            isCompleted={isCompleted}
            passed={passed}
            percentage={percentage}
            playerName={playerName}
            questionCount={questions.length}
            score={quizState.score}
          />
      <div className="relative z-10 flex gap-3 pt-2">
        <button
          type="button"
          onClick={onResume}
          className="flex-1 cursor-pointer rounded-xl border-2 border-purple-200 bg-white py-3 font-bold text-purple-600 transition-all hover:border-purple-400 active:scale-95"
        >
          {isCompleted ? 'ทวนคำตอบ' : 'ทำต่อ'}
        </button>
        <button
          type="button"
          onClick={() => setShowRestartConfirmation(true)}
          className="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 font-bold text-white shadow-lg transition-all hover:shadow-pink-500/30 active:scale-95"
        >
          เล่นอีกครั้ง 🚀
        </button>
      </div>
        </div>
      </div>
      <Link
        href={APP_ROUTES.leaderboard}
        className="relative z-10 mt-4 cursor-pointer text-sm font-bold text-purple-500 underline decoration-purple-200 underline-offset-4 transition-colors hover:text-pink-500"
      >
        ดูอันดับการแข่งขัน 🏆
      </Link>
      {showRestartConfirmation && (
        <QuizRestartDialog
          onCancel={() => setShowRestartConfirmation(false)}
          onConfirm={() => {
            setShowRestartConfirmation(false);
            restartGame();
          }}
        />
      )}
    </main>
  );
}
