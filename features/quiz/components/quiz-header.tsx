interface QuizHeaderProps {
  changePlayerName: () => void;
  currentRank: { emoji: string; title: string };
}

export function QuizHeader({ changePlayerName, currentRank }: QuizHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-lg items-center justify-between py-4">
      <div className="flex items-center gap-2">
        <h1 className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
          AI EXAM ARENA
        </h1>
        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
          {currentRank.emoji} {currentRank.title}
        </span>
      </div>
      <button
        type="button"
        onClick={changePlayerName}
        className="cursor-pointer text-xs text-gray-400 transition-colors hover:text-pink-500"
      >
        เปลี่ยนชื่อ 👋
      </button>
    </header>
  );
}
