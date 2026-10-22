// ไฟล์: src/routes-$id/route.js — แทนไฟล์เดิม; app mount EXAM.basePath + EXAM.endpoint
import express from 'express';
import * as service from '../services-$id/service.js';
import { queryParser } from '../middlewares-$id/pagination-middleware.js';
import { apiResponse } from '../mappers-$id/api-response.js';
import { EXAM } from '../configs-$id/exam-config.js';
const router=express.Router();
if (EXAM.features.list) router.get('/',queryParser,async(req,res)=>{
  const search=EXAM.features.search ? String(req.query.q||'') : '';
  const result=await service.getAllObjects(req.pagination,search);
  apiResponse(res,result.items,200,req.pagination,result.total);
});
if (EXAM.features.detail) router.get('/:id',async(req,res)=>{
  apiResponse(res,await service.getObject(service.parseKey(req.params.id)));
});
if (EXAM.features.create) router.post('/',async(req,res)=>{
  apiResponse(res,await service.createObject(req.body),201);
});
if (EXAM.features.update) router.put('/:id',async(req,res)=>{
  apiResponse(res,await service.updateObject(service.parseKey(req.params.id),req.body));
});
if (EXAM.features.remove) router.delete('/:id',async(req,res)=>{
  await service.removeObject(service.parseKey(req.params.id));
  if (EXAM.deleteStatus===204) return res.status(204).end(); // 204 ไม่มี body
  return apiResponse(res,{message:'Deleted'},200);
});
export default router;
