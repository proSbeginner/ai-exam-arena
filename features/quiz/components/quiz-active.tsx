'use client';

import Image from 'next/image';
import { useCallback, useRef, type CSSProperties, type TouchEvent } from 'react';

import { MOOD_IMAGES } from '../quiz.assets';
import { CHEER_MESSAGES, FAILED_MESSAGE, PASSED_MESSAGE, SYMPATHY_MESSAGES } from '../quiz.content';
import type { ExamQuestion, QuizState } from '../quiz.types';
import { QuizHeader } from './quiz-header';
import { QuizProgress } from './quiz-progress';
import { HoldToAnswerButton } from './hold-to-answer-button';

interface QuizActiveProps {
  answerQuestion: (selectedOptionId: string) => void;
  answeredCount: number;
  changePlayerName: () => void;
  cheerIdx: number;
  confettiKey: number;
  correctImage: string;
  wrongImage: string;
  currentQuestion: ExamQuestion;
  currentRank: { emoji: string; title: string };
  goToNext: () => void;
  goToPrevious: () => void;
  hasAnsweredCurrentQuestion: boolean;
  onShowSummary: () => void;
  pageKey: number;
  playerName: string;
  questions: ExamQuestion[];
  quizState: QuizState;
  selectedAnswer: string | undefined;
  sympathyIdx: number;
}

function getParticles(count: number) {
  const colors = ['#f472b6', '#a78bfa', '#60a5fa', '#fbbf24', '#34d399', '#fb923c'];
  const sizes = ['h-3 w-2', 'h-2.5 w-1.5', 'h-2 w-2.5', 'h-4 w-1'];

  return Array.from({ length: count }, (_, index) => {
    const randomValues = new Uint32Array(4);
    crypto.getRandomValues(randomValues);

    return {
      id: index,
      color: colors[index % colors.length],
      size: sizes[index % sizes.length],
      left: `${randomValues[0] % 100}%`,
      delay: `${(randomValues[1] % 500) / 1000}s`,
      dx: `${Number(randomValues[2] % 401) - 200}px`,
      rot: `${randomValues[3] % 720}deg`,
      duration: `${1.5 + (randomValues[0] % 1500) / 1000}s`,
    };
  });
}

