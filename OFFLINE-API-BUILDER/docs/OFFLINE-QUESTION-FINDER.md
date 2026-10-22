# Offline Question Finder / คู่มือค้นโจทย์ออฟไลน์

เปิดเว็บด้วย node server.mjs แล้วเข้า http://127.0.0.1:4173 > เมนู 05. วางโจทย์ภาษาไทยหรืออังกฤษ. ระบบใช้คำและวลีที่เขียนไว้ใน matcher.mjs เท่านั้น จัดลำดับหัวข้อที่ตรงและแสดงคำที่พบกับเหตุผล. ไม่มี AI, ไม่มีการส่งข้อความออกนอกเครื่อง. คำแนะนำอาจผิดเมื่อโจทย์ใช้ถ้อยคำใหม่ คำปฏิเสธ หรือกำหนดรูปแบบพิเศษ; อ่านใบงานจริงเสมอ.

Open menu 05 and paste the Thai or English task. The local rule matcher ranks prepared topics and shows its evidence. It does not understand every sentence. Select features manually, then inspect the generated code.

## วางโจทย์แล้วนำค่าไปใช้ / Paste and apply

วางโจทย์ทั้งข้อในหน้าแรกหรือ Phase 05 แล้วอ่านสองส่วน: **สรุปที่อ่านได้จากโจทย์** แสดงค่าที่จับจาก URL/JSON และข้อที่ควรทำ; **หัวข้อที่น่าจะตรงโจทย์** แสดงคำที่ตรงพร้อมเหตุผลไทย–อังกฤษ. กด **นำค่าที่พบไปกรอก** เพื่อเติม Phase 01 และติ๊ก Phase 02. ตรวจชื่อ table, column, PK, FK, response และ validation กับ SQL/โจทย์จริงเสมอ. หากเลือกไฟล์ SQL หลังวางโจทย์ ให้เลือกตารางจากรายการอีกครั้ง แล้วตรวจ field mapping ที่จับคู่ให้.

Phase 04 แสดง request ตามข้อที่เลือก. สำหรับ POST และ PUT เปิด Postman Desktop → Body → raw → JSON, คัดลอกตัวอย่างจากหน้าเว็บ แล้วเปลี่ยนค่า SKU/ข้อมูลให้ไม่ซ้ำ ใช้ ID ที่มีอยู่จริง และแก้ค่าใน PUT อย่างน้อยหนึ่ง field ก่อนส่ง. ถ้าโจทย์มี Request Body JSON ระบบจะนำค่าที่จับคู่ได้มาเป็นตัวอย่าง; ชนิดและข้อบังคับที่แน่นอนต้องตรวจ SQL. ข้อความที่วางอยู่ในหน้าปัจจุบันและไม่ถูกส่งไปบริการภายนอก.

## ก่อนค้น / Before searching

1. แยกโจทย์เป็น method, URL, table, key, request body, response body, status และข้อจำกัด. Extract method, URL, table, key, body, response, status and constraints.
2. ถ้าโจทย์มีหลายข้อ ให้วางทีละข้อเพื่อเห็นเหตุผลชัด แล้วกดเลือกฟีเจอร์สะสม. Paste one subquestion at a time, then accumulate selections.
3. เมนู 01 ใช้ข้อมูลจาก SQL จริง. เมนู 02 ใช้ตัดสินนโยบาย PUT, DELETE, pagination และ JOIN. เมนู 03 ดูโค้ดทุกไฟล์. เมนู 04 เทส Postman.

## ตารางเลือกโครง / Scenario map

