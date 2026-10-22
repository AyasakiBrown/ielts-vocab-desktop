// Executes the Windows entry point with an Electron API double, not a Windows OS.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const Data=require('../src/learning-data.js');

test('Windows 菜单逐项打开对应页面，数据桥拒绝外部页面和子框架',async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ielts-shell-'));
  try {
    fs.mkdirSync(path.join(dir,'src'));
    fs.copyFileSync(path.join(__dirname,'../src/learning-data.js'),path.join(dir,'src/learning-data.js'));
    fs.copyFileSync(path.join(__dirname,'data-store.cjs'),path.join(dir,'data-store.cjs'));
    const ipc={},paths={appData:dir},hooks={};let win,menu;
    class Window {
      constructor(){win=this;this.webContents={mainFrame:{url:''},on(){},setWindowOpenHandler(){}};}
      loadURL(url){this.webContents.mainFrame.url=url;return Promise.resolve();}
    }
    const electron={
      app:{setName(){},setPath:(k,v)=>paths[k]=v,getPath:k=>paths[k],commandLine:{appendSwitch(){}},requestSingleInstanceLock:()=>true,on(){},whenReady:()=>Promise.resolve()},
      BrowserWindow:Window,
      session:{defaultSession:{webRequest:{onBeforeRequest(){}},setPermissionRequestHandler:fn=>hooks.request=fn,setPermissionCheckHandler:fn=>hooks.check=fn}},
      Menu:{buildFromTemplate:template=>({template}),setApplicationMenu:value=>menu=value},
      ipcMain:{on:(name,fn)=>ipc[name]=fn},dialog:{},shell:{}
    };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname,'main.cjs'),'utf8'),{
      __dirname:dir,require:name=>name==='electron'?electron:name==='./src/learning-data.js'?Data:name==='./data-store.cjs'?require(path.join(dir,'data-store.cjs')):require(name)
    });
    await Promise.resolve();
    const entries=menu.template.find(m=>m.label==='词库').submenu;
    const pages=['index','review','edef','p1','vj','scene','notebook','wrong'];
    const labels=['主页','今日复习','英义猜词','Part 1 高频词','词汇真经','听力场景词汇','生词本','错词本'];
    assert.equal(entries.length,pages.length);
    for(let i=0;i<pages.length;i++) {
      assert.equal(entries[i].label,labels[i]);entries[i].click();
      assert.equal(win.webContents.mainFrame.url,pathToFileURL(path.join(dir,'src',pages[i]+'.html')).href);
    }
    const event=()=>({sender:win.webContents,senderFrame:win.webContents.mainFrame});
    const call=(action,payload,e=event())=>{ipc['learning-data'](e,action,payload);return e.returnValue;};
    assert.equal(call('seed',{v:1,decks:{}}).ok,true);
    assert.equal(call('save',{deck:'notebook',payload:{sessions:{'dict:rw':{draft:'app',ts:1}}}}).ok,true);
    assert.equal(call('read').value.decks.notebook.sessions['dict:rw'].draft,'app');
    assert.equal(call('read',null,{sender:{},senderFrame:win.webContents.mainFrame}).ok,false);
    assert.equal(call('read',null,{sender:win.webContents,senderFrame:{url:win.webContents.mainFrame.url}}).ok,false);
    win.webContents.mainFrame.url='https://example.com';assert.equal(call('read').ok,false);
    let granted;
    hooks.request(null,'media',value=>granted=value,{requestingUrl:'https://example.com',mediaTypes:['audio']});assert.equal(granted,false);
    const own=pathToFileURL(path.join(dir,'src/notebook.html')).href;
    hooks.request(null,'media',value=>granted=value,{requestingUrl:own,mediaTypes:['audio']});assert.equal(granted,true);
    hooks.request(null,'media',value=>granted=value,{requestingUrl:own,mediaTypes:['video']});assert.equal(granted,false);
  } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
