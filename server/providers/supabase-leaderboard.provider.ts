import type { QuizMode } from "@/features/quiz/quiz.types";
import type {
  CurrentAttemptSummary,
  LeaderboardData,
} from "@/features/leaderboard/leaderboard.types";
import {
  addRankToLeaderboardEntry,
  buildCurrentAttemptSummary,
  filterLeaderboardEntries,
  getBestAttemptsPerPlayer,
  sortLeaderboard,
} from "@/features/leaderboard/leaderboard.logic";
import type {
  DatabaseAttemptRow,
  DatabaseLeaderboardAttemptRow,
} from "@/server/database/types";
import { transformLeaderboardAttempt } from "@/server/database/transformers/leaderboard.transform";
import { getRatingProvider } from "@/server/providers/rating.provider";
import type { LeaderboardProvider } from "@/server/providers/leaderboard.provider";
import { supabaseQuery, supabaseRequest } from "@/supabase/client";

async function getSupabaseLeaderboard(
  mode: QuizMode,
  playerId?: string,
): Promise<LeaderboardData> {
  // 1. Load public attempts and the current player's latest attempt separately.
  const query = supabaseQuery({
    select:
      "id,player_id,attempt_status,question_ids,completed_at,updated_at,state,players(player_name)",
    mode: `eq.${mode}`,
    attempt_status: "in.(completed,abandoned)",
  });
  const currentQuery = playerId
    ? supabaseQuery({
        select:
          "id,player_id,mode,attempt_status,question_ids,completed_at,updated_at,state,players(player_name)",
        player_id: `eq.${playerId}`,
        mode: `eq.${mode}`,
        order: "updated_at.desc",
        limit: "1",
      })
    : null;

  const [attempts, currentRows] = await Promise.all([
    supabaseRequest<DatabaseLeaderboardAttemptRow[]>(`quiz_attempts?${query}`),
    currentQuery
      ? supabaseRequest<
          Array<
            DatabaseAttemptRow & { players: { player_name: string } | null }
          >
        >(`quiz_attempts?${currentQuery}`)
      : Promise.resolve([]),
  ]);

  // 2. Transform database rows and enrich each public entry with its MMR/Rank.
  const entries = attempts.map(transformLeaderboardAttempt);
  const rankedEntries = await Promise.all(
    entries.map(async (entry) =>
      addRankToLeaderboardEntry(
        entry,
        (await getRatingProvider().getRating(entry.playerId, mode)).mmr,
      ),
    ),
  );

  // 3. Build the current-attempt summary for resume/review actions.
  const currentRow = currentRows[0];
  const currentAttempt: CurrentAttemptSummary | null = currentRow
    ? buildCurrentAttemptSummary({
        attemptId: currentRow.id,
        mode: currentRow.mode,
        questionCount: currentRow.question_ids.length,
        attemptStatus: currentRow.attempt_status,
      })
    : null;

  // 4. Keep the best attempt per player and mode, then sort for display.
  const bestEntries = getBestAttemptsPerPlayer(
    filterLeaderboardEntries(rankedEntries),
  );

  return {
    entries: sortLeaderboard(bestEntries),
    currentAttempt,
  };
}

export const supabaseLeaderboardProvider: LeaderboardProvider = {
  getLeaderboard: getSupabaseLeaderboard,
};
