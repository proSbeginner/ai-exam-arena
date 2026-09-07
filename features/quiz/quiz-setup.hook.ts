'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { APP_ROUTES } from '@/features/shared/routes';

import { getQuizQuestions } from './services/quiz.api';
import { QUIZ_MODE_OPTIONS } from './quiz.constants';
import type { ExamQuestion, QuizMode, QuizSetup } from './quiz.types';

export const QUIZ_SETUP_STORAGE_KEY = 'ai-exam-arena:quiz-setup';

interface QuizSetupHook {
  availableQuestionCount: number;
  error: string | null;
  isLoading: boolean;
  questionLimit: string;
  selectedMode: QuizMode;
  modeOptions: typeof QUIZ_MODE_OPTIONS;
  startQuiz: () => void;
  updateQuestionLimit: (value: string) => void;
  updateMode: (mode: QuizMode) => void;
}

const listeners = new Set<() => void>();
let cachedQuizSetup: QuizSetup | null = null;
let cachedQuizSetupStorageValue: string | null | undefined;

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

export function getStoredQuizSetup(): QuizSetup | null {
  if (typeof window === 'undefined') return null;

  const storedSetup = window.sessionStorage.getItem(QUIZ_SETUP_STORAGE_KEY);
  if (storedSetup === cachedQuizSetupStorageValue) return cachedQuizSetup;

  cachedQuizSetupStorageValue = storedSetup;

  if (!storedSetup) {
    cachedQuizSetup = null;
    return cachedQuizSetup;
  }

  try {
    const parsedSetup = JSON.parse(storedSetup) as Partial<QuizSetup>;
    if (
      (parsedSetup.mode === 'primary' || parsedSetup.mode === 'secondary' || parsedSetup.mode === 'university') &&
      (parsedSetup.questionLimit === null || typeof parsedSetup.questionLimit === 'number')
    ) {
      cachedQuizSetup = parsedSetup as QuizSetup;
      return cachedQuizSetup;
    }
  } catch {
    cachedQuizSetup = null;
    return cachedQuizSetup;
  }

  cachedQuizSetup = null;
  return cachedQuizSetup;
}

export function saveQuizSetup(setup: QuizSetup): void {
  window.sessionStorage.setItem(QUIZ_SETUP_STORAGE_KEY, JSON.stringify(setup));
  notifyListeners();
}

export function clearQuizSetup(): void {
  window.sessionStorage.removeItem(QUIZ_SETUP_STORAGE_KEY);
  notifyListeners();
}

export function subscribeToQuizSetup(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener('storage', listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

export function useQuizSetup(): QuizSetupHook {
  const router = useRouter();
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [selectedMode, setSelectedMode] = useState<QuizMode>('university');
  const [questionLimit, setQuestionLimit] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrentRequest = true;

    const loadQuestions = async () => {
      try {
        const loadedQuestions = await getQuizQuestions();
        if (isCurrentRequest) setQuestions(loadedQuestions);
      } catch {
        if (isCurrentRequest) setError('ไม่สามารถโหลดจำนวนคำถามได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        if (isCurrentRequest) setIsLoading(false);
      }
    };

    void loadQuestions();

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  const availableQuestionCount = useMemo(
    () => questions.filter((question) => question.mode === selectedMode && question.status === 'published').length,
    [questions, selectedMode],
  );

  const updateMode = useCallback((mode: QuizMode) => {
    setSelectedMode(mode);
    setQuestionLimit('');
    setError(null);
  }, []);

  const updateQuestionLimit = useCallback((value: string) => {
    if (!/^\d*$/.test(value)) return;
    setQuestionLimit(value);
    setError(null);
  }, []);

  const startQuiz = useCallback(() => {
    if (availableQuestionCount === 0) {
      setError('โหมดนี้ยังไม่มีคำถามที่เผยแพร่');
      return;
    }

    const parsedLimit = questionLimit ? Number(questionLimit) : null;
    if (parsedLimit !== null && (parsedLimit < 1 || parsedLimit > availableQuestionCount)) {
      setError(`จำนวนข้อเลือกได้ตั้งแต่ 1 ถึง ${availableQuestionCount} ข้อ`);
      return;
    }

    saveQuizSetup({ mode: selectedMode, questionLimit: parsedLimit });
    router.replace(APP_ROUTES.quiz);
  }, [availableQuestionCount, questionLimit, router, selectedMode]);

  return {
    availableQuestionCount,
    error,
    isLoading,
    modeOptions: QUIZ_MODE_OPTIONS,
    questionLimit,
    selectedMode,
    startQuiz,
    updateMode,
    updateQuestionLimit,
  };
}
