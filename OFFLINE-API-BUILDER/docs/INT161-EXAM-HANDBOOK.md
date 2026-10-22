# INT161 — คู่มือปฏิบัติ Express + MySQL แบบทำตามทีละ Phase

> **เมื่อได้รับไฟล์สอบจริง ให้เริ่มที่ [คู่มือยึด midterm-exam-esm-template](MIDTERM-TEMPLATE-FIRST.md)** ซึ่งเปิด ZIP จริงทีละไฟล์ ระบุไฟล์เดิม/ไฟล์เพิ่ม การนำเข้า SQL ตาม path ที่มีจริง การเปลี่ยน SQL alias → `entity.xxx` ใน DTO และการแก้ path/import ที่ต้องตามกัน. คู่มือหน้านี้คือชุดโค้ดเต็มและกรณีฝึก Week 8; ชื่อ table, endpoint, schema และ response ของข้อสอบจริงยังไม่ทราบ.

รุ่น 1 • ตัวอย่างหลัก Mobile Phone Distributor (Week 8) • คู่มือเตรียมสอบล่วงหน้า

**เปิดคู่กับ [ตาราง HTTP Status Code](HTTP-STATUS-CODES.md)** เก็บสองไฟล์ไว้โฟลเดอร์เดียวกันเพื่อให้ลิงก์ทำงานบน GitHub และใน Markdown viewer

## วิธีใช้คู่มือนี้ให้ทำงานได้จริง

