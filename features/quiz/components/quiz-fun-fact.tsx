interface QuizFunFactProps {
  children: string;
}

export function QuizFunFact({ children }: QuizFunFactProps) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-800 animate-bounce-in">
      <span className="font-bold">💡 รู้หรือไม่? </span>
      {children}
    </div>
  );
}
