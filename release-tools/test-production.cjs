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
  await check('writing reopen resumes with skip, and wrong answers enter history once',async()=>{
   await page.locator('#xwprompt').click();
   const before=await page.evaluate(()=>Object.keys(IELTSMistakes.read()).length);
   await page.locator('#xans').fill('wronganswer');await page.locator('#xsubmit').click();
   assert.equal(await page.evaluate(()=>Object.keys(IELTSMistakes.read()).length),before+1);
   await page.locator('#xclose').click();await page.locator('#xwprompt').click();
   assert.equal(await page.locator('#xnext').isVisible(),true);
   assert.equal(await page.evaluate(()=>X.i),1,'reopening resumes after the answered question');
   assert.equal(await page.evaluate(()=>Object.keys(IELTSMistakes.read()).length),before+1);
   await page.evaluate(()=>{X.order=[X.order[X.i]];X.i=0;$('xans').value=X.want[0];xSubmit();xSubmit();});
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
  await check('writing and speaking rounds resume with the typed draft, score and position',async()=>{
   await page.evaluate(()=>{sessions={};localStorage.removeItem('ielts_nb_sessions');});
   await page.locator('#xwprompt').click();
   const first=await page.evaluate(()=>NB[X.order[0]].w);
   await page.locator('#xans').fill('ap');await page.locator('#xclose').click();
   await page.reload();await page.evaluate(()=>{NB=[{id:'a',w:'apple',tr:'苹果',ex:'I ate apples yesterday.',ww:true,sw:true},{id:'p',w:'pear',tr:'梨',ww:true,sw:true}];render();});
   await page.locator('#xwprompt').click();
   assert.deepEqual(await page.evaluate(()=>[NB[X.order[X.i]].w,$('xans').value]),[first,'ap']);
   await page.locator('#xclose').click();
   await page.locator('#xsprompt').click();await page.locator('#xok').click();await page.locator('#xclose').click();
   await page.locator('#xsprompt').click();
   assert.deepEqual(await page.evaluate(()=>[X.i,X.right]),[1,1]);
  });
  await check('typing checkpoints persist immediately without rewriting the vocabulary',async()=>{
   await page.evaluate(()=>save());
   await page.locator('#xwprompt').click();
   await page.evaluate(()=>{
    window.checkpointWrites=[];window.checkpointPosts=[];
    const set=Storage.prototype.setItem;
    Storage.prototype.setItem=function(k,v){checkpointWrites.push(k);return set.call(this,k,v);};
    window.webkit={messageHandlers:{persist:{postMessage:s=>checkpointPosts.push(JSON.parse(s))}}};
   });
   await page.locator('#xans').fill('draft');
   const saved=await page.evaluate(()=>({writes:checkpointWrites,posts:checkpointPosts,session:JSON.parse(localStorage.getItem('ielts_nb_sessions'))['xwprompt:ww']}));
   assert.deepEqual(saved.writes,['ielts_nb_sessions']);assert.equal(saved.session.draft,'draft');
   assert.deepEqual(Object.keys(saved.posts[0].payload),['sessions']);
   await page.reload();await page.locator('#xwprompt').click();assert.equal(await page.locator('#xans').inputValue(),'draft');
  });
  await check('rapid search updates coalesce and render the final query',async()=>{
   const result=await page.evaluate(async()=>{
    let renders=0;const original=render;render=function(){renders++;return original();};
    for(const q of ['a','ap','apple']){$('search').value=q;$('search').dispatchEvent(new Event('input'));}
    await new Promise(requestAnimationFrame);render=original;
    return {renders,words:[...document.querySelectorAll('#list .w')].map(e=>e.textContent)};
   });
   assert.deepEqual(result,{renders:1,words:['apple']});
  });
  await check('writing answers use their own review track; stuck words lead the next speaking round',async()=>{
   await page.locator('#xwprompt').click();
   await page.evaluate(()=>{$('xans').value=X.want[0];xSubmit();});
   const w=await page.evaluate(()=>NB[X.order[X.i]].w.toLowerCase());
   assert.deepEqual(await page.evaluate(k=>{const r=RV.all()[k];return [!!r.p,!!r.d];},w),[true,false]);
   await page.locator('#xclose').click();
   await page.locator('#xsrepeat').click();
   const order=await page.evaluate(()=>X.order.map(i=>NB[i].w));
   await page.locator('#xok').click();await page.locator('#xnext').click();await page.locator('#xbad').click();await page.locator('#xnext').click();
   assert.equal(await page.locator('#xstuck').isVisible(),true);
   await page.locator('#xagain').click();
   assert.equal(await page.evaluate(()=>NB[X.order[0]].w),order[1],'the word marked 卡住了 comes first');
   assert.equal(await page.evaluate(k=>!!RV.all()[k].d,order[1].toLowerCase()),false,'speaking never touches dictation');
  });
  await check('cloze finds irregular and doubled forms, and honours [bracketed] blanks',async()=>{
   const got=await page.evaluate(()=>[clozeIn('The bus stopped suddenly.','stop'),clozeIn('He is running late.','run'),clozeIn('We went abroad last year.','go'),
     clozeIn('She took part in the debate.','take part in'),clozeIn('Prices [rose sharply] last year.','increase')].map(c=>c&&c.form));
   assert.deepEqual(got,['stopped','running','went','took part in','rose sharply']);
   assert.equal(await page.evaluate(()=>plainEx('Prices [rose] fast')),'Prices rose fast');
  });
  await check('speaking questions follow the word\'s topic or part of speech',async()=>{
   const q=await page.evaluate(()=>[speakPrompt({w:'salary',tr:'n. 薪水，工资'}),speakPrompt({w:'pollution',tr:'n. 污染'}),speakPrompt({w:'vivid',tr:'adj. 生动的'})]);
   assert.match(q[0],/work|job/i);assert.match(q[1],/environment|weather/i);assert.match(q[2],/描述|心情/);
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
