/**
 * 会话列表层（对应 big 项目 services/recent.ts）
 * 维护最近会话列表：新消息置顶、未读数累加、最后一条消息更新、清空未读
 * 列表数据保持服务端返回结构（SessionCategoryID/SessionDataID/SessionName 等），页面可直接使用
 */
import { getChatList, getSummary, startChat, resetChat } from '../api/index.js'
import { IMService, EnumStatus } from './im.js'
import { dateFormat, guid, getUser } from './util.js'

const RecentList = [] // 最近会话列表（服务端结构）
let InitPromise = null // 初始化 Promise 缓存
let initTimestamp = 0 // 上次初始化时间，用于重连补偿时的防抖
let currentChatKey = '' // 当前正在聊天的会话 key，不为它累加未读数
const Subscribers = [] // 列表变化订阅者

// ----------- 根据会话项生成唯一 key
function keyOf(item) {
  return `${item.SessionCategoryID}:${item.SessionDataID}`
}

// ----------- 通知所有订阅者列表已变化
function notify() {
  Subscribers.forEach((fn) => {
    try {
      fn(RecentList)
    } catch (e) {
      console.error('[Recent] 订阅回调执行失败:', e)
    }
  })
}

export class RecentService {
  // ----------- 初始化会话列表（fresh 为 true 时强制重新拉取）
  static async init(fresh = false) {
    fresh && (InitPromise = null)
    initTimestamp = Date.now()
    await (InitPromise ||
      (InitPromise = getChatList().then((res) => {
        const list = res.Data || [] // 服务端会话列表
        RecentList.length = 0
        RecentList.push(...list)
        return RecentList
      }).catch((e) => {
        InitPromise = null
        throw e
      })))
    return RecentList
  }

  // ----------- 获取当前会话列表
  static getList() {
    return RecentList
  }

  // ----------- 订阅列表变化
  static subscribe(fn) {
    if (Subscribers.indexOf(fn) === -1) {
      Subscribers.push(fn)
    }
  }

  // ----------- 取消订阅
  static unsubscribe(fn) {
    const index = Subscribers.indexOf(fn)
    if (index !== -1) {
      Subscribers.splice(index, 1)
    }
  }

  // ----------- 设置当前正在聊天的会话（该会话新消息不累加未读数）
  static setCurrentChat(key) {
    currentChatKey = key
  }

  // ----------- 清除当前聊天会话标记
  static clearCurrentChat() {
    currentChatKey = ''
  }

  // ----------- 收到新消息：置顶会话、更新最后消息、累加未读
  static async new_message(key, message) {
    const [CategoryId, DataId] = key.split(':') // 会话类型和对象ID
    await RecentService.init()
    let item = RecentList.find((recent) => keyOf(recent) === key) // 已有会话项
    if (item) {
      // 已存在的会话移到最前面
      const index = RecentList.indexOf(item)
      RecentList.splice(index, 1)
      RecentList.unshift(item)
    } else {
      // 新会话先本地创建，再异步补充名称头像并同步服务端
      item = {
        ID: 0, // 服务端会话ID，startChat 后回填
        SessionCategoryID: Number(CategoryId), // 会话类型
        SessionDataID: DataId, // 会话对象ID
        SessionName: '', // 会话名称
        SessionLogo: '', // 会话头像
        UnReadCount: 0 // 未读数
      }
      RecentList.unshift(item)
      RecentService.fillSummary(item)
      RecentService.refreshFromServer(item)
    }
    // 更新最后一条消息信息
    item.LastSendText = message.MsgText
    item.LastSendTime = message.MsgTime
    item.LastSendUserID = message.SendUserID
    item.LastDomain = message.Domain
    // 不是自己发的、且不在当前聊天页时累加未读
    if (!message.IsMe && key !== currentChatKey) {
      item.UnReadCount = (item.UnReadCount || 0) + 1
    }
    notify()
    return item
  }

  // ----------- 撤回消息：如果撤回的是最后一条，更新列表预览
  static revoke_message(key, domain) {
    const item = RecentList.find((recent) => keyOf(recent) === key) // 会话项
    if (!item) return
    if (item.LastDomain === domain) {
      item.LastSendText = `<m_revoke,${domain}>`
      notify()
    }
  }

  // ----------- 清空会话未读数（进入聊天页时调用）
  static async read(key) {
    const item = RecentList.find((recent) => keyOf(recent) === key) // 会话项
    if (!item) return
    const changed = item.UnReadCount > 0 // 未读数是否有变化
    item.UnReadCount = 0
    const [CategoryId, DataId] = key.split(':') // 会话类型和对象ID
    // 单聊给对方发已读回执
    if (Number(CategoryId) === 20) {
      IMService.send(String(DataId), `<m_read,${key}>`, guid(), false).catch((e) => {
        console.warn('[Recent] 发送已读回执失败:', e)
      })
    }
    // 同步服务端清空未读
    if (item.ID) {
      const params = { chatId: item.ID } // 清未读参数
      if (Number(CategoryId) === 20) {
        params.sendUserId = DataId
      }
      resetChat(params).catch((e) => {
        console.warn('[Recent] 清空未读失败:', e)
      })
    }
    changed && notify()
  }

  // ----------- 异步补充新会话的名称和头像
  static async fillSummary(item) {
    try {
      const res = await getSummary(item.SessionCategoryID, item.SessionDataID) // 概要信息响应
      const info = res.Data || res // 概要信息
      item.SessionName = info.ViewName || info.UserName || info.IMGroupName || info.DataTitle || String(item.SessionDataID)
      item.SessionLogo = info.DataLogo || info.UserLogo || info.IMGroupLogo || ''
      notify()
    } catch (e) {
      console.warn('[Recent] 获取会话概要失败:', e)
      item.SessionName = item.SessionName || String(item.SessionDataID)
    }
  }

  // ----------- 新会话同步到服务端并回填会话ID
  static async refreshFromServer(item) {
    try {
      const res = await startChat({ chatCategoryId: item.SessionCategoryID, chatDataId: item.SessionDataID }) // 服务端会话信息
      const recent = res.Data || res // 服务端返回的会话
      if (recent && recent.ID) {
        item.ID = recent.ID
      }
    } catch (e) {
      console.warn('[Recent] 同步会话失败:', e)
    }
  }
}

// 订阅连接状态：断线重连成功后重新拉取会话列表补偿漏收的消息
IMService.state_change((state, oldState) => {
  if (Date.now() - initTimestamp <= 5000) {
    // 刚初始化过（5秒内）不重复拉取
    return
  }
  if (state === EnumStatus.Connected && oldState !== EnumStatus.Connected) {
    InitPromise = null
    RecentService.init().then(() => notify()).catch(() => {})
  }
})
