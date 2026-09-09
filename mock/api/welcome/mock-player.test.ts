import { describe, expect, it } from "vitest";

import { authenticateMockPlayer } from "@/mock/api/welcome/mock-player";
import { createPlayerByScenario } from "@/server/providers/mock-player.provider";

describe("mock welcome API scenarios", () => {
  it("creates a player in the happy path", async () => {
    await expect(createPlayerByScenario("success", "WELCOME_PLAYER", "123456")).resolves.toMatchObject({ id: expect.any(String), playerName: "WELCOME_PLAYER" });
  });

  it("simulates a player name already in use", async () => {
    await createPlayerByScenario("success", "DUPLICATE_PLAYER", "123456");
    await expect(createPlayerByScenario("player-name-taken", "DUPLICATE_PLAYER", "123456")).rejects.toMatchObject({ code: "PLAYER_NAME_TAKEN", status: 409 });
  });

  it("locks a player after 20 failed PIN attempts", async () => {
    const playerName = "LOCK_TEST_PLAYER";
    await createPlayerByScenario("success", playerName, "123456");
    for (let attempt = 1; attempt < 20; attempt += 1) {
      await expect(authenticateMockPlayer(playerName, "654321")).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
    }
    await expect(authenticateMockPlayer(playerName, "654321")).rejects.toMatchObject({ code: "PLAYER_LOCKED", status: 423 });
    await expect(authenticateMockPlayer(playerName, "123456")).rejects.toMatchObject({ code: "PLAYER_LOCKED", status: 423 });
  });
});
