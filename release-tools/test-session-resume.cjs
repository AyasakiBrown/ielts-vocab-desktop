// Run with Playwright on NODE_PATH. Uses an isolated browser and synthetic data.
const {chromium}=require('playwright');
const http=require('node:http'), fs=require('node:fs'), path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../src');
(async()=>{
 const server=http.createServer((req,res)=>{
  const file=path.join(root,decodeURIComponent(req.url.split('?')[0]));
  if(!file.startsWith(root+path.sep)){res.writeHead(404);return res.end();}
  try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':'application/javascript');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
  browser=await chromium.launch({channel:'chrome',headless:true});
  const context=await browser.newContext();let page=await context.newPage();
  const errors=[]; const attach=p=>p.on('pageerror',e=>errors.push(e.message));attach(page);
  for(const deck of ['p1','vj','scene']){
   await page.goto(base+'/'+deck+'.html');
   for(const order of ['seq','shuffle','smart']){
    await page.evaluate(order=>{settings.order=order;settings.auto=false;saveSettings();enterMode('flash',true);flashNext(1);flashNext(1);},order);
    const expected=await page.evaluate(()=>({ids:state.list.map(v=>v.id),idx:state.idx}));
    await page.reload();
    assert.deepEqual(await page.evaluate(()=>({ids:state.list.map(v=>v.id),idx:state.idx})),expected,deck+' '+order+' flash');
    await page.evaluate(()=>{enterMode('dict',true);});
    await page.locator('#dictInput').fill('unfinished');
    const ids=await page.evaluate(()=>state.list.map(v=>v.id));
    await page.reload();assert.equal(await page.locator('#dictInput').inputValue(),'unfinished');
    await page.evaluate(()=>{$('dictInput').value='definitelywrong';submitDict();});
    await page.reload();
    // the missed word comes back four questions later in the same round
    assert.deepEqual(await page.evaluate(()=>[state.idx,state.session.done,state.session.bad,state.list.map(v=>v.id)]),[1,1,1,[...ids.slice(0,4),ids[0],...ids.slice(4)]]);
    const done=await page.evaluate(()=>daily.done);await page.reload();assert.equal(await page.evaluate(()=>daily.done),done);
    await page.evaluate(()=>enterMode('quiz',true));
    await page.locator('#qOpts button').first().click();
    const score=await page.evaluate(()=>JSON.parse(JSON.stringify(state.session)));
    await page.reload();assert.equal(await page.evaluate(()=>state.idx),1);
    assert.deepEqual(await page.evaluate(()=>JSON.parse(JSON.stringify(state.session))),score);
   }
   // Statistics must not erase an active bookmark. Reopen a genuinely closed tab.
   await page.evaluate(()=>{enterMode('flash',true);flashNext(1);enterMode('stats',false);});
   await page.close();page=await context.newPage();attach(page);await page.goto(base+'/'+deck+'.html');
   assert.deepEqual(await page.evaluate(()=>[state.mode,state.idx]),['flash',1]);
   // A completed session stays complete, and legacy sequential bookmarks migrate.
   await page.evaluate(()=>{enterMode('dict',true);state.list=state.list.slice(0,1);$('dictInput').value='wrong';submitDict();});
   await page.reload();assert.equal(await page.evaluate(()=>state.idx),1);assert.equal(await page.evaluate(()=>state.session.done),1);
   await page.evaluate(()=>{settings.order='seq';settings.sess={deck:'all',mode:'flash',idx:3,ts:Date.now()};saveSettings();});
   // close/pagehide would save the old active session; write legacy snapshot in a non-practice mode.
   await page.evaluate(()=>{state.mode='stats';});await page.reload();assert.equal(await page.evaluate(()=>state.idx),3);
  }
  await page.goto(base+'/notebook.html');
  await page.evaluate(()=>{
   NB=Array.from({length:5},(_,i)=>({id:'id'+i,w:['apple','pear','orange','grape','peach'][i],tr:'meaning'+i,rw:true,ww:i<3,sw:true,ts:1}));save();render();
  });
  await page.locator('#reviewRW').click();await page.locator('#rnext').click();await page.locator('#rnext').click();
  const review=await page.locator('#rw').textContent();
  await page.reload();await page.locator('#reviewRW').click();assert.equal(await page.locator('#rw').textContent(),review);
  await page.locator('#rclose').click();await page.locator('#reviewWW').click();assert.match(await page.locator('#rprog').textContent(),/1 \/ 3/);await page.locator('#rclose').click();
  await page.locator('#dictateRW').click();await page.locator('#dans').fill('partial');
  await page.reload();await page.locator('#dictateRW').click();assert.equal(await page.locator('#dans').inputValue(),'partial');
  await page.locator('#dsubmit').click();await page.reload();await page.locator('#dictateRW').click();
  assert.match(await page.locator('#dprog').textContent(),/2 \/ 6/);assert.match(await page.locator('#dscore').textContent(),/✗ 1/);
  await page.locator('#dclose').click();await page.locator('#quizRW').click();await page.locator('#mchoices button').first().click();
  const right=await page.evaluate(()=>mright);await page.reload();await page.locator('#quizRW').click();assert.match(await page.locator('#mprog').textContent(),/2 \/ [56]/);assert.equal(await page.evaluate(()=>mright),right);
  await page.locator('#mclose').click();
  // NB reorder/deletion must preserve the next surviving word, never a stale array offset.
  await page.evaluate(()=>{const s=sessions['review:rw'];const previous=s.words[0];NB=NB.filter(e=>e.w!==previous).reverse();save();});
  await page.reload();await page.locator('#reviewRW').click();assert.equal(await page.locator('#rw').textContent(),review);
  // A confirmed restore leaves the current page. Its pagehide handler must not
  // save the old progress/list back over the restored data; the new page then
  // consumes the marker and clears the previous review session and stats.
  for(const deck of ['p1','vj','scene','notebook','review']){
   await page.goto(base+'/'+deck+'.html');
   await page.addScriptTag({path:path.join(root,'learning-data.js')});
   await page.evaluate(deck=>{
    if(['p1','vj','scene'].includes(deck))enterMode('dict',true);
    else if(deck==='notebook'){NB=[{id:'a',w:'apple',tr:'苹果',rw:true}];openDictate('rw');}
    else {RV.answer({w:'restorecheck',tr:'恢复测试',src:'p1'},'d','bad');begin(RV.queue().filter(x=>x.track==='d'));}
    window.__restorePosts=[];window.webkit={messageHandlers:{persist:{postMessage:s=>window.__restorePosts.push(s)}}};
    window.__oldReviewSession=localStorage.getItem('ielts_review_sess');
    IELTSData.prepareRestore(localStorage);
    if(deck==='review')$('dans').value='draft after restoration';
    window.dispatchEvent(new Event('pagehide'));
   },deck);
   assert.deepEqual(await page.evaluate(()=>window.__restorePosts),[],deck+' saved old state during restore');
   if(deck==='review')assert.equal(await page.evaluate(()=>localStorage.getItem('ielts_review_sess')),await page.evaluate(()=>window.__oldReviewSession));
   await page.goto(base+'/index.html');await page.addScriptTag({path:path.join(root,'learning-data.js')});
   await page.evaluate(()=>IELTSData.hydrate({v:1,decks:{}},localStorage));
   assert.deepEqual(await page.evaluate(()=>[localStorage.getItem('ielts_restore_pending'),localStorage.getItem('ielts_review_sess'),JSON.parse(localStorage.getItem('ielts_stats'))]),[null,null,{days:{}}]);
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: 3 decks × 3 orders; flash, dictation drafts/answers, quiz scores; close/reopen, legacy and completed sessions; notebook categories, drafts, scores, reorder/deletion; backup restore blocks departing-page saves and replaces stale stats/session caches.');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
