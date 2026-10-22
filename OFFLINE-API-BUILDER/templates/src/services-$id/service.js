// ไฟล์: src/services-$id/service.js — แทนไฟล์เดิม; validate ตาม column schema ที่กรอกในเว็บ
import * as repo from '../repositories-$id/repository.js';
import { EXAM } from '../configs-$id/exam-config.js';
import { toDTO,toDTOs } from '../mappers-$id/entity-dto-mapper.js';
import { AppError } from '../middlewares-$id/error-handler.js';
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
export function parseKey(value) {
  if (EXAM.key.type==='string') {
    if (typeof value!=='string' || !value.trim()) throw new AppError(400,'INVALID_KEY','Key is required');
    return value;
  }
  if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value)<1)
    throw new AppError(400,'INVALID_KEY','Key must be a positive integer');
  return Number(value);
}
function validate(body,partial=false) {
  if (!body || typeof body!=='object' || Array.isArray(body)) throw new AppError(400,'INVALID_BODY','JSON object required');
  const allowed=EXAM.fields.filter(f=>f.writable && !(EXAM.key.auto && f.db===EXAM.key.column));
  const fieldByBody=new Map(allowed.map(f=>[f.body,f]));
  const unknown=Object.keys(body).filter(k=>!fieldByBody.has(k));
  if (unknown.length) throw new AppError(400,'UNKNOWN_FIELDS','Unknown: '+unknown.join(', '));
  const data={};
  for (const f of allowed) {
    if (!own(body,f.body)) {
      if (!partial && f.required) throw new AppError(400,'MISSING_FIELD','Missing: '+f.body);
      continue;
    }
    const value=body[f.body];
    if (value===null) {
      if (f.required) throw new AppError(400,'INVALID_FIELD',f.body+' cannot be null');
      data[f.db]=null; continue;
    }
    let valid=false;
    if (f.type==='string') valid=typeof value==='string' && value.trim().length>0;
    if (f.type==='number') valid=typeof value==='number' && Number.isFinite(value) && value>=0;
    if (f.type==='integer') valid=Number.isSafeInteger(value) && value>=0;
    if (f.type==='boolean') valid=typeof value==='boolean';
    if (f.type==='date') valid=typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
    if (!valid) throw new AppError(400,'INVALID_FIELD','Invalid: '+f.body);
    data[f.db]=f.type==='boolean' ? Number(value) : value;
  }
  if (partial && !Object.keys(data).length) throw new AppError(400,'EMPTY_UPDATE','At least one field required');
  return data; // [แก้ตัวนี้] f.body=request key, f.db=SQL column; ดู exam-config.js ที่เว็บสร้าง
}
async function existing(id) {
  const row=await repo.findOne(id);
  if (!row) throw new AppError(404,'NOT_FOUND','Resource not found');
  return row;
}
export async function getAllObjects(pagination,search='') {
  const rows=await repo.findAll(pagination,search);
  return {items:toDTOs(rows,EXAM.features.dto?'summary':'detail'),
    total:pagination ? await repo.countAll(search) : undefined};
}
export async function getObject(id) { return toDTO(await existing(id),'detail'); }
export async function createObject(body) {
  const data=validate(body);
  const id=await repo.create(data);
  return getObject(id);
}
export async function updateObject(id,body) {
  await existing(id);
  const data=validate(body,EXAM.updateMode==='partial');
  await repo.update(id,data);
  return getObject(id);
}
export async function removeObject(id) {
  await existing(id);
  if (!await repo.remove(id)) throw new AppError(404,'NOT_FOUND','Resource not found');
}
