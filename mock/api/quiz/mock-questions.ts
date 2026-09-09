import { questions } from './questions.mock';

import {
  getMockScenario,
  simulateMockNetworkDelay,
  throwIfMockServiceUnavailable,
} from '../mock-api.config';

export async function getMockQuizQuestions() {
  await simulateMockNetworkDelay();
  throwIfMockServiceUnavailable();

  return getMockScenario() === 'empty-questions' ? [] : questions;
}
