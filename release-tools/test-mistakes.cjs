// Isolated UI regression tests. Requires Playwright and Chrome; no personal data.
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
  const ctx=await browser.newContext({timezoneId:'Asia/Macau'}),page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.__payloads=[];window.webkit={messageHandlers:{persist:{postMessage:s=>window.__payloads.push(JSON.parse(s))}}};});
  const base='http://127.0.0.1:'+server.address().port;
  const count=()=>page.evaluate(()=>Object.keys(IELTSMistakes.read()).length);
  for(const deck of ['p1','vj','scene']){
   await page.goto(base+'/'+deck+'.html');
   await page.evaluate(()=>{settings.auto=false;settings.order='seq';enterMode('dict',true);});
   const original=await page.evaluate(()=>state.list.map(v=>v.id)),n=await count();
   await page.locator('#dictInput').fill('incorrectspelling');await page.locator('#dSubmit').click();assert.equal(await count(),n+1);
   const daily=await page.evaluate(()=>JSON.stringify(prog));
   await page.locator('#restartPractice').click();
   assert.deepEqual(await page.evaluate(()=>[state.idx,state.session.done,state.list.map(v=>v.id)]),[0,0,original]);
   assert.equal(await page.evaluate(()=>JSON.stringify(prog)),daily);assert.equal(await count(),n+1);
   await page.locator('#dictInput').fill('incorrectspellingagain');await page.locator('#dSubmit').click();assert.equal(await count(),n+2);
   await page.reload();assert.equal(await count(),n+2);assert.equal(await page.evaluate(()=>state.idx),1);
   await page.evaluate(()=>skipDict());assert.equal(await count(),n+2);
   await page.evaluate(()=>{enterMode('quiz',true);const correct=state.list[0];const chosen=state.list[1];answerQuiz($('qOpts').firstElementChild,chosen,correct);});
   assert.equal(await count(),n+3);
   await page.locator('#restartPractice').click();assert.equal(await page.evaluate(()=>state.session.done),0);
   await page.evaluate(()=>{const correct=state.list[0];answerQuiz($('qOpts').firstElementChild,correct,correct);});assert.equal(await count(),n+3);
   await page.evaluate(()=>{enterMode('flash',true);flashNext(1);});await page.locator('#restartPractice').click();assert.equal(await page.evaluate(()=>state.idx),0);assert.equal(await count(),n+3);
  }
  // Restart invalidates the old correct-answer timer, even when the next round
  // begins with exactly the same word and is already answered incorrectly.
  await page.evaluate(()=>{enterMode('dict',true);$('dictInput').value=curItem().alts[0];submitDict();restartPractice();$('dictInput').value='badanswer';submitDict();});
  await page.waitForTimeout(1200);assert.equal(await page.evaluate(()=>state.idx),0);
  await page.goto(base+'/notebook.html');
  await page.evaluate(()=>{NB=[{id:'a',w:'apple',tr:'苹果',rw:true},{id:'b',w:'pear',tr:'梨',rw:true}];save();render();});
  await page.locator('#reviewRW').click();await page.locator('#rnext').click();await page.locator('#rrestart').click();assert.equal(await page.evaluate(()=>ri),0);await page.locator('#rclose').click();
  await page.locator('#dictateRW').click();let n=await count();
  await page.locator('#dans').fill('bad');await page.locator('#dsubmit').click();assert.equal(await count(),n+1);
  await page.locator('#drestart').click();assert.equal(await page.evaluate(()=>di),0);assert.equal(await count(),n+1);await page.locator('#dclose').click();
  await page.locator('#quizRW').click();
  await page.evaluate(()=>mCheck(moptions.findIndex(x=>x!==NB[morder[mi]].tr)));assert.equal(await count(),n+2);
  await page.locator('#mrestart').click();assert.equal(await page.evaluate(()=>mi),0);assert.equal(await count(),n+2);await page.locator('#mclose').click();
  await page.goto(base+'/wrong.html');
  await page.evaluate(()=>{WR=[{en:'apple',zh:'苹果',n:7,ts:1}];save();render();});
  await page.locator('#dictate').click();n=await count();await page.locator('#dans').fill('bad');await page.locator('#dsubmit').click();assert.equal(await count(),n+1);
  await page.locator('#drestart').click();assert.equal(await page.evaluate(()=>dwrong),0);assert.equal(await count(),n+1);await page.locator('#dclose').click();
  // Removing a mastered word leaves the dated history intact.
  await page.evaluate(()=>{WR=[];save();render();});await page.reload();assert.equal(await count(),n+1);
  // Day grouping uses the answer's local calendar date, not UTC or viewing date.
  await page.clock.setFixedTime(new Date('2026-09-21T15:59:00Z'));
  await page.evaluate(()=>IELTSMistakes.record({en:'midnight-test'},'p1','dict','before'));
  await page.clock.setFixedTime(new Date('2026-09-21T16:01:00Z'));
  await page.evaluate(()=>IELTSMistakes.record({en:'midnight-test'},'notebook','quiz','after'));
  assert.deepEqual(await page.evaluate(()=>IELTSMistakes.groups('','midnight-test').map(g=>[g.date,g.events.length])),[['2026-09-22',1],['2026-09-21',1]]);
  await page.locator('#mistakeHistoryButton').click();await page.locator('[data-all]').click();await page.locator('[data-search]').fill('midnight-test');
  assert.equal(await page.locator('#mistake-history details').count(),2);await page.locator('#mistake-history summary').first().click();
  assert.match(await page.locator('#mistake-history ol').first().textContent(),/00:01:00.*after/);
  await page.screenshot({path:'/tmp/ielts-mistake-history-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.querySelector('#mistake-history').scrollWidth<=document.querySelector('#mistake-history').clientWidth),true);
  await page.screenshot({path:'/tmp/ielts-mistake-history-mobile.png'});
  assert.deepEqual(errors,[]);
  console.log('PASS: restart preserves queue and history; all answer modes log errors only; refresh/skip/restart do not duplicate events; midnight grouping, history filters/details and mobile width.');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
