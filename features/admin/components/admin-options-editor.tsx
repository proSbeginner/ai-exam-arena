import type { QuizOption } from '@/features/quiz/quiz.types';
import { MAX_ADMIN_OPTIONS } from '../admin.constants';

interface AdminOptionsEditorProps {
  options: QuizOption[];
  correctOptionId: string;
  onAdd: () => void;
  onChange: (index: number, key: keyof QuizOption, value: string) => void;
  onCorrectChange: (id: string) => void;
  onRemove: (index: number) => void;
}

export function AdminOptionsEditor({ options, correctOptionId, onAdd, onChange, onCorrectChange, onRemove }: AdminOptionsEditorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-gray-600">ตัวเลือก <span className="font-normal text-gray-400">(English บังคับ / ไทยไม่บังคับ)</span></p>
      {options.map((option, index) => (
        <div key={option.id} className="rounded-xl border border-purple-100 p-3">
          <label className="flex items-center gap-2 text-xs font-bold text-purple-600">
            <input type="radio" name="correctOption" checked={correctOptionId === option.id} onChange={() => onCorrectChange(option.id)} />
            <span className="text-sm font-black text-pink-500">{String.fromCharCode(65 + index)}.</span>
            คำตอบที่ถูกต้อง
          </label>
          <textarea value={option.english} onChange={(event) => onChange(index, 'english', event.target.value)} placeholder={`Option ${index + 1} English *`} rows={3} className="mt-2 w-full resize-y rounded-lg border border-gray-200 p-2 text-sm" />
          <textarea value={option.thai_drama} onChange={(event) => onChange(index, 'thai_drama', event.target.value)} placeholder={`Option ${index + 1} ไทย (ไม่บังคับ)`} rows={3} className="mt-2 w-full resize-y rounded-lg border border-gray-200 p-2 text-sm" />
          {options.length > 2 && <button type="button" onClick={() => onRemove(index)} className="mt-2 cursor-pointer text-xs text-red-400">ลบตัวเลือก</button>}
        </div>
      ))}
      <button type="button" onClick={onAdd} disabled={options.length >= MAX_ADMIN_OPTIONS} className="cursor-pointer text-sm font-bold text-purple-500 disabled:cursor-not-allowed disabled:text-gray-300">
        {options.length >= MAX_ADMIN_OPTIONS ? 'ครบ 10 ตัวเลือก' : '+ เพิ่มตัวเลือก'}
      </button>
    </div>
  );
}
