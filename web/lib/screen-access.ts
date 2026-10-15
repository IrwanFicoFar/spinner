import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { eligible, type State } from './model';
import type { Command } from './commands';

export const SCREEN_COOKIE='spinora_screen';
export const SCREEN_SESSION_MS=12*60*60*1000;
export const PAIR_CODE_MS=10*60*1000;
export function hashSecret(value:string){return createHash('sha256').update(value).digest('hex');}
export function pairingCode(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from(randomBytes(12),byte=>alphabet[byte&31]).join('');}
export function normalizeCode(value:string){return value.replace(/[\s-]/g,'').toUpperCase();}
export function newScreenToken(){return randomBytes(32).toString('base64url');}
export function validScreenToken(state:State,token:string,now=Date.now()){
  const access=state.screenAccess;
  if(!access?.tokenHash||!access.expiresAt||access.expiresAt<=now)return false;
  const expected=Buffer.from(access.tokenHash,'hex'),actual=Buffer.from(hashSecret(token),'hex');
  return expected.length===actual.length&&timingSafeEqual(expected,actual);
}
export function screenCommandAllowed(state:State,command:Command){
  return command.type==='spin'||command.type==='confirm'||(command.type==='select'&&state.mode==='participant'&&state.control==='public');
}
export function adminView(state:State){const {screenAccess,...view}=state;void screenAccess;return view;}
// Rules, pairing credentials, and hidden names never leave the server for a screen.
export function screenView(state:State):State {
  const publicParticipants=state.mode==='participant'&&state.control==='public';
  const view=adminView(state);
  const redactDraw=(draw:State['draw'])=>draw?{...draw,participantName:publicParticipants?draw.participantName:'',participantId:publicParticipants?draw.participantId:''}:null;
  return {...view,
    canSpin:state.onboarded&&state.live&&!state.draw&&eligible(state,state.participants.find(p=>p.id===state.selected)).length>0,
    participants:publicParticipants?state.participants.filter(p=>eligible(state,p).length).map(p=>({...p,mode:'exclude',productIds:[]})):[],
    history:publicParticipants?state.history.map(d=>({...d})):[],
    draw:redactDraw(state.draw),
  };
}
