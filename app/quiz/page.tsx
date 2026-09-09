'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/features/shared/routes';
import { QuizSkeleton } from '@/features/quiz/components/quiz-skeleton';

import { Quiz } from '@/features/quiz/components/quiz';
import { useQuiz } from '@/features/quiz/quiz.hook';

export default function QuizPage() {
  const {
    answerError,
    answerQuestion,
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
    isSubmittingAnswer,
    isSavingSummary,
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
    summarySaveError,
    sympathyIdx,
  } = useQuiz();
  const router = useRouter();

  useEffect(() => {
    if (!isQuizSetupReady) return;
    if (isPlayerReady && !playerName) router.replace(APP_ROUTES.welcome);
    if (isPlayerReady && playerName && !hasQuizSetup) router.replace(APP_ROUTES.quizSetup);
  }, [hasQuizSetup, isPlayerReady, isQuizSetupReady, playerName, router]);

  if (!isQuizSetupReady || !isPlayerReady || !playerName || !hasQuizSetup || questionLoadStatus === 'loading') {
    return <QuizSkeleton />;
  }

  return (
    <Quiz
      answerError={answerError}
      answerQuestion={answerQuestion}
      answeredCount={answeredCount}
      selectPlayer={selectPlayer}
      cheerIdx={cheerIdx}
      confettiKey={confettiKey}
      correctImage={correctImage}
      wrongImage={wrongImage}
      currentQuestion={currentQuestion}
      currentMmrRank={currentMmrRank}
      currentRank={currentRank}
      goToNext={goToNext}
      goToPrevious={goToPrevious}
      hasAnsweredCurrentQuestion={hasAnsweredCurrentQuestion}
      isSubmittingAnswer={isSubmittingAnswer}
      isSavingSummary={isSavingSummary}
      pageKey={pageKey}
      playerName={playerName}
      questionLoadError={questionLoadError}
      questionLoadStatus={questionLoadStatus}
      questions={questions}
      quizState={quizState}
      restartGame={restartGame}
      resumeQuiz={resumeQuiz}
      retryQuestionLoad={retryQuestionLoad}
      selectedAnswer={selectedAnswer}
      showSummary={showSummary}
      summarySaveError={summarySaveError}
      sympathyIdx={sympathyIdx}
    />
  );
}
