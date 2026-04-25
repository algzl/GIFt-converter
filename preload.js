const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("converterApi", {
  pickVideoFiles: () => ipcRenderer.invoke("pick-video-files"),
  pickVideoFolder: () => ipcRenderer.invoke("pick-video-folder"),
  pickOutputFolder: () => ipcRenderer.invoke("pick-output-folder"),
  normalizeDropPaths: (paths) => ipcRenderer.invoke("normalize-drop-paths", paths),
  generateVideoPreviews: (paths) => ipcRenderer.invoke("generate-video-previews", paths),
  getFileEntries: (paths) => ipcRenderer.invoke("get-file-entries", paths),
  stageOptimizeGifs: (payload) => ipcRenderer.invoke("stage-optimize-gifs", payload),
  commitOptimizedGifs: (drafts) => ipcRenderer.invoke("commit-optimized-gifs", drafts),
  discardOptimizedGifs: (drafts) => ipcRenderer.invoke("discard-optimized-gifs", drafts),
  saveZipArchive: (payload) => ipcRenderer.invoke("save-zip-archive", payload),
  saveGifFileAs: (payload) => ipcRenderer.invoke("save-gif-file-as", payload),
  convertBatch: (payload) => ipcRenderer.invoke("convert-batch", payload),
  cancelBatch: (jobs) => ipcRenderer.invoke("cancel-batch", jobs),
  openPath: (targetPath) => ipcRenderer.invoke("open-path", targetPath),
  openExternalUrl: (url) => ipcRenderer.invoke("open-external-url", url),
  onConversionStarted: (callback) =>
    ipcRenderer.on("conversion-started", (_event, data) => callback(data)),
  onConversionProgress: (callback) =>
    ipcRenderer.on("conversion-progress", (_event, data) => callback(data)),
  onConversionFinished: (callback) =>
    ipcRenderer.on("conversion-finished", (_event, data) => callback(data))
});
