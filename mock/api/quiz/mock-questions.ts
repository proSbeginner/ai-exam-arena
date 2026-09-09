import { questions } from './questions.mock';

import {
  getMockScenario,
  simulateMockNetworkDelay,
  throwIfMockServiceUnavailable,
} from '../config';

export async function getMockQuizQuestions() {
  await simulateMockNetworkDelay();
  throwIfMockServiceUnavailable();

  return getMockScenario() === 'empty-questions' ? [] : questions;
}
