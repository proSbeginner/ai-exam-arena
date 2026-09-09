import { useEffect, useRef, useState } from 'react';
import type { SubmitEvent } from 'react';

import type { AdminQuestionFormState } from '../admin.types';
import type { QuizOption, QuestionStatus } from '@/features/quiz/quiz.types';
import { ConfirmationDialog } from '@/features/shared/components/confirmation-dialog';
import { AdminField } from './admin-field';
import { AdminLabelInput } from './admin-label-input';
import { AdminOptionsEditor } from './admin-options-editor';

interface AdminQuestionFormProps {
  editingId: string | null;
  error: string | null;
  form: AdminQuestionFormState;
  formError: string | null;
  showFormError: boolean;
  questionFocusKey: number;
  isDuplicateLabel: boolean;
  isLoading: boolean;
  onAddLabel: () => void;
  onChange: <K extends keyof AdminQuestionFormState>(key: K, value: AdminQuestionFormState[K]) => void;
  onChangeOption: (index: number, key: keyof QuizOption, value: string) => void;
  onChangeLabelInput: (value: string) => void;
  onClear: () => void;
  onCorrectOptionChange: (id: string) => void;
  onRemoveLabel: (label: string) => void;
  onRemoveOption: (index: number) => void;
  onAddOption: () => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
}

export function AdminQuestionForm({
  editingId, error, form, formError, showFormError, questionFocusKey, isDuplicateLabel, isLoading, onAddLabel, onChange, onChangeOption,
  onChangeLabelInput, onClear, onCorrectOptionChange, onRemoveLabel, onRemoveOption, onAddOption, onSubmit,
}: AdminQuestionFormProps) {
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const questionInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (questionFocusKey > 0) questionInputRef.current?.focus();
  }, [questionFocusKey]);

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-800">เพิ่มคำถาม</h1>
        <button type="button" onClick={() => setIsClearDialogOpen(true)} className="cursor-pointer text-sm font-bold text-purple-500">ล้างฟอร์ม</button>
      </div>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-500">{error}</p>}
      <div className="grid grid-cols-1 gap-3">
        <label className="text-sm font-bold text-gray-600">สถานะ
          <select value={form.status} onChange={(event) => onChange('status', event.target.value as QuestionStatus)} className="mt-1 w-full rounded-xl border border-gray-200 p-3">
            <option value="draft">Draft</option><option value="published">Published</option>
          </select>
        </label>
      </div>
      <AdminField label="Question (English)" required><textarea ref={questionInputRef} id="admin-english" name="english" value={form.english} onChange={(event) => onChange('english', event.target.value)} placeholder="Question (English)" rows={4} className="w-full resize-y rounded-xl border-2 border-purple-200 bg-purple-50 px-4 py-3 font-medium text-gray-700 outline-none transition-colors placeholder:text-purple-300 focus:border-pink-400 focus:ring-0" /></AdminField>
      <AdminField label="แปลไทยสไตล์จีซู"><textarea id="admin-thai" name="thaiDrama" value={form.thai_drama} onChange={(event) => onChange('thai_drama', event.target.value)} placeholder="แปลไทยสไตล์จีซู" rows={4} className="w-full resize-y rounded-xl border-2 border-purple-200 bg-purple-50 px-4 py-3 font-medium text-gray-700 outline-none transition-colors placeholder:text-purple-300 focus:border-pink-400 focus:ring-0" /></AdminField>
      <AdminField label="Labels"><AdminLabelInput isDuplicate={isDuplicateLabel} labels={form.labels} value={form.labelInput} onAdd={onAddLabel} onChange={onChangeLabelInput} onRemove={onRemoveLabel} /></AdminField>
      <AdminOptionsEditor options={form.options} correctOptionId={form.correctOptionId} onAdd={onAddOption} onChange={onChangeOption} onCorrectChange={onCorrectOptionChange} onRemove={onRemoveOption} />
      <AdminField label="Fun fact"><textarea id="admin-fun-fact" name="funFact" value={form.funFact} onChange={(event) => onChange('funFact', event.target.value)} placeholder="เกร็ดความรู้หลังตอบคำถาม" rows={4} className="w-full resize-y rounded-xl border-2 border-purple-200 bg-purple-50 px-4 py-3 font-medium text-gray-700 outline-none transition-colors placeholder:text-purple-300 focus:border-pink-400 focus:ring-0" /></AdminField>
      <AdminField label="แหล่งอ้างอิง"><textarea id="admin-source" name="source" value={form.sourceName} onChange={(event) => onChange('sourceName', event.target.value)} placeholder="แหล่งอ้างอิง" rows={3} className="w-full resize-y rounded-xl border-2 border-purple-200 bg-purple-50 px-4 py-3 font-medium text-gray-700 outline-none transition-colors placeholder:text-purple-300 focus:border-pink-400 focus:ring-0" /></AdminField>
      {showFormError && formError && <p className="text-xs font-medium text-red-500" role="alert">{formError}</p>}
      <button type="submit" disabled={isLoading} className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 font-bold text-white disabled:opacity-50">{isLoading ? 'กำลังบันทึก...' : editingId ? 'บันทึกการแก้ไข' : 'เพิ่มคำถาม'}</button>
      </form>
      {isClearDialogOpen && (
        <ConfirmationDialog
          title="ล้างฟอร์มหรือไม่ ?"
          message="ข้อมูลที่กรอกไว้ทั้งหมดจะถูกล้าง และไม่สามารถกู้คืนได้"
          confirmLabel="ตกลง"
          onCancel={() => setIsClearDialogOpen(false)}
          onConfirm={() => {
            onClear();
            setIsClearDialogOpen(false);
          }}
        />
      )}
    </>
  );
}
