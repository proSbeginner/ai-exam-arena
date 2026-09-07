import type { PlayerProfile } from '../welcome.types';

interface PlayerResponse { player: PlayerProfile }

interface PlayerExistsResponse { exists: boolean }

interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
}

export class WelcomeApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
  }
}

export async function checkPlayerName(playerName: string): Promise<boolean> {
  const response = await fetch(`/api/players?playerName=${encodeURIComponent(playerName)}`, { cache: 'no-store' });
  if (!response.ok) throw new WelcomeApiError('ไม่สามารถตรวจสอบชื่อผู้เล่นได้ในขณะนี้', 'UNKNOWN_ERROR');
  const payload = (await response.json()) as PlayerExistsResponse;
  return payload.exists;
}

export async function registerPlayer(playerName: string, pin: string): Promise<PlayerResponse> {
  const response = await fetch('/api/players', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName, pin }),
  });

  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorResponse;
    throw new WelcomeApiError(
      payload.error?.message ?? 'ไม่สามารถสร้างผู้เล่นได้ในขณะนี้',
      payload.error?.code ?? 'UNKNOWN_ERROR',
    );
  }

  return response.json() as Promise<PlayerResponse>;
}

export async function authenticatePlayer(playerName: string, pin: string): Promise<PlayerResponse> {
  const response = await fetch('/api/players/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName, pin }),
  });

  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorResponse;
    throw new WelcomeApiError(
      payload.error?.message ?? 'ไม่สามารถเข้าสู่ระบบได้ในขณะนี้',
      payload.error?.code ?? 'UNKNOWN_ERROR',
    );
  }

  return response.json() as Promise<PlayerResponse>;
}
