import type { ExamQuestion } from '../quiz.types';
import { HoldToAnswerButton } from './hold-to-answer-button';

interface QuizAnswerOptionsProps {
  answerQuestion: (selectedOptionId: string) => void;
  currentQuestion: ExamQuestion;
  hasAnsweredCurrentQuestion: boolean;
  selectedAnswer: string | undefined;
}

export function QuizAnswerOptions({
  answerQuestion,
  currentQuestion,
  hasAnsweredCurrentQuestion,
  selectedAnswer,
}: QuizAnswerOptionsProps) {
  return (
    <div className="space-y-3 pt-2">
      {currentQuestion.options.map((option, index) => {
        const isCorrectOption = option.id === currentQuestion.correctOptionId;
        const isWrongSelection =
          hasAnsweredCurrentQuestion && selectedAnswer === option.id && !isCorrectOption;

        return (
          <HoldToAnswerButton
            key={option.id}
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
                <span>{option.english}</span>
                <span className="mt-1 block text-xs text-gray-400">{option.thai_drama}</span>
              </span>
            </span>
            {hasAnsweredCurrentQuestion && isCorrectOption && <span className="text-lg font-bold text-green-500">✓</span>}
            {isWrongSelection && <span className="text-lg font-bold text-red-500">✗</span>}
          </HoldToAnswerButton>
        );
      })}
    </div>
  );
}
