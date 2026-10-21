const fs = require('node:fs');
const path = require('node:path');
const Data = require('./src/learning-data.js');

class DataStore {
  constructor(directory) { this.directory=directory; this.file=path.join(directory,'data.json'); }
  // An existing file that cannot be parsed throws (code CORRUPT): nothing is written
  // until it is restored, and the file itself is never touched by save().
  read() {
    if (!fs.existsSync(this.file)) return null;
    try { return Data.parse(fs.readFileSync(this.file,'utf8')); }
    catch (error) {
      const e = Error('学习数据文件无法读取（'+error.message+'），已停止保存，原文件保持不动。请用菜单「学习数据 → 从最近的有效备份恢复…」恢复');
      e.code = 'CORRUPT'; throw e;
    }
  }
  corrupt() { try { this.read(); return false; } catch (e) { if (e.code === 'CORRUPT') return true; throw e; } }
  // Newest backup that passes the same validation as a manual restore.
  latestBackup() {
    const dir=path.join(this.directory,'backups');
    if(!fs.existsSync(dir)) return null;
    const files=fs.readdirSync(dir).filter(n=>n.endsWith('.json')).map(n=>path.join(dir,n))
      .map(file=>({file,mtime:fs.statSync(file).mtimeMs})).sort((a,b)=>b.mtime-a.mtime);
    for(const f of files) {
      try { return {file:f.file,mtime:f.mtime,root:Data.parse(fs.readFileSync(f.file,'utf8'))}; } catch {}
    }
    return null;
  }
  write(root) {
    root=Data.normalize(root);
    fs.mkdirSync(this.directory,{recursive:true});
    const tmp=this.file+'.tmp';
    const fd=fs.openSync(tmp,'w',0o600);
    try {fs.writeFileSync(fd,JSON.stringify(root));fs.fsyncSync(fd);} finally {fs.closeSync(fd);}
    fs.renameSync(tmp,this.file);
    return root;
  }
  backup(root, reason='daily') {
    const dir=path.join(this.directory,'backups');fs.mkdirSync(dir,{recursive:true});
    const stamp=reason==='daily'?new Date().toISOString().slice(0,10):new Date().toISOString().replace(/[:.]/g,'-');
    const file=path.join(dir,`${reason}-${stamp}.json`);
    if(!fs.existsSync(file)) fs.writeFileSync(file,Data.pack(root),{flag:'wx',mode:0o600});
    if(reason==='daily') {
      const files=fs.readdirSync(dir).filter(n=>/^daily-\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort();
      for(const name of files.slice(0,-30)) fs.unlinkSync(path.join(dir,name));
    }
    return file;
  }
  save(deck,payload) {
    const root=this.read(); if(!root) throw Error('数据尚未初始化');
    if(!Object.hasOwn(root.decks,deck)) throw Error('未知词库');
    // Keep per-answer saves from rescanning the backup directory. Recreate a
    // deleted backup and retry failures; only a successful backup is remembered.
    const dailyFile=path.join(this.directory,'backups','daily-'+new Date().toISOString().slice(0,10)+'.json');
    if(this.dailyBackupFile!==dailyFile || !fs.existsSync(dailyFile)) this.dailyBackupFile=this.backup(root);
    if(deck==='config') Object.assign(root.decks.config,payload);
    else if(deck==='srs') root.decks.srs=Data.mergeReview(root.decks.srs,payload);
    else if(deck==='stats') root.decks.stats=Data.mergeStats(root.decks.stats,payload);
    else if(['p1','vj','scene'].includes(deck)) {
      Data.remember(root.decks[deck],root.decks[deck].daily);
      Object.assign(root.decks[deck],payload);
      Data.remember(root.decks[deck],payload.daily);
    } else Object.assign(root.decks[deck],payload);
    return this.write(root);
  }
  // A damaged current file is kept beside the restored one as data.json.corrupt-<time>.
  restore(root) {
    root=Data.normalize(root);
    if(this.corrupt()) fs.renameSync(this.file,this.file+'.corrupt-'+new Date().toISOString().replace(/[:.]/g,'-'));
    else { const current=this.read(); if(current) this.backup(current,'before-restore'); }
    return this.write(root);
  }
}
module.exports=DataStore;
