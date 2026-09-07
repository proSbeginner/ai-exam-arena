interface AdminLabelInputProps {
  isDuplicate: boolean;
  labels: string[];
  value: string;
  onAdd: () => void;
  onChange: (value: string) => void;
  onRemove: (label: string) => void;
}

export function AdminLabelInput({ isDuplicate, labels, value, onAdd, onChange, onRemove }: AdminLabelInputProps) {
  return (
    <div className={`rounded-xl border-2 p-3 ${isDuplicate ? 'border-red-500 bg-red-500 text-white' : 'border-purple-200 bg-purple-50'}`}>
      {labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {labels.map((label) => (
            <span key={label} className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700">
              {label}
              <button type="button" onClick={() => onRemove(label)} className="cursor-pointer text-purple-400 hover:text-red-500" aria-label={`ลบ label ${label}`}>×</button>
            </span>
          ))}
        </div>
      )}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            onAdd();
          }
        }}
        onBlur={onAdd}
        placeholder="พิมพ์ A-Z, 0-9, _ แล้วกด Space หรือ Enter"
        className={`w-full bg-transparent p-1 text-sm outline-none placeholder:text-purple-300 ${isDuplicate ? 'text-white placeholder:text-red-100' : 'text-gray-700'}`}
      />
      {isDuplicate && <p className="mt-1 text-xs font-bold text-white">Label นี้มีอยู่แล้ว</p>}
    </div>
  );
}
