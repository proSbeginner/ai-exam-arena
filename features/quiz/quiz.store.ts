'use client';

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import {
  CHEER_MESSAGES,
  SYMPATHY_MESSAGES,
} from './quiz.content';
import { CORRECT_IMAGES } from './quiz.assets';
import type { ExamQuestion } from './quiz.types';
import {
  clearPlayerName,
  getStoredPlayerName,
  subscribeToPlayerName,
} from '@/features/welcome/welcome.store';

import {
  createInitialQuizState,
  evaluateAnswer,
  getNextQuestion,
  getPreviousQuestion,
  getRank,
} from './quiz.logic';
import { getQuizQuestions } from './services/quiz.api';
import type { QuizState } from './quiz.types';

type QuestionLoadStatus = 'loading' | 'ready' | 'empty' | 'error';

function pickRandomIndex(length: number): number {
  const randomValues = new Uint32Array(1);
  crypto.getRandomValues(randomValues);
  return randomValues[0] % length;
}

export function useQuizStore() {
  const playerName = useSyncExternalStore(
    subscribeToPlayerName,
    getStoredPlayerName,
    () => null,
  );
  const isPlayerReady = useSyncExternalStore(
    subscribeToPlayerName,
    () => true,
    () => false,
  );
  const [quizState, setQuizState] = useState<QuizState>(createInitialQuizState);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [questionLoadStatus, setQuestionLoadStatus] = useState<QuestionLoadStatus>('loading');
  const [questionLoadError, setQuestionLoadError] = useState<string | null>(null);
  const [questionLoadAttempt, setQuestionLoadAttempt] = useState(0);
  const [cheerIdx, setCheerIdx] = useState(0);
  const [sympathyIdx, setSympathyIdx] = useState(0);
  const [correctImage, setCorrectImage] = useState(CORRECT_IMAGES[0]);
  const [confettiKey, setConfettiKey] = useState(0);
  const [pageKey, setPageKey] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;

    const loadQuestions = async () => {
      setQuestionLoadStatus('loading');
      setQuestionLoadError(null);

      try {
        const loadedQuestions = await getQuizQuestions();
        if (!isCurrentRequest) return;

        setQuestions(loadedQuestions);
        setQuestionLoadStatus(loadedQuestions.length === 0 ? 'empty' : 'ready');
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
  }, [questionLoadAttempt]);

  const goToNext = useCallback(() => {
    if (quizState.gameOver || questions.length === 0) return;

    const next = getNextQuestion(quizState, questions.length);
    setQuizState((current) => ({
      ...current,
      currentQIndex: next.currentQIndex,
      gameOver: next.gameOver,
      mood: next.mood,
    }));

    if (!next.gameOver && next.currentQIndex !== quizState.currentQIndex) {
      setPageKey((current) => current + 1);
    }
  }, [questions.length, quizState]);

  const goToPrevious = useCallback(() => {
    if (quizState.currentQIndex === 0 || quizState.gameOver) return;
    setQuizState((current) => getPreviousQuestion(current));
    setPageKey((current) => current + 1);
  }, [quizState.currentQIndex, quizState.gameOver]);

  const answerQuestion = useCallback(
    (selectedOptionIndex: number) => {
      if (quizState.answeredMap.has(quizState.currentQIndex) || quizState.gameOver || questions.length === 0) return;

      const result = evaluateAnswer(
        quizState,
        questions[quizState.currentQIndex],
        selectedOptionIndex,
      );

      setQuizState((current) => ({
        ...current,
        score: result.score,
        streak: result.streak,
        mood: result.mood,
        answeredMap: result.answeredMap,
      }));
      setCheerIdx(pickRandomIndex(CHEER_MESSAGES.length));
      setSympathyIdx(pickRandomIndex(SYMPATHY_MESSAGES.length));

      if (result.mood === 'correct') {
        setCorrectImage(CORRECT_IMAGES[pickRandomIndex(CORRECT_IMAGES.length)]);
      }

      if (result.triggerConfetti) {
        setConfettiKey((current) => current + 1);
      }
    },
    [questions, quizState],
  );

  const restartGame = useCallback(() => {
    setQuizState(createInitialQuizState());
    setPageKey((current) => current + 1);
    setConfettiKey(0);
  }, []);

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
    currentQuestion,
    currentRank,
    goToNext,
    goToPrevious,
    hasAnsweredCurrentQuestion,
    isPlayerReady,
    pageKey,
    playerName,
    questionLoadError,
    questionLoadStatus,
    questions,
    quizState,
    restartGame,
    retryQuestionLoad,
    selectedAnswer,
    sympathyIdx,
  };
}

export type QuizStore = ReturnType<typeof useQuizStore>;
