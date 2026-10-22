# ใช้เว็บนี้อย่างไรตั้งแต่โจทย์จนรัน API

## ทางลัด: วางโจทย์แล้วตรวจค่าที่ระบบอ่านได้

หน้าแรกและ Phase 05 มีเมนู **เลือกโจทย์ตัวอย่าง** 5 แบบ: CRUD ครบ, GET กับ pagination, POST/PUT/DELETE, Search/JOIN/DTO, และโจทย์ที่สั่งแก้ไฟล์โดยระบุ path. เลือกแล้วกด **ใส่โจทย์ตัวอย่างในช่องค้นหา** เพื่อดูสิ่งที่ระบบอ่านได้ ก่อนกดนำค่าที่พบไปกรอก. เมื่อลองเปลี่ยนตัวอย่างหลังนำค่าไปกรอกแล้ว ฟีเจอร์เดิมที่ติ๊กไว้จะยังอยู่; กลับไป Phase 02 ปิดข้อที่โจทย์ใหม่ไม่ต้องการ. Phase 04 คงตารางลำดับยิง GET/POST/PUT/DELETE ทั้งชุด และเพิ่มตารางกรณีผิดพลาด 400/404/409 พร้อม URL กับ raw JSON ที่ใช้ลอง. 500 ให้ตรวจ Terminal และ SQL ตาม error ไม่ต้องจงใจทำให้ server พัง. ให้ยึด status ที่ใบงานกำหนดหากต่างจากตัวอย่าง.

ถ้าโจทย์ระบุ `src/routes-$id/route.js` หรือไฟล์อื่น ระบบจะแสดงบรรทัดคำสั่งและปุ่มเปิดโครงของไฟล์ที่สร้างได้ใน Phase 03. ปุ่มนี้เติมค่าที่อ่านจากโจทย์ แต่ **ไม่แก้ template ครูในเครื่องอัตโนมัติ**. เทียบโค้ดกับไฟล์ต้นฉบับก่อนเพิ่มหรือแทน โดยเฉพาะกรณีโจทย์สั่งเพิ่มเฉพาะส่วน. `package.json`, `tests/` หรือ path ที่เว็บไม่ได้สร้างจะแจ้งให้ตรวจและแก้เอง.

1. เปิด `http://127.0.0.1:4173` แล้ววางข้อความโจทย์ในช่อง **ข้อความโจทย์ / Exam question** หน้าแรก กด **ค้นหาโจทย์**. ใช้ภาษาไทย อังกฤษ หรือผสมกันได้; การจับคู่เป็นกฎคำและรูปแบบ URL/JSON ในเครื่อง ไม่ใช่ AI.
2. ใน Phase 05 อ่าน **สรุปที่อ่านได้จากโจทย์**: งาน GET/POST/PUT/DELETE, Student ID, base path, endpoint, database, port, page/limit, Request Body และ Summary DTO ที่พบ. ดูคำเตือนด้วย เพราะข้อความโจทย์หลาย resource หรือรูปแบบอื่นอาจจับผิด.
3. กด **นำค่าที่พบไปกรอก → ตรวจในเมนู 01**. ระบบเติมช่องและติ๊กข้อที่พบ โดยรวมกับสิ่งที่เลือกไว้เดิม. ถ้ายังไม่มี SQL ชื่อ table ที่เดาจาก URL และ field ที่เดาจาก Request Body เป็นเพียงข้อมูลชั่วคราว.
4. ใน Phase 01 เลือกไฟล์ SQL ที่ครูแจก แล้วเลือกตารางจริงจากรายการ. ตรวจ `CREATE TABLE`, primary key, ชนิดข้อมูล, nullable/required, DB column ↔ request body ↔ response JSON ทุกแถว. การเลือกตาราง SQL หลังวางโจทย์จะปรับ field ตาม SQL และจับคู่ body/summary ที่อ่านไว้; endpoint จากโจทย์จะยังอยู่. ตั้ง MySQL host/user/password และ Express port ให้ตรงเครื่องและใบงาน.
5. Phase 02 ตรวจข้อที่ติ๊กและตัวเลือก PUT partial/full, JOIN, pagination. Phase 03 ดูชื่อไฟล์และคัดลอกหรือดาวน์โหลด ZIP รวม. Phase 04 แสดง Method, URL, `Body → raw → JSON` ของ POST/PUT ตาม field ที่เลือก โดยใช้ค่าจาก Request Body ในโจทย์เมื่อจับคู่ได้. กด **คัดลอก raw JSON** หรือ import `postman-collection.json`; เปลี่ยนค่า unique/ID และอย่างน้อยหนึ่งค่าที่ PUT ให้เห็นผล แล้วกด Send และ GET ตรวจซ้ำ.

