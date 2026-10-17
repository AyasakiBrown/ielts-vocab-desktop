/* Append-only mistake events: stable IDs make repeated syncs idempotent. */
(function(scope){
  'use strict';
  if(scope.IELTSMistakes) return;
  const KEY='ielts_wrong_events';
  const sources={p1:'Part 1',vj:'词汇真经',scene:'听力场景',notebook:'生词本',wrong:'错词本'};
  const modes={dict:'听写',quiz:'选择题'};
  const pad=n=>String(n).padStart(2,'0');
  const dateKey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  function read(){
    let events={};
    try{events=JSON.parse(localStorage.getItem(KEY))||{};}catch(e){}
    const boot=scope.__INITIAL_STATE__?.decks?.wrong?.events||{};
    return Object.assign({},boot,events);
  }
  // extra.alt: the word the learner mixed it up with ({w, zh}), when the page knows it
  function record(item,source,mode,answer,extra){
    const word=String(item.en||item.w||'').trim(); if(!word)return;
    const now=new Date(), events=read();
    const id=scope.crypto?.randomUUID?.()||`${now.getTime()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    events[id]={word,date:dateKey(now),time:`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
      ts:now.getTime(),source,mode,answer:String(answer??''),meaning:item.zh||item.tr||''};
    if(extra&&extra.alt&&(extra.alt.w||extra.alt.zh)) events[id].alt={w:String(extra.alt.w||''),zh:String(extra.alt.zh||'')};
    try{localStorage.setItem(KEY,JSON.stringify(events));}
    catch(e){alert('本次错词记录未能保存，请检查设备存储空间。');return;}
    scope.webkit?.messageHandlers?.persist?.postMessage(JSON.stringify({deck:'wrong',payload:{events}}));
  }
  function groups(date,query){
    const result=new Map(), q=(query||'').trim().toLowerCase();
    for(const e of Object.values(read())){
      if(!e||!e.word||!e.date||(date&&e.date!==date))continue;
      if(q&&!`${e.word} ${e.meaning||''}`.toLowerCase().includes(q))continue;
      const key=e.date+'\n'+e.word.trim().toLowerCase();
      if(!result.has(key))result.set(key,{word:e.word,date:e.date,events:[]});
      result.get(key).events.push(e);
    }
    return [...result.values()].sort((a,b)=>b.date.localeCompare(a.date)||b.events.length-a.events.length||a.word.localeCompare(b.word));
  }
  function show(){
    if(document.getElementById('mistake-history'))return;
    const dialog=document.createElement('dialog');dialog.id='mistake-history';dialog.setAttribute('aria-label','每日错词记录');
    dialog.style.cssText='width:min(760px,92vw);max-height:85vh;overflow:auto;border:1px solid #94a3b8;border-radius:16px;padding:20px;background:var(--card,#fff);color:var(--ink,#182337);font:14px system-ui';
    dialog.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><h2 style="margin:0">每日错词记录</h2><button class="btn" data-close>关闭</button></div><p style="line-height:1.6">每次提交错误答案记 1 次；答对、跳过、翻卡和从头重做均不计错。日期按答题设备当天计算。</p><p style="color:var(--soft,#64748b)">从本次更新开始记录明细；旧累计次数没有日期，无法还原到某一天。移出错词本不会删除这些历史。</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0"><label>日期 <input type="date" data-date style="width:auto"></label><button class="btn alt" data-all>全部日期</button><input type="search" data-search placeholder="搜索单词或释义" aria-label="搜索错词" style="flex:1;min-width:150px"></div><p data-total role="status"></p><div data-rows></div>';
    const date=dialog.querySelector('[data-date]'),search=dialog.querySelector('[data-search]'); date.value=dateKey(new Date());
    function draw(){
      const rows=groups(date.value,search.value), area=dialog.querySelector('[data-rows]');area.replaceChildren();
      dialog.querySelector('[data-total]').textContent=`${new Set(rows.map(r=>r.word.toLowerCase())).size} 个单词 · ${new Set(rows.map(r=>r.date)).size} 天 · 共错 ${rows.reduce((n,r)=>n+r.events.length,0)} 次`;
      if(!rows.length){area.textContent='这个日期或搜索条件下暂无答错记录。';return;}
      for(const row of rows){
        const details=document.createElement('details');details.style.cssText='border-top:1px solid #94a3b855;padding:12px 0';
        const summary=document.createElement('summary');summary.style.cursor='pointer';summary.textContent=`${row.word}　${row.date}　错 ${row.events.length} 次`;details.append(summary);
        const list=document.createElement('ol');list.style.cssText='padding-left:24px;line-height:1.8;overflow-wrap:anywhere';
        row.events.sort((a,b)=>a.ts-b.ts).forEach(e=>{
          const li=document.createElement('li');li.textContent=`${e.time||''} · ${sources[e.source]||e.source} · ${modes[e.mode]||e.mode} · 你的答案：${e.answer||'（空白）'}`;list.append(li);
        });
        details.append(list);area.append(details);
      }
    }
    date.onchange=draw;search.oninput=draw;dialog.querySelector('[data-all]').onclick=()=>{date.value='';draw();};
    dialog.querySelector('[data-close]').onclick=()=>dialog.close();
    dialog.addEventListener('keydown',e=>e.stopPropagation());
    const refresh=()=>draw();window.addEventListener('ielts:pulled',refresh);
    dialog.onclose=()=>{window.removeEventListener('ielts:pulled',refresh);dialog.remove();};
    const style=document.createElement('style');style.textContent='#mistake-history button{border:1px solid #94a3b855;border-radius:9px;padding:9px 14px;cursor:pointer;font:inherit} #mistake-history input{box-sizing:border-box;border:1px solid #94a3b855;border-radius:9px;padding:9px;font:inherit;background:transparent;color:inherit}';dialog.prepend(style);
    document.body.append(dialog);draw();dialog.showModal();
  }
  scope.IELTSMistakes={record,read,groups,show};
  document.addEventListener('DOMContentLoaded',()=>{
    const host=document.querySelector('.practice-actions')||document.querySelector('.tools')||document.querySelector('header');
    if(!host)return;
    const button=document.createElement('button');button.id='mistakeHistoryButton';button.className='btn alt sm';button.textContent='每日错词记录';button.onclick=show;if(host.tagName==='HEADER')button.style.cssText='margin-top:12px;padding:9px 14px;border:1px solid var(--line,#ddd);border-radius:9px;background:var(--card,#fff);color:inherit;font:inherit;cursor:pointer';host.append(button);
  });
})(window);
