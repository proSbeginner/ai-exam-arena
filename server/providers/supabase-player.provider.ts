import { MockApiError } from '@/mock-api/mock-api.config';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { DatabasePlayerRow } from '@/server/database/types';
import { transformPlayer } from '@/server/database/transformers/player.transform';
import type { Player, PlayerProvider } from '@/server/providers/player.provider';
import { supabaseQuery, supabaseRequest } from '@/supabase/client';

function normalizePlayerName(playerName: string): string {
  return playerName.trim().toUpperCase();
}

function validatePin(pin: string): void {
  if (!/^\d{6}$/.test(pin)) {
    throw new MockApiError('The PIN must contain exactly 6 digits.', 400, 'INVALID_PIN');
  }
}

function hashPin(pin: string): string {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(pin, salt, 64).toString('hex')}`;
}

function verifyPin(pin: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(pin, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function findSupabasePlayer(playerName: string): Promise<DatabasePlayerRow | null> {
  const query = supabaseQuery({
    select: 'id,player_name,pin_hash,failed_pin_attempts,locked_at',
    player_name: `eq.${normalizePlayerName(playerName)}`,
    limit: '1',
  });
  const players = await supabaseRequest<DatabasePlayerRow[]>(`players?${query}`);
  return players[0] ?? null;
}

async function createSupabasePlayer(playerName: string, pin: string): Promise<Player> {
  validatePin(pin);
  const normalizedPlayerName = normalizePlayerName(playerName);
  const existing = await findSupabasePlayer(normalizedPlayerName);
  if (existing) throw new MockApiError('This player name is already in use.', 409, 'PLAYER_NAME_TAKEN');

  const players = await supabaseRequest<DatabasePlayerRow[]>('players', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ player_name: normalizedPlayerName, pin_hash: hashPin(pin) }),
  });
  return transformPlayer(players[0]);
}

async function hasSupabasePlayer(playerName: string): Promise<boolean> {
  return Boolean(await findSupabasePlayer(playerName));
}

async function authenticateSupabasePlayer(playerName: string, pin: string): Promise<Player> {
  validatePin(pin);
  const player = await findSupabasePlayer(playerName);
  if (!player || player.locked_at) {
    if (player?.locked_at) throw new MockApiError('ใส่ PIN ผิดหลายครั้ง ระบบล็อกบัญชีไว้ กรุณาติดต่อ Admin', 423, 'PLAYER_LOCKED');
    throw new MockApiError('The player name or PIN is incorrect.', 401, 'INVALID_CREDENTIALS');
  }

  if (!verifyPin(pin, player.pin_hash)) {
    const failedPinAttempts = player.failed_pin_attempts + 1;
    const maxAttempts = Number(process.env.MAX_PLAYER_PIN_ATTEMPTS ?? 20);
    const locked = failedPinAttempts >= maxAttempts;
    await supabaseRequest(`players?id=eq.${player.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ failed_pin_attempts: failedPinAttempts, locked_at: locked ? new Date().toISOString() : null }),
    });
    if (locked) throw new MockApiError('ใส่ PIN ผิดหลายครั้ง ระบบล็อกบัญชีไว้ กรุณาติดต่อ Admin', 423, 'PLAYER_LOCKED');
    throw new MockApiError('The player name or PIN is incorrect.', 401, 'INVALID_CREDENTIALS');
  }

  await supabaseRequest(`players?id=eq.${player.id}`, { method: 'PATCH', body: JSON.stringify({ failed_pin_attempts: 0 }) });
  return transformPlayer(player);
}

export const supabasePlayerProvider: PlayerProvider = {
  hasPlayer: hasSupabasePlayer,
  createPlayer: createSupabasePlayer,
  authenticatePlayer: authenticateSupabasePlayer,
};