ตัวอย่างข้อความที่วางได้:

```text
Student ID: 67130500004
Database: mobile_distributor
GET /api/67130500004/products?page=1&limit=10
POST /api/67130500004/products
Request Body: {"sku":"TEST-SKU-999","name":"Test Phone","price":29900}
PUT /api/67130500004/products/:id
DELETE /api/67130500004/products/:id
```

ตัวอย่างนี้ยังบอกชื่อคอลัมน์และกฎ validation ได้ไม่ครบ ต้องใช้ไฟล์ SQL และ response ที่โจทย์ระบุเป็นหลัก. `localhost:4173` คือเว็บคู่มือ ส่วน API ที่ยิงจาก Postman มักเป็น `localhost:3000` หรือตามโจทย์.

## เว็บนี้ทำหน้าที่อะไร

เว็บบน http://127.0.0.1:4173 เป็นเครื่องมืออ่านโจทย์และสร้างโครงไฟล์ Express ESM สำหรับ **หนึ่ง resource หลักต่อหนึ่ง ZIP ที่ดาวน์โหลด**. มันไม่ใช่ API ที่ส่งอาจารย์ และไม่ได้แก้ไฟล์เทมเพลตครูในเครื่องให้เอง. API ที่สร้างจะรันแยกต่างหาก เช่น http://localhost:3000.

การติ๊ก GET, POST, PUT, DELETE หมายถึง “เปิดข้อเหล่านี้ในโค้ดชุดเดียวกัน”. เว็บสร้างไฟล์ route, service, repository, mapper, config ให้สัมพันธ์กัน. หากเพิ่มอีกข้อ ให้ดาวน์โหลดชุดใหม่หลังติ๊กเพิ่ม; อย่าเอาบล็อกโค้ดหนึ่งไปแปะท้ายไฟล์โดยไม่ตรวจ import/handler.

## เตรียมก่อนเริ่ม

- Node.js, MySQL, Postman Desktop, เทมเพลตครู, ไฟล์ SQL และ dependencies ที่ติดตั้งได้ในช่วงที่อนุญาต
- แตก ZIP เว็บคู่มือ เปิดโฟลเดอร์ที่มี server.mjs ใน VS Code แล้วรัน node server.mjs
- แตก ZIP เทมเพลตครูแยกอีกโฟลเดอร์ เปิดชั้นในที่มี package.json
- เว็บคู่มือพอร์ต 4173; API ที่สร้างพอร์ตตามโจทย์ เช่น 3000; MySQL ปกติ 3306

## ตัวอย่างที่ทำตามได้: GET /products/:id

สมมุติโจทย์บอก: “GET /api/STUDENT_ID/products/:id ส่งรายละเอียดสินค้าตอบ 200; ถ้าไม่พบตอบ 404”

