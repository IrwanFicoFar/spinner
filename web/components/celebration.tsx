'use client';

import { useEffect, useRef, useState } from 'react';
import type { Draw } from '@/lib/model';

// Sound is synthesized locally; no audio files or third-party requests are needed.
class PartyAudio {
  context:AudioContext|null=null;
  output:GainNode|null=null;
  private active=true;
  get enabled(){return this.active;}
  set enabled(value:boolean){this.active=value;if(this.output)this.output.gain.value=value?1:0;}
  async unlock(){
    if(!this.context){this.context=new AudioContext();this.output=this.context.createGain();this.output.gain.value=this.active?1:0;this.output.connect(this.context.destination);}
    if(this.context.state==='suspended')await this.context.resume();
  }
  tone(frequency:number,duration:number,volume=.045,offset=0,type:OscillatorType='sine'){
    const context=this.context;if(!context||!this.enabled||context.state!=='running')return;
    const oscillator=context.createOscillator(),gain=context.createGain(),start=context.currentTime+offset;
    oscillator.type=type;oscillator.frequency.value=frequency;
    gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(volume,start+.009);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    oscillator.connect(gain);gain.connect(this.output!);oscillator.start(start);oscillator.stop(start+duration+.02);
    oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
  }
  tick(){this.tone(900,.045,.028);}
  shuffle(){this.tone(520,.07,.035);}
  celebrate(){
    const context=this.context;if(!context||!this.enabled||context.state!=='running')return;
    [523.25,659.25,783.99,1046.5].forEach((note,index)=>{
      this.tone(note,.24,.035,index*.15,'triangle');
      this.tone(note/2,.25,.015,index*.15,'sawtooth');
    });
    [523.25,659.25,783.99,1046.5].forEach(note=>this.tone(note,1.3,.018,.72,'sawtooth'));
    // Filtered bursts of noise simulate a crowd clapping, fading out naturally.
    const length=context.sampleRate*3,buffer=context.createBuffer(1,length,context.sampleRate),samples=buffer.getChannelData(0);
    for(let i=0;i<length;i++){
      const t=i/context.sampleRate,envelope=Math.max(0,1-t/3);
      const clap=Math.pow(Math.max(0,Math.sin(t*65)+Math.sin(t*43)*.5),5);
      samples[i]=(Math.random()*2-1)*Math.min(.6,clap)*envelope;
    }
    const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
    source.buffer=buffer;filter.type='bandpass';filter.frequency.value=1500;filter.Q.value=.6;gain.gain.value=.32;
    source.connect(filter);filter.connect(gain);gain.connect(this.output!);source.start(context.currentTime+.4);
    source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
  }
  dispose(){void this.context?.close();this.context=null;}
}

export function usePartySound(draw:Draw|null|undefined) {
  const audio=useRef<PartyAudio|null>(null),played=useRef(new Set<string>());
  const [enabled,setEnabled]=useState(true);
  const id=draw?.id,startedAt=draw?.startedAt,duration=draw?.duration,target=draw?.target,count=draw?.products.length;
  const unlock=()=>{
    if(!audio.current)audio.current=new PartyAudio();
    void audio.current.unlock().catch(()=>{});
  };
  const toggle=()=>{unlock();const value=!enabled;audio.current!.enabled=value;setEnabled(value);};
  const activate=()=>{unlock();if(audio.current)audio.current.enabled=enabled;};
  const shuffle=()=>{if(enabled)audio.current?.shuffle();};
  useEffect(()=>()=>audio.current?.dispose(),[]);
  useEffect(()=>{
    if(!id||!enabled||startedAt===undefined||duration===undefined||target===undefined||count===undefined)return;
    const end=startedAt+duration;
    // Do not replay an old result when reconnecting or refreshing.
    if(Date.now()>end+2000)return;
    let lastSegment=-1;
    const timer=setInterval(()=>{
      const t=Math.max(0,Math.min(1,(Date.now()-startedAt)/duration));
      if(t>0&&t<1){
        const segment=Math.floor((1-Math.cos(Math.PI*t))/2*target/360*count);
        if(segment!==lastSegment){lastSegment=segment;audio.current?.tick();}
      }
      if(t===1){if(!played.current.has(id)){played.current.add(id);audio.current?.celebrate();}clearInterval(timer);}
    },65);
    return()=>clearInterval(timer);
  },[id,startedAt,duration,target,count,enabled]);
  return {enabled,toggle,activate,shuffle};
}

export function Confetti({draw}:{draw:Draw|null}) {
  const canvas=useRef<HTMLCanvasElement>(null),played=useRef(new Set<string>());
  const id=draw?.id,startedAt=draw?.startedAt,duration=draw?.duration;
  useEffect(()=>{
    if(!id||startedAt===undefined||duration===undefined||played.current.has(id))return;
    played.current.add(id);
    if(Date.now()>startedAt+duration+2500)return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const node=canvas.current,context=node?.getContext('2d');if(!node||!context)return;
    const width=innerWidth,height=innerHeight,dpr=Math.min(devicePixelRatio||1,2);
    node.width=width*dpr;node.height=height*dpr;context.scale(dpr,dpr);
    const colors=['#aa7cf3','#f18fbe','#f5c169','#68cdb9','#7c9df2','#ed767b'];
    const pieces=Array.from({length:150},(_,i)=>({x:i%2?width*.08:width*.92,y:height*.7,vx:(i%2?1:-1)*(3+Math.random()*9),vy:-10-Math.random()*14,spin:Math.random()*6,size:4+Math.random()*6,color:colors[i%colors.length]}));
    let frame=0,last=performance.now();const start=last;
    const render=(now:number)=>{
      const dt=Math.min((now-last)/16.67,2);last=now;context.clearRect(0,0,width,height);
      context.globalAlpha=Math.max(0,Math.min(1,(6000-(now-start))/1500));
      for(const p of pieces){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.28*dt;p.vx*=Math.pow(.993,dt);p.spin+=.12*dt;context.save();context.translate(p.x,p.y);context.rotate(p.spin);context.fillStyle=p.color;context.fillRect(-p.size/2,-p.size/2,p.size,p.size*.6);context.restore();}
      if(now-start<6000)frame=requestAnimationFrame(render);else context.clearRect(0,0,width,height);
    };
    frame=requestAnimationFrame(render);return()=>{cancelAnimationFrame(frame);context.clearRect(0,0,width,height);};
  },[id,startedAt,duration]);
  return <canvas aria-hidden="true" ref={canvas} className="celebration-canvas"/>;
}
