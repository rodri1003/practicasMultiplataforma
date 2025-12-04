const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // La única función que la ventana necesita del proceso principal.
  openFile: () => ipcRenderer.invoke('dialog:openFile')
});