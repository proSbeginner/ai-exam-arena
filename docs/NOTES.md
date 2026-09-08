# Project Notes

## Central app state กับ `useSyncExternalStore`

แอปสามารถจัดการ state ที่ต้องใช้ร่วมกันระหว่างหลายหน้าได้ 2 แนวทางหลัก โดยเลือกตามแหล่งที่มาของข้อมูล

### 1. Central app state: `Context` + `useState`

วาง Provider ไว้เหนือหน้าที่ต้องใช้ state ร่วมกัน เช่นใน `app/layout.tsx`

```text
app/layout.tsx
└── AppProvider
    ├── welcome
    ├── quiz/setup
    ├── quiz
    └── leaderboard
```

ข้อดี:

- ใช้งานง่ายและตรงกับรูปแบบ React ที่คุ้นเคย
- ทุก component ภายใน Provider ใช้ state instance เดียวกัน
- เปลี่ยนค่าแล้ว component อื่นในแอปรับรู้ทันที
- เหมาะกับ player session, quiz setup และ quiz attempt ที่เป็น state ของแอป
- ไม่ต้องเขียน `subscribe`, `getSnapshot` หรือระบบ cache เอง

ข้อเสีย:

- ต้องวาง Provider ให้ครอบคลุมทุกหน้าที่ต้องใช้ state
- Provider ที่มี state เปลี่ยนบ่อยอาจทำให้ component ลูก re-render มากเกินไป
- state หายเมื่อ refresh หากไม่ได้ persist ลง `sessionStorage` หรือ database
- ไม่เหมาะกับการอ่านข้อมูลจากแหล่งภายนอกโดยตรง

### 2. `useSyncExternalStore`

ใช้เชื่อม React เข้ากับ store หรือแหล่งข้อมูลที่อยู่นอก React เช่น browser API, custom store หรือ state library

ข้อดี:

- React subscribe กับ external store ได้อย่างถูกต้อง
- รองรับ Concurrent Rendering และ SSR อย่างเป็นระบบ
- เหมาะกับข้อมูลที่เปลี่ยนจากภายนอก React
- แยก store ออกจาก component ได้ชัดเจน

ข้อเสีย:

- ซับซ้อนกว่า `useState` และ Context
- ต้องดูแล `subscribe`, `getSnapshot` และ `getServerSnapshot` เอง
- `getSnapshot` ต้องคืนค่าเดิมด้วย reference เดิมเมื่อข้อมูลไม่เปลี่ยน
- ต้องออกแบบ cache และการแจ้งเตือนเมื่อข้อมูลเปลี่ยน
- สำหรับ state ภายในแอปขนาดเล็กอาจเป็นการใช้เครื่องมือเกินความจำเป็น

### แนวทางของโปรเจกต์

ให้ใช้ `Context` + `useState` เป็นค่าเริ่มต้นสำหรับ state กลางภายในแอป เช่น:

- player profile
- quiz setup
- active quiz attempt
- quiz progress

ใช้ `sessionStorage` หรือ database เป็น persistence layer แยกจาก state หลัก เพื่อให้ข้อมูลยังอยู่หลังเปลี่ยนหน้า หรือ refresh ตามความต้องการ

ใช้ `useSyncExternalStore` เมื่อข้อมูลมีเจ้าของอยู่นอก React จริง ๆ หรือเมื่อมีเหตุผลชัดเจนว่าต้อง subscribe กับ external store โดยตรง

หาก Context เริ่มทำให้ re-render มากเกินไป หรือมี external store ที่ต้อง sync อย่างเป็นระบบ สามารถย้ายส่วนที่เกี่ยวข้องไปใช้ `useSyncExternalStore` ได้ โดยเก็บ interface ของ store และค่าที่ component ใช้ให้ใกล้เคียงเดิม เพื่อลดผลกระทบต่อหน้าอื่น

ในทางกลับกัน หาก `useSyncExternalStore` ทำให้เกิดปัญหาด้าน snapshot, cache หรือ hydration และข้อมูลนั้นเป็นเพียง state ภายในแอป ให้ย้ายกลับมาใช้ `Context` + `useState` ได้