function ConfettiBurst({ burstKey }: { burstKey: number }) {
  if (burstKey === 0) return null;

  return (
    <div key={burstKey} className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {getParticles(30).map((particle) => (
        <div
          key={particle.id}
          className={`confetti-piece ${particle.size}`}
          style={{
            left: particle.left,
            backgroundColor: particle.color,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
            '--dx': particle.dx,
            '--rot': particle.rot,
          } as CSSProperties}
        />
      ))}
    </div>
  );
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
  onShowSummary,
  pageKey,
  playerName,
  questions,
  quizState,
  selectedAnswer,
  sympathyIdx,
}: QuizActiveProps) {
  const swipe = useSwipe(goToNext, goToPrevious);
  const mascotAnimation =
    quizState.mood === 'correct'
      ? 'animate-pop'
      : quizState.mood === 'wrong'
        ? 'animate-shake'
        : 'animate-floaty';

  return (
    <div
      {...swipe}
      data-testid="quiz-active"
      className="relative flex min-h-screen touch-pan-y flex-col items-center justify-between overflow-x-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 font-sans"
    >
      <ConfettiBurst burstKey={confettiKey} />
      <div className="pointer-events-none absolute inset-x-0 top-[-2rem] z-0 flex justify-center">
        <Image
          src={
            quizState.mood === 'correct'
              ? correctImage
              : quizState.mood === 'wrong'
                ? wrongImage
                : MOOD_IMAGES[quizState.mood]
          }
          alt=""
          width={1408}
          height={768}
          loading="eager"
          aria-hidden
          className={`h-[36rem] w-[36rem] max-h-none max-w-none object-contain drop-shadow-xl transition-all duration-300 ${mascotAnimation}`}
        />
      </div>

      <div className="relative z-10 w-full">
        <QuizHeader changePlayerName={changePlayerName} currentRank={currentRank} />
      </div>

      <div className="relative z-10 flex w-full max-w-lg flex-col gap-6 pb-24">
        <div
          key={`mascot-${quizState.mood}-${quizState.currentQIndex}`}
          className="relative z-10 flex h-48 w-full items-center justify-center"
        >
          {quizState.streak > 1 && (
            <div className="absolute -left-3 -top-3 z-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg animate-bounce-in">
              🔥 x{quizState.streak}
            </div>
          )}
          <div className="absolute left-0 top-2 z-10 w-36 rounded-xl border-2 border-purple-200/70 bg-white/75 px-3 py-2 text-xs font-bold text-gray-700 shadow-md backdrop-blur-sm animate-bounce">
            {quizState.mood === 'idle' && `พร้อมแล้วนะ ${playerName}~! 💖`}
            {quizState.mood === 'correct' && CHEER_MESSAGES[cheerIdx]}
            {quizState.mood === 'wrong' && SYMPATHY_MESSAGES[sympathyIdx]}
            {quizState.mood === 'passed' && PASSED_MESSAGE}
            {quizState.mood === 'failed' && FAILED_MESSAGE}
          </div>
        </div>

        <QuizProgress answeredCount={answeredCount} totalQuestions={questions.length} />

        <div key={`card-${pageKey}`} className="w-full space-y-4 rounded-3xl bg-white p-6 shadow-xl animate-bounce-in">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                ข้อ {quizState.currentQIndex + 1}/{questions.length}
              </span>
              {currentQuestion.chapter && (
                <span className="text-xs font-medium text-purple-400">{currentQuestion.chapter}</span>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {hasAnsweredCurrentQuestion ? '✓ ตอบแล้ว' : '⚡ ตอบเลย!'}
            </span>
          </div>
          <h2 className="text-base font-bold leading-relaxed text-gray-800">{currentQuestion.english}</h2>
          <p className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-sm italic text-purple-600">
            &ldquo;{currentQuestion.thai_drama}&rdquo;
          </p>
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((option, index) => {
              const isCorrectOption = option.id === currentQuestion.correctOptionId;
              const isWrongSelection =
                hasAnsweredCurrentQuestion && selectedAnswer === option.id && !isCorrectOption;

              return (
                <HoldToAnswerButton
                  key={index}
                  onConfirm={() => answerQuestion(option.id)}
                  disabled={hasAnsweredCurrentQuestion}
                  testId={`answer-option-${option.id}`}
                  className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left transition-all ${
                    hasAnsweredCurrentQuestion && isCorrectOption
                      ? 'border-green-400 bg-green-50'
                      : isWrongSelection
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-100 hover:bg-pink-50'
                  } ${hasAnsweredCurrentQuestion ? 'cursor-default' : 'group'}`}
                >
                  <span>
                    <span className="mr-2 font-bold text-pink-500">{String.fromCharCode(65 + index)}.</span>
                    <span
                      className={`font-medium ${
                        hasAnsweredCurrentQuestion && isCorrectOption
                          ? 'text-green-700'
                          : isWrongSelection
                            ? 'text-red-700'
                            : 'text-gray-700 group-hover:text-pink-600'
                      }`}
                    >
                      <span className="block">{option.english}</span>
                      <span className="mt-1 block text-xs text-gray-400">{option.thai_drama}</span>
                    </span>
                  </span>
                  {hasAnsweredCurrentQuestion && isCorrectOption && <span className="text-lg font-bold text-green-500">✓</span>}
                  {isWrongSelection && <span className="text-lg font-bold text-red-500">✗</span>}
                </HoldToAnswerButton>
              );
            })}
          </div>

          {hasAnsweredCurrentQuestion && currentQuestion.funFact ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-800 animate-bounce-in">
              <span className="font-bold">💡 รู้หรือไม่? </span>
              {currentQuestion.funFact}
            </div>
          ) : hasAnsweredCurrentQuestion ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 animate-bounce-in">
              <span className="font-bold">🔑 Hint: </span>
              {currentQuestion.hint_keyword}
            </div>
          ) : null}
        </div>

        <div className="flex w-full max-w-lg items-center justify-between gap-4">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={quizState.currentQIndex === 0}
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
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 font-bold text-white shadow-lg transition-all hover:shadow-pink-500/30 active:scale-95"
          >
            {quizState.currentQIndex === questions.length - 1 ? 'สรุปผลตอนนี้' : 'ข้อถัดไป'}
            <span aria-hidden>→</span>
          </button>
        </div>

        {answeredCount < questions.length && quizState.currentQIndex < questions.length - 1 && (
          <button
            type="button"
            onClick={onShowSummary}
            className="mx-auto cursor-pointer text-sm font-medium text-gray-400 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-purple-500"
          >
            สรุปผลตอนนี้
          </button>
        )}

      </div>
    </div>
  );
}
