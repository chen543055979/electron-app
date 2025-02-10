import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { writeFileSync } from 'fs'

// 定义创建窗口的函数
function createWindow() {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 900, // 窗口宽度
    height: 670, // 窗口高度
    show: false, // 初始时不显示窗口，等到窗口准备好后再显示
    autoHideMenuBar: true, // 自动隐藏菜单栏
    ...(process.platform === 'linux' ? { icon } : {}), // 如果是 Linux 系统，设置窗口图标
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'), // 指定预加载脚本的路径
      sandbox: false, // 禁用沙箱模式
      contextIsolation: true, // 上下文隔离
      nodeIntegration: false // 渲染进程不能使用nodejs
    }
  })

  // 当窗口准备好显示时触发该事件
  mainWindow.on('ready-to-show', () => {
    mainWindow.show() // 显示窗口
  })

  // 处理窗口内打开新链接的情况
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url) // 使用系统默认浏览器打开链接
    return { action: 'deny' } // 拒绝在 Electron 窗口内打开链接
  })

  // 根据开发或生产环境加载不同的页面
  // HMR（热模块替换）用于开发环境，基于 electron - vite cli
  // 开发环境加载远程 URL，生产环境加载本地 HTML 文件
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 当 Electron 完成初始化并准备好创建浏览器窗口时调用此方法
// 有些 API 只能在这个事件发生后使用
app.whenReady().then(() => {
  // 为 Windows 系统设置应用用户模型 ID
  electronApp.setAppUserModelId('com.electron')

  // 在开发环境中，默认通过 F12 打开或关闭开发者工具
  // 在生产环境中，忽略 CommandOrControl + R 快捷键
  // 参考 https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC（进程间通信）测试
  // 监听 'ping' 事件，当收到该事件时打印 'pong'
  ipcMain.on('ping', () => console.log('pong'))

  // 监听保存文件的请求
  ipcMain.handle('save-file', async (event, content) => {
    // 弹出保存文件对话框，让用户选择保存位置和文件名
    const { canceled, filePath } = await dialog.showSaveDialog({
      filters: [
        // 限制文件类型为文本文件
        { name: 'Text Files', extensions: ['txt'] }
      ]
    })
    // 如果用户没有取消操作且选择了文件路径
    if (!canceled && filePath) {
      try {
        // 将内容写入指定文件
        writeFileSync(filePath, content)
        return true
      } catch (error) {
        // 写入文件出错时打印错误信息
        console.error('保存文件时出错:', error)
        return false
      }
    }
    return false
  })

  // 创建主窗口
  createWindow()

  // 在 macOS 系统中，当点击 Dock 图标且没有其他窗口打开时，重新创建一个窗口
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 当所有窗口关闭时退出应用，除了在 macOS 系统中
// 在 macOS 系统中，应用和菜单栏通常会保持活动状态，直到用户显式使用 Cmd + Q 退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 在这个文件中，你可以包含应用主进程的其他特定代码
// 你也可以将它们放在单独的文件中，然后在这里引入