## Quiz resume, review และ restart

การกระทำบนหน้า Summary และ Leaderboard แยกตามสถานะของ attempt:

- `ทำต่อ` ใช้กับ attempt ที่ยังทำไม่ครบ และต้องคงคำถาม คำตอบ คะแนน และตำแหน่งเดิมไว้
- `ทวนคำตอบ` ใช้กับ attempt ที่ทำครบแล้ว และเปิดคำถามพร้อมคำตอบเดิมในโหมด review โดยเริ่มจากข้อแรก
- `เล่นอีกครั้ง` ใช้เริ่มรอบใหม่ ต้องเปิด dialog เพื่อยืนยันก่อนจึงจะล้าง progress และทิ้ง attempt เดิม
- การ refresh ต้องโหลด attempt เดิมกลับมา ไม่สร้าง attempt ใหม่โดยอัตโนมัติ

## Summary stamp sound effect

ภายหลังให้เพิ่ม sound effect สั้น ๆ เช่นเสียง “ปึ้ง!” เมื่อ animation แบบตราประทับของ summary panel แสดงจบ โดยต้องตรวจสอบข้อจำกัดของ browser ที่อาจไม่อนุญาตให้เล่นเสียงอัตโนมัติโดยไม่มี user interaction

## Quiz answers

ตาราง `quiz_answers` คือหลักฐานถาวรของการทำข้อสอบ เก็บคำตอบรายข้อของแต่ละ attempt และใช้ดูคำตอบเดิมในหน้า `ทวนคำตอบ` โดย `selected_option_id` ต้องเป็น UUID ของแถวใน `question_options` ไม่ใช่ค่า `option_key` ที่ใช้ใน application เช่น `option-b`

Naming contract ของตัวเลือก:

- `question_options.option_key` คือชื่อ field ฝั่ง DB และเก็บค่าเช่น `option-b`
- `ExamQuestion.options[].optionKey` คือชื่อ field ฝั่ง application และเก็บค่าเดียวกับ `option_key`
- `question_options.id` คือ primary key UUID ของ DB ควรเรียกใน application ว่า `optionId` และใช้เป็น `selectedOptionId` เมื่อส่งไปบันทึกใน `quiz_answers`
- ห้ามใช้ชื่อ `id` ฝั่ง application แทน `optionKey` เพราะคำว่า `id` ต้องสื่อถึง primary key ของ DB

### Optimistic locking ของ quiz attempt

ปัจจุบันยังไม่เปิดใช้ optimistic locking อย่างสมบูรณ์ เพราะ `current_question_index` ใช้สำหรับตรวจว่าผู้เล่นกำลังตอบคำถามที่ถูกต้องเท่านั้น และค่าเดิมอาจยังไม่เปลี่ยนหลังบันทึกคำตอบ จึงไม่สามารถป้องกัน request ซ้ำหรือ concurrent update ได้อย่างเพียงพอ

เมื่อพร้อมทำงานส่วนนี้ ให้เพิ่ม migration สำหรับ column:

```sql
quiz_attempts.version integer not null default 0
```

จากนั้นให้ใช้ `version` เดิมเป็นเงื่อนไขใน update และเพิ่มค่า version ทีละหนึ่ง หาก update ได้ศูนย์แถวให้ถือว่าเกิด concurrent update ส่วน `current_question_index` ยังคงทำหน้าที่ตรวจลำดับคำถามแยกต่างหาก

## Chrome mobile mode scrolling

พบว่า Chrome DevTools mobile mode อาจเลื่อนหรือ swipe หน้า quiz ไม่ได้หลังเลือกคำตอบ ขณะที่ browser บน mobile จริงทำงานปกติ จึงยังไม่ปรับแก้ต่อในตอนนี้ ให้ตรวจสอบอีกครั้งหลังรัน production build ก่อนตัดสินใจแก้ถาวร

## Leaderboard mode flow

