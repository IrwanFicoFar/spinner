'use client';
import { useEffect, useRef, useState } from 'react';
import type { State } from '@/lib/model';
import { Gift } from 'lucide-react';
const colors=['#8d65f7','#f46bb5','#43d4c5','#ffb156','#668aff','#d46be7','#ff758c','#56c993'];
export function LiveWheel({state,admin,onSpin}:{state:State;admin:boolean;onSpin:()=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),[ended,setEnded]=useState('');
 const products=state.draw?.products||state.products.filter(p=>p.stock>0);
 const enabled=!admin&&state.live&&!state.draw&&(state.mode==='general'||!!state.selected)&&products.length>0;
 useEffect(()=>{
  const node=canvas.current,ctx=node?.getContext('2d');if(!node||!ctx)return;
  ctx.clearRect(0,0,1000,1000);const slice=Math.PI*2/products.length;
  products.forEach((p,i)=>{ctx.beginPath();ctx.moveTo(500,500);ctx.arc(500,500,495,i*slice-Math.PI/2,(i+1)*slice-Math.PI/2);ctx.fillStyle=colors[i%colors.length];ctx.fill();ctx.save();ctx.translate(500,500);ctx.rotate((i+.5)*slice-Math.PI/2);ctx.fillStyle='white';ctx.font=`bold ${Math.max(9,26-products.length*.17)}px Arial`;ctx.textAlign='right';ctx.fillText(p.name,465,4,310);ctx.restore();});
 },[products]);
 useEffect(()=>{let frame=0;const draw=state.draw;if(!draw){if(canvas.current)canvas.current.style.transform='rotate(0deg)';return;}
 const tick=()=>{const t=Math.max(0,Math.min(1,(Date.now()-draw.startedAt)/draw.duration)),progress=(1-Math.cos(Math.PI*t))/2;if(canvas.current)canvas.current.style.transform=`rotate(${draw.target*progress}deg)`;if(t<1)frame=requestAnimationFrame(tick);else setEnded(draw.id);};tick();return()=>cancelAnimationFrame(frame);
 },[state.draw]);
 return <div className="wheel-block">{!products.length?<div className="stage-empty"><span><Gift size={38}/></span><h3>Ruang untuk kejutan Anda</h3><p>Tambahkan hadiah di dashboard<br/>untuk mengisi roda undian.</p></div>:<button className="wheel-shell-next ready" disabled={!enabled} onClick={onSpin} aria-label="Putar roda hadiah"><div className="wheel-pointer">✦</div><canvas ref={canvas} width={1000} height={1000} style={{width:'100%',height:'100%',borderRadius:'50%'}}/><div className="wheel-center-next"><strong>{!state.live?'OFF':admin?'PREVIEW':state.draw?(ended===state.draw.id?'🎉':'…'):'SPIN'}</strong><small>{enabled?'KLIK RODA':admin?'LIVE PREVIEW':'MENUNGGU'}</small></div></button>}</div>;
}