- รอบแรกทำ **โครงหลักทั้งหมด** ตาม Phase 0–9 ก่อนเริ่ม server; โค้ดแต่ละไฟล์พึ่งกัน การวาง app อย่างเดียวโดยยังไม่มี service/repository จะรันไม่ได้
- หลังครบไฟล์ ให้ทดสอบเป็นชั้น: DB → Service → HTTP → Postman → ตัวตรวจที่แจก
- โค้ดหลักออกแบบตาม schema `mobile_distributor` ของ Week 8 ไม่ใช่โปรแกรมที่อ่าน schema ใหม่แล้วปรับตัวเองได้ ถ้าข้อสอบเปลี่ยนตาราง ต้องปรับตามแผนที่ใน [Phase 0](#p0) และ [ตัวเลือก](#options)
- **[ไฟล์เต็ม]** = สร้าง/แทนทั้งไฟล์ • **[แทนฟังก์ชัน]** = แทนเฉพาะส่วนที่ระบุ • **[เพิ่ม]** = แทรกตรงตำแหน่งที่บอก ห้ามเอาตัวเลือกหลายชุดวางซ้ำกัน
- คำว่า **ใช้เดิมได้** มีเงื่อนไข: dependency, schema, response และ policy ยังเหมือนตัวอย่าง ถ้าโจทย์กำหนดต่าง ให้ข้อสอบจริงเป็นหลัก
- ชื่อ `configs-$id` ในคู่มือนี้เป็น **ชื่อโฟลเดอร์จริงที่ตั้งตาม template** เครื่องหมาย `$` ใช้ในชื่อไฟล์ได้ ถ้าอาจารย์สั่งแทน `$id` ด้วยรหัสจริง ให้เปลี่ยนทุกโฟลเดอร์และทุก import ให้ตรงกันในครั้งเดียว ไม่ใช้ Replace All คำว่า `id` ทั่วโปรเจกต์
- โครงนี้แยก `app.js` กับ `server.js` เพื่อทดสอบได้ แต่ยังคง Route → Service → Repository ตามตระกูล template หากข้อสอบบังคับ entrypoint `app.js` ใช้ [ENTRY-A](#entry-a)
- ไม่เปิดทุกตัวเลือกเผื่อไว้ในข้อสอบ: ใช้เฉพาะ endpoint/field/policy ตามโจทย์ ไม่เพิ่ม field ใน JSON โดยไม่มีเหตุผล
- เตรียม npm packages, WebStorm JDBC driver และ Postman Desktop ให้พร้อมก่อนช่วงตัดอินเทอร์เน็ต ระหว่างสอบใช้เอกสาร/ไฟล์ออฟไลน์ตามกติกา ไม่ต้องเรียก AI หรือบริการออนไลน์

## สารบัญและเส้นทางเปิดหา

| รหัส | ไปที่ | ใช้เมื่อ |
|---|---|---|
| P0 | [อ่านโจทย์และหา schema](#p0) | ไม่รู้ว่าค่าที่ต้องกรอกอยู่ตรงไหน |
| P1 | [npm / package.json / โครงไฟล์](#p1) | เปิด template แล้วเริ่มต้น |
| P2 | [MySQL + WebStorm + import SQL](#p2) | ยังต่อ DB หรือดูตารางไม่ได้ |
| P3 | [ตั้งค่าและทดสอบ DB](#p3) | ต้องวาง db-config และตรวจ connection |
| P4 | [Error / Pagination / Response / DTO](#p4) | เตรียมไฟล์ส่วนร่วม |
| P5 | [Repository](#p5) | เขียน SQL และอ่านผล mysql2 |
| P6 | [Service](#p6) | ตรวจ input, not found, duplicate |
| P7 | [Route / App / Server](#p7) | เชื่อม HTTP กับแต่ละชั้น |
| P8 | [ทดสอบการรันเป็นชั้น](#p8) | วางไฟล์ครบแล้ว |
| P9 | [Postman ครบ CRUD + กรณีผิด](#p9) | ยิงและตรวจคำตอบ |
| ALT | [โครงสำรองและการเพิ่ม resource](#options) | โจทย์ต่างจากตัวอย่าง |
| P10 | [ตัวตรวจ / เวลาติดปัญหา / ก่อนส่ง](#p10) | ทำงานให้เสร็จและแพ็ก |
| MAP | [เช็กลิสต์แก้ข้ามไฟล์](#change-map) | เปลี่ยนแล้วกลัวส่วนอื่นไม่ตรง |
| HTTP | [ตารางรหัส 2xx–5xx](HTTP-STATUS-CODES.md#status-table) | เปิดเทียบ status และความหมาย |

---
<a id="p0"></a>
## Phase 0 — อ่านโจทย์ให้รู้ว่าต้องแก้อะไร ก่อนเขียนโค้ด

### P0.1 รู้จักเอกสารแต่ละชนิด

1. **ประกาศสอบ/ใบโจทย์จริง:** ใช้ตัดสินจำนวนข้อ, endpoint, response, status, ข้อจำกัด และรูปแบบส่ง
2. **SQL ที่แจก:** ใช้ดูชื่อ DB, ตาราง, columns, key, default, null และความสัมพันธ์
3. **Template จริง:** ใช้เป็นโครงส่ง อย่าเอา template ในคาบทั้งก้อนมาทับโดยไม่เทียบ
4. **Lab/Week8/ชุดเพื่อน:** เป็นตัวอย่างและโครงสำรอง ไม่ใช่หลักฐานว่าข้อสอบจะใช้ชื่อเดียวกัน
5. **Test runner:** ช่วยตรวจบางพฤติกรรม อ่านว่ามันส่งอะไรจริง แต่ผ่าน runner ไม่ได้แปลว่าครบ specification ทุกข้อ

กรณีเอกสารขัดกัน ให้ยึดใบโจทย์จริง/คำชี้แจงอาจารย์ ถ้ายังไม่ชัดให้ถามอาจารย์ ไม่ปรับเพียงเพื่อหลอกให้ตัวตรวจผ่าน

### P0.2 คำศัพท์ แหล่งที่หา และไฟล์ปลายทาง

| สิ่งที่หา | หมายถึง | ดูที่ไหน | เอาไปใช้ตรงไหน |
|---|---|---|---|
| database | ชื่อฐาน | Setup; SQL `CREATE DATABASE` / `USE` | `db-config.js` |
| host | เครื่องที่รัน MySQL | คำชี้แจง/การตั้งค่าเครื่อง ไม่ได้อยู่ใน schema เสมอ | DB config + WebStorm |
| user/password | บัญชีเข้า MySQL | ผู้สอน/บัญชีของเครื่อง ไม่ใช่บัญชี LEB2 | DB config + WebStorm |
| DB port | ช่องทาง MySQL | การตั้งค่า server เช่น 3306 | DB config + WebStorm |
| API port | ช่องทาง Express | โจทย์/คำสั่ง listen เช่น 3000 | `exam-config.js`, URL, runner |
| table | ที่เก็บ resource | `CREATE TABLE`; Database panel | SQL ใน Repository |
| columns | ฟิลด์ที่เก็บจริง | ส่วนใน `CREATE TABLE`; Columns | SQL, allowlist และ mapper |
| PK | ตัวระบุแถวไม่ซ้ำ | `PRIMARY KEY` อาจมีหลายคอลัมน์ | WHERE และ route params |
| AUTO_INCREMENT | DB สร้างเลข key ให้ | คุณสมบัติของคอลัมน์ PK | หลัง INSERT ใช้ insertId |
| UNIQUE | ค่าห้ามซ้ำ | `UNIQUE` / unique index | duplicate check + error 409 |
| FK | key ที่อ้างตารางอื่น | `FOREIGN KEY ... REFERENCES ...` | input, JOIN, error 1452/1451 |
| NULL / NOT NULL | รับ null ได้หรือไม่ | schema ของ column | validation |
| DEFAULT | DB มีค่าให้เมื่อไม่ได้ส่ง column | schema ของ column | Create; ห้ามใช้ default แทน required ที่โจทย์บังคับ |
| endpoint | method + URL | ตาราง API ของโจทย์ | app mount + route |
| body | ข้อมูลที่ client ส่ง | Request Body และเงื่อนไข ไม่อนุมานจาก response | Service + Postman |
| DTO | รูปร่างข้อมูลรับ/ส่ง | Summary/Detail/Response examples | Mapper และ input mapping |
| pagination policy | ค่าเริ่มต้น/ชื่อ metadata/ค่าผิด | Query Parameters + response | POLICY, middleware, helper |
| error/status | กรณีใดได้รหัสใด | เงื่อนไขแต่ละข้อ | AppError, route, errorHandler |

**อย่าเดาจากชื่อ:** `officeCode` อาจเป็น VARCHAR แม้บางค่าเป็น `1`; `brandId` ใน API อาจเก็บใน DB ว่า `brand_id`; ตัวอย่าง response ไม่ได้บอกว่า body ต้องส่งชื่อเดียวกัน

### P0.3 เปิด SQL แล้วอ่านทีละจุด

ตัวอย่างเพื่ออ่าน schema เท่านั้น ไม่ต้องรันสร้างตารางนี้ถ้ามี SQL ของโจทย์แล้ว:

```sql
CREATE TABLE products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  brand_id BIGINT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  release_date DATE,
  FOREIGN KEY (brand_id) REFERENCES brands(id)
);
```

- `id`: เลขที่ DB สร้างเอง → POST ไม่ต้องรับ id และอ่าน ID ใหม่จาก insertId
- `sku`: ต้องมีและห้ามซ้ำ → validate + ให้ DB unique constraint ป้องกันซ้ำจริง
- `brand_id`: ต้องอ้างแบรนด์ที่มีจริง → หาค่าจาก GET brands ก่อน POST
- `stock_quantity`: มี default แต่ถ้าใบโจทย์ระบุว่าต้องส่งก็ต้องตรวจ required ตามโจทย์
- `release_date`: ไม่มี NOT NULL → ส่ง null ได้ตาม schema แต่ยังต้องดู validation ในโจทย์

### P0.4 ตารางจดก่อนลงมือ

| รายการ | ค่าจากข้อสอบของฉัน |
|---|---|
| รหัส/ชื่อ/secret ที่ใบงานแจก | |
| project root ที่มี package.json | |
| entrypoint และ start command ที่โจทย์บังคับ | |
| DB host/port/name/user (อย่าจด password จริงในเอกสารที่จะ push) | |
| API host/port/base path | |
| resource หลัก/ตาราง/PK/type/auto increment | |
| FK และตารางที่เกี่ยวข้อง | |
| C/R/R/R/U/D แต่ละข้อ: method + path | |
| POST required/optional/default | |
| PUT ส่งครบหรือบางส่วน | |
| list/detail DTO + response envelope | |
| pagination default/max/optional/ชื่อ metadata | |
| status/error code ของแต่ละกรณี | |
| ต้องส่งไฟล์อะไร/ชื่อ ZIP | |

ตัวอย่างแปล `GET /api/ID/products/:id` ให้คืนชื่อแบรนด์และ 404 ถ้าไม่พบ:

1. `app.js` mount `/api/ID/products`; route จึงเป็น `/:id` ไม่ใส่ prefix ซ้ำ
2. อ่าน SQL ว่า `products.id` เป็นเลข → parseId ได้
3. ชื่อแบรนด์อยู่ `brands.name` → Repository JOIN และ alias `brand_name`
4. Mapper ส่ง `brandName: entity.brand_name`
5. Service ตรวจ null ก่อนเข้า mapper → throw PRODUCT_NOT_FOUND 404
6. Postman ใช้ ID ที่มีจริงหนึ่งค่า และ ID ที่ตรวจว่าไม่มีอีกหนึ่งค่า

### P0.5 ตารางเลือกโครงตามโจทย์

| เงื่อนไข | ใช้ส่วนไหน |
|---|---|
| schema mobile_distributor ของ Week8 | โครงหลัก P1–P9 |
| อ่านทั้งหมด ไม่แบ่งหน้าเลย | [READ-ALL](#read-all) |
| ไม่ส่ง page/limit = ทั้งหมด แต่ส่งแล้วแบ่งหน้า | [PAGE-OPT](#page-opt) |
| ขอ full/summary ด้วย view | โครงหลัก route + mapper รองรับแล้ว |
| กรอง brandId หรือค้นชื่อ/เรียงข้อมูล | [FILTER](#filter) พร้อม COUNT เงื่อนไขเดียวกัน |
| ไม่มี JOIN | [NO-JOIN](#no-join) |
| รับ camelCase แต่ DB snake_case | [BODY-CAMEL](#body-camel) |
| PUT ต้องส่งครบ | [PUT-FULL](#put-full) |
| PK เป็น string | [KEY-S](#key-s) |
| PK หลายคอลัมน์ | [KEY-C](#key-c) |
| เพิ่ม resource อีกตัว | [RESOURCE](#resource) |
| บังคับ app.js เป็น entrypoint | [ENTRY-A](#entry-a) |

**ติดตรงนี้ได้อย่างไร:** ไม่เห็น column/FK → ไป P2 ดู `SHOW CREATE TABLE`; ไม่รู้ฟิลด์ body → อ่าน Request Body ไม่ใช้ DTO response เดา; ยังไม่รู้ schema ข้อสอบจริง → อย่าฝืนใช้ products ตรง ๆ ให้กรอก mapping ก่อน

---
<a id="p1"></a>
## Phase 1 — เปิดโปรเจกต์ เตรียม npm และไฟล์ให้ครบ

### P1.1 เข้าโฟลเดอร์ให้ถูก

1. แตก ZIP template จริงไปโฟลเดอร์งานใหม่ที่หาเจอง่าย อย่าทำในหน้าดูไฟล์ภายใน ZIP
2. WebStorm: File → Open → เลือกโฟลเดอร์ที่มี `package.json`; VS Code: File → Open Folder เช่นเดียวกัน
3. เปิด Terminal ใน IDE ตรวจว่าอยู่ project root ไม่ใช่ `src` และไม่ใช่โฟลเดอร์ชั้นนอกที่มี template ซ้อนอยู่
4. คำสั่งด้านล่างสำหรับ **PowerShell Terminal**:

```powershell
Get-Location
Get-ChildItem
node --version
npm.cmd --version
```

ต้องเห็น `package.json` ในรายการ และ Node ที่รองรับ Express5 (ตัวอย่างนี้ตรวจด้วย Node22) ใน Windows ใช้ `npm.cmd` แทน `npm` ได้เมื่อ PowerShell บล็อก npm.ps1; macOS/Linux ใช้ `npm`

### P1.2 package.json — ตรวจของเดิมก่อน ไม่ทับทั้งไฟล์

**ไฟล์:** `package.json` ที่ project root  
**หน้าที่:** บอก module mode, dependency และคำสั่งรัน  
**การวาง:** ใน template ที่แจก ให้เพิ่ม/ปรับเฉพาะ key ที่จำเป็น รักษา dependency/version ของอาจารย์ไว้  
**ต้องแก้:** `scripts.start` ให้ตรง entrypoint; ถ้าไม่มี type ให้ตรวจว่าใช้ ESM แล้วเพิ่ม `"type": "module"`  
**ใช้เดิมได้:** `express`, `mysql2`, `http-status` ที่ template มีอยู่แล้ว โครงหลักไม่ได้ต้องเพิ่ม dotenv/nodemon/framework ใหม่

โครง package เต็มด้านล่างใช้เฉพาะกรณีเริ่มโปรเจกต์เปล่าหรือใช้เทียบตำแหน่ง **ไม่ใช้ทับ package ของอาจารย์อัตโนมัติ**:

```json
{
  "name": "int161-exam-reference",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "test:db": "node src/test-db.js",
    "test:service": "node src/test-service.js"
  },
  "dependencies": {
    "express": "^5.3.0",
    "mysql2": "^3.24.3",
    "http-status": "^2.1.0"
  }
}
```

ถ้ามี scripts.test เดิม ให้เก็บไว้แล้วเพิ่ม start/test:db/test:service ใน object `scripts` เดียวกัน อย่าสร้าง `scripts` ซ้ำสองก้อน และ JSON ห้าม trailing comma หรือ `//`

ตัวอย่างส่วนที่เพิ่มลง scripts เดิม:

```json
"start": "node src/server.js",
"test:db": "node src/test-db.js",
"test:service": "node src/test-service.js"
```

บล็อกนี้เป็น **สมาชิกของ scripts** ไม่ใช่ไฟล์ JSON เต็ม ต้องมี comma คั่นกับสมาชิกเดิมให้ถูก

### P1.3 เลือกคำสั่งติดตั้ง

ทำขณะที่ยังอนุญาตให้ต่ออินเทอร์เน็ต:

| สภาพโปรเจกต์ | ทำอะไร |
|---|---|
| packages มีและรันได้แล้ว | ไม่ต้องลงซ้ำทุกครั้ง |
| มี package-lock.json ตรงกับ package.json | `npm.cmd ci` ติดตั้งจาก lockfile; จะสร้าง node_modules ใหม่ |
| ไม่มี lockfile/สร้างใหม่ | `npm.cmd install` |
| ci แจ้ง package กับ lock ไม่ตรง | ตรวจว่ามีการแก้ dependency โดยไม่ตั้งใจหรือไม่; ถ้าต้องแก้จริงตามโจทย์ ใช้ install อัปเดต lock ก่อนออฟไลน์ |
| package ขาดจริงและยังออนไลน์ได้ | เช่น `npm.cmd install mysql2` เฉพาะตัวที่ขาด รักษา version ที่ผู้สอนกำหนด |
| ออฟไลน์และไม่มี packages | ใช้ dependencies ที่เตรียมไว้/วิธีที่อาจารย์อนุญาต `--offline` ไม่สร้าง package ที่ไม่มีใน cache ขึ้นมาเอง |

```powershell
npm.cmd ls express mysql2 http-status
```

`http-status` คงไว้ตาม template ได้ แม้โค้ดหลักนี้ใช้เลข status โดยตรง ไม่จำเป็นต้อง uninstall

### P1.4 สร้างโฟลเดอร์/ไฟล์

ใน IDE คลิกขวา `src` → New → Directory ถ้าไม่มีโฟลเดอร์ แล้ว New → JavaScript File ชื่อตามตาราง (ตรวจว่าไม่ได้กลายเป็น `.js.js` หรือ `.js.txt`)

| โฟลเดอร์ | ไฟล์ที่จะวาง |
|---|---|
| `src/configs-$id` | `exam-config.js`, `db-config.js` |
| `src/middlewares-$id` | `error-handler.js`, `pagination-middleware.js` |
| `src/mappers-$id` | `api-response.js`, `entity-dto-mapper.js` |
| `src/repositories-$id` | `repository.js`, `brand-repo.js` |
| `src/services-$id` | `service.js`, `brand-service.js` |
| `src/routes-$id` | `route.js`, `brand-route.js` |
| `src` | `app.js`, `server.js`, `test-db.js`, `test-service.js` |

ไฟล์เดียวชื่อ `repository.js` เป็น products ตาม template จริง ส่วน brands แยก resource อีกชุด ถ้าคงไฟล์เก่าที่ไม่ใช้ไว้ ต้องแน่ใจว่า app ไม่ import/mount มันโดยไม่ตั้งใจ โดยเฉพาะ test-service เดิมที่มี removeObject

**ถ้าต้อง rename `$id`:** IDE Refactor → Rename ช่วยปรับ path ได้ แต่ตรวจทุก import อีกครั้ง ชื่อไฟล์ตัวพิมพ์ใหญ่/เล็กต้องตรงแม้ Windows เปิดได้ เพราะเครื่องอื่นอาจแยก case

### P1.5 ถ้าทำแล้วติด

| อาการ/ตัวอย่าง | ลองดู/แก้ | ตรวจซ้ำ |
|---|---|---|
| ENOENT package.json | อยู่ผิดโฟลเดอร์; cd ไป root ที่เห็น package.json | Get-ChildItem แล้ว npm.cmd ls |
| npm.ps1 cannot be loaded | ใช้ npm.cmd ไม่ต้องแก้ execution policy ทั้งเครื่อง | npm.cmd --version |
| Cannot use import outside a module | ตรวจ type:module ใน package.json ที่ครอบไฟล์จริง | node --check src/app.js |
| ERR_MODULE_NOT_FOUND | แยก package หายกับ path หาย; ตรวจ node_modules หรือ path/.js/case | เปิดชื่อที่ import ตามจริงแล้วรันใหม่ |
| Missing script: start | เพิ่ม scripts.start หรือใช้ node src/server.js หลังวางไฟล์ครบ | npm.cmd start |
| EJSONPARSE | comma/quote/comment ใน package.json ผิด | เปิดไฟล์แก้ JSON ไม่ใส่ // |

**ผ่านเมื่อ:** root ถูก, dependencies พร้อม, folders มีตามตาราง ยังไม่ต้อง start จนกว่าจะวางครบ P7

---
<a id="p2"></a>
## Phase 2 — MySQL และ WebStorm แบบทีละคลิก

### P2.1 แยกสามส่วนให้ออก

| ส่วน | ทำหน้าที่ | ไม่ได้แทนอะไร |
|---|---|---|
| MySQL Server | เก็บข้อมูลและรับ SQL | ต้องเปิด service/container จริง |
| WebStorm Data Source | เครื่องมือดู/สั่ง SQL ผ่าน JDBC driver | ต่อสำเร็จไม่ได้ตั้งค่า Node ให้อัตโนมัติ |
| mysql2 ใน Express | API ใช้ติดต่อ DB ตอนรัน | ต้องตั้ง db-config แยกจาก WebStorm |

`localhost` หมายถึงเครื่องที่โปรแกรมนั้นกำลังรัน ถ้า Node อยู่บนเครื่องตัวเองแต่ DB อยู่ VM ให้ใช้ host ของ VM ตามโจทย์ ไม่ใช้ localhost แล้วหวังว่าจะไป VM ส่วน `127.0.0.1` เป็น loopback IPv4; `localhost` บางเครื่อง resolve เป็น `::1` (IPv6) จึงควรใช้ 127.0.0.1 ให้สม่ำเสมอถ้าระบบฟัง IPv4

ตัวอย่างในคู่มือ: MySQL `127.0.0.1:3306` / Express `127.0.0.1:3000` เป็นคนละพอร์ต ไม่พิมพ์ http:// หน้า host MySQL

### P2.2 เพิ่ม MySQL Data Source

เมนูอาจต่างเล็กน้อยตามรุ่น WebStorm; ขั้นตอนอิง JetBrains MySQL/Data Sources documentation:

1. เปิด View → Tool Windows → Database ถ้าไม่เห็น Database ให้ค้นคำสั่ง Database ผ่าน Search Everywhere/Find Action และตรวจ Database Tools and SQL plugin ว่ามี/เปิดใช้งานในรุ่นนั้นก่อนสอบ
2. ใน Database panel กด **+ → Data Source → MySQL**
3. หน้า General ใส่ Host, Port, User, Password ให้ตรงกับ server MySQL ของคุณ
4. ถ้าฐานมีแล้ว ใส่ Database เช่น `mobile_distributor`; ถ้ายังต้องสร้างฐาน ปล่อยช่อง Database ว่างก่อนเพื่อเชื่อม server
5. ถ้ามี **Download missing driver files** ให้ดาวน์โหลด JDBC driver ในช่วงที่ออนไลน์ได้ mysql2 ที่ npm ลงไว้ใช้แทน JDBC ไม่ได้
6. กด **Test Connection** ต้องได้ Successful/ข้อความเชื่อมต่อสำเร็จ
7. กด Apply/OK แล้วเลือกฐานในแท็บ Schemas หรือ database selector ให้แสดงใน panel
8. กด Refresh/Synchronize หลัง import เพื่อให้เห็นตารางใหม่

**จดค่าที่ตรงกัน:** host/port/user/password/database ใน Data Source ต้องเทียบกับ db-config.js ด้วย อย่าคัดลอก JDBC URL ทั้งก้อนไปใส่ mysql2.host

### P2.3 เลือกกรณี A/B/C ก่อน import

**A — ฐานที่อาจารย์เตรียมมีอยู่แล้ว:** เลือกฐาน → เปิด Query Console แล้วรัน SELECT/SHOW ด้านล่าง ไม่สร้างหรือ reset ซ้ำ

**B — แจกไฟล์ SQL ให้ import:** เปิดไฟล์ดูคำสั่งก่อน โดยเฉพาะ USE, DROP, TRUNCATE; รันกับฐานฝึก/ฐานที่โจทย์ให้ import เท่านั้น เพราะคำสั่งนี้อาจลบข้อมูลเดิม

1. เปิด `.sql` ใน WebStorm เลือก data source/session ที่มุม editor ให้ถูก
2. ถ้าสคริปต์มี CREATE DATABASE + USE อยู่แล้ว รันทั้งไฟล์กับ data source ของ server ที่มีสิทธิ์สร้างฐาน
3. ถ้าไม่มี ให้เลือกฐานเป้าหมายก่อนรัน และสร้างเฉพาะเมื่อโจทย์สั่งตามกรณี C
4. คลิกขวาไฟล์ SQL → Run หรือปุ่ม Run ของ SQL editor เลือก execute ทั้งสคริปต์ ไม่เลือกแค่ statement ที่ caret อยู่โดยไม่ตั้งใจ
5. อ่าน output ว่ามี error กลางทางหรือไม่ แล้ว Refresh → ดู Tables → ตรวจ count

**C — โจทย์สั่งสร้างฐานใหม่:** เปิด Query Console ของ server แล้วรัน (เปลี่ยนชื่อให้ตรงโจทย์):

```sql
CREATE DATABASE IF NOT EXISTS mobile_distributor CHARACTER SET utf8mb4;
USE mobile_distributor;
SELECT DATABASE();
```

จากนั้นใช้ schema SQL ของโจทย์สร้างตาราง อย่าสร้างตารางเองจากชื่อใน response หากมี SQL แจกแล้ว บัญชีที่สร้าง DB ไม่ได้ต้องใช้บัญชี/วิธีที่อาจารย์จัดให้ ไม่แก้ด้วยการสร้างฐานชื่ออื่นแล้วไม่เปลี่ยน config

**ทางสำรองผ่าน MySQL CLI:** เปิด Terminal จาก root:

```powershell
mysql -h 127.0.0.1 -P 3306 -u root -p
```

ใส่รหัสผ่านเมื่อถาม แล้วใน prompt `mysql>` ใช้:

```sql
SOURCE C:/exam/project/database/init-database.sql;
```

เปลี่ยน path ให้ตรงไฟล์จริง ใช้ slash `/` และชื่อ path ที่ไม่มีช่องว่างจะง่ายกว่า คำสั่ง `mysql -u root -p < file.sql` ในใบงานใช้ใน cmd/bash ได้ แต่ **PowerShell ไม่รองรับ `<` แบบนั้น** จึงใช้เข้า mysql แล้ว SOURCE แทน ไม่ต้องใส่ password ต่อท้ายคำสั่ง

### P2.4 ตรวจฐาน/ตาราง/key/ข้อมูล

เปิด Query Console เลือกฐานเป้าหมาย แล้วรันทีละกลุ่ม:

```sql
SHOW DATABASES;
USE mobile_distributor;
SELECT DATABASE();
SHOW TABLES;
DESCRIBE products;
SHOW CREATE TABLE products;
SELECT COUNT(*) AS total FROM products;
SELECT id,name FROM brands ORDER BY id LIMIT 5;
SELECT id,sku,name,brand_id FROM products ORDER BY id LIMIT 5;
```

`SHOW CREATE TABLE` แสดง PK/FK/UNIQUE ชัดกว่าเดาชื่อ ใน seed Week8 เดิมมี 75 products แต่หลังทดสอบเขียน/ลบ total อาจเปลี่ยน จึงอย่าแก้ API ให้ hardcode 75

### P2.5 ถ้าทำแล้วติด

| อาการ | ลองตรวจตามลำดับ | ทำต่อ |
|---|---|---|
| Connection refused/communications link failure | MySQL server เปิดหรือไม่ → host → port → ถ้า remote ตรวจเครือข่ายตามที่จัดให้ | Test Connection ใหม่ |
| Access denied for user | บัญชี/รหัสผ่าน/host grant ของบัญชี; WebStorm กับ Node อาจใช้บัญชีไม่เหมือนกัน | แก้ค่าแล้วทดสอบ ไม่เดารหัส |
| Unknown database | ต่อ server โดยเว้น Database ว่าง ตรวจ SHOW DATABASES และ import ตามโจทย์ | เลือกฐานแล้ว Refresh |
| No database selected | Console ไม่ได้เลือก default schema หรือไม่มี USE | รัน USE แล้ว SELECT DATABASE() |
| ต่อได้แต่ไม่เห็น Tables | Schemas ไม่ได้เลือก/ยังไม่ Refresh หรือสร้างตารางอีกฐาน | SHOW TABLES ในฐานที่เลือก |
| Driver not found/download failed | JDBC driver ยังไม่พร้อม; เตรียมตอนออนไลน์ | ถ้ามี local driver ตามที่อาจารย์ให้ ใช้ Driver files; หรือ CLI สำรอง |
| mysql command not recognized | CLI ไม่อยู่ PATH ไม่ได้แปลว่า MySQL server ไม่มี | ใช้ WebStorm หรือ executable path ที่ติดตั้งจริง |
| ตารางขึ้นครึ่งเดียว | import หยุดที่ error กลางสคริปต์ | อ่าน statement แรกที่พัง แก้สิทธิ์/ลำดับ FK แล้วรันตามแผน import ของโจทย์ |

**ผ่านเมื่อ:** Test Connection สำเร็จ, SELECT DATABASE() ถูก, เห็น columns/PK/FK และอ่านข้อมูลจริงได้

---
<a id="p3"></a>
## Phase 3 — ตั้งค่าโครงหลักและพิสูจน์ว่า Node ต่อ DB ได้

### P3.1 exam-config.js

**ไฟล์:** `src/configs-$id/exam-config.js`  
**หน้าที่:** รวม identity, API port/base path และตัวเลือกของชุดหลัก  
**การวาง:** สร้างไฟล์ใหม่ วางทั้งหมด  
**ต้องแก้:** STUDENT, PORT, HOST และ POLICY เฉพาะที่โจทย์ต่าง  
**ใช้เดิมได้:** ชื่อ export และโครง object  
**แก้แล้วตามไปดู:** URL ใน Postman, runner port, expected response; ถ้าเปลี่ยน API port ไม่เปลี่ยน DB port ตาม

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

ตัวหลักเลือก partial PUT ให้เข้ากับ request ของ runner Week8; invalid query=400, max limit=100, defaults ของ optional fields และ unknown-field rejection เป็นนโยบายที่คู่มือกำหนด ต้องเทียบโจทย์ ไม่อ้างว่าอาจารย์บังคับเหมือนกันทุกข้อ

### P3.2 db-config.js

**ไฟล์:** `src/configs-$id/db-config.js`  
**หน้าที่:** สร้าง pool ให้ Repository ใช้ร่วมกัน  
**การวาง:** แทนทั้งไฟล์เดิม  
**ต้องแก้:** host/port/user/password/database 5 จุด  
**ใช้เดิมได้:** import/export/createPool เมื่อยังใช้ mysql2 ESM  
**เกี่ยวข้อง:** Repository ทุกตัว import default db; WebStorm connection ต้องชี้ server/ฐานเดียวกัน

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

อย่า console.log config ทั้งก้อนเพราะมีรหัสผ่าน ก่อน push GitHub ให้ใช้ placeholder ในเอกสาร/โค้ดสาธารณะ เก็บค่าจริงไว้ในเครื่องตามวิธีที่ผู้สอนอนุญาต โครงนี้ตั้งค่าโดยตรงเพื่อใกล้ template ไม่บังคับเพิ่ม dotenv

### P3.3 test-db.js — ทดสอบก่อนแตะ HTTP

**ไฟล์:** `src/test-db.js`  
**การวาง:** สร้างทั้งไฟล์ อ่านอย่างเดียว ไม่ import/reset SQL อัตโนมัติ  
**ต้องแก้:** ชื่อตาราง products ถ้าเปลี่ยน resource  
**วิธีตรวจ:** Terminal root → `node src/test-db.js`

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

ผลควรมี databaseName ถูก, ok=1, รายชื่อตาราง และ total เป็นจำนวนจริง แล้ว process จบ ถ้า connection ผ่านแต่ SELECT products พัง แปลว่าชั้นการเชื่อมต่อใช้ได้แต่ schema/table ยังไม่ตรง

### P3.4 ถ้าทำแล้วติด

| ข้อความตัวอย่าง | ลองดู/แก้ | กลับไป |
|---|---|---|
| ECONNREFUSED 127.0.0.1:3306 | server MySQL ไม่ฟังที่ค่านี้; อย่าสับกับ port3000 | P2.2/P2.5 |
| ECONNREFUSED ::1:3306 | localhost resolve IPv6 แต่ server ฟัง IPv4; ใช้ 127.0.0.1 ถ้าเป็น DB ในเครื่องจริง | db-config host |
| ER_ACCESS_DENIED_ERROR | user/password/สิทธิ์ host ไม่ถูก; เทียบ WebStorm ที่ต่อได้ | db-config 3 ค่าและ P2 |
| ER_BAD_DB_ERROR | ชื่อฐานผิด/ยังไม่สร้าง | P2.3 |
| ER_NO_SUCH_TABLE | ต่อได้ แต่ฐานผิดหรือ import ไม่ครบ | SELECT DATABASE(), SHOW TABLES |
| ENOTFOUND / getaddrinfo | host สะกดผิด หรือชื่อ container ใช้นอก network นั้น | แก้ host ตามสภาพจริง |
| script ค้างหลัง SELECT | ลืม db.end() ในสคริปต์ทดสอบ; API ปกติเปิด pool ค้างไว้ได้ | finally ใน test-db |

**ผ่านเมื่อ:** test-db อ่านข้อมูลได้ก่อนขึ้น P4

---
<a id="p4"></a>
## Phase 4 — ส่วนร่วม Error, Pagination, Response และ DTO

### P4.1 Error handler

**ไฟล์:** `src/middlewares-$id/error-handler.js`  
**หน้าที่:** แปลง error เป็น JSON กลางจุดเดียว  
**การวาง:** สร้าง/แทนทั้งไฟล์; P7 จะ mount หลัง routes  
**ต้องแก้:** ชื่อ code/message และ envelope ตามโจทย์  
**ใช้เดิมได้:** โครง AppError + handler สี่พารามิเตอร์  
**แก้แล้วตามไปดู:** Service ที่ throw และ POLICY.successStyle/includeTimestamp; AppError ชุดนี้ใช้ statusCode/errorCode อย่าผสม err.status กับคนละ class

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

การเขียน `throw new AppError('Product not found',404,'PRODUCT_NOT_FOUND')` สื่อว่า HTTP404 และ code PRODUCT_NOT_FOUND ส่วน MySQL error เช่น 1062 จะมาใน err.code ชนิด string (`ER_DUP_ENTRY`) แล้ว handler แปลง ไม่ต้องเอา 1062 ไปใช้ res.status

### P4.2 Pagination middleware

**ไฟล์:** `src/middlewares-$id/pagination-middleware.js`  
**หน้าที่:** แปลง query string เป็น page/limit/offset ตัวเลข  
**การวาง:** แทนทั้งไฟล์  
**ต้องแก้:** นโยบายใน POLICY หากโจทย์ต่าง  
**ใช้เดิมได้:** สูตร offset หลัง normalize  
**เกี่ยวข้อง:** route ต้องใช้ `queryParser()` ก่อน handler; Service ส่ง pagination ต่อ; Repository LIMIT/OFFSET; helper ใช้ค่าเดียวกัน

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

ตัวอย่าง page2 limit10 → offset10; limit500 ถูก cap100 → page2 offset100 ไม่ใช่500 ตัวหลักปฏิเสธ page0, abc, 1.5, query ซ้ำที่เป็น array ด้วย400 ไม่ parseInt('2abc') ให้เป็น2เงียบ ๆ

### P4.3 Response helper

**ไฟล์:** `src/mappers-$id/api-response.js`  
**หน้าที่:** สร้าง envelope และ pagination metadata  
**การวาง:** แทนทั้งไฟล์ ใช้ route/service ชุดนี้ร่วมกัน  
**ต้องแก้:** ชื่อ key ถ้าโจทย์ต่าง เช่น totalItems/hasPreviousPage  
**ใช้เดิมได้:** สูตร totalPages/flags เมื่อ page เริ่ม1  
**เกี่ยวข้อง:** Service คืน `{items,total}` แยกกัน ไม่แปะ totalItems เป็น property บน array แบบ template เดิม ดังนั้นห้ามเปลี่ยน helper ตัวเดียวแล้วคง service เก่า

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

ต้องส่ง `apiResponse(res, data, null, 201)` ไม่ใช่ `apiResponse(res,data,201)` เพราะอาร์กิวเมนต์ที่3เป็น pagination ถ้า pagination มีแต่ total ไม่ส่ง จะได้ NaN/null ใน metadata

### P4.4 DTO mapper

**ไฟล์:** `src/mappers-$id/entity-dto-mapper.js`  
**หน้าที่:** แปลง DB/SQL alias เป็น JSON ที่โจทย์ต้องการ  
**การวาง:** แทนทั้งไฟล์  
**ต้องแก้:** ชื่อ key ซ้ายและแหล่งข้อมูลขวาตาม mapping sheet  
**ใช้เดิมได้:** map/maps และ summary/full selection ถ้ายังใช้สอง view  
**เกี่ยวข้อง:** ถ้าต้องเพิ่ม brandName ต้องมี JOIN alias ใน Repository; ตรวจ not found ก่อนเรียก mapper

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

| รับใน body หลัก | DB/SQL source | Response |
|---|---|---|
| brand_id | p.brand_id | brandId |
| ไม่มีใน body | b.name AS brand_name | brandName |
| ram_gb | ram_gb | ramGb |
| storage_gb | storage_gb | storageGb |
| stock_quantity | stock_quantity | stockQuantity |
| release_date | release_date | releaseDate |

DATE ใช้ dateStrings เพื่อไม่เลื่อนวันโดยการแปลง UTC ส่วน created_at ของ brands เป็น TIMESTAMP ให้เทียบ timezone/session หากเวลาต่างจากตัวอย่าง ไม่ hardcodeวันที่ใน response

### P4.5 ถ้าทำแล้วติด

| อาการ | จุดตรวจ | วิธีแก้และตรวจซ้ำ |
|---|---|---|
| JSON ไม่มี brandId | mapper อ่าน entity.brandId แต่ SQL มี brand_id | แก้ขวาเป็น entity.brand_id แล้ว GET |
| brandName หาย | ไม่มี JOIN หรือ alias ไม่ตรง | P5 เพิ่ม b.name AS brand_name |
| Cannot read properties of null | map ก่อนตรวจ not found | P6 existing() ต้อง throw404 ก่อน mapper |
| data.map is not a function | เอา object/ผล mysql2 ทั้งก้อนเข้า maps | repo ต้องคืน rows; Service จึง mapper.maps(rows) |
| metadata เป็น null/NaN | total หายหรือ limit ไม่ใช่เลข | ตรวจ Service countAll → route → helper รวม5อาร์กิวเมนต์ |
| หน้าแรกผิดตำแหน่ง | offset ไม่ถูก หรือ limit หลัง cap ไม่ตรง | ใช้ middleware ชุดนี้และ ORDER BY |
| error เป็น HTML | handler ไม่ได้ mount หลัง route/JSON parser หรือเปิด server คนละตัว | P7 app.use(errorHandler) ท้ายสุด |
| ส่ง response แล้ว headers already sent | ตอบซ้ำ/ไม่ return | return res... และอย่า next() หลังตอบ |

**ผ่านเมื่อ:** ไฟล์ส่วนร่วมครบ; ทดสอบจริงหลัง P7 ด้วย GET view/pagination และ body ผิด

---
<a id="p5"></a>
## Phase 5 — Repository: SQL ต้องตรง schema จริง

### P5.1 products repository

**ไฟล์:** `src/repositories-$id/repository.js`  
**หน้าที่:** ทำ SELECT/COUNT/INSERT/UPDATE/DELETE กับ MySQL  
**การวาง:** แทนทั้งไฟล์  
**ต้องแก้:** table/column/PK/FK/JOIN ตาม SQL; โครงหลักใช้ products.id auto increment  
**ใช้เดิมได้:** mysql2.query, binding ?, การอ่าน rows/result  
**เกี่ยวข้อง:** ถ้าเปลี่ยนฟิลด์ต้องตาม Service allowlist/validation และ mapper; ถ้าเปลี่ยน key ใช้ KEY-S/KEY-C ทั้งชุด

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

อ่านผลให้ถูก: SELECT → `[rows, fields]`; rows เป็น array จึงใช้ rows[0] สำหรับหนึ่งแถว INSERT/UPDATE/DELETE → `[result, fields]`; result มี insertId/affectedRows การ UPDATE ด้วยค่าเดิมอาจ changedRows=0 แต่ยังเป็นข้อมูลที่มีจริง

ไม่ใช้ `.execute('INSERT ... SET ?', [object])` แทน query โดยตรง เพราะ object formatting ของ SET ? เป็นความสามารถของ query ไม่ใช่ SQL prepared statement รูปแบบ object ของ execute

### P5.2 brands repository

**ไฟล์:** `src/repositories-$id/brand-repo.js`  
**การวาง:** สร้างทั้งไฟล์ เป็นตัวอย่าง resource เพิ่มที่มีสอง Read  
**ต้องแก้:** ชื่อ resource/fields หากโจทย์ใช้ตารางอื่น  
**ใช้เดิมได้:** list/detail SELECT + binding  
**เกี่ยวข้อง:** brand-service และ brand-route ใน P6/P7

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

### P5.3 ถ้าทำแล้วติด

| ข้อความ/อาการ | เริ่มตรวจ | แก้อย่างไร |
|---|---|---|
| ER_BAD_FIELD_ERROR Unknown column 'brandId' | SHOW CREATE TABLE และ data ก่อนส่ง SQL | column จริงเป็น brand_id → แปลง body ใน Service ไม่เปลี่ยน DB มั่ว |
| ER_PARSE_ERROR | SQL syntax/comma/backtick/จำนวน ? | ทดลอง SELECT ใน WebStorm; ค่า ? ให้แทนด้วยค่าทดสอบเมื่อรันตรง SQL console |
| ER_NO_DEFAULT_FOR_FIELD | INSERT ไม่ส่ง required field ที่ไม่มี default | P0 required sheet → P6 prepareInput → Postman body |
| ER_BAD_NULL_ERROR | ส่ง null ไป NOT NULL | validation ต้องแยก null จาก missing |
| ER_DUP_ENTRY | unique/PK ซ้ำ | ถ้าทดสอบ duplicate ควรได้409; ถ้าทำ happy path ใช้ SKU ใหม่ |
| ER_NO_REFERENCED_ROW_2 | brand_id ไม่มีจริง | GET brands เลือก id ที่มีจริง; จัดการ400ตามตัวอย่าง |
| UPDATE/DELETE ผิดแถว | WHERE ผิด/ขาดส่วน composite key | หยุดเขียน ตรวจ SQL + URL +ค่าที่ bind ก่อนยิงซ้ำ |
| list กับ total ไม่สัมพันธ์ | filter หรือ JOIN ต่างกัน | ให้ SELECT และ COUNT ใช้ชุด WHERE เดียวกัน ดู FILTER |

**ผ่านเมื่อ:** SQL ไม่มี placeholder ชื่อ `table-name/primaryKey` ค้าง, selected aliases ตรง mapper; P8 จะทดสอบผ่าน Service

---
<a id="p6"></a>
## Phase 6 — Service: ตรวจ input, DTO, not found และ business rules

### P6.1 service.js

**ไฟล์:** `src/services-$id/service.js`  
**หน้าที่:** เลือก fields ที่เขียนได้ ตรวจชนิด/เงื่อนไข เรียก Repository และ Mapper  
**การวาง:** แทนทั้งไฟล์  
**ต้องแก้:** required/optional/default/max length/min/max/type/error code ตามโจทย์  
**ใช้เดิมได้:** ลำดับ CRUD และการตรวจ existing เมื่อ schema เดิม  
**เกี่ยวข้อง:** เปลี่ยน body → SQL object ต้องใช้ชื่อ column; เปลี่ยน DTO → mapper; key type → parseId และ route

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

**อ่าน validation ตัวหลักก่อนใช้:** price >=0, integer สเปก >=0, category/status เป็นข้อความไม่ว่าง ยังไม่ได้บังคับ ENUM เพราะ SQL Week8 เป็น VARCHAR หากโจทย์กำหนดราคา >0, allowed values หรือฟิลด์เพิ่ม ต้องปรับเงื่อนไขและตัวอย่าง Postman ตามนั้น

| ค่าใน PUT partial | ความหมายของโครงนี้ |
|---|---|
| ไม่ส่ง stock_quantity | ไม่แก้ stock เดิม |
| stock_quantity:0 | แก้เป็น0 ได้ ไม่ถือว่าขาด |
| release_date:null | ล้างวันที่เป็น null |
| release_date:"" | ไม่ใช่วันที่ที่ถูก →400 |
| body:{} | ไม่มีฟิลด์ให้แก้ →400 |
| id ใน body | unknown field →400; ID มาจาก URL |

Create และ PUT full ต้องมี REQUIRED ครบ; optional ที่ไม่ได้ส่งจะได้ stock0/statusAVAILABLE/date null ตามตัวอย่างนี้ ถ้าโจทย์บังคับทุกฟิลด์ ให้เพิ่มเข้า REQUIRED และเปลี่ยน defaults ให้ตรง

### P6.2 brand-service.js

**ไฟล์:** `src/services-$id/brand-service.js`  
**การวาง:** สร้างทั้งไฟล์; ไม่ส่ง brands เข้า ProductMapper  
**ต้องแก้:** error code ของ resource หากโจทย์ต่าง

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

### P6.3 ถ้าทำแล้วติด

| อาการ | ลองดู | วิธีทำต่อ |
|---|---|---|
| PUT ส่ง3ฟิลด์แล้ว Missing field: sku | POLICY เป็น full แต่ request เป็น partial | ตรวจโจทย์ แล้วเลือก PUT-FULL หรือ partial ให้ตรง อย่าลบ validation ทั้งก้อน |
| price ต้องเป็น number แต่ส่ง "29900" | raw JSON ใส่ quote รอบเลข | เปลี่ยนเป็น29900 โดยไม่ quote แล้วยิงเดิม |
| officeCode=NA ได้ INVALID_ID | ใช้ numeric parseId กับ string key | ใช้ KEY-S ที่เปลี่ยนทั้ง route/service/repo |
| SKU เดิมของสินค้าเดิมยัง409 | uniqueness check ไม่ยกเว้น ID ตัวเอง | เทียบ other.id กับ id ก่อน throw ตามโครง |
| FK ผิดแล้วบางฟิลด์เปลี่ยนแล้ว | โค้ดเขียนหลาย query ก่อนตรวจครบ | validate ก่อน mutation; งานหลาย write อาจต้อง transaction ไม่แก้ด้วยการตอบ400เฉย ๆ |
| list มีข้อมูลแต่ DTO ไม่ตรง | service ใช้ mapper/shape คนละชุด | ทดสอบ test-service แล้วเทียบ rows กับ map |

**ผ่านเมื่อ:** validate ก่อนเขียน, not found ไม่เข้า mapper, update เดิมซ้ำได้, no raw req.body ลงSQLโดยข้าม allowlist

### P6.4 ตามโค้ดทีละข้อ — ไม่ต้องเดาว่าแต่ละฟังก์ชันไปไหน

| งาน | เริ่มที่Route | Serviceทำอะไร | Repositoryทำอะไร | หลังทำต้องตรวจ |
|---|---|---|---|---|
| Cเพิ่มสินค้า | POST '/' ส่งreq.body | createObject→prepareInput→findBySku | INSERT→insertId→SELECTJOINกลับ |201,data.id,GETพบจริง |
| R1อ่านแบรนด์ | GETbrands '/' | brand-service.getAllObjects | SELECTbrandsORDERBYid |200,arrayfieldตรงโจทย์ |
| R2อ่านสินค้าหน้า | GETproducts '/' + queryParser() | getAllObjects→mapper.maps | SELECTLIMIT/OFFSET + COUNT |200,summaryและmetadata |
| R3อ่านรายตัว | GETproducts '/:id' →parseId | getObject→existing→mapper.map | SELECTWHEREp.id=?JOINbrand |200detail/404ถ้าไม่มี |
| Uแก้สินค้า | PUT '/:id' ส่งidและbody | existing→prepareInputตามmode→uniquecheck | UPDATEWHEREid→SELECTกลับ |200,GETเห็นค่าใหม่,IDไม่เปลี่ยน |
| Dลบสินค้า | DELETE '/:id' | existing→remove | DELETEWHEREid=? |204ว่าง,GET404 |

**วิธีแก้ตามโจทย์โดยไม่เขียนใหม่ทั้งชุด:**

- ถ้าโจทย์เปลี่ยนเฉพาะข้อความerror: แก้AppErrorที่ServiceหรือMySQLmappingในhandler ไม่เปลี่ยนSQLตามไปด้วย
- ถ้าเพิ่มฟิลด์bodyที่ต้องบันทึก: เพิ่มINPUT_FIELDS+validation/REQUIREDตามสเปก ตรวจcolumnจริง แล้วเพิ่มDTOเฉพาะถ้าต้องส่งกลับด้วย
- ถ้าเพิ่มฟิลด์responseที่คำนวณได้: เพิ่มMapper ไม่ต้องเพิ่มbodyหรือcolumnใหม่โดยไม่จำเป็น
- ถ้าPOSTให้คืนเฉพาะid: ในPOSTrouteใช้ `{id:data.id}` แทนdataสำหรับapiResponse;GETdetailยังใช้DTOเดิมได้
- ถ้าUpdateให้คืนข้อความอย่างเดียว: หลังawaitservice.updateObjectแล้วตอบhelperด้วยmessageตามโจทย์;ยังต้องGETตรวจว่าข้อมูลแก้จริง
- ถ้าตัดReadbrands/:idออกเพราะโจทย์ไม่ต้องการ: ลบrouteGETรายตัวนั้นได้ แต่brand-service/repofindOneอาจยังต้องใช้ถ้าเพิ่มFKprecheck อย่าลบhelperตามกันโดยไม่ตรวจcallers

**ตัวอย่างเพิ่มฟิลด์booleanเมื่อโจทย์ใหม่มีcolumn active:** เพิ่ม`active`เข้าINPUT_FIELDS แล้วในprepareInputเพิ่มbranchก่อนelseจำนวนเต็ม:

```js
// ไฟล์: src/services-$id/service.js — ตัวอย่าง branch ภายใน loop ของ prepareInput
// ใช้เมื่อ schema มี active จริง;เพิ่ม INPUT_FIELDS/REQUIRED/default/DTOตามโจทย์ด้วย
// แทรกเป็น else if ก่อน else ที่ตรวจ integer ไม่วางเป็นฟังก์ชันใหม่เดี่ยว ๆ
else if (key === 'active') {
  if (typeof value !== 'boolean') invalid('active must be true or false');
}
```

อย่าใส่`if(!body.active)`เพราะfalseเป็นค่าที่ถูก ถ้าDBคืน0/1และresponseต้องbooleanให้mapperใช้ `active: Boolean(entity.active)` โดยตรวจdriverคืนชนิดอะไรจริงก่อน

---
<a id="p7"></a>
## Phase 7 — Route, App และ Server: ต่อทุกส่วนให้รับ HTTP

### P7.1 products route

**ไฟล์:** `src/routes-$id/route.js`  
**หน้าที่:** รับ params/query/body เรียก Service และตอบ HTTP  
**การวาง:** แทนทั้งไฟล์  
**ต้องแก้:** path/param/status ตามโจทย์  
**ใช้เดิมได้:** Router + async/await ใน Express5  
**เกี่ยวข้อง:** app mount `/api/ID/products` แล้ว route ใช้ `/` และ `/:id`; helper ต้องมี signature ชุดนี้

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

GET ไม่ต้อง body; query อยู่หลัง ?; `:id` เป็น placeholder ในโค้ด route แต่ URL ใน Postman ต้องแทนด้วยค่าจริง เช่น /products/1 ไม่พิมพ์ :id ไปตรง ๆ

### P7.2 brands route

**ไฟล์:** `src/routes-$id/brand-route.js`  
**การวาง:** สร้างทั้งไฟล์  
**ต้องแก้:** ชื่อ resource และ parser ถ้า key ต่างจากเลข  
**เกี่ยวข้อง:** import brand-service; app ต้อง mount

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

### P7.3 app.js

**ไฟล์:** `src/app.js`  
**หน้าที่:** ประกอบ middleware และ routers ไม่เปิด port ในไฟล์นี้  
**การวาง:** แทนทั้งไฟล์เดิม จึงเอา app.listen เดิมออก ไม่เปิดซ้ำสองไฟล์  
**ต้องแก้:** mounts/identity ตามโจทย์; STUDENT อยู่ exam-config  
**ใช้เดิมได้:** express.json ก่อน routes และ errorHandler หลัง routes  
**เกี่ยวข้อง:** ต้องสร้าง server.js และ scripts.start ให้ตรง

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

### P7.4 server.js

**ไฟล์:** `src/server.js`  
**การวาง:** สร้างทั้งไฟล์  
**หน้าที่:** ทดสอบ DB แล้วเปิด HTTP port  
**ต้องแก้:** HOST/PORT ใน exam-config ไม่แก้ listen หลายจุด  
**ใช้เดิมได้:** startup/error/shutdown โครงนี้

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

### P7.5 ถ้าทำแล้วติด

| อาการ | จุดตรวจ | แก้และลองใหม่ |
|---|---|---|
| npm start จบเงียบ ๆ ไม่มี server | start ชี้ app.js ที่ export อย่างเดียว | ชี้ server.js หรือเลือก ENTRY-A |
| EADDRINUSE port3000 | มี server เก่าเปิดอีก Terminal/โปรแกรมอื่นใช้ | Ctrl+C server ของโปรเจกต์ตัวเอง อย่าฆ่า process ไม่รู้จัก; ถ้าโจทย์อนุญาตเปลี่ยน port ต้องแก้ URL/runnerด้วย |
| app.listen สองจุด | app เก่ายังมี listen และ server ใหม่ listenอีก | เลือกโครง entrypoint เพียงแบบเดียว |
| GET /products ได้ ENDPOINT_NOT_FOUND | ลืม base path/รหัส หรือ mount ไม่ตรง | ดู API ready URL และ app.use |
| URL กลายเป็น /products/products | ใส่ resource ทั้ง app mount และ route | route ใช้ /; app ถือ prefix |
| req.body undefined | JSON parser หลัง routes หรือ Postman ไม่ได้ส่ง JSON | app.use(express.json()) ก่อน routes; P9 Body raw JSON |
| async error ไม่เข้า handler | เป็น Express4 หรือ promise ไม่ถูก await/return | ตรวจ npm ls express; ใช้ EX4 ถ้าจำเป็น ไม่อัปเกรดมั่วระหว่างสอบ |

**ผ่านเมื่อ:** ไฟล์ครบ จึงเริ่มรันทดสอบ P8

---
<a id="p8"></a>
## Phase 8 — ตรวจเป็นชั้น ก่อนยิงทุกข้อ

### P8.1 ตรวจ syntax

Terminal root:

```powershell
node --check src/app.js
node --check src/server.js
```

ตรวจทุก .js ใน src แบบ PowerShell (รวม path ที่มี $id โดยไม่ขยายเป็นตัวแปร):

```powershell
Get-ChildItem -LiteralPath src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

ไม่มี output จาก --check = syntax ผ่าน แต่ยังไม่ได้ตรวจ import/SQL/runtime

### P8.2 ทดสอบ Service แบบอ่านอย่างเดียว

**ไฟล์:** `src/test-service.js`  
**การวาง:** แทนทั้งไฟล์เก่า เพื่อไม่หลงเรียก removeObject ในตัวอย่างเก่า  
**ต้องแก้:** ถ้าเปลี่ยน resource ให้ตาม import และ response shape  
**ใช้เดิมได้:** ทดสอบ list/detail จาก DB โดยไม่ผ่าน HTTP

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

รันตามลำดับ:

```powershell
node src/test-db.js
node src/test-service.js
npm.cmd start
```

สองคำสั่งแรกต้องจบเอง; start ต้องเปิดค้างและเห็น API ready URL ถ้าฐานว่าง test-service list=[] ได้ ไม่ใช่ connection fail

### P8.3 ตรวจ HTTP ขั้นแรก

เปิด Postman GET `http://127.0.0.1:3000/` →200 API is running (ยืนยัน HTTP)

จากนั้น GET `http://127.0.0.1:3000/api/YOUR_STUDENT_ID/brands` →200 data array (ยืนยัน HTTP→DB)

ถ้าเปลี่ยน STUDENT/PORT ให้แทนใน URL ด้วย ปุ่ม Run ของ WebStorm ต้องใช้ Node interpreter และ working directory project root เดียวกับ Terminal ไม่เปิด entrypoint เก่าควบคู่ ถ้ารันผ่าน Terminal ได้แต่ Run ไม่ได้ให้ตรวจ Run Configuration ไม่แก้ source โดยเดา

### P8.4 ถ้าทำแล้วติด

- **DB test ไม่ผ่าน:** กลับ P3 ยังไม่ต้องแก้ route
- **DB ผ่านแต่ Service พัง:** ตรวจ P5 SQL/alias และ P6 mapper/input ตาม error แรก
- **Service ผ่านแต่ HTTP404:** ตรวจ P7 mounts/URL/method ไม่เริ่มแก้ DB
- **HTTP200 แต่ data ผิด:** ตรวจ P4 DTO/helper และ P6 response shape
- **Postman Could not send request / ECONNREFUSED:** ยังไม่มี HTTP response จึงไม่ใช่ HTTP500; ตรวจ server เปิดค้างอยู่หรือไม่ host/portตรงหรือไม่
- **แก้แล้วผลไม่เปลี่ยน:** Ctrl+C → start ใหม่ (โครงนี้ไม่มี nodemon), ตรวจว่าบันทึกไฟล์และเปิดโปรเจกต์เดียวกัน

**ผ่านเมื่อ:** ทดสอบ DB และ Service ได้ เปิด server ได้ และ GET brands ผ่าน จากนั้นเก็บ checkpoint โค้ดชุดที่ทำงานได้ก่อนเปลี่ยนตัวเลือกใหญ่

---
<a id="p9"></a>
## Phase 9 — Postman: ตั้งค่า ยิง CRUD และตรวจข้อมูลจริง

### P9.1 เตรียม Postman Desktop ให้ใช้งานออฟไลน์

ก่อนสอบลองเปิด Postman Desktop และส่ง localhost request ในสภาพไม่มีอินเทอร์เน็ตตามโหมดที่ติดตั้งไว้ อย่าให้วันสอบเพิ่งติด login/update ใช้ client อื่นได้เฉพาะเมื่อกติกาอนุญาต ในคู่มือนี้ใช้ Send ธรรมดา ไม่ต้องพึ่ง cloud sync

สร้าง Collection เช่น INT161-Practice เพิ่ม variables (ถ้าไม่ใช้ variables ให้ใส่ URL เต็มตามตัวอย่างแทน):

| ชื่อ | ค่าเริ่มต้นตัวอย่าง | เปลี่ยนเมื่อ |
|---|---|---|
| baseUrl | http://127.0.0.1:3000/api/YOUR_STUDENT_ID | เปลี่ยน host/port/รหัส |
| productId | ว่างก่อน | คัดลอก data.id หลัง POST |
| missingId | ว่างก่อน | เลือกเลขบวกที่ GET แล้ว404 จริง |

ตัวอย่าง URL ใช้ `{{baseUrl}}/products/{{productId}}`; variables ต้องตั้งใน collection/environment ที่กำลังเลือกใช้งาน ถ้าแทนค่าไม่สำเร็จ ใช้ URL เต็มก่อนลดปัญหา

**ทุก POST/PUT:** Body → raw → dropdown JSON; Headers ต้องมี Content-Type: application/json (Postman มักเติมให้เมื่อเลือก JSON) ใช้ Auth: No Auth ถ้าโจทย์ไม่มี auth ตรวจว่าไม่มี Authorization เก่าที่ inherit จาก collection

**ทุก GET/DELETE ในตัวอย่างนี้:** Body → none; GET pagination/filter ใส่ใน Params tab หรือ URL อย่างใดอย่างหนึ่ง ไม่ซ้ำสองที่และอย่าเปิด parameter เก่าค้างไว้

### P9.2 ลำดับ happy path พร้อม request ที่ใช้จริง

#### TEST-01 Identity (ถ้าโจทย์ต้องการ)

GET `{{baseUrl}}/student-info` →200; data.studentId/name/secretKey ตรงใบงาน ไม่ใช่ของบุคคลตัวอย่าง timestamp เป็นเวลาปัจจุบัน หากยังเห็น YOUR_NAME/KEY_FROM_SPEC ให้กลับ P3 แก้แล้ว restart

#### TEST-02 Brands list/detail

GET `{{baseUrl}}/brands` →200 data array เลือกแบรนด์ที่มีจริง เช่น id1 หาก seed ตรงตัวอย่าง

GET `{{baseUrl}}/brands/1` →200 object ของแบรนด์นั้น อย่าเอา [] ทั้ง list มาตอบ detail

GET `{{baseUrl}}/brands/999999` →ตรวจว่ามีจริงหรือไม่ ถ้าไม่พบควร404 BRAND_NOT_FOUND ถ้าบังเอิญมีให้เปลี่ยนเลข แล้วจด missingId สำหรับ resource ที่เกี่ยวข้อง

#### TEST-03 Products list + pagination

GET `{{baseUrl}}/products?page=1&limit=10` →200; data เป็น array ไม่เกิน10; summary มี7ฟิลด์: id,sku,name,brandId,category,price,status

GET `{{baseUrl}}/products?page=2&limit=10` →แถวถัดไปตาม ORDER BY; total เดิมถ้าไม่มีการเขียนข้อมูล; totalPages=Math.ceil(total/10)

GET `{{baseUrl}}/products?page=999999&limit=10` →data=[] แต่ total ยังเป็นจำนวนจริง ไม่ใช้ data.length เป็น total

GET `{{baseUrl}}/products?page=1&limit=5&view=full` →ถ้าโจทย์อนุญาต view ให้ตรวจ detail fields เพิ่ม

`price` ต้องเป็น JSON number หากโจทย์ต้องการ number; ตรวจ ram/color ไม่หลุดมาใน summary; total0 ต้องยังส่ง metadataครบ ไม่ใช้ if(total) จน0หาย

#### TEST-04 Create

POST `{{baseUrl}}/products` → Body raw JSON วาง:

```json
{
  "sku": "EXAM-PRACTICE-001",
  "name": "Practice Phone",
  "brand_id": 1,
  "category": "FLAGSHIP",
  "price": 29900,
  "ram_gb": 8,
  "storage_gb": 256,
  "color": "Black",
  "stock_quantity": 10,
  "status": "AVAILABLE",
  "release_date": "2026-01-01"
}
```

**ต้องเปลี่ยน:** brand_id เป็นแบรนด์ที่ GET พบ; sku ต้องไม่เคยใช้สำหรับ happy path; วันที่ใช้ค่าที่ตรงเงื่อนไขโจทย์ ไม่ต้องส่ง id/brandName/created_at

**คาดหวัง:**201, success:true, data เป็น full DTO พร้อม idที่ DB สร้าง (โครงนี้คืน full DTO; ถ้าข้อสอบให้รูปอื่นให้ปรับ helper/routeตามนั้น)

**ทำต่อทันที:** คัดลอก data.id ไปตั้ง productId → GET `{{baseUrl}}/products/{{productId}}` →ต้องพบข้อมูลจริงและ brandName จากแบรนด์ที่เลือก → WebStorm SELECT ดูแถวนั้นเพื่อยืนยัน DB

```sql
SELECT * FROM products WHERE sku = 'EXAM-PRACTICE-001';
```

#### TEST-05 PUT partial — โครงหลัก

PUT `{{baseUrl}}/products/{{productId}}` → Body raw JSON:

```json
{
  "name": "Practice Phone Updated",
  "price": 27900,
  "stock_quantity": 20
}
```

**ต้องเปลี่ยน:** URL ใช้ idที่เพิ่งสร้าง ไม่ใช่ SKU และไม่พิมพ์ :id; POLICY.updateMode ต้องเป็น partial

**คาดหวัง:**200 → GET idเดิมอีกครั้ง ชื่อ/ราคา/stockเปลี่ยน sku/brand/ram/color/dateยังเดิม จำนวนสินค้าไม่เพิ่ม จากนั้นส่ง PUT เดิมอีกครั้งต้องสำเร็จและข้อมูลเดิม ไม่404เพียงเพราะ changedRows0

#### TEST-06 PUT full — ใช้เมื่อโจทย์กำหนด

เลือก [PUT-FULL](#put-full) ก่อน แล้ว PUT URL เดิมด้วย body ครบ:

```json
{
  "sku": "EXAM-PRACTICE-001",
  "name": "Practice Phone Full Update",
  "brand_id": 1,
  "category": "MID_RANGE",
  "price": 25900,
  "ram_gb": 12,
  "storage_gb": 512,
  "color": "Blue",
  "stock_quantity": 0,
  "status": "AVAILABLE",
  "release_date": null
}
```

sku เดิมของแถวตัวเองต้องใช้ได้; ถ้าคุณสร้างด้วย SKU อื่นให้แทนค่านี้; brand_idต้องมีจริง stock0/date null เป็นการตั้งใจเปลี่ยน ไม่ใช่ฟิลด์หาย

GET ตรวจทุกฟิลด์หลังแก้ โดยเฉพาะค่า0และnull หากโจทย์ให้ PUT เปลี่ยนเฉพาะ name/price ไม่ต้องเปิด full mode แค่ใช้ TEST-05

#### TEST-07 Delete

DELETE `{{baseUrl}}/products/{{productId}}` → Body none →204 และพื้นที่ response body ว่างจริง ไม่ใช่ `{}` หรือข้อความ

GET idเดิม →404 PRODUCT_NOT_FOUND; WebStorm SELECT idนั้นต้องไม่พบ; DELETE ซ้ำ →404ในโครงนี้ ถ้าโจทย์กำหนดแบบอื่นให้ปรับ ไม่ตีความ idempotent ว่าต้อง statusเหมือนกันทุกครั้ง

ถ้าโจทย์สั่ง200+message เลือก POLICY.deleteStatus=200 แล้วตรวจ JSON ตามโจทย์ ไม่ใช้ helperส่ง bodyกับ204

### P9.3 ชุดทดสอบ error — เปลี่ยนทีละจุดจาก body ที่ถูก

สร้างสินค้าใหม่อีกชิ้นก่อนทดสอบ PUT error เพราะชิ้นเดิมถูกลบแล้ว ถ้า errorหลายอย่างพร้อมกันจะไม่รู้ว่ากำลังตรวจข้อไหน

| รหัสทดสอบ | เปลี่ยนอะไร/ส่งอะไร | ผลของโครงนี้ | ตรวจเพิ่มเติม |
|---|---|---|---|
| ERR-JSON | ลบ comma ระหว่าง name กับ price ใน raw |400 INVALID_JSON | ฐานไม่เพิ่มแถว |
| ERR-REQ | POST bodyเดิมแต่ลบ sku |400 VALIDATION_ERROR | อย่าทดสอบด้วย SKU ซ้ำพร้อมกัน |
| ERR-TYPE | price:"29900" |400 VALIDATION_ERROR | priceเป็นเลขไม่ได้ quote |
| ERR-NULL | name:null |400 VALIDATION_ERROR | date:nullใช้ได้แต่ name:nullไม่ได้ |
| ERR-EMPTY | name:"   " |400 VALIDATION_ERROR | trimแล้วว่าง |
| ERR-UNKNOWN | เพิ่ม id:999 ใน body |400 VALIDATION_ERROR | หากโจทย์สั่ง ignore ใช้ BODY-ALLOW |
| ERR-DATE | release_date:"2026-02-30" |400 VALIDATION_ERROR | ไม่ยอมรับวันไม่มีจริง |
| ERR-DUP | ส่ง POST ด้วย SKU ที่สร้างสำเร็จแล้ว |409 DUPLICATE_KEY | totalไม่เพิ่มเพราะซ้ำ |
| ERR-FK | SKUใหม่ + brand_idที่ตรวจว่าไม่มี |400 FOREIGN_KEY_NOT_FOUND | ใช้ข้อมูลอื่นถูกครบ |
| ERR-ID | GET /products/abc หรือ /0 |400 INVALID_ID | ถ้า string key ให้ใช้ KEY-S ไม่ใช้กรณีนี้ |
| ERR-404 | GET idบวกที่ตรวจว่าไม่มี |404 PRODUCT_NOT_FOUND | แยกจาก ENDPOINT_NOT_FOUND |
| ERR-U404 | PUT idที่ไม่มีพร้อมbodyถูก |404 PRODUCT_NOT_FOUND | โครงนี้ไม่สร้างแถวใหม่ |
| ERR-UDUP | PUT skuเป็นของสินค้าอีกแถว |409 DUPLICATE_KEY | GETตรวจค่าอื่นไม่เปลี่ยน |
| ERR-UFK | PUT brand_idที่ไม่มี |400 FOREIGN_KEY_NOT_FOUND | GETตรวจค่าเดิมยังอยู่ |
| ERR-PAGE | page=0 หรือ abc หรือ 1.5 |400 VALIDATION_ERROR | defaultกรณีไม่ส่งต่างจากส่งผิด |
| ERR-LIMIT | limit=500 |200 ใช้limit100 | offset/metadataต้องใช้100ด้วย |
| ERR-VIEW | view=wrong |400 INVALID_QUERY | ส่งให้มีแถวใน listเพื่อให้ mapperตรวจ; detailตรวจแน่นอน |
| ERR-URL | /productz แทน /products |404 ENDPOINT_NOT_FOUND | pathผิด ไม่ใช่ข้อมูลไม่พบ |

**body ตัวอย่างสำหรับลอง FK error** (ใช้ SKUใหม่ทุกครั้ง และแทน999999ด้วย brand idที่ยืนยันว่าไม่มี):

```json
{
  "sku": "EXAM-FK-001",
  "name": "FK Test",
  "brand_id": 999999,
  "category": "FLAGSHIP",
  "price": 100,
  "ram_gb": 8,
  "storage_gb": 128,
  "color": "Black"
}
```

การทดสอบ RESOURCE_IN_USE409 ต้องลบ resourceแม่ที่มีลูกอ้างจริง ตัวหลักไม่ได้เปิด DELETE brands เพราะใบ Week8 เน้น Read brands จึงไม่เพิ่ม route ลบแบรนด์แค่เพื่อทดสอบ เว้นแต่โจทย์สั่ง ดูแนวทางใน RESOURCE/KEY-S และ MySQL FK เดิม

### P9.4 การตรวจใน Postman กับใน Terminal

| เห็นอะไร | ไปดูอะไรต่อ |
|---|---|
| Could not send request | server/host/port/proxy client; ยังไม่มีHTTPstatus |
| 404 ENDPOINT_NOT_FOUND | method+URL+base path ไม่ตรง route |
| 404 PRODUCT_NOT_FOUND | routeถูก แต่ข้อมูลไม่มี; ตรวจid/ฐาน |
| 400 INVALID_JSON | raw JSON syntax;ไม่ใช่ SQL |
| 400 VALIDATION_ERROR | อ่าน messageว่าฟิลด์ไหน;เทียบP6 |
| 409 DUPLICATE_KEY | ถ้าจงใจส่งซ้ำคือผ่าน;ถ้าต้องการสร้างใหม่เปลี่ยนSKU |
| 500 INTERNAL_SERVER_ERROR | เปิดTerminalอ่านข้อความแรก เช่น Unknown column →กลับP5 |
| 200แต่bodyผิด | เปิดP4/P6;เทียบฟิลด์ทุกตัวกับโจทย์ |

### P9.5 เทคนิคทดสอบซ้ำโดยไม่ทำฐานเละ

- ใช้แถวที่สร้างเองเป็นหลัก อย่าลบข้อมูล seed สำคัญเพื่อแก้ error
- จด SKUและIDของชุดฝึก ถ้าส่ง POSTซ้ำแล้ว409อย่าลบ unique constraint ให้เปลี่ยนSKUหรือจัดการแถวเดิมที่สร้างเอง
- ถ้าจำเป็นต้อง reset ฐานฝึก ให้ดู DROP/TRUNCATEใน SQL ก่อนและทำเฉพาะฐานฝึกที่อนุญาต ไม่แนะนำ reset เป็นขั้นแก้errorทั่วไป
- หลังแก้โค้ด restart แล้วส่ง requestเดิมก่อนเปลี่ยนอย่างอื่น จะรู้ว่าแก้ถูกจุด
- เก็บผลก่อนและหลัง PUTในสองแท็บ GET หรือดู WebStorm ไม่อาศัย response PUTอย่างเดียว

**ผ่านเมื่อ:** CRUDจริง, DTOตรง, count/หน้าถูก, errorที่จำเป็นถูก, ค่าไม่เปลี่ยนหลังrequestผิด และทดสอบซ้ำได้

---
<a id="options"></a>
## ตัวเลือกสำรอง — เลือกตามโจทย์และเปลี่ยนเป็นชุด

**ก่อนเลือก:** เก็บสำเนาจุดที่ทำงานได้ไว้ก่อน แต่ละชุดด้านล่างไม่ใช่คำสั่งให้เพิ่มทั้งหมด โค้ดตัวอย่างที่ใช้ตาราง Classic Models ต้องมี schemaจริงของตารางนั้น ชุด SQL mobile_distributor มีเพียง brands/products จึงไม่ทำให้ productlines/payments เกิดขึ้นเอง

### ตารางตัวเลือกและผลกระทบ

| รหัส | เลือกเมื่อ | เปลี่ยนหลัก | ตามไปแก้ |
|---|---|---|---|
| READ-ALL | อ่านทั้งหมด ไม่เอาpagination | route list | queryในPostman/expected |
| PAGE-OPT | paginationเลือกใช้ | POLICY | testไม่ส่ง/ส่งquery |
| NO-DTO | ส่งrowตรงตามฟิลด์ที่โจทย์เลือก | service SELECT allowlist | mapperไม่เรียก/SQLfields |
| NO-JOIN | ไม่ต้องข้อมูลตารางอื่น | repoSELECT + mapper | brandName/expected |
| FILTER | กรอง/ค้นหา/เรียง | middleware+repo+service+route | COUNT/query/tests |
| PUT-FULL | PUTต้องส่งครบ | POLICY+required | body/expected |
| BODY-CAMEL | bodycamel DBsnake | serviceinput adapter | Postmanfields |
| BODY-ALLOW | ignoreunknownตามโจทย์ | prepareInput | testunknown |
| RESP | envelope/statusต่าง | POLICY/helper | error+Postman |
| ENTRY-A | บังคับapp.jsรันโดยตรง | app/server/start | Runconfiguration |
| EX4 | ต้องใช้Express4 | asyncwrapper | routeทุกasync |
| KEY-S | stringPK | resource3ไฟล์ | mount/DB/URL |
| KEY-C | compositePK | resource3ไฟล์ | mergeParams/WHERE/URL |
| RESOURCE | resourceใหม่ | route/service/repo/(mapper) | app/import/SQL/tests |

<a id="read-all"></a>
### READ-ALL — โจทย์ให้ GET ทั้งหมด ไม่มี pagination

**เลือกเมื่อ:** “ดึงรายการทั้งหมด” และไม่ได้กำหนดแบ่งหน้า ไม่ใช่แค่ยังไม่ส่ง query ในครั้งทดสอบ  
**ไฟล์/การวาง:** `src/routes-$id/route.js` แทนเฉพาะ router.get('/') บล็อกเดิม ไม่วางเพิ่มอีกบล็อก  
**ใช้เดิมได้:** Service รองรับ pagination=null แล้ว Repository ก็รองรับ ไม่ต้องลบโค้ดแบ่งหน้าทั้งโปรเจกต์  
**ต้องแก้ร่วม:** request list ไม่ใส่ page/limit; expected responseไม่มีpagination; ถ้าไม่ใช้ queryParserที่อื่นจะลบ import ได้แต่ไม่บังคับ

```js
// ไฟล์: src/routes-$id/route.js — แทน GET '/' เดิมเท่านั้น
// โครง READ-ALL: ยังคงใช้ Summary DTO แต่ไม่แบ่งหน้า
router.get('/', async (req,res) => {
  const { items } = await service.getAllObjects(null, req.query.view ?? POLICY.listView);
  return apiResponse(res, items);
});
```

**ตรวจ:** GET /products → dataจำนวนเท่า COUNTจริง และไม่มีpagination; หากยังมีแค่10แถวให้ตรวจว่าแทน routeถูกไฟล์หรือมี routeซ้ำ และ restartแล้วหรือยัง

<a id="page-opt"></a>
### PAGE-OPT — ไม่ส่งทั้งคู่คืนทั้งหมด ส่ง query จึงแบ่งหน้า

**ไฟล์:** `src/configs-$id/exam-config.js` เปลี่ยน `pagination: 'optional'` ส่วนอื่นใช้เดิมได้ครบ  
**นโยบายของตัวเลือก:** ไม่ส่งทั้งคู่=null; ส่งแค่หนึ่งค่าจะใช้defaultอีกค่า; ส่งค่าผิด=400

**ถ้าโจทย์/โครงอาจารย์ระบุว่าขาดตัวใดตัวหนึ่งต้องไม่แบ่งหน้า:** ใน `pagination-middleware.js` แทนบล็อก if optional ด้วย:

```js
// ไฟล์: src/middlewares-$id/pagination-middleware.js
// แทนเฉพาะ if ที่ตรวจ optional; คงส่วน normalize ด้านล่างไว้
if (POLICY.pagination === 'optional' && (page === undefined || limit === undefined)) {
  req.pagination = null;
  return next();
}
```

**ตรวจ3ครั้ง:** ไม่ส่งquery, ส่งpageอย่างเดียว, ส่งpage+limit แล้วเทียบว่าตรงนโยบายที่เลือก อย่าอาศัยชื่อoptionalโดยไม่อ่านเงื่อนไข

<a id="no-dto"></a>
### NO-DTO — โจทย์ให้คืนฟิลด์ DB ตามเดิม ไม่ต้องแปลงชื่อ

ไม่จำเป็นต้องreturn `SELECT *` แล้วเปิดเผยทุกcolumn ใช้ SELECT allowlistของRepositoryที่ตรงresponseก่อน

**ไฟล์:** `src/services-$id/service.js` แทนเฉพาะgetAllObjects/getObjectสองฟังก์ชัน  
**ใช้เดิมได้:** existing(), CRUDส่วนอื่นและhelper  
**ต้องแก้ร่วม:** SELECTในRepositoryต้องคืนเฉพาะฟิลด์ที่โจทย์ต้องการ และทบทวนPOST/PUTว่าใช้getObjectอ่านกลับจึงจะเปลี่ยนresponseตามไปด้วย

```js
// ไฟล์: src/services-$id/service.js — แทนสองฟังก์ชันเดิม ไม่เพิ่มชื่อซ้ำ
export async function getAllObjects(pagination) {
  return {items:await repo.findAll(pagination),total:pagination ? await repo.countAll() : undefined};
}
export async function getObject(id) {
  return existing(id);
}
```

**ตรวจ:** body keys/typeตรงโจทย์ ไม่มี internal fieldsหลุดมา ถ้าข้อสอบเน้นDTOต้องใช้DTOตามสเปก ไม่เลือกโครงนี้เพื่อลัดงาน

<a id="no-join"></a>
### NO-JOIN — รายละเอียดไม่ต้องชื่อแบรนด์หรือข้อมูลข้ามตาราง

**แก้1:** ในRepositoryแทนconst SELECT_PRODUCTเดิมด้วย:

```js
// ไฟล์: src/repositories-$id/repository.js — แทน const SELECT_PRODUCT
// alias p ยังคงไว้ เพราะฟังก์ชันเดิมใช้ WHERE p.id / ORDER BY p.id
const SELECT_PRODUCT = `SELECT p.id,p.sku,p.name,p.brand_id,p.category,p.price,
  p.ram_gb,p.storage_gb,p.color,p.stock_quantity,p.status,p.release_date FROM products p`;
```

**แก้2:** ในMapperลบบรรทัด `brandName: entity.brand_name` ถ้าresponseไม่ต้องมี  
**ใช้เดิมได้:** findAll/findOne/count/CRUD, keyและFKของproductsยังเหมือนเดิม  
**ตรวจ:** GET detailต้องไม่มีbrandNameหากโจทย์ห้ามfieldเกิน; หากโจทย์ต้องมีbrandNameอย่าใช้NO-JOINเพราะundefinedจะถูกJSONตัดออก

<a id="filter"></a>
### FILTER — โจทย์เพิ่มกรองแบรนด์ ค้นชื่อ และเรียงราคา

**เงื่อนไขตัวอย่าง:** `GET /products?brandId=1&q=phone&sort=price&order=desc&page=1&limit=10`  
**นโยบายตัวอย่าง:** brandIdบวกแต่ไม่มีสินค้า=200 []; ไม่เช็กว่าbrandมีจริงก่อน ถ้าโจทย์ให้404เมื่อbrandไม่มี ให้เรียกbrand-service.getObjectก่อน query; qใช้LIKEดังนั้น%/_เป็นwildcardตามSQL ถ้าโจทย์ต้องค้นliteralต้องescapeเพิ่ม

**ต้องแก้ครบ4จุด:** (1) เพิ่มparser+แทนfindAll/countAllในRepository (2) แทนgetAllObjectsในService (3) เพิ่มimportและเปลี่ยนroute (4) ทดสอบfilteredtotal ไม่ใช้COUNTทั้งหมด

**ไฟล์:** `src/repositories-$id/repository.js`  
**การวาง:** คงimport db, SELECT_PRODUCT, findOne/findBySku/CRUDเดิม; แทนfindAll/countAllและเพิ่มparseFilter/buildWhereด้านล่าง

```js
// ไฟล์: src/repositories-$id/repository.js — FILTER ส่วนแทน/เพิ่ม
// เพิ่ม import นี้ด้านบนไฟล์ (อย่าแทรกกลางฟังก์ชัน)
import { AppError } from '../middlewares-$id/error-handler.js';
export function parseFilter(query) {
  const result = {sort:'id',order:'ASC'};
  if (query.brandId !== undefined) {
    if (typeof query.brandId !== 'string' || !/^\d+$/.test(query.brandId) ||
        !Number.isSafeInteger(Number(query.brandId)) || Number(query.brandId)<1) {
      throw new AppError('brandId must be a positive integer');
    }
    result.brandId = Number(query.brandId);
  }
  if (query.q !== undefined) {
    if (typeof query.q !== 'string' || query.q.length>150) throw new AppError('q must be text (max 150)');
    result.q = query.q;
  }
  if (query.sort !== undefined) {
    if (!['id','name','price'].includes(query.sort)) throw new AppError('sort must be id, name or price');
    result.sort = query.sort;
  }
  if (query.order !== undefined) {
    if (typeof query.order !== 'string' || !['asc','desc'].includes(query.order.toLowerCase())) throw new AppError('order must be asc or desc');
    result.order = query.order.toUpperCase();
  }
  return result;
}
function buildWhere(filter) {
  const conditions = [], values = [];
  if (filter.brandId !== undefined) {conditions.push('p.brand_id=?');values.push(filter.brandId);}
  if (filter.q !== undefined) {conditions.push('p.name LIKE ?');values.push('%'+filter.q+'%');}
  return {sql:conditions.length ? ' WHERE '+conditions.join(' AND ') : '',values};
}
export async function findAll(pagination,filter={sort:'id',order:'ASC'}) {
  const where = buildWhere(filter);
  const columns = {id:'p.id',name:'p.name',price:'p.price'}; // identifier allowlist
  const column = columns[filter.sort] || columns.id;
  const order = filter.order==='DESC' ? 'DESC' : 'ASC';
  let sql = SELECT_PRODUCT + where.sql + ` ORDER BY ${column} ${order},p.id ASC`;
  const values = [...where.values];
  if (pagination) {sql+=' LIMIT ? OFFSET ?';values.push(pagination.limit,pagination.offset);}
  const [rows] = await db.query(sql,values); return rows;
}
export async function countAll(filter={}) {
  const where = buildWhere(filter);
  const [[row]] = await db.query('SELECT COUNT(*) AS total FROM products p JOIN brands b ON p.brand_id=b.id'+where.sql,where.values);
  return Number(row.total);
}
```

หากใช้NO-JOINร่วมด้วย ให้COUNTใช้FROM products pเช่นกัน ถ้าJOINแบบ1:Nจนสินค้าซ้ำ ต้องวางแผนDISTINCT/COUNT(DISTINCT p.id)ให้ตรง ไม่เอาCOUNTจากตัวอย่างนี้ไปใช้โดยไม่ตรวจ cardinality

**Service:** แทนฟังก์ชันเดิม:

```js
// ไฟล์: src/services-$id/service.js — แทน getAllObjects
export async function getAllObjects(pagination,viewType=POLICY.listView,filter={sort:'id',order:'ASC'}) {
  const rows = await repo.findAll(pagination,filter);
  return {items:mapper.maps(rows,viewType),total:pagination ? await repo.countAll(filter) : undefined};
}
```

**Route:** เพิ่มimportด้านบน แล้วแทนGETlistเดิม:

```js
// ไฟล์: src/routes-$id/route.js — เพิ่ม import, แทน GET '/' เดิม
import { parseFilter } from '../repositories-$id/repository.js';
router.get('/',queryParser(),async(req,res) => {
  const filter = parseFilter(req.query);
  const {items,total} = await service.getAllObjects(req.pagination,req.query.view ?? POLICY.listView,filter);
  return apiResponse(res,items,req.pagination,200,total);
});
```

parserในตัวอย่างอยู่Repositoryเพื่อรวมsnippetให้น้อย หากโจทย์ตรวจชั้นvalidationให้แยกไปmiddleware/serviceแล้วเปลี่ยนimportโดยคงcontract `{brandId,q,sort,order}` เดิม

**ตรวจ:** เลือกbrandที่มีจริง →ทุกitemมีbrandIdนั้น →totalเท่าSQL COUNTWHEREเดียวกัน →orderราคาถูกต้อง →brandที่ไม่มีสินค้าได้[] →sort=anythingได้400  
**ถ้าพัง:** totalยัง75ทั้งที่filterเหลือ3 →countไม่ได้รับfilter; queryราคาเรียงแปลก →ตรวจDECIMAL/SQLORDER; unknowncolumn →ตรวจalias p/b

<a id="put-full"></a>
### PUT-FULL — รับครบทุกฟิลด์ที่เขียนได้ตามโจทย์

**ไฟล์:** `src/configs-$id/exam-config.js` เปลี่ยน `updateMode: 'full'`  
**ใช้เดิมได้:** route/service/repoมีทางเลือกนี้แล้ว ไม่ต้องก็อปserviceทั้งไฟล์อีกครั้ง  
**ต้องแก้ร่วม:** REQUIREDในprepareInputตามสเปก; fullbodyในPostman; defaultของoptionalเมื่อขาดต้องตรงโจทย์  
**ตรวจ:** bodyครบ→200; ลบฟิลด์บังคับ→400; ส่งbodyเดิมซ้ำ→200; idไม่มี→404ไม่INSERTใหม่

หากโจทย์ระบุว่ามีแค่ name/price/stock_quantity ที่แก้ได้ ไม่ใช่ fullทั้งหมด ให้จำกัดINPUT_FIELDSสำหรับPUTโดยแยกvalidatorจากPOST ไม่เอาREQUIREDของPOSTทั้งก้อนไปบังคับ ในโครงหลัก partialใช้การUPDATEเฉพาะdataที่ผ่านallowlist จึงเก็บค่าอื่นไว้แล้ว

<a id="body-camel"></a>
### BODY-CAMEL — Request ใช้ camelCase แต่ DB ใช้ snake_case

**เลือกเมื่อ:** ตัวอย่าง bodyของโจทย์ใช้brandId/ramGb/... ไม่ใช่เพียงresponseใช้camelCase  
**ไฟล์:** `src/services-$id/service.js` เพิ่มฟังก์ชันด้านล่างก่อนprepareInput แล้วเพิ่ม `body = normalizeBody(body);` เป็นบรรทัดแรกในprepareInputก่อนตรวจobject  
**ใช้เดิมได้:** validationและSQLภายในยังใช้snake_caseทั้งหมด  
**ต้องแก้ร่วม:** POST/PUT rawJSONใช้camelCase; responsemapperไม่ต้องเปลี่ยนเพราะส่งcamelอยู่แล้ว

```js
// ไฟล์: src/services-$id/service.js — เพิ่มฟังก์ชันและเรียกต้น prepareInput
function normalizeBody(body) {
  if (!body || typeof body!=='object' || Array.isArray(body)) return body;
  const names = {brandId:'brand_id',ramGb:'ram_gb',storageGb:'storage_gb',
    stockQuantity:'stock_quantity',releaseDate:'release_date'};
  const result = {};
  for (const [key,value] of Object.entries(body)) {
    // รับcamelเท่านั้นใน5ฟิลด์นี้ ไม่รับaliasสองชื่อชนกัน
    if (Object.values(names).includes(key)) throw new AppError('Use camelCase field names');
    const target = names[key] || key;
    result[target] = value;
  }
  return result;
}
```

ตัวอย่างเพิ่มบรรทัด ไม่สร้างprepareInputซ้ำ:

```js
// เพิ่มด้านในฟังก์ชัน export function prepareInput(body, partial=false) ที่มีอยู่
body = normalizeBody(body);
```

**ตรวจ:** brandIdถูกแปลงก่อนSQLจึงไม่Unknowncolumn; ในPostmanอย่าส่งทั้งbrand_idและbrandIdเพราะโครงนี้ตั้งใจปฏิเสธsnakeเมื่อเลือกcamel

<a id="body-allow"></a>
### BODY-ALLOW — โจทย์ให้ ignore fields ที่ไม่ได้รับ

ในprepareInputลบ/ปิดเฉพาะบรรทัด `if (unknown.length) invalid(...)` ไม่ลบallowlist loopที่เลือกINPUT_FIELDS  
**เหตุผล:** ยังต้องป้องกันไม่ให้id/internalfieldถูกนำไปSQL แม้จะไม่ตอบ400เมื่อพบมัน  
**ตรวจ:** เพิ่มid:999ในbody → APIต้องไม่ใช้999เป็นIDใหม่ และGETเห็นIDที่DBสร้าง  
**ใช้เมื่อโจทย์อนุญาตเท่านั้น:** ถ้าโจทย์บังคับunknownfield400ให้คงตัวหลัก

<a id="resp"></a>
### RESP — Response ต่างจาก Week8

**กรณีA:** ต้องการ `{status:'success',data}` แบบงานWeek6 → POLICY.successStyle='status', includeTimestamp=false; errorHandlerใช้รูปแบบstatus:errorคู่กันแล้ว  
**กรณีB:** ต้องการsuccess:trueแต่ไม่มีtimestamp → เปลี่ยนincludeTimestamp=false  
**กรณีC:** DELETE200+message → POLICY.deleteStatus=200 แล้วแก้ข้อความ/โครงdataในrouteตามโจทย์  
**กรณีD:** ต้องใช้ชื่อpagination.totalItems/hasPreviousPage → เปลี่ยนชื่อkeyในapi-response.jsไม่ต้องเปลี่ยนCOUNT; ต้องตามexpectedPostman/runnerของโจทย์ใหม่  
**กรณีE:** ไม่ใช้envelopeเลยเช่นส่งarrayตรง → ในrouteใช้ `return res.status(200).json(items);` แทนhelperของendpointนั้น และปรับerrorตามสเปกด้วย ไม่เปลี่ยนทุกendpointถ้าโจทย์กำหนดเฉพาะจุด

**POSTที่กำหนดLocation:** ในPOSTrouteหลังได้dataก่อนapiResponseเพิ่ม:

```js
// ไฟล์: src/routes-$id/route.js — เพิ่มก่อน return ของ POST เท่านั้น
res.location(`${req.baseUrl}/${data.id}`);
```

ใช้เฉพาะเมื่อDTOมีid; GETตามLocationต้องเจอข้อมูล ถ้าkeyมีช่องว่าง/อักขระพิเศษใช้encodeURIComponent(key)

<a id="entry-a"></a>
### ENTRY-A — บังคับใช้ node src/app.js เป็น entrypointตามtemplate

เลือกอย่างใดอย่างหนึ่ง ไม่เปิดlistenสองจุด

1. `src/app.js`: คงexpress/routes/errorhandler/exportเดิม เพิ่มimport2บรรทัดด้านบน
2. ย้ายบล็อกstartupจาก `src/server.js` ตั้งแต่ `try {` ถึงท้ายcatchมาไว้ท้ายapp.js (หลังexportก็ได้)
3. scripts.startเปลี่ยนเป็น `node src/app.js`
4. ไม่รันserver.jsซ้ำ; ถ้าลบไฟล์server.jsได้ตามกติกาก็ลบเฉพาะไฟล์ที่สร้างเอง

```js
// ไฟล์: src/app.js — import เพิ่มด้านบน (HOST/PORT/BASE_PATH คง import เดิมให้ไม่ซ้ำ)
import db from './configs-$id/db-config.js';
import { HOST, PORT } from './configs-$id/exam-config.js';
```

startupใช้BASE_PATHที่appimportอยู่แล้ว โค้ดtry/catchใช้เหมือนserver.jsทุกบรรทัด  
**ตรวจ:** node src/app.jsเปิดค้าง;GETได้;ไม่มีEADDRINUSEจากlistenซ้ำ

<a id="ex4"></a>
### EX4 — ถ้า template ใช้ Express4จริง

โครงที่อ่านจากอาจารย์ใช้Express5 จึงใช้asyncตรงได้ ถ้าtemplateใหม่ใช้4และห้ามเปลี่ยนversion ให้สร้างwrapper:

```js
// ไฟล์: src/middlewares-$id/async-handler.js — สร้างใหม่ทั้งไฟล์
export const asyncHandler = fn => (req,res,next) => {
  Promise.resolve(fn(req,res,next)).catch(next);
};
```

ทุกrouteที่asyncเพิ่มimportและครอบhandler:

```js
// ไฟล์: src/routes-$id/route.js — ตัวอย่างแทน GET '/:id' สำหรับExpress4
import { asyncHandler } from '../middlewares-$id/async-handler.js';
router.get('/:id', asyncHandler(async(req,res) => {
  const data = await service.getObject(service.parseId(req.params.id),req.query.view ?? POLICY.detailView);
  return apiResponse(res,data);
}));
```

ต้องครอบทุกasyncของbrands/products/โครงสำรองด้วย;ไม่ใช้การเพิ่มprocess.on('uncaughtException')เพื่อกลบปัญหา  
**ตรวจ:** GETidที่ไม่มีต้อง404JSONผ่านhandlerไม่ทำserverล่ม

<a id="key-s"></a>
### KEY-S — String PK: Product Lines แบบงาน Week6

**เลือกเมื่อ:** ตารางจริงมีproductlinesและproductLineเป็นVARCHAR ไม่AUTO_INCREMENT  
**ตัวอย่างนี้:** list/detail/create/updateเฉพาะtextDescription/delete;successenvelopeใช้helperหลัก ถ้าต้องDTOsummaryให้เพิ่มmapperตามโจทย์  
**ฐานข้อมูล:** ต้องมีตารางนี้ในฐานที่db-configชี้ ถ้าเปลี่ยนฐานจากmobileไปclassicmodels ให้ยกเลิกmountproducts/brandsที่schemaไม่ตรงด้วย ไม่ใช่เพิ่มendpointแล้วให้เก่าqueryฐานผิด

**สร้างครบ3ไฟล์ต่อไปนี้ ไม่แทนproductsเดิมถ้าโจทย์ต้องการทั้งสองresource**

**ไฟล์:** `src/repositories-$id/productline-repo.js` • วางทั้งไฟล์ • เปลี่ยนtable/column/keyตามจริง • ใช้bindingเดิมได้

```js
// ไฟล์: src/repositories-$id/productline-repo.js
// โครง KEY-S: ใช้เมื่อมีตาราง productlines และ PK=productLine เป็น string
// ต้องตั้ง db-config ให้ตรงฐานที่มีตารางนี้; ไม่ใช้กับ mobile_distributor เดิมโดยไม่ตรวจ
import db from '../configs-$id/db-config.js';
// [โจทย์เปลี่ยน] ต้องมีตาราง productlines จริง; ถ้าโจทย์ใช้ table/PK อื่น แก้ SELECT/WHERE/INSERT/UPDATE/DELETE ทุกตัว
const SELECT = 'SELECT productLine,textDescription FROM productlines';
export async function findAll() {
  const [rows] = await db.query(SELECT + ' ORDER BY productLine'); return rows;
}
export async function findOne(key) {
  const [rows] = await db.query(SELECT + ' WHERE productLine=?',[key]); return rows[0] || null;
}
export async function create(data) {
  await db.query('INSERT INTO productlines SET ?',[data]);
  // [โจทย์เปลี่ยน] string PK ได้จาก body ไม่ได้ใช้ insertId; เปลี่ยน data.productLine ตาม PK จริง
  return findOne(data.productLine); // string PK อ่านด้วย key ที่รับ ไม่ใช้ insertId
}
export async function update(key,data) {
  await db.query('UPDATE productlines SET ? WHERE productLine=?',[data,key]); return findOne(key);
}
export async function remove(key) {
  const [result] = await db.query('DELETE FROM productlines WHERE productLine=?',[key]);
  return result.affectedRows;
}
```

**ไฟล์:** `src/services-$id/productline-service.js` • วางทั้งไฟล์ • ปรับvalidation/fieldsตามโจทย์ • ไม่แปลงkeyเป็นNumber

```js
// ไฟล์: src/services-$id/productline-service.js
// โครง KEY-S: รองรับ create + read list/detail + partial update description + delete
// ต้องปรับ field/error/validation ให้ตรงโจทย์; response ตัวอย่างเลือกเฉพาะ2ฟิลด์จาก repo
import * as repo from '../repositories-$id/productline-repo.js';
import { AppError } from '../middlewares-$id/error-handler.js';
// [โจทย์เปลี่ยน] ตัวอย่างนี้ใช้ string PK; ตรวจฟังก์ชัน parse/key และ response ให้ตรงโจทย์จริง
export function parseKey(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 50) {
    throw new AppError('productLine must be non-empty text (max 50)',400,'VALIDATION_ERROR');
  }
  return value.trim();
}
function input(body,create) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new AppError('JSON object required');
  const allowed = create ? ['productLine','textDescription'] : ['textDescription'];
  if (Object.keys(body).some(key => !allowed.includes(key))) throw new AppError('Unknown or immutable field');
  const data = {};
  if (create) data.productLine = parseKey(body.productLine);
  if (Object.prototype.hasOwnProperty.call(body,'textDescription')) {
    if (body.textDescription !== null && typeof body.textDescription !== 'string') {
      throw new AppError('textDescription must be text or null');
    }
    data.textDescription = body.textDescription;
  } else if (create) data.textDescription = null;
  else throw new AppError('Send textDescription to update');
  return data;
}
export async function getObject(key) {
  const row = await repo.findOne(key);
  if (!row) throw new AppError('Product line not found',404,'PRODUCTLINE_NOT_FOUND');
  return row;
}
export async function getAllObjects() { return repo.findAll(); }
export async function createObject(body) { return repo.create(input(body,true)); }
export async function updateObject(key,body) {
  await getObject(key); return repo.update(key,input(body,false));
}
export async function removeObject(key) {
  await getObject(key);
  if (!await repo.remove(key)) throw new AppError('Product line not found',404,'PRODUCTLINE_NOT_FOUND');
}
```

**ไฟล์:** `src/routes-$id/productline-route.js` • วางทั้งไฟล์ • paramชื่อproductLineต้องตรงreq.params

```js
// ไฟล์: src/routes-$id/productline-route.js
// โครง KEY-S: app ต้อง mount /api/ID/productlines; ไม่เรียก numeric parseId
import express from 'express';
import * as service from '../services-$id/productline-service.js';
import { apiResponse } from '../mappers-$id/api-response.js';
// [โจทย์เปลี่ยน] app.js ต้อง mount productlineRouter ตาม path ในโจทย์; ชื่อ param ใน router ต้องตรง req.params
const router = express.Router();
router.get('/',async(req,res) => apiResponse(res,await service.getAllObjects()));
router.get('/:productLine',async(req,res) => apiResponse(res,await service.getObject(service.parseKey(req.params.productLine))));
router.post('/',async(req,res) => apiResponse(res,await service.createObject(req.body),null,201));
router.put('/:productLine',async(req,res) => apiResponse(res,await service.updateObject(service.parseKey(req.params.productLine),req.body)));
router.delete('/:productLine',async(req,res) => {
  await service.removeObject(service.parseKey(req.params.productLine)); return res.status(204).end();
});
export default router;
```

**แก้ร่วมในapp.js:** เพิ่มimportด้านบน และmountก่อน404handler:

```js
// ไฟล์: src/app.js — เพิ่มด้านบน
import productLineRouter from './routes-$id/productline-route.js';
// เพิ่มบรรทัดนี้ในส่วนmount ก่อน app.use ที่สร้าง ENDPOINT_NOT_FOUND
app.use(`${BASE_PATH}/productlines`,productLineRouter);
```

**Postman:** POST `{{baseUrl}}/productlines` body:

```json
{"productLine":"Exam Electric","textDescription":"Practice string primary key"}
```

GET/PUT/DELETEใช้URL `{{baseUrl}}/productlines/Exam%20Electric` (URL encodeช่องว่างเป็น%20;Express decodeparamsให้แล้ว)

PUT body:

```json
{"textDescription":"Updated description"}
```

**ตรวจ:** POST201 →GET200 →POSTเดิม409 →PUT200 →GETคำอธิบายใหม่ →DELETE204ถ้าไม่มีFKอ้าง →GET404  
**อาจติด:** Unknowncolumn/productLine →schemaผิด; keyNaN →เผลอparseId;409RESOURCE_IN_USE →มีproductsอ้างproductlineจริง ใช้แถวที่สร้างทดสอบและไม่มีลูก ไม่ลบFKconstraint

<a id="key-c"></a>
### KEY-C — Composite PK: Customer Payments แบบงาน Week6

**เลือกเมื่อ:** paymentsใช้keyคู่(customerNumber,checkNumber), customerNumberอยู่URL และcheckNumberมาจากbodyตอนcreate/URLตอนdetail  
**ตัวอย่างURL:** `/api/ID/customers/103/payments/EXAM-CHECK-001`  
**สำคัญ:** ทุกSELECT/UPDATE/DELETEต้องใช้keyสองส่วน ไม่ใช้checkNumberตัวเดียว; customerNumberต้องมีจริงในcustomers

**ไฟล์:** `src/repositories-$id/payment-repo.js` • สร้างทั้งไฟล์ • ใช้schemaจริงของpayments/customers

```js
// ไฟล์: src/repositories-$id/payment-repo.js
// โครง KEY-C: ใช้เมื่อฐานจริงมี payments PK(customerNumber,checkNumber) + customers
// ต้องแก้ทุก WHERE ให้มี key ครบ; query bindค่า ไม่ต่อค่าจากURLเป็นSQL
import db from '../configs-$id/db-config.js';
// [โจทย์เปลี่ยน] composite key: เปลี่ยนชื่อ table/column ตาม SQL; ทุก WHERE ต้องมีทั้งสองคีย์
const SELECT = 'SELECT customerNumber,checkNumber,paymentDate,amount FROM payments';
export async function customerExists(customerNumber) {
  const [rows] = await db.query('SELECT customerNumber FROM customers WHERE customerNumber=?',[customerNumber]);
  return rows.length > 0;
}
export async function findAll(customerNumber) {
  const [rows] = await db.query(SELECT + ' WHERE customerNumber=? ORDER BY checkNumber',[customerNumber]); return rows;
}
export async function findOne(customerNumber,checkNumber) {
  const [rows] = await db.query(SELECT + ' WHERE customerNumber=? AND checkNumber=?',[customerNumber,checkNumber]);
  return rows[0] || null;
}
export async function create(data) {
  await db.query('INSERT INTO payments SET ?',[data]); return findOne(data.customerNumber,data.checkNumber);
}
export async function update(customerNumber,checkNumber,data) {
  await db.query('UPDATE payments SET ? WHERE customerNumber=? AND checkNumber=?',[data,customerNumber,checkNumber]);
  return findOne(customerNumber,checkNumber);
}
export async function remove(customerNumber,checkNumber) {
  const [result] = await db.query('DELETE FROM payments WHERE customerNumber=? AND checkNumber=?',[customerNumber,checkNumber]);
  return result.affectedRows;
}
```

**ไฟล์:** `src/services-$id/payment-service.js` • สร้างทั้งไฟล์ • ตัวอย่างPUTเป็นfullของamount/paymentDateและไม่ให้เปลี่ยนkey

```js
// ไฟล์: src/services-$id/payment-service.js
// โครง KEY-C: amount>0, วันที่จริง YYYY-MM-DD, updateต้องส่งamount/paymentDateครบ
// ต้องแก้: max amount ตาม DECIMAL ของตารางจริงและข้อความ/codeตามโจทย์
import * as repo from '../repositories-$id/payment-repo.js';
import { AppError } from '../middlewares-$id/error-handler.js';
// [โจทย์เปลี่ยน] ตรวจ request body/สองคีย์แยกกัน; ถ้าโจทย์ใช้ชื่อต่างแก้ service, repo, route
export function checkKey(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 50) throw new AppError('checkNumber is required (max 50)');
  return value.trim();
}
function dataInput(body,create) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new AppError('JSON object required');
  const fields = create ? ['checkNumber','paymentDate','amount'] : ['paymentDate','amount'];
  if (Object.keys(body).some(key => !fields.includes(key))) throw new AppError('Unknown or immutable field');
  if (typeof body.amount !== 'number' || !Number.isFinite(body.amount) || body.amount <= 0 ||
      body.amount > 999999999 || Math.abs(body.amount*100-Math.round(body.amount*100)) > 0.000001) {
    throw new AppError('Payment amount must be > 0 with at most 2 decimal places',400,'INVALID_PAYMENT_DATA');
  }
  const value = body.paymentDate;
  const date = typeof value === 'string' ? new Date(value+'T00:00:00Z') : new Date(NaN);
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value<'1000-01-01' || value>'9999-12-31' ||
      !Number.isFinite(date.getTime()) || date.toISOString().slice(0,10)!==value) {
    throw new AppError('paymentDate must be valid YYYY-MM-DD',400,'INVALID_PAYMENT_DATA');
  }
  return { amount:body.amount, paymentDate:value, ...(create ? {checkNumber:checkKey(body.checkNumber)} : {}) };
}
function dto(row) { return {...row,amount:Number(row.amount)}; } // repoเลือกเฉพาะ4ฟิลด์แล้ว
async function customer(customerNumber) {
  if (!await repo.customerExists(customerNumber)) throw new AppError('Customer not found',404,'CUSTOMER_NOT_FOUND');
}
export async function getAllObjects(customerNumber) {
  await customer(customerNumber); return (await repo.findAll(customerNumber)).map(dto);
}
export async function getObject(customerNumber,checkNumber) {
  const row = await repo.findOne(customerNumber,checkNumber);
  if (!row) throw new AppError('Payment not found',404,'PAYMENT_NOT_FOUND');
  return dto(row);
}
export async function createObject(customerNumber,body) {
  await customer(customerNumber);
  return dto(await repo.create({...dataInput(body,true),customerNumber}));
}
export async function updateObject(customerNumber,checkNumber,body) {
  await getObject(customerNumber,checkNumber);
  return dto(await repo.update(customerNumber,checkNumber,dataInput(body,false)));
}
export async function removeObject(customerNumber,checkNumber) {
  await getObject(customerNumber,checkNumber);
  if (!await repo.remove(customerNumber,checkNumber)) throw new AppError('Payment not found',404,'PAYMENT_NOT_FOUND');
}
```

**ไฟล์:** `src/routes-$id/payment-route.js` • สร้างทั้งไฟล์ • mergeParams:trueอ่านparamจากmountแม่

```js
// ไฟล์: src/routes-$id/payment-route.js
// โครง KEY-C: app mount /api/ID/customers/:customerNumber/payments
// mergeParams:true จำเป็นเพื่ออ่าน customerNumber จาก parent mount
import express from 'express';
import * as service from '../services-$id/payment-service.js';
import { parseId } from '../services-$id/service.js';
import { apiResponse } from '../mappers-$id/api-response.js';
// [โจทย์เปลี่ยน] ต้อง mergeParams:true เพราะ customerNumber อยู่ใน path ที่ app.js mount; checkNumber อยู่ใน route นี้
const router = express.Router({mergeParams:true});
// [โจทย์เปลี่ยน] หาก parent param เปลี่ยนชื่อ ต้องเปลี่ยน req.params และ app.js mount
const customer = req => parseId(req.params.customerNumber);
// [โจทย์เปลี่ยน] หาก child param เปลี่ยนชื่อ ต้องเปลี่ยน :checkNumber ทุก route และ req.params
const key = req => service.checkKey(req.params.checkNumber);
router.get('/',async(req,res) => apiResponse(res,await service.getAllObjects(customer(req))));
router.get('/:checkNumber',async(req,res) => apiResponse(res,await service.getObject(customer(req),key(req))));
router.post('/',async(req,res) => apiResponse(res,await service.createObject(customer(req),req.body),null,201));
router.put('/:checkNumber',async(req,res) => apiResponse(res,await service.updateObject(customer(req),key(req),req.body)));
router.delete('/:checkNumber',async(req,res) => {
  await service.removeObject(customer(req),key(req)); return res.status(204).end();
});
export default router;
```

**แก้app.js:** importด้านบนและmountก่อน404:

```js
// ไฟล์: src/app.js — เพิ่มimportด้านบน
import paymentRouter from './routes-$id/payment-route.js';
// เพิ่มในส่วนmountก่อน404handler
app.use(`${BASE_PATH}/customers/:customerNumber/payments`,paymentRouter);
```

parseIdในpayment-route importจากserviceหลักที่ไม่มีqueryตอนimport จึงใช้ได้แม้productsไม่ถูกmount หากจัดresourceให้สะอาดขึ้นสามารถย้ายparseIdไปvalidationmiddlewareแล้วแก้importทุกจุดพร้อมกัน อย่าลบserviceหลักก่อนย้ายhelperนี้

**Postman:** เลือกcustomerที่มีจริง เช่น103ถ้าseedตรง;POST `{{baseUrl}}/customers/103/payments`:

```json
{"checkNumber":"EXAM-CHECK-001","paymentDate":"2026-01-01","amount":2500.5}
```

GET `{{baseUrl}}/customers/103/payments/EXAM-CHECK-001` →200;POSTคู่เดิม→409;ลูกค้าคนละคนใช้checkNumberเดียวกันได้ถ้าไม่มีuniqueอื่นเพิ่มเติม

PUT URLเดียวกัน body:

```json
{"paymentDate":"2026-01-02","amount":3000}
```

GETตรวจamountเปลี่ยน →DELETEURLคู่เดียวกัน→204 →GET404  
**อาจติด:** customerNumberundefined →ลืมmergeParamsหรือparamชื่อไม่ตรง;ลบหลายลูกค้าพร้อมกัน→WHEREขาดcustomerNumber;dateเลื่อนวัน→ตรวจdateStringsและไม่แปลงDATEเป็นUTCโดยไม่จำเป็น

<a id="resource"></a>
### RESOURCE — เพิ่ม resource: ก็อปโครงได้ แต่ตรวจให้ครบทั้งเส้น

ตัวอย่างพร้อมใช้ของการเพิ่มresourceคือbrandsในP5–P7 (เลขkey), productlines(KEY-S) และpayments(KEY-C) เลือกชุดที่ใกล้กับschemaใหม่ที่สุดก่อน

**ลำดับคัดลอก products→resourceใหม่:**

1. จดชื่อtable/key/fields/DTOลงP0 ไม่เริ่มจากเปลี่ยนpathอย่างเดียว
2. สร้างrepositoryใหม่จากชุดkeyที่ตรง แล้วเปลี่ยนSELECT/COUNT/INSERT/UPDATE/DELETEทุกตัวที่ใช้จริง
3. สร้างserviceใหม่ เปลี่ยนimportrepo, required, allowlist, defaults, businessrules และnot-foundcode
4. สร้างmapperใหม่ถ้ารูปresponseต่าง อย่าให้brandsเรียกProductMapperแล้วฟิลด์undefined
5. สร้างrouteใหม่ เปลี่ยนimportservice, params, body, methodsและstatus ใช้ชื่อexportให้ตรง ไม่จำเป็นต้องเปลี่ยนชื่อฟังก์ชันgetObjectหากแยกnamespaceคนละไฟล์
6. app.jsเพิ่มimport+mountก่อน404 เลือกเฉพาะmethodที่โจทย์ต้องการ ไม่เปิดDELETEresourceอื่นเผื่อไว้
7. IDEค้นชื่อtable/resource/fieldเดิมในไฟล์ใหม่ เช่นproducts,sku,brand_id ตรวจทีละรายการว่าเหลือเพราะตั้งใจหรือคัดลอกลืม
8. เช็กdependencychain: URL→router→service→repo→DB→mapper→response
9. สร้างPostmanrequestsใหม่ ใช้ข้อมูลbodyและFKของresourceใหม่ ทดสอบlist/detailก่อนwrite

| สิ่งที่เปลี่ยน | จุดตามไปแก้ |
|---|---|
| ชื่อไฟล์ | importของผู้เรียก;pathและตัวพิมพ์เล็กใหญ่ |
| basepath | app.use + URL/runner;ไม่จำเป็นต้องเปลี่ยนtable |
| param :officeCode | req.params.officeCode + parser + argsถึงrepo |
| PK string | เลิกNumber/parseId;WHEREkey;Createอ่านกลับkey |
| เพิ่มฟิลด์ที่เขียน | body→allowlist→validator→SQLobject→DTOถ้าให้ส่งกลับ→Postman |
| เพิ่มฟิลด์จากอีกตาราง | JOIN/alias→mapper→responseexpected;ไม่จำเป็นต้องรับในbody |
| fieldreadonly | อย่าใส่INPUT_FIELDS;เลือกในSELECT/DTOได้ |

**กรณีโจทย์ให้แค่Read:** ก็อปเฉพาะfindAll/findOne+serviceRead+routeGETได้ ไม่ต้องยัดwritefunctionsไปด้วย ตัดimportsที่ไม่ใช้และอย่าทิ้งcallถึงfunctionที่ตัดออกแล้ว

**กรณีต้องเขียนหลายตารางในหนึ่งrequest:** โครงCRUDตารางเดียวไม่ครอบคลุมtransactionอัตโนมัติ ต้องใช้connectionเดียวเริ่มtransaction→queryทุกตัวบนconnectionนั้น→commit;catchrollback;finallyrelease ถ้าrepoยังใช้pool.queryแต่ละตัวจะไม่อยู่transactionเดียวกัน อย่าอ้างว่าใช้beginTransactionแล้วครอบทุกqueryโดยอัตโนมัติ ถ้าแนวสอบจริงเพิ่มกรณีนี้ให้เตรียมโครงเฉพาะก่อนใช้ ไม่ใช้ตัวเลือกนี้เดาแทนโจทย์หลายตาราง

---
<a id="change-map"></a>
## แผนที่แก้ข้ามไฟล์ — ใช้ตรวจทุกครั้งที่เปลี่ยนโครง

| เปลี่ยนตรงไหน | ต้องตรวจ/แก้ตาม | มักไม่ต้องแก้ |
|---|---|---|
| API PORT | exam-config,PostmanbaseUrl,runnerport,Runconfig | db-config.port |
| MySQL host/port/user/password | db-config,WebStormsource,CLIargs | Expresslistenport |
| DB name | db-config,WebStormschema,SQLUSE,ทุกtableที่resourceใช้ | URLถ้าโจทย์ไม่เปลี่ยน |
| STUDENT.id | exam-config,URL,identity,runnerstudentId,ชื่อZIP | PKของproducts |
| folder-$id | directoryจริง+importทุกระดับ+Runpathถ้ามี | JSONfield id |
| table | repoSELECT/COUNT/INSERT/UPDATE/DELETE/JOIN | endpointถ้าโจทย์ยังชื่อเดิม |
| PK name/type | SQLWHERE,parser,routeparam,createอ่านกลับ,PostmanURL | responsekeyถ้าโจทย์ยังให้id |
| bodyfield | inputadapter/allowlist/validation/SQLobject/Postman | responsefieldถ้าspecแยกชื่อ |
| DTOfield | SELECTalias,mapper,expectedresponse | INSERTถ้าเป็นข้อมูลderived |
| default/maxpagination | POLICY,metadata/SQLใช้ค่าnormalized,expected | DBschema |
| responseenvelope | helper,errorhandler,ทุกrouteที่ตอบตรง,Postmanassert | SQL |
| signatureฟังก์ชัน | declaration+callersทุกตัว+tests | resourceอื่นที่ไม่ได้เรียก |
| PUTmode | POLICY,required/default,rawbody,runnerbehavior | key/URLถ้ายังเดิม |

**ตรวจพิเศษเมื่อคัดลอก:** `apiResponse`สะกดตรงกัน; `res.status(201)`ไม่เอาไปใส่ตำแหน่งpagination; queryParserfactoryต้องเรียก();ไม่เปิดlistenสองจุด;ไม่ผสมhelperarray.totalItemsแบบเก่ากับhelperitems/totalแบบใหม่

---
<a id="p10"></a>
## Phase 10 — ตัวตรวจ การไล่แก้ และงานก่อนส่ง

### P10.1 ใช้ตัวตรวจที่แจก

1. serverเปิดค้างในTerminalA
2. เปิดTerminalBที่rootที่มีtestsของโจทย์
3. ถ้าเป็นrunnerWeek8รูปแบบที่อ่านแล้ว ใช้:

```powershell
node tests/test-runner.mjs YOUR_STUDENT_ID 3000
```

แทนรหัส/portตามงานจริง คำสั่งนี้ใช้ได้กับrunnerที่รับargsดังกล่าว ถ้าโจทย์แจกคนละตัวอ่านUsageก่อน ตัวอย่างรายชื่อนักศึกษา/secretในWeek8เป็นข้อมูลตัวอย่าง ไม่ใช้ของคนอื่น

4. runnerอาจPOST/PUT/DELETEข้อมูลจริง ใช้ฐานฝึกขณะเตรียม;ระหว่างสอบใช้ตามคำชี้แจง
5. แก้ข้อที่failทีละหมวด แล้วรันrequestเฉพาะกรณีซ้ำก่อนรันทั้งชุด
6. ในrunnerWeek8ที่อ่านพบPUTส่งname/price/stock_quantityเพียง3ฟิลด์ โครงหลักpartialรองรับ ไม่บังคับfullถ้าrequestนั้นเป็นสิ่งที่โจทย์ตั้งใจ
7. student.csvไม่มีในชุดการเรียนที่แนบ หากrunnerข้ามname/secretเมื่อไม่มีroster ต้องตรวจidentityด้วยตนเองตามใบงาน ไม่อ้างว่าผ่านidentityครบเพราะrunnerผ่าน
8. ไม่เอาnpm testของชุดเพื่อนที่ผูกschemaฝึกมาใช้ตัดสินschemaข้อสอบใหม่โดยไม่ปรับ;ใช้ตัวตรวจของโจทย์จริงและPostmanตามcontract

### P10.2 ไต่ปัญหาให้ถูกชั้น

| ขั้นที่พัง | อย่าเพิ่งทำอะไร | ให้ทำอะไร |
|---|---|---|
| npm/import | อย่าแก้SQL | P1 path/type/dependencies |
| dbconnection | อย่าเปลี่ยนHTTPstatusกลบ | P2/P3 host/port/account/schema |
| SQL | อย่าทิ้งvalidationทั้งหมด | P5 table/column/key/values |
| DTO | อย่าhardcodebrandName | P4 alias/mapper/ชนิด |
| route404 | อย่าresetDB | P7 URL/method/mount |
| response400/409ที่ตั้งใจเทส | อย่าคิดว่าเป็นบั๊กเสมอ | เทียบexpectedตามP9 |
| 500 | อย่าแก้handlerให้ตอบ200 | อ่านTerminalหาerrorต้นทาง |

**ขั้นตอนเมื่อแก้แล้วพัง:** บันทึกข้อความerrorแรก →หยุดserverที่ตัวเองเปิด →ตรวจบรรทัด/ไฟล์ตามerror →แก้จุดเดียว →syntaxcheck →start →requestเดิม →GETตรวจข้อมูล อย่าเปลี่ยนport/DB/schemaพร้อมกันจนไม่รู้สาเหตุ

### P10.3 แผนทำงานให้มีของส่ง

อ่านทุกข้อและคะแนนก่อนจัดเวลา ไม่สันนิษฐานว่าReadทั้งสามเป็นชื่อเดียวกับWeek8 ลำดับพื้นฐานที่ตรวจได้ทีละส่วน:

1. ตั้งDB/เปิดHTTPได้
2. identityถ้ามี และReadง่ายหนึ่งข้อให้ผ่านครบresponse
3. Readรายตัว+404
4. DTO/Paginationที่โจทย์ระบุ
5. Create→GETอ่านกลับ
6. Update→GETตรวจ
7. Delete→GET404
8. errorcases+ตัวตรวจ+แพ็ก

ถ้าติดJOINให้ทำReadที่ไม่ขึ้นกับJOINก่อนและจดจุดกลับมา ไม่ส่งJSONปลอมแทนDBเพื่อให้มีoutput แต่เก็บendpointที่เสร็จจริงไว้ไม่ทำพังตามไปด้วย

### P10.4 ใบตรวจรายข้อก่อนส่ง

| ข้อจริง | method/path | body/queryถูก | successstatus/DTOถูก | errorถูก | DBเปลี่ยนจริง | ผ่าน |
|---|---|---|---|---|---|---|
| C | | | | | | |
| R1 | | | | | | |
| R2 | | | | | | |
| R3 | | | | | | |
| U | | | | | | |
| D | | | | | | |

- [ ] ทุกไฟล์saveแล้วและrestartทดสอบจากsourceล่าสุด
- [ ] ไม่มีtable-name/primaryKey/YOUR_NAME/KEY_FROM_SPECที่ควรแทนค้างอยู่
- [ ] ไม่มีTODO/`...`แทนimplementationในไฟล์ที่ต้องส่ง
- [ ] APIport/DBport/basepath/identityถูก
- [ ] GETไม่เขียนฐาน,PUTidเดิมไม่สร้างเพิ่ม,DELETEตามstatusที่โจทย์สั่ง
- [ ] DTOไม่มีfieldเกิน/ขาด,priceเป็นtypeตามโจทย์,dateไม่เลื่อน
- [ ] totalจากCOUNTจริง,emptylist/404แยกถูก
- [ ] errorกลางเป็นJSONตามโจทย์ไม่HTMLหรือstack
- [ ] หลังrestartข้อมูลที่เขียนยังอยู่ (persistence)
- [ ] ไม่เผลอรันtest-serviceเก่าที่ลบseed

### P10.5 แพ็กและเปิดZIPตรวจจริง

1. อ่านSubmissionจริงว่าใช้ชื่ออะไรและต้องรวมอะไร
2. saveทุกไฟล์ หยุดserverได้เมื่อทดสอบจบ
3. สร้างโฟลเดอร์ส่งแยกจากโฟลเดอร์งานด้วยFile Explorer คัดลอกsourceที่ใช้จริง,package.json,package-lock.jsonและไฟล์ที่โจทย์กำหนด ไม่คัดลอกnode_modulesถ้าประกาศให้ตัดออก
4. ถ้าโจทย์ให้แนบSQL/README/testsให้ทำตาม ไม่แนบไฟล์รหัสผ่านจริงที่ไม่เกี่ยวข้องหรือกองtemplateสำรองทั้งชุด
5. ใช้File Explorer/ตัวบีบอัดสร้างZIPตามชื่อ เช่น `YOUR_STUDENT_ID_exam.zip` เมื่อประกาศใช้รูปแบบนี้
6. เปิดZIPดูภายในว่ามีsrcจริงและpackage.json ไม่ใช่ไฟล์ลิงก์ ไม่ใช่โฟลเดอร์เปล่า และไม่มีโฟลเดอร์ซ้อนผิดชั้นตามข้อกำหนด
7. ถ้าพอมีเวลาแตกZIPไปที่ใหม่ ตรวจโครง/importและรันด้วยdependenciesที่เตรียมไว้อย่างถูกกติกา ไม่รอโหลดnpmทางเน็ตในช่วงห้าม
8. ส่งLEB2ตามช่วง/วิธีที่อาจารย์อนุญาต ตรวจสถานะอัปโหลดเสร็จ ไม่ถือว่ามีZIPในเครื่องคือส่งแล้ว

### P10.6 ถ้าทำแล้วติด

| อาการ | วิธีแก้ |
|---|---|
| runnerต่อไม่ได้แต่Postmanได้ | port/host/basepathของrunnerต่าง;ตรวจargsและURLในoutput |
| runnerผ่านแต่PUTไม่เปลี่ยนจริง | runnerอาจตรวจแค่status;GET/SQLตรวจและแก้repoจริง |
| หลังแตกZIPรันไม่ได้ | src/entrypoint/import/lockfileขาด;แก้ไฟล์ส่งแล้วแพ็กใหม่ |
| ไฟล์ส่งเก่ากว่าไฟล์ที่รัน | saveและคัดลอกล่าสุดใหม่ ตรวจtimestamp/เนื้อหาจริง |
| โค้ดมีรหัสคนตัวอย่าง | แก้config/identity/basepath/ZIPชื่อพร้อมกัน แล้วGETstudent-infoซ้ำ |

---
## ขอบเขตและแหล่งอ้างอิงของรุ่นนี้

- อ่านmidterm-exam-esm-templateที่แนบ: route/service/repository/mapper/middlewareและplaceholderของผู้สอบ
- อ่านชุดint161-exam-kitของเพื่อนและโฟลเดอร์node-express-esm-template-074: ใช้แนวแบ่งไฟล์/ตัวอย่าง แต่แก้จุดfield/response/entrypointที่ไม่ตรง
- อ่านงานWeek6 Exception Handling: string/compositekey,duplicate,FK;และWeek8 Express Practice Exam,SQL,test-runner
- อ่านเนื้อหาPPTXWeek1–7โดยเฉพาะPagination/DTO;ไฟล์Week9เป็นSpring Boot/INT261จึงไม่ใช้เป็นข้อกำหนดExpress
- [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/) • [Express5 error handling](https://expressjs.com/en/5x/guide/error-handling/) • [WebStorm MySQL](https://www.jetbrains.com/help/webstorm/mysql.html) • [WebStorm JDBC drivers](https://www.jetbrains.com/help/webstorm/jdbc-drivers.html)

โครงหลักตั้งใจให้อ่านแล้วสร้างโปรเจกต์ได้ครบ แต่ข้อสอบจริงอาจเปลี่ยนschema/contract ให้กรอกP0และเลือกโครงก่อนใช้ สถานะการตรวจจริงของรุ่นนี้อยู่ในหัวข้อถัดไป ไม่อ้างว่าผ่านMySQL/GUIหากยังไม่ได้รันจริง

## สถานะการตรวจรุ่นนี้

- ตรวจ syntax JavaScript ของโครงหลักและไฟล์เต็มของ KEY-S/KEY-C ด้วย Node 22.11.0
- รัน Express 5.3.0 จริงผ่าน IncomingMessage/ServerResponse ภายใน process จำนวน **65 requests ผ่าน**: list/detail/DTO, pagination/cap/empty, create/duplicate/FK, PUT partial/full/ค่าเดิม/null/0, delete204/200/notfound, envelopeตัวเลือก, string/compositekey และ validation errors
- ชั้น mysql2.query ในชุดตรวจใช้ข้อมูลจำลองและบันทึก 84 SQL calls เพื่อตรวจการส่งค่าระหว่างชั้น **ไม่ได้ยืนยัน SQL ทั้งหมดกับ MySQLจริง** แม้เตรียม serverแยกไว้แล้ว แต่สภาพแวดล้อมบล็อกการเชื่อม TCP/named pipe จึงไม่อ้างว่าผ่าน integrationกับDBจริง
- โครง FILTER ประกอบ route/service/repositoryแล้วตรวจ syntax;ตรวจ assertions การbindค่า/WHEREของlistและCOUNT/allowlistการsort รวมทั้ง BODY-CAMEL mappingด้วยชั้นDBจำลอง ยังไม่ได้รันกับ schema/ข้อมูลสอบจริง
- ตรวจ JSONเต็ม,ชื่อไฟล์,ความครบของบล็อกโค้ดและลิงก์ภายใน/ระหว่างสองไฟล์
- ขั้นตอน WebStorm อิงเอกสาร JetBrains; **ยังไม่ได้คลิกทดสอบ GUI WebStorm/Postman ของผู้ใช้จริง** มีขั้น Test Connection/test-db/test-service/Postmanให้ลองตามในเครื่องก่อนสอบ
- ข้อสอบจริงอาจเปลี่ยนschema/response/นโยบาย ให้ใช้P0เทียบและทดสอบอีกครั้ง ไม่ใช้ผล65requestsนี้รับรองทุกโจทย์

[กลับสารบัญ](#วิธีใช้คู่มือนี้ให้ทำงานได้จริง) • [เปิดตาราง HTTP Status Code](HTTP-STATUS-CODES.md)