| คำในโจทย์ / Wording | เลือก / Select | ต้องกรอกหรือดูจากไหน / Where to check | ทดลอง / Test |
| --- | --- | --- | --- |
| GET all, รายการทั้งหมด | GET list | URL จากใบงาน; table/column จาก CREATE TABLE | GET /resource → 200 และ data เป็น array |
| GET by ID, ตามรหัส, 404 | GET detail | PK จาก SHOW CREATE TABLE; ID ที่มีจริงจาก SELECT | GET /resource/ID จริง → 200; ID ไม่มี → 404 |
| POST, create, เพิ่มข้อมูล, 201 | POST | request body จากใบงาน; NOT NULL, UNIQUE, FK จาก SQL | raw JSON → 201; ส่ง SKU ซ้ำ → 409 ถ้าโจทย์กำหนด |
| PUT, update, แก้ไข | PUT | body key และ required จากใบงาน; เลือก partial/full ตามข้อความ | raw JSON กับ ID จริง → 200; GET ซ้ำตรวจค่าที่เปลี่ยน |
| DELETE, remove, ลบ, 204 | DELETE | ID จริง, FK ที่อ้างอิง, status ตามโจทย์ | DELETE → 204 ไม่มี body; GET ซ้ำ → 404 |
| search, filter, ค้นหา | Search | ชื่อ query parameter จากโจทย์ (โครงใช้ q); column ค้นจาก SQL | GET /resource?q=คำจริง → รายการตรง; COUNT ต้องตรง |
| pagination, page, limit, แบ่งหน้า | Pagination | default page/limit, maximum, metadata keys จากโจทย์ | GET ?page=1&limit=10 แล้วลองหน้า 2 |
| JOIN, brandName, ชื่อจากตารางอื่น | JOIN | FK ในตารางหลัก, PK และ display column ในอีกตาราง | GET detail ตรวจชื่อที่ JOIN กับ ID จริง |
| summary DTO, detail DTO, camelCase | DTO | response JSON ตัวอย่างเทียบ SQL column ทีละฟิลด์ | เทียบ key/type/จำนวนฟิลด์จริง ไม่เอาคอลัมน์เกิน |
| student-info, secretKey | Identity | ID/name/secret จากใบงานของตัวเอง | GET path เฉพาะ → 200 และค่าเฉพาะตัว |

## ตัวอย่างค้น / Search examples

### A. รายการสินค้าแบ่งหน้า / Paginated product list

โจทย์: “GET /products?page=1&limit=10 ส่งรายการสินค้าแบบแบ่งหน้า แสดงเฉพาะ id, sku, brandId, price ใน Summary DTO และมี totalPages/hasNextPage”

Query: “GET products with pagination page and limit, summary DTO, brandId, totalPages”.

ผลที่ควรพบ: Pagination, DTO, GET list, อาจมี JOIN หากโจทย์บอกให้ดึง brandName จาก brands. brandId เพียงอย่างเดียวอาจมาจาก products.brand_id โดยไม่ต้อง JOIN. กรอกฟิลด์ SQL brand_id → response brandId, ติ๊ก GET list เฉพาะฟิลด์ที่กำหนด แล้วตรวจ COUNT และ ORDER BY.

### B. เพิ่มสินค้า / Create product

โจทย์: “POST /products เพิ่มสินค้าใหม่ รับ sku/name/brand_id/price ตอบ 201; SKU ซ้ำตอบ 409”.

Query: “POST create product SKU duplicate 409”.

ผลที่ควรพบ: POST. กรอก body key ตามโจทย์ ไม่เดาว่า brandId หรือ brand_id. ตรวจ SQL UNIQUE, NOT NULL, FK. เทส 201 ก่อน แล้วส่ง SKU ซ้ำอีกครั้ง. หาก generated validation หรือ error JSON ไม่ตรง runner ให้แก้ src/services-$id/service.js และ src/middlewares-$id/error-handler.js.

### C. แก้ราคา / Update price

โจทย์: “PUT /products/:id ให้ส่งเฉพาะ price แล้วแก้ราคา”.

Query: “PUT update only price”.

เลือก PUT, updateMode=partial; raw JSON เช่น {"price":29900}. ฟิลด์อื่นคงเดิมตามโครง. ถ้าโจทย์บังคับส่งฟิลด์ที่จำเป็นครบ เลือก full และส่ง body ครบ. คำว่า PUT เพียงคำเดียวไม่บอกนโยบาย body; ดู request/runner.

