const {app, BrowserWindow, session, Menu, ipcMain, dialog, shell} = require('electron');
const path = require('node:path');
const {pathToFileURL} = require('node:url');

const fs = require('node:fs');
const Data = require('./src/learning-data.js');
const DataStore = require('./data-store.cjs');
app.setName('IELTSVocab');
// Stable across archive names and version changes; preserves the v1.0.2 profile.
app.setPath('userData', path.join(app.getPath('appData'), 'IELTSVocab'));
app.commandLine.appendSwitch('lang', 'zh-CN');
if (!app.requestSingleInstanceLock()) app.quit();
else {
  let win;
  app.on('second-instance', () => { if (win) { win.restore(); win.focus(); } });
  app.whenReady().then(() => {
    const store = new DataStore(app.getPath('userData'));
    const pages = ['index', 'review', 'p1', 'vj', 'scene', 'notebook', 'wrong'];
    const urls = pages.map(p => pathToFileURL(path.join(__dirname, 'src', p + '.html')).href);
    session.defaultSession.webRequest.onBeforeRequest({urls: ['http://*/*', 'https://*/*', 'ws://*/*', 'wss://*/*']}, (_, callback) => callback({cancel: true}));
    // Only the microphone, only for our own pages (生词本 口语练习 records for local playback).
    const ownPage = url => urls.some(u => String(url || '').split('#')[0] === u);
    session.defaultSession.setPermissionRequestHandler((wc, permission, callback, details) =>
      callback(permission === 'media' && ownPage(details.requestingUrl) && (details.mediaTypes || []).every(t => t === 'audio')));
    session.defaultSession.setPermissionCheckHandler((wc, permission, origin, details) => permission === 'media' && details?.mediaType === 'audio' && ownPage(details.requestingUrl));
    win = new BrowserWindow({width: 800, height: 940, minWidth: 380, minHeight: 560,
      title: '雅思词汇听写合集', icon: path.join(__dirname, 'src', 'icon-512.png'),
      webPreferences: {preload:path.join(__dirname,'preload.cjs'), nodeIntegration: false, contextIsolation: true, sandbox: true}});
    const allowed = event => event.sender === win.webContents && event.senderFrame === win.webContents.mainFrame && urls.includes(event.senderFrame.url);
    ipcMain.on('learning-data',(event,action,payload)=>{
      if(!allowed(event)) {event.returnValue={ok:false,error:'页面无权访问学习数据'};return;}
      try {
        let value;
        if(action==='read') value=store.read();
        else if(action==='seed') {value=store.read();if(!value) {value=store.write(payload);store.backup(value,'migration');}}
        else if(action==='save') value=store.save(payload.deck,payload.payload);
        else throw Error('未知数据操作');
        event.returnValue={ok:true,value};
      } catch(error) {event.returnValue={ok:false,error:error.message};}
    });
    let dataBusy=false;
    async function dataAction(action) {
      if(dataBusy)return;dataBusy=true;
      try {
        if(action==='folder') {
          const dir=path.join(store.directory,'backups');fs.mkdirSync(dir,{recursive:true});
          const error=await shell.openPath(dir);if(error)throw Error(error);return;
        }
        if(action==='latest'||action==='import') {
          let restored,detail='';
          if(action==='latest') {
            const found=store.latestBackup();
            if(!found)throw Error('备份目录里没有可用的备份。可用「从备份恢复…」选择自己导出的备份文件。');
            restored=found.root;detail='最近的有效备份：'+path.basename(found.file)+'（'+new Date(found.mtime).toLocaleString()+'）\n';
          } else {
            const file=await dialog.showOpenDialog(win,{title:'选择完整学习备份',properties:['openFile'],filters:[{name:'学习备份',extensions:['json']}]});
            if(file.canceled)return;
            if(fs.statSync(file.filePaths[0]).size>32*1024*1024)throw Error('备份超过 32 MB');
            restored=Data.parse(fs.readFileSync(file.filePaths[0],'utf8'));
          }
          const damaged=store.corrupt();
          const confirm=await dialog.showMessageBox(win,{type:'warning',message:'用此备份恢复学习数据？',detail:detail+Data.summary(restored)+(damaged?'\n当前数据文件无法读取，会原样保留为 data.json.corrupt-<时间>，不会删除。':'\n将替换当前记录；恢复前会自动备份当前数据。两种系统的快捷键分别保留。'),buttons:['取消','恢复'],defaultId:0,cancelId:0});
          if(confirm.response!==1)return;
          store.restore(restored);
          await win.loadURL(urls[0]);
          await dialog.showMessageBox(win,{message:'恢复完成',detail:damaged?'损坏的原文件已保留在数据目录。':'原数据已保存到自动备份目录，可再次恢复。'});
          return;
        }
        const current=store.read();if(!current)throw Error('请先等待首页加载完成');
        if(action==='export') {
          const file=await dialog.showSaveDialog(win,{title:'导出完整学习备份',defaultPath:'IELTSVocab-backup-'+new Date().toISOString().slice(0,10)+'.json',filters:[{name:'学习备份',extensions:['json']}]});
          if(file.canceled)return;
          fs.writeFileSync(file.filePath,Data.pack(current),{mode:0o600});
          await dialog.showMessageBox(win,{message:'完整备份已导出',detail:Data.summary(current)});
        }
      }catch(error){await dialog.showMessageBox(win,{type:'error',message:'数据操作未完成',detail:error.message});}
      finally{dataBusy=false;}
    }
    ipcMain.on('learning-data-action',(event,action)=>{if(allowed(event))void dataAction(action);});
    win.webContents.setWindowOpenHandler(() => ({action: 'deny'}));
    win.webContents.on('will-navigate', (event, url) => { if (!urls.includes(url)) event.preventDefault(); });
    win.webContents.on('will-attach-webview', event => event.preventDefault());
    const labels = ['主页', '今日复习', 'Part 1 高频词', '词汇真经', '听力场景词汇', '生词本', '错词本'];
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {label: '词库', submenu: pages.map((_, i) => ({label: labels[i], click: () => win.loadURL(urls[i])}))},
      {label: '学习数据', submenu: [{label:'学习记录与数据转移',click:()=>win.webContents.executeJavaScript('window.showLearningData()')},{label:'导出完整备份…',click:()=>dataAction('export')},{label:'从备份恢复…',click:()=>dataAction('import')},{label:'从最近的有效备份恢复…',click:()=>dataAction('latest')},{label:'打开自动备份目录',click:()=>dataAction('folder')}]},
      {label: '编辑', submenu: [{label: '撤销', role: 'undo'}, {label: '重做', role: 'redo', accelerator: 'CommandOrControl+Shift+Z'}, {type: 'separator'}, {label: '剪切', role: 'cut'}, {label: '复制', role: 'copy'}, {label: '粘贴', role: 'paste'}, {label: '全选', role: 'selectAll'}]},
      {label: '显示', submenu: [
        {label: '放大字号', click: () => win.webContents.executeJavaScript('window.adjustDesktopZoom(0.1)')},
        {label: '缩小字号', click: () => win.webContents.executeJavaScript('window.adjustDesktopZoom(-0.1)')},
        {label: '恢复字号', click: () => win.webContents.executeJavaScript('window.adjustDesktopZoom(0)')},
        {label: '切换全屏', role: 'togglefullscreen'}]},
      {label: '帮助', submenu: [{label: '快捷键设置', click: () => win.webContents.executeJavaScript('window.showShortcutHelp()')}]}
    ]));
    win.webContents.on('context-menu', (_, params) => {
      const flags = params.editFlags;
      const items = params.isEditable ? [
        {label: '撤销', role: 'undo', enabled: flags.canUndo},
        {label: '重做', role: 'redo', enabled: flags.canRedo},
        {type: 'separator'},
        {label: '剪切', role: 'cut', enabled: flags.canCut},
        {label: '复制', role: 'copy', enabled: flags.canCopy},
        {label: '粘贴', role: 'paste', enabled: flags.canPaste},
        {label: '全选', role: 'selectAll', enabled: flags.canSelectAll}
      ] : [{label: '复制', role: 'copy', enabled: !!params.selectionText}];
      Menu.buildFromTemplate(items).popup({window: win});
    });
    win.loadURL(urls[0]);
  });
  app.on('window-all-closed', () => app.quit());
}
