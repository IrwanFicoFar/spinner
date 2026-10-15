import { test, expect } from 'bun:test';
import { wheelProgress, wheelPalette, wheelTextColor, luminance } from '../lib/wheel-motion';
test('motion advances monotonically and ends exactly at the winning angle',()=>{
  expect(wheelProgress(-1)).toBe(0);expect(wheelProgress(0)).toBe(0);expect(wheelProgress(1)).toBeCloseTo(1,12);expect(wheelProgress(2)).toBeCloseTo(1,12);
  let previous=0;for(let i=1;i<=1000;i++){const next=wheelProgress(i/1000);expect(next).toBeGreaterThanOrEqual(previous);previous=next;}
});
test('wheel accelerates then decelerates without velocity jumps or final bounce',()=>{
  const speed=t=>(wheelProgress(t+.00001)-wheelProgress(t-.00001))/.00002;
  expect(speed(.02)).toBeLessThan(speed(.12));expect(speed(.4)).toBeGreaterThan(speed(.7));expect(speed(.7)).toBeGreaterThan(speed(.9));expect(speed(.999)).toBeLessThan(.0001);
  for(const boundary of [.16,.26])expect(Math.abs(speed(boundary-.0001)-speed(boundary+.0001))).toBeLessThan(.01);
});
test('all wheel text colors meet normal-text contrast ratio',()=>{
  for(const background of wheelPalette){const a=luminance(background),b=luminance(wheelTextColor(background));expect((Math.max(a,b)+.05)/(Math.min(a,b)+.05)).toBeGreaterThanOrEqual(4.5);}
});
