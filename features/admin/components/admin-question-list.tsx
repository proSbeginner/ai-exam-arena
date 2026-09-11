import { useEffect, useState } from "react";
import type { ExamQuestion } from "@/features/quiz/quiz.types";
import { AdminQuestionCard } from "./admin-question-card";

const DRAWER_ANIMATION_MS = 350;

interface AdminQuestionListProps {
  isOpen: boolean;
  isLoading: boolean;
  onEdit: (question: ExamQuestion) => void;
  onClose: () => void;
  onLoad: (limit: number | null) => void;
  onRemove: (id: string) => void;
  questions: ExamQuestion[];
}

export function AdminQuestionList({
  isOpen,
  isLoading,
  onEdit,
  onClose,
  onLoad,
  onRemove,
  questions,
}: AdminQuestionListProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [limitInput, setLimitInput] = useState("10");
  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase();
  const applyLimit = () => {
    const trimmedLimit = limitInput.trim();
    onLoad(trimmedLimit ? Number(trimmedLimit) : null);
  };
  const handleLabelClick = (label: string) => {
    setSearchTerm((current) =>
      current.trim().toLocaleLowerCase() === label.toLocaleLowerCase()
        ? ""
        : label,
    );
  };
  const filteredQuestions = normalizedSearchTerm
    ? questions.filter((question) =>
        [
          question.english,
          question.thai_drama,
          ...(question.labels ?? []),
        ].some((value) =>
          value.toLocaleLowerCase().includes(normalizedSearchTerm),
        ),
      )
    : questions;

  useEffect(() => {
    if (isOpen) {
      const timeoutId = window.setTimeout(() => setIsVisible(true), 0);
      return () => window.clearTimeout(timeoutId);
    }

    const timeoutId = window.setTimeout(
      () => setIsVisible(false),
      DRAWER_ANIMATION_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 z-30 cursor-pointer bg-transparent"
        aria-label="ปิดคลังคำถาม"
      />
      <aside
        key={isOpen ? "question-bank-open" : "question-bank-closing"}
        className={`fixed inset-y-0 right-0 z-40 flex w-full flex-col bg-white p-5 shadow-2xl ${isOpen ? "animate-slide-in-right" : "animate-slide-out-right"} md:w-1/3`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black text-gray-800">
            คลังคำถาม ({filteredQuestions.length})
          </h2>
          <div className="flex items-center gap-3">
            <span className="group relative">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg px-2 py-1 text-xl font-bold text-gray-400 hover:bg-purple-50 hover:text-purple-500"
                aria-label="ปิด"
              >
                ×
              </button>
              <span
                className="pointer-events-none absolute right-0 top-full z-50 mt-1 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                role="tooltip"
              >
                ปิด
              </span>
            </span>
          </div>
        </div>
        <div className="mb-4 flex items-end gap-2">
          <label className="min-w-0 flex-1 text-xs font-bold text-gray-500">
            โหลดคำถามล่าสุด
            <input
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={limitInput}
              onChange={(event) => setLimitInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applyLimit();
              }}
              placeholder="ทั้งหมด"
              aria-label="จำนวนคำถามล่าสุด"
              className="mt-1 w-full rounded-xl border-2 border-purple-200 bg-purple-50 px-4 py-3 text-sm font-medium text-gray-700 outline-none transition-colors placeholder:text-purple-300 focus:border-pink-400 focus:ring-0"
            />
          </label>
          <button
            type="button"
            onClick={applyLimit}
            disabled={isLoading}
            className="cursor-pointer rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-50"
          >
            โหลด
          </button>
        </div>
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="ค้นหาคำถาม..."
          aria-label="ค้นหาคำถาม"
          className="mb-4 w-full rounded-xl border-2 border-purple-200 bg-purple-50 px-4 py-3 text-sm font-medium text-gray-700 outline-none transition-colors placeholder:text-purple-300 focus:border-pink-400 focus:ring-0"
        />
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => (
              <AdminQuestionCard
                key={question.id}
                question={question}
                onEdit={onEdit}
                onRemove={onRemove}
                onLabelClick={handleLabelClick}
              />
            ))
          ) : (
            <p className="py-8 text-center text-sm font-medium text-gray-400">
              ไม่พบคำถามที่ค้นหา
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
