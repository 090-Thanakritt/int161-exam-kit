// ไฟล์: src/app.js — แทนไฟล์เดิมใน template ครู; npm start ใช้ node src/app.js
import express from 'express';
import router from './routes-$id/route.js';
import db from './configs-$id/db-config.js';
import { EXAM } from './configs-$id/exam-config.js';
import { apiResponse } from './mappers-$id/api-response.js';
import { AppError,errorHandler } from './middlewares-$id/error-handler.js';
const app=express();
app.use(express.json()); // ต้องอยู่ก่อน POST/PUT routes
app.get('/',(req,res)=>res.json({message:'API is running'}));
if (EXAM.features.identity) app.get(EXAM.basePath+'/student-info',(req,res)=>{
  apiResponse(res,{studentId:EXAM.studentId,name:EXAM.studentName,secretKey:EXAM.secretKey});
});
app.use(EXAM.basePath+EXAM.endpoint,router); // [แก้ตัวนี้] basePath+endpoint ต้องตรง URL ทุกข้อ
app.use((req,res,next)=>next(new AppError(404,'ENDPOINT_NOT_FOUND','Endpoint not found')));
app.use(errorHandler);
const server=app.listen(EXAM.port,'127.0.0.1',()=>{
  console.log('API ready at http://127.0.0.1:'+EXAM.port+EXAM.basePath+EXAM.endpoint);
});
server.on('error',err=>console.error('HTTP server error:',err));
process.once('SIGINT',()=>server.close(async()=>{await db.end();process.exit(0);}));
export default app;
