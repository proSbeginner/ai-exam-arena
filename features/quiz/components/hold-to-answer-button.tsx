'use client';

import { useEffect, useId, useRef, useState, type PointerEvent, type ReactNode } from 'react';

const HOLD_DURATION_MS = 800;

interface HoldToAnswerButtonProps {
  children: ReactNode;
  className: string;
  disabled?: boolean;
  onConfirm: () => void;
}

export function HoldToAnswerButton({
  children,
  className,
  disabled = false,
  onConfirm,
}: HoldToAnswerButtonProps) {
  const gradientId = `hold-answer-rainbow-${useId().replace(/:/g, '')}`;
  const [progress, setProgress] = useState(0);
  const [buttonSize, setButtonSize] = useState({ width: 0, height: 0 });
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const clearHold = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    timerRef.current = null;
    animationFrameRef.current = null;
    startedAtRef.current = null;
    setProgress(0);
  };

  useEffect(() => clearHold, []);

  const startHold = (event: PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const { width, height } = event.currentTarget.getBoundingClientRect();
    setButtonSize({ width, height });
    startedAtRef.current = performance.now();
    const updateProgress = (now: number) => {
      if (startedAtRef.current === null) return;

      const nextProgress = Math.min((now - startedAtRef.current) / HOLD_DURATION_MS, 1);
      setProgress(nextProgress);
      if (nextProgress < 1) animationFrameRef.current = requestAnimationFrame(updateProgress);
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);
    timerRef.current = setTimeout(() => {
      clearHold();
      onConfirm();
    }, HOLD_DURATION_MS);

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  return (
    <button
      type="button"
      className={`relative cursor-pointer overflow-hidden disabled:cursor-not-allowed ${className}`}
      disabled={disabled}
      onPointerCancel={clearHold}
      onPointerDown={startHold}
      onPointerLeave={clearHold}
      onPointerUp={clearHold}
      aria-label="กดค้างเพื่อเลือกคำตอบ"
    >
      {children}
      {progress > 0 && buttonSize.width > 0 && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${buttonSize.width} ${buttonSize.height}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="50%" stopColor="#c026d3" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
          </defs>
          <rect
            x="2"
            y="2"
            width={Math.max(buttonSize.width - 4, 0)}
            height={Math.max(buttonSize.height - 4, 0)}
            rx="14"
            ry="14"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="4"
            strokeLinejoin="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - progress * 100}
          />
        </svg>
      )}
    </button>
  );
}
