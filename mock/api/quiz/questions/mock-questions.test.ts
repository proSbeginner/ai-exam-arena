import { describe, expect, it } from "vitest";

import { getQuizByScenario, type MockQuizScenario } from "@/server/providers/mock-quiz.provider";

const scenarios: MockQuizScenario[] = ["success", "empty", "unavailable", "unknown-error"];

describe("mock quiz question API scenarios", () => {
  it("returns questions in the happy path", async () => { await expect(getQuizByScenario("success")).resolves.toHaveLength(2); });
  it("supports an empty question bank", async () => { await expect(getQuizByScenario("empty")).resolves.toEqual([]); });
  it("supports every configured quiz scenario", () => { expect(scenarios).toEqual(["success", "empty", "unavailable", "unknown-error"]); });
  it("simulates an unavailable service", async () => { await expect(getQuizByScenario("unavailable")).rejects.toMatchObject({ code: "QUIZ_UNAVAILABLE", status: 503 }); });
});
