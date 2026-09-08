'use client';

import { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';

import { getStoredPlayerId, subscribeToPlayerName } from '@/features/welcome/welcome.hook';
import { QUIZ_MODE_OPTIONS } from '@/features/quiz/quiz.constants';
import { getStoredQuizSetup, saveQuizSetup, subscribeToQuizSetup } from '@/features/quiz/quiz-setup.hook';
import { saveQuizReviewAttemptId } from '@/features/quiz/quiz-progress.storage';
import { getQuizAttempt } from '@/features/quiz/services/quiz-attempt.api';
import { restartQuizAttempt } from '@/features/quiz/quiz-restart';
import { ConfirmationDialog } from '@/features/shared/components/confirmation-dialog';
import type { QuizMode } from '@/features/quiz/quiz.types';
import { APP_ROUTES } from '@/features/shared/routes';

import { getPlayerRank } from '../leaderboard.logic';
import { RankEmblemTooltip } from '@/features/shared/components/rank-emblem-tooltip';

import { useLeaderboard } from '../leaderboard.hook';
import { LEADERBOARD_ATTEMPT_STATUS } from '../leaderboard.constants';
import { resolveContinuePlayerQuiz } from '../continue-player-quiz.logic';

export function Leaderboard() {
  const router = useRouter();
  const [modeOverride, setModeOverride] = useState<QuizMode | null>(null);
  const storedQuizSetup = useSyncExternalStore(subscribeToQuizSetup, getStoredQuizSetup, () => null);
  const mode = modeOverride ?? storedQuizSetup?.mode ?? 'university';
  const playerId = useSyncExternalStore(subscribeToPlayerName, getStoredPlayerId, () => null);
  const { entries, error, isLoading } = useLeaderboard(mode, playerId);
  const leaderboardVersion = entries
    .map((entry, index) => `${index}:${entry.playerId}:${entry.completedAt}:${entry.answeredCount}:${entry.correctCount}`)
    .join('|') || 'empty';
  const playerRank = playerId ? getPlayerRank(entries, playerId) : null;
  const currentPlayerEntry = playerId ? entries.find((entry) => entry.playerId === playerId) : undefined;
  const [showRestartConfirmation, setShowRestartConfirmation] = useState(false);

  const continuePlayerQuiz = async () => {
    const action = await resolveContinuePlayerQuiz({ playerId, mode, currentPlayerEntry, getQuizAttempt });
    if (!action) return;

    saveQuizSetup(action.setup);
    if (action.type === 'open-quiz' && action.reviewAttemptId) saveQuizReviewAttemptId(action.reviewAttemptId);
    router.push(action.route);
  };

  const restartPlayerQuiz = async () => {
    if (!currentPlayerEntry) return;

    await restartQuizAttempt({
      attemptId: currentPlayerEntry.attemptId,
      mode: currentPlayerEntry.mode || mode,
      questionCount: null,
      navigate: router.push,
    });
    setShowRestartConfirmation(false);
  };

  const returnToWelcome = () => {
    router.push(APP_ROUTES.welcome);
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-pink-400 via-fuchsia-400 to-purple-600 bg-[length:200%_200%] p-4 font-sans sm:p-8 animate-leaderboard-background"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="leaderboard-spotlight animate-leaderboard-spotlight absolute inset-[-50%]" />
      </div>
      <section className="relative z-10 mx-auto w-full max-w-3xl rounded-3xl bg-white/90 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-purple-500">Hall of Fame</p>
          <h1 className="mt-1 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-3xl font-black tracking-tight text-transparent">
            Leaderboard
          </h1>
          <p className="mt-2 text-sm text-gray-500">จัดอันดับผู้เล่นแยกตามโหมด</p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {QUIZ_MODE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setModeOverride(option.value)}
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
          <div className="grid grid-cols-[3rem_1fr_7rem_5rem_5rem] gap-2 bg-purple-50 px-4 py-3 text-xs font-bold text-purple-500 sm:grid-cols-[4rem_1fr_9rem_7rem_7rem]">
            <span>Rank</span>
            <span>Player</span>
            <span>Tier</span>
            <span className="text-right">Answered</span>
            <span className="text-right">Score</span>
          </div>

          {isLoading && <p className="px-4 py-10 text-center text-sm text-gray-400">กำลังโหลดอันดับ...</p>}
          {!isLoading && error && <p className="px-4 py-10 text-center text-sm text-red-500">{error}</p>}
          {!isLoading && !error && entries.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-gray-400">ยังไม่มีข้อมูลการจัดอันดับในโหมดนี้</p>
          )}
          <div className="max-h-[35rem] overflow-y-auto">
            {!isLoading && !error && entries.map((entry, index) => (
              <div
                key={`${entry.playerId}-${entry.completedAt}-${leaderboardVersion}`}
                className={`grid grid-cols-[3rem_1fr_7rem_5rem_5rem] gap-2 border-t border-purple-50 bg-white px-4 py-4 text-sm sm:grid-cols-[4rem_1fr_9rem_7rem_7rem] ${entry.playerId === playerId ? 'animate-leaderboard-current-row-flash' : ''}`}
              >
                <span className="font-black text-gray-400">{index + 1}</span>
                <span className={`min-w-0 truncate font-bold ${entry.playerId === playerId ? 'bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent font-black' : 'text-gray-700'}`}>
                  {entry.playerName}
                  {entry.attemptStatus === 'abandoned' && <span className="ml-2 text-xs font-medium text-gray-400">(ยังไม่จบ)</span>}
                </span>
                <RankEmblemTooltip compact rank={entry.rank ?? { name: 'Herald', mmr: 0, stars: 1 }} />
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
                onClick={() => void continuePlayerQuiz()}
                className="flex-1 cursor-pointer rounded-xl border-2 border-purple-200 bg-white px-4 py-2.5 text-sm font-bold text-purple-600 transition-all hover:border-purple-400 active:scale-95"
              >
                {currentPlayerEntry
                  ? currentPlayerEntry.attemptStatus === LEADERBOARD_ATTEMPT_STATUS.COMPLETED
                    ? 'ทวนคำตอบ'
                    : 'ทำต่อ'
                  : 'ลงสนาม'}
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
        <ConfirmationDialog
          title="เล่นอีกครั้งหรือไม่ ?"
          message="ความคืบหน้าของชุดปัจจุบันจะถูกทิ้ง และระบบจะสุ่มคำถามชุดใหม่ให้"
          onCancel={() => setShowRestartConfirmation(false)}
          onConfirm={() => void restartPlayerQuiz()}
        />
      )}
    </main>
  );
}
