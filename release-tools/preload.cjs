const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('desktopData', {
  call: (action,payload) => {
    const reply=ipcRenderer.sendSync('learning-data',action,payload);
    if(!reply?.ok) throw Error(reply?.error || '保存失败');
    return reply.value;
  },
  action: action => ipcRenderer.send('learning-data-action',action)
});
