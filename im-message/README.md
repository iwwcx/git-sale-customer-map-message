# im-message 实时消息模块说明文档

> 本文档详细说明本模块如何基于**网易云信 SDK（nim-web-sdk-ng）**实现消息的实时收发。
> 适合：维护本模块的开发、需要把模块迁移到其他 uniapp 项目的人、被问"这个功能怎么实现的"时的标准答案。

---

## 一、背景：为什么要接网易云信 SDK

### 原来的链路（纯接口，无实时性）

```
发消息：页面 → 调接口 /im/SaveRecordByClient → 存数据库
看消息：页面 → 调接口 /im/GetRecordList → 从数据库拉历史记录
```

问题：数据库没有"推送"能力。A 发了消息，B 的页面上什么都不会发生，
除非 B 手动刷新或重新进入页面。

### 接入 SDK 后的链路（双通道）

```
              ┌─→ 网易云信 SDK（长连接）→ 实时推给对方客户端
发消息：页面 ─┤
              └─→ 接口 /im/SaveRecordByClient → 存数据库（历史记录用）

收消息：网易云信长连接 → 实时推下来 → 页面立即上屏，无需刷新
```

**核心结论：SDK 负责"实时送达"，接口负责"服务端存档"，两条通道都要走。**

- 只靠接口：没有实时性
- 只靠 SDK：历史记录、会话列表没有数据来源（SDK 的服务端漫游消息是另一套体系，
  本项目历史记录一直存在自己的数据库里，保持原方案不变）

---

## 二、整体架构

模块分 4 层，所有代码都在 `im-message/` 目录内，不依赖项目其他文件：

```
┌─────────────────────────────────────────────────┐
│  页面层                                          │
│  pages/chat/detail.vue      （聊天详情页）        │
│  pages/message/index.vue    （会话列表页）        │
└──────────────┬──────────────────┬───────────────┘
               │ subscribe        │ subscribe
┌──────────────▼──────────────────▼───────────────┐
│  服务层 services/                                │
│  message.js  消息分发层（协议解析/去重/分发）      │
│  recent.js   会话列表层（未读数/置顶/最后一条）    │
└──────────────┬──────────────────────────────────┘
               │ receive_message / send
┌──────────────▼──────────────────────────────────┐
│  适配层 services/im.js                          │
│  唯一和 SDK 打交道的地方：登录/保活/收发           │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│  网易云信 SDK  nim-web-sdk-ng（长连接）           │
└─────────────────────────────────────────────────┘
```

**设计原则：只有 `im.js` 碰 SDK。** 上层拿到的都是处理好的普通 JS 对象，
以后如果要换 IM 厂商（腾讯云通信等），只需要重写 `im.js` 一个文件。

---

## 三、文件清单与职责

| 文件 | 职责 |
|---|---|
| `services/im.js` | SDK 适配层：登录、断线重连、消息拍平、发送 |
| `services/message.js` | 消息分发层：协议解析（撤回/已读）、去重、分发给聊天页 |
| `services/recent.js` | 会话列表层：置顶、未读数、清空未读、新会话创建 |
| `services/util.js` | 工具：guid / dateFormat / decodeHtml / getUser |
| `api/index.js` | 新增 3 个接口：generateToken / startChat / resetChat |
| `api/request.js` | 新增：非 JSON 响应直接放行（兼容纯文本返回） |
| `pages/chat/detail.vue` | 聊天页：订阅实时消息、发送走 SDK+接口双通道 |
| `pages/message/index.vue` | 会话列表页：订阅 RecentService 实时更新 |
| `package.json`（项目根目录） | 声明 `nim-web-sdk-ng` 依赖 |

---

## 四、SDK 连接层 `services/im.js` 详解

### 4.1 平台适配（条件编译）

网易云信官方没有"uniapp 通用版"，不同平台要引入不同的构建产物，
用 uniapp 的条件编译解决，编译时只保留当前平台的一份：

```js
// #ifdef MP
import NIM from 'nim-web-sdk-ng/dist/v2/NIM_MINIAPP_SDK'   // 小程序专用版
// #endif
// #ifdef APP-PLUS
import NIM from 'nim-web-sdk-ng/dist/v2/NIM_UNIAPP_SDK'    // App 专用版
// #endif
// #ifdef H5
import NIM from 'nim-web-sdk-ng'                           // H5 浏览器版
// #endif
```

