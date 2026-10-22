// ไฟล์: src/configs-$id/db-config.js — แทนไฟล์เดิมใน template ครู
// [แก้ค่า] EXAM.db.database/user/password/host/port ที่ exam-config.js; ค่านี้ไม่ได้อ่าน SQL อัตโนมัติ
import mysql from 'mysql2/promise';
import { EXAM } from './exam-config.js';
const db = mysql.createPool({
  host: EXAM.db.host, // MySQL host ไม่ใช่ http://localhost
  port: EXAM.db.port, // MySQL port; Express ใช้ EXAM.port
  user: EXAM.db.user,
  password: EXAM.db.password,
  database: EXAM.db.database,
  waitForConnections: true,
  connectionLimit: 5,
  dateStrings: ['DATE']
});
export default db;
