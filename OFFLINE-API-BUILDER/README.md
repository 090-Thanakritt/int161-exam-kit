# INT161 Offline API Kit

**เริ่มตรงนี้:** เปิดเว็บแล้วอ่านหัวข้อ “เว็บนี้ใช้ทำอะไร?” บนหน้าแรก. คำอธิบายการคัดลอกไฟล์จาก ZIP ไปยังเทมเพลตครูอยู่ที่ [docs/HOW-TO-USE.md](docs/HOW-TO-USE.md). เมนู 02 ใช้เลือก endpoint; เมนู 03 ดาวน์โหลดไฟล์โค้ดทั้งชุดพร้อมตารางว่าต้องวางไฟล์ใดตรงไหน. เว็บคู่มือไม่ใช่โปรเจกต์ API ที่ส่งงาน.

## ค้นโจทย์ในเครื่อง / Offline question finder

เมนู 05 มีช่องวางโจทย์ภาษาไทยหรืออังกฤษ. ระบบใช้กฎคำและวลีที่อยู่ใน matcher.mjs เพื่อเรียงหัวข้อที่น่าจะเกี่ยวข้อง พร้อมเหตุผลและคำที่พบ. กดเลือกหัวข้อทีละข้อแล้วกลับไปดูโค้ดรวม. ช่องค้นสั้นใช้ค้นหัวข้อจาก catalog.mjs และเปิดคู่มือใน docs/; เริ่มที่ docs/OFFLINE-QUESTION-FINDER.md สำหรับตัวอย่างสองภาษา. ไม่ใช้ AI และไม่ส่งโจทย์ไปเซิร์ฟเวอร์ภายนอก. การจับคู่เป็นคำแนะนำ ต้องอ่านโจทย์จริงก่อนเลือก.

เมนู 01 เมื่อเลือกไฟล์ SQL จะแสดงชื่อไฟล์ จำนวนตาราง และรายการตารางทั้งหมดที่อ่านได้. เลือกตารางจาก dropdown หรือปุ่มชื่อตารางเพื่อเติม resource หลัก; หากเลือกใหม่ ฟิลด์เดิมในฟอร์มจะถูกแทนด้วยตารางใหม่. ตัวอ่าน SQL ไม่รันไฟล์ใน MySQL.

เมนู 02 ตัวเลือก PUT partial/full เป็นกฎตรวจ request body ของโครงตัวอย่าง: partial รับเฉพาะฟิลด์ที่ส่ง ส่วน full บังคับฟิลด์ required ให้ครบ. ทั้งสองยังไม่ใช่ full replacement ตามความหมายของทุกโจทย์. อ่านตัวอย่างในหน้าเว็บและคู่มือก่อนเลือก; PATCH, upsert และกฎเฉพาะต้องแก้โค้ดเพิ่ม.

## เก็บบน GitHub แล้วเปิดในห้องสอบ

อัปโหลด ZIP นี้เป็นไฟล์ใน repository ของตัวเองก่อนสอบ หรือแตก ZIP แล้ว push โฟลเดอร์เว็บทั้งชุดขึ้น repository. ก่อนช่วงที่ห้ามใช้อินเทอร์เน็ต ให้ดาวน์โหลด ZIP จาก GitHub ลงเครื่องและแตกไฟล์ไว้แล้ว. ใน VS Code เลือก **File > Open Folder** เปิดโฟลเดอร์ `INT161-OFFLINE-API-BUILDER` ที่มี `server.mjs`. เปิด Terminal ในโฟลเดอร์นั้นแล้วรัน `node server.mjs`; เข้า `http://127.0.0.1:4173`. เว็บไม่ต้อง `npm install`. ปิดด้วย Ctrl+C.

อย่า push ZIP โปรเจกต์สอบที่กรอก MySQL password หรือ Secret Key ลง repository สาธารณะ. ZIP โค้ดที่เว็บสร้างให้ใช้ในเครื่องและเทียบกับโจทย์จริงก่อนส่ง.

เว็บคู่มือภาษาไทยสำหรับใช้กับโครง Express ESM ของอาจารย์ เปิดบน localhost และค้นจากตัวอย่างที่เตรียมไว้ ไม่มี AI, CDN, analytics หรือคำขอออกอินเทอร์เน็ต

## เปิดใน VS Code / WebStorm

1. แตก ZIP เว็บไซต์นี้และเปิดโฟลเดอร์ INT161-OFFLINE-API-BUILDER ใน VS Code
2. เปิด Terminal ในโฟลเดอร์นี้แล้วรัน `node server.mjs` (ต้องมี Node.js; ไม่ต้อง npm install สำหรับเว็บคู่มือ)
3. เปิด `http://127.0.0.1:4173` ใน browser
4. กรอกค่าจากใบงานและ SQL จริง, เลือกฟีเจอร์ทีละข้อ, ดูโค้ดรวม, ดาวน์โหลด ZIP
5. แตก ZIP โปรเจกต์ที่สร้าง เปิดด้วย VS Code หรือ WebStorm แล้วติดตั้ง dependencies ของโปรเจกต์ API ให้พร้อมก่อนช่วงห้ามอินเทอร์เน็ต

ปิดเว็บด้วย Ctrl+C ใน Terminal. พอร์ตเว็บคู่มือ 4173 ไม่ใช่พอร์ต Express API 3000 หรือ MySQL 3306

## สิ่งที่ทำได้

- ฟอร์มฐานข้อมูล, student-info, base path, endpoint, PK, body/DB/response field mapping
- อ่าน CREATE TABLE จากไฟล์ .sql ในเครื่องเพื่อช่วยเติม field เบื้องต้น (ไม่ execute SQL)
- เลือก GET list/detail, POST, PUT, DELETE, search, pagination, JOIN, summary/detail DTO ทีละข้อ
- โค้ดสะสมตาม template: app, route, service, repository, mapper, middleware, db-config
- คัดลอก/ดาวน์โหลดไฟล์เดี่ยว และ ZIP โปรเจกต์ที่มี README กับ Postman collection
- ค้นหัวข้อจากตัวอย่างและเปิด Markdown ที่แนบมาด้วย

## ขอบเขตและการตรวจ

ตัวสร้างนี้รองรับ resource หลักหนึ่งตาราง, JOIN หนึ่งตาราง, key เดี่ยวเป็นเลขหรือ string. ตัวอ่าน SQL ช่วยเติมค่าเบื้องต้นเท่านั้น; SQL ที่มี ALTER TABLE, key ผสม, ENUM, CHECK หรือกฎซับซ้อนต้องอ่าน schema จริงและปรับโค้ดด้วยมือ. Validation ที่สร้างยังเป็นชนิดพื้นฐาน; ค่า VARCHAR, precision, nullable, business rules, error envelope และรูปแบบ response ต้องเทียบโจทย์จริง. ไม่เชื่อม MySQL หรือรันทดสอบ Postman จากหน้าเว็บ

รัน `node tests.mjs` เพื่อตรวจการสร้างไฟล์, syntax, schema parser และ ZIP บางส่วน. จากนั้นให้ลอง API ที่ดาวน์โหลดกับ MySQL และ Postman จริงก่อนส่ง

ไฟล์ SQL ที่นำเข้าและรหัสผ่านถูกใช้เฉพาะใน browser session และ ZIP ที่ดาวน์โหลด; เว็บไม่บันทึกลง localStorage. ZIP ที่สร้างมีรหัสฐานข้อมูลและ Secret Key ใน exam-config.js หากกรอกไว้ จึงตรวจไฟล์ก่อน push สู่ GitHub
