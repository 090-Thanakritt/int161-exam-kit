// ไฟล์: src/repositories-$id/repository.js — แทนไฟล์เดิม
// [แก้ชื่อ] table/key/fields/join ใน exam-config.js; mysql2.query ใช้ SET ? object
import db from '../configs-$id/db-config.js';
import { EXAM } from '../configs-$id/exam-config.js';
const ident=value=>{ if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) throw new Error('Invalid SQL identifier: '+value); return '`'+value+'`'; };
const table=ident(EXAM.table), key=ident(EXAM.key.column);
const columns=EXAM.fields.map(f=>'t.'+ident(f.db)+' AS '+ident(f.db)).join(', ');
const join=EXAM.features.join
  ? ' LEFT JOIN '+ident(EXAM.join.table)+' j ON t.'+ident(EXAM.join.foreignKey)+'=j.'+ident(EXAM.join.targetKey)
  : '';
const extra=EXAM.features.join ? ', j.'+ident(EXAM.join.display)+' AS join_value' : '';
const base='SELECT '+columns+extra+' FROM '+table+' t'+join;
function where(search) {
  if (!EXAM.features.search || !search) return {sql:'',params:[]};
  return {sql:' WHERE t.'+ident(EXAM.searchColumn)+' LIKE ?',params:['%'+search+'%']};
}
export async function findAll(pagination,search='') {
  const w=where(search);
  let sql=base+w.sql+' ORDER BY t.'+key;
  const params=[...w.params];
  if (pagination) { sql+=' LIMIT ? OFFSET ?'; params.push(pagination.limit,pagination.offset); }
  const [rows]=await db.query(sql,params);
  return rows;
}
export async function countAll(search='') {
  const w=where(search); // [แก้ตัวนี้] COUNT ใช้ search WHERE เดียวกับ findAll; total ไม่ใช่ rows.length
  const [[row]]=await db.query('SELECT COUNT(*) AS total FROM '+table+' t'+w.sql,w.params);
  return Number(row.total);
}
export async function findOne(id) {
  const [rows]=await db.query(base+' WHERE t.'+key+'=?',[id]); return rows[0]||null;
}
export async function create(data) {
  const [result]=await db.query('INSERT INTO '+table+' SET ?',[data]);
  return EXAM.key.auto ? result.insertId : data[EXAM.key.column]; // string PK ใช้ค่าที่ส่ง ไม่ใช้ insertId
}
export async function update(id,data) {
  const [result]=await db.query('UPDATE '+table+' SET ? WHERE '+key+'=?',[data,id]); return result.affectedRows;
}
export async function remove(id) {
  const [result]=await db.query('DELETE FROM '+table+' WHERE '+key+'=?',[id]); return result.affectedRows;
}
