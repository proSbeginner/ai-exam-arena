interface QuizProgressProps {
  answeredCount: number;
  totalQuestions: number;
}

export function QuizProgress({ answeredCount, totalQuestions }: QuizProgressProps) {
  const progress = totalQuestions > 0
    ? Math.min(Math.max((answeredCount / totalQuestions) * 100, 0), 100)
    : 0;

  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
      role="progressbar"
      aria-label="ความคืบหน้าการทำข้อสอบ"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
