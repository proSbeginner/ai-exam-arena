'use client';

import { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';

import { getStoredPlayerId, subscribeToPlayerName } from '@/features/welcome/welcome.hook';
import { QUIZ_MODE_OPTIONS } from '@/features/quiz/quiz.constants';
import { saveQuizSetup } from '@/features/quiz/quiz-setup.hook';
import {
  clearQuizProgress,
  saveQuizReviewAttemptId,
} from '@/features/quiz/quiz-progress.storage';
import { discardQuizAttempt } from '@/features/quiz/services/quiz-attempt.api';
import { QuizRestartDialog } from '@/features/shared/components/quiz-restart-dialog';
import type { QuizMode } from '@/features/quiz/quiz.types';
import { APP_ROUTES } from '@/features/shared/routes';

import { getPlayerRank } from '../leaderboard.logic';
import { useLeaderboard } from '../leaderboard.hook';
import { LEADERBOARD_ATTEMPT_STATUS } from '../leaderboard.constants';

export function Leaderboard() {
  const router = useRouter();
  const [mode, setMode] = useState<QuizMode>('university');
  const playerId = useSyncExternalStore(subscribeToPlayerName, getStoredPlayerId, () => null);
  const { entries, error, isLoading } = useLeaderboard(mode, playerId);
  const playerRank = playerId ? getPlayerRank(entries, playerId) : null;
  const currentPlayerEntry = playerId ? entries.find((entry) => entry.playerId === playerId) : undefined;
  const [showRestartConfirmation, setShowRestartConfirmation] = useState(false);

  const continuePlayerQuiz = () => {
    if (!currentPlayerEntry) {
      router.push(APP_ROUTES.quizSetup);
      return;
    }

    saveQuizSetup({
      mode: currentPlayerEntry.mode,
      questionLimit: currentPlayerEntry.questionCount,
    });
    if (currentPlayerEntry.attemptStatus === LEADERBOARD_ATTEMPT_STATUS.COMPLETED && currentPlayerEntry.attemptId) {
      saveQuizReviewAttemptId(currentPlayerEntry.attemptId);
    }
    router.push(APP_ROUTES.quiz);
  };

  const restartPlayerQuiz = async () => {
    if (!currentPlayerEntry) return;

    clearQuizProgress();
    if (currentPlayerEntry.attemptId) {
      await discardQuizAttempt(currentPlayerEntry.attemptId).catch(() => undefined);
    }
    saveQuizSetup({
      mode: currentPlayerEntry.mode,
      questionLimit: currentPlayerEntry.questionCount,
    });
    setShowRestartConfirmation(false);
    router.push(APP_ROUTES.quiz);
  };

  const returnToWelcome = () => {
    router.push(APP_ROUTES.welcome);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 font-sans sm:p-8">
      <section className="mx-auto w-full max-w-3xl rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur-sm sm:p-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-purple-500">Hall of Fame</p>
          <h1 className="mt-1 text-3xl font-black text-gray-800">Leaderboard</h1>
          <p className="mt-2 text-sm text-gray-500">จัดอันดับผู้เล่นแยกตามโหมด</p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {QUIZ_MODE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMode(option.value)}
              className={`cursor-pointer rounded-xl border-2 px-3 py-2 text-sm font-bold transition-colors ${
                mode === option.value
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-100 bg-white text-gray-500 hover:border-purple-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {playerRank && (
          <p className="mt-5 rounded-xl bg-pink-50 px-4 py-3 text-center text-sm font-bold text-pink-600">
            อันดับของคุณในโหมดนี้คือ #{playerRank}
          </p>
        )}

        <div className="mt-5 overflow-hidden rounded-2xl border border-purple-100">
          <div className="grid grid-cols-[3rem_1fr_5rem_5rem] gap-2 bg-purple-50 px-4 py-3 text-xs font-bold text-purple-500 sm:grid-cols-[4rem_1fr_7rem_7rem]">
            <span>#</span>
            <span>ผู้เล่น</span>
            <span className="text-right">ทำไป / ทั้งหมด</span>
            <span className="text-right">ถูก / %</span>
          </div>

          {isLoading && <p className="px-4 py-10 text-center text-sm text-gray-400">กำลังโหลดอันดับ...</p>}
          {!isLoading && error && <p className="px-4 py-10 text-center text-sm text-red-500">{error}</p>}
          {!isLoading && !error && entries.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-gray-400">ยังไม่มีข้อมูลการจัดอันดับในโหมดนี้</p>
          )}
          <div className="max-h-[35rem] overflow-y-auto">
            {!isLoading && !error && entries.map((entry, index) => (
              <div
                key={`${entry.playerId}-${entry.completedAt}`}
                className={`grid grid-cols-[3rem_1fr_5rem_5rem] gap-2 border-t border-purple-50 px-4 py-4 text-sm sm:grid-cols-[4rem_1fr_7rem_7rem] ${entry.playerId === playerId ? 'bg-pink-50' : 'bg-white'}`}
              >
                <span className="font-black text-purple-500">{index + 1}</span>
                <span className="min-w-0 truncate font-bold text-gray-700">
                  {entry.playerName}
                  {entry.attemptStatus === 'abandoned' && <span className="ml-2 text-xs font-medium text-gray-400">(ยังไม่จบ)</span>}
                </span>
                <span className="text-right text-gray-500">{entry.answeredCount}/{entry.questionCount}</span>
                <span className="text-right font-bold text-pink-500">{entry.correctCount} / {entry.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-5 flex w-full max-w-md flex-wrap justify-center gap-3">
          {playerId && (
            <>
              <button
                type="button"
                onClick={continuePlayerQuiz}
                className="flex-1 cursor-pointer rounded-xl border-2 border-purple-200 bg-white px-4 py-2.5 text-sm font-bold text-purple-600 transition-all hover:border-purple-400 active:scale-95"
              >
                ทำต่อ
              </button>
              {currentPlayerEntry && (
                <button
                  type="button"
                  onClick={() => setShowRestartConfirmation(true)}
                  className="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-pink-500/30 active:scale-95"
                >
                  เล่นอีกครั้ง
                </button>
              )}
            </>
          )}
          {!playerId && (
            <button
              type="button"
              onClick={returnToWelcome}
              className="flex-1 cursor-pointer rounded-xl border-2 border-purple-200 bg-white px-4 py-2.5 text-sm font-bold text-purple-600 transition-colors hover:border-purple-400"
            >
              กลับหน้า Welcome
            </button>
          )}
        </div>
      </section>
      {showRestartConfirmation && (
        <QuizRestartDialog
          onCancel={() => setShowRestartConfirmation(false)}
          onConfirm={() => void restartPlayerQuiz()}
        />
      )}
    </main>
  );
}
