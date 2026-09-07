import type { ExamQuestion } from '@/features/quiz/quiz.types';
import { AdminQuestionCard } from './admin-question-card';

interface AdminQuestionListProps {
  isLoading: boolean;
  onEdit: (question: ExamQuestion) => void;
  onRefresh: () => void;
  onRemove: (id: string) => void;
  questions: ExamQuestion[];
}

export function AdminQuestionList({ isLoading, onEdit, onRefresh, onRemove, questions }: AdminQuestionListProps) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-800">คลังคำถาม ({questions.length})</h2>
        <button type="button" onClick={onRefresh} disabled={isLoading} aria-busy={isLoading} className="cursor-pointer text-sm font-bold text-purple-500 disabled:cursor-wait disabled:opacity-50">
          {isLoading ? 'กำลังโหลด...' : 'รีเฟรช'}
        </button>
      </div>
      <div className="max-h-[75vh] space-y-3 overflow-y-auto">
        {questions.map((question) => <AdminQuestionCard key={question.id} question={question} onEdit={onEdit} onRemove={onRemove} />)}
      </div>
    </section>
  );
}
