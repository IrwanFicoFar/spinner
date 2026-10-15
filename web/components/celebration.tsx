'use client';

import { useEffect, useRef, useState } from 'react';
import type { Draw } from '@/lib/model';
import { wheelProgress, wheelPalette } from '@/lib/wheel-motion';

// Synthesized percussion and brass plus a locally hosted CC0 crowd recording.
class PartyAudio {
  context:AudioContext|null=null;
  output:GainNode|null=null;
  applause:AudioBuffer|null=null;
  loadingApplause=false;
  private active=true;
  get enabled(){return this.active;}
  set enabled(value:boolean){this.active=value;if(this.output)this.output.gain.value=value?1:0;}
  async unlock(){
    if(!this.context){this.context=new AudioContext();this.output=this.context.createGain();this.output.gain.value=this.active?1:0;const limiter=this.context.createDynamicsCompressor();limiter.threshold.value=-12;limiter.knee.value=18;limiter.ratio.value=5;this.output.connect(limiter);limiter.connect(this.context.destination);}
    if(this.context.state==='suspended')await this.context.resume();
    if(!this.applause&&!this.loadingApplause){this.loadingApplause=true;const context=this.context;void fetch('/audio/crowd-applause.mp3').then(response=>{if(!response.ok)throw new Error('audio');return response.arrayBuffer();}).then(buffer=>context.decodeAudioData(buffer)).then(buffer=>{this.applause=buffer;}).catch(()=>{}).finally(()=>{this.loadingApplause=false;});}
  }
  tone(frequency:number,duration:number,volume=.045,offset=0,type:OscillatorType='sine'){
    const context=this.context;if(!context||!this.enabled||context.state!=='running')return;
    const oscillator=context.createOscillator(),gain=context.createGain(),start=context.currentTime+offset;
    oscillator.type=type;oscillator.frequency.value=frequency;
    gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(volume,start+.009);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    oscillator.connect(gain);gain.connect(this.output!);oscillator.start(start);oscillator.stop(start+duration+.02);
    oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
  }
  percussion(duration:number,volume:number,frequency:number,offset=0){
    const context=this.context;if(!context||!this.enabled||context.state!=='running')return;
    const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),samples=buffer.getChannelData(0);
    for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*Math.exp(-i/samples.length*7);
    const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=buffer;filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=.7;gain.gain.value=volume;
    source.connect(filter);filter.connect(gain);gain.connect(this.output!);source.start(context.currentTime+offset);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
  }
  tick(){this.percussion(.065,.28,2300);this.tone(330,.055,.09,0,'triangle');}
  roll(progress:number){this.percussion(.09,.06+progress*.1,1600);this.tone(90,.1,.035);}
  shuffle(){this.tone(440+Math.random()*440,.1,.09,0,'triangle');this.percussion(.045,.08,2200);}
  celebrate(){
    const context=this.context;if(!context||!this.enabled||context.state!=='running')return;
    [523.25,523.25,523.25,659.25,783.99,1046.5].forEach((note,index)=>{
      const offset=index*.18;
      this.tone(note,index===5?1.5:.28,.075,offset,'sawtooth');
      this.tone(note/2,.38,.09,offset,'triangle');
      this.percussion(.18,.18,2000,offset);
    });
    [523.25,659.25,783.99,1046.5].forEach(note=>this.tone(note,1.8,.045,1.1,'sawtooth'));
    this.tone(65,.8,.2);this.percussion(1.5,.25,6500);
    if(this.applause){
      const source=context.createBufferSource(),gain=context.createGain();source.buffer=this.applause;
      const start=context.currentTime+.15;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.9,start+.15);gain.gain.setValueAtTime(.9,start+5.5);gain.gain.linearRampToValueAtTime(0,start+8);
      source.connect(gain);gain.connect(this.output!);source.start(start);source.stop(start+8);source.onended=()=>{source.disconnect();gain.disconnect();};return;
    }
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
    let lastSegment=-1,lastRoll=0;
    const timer=setInterval(()=>{
      const t=Math.max(0,Math.min(1,(Date.now()-startedAt)/duration));
      if(t>0&&t<1){
        if(t<.86&&Date.now()-lastRoll>150-95*t){audio.current?.roll(t);lastRoll=Date.now();}
        const segment=Math.floor(wheelProgress(t)*target/360*count);
        if(segment!==lastSegment){lastSegment=segment;audio.current?.tick();}
      }
      if(t===1){if(!played.current.has(id)){played.current.add(id);audio.current?.celebrate();}clearInterval(timer);}
    },35);
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
    const colors=wheelPalette;
    const pieces=Array.from({length:width<600?230:460},(_,i)=>({x:i%2?width*.02:width*.98,y:height*(i%3===0?.85:.6),vx:(i%2?1:-1)*(width/100)*(Math.random()*.7+.15),vy:-7-Math.random()*15,spin:Math.random()*6,size:4+Math.random()*7,color:colors[i%colors.length],delay:Math.floor(i/(width<600?80:150))*550,kind:i%5}));
    let frame=0,last=performance.now();const start=last;
    const render=(now:number)=>{
      const dt=Math.min((now-last)/16.67,2);last=now;context.clearRect(0,0,width,height);
      context.globalAlpha=Math.max(0,Math.min(1,(8000-(now-start))/1800));
      for(const p of pieces){if(now-start<p.delay)continue;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.19*dt;p.vx*=Math.pow(.99,dt);p.spin+=.09*dt;context.save();context.translate(p.x,p.y);context.rotate(p.spin);context.fillStyle=p.color;
        if(p.kind===0){context.beginPath();for(let point=0;point<10;point++){const radius=point%2?p.size*.4:p.size;context.lineTo(Math.cos(point*Math.PI/5)*radius,Math.sin(point*Math.PI/5)*radius);}context.closePath();context.fill();}
        else{context.scale(1,Math.cos(p.spin));context.fillRect(-p.size/2,-p.size/2,p.size,p.size*(p.kind===1?3:.65));}context.restore();}
      if(now-start<8000)frame=requestAnimationFrame(render);else context.clearRect(0,0,width,height);
    };
    frame=requestAnimationFrame(render);return()=>{cancelAnimationFrame(frame);context.clearRect(0,0,width,height);};
  },[id,startedAt,duration]);
  return <canvas aria-hidden="true" ref={canvas} className="celebration-canvas"/>;
}
