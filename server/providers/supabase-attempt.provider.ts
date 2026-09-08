import type { QuizAttemptRecord } from '@/features/quiz/quiz-attempt.types';
import type { QuizSetup, QuizState } from '@/features/quiz/quiz.types';
import type { DatabaseAttemptRow, DatabaseQuestionRow } from '@/server/database/types';
import { serializeQuizState, transformAttempt } from '@/server/database/transformers/attempt.transform';
import type { AttemptProvider } from '@/server/providers/attempt.provider';
import { transformQuestion } from '@/server/database/transformers/question.transform';
import { supabaseQuery, supabaseRequest } from '@/supabase/client';
import { applyClientAttemptUpdate } from '@/features/quiz/utils/attemptState';
import { InvalidAttemptAnswerError } from './attempt-errors';
import { QuizEvaluatorError, validateAndCalculateQuizState } from '@/features/quiz/utils/quizEvaluator';

async function getSupabasePlayerName(playerId: string): Promise<string> {
  const query = supabaseQuery({ select: 'player_name', id: `eq.${playerId}`, limit: '1' });
  const players = await supabaseRequest<Array<{ player_name: string }>>(`players?${query}`);
  return players[0]?.player_name ?? '';
}

async function getSupabaseAttempt(playerId: string, mode: QuizSetup['mode']): Promise<QuizAttemptRecord | null> {
  const query = supabaseQuery({ select: '*', player_id: `eq.${playerId}`, mode: `eq.${mode}`, order: 'updated_at.desc', limit: '1' });
  const attempts = await supabaseRequest<DatabaseAttemptRow[]>(`quiz_attempts?${query}`);
  const attempt = attempts[0];
  return attempt ? transformAttempt(attempt, await getSupabasePlayerName(attempt.player_id)) : null;
}

async function createSupabaseAttempt(playerId: string, playerName: string, setup: QuizSetup, questionIds: string[], state: QuizState): Promise<QuizAttemptRecord> {
  const attempts = await supabaseRequest<DatabaseAttemptRow[]>('quiz_attempts', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      player_id: playerId,
      mode: setup.mode,
      question_limit: setup.questionLimit,
      attempt_status: state.attemptStatus,
      current_question_index: state.currentQIndex,
      score: state.score,
      question_ids: questionIds,
      state: serializeQuizState(state),
    }),
  });
  return transformAttempt(attempts[0], playerName);
}

async function updateSupabaseAttempt(attemptId: string, state: QuizState): Promise<QuizAttemptRecord> {
  const existing = await getSupabaseAttemptById(attemptId);
  if (!existing) throw new Error("Attempt not found.");
  const trustedState = applyClientAttemptUpdate(existing.state, serializeQuizState(state), existing.questionIds.length);
  const attempts = await supabaseRequest<DatabaseAttemptRow[]>(`quiz_attempts?id=eq.${attemptId}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      attempt_status: trustedState.attemptStatus,
      current_question_index: trustedState.currentQIndex,
      score: trustedState.score,
      state: trustedState,
      completed_at: trustedState.attemptStatus === 'completed' ? new Date().toISOString() : null,
    }),
  });
  const attempt = attempts[0];
  return transformAttempt(attempt, await getSupabasePlayerName(attempt.player_id));
}

async function getSupabaseAttemptById(attemptId: string): Promise<QuizAttemptRecord | null> {
  const query = supabaseQuery({ select: "*", id: `eq.${attemptId}`, limit: "1" });
  const attempts = await supabaseRequest<DatabaseAttemptRow[]>(`quiz_attempts?${query}`);
  const attempt = attempts[0];
  return attempt ? transformAttempt(attempt, await getSupabasePlayerName(attempt.player_id)) : null;
}

async function submitSupabaseAnswer(attemptId: string, questionId: string, selectedOptionId: string) {
  const attempt = await getSupabaseAttemptById(attemptId);
  if (!attempt) throw new Error("Attempt not found.");

  const query = supabaseQuery({ select: "*,question_options(*)", id: `eq.${questionId}`, limit: "1" });
  const rows = await supabaseRequest<DatabaseQuestionRow[]>(`questions?${query}`);
  const question = rows[0] ? transformQuestion(rows[0]) : null;
  if (!question) throw new InvalidAttemptAnswerError("Invalid question.");

  let evaluation;
  try {
    evaluation = validateAndCalculateQuizState(attempt, question, selectedOptionId);
  } catch (error) {
    if (error instanceof QuizEvaluatorError) throw new InvalidAttemptAnswerError(error.message);
    throw error;
  }

  const selectedOptionRow = rows[0]?.question_options.find(
    (option) => option.option_key === evaluation.selectedOption.id,
  );
  if (!selectedOptionRow) throw new InvalidAttemptAnswerError("Invalid answer.");

  const updatedRows = await supabaseRequest<DatabaseAttemptRow[]>(`quiz_attempts?id=eq.${attemptId}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ attempt_status: 'active', current_question_index: evaluation.nextState.currentQIndex, score: evaluation.nextState.score, state: serializeQuizState(evaluation.nextState) }),
  });
  const updatedRow = updatedRows[0];
  if (!updatedRow) throw new Error('Attempt changed before the answer was saved.');
  const updated = transformAttempt(updatedRow, attempt.playerName);

  await supabaseRequest("quiz_answers", { method: "POST", body: JSON.stringify({ attempt_id: attemptId, question_id: questionId, selected_option_id: selectedOptionRow.id, is_correct: evaluation.isCorrect }) });

  return { attempt: updated, isCorrect: evaluation.isCorrect };
}

async function discardSupabaseAttempt(attemptId: string): Promise<void> {
  await supabaseRequest(`quiz_attempts?id=eq.${attemptId}`, { method: 'DELETE' });
}

export const supabaseAttemptProvider: AttemptProvider = {
  getAttempt: getSupabaseAttempt,
  getAttemptById: getSupabaseAttemptById,
  createAttempt: createSupabaseAttempt,
  updateAttempt: updateSupabaseAttempt,
  submitAnswer: submitSupabaseAnswer,
  discardAttempt: discardSupabaseAttempt,
};
