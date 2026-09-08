'use client';

import Image from 'next/image';
import { useCallback, useRef, type TouchEvent } from 'react';

import { getQuizMascotImage } from '../quiz.assets';
import { QUIZ_MOOD } from '../quiz.constants';
import type { PlayerRank } from '@/features/rank/rank.types';
import type { ExamQuestion, QuizState } from '../quiz.types';
import { AppToolbar } from '@/features/shared/components/app-toolbar';
import { QuizProgress } from './quiz-progress';
import { QuizAnswerOptions } from './quiz-answer-options';
import { QuizQuestion } from './quiz-question';
import { QuizQuestionDrama } from './quiz-question-drama';
import { QuizFunFact } from './quiz-fun-fact';
import { QuizMascotSpeechBubble } from './quiz-mascot-speech-bubble';
import { QuizStreakBadge } from './quiz-streak-badge';
import { QuizConfettiBurst } from './quiz-confetti-burst';

interface QuizActiveProps {
  answerQuestion: (selectedOptionId: string) => void;
  answerError: string | null;
  answeredCount: number;
  selectPlayer: () => void;
  cheerIdx: number;
  confettiKey: number;
  correctImage: string;
  wrongImage: string;
  currentQuestion: ExamQuestion;
  currentMmrRank?: PlayerRank | null;
  currentRank: { emoji: string; title: string };
  goToNext: () => void;
  goToPrevious: () => void;
  hasAnsweredCurrentQuestion: boolean;
  isSavingSummary: boolean;
  isSubmittingAnswer: boolean;

  onShowSummary: () => void | Promise<void>;
  pageKey: number;
  playerName: string;
  questions: ExamQuestion[];
  quizState: QuizState;
  selectedAnswer: string | undefined;
  summarySaveError: string | null;
  sympathyIdx: number;
}

function useSwipe(onUp: () => void, onDown: () => void) {
  const startYRef = useRef<number | null>(null);
  const canSwipeUpRef = useRef(false);
  const canSwipeDownRef = useRef(false);

  const onTouchStart = useCallback((event: TouchEvent) => {
    startYRef.current = event.touches[0].clientY;

    const documentHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const scrollTop = window.scrollY;
    const hasScrollableContent = documentHeight > viewportHeight + 1;

    canSwipeUpRef.current =
      !hasScrollableContent || scrollTop + viewportHeight >= documentHeight - 1;
    canSwipeDownRef.current = !hasScrollableContent || scrollTop <= 1;
  }, []);

  const onTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (startYRef.current === null) return;

      const deltaY = event.changedTouches[0].clientY - startYRef.current;
      startYRef.current = null;
      if (Math.abs(deltaY) < 60) return;

      if (deltaY < 0 && canSwipeUpRef.current) onUp();
      if (deltaY > 0 && canSwipeDownRef.current) onDown();
    },
    [onDown, onUp],
  );

  return { onTouchEnd, onTouchStart };
}

