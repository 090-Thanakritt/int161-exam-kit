// ไฟล์: src/middlewares-$id/pagination-middleware.js — แทนไฟล์เดิม
import { EXAM } from '../configs-$id/exam-config.js';
import { AppError } from './error-handler.js';
function positive(value,fallback) {
  if (value===undefined) return fallback;
  if (typeof value!=='string' || !/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value)<1)
    throw new AppError(400,'INVALID_PAGINATION','page/limit must be positive integers');
  return Number(value);
}
export function queryParser(req,res,next) {
  if (!EXAM.features.pagination) { req.pagination=null; return next(); }
  const page=positive(req.query.page,EXAM.page);
  const limit=Math.min(positive(req.query.limit,EXAM.limit),EXAM.maxLimit);
  const offset=(page-1)*limit; // [แก้ตัวนี้] หากโจทย์เริ่มหน้า 0 ต้องเปลี่ยนสูตร
  if (!Number.isSafeInteger(offset)) throw new AppError(400,'INVALID_PAGINATION','Page too large');
  req.pagination={page,limit,offset}; next();
}
