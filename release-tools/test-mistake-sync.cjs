// Real sync server, two browser profiles, isolated temporary learning database.
const {chromium}=require('playwright'),{spawn}=require('node:child_process');
const path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const child=spawn('python3',['-u','-c',`
import server,tempfile,os,http.server
with tempfile.TemporaryDirectory(prefix='ielts-error-sync-') as folder:
 server.DATA_DIR=folder
 server.DATAFILE=os.path.join(folder,'data.json')
 server.save_data({'v':1,'decks':{'wrong':{'list':[{'en':'apple','n':5,'ts':1}],'del':{}}}})
 httpd=http.server.ThreadingHTTPServer(('127.0.0.1',0),server.Handler)
 url='http://127.0.0.1:'+str(httpd.server_port)
 server.sync_bases=lambda:[url]
 print(url,flush=True)
 httpd.serve_forever()
`],{cwd:path.resolve(__dirname,'..'),stdio:['ignore','pipe','pipe']});
 let browser;
 try{
  const url=await new Promise((resolve,reject)=>{let output='';child.stdout.on('data',chunk=>{output+=chunk;if(output.includes('\n'))resolve(output.split('\n')[0]);});child.on('error',reject);child.on('exit',code=>reject(Error('Server exited '+code)));});
  browser=await chromium.launch({channel:'chrome',headless:true});
  const errors=[],pages=[];
  for(let i=0;i<2;i++){const c=await browser.newContext({serviceWorkers:'block'}),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url+'/wrong.html');pages.push(p);}
  await pages[0].evaluate(()=>{IELTSMistakes.record({en:'apple'},'p1','dict','aple');save();});
  await pages[1].evaluate(()=>{IELTSMistakes.record({en:'apple'},'notebook','quiz','pear');save();});
  for(const p of pages)await p.waitForFunction(async()=>{const d=await (await fetch('/data')).json();return Object.keys(d.decks.wrong.events||{}).length===2;},{},{timeout:15000});
  for(const p of pages){await p.evaluate(()=>window.__sync());await p.waitForFunction(()=>Object.keys(IELTSMistakes.read()).length===2,{},{timeout:15000});}
  let data=await (await fetch(url+'/data')).json();assert.equal(Object.keys(data.decks.wrong.events).length,2);
  // A retry of the exact payload must be idempotent; removing a word must not
  // erase the event ledger or resurrect the removed word through event-only saves.
  for(let i=0;i<2;i++)await fetch(url+'/syncall',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({decks:{wrong:{events:data.decks.wrong.events}}})});
  await fetch(url+'/syncall',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({decks:{wrong:{list:[],del:{apple:Date.now()}}}})});
  data=await (await fetch(url+'/data')).json();assert.equal(Object.keys(data.decks.wrong.events).length,2);assert.deepEqual(data.decks.wrong.list,[]);
  const fresh=await browser.newContext({serviceWorkers:'block'}),p=await fresh.newPage();await p.goto(url+'/wrong.html');assert.equal(await p.evaluate(()=>Object.keys(IELTSMistakes.read()).length),2);
  assert.deepEqual(errors,[]);console.log('PASS: two devices retain independent mistakes; queued legacy list saves preserve events; repeated sync deduplicates; deletion preserves history; fresh profile restores server events.');
 }finally{if(browser)await browser.close();child.kill('SIGTERM');}
})().catch(e=>{console.error(e);process.exitCode=1;});
