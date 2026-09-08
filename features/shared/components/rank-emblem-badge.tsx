'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { getRankAsset } from '@/features/rank/rank.assets';
import type { PlayerRank } from '@/features/rank/rank.types';

interface RankEmblemBadgeProps {
  rank: PlayerRank;
  compact?: boolean;
  mobileIconOnly?: boolean;
}

function getStars(rank: PlayerRank): string {
  return rank.stars > 0 ? "★".repeat(rank.stars) : "ยังไม่มีดาว";
}

export function RankEmblemBadge({ rank, compact = false, mobileIconOnly = false }: RankEmblemBadgeProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const detailsRef = useRef<HTMLSpanElement>(null);
  const stars = getStars(rank);
  const asset = getRankAsset(rank.name);

  useEffect(() => {
    if (!isDetailsOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        setIsDetailsOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [isDetailsOpen]);

  if (mobileIconOnly) {
    return (
      <span ref={detailsRef} className="relative z-[11] inline-flex">
        <button
          type="button"
          onClick={() => setIsDetailsOpen((open) => !open)}
          aria-label={`ดูรายละเอียด Rank ${rank.name}`}
          aria-expanded={isDetailsOpen}
          className="cursor-pointer rounded-full border border-transparent bg-transparent p-0 shadow-none sm:hidden"
        >
          <Image
            src={asset}
            alt=""
            width={36}
            height={36}
            className="size-9 object-contain"
            aria-hidden
          />
        </button>
        {isDetailsOpen && (
          <span
            role="tooltip"
            className="absolute left-1/2 top-full z-50 mt-2 flex w-56 -translate-x-1/2 flex-col items-center gap-0.5 rounded-2xl border border-white/70 bg-gradient-to-br from-fuchsia-500/85 via-purple-500/85 to-indigo-600/85 p-4 text-center text-white shadow-xl backdrop-blur-sm before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2 before:border-x-8 before:border-b-8 before:border-x-transparent before:border-b-fuchsia-500/85 before:content-['']"
          >
            <Image
              src={asset}
              alt=""
              width={144}
              height={144}
              className="size-36 object-contain drop-shadow-lg animate-rank-artwork-in"
              aria-hidden
            />
            <strong className="text-lg font-black">{rank.name}</strong>
            <span className="text-amber-200" aria-label={`${rank.stars} ดาว`}>{stars}</span>
            <span className="text-sm font-bold">{rank.mmr.toLocaleString()} MMR</span>
          </span>
        )}
        <span
          aria-label={`${rank.name} ${stars}`}
          className="hidden min-w-0 items-center gap-1 rounded-full border border-white/70 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-600 px-2 py-1 text-xs font-bold text-white shadow-sm sm:inline-flex"
        >
          <Image
            src={asset}
            alt=""
            width={28}
            height={28}
            className="size-6 shrink-0 object-contain"
            aria-hidden
          />
          <span className="truncate">{rank.name}{rank.stars > 0 ? ` ${stars}` : ''}</span>
        </span>
      </span>
    );
  }

  return (
    <span
      aria-label={`${rank.name} ${stars}`}
      className={`relative z-[11] inline-flex min-w-0 items-center gap-1 rounded-full border border-white/70 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-600 px-2 py-1 font-bold text-white shadow-sm ${compact ? "text-[10px]" : "text-xs"}`}
    >
      <Image
        src={asset}
        alt=""
        width={compact ? 22 : 28}
        height={compact ? 22 : 28}
        className="size-6 shrink-0 object-contain"
        aria-hidden
      />
      <span className="truncate">{rank.name}{rank.stars > 0 ? ` ${"★".repeat(rank.stars)}` : ""}</span>
    </span>
  );
}
