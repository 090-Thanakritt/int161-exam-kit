// ไฟล์: src/middlewares-$id/error-handler.js — เพิ่มไฟล์ใหม่; app.js mount หลัง routes
import { EXAM } from '../configs-$id/exam-config.js';
export class AppError extends Error {
  constructor(status,code,message) { super(message); this.status=status; this.code=code; }
}
export function errorHandler(err,req,res,next) {
  if (res.headersSent) return next(err);
  let status=err.status||500, code=err.code||'INTERNAL_ERROR', message=err.status?err.message:'Internal server error';
  if (err.code==='ER_DUP_ENTRY') [status,code,message]=[409,'DUPLICATE_KEY','Unique value already exists'];
  if (err.code==='ER_NO_REFERENCED_ROW_2') [status,code,message]=[400,'INVALID_REFERENCE','Referenced row does not exist'];
  if (err.code==='ER_ROW_IS_REFERENCED_2') [status,code,message]=[409,'RESOURCE_IN_USE','Resource is referenced'];
  if (err.type==='entity.parse.failed') [status,code,message]=[400,'INVALID_JSON','Invalid JSON body'];
  if (status===500) console.error(err);
  const body={success:false,error:{code,message}}; // [แก้ตัวนี้] รูปแบบ error JSON ตามใบงานจริง
  if (EXAM.timestamp) body.timestamp=new Date().toISOString();
  res.status(status).json(body);
}
