interface InfoDialogProps {
  buttonLabel?: string;
  message: string;
  onClose: () => void;
  title: string;
}

export function InfoDialog({ buttonLabel = 'ตกลง', message, onClose, title }: InfoDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="info-dialog-title" className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <h2 id="info-dialog-title" className="text-lg font-bold text-gray-800">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">{message}</p>
        <button type="button" onClick={onClose} className="mt-5 w-full cursor-pointer rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-2.5 font-bold text-white shadow-lg transition-all hover:shadow-pink-500/30 active:scale-95">
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
