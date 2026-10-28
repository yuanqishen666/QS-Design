import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { packagePrototype } from './package-prototype.mjs';
import { createRun, finishRun, getSelectedRun, listRuns, normalizeFeature } from './design-run.mjs';
import '../assets/prototype-core.js';

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
test('physics helpers expose continuous values, thresholds and interruptible springs', () => {
  let now=0, frame=0; const queue=new Map();
  const env={requestAnimationFrame:fn=>{queue.set(++frame,fn);return frame;},cancelAnimationFrame:id=>queue.delete(id),matchMedia:()=>({matches:false})};
  const value=PrototypeCore.createMotionValue(0,()=>now);value.set(10,100);assert.equal(value.getVelocity(),100);
  const spring=PrototypeCore.createSpring(value,()=>{},env);spring.to(30,{velocity:40});
  const tick=t=>{now=t;const callbacks=[...queue.values()];queue.clear();callbacks.forEach(fn=>fn(t));};
  tick(116);tick(132);assert.ok(value.get()>10&&value.get()<30);spring.to(20);assert.equal(queue.size,1);
  const thresholds=PrototypeCore.createThresholds([{id:'preview',at:.3},{id:'commit',at:.8}]);
  assert.equal(thresholds.update(.4).active.id,'preview');assert.equal(thresholds.update(.9).active.id,'commit');
  assert.equal(PrototypeCore.mapRange(5,[0,10],[0,100]),50);
});
test('state machine keeps commit, cancel and reset explicit', () => {
  const machine=PrototypeCore.createStateMachine({initial:'idle',states:{idle:{on:{START:'active'}},active:{on:{COMMIT:'done',CANCEL:'idle'}},done:{on:{RESET:'idle'}}}});
  assert.equal(machine.send('COMMIT'),false);assert.equal(machine.send('START'),true);assert.equal(machine.getState(),'active');assert.equal(machine.send('CANCEL'),true);assert.equal(machine.getState(),'idle');
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
test('new design runs stay isolated and never inherit the selected run implicitly', async () => {
  const dir=await mkdtemp(join(tmpdir(),'qs-design-runs-'));
  try {
    const first=await createRun({projectRoot:dir,feature:'Vocabulary Home',now:new Date('2026-10-27T01:02:03.000Z'),token:'a1b2'});
    const second=await createRun({projectRoot:dir,feature:'Vocabulary Home',now:new Date('2026-10-27T01:02:04.000Z'),token:'c3d4'});
    assert.notEqual(first.directory,second.directory);
    assert.equal(first.manifest.mode,'new');assert.equal(first.manifest.parent_run_id,null);
    assert.equal(second.manifest.mode,'new');assert.equal(second.manifest.parent_run_id,null);
    assert.equal(await getSelectedRun({projectRoot:dir,feature:'Vocabulary Home'}),null);
    assert.equal(normalizeFeature(' Vocabulary Home '),'vocabulary-home');
  } finally { await rm(dir,{recursive:true,force:true}); }
});
test('cross-session iteration names one parent and finishing selects only the child', async () => {
  const dir=await mkdtemp(join(tmpdir(),'qs-design-lineage-'));
  try {
    const parent=await createRun({projectRoot:dir,feature:'vocabulary',now:new Date('2026-10-27T01:02:03.000Z'),token:'a1b2'});
    const child=await createRun({projectRoot:dir,feature:'vocabulary',parentRunId:parent.manifest.run_id,now:new Date('2026-10-27T02:03:04.000Z'),token:'c3d4'});
    await writeFile(join(child.directory,'prototype.html'),'<!doctype html><title>Prototype</title>');
    await finishRun({projectRoot:dir,feature:'vocabulary',runId:child.manifest.run_id,entry:'prototype.html',now:new Date('2026-10-27T02:04:00.000Z')});
    const selected=await getSelectedRun({projectRoot:dir,feature:'vocabulary'});
    assert.equal(child.manifest.mode,'iterate');assert.equal(child.manifest.parent_run_id,parent.manifest.run_id);
    assert.equal(selected.manifest.run_id,child.manifest.run_id);assert.equal(selected.manifest.status,'ready');
    assert.equal(parent.manifest.status,'draft');assert.equal((await listRuns({projectRoot:dir,feature:'vocabulary'})).length,2);
  } finally { await rm(dir,{recursive:true,force:true}); }
});
test('run paths reject traversal and unknown parents', async () => {
  const dir=await mkdtemp(join(tmpdir(),'qs-design-safety-'));
  try {
    assert.throws(()=>normalizeFeature('../../'),/letters or numbers/);
    await assert.rejects(()=>createRun({projectRoot:dir,feature:'home',parentRunId:'latest'}),/Invalid run ID/);
    const run=await createRun({projectRoot:dir,feature:'home',now:new Date('2026-10-27T01:02:03.000Z'),token:'a1b2'});
    await writeFile(join(dir,'outside.html'),'outside');
    await assert.rejects(()=>finishRun({projectRoot:dir,feature:'home',runId:run.manifest.run_id,entry:'../../../../outside.html'}),/leaves the run directory/);
  } finally { await rm(dir,{recursive:true,force:true}); }
});
