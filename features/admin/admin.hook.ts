'use client';

import { useMemo, useState, type SubmitEvent } from 'react';

import type { ExamQuestion, QuizOption } from '@/features/quiz/quiz.types';
import { validateAdminQuestion } from './admin.logic';
import { ADMIN_REFRESH_DELAY_MS, EMPTY_ADMIN_FORM, MAX_ADMIN_OPTIONS } from './admin.constants';
import type { AdminQuestionFormState } from './admin.types';
import {
  createAdminQuestion,
  deleteAdminQuestion,
  getAdminQuestions,
  updateAdminQuestion,
} from './services/admin.api';

function toInput(question: ExamQuestion): AdminQuestionFormState {
  return {
    ...EMPTY_ADMIN_FORM,
    ...question,
    labels: question.labels ?? [],
    labelInput: '',
    funFact: question.funFact ?? '',
    sourceName: question.source?.name ?? '',
  };
}

function toPayload(form: AdminQuestionFormState) {
  const options = form.options.filter((option) => option.english.trim() || option.thai_drama.trim());
  return {
    labels: form.labels,
    english: form.english,
    thai_drama: form.thai_drama,
    options,
    correctOptionId: form.correctOptionId,
    funFact: form.funFact || undefined,
    status: form.status,
    source: form.sourceName ? { name: form.sourceName } : undefined,
  };
}

export function useAdmin() {
  const [email, setEmail] = useState('');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [form, setForm] = useState(EMPTY_ADMIN_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const loadQuestions = async (delayMs = 0) => {
    setIsLoading(true);
    setError(null);
    if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
    try {
      setQuestions(await getAdminQuestions(email));
      setIsAuthorized(true);
    } catch (loadError) {
      setIsAuthorized(false);
      setError(loadError instanceof Error ? loadError.message : 'ไม่สามารถโหลดคำถามได้');
    } finally {
      setIsLoading(false);
    }
  };

  const formError = useMemo(() => validateAdminQuestion(toPayload(form)), [form]);
  const updateForm = <K extends keyof AdminQuestionFormState>(key: K, value: AdminQuestionFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };
  const updateOption = (index: number, key: keyof QuizOption, value: string) => {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, [key]: value } : option,
      ),
    }));
  };
  const addOption = () => {
    if (form.options.length >= MAX_ADMIN_OPTIONS) return;
    setForm((current) => ({
      ...current,
      options: [...current.options, { id: `option-${current.options.length + 1}`, english: '', thai_drama: '' }],
    }));
  };
  const addLabel = () => {
    const label = form.labelInput.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
    if (!label || form.labels.includes(label)) return;
    setForm((current) => ({ ...current, labels: [...current.labels, label], labelInput: '' }));
  };
  const updateLabelInput = (value: string) => {
    setForm((current) => ({ ...current, labelInput: value.toUpperCase().replace(/[^A-Z0-9_]/g, '') }));
  };
  const removeLabel = (label: string) => {
    setForm((current) => ({ ...current, labels: current.labels.filter((item) => item !== label) }));
  };
  const normalizedLabelInput = form.labelInput.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
  const isDuplicateLabel = Boolean(normalizedLabelInput && form.labels.includes(normalizedLabelInput));

  const resetForm = () => {
    setForm(EMPTY_ADMIN_FORM);
    setEditingId(null);
    setError(null);
  };

  const editQuestion = (question: ExamQuestion) => {
    setEditingId(question.id);
    setForm(toInput(question));
  };

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formError) {
      setError(formError);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const payload = toPayload(form);
      if (editingId) await updateAdminQuestion(email, editingId, payload);
      else await createAdminQuestion(email, payload);
      resetForm();
      await loadQuestions();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'ไม่สามารถบันทึกคำถามได้');
      setIsLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('ยืนยันการลบคำถามนี้หรือไม่?')) return;
    setIsLoading(true);
    try {
      await deleteAdminQuestion(email, id);
      await loadQuestions();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'ไม่สามารถลบคำถามได้');
      setIsLoading(false);
    }
  };

  return {
    addLabel,
    addOption,
    ADMIN_REFRESH_DELAY_MS,
    editQuestion,
    email,
    editingId,
    error,
    form,
    formError,
    isAuthorized,
    isDuplicateLabel,
    isLoading,
    loadQuestions,
    questions,
    remove,
    removeLabel,
    resetForm,
    setEmail,
    submit,
    updateForm,
    updateLabelInput,
    updateOption,
  };
}
