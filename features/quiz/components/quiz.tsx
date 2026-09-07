'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { APP_ROUTES } from '@/features/shared/routes';

import type { ExamQuestion, QuizState } from '../quiz.types';
import { QuizActive } from './quiz-active';
import { QuizLoadingSkeleton } from './quiz-loading-skeleton';
import { QuizNotice } from './quiz-notice';
import { QuizResult } from './quiz-result';

interface QuizProps {
  answerQuestion: (selectedOptionId: string) => void;
  answeredCount: number;
  changePlayerName: () => void;
  cheerIdx: number;
  confettiKey: number;
  correctImage: string;
  wrongImage: string;
  currentQuestion: ExamQuestion | undefined;
  currentRank: { emoji: string; title: string };
  goToNext: () => void;
  goToPrevious: () => void;
  hasAnsweredCurrentQuestion: boolean;
  hasQuizSetup: boolean;
  isPlayerReady: boolean;
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
  hasQuizSetup,
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
}: QuizProps) {
  const router = useRouter();

  useEffect(() => {
    if (isPlayerReady && !playerName) {
      router.replace(APP_ROUTES.welcome);
    }
    if (isPlayerReady && playerName && !hasQuizSetup) {
      router.replace(APP_ROUTES.quizSetup);
    }
  }, [hasQuizSetup, isPlayerReady, playerName, router]);

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

  return !quizState.summaryVisible ? (
    <QuizActive
      answerQuestion={answerQuestion}
      answeredCount={answeredCount}
      changePlayerName={changePlayerName}
      cheerIdx={cheerIdx}
      confettiKey={confettiKey}
      correctImage={correctImage}
      wrongImage={wrongImage}
      currentQuestion={currentQuestion}
      currentRank={currentRank}
      goToNext={goToNext}
      goToPrevious={goToPrevious}
      hasAnsweredCurrentQuestion={hasAnsweredCurrentQuestion}
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
      changePlayerName={changePlayerName}
      currentRank={currentRank}
      onResume={resumeQuiz}
      playerName={playerName}
      questions={questions}
      quizState={quizState}
      restartGame={restartGame}
    />
  );
}
