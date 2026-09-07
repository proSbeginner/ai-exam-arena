# Project Commands

คำสั่งที่ใช้สำหรับรันและทดสอบ AI Exam Arena

## Production build

สร้าง production build ด้วย Turbopack:

```bash
npm run build
```

รัน production server:

```bash
npm run start
```

ค่าเริ่มต้นที่ใช้ทดสอบ:

- Local: `http://localhost:3000`
- Network: `http://192.168.1.5:3000`

## Browser Act

ตรวจสอบ browser ที่ตั้งค่าไว้:

```bash
browser-act browser list
```

สร้าง Chrome แยกสำหรับทดสอบ:

```bash
browser-act browser create \
  --name "AI Exam Arena Production Test" \
  --type chrome \
  --desc "Isolated browser for testing the local production quiz at 192.168.1.5:3000"
```

เปิด production quiz ใน session:

```bash
browser-act --session ai-exam-arena-prod browser open \
  <browser_id> \
  http://192.168.1.5:3000/welcome \
  --headed
```

คำสั่งตรวจสอบและโต้ตอบพื้นฐาน:

```bash
browser-act --session ai-exam-arena-prod wait stable
browser-act --session ai-exam-arena-prod state
browser-act --session ai-exam-arena-prod screenshot
browser-act --session ai-exam-arena-prod click <index>
browser-act --session ai-exam-arena-prod input <index> "text"
browser-act --session ai-exam-arena-prod scroll down --amount 600
browser-act --session ai-exam-arena-prod eval "document.title"
```

ปิด session หลังทดสอบเสร็จ:

```bash
browser-act session close ai-exam-arena-prod
```

## Production quiz smoke test

ลำดับที่ทดสอบแล้ว:

1. เปิด `/welcome`
2. กรอกชื่อผู้เล่นและเริ่มฝึกฝน
3. เลือกโหมดมหาลัยและเริ่มทำข้อสอบ
4. กดค้างคำตอบตามค่าระบบ `0.8` วินาที (`800ms`)
   - ในการทดสอบครั้งล่าสุดใช้ `0.9` วินาที เพื่อเผื่อเวลาให้เกิน threshold เล็กน้อย
5. ตรวจสอบการ scroll หลังตอบ
6. เปลี่ยนข้อและทำให้ครบ
7. ตรวจสอบหน้า summary และคะแนน

## Admin question API สำหรับสร้าง Thai drama

ใช้ API ชุดนี้สำหรับอ่านคำถาม/ตัวเลือกทั้งหมด แล้วส่งคำแปลกลับไปอัปเดตตาม `questionId`

ทุก request ต้องส่ง header ของ Admin:

```http
x-admin-email: <ADMIN_EMAIL>
```

### อ่านคำถามและตัวเลือกทั้งหมด

```http
GET /api/admin/questions
```

ตัวอย่างด้วย `curl`:

```bash
curl http://localhost:3000/api/admin/questions \
  -H "x-admin-email: $ADMIN_EMAIL"
```

ผลลัพธ์อยู่ใน `questions[]` และแต่ละรายการมี `id`, `english`, `thai_drama`, `options`, `correctOptionId`, `funFact`, `source` และ `status`

### อัปเดตคำถามตาม ID

```http
PATCH /api/admin/questions/<questionId>
```

ค่า `<questionId>` ให้ใช้จาก `questions[].id` ที่ได้จาก `GET` ห้ามสร้าง ID ใหม่เอง

ตัวอย่าง payload สำหรับอัปเดต Thai drama:

```json
{
  "labels": ["LAMBDA", "COST"],
  "english": "คำถามภาษาอังกฤษเดิม",
  "thai_drama": "คำแปลไทยสไตล์จีซู",
  "options": [
    {
      "id": "A",
      "english": "ตัวเลือกภาษาอังกฤษเดิม",
      "thai_drama": "คำแปลตัวเลือกสไตล์จีซู"
    },
    {
      "id": "B",
      "english": "ตัวเลือกภาษาอังกฤษเดิม",
      "thai_drama": ""
    }
  ],
  "correctOptionId": "A",
  "funFact": "เกร็ดความรู้เดิม",
  "source": {
    "name": "แหล่งอ้างอิงเดิม"
  },
  "status": "published"
}
```

ตัวอย่างด้วย `curl`:

```bash
curl -X PATCH "http://localhost:3000/api/admin/questions/<questionId>" \
  -H "Content-Type: application/json" \
  -H "x-admin-email: $ADMIN_EMAIL" \
  -d @updated-question.json
```

หมายเหตุ: `PATCH` ต้องส่งข้อมูลคำถามครบชุดตาม payload ไม่ใช่ส่งเฉพาะ `thai_drama` อย่างเดียว เพราะระบบจะอัปเดตตัวเลือกทั้งหมดของคำถามนั้นใหม่ด้วย
