import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  // 新增保存文件的接口
  saveFile: async (content) => {
    try {
      // 向主进程发送保存文件的请求
      const result = await ipcRenderer.invoke('save-file', content)
      return result
    } catch (error) {
      console.error('保存文件时出错:', error)
      return false
    }
  },
  // 获取当前时间的方法
  getCurrentTime: () => {
    return new Date().toLocaleString()
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    // 暴露 Electron 工具包的 API 给渲染进程
    contextBridge.exposeInMainWorld('electron', electronAPI)
    // 暴露自定义的 API 给渲染进程
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    // 暴露 API 出错时打印错误信息
    console.error(error)
  }
} else {
  // 如果没有启用上下文隔离，直接将 API 添加到全局窗口对象
  window.electron = electronAPI
  window.api = api
}
