'use client';

import { Quiz } from '@/features/quiz/components/quiz';
import { useQuizStore } from '@/features/quiz/quiz.store';

export default function QuizPage() {
  const {
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
  } = useQuizStore();

  return (
    <Quiz
      answerQuestion={answerQuestion}
      answeredCount={answeredCount}
      changePlayerName={changePlayerName}
      cheerIdx={cheerIdx}
      confettiKey={confettiKey}
      correctImage={correctImage}
      currentQuestion={currentQuestion}
      currentRank={currentRank}
      goToNext={goToNext}
      goToPrevious={goToPrevious}
      hasAnsweredCurrentQuestion={hasAnsweredCurrentQuestion}
      isPlayerReady={isPlayerReady}
      pageKey={pageKey}
      playerName={playerName}
      questionLoadError={questionLoadError}
      questionLoadStatus={questionLoadStatus}
      questions={questions}
      quizState={quizState}
      restartGame={restartGame}
      retryQuestionLoad={retryQuestionLoad}
      selectedAnswer={selectedAnswer}
      sympathyIdx={sympathyIdx}
    />
  );
}
