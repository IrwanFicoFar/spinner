import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { workspaces } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { commandSchema, type Command } from '@/lib/commands';
import { execute, DrawError } from '@/lib/engine';
import { SCREEN_COOKIE, validScreenToken, screenCommandAllowed, screenView } from '@/lib/screen-access';

async function handle(request:Request){
  const write=request.method==='POST';
  if(write&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Origin tidak diizinkan.'},{status:403});
  const credential=(await cookies()).get(SCREEN_COOKIE)?.value||'';
  const [id,token,...extra]=credential.split('.');
  if(!id||!token||extra.length||credential.length>160)return Response.json({error:'Hubungkan layar dengan kode dari admin.'},{status:401});
  let command:Command|undefined;
  if(write){try{const raw=await request.text();if(raw.length>2000)throw new Error();const parsed=commandSchema.safeParse(JSON.parse(raw));if(!parsed.success)throw new Error();command=parsed.data;}catch{return Response.json({error:'Perintah tidak valid.'},{status:400});}}
  try{
    return await db().transaction(async tx=>{
      const [row]=await tx.select().from(workspaces).where(eq(workspaces.id,id)).for('update');
      if(!row||!validScreenToken(row.state,token))return Response.json({error:'Koneksi layar berakhir. Minta kode baru dari admin.'},{status:401});
      let state=row.state;
      if(command){
        if(!screenCommandAllowed(state,command))return Response.json({error:'Layar spinner tidak memiliki akses ke pengaturan admin.'},{status:403});
        state=execute(state,command);
        await tx.update(workspaces).set({state}).where(eq(workspaces.id,id));
      }
      return Response.json(screenView(state),{headers:{'Cache-Control':'no-store'}});
    });
  }catch(error){return Response.json({error:error instanceof DrawError?error.message:'Koneksi ke acara terputus. Mencoba lagi…'},{status:error instanceof DrawError?409:503});}
}
export const GET=handle;
export const POST=handle;
