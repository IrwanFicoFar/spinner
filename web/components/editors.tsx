'use client';

import { useState } from 'react';
import { Check, Gift, Save, ShieldCheck } from 'lucide-react';
import type { Person, Product } from '@/lib/model';
import { Button, CheckBox, Dropdown, Modal, SearchBox } from './ui';

const icons=[['🎁','Hadiah'],['🎧','Headphone'],['📱','Ponsel'],['💻','Laptop'],['⌚','Jam'],['🎮','Game'],['🎟️','Voucher'],['☕','Kopi'],['🏆','Piala'],['✈️','Perjalanan'],['🛍️','Belanja'],['🏨','Hotel'],['🍽️','Makan'],['🎒','Tas'],['🚲','Sepeda'],['📷','Kamera']];

export function ProductEditor({product,busy,onClose,onSave}:{product:Product;busy:boolean;onClose:()=>void;onSave:(value:Product)=>Promise<boolean>}) {
  const [draft,setDraft]=useState(product);
  return <Modal open onClose={onClose} locked={busy} title={product.id?'Edit hadiah':'Hadiah baru, kejutan baru'} description="Beri nama, pilih ikon, lalu tentukan jumlah yang bisa dimenangkan.">
    <form className="editor-form" onSubmit={async event=>{event.preventDefault();if(await onSave({...draft,id:draft.id||crypto.randomUUID(),name:draft.name.trim()}))onClose();}}>
      <div className="gift-preview"><span>{draft.icon}</span><div><small>PREVIEW HADIAH</small><strong>{draft.name||'Hadiah istimewa Anda'}</strong><p>{draft.stock} kesempatan untuk tersenyum</p></div></div>
      <label className="ui-field">Nama hadiah<input autoFocus required maxLength={100} placeholder="Misalnya: Voucher belanja Rp500.000" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>
      <label className="ui-field">Jumlah tersedia<input required type="number" min={0} max={999} value={draft.stock} onChange={e=>setDraft({...draft,stock:Number(e.target.value)})}/></label>
      <fieldset className="icon-picker"><legend>Ikon hadiah</legend><div>{icons.map(([icon,label])=><button type="button" key={icon} aria-label={label} aria-pressed={draft.icon===icon} onClick={()=>setDraft({...draft,icon})}>{icon}{draft.icon===icon&&<Check size={11}/>}</button>)}</div></fieldset>
      <footer className="modal-actions"><Button variant="secondary" disabled={busy} onClick={onClose}>Batal</Button><Button type="submit" disabled={busy||!draft.name.trim()}><Gift size={17}/>{busy?'Menyimpan…':'Simpan hadiah'}</Button></footer>
    </form>
  </Modal>;
}

export function PersonEditor({person,products,busy,onClose,onSave}:{person:Person;products:Product[];busy:boolean;onClose:()=>void;onSave:(value:Person)=>Promise<boolean>}) {
  const [draft,setDraft]=useState(person),[query,setQuery]=useState('');
  const checked=draft.productIds.filter(id=>products.some(p=>p.id===id));
  const allowed=draft.mode==='include'?checked.length:products.length-checked.length;
  return <Modal open sheet onClose={onClose} locked={busy} title={person.id?'Edit peserta & aturan hadiah':'Kenalkan peserta baru'} description="Nama dan pilihan hadiah hanya berlaku untuk peserta ini.">
    <form className="editor-form" onSubmit={async e=>{e.preventDefault();if(await onSave({...draft,id:draft.id||crypto.randomUUID(),name:draft.name.trim(),productIds:checked}))onClose();}}>
      <label className="ui-field">Nama peserta<input autoFocus required maxLength={100} placeholder="Nama lengkap peserta" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>
      <Dropdown label="Aturan hadiah" value={draft.mode} options={[{value:'exclude',label:'Tidak boleh menerima hadiah yang dicentang'},{value:'include',label:'Hanya boleh menerima hadiah yang dicentang'}]} onChange={mode=>setDraft({...draft,mode:mode as Person['mode']})}/>
      <div className="info-note"><ShieldCheck size={19}/><span>{allowed} jenis hadiah diizinkan. {draft.mode==='exclude'?'Kosongkan centang untuk mengizinkan semua hadiah.':'Centang minimal satu hadiah agar peserta bisa diundi.'}</span></div>
      <SearchBox placeholder="Cari hadiah untuk aturan…" value={query} onChange={setQuery}/>
      <div className="rule-list">{products.filter(p=>p.name.toLowerCase().includes(query.toLowerCase())).map(p=><label className="rule-item" key={p.id}><CheckBox label={`Atur ${p.name}`} checked={checked.includes(p.id)} onChange={value=>setDraft({...draft,productIds:value?[...checked,p.id]:checked.filter(id=>id!==p.id)})}/><span>{p.icon}</span><b>{p.name}</b></label>)}{!products.length&&<p>Tambahkan hadiah terlebih dahulu untuk mengatur pilihan.</p>}</div>
      <footer className="modal-actions"><Button variant="secondary" disabled={busy} onClick={onClose}>Batal</Button><Button type="submit" disabled={busy||!draft.name.trim()}><Save size={17}/>{busy?'Menyimpan…':'Simpan peserta'}</Button></footer>
    </form>
  </Modal>;
}
