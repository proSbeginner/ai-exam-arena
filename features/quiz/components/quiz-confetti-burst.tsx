'use client';

import type { CSSProperties } from 'react';

function getParticles(count: number) {
  const colors = ['#f472b6', '#a78bfa', '#60a5fa', '#fbbf24', '#34d399', '#fb923c'];
  const sizes = ['h-3 w-2', 'h-2.5 w-1.5', 'h-2 w-2.5', 'h-4 w-1'];

  return Array.from({ length: count }, (_, index) => {
    const randomValues = new Uint32Array(4);
    crypto.getRandomValues(randomValues);

    return {
      id: index,
      color: colors[index % colors.length],
      size: sizes[index % sizes.length],
      left: `${randomValues[0] % 100}%`,
      delay: `${(randomValues[1] % 500) / 1000}s`,
      dx: `${Number(randomValues[2] % 401) - 200}px`,
      rot: `${randomValues[3] % 720}deg`,
      duration: `${1.5 + (randomValues[0] % 1500) / 1000}s`,
    };
  });
}

function getConfettiCount(streak: number): number {
  if (streak >= 10) return 60;
  if (streak >= 5) return 35;
  return 20;
}

export function QuizConfettiBurst({ burstKey, streak }: { burstKey: number; streak: number }) {
  if (burstKey === 0) return null;

  return (
    <div key={burstKey} className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {getParticles(getConfettiCount(streak)).map((particle) => (
        <div
          key={particle.id}
          className={`confetti-piece ${particle.size}`}
          style={{
            left: particle.left,
            backgroundColor: particle.color,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
            '--dx': particle.dx,
            '--rot': particle.rot,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
