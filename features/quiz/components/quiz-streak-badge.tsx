import { getStreakTitle } from '../quiz.logic';
import { QuizStreakFire } from './quiz-streak-fire';

interface QuizStreakBadgeProps {
  streak: number;
}

export function QuizStreakBadge({ streak }: QuizStreakBadgeProps) {
  const streakTitle = getStreakTitle(streak);

  return (
    <div className="absolute -right-6 -top-12 z-10 flex flex-col items-center rounded-full bg-transparent px-3 py-1 text-2xl font-bold text-orange-600 animate-bounce-in">
      <div className="flex items-center gap-1 self-end">
        <span className="relative z-10"><QuizStreakFire /></span>
        <span key={streak} className="relative -left-3.5 top-3 z-10 animate-streak-count-in">x{streak}</span>
      </div>
      {streakTitle ? (
        <span key={streak} className="relative -left-3.5 top-1.5 z-10 animate-streak-title-in bg-gradient-to-r from-red-600 via-orange-500 to-amber-300 bg-[length:200%_auto] bg-clip-text text-3xl font-black uppercase tracking-wide text-transparent">
          {streakTitle}
        </span>
      ) : null}
    </div>
  );
}
