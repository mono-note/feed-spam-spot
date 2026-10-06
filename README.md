# Feed Spam Spotter

Chrome extension ที่ช่วยตรวจจับและติดป้ายกำกับโพสต์โฆษณา สแปม การขายของ ลิงก์ Affiliate, Scam และ Engagement bait บน X และ Facebook

การวิเคราะห์ใช้ [TypeSafe Jev](https://typesafe.ai/) โดยผู้ใช้ต้องใส่ API key ของตนเองในหน้า extension

## ความสามารถ

- ตรวจจับโพสต์บน X และ Facebook แบบอัตโนมัติ
- แสดงป้ายกำกับภาษาไทยบนโพสต์ที่เข้าข่าย
- แยกประเภทโฆษณา สแปม ขายของ Affiliate, Scam และ Engagement bait
- ตรวจจับโพสต์ที่แพลตฟอร์มระบุว่าเป็นโฆษณาได้โดยไม่เรียก API
- จำกัดจำนวนการวิเคราะห์พร้อมกันและ cache ผลลัพธ์ภายในหน้าเว็บ
- รองรับ light/dark mode ใน popup

## การติดตั้งแบบ Developer mode

1. Clone repository นี้
2. เปิด `chrome://extensions`
3. เปิด **Developer mode**
4. เลือก **Load unpacked**
5. เลือกโฟลเดอร์โปรเจกต์นี้
6. เปิด popup ของ extension แล้วใส่ TypeSafe API key
7. เปิดหรือ refresh หน้า X หรือ Facebook

## การใช้งาน

1. เปิด extension จาก toolbar ของ Chrome
2. ใส่ API key ในช่อง **API key**
3. กด **Save**
4. Refresh หน้า X หรือ Facebook เพื่อเริ่มตรวจสอบโพสต์

API key ถูกเก็บด้วย `chrome.storage.local` ภายในเบราว์เซอร์ของผู้ใช้ และส่งไปยัง TypeSafe API เพื่อวิเคราะห์โพสต์เท่านั้น

## เว็บไซต์ที่รองรับ

- `https://x.com/*`
- `https://twitter.com/*`
- `https://www.facebook.com/*`

ตัวเลือก DOM ของ Facebook อาจต้องปรับตามการเปลี่ยนแปลงของหน้าเว็บ เนื่องจากโครงสร้างของ Facebook เปลี่ยนแปลงได้บ่อย

## โครงสร้างไฟล์

- `manifest.json` — การตั้งค่า Chrome extension
- `background.js` — เรียก TypeSafe API และจัดการ API key
- `content.js` — อ่านโพสต์ วิเคราะห์ และแสดงป้ายกำกับ
- `popup.html` / `popup.js` — หน้าตั้งค่า API key
- `icons/` — ไอคอนของ extension

## ข้อจำกัด

- ต้องมี TypeSafe API key ที่ใช้งานได้
- ความแม่นยำขึ้นอยู่กับผลลัพธ์จากโมเดลและข้อความในโพสต์
- การเปลี่ยนแปลง DOM ของ X หรือ Facebook อาจทำให้ตัวตรวจจับต้องปรับปรุง

## License

ยังไม่ได้กำหนด license สำหรับโปรเจกต์นี้
