// Local-only Windows bridge. Each user's Electron profile starts empty.
(() => {
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  };
  let decks = {};
  for (const deck of ['p1', 'vj', 'scene']) {
    decks[deck] = {};
    for (const field of ['prog', 'daily', 'settings']) {
      decks[deck][field] = read('ielts_' + deck + '_' + field, field === 'daily' ? {date:'',done:0,ok:0} : {});
    }
  }
  decks.notebook = {list: read('ielts_nb', []), del: read('ielts_nb_del', {})};
  decks.wrong = {list: read('ielts_wrong', []), del: read('ielts_wrong_del', {})};
  decks.config = read('ielts_desktop_config', {});
  for(const key of ['shortcutsMac','shortcutsWindows']) {
    const old=read('ielts_'+key,null); if(old)decks.config[key]=old;
  }
  function failure(error) {
    const show=()=>{const banner=document.createElement('div');banner.setAttribute('role','alert');banner.style.cssText='position:fixed;top:0;left:0;right:0;background:#8b1e18;color:white;padding:16px;z-index:2147483647';banner.textContent='学习数据保存失败：'+error.message+'。请停止练习，检查磁盘空间或备份文件；不要清空应用数据。';document.body.append(banner);};
    if(document.body)show();else document.addEventListener('DOMContentLoaded',show,{once:true});
  }
  try {
    const root=window.desktopData.call('read') || window.desktopData.call('seed',{v:1,decks});
    decks=root.decks;window.IELTSData.hydrate(root,localStorage);
  } catch(error) {failure(error);throw error;}
  window.__INITIAL_STATE__ = {v: 1, decks};
  function save(deck,payload) {
    try {
      const root=window.desktopData.call('save',{deck,payload});
      decks=root.decks;window.__INITIAL_STATE__=root;
    } catch(error) {failure(error);throw error;}
  }
  const zoom = value => {
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    decks.config.zoom = Math.min(1.8, Math.max(0.6, n));
    document.documentElement.style.zoom = decks.config.zoom;
    localStorage.setItem('ielts_desktop_config', JSON.stringify(decks.config));
    save('config',decks.config);
  };
  window.adjustDesktopZoom = delta => {
    zoom(delta === 0 ? 1 : (decks.config.zoom || 1) + delta);
    const label = document.getElementById('zoomval');
    if (label) label.textContent = '— ' + Math.round(decks.config.zoom * 100) + '%';
    window.dispatchEvent(new CustomEvent('ielts:zoom', {detail: decks.config.zoom}));
  };
  window.webkit = {messageHandlers: {
    persist: {postMessage(body) {
      const {deck, payload} = JSON.parse(body);
      save(deck,payload);
    }},
    learningData: {postMessage: action => window.desktopData.action(action)},
    zoom: {postMessage: zoom}
  }};
  zoom(decks.config.zoom || 1);
  document.addEventListener('DOMContentLoaded', () => {
    const intro = document.querySelector('header p');
    if (!document.getElementById('zoombox')) return;
    if (intro) intro.textContent = '三个词库合在一个 App 里，进度自动保存在本机。菜单「词库」可切换页面；在「帮助 → 快捷键设置」中自定义键位。';
    for (const label of document.querySelectorAll('#zoombox b')) {
      label.textContent = label.textContent.replace('⌘', 'Ctrl + ');
    }
    const footer = document.querySelector('footer');
    if (footer) footer.textContent = '学习数据保存在当前用户 %APPDATA%/IELTSVocab/data.json。更新只需替换程序；换电脑前请在「学习数据」菜单导出完整备份。';
  });
})();
