import { describe, expect, it } from "vitest";

import {
  addRankToLeaderboardEntry,
  buildCurrentAttemptEntry,
  buildCurrentAttemptSummary,
  filterLeaderboardEntries,
  getBestAttemptsPerPlayer,
  getPlayerRank,
  sortLeaderboard,
} from "@/features/leaderboard/leaderboard.logic";
import type { LeaderboardEntry } from "@/features/leaderboard/leaderboard.types";
import type { QuizAttemptRecord } from "@/features/quiz/quiz-attempt.types";

const entry = (overrides: Partial<LeaderboardEntry>): LeaderboardEntry => ({
  playerId: "player",
  playerName: "PLAYER",
  mode: "university",
  answeredCount: 1,
  questionCount: 1,
  correctCount: 1,
  accuracy: 100,
  attemptStatus: "completed",
  completedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("leaderboard logic", () => {
  it("excludes attempts with no answered questions", () => {
    const filtered = filterLeaderboardEntries([
      entry({
        playerId: "empty",
        answeredCount: 0,
        correctCount: 0,
        accuracy: 0,
      }),
      entry({ playerId: "started", answeredCount: 1 }),
    ]);

    expect(filtered.map((item) => item.playerId)).toEqual(["started"]);
  });

  it("puts completed attempts before abandoned attempts", () => {
    const sorted = sortLeaderboard([
      entry({
        playerId: "abandoned",
        attemptStatus: "abandoned",
        answeredCount: 100,
      }),
      entry({ playerId: "completed", answeredCount: 1 }),
    ]);

    expect(sorted.map((item) => item.playerId)).toEqual([
      "completed",
      "abandoned",
    ]);
  });

  it("sorts completed attempts by answered count, accuracy, correct count, then time", () => {
    const sorted = sortLeaderboard([
      entry({ playerId: "accuracy", answeredCount: 5, accuracy: 100 }),
      entry({ playerId: "volume", answeredCount: 10, accuracy: 50 }),
      entry({
        playerId: "correct",
        answeredCount: 10,
        accuracy: 50,
        correctCount: 6,
      }),
      entry({
        playerId: "time",
        answeredCount: 10,
        accuracy: 50,
        correctCount: 5,
        completedAt: "2026-01-02T00:00:00.000Z",
      }),
    ]);

    expect(sorted.map((item) => item.playerId)).toEqual([
      "correct",
      "time",
      "volume",
      "accuracy",
    ]);
  });

  it("adds MMR and derives the matching Rank", () => {
    const ranked = addRankToLeaderboardEntry(entry({}), 960);

    expect(ranked.mmr).toBe(960);
    expect(ranked.rank).toMatchObject({ name: "Archon", stars: 2 });
  });

  it("builds a current attempt summary without changing source data", () => {
    expect(
      buildCurrentAttemptSummary({
        attemptId: "attempt-001",
        mode: "secondary",
        questionCount: 12,
        attemptStatus: "abandoned",
      }),
    ).toEqual({
      attemptId: "attempt-001",
      mode: "secondary",
      questionCount: 12,
      attemptStatus: "abandoned",
    });
  });

  it("builds a public entry only for answered non-active attempts", () => {
    const baseAttempt: QuizAttemptRecord = {
      id: "attempt-002",
      playerId: "player-002",
      playerName: "PLAYER",
      setup: { mode: "university", questionLimit: 2 },
      questionIds: ["question-001", "question-002"],
      state: {
        currentQIndex: 1,
        score: 1,
        streak: 1,
        mood: "correct",
        answeredMap: { "0": "option-a" },
        summaryVisible: true,
        attemptStatus: "completed",
      },
      startedAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:01:00.000Z",
      completedAt: "2026-01-01T00:01:00.000Z",
    };

    expect(buildCurrentAttemptEntry(baseAttempt)).toMatchObject({
      attemptId: "attempt-002",
      answeredCount: 1,
      questionCount: 2,
      correctCount: 1,
      accuracy: 100,
      attemptStatus: "completed",
    });
    expect(
      buildCurrentAttemptEntry({
        ...baseAttempt,
        state: { ...baseAttempt.state, attemptStatus: "active" },
      }),
    ).toBeNull();
    expect(
      buildCurrentAttemptEntry({
        ...baseAttempt,
        state: {
          ...baseAttempt.state,
          answeredMap: {},
          score: 0,
          attemptStatus: "abandoned",
        },
      }),
    ).toBeNull();
  });

  it("keeps only the best attempt per player and mode", () => {
    const best = getBestAttemptsPerPlayer([
      entry({
        attemptId: "short",
        playerId: "same",
        answeredCount: 10,
        questionCount: 10,
        accuracy: 100,
      }),
      entry({
        attemptId: "long",
        playerId: "same",
        answeredCount: 30,
        questionCount: 30,
        accuracy: 95,
      }),
      entry({
        attemptId: "other-mode",
        playerId: "same",
        mode: "secondary",
        answeredCount: 1,
      }),
    ]);

    expect(best.map((item) => item.attemptId)).toEqual(["long", "other-mode"]);
  });

  it("prefers completed attempts over abandoned attempts for the same player and mode", () => {
    const best = getBestAttemptsPerPlayer([
      entry({
        attemptId: "abandoned",
        attemptStatus: "abandoned",
        answeredCount: 30,
      }),
      entry({ attemptId: "completed", answeredCount: 1 }),
    ]);

    expect(best.map((item) => item.attemptId)).toEqual(["completed"]);
  });

  it("uses accuracy and correct count as tie-breakers", () => {
    const best = getBestAttemptsPerPlayer([
      entry({
        attemptId: "accuracy-low",
        answeredCount: 10,
        accuracy: 80,
        correctCount: 8,
      }),
      entry({
        attemptId: "accuracy-high",
        answeredCount: 10,
        accuracy: 90,
        correctCount: 9,
      }),
    ]);

    expect(best.map((item) => item.attemptId)).toEqual(["accuracy-high"]);
  });

  it("returns a one-based rank for a player", () => {
    const entries = [
      entry({ playerId: "first", answeredCount: 10 }),
      entry({ playerId: "second", answeredCount: 5 }),
    ];

    expect(getPlayerRank(entries, "second")).toBe(2);
    expect(getPlayerRank(entries, "missing")).toBeNull();
  });
});
