'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, CircleHelp, Dices, Gift, History, LayoutDashboard, LockKeyhole, LogOut, Monitor, Radio, Settings2, ShieldCheck, Sparkles, Trash2, Trophy, Users, Volume2, VolumeX, X } from 'lucide-react';
import { Logo } from './logo';
import { LiveWheel } from './live-wheel';
import { Button, Dropdown, EmptyState, Modal, Pagination, SearchBox } from './ui';
import { ProductEditor, PersonEditor } from './editors';
import { Collection } from './collection';
import { Confetti, usePartySound } from './celebration';
import { eligible, type State, type Person, type Product } from '@/lib/model';
import type { Command } from '@/lib/commands';

type Confirmation={title:string;description:string;button:string;command:Command;danger?:boolean};
type Tab='overview'|'products'|'participants'|'history';
const navigation=[{id:'overview',label:'Pusat kontrol',icon:LayoutDashboard},{id:'products',label:'Hadiah',icon:Gift},{id:'participants',label:'Peserta',icon:Users},{id:'history',label:'Riwayat',icon:History}] as const;
const initials=(name:string)=>name.trim().split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase();

export function Workspace({admin=false}:{admin?:boolean}) {
  const router=useRouter(),version=useRef(0),mutating=useRef(false),loading=useRef(false),randomTimer=useRef<ReturnType<typeof setInterval>|null>(null);
  const [state,setState]=useState<State|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[now,setNow]=useState(0);
  const [connectionError,setConnectionError]=useState('');
  const [tab,setTab]=useState<Tab>('overview'),[sheet,setSheet]=useState<'participants'|'history'|null>(null),[query,setQuery]=useState(''),[page,setPage]=useState(1);
  const [product,setProduct]=useState<Product|null>(null),[person,setPerson]=useState<Person|null>(null),[confirmation,setConfirmation]=useState<Confirmation|null>(null);
  const [toast,setToast]=useState(''),[randomName,setRandomName]=useState(''),[onboardMode,setOnboardMode]=useState<State['mode']>('participant');
  const sound=usePartySound(state?.draw);
  const load=useCallback(async()=>{
    if(mutating.current||loading.current)return;
    loading.current=true;
    const current=++version.current;
    try {
      const response=await fetch('/api/workspace',{cache:'no-store'});
      if(response.status===401){router.replace('/login');return;}
      const data=await response.json();if(!response.ok)throw new Error(data.error);
      if(current===version.current){setState(data);setConnectionError('');}
    }catch(e){if(current===version.current)setConnectionError(e instanceof Error?e.message:'Koneksi terputus. Mencoba menghubungkan kembali…');}
    finally{loading.current=false;}
  },[router]);
  useEffect(()=>{const first=setTimeout(()=>void load(),0),timer=setInterval(()=>void load(),1000),clock=setInterval(()=>setNow(Date.now()),200);return()=>{clearTimeout(first);clearInterval(timer);clearInterval(clock);if(randomTimer.current)clearInterval(randomTimer.current);};},[load]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),4000);return()=>clearTimeout(timer);},[toast]);

  async function send(command:Command,message?:string) {
    if(mutating.current)return false;mutating.current=true;version.current++;setBusy(true);setError('');
    try {
      const response=await fetch('/api/workspace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(command)});
      if(response.status===401){router.replace('/login');return false;}
      const data=await response.json();if(!response.ok)throw new Error(data.error);
      setState(data);if(message)setToast(message);return true;
    }catch(e){setError(e instanceof Error?e.message:'Perubahan belum tersimpan. Silakan coba lagi.');return false;}
    finally{mutating.current=false;setBusy(false);}
  }

  if(!state)return <main className="studio-loading"><Logo/><div className="loading-orbit"><Sparkles/></div><h2>{connectionError?'Belum terhubung':'Menyiapkan panggung Anda…'}</h2><p>{connectionError||'Sebentar, kami sedang membuka workspace.'}</p>{connectionError&&<Button onClick={()=>void load()}>Coba lagi</Button>}</main>;
  const locked=busy||!!state.draw||!!randomName;
  const reveal=admin||state.control==='public';
  const selected=state.participants.find(p=>p.id===state.selected),available=state.participants.filter(p=>eligible(state,p).length);
  const filtered=available.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())),pages=Math.max(1,Math.ceil(filtered.length/8)),current=Math.min(page,pages);
  const result=state.draw&&now>=state.draw.startedAt+state.draw.duration?state.draw:null;
  const activeTab=state.mode==='general'&&tab==='participants'?'overview':tab;
  const totalStock=state.products.reduce((sum,p)=>sum+p.stock,0);
  const settings=(values:Omit<Extract<Command,{type:'settings'}>,'type'>)=>void send({type:'settings',...values},'Pengaturan tersimpan');
  const newProduct=()=>setProduct({id:'',name:'',icon:'🎁',stock:1});
  const newPerson=()=>setPerson({id:'',name:'',mode:'exclude',productIds:[]});
  const openParticipants=()=>{setQuery('');setPage(1);setSheet('participants');};
  const choose=async(id:string)=>{const chosen=available.find(p=>p.id===id);if(await send({type:'select',id},reveal&&chosen?`${chosen.name} siap diundi`:undefined))setSheet(null);};
  function randomParticipant(){
    if(!available.length||locked)return;
    sound.activate();
    let tick=0;setRandomName(available[0].name);
    randomTimer.current=setInterval(()=>{
      const candidate=available[crypto.getRandomValues(new Uint32Array(1))[0]%available.length];setRandomName(candidate.name);sound.shuffle();
      if(++tick>=16){clearInterval(randomTimer.current!);randomTimer.current=null;setRandomName('');void choose(candidate.id);}
    },90);
  }
  function requestDelete(kind:'product'|'participant',ids:string[]){
    const label=kind==='product'?'hadiah':'peserta';
    setConfirmation({title:`Hapus ${ids.length} ${label}?`,description:`${ids.length} ${label} yang dipilih akan dihapus permanen. Riwayat pemenang tetap tersimpan. Tindakan ini tidak bisa dibatalkan.`,button:`Ya, hapus ${label}`,danger:true,command:{type:'bulkDelete',kind,ids}});
  }
  const historyContent=<div className="history-list">{[...state.history].reverse().map((draw,index)=><div className="history-item" key={draw.id}><span className="history-number">{String(state.history.length-index).padStart(2,'0')}</span><span className="item-icon">{draw.icon}</span><div className="item-copy"><strong>{draw.productName}</strong><small>{draw.participantId?draw.participantName:'Undian hadiah'}</small></div><time>{new Date(draw.startedAt).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</time></div>)}{!state.history.length&&<EmptyState icon={<Trophy/>} title="Cerita pemenang dimulai di sini" description="Setiap hasil undian akan tersimpan otomatis, lengkap dengan hadiah dan waktu undian."/>}</div>;
  const participantCard=<div className="participant-focus"><div className="section-caption"><Users size={16}/>PESERTA BERIKUTNYA</div><div className="participant-identity"><span className={`large-avatar ${randomName?'is-shuffling':''}`}>{randomName?<Dices/>:selected?initials(selected.name):'?'}</span><div><h3 aria-live="polite">{randomName||selected?.name||'Siapa yang beruntung?'}</h3><p>{randomName?'Sedang mengacak nama…':selected?'Sudah dipilih. Siap menunggu roda berputar.':'Pilih peserta terlebih dahulu sebelum memutar.'}</p></div></div><div className="participant-actions"><Button onClick={openParticipants} disabled={locked}><Users size={17}/>Pilih peserta</Button><Button variant="secondary" onClick={randomParticipant} disabled={locked||!available.length}><Dices size={17}/>Acak nama</Button></div><small>{available.length} peserta tersedia · {state.advance==='manual'?'Pemilihan manual':'Lanjut otomatis setelah konfirmasi'}</small></div>;

  return <div className={`studio ${admin?'studio-admin':'studio-public'}`} onPointerDown={sound.activate} onKeyDown={sound.activate}>
    {admin&&<aside className="studio-sidebar"><Logo/><div className="workspace-label"><span className="workspace-avatar">{initials(state.name)}</span><div><b>{state.name}</b><small>Workspace Anda</small></div></div><p className="nav-caption">RUANG ACARA</p><nav>{navigation.filter(item=>state.mode!=='general'||item.id!=='participants').map(item=><button key={item.id} aria-label={item.label} aria-current={activeTab===item.id?'page':undefined} className={activeTab===item.id?'active':''} onClick={()=>setTab(item.id)}><item.icon size={19}/><span>{item.label}</span>{item.id==='products'&&<b>{state.products.length}</b>}{item.id==='participants'&&<b>{state.participants.length}</b>}</button>)}</nav><div className="sidebar-tip"><Sparkles size={23}/><b>Momen kecil.<br/>Sorak yang besar.</b><p>Siapkan hadiah, pilih peserta, dan biarkan kejutannya dimulai.</p><Link href="/spinner" target="_blank">Buka panggung <ArrowUpRight size={16}/></Link></div><button className="sidebar-logout" onClick={()=>void signOut({callbackUrl:'/login'})}><LogOut size={17}/>Keluar akun</button></aside>}
    <main className="studio-main"><header className="studio-topbar">{admin?<div className="breadcrumb">Workspace <span>/</span> <b>{navigation.find(item=>item.id===activeTab)?.label}</b></div>:<Logo/>}<div className="topbar-actions"><span className="connection-label"><i/>{connectionError?'Menghubungkan…':'Tersinkron'}</span>{admin?<Link className="ui-button ui-secondary" href="/spinner" target="_blank"><Monitor size={16}/>Buka spinner<ArrowUpRight size={15}/></Link>:<Link className="ui-button ui-secondary" href="/admin"><Settings2 size={17}/>Dashboard</Link>}<span className="topbar-avatar">{initials(state.name)}</span></div></header>
      {(error||connectionError)&&<div className="studio-error" role="alert"><CircleHelp size={19}/><span>{error||connectionError}</span><Button variant="ghost" aria-label="Tutup pesan" onClick={()=>{setError('');setConnectionError('');}}><X size={17}/></Button></div>}
      {!state.onboarded?<section className="onboarding-studio"><span className="welcome-icon"><Sparkles/></span><p className="section-caption">SELAMAT DATANG DI SPINORA</p><h1>Acara hebat dimulai<br/>dari sini<span>.</span></h1><p>Atur ruang undian Anda. Sisanya, kita siapkan bersama.</p><form onSubmit={e=>{e.preventDefault();const form=new FormData(e.currentTarget);void send({type:'settings',name:String(form.get('name')),mode:onboardMode,onboarded:true});}}><label className="ui-field">Nama company atau acara<input name="name" defaultValue={state.name} placeholder="Misalnya: Gathering Tim Kreatif" required maxLength={100}/></label><div className="mode-cards">{[{value:'general',icon:Gift,title:'Hadiah saja',description:'Klik roda dan temukan hadiahnya.'},{value:'participant',icon:Users,title:'Hadiah + peserta',description:'Atur siapa mendapat hadiah apa.'}].map(option=><button type="button" aria-pressed={onboardMode===option.value} key={option.value} onClick={()=>setOnboardMode(option.value as State['mode'])}><option.icon/><b>{option.title}</b><span>{option.description}</span>{onboardMode===option.value&&<Check className="mode-check" size={16}/>}</button>)}</div><Button type="submit" disabled={busy}>Buat ruang undian<ArrowRight size={18}/></Button></form></section>:<>
      {admin&&<div className="page-heading"><div><p className="section-caption">LET’S MAKE SOME HAPPY MOMENTS</p><h1>{activeTab==='overview'?'Panggung kebahagiaan.':activeTab==='products'?'Hadiah yang bikin senyum.':activeTab==='participants'?'Setiap nama, satu kesempatan.':'Momen yang sudah dirayakan.'}</h1><p>{activeTab==='overview'?'Semua yang Anda butuhkan untuk undian yang lancar, dalam satu tempat.':activeTab==='products'?'Kelola hadiah dan stok. Siapkan kejutan yang tak terlupakan.':activeTab==='participants'?'Tambahkan peserta dan atur hadiah yang bisa mereka dapatkan.':'Lihat kembali siapa yang beruntung dan hadiah yang dibawa pulang.'}</p></div><span className="heading-spark">✳</span></div>}
      {admin&&activeTab==='products'&&<Collection key="products" kind="product" rows={state.products.map(p=>({id:p.id,name:p.name,icon:p.icon,detail:'Hadiah undian',badge:`${p.stock} tersedia`}))} locked={locked} onAdd={newProduct} onEdit={id=>setProduct(state.products.find(p=>p.id===id)!)} onDelete={ids=>requestDelete('product',ids)}/>}
      {admin&&activeTab==='participants'&&<Collection key="participants" kind="participant" rows={state.participants.map(p=>({id:p.id,name:p.name,icon:initials(p.name),detail:p.mode==='include'?`Hanya ${p.productIds.length} hadiah pilihan`:`${p.productIds.length} hadiah dikecualikan`,badge:state.history.some(d=>d.participantId===p.id)?'Sudah menang':`${eligible(state,p).length} hadiah sesuai`}))} locked={locked} onAdd={newPerson} onEdit={id=>setPerson(state.participants.find(p=>p.id===id)!)} onDelete={ids=>requestDelete('participant',ids)}/>}
      {admin&&activeTab==='history'&&<section className="studio-card"><div className="card-heading"><div><h2>Daftar pemenang</h2><p>Disimpan otomatis untuk setiap putaran.</p></div><span className="soft-badge">{state.history.length} momen</span></div>{historyContent}</section>}
      {(!admin||activeTab==='overview')&&<>
        {admin&&<div className="stats-grid">{[{icon:Gift,label:'Hadiah tersedia',value:totalStock,color:'peach',tab:'products'},{icon:Users,label:'Peserta siap diundi',value:available.length,color:'lavender',tab:'participants'},{icon:Trophy,label:'Momen kemenangan',value:state.history.length,color:'mint',tab:'history'}].filter(item=>state.mode==='participant'||item.tab!=='participants').map(item=><button className={`stat-card ${item.color}`} key={item.label} onClick={()=>setTab(item.tab as Tab)}><span className="stat-icon"><item.icon size={23}/></span><div><small>{item.label}</small><strong>{item.value}<span>{item.tab==='history'?'dirayakan':item.tab==='products'?'stok hadiah':'peserta'}</span></strong></div><ArrowUpRight size={19}/></button>)}</div>}
        <div className={admin?'control-layout':'public-stage'}><section className="studio-card stage-card"><div className="card-heading"><div><span className="section-caption"><Monitor size={15}/>{admin?'LIVE PREVIEW':'PANGGUNG UNDIAN'}</span><h2>{admin?'Sorotan acara':state.name}</h2></div><span className={`status-pill ${state.live?'live':'off'}`}><i/>{state.live?'LIVE':'OFF'}</span></div>
          <div className="stage-art"><span className="stage-decoration deco-one">✦</span><span className="stage-decoration deco-two">✳</span><span className="stage-decoration deco-three">＋</span><LiveWheel state={state} admin={admin||busy} onSpin={()=>void send({type:'spin',requestId:crypto.randomUUID(),participantId:state.selected})}/>
            {admin&&!state.live&&<div className="stage-off-cover"><span><LockKeyhole size={26}/></span><h3>Panggung siap dibuka?</h3><p>Aktifkan LIVE agar roda bisa diputar<br/>dari halaman spinner.</p><Button disabled={busy} onClick={()=>settings({live:true})}><Radio size={17}/>Buka panggung · LIVE</Button><small>Anda memegang kendali acara.</small></div>}
          </div><div className="stage-footer"><span><ShieldCheck size={15}/>{admin?'Preview mengikuti putaran di halaman spinner':!state.live?'Menunggu admin membuka panggung':state.draw?'Nikmati kejutannya…':state.mode==='participant'&&!selected?'Menunggu peserta dipilih':'Klik bagian tengah roda untuk memutar'}</span>{admin&&state.live&&<Button variant="ghost" disabled={busy} onClick={()=>settings({live:false})}>Jadikan OFF</Button>}</div>
          {!admin&&reveal&&state.mode==='participant'&&<div className="public-controls"><Button variant="secondary" onClick={openParticipants} disabled={locked}><Users size={17}/>{selected?.name||'Pilih peserta'}</Button><Button variant="ghost" onClick={()=>setSheet('history')}><History size={17}/>Riwayat</Button></div>}
        </section>
        {admin&&<aside className="control-aside">{state.mode==='participant'&&participantCard}<section className="studio-card settings-card"><div className="card-heading"><div><h2><Settings2 size={19}/>Atur alur acara</h2><p>Sesuai kebutuhan, tanpa ribet.</p></div></div><Dropdown label="Jenis undian" value={state.mode} disabled={locked} options={[{value:'general',label:'🎁  Hadiah saja'},{value:'participant',label:'🎉  Hadiah + peserta'}]} onChange={mode=>setConfirmation({title:'Ubah jenis undian?',description:'Alur pemilihan peserta akan berubah dan peserta aktif dikosongkan. Hadiah, peserta, dan riwayat tetap tersimpan.',button:'Ubah jenis undian',command:{type:'settings',mode:mode as State['mode']}})}/>{state.mode==='participant'&&<><Dropdown label="Pilih peserta dari" value={state.control} disabled={locked} options={[{value:'admin',label:'Dashboard admin saja'},{value:'public',label:'Admin & halaman spinner'}]} onChange={control=>settings({control:control as State['control']})}/><p className="field-hint">{state.control==='admin'?'Nama peserta dan riwayat disembunyikan di panggung.':'Nama peserta dan riwayat juga terlihat di panggung.'}</p><Dropdown label="Setelah pemenang dikonfirmasi" value={state.advance} disabled={locked} options={[{value:'manual',label:'Pilih peserta secara manual'},{value:'auto',label:'Pilih peserta berikutnya otomatis'}]} onChange={advance=>settings({advance:advance as State['advance']})}/><p className="field-hint">Roda tetap perlu diklik untuk memulai setiap putaran.</p></>}</section><div className="help-note"><CircleHelp size={19}/><p><b>Alur singkatnya</b>Siapkan hadiah → pilih peserta → buka LIVE → putar dari panggung.</p></div></aside>}
        </div>
        {admin&&state.history.length>0&&<section className="latest-winner"><span>🎉</span><div><small>MOMEN TERAKHIR</small><b>{state.history.at(-1)?.participantName}</b><p>Memenangkan {state.history.at(-1)?.productName}</p></div><Button variant="ghost" onClick={()=>setTab('history')}>Lihat riwayat<ArrowRight size={16}/></Button></section>}
      </>}
      </>}
      {admin&&<footer className="studio-footer"><span>Made for happy moments.</span><span>Spinora <Sparkles size={12}/></span></footer>}
    </main>
    <div className="sound-control"><Button variant="secondary" aria-label={sound.enabled?'Matikan suara':'Aktifkan suara'} aria-pressed={sound.enabled} onClick={sound.toggle}>{sound.enabled?<Volume2 size={16}/>:<VolumeX size={16}/>}<span>{sound.enabled?'Suara aktif':'Suara mati'}</span></Button></div>
    <Confetti draw={result}/>
    {product&&!result&&<ProductEditor product={product} busy={busy||!!state.draw} onClose={()=>setProduct(null)} onSave={value=>send({type:'product',product:value},'Hadiah berhasil disimpan')}/>}
    {person&&!result&&<PersonEditor person={person} products={state.products} busy={busy||!!state.draw} onClose={()=>setPerson(null)} onSave={value=>send({type:'participant',person:value},'Peserta berhasil disimpan')}/>}
    <Modal open={!!confirmation&&!result} onClose={()=>setConfirmation(null)} locked={busy} title={confirmation?.title||'Konfirmasi'} description={confirmation?.description||''}>
      <div className={`confirmation-art ${confirmation?.danger?'danger':''}`}>{confirmation?.danger?<Trash2 size={30}/>:<Settings2 size={30}/>}</div><p className="confirmation-note">Periksa pilihan Anda sebelum melanjutkan.</p><footer className="modal-actions"><Button variant="secondary" disabled={busy} onClick={()=>setConfirmation(null)}>Batal</Button><Button variant={confirmation?.danger?'danger':'primary'} disabled={busy||!!state.draw} onClick={async()=>{if(confirmation&&await send(confirmation.command,'Perubahan berhasil disimpan'))setConfirmation(null);}}>{busy?'Memproses…':confirmation?.button}</Button></footer>
    </Modal>
    <Modal open={sheet==='participants'&&reveal&&!result} sheet onClose={()=>{if(!randomName)setSheet(null);}} locked={busy||!!randomName} title="Siapa yang beruntung berikutnya?" description={`${available.length} peserta tersedia. Pilih nama atau biarkan kami mengacaknya.`}>
      <div className="picker-tools"><SearchBox placeholder="Cari nama peserta…" value={query} onChange={value=>{setQuery(value);setPage(1);}}/><Button disabled={locked||!available.length} onClick={randomParticipant}><Dices size={17}/>Acak nama</Button></div>
      {randomName?<div className="random-reveal"><Dices size={40}/><span>MENGACAK PESERTA</span><strong aria-live="polite">{randomName}</strong></div>:<div className="participant-grid">{filtered.slice((current-1)*8,current*8).map(p=><button disabled={locked} key={p.id} onClick={()=>void choose(p.id)} className={selected?.id===p.id?'chosen':''}><span className="person-avatar">{initials(p.name)}</span><div><b>{p.name}</b><small>{eligible(state,p).length} hadiah sesuai</small></div>{selected?.id===p.id?<Check size={18}/>:<ArrowDownRight size={18}/>}</button>)}</div>}
      {!filtered.length&&<EmptyState icon={<Users/>} title="Tidak ada peserta tersedia" description={query?'Coba kata pencarian lain.':'Tambahkan peserta dan periksa aturan hadiahnya di dashboard.'}/>}
      <Pagination page={current} total={pages} onChange={setPage}/>
    </Modal>
    <Modal open={sheet==='history'&&reveal&&!result} sheet onClose={()=>setSheet(null)} title="Momen kemenangan" description="Hadiah dan peserta yang telah memenangkan undian.">{historyContent}</Modal>
    <Modal open={!!result} locked hideClose onClose={()=>{}} title="Saatnya merayakan!" description="Satu putaran, satu kejutan istimewa.">
      {result&&<div className="winner-celebration"><div className="celebration-stars" aria-hidden="true">✦ <span>✳</span> ✦</div><span className="winner-gift">{result.icon}</span><p>{reveal&&result.participantId?`Selamat, ${result.participantName}!`:'Hadiah yang terpilih'}</p><h2>{result.productName}</h2>{admin?<div className="info-note"><Monitor size={18}/>Menunggu konfirmasi dari halaman spinner.</div>:<Button disabled={busy} onClick={()=>void send({type:'confirm',id:result.id},'Hasil undian tersimpan')}><Sparkles size={18}/>Konfirmasi hadiah<ArrowRight size={17}/></Button>}</div>}
    </Modal>
    {toast&&<div className="studio-toast" role="status"><span><Check size={16}/></span>{toast}<Button variant="ghost" aria-label="Tutup notifikasi" onClick={()=>setToast('')}><X size={15}/></Button></div>}
  </div>;
}
