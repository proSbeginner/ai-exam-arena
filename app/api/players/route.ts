import { MockApiError } from '@/mock-api/mock-api.config';
import { createMockPlayer } from '@/mock-api/welcome/mock-player';

export async function POST(request: Request) {
  const body = (await request.json()) as { playerName?: unknown };

  if (typeof body.playerName !== 'string') {
    return Response.json(
      { error: { code: 'INVALID_PLAYER_NAME', message: 'A player name is required.' } },
      { status: 400 },
    );
  }

  try {
    const player = await createMockPlayer(body.playerName);
    return Response.json({ player }, { status: 201 });
  } catch (error) {
    if (error instanceof MockApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    return Response.json(
      { error: { code: 'UNKNOWN_ERROR', message: 'The mock service failed unexpectedly.' } },
      { status: 500 },
    );
  }
}