### 4.2 登录流程（Login）

```
1. 从本地缓存 uni.getStorageSync('userInfo') 取 UserID 作为 IM 账号
2. 调后端接口 GET api80/im/generateToken 拿网易云信 token
3. NIM.getInstance({ appkey: '1cceec4b1cc4a4cf05e5fbda8d898ab2', apiVersion: 'v2' })
   创建 SDK 实例（全局单例，只创建一次）
4. nim.V2NIMLoginService.login(String(UserID), token) 建立长连接
5. 记录 loginTimestamp（用于过滤登录前的旧消息）
```

**token 的坑**：`/im/generateToken` 返回结构是 `{code:0, data:{token:"..."}}`，
token 藏在 `data.token` 里。`extractToken()` 函数做了递归提取，
兼容纯文本 / `{data: token}` / `{data:{token}}` 等多种结构。
之前直接取 `res.data` 得到的是对象，传给 SDK 变成 `[object Object]`，
报 `V2NIMError: invalid token`，排查了半天。

**并发控制**：`LoginPromise` 缓存登录 Promise，多个页面同时调用 `IMService.login()`
只执行一次真实登录。失败后**保留**缓存的 Promise，必须 `login(true)` 强制重试，
防止失败后疯狂重复请求（见 4.4 的坑）。

### 4.3 连接状态机

```js
EnumStatus = { Connecting:-1, None:0, Connected:1, Elsewhere:2, DisConnect:3 }
```

SDK 事件 → 状态映射：
- `onLoginStatus`：登录状态变化（0 未登录 1 已登录 2 登录中 3 重连等待）
- `onConnectStatus`：连接状态变化（0 断开 1 连接 2 连接中 3 重连中）
- `onKickedOffline`：被踢下线 → Elsewhere（不自动重连）

外部通过 `IMService.state_change(fn)` 订阅状态变化（recent.js 用它做重连补偿）。

### 4.4 断线重连（踩过的大坑）

**初版 bug**：登录失败后立即清掉 Promise 缓存并马上重连 → 登录一旦失败，
每秒产生一次 `generateToken` 请求，几分钟刷了 300+ 次请求（请求风暴）。

**修复后的策略（指数退避）**：

```
断开 → 5 秒后重连 → 再失败 10 秒 → 20 秒 → ... → 最长 2 分钟
连接成功 → 重置回 5 秒
同一时刻只有一个重连定时器
```

### 4.5 消息接收（拍平）

监听 `nim.V2NIMMessageService.on('onReceiveMessages')`，把 SDK 原始消息
拍平成统一格式再抛给 message.js：

```js
{
  id:      服务端消息ID,
  domain:  消息附件 raw（发送方塞进去的客户端唯一标识，用于去重和撤回定位）,
  content: 消息文本,
  time:    时间戳,
  sender:  发送者账号,
  receiver:接收者账号,
  groupId: 群聊时是群ID，单聊为空,
  conversationType: 0未知 1单聊 2群聊 3超级群
}
```

早于本次登录时间的消息直接丢弃（重连后 SDK 会补推旧消息）。

### 4.6 消息发送

```js
IMService.send(to, content, domain, isGroup)
```

1. 未连接先 `login()`
2. `V2NIMMessageCreator.createCustomMessage(content, domain)` 创建**自定义消息**
   —— 用自定义消息而不是文本消息，因为 domain 可以塞进附件 raw 里
3. `V2NIMConversationIdUtil.p2pConversationId(to)` / `teamConversationId(to)` 拼会话 ID
4. `V2NIMMessageService.sendMessage()` 发出

**所有消息都是自定义消息**，消息内容是协议文本（见第七节），
对方客户端收到后按协议解析展示——这是和 big 网页端/PC 端互通的前提。

---

## 五、消息分发层 `services/message.js` 详解

### 5.1 会话 key 规则

```
单聊：'20:对方UserID'    （Category.User = 20）
群聊：'52:群ID'         （Category.IMGroup = 52）
团队通知：'54:通知ID'    （Category.IMGroupNotice = 54）
```

聊天页按 key 订阅，只有本会话的消息会推给它。

### 5.2 收到消息后的处理顺序

