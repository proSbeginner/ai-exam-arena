import { MockApiError } from '@/mock-api/mock-api.config';
import { DataSourceConfigError } from '@/server/providers/data-source';
import { getPlayerProvider } from '@/server/providers/player.provider';

export async function POST(request: Request) {
  const body = (await request.json()) as { playerName?: unknown };

  if (typeof body.playerName !== 'string') {
    return Response.json(
      { error: { code: 'INVALID_PLAYER_NAME', message: 'A player name is required.' } },
      { status: 400 },
    );
  }

  try {
    const player = await getPlayerProvider().createPlayer(body.playerName);
    return Response.json({ player }, { status: 201 });
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
