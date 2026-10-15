import { beforeEach, expect, mock, test } from 'bun:test';
import { initialState } from '../lib/seed';
import { hashSecret, SCREEN_COOKIE } from '../lib/screen-access';

// Exercise the actual HTTP handlers; substitute only external auth, cookies and DB.
let user,credential,cookieWrite,row;
const database={
  transaction:async fn=>fn(database),
  select:()=>({from:()=>({where:()=>({for:async()=>row?[structuredClone(row)]:[]})})}),
  update:()=>({set:values=>({where:async()=>{row={...row,...structuredClone(values)};}})}),
};
mock.module('../auth',()=>({auth:async()=>user?{user}:null}));
mock.module('../lib/db',()=>({db:()=>database}));
mock.module('next/headers',()=>({cookies:async()=>({get:name=>name===SCREEN_COOKIE&&credential?{value:credential}:undefined,set:(...args)=>{cookieWrite=args;}})}));
const access=await import('../app/api/screen/access/route');
const pair=await import('../app/api/screen/pair/route');
const screen=await import('../app/api/screen/workspace/route');
const admin=await import('../app/api/workspace/route');
function request(path,body,method='POST',origin='http://localhost:3000'){
  return new Request(`http://localhost:3000/api/${path}`,{method,headers:{Origin:origin,'Content-Type':'application/json'},...(method==='GET'?{}:{body:JSON.stringify(body)})});
}
beforeEach(()=>{user={id:'admin-1',email:'test@example.test'};credential='';cookieWrite=null;const state=initialState({demo:true});state.live=true;state.onboarded=true;state.mode='general';row={id:'workspace-1',state};});
test('only logged-in admin can create codes; foreign origin is refused',async()=>{
  user=null;expect((await access.POST(request('screen/access',{}))).status).toBe(401);
  expect((await access.POST(request('screen/access',{},'POST','https://other.example'))).status).toBe(403);
});
test('generated code is hashed, redeems once and sets a restricted cookie',async()=>{
  const created=await (await access.POST(request('screen/access',{}))).json();
  expect(row.state.screenAccess.codeHash).toBe(hashSecret(created.code));
  user=null;
  expect((await pair.POST(request('screen/pair',{code:created.code}))).status).toBe(200);
  expect(cookieWrite[0]).toBe(SCREEN_COOKIE);expect(cookieWrite[2].httpOnly).toBe(true);expect(cookieWrite[2].sameSite).toBe('strict');expect(cookieWrite[2].path).toBe('/api/screen');
  expect(row.state.screenAccess.codeHash).toBeUndefined();
  expect((await pair.POST(request('screen/pair',{code:created.code}))).status).toBe(400);
});
test('wrong and expired codes cannot create screen credentials',async()=>{
  row.state.screenAccess={codeHash:hashSecret('ABCDEFGHJKLM'),codeExpiresAt:Date.now()-1};
  expect((await pair.POST(request('screen/pair',{code:'ABCDEFGHJKLM'}))).status).toBe(400);
  row.state.screenAccess.codeExpiresAt=Date.now()+600000;
  expect((await pair.POST(request('screen/pair',{code:'ABCDEFGHJKLN'}))).status).toBe(400);expect(cookieWrite).toBeNull();
});
test('screen API rejects unpaired reads and administrative writes, accepts authorized spin',async()=>{
  expect((await screen.GET(request('screen/workspace',null,'GET'))).status).toBe(401);
  credential='workspace-1.valid-token';row.state.screenAccess={tokenHash:hashSecret('valid-token'),expiresAt:Date.now()+10000};
  expect((await screen.POST(request('screen/workspace',{type:'settings',live:false}))).status).toBe(403);
  expect(row.state.live).toBe(true);
  expect((await screen.POST(request('screen/workspace',{type:'spin',requestId:crypto.randomUUID(),participantId:''}))).status).toBe(200);
  expect(row.state.history.length).toBe(1);
});
test('admin revoke invalidates the cookie on the next screen request',async()=>{
  credential='workspace-1.valid-token';row.state.screenAccess={tokenHash:hashSecret('valid-token'),expiresAt:Date.now()+10000};
  expect((await screen.GET(request('screen/workspace',null,'GET'))).status).toBe(200);
  expect((await access.DELETE(request('screen/access',{},'DELETE'))).status).toBe(200);
  expect((await screen.GET(request('screen/workspace',null,'GET'))).status).toBe(401);
});
test('Google admin session cannot spin or confirm via admin API',async()=>{
  expect((await admin.POST(request('workspace',{type:'spin',requestId:crypto.randomUUID(),participantId:''}))).status).toBe(403);
  expect((await admin.POST(request('workspace',{type:'confirm',id:crypto.randomUUID()}))).status).toBe(403);
  expect(row.state.history).toEqual([]);
});
