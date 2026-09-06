'use client';

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';

import {
  CHEER_MESSAGES,
  CORRECT_IMAGES,
  questions,
  SYMPATHY_MESSAGES,
} from '@/data/questions';
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
import type { QuizState } from './quiz.types';

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
  const [cheerIdx, setCheerIdx] = useState(0);
  const [sympathyIdx, setSympathyIdx] = useState(0);
  const [correctImage, setCorrectImage] = useState(CORRECT_IMAGES[0]);
  const [confettiKey, setConfettiKey] = useState(0);
  const [pageKey, setPageKey] = useState(0);

  const goToNext = useCallback(() => {
    if (quizState.gameOver) return;

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
  }, [quizState]);

  const goToPrevious = useCallback(() => {
    if (quizState.currentQIndex === 0 || quizState.gameOver) return;
    setQuizState((current) => getPreviousQuestion(current));
    setPageKey((current) => current + 1);
  }, [quizState.currentQIndex, quizState.gameOver]);

  const answerQuestion = useCallback(
    (selectedOptionIndex: number) => {
      if (quizState.answeredMap.has(quizState.currentQIndex) || quizState.gameOver) return;

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
    [quizState],
  );

  const restartGame = useCallback(() => {
    setQuizState(createInitialQuizState());
    setPageKey((current) => current + 1);
    setConfettiKey(0);
  }, []);

  const changePlayerName = useCallback(() => {
    clearPlayerName();
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
    quizState,
    restartGame,
    selectedAnswer,
    sympathyIdx,
  };
}
