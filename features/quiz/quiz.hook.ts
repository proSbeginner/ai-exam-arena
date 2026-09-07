'use client';

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';

import {
  CHEER_MESSAGES,
  SYMPATHY_MESSAGES,
} from './quiz.content';
import { CORRECT_IMAGES, WRONG_IMAGES } from './quiz.assets';
import { ANSWER_MOOD, ATTEMPT_STATUS } from './quiz.constants';
import type { ExamQuestion } from './quiz.types';
import {
  getStoredQuizSetup,
  subscribeToQuizSetup,
} from './quiz-setup.hook';
import {
  getStoredPlayerName,
  getStoredPlayerId,
  subscribeToPlayerName,
} from '@/features/welcome/welcome.hook';

import {
  createInitialQuizState,
  canReuseQuizAttempt,
  evaluateAnswer,
  getNextQuestion,
  getPreviousQuestion,
  getRank,
  isQuestionAvailableForMode,
  randomizeQuizQuestions,
} from './quiz.logic';
import { getQuizQuestions } from './services/quiz.api';
import { createQuizAttempt, getQuizAttempt, updateQuizAttempt } from './services/quiz-attempt.api';

import { submitQuizAnswer } from './services/quiz-answer.api';
import {
  clearQuizReviewAttemptId,
  getStoredQuizReviewAttemptId,
  getStoredQuizProgress,
  saveQuizProgress,
} from './quiz-progress.storage';
import { restartQuizAttempt } from './quiz-restart';
import type { QuizState } from './quiz.types';
import { APP_ROUTES } from '@/features/shared/routes';

import { applyAttemptRating } from '@/features/rank/services/rating.api';

type QuestionLoadStatus = 'loading' | 'ready' | 'empty' | 'error';

function pickRandomIndex(length: number): number {
  const randomValues = new Uint32Array(1);
  crypto.getRandomValues(randomValues);
  return randomValues[0] % length;
}

