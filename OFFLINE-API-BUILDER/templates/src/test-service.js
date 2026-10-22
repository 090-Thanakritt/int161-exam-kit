// ไฟล์: src/test-service.js — แทนไฟล์เดิมที่เรียก DELETE ID 26
// อ่านข้อมูลอย่างเดียว; รัน node src/test-service.js หลัง import SQL และตั้ง DB สำเร็จ
import * as service from './services-$id/service.js';
import db from './configs-$id/db-config.js';
try {
  const result=await service.getAllObjects(null);
  console.log('List:',result.items.slice(0,3));
} catch(err) {
  console.error(err.code,err.message); process.exitCode=1;
} finally { await db.end(); }
