const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const vm=require('node:vm');
const Data=require('../src/learning-data.js');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'ielts-data-test-'));
fs.mkdirSync(path.join(temp,'src'));
fs.copyFileSync(path.join(__dirname,'../src/learning-data.js'),path.join(temp,'src/learning-data.js'));
fs.copyFileSync(path.join(__dirname,'data-store.cjs'),path.join(temp,'data-store.cjs'));
const Store=require(path.join(temp,'data-store.cjs'));
process.on('exit',()=>fs.rmSync(temp,{recursive:true,force:true}));
function fixture(){return Data.normalize({v:1,decks:{
  p1:{prog:{apple:{seen:8,ok:6,bad:2,box:2,star:true}},daily:{date:'2026-09-14',done:8,ok:6},settings:{rate:0.9}},
  notebook:{list:[{w:'apple',ww:true,sw:true,ts:100}],del:{old:200}},
  wrong:{list:[{en:'pear',n:3,ts:100}],del:{}},
  config:{zoom:1.2,shortcutsMac:{v:1,ts:100,bindings:{home:'Alt+Digit9'}},shortcutsWindows:{v:1,ts:100,bindings:{home:'Ctrl+Digit9'}}}
}});}
test('完整备份跨平台往返保留分类、删除、进度、历史、两套快捷键',()=>{
  const root=fixture();assert.deepEqual(Data.parse(Data.pack(root)),root);
  assert.deepEqual(Data.parse(JSON.stringify(root)),root);
});
test('真实英语单词 constructor 和 prototype 的进度可迁移',()=>{
  const root=fixture();root.decks.p1.prog.constructor={box:1};root.decks.p1.prog.prototype={box:2};
  assert.deepEqual(Data.parse(Data.pack(root)),root);
});
test('旧版不补零日期保留当日状态，并规范化历史日期',()=>{
  const root=fixture();root.decks.p1.daily={date:'2026-9-15',done:5,ok:4};
  root.decks.p1.history['2026-9-15']={date:'2026-9-15',done:3,ok:2};
  const d=Data.parse(Data.pack(root)).decks.p1;
  assert.equal(d.daily.date,'2026-9-15');assert.deepEqual(d.history['2026-09-15'],{date:'2026-09-15',done:5,ok:4});
  assert(!Object.hasOwn(d.history,'2026-9-15'));
});
test('拒绝损坏、未来格式、单词库备份和不安全字段',()=>{
  for(const s of ['{','{}','{"prog":{}}','{"format":"IELTSVocabBackup","version":2,"data":{}}','{"v":1,"decks":{"p1":{"prog":{"__proto__":{}}}}}','{"v":1,"decks":{"notebook":{"list":[{}]}}}'])assert.throws(()=>Data.parse(s));
  const root=fixture();root.decks.p1.daily.ok=99;assert.throws(()=>Data.normalize(root));
});
test('替换恢复前备份原数据，磁盘重开一致；损坏文件不会被覆盖',()=>{
  const store=new Store(path.join(temp,'profile'));const old=fixture();store.write(old);
  const next=Data.normalize({v:1,decks:{}});store.restore(next);
  assert.deepEqual(new Store(store.directory).read(),next);
  const backup=fs.readdirSync(path.join(store.directory,'backups')).find(n=>n.startsWith('before-restore-'));
  assert.deepEqual(Data.parse(fs.readFileSync(path.join(store.directory,'backups',backup),'utf8')),old);
  fs.writeFileSync(store.file,'damaged');assert.throws(()=>store.restore(old));assert.equal(fs.readFileSync(store.file,'utf8'),'damaged');
});
test('自动备份失败阻止恢复写入',()=>{
  const store=new Store(path.join(temp,'failure'));store.write(fixture());const before=fs.readFileSync(store.file,'utf8');
  fs.writeFileSync(path.join(store.directory,'backups'),'not a directory');
  assert.throws(()=>store.restore({v:1,decks:{}}));assert.equal(fs.readFileSync(store.file,'utf8'),before);
});
test('跨日累计保留，重复保存不重复计数，每日备份保留上限',()=>{
  const store=new Store(path.join(temp,'history'));store.write(fixture());
  store.save('p1',{daily:{date:'2026-09-15',done:3,ok:2}});
  store.save('p1',{daily:{date:'2026-09-15',done:3,ok:2}});
  assert.deepEqual(store.read().decks.p1.history,{'2026-09-14':{date:'2026-09-14',done:8,ok:6},'2026-09-15':{date:'2026-09-15',done:3,ok:2}});
  const dir=path.join(store.directory,'backups');
  for(let i=1;i<=31;i++)fs.writeFileSync(path.join(dir,`daily-2025-01-${String(i).padStart(2,'0')}.json`),'{}');
  store.backup(store.read());assert.equal(fs.readdirSync(dir).filter(n=>n.startsWith('daily-')).length,30);
});
test('恢复水合清除旧缓存，保留无关存储',()=>{
  const map=new Map([['unrelated','keep'],['ielts_nb','old'],['ielts_shortcutsMac','old']]);
  const storage={setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
  Data.hydrate({v:1,decks:{}},storage);
  assert.equal(map.get('ielts_nb'),'[]');assert(!map.has('ielts_shortcutsMac'));assert.equal(map.get('unrelated'),'keep');
});
test('Windows 首次启动从旧版 localStorage 迁移，更新后以稳定文件为准',()=>{
  const store=new Store(path.join(temp,'legacy'));
  const map=new Map([['ielts_nb',JSON.stringify(fixture().decks.notebook.list)],['ielts_p1_prog',JSON.stringify(fixture().decks.p1.prog)],['ielts_shortcutsWindows',JSON.stringify(fixture().decks.config.shortcutsWindows)]]);
  const storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
  const window={IELTSData:Data,desktopData:{call:(action,p)=>action==='read'?store.read():action==='seed'?store.write(p):store.save(p.deck,p.payload)}};
  const context={window,localStorage:storage,document:{documentElement:{style:{}},addEventListener(){}},CustomEvent:function(){}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'desktop.js'),'utf8'),context);
  assert.equal(store.read().decks.notebook.list.length,1);assert.equal(store.read().decks.config.shortcutsWindows.bindings.home,'Ctrl+Digit9');
  store.restore({v:1,decks:{}});
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'desktop.js'),'utf8'),context);
  assert.equal(JSON.parse(map.get('ielts_nb')).length,0);assert.equal(Object.keys(store.read().decks.p1.prog).length,0);
});

