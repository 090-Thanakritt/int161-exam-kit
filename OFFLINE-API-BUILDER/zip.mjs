// ZIP แบบ STORE (ไม่บีบอัด) เพื่อให้ดาวน์โหลดได้ใน browser โดยไม่มี CDN/npm
const encoder = new TextEncoder();
const u16 = n => [n & 255, (n >>> 8) & 255];
const u32 = n => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];
const table = Array.from({length:256}, (_,i) => {
  let c=i; for(let j=0;j<8;j++) c=(c&1) ? 0xedb88320^(c>>>1) : c>>>1; return c>>>0;
});
function crc32(bytes) { let c=0xffffffff; for(const b of bytes) c=table[(c^b)&255]^(c>>>8); return (c^0xffffffff)>>>0; }
export function makeZip(files) {
  const chunks=[], central=[]; let offset=0;
  for (const [filename, value] of Object.entries(files)) {
    const name=encoder.encode(filename.replaceAll('\\','/'));
    const data=typeof value==='string' ? encoder.encode(value) : value;
    const crc=crc32(data);
    const local=new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...name]);
    const header=new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(name.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset),...name]);
    chunks.push(local,data); central.push(header); offset+=local.length+data.length;
  }
  const centralSize=central.reduce((n,c)=>n+c.length,0);
  const end=new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(central.length),...u16(central.length),...u32(centralSize),...u32(offset),...u16(0)]);
  return new Blob([...chunks,...central,end],{type:'application/zip'});
}
