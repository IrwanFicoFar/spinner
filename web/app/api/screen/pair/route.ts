import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { workspaces } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { hashSecret, normalizeCode, newScreenToken, SCREEN_COOKIE, SCREEN_SESSION_MS } from '@/lib/screen-access';

export async function POST(request:Request){
  if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Origin tidak diizinkan.'},{status:403});
  let code:string;
  try{const raw=await request.text();if(raw.length>200)throw new Error();const input=JSON.parse(raw);code=normalizeCode(input.code);if(!/^[A-HJ-NP-Z2-9]{12}$/.test(code))throw new Error();}catch{return Response.json({error:'Masukkan 12 karakter kode dari dashboard admin.'},{status:400});}
  try{
    const token=newScreenToken();
    const workspaceId=await db().transaction(async tx=>{
      const [row]=await tx.select().from(workspaces).where(sql`${workspaces.state}->'screenAccess'->>'codeHash' = ${hashSecret(code)}`).for('update');
      if(!row?.state.screenAccess?.codeExpiresAt||row.state.screenAccess.codeExpiresAt<=Date.now()||row.state.screenAccess.codeHash!==hashSecret(code))return null;
      row.state.screenAccess={tokenHash:hashSecret(token),expiresAt:Date.now()+SCREEN_SESSION_MS};
      await tx.update(workspaces).set({state:row.state}).where(eq(workspaces.id,row.id));
      return row.id;
    });
    if(!workspaceId)return Response.json({error:'Kode sudah dipakai, kedaluwarsa, atau tidak ditemukan. Minta kode baru dari admin.'},{status:400});
    (await cookies()).set(SCREEN_COOKIE,`${workspaceId}.${token}`,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/api/screen',maxAge:SCREEN_SESSION_MS/1000});
    return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
  }catch{return Response.json({error:'Belum bisa menghubungkan layar. Coba lagi sebentar.'},{status:503});}
}
