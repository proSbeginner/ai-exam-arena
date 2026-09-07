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
