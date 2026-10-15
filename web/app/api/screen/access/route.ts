import { auth } from '@/auth';
import { db } from '@/lib/db';
import { workspaces } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hashSecret, PAIR_CODE_MS, pairingCode } from '@/lib/screen-access';

async function manage(request:Request,action:'read'|'create'|'revoke'){
  if(action!=='read'&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Origin tidak diizinkan.'},{status:403});
  const user=(await auth())?.user;
  if(!user?.id)return Response.json({error:'Silakan login sebagai admin.'},{status:401});
  const userId=user.id;
  try{
    const result=await db().transaction(async tx=>{
      const [row]=await tx.select().from(workspaces).where(eq(workspaces.googleSubject,userId)).for('update');
      if(!row)return null;
      const state=row.state;
      let code:string|undefined;
      if(action==='create'){
        code=pairingCode();state.screenAccess={...state.screenAccess,codeHash:hashSecret(code),codeExpiresAt:Date.now()+PAIR_CODE_MS};
      }else if(action==='revoke'){delete state.screenAccess;}
      if(action!=='read')await tx.update(workspaces).set({state}).where(eq(workspaces.id,row.id));
      return {code,codeExpiresAt:state.screenAccess?.codeExpiresAt||0,connected:!!state.screenAccess?.tokenHash&&(state.screenAccess.expiresAt||0)>Date.now(),expiresAt:state.screenAccess?.expiresAt||0};
    });
    if(!result)return Response.json({error:'Buka workspace terlebih dahulu.'},{status:404});
    return Response.json(result,{headers:{'Cache-Control':'no-store'}});
  }catch{return Response.json({error:'Koneksi layar belum dapat diperbarui.'},{status:503});}
}
export const GET=(request:Request)=>manage(request,'read');
export const POST=(request:Request)=>manage(request,'create');
export const DELETE=(request:Request)=>manage(request,'revoke');
