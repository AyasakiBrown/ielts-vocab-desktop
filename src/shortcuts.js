(() => {
  'use strict';
  const mac = /Mac/.test(navigator.platform), mod = mac ? 'Meta' : 'Ctrl';
  const field = mac ? 'shortcutsMac' : 'shortcutsWindows';
  const storageKey = 'ielts_' + field;
  const actions = [
    ['home','主页',mod+'+Digit0'], ['review','今日复习',mod+'+Digit6'], ['p1','Part 1 高频词',mod+'+Digit1'],
    ['vj','词汇真经',mod+'+Digit2'], ['scene','听力场景词汇',mod+'+Digit3'],
    ['notebook','生词本',mod+'+Digit4'], ['wrong','错词本',mod+'+Digit5'],
    ['zoomIn','放大字号',mod+'+Shift+Equal'], ['zoomOut','缩小字号',mod+'+Minus'],
    ['zoomReset','恢复字号',mod+'+Shift+Digit0'],
    ['replay','重听当前词','Alt+KeyR'], ['next','下一题 / 跳过','Alt+ArrowRight'],
    ['previous','上一张卡片','Alt+ArrowLeft'], ['submit','提交答案 / 添加生词','Enter'],
    ['flip','卡片翻面','Space'], ['close','关闭练习弹窗','Escape'], ['settings','打开快捷键设置','F1']
  ];
  const defaults = Object.fromEntries(actions.map(([id,,key])=>[id,key]));
  const codeRE = /^(Key[A-Z]|Digit[0-9]|F([1-9]|1[0-2])|Arrow(Left|Right|Up|Down)|Enter|Space|Escape|Equal|Minus|BracketLeft|BracketRight|Backslash|Semicolon|Quote|Comma|Period|Slash|Backquote)$/;
  const reserved = new Set(['Ctrl+Alt+Delete','Alt+F4','Alt+Space','Ctrl+Tab','Ctrl+Shift+Tab','Meta+Tab','Meta+Space','Ctrl+Space','Meta+Ctrl+KeyF','F11']);
  for (const k of ['KeyC','KeyV','KeyX','KeyA','KeyZ','KeyY','KeyQ','KeyW','KeyH','KeyM']) {
    reserved.add(mod+'+'+k); reserved.add(mod+'+Shift+'+k);
  }
  function valid(id,key) {
    if (key === '') return '';
    if (typeof key !== 'string') return '无效键位';
    const parts = key.split('+'), code=parts.pop();
    if (!codeRE.test(code) || parts.some(p=>!['Meta','Ctrl','Alt','Shift'].includes(p)) || new Set(parts).size!==parts.length) return '不支持这个按键';
    if (reserved.has(key)) return '这是系统或文字编辑保留键，请换一个组合';
    if (!parts.some(p=>['Meta','Ctrl','Alt'].includes(p)) && !/^F\d+$/.test(code)) {
      if (!(id==='submit' && key==='Enter') && !(id==='flip' && key==='Space') && !(id==='close' && key==='Escape')) return '请搭配 Ctrl、Alt 或 Command，避免影响正常输入';
    }
    return '';
  }
  function keyOf(e) {
    if (!codeRE.test(e.code)) return null;
    return [e.metaKey?'Meta':'',e.ctrlKey?'Ctrl':'',e.altKey?'Alt':'',e.shiftKey?'Shift':'',e.code].filter(Boolean).join('+');
  }
  function label(key) {
    if (!key) return '未设置';
    const names={Meta:'⌘',Ctrl:'Ctrl',Alt:mac?'Option':'Alt',Shift:'Shift',ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',Space:'空格',Escape:'Esc',Equal:'=',Minus:'−',BracketLeft:'[',BracketRight:']',Backslash:'\\',Semicolon:';',Quote:"'",Comma:',',Period:'.',Slash:'/',Backquote:'`'};
    return key.split('+').map(p=>names[p]||p.replace(/^(Key|Digit)/,'')).join(' + ');
  }
  function read() {
    let saved;
    try { saved=JSON.parse(localStorage.getItem(storageKey)); } catch {}
    const boot=window.__INITIAL_STATE__?.decks?.config?.[field];
    if (boot && (!saved || boot.ts>saved.ts)) saved=boot;
    const map={...defaults};
    if (saved?.v===1 && saved.bindings) {
      for (const [id] of actions) if (Object.hasOwn(saved.bindings,id) && !valid(id,saved.bindings[id])) map[id]=saved.bindings[id];
      const used=new Set();
      for (const [id] of actions) { if (map[id] && used.has(map[id])) map[id]=''; if(map[id]) used.add(map[id]); }
    }
    return map;
  }
  let bindings, panel, draft, recording, lastFocus;
  const visible=el=>el && !el.disabled && el.getClientRects().length>0 && getComputedStyle(el).visibility!=='hidden';
  function closeSettings() { panel?.remove();panel=null;recording=null;lastFocus?.focus(); }
  function status(text) { panel.querySelector('#shortcut-status').textContent=text; }
  function draw() {
    for(const [id] of actions) panel.querySelector('[data-key="'+id+'"]').textContent=recording===id?'请按组合键…（Esc 取消）':label(draft[id]);
  }
  window.showShortcutHelp = window.openShortcutSettings = () => {
    if(panel) { panel.querySelector('button').focus(); return; }
    bindings=read();draft={...bindings};lastFocus=document.activeElement;
    panel=document.createElement('div'); panel.id='shortcut-settings';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','shortcut-title');
    panel.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#101827cc;display:flex;align-items:center;justify-content:center;padding:16px;color:#182337;font:14px system-ui;';
    panel.innerHTML=`<section style="background:#fff;border-radius:16px;padding:22px;width:620px;max-width:100%;max-height:85vh;overflow:auto;box-shadow:0 16px 60px #0005">
      <h2 id="shortcut-title" style="margin:0 0 10px">快捷键设置 · ${mac?'Mac':'Windows'}</h2>
      <p>点击键位，再按新的组合键。保存后立即生效并保留到下次启动；两种系统分别保存。</p>
      <p style="font-size:12px;color:#526074">复制、粘贴等系统编辑键保留默认；Tab 正常切换焦点。录入时 Esc 取消。输入法选字时不执行练习键。</p>
      <div id="shortcut-rows"></div>
      <div style="position:sticky;bottom:-22px;background:#fff;padding:8px 0 14px;border-top:1px solid #d8deea">
      <p id="shortcut-status" role="status" aria-live="polite" style="min-height:22px;color:#9d301c"></p>
      <div style="display:flex;gap:12px;flex-wrap:wrap"><button id="shortcut-defaults">恢复默认</button><button id="shortcut-cancel">取消</button><button id="shortcut-save">保存设置</button></div></div>
    </section>`;
    const rows=panel.querySelector('#shortcut-rows');
    for(const [id,title] of actions) {
      const row=document.createElement('div');row.style.cssText='display:grid;grid-template-columns:1fr 1.4fr auto;gap:10px;align-items:center;padding:6px 0;border-bottom:1px solid #e6eaf0';
      const text=document.createElement('span');text.textContent=title;
      const record=document.createElement('button');record.dataset.key=id;record.setAttribute('aria-label',title+'快捷键');
      record.onclick=()=>{recording=id;draw();status('正在录入「'+title+'」的键位。');};
      const clear=document.createElement('button');clear.textContent='清除';clear.setAttribute('aria-label','清除'+title+'快捷键');clear.onclick=()=>{draft[id]='';recording=null;draw();status('已清除，点击保存后生效。');};
      row.append(text,record,clear);rows.append(row);
    }
    for(const b of panel.querySelectorAll('button')) b.style.cssText='font:inherit;padding:8px 10px;border:1px solid #9ba8ba;border-radius:7px;background:#f5f7fb;color:#162c4c;cursor:pointer;min-height:36px';
    panel.querySelector('#shortcut-save').style.background='#d9eaff';
    panel.querySelector('#shortcut-cancel').onclick=closeSettings;
    panel.querySelector('#shortcut-defaults').onclick=()=>{draft={...defaults};recording=null;draw();status('默认键位已填入，点击保存后生效。');};
    panel.querySelector('#shortcut-save').onclick=()=>{
      const used=new Set();
      for(const [id] of actions) { const error=valid(id,draft[id]);if(error){status(error);return;} if(draft[id] && used.has(draft[id])){status('存在重复键位，请先修改冲突。');return;} if(draft[id])used.add(draft[id]); }
      const value={v:1,ts:Date.now(),bindings:{...draft}};
      try {
        localStorage.setItem(storageKey,JSON.stringify(value));
        const persist=window.webkit?.messageHandlers?.persist;
        if (persist) persist.postMessage(JSON.stringify({deck:'config',payload:{[field]:value}}));
        if(window.__INITIAL_STATE__?.decks) { window.__INITIAL_STATE__.decks.config ||= {};window.__INITIAL_STATE__.decks.config[field]=value; }
        bindings={...draft};closeSettings();
      } catch { status('保存失败：本地存储不可用。请检查磁盘空间后重试。'); }
    };
    document.body.append(panel);draw();panel.querySelector('button').focus();
  };
  function execute(id,e) {
    const overlay=[...document.querySelectorAll('.ov.show, .modal.show')].pop();
    const scope=overlay||document;
    const typing=document.activeElement?.matches('input,textarea,select,[contenteditable="true"]');
    const pages={home:'index',review:'review',p1:'p1',vj:'vj',scene:'scene',notebook:'notebook',wrong:'wrong'};
    if(pages[id]) { location.href=pages[id]+'.html';return true; }
    if(id==='settings') {window.openShortcutSettings();return true;}
    if(id.startsWith('zoom')) {
      const delta=id==='zoomIn'?0.1:id==='zoomOut'?-0.1:0;
      if(window.adjustDesktopZoom) window.adjustDesktopZoom(delta);
      else {
        const z=delta===0?1:Math.min(1.8,Math.max(0.6,(window.__INITIAL_STATE__?.decks?.config?.zoom||1)+delta));
        window.webkit?.messageHandlers?.zoom?.postMessage(String(z));
      }
      return true;
    }
    if(id==='close' && !overlay)return false;
    if(id==='flip' && typing)return false;
    let ids={replay:['dsay','rsay','msay','dReplay','fSpeak'],next:['dskip','rnext','mnext','dSkip','fNext','qNext'],previous:['rprev','fPrev'],close:['dclose','rclose','mclose','closeModal'],flip:['rflip','flash']}[id]||[];
    if(id==='submit') {const focus=document.activeElement?.id; ids=focus==='w'?['add']:focus==='dictInput'?['dSubmit']:focus==='dans'?['dsubmit']:[];}
    const button=ids.map(x=>scope.querySelector('#'+x)).find(visible);
    if(button){button.click();return true;}return false;
  }
  // One dispatcher owns application shortcuts. Legacy page keys are disabled only
  // in desktop hosts, so the existing phone/web pages retain their behavior.
  window.__CUSTOM_SHORTCUTS__=true;
  document.addEventListener('keydown',e=>{
    if(e.isComposing || e.keyCode===229)return;
    if(document.querySelector('dialog[open]'))return;
    if(panel) {
      if(recording) {
        e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;
        if(e.key==='Escape'){recording=null;draw();status('已取消录入。');return;}
        const key=keyOf(e);if(!key)return;
        const error=valid(recording,key);if(error){status(error);return;}
        const conflict=actions.find(([id])=>id!==recording && draft[id]===key);
        if(conflict){status('与「'+conflict[1]+'」冲突，请换一个键位，或先清除该项。');return;}
        draft[recording]=key;recording=null;draw();status('已录入，点击保存后生效。');return;
      }
      if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeSettings();return;}
      if(e.key==='Tab') {
        const all=[...panel.querySelectorAll('button')];const i=all.indexOf(document.activeElement);
        if((!e.shiftKey&&i===all.length-1)||(e.shiftKey&&i===0)){e.preventDefault();all[e.shiftKey?all.length-1:0].focus();}
      }
      e.stopImmediatePropagation();return;
    }
    if(e.repeat)return;
    bindings ||= read();
    const key=keyOf(e);const action=actions.find(([id])=>key && bindings[id]===key);
    if(action && execute(action[0],e)){e.preventDefault();e.stopImmediatePropagation();}
  },true);
})();
