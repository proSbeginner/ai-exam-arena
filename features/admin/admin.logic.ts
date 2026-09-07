import type { AdminQuestionInput } from './admin.types';

export function validateAdminQuestion(input: AdminQuestionInput): string | null {
  if (!input.topic.trim() || !input.english.trim()) return 'กรุณากรอกหัวข้อและคำถามภาษาอังกฤษให้ครบ';
  if (input.options.length < 2) return 'คำถามต้องมีตัวเลือกอย่างน้อย 2 ข้อ';
  if (!input.options.some((option) => option.id === input.correctOptionId)) return 'กรุณาเลือกคำตอบที่ถูกต้อง';
  if (input.options.some((option) => !option.english.trim())) return 'กรุณากรอกตัวเลือกภาษาอังกฤษให้ครบ';
  return null;
}
