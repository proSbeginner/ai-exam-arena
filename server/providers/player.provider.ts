import { createMockPlayer } from '@/mock-api/welcome/mock-player';

import { DataSourceConfigError, getDataSource } from './data-source';

export interface Player {
  id: string;
  playerName: string;
}

export interface PlayerProvider {
  createPlayer(playerName: string): Promise<Player>;
}

async function createSupabasePlayer(): Promise<Player> {
  throw new DataSourceConfigError(
    'The Supabase player provider is not configured yet.',
    'SUPABASE_PROVIDER_NOT_READY',
  );
}

export function getPlayerProvider(): PlayerProvider {
  return getDataSource() === 'mock'
    ? { createPlayer: createMockPlayer }
    : { createPlayer: createSupabasePlayer };
}
