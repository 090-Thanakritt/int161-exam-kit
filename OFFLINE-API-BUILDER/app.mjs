import { buildProject,TEMPLATE_PATHS,normalizeSpec } from './generator.mjs';
import { makeZip } from './zip.mjs';
import { topics,exampleFields } from './catalog.mjs';
import { parseSchema } from './sql-parser.mjs';
import { matchQuestion } from './matcher.mjs';
import { parseQuestion,tentativeFields,matchField } from './question-parser.mjs';

const clone=x=>structuredClone(x);
const sampleQuestion=`ตัวอย่างสมมุติ (เปลี่ยนตามใบงานจริง)
Student ID: 67130500004
Database: mobile_distributor
GET /api/67130500004/products?page=1&limit=10
Summary DTO: id, sku, name, price, status
GET /api/67130500004/products/:id → 200; ไม่พบ → 404
POST /api/67130500004/products → 201; SKU ซ้ำ → 409
Request Body: {"sku":"DEMO-PHONE-001","name":"Demo Phone","brand_id":1,"price":29900,"status":"AVAILABLE"}
PUT /api/67130500004/products/:id → 200; ไม่พบ → 404
DELETE /api/67130500004/products/:id → 204; ไม่พบ → 404`;
const sampleQuestions=[
  {id:'crud',label:'1 · CRUD ครบ + pagination + DTO (ไทย/อังกฤษ)',text:sampleQuestion},
  {id:'read',label:'2 · GET รายการและรายละเอียด (ไทย)',text:`ตัวอย่างสมมุติ: ระบบหนังสือ
Student ID: 67130500004
Database: library_exam
GET /api/67130500004/books?page=2&limit=5 แสดงรายการหนังสือแบบแบ่งหน้า
Summary DTO: id, title, price
GET /api/67130500004/books/:id แสดงรายละเอียด ตอบ 200 เมื่อพบ และ 404 เมื่อไม่พบ`},
  {id:'write',label:'3 · POST + PUT + DELETE และ error (English)',text:`Practice question: Inventory API
Student ID: 67130500004
Database: inventory_exam
POST /api/67130500004/items returns 201; duplicate code returns 409.
Request Body: {"code":"DEMO-001","name":"Demo Item","quantity":5,"price":120.5}
PUT /api/67130500004/items/:id updates an existing item; 404 if ID is absent.
DELETE /api/67130500004/items/:id returns 204 No Content; 404 if ID is absent.`},
  {id:'search',label:'4 · Search + JOIN + Detail DTO (ไทย/อังกฤษ)',text:`ตัวอย่างสมมุติ: ค้นหาสินค้าพร้อมชื่อแบรนด์
Student ID: 67130500004
Database: mobile_distributor
GET /api/67130500004/products?q=phone&page=1&limit=10 ค้นหาชื่อสินค้าแบบแบ่งหน้า
Summary DTO: id, name, brandId, price
GET /api/67130500004/products/:id → Detail DTO: id, name, brandId, brandName, price
JOIN brands โดย products.brand_id = brands.id; แสดง brands.name เป็น brandName
ถ้าไม่พบ ID ตอบ 404`},
  {id:'files',label:'5 · โจทย์สั่งแก้ไฟล์ที่ระบุ (English/ไทย)',text:`ตัวอย่างสมมุติ: โปรเจกต์สินค้า
Student ID: 67130500004
Database: mobile_distributor
Add GET /api/67130500004/products in src/routes-$id/route.js
เพิ่ม SQL SELECT รายการสินค้าลงใน src/repositories-$id/repository.js
แก้ DTO ให้ตอบ id, name, price ใน src/mappers-$id/entity-dto-mapper.js
Mount the route in src/app.js
Check package.json and add dependencies only if missing`}
];
let selectedSampleId='crud';
const state={
  db:{database:'YOUR_DATABASE',host:'127.0.0.1',port:3306,user:'root',password:''},
  port:3000,studentId:'YOUR_STUDENT_ID',studentName:'YOUR_NAME',secretKey:'',
  basePath:'/api/YOUR_STUDENT_ID',endpoint:'/items',table:'items',
  key:{column:'id',type:'number',auto:true},
  fields:[
    {db:'id',body:'id',output:'id',type:'integer',required:false,summary:true,writable:false},
    {db:'name',body:'name',output:'name',type:'string',required:true,summary:true,writable:true},
    {db:'price',body:'price',output:'price',type:'number',required:false,summary:true,writable:true}
  ],
  searchColumn:'name',join:{table:'brands',foreignKey:'brand_id',targetKey:'id',display:'name',output:'brandName'},
  page:1,limit:10,maxLimit:100,updateMode:'partial',deleteStatus:204,timestamp:true,
  requestExample:null,
  features:{identity:false,list:false,detail:false,create:false,update:false,remove:false,search:false,pagination:false,join:false,dto:false}
};
let sqlFileName='', selectedSqlTable='', questionText='';
let view='start', activeFile='src/app.js', sqlText='', parsedTables=[], searchText='', templates=null, compiled=null, lastError='';
const content=document.querySelector('#content');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const input=(label,key,value,hint='',type='text')=>`<div class="field"><label for="${key}">${label}</label><input class="input" id="${key}" data-key="${key}" type="${type}" value="${esc(value)}"><span class="hint">${hint}</span></div>`;
const option=(value,selected)=>`<option value="${esc(value)}" ${value===selected?'selected':''}>${esc(value)}</option>`;
const samplePicker=()=>`<label class="sample-picker" for="sample-choice">เลือกโจทย์ตัวอย่าง / Sample type
  <select id="sample-choice">${sampleQuestions.map(item=>`<option value="${item.id}" ${item.id===selectedSampleId?'selected':''}>${esc(item.label)}</option>`).join('')}</select></label>
  <button class="button" data-sample-question>ใส่โจทย์ตัวอย่างในช่องค้นหา</button>`;
