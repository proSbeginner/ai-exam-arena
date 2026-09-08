import { ATTEMPT_STATUS, PASSING_SCORE_PERCENTAGE, QUIZ_MODE_OPTION_LIMITS, RANKS, STREAK_MILESTONES, STREAK_TITLES } from './quiz.constants';
import type { QuizAttemptRecord } from './quiz-attempt.types';
import type { ExamQuestion } from './quiz.types';
import type { AnswerResult, NextQuestionResult, QuizMode, QuizState } from './quiz.types';

export function isQuestionAvailableForMode(question: ExamQuestion, mode: QuizMode): boolean {
  return question.status === 'published' && question.options.length >= QUIZ_MODE_OPTION_LIMITS[mode];
}

export function canReuseQuizAttempt(
  attempt: QuizAttemptRecord | null,
  selectedQuestions: ExamQuestion[],
): boolean {
  if (!attempt) return false;
  if (attempt.state.attemptStatus !== ATTEMPT_STATUS.COMPLETED) return true;

  return attempt.questionIds.length === selectedQuestions.length
    && attempt.questionIds.every((questionId) => selectedQuestions.some((question) => question.id === questionId));
}

export function getRank(score: number): (typeof RANKS)[number] {
  return RANKS.filter((rank) => score >= rank.min).at(-1) ?? RANKS[0];
}

export function hasPassedQuiz(score: number, questionCount: number): boolean {
  return questionCount > 0 && score * 100 >= questionCount * PASSING_SCORE_PERCENTAGE;
}

export function isStreakMilestone(streak: number): boolean {
  return STREAK_MILESTONES.includes(streak) || (streak > 20 && streak % 5 === 0);
}

export function getStreakTitle(streak: number): string | null {
  if (streak < 2) return null;
  return STREAK_TITLES[Math.min(streak, 10)] ?? null;
}


function randomIndex(max: number): number {
  const randomValues = new Uint32Array(1);
  crypto.getRandomValues(randomValues);
  return randomValues[0] % max;
}

function shuffleOptions<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function randomizeQuestionOptions(questions: ExamQuestion[]): ExamQuestion[] {
  return questions.map((question) => {
    if (question.options.length < 2) return question;

    const originalIds = question.options.map((option) => option.id);
    let options = shuffleOptions(question.options);

    if (options.every((option, index) => option.id === originalIds[index])) {
      options = [options[1], options[0], ...options.slice(2)];
    }

    return { ...question, options };
  });
}

export function randomizeQuizQuestions(questions: ExamQuestion[], mode?: QuizMode): ExamQuestion[] {
  const originalIds = questions.map((question) => question.id);
  let randomizedQuestions = shuffleOptions(questions);

  if (
    randomizedQuestions.length > 1 &&
    randomizedQuestions.every((question, index) => question.id === originalIds[index])
  ) {
    randomizedQuestions = [randomizedQuestions[1], randomizedQuestions[0], ...randomizedQuestions.slice(2)];
  }

  return randomizedQuestions.map((question) => {
    const targetOptionCount = !mode || mode === 'university'
      ? question.options.length
      : QUIZ_MODE_OPTION_LIMITS[mode];
    if (question.options.length <= targetOptionCount) return randomizeQuestionOptions([question])[0];

    const correctOption = question.options.find((option) => option.id === question.correctOptionId);
    if (!correctOption) return randomizeQuestionOptions([question])[0];

    const wrongOptions = shuffleOptions(
      question.options.filter((option) => option.id !== question.correctOptionId),
    );
    return {
      ...question,
      options: shuffleOptions([correctOption, ...wrongOptions.slice(0, targetOptionCount - 1)]),
    };
  });
}

export function evaluateAnswer(
  state: QuizState,
  question: ExamQuestion,
  selectedOptionId: string,
): AnswerResult {
  const isCorrect = selectedOptionId === question.correctOptionId;
  const answeredMap = new Map(state.answeredMap);
  answeredMap.set(state.currentQIndex, selectedOptionId);

  if (!isCorrect) {
    return {
      score: state.score,
      streak: 0,
      mood: 'wrong',
      answeredMap,
      triggerConfetti: false,
      rankChanged: false,
    };
  }

  const score = state.score + 1;
  const streak = state.streak + 1;
  const rankChanged = getRank(state.score).title !== getRank(score).title;

  return {
    score,
    streak,
    mood: 'correct',
    answeredMap,
    triggerConfetti: isStreakMilestone(streak) || rankChanged,
    rankChanged,
  };
}

export function getNextQuestion(
  state: QuizState,
  questionCount: number,
): NextQuestionResult {
  if (state.currentQIndex < questionCount - 1) {
    return {
      currentQIndex: state.currentQIndex + 1,
      isLastQuestion: state.currentQIndex + 1 >= questionCount - 1,
      mood: 'idle',
    };
  }

  return {
    currentQIndex: state.currentQIndex,
    isLastQuestion: true,
    mood: 'idle',
  };
}

export function getPreviousQuestion(state: QuizState): QuizState {
  if (state.currentQIndex === 0) return state;
  return { ...state, currentQIndex: state.currentQIndex - 1, mood: 'idle' };
}

export function createInitialQuizState(): QuizState {
  return {
    currentQIndex: 0,
    score: 0,
    streak: 0,
    mood: 'idle',
    answeredMap: new Map(),
    summaryVisible: false,
    attemptStatus: ATTEMPT_STATUS.ACTIVE,
  };
}
