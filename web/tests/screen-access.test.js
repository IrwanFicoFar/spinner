import { test, expect } from 'bun:test';
import { initialState } from '../lib/seed';
import { execute } from '../lib/engine';
import { adminView, hashSecret, newScreenToken, normalizeCode, pairingCode, screenCommandAllowed, screenView, validScreenToken } from '../lib/screen-access';

function setup(){const s=initialState({demo:true});s.live=true;s.onboarded=true;s.mode='participant';s.selected=s.participants[0].id;return s;}
test('pairing codes are 60-bit random codes with unambiguous characters',()=>{
  const codes=new Set(Array.from({length:100},()=>pairingCode()));expect(codes.size).toBe(100);
  for(const code of codes)expect(code).toMatch(/^[A-HJ-NP-Z2-9]{12}$/);
  expect(normalizeCode('abcd-efgh jklm')).toBe('ABCDEFGHJKLM');
});
test('screen token validates only its own workspace and expires',()=>{
  const s=setup(),token=newScreenToken();s.screenAccess={tokenHash:hashSecret(token),expiresAt:2000};
  expect(validScreenToken(s,token,1999)).toBe(true);
  expect(validScreenToken(s,token,2000)).toBe(false);
  expect(validScreenToken(s,newScreenToken(),1000)).toBe(false);
  expect(validScreenToken(setup(),token,1000)).toBe(false);
});
test('revocation and replacement immediately invalidate old screen credentials',()=>{
  const s=setup(),token=newScreenToken();s.screenAccess={tokenHash:hashSecret(token),expiresAt:2000};
  s.screenAccess.tokenHash=hashSecret(newScreenToken());expect(validScreenToken(s,token,1000)).toBe(false);
  delete s.screenAccess;expect(validScreenToken(s,token,1000)).toBe(false);
});
test('screen never receives rules or pairing secrets',()=>{
  const s=setup();s.control='public';s.screenAccess={codeHash:'secret',tokenHash:'secret',expiresAt:2000};
  const view=screenView(s);expect(view.screenAccess).toBeUndefined();expect(view.canSpin).toBe(true);
  expect(view.participants.every(p=>p.mode==='exclude'&&p.productIds.length===0)).toBe(true);
  expect(adminView(s).screenAccess).toBeUndefined();
});
test('admin-controlled screen does not receive names, participant list or history',()=>{
  const s=setup();s.control='admin';execute(s,{type:'spin',requestId:crypto.randomUUID(),participantId:s.selected},1000);
  const view=screenView(s);expect(view.participants).toEqual([]);expect(view.history).toEqual([]);
  expect(view.draw?.participantName).toBe('');expect(view.draw?.participantId).toBe('');expect(view.canSpin).toBe(false);
  expect(s.draw?.participantName).not.toBe('');
});
test('public picker contains only eligible participants while wheel shows all prizes',()=>{
  const s=setup();s.control='public';s.participants[0].mode='include';s.participants[0].productIds=[];
  const view=screenView(s);expect(view.participants.some(p=>p.id===s.selected)).toBe(false);
  expect(view.products).toHaveLength(s.products.length);expect(view.canSpin).toBe(false);
});
test('a paired screen cannot mutate settings, data or bulk delete',()=>{
  const s=setup();
  expect(screenCommandAllowed(s,{type:'settings',live:true})).toBe(false);
  expect(screenCommandAllowed(s,{type:'bulkDelete',kind:'product',ids:['p1']})).toBe(false);
  expect(screenCommandAllowed(s,{type:'clearDemo'})).toBe(false);
  expect(screenCommandAllowed(s,{type:'product',product:s.products[0]})).toBe(false);
  expect(screenCommandAllowed(s,{type:'participant',person:s.participants[0]})).toBe(false);
  expect(screenCommandAllowed(s,{type:'spin',requestId:crypto.randomUUID(),participantId:s.selected})).toBe(true);
  expect(screenCommandAllowed(s,{type:'confirm',id:crypto.randomUUID()})).toBe(true);
});
test('screen participant selection follows admin control setting',()=>{
  const s=setup(),command={type:'select',id:s.selected};
  s.control='admin';expect(screenCommandAllowed(s,command)).toBe(false);
  s.control='public';expect(screenCommandAllowed(s,command)).toBe(true);
  s.mode='general';expect(screenCommandAllowed(s,command)).toBe(false);
});
test('OFF and manual confirmation keep screen disabled',()=>{
  const s=setup();s.advance='manual';s.live=false;expect(screenView(s).canSpin).toBe(false);s.live=true;
  execute(s,{type:'spin',requestId:crypto.randomUUID(),participantId:s.selected},1000);
  execute(s,{type:'confirm',id:s.draw.id},10000);expect(screenView(s).canSpin).toBe(false);expect(s.selected).toBe('');
});