export function useQuiz() {
  const router = useRouter();
  const playerName = useSyncExternalStore(
    subscribeToPlayerName,
    getStoredPlayerName,
    () => null,
  );
  const playerId = useSyncExternalStore(
    subscribeToPlayerName,
    getStoredPlayerId,
    () => null,
  );
  const quizSetup = useSyncExternalStore(
    subscribeToQuizSetup,
    getStoredQuizSetup,
    () => null,
  );
  const isQuizSetupReady = useSyncExternalStore(
    subscribeToQuizSetup,
    () => true,
    () => false,
  );
  const isPlayerReady = useSyncExternalStore(
    subscribeToPlayerName,
    () => true,
    () => false,
  );
  const [quizState, setQuizState] = useState<QuizState>(createInitialQuizState);
  const [isReviewing, setIsReviewing] = useState(false);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questionLoadStatus, setQuestionLoadStatus] = useState<QuestionLoadStatus>('loading');
  const [questionLoadError, setQuestionLoadError] = useState<string | null>(null);
  const [questionLoadAttempt, setQuestionLoadAttempt] = useState(0);
  const [cheerIdx, setCheerIdx] = useState(0);
  const [sympathyIdx, setSympathyIdx] = useState(0);
  const [correctImage, setCorrectImage] = useState(CORRECT_IMAGES[0]);
  const [wrongImage, setWrongImage] = useState(WRONG_IMAGES[0]);
  const [confettiKey, setConfettiKey] = useState(0);
  const [pageKey, setPageKey] = useState(0);

  const persistProgress = useCallback(
    (state: QuizState, loadedQuestions = questions) => {
      if (!playerName || !quizSetup || loadedQuestions.length === 0) return;
      saveQuizProgress(playerName, quizSetup, loadedQuestions.map((question) => question.id), state);
    },
    [playerName, questions, quizSetup],
  );

  useEffect(() => {
    let isCurrentRequest = true;

    const loadQuestions = async () => {
      let failureMessage = 'ไม่สามารถโหลดคำถามได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง';
      setQuestionLoadStatus('loading');
      setQuestionLoadError(null);

      try {
        const loadedQuestions = await getQuizQuestions();
        if (!isCurrentRequest) return;

        failureMessage = 'ไม่สามารถโหลดความคืบหน้าชุดข้อสอบได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง';

        const modeQuestions = quizSetup
          ? loadedQuestions.filter(
              (question) => isQuestionAvailableForMode(question, quizSetup.mode),
            )
          : [];
        const selectedQuestions = quizSetup?.questionLimit
          ? modeQuestions.slice(0, quizSetup.questionLimit)
          : modeQuestions;
        const storedProgress = playerName && quizSetup
          ? getStoredQuizProgress(
              playerName,
              quizSetup,
              selectedQuestions.map((question) => question.id),
            )
          : null;
        const randomizedQuestions = storedProgress
          ? storedProgress.questionIds
              .map((questionId) => selectedQuestions.find((question) => question.id === questionId))
              .filter((question): question is ExamQuestion => Boolean(question))
          : randomizeQuizQuestions(selectedQuestions, quizSetup?.mode);

        let attempt: Awaited<ReturnType<typeof getQuizAttempt>> = null;
        if (playerId && playerName && quizSetup) {
          attempt = await getQuizAttempt(playerId, quizSetup.mode);
        }

        const matchingAttempt = canReuseQuizAttempt(attempt, selectedQuestions) ? attempt : null;
        const reviewAttemptId = getStoredQuizReviewAttemptId();
        const shouldReviewAttempt = Boolean(matchingAttempt && matchingAttempt.id === reviewAttemptId);
        if (shouldReviewAttempt) clearQuizReviewAttemptId();
        setIsReviewing(shouldReviewAttempt);
        const attemptQuestionPool = matchingAttempt && matchingAttempt.state.attemptStatus !== ATTEMPT_STATUS.COMPLETED
          ? modeQuestions
          : selectedQuestions;
        const attemptQuestions = matchingAttempt
          ? matchingAttempt.questionIds
              .map((questionId) => attemptQuestionPool.find((question) => question.id === questionId))
              .filter((question): question is ExamQuestion => Boolean(question))
          : randomizedQuestions;
        const preparedQuestions = matchingAttempt && quizSetup
          ? attemptQuestions.map((question) => randomizeQuizQuestions([question], quizSetup.mode)[0])
          : attemptQuestions;

        setQuestions(preparedQuestions);
        setAttemptId(matchingAttempt?.id ?? null);

        if (matchingAttempt && (matchingAttempt.state.attemptStatus !== ATTEMPT_STATUS.COMPLETED || shouldReviewAttempt)) {
          setQuizState({
            ...matchingAttempt.state,
            currentQIndex: shouldReviewAttempt ? 0 : matchingAttempt.state.currentQIndex,
            mood: shouldReviewAttempt ? 'idle' : matchingAttempt.state.mood,
            gameOver: shouldReviewAttempt ? false : matchingAttempt.state.gameOver,
            summaryVisible: shouldReviewAttempt ? false : matchingAttempt.state.summaryVisible,
            attemptStatus: shouldReviewAttempt ? ATTEMPT_STATUS.ACTIVE : matchingAttempt.state.attemptStatus,
            answeredMap: new Map(Object.entries(matchingAttempt.state.answeredMap).map(([index, answer]) => [Number(index), answer])),
          });
        } else if (matchingAttempt) {
          setQuizState({
            ...matchingAttempt.state,
            answeredMap: new Map(Object.entries(matchingAttempt.state.answeredMap).map(([index, answer]) => [Number(index), answer])),
          });
        } else if (storedProgress) {
          setQuizState(storedProgress.state);
        } else if (playerName && quizSetup) {
          setQuizState(createInitialQuizState());
        }

        if (playerId && playerName && quizSetup && !matchingAttempt) {
          failureMessage = 'ไม่สามารถสร้างชุดข้อสอบได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง';
          const newAttempt = await createQuizAttempt(playerId, playerName, quizSetup, attemptQuestions.map((question) => question.id), createInitialQuizState());
          setAttemptId(newAttempt.id);
          setQuizState(createInitialQuizState());
        }

        setQuestionLoadStatus(attemptQuestions.length === 0 ? 'empty' : 'ready');
      } catch (error) {
        if (!isCurrentRequest) return;

        if (process.env.NODE_ENV === 'development') {
          console.error('[Quiz] failed to prepare quiz', error);
        }
        setQuestionLoadStatus('error');
        setQuestionLoadError(failureMessage);
      }
    };

    void loadQuestions();

    return () => {
      isCurrentRequest = false;
    };
  }, [playerId, playerName, questionLoadAttempt, quizSetup]);

  const syncAttempt = useCallback((state: QuizState, id = attemptId) => {
    if (id && !isReviewing) return updateQuizAttempt(id, state).catch(() => null);
    return Promise.resolve(null);
  }, [attemptId, isReviewing]);

  const goToNext = useCallback(() => {
    if (quizState.gameOver || questions.length === 0) return;

    if (quizState.currentQIndex === questions.length - 1 && quizState.answeredMap.size < questions.length) {
      const nextState: QuizState = {
        ...quizState,
        summaryVisible: true,
        attemptStatus: ATTEMPT_STATUS.ABANDONED,
      };

      setQuizState(nextState);
      persistProgress(nextState);
      syncAttempt(nextState);
      return;
    }

    const next = getNextQuestion(quizState, questions.length);
    const nextState: QuizState = {
      ...quizState,
      currentQIndex: next.currentQIndex,
      gameOver: next.gameOver,
      mood: next.mood,
      summaryVisible: next.gameOver,
      attemptStatus: next.gameOver ? ATTEMPT_STATUS.COMPLETED : ATTEMPT_STATUS.ACTIVE,
    };

    setQuizState(nextState);
    persistProgress(nextState);
    void syncAttempt(nextState).then(() => {
      if (next.gameOver && attemptId && !isReviewing) void applyAttemptRating(attemptId).catch(() => undefined);
    });

    if (!next.gameOver && next.currentQIndex !== quizState.currentQIndex) {
      setPageKey((current) => current + 1);
    }
  }, [attemptId, isReviewing, persistProgress, questions.length, quizState, syncAttempt]);

  const goToPrevious = useCallback(() => {
    if (quizState.currentQIndex === 0 || quizState.gameOver) return;
    const nextState = getPreviousQuestion(quizState);
    setQuizState(nextState);
    persistProgress(nextState);
    syncAttempt(nextState);
    setPageKey((current) => current + 1);
  }, [persistProgress, quizState, syncAttempt]);

  const answerQuestion = useCallback(
    (selectedOptionId: string) => {
      if (quizState.answeredMap.has(quizState.currentQIndex) || quizState.gameOver || questions.length === 0) return;

      const result = evaluateAnswer(
        quizState,
        questions[quizState.currentQIndex],
        selectedOptionId,
      );
      if (attemptId) {
        void submitQuizAnswer(attemptId, questions[quizState.currentQIndex].id, selectedOptionId).catch(() => undefined);
      }
      const nextState: QuizState = {
        ...quizState,
        score: result.score,
        streak: result.streak,
        mood: result.mood,
        answeredMap: result.answeredMap,
        gameOver: false,
        summaryVisible: false,
        attemptStatus: ATTEMPT_STATUS.ACTIVE,
      };

      setQuizState(nextState);
      persistProgress(nextState);
      syncAttempt(nextState);
      setCheerIdx(pickRandomIndex(CHEER_MESSAGES.length));
      setSympathyIdx(pickRandomIndex(SYMPATHY_MESSAGES.length));

      if (result.mood === ANSWER_MOOD.CORRECT) {
        setCorrectImage(CORRECT_IMAGES[pickRandomIndex(CORRECT_IMAGES.length)]);
      }

      if (result.mood === ANSWER_MOOD.WRONG) {
        setWrongImage(WRONG_IMAGES[pickRandomIndex(WRONG_IMAGES.length)]);
      }

      if (result.triggerConfetti) {
        setConfettiKey((current) => current + 1);
      }
    },
    [attemptId, persistProgress, questions, quizState, syncAttempt],
  );

  const restartGame = useCallback(async () => {
    if (!quizSetup) return;

    setIsReviewing(false);
    await restartQuizAttempt({
      attemptId,
      mode: quizSetup.mode,
      questionCount: questions.length || quizSetup.questionLimit,
      navigate: router.push,
    });
    setConfettiKey(0);
  }, [attemptId, questions.length, quizSetup, router]);

  const showSummary = useCallback(() => {
    if (quizState.gameOver) return;

    const nextState: QuizState = {
      ...quizState,
      summaryVisible: true,
      attemptStatus: ATTEMPT_STATUS.ABANDONED,
    };

    setQuizState(nextState);
    persistProgress(nextState);
    syncAttempt(nextState);
  }, [persistProgress, quizState, syncAttempt]);

  const resumeQuiz = useCallback(() => {
    if (!quizState.summaryVisible) return;

    const reviewingCompletedAttempt = quizState.gameOver || quizState.attemptStatus === ATTEMPT_STATUS.COMPLETED;

    const nextState: QuizState = {
      ...quizState,
      currentQIndex: reviewingCompletedAttempt ? 0 : quizState.currentQIndex,
      mood: 'idle',
      gameOver: false,
      summaryVisible: false,
      attemptStatus: ATTEMPT_STATUS.ACTIVE,
    };

    setIsReviewing(reviewingCompletedAttempt);
    setQuizState(nextState);
    if (!reviewingCompletedAttempt) {
      persistProgress(nextState);
      syncAttempt(nextState);
    }
  }, [persistProgress, quizState, syncAttempt]);

  const selectPlayer = useCallback(() => {
    router.push(APP_ROUTES.welcome);
  }, [router]);

  const retryQuestionLoad = useCallback(() => {
    setQuestionLoadAttempt((current) => current + 1);
  }, []);

  const answeredCount = quizState.answeredMap.size;
  const currentQuestion = questions[quizState.currentQIndex];
  const hasAnsweredCurrentQuestion = quizState.answeredMap.has(quizState.currentQIndex);
  const selectedAnswer = quizState.answeredMap.get(quizState.currentQIndex);
  const currentRank = useMemo(() => getRank(quizState.score), [quizState.score]);

  return {
    answerQuestion,
    answeredCount,
    selectPlayer,
    cheerIdx,
    confettiKey,
    correctImage,
    wrongImage,
    currentQuestion,
    currentRank,
    goToNext,
    goToPrevious,
    hasAnsweredCurrentQuestion,
    hasQuizSetup: Boolean(quizSetup),
    isQuizSetupReady,
    isPlayerReady,
    pageKey,
    playerName,
    questionLoadError,
    questionLoadStatus,
    questions,
    quizState,
    restartGame,
    resumeQuiz,
    retryQuestionLoad,
    selectedAnswer,
    showSummary,
    sympathyIdx,
  };
}

export type QuizHook = ReturnType<typeof useQuiz>;
