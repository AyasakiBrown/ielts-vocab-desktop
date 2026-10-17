const fs = require('node:fs');
const path = require('node:path');
const Data = require('./src/learning-data.js');

class DataStore {
  constructor(directory) { this.directory=directory; this.file=path.join(directory,'data.json'); }
  read() {
    if (!fs.existsSync(this.file)) return null;
    return Data.parse(fs.readFileSync(this.file,'utf8'));
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
    this.backup(root);
    if(deck==='config') Object.assign(root.decks.config,payload);
    else if(deck==='srs') root.decks.srs=Data.mergeReview(root.decks.srs,payload);
    else if(['p1','vj','scene'].includes(deck)) {
      Data.remember(root.decks[deck],root.decks[deck].daily);
      Object.assign(root.decks[deck],payload);
      Data.remember(root.decks[deck],payload.daily);
    } else Object.assign(root.decks[deck],payload);
    return this.write(root);
  }
  restore(root) {
    root=Data.normalize(root);
    const current=this.read();
    if(current) this.backup(current,'before-restore');
    return this.write(root);
  }
}
module.exports=DataStore;