```
1. <m_read 开头？ → 是：已读回执，通知聊天页标记已读，结束
2. 群系统通知（无内容+群类型）→ 忽略，结束
3. 计算会话 key（单聊取对方ID，群聊取群ID）
4. 自己多端同步的消息（sender=自己）→ 会话对象换成接收者，
   domain 是 {"raw":"xxx"} 格式时取 raw
5. Domain 去重（缓存每个会话最近 100 个 domain）→ 重复直接丢弃
6. 自己发给自己 → 丢弃
7. <m_revoke,domain>？ → 是：撤回事件，通知聊天页 + 列表页，结束
8. 普通消息 → decodeHtml 解码 → 组装成聊天页格式 → 分发
```

### 5.3 为什么必须 Domain 去重

多端登录（同一个账号同时登了小程序+PC）时，网易云信会给**每个端**都推一遍；
另外发送方自己也会收到自己发的消息（用于多端同步）。
没有去重的话一条消息会在页面上出现两三次。
Domain 是发送方生成的 uuid，全局唯一，天然适合做去重键。

### 5.4 分发的两个方向

- `notify(key, event)` → 聊天页订阅者（MessageService.subscribe 注册的）
- `RecentService.new_message(key, message)` → 会话列表层更新列表

事件类型：`message` 新消息 / `revoke` 撤回 / `read` 已读回执。

---

## 六、会话列表层 `services/recent.js` 详解

### 6.1 数据结构

内存里维护 `RecentList`，**结构和服务端 `/im/GetChatList` 返回完全一致**
（SessionCategoryID/SessionDataID/SessionName/SessionLogo/LastSendText/
LastSendTime/UnReadCount），页面可以直接渲染，不需要数据转换。

### 6.2 新消息进来（new_message）

```
找到会话？ → 找到：移到列表最前面
          → 没找到（陌生人首条消息）：本地创建占位项
            → 异步调 getSummary 补名称头像
            → 异步调 /im/StartChat 同步到服务端并回填会话ID
更新 LastSendText / LastSendTime / LastSendUserID / LastDomain
不是自己发的 && 不在当前聊天页 → UnReadCount +1
通知所有订阅者（消息列表页）
```

### 6.3 进入聊天页（read(key)）

```
UnReadCount 清零
单聊：给对方发 <m_read,会话key> 已读回执（对方聊天页会把消息标记为已读）
调 /im/ResetChat 同步服务端未读数
```

`setCurrentChat(key)` / `clearCurrentChat()` 标记当前正在聊天的会话，
这个会话来的新消息不累加未读数（人就在聊天页里看着呢）。

### 6.4 重连补偿

订阅 `im.js` 的连接状态：断线重连成功后，自动重新拉一次 `/im/GetChatList`，
把断线期间漏收的消息通过服务端数据补回来（SDK 不保证断线期间消息不丢）。

---

## 七、消息协议（和 big 网页端/PC 端互通的关键）

所有消息本质都是**文本协议**，双方客户端各自解析：

| 协议 | 格式 | 说明 |
|---|---|---|
| 文本 | 直接就是文本 | |
| 图片 | `<m_img,url:图片地址>` | |
| 语音 | `<m_audio,地址,时长秒>` | |
| 表情 | `<m_ico,表情key>` | |
| 链接 | `<m_link,url,title,logo,desc>` | 各字段 URL 编码 |
| 引用 | `<m_quote,作者,编码后的引用文本>回复内容</m_quote>` | |
| 撤回 | `<m_revoke,被撤回消息的domain>` | 双方都把原消息换成撤回提示 |
| 已读 | `<m_read,会话key>` | 单聊进入聊天页时发给对方 |

**撤回和已读没有接口**，就是靠这种自定义消息在双方客户端之间实时传递的。
服务端 `SaveRecordByClient` 只是原样存档文本。

---

## 八、页面接入

### 8.1 聊天页 `pages/chat/detail.vue`

**进入页面（onLoad）：**
```js
IMService.login()                              // 登录（幂等，已登录直接返回）
MessageService.subscribe(key, handler)         // 订阅本会话实时消息
RecentService.setCurrentChat(key)              // 标记当前聊天会话（不累未读）
RecentService.read(key)                        // 清未读 + 发已读回执
```

