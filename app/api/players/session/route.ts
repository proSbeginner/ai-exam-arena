import { MockApiError } from '@/mock/api/config';
import { DataSourceConfigError } from '@/server/providers/data-source';
import { getPlayerProvider } from '@/server/providers/player.provider';

export async function POST(request: Request) {
  const body = (await request.json()) as { playerName?: unknown; pin?: unknown };

  if (typeof body.playerName !== 'string' || typeof body.pin !== 'string') {
    return Response.json(
      { error: { code: 'INVALID_PLAYER_INPUT', message: 'A player name and PIN are required.' } },
      { status: 400 },
    );
  }

  try {
    const player = await getPlayerProvider().authenticatePlayer(body.playerName, body.pin);
    return Response.json({ player });
  } catch (error) {
    if (error instanceof MockApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    if (error instanceof DataSourceConfigError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: 503 },
      );
    }

    return Response.json(
      { error: { code: 'UNKNOWN_ERROR', message: 'The player service failed unexpectedly.' } },
      { status: 500 },
    );
  }
}