test('练习断点随备份恢复，旧备份清除过时的生词本断点',()=>{
 const root=fixture();root.decks.notebook.sessions={'dict:rw':{words:['apple'],idx:0,draft:'app',ts:200}};
 root.decks.p1.settings.sess={version:2,ids:[1,0],idx:1,mode:'flash',deck:'all',ts:200};
 const restored=Data.parse(Data.pack(root));assert.deepEqual(restored.decks.notebook.sessions,root.decks.notebook.sessions);
 const values=new Map();const storage={setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 Data.hydrate(restored,storage);assert.deepEqual(JSON.parse(values.get('ielts_nb_sessions')),root.decks.notebook.sessions);
 Data.hydrate(fixture(),storage);assert.deepEqual(JSON.parse(values.get('ielts_nb_sessions')),{});
});

test('逐次错词记录随完整备份及恢复保留，旧备份不会残留新错次',()=>{
 const root=fixture();root.decks.wrong.events={e1:{word:'apple',date:'2026-09-21',time:'12:00:00',ts:100,source:'p1',mode:'dict',answer:'aple'}};
 const restored=Data.parse(Data.pack(root));assert.deepEqual(restored.decks.wrong.events,root.decks.wrong.events);
 const values=new Map(),storage={setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 Data.hydrate(restored,storage);assert.deepEqual(JSON.parse(values.get('ielts_wrong_events')),root.decks.wrong.events);
 Data.hydrate(fixture(),storage);assert.deepEqual(JSON.parse(values.get('ielts_wrong_events')),{});
});
