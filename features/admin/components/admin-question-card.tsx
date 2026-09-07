import { useState } from 'react';
import type { ExamQuestion } from '@/features/quiz/quiz.types';
import { ConfirmationDialog } from '@/features/shared/components/confirmation-dialog';
import { AdminQuestionPreview } from './admin-question-preview';

interface AdminQuestionCardProps {
  onEdit: (question: ExamQuestion) => void;
  onRemove: (id: string) => void;
  question: ExamQuestion;
}

export function AdminQuestionCard({ onEdit, onRemove, question }: AdminQuestionCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <article className="rounded-2xl border border-purple-100 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-purple-500"><span className={question.status === 'published' ? 'rounded-full bg-green-100 px-2 py-0.5 text-green-700' : 'text-gray-500'}>{question.status}</span></p>
            <AdminQuestionPreview question={question.english} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => onEdit(question)} className="cursor-pointer text-xs font-bold text-purple-500">แก้ไข</button>
            <button type="button" onClick={() => setIsDeleteDialogOpen(true)} className="cursor-pointer text-xs font-bold text-red-400">ลบ</button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {question.labels?.map((label) => <span key={label} className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-600">{label}</span>)}
          <span className="w-full text-xs text-gray-500">{question.options.length} ตัวเลือก</span>
        </div>
      </article>
      {isDeleteDialogOpen && (
        <ConfirmationDialog
          title="ลบคำถามหรือไม่ ?"
          message="คำถามนี้จะถูกลบออกจากคลังคำถาม และไม่สามารถกู้คืนได้"
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => {
            onRemove(question.id);
            setIsDeleteDialogOpen(false);
          }}
        />
      )}
    </>
  );
}
