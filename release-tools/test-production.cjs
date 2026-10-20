// Production-drill regressions, with synthetic words and a simulated microphone.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../src');
(async()=>{
 const server=http.createServer((req,res)=>{
  const file=path.join(root,decodeURIComponent(req.url.split('?')[0]));
  if(!file.startsWith(root+path.sep)){res.writeHead(404);return res.end();}
  try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':'application/javascript');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{
  browser=await chromium.launch({channel:'chrome',headless:true});
  const context=await browser.newContext(),page=await context.newPage(),errors=[],failures=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   const m=window.mediaTest={requests:[],stops:0,starts:0,revoked:[],stopCallbacks:[],failStart:false};
   Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:()=>new Promise((resolve,reject)=>m.requests.push({resolve,reject}))});
   m.resolve=()=>m.requests.shift().resolve({getTracks:()=>[{stop:()=>m.stops++}]});
   window.MediaRecorder=class{
    constructor(){this.state='inactive';this.mimeType='audio/webm';}
    start(){if(m.failStart)throw Error('Recorder failed');this.state='recording';m.starts++;}
    stop(){this.state='inactive';m.stopCallbacks.push(()=>{this.ondataavailable({data:new Blob(['audio'])});this.onstop();});}
   };
   m.finish=()=>{for(const done of m.stopCallbacks.splice(0))done();};
   const revoke=URL.revokeObjectURL.bind(URL);URL.revokeObjectURL=url=>{m.revoked.push(url);revoke(url);};
  });
  const base='http://127.0.0.1:'+server.address().port;
  const fresh=async()=>{
   await page.goto(base+'/notebook.html');
   await page.evaluate(()=>{NB=[{id:'a',w:'apple',tr:'苹果',ex:'I ate apples yesterday.',ww:true,sw:true},{id:'p',w:'pear',tr:'梨',ww:true,sw:true}];render();});
  };
  const check=async(name,fn)=>{try{await fresh();await fn();console.log('PASS: '+name);}catch(e){failures.push(name+': '+e.message);}};
  await check('writing restart restores skip, and wrong answers enter history once',async()=>{
   await page.locator('#xwprompt').click();
   const before=await page.evaluate(()=>Object.keys(IELTSMistakes.read()).length);
   await page.locator('#xans').fill('wronganswer');await page.locator('#xsubmit').click();
   assert.equal(await page.evaluate(()=>Object.keys(IELTSMistakes.read()).length),before+1);
   await page.locator('#xclose').click();await page.locator('#xwprompt').click();
   assert.equal(await page.locator('#xnext').isVisible(),true);
   assert.equal(await page.evaluate(()=>Object.keys(IELTSMistakes.read()).length),before+1);
   await page.evaluate(()=>{X.order=[X.order[0]];$('xans').value=X.want[0];xSubmit();xSubmit();});
   await page.locator('#xagain').click();assert.equal(await page.locator('#xnext').isVisible(),true);
  });
  await check('cloze records the submitted spelling; correct answers and skips add no mistakes',async()=>{
   await page.locator('#xwcloze').click();
   const before=await page.evaluate(()=>Object.keys(IELTSMistakes.read()).length);
   await page.locator('#xans').fill('aples');await page.locator('#xsubmit').click();
   const event=await page.evaluate(()=>Object.values(IELTSMistakes.read()).at(-1));
   assert.deepEqual([event.word,event.mode,event.answer],['apple','wcloze','aples']);
   assert.deepEqual(event.expected,['apples']);
   assert.equal(await page.evaluate(()=>RV.troubles({min:1}).find(t=>t.key==='apple').spell[0].want),'apples');
   await page.locator('#xsubmit').click();await page.locator('#xans').fill('apples');await page.locator('#xsubmit').click();
   assert.equal(await page.evaluate(()=>Object.keys(IELTSMistakes.read()).length),before+1);
   await page.locator('#xclose').click();await page.locator('#xsprompt').click();await page.locator('#xnext').click();
   assert.equal(await page.evaluate(()=>Object.keys(IELTSMistakes.read()).length),before+1);
  });
  await check('permission arriving after close never starts the microphone',async()=>{
   await page.locator('#xsprompt').click();await page.locator('#xrecbtn').click();await page.locator('#xclose').click();
   await page.evaluate(async()=>{mediaTest.resolve();await Promise.resolve();});
   assert.deepEqual(await page.evaluate(()=>[mediaTest.starts,mediaTest.stops,REC===null]),[0,1,true]);
  });
  await check('permission arriving on the next question is discarded',async()=>{
   await page.locator('#xsprompt').click();await page.locator('#xrecbtn').click();await page.locator('#xnext').click();
   await page.evaluate(async()=>{mediaTest.resolve();await Promise.resolve();});
   assert.deepEqual(await page.evaluate(()=>[mediaTest.starts,mediaTest.stops,REC===null]),[0,1,true]);
   assert.equal(await page.locator('#xplay').isDisabled(),true);
  });
  await check('repeated clicks while permission is pending request only one stream',async()=>{
   await page.locator('#xsprompt').click();
   await page.evaluate(()=>{$('xrecbtn').click();$('xrecbtn').click();});
   assert.equal(await page.evaluate(()=>mediaTest.requests.length),1);
   await page.locator('#xclose').click();await page.evaluate(async()=>{mediaTest.resolve();await Promise.resolve();});
  });
  await check('late stop callbacks cannot attach audio to another question',async()=>{
   await page.locator('#xsprompt').click();await page.locator('#xrecbtn').click();
   await page.evaluate(async()=>{mediaTest.resolve();await Promise.resolve();});
   await page.locator('#xrecbtn').click();await page.locator('#xnext').click();
   await page.evaluate(()=>mediaTest.finish());
   assert.equal(await page.locator('#xplay').isDisabled(),true);assert.equal(await page.evaluate(()=>X.clip),null);
  });
  await check('recordings can be replayed and are released when leaving the question',async()=>{
   await page.locator('#xsprompt').click();await page.locator('#xrecbtn').click();
   await page.evaluate(async()=>{mediaTest.resolve();await Promise.resolve();});
   await page.locator('#xrecbtn').click();await page.evaluate(()=>mediaTest.finish());
   assert.equal(await page.locator('#xplay').isDisabled(),false);
   const clip=await page.evaluate(()=>X.clip);assert(clip.startsWith('blob:'));
   await page.locator('#xnext').click();assert.equal(await page.evaluate(url=>mediaTest.revoked.includes(url),clip),true);
  });
  await check('recorder startup failure releases the microphone and permits retry',async()=>{
   await page.locator('#xsprompt').click();await page.evaluate(()=>mediaTest.failStart=true);await page.locator('#xrecbtn').click();
   await page.evaluate(async()=>{mediaTest.resolve();await Promise.resolve();await Promise.resolve();});
   assert.deepEqual(await page.evaluate(()=>[mediaTest.stops,REC===null]),[1,true]);
   assert.equal(await page.locator('#xrecbtn').isDisabled(),false);
  });
  assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
