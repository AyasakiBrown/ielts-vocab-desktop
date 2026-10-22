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
  const choose=async ok=>page.evaluate(ok=>{
    const correct=state.list[state.idx], text=settings.quizDir==='zh2en'?correct.alts[0]:correct.zh;
    const button=[...$('qOpts').children].find(b=>ok?b.textContent===text:b.textContent!==text);
    if(!button)throw Error('Missing choice');button.click();
  },ok);
  const eventCount=()=>page.evaluate(()=>Object.keys(IELTSMistakes.read()).length);
  for(const deck of ['p1','vj','scene']){
    await page.goto(base+'/'+deck+'.html');
    await page.evaluate(()=>{settings.auto=false;enterMode('quiz',true);state.list=state.list.slice(0,3);renderQuiz();});
    const wrongID=await page.evaluate(()=>state.list[0].id), before=await eventCount();
    await choose(false);await page.locator('#qNext').click();await choose(true);await page.locator('#qNext').click();await choose(true);await page.locator('#qNext').click();
    // the missed word is re-tested at the end of this short round
    assert.equal(await page.evaluate(()=>state.list[state.idx].id),wrongID);await choose(true);await page.locator('#qNext').click();
    assert.equal(await eventCount(),before+1);
    assert.equal(await page.locator('#qRetryWrong').count(),1);
    assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('ielts_wrong')).some(w=>w.en===state.session.wrong[0].en)));
    await page.reload();await page.locator('#qRetryWrong').click();
    assert.deepEqual(await page.evaluate(()=>state.list.map(v=>v.id)),[wrongID]);
    assert.equal(await page.locator('#qOpts .opt').count(),4);assert.equal(await page.evaluate(()=>state.session.done),0);
    assert.equal(await eventCount(),before+1);
    // The wrong-word category can contain only this single word; distractors
    // still come from the vocabulary, and a restored one-word retry works.
    await page.evaluate(()=>{state.deck='wrong';renderQuiz();});await page.reload();
    assert.equal(await page.locator('#qOpts .opt').count(),4);
    await choose(false);await page.locator('#qNext').click();assert.equal(await eventCount(),before+2);
    await choose(true);await page.locator('#qNext').click();
    await page.locator('#qRetryWrong').click();await choose(true);await page.locator('#qNext').click();
    assert.equal(await page.locator('#qRetryWrong').count(),0);assert.equal(await eventCount(),before+2);
    await page.locator('#qAgain').click();assert.equal(await page.evaluate(()=>state.session.done),0);
  }
  await page.goto(base+'/notebook.html');
  await page.evaluate(()=>{NB=[{id:'a',w:'apple',tr:'苹果',rw:true},{id:'p',w:'pear',tr:'梨',rw:true},{id:'o',w:'orange',tr:'橙子',rw:true}];save();render();});
  const nbChoose=async ok=>page.evaluate(ok=>{
    const correct=NB[morder[mi]].tr;
    const i=moptions.findIndex(x=>ok?x===correct:x!==correct);
    $('mchoices').children[i].click();
  },ok);
  await page.locator('#quizRW').click();
  const before=await eventCount(), wrongWord=await page.locator('#mword').textContent();
  await nbChoose(false);await page.locator('#mnext').click();await nbChoose(true);await page.locator('#mnext').click();await nbChoose(true);
  await page.locator('#mnext').click();assert.equal(await page.locator('#mword').textContent(),wrongWord);await nbChoose(true);   // in-round re-test
  // Exit immediately after the final answer, before pressing “view result”.
  await page.reload();await page.locator('#quizRW').click();assert.equal(await page.locator('#mretryWrong').count(),1);
  assert.equal(await eventCount(),before+1);await page.locator('#mretryWrong').click();
  assert.equal(await page.locator('#mword').textContent(),wrongWord);assert.equal(await page.evaluate(()=>morder.length),1);
  await page.locator('#mclose').click();await page.reload();await page.locator('#quizRW').click();
  assert.equal(await page.locator('#mword').textContent(),wrongWord);
  await nbChoose(false);await page.locator('#mnext').click();assert.equal(await eventCount(),before+2);
  await nbChoose(true);await page.locator('#mnext').click();
  await page.locator('#mretryWrong').click();await nbChoose(true);await page.locator('#mnext').click();
  assert.equal(await page.locator('#mretryWrong').count(),0);assert.equal(await eventCount(),before+2);
  await page.locator('#mredo').click();assert.equal(await page.evaluate(()=>morder.length),3);assert.equal(await page.evaluate(()=>mi),0);
  await nbChoose(false);await page.locator('#mrestart').click();assert.equal(await page.evaluate(()=>mwrong.length),0);assert.equal(await eventCount(),before+3);
  assert.deepEqual(errors,[]);
  console.log('PASS: three decks and notebook retry only mistakes; one-word retry; repeated retry; complete/in-progress refresh; wrong-book collection; fresh restart; history counted once per new wrong answer.');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
