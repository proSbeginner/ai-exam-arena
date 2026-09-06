import type { ExamQuestion } from '@/features/quiz/quiz.types';

export const questions: ExamQuestion[] = [
  {
    id: 1,
    topic: 'Bedrock Security',
    english: 'Which feature should you enable in Amazon Bedrock to prevent sensitive data leakage?',
    thai_drama: "อือม์... มีใครบอกว่านำ 'ความลับส่วนตัว' ของพี่ไปปล่อยไว้ภายนอกเหรอ?! 😡🔒 ฉันไม่ยอมเด็ดขาด!",
    options: ['AWS Shield', 'Amazon Guardrails', 'VPC Peering', 'API Gateway'],
    correctIndex: 1,
    hint_keyword: 'prevent sensitive data leakage',
    funFact: 'Amazon Guardrails ใช้กรองทั้งคำต้องห้าม (hate speech) และข้อมูลส่วนตัว (PII) ในคราวเดียว! ป้องกันข้อมูลรั่วไหลก่อนถึงโมเดล 🛡️',
    chapter: 'ด่าน 1: กำแพงแห่งความปลอดภัย 🔒',
  },
  {
    id: 2,
    topic: 'Serverless Cost',
    english: 'What billing mechanism is used by AWS Lambda for function execution time?',
    thai_drama: 'ฮัลโหล?? พระเอกของฉันหายไปไหนหมด?? 💁‍♂️✨ จ่ายเฉพาะตอนที่มีตัวตนจริง! (เรียกว่า Pay-per-use ค่ะ)',
    options: ['Hourly Subscription', 'EC2 Reserved Instance', 'Pay-per-request', 'Monthly Flat Fee'],
    correctIndex: 2,
    hint_keyword: 'billing mechanism',
    funFact: 'Lambda คิดเงินเป็นมิลลิวินาที! เรียกกี่ครั้งก็จ่ายเท่าที่ใช้ — ถ้าไม่ถูกเรียกเลย = ฟรี 💸',
    chapter: 'ด่าน 2: ปริศนาแห่งค่าใช้จ่าย 💰',
  },
];
