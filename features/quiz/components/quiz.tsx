'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { APP_ROUTES } from '@/features/shared/routes';

import type { PlayerRank } from '@/features/rank/rank.types';
import type { ExamQuestion, QuizState } from '../quiz.types';
import { QuizActive } from './quiz-active';
import { QuizLoadingSkeleton } from './quiz-loading-skeleton';
import { QuizNotice } from './quiz-notice';
import { QuizResult } from './quiz-result';

interface QuizProps {
  answerQuestion: (selectedOptionId: string) => void;
  answerError: string | null;
  answeredCount: number;
  selectPlayer: () => void;
  cheerIdx: number;
  confettiKey: number;
  correctImage: string;
  wrongImage: string;
  currentQuestion: ExamQuestion | undefined;
  currentMmrRank?: PlayerRank | null;
  currentRank: { emoji: string; title: string };
  goToNext: () => void;
  goToPrevious: () => void;
  hasAnsweredCurrentQuestion: boolean;
  hasQuizSetup: boolean;
  isQuizSetupReady: boolean;
  isPlayerReady: boolean;
  isSubmittingAnswer: boolean;
  pageKey: number;
  playerName: string | null;
  questionLoadError: string | null;
  questionLoadStatus: 'loading' | 'ready' | 'empty' | 'error';
  questions: ExamQuestion[];
  quizState: QuizState;
  restartGame: () => void;
  resumeQuiz: () => void;
  retryQuestionLoad: () => void;
  selectedAnswer: string | undefined;
  showSummary: () => void;
  sympathyIdx: number;
}

export function Quiz({
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
  hasQuizSetup,
  isQuizSetupReady,
  isPlayerReady,
  isSubmittingAnswer,
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
}: QuizProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isQuizSetupReady) return;
    if (isPlayerReady && !playerName) {
      router.replace(APP_ROUTES.welcome);
    }
    if (isPlayerReady && playerName && !hasQuizSetup) {
      router.replace(APP_ROUTES.quizSetup);
    }
  }, [hasQuizSetup, isPlayerReady, isQuizSetupReady, playerName, router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') goToNext();
      if (event.key === 'ArrowLeft') goToPrevious();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  if (!isPlayerReady || !playerName || !hasQuizSetup) {
    return <QuizLoadingSkeleton />;
  }

  if (questionLoadStatus === 'loading') {
    return <QuizLoadingSkeleton />;
  }

  if (questionLoadStatus === 'error') {
    return (
      <QuizNotice
        heading="ไม่สามารถโหลดคำถามได้"
        message={questionLoadError ?? 'กรุณาลองใหม่อีกครั้ง'}
        actionLabel="ลองใหม่"
        onAction={retryQuestionLoad}
        onSecondaryAction={() => router.push(APP_ROUTES.welcome)}
        secondaryActionLabel="กลับหน้า Welcome"
      />
    );
  }

  if (questionLoadStatus === 'empty' || !currentQuestion) {
    return (
      <QuizNotice
        heading="ยังไม่มีคำถามในชุดนี้"
        message="ผู้ดูแลระบบยังไม่ได้เผยแพร่คำถามสำหรับการฝึกฝน"
        actionLabel="เลือกผู้เล่น"
        onAction={selectPlayer}
      />
    );
  }

  return !quizState.summaryVisible ? (
    <QuizActive
      answerQuestion={answerQuestion}
      answerError={answerError}
      answeredCount={answeredCount}
      selectPlayer={selectPlayer}
      cheerIdx={cheerIdx}
      confettiKey={confettiKey}
      correctImage={correctImage}
      wrongImage={wrongImage}
      currentQuestion={currentQuestion}
      currentRank={currentRank} currentMmrRank={currentMmrRank}
      goToNext={goToNext}
      goToPrevious={goToPrevious}
      hasAnsweredCurrentQuestion={hasAnsweredCurrentQuestion}
      isSubmittingAnswer={isSubmittingAnswer}
      onShowSummary={showSummary}
      pageKey={pageKey}
      playerName={playerName}
      questions={questions}
      quizState={quizState}
      selectedAnswer={selectedAnswer}
      sympathyIdx={sympathyIdx}
    />
  ) : (
    <QuizResult
      answeredCount={answeredCount}
      selectPlayer={selectPlayer}
      currentRank={currentRank} currentMmrRank={currentMmrRank}
      onResume={resumeQuiz}
      playerName={playerName}
      questions={questions}
      quizState={quizState}
      restartGame={restartGame}
    />
  );
}
