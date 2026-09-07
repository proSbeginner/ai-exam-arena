'use client';

import { useMemo, useState } from 'react';

import { TextInput } from '@/features/shared/components/text-input';
import type { ExamQuestion, QuizMode, QuizOption, QuestionStatus } from '@/features/quiz/quiz.types';
import type { AdminQuestionFormState } from '../admin.types';
import { validateAdminQuestion } from '../admin.logic';
import {
  createAdminQuestion,
  deleteAdminQuestion,
  getAdminQuestions,
  updateAdminQuestion,
} from '../services/admin.api';

const emptyForm: AdminQuestionFormState = {
  mode: 'university', labels: [], labelInput: '', english: '', thai_drama: '',
  options: [{ id: 'option-a', english: '', thai_drama: '' }, { id: 'option-b', english: '', thai_drama: '' }],
  correctOptionId: 'option-a', funFact: '',
  sourceName: '', sourceUrl: '', sourceReference: '', status: 'draft',
};

function AdminField({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-sm font-bold text-gray-600">
        {label}{required && <span className="ml-1 text-pink-500" aria-hidden>*</span>}
      </p>
      {children}
    </div>
  );
}

function toInput(question: ExamQuestion): AdminQuestionFormState {
  return { ...emptyForm, ...question, labels: question.labels ?? [], labelInput: '', funFact: question.funFact ?? '', sourceName: question.source?.name ?? '', sourceUrl: question.source?.url ?? '', sourceReference: question.source?.reference ?? '' };
}

function toPayload(form: AdminQuestionFormState) {
  const options = form.options.filter((option) => option.english.trim() || option.thai_drama.trim());
  return { mode: form.mode, labels: form.labels, english: form.english, thai_drama: form.thai_drama, options, correctOptionId: form.correctOptionId, funFact: form.funFact || undefined, status: form.status, source: form.sourceName ? { name: form.sourceName, url: form.sourceUrl || undefined, reference: form.sourceReference || undefined } : undefined };
}

