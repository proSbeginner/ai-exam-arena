import type { AdminQuestionFormState } from './admin.types';

export const ADMIN_REFRESH_DELAY_MS = 500;
export const MAX_ADMIN_OPTIONS = 10;

export const EMPTY_ADMIN_FORM: AdminQuestionFormState = {
  labels: [],
  labelInput: '',
  english: '',
  thai_drama: '',
  options: [
    { id: 'option-a', english: '', thai_drama: '' },
    { id: 'option-b', english: '', thai_drama: '' },
    { id: 'option-c', english: '', thai_drama: '' },
    { id: 'option-d', english: '', thai_drama: '' },
  ],
  correctOptionId: 'option-a',
  funFact: '',
  sourceName: '',
  status: 'draft',
};
