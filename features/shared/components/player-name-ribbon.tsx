interface PlayerNameRibbonProps {
  playerName: string;
}

export function PlayerNameRibbon({ playerName }: PlayerNameRibbonProps) {
  return (
    <span className="relative inline-flex min-w-0 items-center sm:w-fit sm:min-w-[140px] sm:pt-4">
      <span className="max-w-28 truncate text-sm font-bold text-gray-500 sm:hidden">{playerName}</span>
      <span
        className="absolute left-0 top-[-1rem] hidden h-12 w-full min-w-[140px] items-end justify-center sm:inline-flex"
        style={{ filter: "drop-shadow(0 0 4px rgba(45, 20, 80, 0.7))" }}
      >
        <span
          className="flex h-full w-full items-end justify-center truncate bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 px-4 pb-4 text-xs font-black text-white [clip-path:polygon(0_0,100%_0,100%_72%,50%_100%,0_72%)]"
          title={playerName}
        >
          {playerName}
        </span>
      </span>
    </span>
  );
}
