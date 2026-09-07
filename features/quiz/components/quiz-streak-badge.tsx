interface QuizStreakBadgeProps {
  streak: number;
}

export function QuizStreakBadge({ streak }: QuizStreakBadgeProps) {
  return (
    <div className="absolute -left-3 -top-3 z-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg animate-bounce-in">
      🔥 x{streak}
    </div>
  );
}
