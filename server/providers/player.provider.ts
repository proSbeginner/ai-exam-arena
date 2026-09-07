import { authenticateMockPlayer, createMockPlayer, hasMockPlayer } from '@/mock-api/welcome/mock-player';

import { DataSourceConfigError, getDataSource } from './data-source';

export interface Player {
  id: string;
  playerName: string;
}

export interface PlayerProvider {
  hasPlayer(playerName: string): Promise<boolean>;
  createPlayer(playerName: string, pin: string): Promise<Player>;
  authenticatePlayer(playerName: string, pin: string): Promise<Player>;
}

async function createSupabasePlayer(): Promise<Player> {
  throw new DataSourceConfigError(
    'The Supabase player provider is not configured yet.',
    'SUPABASE_PROVIDER_NOT_READY',
  );
}

async function hasSupabasePlayer(): Promise<boolean> {
  throw new DataSourceConfigError(
    'The Supabase player provider is not configured yet.',
    'SUPABASE_PROVIDER_NOT_READY',
  );
}

async function authenticateSupabasePlayer(): Promise<Player> {
  throw new DataSourceConfigError(
    'The Supabase player provider is not configured yet.',
    'SUPABASE_PROVIDER_NOT_READY',
  );
}

export function getPlayerProvider(): PlayerProvider {
  return getDataSource() === 'mock'
    ? { hasPlayer: hasMockPlayer, createPlayer: createMockPlayer, authenticatePlayer: authenticateMockPlayer }
    : { hasPlayer: hasSupabasePlayer, createPlayer: createSupabasePlayer, authenticatePlayer: authenticateSupabasePlayer };
}
