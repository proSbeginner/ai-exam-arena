import { afterEach, describe, expect, it } from 'vitest';

import type { AdminQuestionInput } from '@/features/admin/admin.types';
import {
  createMockAdminQuestion,
  deleteMockAdminQuestion,
  listMockAdminQuestions,
  updateMockAdminQuestion,
} from '@/mock/api/quiz/mock-admin-questions';

const originalScenario = process.env.MOCK_API_SCENARIO;
const originalDelay = process.env.MOCK_API_DELAY_MS;
let createdQuestionId: string | undefined;

const input: AdminQuestionInput = {
  labels: ['TEST', 'ADMIN'],
  english: 'Which service stores objects?',
  thai_drama: 'เก็บของไว้ที่ไหนดีนะ?',
  options: [
    { id: 'option-a', english: 'Amazon S3', thai_drama: 'ถังเก็บของสุดฮิต' },
    { id: 'option-b', english: 'Amazon EC2', thai_drama: 'เครื่องเช่า ไม่ใช่ถัง' },
  ],
  correctOptionId: 'option-a',
  funFact: 'S3 is designed for object storage.',
  source: { name: 'AWS Documentation' },
  status: 'draft',
};

afterEach(() => {
  if (createdQuestionId) deleteMockAdminQuestion(createdQuestionId);
  createdQuestionId = undefined;
  process.env.MOCK_API_SCENARIO = originalScenario;
  process.env.MOCK_API_DELAY_MS = originalDelay;
});

describe('admin question mock CRUD', () => {
  it('creates, lists, updates, and deletes a question', () => {
    process.env.MOCK_API_SCENARIO = 'happy';
    process.env.MOCK_API_DELAY_MS = '0';

    const created = createMockAdminQuestion(input);
    createdQuestionId = created.id;

    expect(listMockAdminQuestions()).toContainEqual(created);

    const updated = updateMockAdminQuestion(created.id, {
      ...input,
      english: 'Which service stores objects reliably?',
      status: 'published',
    });

    expect(updated).toMatchObject({
      id: created.id,
      english: 'Which service stores objects reliably?',
      status: 'published',
    });

    expect(deleteMockAdminQuestion(created.id)).toBe(true);
    createdQuestionId = undefined;
    expect(listMockAdminQuestions()).not.toContainEqual(updated);
    expect(deleteMockAdminQuestion(created.id)).toBe(false);
  });
});
