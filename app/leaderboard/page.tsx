'use client';

import { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';

import { getStoredPlayerId, getStoredPlayerName, subscribeToPlayerName } from '@/features/welcome/welcome.hook';
import { getStoredQuizSetup, saveQuizSetup, subscribeToQuizSetup } from '@/features/quiz/quiz-setup.hook';
import { getQuizAttempt } from '@/features/quiz/services/quiz-attempt.api';
import { saveQuizReviewAttemptId } from '@/features/quiz/quiz-progress.storage';
import { restartQuizAttempt } from '@/features/quiz/quiz-restart';
import { APP_ROUTES } from '@/features/shared/routes';
import type { QuizMode } from '@/features/quiz/quiz.types';
import { getPlayerRank } from '@/features/leaderboard/leaderboard.logic';
import { resolveContinuePlayerQuiz } from '@/features/leaderboard/continue-player-quiz.logic';
import { useLeaderboard } from '@/features/leaderboard/leaderboard.hook';
import { Leaderboard } from '@/features/leaderboard/components/leaderboard';
import { LeaderboardSkeleton } from '@/features/leaderboard/components/leaderboard-skeleton';

export default function LeaderboardPage() {
  const router = useRouter();
  const [modeOverride, setModeOverride] = useState<QuizMode | null>(null);
  const storedQuizSetup = useSyncExternalStore(subscribeToQuizSetup, getStoredQuizSetup, () => null);
  const mode = modeOverride ?? storedQuizSetup?.mode ?? 'university';
  const playerId = useSyncExternalStore(subscribeToPlayerName, getStoredPlayerId, () => null);
  const playerName = useSyncExternalStore(subscribeToPlayerName, getStoredPlayerName, () => null);
  const leaderboard = useLeaderboard(mode, playerId);
  const [showRestartConfirmation, setShowRestartConfirmation] = useState(false);
  const currentPlayerEntry = playerId
    ? leaderboard.entries.find((entry) => entry.playerId === playerId)
    : undefined;
  const currentMmrRank = currentPlayerEntry?.rank ?? null;
  const playerRank = playerId ? getPlayerRank(leaderboard.entries, playerId) : null;

  const continuePlayerQuiz = async () => {
    const action = await resolveContinuePlayerQuiz({
      playerId,
      mode,
      currentAttempt: leaderboard.currentAttempt,
      getQuizAttempt,
    });
    if (!action) return;

    saveQuizSetup(action.setup);
    if (action.type === 'open-quiz' && action.reviewAttemptId) saveQuizReviewAttemptId(action.reviewAttemptId);
    router.push(action.route);
  };

  const restartPlayerQuiz = async () => {
    if (!leaderboard.currentAttempt) return;

    await restartQuizAttempt({
      attemptId: leaderboard.currentAttempt.attemptId,
      mode: leaderboard.currentAttempt.mode || mode,
      questionCount: null,
      navigate: router.push,
    });
    setShowRestartConfirmation(false);
  };

  if (leaderboard.isLoading) return <LeaderboardSkeleton />;

  return (
    <Leaderboard
      mode={mode}
      entries={leaderboard.entries}
      currentAttempt={leaderboard.currentAttempt}
      error={leaderboard.error}
      playerId={playerId}
      playerName={playerName ?? ''}
      playerRank={playerRank}
      currentMmrRank={currentMmrRank}
      showRestartConfirmation={showRestartConfirmation}
      onModeChange={setModeOverride}
      onSelectPlayer={() => router.push(APP_ROUTES.welcome)}
      onContinue={() => void continuePlayerQuiz()}
      onRestart={() => setShowRestartConfirmation(true)}
      onCancelRestart={() => setShowRestartConfirmation(false)}
      onConfirmRestart={() => void restartPlayerQuiz()}
    />
  );
}
