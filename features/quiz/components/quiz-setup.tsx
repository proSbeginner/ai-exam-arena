'use client';

import { TextInput } from '@/features/shared/components/text-input';

import type { QuizMode } from '../quiz.types';

interface QuizSetupProps {
  availableQuestionCount: number;
  error: string | null;
  isLoading: boolean;
  modeOptions: Array<{ value: QuizMode; label: string; description: string }>;
  questionLimit: string;
  selectedMode: QuizMode;
  startQuiz: () => void;
  updateMode: (mode: QuizMode) => void;
  updateQuestionLimit: (value: string) => void;
}

export function QuizSetup({
  availableQuestionCount,
  error,
  isLoading,
  modeOptions,
  questionLimit,
  selectedMode,
  startQuiz,
  updateMode,
  updateQuestionLimit,
}: QuizSetupProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <section className="w-full max-w-lg space-y-6 rounded-3xl bg-white p-6 shadow-xl sm:p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-purple-500">Quiz setup</p>
          <h1 className="mt-1 text-3xl font-black text-gray-800">เลือกสนามก่อนเริ่ม</h1>
          <p className="mt-2 text-sm text-gray-500">เลือกโหมดและจำนวนข้อที่ต้องการฝึกฝน</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {modeOptions.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => updateMode(mode.value)}
              className={`cursor-pointer rounded-2xl border-2 p-4 text-left transition-all ${
                selectedMode === mode.value
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-100 bg-white hover:border-purple-200 hover:bg-purple-50'
              }`}
            >
              <span className="block font-bold text-gray-800">{mode.label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-gray-500">{mode.description}</span>
            </button>
          ))}
        </div>

        <TextInput
          id="question-limit"
          name="questionLimit"
          type="number"
          inputMode="numeric"
          min={1}
          max={availableQuestionCount || undefined}
          value={questionLimit}
          onChange={(event) => updateQuestionLimit(event.target.value)}
          placeholder={String(availableQuestionCount)}
          hint={`มีคำถามในโหมดนี้ ${availableQuestionCount} ข้อ — เว้นว่างเพื่อทำทั้งหมด`}
          error={error}
        />

        <button
          type="button"
          onClick={startQuiz}
          disabled={isLoading}
          className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3.5 text-lg font-bold text-white shadow-lg transition-all hover:shadow-pink-500/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'กำลังโหลดคำถาม...' : 'เริ่มทำข้อสอบ'}
        </button>
      </section>
    </main>
  );
}
