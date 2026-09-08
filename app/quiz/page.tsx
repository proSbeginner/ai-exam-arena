'use client';

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
      hasQuizSetup={hasQuizSetup}
      isQuizSetupReady={isQuizSetupReady}
      isSubmittingAnswer={isSubmittingAnswer}
      isSavingSummary={isSavingSummary}
      isPlayerReady={isPlayerReady}
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
