'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { getRankAsset } from '@/features/rank/rank.assets';
import type { PlayerRank } from '@/features/rank/rank.types';

import { RankEmblemBadge } from './rank-emblem-badge';

interface RankEmblemTooltipProps {
  rank: PlayerRank;
  compact?: boolean;
}

export function RankEmblemTooltip({ rank, compact = false }: RankEmblemTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLSpanElement>(null);
  const asset = getRankAsset(rank.name);
  const stars = rank.stars > 0 ? '★'.repeat(rank.stars) : 'ยังไม่มีดาว';

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [isOpen]);

  const toggle = () => {
    if (!isOpen && containerRef.current) {
      const bounds = containerRef.current.getBoundingClientRect();
      setPosition(
        compact
          ? { top: bounds.top + bounds.height / 2, left: bounds.right - 16 }
          : { top: bounds.bottom + 8, left: bounds.left + bounds.width / 2 },
      );
    }
    setIsOpen((open) => !open);
  };

  return (
    <span ref={containerRef} className="relative z-[11] inline-flex">
      <button
        type="button"
        onClick={toggle}
        aria-label={`ดูรายละเอียด Rank ${rank.name}`}
        aria-expanded={isOpen}
        className="cursor-pointer rounded-full border border-transparent bg-transparent p-0 shadow-none sm:hidden"
      >
        <Image src={asset} alt="" width={36} height={36} className="size-9 object-contain" aria-hidden />
      </button>

      {isOpen && typeof document !== 'undefined'
        ? createPortal(
            <span
              role="tooltip"
              style={{ top: position.top, left: position.left }}
              className={`fixed z-50 flex w-56 flex-col items-center gap-0.5 rounded-2xl bg-gradient-to-br from-fuchsia-500/85 via-purple-500/85 to-indigo-600/85 p-4 text-center text-white shadow-xl backdrop-blur-sm ${compact ? '-translate-y-1/2 before:absolute before:-left-2 before:top-1/2 before:-translate-y-1/2 before:border-y-8 before:border-r-8 before:border-y-transparent before:border-r-fuchsia-500/85' : '-translate-x-1/2 before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2 before:border-x-8 before:border-b-8 before:border-x-transparent before:border-b-fuchsia-500/85'} before:content-['']`}
            >
              <Image
                src={asset}
                alt=""
                width={144}
                height={144}
                className="size-36 object-contain drop-shadow-lg animate-rank-artwork-in"
                aria-hidden
              />
              <span className="-mt-2 text-amber-200" aria-label={`${rank.stars} ดาว`}>{stars}</span>
              <strong className="text-lg font-black">{rank.name}</strong>
              <span className="text-xs font-bold">{rank.mmr.toLocaleString()} MMR</span>
            </span>,
            document.body,
          )
        : null}

      <span className="hidden sm:inline-flex">
        <RankEmblemBadge rank={rank} compact={compact} />
      </span>
    </span>
  );
}
