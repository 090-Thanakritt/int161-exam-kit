import { matchQuestion } from './matcher.mjs';

const first=(text,re)=>text.match(re)?.[1]||'';
const unique=items=>[...new Set(items)];
const snake=value=>value.replace(/([a-z0-9])([A-Z])/g,'$1_$2').toLowerCase();
const key=value=>value.replace(/[^a-z0-9]/gi,'').toLowerCase();
function jsonAfterMarker(text){
  const marker=/(?:request\s*body|body\s*raw|ข้อมูลที่ส่ง|ข้อมูลสำหรับเพิ่ม)/i.exec(text);
  if(!marker) return null;
  const start=text.indexOf('{',marker.index+marker[0].length);
  if(start<0 || start-marker.index>350 || start>30000)return null;
  let depth=0,quoted=false,escaped=false;
  for(let i=start;i<Math.min(text.length,start+20000);i++){
    const c=text[i];
    if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;continue;}
    if(c==='"'){quoted=true;continue;}
    if(c==='{')depth++;
    if(c==='}' && --depth===0 && c==='}'){
      try {const value=JSON.parse(text.slice(start,i+1));return value && !Array.isArray(value) && typeof value==='object' ? value:null;} catch {return null;}
    }
  }
  return null;
}
function summaryFields(text){
  const inline=/(?:summary\s*dto|ฟิลด์สรุป)\s*:\s*([^\r\n]+)/i.exec(text);
  if(inline){
    const names=inline[1].split(/[,，]/).map(value=>value.trim());
    if(names.length>1)return unique(names.filter(value=>/^[A-Za-z_][\w]*$/.test(value)));
  }
  const match=/(?:summary\s*dto|ฟิลด์สรุป)[^\n]*\n([\s\S]{0,900}?)(?=\n\s*(?:response\s*body|detail\s*dto|\d+\)|\[get\]|\[post\]|$))/i.exec(text);
  if(!match)return [];
  return unique(match[1].split(/\r?\n/).map(line=>line.trim().replace(/^[-*•]\s*/,'').split(/\s|\(/)[0]).filter(v=>/^[A-Za-z_][\w]*$/.test(v)));
}
function fileInstructions(text){
  const items=[];
  const pathRe=/(?:src[\\/](?:[A-Za-z0-9_$.-]+[\\/])*[A-Za-z0-9_$.-]+\.(?:js|mjs)|tests[\\/][A-Za-z0-9_$.-]+\.(?:js|mjs)|package\.json)/g;
  for(const match of text.matchAll(pathRe)){
    const start=text.lastIndexOf('\n',match.index-1)+1;
    const end=text.indexOf('\n',match.index+match[0].length);
    const line=text.slice(start,end<0?text.length:end).trim();
    const file=match[0].replaceAll('\\','/');
    const action=/(?:replace|overwrite|แทนทั้งไฟล์|แทนที่)/i.test(line)?'replace'
      :/(?:add|create|implement|insert|เพิ่ม|สร้าง)/i.test(line)?'add'
      :/(?:edit|modify|update|แก้|ปรับ)/i.test(line)?'edit':'check';
    if(!items.some(item=>item.file===file && item.instruction===line))items.push({file,action,instruction:line.slice(0,250)});
  }
  return items.slice(0,30);
}
export function parseQuestion(text){
  const source=String(text||'');
  if(!source.trim())return null;
  const matches=matchQuestion(source);
  const features=Object.fromEntries(matches.map(m=>[m.id,true]));
  // An ID printed in the profile does not by itself require a student-info endpoint.
  if(features.identity && !/(?:student-info|secret\s*key|secretkey|ระบบระบุตัวตน|ข้อมูลประจำตัว)/i.test(source))delete features.identity;
  if(features.update && !/(?:\bPUT\b|\bupdate\s+(?:a\s+|the\s+)?(?:product|item|record|row|data)\b|แก้ไข(?:ข้อมูล|สินค้า|รายการ)|ปรับปรุง(?:ข้อมูล|สินค้า|รายการ))/i.test(source))delete features.update;
  if(features.detail && !/(?:\bGET\s*\]?\s*[:：]?\s*\/[^\s?]+\/(?:\:id|\{id\}|\d+)|\bGET\s+(?:by\s+id|detail)|ดูรายละเอียด|ข้อมูล.*ตามรหัส)/i.test(source))delete features.detail;
  // Explicit HTTP methods with a collection URL take priority over keyword matches.
  if(/\bGET\s*\]?\s*[:：]?\s*\/api\/[\w-]+\/[\w-]+(?=\?|\s|$)/im.test(source))features.list=true;
  const paths=[...source.matchAll(/\/api\/([A-Za-z0-9_-]+)\/([A-Za-z][A-Za-z0-9_-]*)(?=\/|\?|\s|$)/g)]
    .filter(m=>m[2]!=='student-info');
  const names=paths.map(m=>m[2]);
  const resource=names.sort((a,b)=>names.filter(x=>x===b).length-names.filter(x=>x===a).length)[0]||'';
  const basePath=paths.find(m=>m[2]===resource)?.[0].slice(0,-resource.length-1)||'';
  const endpoint=resource?'/'+resource:'';
  const explicitTable=first(source,/(?:\btable\s*[:=]\s*|ตาราง\s*[:=]?\s*)([A-Za-z_][A-Za-z0-9_]*)/i);
  const studentId=first(source,/(?:student\s*id|รหัสนักศึกษา)\s*[:：]\s*['"]?(\d{8,})/i)||first(source,/\/api\/(\d{8,})(?:\/|\s)/);
  const database=first(source,/(?:\bdatabase\s*[:=]\s*|ชื่อฐานข้อมูล\s*[:=]?\s*|\bUSE\s+)([A-Za-z_][A-Za-z0-9_]*)/i);
  const port=first(source,/(?:localhost:|\bport\s*[:=]\s*|พอร์ต\s*[:=]?\s*)(\d{2,5})/i);
  const page=first(source,/(?:\bpage|หน้าเริ่มต้น)\s*(?:=|:|คือ)\s*(\d+)/i);
  const limit=first(source,/(?:\blimit|จำนวนต่อหน้า)\s*(?:=|:|คือ)\s*(\d+)/i);
  const requestBody=jsonAfterMarker(source);
  const fields=requestBody?Object.keys(requestBody).filter(v=>/^[A-Za-z_][A-Za-z0-9_]*$/.test(v)):[];
  const summary=summaryFields(source);
  const warnings=[];
  if(unique(names).length>1)warnings.push('พบหลาย resource ในโจทย์: '+unique(names).join(', ')+' — เว็บสร้างได้ครั้งละหนึ่ง resource; เลือกโจทย์ย่อยหนึ่งข้อหรือกรอก resource ที่ต้องการเอง');
  if(!endpoint)warnings.push('ยังอ่าน URL resource ไม่ได้; ตรวจ base path และ endpoint ในเมนู 01');
  if(!requestBody && /(?:request\s*body|body\s*raw)/i.test(source))warnings.push('พบคำว่า Request Body แต่ยังอ่าน JSON ไม่ได้; ตรวจ raw JSON ในโจทย์และกรอก field เอง');
  if(!explicitTable)warnings.push('ชื่อตารางยังไม่ยืนยันจาก SQL; เลือกตารางจากไฟล์ SQL ในเมนู 01');
  return {features,basePath,endpoint,resource,table:explicitTable,studentId,database,port,page,limit,
    deleteStatus:/(?:delete|ลบ)[\s\S]{0,160}204/i.test(source)?204:undefined,
    requestBody,bodyFields:fields,summaryFields:summary,fileInstructions:fileInstructions(source),warnings,
    source:'คำ/URL/JSON ที่พบในข้อความ ไม่ใช่การเข้าใจโจทย์ด้วย AI'};
}
export function tentativeFields(body){
  return Object.entries(body||{}).filter(([name])=>/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)).map(([name,value])=>{
    const type=typeof value==='boolean'?'boolean':typeof value==='number'?(Number.isInteger(value)?'integer':'number'):/^\d{4}-\d{2}-\d{2}$/.test(value)?'date':'string';
    return {db:snake(name),body:name,output:name,type,required:false,summary:false,writable:true};
  });
}
export function matchField(field,name){return [field.db,field.body,field.output].some(v=>key(v)===key(name));}
