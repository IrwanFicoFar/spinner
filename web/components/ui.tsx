'use client';

import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Minus, Search, X } from 'lucide-react';
import { useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export function Button({variant='primary',className='',...props}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'primary'|'secondary'|'ghost'|'danger'}) {
  return <button type="button" className={`ui-button ui-${variant} ${className}`} {...props}/>;
}

export function Modal({open,onClose,title,description,children,sheet=false,locked=false,hideClose=false}: {
  open:boolean;onClose:()=>void;title:string;description:string;children:ReactNode;sheet?:boolean;locked?:boolean;hideClose?:boolean;
}) {
  const previousFocus=useRef<HTMLElement|null>(null);
  return <Dialog.Root open={open} onOpenChange={value=>{if(!value&&!locked)onClose();}}>
    <Dialog.Portal><Dialog.Overlay className="ui-overlay"/>
      <Dialog.Content className={`ui-modal ${sheet?'ui-sheet':''}`} onOpenAutoFocus={()=>{previousFocus.current=document.activeElement as HTMLElement;}} onCloseAutoFocus={event=>{event.preventDefault();previousFocus.current?.focus();}} onEscapeKeyDown={event=>{if(locked)event.preventDefault();}} onPointerDownOutside={event=>{if(locked)event.preventDefault();}}>
        <header className="ui-modal-heading"><div><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{description}</Dialog.Description></div>
          {!hideClose&&<Dialog.Close asChild><Button variant="ghost" className="icon-button" aria-label="Tutup dialog" disabled={locked}><X size={20}/></Button></Dialog.Close>}
        </header>{children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}

export function Dropdown({label,value,options,onChange,disabled=false}: {label:string;value:string;options:{value:string;label:string}[];onChange:(value:string)=>void;disabled?:boolean}) {
  return <div className="ui-field"><span>{label}</span><Select.Root value={value} onValueChange={onChange} disabled={disabled}>
    <Select.Trigger className="ui-select" aria-label={label}><Select.Value/><Select.Icon><ChevronDown size={17}/></Select.Icon></Select.Trigger>
    <Select.Portal><Select.Content position="popper" sideOffset={7} collisionPadding={16} className="ui-select-menu"><Select.ScrollUpButton className="select-scroll">↑</Select.ScrollUpButton><Select.Viewport>{options.map(option=><Select.Item className="ui-select-option" value={option.value} key={option.value}><Select.ItemText>{option.label}</Select.ItemText><Select.ItemIndicator><Check size={16}/></Select.ItemIndicator></Select.Item>)}</Select.Viewport><Select.ScrollDownButton className="select-scroll">↓</Select.ScrollDownButton></Select.Content></Select.Portal>
  </Select.Root></div>;
}

export function CheckBox({label,checked,onChange,disabled=false}: {label:string;checked:boolean|'indeterminate';onChange:(checked:boolean)=>void;disabled?:boolean}) {
  return <Checkbox.Root className="ui-checkbox" aria-label={label} checked={checked} onCheckedChange={value=>onChange(value===true)} disabled={disabled}><Checkbox.Indicator>{checked==='indeterminate'?<Minus size={13}/>:<Check size={13}/>}</Checkbox.Indicator></Checkbox.Root>;
}

export function SearchBox({value,onChange,placeholder='Cari…'}:{value:string;onChange:(value:string)=>void;placeholder?:string}) {
  return <div className="ui-search"><Search size={18}/><input aria-label={placeholder} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}/>{value&&<Button variant="ghost" className="icon-button" aria-label="Kosongkan pencarian" onClick={()=>onChange('')}><X size={15}/></Button>}</div>;
}

export function Pagination({page,total,onChange}:{page:number;total:number;onChange:(page:number)=>void}) {
  return <nav className="ui-pagination" aria-label="Navigasi halaman"><span>Halaman <b>{page}</b> dari {total}</span><div><Button variant="secondary" aria-label="Halaman sebelumnya" disabled={page<=1} onClick={()=>onChange(page-1)}><ChevronLeft size={17}/></Button><Button variant="secondary" aria-label="Halaman berikutnya" disabled={page>=total} onClick={()=>onChange(page+1)}><ChevronRight size={17}/></Button></div></nav>;
}

export function EmptyState({icon,title,description,children}:{icon:ReactNode;title:string;description:string;children?:ReactNode}) {
  return <div className="ui-empty"><div className="empty-icon">{icon}</div><h3>{title}</h3><p>{description}</p>{children}</div>;
}