const select=(label,key,values,value,hint='')=>`<div class="field"><label for="${key}">${label}</label><select id="${key}" data-key="${key}">${values.map(v=>option(v,value)).join('')}</select><span class="hint">${hint}</span></div>`;
const checks=[
 ['identity','GET student-info','ข้อมูลผู้สอบ 200; เลือกเฉพาะโจทย์ที่ระบุ endpoint นี้'],
 ['list','GET รายการทั้งหมด','GET /resource; SELECT/ORDER BY และ response list'],
 ['detail','GET ตาม ID','GET /resource/:id; Detail DTO และ 404'],
 ['create','POST เพิ่มข้อมูล','POST raw JSON; 201, required fields, duplicate 409'],
 ['update','PUT แก้ข้อมูล','PUT raw JSON; partial/full และ 404'],
 ['remove','DELETE ลบข้อมูล','DELETE 204 ไม่มี body หรือ 200 ตามโจทย์'],
 ['search','ค้นหา','GET ?q=คำค้น; WHERE LIKE และ COUNT เงื่อนไขเดียวกัน'],
 ['pagination','แบ่งหน้า','GET ?page=1&limit=10; total/offset'],
 ['join','JOIN ตารางอื่น','ดึงชื่อจากตารางที่อ้างถึง; ต้องกรอก FK/PK'],
 ['dto','Summary / Detail DTO','กำหนด output key และติ๊ก field ที่แสดงใน list']
];
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),3500);}
function goto(name){view=name;render();window.scrollTo({top:0,behavior:'smooth'});}
function render(){
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===view));
  document.querySelector('#breadcrumb').textContent={start:'เริ่มต้น',setup:'ข้อมูลโจทย์',tasks:'เลือกข้อที่ต้องทำ',code:'โค้ดรวม',test:'ทดสอบ Postman',library:'ค้นคู่มือ'}[view];
  const count=Object.values(state.features).filter(Boolean).length;
  document.querySelector('#progress-count').textContent=count+'/10';
  document.querySelector('#progress-bar').style.width=(count*10)+'%';
  content.innerHTML=({start:renderStart,setup:renderSetup,tasks:renderTasks,code:renderCode,test:renderTest,library:renderLibrary}[view])();
}
function renderQuickSearch(){
  return `<div class="card quick-search" id="quick-search">
    <span class="kicker">SEARCH / ค้นโจทย์ออฟไลน์</span>
    <h2>วางโจทย์หรือพิมพ์คำค้นที่นี่</h2>
    <p class="plain">พิมพ์ไทยหรืออังกฤษ เช่น “GET /products?page=1&limit=10 ส่ง Summary DTO” ระบบจะแสดงหัวข้อที่ใกล้ที่สุด คำที่ตรง และเหตุผล</p>
    <label class="field" for="quick-question">ข้อความโจทย์ / Exam question
      <textarea id="quick-question" rows="4" placeholder="วางโจทย์ตรงนี้ แล้วกด ค้นหาโจทย์ →">${esc(questionText)}</textarea>
    </label>
    <div class="actions"><button class="button primary" data-go="library">ค้นหาโจทย์ →</button>${samplePicker()}<span class="hint">ทำงานในเครื่อง · ไม่ใช้ AI · ไม่ต้องต่ออินเทอร์เน็ต</span></div>
  </div>`;
}
function renderUseExample(){
  return `<div class="card">
    <h2>เว็บนี้ใช้ทำอะไร?</h2>
    <p class="plain">เว็บนี้เป็นตัวช่วยสร้าง <strong>ไฟล์โครง Express API</strong> จากข้อมูลที่คุณกรอกและข้อที่ติ๊ก ไม่ใช่ตัวส่งงาน และไม่ได้แก้เทมเพลตครูในเครื่องให้อัตโนมัติ</p>
    <div class="step-list">
      <div class="step"><b>1</b><div><strong>อ่านโจทย์และ SQL</strong><p>เช่น “GET /products/:id ตอบ 200 หรือ 404” เลือกตาราง products, endpoint /products และ PK id ในเมนู 01</p></div></div>
      <div class="step"><b>2</b><div><strong>ติ๊กสิ่งที่โจทย์สั่ง</strong><p>ตัวอย่างนี้ติ๊ก GET ตาม ID ในเมนู 02. ถ้ามี POST/PUT/DELETE เพิ่ม ก็ติ๊กเพิ่มในชุดเดียวกัน</p></div></div>
      <div class="step"><b>3</b><div><strong>ดาวน์โหลด ZIP โค้ดรวม</strong><p>เว็บสร้าง app, route, service, repository, mapper และ config ให้สัมพันธ์กัน. แตก ZIP แล้วคัดลอกไฟล์ src/ ไปยังตำแหน่งชื่อเดียวกันในเทมเพลตครู</p></div></div>
      <div class="step"><b>4</b><div><strong>รันและยิง Postman</strong><p>นำเข้า SQL ใน MySQL จริง, ตรวจ package.json, รัน API ด้วย npm start แล้วทดสอบ URL/status/body ตามโจทย์</p></div></div>
    </div>
    <p class="footnote">เลือกฟีเจอร์เพิ่มภายหลัง = ดาวน์โหลด ZIP ใหม่และใช้ไฟล์ชุดใหม่ที่สัมพันธ์กัน ไม่ต้องคัดโค้ดแต่ละ endpoint ไปแปะท้ายไฟล์เอง. <a href="docs/HOW-TO-USE.md" target="_blank" rel="noopener">อ่านวิธีวางไฟล์ทีละขั้น</a></p>
  </div>`;
}
function renderStart(){
  return `<span class="kicker">คู่มือสร้าง API แบบออฟไลน์</span><h1>อ่านโจทย์ → เลือกข้อ → ได้โค้ดรวม</h1>
  <p class="lead">สร้างจากชื่อไฟล์ในเทมเพลต Express ESM ของครู กรอก schema และ endpoint ตามโจทย์จริง เลือก GET/POST/PUT/DELETE หรือการค้นหา/JOIN/DTO ทีละข้อ แล้วเปิดไฟล์ที่เว็บสร้างใน VS Code หรือ WebStorm</p>
  <div class="notice"><strong>เตรียมก่อนสอบ:</strong> Node.js, MySQL, Postman Desktop, ZIP template ครู, SQL ที่แจกจริง และ npm dependencies ให้พร้อมก่อนช่วงห้าม Internet เว็บนี้ใช้ Node.js built-in server เพื่อเปิดหน้า localhost; การรัน API ที่สร้างยังต้องมี express/mysql2 ตาม package.json</div>
  ${renderQuickSearch()}
  ${renderUseExample()}
  <div class="grid three">
   <div class="card"><span class="kicker">01 / SOURCE</span><h3>ตั้งจากโจทย์จริง</h3><p class="plain">เปิด SQL ดู CREATE TABLE, PK, FOREIGN KEY, NOT NULL และ INSERT ก่อนกรอก. นำเข้าไฟล์ SQL เพื่อช่วยเติม field เบื้องต้นได้</p></div>
   <div class="card"><span class="kicker">02 / BUILD</span><h3>สะสมสิ่งที่เลือก</h3><p class="plain">ติ๊กแต่ละ endpoint. ไฟล์ repository/service/route/mapper จะอ้าง config เดียวกันและรวมใน ZIP เดียว</p></div>
   <div class="card"><span class="kicker">03 / VERIFY</span><h3>ทดสอบก่อนส่ง</h3><p class="plain">เปิดโปรเจกต์ใน IDE, เชื่อม MySQL, ทดสอบ Postman และตัวตรวจที่ข้อสอบแจก. ปรับ field/validation/response ให้ตรงใบงาน</p></div>
  </div>
  <div class="card"><h2>ลำดับทำในห้องสอบ</h2><div class="step-list">
  ${[['เปิด template','แตก ZIP แล้วเปิดโฟลเดอร์ที่มี package.json ใน WebStorm/VS Code'],
  ['นำเข้า SQL','อ่าน DROP/CREATE/USE แล้ว Test Connection, รัน SQL, SHOW CREATE TABLE'],
  ['กรอกข้อมูล','ใช้ชื่อ schema/table/column/endpoint จาก SQL และโจทย์ ห้ามเดาจากตัวอย่าง'],
  ['เลือกข้อ','GET/POST/PUT/DELETE, search, pagination, JOIN, DTO ตามโจทย์'],
  ['คัดลอกหรือดาวน์โหลด','ดาวน์โหลด ZIP โค้ดรวม วางใน template และเช็ก imports'],
  ['ทดสอบ','npm start, Postman raw JSON, กรณี 200/201/204/400/404/409']].map(([title,desc],i)=>`<div class="step"><b>${i+1}</b><div><strong>${title}</strong><p>${desc}</p></div></div>`).join('')}
  </div><div class="actions"><button class="button primary" data-go="setup">เริ่มกรอกโจทย์ →</button><button class="button" data-go="library">ค้นตัวอย่างที่เตรียมไว้</button></div></div>
  <div class="info">ตัวสร้างนี้รองรับ resource หลักหนึ่งตารางกับ JOIN หนึ่งตาราง และ key เดี่ยวแบบเลขหรือ string. Composite key, business rules และรูปแบบ response เฉพาะต้องใช้คู่มือที่แนบและแก้ต่อในโค้ด. ต้องทดสอบกับ MySQL จริงก่อนใช้ส่งงาน</div>`;
}
function renderSetup(){
  return `<span class="kicker">PHASE 01 / อ่านโจทย์</span><h1>กรอกค่าที่โจทย์กำหนด</h1>
  <p class="lead">ค่าทุกช่องจะไปอยู่ใน <code>src/configs-$id/exam-config.js</code>. ป้ายใต้ช่องบอกว่าจะหาได้จาก SQL หรือจากข้อสอบ. รหัส MySQL และ Secret Key ไม่ถูกเก็บใน browser storage</p>
  <div class="card"><div class="section-head"><h2>นำเข้า SQL ช่วยกรอก</h2><span class="tag">OPTIONAL · LOCAL FILE</span></div><div class="grid">
  <div class="field"><label for="sql-file">เลือกไฟล์ SQL / Choose SQL file</label><input class="input" type="file" accept=".sql,text/plain" id="sql-file"><span class="hint">อ่านไฟล์ในเครื่องเท่านั้น ไม่ได้นำเข้าฐานข้อมูลอัตโนมัติ</span>
  <div class="file-state" role="status">${sqlFileName?'เลือกแล้ว: '+esc(sqlFileName):'ยังไม่ได้เลือกไฟล์ SQL'} · ${parsedTables.length} ตารางที่อ่านพบ</div></div>
  <div class="field"><label for="sql-table">เลือกตารางจากไฟล์ / Select a table</label><select id="sql-table"><option value="">— เลือกตาราง —</option>${parsedTables.map(t=>option(t.name,selectedSqlTable)).join('')}</select><span class="hint">เลือกหนึ่งตารางเป็น resource หลัก; คลิกชื่ออื่นเพื่อเปลี่ยนได้ตลอด</span></div></div>
  ${parsedTables.length?`<div class="table-choice"><strong>ตารางทั้งหมดใน ${esc(sqlFileName)}</strong><div class="table-buttons">${parsedTables.map(t=>`<button class="button small ${selectedSqlTable===t.name?'selected':''}" data-use-table="${esc(t.name)}" type="button">${esc(t.name)} · ${t.fields.length} columns ${t.key?'· PK '+esc(t.key):''}</button>`).join('')}</div><p class="footnote">ตรวจ CREATE TABLE, FOREIGN KEY, DEFAULT และ required กับ SQL จริงอีกครั้ง ตัวอ่าน SQL รองรับรูปแบบพื้นฐาน</p></div>`:'<p class="footnote">หลังเลือกไฟล์ รายชื่อตารางที่อ่านได้จะปรากฏตรงนี้ ถ้าไม่พบตาราง ให้เปิด SQL ตรวจ CREATE TABLE ด้วยตนเอง</p>'}</div>
  <div class="card"><h2>ฐานข้อมูลและตัวตน</h2><div class="grid">
  ${input('ชื่อฐานข้อมูล','db.database',state.db.database,'ดู CREATE DATABASE หรือ USE ในไฟล์ SQL')}
  ${input('MySQL Host','db.host',state.db.host,'ดูใน WebStorm Data Source หรือคำสั่งของผู้สอน')}
  ${input('MySQL Port','db.port',state.db.port,'ปกติ 3306; คนละพอร์ตกับ Express','number')}
  ${input('MySQL User','db.user',state.db.user,'บัญชีที่ Test Connection ผ่าน')}
  ${input('MySQL Password','db.password',state.db.password,'ใส่รหัสของเครื่องในวันสอบ; อย่า push รหัสจริง','password')}
  ${input('Express Port','port',state.port,'ดูโจทย์/runner เช่น 3000','number')}
  ${input('รหัสนักศึกษา','studentId',state.studentId,'ดูใบงานส่วนตัว ไม่ใช้รหัสตัวอย่างของเพื่อน')}
  ${input('ชื่อสำหรับ student-info','studentName',state.studentName,'กรอกเมื่อโจทย์มี endpoint identity')}
  ${input('Secret Key','secretKey',state.secretKey,'กรอกเฉพาะที่โจทย์แจก','password')}
  ${input('Base path','basePath',state.basePath,'เช่น /api/รหัสนักศึกษา; ต้องตรงโจทย์')}
  </div><div class="actions"><button class="button primary" data-save="setup">บันทึกค่า → ไปกรอก resource</button></div></div>
  <div class="card"><h2>Resource หลักและคีย์</h2><div class="grid">
  ${input('ชื่อตารางใน MySQL','table',state.table,'ดู SHOW TABLES และ SHOW CREATE TABLE')}
  ${input('URL ของ resource','endpoint',state.endpoint,'เช่น /products; ต่อท้าย base path ใน app.js')}
  ${input('ชื่อคอลัมน์ Primary Key','key.column',state.key.column,'ดู PRIMARY KEY ใน SQL; ไม่ใช่ชื่อ response เสมอ')}
  ${select('ชนิด Primary Key','key.type',['number','string'],state.key.type,'productCode/officeCode แบบข้อความเลือก string')}
  <div class="field"><label><input type="checkbox" data-check="key.auto" ${state.key.auto?'checked':''}> Primary Key เป็น AUTO_INCREMENT</label><span class="hint">ดูใน SHOW CREATE TABLE; ถ้าไม่ auto ต้องรับค่า key ใน POST</span></div>
  </div></div>
  <div class="card"><div class="section-head"><h2>Field mapping: SQL → Body → Response</h2><button class="button small" data-add-field>+ เพิ่ม field</button></div>
  <p class="plain">ตัวอย่าง <code>brand_id</code> ใน SQL และ POST อาจต้องตอบเป็น <code>brandId</code>. ช่องแต่ละแถวชี้ชัดว่าจะใช้ชื่อใดในโค้ด. PK แบบ AUTO_INCREMENT ให้ปิด “เขียนได้”</p>
  <div class="table-wrap"><table><thead><tr><th>SQL column</th><th>Request body</th><th>Response JSON</th><th>ชนิด</th><th>POST บังคับ</th><th>GET list</th><th>เขียนได้</th><th></th></tr></thead><tbody>
  ${state.fields.map((f,i)=>`<tr><td><input class="input" data-field="${i}.db" value="${esc(f.db)}"></td><td><input class="input" data-field="${i}.body" value="${esc(f.body)}"></td><td><input class="input" data-field="${i}.output" value="${esc(f.output)}"></td><td><select data-field="${i}.type">${['string','number','integer','boolean','date'].map(v=>option(v,f.type)).join('')}</select></td><td><input type="checkbox" data-field="${i}.required" ${f.required?'checked':''}></td><td><input type="checkbox" data-field="${i}.summary" ${f.summary?'checked':''}></td><td><input type="checkbox" data-field="${i}.writable" ${f.writable?'checked':''}></td><td><button class="button danger small" data-remove-field="${i}">ลบ</button></td></tr>`).join('')}
  </tbody></table></div><p class="footnote">เมื่อเปลี่ยนชื่อ DB column ให้ตรวจ SQL ใน repository และ property ใน DTO; เมื่อเปลี่ยนชื่อ response ให้ตรวจตัวอย่าง JSON และ Postman</p></div>
  <div class="actions"><button class="button primary" data-go="tasks">เลือกข้อที่โจทย์ให้ทำ →</button><button class="button" data-preset="mobile">เติมตัวอย่าง Mobile Distributor</button></div>`;
}
function renderTaskGuide(){
  return `<div class="info"><strong>ตัวอย่าง:</strong> โจทย์ให้ GET /products และ POST /products → ติ๊ก GET รายการทั้งหมด + POST เพิ่มข้อมูล. เมนู 03 จะสร้าง route/service/repository ที่รวมทั้งสองข้อ. ถ้าไม่มี DELETE ก็ไม่ต้องติ๊ก. <strong>ไม่ต้องเลือกชื่อไฟล์เอง</strong> เพราะ ZIP จัดไฟล์ที่เกี่ยวข้องให้ครบ</div>`;
}
function renderTasks(){
  return `<span class="kicker">PHASE 02 / เลือกเฉพาะที่โจทย์สั่ง</span><h1>สะสมข้อที่ต้องทำ</h1><p class="lead">ติ๊กข้อที่ต้องการ โค้ดรวมจะเปิด route เฉพาะข้อที่เลือก. Search และ Pagination เปิด GET list ให้โดยอัตโนมัติ</p>
  ${renderTaskGuide()}
  <div class="grid"><div class="card"><h2>Endpoints และการแปลงข้อมูล</h2>
  ${checks.map(([id,name,desc])=>`<label class="task"><input type="checkbox" data-feature="${id}" ${state.features[id]?'checked':''}><span><strong>${name}</strong><small>${desc}</small></span><span class="tag">${id.toUpperCase()}</span></label>`).join('')}</div>
  <div><div class="card"><h2>นโยบายจากข้อสอบ</h2>
  ${select('วิธีตรวจ body ของ PUT / Update body policy','updateMode',['partial','full'],state.updateMode,'ดูคำอธิบายและตัวอย่างด้านล่างก่อนเลือก')}
  <div class="choice-explain"><p><strong>partial — ส่งเฉพาะฟิลด์ที่แก้</strong> เช่น <code>{"price":29900}</code> แล้วระบบแก้เพียง price. ใช้เมื่อโจทย์บอก “แก้ไขบางค่า”, “เฉพาะ field ที่ส่ง” หรือให้ body มาไม่ครบ</p>
  <p><strong>full — บังคับส่งฟิลด์ที่จำเป็นให้ครบ</strong> ถ้า required field ขาด จะตอบ 400. ใช้เมื่อโจทย์บอก “ส่งข้อมูลทั้งหมด” หรือกำหนด request body ครบชุด</p>
  <p>สองตัวเลือกนี้เป็น <em>กฎตรวจ body ของโครงตัวอย่าง</em> ไม่ใช่ชนิด PUT ทั้งหมด. PUT อาจมีการแทนข้อมูลทั้งรายการจริง ๆ, upsert หรือ field เฉพาะที่โจทย์กำหนด ซึ่งต้องปรับ service/repository เพิ่ม. PATCH เป็น HTTP method อีกอันและโครงนี้ยังไม่สร้าง route PATCH. ถ้าโจทย์ไม่ได้ระบุให้เริ่มที่ partial แล้วเทสกับตัวตรวจจริง</p></div>
  <div style="height:13px"></div>${select('DELETE สำเร็จตอบ','deleteStatus',['204','200'],String(state.deleteStatus),'204 ไม่มี response body')}
  <div style="height:13px"></div><label class="field"><span>Timestamp ใน response</span><span><input type="checkbox" data-check="timestamp" ${state.timestamp?'checked':''}> มี timestamp ตามโจทย์</span></label></div>
  <div class="card"><h2>Pagination / Search</h2><div class="grid">
  ${input('page เริ่มต้น','page',state.page,'เช่น 1','number')}
  ${input('limit เริ่มต้น','limit',state.limit,'เช่น 10','number')}
  ${input('limit สูงสุด','maxLimit',state.maxLimit,'เช่น 100','number')}
  ${input('ค้นหาใน SQL column','searchColumn',state.searchColumn,'เช่น name; body ไม่เกี่ยว')}
  </div></div>
  <div class="card"><h2>JOIN</h2><p class="plain">กรอกเฉพาะเมื่อโจทย์ให้ JOIN. ต้องมี FK ในตารางหลักและ PK ในตารางปลายทาง</p><div class="grid">
  ${input('ตารางที่ JOIN','join.table',state.join.table,'เช่น brands')}
  ${input('FK ในตารางหลัก','join.foreignKey',state.join.foreignKey,'เช่น brand_id')}
  ${input('PK ของตาราง JOIN','join.targetKey',state.join.targetKey,'เช่น id')}
  ${input('คอลัมน์ที่ต้องอ่าน','join.display',state.join.display,'เช่น name')}
  ${input('ชื่อ response JSON','join.output',state.join.output,'เช่น brandName')}
  </div></div></div></div>
  <div class="actions"><button class="button primary" data-go="code">ดูโค้ดรวม →</button><button class="button" data-go="library">ไม่แน่ใจ? ค้นตัวอย่าง</button></div>`;
}
function ensureProject(){
  if(!templates) throw new Error('ยังโหลดโครงไฟล์ไม่ครบ ลองรีเฟรชหน้าเว็บ');
  compiled=buildProject(state,templates,sqlText); lastError=''; return compiled;
}
function renderCodeGuide(){
  const selected=checks.filter(([id])=>state.features[id]).map(([,name])=>name);
  return `<div class="card">
    <h2>หลังเลือกข้อแล้ว ทำอะไรต่อ?</h2>
    <p class="plain"><strong>ข้อที่เลือก:</strong> ${selected.length?selected.map(esc).join(' · '):'ยังไม่ได้เลือกข้อ — กลับเมนู 02 ก่อน'}</p>
    <p class="plain"><strong>API ที่จะได้:</strong> <code>http://localhost:${esc(state.port)}${esc(state.basePath)}${esc(state.endpoint)}</code> (พอร์ตของ API; เว็บคู่มืออยู่ 4173)</p>
    <ol class="handoff">
      <li>กด <strong>ดาวน์โหลด ZIP โปรเจกต์</strong> แล้วแตกไฟล์. ZIP นี้มีโค้ดครบทั้งชุด ไม่จำเป็นต้องกดดาวน์โหลดทีละไฟล์</li>
      <li>เปิด <strong>โฟลเดอร์เทมเพลตครูที่มี package.json</strong> ใน VS Code/WebStorm. คัดลอกโฟลเดอร์ <code>src</code> จาก ZIP ที่สร้างไปวางในโฟลเดอร์นี้ โดยให้ชื่อ path ตรงกัน. ไฟล์ชื่อเดิมให้เปรียบเทียบก่อนแทน; ไฟล์ที่ไม่มีให้สร้างเพิ่ม</li>
      <li>เก็บ <code>tests/</code>, SQL และไฟล์อื่นที่ครูแจกไว้. ใน <code>package.json</code> ตรวจ dependencies และเพิ่ม script <code>"start": "node src/app.js"</code> ถ้ายังไม่มี. อย่าวาง package.json ที่สร้างทับโดยไม่ตรวจ</li>
      <li>ตรวจ <code>src/configs-$id/exam-config.js</code> เทียบโจทย์/SQL จริง, รัน MySQL, รัน <code>npm start</code>, แล้วไปเมนู 04 ทดสอบ Postman</li>
    </ol>
    <div class="table-wrap"><table><thead><tr><th>ไฟล์ใน ZIP</th><th>ทำอะไรในเทมเพลตครู</th><th>หน้าที่</th></tr></thead><tbody>
      <tr><td>src/app.js</td><td>เทียบแล้วแทนไฟล์เดิม</td><td>เปิด server และ mount routes</td></tr>
      <tr><td>src/routes-$id/route.js</td><td>เทียบแล้วแทนไฟล์เดิม</td><td>GET/POST/PUT/DELETE ตามที่ติ๊ก</td></tr>
      <tr><td>src/services-$id/service.js</td><td>เทียบแล้วแทนไฟล์เดิม</td><td>กฎตรวจ body และ 404</td></tr>
      <tr><td>src/repositories-$id/repository.js</td><td>เทียบแล้วแทนไฟล์เดิม</td><td>SQL กับ MySQL</td></tr>
      <tr><td>src/configs-$id/exam-config.js</td><td>สร้างเพิ่ม</td><td>ค่าที่กรอกในเว็บทั้งหมด</td></tr>
      <tr><td>src/configs-$id/db-config.js</td><td>เทียบแล้วแทนไฟล์เดิม</td><td>เชื่อมฐานข้อมูล</td></tr>
      <tr><td>src/mappers-$id/* และ src/middlewares-$id/*</td><td>เทียบไฟล์เดิม; เพิ่ม error-handler.js</td><td>DTO, response, pagination, error</td></tr>
      <tr><td>src/test-service.js</td><td>เทียบแล้วแทนไฟล์เดิม</td><td>ลองเชื่อม DB</td></tr>
      <tr><td>postman-collection.json / README-EXAM.md</td><td>เก็บไว้อ้างอิง</td><td>ตัวอย่าง request และลำดับตรวจ</td></tr>
    </tbody></table></div>
    <p class="footnote">ชื่อโฟลเดอร์ <code>-$id</code> ในตัวอย่างตรงกับเทมเพลตครูที่ตรวจไว้. ถ้าเทมเพลตที่แจกวันสอบเปลี่ยนชื่อ ต้องเปลี่ยนชื่อโฟลเดอร์และ import ทุกแห่งให้ตรงกัน. <a href="docs/HOW-TO-USE.md" target="_blank" rel="noopener">คู่มือวางไฟล์ละเอียด</a></p>
  </div>`;
}
function renderCode(){
  try{ensureProject()}catch(e){compiled=null;lastError=e.message;}
  const files=compiled?Object.keys(compiled):TEMPLATE_PATHS;
  if(!files.includes(activeFile))activeFile=files[0];
  return `<span class="kicker">PHASE 03 / CODE OUTPUT</span><h1>โค้ดรวมจากข้อที่เลือก</h1><p class="lead">เลือกชื่อไฟล์เพื่อดูโค้ด ก่อนคัดลอกอ่านคอมเมนต์ <code>// [แก้...]</code> และตรวจชื่อจาก SQL จริง. ZIP รวม package.json, Postman collection และ README สำหรับทดสอบ</p>
  ${lastError?`<div class="notice"><strong>ต้องกรอกเพิ่ม:</strong> ${esc(lastError)} <button class="button small" data-go="setup">กลับไปแก้ข้อมูล</button></div>`:''}
  ${renderCodeGuide()}
  <div class="card"><div class="section-head"><h2>${files.length} ไฟล์พร้อมตรวจ</h2><button class="button primary" data-download-project ${!compiled?'disabled':''}>ดาวน์โหลด ZIP โปรเจกต์ ↓</button></div>
  <div class="code-layout"><div class="file-list">${files.map(p=>`<button data-file="${esc(p)}" class="${p===activeFile?'active':''}">${esc(p)}</button>`).join('')}</div>
  <div class="code-panel"><div class="code-head"><strong>${esc(activeFile)}</strong><div><button class="button small" data-copy-file ${!compiled?'disabled':''}>คัดลอกไฟล์</button> <button class="button small" data-save-file ${!compiled?'disabled':''}>ดาวน์โหลดไฟล์</button></div></div><pre class="codebox"><code>${esc(compiled?.[activeFile]||'กรอกค่าให้ครบก่อนดูโค้ด')}</code></pre></div></div></div>
  <div class="info">ใช้ไฟล์ชุดเดียวกันทั้ง route → service → repository → mapper → response. เมื่อเปลี่ยน resource หรือชื่อ column ให้กลับไปแก้ Field mapping แล้วดาวน์โหลดใหม่. โค้ดนี้ไม่แก้ template ครูในเครื่องของคุณโดยอัตโนมัติ</div>
  <div class="actions"><button class="button primary" data-go="test">ไปทดสอบทีละข้อ →</button></div>`;
}
function renderPostmanExamples(){
  try{
    const collection=JSON.parse(ensureProject()['postman-collection.json']);
    if(!collection.item.length)return '<div class="info">ยังไม่ได้เลือกข้อในเมนู 02 จึงไม่มี request ตัวอย่าง</div>';
    return `<div class="card"><h2>Postman ตามข้อที่เลือก: URL และ raw JSON พร้อมแก้</h2>
      <p class="plain">เปิด Postman Desktop → New HTTP Request หรือ import postman-collection.json จาก ZIP. เลือก Method ตามหัวข้อ, วาง URL, แล้วกด Send. สำหรับ POST/PUT เลือก Body → raw → JSON; ตรวจ Content-Type: application/json</p>
      ${collection.item.map((item,i)=>{
        const request=item.request, raw=request.body?.raw;
        const expected=request.method==='POST'?'201 Created':request.method==='DELETE'?String(state.deleteStatus)+(state.deleteStatus===204?' No Content — ไม่มี body':' OK'):'200 OK';
        return `<div class="postman-case"><h3>${esc(request.method)} · ${esc(item.name)}</h3>
          <p><strong>URL:</strong> <code>${esc(request.url)}</code></p>
          ${raw?`<p><strong>Body → raw → JSON:</strong></p><pre class="rawbox"><code>${esc(raw)}</code></pre><button class="button small" data-copy-postman="${i}">คัดลอก raw JSON</button>`:'<p>ไม่ต้องส่ง Body</p>'}
          <p class="footnote">ผลที่คาด: ${expected}. เปลี่ยน /1 เป็น ID ที่มีจริง, แก้ค่าใน JSON ให้ตรงชนิด/unique/FK ของฐานจริง แล้วเทียบ response กับโจทย์</p>
        </div>`;
      }).join('')}
      <p class="footnote">ลำดับแนะนำ: GET ดู ID จริง → POST ด้วยค่า unique ใหม่ → GET ตรวจ → PUT ด้วย ID จริงและ raw JSON → GET ตรวจค่า → DELETE ข้อมูลทดสอบ → GET เดิมควร 404. ถ้าโจทย์ไม่ให้บาง method ให้ข้าม. หลีกเลี่ยงลบ seed ที่ runner ใช้</p>
    </div>`;
  }catch(e){return `<div class="notice">ยังสร้าง Postman ตัวอย่างไม่ได้: ${esc(e.message)} — กลับไปตรวจเมนู 01</div>`;}
}
function renderPostmanNegativeCases(){
  const base=`http://localhost:${state.port}${state.basePath}${state.endpoint}`;
  const cases=[];
  if(state.features.pagination)cases.push(['GET',base+'?page=0&limit=10','ไม่มี Body','400','page ต้องเป็นจำนวนเต็มบวก']);
  if(state.features.detail)cases.push(['GET',base+'/99999999','ไม่มี Body','404','เลือก ID ที่ยืนยันแล้วว่าไม่มีใน DB']);
  if(state.features.create){
    cases.push(['POST',base,'Body → raw → JSON: {}','400','ใช้เมื่อโจทย์/field mapping กำหนดฟิลด์บังคับ']);
    cases.push(['POST',base,'ส่ง raw JSON ชุดเดิมซ้ำหลัง POST ครั้งแรกสำเร็จ','409','ใช้เมื่อมี unique key เช่น SKU; เปลี่ยน SKU ก่อนทดสอบสร้างใหม่']);
  }
  if(state.features.update)cases.push(['PUT',base+'/99999999','Body → raw → JSON: {"name":"Changed"}','404','ใช้ ID ที่ไม่มีจริง; body key ต้องตรงตาราง']);
  if(state.features.remove)cases.push(['DELETE',base+'/99999999','ไม่มี Body','404','ใช้ ID ที่ไม่มีจริง; หลีกเลี่ยงลบ seed data']);
  return `<div class="card"><h2>ทดสอบกรณีผิดพลาด / Negative cases</h2>
    <p class="plain">ยิงหลังกรณีสำเร็จเพื่อเช็ก exception handling. สถานะที่คาดเป็นแนวของโครงที่สร้าง; ถ้าโจทย์กำหนดต่าง ให้ยึดโจทย์และแก้โค้ดก่อนทดสอบ</p>
    <div class="table-wrap"><table><thead><tr><th>Method</th><th>URL</th><th>ส่งอะไรใน Postman</th><th>คาด</th><th>ตรวจอะไร</th></tr></thead><tbody>
    ${cases.map(row=>`<tr>${row.map(cell=>`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')||'<tr><td colspan="5">เลือกฟีเจอร์ใน Phase 02 ก่อน แล้วกลับมาดูตัวอย่างตามโจทย์</td></tr>'}
    </tbody></table></div>
    <p class="footnote">500 คือข้อผิดพลาดที่ server ไม่คาดคิด: ดู Terminal/DB connection/SQL แล้วแก้ต้นเหตุ ไม่ต้องจงใจทำให้ระบบพังเพื่อทดสอบ. 403 ใช้เมื่อโจทย์มีกฎห้ามเข้าถึง; โครงนี้ไม่มี auth/role ให้เอง. 204 ต้องไม่มี response body.</p>
  </div>`;
}
function renderTest(){
  const base=`http://localhost:${state.port}${state.basePath}${state.endpoint}`;
  const rows=[
   ['1','เชื่อม DB','node src/test-service.js','ดูตารางและคีย์ใน SQL console ก่อน'],
   ['2','GET list','GET '+base+(state.features.pagination?'?page='+state.page+'&limit='+state.limit:''),'200; data เป็น array, pagination total นับทั้งชุด'],
   ['3','GET detail','GET '+base+'/1','200 เมื่อมี ID; 404 เมื่อไม่มี'],
   ['4','POST','POST '+base,'Body → raw → JSON; 201; เก็บ ID จาก response'],
   ['5','PUT','PUT '+base+'/<IDที่เพิ่งสร้าง>','ส่ง raw JSON ตาม partial/full แล้ว GET ตรวจข้อมูล'],
   ['6','DELETE','DELETE '+base+'/<IDที่เพิ่งสร้าง>',state.deleteStatus+'; GET เดิมหลังลบควร 404']
  ];
  const activeRows=rows; // Keep the complete manual checklist even before every method is selected.
  return `<span class="kicker">PHASE 04 / VERIFY</span><h1>ทดสอบให้ตรงโจทย์</h1><p class="lead">ZIP ที่ดาวน์โหลดมี <code>postman-collection.json</code> สำหรับ import ใน Postman Desktop. ทุก request เป็นตัวอย่าง ต้องแก้ ID, body, status ที่คาดให้ตรงโจทย์และข้อมูลในฐานจริง</p>
  <div class="card"><h2>เปิดโปรเจกต์ API</h2><div class="step-list">
  ${[['เปิดโฟลเดอร์','ใน VS Code: File → Open Folder เลือกโฟลเดอร์ที่แตกจาก ZIP; ใน WebStorm เปิดโฟลเดอร์ที่มี package.json'],
  ['ติดตั้ง dependencies','npm install หรือ npm ci เมื่อมี lockfile ตรงกัน; ต้องเตรียมก่อนช่วงห้ามอินเทอร์เน็ต'],
  ['นำเข้า SQL','ดู CREATE DATABASE/USE/CREATE TABLE ก่อนรันใน WebStorm Database หรือ mysql CLI: SOURCE C:/path/to/actual.sql;'],
  ['ตั้งค่าและรัน','ตรวจ src/configs-$id/exam-config.js กับ MySQL เครื่องจริง แล้ว npm start; ดู Terminal ว่าพอร์ต '+state.port+' เปิด'],
  ['ทดสอบทีละข้อ','Body → raw → JSON และ Content-Type: application/json; ใช้ ID ที่สร้างใหม่ในการลองแก้และลบ']].map(([a,b],i)=>`<div class="step"><b>${i+1}</b><div><strong>${a}</strong><p>${b}</p></div></div>`).join('')}
  </div></div><div class="card"><h2>ลำดับยิง Postman</h2><div class="table-wrap"><table><thead><tr><th>#</th><th>ทดสอบ</th><th>คำขอ/คำสั่ง</th><th>ผลที่ตรวจ</th></tr></thead><tbody>${activeRows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>
  ${renderPostmanExamples()}
  ${renderPostmanNegativeCases()}
  <div class="notice">GET 404 อาจเป็น path ผิดหรือ ID ไม่มีจริง; POST/PUT 400 ให้เช็ก body key/ชนิด/Content-Type; MySQL Unknown column ให้กลับไปดู SHOW COLUMNS และ Field mapping; 204 ห้ามมี body. [ดูตาราง HTTP status ในไฟล์คู่มือ]</div>
  <div class="actions"><button class="button primary" data-download-project>ดาวน์โหลด ZIP พร้อม Postman collection ↓</button><button class="button" data-go="library">เปิดหัวข้อแก้ error</button></div>`;
}
function renderQuestionPreview(){
  const parsed=parseQuestion(questionText);
  if(!parsed)return '';
  const generatedPaths=new Set([...TEMPLATE_PATHS,'src/configs-$id/exam-config.js']);
  const fileTasks=parsed.fileInstructions.map(item=>{
    const generated=generatedPaths.has(item.file);
    const action={add:'เพิ่ม/สร้าง',edit:'แก้ไข',replace:'แทนเนื้อหา',check:'ตรวจไฟล์'}[item.action];
    return `<div class="file-instruction"><p><strong>${esc(action)}:</strong> <code>${esc(item.file)}</code> ${generated?'<span class="tag">มีโค้ดตัวอย่างใน Phase 03</span>':'<span class="tag">ตรวจไฟล์ครูด้วยตนเอง</span>'}</p>
      <p class="footnote">ข้อความที่พบ: ${esc(item.instruction)}</p>
      ${generated?`<button class="button small" data-open-generated="${esc(item.file)}">เติมค่าที่พบแล้วเปิดโค้ดใน Phase 03</button>`:'<p class="footnote">เว็บไม่ได้สร้างไฟล์นี้ตามชื่อที่ระบุ; เปิด template ที่ครูให้และทำตามคำสั่งในโจทย์</p>'}
    </div>`;
  }).join('');
  const chosen=checks.filter(([id])=>parsed.features[id]).map(([,label])=>label);
  const values=[
    ['Student ID',parsed.studentId],['Base path',parsed.basePath],['Endpoint',parsed.endpoint],
    ['Table ที่ระบุชัด',parsed.table],['Database',parsed.database],['Express port',parsed.port],
    ['page / limit',[parsed.page,parsed.limit].filter(Boolean).join(' / ')],
    ['Request body keys',parsed.bodyFields.join(', ')],['Summary DTO fields',parsed.summaryFields.join(', ')]
  ].filter(([,value])=>value);
  return `<div class="card parsed-question">
    <h2>สรุปที่อ่านได้จากโจทย์ / Extracted task</h2>
    <p class="plain">ระบบอ่านคำ, URL และ JSON ในข้อความเพื่อช่วยกรอกช่อง. ตรวจทุกค่ากับโจทย์และ SQL จริงก่อนใช้</p>
    <p class="plain"><strong>ควรทำ:</strong> ${chosen.length?chosen.map(esc).join(' · '):'ยังระบุฟีเจอร์ไม่ได้ — เลือกเองในเมนู 02'}</p>
    ${values.length?`<div class="table-wrap"><table><thead><tr><th>สิ่งที่พบ</th><th>ค่า</th><th>ตรวจต่อ</th></tr></thead><tbody>${values.map(([label,value])=>`<tr><td>${esc(label)}</td><td><code>${esc(value)}</code></td><td>${label.includes('Table')?'SQL / SHOW CREATE TABLE':'ใบงานจริง'}</td></tr>`).join('')}</tbody></table></div>`:'<p class="empty">ยังไม่พบค่า URL หรือ field ที่กรอกได้</p>'}
    ${fileTasks?`<h3>โจทย์ระบุให้ทำในไฟล์ / File-specific instructions</h3>${fileTasks}<p class="footnote">ปุ่มเปิดโค้ดเป็นโครงตัวอย่างสำหรับคัดลอกและเทียบกับ template; ยังไม่แก้ไฟล์ในเครื่องให้อัตโนมัติ. หากโจทย์สั่งเพิ่มเฉพาะบางบรรทัด อย่าแทนทั้งไฟล์โดยไม่ตรวจของเดิม</p>`:''}
    ${parsed.warnings.map(w=>`<p class="footnote">ตรวจเพิ่ม: ${esc(w)}</p>`).join('')}
    <div class="actions"><button class="button primary" data-apply-question>นำค่าที่พบไปกรอก → ตรวจในเมนู 01</button></div>
    <p class="footnote">ถ้ามีไฟล์ SQL ให้เลือกตารางในเมนู 01 ด้วย; ชื่อคอลัมน์จาก Request Body อาจไม่ใช่ชื่อคอลัมน์ SQL. ปุ่มนี้รวมฟีเจอร์ที่พบกับสิ่งที่เลือกไว้แล้ว</p>
  </div>`;
}
function applyQuestion(target='setup'){
  const p=parseQuestion(questionText);
  if(!p)return;
  if(p.studentId)state.studentId=p.studentId;
  if(p.basePath)state.basePath=p.basePath;
  else if(p.studentId && state.basePath==='/api/YOUR_STUDENT_ID')state.basePath='/api/'+p.studentId;
  if(p.endpoint)state.endpoint=p.endpoint;
  if(p.database)state.db.database=p.database;
  if(p.port)state.port=Number(p.port);
  if(p.page)state.page=Number(p.page);
  if(p.limit)state.limit=Number(p.limit);
  if(p.deleteStatus)state.deleteStatus=p.deleteStatus;
  for(const id of Object.keys(p.features))state.features[id]=true;
  if(state.features.search||state.features.pagination)state.features.list=true;
  const table=parsedTables.find(t=>t.name===(p.table||p.resource));
  if(table){
    selectedSqlTable=table.name;
    state.table=table.name;state.key={column:table.key,type:table.keyType,auto:table.auto};
    state.fields=clone(table.fields);
  } else if(p.table||p.resource)state.table=p.table||p.resource; // ชื่อจาก URL เป็นเพียงข้อสันนิษฐาน ต้องเทียบ SQL
  if(p.requestBody){
    state.requestExample=p.requestBody;
    if(!parsedTables.length){
      const inferred=tentativeFields(p.requestBody).filter(f=>f.db!==state.key.column);
      state.fields=[{db:state.key.column,body:state.key.column,output:state.key.column,type:'integer',required:false,summary:true,writable:!state.key.auto},...inferred];
    } else for(const name of p.bodyFields){
      const field=state.fields.find(f=>matchField(f,name));
      if(field)field.body=name;
    }
  }
  if(p.summaryFields.length){
    for(const field of state.fields){
      const name=p.summaryFields.find(value=>matchField(field,value));
      field.summary=Boolean(name);
      if(name)field.output=name;
    }
  }
  goto(target);toast('นำค่าที่พบไปกรอกแล้ว; ตรวจ SQL, field, body และ response ก่อนสร้างโค้ด');
}
function renderLibraryResults(){
  const q=searchText.trim().toLocaleLowerCase();
  const parsed=parseQuestion(questionText);
  const matches=matchQuestion(questionText).filter(item=>parsed?.features[item.id]);
  const suggestions=questionText.trim()
    ? `<div class="card"><h2>หัวข้อที่น่าจะตรงโจทย์ / Suggested matches</h2><p class="plain">ระบบเทียบคำและวลีที่เตรียมไว้ในเครื่อง ไม่มี AI และไม่ส่งโจทย์ออกไป. คะแนนเป็นเพียงลำดับความใกล้เคียง; อ่านข้อความจริงและกดเลือกเอง</p>
       ${matches.length?matches.map((m,i)=>`<div class="match-card"><span class="tag">${i===0?'แนะนำก่อน / Best match':'เกี่ยวข้อง / Related'}</span><h3>${esc(m.title)}</h3><p>เหตุผล: ${esc(m.why)}</p><p><strong>พบในโจทย์:</strong> ${m.evidence.map(e=>`<code>${esc(e)}</code>`).join(' ')}</p><button class="button small" data-select-feature="${m.id}">เลือกข้อนี้ +</button></div>`).join(''):'<p class="empty">ยังไม่พบวลีที่ตรง ลองระบุ method, status, endpoint, field หรือคำว่า แบ่งหน้า / pagination / DTO</p>'}
       <p class="footnote">ถ้าโจทย์มีคำว่า “ไม่ต้อง”/“ห้าม” ใกล้ฟีเจอร์ ระบบพยายามข้ามคำนั้น แต่ยังต้องอ่านโจทย์เอง โดยเฉพาะข้อความยาวและเงื่อนไขปฏิเสธ</p></div>`
    : '';
  const matched=topics.filter(t=>!q||(t.title+' '+t.tags+' '+t.description).toLocaleLowerCase().includes(q));
  return renderQuestionPreview()+suggestions+`<div class="card"><h2>คลังตัวอย่างไทย–อังกฤษ / Bilingual offline reference</h2>
  <div class="field"><label for="topic-search">ค้นหัวข้อ, method, error, ชื่อ field / Search topics</label><input class="input" id="topic-search" value="${esc(searchText)}" placeholder="เช่น PUT, JOIN, DTO, SQL, Postman, pagination"></div>
  <div id="results">${matched.map(t=>`<div class="search-result"><strong>${esc(t.title)}</strong><p>${esc(t.description)}</p>${t.feature?`<button class="button small" data-select-feature="${t.feature}">เลือกฟีเจอร์นี้ +</button>`:''} <a href="${esc(t.link)}" target="_blank" rel="noopener">อ่านคู่มือฉบับเต็ม ↗</a></div>`).join('')||'<p class="empty">ไม่พบหัวข้อ ลองคำอื่นหรือวางโจทย์ด้านบน</p>'}</div></div>`;
}
function renderLibrary(){
  return `<span class="kicker">PHASE 05 / OFFLINE QUESTION FINDER</span><h1>วางโจทย์แล้วหาตัวอย่างที่ใกล้ที่สุด</h1>
  <p class="lead">วางข้อความโจทย์ภาษาไทยหรืออังกฤษ จะเห็นหัวข้อที่เข้ากัน เหตุผล และคำที่พบ. จากนั้นเลือกเพิ่มทีละข้อเพื่อสะสมโค้ด. ใช้ช่องค้นด้านล่างสำหรับคำสั้น ๆ</p>
  <div class="card"><div class="field"><label for="question-search">ข้อความโจทย์ / Paste your exam question</label><textarea id="question-search" rows="7" placeholder="เช่น GET /products?page=1&limit=10 ส่ง summary DTO, totalPages, 404 ถ้าไม่พบ ID ...">${esc(questionText)}</textarea><span class="hint">ข้อความอยู่ในหน้านี้เท่านั้น; ไม่เก็บลง localStorage. ถ้าเปลี่ยนโครงโจทย์ ให้ตรวจฟิลด์/ตารางใน Phase 01 ด้วย</span></div></div>
  <div class="actions">${samplePicker()}</div>
  <div id="library-results">${renderLibraryResults()}</div>
  <div class="info">อ่านเพิ่มเติม: <a href="docs/OFFLINE-QUESTION-FINDER.md" target="_blank" rel="noopener">ตัวอย่างโจทย์ไทย–อังกฤษและวิธีเลือกโครง</a> · <a href="docs/HTTP-STATUS-CODES.md" target="_blank" rel="noopener">ตาราง HTTP status</a>. หาก browser แสดง Markdown เป็นข้อความดิบ ให้เปิดใน VS Code Markdown Preview (Ctrl+Shift+V)</div>`;
}
function getPath(path){return path.split('.').reduce((o,k)=>o[k],state);}
function setPath(path,value){const keys=path.split('.');let obj=state;for(const k of keys.slice(0,-1))obj=obj[k];obj[keys.at(-1)]=value;}
function updateInputs(scope=document){
  scope.querySelectorAll('[data-key]').forEach(el=>setPath(el.dataset.key,el.value));
  scope.querySelectorAll('[data-check]').forEach(el=>setPath(el.dataset.check,el.checked));
  scope.querySelectorAll('[data-field]').forEach(el=>{const [i,k]=el.dataset.field.split('.');state.fields[Number(i)][k]=el.type==='checkbox'?el.checked:el.value;});
}
function downloadBlob(blob,name){
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function downloadProject(){
  try{
    updateInputs(content);
    const files=ensureProject();
    const root=(state.studentId||'INT161').replace(/[^A-Za-z0-9_-]/g,'_')+'_exam/';
    const prefixed=Object.fromEntries(Object.entries(files).map(([p,v])=>[root+p,v]));
    downloadBlob(makeZip(prefixed),root.slice(0,-1)+'.zip'); toast('ดาวน์โหลด ZIP แล้ว ตรวจ README-EXAM.md ก่อนนำไปใช้');
  }catch(e){toast(e.message);goto('setup');}
}
function applyMobile(){
  state.db.database='mobile_distributor';state.table='products';state.endpoint='/products';state.key={column:'id',type:'number',auto:true};
  state.fields=clone(exampleFields);state.searchColumn='name';
  state.join={table:'brands',foreignKey:'brand_id',targetKey:'id',display:'name',output:'brandName'};
  state.features={identity:true,list:true,detail:true,create:true,update:true,remove:true,search:false,pagination:true,join:true,dto:true};
  state.updateMode='partial';state.deleteStatus=204;render();toast('เติมกรณีฝึก Mobile Distributor แล้ว; แก้รหัส/SQL ตามโจทย์จริง');
}
document.querySelector('#nav').addEventListener('click',e=>{const b=e.target.closest('[data-view]');if(b)goto(b.dataset.view);});
document.querySelector('#search-top').addEventListener('click',()=>goto('library'));
document.querySelector('#download-top').addEventListener('click',downloadProject);
content.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.openGenerated){activeFile=b.dataset.openGenerated;applyQuestion('code');return;}
  if(b.hasAttribute('data-sample-question')){selectedSampleId=content.querySelector('#sample-choice')?.value||'crud';questionText=sampleQuestions.find(item=>item.id===selectedSampleId)?.text||sampleQuestion;goto('library');return;}
  if(b.dataset.go){updateInputs(content);goto(b.dataset.go);return;}
  if(b.dataset.save){updateInputs(content);goto('tasks');return;}
  if(b.hasAttribute('data-add-field')){updateInputs(content);state.fields.push({db:'new_field',body:'new_field',output:'newField',type:'string',required:false,summary:false,writable:true});render();return;}
  if(b.dataset.removeField!==undefined){updateInputs(content);state.fields.splice(Number(b.dataset.removeField),1);render();return;}
  if(b.dataset.preset==='mobile'){applyMobile();return;}
  if(b.hasAttribute('data-apply-question')){applyQuestion();return;}
  if(b.dataset.useTable){updateInputs(content);applyTable(b.dataset.useTable);return;}
  if(b.dataset.file){activeFile=b.dataset.file;render();return;}
  if(b.hasAttribute('data-copy-file')){try{await navigator.clipboard.writeText(ensureProject()[activeFile]);toast('คัดลอก '+activeFile+' แล้ว');}catch(err){toast('คัดลอกไม่สำเร็จ: '+err.message);}return;}
  if(b.hasAttribute('data-save-file')){try{const value=ensureProject()[activeFile];downloadBlob(new Blob([value],{type:'text/plain'}),activeFile.split('/').at(-1));}catch(err){toast(err.message);}return;}
  if(b.hasAttribute('data-download-project')){downloadProject();return;}
  if(b.dataset.copyPostman!==undefined){
    try{
      const items=JSON.parse(ensureProject()['postman-collection.json']).item;
      const raw=items[Number(b.dataset.copyPostman)]?.request.body?.raw;
      if(!raw)throw new Error('ไม่มี raw JSON สำหรับ request นี้');
      await navigator.clipboard.writeText(raw);toast('คัดลอก raw JSON แล้ว');
    }catch(err){toast('คัดลอกไม่ได้: '+err.message);}
    return;
  }
  if(b.dataset.selectFeature){state.features[b.dataset.selectFeature]=true;if(['search','pagination'].includes(b.dataset.selectFeature))state.features.list=true;toast('เพิ่ม '+b.dataset.selectFeature+' แล้ว');goto('tasks');}
});
content.addEventListener('change',async e=>{
  const el=e.target;
  if(el.dataset.feature){state.features[el.dataset.feature]=el.checked;if(el.checked && ['search','pagination'].includes(el.dataset.feature))state.features.list=true;render();return;}
  if(el.id==='sql-file' && el.files[0]){
    updateInputs(content);
    sqlFileName=el.files[0].name; selectedSqlTable='';
    sqlText=await el.files[0].text(); parsedTables=parseSchema(sqlText);
    const dbName=sqlText.match(/(?:CREATE\s+DATABASE(?:\s+IF\s+NOT\s+EXISTS)?|USE)\s+`?([A-Za-z_]\w*)`?/i)?.[1];
    if(dbName)state.db.database=dbName;
    render();toast('อ่าน '+sqlFileName+' แล้ว: พบ '+parsedTables.length+' ตาราง');return;
  }
  if(el.id==='sql-table' && el.value){
    updateInputs(content);applyTable(el.value);return;
  }
  if(el.dataset.key || el.dataset.check || el.dataset.field){updateInputs(content);}
});
function applyTable(name){
  const t=parsedTables.find(x=>x.name===name);
  if(!t)return;
  selectedSqlTable=t.name;
  state.table=t.name;if(state.endpoint==='/items')state.endpoint='/'+t.name;
  state.key={column:t.key,type:t.keyType,auto:t.auto};state.fields=clone(t.fields);
  const parsed=parseQuestion(questionText);
  if(parsed?.requestBody)for(const key of parsed.bodyFields){
    const field=state.fields.find(f=>matchField(f,key));if(field)field.body=key;
  }
  if(parsed?.summaryFields.length)for(const field of state.fields){
    const output=parsed.summaryFields.find(name=>matchField(field,name));
    field.summary=Boolean(output);if(output)field.output=output;
  }
  state.searchColumn=t.fields.find(f=>f.type==='string')?.db||t.key;
  render();toast('เลือกตาราง '+t.name+' ('+t.fields.length+' columns); ตรวจ schema กับโจทย์จริง');
}
content.addEventListener('input',e=>{
  if(e.target.id==='quick-question'){
    questionText=e.target.value;
    return;
  }
  if(e.target.id==='question-search'){
    questionText=e.target.value;
    document.querySelector('#library-results').innerHTML=renderLibraryResults();
    return;
  }
  if(e.target.id==='topic-search'){
    searchText=e.target.value;
    document.querySelector('#library-results').innerHTML=renderLibraryResults();
    document.querySelector('#topic-search')?.focus();
  }
});
async function init(){
  templates={};
  try{
    await Promise.all(TEMPLATE_PATHS.map(async p=>{const r=await fetch('./templates/'+p);if(!r.ok)throw new Error(p);templates[p]=await r.text();}));
  }catch(e){templates=null;toast('โหลด templates ไม่ครบ: '+e.message);}
  render();
}
init();
