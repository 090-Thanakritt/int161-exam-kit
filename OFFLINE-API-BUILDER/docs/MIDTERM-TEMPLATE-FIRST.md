# คู่มือยึด midterm-exam-esm-template เป็นฐาน: เปิด ZIP แล้วแก้ทีละไฟล์

> **เริ่มที่ไฟล์นี้เมื่อเข้าห้องสอบ**: `midterm-exam-esm-template` เป็นโครงที่ใช้สอบจริง แต่โจทย์และ SQL ยังไม่ทราบ. [คู่มือฉบับเต็มพร้อมโค้ดและ Postman](INT161-EXAM-HANDBOOK.md) ใช้โจทย์ฝึก Week 8 Mobile Distributor เป็นตัวอย่าง. [ตาราง HTTP status](HTTP-STATUS-CODES.md) เปิดเทียบระหว่างทำ. ค่าของโจทย์ฝึก เช่น `products`, `brands`, `mobile_distributor` และ URL นั้นต้องตรวจข้อสอบใหม่.

## แผนที่ก่อนเริ่ม

| ลำดับ | เปิดส่วน | ผลที่ต้องได้ |
|---|---|---|
| T0 | [อ่าน ZIP + โจทย์จริง](#t0) | จด schema, key, body, response, path |
| T1 | [ตั้ง npm และ import SQL ที่ได้รับจริง](#t1) | SELECT เจอ row จริง |
| T2 | [เทียบไฟล์ใน ZIP และเลือกว่าจะวางอะไร](#t2) | รู้ตำแหน่งแก้ทุกไฟล์ |
| T3 | [config, DTO, middleware](#t3) | ค่า DB และชื่อ field ตรงกัน |
| T4 | [repo, service, route, app](#t4) | CRUD ครบและ import ทำงาน |
| T5 | [รัน Postman, runner, ส่ง](#t5) | ผ่านทุก endpoint และตรวจ ZIP |
| ALT | [เลือกโครงเมื่อโจทย์เปลี่ยน](#alt) | เปลี่ยนทั้งกลุ่มไฟล์ที่เกี่ยวข้อง |

<a id="t0"></a>
## T0 — เปิดโครงและกรอกข้อมูลโจทย์ลงตาราง

1. แตก ZIP แล้วเปิด **โฟลเดอร์ชั้นใน `node-express-esm-template` ที่มี `package.json`** ด้วย WebStorm File → Open. เปิด Terminal จาก root นั้น; `Get-Location`, `Get-ChildItem package.json`, `Get-ChildItem src` ต้องชี้ตำแหน่งเดียวกัน. อย่าเปิดแค่ `src`.
2. เปิดใบงานโจทย์จริง: วง method, endpoint ทุกตัว, request body, status, response รวมถึงข้อความเรื่อง pagination, PUT partial/full และข้อผิดพลาด. เปิด SQL ที่แจกจริงเพื่อดู schema. **ZIP template ที่ตรวจไม่มี `database/init-database.sql`** จึงอย่าสั่ง import path นี้ก่อนเห็นไฟล์นั้นอยู่จริง.
3. ใน ZIP จริงชื่อโฟลเดอร์ `configs-$id`, `mappers-$id`, `middlewares-$id`, `repositories-$id`, `routes-$id`, `services-$id` มีตัวอักษร `$id` อยู่จริง. หากข้อสอบสั่ง rename ตามรหัส ให้ rename ทุกโฟลเดอร์และ import ที่เกี่ยวข้อง; หากไม่ได้สั่ง จะคง literal `$id` ก็ได้. PowerShell ระบุ path ดังกล่าวใน single quote เมื่อใช้คำสั่งแยก.
4. กรอกตารางนี้ลงกระดาษ/สำเนาคู่มือก่อนแก้ไฟล์:

| ช่องที่ต้องหา | หาในไหน | เปลี่ยนไฟล์ใด | ตัวอย่าง Week 8 เท่านั้น |
|---|---|---|---|
| ชื่อ schema | SQL `CREATE DATABASE`/`USE`, ข้อสอบ | db-config + SQL console | mobile_distributor |
| table หลัก/ตาราง JOIN | `CREATE TABLE`/`SHOW TABLES` | repository + mapper | products/brands |
| PK, type, AUTO_INCREMENT | `PRIMARY KEY` ใน SQL | WHERE, route param, service parse, create return | id BIGINT auto |
| UNIQUE, FK, null/default | SQL constraints | service validation, error, JOIN | sku, brand_id |
| URL/method | endpoint ในใบงาน | app mount + route path | /api/ID/products |
| body POST/PUT | request JSON ในใบงาน | service allowlist + Postman | brand_id |
| output field | response JSON ในใบงาน | SELECT aliases + mapper + helper | brandId |
| page/limit/error status | ข้อความโจทย์/runner | middleware/repo/count/helper/route | GET page 1, DELETE 204 |
| DB host/port/user/password | เครื่องสอบ/ผู้สอน | WebStorm Data Source + db-config | 127.0.0.1:3306 |
| HTTP port | ข้อสอบ/runner | app/server + Postman | localhost:3000 |

**แยกชื่อสามชนิด:** URL `/phones/:phoneId` เป็น route, SQL อาจใช้ `phone_id`, JSON อาจคืน `id`; ชื่อทั้งสามไม่จำเป็นต้องเหมือนกัน. ถ้า app mount `/api/123/products` แล้ว router มี `/:id`, URL คือ `/api/123/products/7`. อย่าเขียน `/products/:id` ซ้ำใน route. ถ้าเปลี่ยน `:id` เป็น `:phoneId`, ต้องเปลี่ยน `req.params.id` เป็น `req.params.phoneId` ด้วย.

<a id="t1"></a>
## T1 — npm, WebStorm/MySQL และ SQL

**T1.1** เปิด `package.json` ของ ZIP: มี `"type":"module"` และ `express`, `mysql2`, `http-status` อยู่แล้ว แต่ **ไม่มี start script**. อย่าทับ dependencies/lockfile โดยไม่อ่าน. เมื่อเลือก [โครงแยก server](#app-entry) ให้เพิ่ม `"start": "node src/server.js"` ใน object `scripts`; หากข้อสอบบังคับ `node src/app.js` ให้ใช้ [ENTRY-A](INT161-EXAM-HANDBOOK.md#entry-a) และ start ชี้ app. JSON ห้าม `//` และ trailing comma. ที่ root:

```powershell
node --version
npm.cmd --version
npm.cmd ls express mysql2 http-status
```

ถ้า packages ยังไม่ลงและยังอนุญาตออนไลน์: lockfile ตรงใช้ `npm.cmd ci`; lock ไม่ตรงหรือไม่มีให้ `npm.cmd install`. เตรียม WebStorm JDBC driver และ Postman Desktop ให้ใช้ offline ก่อนช่วงห้าม Internet. `npm.cmd` ช่วยเลี่ยงการบล็อก `npm.ps1` ใน PowerShell.

**T1.2 หา SQL ที่แจกจริง:** ใน Project panel หรือ File Explorer หาชื่อ `*.sql`; เปิดดู `DROP DATABASE`, `DROP TABLE`, `TRUNCATE`, `CREATE DATABASE`, `USE`, `INSERT` ก่อนรัน. สคริปต์บางอันลบฐานเดิมได้. Template ZIP นี้ไม่มี SQL; ชื่อไฟล์และที่อยู่ของ SQL ขึ้นกับโจทย์. อย่าเดา `database/init-database.sql`.

**T1.3 เลือกทางนำเข้า:** WebStorm Database → + → Data Source → MySQL → host `127.0.0.1`, port MySQL (มัก 3306), user/password → Test Connection; เปิดไฟล์ SQL จริง → Execute ใน console/connection ที่ถูก. ถ้า driver ยังขาดให้ติดตั้งขณะออนไลน์. หาก SQL ไม่มี `CREATE DATABASE`/`USE`, ให้สร้าง/เลือก schema **ตามชื่อในโจทย์** ก่อน. อีกทางที่แน่นอนบน Windows PowerShell คือเปิด MySQL interactive:

```powershell
mysql.exe -u root -p -h 127.0.0.1 -P 3306
```

ที่ prompt `mysql>` ใส่ `SOURCE C:/exam/database/init-database.sql;` **โดยแทน path ด้วยไฟล์ที่ตรวจว่ามีจริง**. ถ้า `mysql.exe` ไม่อยู่ PATH ให้ใช้ executable path ของเครื่อง เช่น `& 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe' -u root -p -h 127.0.0.1 -P 3306`. `mysql -u root -p < database/init-database.sql` ในใบงานเก่าใช้ไม่ได้ตรง ๆ ใน PowerShell; `SOURCE` ใน prompt หรือ WebStorm/Workbench ง่ายกว่า. ใช้ slash `/` ใน path SOURCE.

**T1.4 ตรวจผล** ตัวอย่างนี้ต้องแทนชื่อ schema/table ตาม SQL จริง:

```sql
SHOW DATABASES;
USE mobile_distributor;
SHOW TABLES;
SHOW CREATE TABLE products;
SHOW COLUMNS FROM products;
SELECT COUNT(*) AS total FROM products;
SELECT * FROM products LIMIT 3;
```

`Unknown database` → import ไม่ได้สร้าง schema หรือ `USE` ผิด; `Table doesn't exist` → เช็ก current schema; จำนวน 0 → SQL อาจมีแต่ DDL หรือ INSERT ไม่สำเร็จ; `Access denied` → user/password/host; `ECONNREFUSED` → MySQL server/port. **อย่าเพิ่งเขียน SQL ใน repository ก่อนรู้ชื่อคอลัมน์จาก `SHOW CREATE TABLE`.**

<a id="t2"></a>
## T2 — เทียบไฟล์ template จริงทีละตัว

| ไฟล์จริงใน ZIP | สิ่งที่พบ | การทำกับโครงฝึก | สิ่งที่ต้องแก้ตามข้อสอบ |
|---|---|---|---|
| `package.json` | ESM/dependencies ครบ ไม่มี start | เพิ่ม script อย่างเดียว | entrypoint/runner |
| `src/app.js` | listen3000, mount `/`, error handler ว่าง | แทนทั้งไฟล์ + เพิ่ม server | base path, resource, port |
| `src/configs-$id/db-config.js` | host/user/password/database placeholder | แทนทั้งไฟล์ | ห้าค่า connection |
| `src/mappers-$id/api-response.js` | array.totalItems แบบเดิม ไม่มี timestamp | แทนทั้งไฟล์ | envelope และ status |
| `src/mappers-$id/entity-dto-mapper.js` | field classicmodels `productCode, MSRP` | แทนทั้งไฟล์ | key JSON และ column/alias SQL |
| `src/middlewares-$id/pagination-middleware.js` | ขาด page/limit ตัวใด = ไม่แบ่งหน้า; offset ใช้ pageSize ก่อน cap | แทนถ้าโจทย์แบ่งหน้า | default/optional/max |
| `src/repositories-$id/repository.js` | placeholder `table-name`, `primaryKey`; create ใช้ `productLine` | แทนทั้งไฟล์ | table/PK/JOIN/count/insertId |
| `src/services-$id/service.js` | DTO ไม่มี view, ไม่มี validation | แทนทั้งไฟล์ | body/required/default/PK |
| `src/routes-$id/route.js` | response placeholder; PUT ไม่ส่ง id/data | แทนทั้งไฟล์ | URL/param/body/status |
| `src/test-service.js` | import `office-service.js` ไม่มี; เรียก DELETE ID26 | **ห้ามรันเดิม**; แทน read-only | ชื่อ service/PK |

กรณีฝึก Week 8 เพิ่ม `exam-config.js`, `error-handler.js`, `brand-repo.js`, `brand-service.js`, `brand-route.js`, `server.js`, `test-db.js`. ถ้าโจทย์ไม่มี identity หรือ brands ให้ตัด route/import/mount ตามนั้น. กลุ่มโค้ด [P3–P7 ในคู่มือหลัก](INT161-EXAM-HANDBOOK.md#p3) เข้าคู่กัน: **อย่าใช้ route ใหม่กับ api-response.js เดิม**, เพราะของเดิมอ่าน `data.totalItems`, ของใหม่รับ `total` เป็นอาร์กิวเมนต์แยก.

<a id="dto-trace"></a>
## DTO ให้เห็นตัวแปรจริง: `entity.id` ต้องเปลี่ยนเมื่อไร

`entity` ใน `toSummaryDTO(entity)` เป็น **ชื่อ parameter ที่คนเขียนเลือก**. หากเปลี่ยนเป็น `toSummaryDTO(row)`, ทุกด้านขวาต้องเป็น `row.xxx`. ส่วน `xxx` ต้องเป็น property ที่ repository `SELECT` คืนมา ไม่ใช่เดาจากชื่อ JSON.

```js
// repository.js: SQL ให้ property id, brand_id, brand_name
const [rows] = await db.query(
  'SELECT p.id, p.brand_id, b.name AS brand_name FROM products p JOIN brands b ON b.id=p.brand_id WHERE p.id=?',
  [7]
);
const row = rows[0]; // เช่น { id: 7, brand_id: 1, brand_name: 'Apple' }

// service.js ส่ง row เข้า mapper; ชื่อ local product ไม่ต้องตรงกับ parameter
const product = await repo.findOne(7);
const dto = mapper.toSummaryDTO(product);

// mapper.js จะตั้งชื่อ parameter เป็น row/product/entity ก็ได้ แต่ต้องใช้ชื่อเดียวกันข้างใน
static toSummaryDTO(row) {
  return { id: row.id, brandId: row.brand_id };
}
// JSON ที่ออก: { "id": 7, "brandId": 1 }
```

| โจทย์จริงต้องการ | SQL ใน repository | Mapper `toSummaryDTO(row)` | ต้องแก้เพิ่ม |
|---|---|---|---|
| `id`, DB column `id` | `p.id` | `id: row.id` | ไม่มี |
| `id`, DB PK `productCode` | `productCode` | `id: row.productCode` | WHERE/service key |
| `brandId`, DB `brand_id` | `p.brand_id` | `brandId: row.brand_id` | request body แยกต่างหาก |
| `brandId`, alias camel | `p.brand_id AS brandId` | `brandId: row.brandId` | SELECT และ mapper พร้อมกัน |
| `brandName` | `b.name AS brand_name` JOIN | `brandName: row.brand_name` | JOIN และ detail mapper |
| `price` เป็น JSON number | `p.price` DECIMAL | `price: Number(row.price)` | ตรวจ null/precision ตามโจทย์ |

**กฎแก้:** ซ้ายของ `:` คือชื่อ field ตาม response JSON, ขวาของ `:` คือ `ชื่อ parameter.property` จาก row ของ SQL. ถ้าเขียน `id: entity.id` แต่ SQL คืน `productCode`, ค่าเป็น `undefined` และ JSON อาจละ field ไป; ต้องเขียน `id: entity.productCode` **หรือ** alias `productCode AS id` ที่ SQL แล้วคง `entity.id`. ถ้า repo คืน `null`, service ต้องตอบ 404 ก่อน mapper; มิฉะนั้นจะ TypeError/500. ดู row ชั่วคราวด้วย `console.log(row)` ที่ service หลัง `repo.findOne`, ลบ log ก่อนส่ง.

<a id="t3"></a>
## T3 — สร้าง/แทนไฟล์ config, DB, middleware และ mapper

**โค้ดต่อไปนี้เป็นชุดที่ทำงานร่วมกันบน schema Week 8**. แต่ละบล็อกมีบรรทัด `// ไฟล์:`, `// ต้องแก้:`, `// ใช้เดิมได้:`; หลังวางให้เช็กตาราง T0. ถ้า SQL จริงไม่มี `products`/คอลัมน์ดังกล่าว ห้ามรันทั้งชุดโดยยังไม่แก้.

### T3.1 เพิ่ม `src/configs-$id/exam-config.js`

กำหนดรหัส/name/secret **ของตัวเองจากใบงาน**, base path, นโยบาย pagination/PUT/delete. ค่าตัวอย่างมี placeholder ที่ต้องเติม.

**ไฟล์:** `src/configs-$id/exam-config.js`  
**การวาง:** สร้างไฟล์ใหม่ในโฟลเดอร์ที่ระบุ; ถ้ายังไม่มีโฟลเดอร์ให้สร้างโฟลเดอร์ตามชื่อก่อน  
**ต้องตรวจ/แก้:** รหัส/ชื่อ/secret, base path, Express port, PUT/pagination/status  
**เมื่อแก้ไฟล์นี้ ให้ตรวจต่อ:** app.js, server.js, Postman URL, runner  
**ใช้เดิมได้:** import/export และลำดับชั้นของโค้ดเมื่อยังใช้ Express 5 + mysql2/promise แบบ ESM และข้อสอบไม่ได้กำหนดต่าง  

```js
// ไฟล์: src/configs-$id/exam-config.js
// วิธีใช้: สร้างไฟล์นี้ วางทั้งบล็อก; เป็นจุดเลือกนโยบายของโครงหลัก
// ต้องแก้: ข้อมูลผู้สอบ/base path/port ตามโจทย์; ห้ามใช้ secret ของคนตัวอย่าง
// ใช้เดิมได้: ชื่อ export เมื่อไฟล์อื่นยัง import ตามคู่มือนี้
export const STUDENT = {
  // [โจทย์เปลี่ยน] ต้องแก้รหัสผู้สอบจากใบงาน; BASE_PATH, app.js, URL Postman และคำสั่ง runner ต้องตรงกัน
  id: 'YOUR_STUDENT_ID', // [แก้ตัวนี้] แทน 'YOUR_STUDENT_ID' ด้วยรหัสตัวเอง; ชื่อ key id คงเดิม
  // [โจทย์เปลี่ยน] ต้องแก้ชื่อจริงหากโจทย์มี student-info; app.js อ่าน STUDENT.name
  name: 'YOUR_NAME', // [แก้ตัวนี้] แทน 'YOUR_NAME' ด้วยชื่อตามโจทย์; key name คงเดิม
  // [โจทย์เปลี่ยน] ต้องแก้ secret เฉพาะของตนตามโจทย์; app.js อ่าน STUDENT.secretKey
  secretKey: 'KEY_FROM_SPEC' // [แก้ตัวนี้] แทน 'KEY_FROM_SPEC' ด้วย Secret Key ของตัวเอง
};
// [โจทย์เปลี่ยน] หากโจทย์กำหนด Express port ใหม่ แก้เลขนี้และ baseUrl ใน Postman; DB port แยกอยู่ db-config.js
export const PORT = 3000; // [แก้ตัวนี้] แทนเลข 3000 เฉพาะเมื่อ HTTP port ในโจทย์ต่าง; Postman ใช้เลขเดียวกัน
// [โจทย์เปลี่ยน] หากข้อสอบกำหนด bind host ให้เปลี่ยนตรงนี้; ปกติเรียกจากเครื่องเดียวกันใช้ 127.0.0.1
export const HOST = '127.0.0.1'; // [แก้ตัวนี้] แทน '127.0.0.1' เฉพาะเมื่อโจทย์ระบุ bind host ใหม่
// [โจทย์เปลี่ยน] หาก endpoint ไม่ขึ้นต้น /api/<รหัส> ให้แก้รูปแบบนี้; app.js mount ทุก resource ด้วยค่านี้
export const BASE_PATH = `/api/${STUDENT.id}`; // [แก้ตัวนี้] แก้ส่วน '/api/' หรือ STUDENT.id เมื่อรูปแบบ base path ต่าง; app.js ใช้ค่านี้

// เลือกโครง: main = ตัวอย่างโทรศัพท์ Week 8; ทุกค่าด้านล่างเป็นนโยบายตัวอย่าง
export const POLICY = {
  // [โจทย์เปลี่ยน] PUT full -> 'full' และส่ง body ครบ; PUT partial -> 'partial'; service.js อ่านค่า
  updateMode: 'partial', // [แก้ตัวนี้] แทน 'partial' เป็น 'full' ถ้า PUT ต้องส่ง body ครบ
  // [โจทย์เปลี่ยน] GET ไม่ส่ง page/limit ต้องคืนทั้งหมด -> 'optional'; ต้องแบ่งหน้าเสมอ -> 'always'; middleware อ่านค่า
  pagination: 'always', // [แก้ตัวนี้] แทน 'always' เป็น 'optional' ถ้าไม่ส่ง page/limit แล้วต้องคืนทั้งหมด
  defaultPage: 1, // [แก้ตัวนี้] แทนเลข 1 ถ้าโจทย์กำหนดหน้าเริ่มต้นอื่น; offset ใน middleware ต้องสอดคล้อง
  // [โจทย์เปลี่ยน] ถ้า default limit เปลี่ยน แก้เลขและทดสอบ Postman/runner
  defaultLimit: 10, // [แก้ตัวนี้] แทนเลข 10 ถ้าโจทย์กำหนด limit เริ่มต้นอื่น
  maxLimit: 100, // [แก้ตัวนี้] แทนเลข 100 ถ้าโจทย์กำหนดเพดาน limit อื่น
  // [โจทย์เปลี่ยน] ถ้า GET list ต้องเป็น detail DTO ให้ใช้ 'full'; route.js ส่งค่านี้ไป mapper
  listView: 'summary', // [แก้ตัวนี้] แทน 'summary' เป็น 'full' เมื่อ GET list ต้องคืน detail DTO
  // [โจทย์เปลี่ยน] ถ้า GET by ID ต้องเป็น summary ให้ใช้ 'summary'; ตรวจ response ตัวอย่าง
  detailView: 'full', // [แก้ตัวนี้] แทน 'full' เป็น 'summary' เมื่อ GET by ID ต้องคืน summary DTO
  includeTimestamp: true, // [แก้ตัวนี้] แทน true เป็น false ถ้า response ไม่มี timestamp
  successStyle: 'boolean', // [แก้ตัวนี้] แทน 'boolean' เป็น 'status' เฉพาะ response รูปแบบ status:'success'
  // [โจทย์เปลี่ยน] โจทย์สั่ง 200 -> เปลี่ยน 200 และตรวจ JSON; 204 ต้องไม่มี response body
  deleteStatus: 204 // [แก้ตัวนี้] แทนเลข 204 เป็น 200 ถ้า DELETE ต้องส่ง JSON; route.js อ่านค่านี้
};
```

### T3.2 แทน `src/configs-$id/db-config.js`

แก้ห้าค่า host, **MySQL port**, user, password, database; WebStorm Data Source ต้องเชื่อม server/schema เดียวกัน. พอร์ต MySQL 3306 คนละพอร์ตกับ Express 3000.

**ไฟล์:** `src/configs-$id/db-config.js`  
**การวาง:** แทนเนื้อหาทั้งไฟล์เดิมใน ZIP; ถ้ายังไม่มีโฟลเดอร์ให้สร้างโฟลเดอร์ตามชื่อก่อน  
**ต้องตรวจ/แก้:** host, MySQL port, user, password, database จาก SQL จริง  
**เมื่อแก้ไฟล์นี้ ให้ตรวจต่อ:** WebStorm Data Source, test-db.js  
**ใช้เดิมได้:** import/export และลำดับชั้นของโค้ดเมื่อยังใช้ Express 5 + mysql2/promise แบบ ESM และข้อสอบไม่ได้กำหนดต่าง  

```js
// ไฟล์: src/configs-$id/db-config.js
// วิธีใช้: แทนทั้งไฟล์เดิม; ต้องมี mysql2 และ package.json type:module
// ต้องแก้: 5 ค่า host, port, user, password, database ให้ตรงกับ MySQL ของคุณ
// ใช้เดิมได้: createPool/export; dateStrings ช่วยรักษา DATE เป็น YYYY-MM-DD
import mysql from 'mysql2/promise';
const db = mysql.createPool({
  // [โจทย์เปลี่ยน] แทน host ของ MySQL ไม่ใส่ http://; ให้ตรงกับ WebStorm Data Source
  host: '127.0.0.1', // [แก้ตัวนี้] แทน '127.0.0.1' ด้วย host MySQL จริง; อย่าใส่ http://
  // [โจทย์เปลี่ยน] แทน port ของ MySQL เช่น 3306; ไม่ใช่ Express port ใน exam-config.js
  port: 3306, // [แก้ตัวนี้] แทนเลข 3306 ด้วย port MySQL จริง; ไม่ใช่เลข 3000 ของ Express
  // [โจทย์เปลี่ยน] แทน username ของ MySQL ที่ใช้ Test Connection ผ่าน
  user: 'root', // [แก้ตัวนี้] แทน 'root' ด้วย MySQL username จริง
  // [โจทย์เปลี่ยน] แทนรหัส MySQL ของเครื่อง; ถ้าไม่มีรหัสให้ใช้ '' และอย่า push รหัสจริงขึ้น GitHub
  password: 'CHANGE_ME', // [แก้ตัวนี้] แทน 'CHANGE_ME' ด้วยรหัส MySQL; ถ้าไม่มีรหัสใช้ ''
  // [โจทย์เปลี่ยน] แทนชื่อ schema จาก USE/CREATE DATABASE ของ SQL ที่แจกจริง; ZIP template ไม่มี SQL
  database: 'mobile_distributor', // [แก้ตัวนี้] แทน 'mobile_distributor' ด้วยชื่อหลัง USE/CREATE DATABASE ใน SQL จริง
  waitForConnections: true,
  connectionLimit: 5,
  dateStrings: ['DATE'] // DATE -> string; TIMESTAMP ยังแปลงตาม driver/session timezone
});
export default db;
```

### T3.3 เพิ่ม `src/middlewares-$id/error-handler.js`

ใช้เป็นรูปแบบ error กลาง; หากข้อสอบกำหนด error JSON ต่างไปแก้ handler พร้อม tests.

**ไฟล์:** `src/middlewares-$id/error-handler.js`  
**การวาง:** สร้างไฟล์ใหม่ในโฟลเดอร์ที่ระบุ; ถ้ายังไม่มีโฟลเดอร์ให้สร้างโฟลเดอร์ตามชื่อก่อน  
**ต้องตรวจ/แก้:** JSON error, HTTP mapping ตามโจทย์  
**เมื่อแก้ไฟล์นี้ ให้ตรวจต่อ:** app.js ต้อง mount หลังทุก route; api-response.js ใช้ envelope คู่กัน  
**ใช้เดิมได้:** import/export และลำดับชั้นของโค้ดเมื่อยังใช้ Express 5 + mysql2/promise แบบ ESM และข้อสอบไม่ได้กำหนดต่าง  

```js
// ไฟล์: src/middlewares-$id/error-handler.js
// วิธีใช้: สร้าง/แทนทั้งไฟล์ แล้ว mount errorHandler หลัง routes ใน app.js
// ต้องแก้ตามโจทย์: code/message/envelope; HTTP กับชื่อ business code คนละอย่าง
import { POLICY } from '../configs-$id/exam-config.js';
export class AppError extends Error {
  constructor(message, statusCode = 400, errorCode = 'VALIDATION_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  let statusCode = err instanceof AppError ? err.statusCode : 500;
  let code = err instanceof AppError ? err.errorCode : 'INTERNAL_SERVER_ERROR';
  let message = err instanceof AppError ? err.message : 'Internal server error';
  // [โจทย์เปลี่ยน] MySQL code เป็น error ฝั่ง DB; mapping HTTP 400/409 ต้องดู response ของโจทย์
  const mysqlErrors = {
    ER_DUP_ENTRY: [409, 'DUPLICATE_KEY', 'Resource already exists'],
    ER_NO_REFERENCED_ROW_2: [400, 'FOREIGN_KEY_NOT_FOUND', 'Referenced record does not exist'],
    ER_ROW_IS_REFERENCED_2: [409, 'RESOURCE_IN_USE', 'Resource is referenced by another record']
  };
  if (mysqlErrors[err.code]) [statusCode, code, message] = mysqlErrors[err.code];
  // [โจทย์เปลี่ยน] raw JSON พัง -> 400; เช็ก Content-Type application/json ใน Postman
  if (err.type === 'entity.parse.failed') {
    [statusCode, code, message] = [400, 'INVALID_JSON', 'Request body must be valid JSON'];
  }
  // ดูรายละเอียด error จริงใน Terminal; ไม่ส่ง SQL/stack/password ให้ client
  if (statusCode === 500) console.error(err.code || err.name, err.message);
  // [โจทย์เปลี่ยน] ถ้า error envelope ในโจทย์ไม่ใช่ {success:false,error:{code,message}} แก้ที่นี่และ api-response.js
  const body = POLICY.successStyle === 'status'
    ? { status: 'error', error: { code, message } }
    : { success: false, error: { code, message } };
  if (POLICY.includeTimestamp) body.timestamp = new Date().toISOString();
  return res.status(statusCode).json(body);
}
```

### T3.4 แทน `src/middlewares-$id/pagination-middleware.js`

ตัวอย่างนี้ default page1/limit10 และ cap100; โครงเดิมของ template ไม่แบ่งหน้าเมื่อไม่มี parameter ตัวหนึ่ง. ถ้าโจทย์สั่งแบบเดิม เลือก [PAGE-OPT](INT161-EXAM-HANDBOOK.md#page-opt). ตรวจ offset คำนวณจาก limit หลัง cap.

**ไฟล์:** `src/middlewares-$id/pagination-middleware.js`  
**การวาง:** แทนเนื้อหาทั้งไฟล์เดิมใน ZIP; ถ้ายังไม่มีโฟลเดอร์ให้สร้างโฟลเดอร์ตามชื่อก่อน  
**ต้องตรวจ/แก้:** default/max/optional, page และ limit  
**เมื่อแก้ไฟล์นี้ ให้ตรวจต่อ:** exam-config.js, repository.findAll/countAll, route.js, Postman  
**ใช้เดิมได้:** import/export และลำดับชั้นของโค้ดเมื่อยังใช้ Express 5 + mysql2/promise แบบ ESM และข้อสอบไม่ได้กำหนดต่าง  

```js
// ไฟล์: src/middlewares-$id/pagination-middleware.js
// วิธีใช้: แทนทั้งไฟล์; ใน route เรียก queryParser() เพราะ export เป็น factory
// ต้องแก้ตามโจทย์: default/max/optional ใน POLICY; ตัวอย่างนี้ reject ค่าผิดด้วย 400
import { POLICY } from '../configs-$id/exam-config.js';
import { AppError } from './error-handler.js';
// [โจทย์เปลี่ยน] ถ้าโจทย์ยอมรับ page=0/ค่าผิดแล้วใช้ default ต้องแก้ validation ที่นี่
function positiveInteger(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new AppError('page and limit must be positive integers');
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) {
    throw new AppError('page and limit must be positive integers');
  }
  return number;
}
export const queryParser = () => (req, res, next) => {
  const { page, limit } = req.query;
  // [โจทย์เปลี่ยน] ถ้าขาดเพียง page หรือ limit แล้วต้องคืนทั้งหมด ใช้ PAGE-OPT ในคู่มือแทนเงื่อนไขนี้
  if (POLICY.pagination === 'optional' && page === undefined && limit === undefined) {
    req.pagination = null;
    return next();
  }
  // [โจทย์เปลี่ยน] defaultPage มาจาก exam-config.js; ถ้าโจทย์เริ่มหน้า 0 ต้องแก้สูตร offset ด้วย
  const normalizedPage = positiveInteger(page, POLICY.defaultPage);
  // [โจทย์เปลี่ยน] defaultLimit/maxLimit อยู่ exam-config.js; ตรวจค่าที่คาดใน Postman
  const normalizedLimit = Math.min(positiveInteger(limit, POLICY.defaultLimit), POLICY.maxLimit);
  // [โจทย์เปลี่ยน] offset ใช้ limit หลัง cap: (page-1)*limit; repo.findAll ส่ง LIMIT/OFFSET ต่อ
  const offset = (normalizedPage - 1) * normalizedLimit; // ใช้ limit หลัง cap
  if (!Number.isSafeInteger(offset)) throw new AppError('Requested page is too large');
  req.pagination = { page: normalizedPage, limit: normalizedLimit, offset };
  next();
};
```

### T3.5 แทน `src/mappers-$id/api-response.js`

ของใหม่รับ `apiResponse(res, data, pagination, status, total)`. ถ้า pagination total=0 ก็ต้องแสดง total0; response envelope/timestamp ต้องตรงโจทย์ ไม่ hardcode เวลา. 204 ไม่ใช้ helper นี้.

**ไฟล์:** `src/mappers-$id/api-response.js`  
**การวาง:** แทนเนื้อหาทั้งไฟล์เดิมใน ZIP; ถ้ายังไม่มีโฟลเดอร์ให้สร้างโฟลเดอร์ตามชื่อก่อน  
**ต้องตรวจ/แก้:** response keys, timestamp, pagination keys, status  
**เมื่อแก้ไฟล์นี้ ให้ตรวจต่อ:** route.js ต้องส่ง total; error-handler.js ใช้รูปแบบคู่กัน  
**ใช้เดิมได้:** import/export และลำดับชั้นของโค้ดเมื่อยังใช้ Express 5 + mysql2/promise แบบ ESM และข้อสอบไม่ได้กำหนดต่าง  

```js
// ไฟล์: src/mappers-$id/api-response.js
// วิธีใช้: แทนทั้งไฟล์; signature ต่างจาก helper เดิม ต้องใช้ route ชุดนี้คู่กัน
// signature: apiResponse(res, data, pagination=null, status=200, total=undefined)
// ต้องแก้ตามโจทย์: ชื่อ envelope/metadata; total ต้องมาจาก COUNT ไม่ใช่ data.length
import { POLICY } from '../configs-$id/exam-config.js';
// [โจทย์เปลี่ยน] route.js ต้องเรียก helper ลำดับ (res,data,pagination,status,total) ให้ตรง; helper เดิมของ ZIP ใช้ signature ต่างกัน
export function apiResponse(res, data, pagination = null, status = 200, total) {
  // [โจทย์เปลี่ยน] ถ้า response JSON ใช้ชื่อ key อื่นให้แก้สอง branch นี้ และ error-handler.js พร้อมกัน
  const body = POLICY.successStyle === 'status'
    ? { status: 'success', data }
    : { success: true, data };
  // [โจทย์เปลี่ยน] route.js ต้องส่ง total จาก COUNT ทั้งตาราง/filtered set; data.length เป็นจำนวนเฉพาะหน้านี้
  if (pagination) {
    const { page, limit } = pagination;
    // [โจทย์เปลี่ยน] ถ้า metadata ชื่อ totalPages/hasNextPage ต่าง ให้เปลี่ยนที่นี่และ Postman expected
    body.pagination = {
      total: Number(total), page, limit,
      totalPages: Math.ceil(Number(total) / limit),
      hasNextPage: page * limit < Number(total),
      hasPrevPage: page > 1
    };
  }
  // [โจทย์เปลี่ยน] ถ้าโจทย์ไม่มี timestamp ตั้ง false ใน exam-config.js; อย่า hardcode วันสอบ
  if (POLICY.includeTimestamp) body.timestamp = new Date().toISOString();
  return res.status(status).json(body); // [แก้ตัวนี้] status เป็น argument ที่ route ส่ง เช่น 200/201; 204 ให้ route .end()
}
```

### T3.6 แทน `src/mappers-$id/entity-dto-mapper.js`

แก้ property ฝั่งขวาตาม SQL SELECT/alias ของจริงทุกตัว. ตัวอย่าง `entity.id` ใช้ได้ **เฉพาะ row มี id**. ชื่อฝั่งซ้ายต้องตรง JSON specification; ดู [DTO trace](#dto-trace).

**ไฟล์:** `src/mappers-$id/entity-dto-mapper.js`  
**การวาง:** แทนเนื้อหาทั้งไฟล์เดิมใน ZIP; ถ้ายังไม่มีโฟลเดอร์ให้สร้างโฟลเดอร์ตามชื่อก่อน  
**ต้องตรวจ/แก้:** ด้านซ้าย JSON field; ด้านขวา row property จาก SELECT/alias  
**เมื่อแก้ไฟล์นี้ ให้ตรวจต่อ:** repository.js SELECT/JOIN; service.js เลือก summary/detail  
**ใช้เดิมได้:** import/export และลำดับชั้นของโค้ดเมื่อยังใช้ Express 5 + mysql2/promise แบบ ESM และข้อสอบไม่ได้กำหนดต่าง  

```js
// ไฟล์: src/mappers-$id/entity-dto-mapper.js
// วิธีใช้: แทนทั้งไฟล์; ชื่อไฟล์อิง midterm template แต่ฟิลด์เป็น Week8 mobile
// ต้องแก้: ซ้ายคือชื่อ response; ขวาคือชื่อ column/alias ที่ Repository SELECT มา
// ใช้เดิมได้: map/maps เมื่อยังต้องเลือก summary/full
import { AppError } from '../middlewares-$id/error-handler.js';
export default class EntityDtoMapper {
  // [โจทย์เปลี่ยน] entity คือชื่อตัวแปร parameter ที่ service ส่ง row มา; ถ้าเปลี่ยนเป็น row ต้องเปลี่ยน entity. ทุกจุด
  static toSummaryDTO(entity) {
    return {
      // [โจทย์เปลี่ยน] ซ้าย id คือ JSON; ขวา entity.id ใช้ได้เมื่อ SELECT คืน id. ถ้า DB เป็น productCode ใช้ entity.productCode หรือ alias AS id
      id: entity.id, // [แก้ตัวนี้] ซ้าย id=JSON key; ขวา entity.id=SQL row.id; ถ้า DB productCode ใช้ entity.productCode
      // [โจทย์เปลี่ยน] ถ้า SQL คืน product_sku ให้ใช้ entity.product_sku หรือ SELECT AS sku; ดู repository.js
      sku: entity.sku, // [แก้ตัวนี้] ซ้าย sku=JSON key; ขวา entity.sku=SQL SELECT sku/alias
      // [โจทย์เปลี่ยน] ถ้า response key เป็น productName เปลี่ยนด้านซ้าย; ถ้า DB column เป็น productName เปลี่ยนด้านขวา
      name: entity.name, // [แก้ตัวนี้] ซ้าย name=JSON key; ขวา entity.name=SQL SELECT name/alias
      // [โจทย์เปลี่ยน] JSON brandId <- SQL brand_id; ถ้า SELECT AS brandId ใช้ entity.brandId; หากไม่มี brand ให้ลบตามโจทย์
      brandId: entity.brand_id, // [แก้ตัวนี้] ซ้าย brandId=JSON key; ขวา entity.brand_id=SQL p.brand_id; alias AS brandId ใช้ entity.brandId
      // [โจทย์เปลี่ยน] เพิ่ม/ลบ summary field ตาม response ในข้อสอบ; ต้องมี property ใน SELECT ด้วย
      category: entity.category, // [แก้ตัวนี้] ซ้าย category=JSON key; ขวา entity.category=SQL SELECT category
      // [โจทย์เปลี่ยน] mysql2 DECIMAL อาจคืน string; Number ใช้เมื่อ response ต้องการ JSON number
      price: Number(entity.price), // [แก้ตัวนี้] ซ้าย price=JSON key; ขวา entity.price=SQL DECIMAL; Number แปลงเป็น JSON number
      // [โจทย์เปลี่ยน] หากตารางไม่มี status ให้ลบหรือ SELECT alias ตามข้อสอบ
      status: entity.status // [แก้ตัวนี้] ซ้าย status=JSON key; ขวา entity.status=SQL SELECT status
    };
  }
  // [โจทย์เปลี่ยน] detail ได้ row เดียวกันจาก repo.findOne; เพิ่ม field เฉพาะที่ตัวอย่าง response กำหนด
  static toDetailDTO(entity) {
    return {
      ...this.toSummaryDTO(entity), // summary allowlist เท่านั้น ไม่ spread DB ทั้งแถว
      // [โจทย์เปลี่ยน] ต้องมี JOIN b.name AS brand_name ใน repository.js; ถ้าไม่มี JOIN ลบ field นี้
      brandName: entity.brand_name, // [แก้ตัวนี้] ซ้าย brandName=JSON key; ขวา entity.brand_name=SQL b.name AS brand_name
      // [โจทย์เปลี่ยน] JSON ramGb <- SQL ram_gb; เปลี่ยนด้านขวาถ้า alias ต่าง
      ramGb: entity.ram_gb, // [แก้ตัวนี้] ซ้าย ramGb=JSON key; ขวา entity.ram_gb=SQL ram_gb
      // [โจทย์เปลี่ยน] JSON storageGb <- SQL storage_gb; ตรวจ SHOW COLUMNS
      storageGb: entity.storage_gb, // [แก้ตัวนี้] ซ้าย storageGb=JSON key; ขวา entity.storage_gb=SQL storage_gb
      color: entity.color, // [แก้ตัวนี้] ซ้าย color=JSON key; ขวา entity.color=SQL SELECT color
      // [โจทย์เปลี่ยน] JSON stockQuantity <- SQL stock_quantity; ห้ามเดาจาก request body
      stockQuantity: entity.stock_quantity, // [แก้ตัวนี้] ซ้าย stockQuantity=JSON key; ขวา entity.stock_quantity=SQL stock_quantity
      // [โจทย์เปลี่ยน] วันที่ DB DATE ให้เทียบรูปแบบใน response; ถ้าโจทย์ไม่ขอให้ลบ
      releaseDate: entity.release_date == null ? null : String(entity.release_date) // [แก้ตัวนี้] ซ้าย releaseDate=JSON key; ขวา entity.release_date=SQL DATE
    };
  }
  // [โจทย์เปลี่ยน] service.js ต้องตรวจ null แล้วตอบ 404 ก่อนเรียก mapper มิฉะนั้น entity.id จะ error 500
  static map(entity, viewType = 'full') {
    if (viewType === 'summary') return this.toSummaryDTO(entity);
    if (viewType === 'full') return this.toDetailDTO(entity);
    throw new AppError('view must be summary or full', 400, 'INVALID_QUERY');
  }
  // [โจทย์เปลี่ยน] entities คือ array จาก repo.findAll; entity ใน callback คือแต่ละ row ไม่ใช่ชื่อ table
  static maps(entities, viewType = 'summary') {
    if (!['summary','full'].includes(viewType)) throw new AppError('view must be summary or full',400,'INVALID_QUERY');
    return entities.map(entity => this.map(entity, viewType));
  }
}
```

**ผ่าน T3:** `node --check` ผ่านไฟล์; ตรวจ `SHOW COLUMNS` กับชื่อ column SQL ใน repo; ไม่มี import ชี้โฟลเดอร์ผิด. Error `ERR_MODULE_NOT_FOUND` → เช็กชื่อ `-$id` และ path import; `Unknown database` → กลับ T1; field หาย → ตรวจ alias แล้ว mapper.

<a id="t4"></a>
## T4 — Repository → Service → Route → App

### T4.1 แทน `src/repositories-$id/repository.js`

SQL นี้เขียนตาม products/brands ใน Week 8. ถ้า schema ต่างให้แก้ `FROM`, `JOIN`, `SELECT`, `WHERE`, `INSERT`, `UPDATE`, `DELETE`, `COUNT` โดยอิง `SHOW CREATE TABLE`. `?` bind ค่าเท่านั้น ไม่ bind ชื่อตาราง. PK auto ใช้ insertId; PK string ใช้ [KEY-S](INT161-EXAM-HANDBOOK.md#key-s).

**ไฟล์:** `src/repositories-$id/repository.js`  
**การวาง:** แทนเนื้อหาทั้งไฟล์เดิมใน ZIP; ถ้ายังไม่มีโฟลเดอร์ให้สร้างโฟลเดอร์ตามชื่อก่อน  
**ต้องตรวจ/แก้:** table, PK, SELECT aliases, JOIN, unique key, COUNT/CRUD  
**เมื่อแก้ไฟล์นี้ ให้ตรวจต่อ:** service.js parseId/lookup/input; mapper.js property; Postman ID  
**ใช้เดิมได้:** import/export และลำดับชั้นของโค้ดเมื่อยังใช้ Express 5 + mysql2/promise แบบ ESM และข้อสอบไม่ได้กำหนดต่าง  

```js
// ไฟล์: src/repositories-$id/repository.js
// วิธีใช้: แทนทั้งไฟล์; resource หลัก = products, PK=id auto increment
// ต้องแก้ตาม schema: table, columns, PK, FK และ JOIN; bind ค่าผ่าน ?
// ห้ามรับชื่อ table/column จาก request มาต่อ SQL โดยตรง
import db from '../configs-$id/db-config.js';
// SQL ต่อจาก 3 string ด้านล่าง; comment อยู่ภายนอก string จึงไม่กลายเป็นส่วนหนึ่งของ SQL
const SELECT_PRODUCT = [
  'SELECT p.id,p.sku,p.name,p.brand_id,b.name AS brand_name,', // [แก้ตัวนี้] p.id/p.sku/... = columns จริง; b.name AS brand_name ต้องตรง entity.brand_name ใน mapper
  'p.category,p.price,p.ram_gb,p.storage_gb,p.color,p.stock_quantity,p.status,p.release_date', // [แก้ตัวนี้] ชื่อ p.<column> ทุกตัวต้องมีจริงใน SHOW COLUMNS
  'FROM products p JOIN brands b ON p.brand_id=b.id' // [แก้ตัวนี้] products/brands = table จริง; p.brand_id=b.id = FK/PK จริง; ไม่มี JOIN ใช้ NO-JOIN
].join(' ');
// [โจทย์เปลี่ยน] ต้องคง ORDER BY ที่แน่นอนสำหรับ pagination; ถ้ามี filter ให้ COUNT ใช้ WHERE เดียวกัน
export async function findAll(pagination) {
  // [โจทย์เปลี่ยน] ถ้าโจทย์ให้ GET all ไม่ paginate เลือก READ-ALL; route/service/helper ต้องไม่ส่ง metadata
  if (!pagination) {
    const [rows] = await db.query(SELECT_PRODUCT + ' ORDER BY p.id'); // [แก้ตัวนี้] แทน p.id ด้วย alias.PK จริง; SELECT_PRODUCT ด้านบนต้องเลือก PK ด้วย
    return rows;
  }
  // [โจทย์เปลี่ยน] เปลี่ยน p.id หาก PK อื่น; LIMIT/OFFSET ใช้ค่า bind ไม่ต่อค่าจาก req.query ลง SQL
  const [rows] = await db.query(SELECT_PRODUCT + ' ORDER BY p.id LIMIT ? OFFSET ?', // [แก้ตัวนี้] แทน p.id ด้วย PK จริง; LIMIT/OFFSET ใช้ pagination.limit/offset
    [pagination.limit, pagination.offset]);
  return rows;
}
export async function countAll() {
  // [โจทย์เปลี่ยน] เปลี่ยน products และ WHERE ให้ตรง list; total ต้องเป็นทั้งชุด ไม่ใช่จำนวนของหน้านี้
  const [[row]] = await db.query('SELECT COUNT(*) AS total FROM products'); // [แก้ตัวนี้] แทน products ด้วย table จริง; alias total ต้องตรง row.total
  return Number(row.total);
}
export async function findOne(id) {
  // [โจทย์เปลี่ยน] PK ไม่ใช่ id -> แก้ p.id; key string -> service.parseId/route ต้องเปลี่ยนด้วย
  const [rows] = await db.query(SELECT_PRODUCT + ' WHERE p.id=?', [id]); // [แก้ตัวนี้] แทน p.id ด้วย PK จริง; [id] ส่งค่าจาก route/service
  return rows[0] || null;
}
export async function findBySku(sku) {
  // [โจทย์เปลี่ยน] ถ้า unique field ไม่ใช่ sku ให้แก้ query และ service.findBySku/validation/409
  const [rows] = await db.query('SELECT id FROM products WHERE sku=?', [sku]); // [แก้ตัวนี้] แทน id/table/sku ด้วย PK/table/unique column จริง; service lookup ต้องเปลี่ยน
  return rows[0] || null;
}
export async function create(data) {
  // data ต้องผ่าน allowlist/validation ใน Service ก่อน
  // SET ? แบบ object ใช้กับ mysql2.query; อย่าเปลี่ยนเป็น execute โดยคง SQL เดิม
  // [โจทย์เปลี่ยน] ต้องแก้ table; data ต้องเป็น allowlist ที่ service ตรวจแล้ว; db.query รองรับ SET ? object
  const [result] = await db.query('INSERT INTO products SET ?', [data]); // [แก้ตัวนี้] แทน products ด้วย table จริง; [data] ต้องผ่าน service allowlist
  // [โจทย์เปลี่ยน] ใช้เฉพาะ PK AUTO_INCREMENT; ถ้า PK เป็น string ให้กลับไป findOne(data.<ชื่อ key>) ตาม KEY-S
  return result.insertId; // [แก้ตัวนี้] result.insertId ใช้กับ AUTO_INCREMENT เท่านั้น; string PK ดู KEY-S
}
export async function update(id, data) {
  // [โจทย์เปลี่ยน] แก้ table/PK WHERE ให้ตรง; PUT partial ต้องส่งเฉพาะ key ที่ client ส่ง
  const [result] = await db.query('UPDATE products SET ? WHERE id=?', [data, id]); // [แก้ตัวนี้] แทน products และ WHERE id ด้วย table/PK จริง; [data,id] ลำดับค่าคงตรง SQL
  return result; // changedRows=0 ไม่ได้แปลว่าไม่พบเสมอไป
}
export async function remove(id) {
  // [โจทย์เปลี่ยน] แก้ table/PK WHERE ให้ตรง; FK อาจห้ามลบและ error-handler.js ต้องตอบตามโจทย์
  const [result] = await db.query('DELETE FROM products WHERE id=?', [id]); // [แก้ตัวนี้] แทน products และ WHERE id ด้วย table/PK จริง; [id] คือ route param
  return result.affectedRows;
}
```

### T4.2 แทน `src/services-$id/service.js`

`INPUT_FIELDS` คือ body keys ที่รับ, `REQUIRED` คือ field บังคับ POST; ปรับชนิด/length/null/default ให้ตรง SQL/โจทย์. `parseId` นี้สำหรับเลขบวก; string/composite PK ใช้โครงอื่น. PUT ตัวอย่าง Week 8 ส่งบาง field จึงเป็น partial; หากโจทย์ต้องการ full ใช้ [PUT-FULL](INT161-EXAM-HANDBOOK.md#put-full).

**ไฟล์:** `src/services-$id/service.js`  
**การวาง:** แทนเนื้อหาทั้งไฟล์เดิมใน ZIP; ถ้ายังไม่มีโฟลเดอร์ให้สร้างโฟลเดอร์ตามชื่อก่อน  
**ต้องตรวจ/แก้:** body keys, required/default/validation, ชนิด PK, PUT partial/full  
**เมื่อแก้ไฟล์นี้ ให้ตรวจต่อ:** route.js req.body/params; repository.js SQL; Postman raw JSON  
**ใช้เดิมได้:** import/export และลำดับชั้นของโค้ดเมื่อยังใช้ Express 5 + mysql2/promise แบบ ESM และข้อสอบไม่ได้กำหนดต่าง  

```js
// ไฟล์: src/services-$id/service.js
// วิธีใช้: แทนทั้งไฟล์; ใช้ Repository/Mapper/POLICY จากชุดหลักร่วมกัน
// ต้องแก้ตามโจทย์: INPUT_FIELDS, validation, default, key และ error code
import * as repo from '../repositories-$id/repository.js';
import mapper from '../mappers-$id/entity-dto-mapper.js';
import { AppError } from '../middlewares-$id/error-handler.js';
import { POLICY } from '../configs-$id/exam-config.js';
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
// ถ้าชื่อ JSON body ไม่ตรง DB ให้แปลงก่อนสร้าง data (BODY-CAMEL) ไม่เปลี่ยน SQL อย่างเดียว
const INPUT_FIELDS = [
  'sku', // [แก้ตัวนี้] เปลี่ยน 'sku' เมื่อ body/DB ใช้ชื่ออื่น; repo.findBySku ต้องเปลี่ยนตาม
  'name', // [แก้ตัวนี้] เปลี่ยน 'name' เมื่อชื่อ field รับเข้าต่าง
  'brand_id', // [แก้ตัวนี้] FK ใน body/DB; ถ้าโจทย์ใช้ brandId ให้ดู BODY-CAMEL
  'category', // [แก้ตัวนี้] เอาออกถ้าโจทย์ไม่มี category
  'price', // [แก้ตัวนี้] ชื่อ field ราคา; validation key==='price' ด้านล่างต้องเปลี่ยนตาม
  'ram_gb', 'storage_gb', // [แก้ตัวนี้] สองชื่อจาก DB; เอาออก/เปลี่ยนตาม SHOW COLUMNS
  'color', // [แก้ตัวนี้] เอาออกถ้าไม่มีใน POST/PUT
  'stock_quantity', // [แก้ตัวนี้] เปลี่ยนทั้ง default 0 ด้านล่างและ mapper
  'status', // [แก้ตัวนี้] เปลี่ยน default 'AVAILABLE' ด้านล่างตามโจทย์
  'release_date' // [แก้ตัวนี้] เปลี่ยน validation วันที่และ default null ด้านล่างตามโจทย์
];
// เฉพาะฟิลด์ที่ POST บังคับ; ถ้า schema มี NOT NULL แต่ SQL กำหนด DEFAULT ให้ดูโจทย์ว่าบังคับส่งไหม
const REQUIRED = [
  'sku', 'name', 'brand_id', 'category', 'price', 'ram_gb', 'storage_gb', 'color'
  // [แก้ตัวนี้] รายชื่อข้างบนต้องตรง POST required ในโจทย์; optional stock_quantity/status/release_date อยู่ใน INPUT_FIELDS เท่านั้น
];
function invalid(message) { throw new AppError(message, 400, 'VALIDATION_ERROR'); }
// [โจทย์เปลี่ยน] ใช้เฉพาะ numeric PK; ถ้า productCode/officeCode เป็น string ให้ใช้ KEY-S และแก้ route/repo
export function parseId(value) {
  // ใช้กับเลข ID บวก; string PK ต้องเปลี่ยนเป็นโครง KEY-S ในคู่มือ
  if (typeof value !== 'string' || !/^\d+$/.test(value) ||
      !Number.isSafeInteger(Number(value)) || Number(value) < 1) {
    throw new AppError('id must be a positive integer', 400, 'INVALID_ID');
  }
  return Number(value);
}
function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      value < '1000-01-01' || value > '9999-12-31') return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
}
export function prepareInput(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) invalid('JSON body must be an object');
  const unknown = Object.keys(body).filter(key => !INPUT_FIELDS.includes(key));
  // ตัวอย่างนี้ reject unknown fields; ถ้าโจทย์สั่ง ignore ให้ดูตัวเลือก BODY-ALLOW
  if (unknown.length) invalid('Unknown fields: ' + unknown.join(', '));
  if (!partial) {
    for (const key of REQUIRED) if (!own(body, key)) invalid('Missing field: ' + key);
  }
  const data = {};
  // [โจทย์เปลี่ยน] แก้ max length ตาม VARCHAR จริง; field/ชนิดใหม่ให้เพิ่ม validation ใน loop
  const textFields = { sku:50, name:150, category:50, color:50, status:30 }; // [แก้ตัวนี้] แก้เลข 50/150 ตาม VARCHAR ของ field นั้นใน SQL
  for (const key of INPUT_FIELDS) {
    if (!own(body, key)) continue; // ไม่ส่ง = ไม่แก้ ใน partial mode
    let value = body[key];
    if (own(textFields, key)) {
      if (typeof value !== 'string' || !value.trim() || value.trim().length > textFields[key]) {
        invalid(key + ' must be non-empty text (max ' + textFields[key] + ')');
      }
      value = value.trim();
    // [โจทย์เปลี่ยน] ถ้า DECIMAL precision/scale หรือราคาติดลบ policy ต่าง ให้แก้ช่วงและทศนิยมตาม SQL/โจทย์
    } else if (key === 'price') {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 ||
          value > 99999999.99 || Math.abs(value * 100 - Math.round(value * 100)) > 0.000001) {
        invalid('price must be a number >= 0 with at most 2 decimal places');
      }
    } else if (key === 'release_date') {
      if (value !== null && !validDate(value)) invalid('release_date must be YYYY-MM-DD or null');
    } else {
      const min = key === 'brand_id' ? 1 : 0; // [แก้ตัวนี้] เปลี่ยน 'brand_id' เป็นชื่อ FK จริง; min=1 เมื่อ ID ต้องเป็นบวก
      if (!Number.isSafeInteger(value) || value < min || value > 2147483647) {
        invalid(key + ' must be an integer >= ' + min);
      }
    }
    data[key] = value;
  }
  if (partial && Object.keys(data).length === 0) invalid('Send at least one writable field');
  if (!partial) {
    // defaults ของ schema Week8; full mode ก็ reset optional fields ตามนี้เมื่อไม่ได้ส่ง
    // [โจทย์เปลี่ยน] default 0 เป็นของ Week8; ถ้าโจทย์บังคับส่งหรือ DB default อื่นให้แก้
    if (!own(data,'stock_quantity')) data.stock_quantity = 0; // [แก้ตัวนี้] เปลี่ยน 'stock_quantity' และเลข 0 ตาม DEFAULT ของ SQL จริง
    // [โจทย์เปลี่ยน] ค่า AVAILABLE เป็นของ Week8; ถ้าโจทย์มี ENUM/default อื่นให้แก้
    if (!own(data,'status')) data.status = 'AVAILABLE'; // [แก้ตัวนี้] เปลี่ยน 'status' และ 'AVAILABLE' ตาม default/enum จริง
    if (!own(data,'release_date')) data.release_date = null; // [แก้ตัวนี้] เปลี่ยน 'release_date' หรือ null ตาม nullable/default จริง
  }
  return data;
}
// [โจทย์เปลี่ยน] ถ้า resource อื่นเปลี่ยนข้อความ/code 404 ตาม response spec; repo.findOne คืน null
async function existing(id) {
  const row = await repo.findOne(id);
  if (!row) throw new AppError('Product with ID ' + id + ' was not found', 404, 'PRODUCT_NOT_FOUND');
  return row;
}
// [โจทย์เปลี่ยน] repo.findAll -> mapper.maps -> countAll ต้องเข้าชุดกับ api-response.js และ route.js
export async function getAllObjects(pagination, viewType = POLICY.listView) {
  const rows = await repo.findAll(pagination);
  return { items: mapper.maps(rows, viewType), total: pagination ? await repo.countAll() : undefined };
}
// [โจทย์เปลี่ยน] detail DTO จะถูกเลือกจาก viewType; ถ้า SQL ไม่มี alias ให้แก้ mapper
export async function getObject(id, viewType = POLICY.detailView) {
  return mapper.map(await existing(id), viewType);
}
// [โจทย์เปลี่ยน] unique SKU เป็นของ Week8; ถ้า unique key อื่นเปลี่ยน repo lookup และ error 409
export async function createObject(body) {
  const data = prepareInput(body);
  if (await repo.findBySku(data.sku)) throw new AppError('SKU already exists',409,'DUPLICATE_KEY'); // [แก้ตัวนี้] เปลี่ยน findBySku(data.sku) เมื่อ unique key ไม่ใช่ sku; repo.js ต้องมี lookup คู่กัน
  const id = await repo.create(data);
  return getObject(id, 'full'); // SELECT กลับเพื่อเอา id/default/JOIN จริง
}
// [โจทย์เปลี่ยน] service ตรวจ id มีจริงก่อน; POLICY.updateMode กำหนด partial/full; route ต้องส่งทั้ง id และ req.body
export async function updateObject(id, body) {
  await existing(id); // โครงนี้ตรวจ not found ก่อน body; เปลี่ยนลำดับถ้าโจทย์สั่งต่าง
  const data = prepareInput(body, POLICY.updateMode === 'partial');
  if (own(data,'sku')) {
    const other = await repo.findBySku(data.sku); // [แก้ตัวนี้] เปลี่ยน data.sku/lookup เช่นเดียวกับ POST เมื่อ unique field ต่าง
    if (other && String(other.id) !== String(id)) throw new AppError('SKU already exists',409,'DUPLICATE_KEY');
  }
  await repo.update(id, data);
  return getObject(id, 'full');
}
// [โจทย์เปลี่ยน] DELETE ต้องตรวจ 404; route.js ตัดสิน 204/200 และ response body
export async function removeObject(id) {
  await existing(id);
  if (!await repo.remove(id)) throw new AppError('Product not found',404,'PRODUCT_NOT_FOUND');
}
```

### T4.3 แทน `src/routes-$id/route.js`

สังเกต `PUT` ต้องเรียก `service.updateObject(parseId(req.params.id), req.body)`, เดิมใน ZIP ลืมอาร์กิวเมนต์. `router.get('/')` ต่อท้าย mount ของ app; เปลี่ยนชื่อ param ทั้ง `:id` และ `req.params.id` พร้อมกัน.

**ไฟล์:** `src/routes-$id/route.js`  
**การวาง:** แทนเนื้อหาทั้งไฟล์เดิมใน ZIP; ถ้ายังไม่มีโฟลเดอร์ให้สร้างโฟลเดอร์ตามชื่อก่อน  
**ต้องตรวจ/แก้:** method/path/param, pagination, status, response  
**เมื่อแก้ไฟล์นี้ ให้ตรวจต่อ:** app.js mount; service.js signatures; Postman URL  
**ใช้เดิมได้:** import/export และลำดับชั้นของโค้ดเมื่อยังใช้ Express 5 + mysql2/promise แบบ ESM และข้อสอบไม่ได้กำหนดต่าง  

```js
// ไฟล์: src/routes-$id/route.js
// วิธีใช้: แทนทั้งไฟล์เดิม; app mount ที่ /api/ID/products แล้ว จึงใช้ / ในไฟล์นี้
// ต้องแก้ตามโจทย์: params/body/status/response และเลือก view/pagination
// ใช้เดิมได้: async route ใน Express5; ถ้า Express4 ใช้ wrapper ในตัวเลือก EX4
import express from 'express';
import * as service from '../services-$id/service.js';
import { queryParser } from '../middlewares-$id/pagination-middleware.js';
import { apiResponse } from '../mappers-$id/api-response.js';
import { POLICY } from '../configs-$id/exam-config.js';
// [โจทย์เปลี่ยน] app.js mount /api/ID/products แล้ว จึงใช้ '/' และ '/:id' ใน router; อย่าใส่ /products ซ้ำ
const router = express.Router();
// [โจทย์เปลี่ยน] GET list: queryParser -> service -> apiResponse(total). ถ้าโจทย์ไม่มี pagination ใช้ READ-ALL
router.get('/', queryParser(), async (req,res) => { // [แก้ตัวนี้] '/' คือ path หลัง app mount; ถ้า app mount /products ไม่ต้องเติม /products ที่นี่
  // [โจทย์เปลี่ยน] ถ้ service เปลี่ยนชื่อผล ต้องแก้ destructuring และ helper call ด้านล่างพร้อมกัน
  const { items, total } = await service.getAllObjects(req.pagination, req.query.view ?? POLICY.listView);
  return apiResponse(res, items, req.pagination, 200, total);
});
// [โจทย์เปลี่ยน] ถ้า path เป็น :productCode แก้ทั้ง path และ req.params.id; parseId ใช้เฉพาะ key ตัวเลข
router.get('/:id', async (req,res) => { // [แก้ตัวนี้] เปลี่ยน :id เป็น :productCode ต้องเปลี่ยน req.params.id ด้านล่างด้วย
  const data = await service.getObject(service.parseId(req.params.id), req.query.view ?? POLICY.detailView);
  return apiResponse(res, data);
});
// [โจทย์เปลี่ยน] POST รับ raw JSON ที่ req.body; status 201 ตามโจทย์; body field อยู่ service.INPUT_FIELDS
router.post('/', async (req,res) => { // [แก้ตัวนี้] status 201 อยู่ใน apiResponse(...,null,201) ด้านล่าง; raw body มาจาก req.body
  const data = await service.createObject(req.body);
  // ถ้าโจทย์กำหนด Location ให้เพิ่ม res.location(`${req.baseUrl}/${data.id}`) ก่อนตอบ
  return apiResponse(res, data, null, 201); // null คือไม่มี pagination ไม่ใช่ status
});
// [โจทย์เปลี่ยน] PUT ต้องส่ง id และ req.body ไป service; ถ้า full replacement ดู PUT-FULL และ raw body เต็ม
router.put('/:id', async (req,res) => { // [แก้ตัวนี้] เปลี่ยน :id และ req.params.id พร้อมกัน; service.updateObject ต้องรับ id และ req.body
  const data = await service.updateObject(service.parseId(req.params.id), req.body); // [แก้ตัวนี้] arg1=req.params.id แปลงโดย parseId; arg2=req.body; ถ้า PK string เปลี่ยน parseId
  return apiResponse(res, data);
});
// [โจทย์เปลี่ยน] DELETE 204 ต้อง .end() ไม่ส่ง JSON; ถ้าโจทย์ 200 เปลี่ยน POLICY.deleteStatus
router.delete('/:id', async (req,res) => { // [แก้ตัวนี้] เปลี่ยน :id และ req.params.id พร้อมกัน; 204 ต้อง .end() ไม่มี JSON
  await service.removeObject(service.parseId(req.params.id));
  if (POLICY.deleteStatus === 204) return res.status(204).end();
  return apiResponse(res, { message: 'Product deleted successfully' }, null, 200);
});
export default router;
```

### T4.4 ถ้าโจทย์มี brands แบบ Week 8 ให้เพิ่ม 3 ไฟล์นี้

หากไม่มี brands ไม่ต้องสร้าง และลบ brand import/mount จาก app. ถ้า resource ชื่ออื่นเปลี่ยน table/key/DTO/path ตาม [RESOURCE](INT161-EXAM-HANDBOOK.md#resource) ไม่ใช่เปลี่ยน URL อย่างเดียว.

**ไฟล์:** `src/repositories-$id/brand-repo.js`  
**การวาง:** สร้างไฟล์ใหม่ในโฟลเดอร์ที่ระบุ; ถ้ายังไม่มีโฟลเดอร์ให้สร้างโฟลเดอร์ตามชื่อก่อน  
**ต้องตรวจ/แก้:** table, columns, PK ของ resource รอง  
**เมื่อแก้ไฟล์นี้ ให้ตรวจต่อ:** brand-service.js, brand-route.js, app.js  
**ใช้เดิมได้:** import/export และลำดับชั้นของโค้ดเมื่อยังใช้ Express 5 + mysql2/promise แบบ ESM และข้อสอบไม่ได้กำหนดต่าง  

```js
// ไฟล์: src/repositories-$id/brand-repo.js
// วิธีใช้: สร้างทั้งไฟล์; ไม่ใช้ Product DTO กับ brands
// ต้องแก้: SELECT fields/table/key ตาม schema ของ resource ใหม่
import db from '../configs-$id/db-config.js';
// [โจทย์เปลี่ยน] resource เพิ่ม: แก้ SELECT field/table จาก schema จริง; ถ้า brands ไม่มีให้ไม่สร้างไฟล์ชุดนี้
const SQL = 'SELECT id,name,country_of_origin,website,is_active,created_at FROM brands'; // [แก้ตัวนี้] แทนชื่อหลัง FROM brands และชื่อ columns ตาม SQL ของ resource รอง
export async function findAll() {
  const [rows] = await db.query(SQL + ' ORDER BY id');
  return rows;
}
export async function findOne(id) {
  // [โจทย์เปลี่ยน] PK ของ resource ไม่ใช่ id -> แก้ WHERE และ service/route parse ให้ตรง
  const [rows] = await db.query(SQL + ' WHERE id=?', [id]); // [แก้ตัวนี้] แทน id หลัง WHERE ด้วย PK จริง; service/route key ต้องตรง
  return rows[0] || null;
}
```

**ไฟล์:** `src/services-$id/brand-service.js`  
**การวาง:** สร้างไฟล์ใหม่ในโฟลเดอร์ที่ระบุ; ถ้ายังไม่มีโฟลเดอร์ให้สร้างโฟลเดอร์ตามชื่อก่อน  
**ต้องตรวจ/แก้:** 404/business code; DTO ถ้าโจทย์กำหนด  
**เมื่อแก้ไฟล์นี้ ให้ตรวจต่อ:** brand-repo.js, brand-route.js, error-handler.js  
**ใช้เดิมได้:** import/export และลำดับชั้นของโค้ดเมื่อยังใช้ Express 5 + mysql2/promise แบบ ESM และข้อสอบไม่ได้กำหนดต่าง  

```js
// ไฟล์: src/services-$id/brand-service.js
// วิธีใช้: สร้างทั้งไฟล์; แบรนด์ตัวอย่างใช้เลข id เช่นเดียวกับ product
import * as repo from '../repositories-$id/brand-repo.js';
import { AppError } from '../middlewares-$id/error-handler.js';
// [โจทย์เปลี่ยน] ถ้า list resource รองต้องมี DTO/filter ให้เพิ่ม mapper/service และปรับ route
export async function getAllObjects() { return repo.findAll(); }
export async function getObject(id) {
  const row = await repo.findOne(id);
  // [โจทย์เปลี่ยน] 404 message/code ต้องตรงข้อสอบ; status 404 ต่อผ่าน error-handler.js
  if (!row) throw new AppError('Brand not found',404,'BRAND_NOT_FOUND');
  return row;
}
```

**ไฟล์:** `src/routes-$id/brand-route.js`  
**การวาง:** สร้างไฟล์ใหม่ในโฟลเดอร์ที่ระบุ; ถ้ายังไม่มีโฟลเดอร์ให้สร้างโฟลเดอร์ตามชื่อก่อน  
**ต้องตรวจ/แก้:** URL param, method/status  
**เมื่อแก้ไฟล์นี้ ให้ตรวจต่อ:** app.js mount, brand-service.js, Postman  
**ใช้เดิมได้:** import/export และลำดับชั้นของโค้ดเมื่อยังใช้ Express 5 + mysql2/promise แบบ ESM และข้อสอบไม่ได้กำหนดต่าง  

```js
// ไฟล์: src/routes-$id/brand-route.js
// วิธีใช้: สร้างทั้งไฟล์; app mount ที่ /api/ID/brands
import express from 'express';
import * as service from '../services-$id/brand-service.js';
import { parseId } from '../services-$id/service.js';
import { apiResponse } from '../mappers-$id/api-response.js';
const router = express.Router();
// [โจทย์เปลี่ยน] app.js mount /brands; ถ้าโจทย์ path อื่นให้แก้ app mount ไม่ใช่เติม prefix ใน router
router.get('/', async (req,res) => apiResponse(res, await service.getAllObjects()));
// [โจทย์เปลี่ยน] ถ้า key string ใช้ KEY-S parse แทน parseId ของ products; เปลี่ยนชื่อ param คู่ req.params
router.get('/:id', async (req,res) => apiResponse(res, await service.getObject(parseId(req.params.id)))); // [แก้ตัวนี้] เปลี่ยน :id/req.params.id ถ้า PK ต่าง; string PK ต้องเปลี่ยน parseId
export default router;
```

<a id="app-entry"></a>
### T4.5 แทน `src/app.js` และเพิ่ม `src/server.js`

ชุดนี้แยก app กับ listen จึง **ต้องเพิ่ม server.js และ start ชี้ server.js**. หากข้อสอบบังคับ entrypoint `node src/app.js` ให้ใช้ [ENTRY-A](INT161-EXAM-HANDBOOK.md#entry-a) ซึ่งคืน listen ไป app. ตั้ง base path จากโจทย์; ถ้าไม่มี student-info/brands ให้ลบ route/import/mount ที่ไม่ใช้.

**ไฟล์:** `src/app.js`  
**การวาง:** แทนเนื้อหาทั้งไฟล์เดิมใน ZIP; ถ้ายังไม่มีโฟลเดอร์ให้สร้างโฟลเดอร์ตามชื่อก่อน  
**ต้องตรวจ/แก้:** base path/resource mounts, student-info หรือ endpoint เฉพาะ  
**เมื่อแก้ไฟล์นี้ ให้ตรวจต่อ:** exam-config.js, route.js, package start/server.js  
**ใช้เดิมได้:** import/export และลำดับชั้นของโค้ดเมื่อยังใช้ Express 5 + mysql2/promise แบบ ESM และข้อสอบไม่ได้กำหนดต่าง  

```js
// ไฟล์: src/app.js
// วิธีใช้: แทนทั้งไฟล์; ย้าย listen ไป server.js แล้ว start ด้วย node src/server.js
// ต้องแก้: mount path/identity ตามโจทย์; ใช้ STUDENT/POLICY เป็นจุดตั้งค่าร่วม
import express from 'express';
import productRouter from './routes-$id/route.js';
import brandRouter from './routes-$id/brand-route.js';
import { STUDENT, BASE_PATH } from './configs-$id/exam-config.js';
import { apiResponse } from './mappers-$id/api-response.js';
import { AppError, errorHandler } from './middlewares-$id/error-handler.js';
const app = express();
// [โจทย์เปลี่ยน] ต้องอยู่ก่อน routes มิฉะนั้น POST/PUT req.body จะเป็น undefined
app.use(express.json()); // ก่อน routes ไม่เช่นนั้น req.body อาจ undefined
// [โจทย์เปลี่ยน] root เป็น health แบบ HTTP; ถ้าโจทย์ไม่ขอจะลบได้ แต่ไม่ใช้ยืนยัน DB
app.get('/', (req,res) => res.json({ message: 'API is running' })); // ไม่ใช่ DB health check
// [โจทย์เปลี่ยน] ถ้าโจทย์ไม่มี identity ลบ route นี้และ STUDENT import; หากมีต้องใส่ข้อมูลผู้สอบใน exam-config.js
app.get(`${BASE_PATH}/student-info`, (req,res) => apiResponse(res, {
  studentId: STUDENT.id, name: STUDENT.name, secretKey: STUDENT.secretKey
})); // ถ้าโจทย์ไม่ต้องการ endpoint นี้ ลบบล็อกนี้ได้
// [โจทย์เปลี่ยน] ถ้าโจทย์ไม่มี brands ลบ mount และ brandRouter import; ถ้าชื่อ resource เปลี่ยนแก้ path และ Postman
app.use(`${BASE_PATH}/brands`, brandRouter); // [แก้ตัวนี้] เปลี่ยนเฉพาะ '/brands' ตาม URL โจทย์; ถ้าไม่มี brands ลบ mount+import
// [โจทย์เปลี่ยน] ต้องตรง endpoint ในโจทย์; route.js ใช้ '/'/':id' ต่อท้าย path นี้
app.use(`${BASE_PATH}/products`, productRouter); // [แก้ตัวนี้] เปลี่ยนเฉพาะ '/products' ตาม endpoint โจทย์; route.js '/' ต่อท้าย mount
// [โจทย์เปลี่ยน] 404 route catch ต้องอยู่หลังทุก route; errorHandler ต้องอยู่ท้ายสุด
app.use((req,res,next) => next(new AppError('Endpoint not found',404,'ENDPOINT_NOT_FOUND')));
app.use(errorHandler); // หลัง routes และ middleware อื่นเสมอ
export default app;
```

**ไฟล์:** `src/server.js`  
**การวาง:** สร้างไฟล์ใหม่ในโฟลเดอร์ที่ระบุ; ถ้ายังไม่มีโฟลเดอร์ให้สร้างโฟลเดอร์ตามชื่อก่อน  
**ต้องตรวจ/แก้:** entrypoint และ port; เลือกเฉพาะโครงแยก listen  
**เมื่อแก้ไฟล์นี้ ให้ตรวจต่อ:** package.json scripts.start และ app.js export  
**ใช้เดิมได้:** import/export และลำดับชั้นของโค้ดเมื่อยังใช้ Express 5 + mysql2/promise แบบ ESM และข้อสอบไม่ได้กำหนดต่าง  

```js
// ไฟล์: src/server.js
// วิธีใช้: สร้างทั้งไฟล์; npm start ต้องชี้ไฟล์นี้ ไม่ใช่ app.js ที่ export อย่างเดียว
import app from './app.js';
import db from './configs-$id/db-config.js';
import { HOST, PORT, BASE_PATH } from './configs-$id/exam-config.js';
try {
  // [โจทย์เปลี่ยน] เช็ก connection ก่อน listen; ถ้า DB down error จะเห็นใน Terminal
  await db.query('SELECT 1 AS ok'); // fail ก่อนเปิด port ถ้าค่า DB ไม่ถูก
  // [โจทย์เปลี่ยน] PORT/HOST มาจาก exam-config.js; package.json start ต้องชี้ไฟล์นี้เมื่อเลือกแยก server
  const server = app.listen(PORT, HOST, () => { // [แก้ตัวนี้] PORT/HOST มาจาก exam-config.js; package.json start ต้องชี้ src/server.js
    console.log(`API ready: http://${HOST}:${PORT}${BASE_PATH}`);
  });
  server.on('error', async err => {
    console.error('Server start failed:',err.code,err.message);
    await db.end(); process.exitCode = 1;
  });
  process.once('SIGINT', () => server.close(async () => { await db.end(); process.exit(0); }));
} catch (err) {
  console.error('DB connection failed:',err.code,err.message);
  await db.end(); process.exitCode = 1;
}
```

**ผ่าน T4:** imports ทุกตัวหาไฟล์เจอ; GET list/detail ตอบตามโจทย์; POST ได้ 201; PUT เปลี่ยนจริง; DELETE 204 ไม่มี body (หากโจทย์กำหนด). `Unknown column` → repo/alias vs SQL; `ER_NO_SUCH_TABLE` → DB/table; `Cannot POST` → mount/path/method; DTO TypeError → repo row null/ชื่อ property ผิด; PUT ไม่ทำงาน → route ส่ง id/body และ SQL WHERE.

<a id="t5"></a>
## T5 — ตรวจ syntax, DB, Postman, runner และ ZIP

**T5.1** ที่ root เปิด Terminal อีกอัน ตรวจ JS ทั้งโครงการ; ถ้าพบ syntax error ให้แก้ไฟล์แรกที่แจ้งก่อนเริ่ม server:

```powershell
Get-ChildItem -LiteralPath src -Recurse -File -Filter *.js | ForEach-Object { node --check $_.FullName }
```

**T5.2** เพิ่มไฟล์ทดสอบอ่านอย่างเดียวสองตัวนี้. `test-service.js` เดิมของ ZIP มี import ที่ไม่มีจริงและ DELETE ID26 **ห้ามรันของเดิม**. แก้เลข ID ทดสอบเป็นค่าที่มีจริง. รัน `node src/test-db.js` ก่อน, `node src/test-service.js` ต่อ.

**ไฟล์:** `src/test-db.js`  
**การวาง:** สร้างไฟล์ใหม่ในโฟลเดอร์ที่ระบุ; ถ้ายังไม่มีโฟลเดอร์ให้สร้างโฟลเดอร์ตามชื่อก่อน  
**ต้องตรวจ/แก้:** ถ้า SQL ต่าง ให้แก้ query อ่านอย่างเดียว  
**เมื่อแก้ไฟล์นี้ ให้ตรวจต่อ:** db-config.js  
**ใช้เดิมได้:** import/export และลำดับชั้นของโค้ดเมื่อยังใช้ Express 5 + mysql2/promise แบบ ESM และข้อสอบไม่ได้กำหนดต่าง  

```js
// ไฟล์: src/test-db.js
// วิธีใช้: สร้างทั้งไฟล์ แล้วรัน node src/test-db.js จาก project root
// ใช้ SELECT เท่านั้น ไม่สร้าง/reset/ลบข้อมูล; เปลี่ยน products ถ้าโจทย์ใช้ตารางอื่น
import db from './configs-$id/db-config.js';
try {
  // [โจทย์เปลี่ยน] SELECT DATABASE() บอก schema ที่ db-config.js เลือก; ถ้าชื่อผิดย้อนกลับไปแก้ database ห้าค่า
  const [[info]] = await db.query('SELECT DATABASE() AS databaseName, 1 AS ok');
  console.log('Connection:',info);
  // [โจทย์เปลี่ยน] SHOW TABLES ช่วยยืนยันว่า import SQL ถูก schema; ถ้าว่างกลับไปเปิดไฟล์ SQL จริง
  const [rows] = await db.query('SHOW TABLES');
  console.log('Tables:',rows);
  // [โจทย์เปลี่ยน] เปลี่ยน products เป็น table หลักของโจทย์; ถ้าไม่มีตารางนี้จะ ER_NO_SUCH_TABLE
  const [[count]] = await db.query('SELECT COUNT(*) AS total FROM products'); // [แก้ตัวนี้] แทน products ใน SQL ด้วย table จริง; query นี้อ่านอย่างเดียว
  console.log('Products:',count);
} catch (err) {
  console.error('Test failed:',err.code,err.message); process.exitCode = 1;
} finally { await db.end(); }
```

**ไฟล์:** `src/test-service.js`  
**การวาง:** แทนเนื้อหาทั้งไฟล์เดิมใน ZIP; ถ้ายังไม่มีโฟลเดอร์ให้สร้างโฟลเดอร์ตามชื่อก่อน  
**ต้องตรวจ/แก้:** PK ตัวอย่างที่มีอยู่จริง; ไม่มี DELETE ในไฟล์นี้  
**เมื่อแก้ไฟล์นี้ ให้ตรวจต่อ:** service.js และ DB ที่ import แล้ว  
**ใช้เดิมได้:** import/export และลำดับชั้นของโค้ดเมื่อยังใช้ Express 5 + mysql2/promise แบบ ESM และข้อสอบไม่ได้กำหนดต่าง  

```js
// ไฟล์: src/test-service.js
// วิธีใช้: แทน test-service.js เดิมทั้งไฟล์; ตัวนี้อ่านอย่างเดียว ไม่มีคำสั่งลบเก่า
// ต้องแก้: id ให้เป็นค่าที่มีจริง; ถ้าไม่มีข้อมูล ใช้ list เป็นจุดเริ่ม
import * as service from './services-$id/service.js';
import db from './configs-$id/db-config.js';
try {
  // [โจทย์เปลี่ยน] page/limit/view ต้องตรง service ตัวที่วาง; ถ้าโจทย์ไม่มี pagination ใช้ getAllObjects() ตาม READ-ALL
  const data = await service.getAllObjects({ page:1, limit:2, offset:0 }, 'summary');
  console.log('List DTO:',data);
  // [โจทย์เปลี่ยน] ใช้ id จากแถวแรกที่มีจริง ไม่ hardcode ID 26 แบบ test-service.js ใน ZIP เดิมซึ่งลบข้อมูล
  if (data.items.length) console.log('Detail DTO:',await service.getObject(data.items[0].id,'full'));
} catch (err) {
  console.error(err.errorCode || err.code,err.message); process.exitCode = 1;
} finally { await db.end(); }
```

**T5.3** รัน `npm.cmd start` (หลังเพิ่ม script) หรือ `node src/server.js`; ถ้า ENTRY-A ใช้ `node src/app.js`. Express URL `http://localhost:3000`, MySQL host/port `127.0.0.1:3306`. `EADDRINUSE` → server เดิมใช้พอร์ต; `ECONNREFUSED` ที่ startup → MySQL ไม่ขึ้น/port ผิด; Postman refused → Express ไม่ได้ listen/port URL ผิด.

**T5.4 Postman offline:** ตั้ง environment `baseUrl=http://localhost:3000`, `studentId=<รหัสตามโจทย์>`, `productId=<id ที่มีจริง>`. ใน Postman Body → raw → JSON, URL เช่น `{{baseUrl}}/api/{{studentId}}/products`. GET list/detail; POST raw JSON ตาม field ของโจทย์; เก็บ id จาก 201; PUT id นั้นแล้ว GET ยืนยัน; DELETE และ GET อีกครั้งคาด 404. ตัวอย่าง PUT **เฉพาะ partial ตาม Week 8**:

```json
{"name":"Edited Phone","price":31900,"stock_quantity":7}
```

ถ้าโจทย์ให้ full PUT ใช้ [ตัวอย่าง raw body เต็ม](INT161-EXAM-HANDBOOK.md#p9) แต่เปลี่ยนให้ตรง SQL จริง. [P9 ในคู่มือหลัก](INT161-EXAM-HANDBOOK.md#p9) มี POST/GET/PUT/DELETE/error test ละเอียด. อย่าแก้แถว seed ที่ต้องใช้ตรวจ; สร้าง test row ใหม่ก่อน.

**T5.5** ถ้าโจทย์มี `tests/test-runner.mjs` จริง ให้รันตาม syntax/ID ที่ใบงานบอก; template ZIP นี้เองไม่มี runner. อย่าใช้ runner ของ Week 8 กับ schema อื่นโดยเดา. ตรวจ start, base path, DTO, status, identity; ZIP เฉพาะ folder งานและตัด node_modules ถ้าโจทย์สั่ง. ดู [P10](INT161-EXAM-HANDBOOK.md#p10).

| อาการ | ดูจุดแรก | แก้ต่อ |
|---|---|---|
| `ERR_MODULE_NOT_FOUND` | import, ชื่อ `-$id`, dependencies | ชื่อโฟลเดอร์/import ตรงกัน; ลง npm ก่อน offline |
| `ER_ACCESS_DENIED_ERROR` | DB user/password/host | db-config และ WebStorm Data Source ให้ตรง |
| `Unknown database` / `ER_NO_SUCH_TABLE` | SQL import, `USE`, table | กลับ T1; อย่าเดาตาราง |
| `Unknown column` | SELECT/WHERE/INSERT/UPDATE | `SHOW COLUMNS`; แก้ repo + mapper alias |
| DTO field หาย | row จริงและ mapper RHS | เปลี่ยน `entity.id` เป็น property จริงหรือ SQL alias |
| HTTP 404 route | app mount + route path + URL | แก้ prefix ซ้ำ/param |
| POST/PUT 400 | raw JSON, header, allowlist | request keys และชนิดตรงโจทย์ |
| POST 409 | unique key | เปลี่ยน SKU ทดสอบ; คง DB constraint |
| PUT ไม่เปลี่ยน | id/body ใน route, WHERE, affectedRows | `updateObject(id, req.body)` แล้ว GET อีกครั้ง |
| DELETE 204 แต่มี body | route response | `res.status(204).end()` |
| pagination ผิดหน้า | limit/offset/ORDER/count | `offset=(page-1)*limit`, COUNT filter เดียวกัน |

<a id="alt"></a>
## ตัวเลือกเมื่อโจทย์จริงเปลี่ยน: สลับให้ครบชุด

| เจอข้อความ/รูปแบบ | ใช้โครง | ต้องแก้พร้อมกัน |
|---|---|---|
| GET list ไม่ paginate | [READ-ALL](INT161-EXAM-HANDBOOK.md#read-all) | route/service/repo/helper |
| page+limit ต้องส่งครบจึง paginate | [PAGE-OPT](INT161-EXAM-HANDBOOK.md#page-opt) | middleware + response expectations |
| มี filter/sort | [FILTER](INT161-EXAM-HANDBOOK.md#filter) | SELECT + COUNT + service + route |
| body camelCase, DB snake_case | [BODY-CAMEL](INT161-EXAM-HANDBOOK.md#body-camel) | input mapping + repo SQL + DTO + Postman |
| PUT full replacement | [PUT-FULL](INT161-EXAM-HANDBOOK.md#put-full) | validation/defaults + raw full body |
| response envelope อื่น | [RESP](INT161-EXAM-HANDBOOK.md#resp) | response helper/error/route/tests |
| PK string (`productLine`) | [KEY-S](INT161-EXAM-HANDBOOK.md#key-s) | parse key + WHERE + create + DTO |
| composite PK | [KEY-C](INT161-EXAM-HANDBOOK.md#key-c) | 2 params + WHERE + CRUD + tests |
| ไม่มี JOIN/brand | [NO-JOIN](INT161-EXAM-HANDBOOK.md#no-join) | SQL SELECT + detail DTO + app brand mount |
| resource เพิ่ม | [RESOURCE](INT161-EXAM-HANDBOOK.md#resource) | route → service → repo → mapper → app → Postman |
| `node src/app.js` บังคับ | [ENTRY-A](INT161-EXAM-HANDBOOK.md#entry-a) | listen + package start ให้ตรง |

**เช็กลำดับที่เปลี่ยน resource:** เขียน mapping `URL param / table.PK / response key` → app mount → route param และ `req.params` → service parse/validation → repository WHERE/SELECT/INSERT/UPDATE/DELETE → mapper JSON → Postman body/URL → test runner. เปลี่ยนเฉพาะ path จะไม่แก้ SQL/DTO อัตโนมัติ. [แผนผังจุดเปลี่ยนครบ](INT161-EXAM-HANDBOOK.md#change-map)

