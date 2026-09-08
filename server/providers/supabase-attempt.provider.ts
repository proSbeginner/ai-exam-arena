import type { QuizAttemptRecord } from '@/features/quiz/quiz-attempt.types';
import type { QuizSetup, QuizState } from '@/features/quiz/quiz.types';
import { evaluateAnswer } from '@/features/quiz/quiz.logic';
import type { DatabaseAttemptRow, DatabaseQuestionRow } from '@/server/database/types';
import { serializeQuizState, transformAttempt } from '@/server/database/transformers/attempt.transform';
import type { AttemptProvider } from '@/server/providers/attempt.provider';
import { transformQuestion } from '@/server/database/transformers/question.transform';
import { supabaseQuery, supabaseRequest } from '@/supabase/client';
import { applyClientAttemptUpdate } from './attempt-state';
import { InvalidAttemptAnswerError } from './attempt-errors';

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
  // Load the current attempt and identify the question/option being answered.
  const attempt = await getSupabaseAttemptById(attemptId);
  if (!attempt) throw new Error("Attempt not found.");
  if (attempt.state.attemptStatus === "completed") throw new Error("Attempt is already completed.");

  const query = supabaseQuery({ select: "*,question_options(*)", id: `eq.${questionId}`, limit: "1" });
  const rows = await supabaseRequest<DatabaseQuestionRow[]>(`questions?${query}`);
  const question = rows[0] ? transformQuestion(rows[0]) : null;
  const selectedOption = rows[0]?.question_options.find((option) => option.option_key === selectedOptionId);

  // Reject answers for another question, duplicate answers, or unknown options.
  const questionIndex = attempt.questionIds.indexOf(questionId);
  if (!question || questionIndex !== attempt.state.currentQIndex) throw new InvalidAttemptAnswerError("Invalid question.");
  if (attempt.state.answeredMap[String(questionIndex)]) throw new InvalidAttemptAnswerError("Question has already been answered.");
  if (!selectedOption) throw new InvalidAttemptAnswerError("Invalid answer.");

  // Calculate the trusted next state on the server.
  const state: QuizState = { ...attempt.state, answeredMap: new Map(Object.entries(attempt.state.answeredMap).map(([index, answer]) => [Number(index), answer])) };
  const result = evaluateAnswer(state, question, selectedOptionId);
  const nextState: QuizState = { ...state, score: result.score, streak: result.streak, mood: result.mood, answeredMap: result.answeredMap };

  // Persist the attempt progress using the server-calculated state.
  const updatedRows = await supabaseRequest<DatabaseAttemptRow[]>(`quiz_attempts?id=eq.${attemptId}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ attempt_status: 'active', current_question_index: nextState.currentQIndex, score: nextState.score, state: serializeQuizState(nextState) }),
  });
  const updated = transformAttempt(updatedRows[0], attempt.playerName);

  // Store the answer with the database UUID, not the application option key.
  await supabaseRequest("quiz_answers", { method: "POST", body: JSON.stringify({ attempt_id: attemptId, question_id: questionId, selected_option_id: selectedOption.id, is_correct: selectedOptionId === question.correctOptionId }) });

  // Return the updated attempt and correctness result to the API route.
  return { attempt: updated, isCorrect: selectedOptionId === question.correctOptionId };
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
