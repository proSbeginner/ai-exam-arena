export type MoodState = 'idle' | 'correct' | 'wrong' | 'passed' | 'failed';

export interface ExamQuestion {
  id: number;
  topic: string;
  english: string;
  thai_drama: string;
  options: string[];
  correctIndex: number;
  hint_keyword: string;
}

export const MOOD_IMAGES: Record<MoodState, string> = {
  idle: '/images/idle.png',
  correct: '/images/correct.png',
  wrong: '/images/wrong.png',
  passed: '/images/pass.png',
  failed: '/images/fail.png',
};

export const questions: ExamQuestion[] = [
  {
    id: 1,
    topic: 'Bedrock Security',
    english: "Which feature should you enable in Amazon Bedrock to prevent sensitive data leakage?",
    thai_drama: "อือม์... มีใครบอกว่านำ 'ความลับส่วนตัว' ของพี่ไปปล่อยไว้ภายนอกเหรอ?! 😡🔒 ฉันไม่ยอมเด็ดขาด!",
    options: ['AWS Shield', 'Amazon Guardrails', 'VPC Peering', 'API Gateway'],
    correctIndex: 1,
    hint_keyword: 'prevent sensitive data leakage',
  },
  {
    id: 2,
    topic: 'Serverless Cost',
    english: "What billing mechanism is used by AWS Lambda for function execution time?",
    thai_drama: "ฮัลโหล?? พระเอกของฉันหายไปไหนหมด?? 💁‍♂️✨ จ่ายเฉพาะตอนที่มีตัวตนจริง! (เรียกว่า Pay-per-use ค่ะ)",
    options: ['Hourly Subscription', 'EC2 Reserved Instance', 'Pay-per-request', 'Monthly Flat Fee'],
    correctIndex: 2,
    hint_keyword: 'billing mechanism',
  },
];
