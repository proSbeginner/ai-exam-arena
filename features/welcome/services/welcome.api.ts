interface PlayerRegistrationResponse {
  player: {
    id: string;
    playerName: string;
  };
}

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

export async function registerPlayer(playerName: string): Promise<PlayerRegistrationResponse> {
  const response = await fetch('/api/players', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName }),
  });

  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorResponse;
    throw new WelcomeApiError(
      payload.error?.message ?? 'ไม่สามารถสร้างผู้เล่นได้ในขณะนี้',
      payload.error?.code ?? 'UNKNOWN_ERROR',
    );
  }

  return response.json() as Promise<PlayerRegistrationResponse>;
}
