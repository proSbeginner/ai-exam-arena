'use client';

import { Quiz } from '@/features/quiz/components/quiz';
import { useQuiz } from '@/features/quiz/quiz.hook';

export default function QuizPage() {
  const {
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
  } = useQuiz();

  return (
    <Quiz
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
      hasQuizSetup={hasQuizSetup}
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
      sympathyIdx={sympathyIdx}
    />
  );
}
