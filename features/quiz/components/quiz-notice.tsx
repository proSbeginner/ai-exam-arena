interface QuizNoticeProps {
  actionLabel: string;
  heading: string;
  message: string;
  onAction: () => void;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
}

export function QuizNotice({ actionLabel, heading, message, onAction, onSecondaryAction, secondaryActionLabel }: QuizNoticeProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <section className="w-full max-w-md space-y-4 rounded-3xl bg-white p-8 text-center shadow-xl">
        <div className="text-4xl" aria-hidden>
          📝
        </div>
        <h1 className="text-2xl font-extrabold text-gray-800">{heading}</h1>
        <p className="text-sm text-gray-500">{message}</p>
        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={onAction}
            className={`${onSecondaryAction ? "flex-1" : "w-full"} cursor-pointer rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 font-bold text-white shadow-lg transition-all active:scale-95`}
          >
            {actionLabel}
          </button>
          {onSecondaryAction && secondaryActionLabel && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="flex-1 cursor-pointer rounded-xl border-2 border-purple-200 bg-white py-3 font-bold text-purple-600 transition-all hover:border-purple-400 active:scale-95"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
