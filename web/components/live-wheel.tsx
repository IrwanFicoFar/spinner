'use client';
import { useEffect, useRef, useState } from 'react';
import type { State } from '@/lib/model';
import { wheelPalette, wheelProgress, wheelTextColor } from '@/lib/wheel-motion';
import { Gift } from 'lucide-react';

export function LiveWheel({state,admin,onSpin}:{state:State;admin:boolean;onSpin:()=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),pointer=useRef<HTMLDivElement>(null),[ended,setEnded]=useState('');
 const products=state.draw?.products||state.products.filter(p=>p.stock>0);
 const id=state.draw?.id,startedAt=state.draw?.startedAt,duration=state.draw?.duration,target=state.draw?.target,winner=state.draw?.productId,count=products.length;
 const enabled=!admin&&(state.canSpin??(state.live&&!state.draw&&(state.mode==='general'||!!state.selected)&&products.length>0));
 useEffect(()=>{
  const node=canvas.current,ctx=node?.getContext('2d');if(!node||!ctx)return;
  ctx.clearRect(0,0,1000,1000);const slice=Math.PI*2/products.length;
  products.forEach((p,i)=>{
   const color=wheelPalette[i%wheelPalette.length];
   ctx.beginPath();ctx.moveTo(500,500);ctx.arc(500,500,494,i*slice-Math.PI/2,(i+1)*slice-Math.PI/2);ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#ffffff70';ctx.lineWidth=.8;ctx.stroke();
   ctx.save();ctx.translate(500,500);ctx.rotate((i+.5)*slice-Math.PI/2);ctx.fillStyle=wheelTextColor(color);ctx.font=`750 ${Math.max(3,Math.min(28,1900/products.length))}px Arial`;ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(p.name,453,0,322);ctx.restore();
   const angle=i*slice-Math.PI/2;
   ctx.beginPath();ctx.arc(500+482*Math.cos(angle),500+482*Math.sin(angle),Math.min(4,900/products.length),0,Math.PI*2);ctx.fillStyle='#fff6cc';ctx.shadowColor='#13203d80';ctx.shadowBlur=3;ctx.fill();ctx.shadowBlur=0;
   if(id===ended&&p.id===winner){ctx.beginPath();ctx.arc(500,500,490,i*slice-Math.PI/2,(i+1)*slice-Math.PI/2);ctx.strokeStyle='#ffe784';ctx.lineWidth=9;ctx.stroke();}
  });
 },[products,id,ended,winner]);
 useEffect(()=>{
  let frame=0,previous=performance.now(),lastSegment=-1,angle=0,velocity=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!id||startedAt===undefined||duration===undefined||target===undefined){if(canvas.current)canvas.current.style.transform='rotate(0deg)';if(pointer.current)pointer.current.style.transform='translateX(-50%)';return;}
  const tick=(now:number)=>{
   const t=Math.max(0,Math.min(1,(Date.now()-startedAt)/duration)),rotation=target*wheelProgress(t);
   if(canvas.current)canvas.current.style.transform=`rotate(${rotation}deg)`;
   const segment=Math.floor(rotation/360*count),dt=Math.min((now-previous)/1000,.032);previous=now;
   if(t>0&&t<1&&!reduced){
    if(lastSegment>=0&&segment!==lastSegment){angle=-19;velocity=25;}
    velocity+=(-260*angle-24*velocity)*dt;angle+=velocity*dt;
    if(pointer.current)pointer.current.style.transform=`translateX(-50%) rotate(${angle}deg)`;
   }
   lastSegment=segment;
   if(t<1)frame=requestAnimationFrame(tick);
   else{if(pointer.current)pointer.current.style.transform='translateX(-50%) rotate(0deg)';setEnded(id);}
  };
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[id,startedAt,duration,target,count]);
 return <div className="wheel-block">{!products.length?<div className="stage-empty"><span><Gift size={38}/></span><h3>Ruang untuk kejutan Anda</h3><p>Tambahkan hadiah di dashboard<br/>untuk mengisi roda undian.</p></div>:<button className={`wheel-shell-next ready ${id&&ended!==id?'wheel-in-motion':''}`} disabled={!enabled} onClick={onSpin} aria-label="Putar roda hadiah"><div ref={pointer} className="wheel-pointer"><span/></div><canvas ref={canvas} width={1000} height={1000} style={{width:'100%',height:'100%',borderRadius:'50%',willChange:id&&ended!==id?'transform':'auto'}}/><div className="wheel-center-next"><strong>{!state.live?'OFF':admin?'PREVIEW':state.draw?(ended===state.draw.id?'🎉':'…'):'SPIN'}</strong><small>{enabled?'KLIK RODA':admin?'LIVE PREVIEW':'MENUNGGU'}</small></div></button>}</div>;
}
