import { randomInt } from 'node:crypto';
import type { State } from './model';
import { eligible } from './model';
import type { Command } from './commands';
export class DrawError extends Error {}
export function execute(s:State,c:Command,now=Date.now()):State {
 if(c.type==='spin' && s.history.some(d=>d.id===c.requestId)) return s;
 const busy=s.draw!==null;
 if(busy && c.type!=='confirm' && !(c.type==='settings' && Object.keys(c).every(k=>['type','live'].includes(k)))) throw new DrawError('Selesaikan putaran sebelumnya dahulu.');
 if(c.type==='settings') {
  if(c.mode && c.mode!==s.mode) s.selected='';
  if(c.advance==='manual') s.selected='';
  const {type,...settings}=c; void type; Object.assign(s,settings);
 }
 if(c.type==='select') {
  if(c.id && !s.participants.some(p=>p.id===c.id&&eligible(s,p).length)) throw new DrawError('Peserta tidak tersedia.');
  s.selected=c.id;
 }
 if(c.type==='product') {const i=s.products.findIndex(p=>p.id===c.product.id);if(i<0)s.products.push(c.product);else s.products[i]=c.product;}
 if(c.type==='participant') {
  if(c.person.productIds.some(id=>!s.products.some(p=>p.id===id))) throw new DrawError('Hadiah aturan tidak ditemukan.');
  const i=s.participants.findIndex(p=>p.id===c.person.id);if(i<0)s.participants.push(c.person);else s.participants[i]=c.person;
 }
 if(c.type==='delete') {if(c.kind==='product'){s.products=s.products.filter(p=>p.id!==c.id);s.participants.forEach(p=>p.productIds=p.productIds.filter(id=>id!==c.id));}else{s.participants=s.participants.filter(p=>p.id!==c.id);if(s.selected===c.id)s.selected='';}}
 if(c.type==='spin') {
  if(!s.onboarded || !s.live) throw new DrawError('Spinner sedang OFF.');
  const person=s.participants.find(p=>p.id===s.selected);
  if(s.mode==='participant' && (!person || c.participantId!==s.selected)) throw new DrawError('Peserta berubah. Pilih dan periksa peserta kembali.');
  const pool=eligible(s,person);if(!pool.length)throw new DrawError('Tidak ada hadiah yang sesuai.');
  const products=s.products.filter(p=>p.stock>0).map(p=>({...p})), product=pool[randomInt(pool.length)];
  const index=products.findIndex(p=>p.id===product.id);
  s.draw={id:c.requestId,participantId:person&&s.mode==='participant'?person.id:'',participantName:person&&s.mode==='participant'?person.name:'Undian umum',productId:product.id,productName:product.name,icon:product.icon,startedAt:now+800,duration:6000,target:2160+360-(index+.5)*360/products.length,products};
  product.stock--;s.history.push(s.draw);
  if(s.mode==='participant')s.selected='';
 }
 if(c.type==='confirm') {
  if(!s.draw || s.draw.id!==c.id)return s;
  if(now<s.draw.startedAt+s.draw.duration)throw new DrawError('Roda masih berputar.');
  s.draw=null;
  if(s.mode==='participant')s.selected=s.advance==='auto'?(s.participants.find(p=>eligible(s,p).length)?.id||''):'';
 }
 return s;
}
