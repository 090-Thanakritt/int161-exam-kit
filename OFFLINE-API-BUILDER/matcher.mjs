// Offline rule matcher. It reads only the text pasted into the local browser.
// Results are suggestions with visible evidence, never a claim that the exam is solved.
export const patterns=[
  {id:'identity',title:'Student identity / ข้อมูลนักศึกษา',weight:4,
    phrases:['student-info','student id','studentid','secret key','secretkey','รหัสนักศึกษา','รหัสลับ','ข้อมูลนักศึกษา'],
    why:'โจทย์ระบุข้อมูลประจำตัวหรือ endpoint student-info / The task asks for student identity data or the student-info endpoint.'},
  {id:'list',title:'GET list / รายการทั้งหมด',weight:2,
    phrases:['get list','get all','all products','list of','รายการทั้งหมด','รายการสินค้า','แสดงรายการ','ดึงข้อมูลทั้งหมด'],
    why:'โจทย์ขอรายการหลายแถวจาก resource / The task asks for a collection of rows.'},
  {id:'detail',title:'GET by ID / รายละเอียดตามรหัส',weight:3,
    phrases:['get by id','get detail','ตาม id','ตามรหัส','รายละเอียดสินค้า','ไม่พบ id'],
    why:'โจทย์ขอข้อมูลหนึ่งรายการตาม key หรือกำหนด 404 เมื่อไม่พบ / The task asks for one item by key or a 404 when absent.'},
  {id:'create',title:'POST / เพิ่มข้อมูล',weight:3,
    phrases:['post','create','insert','เพิ่มสินค้า','เพิ่มข้อมูล','สร้างรายการ','201 created'],
    why:'โจทย์ขอสร้างแถวใหม่หรือกำหนดสถานะ 201 / The task creates a row or specifies status 201.'},
  {id:'update',title:'PUT / แก้ข้อมูล',weight:3,
    phrases:['put','update','แก้ไข','ปรับปรุง','เปลี่ยนข้อมูล'],
    why:'โจทย์ขอแก้ข้อมูลเดิม; ต้องอ่าน body และกฎ field ที่อนุญาต / The task updates an item; inspect the request body and allowed fields.'},
  {id:'remove',title:'DELETE / ลบข้อมูล',weight:3,
    phrases:['delete','remove','ลบสินค้า','ลบข้อมูล','204 no content'],
    why:'โจทย์ขอลบข้อมูลหรือกำหนด 204 เมื่อสำเร็จ / The task deletes an item or specifies status 204.'},
  {id:'search',title:'Search / ค้นหาและกรอง',weight:3,
    phrases:['search','filter','keyword','like','where name','?q=','ค้นหา','คำค้น','กรองข้อมูล'],
    why:'โจทย์มีคำค้นหรือเงื่อนไขกรอง; SELECT และ COUNT ต้องใช้เงื่อนไขเดียวกัน / The task filters rows; SELECT and COUNT need the same condition.'},
  {id:'pagination',title:'Pagination / แบ่งหน้า',weight:4,
    phrases:['pagination','paginate','page and limit','?page=','limit=','totalpages','hasnextpage','แบ่งหน้า','หน้าละ','จำนวนต่อหน้า','หมายเลขหน้า'],
    why:'โจทย์ระบุ page/limit หรือ metadata ของหน้า / The task specifies page, limit, or pagination metadata.'},
  {id:'join',title:'JOIN / เชื่อมตาราง',weight:3,
    phrases:['join','brandname','brand name','foreign key','ชื่อแบรนด์','ชื่อลูกค้า','ตารางอื่น','เชื่อมตาราง'],
    why:'response ต้องใช้ค่าจากอีกตาราง; ตรวจ FK/PK และ alias / The response needs data from another table; check keys and aliases.'},
  {id:'dto',title:'DTO / แปลงรูปข้อมูล',weight:4,
    phrases:['dto','summary','detail dto','brandid','ramgb','storagegb','เฉพาะฟิลด์','ฟิลด์สรุป','แปลงข้อมูล','รูปแบบ response'],
    why:'โจทย์กำหนดชื่อ JSON หรือ field ที่แสดงต่างจากแถว SQL / The requested JSON keys or selected fields differ from the SQL row.'}
];
const tokenize=text=>String(text||'').toLocaleLowerCase().normalize('NFKC').replace(/\s+/g,' ');
const negative=prefix=>/(?:ไม่ต้อง|ห้าม|ยกเว้น|ไม่ใช้|without|no need for|do not)\s*$/i.test(prefix);
export function matchQuestion(question){
  const text=tokenize(question);
  if(!text.trim()) return [];
  return patterns.map(rule=>{
    const evidence=[];
    for(const phrase of rule.phrases){
      let index=text.indexOf(phrase);
      while(index>=0){
        const before=text[index-1]||'', after=text[index+phrase.length]||'';
        const english=/^[a-z]/.test(phrase);
        const boundary=!english || (!/[a-z0-9_]/.test(before) && !/[a-z0-9_]/.test(after));
        if(boundary && !negative(text.slice(Math.max(0,index-18),index))) {evidence.push(phrase);break;}
        index=text.indexOf(phrase,index+phrase.length);
      }
    }
    // GET on a collection URL with no /:id is a likely list request.
    if(rule.id==='list' && /\bget\s+\/(?:api\/[a-z0-9_-]+\/)?[a-z][\w-]*(?:\?|\s|$)/i.test(text)
      && !/\bget\s+\/[^\s?]+\/(?:\:id|\{id\}|\d+)(?:\s|$)/i.test(text))
      evidence.push('GET collection URL');
    if(rule.id==='detail' && /\bget\s+\/[^\s?]+\/(?:\:id|\{id\}|\d+)(?:\s|$)/i.test(text))evidence.push('GET /:id');
    if(rule.id==='pagination' && /\blimit=\d+/i.test(text)) evidence.push('limit=…');
    const unique=[...new Set(evidence)];
    return {...rule,evidence:unique,score:unique.length*rule.weight+(unique.length>1?1:0)};
  }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title));
}