1. หน้าแรก วางโจทย์แล้วค้น. ผลแนะนำ GET by ID. กดเลือกหรือไปเมนู 02 เพื่อติ๊กเอง.
2. เมนู 01 เลือก SQL จริง. ดูว่าตารางสินค้าชื่อ products หรือชื่ออื่น; คลิกตารางนั้น. ดู PRIMARY KEY จาก SQL เช่น id.
3. กรอก Student ID, base path /api/STUDENT_ID, endpoint /products, table products, key id. เช็ก SQL column → request body → response JSON ทีละแถว.
4. เมนู 02 ติ๊ก GET ตาม ID. หากโจทย์ขอ GET list ด้วยก็ติ๊กเพิ่ม. ถ้าโจทย์ไม่ได้ขอ POST ไม่ต้องติ๊ก.
5. เมนู 03 ดาวน์โหลด ZIP โค้ดรวม. ตัว ZIP มี src/app.js, route, service, repository, mapper, config และ README-EXAM.md.
6. ใช้โฟลเดอร์เทมเพลตครูเป็นโปรเจกต์หลัก. คัดลอก src/ จาก ZIP ที่สร้างไปยังเทมเพลตโดยให้ path ตรงกัน. เทียบไฟล์เดิมก่อนแทน; เพิ่มไฟล์ใหม่ที่ยังไม่มี. เก็บ tests/ และ SQL ที่ครูแจก.
7. ตรวจ package.json ให้มี dependencies ตามเทมเพลตและ script start: node src/app.js; ถ้าเดิมมี script ที่ครูให้ อย่าลบ. รัน npm start จากโฟลเดอร์เทมเพลต.
8. Postman GET http://localhost:3000/api/STUDENT_ID/products/IDจริง. เทียบ status และ JSON กับโจทย์; ลอง ID ไม่มีเพื่อดู 404.

## ถ้ามีข้อ POST/PUT/DELETE เพิ่ม

กลับเมนู 02 แล้วติ๊กข้อเพิ่ม ไม่ต้องสร้างไฟล์ route อีกชุดด้วยมือ. ดาวน์โหลด ZIP ใหม่ เพราะไฟล์ทุกชั้นสร้างจากตัวเลือกปัจจุบันเดียวกัน.

| ข้อ | สิ่งที่เว็บสร้าง | ต้องกรอก/ตรวจเพิ่มจากโจทย์ | Postman |
| --- | --- | --- | --- |
| GET list | route GET /, SELECT, DTO list | field ของ summary, page/limit, ORDER BY | GET URL แล้วตรวจ data/pagination |
| GET detail | route GET /:id, SELECT WHERE, detail DTO | key, response field, 404 | ID จริงและ ID ไม่มี |
| POST | route POST /, validate, INSERT | body key, required, unique, FK | Body > raw > JSON, 201 และ 409 ตามโจทย์ |
| PUT | route PUT /:id, validate, UPDATE | partial/full, field ที่แก้ได้ | raw JSON กับ ID จริง แล้ว GET ซ้ำ |
| DELETE | route DELETE /:id, DELETE | 204 ไม่มี body หรือ 200 ตามโจทย์, FK | DELETE แล้ว GET ซ้ำให้ 404 |
| Search | WHERE LIKE และ COUNT | query parameter โครงใช้ q; เปลี่ยนถ้าโจทย์ชื่ออื่น | GET ?q=คำที่มีจริง |
| Pagination | LIMIT/OFFSET และ metadata | default/max, ชื่อ key response | GET ?page=1&limit=10 |
| JOIN/DTO | JOIN และ mapper | FK/PK, alias, JSON key | เทียบ field ทุกตัวกับ response ตัวอย่าง |

## ไฟล์ไปอยู่ตรงไหน

สมมุติเทมเพลตที่ครูแจกมี package.json และ src/ อยู่ในโฟลเดอร์ node-express-esm-template ให้เปิดโฟลเดอร์นั้นเป็น root ของโปรเจกต์. ZIP จากเว็บมี root ชั้นหนึ่ง เช่น YOUR_STUDENT_ID_exam/; **คัดลอกเนื้อหา src/ ด้านใน** ไปใต้ node-express-esm-template/src/ โดยรักษาโครงชื่อเดิม.

