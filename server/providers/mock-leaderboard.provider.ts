import type { LeaderboardData } from "@/features/leaderboard/leaderboard.types";
import type { QuizMode } from "@/features/quiz/quiz.types";
import { ApiError } from "@/server/errors/api-error";
import { getMockLeaderboard, repeatPlayerEntries } from "@/mock/api/leaderboard/mock-leaderboard";
import type { LeaderboardProvider } from "@/server/providers/leaderboard.provider";

export type MockScenario =
  | "success"
  | "repeat-player"
  | "empty"
  | "unavailable"
  | "unknown-error";

export const MOCK_SCENARIO: MockScenario = "success";
export const MOCK_DELAY_MS = 500;

const emptyLeaderboard: LeaderboardData = { entries: [], currentAttempt: null };

export async function getLeaderboardByScenario(
  scenario: MockScenario,
  mode: QuizMode,
  playerId?: string,
): Promise<LeaderboardData> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  switch (scenario) {
    case "success":
      return getMockLeaderboard(mode, playerId);

    case "repeat-player":
      return getMockLeaderboard(mode, playerId, repeatPlayerEntries);

    case "empty":
      return emptyLeaderboard;

    case "unavailable":
      throw new ApiError(
        "The mock leaderboard service is unavailable.",
        503,
        "LEADERBOARD_UNAVAILABLE",
      );

    case "unknown-error":
      throw new Error("The mock leaderboard failed unexpectedly.");
  }
}

export const mockLeaderboardProvider: LeaderboardProvider = {
  getLeaderboard: (mode, playerId) =>
    getLeaderboardByScenario(MOCK_SCENARIO, mode, playerId),
};