Leaderboard แสดงข้อมูลแยกตาม `mode` ของ attempt ผู้เล่นหนึ่งคนจึงมีรายการและคะแนนแยกกันได้หลาย mode

เมื่อกดปุ่มจาก Leaderboard:

- `ทวนคำตอบ` ใช้กับ attempt ที่ทำครบแล้ว บันทึก `attemptId` สำหรับ review และเข้า `/quiz` ด้วย mode เดิม
- `ทำต่อ` ใช้กับ attempt ที่ยังไม่จบ บันทึก setup เดิม แล้วเข้า `/quiz` ด้วย mode เดิม
- `เล่นอีกครั้ง` ยืนยันก่อน จากนั้นทิ้ง attempt เดิม ล้าง progress และเริ่มรอบใหม่ด้วย mode เดิม
- หากยังไม่เคยเล่น mode ที่เลือก จะไม่เรียกว่า `ทำต่อ` แต่ใช้ปุ่ม `เลือกสนาม` และพาไป `/quiz/setup`
- เมื่อไปหน้า setup จาก Leaderboard ระบบจะส่ง mode ของ tab ปัจจุบันเป็นค่าเริ่มต้น เช่น อยู่ tab `มัธยม` ก็เปิด setup ที่ `มัธยม` ไว้ก่อน ผู้เล่นยังเปลี่ยน mode หรือจำนวนข้อได้

`/quiz/setup` จึงเป็นหน้าสำหรับเริ่ม mode ใหม่หรือตั้งค่ารอบใหม่ ไม่ใช่ปลายทางปกติของ `ทำต่อ` หรือ `ทวนคำตอบ`

## Rank, MMR และการป้องกันการโกง

ระบบเก็บ rating แยกต่อผู้เล่นและ mode โดยใช้ MMR เป็นค่ากลาง และแปลงเป็น Rank ตามช่วงดังนี้:

- Herald: 0–299
- Guardian: 300–599
- Crusader: 600–899
- Archon: 900–1199
- Legend: 1200–1499
- Ancient: 1500–1799
- Divine: 1800–2099
- Immortal: 2100 ขึ้นไป

หนึ่ง tier มี 5 ดาว ดาวละ 60 MMR ยกเว้น Immortal ที่แสดงเฉพาะชื่อ Rank

สูตรการเปลี่ยน MMR ต่อ attempt:

```text
accuracy = correctCount / questionCount
randomBaseline = average(1 / optionCount ของแต่ละข้อ)
performance = (accuracy - randomBaseline) / (1 - randomBaseline)
confidence = min(answeredCount / 20, 1)
ratingChange = round(300 * performance * confidence)
```

การเปลี่ยนแปลงถูกจำกัดไม่เกิน ±300 MMR ต่อ attempt และ MMR ต่ำสุดคือ 0 โดยคำนวณแยกตาม mode เช่น `primary`, `secondary` และ `university`

เพื่อป้องกันการโกง client ส่งเพียง `attemptId` ไปยัง server เท่านั้น Server จะอ่าน attempt และคำตอบที่ตรวจสอบแล้วจากฐานข้อมูล คำนวณ rating เอง และใช้ `player_rating_events` ป้องกัน attempt เดิมถูกคิด MMR ซ้ำ

การอัปเดต rating ของ Supabase ใช้ `apply_attempt_rating` RPC เพื่อ insert event และเพิ่ม aggregate rating ใน transaction เดียว หาก request เดิมถูกส่งซ้ำ RPC จะคืนค่า rating ปัจจุบันโดยไม่เพิ่ม MMR ซ้ำ

เมื่อ attempt จบ ระบบจะคำนวณ `maxStreak` จากคำตอบจริงบน server แล้วเพิ่มโบนัส MMR แบบจำกัดตั้งแต่ streak 3 ถึง 100+ โดยโบนัสสูงสุดคือ +75 ที่ streak 100 ข้อขึ้นไป และยังอยู่ภายใต้เพดาน ±300 MMR ต่อ attempt
