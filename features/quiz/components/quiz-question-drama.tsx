interface QuizQuestionDramaProps {
  children: string;
}

export function QuizQuestionDrama({ children }: QuizQuestionDramaProps) {
  if (!children.trim()) return null;

  return (
    <p className="rounded-xl border border-purple-200 bg-purple-50 p-3 text-sm italic text-purple-600">
      {children}
    </p>
  );
}
