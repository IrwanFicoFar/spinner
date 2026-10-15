'use client';

import { useState } from 'react';
import { Gift, Pencil, Plus, Trash2, Users, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button, CheckBox, EmptyState, Pagination, SearchBox } from './ui';

type Row={id:string;name:string;icon:ReactNode;detail:string;badge:string};
export function Collection({kind,rows,locked,onAdd,onEdit,onDelete}:{kind:'product'|'participant';rows:Row[];locked:boolean;onAdd:()=>void;onEdit:(id:string)=>void;onDelete:(ids:string[])=>void}) {
  const [query,setQuery]=useState(''),[page,setPage]=useState(1),[selection,setSelection]=useState<string[]>([]);
  const filtered=rows.filter(row=>row.name.toLowerCase().includes(query.trim().toLowerCase()));
  const selected=selection.filter(id=>rows.some(row=>row.id===id));
  const pages=Math.max(1,Math.ceil(filtered.length/12)),current=Math.min(page,pages),visible=filtered.slice((current-1)*12,current*12);
  const all=filtered.length>0&&filtered.every(row=>selected.includes(row.id));
  const some=filtered.some(row=>selected.includes(row.id));
  const label=kind==='product'?'hadiah':'peserta';
  return <section className="studio-card collection-panel">
    <div className="collection-tools"><SearchBox value={query} onChange={value=>{setQuery(value);setPage(1);}} placeholder={`Cari nama ${label}…`}/><Button disabled={locked} onClick={onAdd}><Plus size={17}/>Tambah {label}</Button></div>
    {rows.length>0&&<div className="selection-bar"><label><CheckBox label="Pilih semua hasil pencarian" disabled={locked||!filtered.length} checked={all?true:some?'indeterminate':false} onChange={value=>setSelection(value?Array.from(new Set([...selected,...filtered.map(row=>row.id)])):selected.filter(id=>!filtered.some(row=>row.id===id)))}/>{query?'Pilih semua hasil':'Pilih semua'}</label><span>{filtered.length} {label}</span>{selected.length>0&&<div className="selected-actions"><b>{selected.length} dipilih</b><Button variant="ghost" aria-label="Batalkan pilihan" onClick={()=>setSelection([])}><X size={16}/></Button><Button variant="danger" disabled={locked} onClick={()=>onDelete(selected)}><Trash2 size={15}/>Hapus terpilih</Button></div>}</div>}
    <div className="collection-list">{visible.map(row=><div className={`collection-row ${selected.includes(row.id)?'is-selected':''}`} key={row.id}>
      <CheckBox label={`Pilih ${row.name}`} disabled={locked} checked={selected.includes(row.id)} onChange={value=>setSelection(value?[...selected,row.id]:selected.filter(id=>id!==row.id))}/>
      <div className={`item-icon ${kind==='participant'?'person-avatar':''}`}>{row.icon}</div><div className="item-copy"><strong>{row.name}</strong><small>{row.detail}</small></div><span className="item-badge">{row.badge}</span>
      <Button variant="ghost" className="icon-button" aria-label={`Edit ${row.name}`} onClick={()=>onEdit(row.id)} disabled={locked}><Pencil size={17}/></Button>
      <Button variant="ghost" className="icon-button delete-icon" aria-label={`Hapus ${row.name}`} onClick={()=>onDelete([row.id])} disabled={locked}><Trash2 size={17}/></Button>
    </div>)}</div>
    {!filtered.length&&<EmptyState icon={kind==='product'?<Gift/>:<Users/>} title={query?'Belum ketemu':`Belum ada ${label}`} description={query?'Coba nama lain atau kosongkan pencarian.':`Tambahkan ${label} pertama untuk menyiapkan acara Anda.`}>{!query&&<Button onClick={onAdd} disabled={locked}><Plus size={16}/>Tambah {label}</Button>}</EmptyState>}
    {filtered.length>0&&<Pagination page={current} total={pages} onChange={setPage}/>}
  </section>;
}
