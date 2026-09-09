export type MockApiScenario =
  | 'happy'
  | 'player-name-taken'
  | 'empty-questions'
  | 'unavailable'
  | 'slow'
  | 'answer-failed';

const scenarios = new Set<MockApiScenario>([
  'happy',
  'player-name-taken',
  'empty-questions',
  'unavailable',
  'slow',
  'answer-failed',
]);

export class MockApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
  }
}

export function getMockScenario(): MockApiScenario {
  const scenario = process.env.MOCK_API_SCENARIO as MockApiScenario | undefined;
  return scenario && scenarios.has(scenario) ? scenario : 'happy';
}

export async function simulateMockNetworkDelay(): Promise<void> {
  const configuredDelay = Number(process.env.MOCK_API_DELAY_MS ?? 150);
  const delay = Number.isFinite(configuredDelay)
    ? Math.min(Math.max(configuredDelay, 0), 10_000)
    : 150;
  const effectiveDelay = getMockScenario() === 'slow' ? Math.max(delay, 1_500) : delay;

  await new Promise((resolve) => setTimeout(resolve, effectiveDelay));
}

export function throwIfMockAnswerFailed(): void {
  if (getMockScenario() === 'answer-failed') {
    throw new MockApiError('The mock answer service failed.', 503, 'ANSWER_SAVE_FAILED');
  }
}

export function throwIfMockServiceUnavailable(): void {
  if (getMockScenario() === 'unavailable') {
    throw new MockApiError('The mock service is unavailable.', 503, 'SERVICE_UNAVAILABLE');
  }
}
