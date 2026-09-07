'use client';

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';

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
  clearPlayerName,
  getStoredPlayerName,
  getStoredPlayerId,
  subscribeToPlayerName,
} from '@/features/welcome/welcome.hook';

import {
  createInitialQuizState,
  evaluateAnswer,
  getNextQuestion,
  getPreviousQuestion,
  getRank,
  randomizeQuizQuestions,
} from './quiz.logic';
import { getQuizQuestions } from './services/quiz.api';
import {
  createQuizAttempt,
  discardQuizAttempt,
  getQuizAttempt,
  updateQuizAttempt,
} from './services/quiz-attempt.api';
import {
  clearQuizProgress,
  getStoredQuizProgress,
  saveQuizProgress,
} from './quiz-progress.storage';
import type { QuizState } from './quiz.types';

type QuestionLoadStatus = 'loading' | 'ready' | 'empty' | 'error';

function pickRandomIndex(length: number): number {
  const randomValues = new Uint32Array(1);
  crypto.getRandomValues(randomValues);
  return randomValues[0] % length;
}

export function useQuiz() {
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
  const isPlayerReady = useSyncExternalStore(
    subscribeToPlayerName,
    () => true,
    () => false,
  );
  const [quizState, setQuizState] = useState<QuizState>(createInitialQuizState);
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
      setQuestionLoadStatus('loading');
      setQuestionLoadError(null);

      try {
        const loadedQuestions = await getQuizQuestions();
        if (!isCurrentRequest) return;

        const modeQuestions = quizSetup
          ? loadedQuestions.filter(
              (question) => question.mode === quizSetup.mode && question.status === 'published',
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
          : randomizeQuizQuestions(selectedQuestions);

        let attempt: Awaited<ReturnType<typeof getQuizAttempt>> = null;
        if (playerId && playerName && quizSetup) {
          attempt = await getQuizAttempt(playerId, quizSetup.mode);
        }

        const matchingAttempt = attempt && attempt.questionIds.length === selectedQuestions.length
          && attempt.questionIds.every((questionId) => selectedQuestions.some((question) => question.id === questionId))
          ? attempt
          : null;
        const attemptQuestions = matchingAttempt
          ? matchingAttempt.questionIds
              .map((questionId) => selectedQuestions.find((question) => question.id === questionId))
              .filter((question): question is ExamQuestion => Boolean(question))
          : randomizedQuestions;

        setQuestions(attemptQuestions);
        setAttemptId(matchingAttempt?.id ?? null);
        setQuestionLoadStatus(attemptQuestions.length === 0 ? 'empty' : 'ready');

        if (matchingAttempt && matchingAttempt.state.attemptStatus !== ATTEMPT_STATUS.COMPLETED) {
          setQuizState({
            ...matchingAttempt.state,
            answeredMap: new Map(Object.entries(matchingAttempt.state.answeredMap).map(([index, answer]) => [Number(index), answer])),
          });
        } else if (storedProgress) {
          setQuizState(storedProgress.state);
        } else if (playerName && quizSetup) {
          setQuizState(createInitialQuizState());
        }

        if (playerId && playerName && quizSetup && (!matchingAttempt || matchingAttempt.state.attemptStatus === ATTEMPT_STATUS.COMPLETED)) {
          const newAttempt = await createQuizAttempt(playerId, playerName, quizSetup, attemptQuestions.map((question) => question.id), createInitialQuizState());
          setAttemptId(newAttempt.id);
          setQuizState(createInitialQuizState());
        }
      } catch {
        if (!isCurrentRequest) return;

        setQuestionLoadStatus('error');
        setQuestionLoadError('ไม่สามารถโหลดคำถามได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
      }
    };

    void loadQuestions();

    return () => {
      isCurrentRequest = false;
    };
  }, [playerId, playerName, questionLoadAttempt, quizSetup]);

  const syncAttempt = useCallback((state: QuizState, id = attemptId) => {
    if (id) void updateQuizAttempt(id, state).catch(() => undefined);
  }, [attemptId]);

  const goToNext = useCallback(() => {
    if (quizState.gameOver || questions.length === 0) return;

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
    syncAttempt(nextState);

    if (!next.gameOver && next.currentQIndex !== quizState.currentQIndex) {
      setPageKey((current) => current + 1);
    }
  }, [persistProgress, questions.length, quizState, syncAttempt]);

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
      const isCompleted = result.answeredMap.size >= questions.length;
      const resultMood = isCompleted
        ? result.score >= Math.ceil(questions.length / 2)
          ? 'passed'
          : 'failed'
        : result.mood;

      const nextState: QuizState = {
        ...quizState,
        score: result.score,
        streak: result.streak,
        mood: resultMood,
        answeredMap: result.answeredMap,
        gameOver: isCompleted,
        summaryVisible: isCompleted,
        attemptStatus: isCompleted ? ATTEMPT_STATUS.COMPLETED : ATTEMPT_STATUS.ACTIVE,
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
    [persistProgress, questions, quizState, syncAttempt],
  );

  const restartGame = useCallback(() => {
    const nextState = createInitialQuizState();
    const randomizedQuestions = randomizeQuizQuestions(questions);

    clearQuizProgress();
    if (attemptId) void discardQuizAttempt(attemptId).catch(() => undefined);
    setQuestions(randomizedQuestions);
    setQuizState(nextState);
    if (playerId && playerName && quizSetup) {
      void createQuizAttempt(playerId, playerName, quizSetup, randomizedQuestions.map((question) => question.id), nextState)
        .then((attempt) => setAttemptId(attempt.id))
        .catch(() => undefined);
    }
    setPageKey((current) => current + 1);
    setConfettiKey(0);
  }, [attemptId, playerId, playerName, questions, quizSetup]);

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
    if (
      !quizState.summaryVisible ||
      quizState.gameOver ||
      quizState.attemptStatus === ATTEMPT_STATUS.COMPLETED
    ) return;

    const nextState: QuizState = {
      ...quizState,
      summaryVisible: false,
      attemptStatus: ATTEMPT_STATUS.ACTIVE,
    };

    setQuizState(nextState);
    persistProgress(nextState);
    syncAttempt(nextState);
  }, [persistProgress, quizState, syncAttempt]);

  const changePlayerName = useCallback(() => {
    clearPlayerName();
  }, []);

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
    changePlayerName,
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
