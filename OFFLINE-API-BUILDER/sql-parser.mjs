// ตัวช่วยกรอกเบื้องต้นเท่านั้น: SQL ซับซ้อน/ALTER TABLE ต้องตรวจ SHOW CREATE TABLE จริง
function splitColumns(source){
  const result=[]; let depth=0, quote=false, start=0;
  for(let i=0;i<source.length;i++){
    const c=source[i];
    if(c==="'") quote=!quote;
    if(!quote){if(c==='(') depth++; if(c===')') depth--; if(c===',' && depth===0){result.push(source.slice(start,i));start=i+1;}}
  }
  result.push(source.slice(start)); return result;
}
export function parseSchema(sql){
  const tables=[];
  const start=/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`?\w+`?\.)?`?([A-Za-z_]\w*)`?\s*\(/ig;
  let match;
  while((match=start.exec(sql))){
    let depth=1, i=start.lastIndex, quote=false;
    for(;i<sql.length && depth;i++){
      const c=sql[i];
      if(c==="'") quote=!quote;
      if(!quote){if(c==='(')depth++; if(c===')')depth--;}
    }
    const block=sql.slice(start.lastIndex,i-1);
    const parts=splitColumns(block);
    const fields=[];
    for(const part of parts){
      const m=part.trim().match(/^`?([A-Za-z_]\w*)`?\s+(BIGINT|INT|SMALLINT|TINYINT|DECIMAL|NUMERIC|FLOAT|DOUBLE|VARCHAR|CHAR|TEXT|DATE|DATETIME|TIMESTAMP|BOOLEAN|BOOL)/i);
      if(!m) continue;
      const type=/DECIMAL|NUMERIC|FLOAT|DOUBLE/i.test(m[2])?'number':/INT/i.test(m[2])?'integer':/BOOL/i.test(m[2])?'boolean':/DATE|TIME/i.test(m[2])?'date':'string';
      fields.push({db:m[1],body:m[1],output:m[1],type,required:/NOT\s+NULL/i.test(part) && !/AUTO_INCREMENT|DEFAULT/i.test(part),summary:fields.length<6,writable:!/AUTO_INCREMENT/i.test(part)});
    }
    const pk=block.match(/PRIMARY\s+KEY\s*\(\s*`?([A-Za-z_]\w*)`?/i);
    const inline=parts.find(p=>/PRIMARY\s+KEY/i.test(p) && !/^\s*PRIMARY\s+KEY/i.test(p));
    const inlinePk=inline?.trim().match(/^`?([A-Za-z_]\w*)`?/);
    const key=pk?.[1]||inlinePk?.[1]||fields[0]?.db||'id';
    const row=parts.find(p=>new RegExp('^\\s*`?'+key+'`?\\s','i').test(p));
    tables.push({name:match[1],fields,key,auto:/AUTO_INCREMENT/i.test(row||''),keyType:fields.find(f=>f.db===key)?.type==='string'?'string':'number'});
    start.lastIndex=i;
  }
  return tables;
}
