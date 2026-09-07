import type { DatabasePlayerRow } from '@/server/database/types';

export interface PlayerModel {
  id: string;
  playerName: string;
}

export function transformPlayer(row: DatabasePlayerRow): PlayerModel {
  return { id: row.id, playerName: row.player_name };
}
