# HTTP Status Code — ตารางอ้างอิง INT161

เริ่มจาก **[คู่มือยึด midterm-exam-esm-template](MIDTERM-TEMPLATE-FIRST.md)** แล้วเปิดคู่กับ [คู่มือโค้ดและ Postman ฉบับเต็ม](INT161-EXAM-HANDBOOK.md) • [ขั้นตอนยิง Postman](INT161-EXAM-HANDBOOK.md#p9) • [ไล่ปัญหาตามชั้น](INT161-EXAM-HANDBOOK.md#p10)

ไฟล์นี้รวม **HTTP status** ทั้งสำเร็จและผิดพลาด ส่วนข้อความerrorของNode/MySQLและวิธีแก้ละเอียดอยู่ในPhaseที่เกิดปัญหาในคู่มือหลัก

## อ่านรหัสสามประเภทให้แยกกัน

| ประเภท | ตัวอย่าง | อยู่ตรงไหน | ใช้อย่างไร |
|---|---|---|---|
| HTTP status | 201,400,404,409,500 | status lineที่Postmanแสดง และres.status | มาตรฐานบอกผลrequest |
| API/business error code | PRODUCT_NOT_FOUND,INVALID_EMAIL | JSON error.codeตามสเปก | ตั้งชื่อให้ตรงโจทย์ ไม่ได้ถูกกำหนดโดยHTTP |
| MySQL error | ER_DUP_ENTRY/1062,ER_NO_REFERENCED_ROW_2/1452 | errorจากdriver/Terminal | handlerแปลงเป็นHTTPและJSONอีกที |

**ห้าม:** `res.status(1062)` หรือคิดว่าPRODUCT_NOT_FOUNDเป็นHTTPstatus ตัวอย่างการแปลง: MySQL1062 →HTTP409 →error.code='DUPLICATE_KEY' (ชื่อสุดท้ายต้องตามโจทย์)

## รหัสกลุ่มใหญ่

| กลุ่ม | ความหมาย | ในข้อสอบใช้อย่างไร |
|---|---|---|
| 1xx | ข้อมูลระหว่างดำเนินการ | ไม่ใช่ผลCRUDทั่วไป ไม่ต้องเพิ่มrouteเพื่อใช้ |
| 2xx | ทำงานสำเร็จ | GET/PUTมัก200,POSTมัก201,DELETEอาจ204 |
| 3xx | เปลี่ยนเส้นทาง/ใช้cache | ไม่ใช่errorDB;ดูLocation/cache |
| 4xx | ปัญหาที่request/สิทธิ์/สถานะresource | แยกvalidation/notfound/conflictตามเหตุ |
| 5xx | ฝั่งserverหรือgatewayทำงานไม่ได้ | อ่านTerminal/ระบบปลายทาง ไม่กลบด้วย200 |

<a id="status-table"></a>
## ตารางรหัสที่ควรรู้

**คอลัมน์ขอบเขต:** “หลัก” คือพบในโครงตัวอย่างหรือแนวCRUD; “ตามโจทย์” คืออย่าเพิ่มระบบขึ้นมาเพียงเพื่อให้มีรหัสนี้

| รหัส | ชื่อ | ใช้เมื่อ/ตัวอย่าง | วิธีตอบExpress | สิ่งที่ตรวจ/จุดสับสน | ขอบเขต |
|---|---|---|---|---|---|
| 200 | OK | GETรายการ/รายตัว,PUTสำเร็จ,DELETEที่โจทย์ให้JSON | `res.status(200).json(body)` | 200อย่างเดียวไม่ยืนยันว่ามีINSERT/UPDATEจริง ต้องGET/SQLตรวจ | หลัก |
| 201 | Created | POSTสร้างresourceใหม่จริง | `res.status(201).json(body)` | IDจากDB;ถ้าโจทย์กำหนดLocationต้องมีGETตามLocationได้ ไม่ใช้201กับPUTแก้แถวเดิมโดยอัตโนมัติ | หลัก |
| 202 | Accepted | รับงานไว้แต่ยังประมวลผลไม่เสร็จ | `res.status(202).json(body)` | ไม่เหมาะกับINSERTที่เสร็จแล้วในCRUDธรรมดา | ตามโจทย์ |
| 204 | No Content | DELETEสำเร็จโดยไม่ส่งbody | `res.status(204).end()` | ไม่ใช้json({})/ข้อความกับ204;ว่างไม่ใช่error | หลัก |
| 301 | Moved Permanently | redirectถาวร | `res.redirect(301,url)` | ตรวจLocation;บางclientอาจเปลี่ยนmethodตามพฤติกรรมredirect | ตามโจทย์ |
| 302 | Found | redirectชั่วคราว | `res.redirect(302,url)` | ถ้าคาดJSONแต่ได้หน้าloginให้ดูredirectchain | ตามโจทย์ |
| 304 | Not Modified | conditionalGETใช้cacheเดิม | `res.status(304).end()` | ไม่มีresponsebody;ไม่ได้แปลว่าDBUPDATEไม่เปลี่ยน | ตามโจทย์ |
| 307 | Temporary Redirect | redirectชั่วคราวคงmethod/body | `res.redirect(307,url)` | ใช้เมื่อจำเป็นต้องคงPOST/PUTระหว่างredirect | ตามโจทย์ |
| 308 | Permanent Redirect | redirectถาวรคงmethod/body | `res.redirect(308,url)` | ไม่ต้องเพิ่มให้APICRUDที่ไม่ใช้redirect | ตามโจทย์ |
| 400 | Bad Request | JSONผิด,ชนิด/ฟิลด์ผิด,query/idผิดตามสเปก | `res.status(400).json(body)` | ในโครงหลักvalidation/FKไม่มีจริงเป็น400;ไม่ใช้กับDBล่ม | หลัก |
| 401 | Unauthorized | ไม่มี/ไม่ผ่านcredentialsสำหรับระบบที่ต้องauth | `res.set('WWW-Authenticate','Bearer').status(401).json(body)` | ต่างจาก403;challengeต้องตรงauthschemeที่ระบบใช้ | ตามโจทย์ |
| 403 | Forbidden | serverเข้าใจrequestแต่ปฏิเสธสิทธิ์ เช่นผู้ใช้ไม่มีroleที่อนุญาต | `res.status(403).json(body)` | ไม่ใช้แทน404ของสินค้าที่ไม่มี;ไม่ใช่สิ่งเดียวกับCORS | ตามโจทย์ |
| 404 | Not Found | resourceไม่พบ หรือไม่มีrouteตรงURL | `res.status(404).json(body)` | แยกPRODUCT_NOT_FOUNDกับENDPOINT_NOT_FOUNDเพื่อหาจุดแก้ | หลัก |
| 405 | Method Not Allowed | URL/resourceมี แต่methodนี้ไม่รองรับ | `res.set('Allow','GET, POST').status(405).json(body)` | Expressไม่ได้สร้างJSON405ให้ทุกrouteเอง;ถ้าโจทย์กำหนดต้องทำhandlerและAllowให้ตรงจริง | ตามโจทย์ |
| 406 | Not Acceptable | serverส่งrepresentationตามAcceptไม่ได้ | `res.status(406).json(body)` | Acceptบอกชนิดที่อยากรับ;ต่างจากContent-Typeที่บอกสิ่งที่ส่ง | ตามโจทย์ |
| 408 | Request Timeout | รับrequestไม่ครบตามเวลาที่serverรอ | `res.status(408).end()` | ไม่ใช่ทุกกรณีที่PostmantimeoutจะมีHTTP408กลับมา | ตามโจทย์ |
| 409 | Conflict | SKU/PKซ้ำ หรือresourceถูกอ้างอิงจนลบไม่ได้ตามcontract | `res.status(409).json(body)` | UPDATEใช้SKUเดิมของตัวเองต้องไม่ติดซ้ำกับตัวเอง | หลัก |
| 412 | Precondition Failed | เงื่อนไขจากrequestheaderไม่ผ่าน เช่นIf-Match | `res.status(412).json(body)` | ไม่ใช้แทนทุกbusinessvalidation;ต้องมีpreconditionจริง | ตามโจทย์ |
| 413 | Content Too Large | requestbodyเกินlimitที่รับ | `res.status(413).json(body)` | express.jsonมีขนาดจำกัด;เปลี่ยนlimitเมื่อจำเป็นตามโจทย์ | ตามโจทย์ |
| 415 | Unsupported Media Type | POST/PUTส่งชนิดเนื้อหาที่ระบบไม่รองรับ | `res.status(415).json(body)` | ตัวอย่างส่งtext/plainแต่endpointรับJSON;express.jsonอย่างเดียวไม่ได้บังคับ415เสมอ | ตามโจทย์ |
| 422 | Unprocessable Content | เนื้อหาอ่านได้แต่ประมวลผลตามความหมายไม่ได้ตามcontractที่เลือก | `res.status(422).json(body)` | Labนี้มักใช้400กับvalidation อย่าเปลี่ยนเป็น422เพราะจำมาจากที่อื่น | ตามโจทย์ |
| 429 | Too Many Requests | เกินrate limit | `res.status(429).json(body)` | ถ้าระบุRetry-Afterต้องเป็นค่าที่ถูก ไม่ใช่errorSQL | ตามโจทย์ |
| 500 | Internal Server Error | bug/เหตุภายในที่ไม่ได้คาด เช่นSQLcolumnผิด | `res.status(500).json(body)` | clientเห็นข้อความกลาง;อ่านerrorจริงในTerminal;ไม่เผยSQL/password/stack | หลัก |
| 501 | Not Implemented | serverไม่รองรับความสามารถที่จำเป็นต่อrequest | `res.status(501).json(body)` | ไม่ใช้เป็นคำตอบปล่อยฟังก์ชันข้อสอบว่าง;405เหมาะกับmethodที่resourceไม่อนุญาต | ตามโจทย์ |
| 502 | Bad Gateway | gateway/proxyได้responseไม่ถูกจากupstream | `res.status(502).json(body)` | มักตรวจproxy→API;directExpressที่DBพังไม่ใช่502โดยอัตโนมัติ | ตามโจทย์ |
| 503 | Service Unavailable | บริการไม่พร้อมชั่วคราว | `res.status(503).json(body)` | อาจใช้ในreadiness/maintenanceตามโจทย์;DBล่มในโครงหลักอาจเปิดserverไม่สำเร็จเลย | ตามโจทย์ |
| 504 | Gateway Timeout | gatewayรอupstreamจนหมดเวลา | `res.status(504).json(body)` | ไม่เหมือนPostmanตั้งtimeoutเองแล้วไม่ได้HTTPresponse | ตามโจทย์ |

ตัวอย่างres.statusในตารางเป็นการแสดงวิธีใช้ ต้องมีตัวแปรbody/urlจริงในบริบท หากใช้โครงคู่มือให้เรียกapiResponseหรือthrowAppErrorตามendpoint ไม่วางresponseซ้ำหลังhelper

<a id="crud-map"></a>
## ตาราง CRUD ตามแนวสอบ

| งาน | สำเร็จทั่วไปในตัวอย่าง | กรณีผิดที่ต้องลอง | กลับไปทำ |
|---|---|---|---|
| GET list |200dataarray;ไม่มีข้อมูลเป็น[] | queryผิด400ตามpolicy | [Read/Pagination](INT161-EXAM-HANDBOOK.md#p4) |
| GET detail |200dataobject | idผิดชนิด400;idไม่มี404 | [Service](INT161-EXAM-HANDBOOK.md#p6) |
| POST |201พร้อมข้อมูลที่สร้างจริง | bodyผิด400;uniqueซ้ำ409;FKไม่มี400ตามตัวอย่าง | [PostmanCreate](INT161-EXAM-HANDBOOK.md#p9) |
| PUT |200พร้อมค่าหลังแก้ | bodyผิด400;idไม่มี404;SKUของแถวอื่น409 | [PUTตัวเลือก](INT161-EXAM-HANDBOOK.md#put-full) |
| DELETE |204ไม่มีbody หรือ200ตามโจทย์ | idไม่มี404;ถูกอ้างอิง409ตามcontract | [Route](INT161-EXAM-HANDBOOK.md#p7) |

ไม่ใช่ทุกPOSTต้อง201เสมอในทุกระบบ แต่ข้อสอบนี้ให้ยึดสถานะที่ระบุ ไม่เลือก202/422แทนเอง

<a id="examples"></a>
## ตัวอย่าง response และวิธีอ่าน

### 201 สร้างสำเร็จ

```json
{
  "success": true,
  "data": {"id": 76, "sku": "EXAM-PRACTICE-001", "name": "Practice Phone"}
}
```

รูปนี้ย่อเพื่ออ่านความหมายเท่านั้น ไม่ใช่DTOครบของWeek8;ID76เป็นตัวอย่าง ห้ามhardcode;คู่มือหลักคืนfullDTOและtimestampตามPOLICY

### 404 ข้อมูลไม่พบ

```json
{
  "success": false,
  "error": {"code": "PRODUCT_NOT_FOUND", "message": "Product was not found"}
}
```

ถ้าcodeเป็นENDPOINT_NOT_FOUNDให้ตรวจURL/method/mountก่อนDB ส่วนPRODUCT_NOT_FOUNDให้ตรวจID/ฐาน/แถวจริง

### 409 ค่าซ้ำ

```json
{
  "success": false,
  "error": {"code": "DUPLICATE_KEY", "message": "SKU already exists"}
}
```

จงใจส่งSKUซ้ำแล้วได้409คือผลที่ถูก ไม่ควรแก้ให้200 หากต้องสร้างใหม่ให้เปลี่ยนSKU

### 500 เหตุภายใน

```json
{
  "success": false,
  "error": {"code": "INTERNAL_SERVER_ERROR", "message": "Internal server error"}
}
```

ไปอ่านTerminalเช่น `ER_BAD_FIELD_ERROR Unknown column 'brandId'` แล้วใช้ [P5](INT161-EXAM-HANDBOOK.md#p5) แก้ชื่อcolumn ไม่แก้handlerให้ตอบsuccess

## คู่ที่มักสับสน

| คู่ | แยกอย่างไร |
|---|---|
| 200/201 | สำเร็จทั่วไป/สร้างใหม่ตามcontract |
| 200/204 | มีbodyตามโจทย์/ไม่มีbody |
| 400/404 | requestผิดรูปแบบหรือเงื่อนไข/รูปแบบkeyถูกแต่ไม่พบข้อมูล |
| 401/403 | credentialsไม่ผ่านหรือไม่มี/ปฏิเสธสิทธิ์ ไม่ควรเหมารวมกับCORS |
| 404/405 | ไม่พบresource/URLกับmethodนี้ไม่อนุญาต ต้องตั้งAllowเมื่อใช้405 |
| 400/409 | validationผิด/ชนสถานะข้อมูลเดิม เช่นunique |
| 406/415 | Acceptที่อยากรับ/Content-Typeของbodyที่ส่ง |
| HTTP500/ECONNREFUSED | ได้responseจากserverว่าerror/ยังเชื่อมHTTPserverไม่ได้ |
| HTTP404/MySQL1146 | resourceไม่พบตามAPI/ตารางSQLไม่มี ซึ่งเป็นปัญหาschemaและมักกลายเป็น500 |
| DELETEซ้ำ404/idempotent | ทำซ้ำแล้วสถานะระบบยังไม่มีแถวเหมือนเดิมได้ แม้statusต่างจากครั้งแรก |

## ถ้าโจทย์ต้องการ405/415/413เพิ่ม

โครงหลักไม่ได้เพิ่มกฎเหล่านี้อัตโนมัติ ตัวอย่างต่อไปนี้ต้องใส่ก่อนmutation และตรวจเฉพาะขอบเขตที่โจทย์กำหนด

**415 — ในproductrouteก่อนPOST/PUThandlers** (ต้องมีAppErrorimport):

```js
// ไฟล์: src/routes-$id/route.js — เพิ่ม import ด้านบน
import { AppError } from '../middlewares-$id/error-handler.js';
// วางก่อน route POST/PUT;โจทย์นี้รับapplication/json
router.use((req,res,next) => {
  if (['POST','PUT'].includes(req.method) && !req.is('application/json')) {
    return next(new AppError('Use application/json',415,'UNSUPPORTED_MEDIA_TYPE'));
  }
  next();
});
```

**405 — วางหลังhandlersของpathนั้น ก่อนexportrouter** รายการAllowต้องตรงกับhandlersที่มีจริง เช่นproductscollectionรองรับGET/HEAD/POST:

```js
// ไฟล์: src/routes-$id/route.js — วางหลัง GET/POST routes ปกติ
// ต้องมี AppError import ตามด้านบน
router.all('/',(req,res,next) => {
  res.set('Allow','GET, HEAD, POST');
  next(new AppError('Method not allowed',405,'METHOD_NOT_ALLOWED'));
});
```

ถ้าโจทย์รวมOPTIONSต้องออกแบบAllow/OPTIONSให้ตรงเพิ่ม;ตัวอย่างนี้ไม่ใช่การสร้าง405ทุกpathทั้งแอป

**413 — ในerror-handlerหลังตรวจJSONparseก่อนสร้างbody**:

```js
// ไฟล์: src/middlewares-$id/error-handler.js — เพิ่มในฟังก์ชัน errorHandler
if (err.type === 'entity.too.large') {
  [statusCode, code, message] = [413,'PAYLOAD_TOO_LARGE','Request body is too large'];
}
```

**406 — ถ้าโจทย์กำหนดให้ตรวจAcceptก่อนเขียนข้อมูล:** เพิ่มmiddlewareก่อนPOST/PUTพร้อม415:

```js
// ไฟล์: src/routes-$id/route.js — เพิ่มก่อน handlersที่เขียนข้อมูล
router.use((req,res,next) => {
  if (['POST','PUT'].includes(req.method) && !req.accepts('json')) {
    return next(new AppError('JSON response is required',406,'NOT_ACCEPTABLE'));
  }
  next();
});
```

ตัวอย่าง406ส่งJSONerrorตามรูปแบบข้อสอบที่กำหนด หากโจทย์ใช้contentnegotiationอื่นให้ทำตามcontractจริง

## แหล่งอ้างอิง

- [IANA HTTP Status Code Registry](https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml)
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [Express API](https://expressjs.com/en/5x/api.html)
- รูปแบบerror/codeและCRUDอิงใบงานINT161Week6/Week8ที่ผู้ใช้แนบ;ชื่อbusinesscodeไม่ใช่มาตรฐานHTTP

[กลับคู่มือหลัก](INT161-EXAM-HANDBOOK.md) • [เปิดPostmanทีละขั้น](INT161-EXAM-HANDBOOK.md#p9) • [กลับตารางรหัส](#status-table)