### D. ชื่อแบรนด์ / Joined detail

โจทย์: “GET /products/:id response มี brandName จาก brands.name”.

Query: “GET product detail with JOIN brandName”.

เลือก GET detail + JOIN + DTO. จาก SHOW CREATE TABLE ดู products.brand_id REFERENCES brands(id). ตั้ง join table brands, foreignKey brand_id, targetKey id, display name, output brandName. ตรวจ alias join_value ใน repository และ mapper ว่าตรงกัน.

## PUT: ทำไมหน้าเว็บมี partial กับ full / Why two PUT policies?

สองตัวเลือกกำหนดวิธีตรวจ body ในตัวอย่าง ไม่ได้บอกว่า HTTP มี PUT สองชนิด:

- partial: ส่งเฉพาะฟิลด์ที่แก้ เช่น {"price":29900}; ถ้าไม่ส่ง name ก็ไม่แก้ name. ใช้เมื่อใบงานรับ subset.
- full: required fields ที่ทำเครื่องหมายในเมนู 01 ต้องมาให้ครบ มิฉะนั้นตอบ 400. ฟิลด์ optional ที่ไม่ส่งยังไม่ถูกล้างในโครงนี้. ถ้าโจทย์หมายถึงแทนทั้ง record รวมการล้างค่า optional ต้องเพิ่มกฎเอง.
- PATCH เป็น method แยก และเว็บยังไม่ได้สร้าง route PATCH. PUT แบบ upsert, field เฉพาะ, เปลี่ยนหลายตาราง หรือ business rule พิเศษต้องแก้ service/repository.

## SQL file และตาราง / SQL file and tables

เลือกไฟล์ในเมนู 01 แล้วเว็บแสดงชื่อไฟล์ จำนวนตาราง และชื่อทุกตารางที่อ่านได้. คลิกชื่อหรือเลือกจาก dropdown เพื่อใช้หนึ่งตารางเป็น resource หลัก; ฟอร์ม field mapping จะถูกเติมจาก CREATE TABLE พื้นฐาน. ไฟล์ยังอยู่ใน browser session; การเลือกไฟล์ไม่รัน SQL. ต้อง import SQL ใน MySQL ด้วย WebStorm Database หรือ mysql CLI ก่อนทดสอบ.

หาก SQL มี ALTER TABLE, composite key, generated column, ENUM, CHECK หรือ syntax ซับซ้อน ให้ใช้ SHOW CREATE TABLE, SHOW COLUMNS และ SELECT จริงตรวจอีกครั้ง. เปลี่ยน SQL column แล้วกลับไปดู request body key, response key, FK/PK, DTO, Postman raw JSON และ status ที่โจทย์กำหนด.

## ไล่ error / Troubleshooting

| อาการ / Symptom | ตรวจ / Check |
| --- | --- |
| ECONNREFUSED ที่ 3306 | MySQL เปิดหรือไม่; host/port/user/password/database ใน exam-config.js |
| Unknown database / ER_BAD_DB_ERROR | CREATE DATABASE/USE ใน SQL, ชื่อฐานข้อมูล |
| Unknown column | SHOW COLUMNS; field mapping, SELECT alias, INSERT/UPDATE |
| 404 ทุก endpoint | basePath, endpoint, student ID, route mount, API port |
| 400 POST/PUT | Postman Body > raw > JSON, Content-Type, ชื่อ/ชนิด/required ของ field |
| 409 Duplicate | UNIQUE เช่น sku; ใช้ค่าใหม่เมื่อทดสอบสร้าง |
| 500 | ดู Terminal; SQL error และ error middleware; เทียบ schema จริง |
| 204 แต่ Postman ไม่มี JSON | ถูกต้องสำหรับ No Content |

อ่านรายละเอียดเพิ่มเติมใน MIDTERM-TEMPLATE-FIRST.md, INT161-EXAM-HANDBOOK.md และ HTTP-STATUS-CODES.md ในโฟลเดอร์ docs เดียวกัน.
