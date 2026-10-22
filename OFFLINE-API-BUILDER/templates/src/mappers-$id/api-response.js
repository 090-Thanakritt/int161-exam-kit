// ไฟล์: src/mappers-$id/api-response.js — แทนไฟล์เดิม; route/service/repo ชุดนี้ใช้ total แยกจาก data
import { EXAM } from '../configs-$id/exam-config.js';
export function apiResponse(res,data,status=200,pagination=null,total=0) {
  const body={success:true,data}; // [แก้ตัวนี้] success/data ถ้าโจทย์กำหนด envelope ต่าง
  if (pagination) {
    const {page,limit}=pagination;
    body.pagination={
      total,page,limit,totalPages:Math.ceil(total/limit),
      hasNextPage:page*limit<total,hasPrevPage:page>1
    }; // [แก้ตัวนี้] ชื่อ key ใน pagination ต้องเทียบ response ของโจทย์
  }
  if (EXAM.timestamp) body.timestamp=new Date().toISOString();
  return res.status(status).json(body);
}
