import type { ExamQuestion, QuizMode, QuestionStatus, QuizOption } from '@/features/quiz/quiz.types';

export type AdminQuestionInput = Omit<ExamQuestion, 'id'>;

export interface AdminQuestionFormState {
  mode: QuizMode;
  topic: string;
  english: string;
  thai_drama: string;
  options: QuizOption[];
  correctOptionId: string;
  hint_keyword: string;
  funFact: string;
  chapter: string;
  sourceName: string;
  sourceUrl: string;
  sourceReference: string;
  status: QuestionStatus;
}