| ไฟล์จาก ZIP เว็บ | ในเทมเพลตที่ตรวจไว้ | งานที่ทำ |
| --- | --- | --- |
| src/app.js | มีอยู่ | เทียบแล้วแทนหรือปรับ; mount route และเริ่ม server |
| src/test-service.js | มีอยู่ | เทียบแล้วแทนหรือปรับ; ทดสอบ DB |
| src/configs-$id/db-config.js | มีอยู่ | เทียบแล้วแทนหรือปรับ; เชื่อม MySQL |
| src/configs-$id/exam-config.js | ยังไม่มี | เพิ่มใหม่; ค่าที่กรอกทั้งหมด |
| src/routes-$id/route.js | มีอยู่ | เทียบแล้วแทนหรือปรับ; endpoint ที่เลือก |
| src/services-$id/service.js | มีอยู่ | เทียบแล้วแทนหรือปรับ; validation และ 404 |
| src/repositories-$id/repository.js | มีอยู่ | เทียบแล้วแทนหรือปรับ; SQL |
| src/mappers-$id/entity-dto-mapper.js | มีอยู่ | เทียบแล้วแทนหรือปรับ; output JSON |
| src/mappers-$id/api-response.js | มีอยู่ | เทียบแล้วแทนหรือปรับ; response envelope |
| src/middlewares-$id/pagination-middleware.js | มีอยู่ | เทียบแล้วแทนหรือปรับ; page/limit |
| src/middlewares-$id/error-handler.js | ยังไม่มี | เพิ่มใหม่; 400/404/409/500 |
| postman-collection.json | อาจยังไม่มี | import ใน Postman Desktop |
| README-EXAM.md | อาจยังไม่มี | อ่าน checklist และ raw JSON |
| package.json | เทมเพลตมีอยู่ | เทียบ dependencies/scripts อย่าวางทับโดยไม่ดู |

ชื่อโฟลเดอร์มี -$id ตามเทมเพลตที่ตรวจในชุดนี้. ถ้าครูแจกเทมเพลตใหม่ที่เปลี่ยนชื่อโฟลเดอร์ ให้แก้ชื่อโฟลเดอร์ **พร้อม import ในทุกไฟล์**. ถ้าไฟล์เดิมมีโค้ดที่ครูเพิ่มหรือตัวตรวจต้องใช้ ให้เทียบก่อนแทนเสมอ.

## นำเข้า SQL และทดสอบ

การแนบ SQL ในเว็บ **ไม่ใช่การ import ลง MySQL**. เปิด SQL ที่แจกจริงใน WebStorm Database หรือ mysql CLI แล้วรันตามคำสั่งที่ปลอดภัยและตรงกับไฟล์จริง. ตรวจ SHOW TABLES, SHOW CREATE TABLE และ SELECT ก่อนเชื่อค่าที่เว็บอ่าน. จากนั้นตรวจ src/configs-$id/exam-config.js ว่า database, host, port, user, password, table, field, PK และ URL ถูกต้อง.

เปิด Terminal ในโปรเจกต์ API (ไม่ใช่โฟลเดอร์เว็บคู่มือ), รัน npm start. ใน Postman Desktop import postman-collection.json หรือสร้าง request เอง. POST/PUT เลือก Body > raw > JSON; เปลี่ยนค่าตัวอย่างให้เป็นข้อมูลจริง. เช็ก Terminal ถ้า 500, field mapping ถ้า Unknown column, base path ถ้า 404 และ MySQL connection ถ้า ECONNREFUSED.

## ขอบเขต

ตัวสร้างรองรับหนึ่ง resource หลักต่อ ZIP, JOIN อีกหนึ่งตาราง, key เดี่ยวแบบเลขหรือ string และ validation ทั่วไป. หลาย resource ต้องทำทีละรอบแล้วรวม routes/config เอง. Composite key, PATCH, upsert, full replacement จริง, ENUM/length/business rule และ response ที่โจทย์กำหนดต่างจากโครงต้องแก้ต่อ. โค้ดจะถือว่าใช้ได้เมื่อรันกับ MySQL และผ่านตัวตรวจจริงเท่านั้น.
