import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { packagePrototype } from './package-prototype.mjs';
import '../assets/prototype-core.js';
import '../showcase/src/tidefold-data.js';

test('stores isolate inputs, snapshots, listeners and separate models', () => {
  const initial = { rows: [] }, a = PrototypeCore.createStore(initial), b = PrototypeCore.createStore(initial);
  initial.rows.push(1); a.getState().rows.push(2);
  let changes = 0;
  const off = a.subscribe(s => { s.rows.push(99); changes++; });
  assert.equal(changes, 0);
  a.update(s => ({ rows: [...s.rows, 3] })); off(); a.setState({ rows: [4] });
  assert.equal(changes, 1); assert.deepEqual(a.getState(), { rows: [4] }); assert.deepEqual(b.getState(), { rows: [] });
});
test('draft cancel never commits; a commit cannot be repeated', () => {
  const commits = [], saved = { note: 'saved' };
  const draft = PrototypeCore.createDraft(saved, v => commits.push(v));
  draft.update(v => ({ ...v, note: 'draft' })); draft.cancel();
  assert.equal(draft.commit(), false); assert.deepEqual(commits, []); assert.equal(saved.note, 'saved');
  const next = PrototypeCore.createDraft(saved, v => commits.push(v));
  next.update(v => ({ ...v, note: 'new' })); assert.equal(next.commit(), true); assert.equal(next.commit(), false);
  assert.deepEqual(commits, [{ note: 'new' }]);
});
test('Tidefold upserts, restores, resets and keeps each theme independent', () => {
  const a = Tidefold.createModel('A'), b = Tidefold.createModel('B');
  a.selectBeach('nanmen'); a.selectTime(2000); assert.equal(a.getState().selectedTime, 1200);
  a.selectTime(NaN); assert.equal(a.getState().selectedTime, 1200);
  a.saveReminder({ beachId:'nanmen', windowId:'morning', note:'one', lead:15 });
  a.saveReminder({ beachId:'nanmen', windowId:'morning', note:'two', lead:60 });
  assert.equal(a.getState().reminders.length, 1); assert.equal(a.getState().reminders[0].note, 'two');
  const removed = a.removeReminder('nanmen:morning'); assert.equal(a.getState().reminders.length, 0);
  a.restoreReminder(removed); assert.equal(a.getState().reminders[0].lead, 60);
  assert.deepEqual(b.getState(), { beachId:'maluan', selectedTime:540, reminders:[] });
  a.reset(); assert.deepEqual(a.getState(), b.getState());
  for (const place of Tidefold.beaches) assert.equal(Tidefold.conditionsAt(place.id, 540).height, Tidefold.heightAt(place.id, 540));
});
test('drag cancellation and lost capture cannot commit; scrolling intent is respected', () => {
  const handlers = new Map(); let captured = null, commits = 0, cancellations = 0, starts = 0;
  const el = { addEventListener:(k,v)=>handlers.set(k,v), removeEventListener:k=>handlers.delete(k), setPointerCapture:id=>captured=id, hasPointerCapture:id=>captured===id, releasePointerCapture:()=>captured=null };
  const dispose = PrototypeCore.bindDrag(el, { onStart:()=>starts++, onEnd:()=>commits++, onCancel:()=>cancellations++ });
  const event = (x,y,id=1) => ({ clientX:x,clientY:y,pointerId:id,button:0,target:{ closest:()=>null } });
  handlers.get('pointerdown')(event(0,0)); handlers.get('pointermove')(event(0,12)); handlers.get('pointerup')(event(0,12));
  assert.equal(starts,0);
  handlers.get('pointerdown')(event(0,0)); handlers.get('pointermove')(event(20,0));
  handlers.get('pointermove')(event(40,0,2)); handlers.get('pointercancel')(event(20,0)); handlers.get('lostpointercapture')(event(20,0));
  assert.equal(cancellations,1); assert.equal(commits,0); assert.equal(captured,null);
  handlers.get('pointerdown')(event(0,0)); handlers.get('pointermove')(event(30,0)); handlers.get('pointerup')(event(30,0));
  assert.equal(commits,1); dispose(); assert.equal(handlers.size,0);
});
test('motion retargets from current value and reduced motion settles immediately', () => {
  let now=0, frame=0; const queue=new Map(), values=[];
  const env={performance:{now:()=>now},requestAnimationFrame:fn=>{queue.set(++frame,fn);return frame;},cancelAnimationFrame:id=>queue.delete(id),matchMedia:()=>({matches:false})};
  const motion=PrototypeCore.createMotion(0,v=>values.push(v),env);
  const tick=t=>{now=t;const callbacks=[...queue.values()];queue.clear();callbacks.forEach(fn=>fn(t));};
  motion.to(10,100);tick(50);const midpoint=motion.getValue();assert.ok(midpoint>0&&midpoint<10);
  motion.to(20,100);assert.equal(queue.size,1);tick(150);assert.equal(motion.getValue(),20);
  env.matchMedia=()=>({matches:true});motion.to(0);assert.equal(motion.getValue(),0);assert.equal(queue.size,0);
});
test('navigation restores source focus and scroll', () => {
  const seen=[], focus={isConnected:true,focus:()=>seen.push('focus')};
  const env={document:{activeElement:focus},scrollY:160,scrollTo:(x,y)=>seen.push(y)};
  const nav=PrototypeCore.createNavigator({screen:'home'},route=>{seen.push(route.screen);return null;},env);
  nav.go({screen:'detail'});assert.equal(nav.back(),true);assert.equal(nav.back(),false);
  assert.deepEqual(seen,['detail',0,'home',160,'focus']);
});
test('packager inlines actual scripts, CSS and media, escapes closing script, rejects network', async () => {
  const dir=await mkdtemp(join(tmpdir(),'qs-prototype-'));
  try {
    await writeFile(join(dir,'pixel.svg'),'<svg xmlns="http://www.w3.org/2000/svg"/>');
    await writeFile(join(dir,'style.css'),'body{background-image:url(./pixel.svg)}');
    await writeFile(join(dir,'code.js'),'globalThis.example = "</script>";');
    await writeFile(join(dir,'input.html'),'<link rel="stylesheet" href="style.css"><img src="pixel.svg"><script src="code.js"></script><a href="index.html">Back</a>');
    await packagePrototype(join(dir,'input.html'),join(dir,'output.html'));
    const result=await readFile(join(dir,'output.html'),'utf8');
    assert.match(result,/data:image\/svg\+xml;base64/);assert.match(result,/<\\\/script>/);assert.doesNotMatch(result,/<script src/);assert.match(result,/href="index.html"/);
    await writeFile(join(dir,'input.html'),'<script src="https://example.com/code.js"></script>');
    await assert.rejects(()=>packagePrototype(join(dir,'input.html'),join(dir,'output.html')),/relative local/);
  } finally { await rm(dir,{recursive:true,force:true}); }
});
