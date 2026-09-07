interface ConfirmationDialogProps {
  cancelLabel?: string;
  confirmLabel?: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}

export function ConfirmationDialog({
  cancelLabel = 'ยกเลิก',
  confirmLabel = 'ยืนยัน',
  message,
  onCancel,
  onConfirm,
  title,
}: ConfirmationDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="confirmation-dialog-title" className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <h2 id="confirmation-dialog-title" className="text-lg font-bold text-gray-800">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">{message}</p>
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 cursor-pointer rounded-xl border-2 border-purple-200 bg-white py-2.5 font-bold text-purple-600 transition-colors hover:border-purple-400">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} className="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-2.5 font-bold text-white shadow-lg transition-all hover:shadow-pink-500/30 active:scale-95">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
