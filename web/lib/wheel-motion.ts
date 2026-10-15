// Continuous velocity: motor ramp, cruise, then friction. Shared by both screens and audio.
export function wheelProgress(value:number){
  const t=Math.max(0,Math.min(1,value)),acceleration=.16,cruise=.10,deceleration=.74;
  const distance=acceleration/2+cruise+deceleration/4;
  if(t<acceleration)return (t/2-acceleration*Math.sin(Math.PI*t/acceleration)/(2*Math.PI))/distance;
  if(t<acceleration+cruise)return (acceleration/2+t-acceleration)/distance;
  const remaining=1-(t-acceleration-cruise)/deceleration;
  return (acceleration/2+cruise+deceleration*(1-remaining**4)/4)/distance;
}
export const wheelPalette=['#2455D6','#FFD23F','#C51D55','#007F78','#6B35CD','#FF9436','#0071B8','#D52448'];
export function luminance(hex:string){
  const channels=[1,3,5].map(offset=>parseInt(hex.slice(offset,offset+2),16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);
  return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
}
export function wheelTextColor(background:string){
  const value=luminance(background),dark=luminance('#14213D');
  return (value+.05)/(dark+.05)>=1.05/(value+.05)?'#14213D':'#FFFFFF';
}
