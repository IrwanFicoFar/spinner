import {test,expect} from 'bun:test';
import {execute} from '../lib/engine';
import {initialState} from '../lib/seed';
function setup(){const s=initialState();s.live=true;s.onboarded=true;s.mode='participant';s.selected=s.participants[0].id;return s;}
function spin(s){return execute(s,{type:'spin',requestId:crypto.randomUUID(),participantId:s.selected},1000);}
test('manual confirmation leaves participant empty and blocks next spin',()=>{const s=setup();spin(s);expect(s.selected).toBe('');execute(s,{type:'confirm',id:s.draw.id},10000);expect(s.selected).toBe('');expect(()=>spin(s)).toThrow();});
test('switching to manual clears previous selection',()=>{const s=setup();execute(s,{type:'settings',advance:'manual'});expect(s.selected).toBe('');});
test('auto selects next eligible participant only after confirmation',()=>{const s=setup();s.advance='auto';const previous=s.selected;spin(s);expect(s.selected).toBe('');execute(s,{type:'confirm',id:s.draw.id},10000);expect(s.selected).not.toBe(previous);expect(s.selected).not.toBe('');});
test('include restriction controls outcome but all prizes appear',()=>{const s=setup();s.participants[0].mode='include';s.participants[0].productIds=[s.products[1].id];spin(s);expect(s.draw.productId).toBe(s.products[1].id);expect(s.draw.products.length).toBe(100);});
test('exclude restriction prevents forbidden outcome',()=>{const s=setup();s.participants[0].mode='exclude';s.participants[0].productIds=s.products.slice(1).map(p=>p.id);spin(s);expect(s.draw.productId).toBe(s.products[0].id);});
test('OFF and stale participant cannot spin',()=>{const s=setup();s.live=false;expect(()=>spin(s)).toThrow();s.live=true;expect(()=>execute(s,{type:'spin',requestId:crypto.randomUUID(),participantId:'stale'})).toThrow();});
test('request replay reserves stock once and second draw is blocked',()=>{const s=setup();const c={type:'spin',requestId:crypto.randomUUID(),participantId:s.selected};const before=s.products.reduce((a,p)=>a+p.stock,0);execute(s,c,1000);execute(s,c,1000);expect(s.history.length).toBe(1);expect(s.products.reduce((a,p)=>a+p.stock,0)).toBe(before-1);expect(()=>spin(s)).toThrow();});
test('active draw locks edits and early confirmation',()=>{const s=setup();spin(s);expect(()=>execute(s,{type:'settings',advance:'manual'})).toThrow();expect(()=>execute(s,{type:'confirm',id:s.draw.id},2000)).toThrow();});
test('general mode draws without participant',()=>{const s=setup();s.mode='general';s.selected='';spin(s);expect(s.draw.participantId).toBe('');});
