import { getDataSource } from './data-source';
import { mockPlayerProvider } from '@/server/providers/mock-player.provider';
import { supabasePlayerProvider } from '@/server/providers/supabase-player.provider';

export interface Player {
  id: string;
  playerName: string;
}

export interface PlayerProvider {
  hasPlayer(playerName: string): Promise<boolean>;
  createPlayer(playerName: string, pin: string): Promise<Player>;
  authenticatePlayer(playerName: string, pin: string): Promise<Player>;
}

export function getPlayerProvider(): PlayerProvider {
  return getDataSource() === 'mock' ? mockPlayerProvider : supabasePlayerProvider;
}
