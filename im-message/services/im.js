/**
 * IM SDK 适配层（对应 big 项目 services/im.ts）
 * 唯一和网易云信 SDK 打交道的地方，对外只暴露统一的事件和发送接口
 * 平台差异通过条件编译引入对应构建：小程序用 MINIAPP 版，App 用 UNIAPP 版，H5 用浏览器版
 */
// #ifdef MP
import NIM from 'nim-web-sdk-ng/dist/v2/NIM_MINIAPP_SDK'
// #endif
// #ifdef APP-PLUS
import NIM from 'nim-web-sdk-ng/dist/v2/NIM_UNIAPP_SDK'
// #endif
// #ifdef H5
import NIM from 'nim-web-sdk-ng'
// #endif
import { generateToken } from '../api/index.js'
import { getUser } from './util.js'

// NIM AppKey，与 big 项目 webpack.env 里的 NIM_APP_KEY 一致
const NIM_APP_KEY = '1cceec4b1cc4a4cf05e5fbda8d898ab2'

// 连接状态枚举，与 big 项目 EnumStatus 一致
export const EnumStatus = {
  Connecting: -1, // 登录中
  None: 0, // 未登录
  Connected: 1, // 登录成功
  Elsewhere: 2, // 帐号在别处登录
  DisConnect: 3 // 断开连接
}

// IM 全局状态（页面可订阅 state_change 监听变化）
export const IM = {
  state: EnumStatus.None, // 当前连接状态
  state_text: '未登录' // 状态描述文案
}

let nimInstance = null // NIM SDK 实例
let eventsBound = false // SDK 事件是否已绑定
let loginTimestamp = 0 // 本次登录成功的时间戳，用于过滤登录前的旧消息
let LoginPromise = null // 登录 Promise 缓存，防止并发重复登录（失败后保留，靠节流重试而不是立即重连）
let ReceiveMessage = null // 接收消息回调
const StateChange = [] // 状态变化订阅者列表
let reconnectTimer = null // 重连定时器
let reconnectDelay = 5000 // 当前重连间隔，失败指数增长，成功后重置

// ----------- 设置连接状态并通知订阅者
function SetState(state, message) {
  const oldState = IM.state // 变化前的状态
  IM.state = state
  IM.state_text = ['登录中', '未登录', '登录成功', '帐号在别处登录', '断开连接'][state + 1] || '未登录'
  StateChange.forEach((fn) => {
    try {
      fn(state, oldState)
    } catch (e) {
      console.error('[IM] state_change 回调执行失败:', e)
    }
  })
  // 断开后延迟自动重连，间隔指数增长，避免失败时请求风暴
  if (state === EnumStatus.DisConnect) {
    scheduleReconnect()
  }
  // 连接成功后重置重连间隔
  if (state === EnumStatus.Connected) {
    reconnectDelay = 5000
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }
  if (state === EnumStatus.Elsewhere) {
    console.warn('[IM] 帐号在别处登录', message || '')
  }
}

// ----------- 计划一次延迟重连（同一时刻只有一个定时器）
function scheduleReconnect() {
  if (reconnectTimer) return
  const delay = reconnectDelay // 本次重连间隔
  reconnectDelay = Math.min(reconnectDelay * 2, 120000) // 下次间隔翻倍，最长 2 分钟
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    IMReconnect()
  }, delay)
}

// ----------- 断开重连
export function IMReconnect() {
  const user = getUser() // 当前登录用户
  if (user && IM.state === EnumStatus.DisConnect) {
    IMService.login(true).catch(() => {})
  }
}

// ----------- 创建 SDK 实例并绑定事件（只执行一次）
function ensureInstance() {
  if (nimInstance) return nimInstance
  nimInstance = NIM.getInstance(
    { appkey: NIM_APP_KEY, debugLevel: 'off', apiVersion: 'v2' },
    {
      V2NIMLoginServiceConfig: {
        lbsUrls: ['https://lbs.netease.im/lbs/webconf.jsp'], // LBS 地址，与 big 项目一致
        linkUrl: 'weblink.netease.im:443' // 长连接地址，与 big 项目一致
      }
    }
  )
  if (!eventsBound) {
    eventsBound = true
    bindEvents()
  }
  return nimInstance
}

