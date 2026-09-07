import Link from 'next/link';

import { APP_ROUTES } from '@/features/shared/routes';

export function LeaderboardLink({
  inline = false,
  className = '',
  showTrophy = true,
  variant = 'default',
}: {
  inline?: boolean;
  className?: string;
  showTrophy?: boolean;
  variant?: 'default' | 'header';
}) {
  const linkClassName =
    variant === 'header'
      ? 'cursor-pointer text-xs text-gray-400 transition-colors hover:text-pink-500'
      : 'cursor-pointer text-sm font-bold text-purple-500 underline decoration-purple-200 underline-offset-4 transition-colors hover:text-pink-500';

  return (
    <div className={`relative z-10 flex justify-center ${inline ? '' : 'mt-4'} ${className}`}>
      <Link
        href={APP_ROUTES.leaderboard}
        className={linkClassName}
      >
        ดูอันดับการแข่งขัน{showTrophy ? ' 🏆' : ''}
      </Link>
    </div>
  );
}
