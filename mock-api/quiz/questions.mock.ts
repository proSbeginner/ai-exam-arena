import type { ExamQuestion } from '@/features/quiz/quiz.types';

export const questions: ExamQuestion[] = [
  {
    id: 'mock-question-001',
    mode: 'university',
    labels: ['BEDROCK', 'SECURITY'],
    english: 'Which feature should you enable in Amazon Bedrock to prevent sensitive data leakage?',
    thai_drama: "อือม์... มีใครบอกว่านำ 'ความลับส่วนตัว' ของพี่ไปปล่อยไว้ภายนอกเหรอ?! 😡🔒 ฉันไม่ยอมเด็ดขาด!",
    options: [
      { id: 'mock-question-001-option-001', english: 'AWS Shield', thai_drama: 'โล่กันกระแทกสายคลาวด์' },
      { id: 'mock-question-001-option-002', english: 'Amazon Guardrails', thai_drama: 'รั้วกันข้อมูลรั่วแบบจริงจัง' },
      { id: 'mock-question-001-option-003', english: 'VPC Peering', thai_drama: 'จับมือกันเฉยๆ ไม่ได้กันข้อมูล' },
      { id: 'mock-question-001-option-004', english: 'API Gateway', thai_drama: 'ประตูทางเข้า แต่ไม่ใช่ยามเฝ้าความลับ' },
    ],
    correctOptionId: 'mock-question-001-option-002',
    hint_keyword: 'prevent sensitive data leakage',
    funFact: 'Amazon Guardrails ใช้กรองทั้งคำต้องห้าม (hate speech) และข้อมูลส่วนตัว (PII) ในคราวเดียว! ป้องกันข้อมูลรั่วไหลก่อนถึงโมเดล 🛡️',
    chapter: 'ด่าน 1: กำแพงแห่งความปลอดภัย 🔒',
    source: { name: 'AWS AI Cert Mock Bank', reference: 'internal-demo' },
    status: 'published',
  },
  {
    id: 'mock-question-002',
    mode: 'university',
    labels: ['SERVERLESS', 'COST'],
    english: 'What billing mechanism is used by AWS Lambda for function execution time?',
    thai_drama: 'ฮัลโหล?? พระเอกของฉันหายไปไหนหมด?? 💁‍♂️✨ จ่ายเฉพาะตอนที่มีตัวตนจริง! (เรียกว่า Pay-per-use ค่ะ)',
    options: [
      { id: 'mock-question-002-option-001', english: 'Hourly Subscription', thai_drama: 'เหมาจ่ายรายชั่วโมง' },
      { id: 'mock-question-002-option-002', english: 'EC2 Reserved Instance', thai_drama: 'จองเครื่อง แต่คนละเรื่องกัน' },
      { id: 'mock-question-002-option-003', english: 'Pay-per-request', thai_drama: 'เรียกเมื่อไหร่ จ่ายเมื่อนั้น' },
      { id: 'mock-question-002-option-004', english: 'Monthly Flat Fee', thai_drama: 'เหมาจ่ายรายเดือนแบบไม่สนใจใช้จริง' },
    ],
    correctOptionId: 'mock-question-002-option-003',
    hint_keyword: 'billing mechanism',
    funFact: 'Lambda คิดเงินเป็นมิลลิวินาที! เรียกกี่ครั้งก็จ่ายเท่าที่ใช้ — ถ้าไม่ถูกเรียกเลย = ฟรี 💸',
    chapter: 'ด่าน 2: ปริศนาแห่งค่าใช้จ่าย 💰',
    source: { name: 'AWS AI Cert Mock Bank', reference: 'internal-demo' },
    status: 'published',
  },
];