// ----------- 绑定 SDK 登录状态和消息接收事件
function bindEvents() {
  const nim = nimInstance // SDK 实例
  // 登录状态变化：0 未登录 1 已登录 2 登录中 3 断线重连等待中
  nim.V2NIMLoginService.on('onLoginStatus', (status) => {
    const map = { 0: EnumStatus.None, 1: EnumStatus.Connected, 2: EnumStatus.Connecting, 3: EnumStatus.DisConnect } // 状态映射
    SetState(map[status] !== undefined ? map[status] : EnumStatus.None)
  })
  // 连接状态变化：0 已断开 1 已连接 2 连接中 3 重连中
  nim.V2NIMLoginService.on('onConnectStatus', (status) => {
    const map = { 0: EnumStatus.DisConnect, 1: EnumStatus.Connected, 2: EnumStatus.Connecting, 3: EnumStatus.Connecting } // 状态映射
    SetState(map[status] !== undefined ? map[status] : EnumStatus.DisConnect)
  })
  // 被踢下线
  nim.V2NIMLoginService.on('onKickedOffline', () => {
    SetState(EnumStatus.Elsewhere)
  })
  // 收到新消息，拍平成统一格式后分发给业务层
  nim.V2NIMMessageService.on('onReceiveMessages', (messages) => {
    ;(messages || []).forEach((message) => {
      // 消息时间早于本次登录时间的不处理（重连后 SDK 补推的旧消息）
      if (loginTimestamp > parseInt(message.createTime)) {
        return
      }
      ReceiveMessage &&
        ReceiveMessage({
          id: message.messageServerId, // 服务端消息ID
          domain: message.attachment && message.attachment.raw, // 客户端自定义标识，用于去重和撤回定位
          content: message.text, // 消息文本内容
          time: parseInt(message.createTime), // 消息时间戳
          sender: message.senderId, // 发送者账号
          receiver: message.receiverId, // 接收者账号
          groupId: message.conversationType == 2 || message.conversationType == 3 ? message.receiverId : '', // 群聊/超级群聊的群ID
          conversationType: message.conversationType // 0 未知 1 单聊 2 群聊 3 超级群聊
        })
    })
  })
}

// ----------- 从 generateToken 响应中提取 token，兼容多种返回结构
// 纯文本 token / { data: token } / { Data: { Token: token } } 等嵌套结构
function extractToken(res) {
  if (!res) return ''
  if (typeof res === 'string') return res
  const data = res.data || res.Data || res // 剥掉外层包装
  if (typeof data === 'string') return data
  return data.token || data.Token || data.nimToken || data.NIMToken || ''
}

// ----------- 执行登录：初始化实例 -> 取 token -> SDK 登录
async function Login() {
  const user = getUser() // 当前登录用户
  if (!user || !user.UserID) {
    return
  }
  if (IM.state === EnumStatus.Connected) {
    return
  }
  SetState(EnumStatus.Connecting)
  try {
    const nim = ensureInstance() // SDK 实例
    const res = await generateToken() // 网易云信 token 响应
    const token = extractToken(res) // 登录 token
    if (!token) {
      throw new Error('获取 IM token 失败: ' + JSON.stringify(res))
    }
    const result = await nim.V2NIMLoginService.login(String(user.UserID), String(token))
    loginTimestamp = Date.now()
    SetState(EnumStatus.Connected)
    return result
  } catch (error) {
    console.error('[IM] 登录失败:', error)
    SetState(EnumStatus.DisConnect)
    throw error
  }
}

export class IMService {
  // ----------- 登录（幂等，并发调用共享同一个 Promise，失败后需 force 才会重试）
  static async login(force = false) {
    force && (LoginPromise = null)
    return LoginPromise || (LoginPromise = Login())
  }

  // ----------- 退出登录
  static async logout() {
    LoginPromise = null
    loginTimestamp = 0
    if (nimInstance) {
      try {
        await nimInstance.V2NIMLoginService.logout()
      } catch (e) {
        console.error('[IM] 退出登录失败:', e)
      }
    }
    SetState(EnumStatus.None)
  }

  // ----------- 注册接收消息回调（只有业务层 message.js 使用）
  static receive_message(fn) {
    ReceiveMessage = fn
  }

  // ----------- 订阅连接状态变化
  static state_change(fn) {
    if (StateChange.indexOf(fn) === -1) {
      StateChange.push(fn)
    }
  }

  // ----------- 当前连接状态
  static get state() {
    return IM.state
  }

  // ----------- 发送消息（未连接会先登录）
  // content 消息文本（协议格式 <m_img,..> 等），domain 客户端唯一标识，isGroup 是否群聊
  static async send(to, content, domain, isGroup) {
    if (IM.state !== EnumStatus.Connected) {
      await IMService.login()
    }
    const nim = ensureInstance() // SDK 实例
    const message = nim.V2NIMMessageCreator.createCustomMessage(content, domain || '') // 自定义消息，domain 放在附件 raw 里
    const conversationId = isGroup
      ? nim.V2NIMConversationIdUtil.teamConversationId(String(to)) // 群聊会话ID
      : nim.V2NIMConversationIdUtil.p2pConversationId(String(to)) // 单聊会话ID
    return await nim.V2NIMMessageService.sendMessage(message, conversationId)
  }
}
