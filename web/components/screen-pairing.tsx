'use client';
import { useEffect, useState } from 'react';
import { Check, Copy, Link2, Monitor, ShieldCheck, Unplug } from 'lucide-react';
import { Button, Modal } from './ui';
import { Logo } from './logo';

export function ScreenPairing({onConnected}:{onConnected:()=>void}){
  const [code,setCode]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  return <main className="screen-pairing"><Logo/><section className="pairing-welcome"><span className="pairing-icon"><Monitor size={34}/></span><p className="section-caption">LAYAR ACARA ANDA</p><h1>Satu kode.<br/>Panggung terhubung<span>.</span></h1><p>Buka <b>Hubungkan layar</b> di dashboard admin, lalu masukkan kode yang ditampilkan.</p><form onSubmit={async event=>{
    event.preventDefault();setBusy(true);setError('');
    try{const response=await fetch('/api/screen/pair',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})});const data=await response.json();if(!response.ok)throw new Error(data.error);onConnected();}catch(e){setError(e instanceof Error?e.message:'Koneksi belum tersedia.');}finally{setBusy(false);}
  }}><label className="ui-field">Kode layar<input className="pairing-input" autoFocus autoComplete="off" spellCheck={false} autoCapitalize="characters" maxLength={14} placeholder="ABCD-EFGH-JKLM" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} required/></label>{error&&<p className="pairing-error" role="alert">{error}</p>}<Button type="submit" disabled={busy||code.replace(/[\s-]/g,'').length!==12}><Link2 size={18}/>{busy?'Menghubungkan…':'Hubungkan panggung'}</Button></form><small><ShieldCheck size={16}/>Akses khusus spinner. Pengaturan tetap di tangan admin.</small></section></main>;
}

export function ScreenConnection(){
  const [open,setOpen]=useState(false),[code,setCode]=useState(''),[expires,setExpires]=useState(0),[connected,setConnected]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[copied,setCopied]=useState(false),[now,setNow]=useState(0),[revoke,setRevoke]=useState(false);
  useEffect(()=>{
    if(!open)return;
    let active=true;
    const read=async()=>{try{const response=await fetch('/api/screen/access',{cache:'no-store'});if(response.ok&&active){const data=await response.json();if(!active)return;setConnected(data.connected);if(!data.codeExpiresAt)setCode('');}}catch{/* Next poll retries. */}};
    void read();const poll=setInterval(()=>void read(),5000),clock=setInterval(()=>setNow(Date.now()),1000);
    return()=>{active=false;clearInterval(poll);clearInterval(clock);};
  },[open]);
  async function update(method:'POST'|'DELETE'){
    setBusy(true);setError('');setCopied(false);
    try{const response=await fetch('/api/screen/access',{method});const data=await response.json();if(!response.ok)throw new Error(data.error);setCode(data.code||'');setExpires(data.codeExpiresAt||0);setNow(Date.now());setConnected(data.connected);setRevoke(false);}catch(e){setError(e instanceof Error?e.message:'Belum bisa memperbarui koneksi.');}finally{setBusy(false);}
  }
  const remaining=Math.max(0,Math.ceil((expires-now)/1000));
  return <><Button variant="secondary" onClick={()=>setOpen(true)}><Monitor size={16}/>Hubungkan layar</Button><Modal open={open} onClose={()=>setOpen(false)} locked={busy} title="Sambungkan layar acara" description="Gunakan browser atau perangkat terpisah tanpa login akun admin.">
    <ol className="pairing-steps"><li>Buka <a href="/spinner" target="_blank" rel="noreferrer">halaman spinner</a> di layar acara.</li><li>Buat kode, lalu ketik kode tersebut di layar acara.</li><li>Aktifkan LIVE dari dashboard. Layar siap diputar.</li></ol>
    <div className="pairing-status"><i className={connected?'paired':''}/>{connected?'Akses layar aktif · berlaku 12 jam':'Belum ada akses layar aktif'}</div>
    {code&&remaining>0?<div className="pair-code"><small>KODE SEKALI PAKAI</small><strong>{code.match(/.{1,4}/g)?.join(' – ')}</strong><span>Berlaku {Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')}</span><Button variant="ghost" onClick={async()=>{try{await navigator.clipboard.writeText(code);setCopied(true);}catch{setError('Salin kode yang terlihat di atas secara manual.');}}}>{copied?<Check size={16}/>:<Copy size={16}/>} {copied?'Tersalin':'Salin kode'}</Button></div>:<Button disabled={busy} onClick={()=>void update('POST')}><Link2 size={17}/>{busy?'Menyiapkan…':'Buat kode layar'}</Button>}
    <p className="field-hint">Kode berlaku 10 menit dan hanya dapat dipakai sekali. Menghubungkan layar baru akan menggantikan akses layar sebelumnya. Dashboard tetap membutuhkan login Google.</p>
    {error&&<p className="pairing-error" role="alert">{error}</p>}
    {(connected||code)&&<div className="pairing-revoke">{revoke?<><p>Layar akan terputus dan tidak bisa memutar lagi sampai dipasangkan ulang.</p><Button variant="secondary" disabled={busy} onClick={()=>setRevoke(false)}>Batal</Button><Button variant="danger" disabled={busy} onClick={()=>void update('DELETE')}>Putuskan sekarang</Button></>:<Button variant="ghost" onClick={()=>setRevoke(true)}><Unplug size={16}/>Cabut akses layar & kode</Button>}</div>}
  </Modal></>;
}