**收到实时消息（onRealtimeMessage）：**
- `message`：解析展示字段（图片/语音/链接/引用/撤回提示）→ push 到列表 → 滚到底部
- `revoke`：按 domain 找到原消息 → 换成"xx撤回了一条消息"
- `read`：把自己发的所有消息 IsRead 置 1

**发消息（sendToPeer，文本/图片/语音/撤回 4 处都接了）：**
```js
await this.sendToPeer(msgText, domain)   // 第一步：SDK 实时送达对方
await saveRecordByClient({...})          // 第二步：接口存档
```
任何一步失败，消息气泡标红可点击重发。

**离开页面（onUnload）：**
```js
MessageService.unsubscribe(key, handler)
RecentService.clearCurrentChat()
```

### 8.2 会话列表页 `pages/message/index.vue`

```js
onLoad: IMService.login() + RecentService.subscribe(handler)
onUnload: RecentService.unsubscribe(handler)
```

任何会话收到新消息 → `RecentService` 内部处理好置顶/未读/最后一条 →
通知页面 → 页面整体替换列表重新渲染。

---

## 九、接口层改动

`api/index.js` 新增：

| 接口 | 用途 |
|---|---|
| `GET api80/im/generateToken` | 获取网易云信登录 token（SDK 登录必需） |
| `POST api60/im/StartChat` | 新会话同步到服务端（陌生人首条消息时） |
| `POST api60/im/ResetChat` | 清空服务端未读数（进入聊天页时） |

`api/request.js` 改动：响应体不是 JSON 对象时（比如纯文本）直接 resolve，
不走业务 code 校验——防御性兼容，防止 token 类接口被误判为错误。

---

## 十、完整时序（背下来这两个就够应付提问了）

### 发一条消息

```
用户点发送
  → 本地气泡先上屏（状态：发送中）
  → SDK sendMessage（对方客户端秒收）
  → 接口 SaveRecordByClient（存数据库，供历史记录/会话列表使用）
  → 都成功：气泡标成功；任一失败：标红可重发
```

### 收一条消息

```
对方（任意端）发出消息
  → 网易云信服务端通过长连接推下来
  → im.js：拍平成统一格式
  → message.js：协议解析（撤回？已读？普通？）+ Domain 去重
  → 分两路：
      聊天页订阅者：正在聊天 → 直接上屏
      recent.js：会话置顶、未读+1、更新最后一条 → 列表页实时刷新
```

---

## 十一、踩过的坑清单（容易被追问）

1. **token 结构**：`generateToken` 返回 `{code:0, data:{token}}`，
   直接取 `data` 会得到对象 → `invalid token`。必须取 `data.token`。
2. **重连风暴**：登录失败不能立即重试。修复前一分钟刷几百次请求；
   修复后指数退避（5s→10s→20s→…→2min 封顶）。
3. **消息重复**：多端登录每个端都推一遍，发送方也会收到自己发的。
   必须靠 Domain 去重。
4. **SDK 版本**：不同平台要用不同构建产物（MINIAPP/UNIAPP/BROWSER），
   用条件编译引入，直接引浏览器版在小程序里会报错（依赖 window）。
5. **撤回/已读是消息协议不是接口**：靠 `<m_revoke>` `<m_read>` 自定义消息传递，
   两端客户端各自解析。
6. **小程序包体积**：`NIM_MINIAPP_SDK.js` 约 1MB，主包超 2MB 限制的话
   需要把 im-message 相关页面放进分包。

---

## 十二、迁移到其他 uniapp 项目

```
1. 整个 im-message/ 目录复制过去
2. npm i nim-web-sdk-ng
3. 确认项目本地缓存的用户信息键是 'userInfo' 且含 UserID 字段
   （不是的话改 services/util.js 的 getUser）
4. 确认 api/config.js 里有 api80 / api60 / profitapi 三个域名配置
5. 会话列表页参考 pages/message/index.vue 订阅 RecentService 即可
6. AppKey 写死在 services/im.js 顶部 NIM_APP_KEY，换项目注意改
```

---

## 十三、已知未实现的功能（后续需要时再加）

- 群聊收到陌生成员消息时，发送者头像/昵称用兜底图（big 里是 `SetUserInfo` 实时拉取）
- 断线期间的单条消息补偿（目前靠重连后整体拉会话列表补偿）
- 消息免打扰、会话置顶、删除会话
