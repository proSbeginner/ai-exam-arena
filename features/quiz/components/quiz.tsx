'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import {
  CHEER_MESSAGES,
  MOOD_IMAGES,
  SYMPATHY_MESSAGES,
} from '@/data/questions';
import type { ExamQuestion } from '@/data/questions';
import { AppLoadingSkeleton } from '@/features/shared/components/app-loading-skeleton';

import type { QuizState } from '../quiz.types';

interface QuizProps {
  answerQuestion: (selectedOptionIndex: number) => void;
  answeredCount: number;
  changePlayerName: () => void;
  cheerIdx: number;
  confettiKey: number;
  correctImage: string;
  currentQuestion: ExamQuestion | undefined;
  currentRank: { emoji: string; title: string };
  goToNext: () => void;
  goToPrevious: () => void;
  hasAnsweredCurrentQuestion: boolean;
  isPlayerReady: boolean;
  pageKey: number;
  playerName: string | null;
  questionLoadError: string | null;
  questionLoadStatus: 'loading' | 'ready' | 'empty' | 'error';
  questions: ExamQuestion[];
  quizState: QuizState;
  restartGame: () => void;
  retryQuestionLoad: () => void;
  selectedAnswer: number | undefined;
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
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function useSwipe(onUp: () => void, onDown: () => void) {
  const startYRef = useRef<number | null>(null);

  const onTouchStart = useCallback((event: React.TouchEvent) => {
    startYRef.current = event.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (startYRef.current === null) return;

      const deltaY = event.changedTouches[0].clientY - startYRef.current;
      startYRef.current = null;
      if (Math.abs(deltaY) < 60) return;

      if (deltaY < 0) onUp();
      else onDown();
    },
    [onDown, onUp],
  );

  return { onTouchEnd, onTouchStart };
}

export function Quiz({
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
}: QuizProps) {
  const router = useRouter();

  useEffect(() => {
    if (isPlayerReady && !playerName) {
      router.replace('/welcome');
    }
  }, [isPlayerReady, playerName, router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') goToNext();
      if (event.key === 'ArrowLeft') goToPrevious();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  const swipe = useSwipe(goToNext, goToPrevious);

  if (!isPlayerReady || !playerName) {
    return <AppLoadingSkeleton variant="quiz" />;
  }

  if (questionLoadStatus === 'loading') {
    return <AppLoadingSkeleton variant="quiz" />;
  }

  if (questionLoadStatus === 'error') {
    return (
      <QuizNotice
        heading="ไม่สามารถโหลดคำถามได้"
        message={questionLoadError ?? 'กรุณาลองใหม่อีกครั้ง'}
        actionLabel="ลองใหม่"
        onAction={retryQuestionLoad}
      />
    );
  }

  if (questionLoadStatus === 'empty' || !currentQuestion) {
    return (
      <QuizNotice
        heading="ยังไม่มีคำถามในชุดนี้"
        message="ผู้ดูแลระบบยังไม่ได้เผยแพร่คำถามสำหรับการฝึกฝน"
        actionLabel="เปลี่ยนชื่อผู้เล่น"
        onAction={changePlayerName}
      />
    );
  }

  const mascotAnimation =
    quizState.mood === 'correct'
      ? 'animate-pop'
      : quizState.mood === 'wrong'
        ? 'animate-shake'
        : 'animate-floaty';
  const progress = ((answeredCount + 1) / questions.length) * 100;

  return (
    <div
      {...swipe}
      className="flex min-h-screen touch-pan-y flex-col items-center justify-between bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 font-sans"
    >
      <ConfettiBurst burstKey={confettiKey} />
      <header className="flex w-full max-w-lg items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <h1 className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
            AI EXAM ARENA
          </h1>
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
            {currentRank.emoji} {currentRank.title}
          </span>
        </div>
        <button
          type="button"
          onClick={changePlayerName}
          className="text-xs text-gray-400 transition-colors hover:text-pink-500"
        >
          เปลี่ยนชื่อ 👋
        </button>
      </header>

      {!quizState.gameOver ? (
        <div className="flex w-full max-w-lg flex-col gap-6 pb-8">
          <div key={`mascot-${quizState.mood}-${quizState.currentQIndex}`} className="relative flex flex-col items-center">
            {quizState.streak > 1 && (
              <div className="absolute -left-3 -top-3 z-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg animate-bounce-in">
                🔥 x{quizState.streak}
              </div>
            )}
            <Image
              src={quizState.mood === 'correct' ? correctImage : MOOD_IMAGES[quizState.mood]}
              alt={`Mascot is ${quizState.mood}`}
              width={1408}
              height={768}
              className={`h-48 w-48 object-contain drop-shadow-xl transition-all duration-300 ${mascotAnimation}`}
            />
            <div className="absolute right-[-10px] top-2 w-36 rounded-xl border-2 border-purple-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-md animate-bounce sm:right-[-30px]">
              {quizState.mood === 'idle' && `พร้อมแล้วนะ ${playerName}~! 💖`}
              {quizState.mood === 'correct' && CHEER_MESSAGES[cheerIdx]}
              {quizState.mood === 'wrong' && SYMPATHY_MESSAGES[sympathyIdx]}
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

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
                const isCorrectOption = index === currentQuestion.correctIndex;
                const isWrongSelection =
                  hasAnsweredCurrentQuestion && selectedAnswer === index && !isCorrectOption;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => answerQuestion(index)}
                    disabled={hasAnsweredCurrentQuestion}
                    className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left transition-all ${
                      hasAnsweredCurrentQuestion && isCorrectOption
                        ? 'border-green-400 bg-green-50'
                        : isWrongSelection
                          ? 'border-red-400 bg-red-50'
                          : 'border-gray-100 hover:border-pink-300 hover:bg-pink-50'
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
                        {option}
                      </span>
                    </span>
                    {hasAnsweredCurrentQuestion && isCorrectOption && <span className="text-lg font-bold text-green-500">✓</span>}
                    {isWrongSelection && <span className="text-lg font-bold text-red-500">✗</span>}
                    {!hasAnsweredCurrentQuestion && <span className="font-bold text-pink-400 opacity-0 transition-opacity group-hover:opacity-100">→</span>}
                  </button>
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

          <div className="hidden w-full max-w-lg items-center justify-between gap-4 md:flex">
            <button
              type="button"
              onClick={goToPrevious}
              disabled={quizState.currentQIndex === 0}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold transition-all active:scale-95 ${
                quizState.currentQIndex === 0
                  ? 'cursor-not-allowed bg-gray-100 text-gray-300'
                  : 'border-2 border-purple-200 bg-white text-purple-600 shadow-sm hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              <span aria-hidden>←</span>
              ข้อก่อนหน้า
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 font-bold text-white shadow-lg transition-all hover:shadow-pink-500/30 active:scale-95"
            >
              {answeredCount >= questions.length ? 'ดูผลลัพธ์' : 'ข้อถัดไป'}
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-lg space-y-4 rounded-3xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur-xl animate-bounce-in">
          <Image
            src={MOOD_IMAGES[quizState.mood]}
            alt="Quiz result mascot"
            width={1408}
            height={768}
            className={`mx-auto h-40 w-40 object-contain drop-shadow-xl ${quizState.mood === 'passed' ? 'animate-wiggle' : ''}`}
          />
          <h1 className="text-3xl font-extrabold text-gray-800">
            {quizState.score >= Math.ceil(questions.length / 2) ? '🎉 PASSED!' : '😭 TRY AGAIN'}
          </h1>
          <p className="text-sm text-gray-500">คุณได้คะแนน</p>
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-5xl font-black text-transparent">
            {quizState.score}/{questions.length}
          </div>
          <p className="text-sm text-gray-600">
            {quizState.score >= Math.ceil(questions.length / 2)
              ? `${playerName} เก่งมาก! พร้อมไปสอบจริงแล้ว~ ✨`
              : `${playerName} อย่าท้อใจนะ ลองทบทวนแล้วมาใหม่! 💪`}
          </p>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={restartGame}
              className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 font-bold text-white shadow-lg transition-all hover:shadow-pink-500/30 active:scale-95"
            >
              เล่นอีกครั้ง 🚀
            </button>
          </div>
          <button
            type="button"
            onClick={changePlayerName}
            className="mt-2 block w-full text-xs text-gray-400 underline hover:text-pink-500"
          >
            เปลี่ยนชื่อเล่น
          </button>
        </div>
      )}
    </div>
  );
}

function QuizNotice({
  actionLabel,
  heading,
  message,
  onAction,
}: {
  actionLabel: string;
  heading: string;
  message: string;
  onAction: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <section className="w-full max-w-md space-y-4 rounded-3xl bg-white p-8 text-center shadow-xl">
        <div className="text-4xl" aria-hidden>📝</div>
        <h1 className="text-2xl font-extrabold text-gray-800">{heading}</h1>
        <p className="text-sm text-gray-500">{message}</p>
        <button
          type="button"
          onClick={onAction}
          className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 font-bold text-white shadow-lg transition-all active:scale-95"
        >
          {actionLabel}
        </button>
      </section>
    </main>
  );
}
