import type { QuizAttemptRecord } from '@/features/quiz/quiz-attempt.types';
import { evaluateAnswer } from '@/features/quiz/quiz.logic';
import type { ExamQuestion, QuizState, QuizOption } from '@/features/quiz/quiz.types';

export class QuizEvaluatorError extends Error {}

interface QuizEvaluationResult {
  nextState: QuizState;
  selectedOption: QuizOption;
  isCorrect: boolean;
}

export function validateAndCalculateQuizState(
  attempt: QuizAttemptRecord,
  question: ExamQuestion,
  selectedOptionId: string,
): QuizEvaluationResult {
  if (attempt.state.attemptStatus === 'completed') {
    throw new QuizEvaluatorError('Attempt is already completed.');
  }

  const questionIndex = attempt.questionIds.indexOf(question.id);
  if (questionIndex !== attempt.state.currentQIndex) {
    throw new QuizEvaluatorError('Invalid question.');
  }

  if (attempt.state.answeredMap[String(questionIndex)]) {
    throw new QuizEvaluatorError('Question has already been answered.');
  }

  const selectedOption = question.options.find((option) => option.id === selectedOptionId);
  if (!selectedOption) {
    throw new QuizEvaluatorError('Invalid answer.');
  }

  const state: QuizState = {
    ...attempt.state,
    answeredMap: new Map(
      Object.entries(attempt.state.answeredMap).map(([index, answer]) => [Number(index), answer]),
    ),
  };
  const result = evaluateAnswer(state, question, selectedOptionId);
  const nextState: QuizState = {
    ...state,
    score: result.score,
    streak: result.streak,
    mood: result.mood,
    answeredMap: result.answeredMap,
  };

  return {
    nextState,
    selectedOption,
    isCorrect: selectedOptionId === question.correctOptionId,
  };
}