export function QuizActive({
  answerQuestion,
  answerError,
  answeredCount,
  selectPlayer,
  cheerIdx,
  confettiKey,
  correctImage,
  wrongImage,
  currentQuestion,
  currentMmrRank,
  currentRank,
  goToNext,
  goToPrevious,
  hasAnsweredCurrentQuestion,
  isSavingSummary,
  isSubmittingAnswer,
  onShowSummary,
  pageKey,
  playerName,
  questions,
  quizState,
  selectedAnswer,
  summarySaveError,
  sympathyIdx,
}: QuizActiveProps) {
  const swipe = useSwipe(goToNext, goToPrevious);
  const mascotAnimation =
    quizState.mood === QUIZ_MOOD.CORRECT
      ? 'animate-pop'
      : quizState.mood === QUIZ_MOOD.WRONG
        ? 'animate-shake'
        : 'animate-floaty';
  const canShowSummary = questions.length > 0;

  return (
    <div
      {...swipe}
      data-testid="quiz-active"
      className="relative flex min-h-screen touch-pan-y flex-col items-center justify-between overflow-x-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 font-sans"
    >
      <QuizConfettiBurst burstKey={confettiKey} streak={quizState.streak} />
      <div className="pointer-events-none absolute inset-x-0 top-[-2rem] z-0 flex justify-center">
        <Image
          src={getQuizMascotImage(quizState.mood, correctImage, wrongImage)}
          alt=""
          width={1408}
          height={768}
          loading="eager"
          aria-hidden
          className={`h-[36rem] w-[36rem] max-h-none max-w-none object-contain drop-shadow-xl transition-all duration-300 ${mascotAnimation}`}
        />
      </div>

      <div className="fixed inset-x-0 top-0 z-30 px-4">
        <AppToolbar playerName={playerName} selectPlayer={selectPlayer} currentRank={currentRank} currentMmrRank={currentMmrRank} />
      </div>

      <div className="relative z-10 flex w-full max-w-lg flex-col gap-6 pb-24 pt-16">
        <div
          key={`mascot-${quizState.mood}-${quizState.currentQIndex}`}
          className="relative z-10 flex h-48 w-full items-center justify-center"
        >
          <QuizMascotSpeechBubble
            cheerIdx={cheerIdx}
            mood={quizState.mood}
            playerName={playerName}
            sympathyIdx={sympathyIdx}
          />
        </div>

        <div className="relative w-full">
          {quizState.streak > 1 && <QuizStreakBadge streak={quizState.streak} />}
          <QuizProgress answeredCount={answeredCount} totalQuestions={questions.length} />
        </div>

        <div key={`card-${pageKey}`} className="w-full space-y-4 rounded-3xl bg-white p-6 shadow-xl animate-bounce-in">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                ข้อ {quizState.currentQIndex + 1}/{questions.length}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {hasAnsweredCurrentQuestion ? '✓ ตอบแล้ว' : '⚡ ตอบเลย!'}
            </span>
          </div>
          <QuizQuestion>{currentQuestion.english}</QuizQuestion>
          <QuizQuestionDrama>{currentQuestion.thai_drama}</QuizQuestionDrama>
          <QuizAnswerOptions
            answerQuestion={answerQuestion}
            currentQuestion={currentQuestion}
            hasAnsweredCurrentQuestion={hasAnsweredCurrentQuestion}
            selectedAnswer={selectedAnswer}
          />
          {answerError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{answerError}</p>}

          {hasAnsweredCurrentQuestion && currentQuestion.funFact ? (
            <QuizFunFact>{currentQuestion.funFact}</QuizFunFact>
          ) : null}
        </div>

        <div className="flex w-full max-w-lg items-center justify-between gap-4">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={quizState.currentQIndex === 0 || isSubmittingAnswer}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold transition-all active:scale-95 ${
              quizState.currentQIndex === 0
                ? 'cursor-not-allowed bg-gray-100 text-gray-300'
                : 'cursor-pointer border-2 border-purple-200 bg-white text-purple-600 shadow-sm hover:border-purple-400 hover:bg-purple-50'
            }`}
          >
            <span aria-hidden>←</span>
            ข้อก่อนหน้า
          </button>
          <button
            type="button"
            onClick={goToNext}
            disabled={quizState.currentQIndex === questions.length - 1 || isSubmittingAnswer}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 font-bold text-white shadow-lg transition-all hover:shadow-pink-500/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {'ข้อถัดไป'}
            <span aria-hidden>→</span>
          </button>
        </div>

        {canShowSummary && (
          <div className="flex w-full justify-center">
            <button
              type="button"
              onClick={() => void onShowSummary()}
              disabled={isSubmittingAnswer || isSavingSummary}
              className="cursor-pointer bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-sm font-bold text-transparent underline decoration-purple-300 underline-offset-4 transition-opacity hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSavingSummary ? 'กำลังบันทึก...' : 'สรุปผลตอนนี้'}
            </button>
          </div>
        )}
        {summarySaveError && (
          <p className="text-center text-sm font-bold text-red-600" role="alert">
            {summarySaveError}
          </p>
        )}

      </div>
    </div>
  );
}
