import type { ExamQuestion } from '@/features/quiz/quiz.types';
import type { DatabaseQuestionRow } from '@/server/database/types';

export function transformQuestion(row: DatabaseQuestionRow): ExamQuestion {
  const options = [...row.question_options].sort((left, right) => left.display_order - right.display_order);

  return {
    id: row.id,
    mode: row.mode,
    labels: row.labels ?? [],
    english: row.english,
    thai_drama: row.thai_drama,
    options: options.map((option) => ({ id: option.option_key, english: option.english, thai_drama: option.thai_drama })),
    correctOptionId: options.find((option) => option.is_correct)?.option_key ?? '',
    funFact: row.fun_fact ?? undefined,
    source: row.source_name ? { name: row.source_name } : undefined,
    status: row.status,
  };
}
