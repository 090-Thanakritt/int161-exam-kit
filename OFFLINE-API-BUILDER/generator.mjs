export const TEMPLATE_PATHS=[
  'src/app.js','src/test-service.js',
  'src/configs-$id/db-config.js',
  'src/mappers-$id/entity-dto-mapper.js','src/mappers-$id/api-response.js',
  'src/middlewares-$id/pagination-middleware.js','src/middlewares-$id/error-handler.js',
  'src/repositories-$id/repository.js','src/services-$id/service.js','src/routes-$id/route.js'
];
const ident=/^[A-Za-z_][A-Za-z0-9_]*$/;
const pathPart=/^\/[A-Za-z0-9_/-]*$/;
const types=new Set(['string','number','integer','boolean','date']);
const bool=x=>Boolean(x);
function assert(condition,message){ if(!condition) throw new Error(message); }

export function normalizeSpec(input) {
  const s=structuredClone(input);
  for(const [name,value] of Object.entries({database:s.db?.database,table:s.table,key:s.key?.column,searchColumn:s.searchColumn})) {
    if(name==='searchColumn' && !s.features.search) continue;
    assert(ident.test(value||''),`กรอก ${name} เป็นชื่อ SQL ที่มีตัวอักษร/ตัวเลข/_ และขึ้นต้นด้วยตัวอักษร`);
  }
  assert(Number.isInteger(Number(s.db.port)) && Number(s.db.port)>0 && Number(s.db.port)<65536,'MySQL port ต้องเป็นเลข 1–65535');
  assert(Number.isInteger(Number(s.port)) && Number(s.port)>0 && Number(s.port)<65536,'Express port ต้องเป็นเลข 1–65535');
  assert(pathPart.test(s.basePath) && pathPart.test(s.endpoint) && s.endpoint!=='/','base path และ endpoint ต้องขึ้นต้น / และไม่มี query');
  s.basePath=s.basePath.replace(/\/$/,'');
  s.endpoint=s.endpoint.replace(/\/$/,'');
  assert(Array.isArray(s.fields) && s.fields.length>0,'เพิ่ม field อย่างน้อยหนึ่งรายการ');
  const seenDb=new Set(), seenBody=new Set(), seenOutput=new Set();
  s.fields=s.fields.map((f,i)=>{
    for(const k of ['db','body','output']) assert(ident.test(f[k]||''),`field แถว ${i+1}: ${k} ต้องเป็นชื่อที่ใช้ได้`);
    assert(types.has(f.type),`field แถว ${i+1}: type ไม่ถูกต้อง`);
    assert(!seenDb.has(f.db) && !seenBody.has(f.body) && !seenOutput.has(f.output),`field แถว ${i+1}: มีชื่อซ้ำในคอลัมน์ DB/body/response`);
    seenDb.add(f.db); seenBody.add(f.body); seenOutput.add(f.output);
    return {db:f.db,body:f.body,output:f.output,type:f.type,required:bool(f.required),summary:bool(f.summary),writable:bool(f.writable)};
  });
  assert(seenDb.has(s.key.column),'ต้องมี field ของ Primary Key อยู่ในตาราง field');
  assert(['number','string'].includes(s.key.type),'ชนิด Primary Key ต้องเป็น number หรือ string');
  if(!s.key.auto) assert(s.fields.find(f=>f.db===s.key.column)?.writable,'Primary Key ที่ไม่ใช่ AUTO_INCREMENT ต้องรับค่าใน POST');
  if(s.features.search) assert(seenDb.has(s.searchColumn),'คอลัมน์ค้นหาต้องอยู่ใน field');
  if(s.features.join){
    for(const [k,v] of Object.entries(s.join)) assert(ident.test(v||''),`JOIN: ${k} ต้องเป็นชื่อ SQL ที่ใช้ได้`);
    assert(seenDb.has(s.join.foreignKey),'JOIN foreign key ต้องอยู่ใน field');
    assert(s.join.output!=='join_value' && !seenOutput.has(s.join.output),'ชื่อ output ของ JOIN ต้องไม่ซ้ำ');
  }
  if(s.features.search || s.features.pagination) s.features.list=true;
  if(s.features.dto && !s.features.list && !s.features.detail) s.features.list=true;
  s.db.port=Number(s.db.port); s.port=Number(s.port);
  for(const k of ['page','limit','maxLimit']) {
    s[k]=Number(s[k]); assert(Number.isSafeInteger(s[k]) && s[k]>0,`${k} ต้องเป็นเลขบวก`);
  }
  assert(['partial','full'].includes(s.updateMode),'PUT mode ต้อง partial หรือ full');
  assert([204,200].includes(Number(s.deleteStatus)),'DELETE status ต้อง 204 หรือ 200');
  s.deleteStatus=Number(s.deleteStatus);
  return s;
}
function bodyExample(s,partial=false){
  const chosen=s.fields.filter(f=>f.writable && !(s.key.auto && f.db===s.key.column) && (!partial || f.db!==s.key.column));
  const fromQuestion=s.requestExample && typeof s.requestExample==='object' ? s.requestExample : {};
  const entries=partial ? chosen.filter(f=>Object.hasOwn(fromQuestion,f.body)).slice(0,2) : chosen;
  const selected=partial && !entries.length ? chosen.slice(0,Math.min(chosen.length,2)) : entries;
  return Object.fromEntries(selected.map(f=>[f.body,Object.hasOwn(fromQuestion,f.body)?fromQuestion[f.body]:f.type==='number'?29900:f.type==='integer'?1:f.type==='boolean'?true:f.type==='date'?'2026-01-01':f.db===s.key.column?'EXAMPLE-1':'ตัวอย่าง']));
}
function postman(s){
  const base=`http://localhost:${s.port}${s.basePath}${s.endpoint}`;
  const items=[];
  const item=(method,title,url,body)=>({name:title,request:{method,header:body?[{key:'Content-Type',value:'application/json'}]:[],url, ...(body?{body:{mode:'raw',raw:JSON.stringify(body,null,2),options:{raw:{language:'json'}}}}:{})}});
  if(s.features.identity) items.push(item('GET','Identity',`http://localhost:${s.port}${s.basePath}/student-info`));
  if(s.features.list) items.push(item('GET','GET list',base+(s.features.pagination?`?page=${s.page}&limit=${s.limit}`:'')));
  if(s.features.search) items.push(item('GET','GET search',base+'?q=ตัวอย่าง'));
  if(s.features.detail) items.push(item('GET','GET by ID',base+'/1'));
  if(s.features.create) items.push(item('POST','POST create',base,bodyExample(s)));
  if(s.features.update) items.push(item('PUT','PUT update',base+'/1',bodyExample(s,s.updateMode==='partial')));
  if(s.features.remove) items.push(item('DELETE','DELETE',base+'/1'));
  return JSON.stringify({info:{name:'INT161 offline generated examples',schema:'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'},item:items},null,2)+'\n';
}
function readme(s){
  const base=`http://localhost:${s.port}${s.basePath}${s.endpoint}`;
  const selected=Object.entries(s.features).filter(([,v])=>v).map(([k])=>k).join(', ');
  return `# โปรเจกต์ที่สร้างจากคู่มือ INT161 (ต้องปรับตามโจทย์จริง)

## ค่าที่กรอก

- Database: \`${s.db.database}\` / table: \`${s.table}\` / PK: \`${s.key.column}\` (${s.key.type}, auto=${s.key.auto})
- Endpoint: \`${base}\`
- สิ่งที่เลือก: ${selected}
- ไฟล์จาก ZIP นี้อยู่ในโครง \`src/configs-$id\`, \`mappers-$id\`, \`repositories-$id\`, \`services-$id\`, \`routes-$id\` ตาม template ครู

## ทำใน WebStorm / VS Code

1. เปิดไฟล์ SQL ที่อาจารย์แจกจริง อ่าน CREATE DATABASE/USE/CREATE TABLE/INSERT และระวัง DROP/TRUNCATE ก่อนนำเข้า
2. ใช้ WebStorm Database > + > MySQL > กรอก host/port/user/password > Test Connection แล้วเปิด SQL ตัวจริงรันกับ schema ที่ถูก หรือเข้า mysql CLI แล้ว SOURCE path ของ SQL จริง
3. ใน SQL console รัน SHOW TABLES; SHOW CREATE TABLE ${s.table}; SHOW COLUMNS FROM ${s.table}; SELECT COUNT(*) FROM ${s.table}; ตรวจชื่อที่กรอกใน exam-config.js
4. เปิด folder นี้ใน IDE; ถ้าเป็นการสอบ ให้เทียบไฟล์ใน template ครูทีละไฟล์ก่อนวาง/แทน; โค้ดนี้สร้างมาเป็นตัวเลือกที่แก้ตามโจทย์ได้
5. ลง packages ให้พร้อมก่อนตัดเน็ต: npm ci หาก package-lock ตรง หรือ npm install; หลังจากนั้น npm start (port ${s.port})
6. เปิด Postman Desktop; import postman-collection.json หรือยิง URL ข้างล่างเอง; แก้ ID/body ตัวอย่างให้เป็นข้อมูลใน DB จริง

## ทดสอบตามสิ่งที่เลือก

${s.features.list?'- GET '+base+(s.features.pagination?'?page='+s.page+'&limit='+s.limit:'')+' → 200\n':''}${s.features.search?'- GET '+base+'?q=ตัวอย่าง → 200; เปลี่ยนคำค้นเป็นค่าที่มีจริง\n':''}${s.features.detail?'- GET '+base+'/<IDจริง> → 200 และ ID ที่ไม่มี → 404\n':''}${s.features.create?'- POST '+base+' → 201; Body raw JSON:\n\`\`\`json\n'+JSON.stringify(bodyExample(s),null,2)+'\n\`\`\`\n':''}${s.features.update?'- PUT '+base+'/<IDที่สร้าง> → 200; Body raw JSON ('+s.updateMode+'):\n\`\`\`json\n'+JSON.stringify(bodyExample(s,s.updateMode==='partial'),null,2)+'\n\`\`\`\n':''}${s.features.remove?'- DELETE '+base+'/<IDที่สร้าง> → '+s.deleteStatus+'; GET ซ้ำควร 404\n':''}
Header สำหรับ POST/PUT: Content-Type: application/json. POST/PUT ให้ใช้ ID ที่สร้างใหม่ในการทดสอบ อย่าลบข้อมูลตั้งต้นที่ runner ต้องตรวจ

## ตรวจความเข้ากันกับโจทย์จริง

- \`src/configs-$id/exam-config.js\`: body/db/output field, required, ชนิด, PK, join, search, path และ policy
- \`src/repositories-$id/repository.js\`: SQL SELECT/WHERE/COUNT/INSERT/UPDATE/DELETE ต้องตรง schema จริง
- \`src/mappers-$id/entity-dto-mapper.js\`: output key และ field ที่ summary/detail ต้องตรง response ตัวอย่าง
- \`src/services-$id/service.js\`: validation ทั่วไปนี้ยังต้องเพิ่ม length, ENUM, unique, nullable, date/range ตามโจทย์
- \`src/mappers-$id/api-response.js\` และ \`middlewares-$id/error-handler.js\`: status/envelope/timestamp ตามข้อสอบ
- ถ้าข้อสอบมี runner ให้ใช้ runner ที่แจกในวันสอบ; ชุดนี้ไม่ได้รับรองทุก schema และยังต้องลองกับ MySQL จริง
`;
}
export function buildProject(input,templates,sqlText=''){
  const s=normalizeSpec(input), files={};
  for(const p of TEMPLATE_PATHS) {
    if(typeof templates[p]!=='string') throw new Error('ไฟล์ template สำหรับ generator หาย: '+p);
    files[p]=templates[p];
  }
  files['src/configs-$id/exam-config.js']='// ไฟล์: src/configs-$id/exam-config.js — สร้างใหม่\n// [แก้ค่า] ทุกชื่อใน EXAM เทียบ SQL และโจทย์จริง; สร้างจากค่าที่กรอกในเว็บ\nexport const EXAM = '+JSON.stringify(s,null,2)+';\n';
  files['package.json']=JSON.stringify({name:'int161-exam-project',private:true,type:'module',scripts:{start:'node src/app.js','test:service':'node src/test-service.js'},dependencies:{express:'^5.3.0',mysql2:'^3.24.3','http-status':'^2.1.0'}},null,2)+'\n';
  files['postman-collection.json']=postman(s);
  files['README-EXAM.md']=readme(s);
  if(sqlText) files['database/source.sql']=sqlText;
  return files;
}