export function Admin() {
  const [email, setEmail] = useState('');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const loadQuestions = async () => {
    setIsLoading(true); setError(null);
    try { setQuestions(await getAdminQuestions(email)); setIsAuthorized(true); }
    catch (loadError) { setIsAuthorized(false); setError(loadError instanceof Error ? loadError.message : 'ไม่สามารถโหลดคำถามได้'); }
    finally { setIsLoading(false); }
  };

  const formError = useMemo(() => validateAdminQuestion(toPayload(form)), [form]);
  const updateForm = <K extends keyof AdminQuestionFormState>(key: K, value: AdminQuestionFormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const updateOption = (index: number, key: keyof QuizOption, value: string) => setForm((current) => ({ ...current, options: current.options.map((option, optionIndex) => optionIndex === index ? { ...option, [key]: value } : option) }));
  const addLabel = () => {
    const label = form.labelInput.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
    if (!label || form.labels.includes(label)) return;
    setForm((current) => ({ ...current, labels: [...current.labels, label], labelInput: '' }));
  };

  const updateLabelInput = (value: string) => {
    setForm((current) => ({ ...current, labelInput: value.toUpperCase().replace(/[^A-Z0-9_]/g, '') }));
  };
  const normalizedLabelInput = form.labelInput.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
  const isDuplicateLabel = Boolean(normalizedLabelInput && form.labels.includes(normalizedLabelInput));

  const submit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault(); if (formError) { setError(formError); return; }
    setIsLoading(true); setError(null);
    try {
      const payload = toPayload(form);
      if (editingId) await updateAdminQuestion(email, editingId, payload);
      else await createAdminQuestion(email, payload);
      setForm(emptyForm); setEditingId(null); await loadQuestions();
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : 'ไม่สามารถบันทึกคำถามได้'); setIsLoading(false); }
  };

  const remove = async (id: string) => { if (!window.confirm('ยืนยันการลบคำถามนี้หรือไม่?')) return; setIsLoading(true); try { await deleteAdminQuestion(email, id); await loadQuestions(); } catch (removeError) { setError(removeError instanceof Error ? removeError.message : 'ไม่สามารถลบคำถามได้'); setIsLoading(false); } };

  if (!isAuthorized) return <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4"><form autoComplete="off" onSubmit={(event) => { event.preventDefault(); void loadQuestions(); }} className="w-full max-w-md space-y-5 rounded-3xl bg-white p-8 shadow-xl"><h1 className="text-2xl font-black text-gray-800">Admin Question Bank</h1><p className="text-sm text-gray-500">กรุณาระบุ Admin email</p><TextInput id="admin-email" name="adminEmail" type="email" autoComplete="off" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ADMIN_EMAIL" error={error} /><button type="submit" disabled={isLoading} className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 font-bold text-white disabled:opacity-50">{isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ Admin'}</button></form></main>;

  return <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-4 sm:p-8"><section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_1.15fr]"><form onSubmit={submit} className="space-y-4 rounded-3xl bg-white p-6 shadow-xl"><div className="flex items-center justify-between"><h1 className="text-2xl font-black text-gray-800">เพิ่มคำถาม</h1><button type="button" onClick={() => { setForm(emptyForm); setEditingId(null); }} className="cursor-pointer text-sm font-bold text-purple-500">ล้างฟอร์ม</button></div>{error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-500">{error}</p>}<div className="grid grid-cols-2 gap-3"><label className="text-sm font-bold text-gray-600">โหมด<select value={form.mode} onChange={(event) => updateForm('mode', event.target.value as QuizMode)} className="mt-1 w-full rounded-xl border border-gray-200 p-3"><option value="primary">ปฐม</option><option value="secondary">มัธยม</option><option value="university">มหาลัย 🔥</option></select></label><label className="text-sm font-bold text-gray-600">สถานะ<select value={form.status} onChange={(event) => updateForm('status', event.target.value as QuestionStatus)} className="mt-1 w-full rounded-xl border border-gray-200 p-3"><option value="draft">Draft</option><option value="published">Published</option></select></label></div><AdminField label="Question (English)" required><textarea id="admin-english" name="english" value={form.english} onChange={(event) => updateForm('english', event.target.value)} placeholder="Question (English)" rows={4} className="w-full resize-y rounded-xl border-2 border-purple-200 bg-purple-50 px-4 py-3 font-medium text-gray-700 outline-none transition-colors placeholder:text-purple-300 focus:border-pink-400 focus:ring-0" /></AdminField><AdminField label="แปลไทยสไตล์จีซู"><textarea id="admin-thai" name="thaiDrama" value={form.thai_drama} onChange={(event) => updateForm('thai_drama', event.target.value)} placeholder="แปลไทยสไตล์จีซู" rows={4} className="w-full resize-y rounded-xl border-2 border-purple-200 bg-purple-50 px-4 py-3 font-medium text-gray-700 outline-none transition-colors placeholder:text-purple-300 focus:border-pink-400 focus:ring-0" /></AdminField><AdminField label="Labels"><div className={`rounded-xl border-2 p-3 ${isDuplicateLabel ? 'border-red-500 bg-red-500 text-white' : 'border-purple-200 bg-purple-50'}`}>{form.labels.length > 0 && <div className="mb-2 flex flex-wrap gap-2">{form.labels.map((label) => <span key={label} className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700">{label}<button type="button" onClick={() => setForm((current) => ({ ...current, labels: current.labels.filter((item) => item !== label) }))} className="cursor-pointer text-purple-400 hover:text-red-500" aria-label={`ลบ label ${label}`}>×</button></span>)}</div>}<input value={form.labelInput} onChange={(event) => updateLabelInput(event.target.value)} onKeyDown={(event) => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); addLabel(); } }} onBlur={addLabel} placeholder="พิมพ์ A-Z, 0-9, _ แล้วกด Space หรือ Enter" className={`w-full bg-transparent p-1 text-sm outline-none placeholder:text-purple-300 ${isDuplicateLabel ? 'text-white placeholder:text-red-100' : 'text-gray-700'}`} />{isDuplicateLabel && <p className="mt-1 text-xs font-bold text-white">Label นี้มีอยู่แล้ว</p>}</div></AdminField><div className="space-y-3"><p className="text-sm font-bold text-gray-600">ตัวเลือก <span className="font-normal text-gray-400">(English บังคับ / ไทยไม่บังคับ)</span></p>{form.options.map((option, index) => <div key={option.id} className="rounded-xl border border-purple-100 p-3"><label className="flex items-center gap-2 text-xs font-bold text-purple-600"><input type="radio" name="correctOption" checked={form.correctOptionId === option.id} onChange={() => updateForm('correctOptionId', option.id)} /> คำตอบที่ถูกต้อง</label><textarea value={option.english} onChange={(event) => updateOption(index, 'english', event.target.value)} placeholder={`Option ${index + 1} English *`} rows={3} className="mt-2 w-full resize-y rounded-lg border border-gray-200 p-2 text-sm" /><textarea value={option.thai_drama} onChange={(event) => updateOption(index, 'thai_drama', event.target.value)} placeholder={`Option ${index + 1} ไทย (ไม่บังคับ)`} rows={3} className="mt-2 w-full resize-y rounded-lg border border-gray-200 p-2 text-sm" />{form.options.length > 2 && <button type="button" onClick={() => setForm((current) => ({ ...current, options: current.options.filter((_, optionIndex) => optionIndex !== index) }))} className="mt-2 cursor-pointer text-xs text-red-400">ลบตัวเลือก</button>}</div>)}<button type="button" onClick={() => setForm((current) => ({ ...current, options: [...current.options, { id: `option-${current.options.length + 1}`, english: '', thai_drama: '' }] }))} className="cursor-pointer text-sm font-bold text-purple-500">+ เพิ่มตัวเลือก</button></div><AdminField label="Fun fact"><textarea id="admin-fun-fact" name="funFact" value={form.funFact} onChange={(event) => updateForm('funFact', event.target.value)} placeholder="เกร็ดความรู้หลังตอบคำถาม" rows={4} className="w-full resize-y rounded-xl border-2 border-purple-200 bg-purple-50 px-4 py-3 font-medium text-gray-700 outline-none transition-colors placeholder:text-purple-300 focus:border-pink-400 focus:ring-0" /></AdminField><AdminField label="แหล่งอ้างอิง"><textarea id="admin-source" name="source" value={form.sourceName} onChange={(event) => updateForm('sourceName', event.target.value)} placeholder="แหล่งอ้างอิง" rows={3} className="w-full resize-y rounded-xl border-2 border-purple-200 bg-purple-50 px-4 py-3 font-medium text-gray-700 outline-none transition-colors placeholder:text-purple-300 focus:border-pink-400 focus:ring-0" /></AdminField><button type="submit" disabled={isLoading} className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 py-3 font-bold text-white disabled:opacity-50">{editingId ? 'บันทึกการแก้ไข' : 'เพิ่มคำถาม'}</button></form><section className="rounded-3xl bg-white p-6 shadow-xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-black text-gray-800">คลังคำถาม ({questions.length})</h2><button type="button" onClick={() => void loadQuestions()} className="cursor-pointer text-sm font-bold text-purple-500">รีเฟรช</button></div><div className="max-h-[75vh] space-y-3 overflow-y-auto">{questions.map((question) => <article key={question.id} className="rounded-2xl border border-purple-100 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-purple-500">{question.mode} · <span className={question.status === 'published' ? 'rounded-full bg-green-100 px-2 py-0.5 text-green-700' : 'text-gray-500'}>{question.status}</span></p><h3 className="font-bold text-gray-800">{question.english}</h3></div><div className="flex gap-2"><button type="button" onClick={() => { setEditingId(question.id); setForm(toInput(question)); }} className="cursor-pointer text-xs font-bold text-purple-500">แก้ไข</button><button type="button" onClick={() => void remove(question.id)} className="cursor-pointer text-xs font-bold text-red-400">ลบ</button></div></div><div className="mt-2 flex flex-wrap gap-1.5">{question.labels?.map((label) => <span key={label} className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-600">{label}</span>)}<span className="w-full text-xs text-gray-500">{question.options.length} ตัวเลือก</span></div></article>)}</div></section></section></main>;
}
