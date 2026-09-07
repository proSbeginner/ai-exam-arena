interface QuizQuestionDramaProps {
  children: string;
}

export function QuizQuestionDrama({ children }: QuizQuestionDramaProps) {
  return (
    <p className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-sm italic text-purple-600">
      &ldquo;{children}&rdquo;
    </p>
  );
}
