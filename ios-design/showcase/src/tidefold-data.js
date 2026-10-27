/* Original demo data. No live forecast, geolocation or notification service. */
(function (root) {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  const beaches = [
    { id: 'maluan', name: '马銮湾', english: 'MALUAN BAY', region: '福建 · 东山岛', descriptor: '弧形沙岸，向海打开', coordinate: '23.69° N · 117.45° E', distance: '3.2 km', routeMinutes: 12, wind: 7, wave: .4, water: 24, offset: 0, map: {x: 62, y: 43}, windows: [{id:'morning',start:510,end:600,label:'晨间窗口'}, {id:'evening',start:975,end:1050,label:'傍晚窗口'}], route: ['东山岛游客中心', '沿海滨路向东', '马銮湾公共入口', '海滩观景点'] },
    { id: 'nanmen', name: '南门湾', english: 'NANMEN BAY', region: '福建 · 东山岛', descriptor: '沿着老街，走到海边', coordinate: '23.73° N · 117.53° E', distance: '6.8 km', routeMinutes: 24, wind: 10, wave: .6, water: 24, offset: 24, map: {x: 79, y: 22}, windows: [{id:'morning',start:540,end:630,label:'晨间窗口'}, {id:'evening',start:990,end:1065,label:'傍晚窗口'}], route: ['东山岛游客中心', '铜陵镇步行街', '南门湾石阶', '海湾观景点'] },
    { id: 'jinluan', name: '金銮湾', english: 'JINLUAN BAY', region: '福建 · 东山岛', descriptor: '一条长岸线，留给日出', coordinate: '23.66° N · 117.43° E', distance: '5.1 km', routeMinutes: 18, wind: 8, wave: .5, water: 23, offset: -18, map: {x: 43, y: 70}, windows: [{id:'morning',start:495,end:585,label:'晨间窗口'}, {id:'evening',start:960,end:1035,label:'傍晚窗口'}], route: ['东山岛游客中心', '金銮大道', '金銮湾木栈道', '日出观景点'] }
  ];
  const date = { iso:'2026-10-27', label:'10 月 27 日', weekday:'星期二', short:'TUE / 27 OCT' };
  function beach(id) { return beaches.find(b => b.id === id) || beaches[0]; }
  function formatTime(minutes) { const value = Math.round(minutes); return String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0'); }
  function heightAt(id, minutes) { const b=beach(id); return Math.round((1.45 + .85*Math.cos((minutes-420-b.offset)*Math.PI/372))*100)/100; }
  function conditionsAt(id, minutes) { const b=beach(id); return { height:heightAt(id,minutes), trend:heightAt(id,minutes+5)>heightAt(id,minutes)?'涨潮中':'退潮中', wind:b.wind, wave:b.wave, water:b.water, window:b.windows.find(w=>minutes>=w.start&&minutes<=w.end)||null }; }
  function nearestWindow(id, minutes) { return beach(id).windows.reduce((best,w)=>Math.abs((w.start+w.end)/2-minutes)<Math.abs((best.start+best.end)/2-minutes)?w:best); }
  function createModel(namespace) {
    const initial={beachId:'maluan',selectedTime:540,reminders:[]};
    const store=root.PrototypeCore.createStore(initial);
    const change=fn=>store.update(fn);
    return {
      namespace,
      getState:store.getState,
      subscribe:store.subscribe,
      selectBeach(id) { if(beaches.some(b=>b.id===id))change(s=>({...s,beachId:id})); },
      selectTime(minutes) { const n=Number(minutes); if(Number.isFinite(n))change(s=>({...s,selectedTime:Math.max(360,Math.min(1200,Math.round(n)))})); },
      saveReminder(input) {
        const b=beach(input.beachId), w=b.windows.find(w=>w.id===input.windowId)||nearestWindow(b.id,input.start||540);
        const reminder={id:b.id+':'+w.id,beachId:b.id,windowId:w.id,start:w.start,end:w.end,lead:[0,15,30,60].includes(Number(input.lead))?Number(input.lead):30,note:String(input.note||'').slice(0,140)};
        change(s=>({...s,reminders:[...s.reminders.filter(r=>r.id!==reminder.id),reminder]}));
        return clone(reminder);
      },
      removeReminder(id) { const old=store.getState().reminders.find(r=>r.id===id); change(s=>({...s,reminders:s.reminders.filter(r=>r.id!==id)})); return old?clone(old):null; },
      restoreReminder(reminder) { if(reminder)this.saveReminder(reminder); },
      reset() { store.setState(clone(initial)); }
    };
  }
  root.Tidefold=Object.freeze({beaches:clone(beaches),date,beach,formatTime,heightAt,conditionsAt,nearestWindow,createModel});
})(globalThis);
