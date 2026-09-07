import {
  getMockScenario,
  MockApiError,
  simulateMockNetworkDelay,
  throwIfMockServiceUnavailable,
} from '../mock-api.config';
import { recordFailedPinAttempt } from '@/features/welcome/welcome.logic';

interface MockPlayer {
  id: string;
  playerName: string;
  pin: string;
  failedPinAttempts: number;
  locked: boolean;
}

const players = new Map<string, MockPlayer>();

function normalizePlayerName(playerName: string): string {
  return playerName.trim().toUpperCase();
}

function createPlayerId(): string {
  return `mock-player-${crypto.randomUUID()}`;
}

function toPlayerProfile(player: MockPlayer) {
  return { id: player.id, playerName: player.playerName };
}

function validatePin(pin: string): void {
  if (!/^\d{6}$/.test(pin)) {
    throw new MockApiError('The PIN must contain exactly 6 digits.', 400, 'INVALID_PIN');
  }
}

export async function createMockPlayer(playerName: string, pin: string) {
  await simulateMockNetworkDelay();
  throwIfMockServiceUnavailable();

  validatePin(pin);

  const normalizedPlayerName = normalizePlayerName(playerName);

  if (getMockScenario() === 'player-name-taken') {
    throw new MockApiError('This player name is already in use.', 409, 'PLAYER_NAME_TAKEN');
  }

  if (players.has(normalizedPlayerName)) {
    throw new MockApiError('This player name is already in use.', 409, 'PLAYER_NAME_TAKEN');
  }

  const player: MockPlayer = {
    id: createPlayerId(),
    playerName: normalizedPlayerName,
    pin,
    failedPinAttempts: 0,
    locked: false,
  };
  players.set(normalizedPlayerName, player);

  return toPlayerProfile(player);
}

export async function authenticateMockPlayer(playerName: string, pin: string) {
  await simulateMockNetworkDelay();
  throwIfMockServiceUnavailable();

  validatePin(pin);

  const player = players.get(normalizePlayerName(playerName));
  if (!player) {
    throw new MockApiError('The player name or PIN is incorrect.', 401, 'INVALID_CREDENTIALS');
  }

  if (player.locked) {
    throw new MockApiError('ใส่ PIN ผิดหลายครั้ง ระบบล็อกบัญชีไว้ กรุณาติดต่อ Admin', 423, 'PLAYER_LOCKED');
  }

  if (player.pin !== pin) {
    const pinAttemptState = recordFailedPinAttempt(player.failedPinAttempts);
    player.failedPinAttempts = pinAttemptState.failedPinAttempts;
    player.locked = pinAttemptState.locked;
    if (player.locked) {
      throw new MockApiError('ใส่ PIN ผิดหลายครั้ง ระบบล็อกบัญชีไว้ กรุณาติดต่อ Admin', 423, 'PLAYER_LOCKED');
    }

    throw new MockApiError('The player name or PIN is incorrect.', 401, 'INVALID_CREDENTIALS');
  }

  player.failedPinAttempts = 0;
  return toPlayerProfile(player);
}
