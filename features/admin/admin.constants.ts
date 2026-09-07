import type { AdminQuestionFormState } from './admin.types';

export const ADMIN_REFRESH_DELAY_MS = 500;

export const EMPTY_ADMIN_FORM: AdminQuestionFormState = {
  mode: 'university',
  labels: [],
  labelInput: '',
  english: '',
  thai_drama: '',
  options: [
    { id: 'option-a', english: '', thai_drama: '' },
    { id: 'option-b', english: '', thai_drama: '' },
  ],
  correctOptionId: 'option-a',
  funFact: '',
  sourceName: '',
  status: 'draft',
};
