export type Product = { id:string; name:string; icon:string; stock:number };
export type Person = { id:string; name:string; mode:'include'|'exclude'; productIds:string[] };
export type Draw = { id:string; participantId:string; participantName:string; productId:string; productName:string; icon:string; startedAt:number; duration:number; target:number; products:Product[] };
export type ScreenAccess = { codeHash?:string; codeExpiresAt?:number; tokenHash?:string; expiresAt?:number };
export type State = { name:string; mode:'general'|'participant'; control:'public'|'admin'; advance:'manual'|'auto'; live:boolean; onboarded:boolean; selected:string; products:Product[]; participants:Person[]; history:Draw[]; draw:Draw|null; screenAccess?:ScreenAccess; canSpin?:boolean };
export function eligible(s:State, person?:Person) { return s.products.filter(p=>p.stock>0 && (s.mode==='general' || (person && !s.history.some(d=>d.participantId===person.id) && (person.mode==='include'?person.productIds.includes(p.id):!person.productIds.includes(p.id))))); }
