interface QuizQuestionProps {
  children: string;
}

export function QuizQuestion({ children }: QuizQuestionProps) {
  return <h2 className="text-base font-bold leading-relaxed text-gray-800">{children}</h2>;
}
