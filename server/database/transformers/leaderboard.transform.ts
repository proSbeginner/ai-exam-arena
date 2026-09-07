import type { LeaderboardEntry } from '@/features/leaderboard/leaderboard.types';
import type { DatabaseLeaderboardAttemptRow } from '@/server/database/types';

export function transformLeaderboardAttempt(row: DatabaseLeaderboardAttemptRow): LeaderboardEntry {
  const answeredCount = Object.keys(row.state?.answeredMap ?? {}).length;
  const correctCount = row.state?.score ?? 0;

  return {
    attemptId: row.id,
    playerId: row.player_id,
    playerName: row.players?.player_name ?? '',
    mode: row.mode,
    answeredCount,
    questionCount: row.question_ids.length,
    correctCount,
    accuracy: answeredCount > 0 ? Number(((correctCount / answeredCount) * 100).toFixed(2)) : 0,
    attemptStatus: row.attempt_status,
    completedAt: row.completed_at ?? row.updated_at,
  };
}
