// ไฟล์: src/mappers-$id/entity-dto-mapper.js — แทนไฟล์เดิม
// [แก้ชื่อ] f.output คือ JSON key; f.db คือ SQL row property จาก repository SELECT
import { EXAM } from '../configs-$id/exam-config.js';
export function toDTO(row, view='detail') {
  if (!row) return null; // service ต้องเปลี่ยน null เป็น HTTP 404
  const dto={};
  for (const f of EXAM.fields) {
    if (view==='summary' && !f.summary) continue;
    let value=row[f.db]; // [แก้ตัวนี้] ถ้า SELECT AS alias ใหม่ ให้เปลี่ยน f.db ใน exam-config.js ให้ตรง alias
    if (value !== null && value !== undefined && f.type==='number') value=Number(value);
    if (value !== null && value !== undefined && f.type==='boolean') value=Boolean(value);
    dto[f.output]=value; // [แก้ตัวนี้] f.output เป็นชื่อ field ใน response JSON ตามโจทย์
  }
  if (EXAM.features.join && view==='detail') dto[EXAM.join.output]=row.join_value;
  return dto;
}
export function toDTOs(rows,view='summary') { return rows.map(row=>toDTO(row,view)); }
