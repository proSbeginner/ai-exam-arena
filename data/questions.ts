export type MoodState = 'idle' | 'correct' | 'wrong' | 'passed' | 'failed';

export interface ExamQuestion {
  id: number;
  topic: string;
  english: string;
  thai_drama: string;
  options: string[];
  correctIndex: number;
  hint_keyword: string;
  funFact?: string;
  chapter?: string;
}

export const CHEER_MESSAGES = [
  "เย้! เก่งมากจ๊ะ~ ❤️",
  "เป๊ะเวอร์! ตอบได้แม่นมาก 💯",
  "สุดยอดเลย! ไปต่อกันเลยจ้า 🚀",
  "โอ้โห! รู้จริงเรื่องนี้เลยนะ ✨",
  "วิเศษไปเลย! ถูกต้องค่า~ 🎯",
];

export const SYMPATHY_MESSAGES = [
  "อุ้ย... ไม่เป็นไรนะ ลองดูใหม่ 😤",
  "เกือบแล้ว! ตั้งใจอีกนิดน้า 💪",
  "อ๋อ... ข้อนี้ยากจริงๆ ดู hint นะ 👀",
  "อย่าเพิ่งท้อ! ผิดคือการเรียนรู้ 📚",
  "แง่ว... ข้อนี้หลายคนพลาดเหมือนกัน 🤗",
];

export const MOOD_IMAGES: Record<MoodState, string> = {
  idle: '/images/idle.png',
  correct: '/images/correct1.png',
  wrong: '/images/wrong.jpeg',
  passed: '/images/pass.png',
  failed: '/images/fail.png',
};

export const CORRECT_IMAGES = ['/images/correct1.png', '/images/correct2.png'];

export const questions: ExamQuestion[] = [
  {
    id: 1,
    topic: 'Bedrock Security',
    english: "Which feature should you enable in Amazon Bedrock to prevent sensitive data leakage?",
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
    english: "What billing mechanism is used by AWS Lambda for function execution time?",
    thai_drama: "ฮัลโหล?? พระเอกของฉันหายไปไหนหมด?? 💁‍♂️✨ จ่ายเฉพาะตอนที่มีตัวตนจริง! (เรียกว่า Pay-per-use ค่ะ)",
    options: ['Hourly Subscription', 'EC2 Reserved Instance', 'Pay-per-request', 'Monthly Flat Fee'],
    correctIndex: 2,
    hint_keyword: 'billing mechanism',
    funFact: 'Lambda คิดเงินเป็นมิลลิวินาที! เรียกกี่ครั้งก็จ่ายเท่าที่ใช้ — ถ้าไม่ถูกเรียกเลย = ฟรี 💸',
    chapter: 'ด่าน 2: ปริศนาแห่งค่าใช้จ่าย 💰',
  },
];
