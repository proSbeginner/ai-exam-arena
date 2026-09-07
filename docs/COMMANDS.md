# Project Commands

คำสั่งที่ใช้สำหรับรันและทดสอบ AWS AI Cert

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
  --name "AWS AI Cert Production Test" \
  --type chrome \
  --desc "Isolated browser for testing the local production quiz at 192.168.1.5:3000"
```

เปิด production quiz ใน session:

```bash
browser-act --session aws-ai-cert-prod browser open \
  <browser_id> \
  http://192.168.1.5:3000/welcome \
  --headed
```

คำสั่งตรวจสอบและโต้ตอบพื้นฐาน:

```bash
browser-act --session aws-ai-cert-prod wait stable
browser-act --session aws-ai-cert-prod state
browser-act --session aws-ai-cert-prod screenshot
browser-act --session aws-ai-cert-prod click <index>
browser-act --session aws-ai-cert-prod input <index> "text"
browser-act --session aws-ai-cert-prod scroll down --amount 600
browser-act --session aws-ai-cert-prod eval "document.title"
```

ปิด session หลังทดสอบเสร็จ:

```bash
browser-act session close aws-ai-cert-prod
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
