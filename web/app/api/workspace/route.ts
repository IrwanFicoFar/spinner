import { auth } from '@/auth';
import { db } from '@/lib/db';
import { workspaces } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { initialState } from '@/lib/seed';
import { commandSchema } from '@/lib/commands';
import { execute, DrawError } from '@/lib/engine';
async function identity(){const session=await auth();return session?.user?.id&&session.user.email?session.user:null;}
export async function GET(){
 try {
  const user=await identity();if(!user)return Response.json({error:'Silakan login.'},{status:401});
  const database=db();
  const [existing]=await database.select().from(workspaces).where(eq(workspaces.googleSubject,user.id!));
  if(existing)return Response.json(existing.state,{headers:{'Cache-Control':'no-store'}});
  await database.insert(workspaces).values({id:crypto.randomUUID(),googleSubject:user.id!,email:user.email!,state:initialState()}).onConflictDoNothing();
  const [row]=await database.select().from(workspaces).where(eq(workspaces.googleSubject,user.id!));
  return Response.json(row.state,{headers:{'Cache-Control':'no-store'}});
 }catch(error){console.error('Workspace read failed',error instanceof Error?error.name:'Error');return Response.json({error:'Database belum tersedia. Periksa konfigurasi dan migrasi.'},{status:503});}
}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Origin tidak diizinkan.'},{status:403});
 const user=await identity();if(!user)return Response.json({error:'Silakan login.'},{status:401});
 let input;try{const raw=await request.text();if(raw.length>100000)throw new Error();input=commandSchema.safeParse(JSON.parse(raw));}catch{return Response.json({error:'Input tidak valid.'},{status:400});}
 if(!input.success)return Response.json({error:'Input tidak valid.'},{status:400});
 try{
  const state=await db().transaction(async tx=>{
   const [row]=await tx.select().from(workspaces).where(eq(workspaces.googleSubject,user.id!)).for('update');
   if(!row)throw new DrawError('Workspace belum tersedia. Muat ulang halaman.');
   const state=execute(row.state,input.data);await tx.update(workspaces).set({state}).where(eq(workspaces.id,row.id));return state;
  });
  return Response.json(state,{headers:{'Cache-Control':'no-store'}});
 }catch(error){return Response.json({error:error instanceof DrawError?error.message:'Gagal menyimpan perubahan.'},{status:409});}
}
