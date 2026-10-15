'use client';

import { useState } from 'react';
import { Check, Gift, Save, ShieldCheck } from 'lucide-react';
import type { Person, Product } from '@/lib/model';
import { Button, CheckBox, Dropdown, Modal, SearchBox } from './ui';

const icons=[['🎁','Hadiah'],['🎧','Headphone'],['📱','Ponsel'],['💻','Laptop'],['⌚','Jam'],['🎮','Game'],['🎟️','Voucher'],['☕','Kopi'],['🏆','Piala'],['✈️','Perjalanan'],['🛍️','Belanja'],['🏨','Hotel'],['🍽️','Makan'],['🎒','Tas'],['🚲','Sepeda'],['📷','Kamera']];

export function ProductEditor({product,busy,onClose,onSave}:{product:Product;busy:boolean;onClose:()=>void;onSave:(value:Product)=>Promise<boolean>}) {
  const [draft,setDraft]=useState(product);
  const [stock,setStock]=useState(String(product.stock));
  return <Modal open onClose={onClose} locked={busy} title={product.id?'Edit hadiah':'Hadiah baru, kejutan baru'} description="Beri nama, pilih ikon, lalu tentukan jumlah yang bisa dimenangkan.">
    <form className="editor-form" onSubmit={async event=>{event.preventDefault();if(await onSave({...draft,stock:Number(stock),id:draft.id||crypto.randomUUID(),name:draft.name.trim()}))onClose();}}>
      <div className="gift-preview"><span>{draft.icon}</span><div><small>PREVIEW HADIAH</small><strong>{draft.name||'Hadiah istimewa Anda'}</strong><p>{draft.stock} kesempatan untuk tersenyum</p></div></div>
      <label className="ui-field">Nama hadiah<input autoFocus required maxLength={100} placeholder="Misalnya: Voucher belanja Rp500.000" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>
      <label className="ui-field">Jumlah tersedia<input required type="number" inputMode="numeric" min={0} max={999} step={1} value={stock} onFocus={e=>e.currentTarget.select()} onChange={e=>{const value=e.target.value.replace(/^0+(?=\d)/,'');setStock(value);setDraft({...draft,stock:Number(value)});}}/></label>
      <fieldset className="icon-picker"><legend>Ikon hadiah</legend><div>{icons.map(([icon,label])=><button type="button" key={icon} aria-label={label} aria-pressed={draft.icon===icon} onClick={()=>setDraft({...draft,icon})}>{icon}{draft.icon===icon&&<Check size={11}/>}</button>)}</div></fieldset>
      <footer className="modal-actions"><Button variant="secondary" disabled={busy} onClick={onClose}>Batal</Button><Button type="submit" disabled={busy||!draft.name.trim()}><Gift size={17}/>{busy?'Menyimpan…':'Simpan hadiah'}</Button></footer>
    </form>
  </Modal>;
}

export function PersonEditor({person,products,busy,onClose,onSave}:{person:Person;products:Product[];busy:boolean;onClose:()=>void;onSave:(value:Person)=>Promise<boolean>}) {
  const [draft,setDraft]=useState(person),[query,setQuery]=useState('');
  const [rulesEnabled,setRulesEnabled]=useState(person.mode==='include'||person.productIds.length>0);
  const checked=draft.productIds.filter(id=>products.some(p=>p.id===id));
  const allowed=draft.mode==='include'?checked.length:products.length-checked.length;
  return <Modal open sheet onClose={onClose} locked={busy} title={person.id?'Edit peserta':'Kenalkan peserta baru'} description="Tambahkan nama peserta untuk ikut meramaikan acara.">
    <form className="editor-form" onSubmit={async e=>{e.preventDefault();if(await onSave({...draft,id:draft.id||crypto.randomUUID(),name:draft.name.trim(),mode:rulesEnabled?draft.mode:'exclude',productIds:rulesEnabled?checked:[]}))onClose();}}>
      <label className="ui-field">Nama peserta<input autoFocus required maxLength={100} placeholder="Nama lengkap peserta" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>
      <label className="optional-rules"><CheckBox label="Atur hadiah untuk peserta ini" checked={rulesEnabled} onChange={value=>setRulesEnabled(value===true)}/><span><b>Atur hadiah untuk peserta ini</b><small>Opsional. Secara default, semua hadiah dapat dimenangkan.</small></span></label>
      {rulesEnabled&&<div className="rules-disclosure">
      <Dropdown label="Aturan hadiah" value={draft.mode} options={[{value:'exclude',label:'Tidak boleh menerima hadiah yang dicentang'},{value:'include',label:'Hanya boleh menerima hadiah yang dicentang'}]} onChange={mode=>setDraft({...draft,mode:mode as Person['mode']})}/>
      <div className="info-note"><ShieldCheck size={19}/><span>{allowed} jenis hadiah diizinkan. {draft.mode==='exclude'?'Kosongkan centang untuk mengizinkan semua hadiah.':'Centang minimal satu hadiah agar peserta bisa diundi.'}</span></div>
      <SearchBox placeholder="Cari hadiah untuk aturan…" value={query} onChange={setQuery}/>
      <div className="rule-list">{products.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())).map(p=><label className="rule-item" key={p.id}><CheckBox label={`Atur ${p.name}`} checked={checked.includes(p.id)} onChange={value=>setDraft({...draft,productIds:value?[...checked,p.id]:checked.filter(id=>id!==p.id)})}/><span>{p.icon}</span><b>{p.name}</b></label>)}{!products.length&&<p>Tambahkan hadiah terlebih dahulu untuk mengatur pilihan.</p>}</div>
      </div>}
      <footer className="modal-actions"><Button variant="secondary" disabled={busy} onClick={onClose}>Batal</Button><Button type="submit" disabled={busy||!draft.name.trim()}><Save size={17}/>{busy?'Menyimpan…':'Simpan peserta'}</Button></footer>
    </form>
  </Modal>;
}
