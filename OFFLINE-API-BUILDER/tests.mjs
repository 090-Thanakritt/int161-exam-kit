import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { buildProject,TEMPLATE_PATHS,normalizeSpec } from './generator.mjs';
import { exampleFields } from './catalog.mjs';
import { parseSchema } from './sql-parser.mjs';
import { makeZip } from './zip.mjs';
import { matchQuestion } from './matcher.mjs';
import { parseQuestion,tentativeFields } from './question-parser.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const templates=Object.fromEntries(await Promise.all(TEMPLATE_PATHS.map(async p=>[p,await fs.readFile(path.join(root,'templates',p),'utf8')])));
const spec={
 db:{database:'mobile_distributor',host:'127.0.0.1',port:3306,user:'root',password:''},
 port:3000,studentId:'67130500004',studentName:'Example Student',secretKey:'example',
 basePath:'/api/67130500004',endpoint:'/products',table:'products',key:{column:'id',type:'number',auto:true},
 fields:structuredClone(exampleFields),searchColumn:'name',
 join:{table:'brands',foreignKey:'brand_id',targetKey:'id',display:'name',output:'brandName'},
 page:1,limit:10,maxLimit:100,updateMode:'partial',deleteStatus:204,timestamp:true,
 features:{identity:true,list:true,detail:true,create:true,update:true,remove:true,search:true,pagination:true,join:true,dto:true}
};
const files=buildProject(spec,templates);
assert.equal(normalizeSpec(spec).fields.find(f=>f.db==='brand_id').output,'brandId');
assert.equal(Object.keys(files).length,TEMPLATE_PATHS.length+4);
assert.equal(JSON.parse(files['postman-collection.json']).item.length,7);
assert.match(files['src/configs-$id/exam-config.js'],/mobile_distributor/);
const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'int161-builder-'));
for(const [filename,value] of Object.entries(files)){
 const dest=path.join(tmp,filename);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,value);
 if(filename.endsWith('.js'))execFileSync(process.execPath,['--check',dest],{stdio:'pipe'});
}
const archive=await makeZip(files).arrayBuffer();
await fs.writeFile(path.join(tmp,'project.zip'),new Uint8Array(archive));
assert.equal(new DataView(archive).getUint32(0,true),0x04034b50);
const sql='CREATE TABLE products (id BIGINT AUTO_INCREMENT PRIMARY KEY, sku VARCHAR(40) NOT NULL UNIQUE, price DECIMAL(10,2) NOT NULL, brand_id INT, FOREIGN KEY (brand_id) REFERENCES brands(id));';
const parsed=parseSchema(sql);
assert.equal(parsed[0].name,'products');
assert.equal(parsed[0].key,'id');
assert.equal(parsed[0].fields.length,4);
const bad=structuredClone(spec);bad.table='products; DROP TABLE brands';
assert.throws(()=>normalizeSpec(bad),/table/);
const auto=structuredClone(spec);auto.features.list=false;auto.features.search=true;
assert.equal(normalizeSpec(auto).features.list,true);
const matches=matchQuestion('GET /products?page=1&limit=10 แบ่งหน้า ส่ง Summary DTO และ brandId');
assert(matches.slice(0,3).some(m=>m.id==='pagination'));
assert(matches.some(m=>m.id==='dto'));
assert(!matchQuestion('open output file').some(m=>m.id==='update'));
assert(!matchQuestion('ไม่ต้อง DELETE ข้อมูล').some(m=>m.id==='remove'));
const question=parseQuestion(`Student ID: 67130500004
Database: mobile_distributor
GET /api/67130500004/products?page=1&limit=10 Summary DTO
POST /api/67130500004/products
Request Body:
{"sku":"TEST-SKU-999","price":29900}`);
assert.equal(question.studentId,'67130500004');
assert.equal(question.basePath,'/api/67130500004');
assert.equal(question.endpoint,'/products');
assert.equal(question.database,'mobile_distributor');
assert.equal(question.limit,'10');
assert(question.features.create && question.features.pagination && question.features.dto);
assert.equal(question.requestBody.sku,'TEST-SKU-999');
assert(question.features.list);
assert(!question.features.identity);
const writeOnly=parseQuestion('POST /api/67130500004/items Request Body: {"name":"A"}\nPUT /api/67130500004/items/:id\nDELETE /api/67130500004/items/:id');
assert(writeOnly.features.create && writeOnly.features.update && writeOnly.features.remove);
assert(!writeOnly.features.detail && !writeOnly.features.list);
const fileTask=parseQuestion('Add GET /api/67130500004/products in src/routes-$id/route.js\nUpdate SQL in src/repositories-$id/repository.js\nEdit package.json only if needed');
assert.deepEqual(fileTask.fileInstructions.map(item=>item.file),['src/routes-$id/route.js','src/repositories-$id/repository.js','package.json']);
assert.deepEqual(fileTask.fileInstructions.map(item=>item.action),['add','edit','edit']);
assert.equal(tentativeFields(question.requestBody).find(f=>f.db==='price').type,'integer');
assert.deepEqual(parseQuestion('Summary DTO: id, sku, brandId').summaryFields,['id','sku','brandId']);
const withExample=structuredClone(spec);withExample.requestExample={sku:'TEST-SKU-999',name:'Test Phone 2026',brand_id:1};
const exampleCollection=JSON.parse(buildProject(withExample,templates)['postman-collection.json']);
assert.equal(JSON.parse(exampleCollection.item.find(x=>x.request.method==='POST').request.body.raw).sku,'TEST-SKU-999');
console.log('PASS: generated files syntax, config, Postman JSON, SQL parser, ZIP header, validation, question parser. ZIP:',path.join(tmp,'project.zip'));
