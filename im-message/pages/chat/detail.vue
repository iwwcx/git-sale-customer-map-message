<template>
  <view class="chat-page">
    <!-- 消息列表区域 -->
    <scroll-view
      class="chat-content"
      scroll-y
      :scroll-into-view="scrollToId"
      :scroll-with-animation="true"
      @scrolltoupper="loadMore"
      @tap="onContentTap"
    >
      <!-- 加载更多提示 -->
      <view v-if="hasMore" class="load-more-tip">
        <text class="load-more-text">加载更多...</text>
      </view>

      <!-- 消息列表 -->
      <template v-for="(msg, index) in messageList">
        <!-- 时间分割线线 -->
        <view v-if="msg.ShowTime" :key="'time-' + index" class="time-divider">
          <text class="time-divider-text">{{ formatMsgTime(msg.MsgTime) }}</text>
        </view>

        <!-- 对方消息 -->
        <view :key="'msg-left-' + index" class="msg-row msg-row-left" v-if="msg.SendUserID !== myUserId">
          <image class="msg-avatar" :src="interlocutorLogo || defaultAvatar" mode="aspectFill" />
          <view class="msg-bubble msg-bubble-left" :class="{ 'msg-bubble-image': msg.MsgType === 2, 'msg-bubble-link': msg.MsgType === 21 }">
            <!-- ------------------ 图片 ---------------- -->
            <image v-if="msg.MsgType === 2" class="msg-image" :src="msg.LocalImage || msg.ImageUrl" mode="widthFix" @tap="previewImage(msg)" />
            <!-- ------------------ 语音 ---------------- -->
            <view v-else-if="msg.MsgType === 8" class="msg-audio" :class="{ playing: playingAudioId === msg.MsgID }" @tap.stop="toggleAudio(msg)">
              <view class="audio-wave"><text></text><text></text><text></text><text></text><text></text></view>
              <text class="audio-duration">{{ msg.AudioDuration }}″</text>
            </view>
            <!-- ------------------ 链接卡片 ---------------- -->
            <view v-else-if="msg.MsgType === 21" class="msg-link-card" @tap.stop="onLinkTap(msg)">
              <text class="link-card-header">分享链接</text>
              <view class="link-card-body">
                <image v-if="msg.LinkLogo" class="link-card-logo" :src="msg.LinkLogo" mode="aspectFill" />
                <view v-else class="link-card-logo-placeholder"><text>📦</text></view>
                <view class="link-card-info">
                  <text class="link-card-title">{{ msg.LinkTitle }}</text>
                  <text class="link-card-url">{{ msg.LinkUrl }}</text>
                </view>
              </view>
            </view>
            <!-- ------------------ 文本 ---------------- -->
            <text v-else class="msg-text">{{ msg.DisplayText }}</text>
          </view>
        </view>

        <!-- 自己消息 -->
        <view :key="'msg-right-' + index" class="msg-row msg-row-right" v-else>
          <view class="msg-bubble msg-bubble-right" :class="{ 'msg-bubble-image': msg.MsgType === 2, 'msg-bubble-link': msg.MsgType === 21 }">
            <!-- ------------------ 图片 ---------------- -->
            <image v-if="msg.MsgType === 2" class="msg-image" :src="msg.LocalImage || msg.ImageUrl" mode="widthFix" @tap="previewImage(msg)" />
            <!-- ------------------ 语音 ---------------- -->
            <view v-else-if="msg.MsgType === 8" class="msg-audio" :class="{ playing: playingAudioId === msg.MsgID }" @tap.stop="toggleAudio(msg)">
              <view class="audio-wave"><text></text><text></text><text></text><text></text><text></text></view>
              <text class="audio-duration">{{ msg.AudioDuration }}″</text>
            </view>
            <!-- ------------------ 链接卡片 ---------------- -->
            <view v-else-if="msg.MsgType === 21" class="msg-link-card" @tap.stop="onLinkTap(msg)">
              <text class="link-card-header">分享链接</text>
              <view class="link-card-body">
                <image v-if="msg.LinkLogo" class="link-card-logo" :src="msg.LinkLogo" mode="aspectFill" />
                <view v-else class="link-card-logo-placeholder"><text>📦</text></view>
                <view class="link-card-info">
                  <text class="link-card-title">{{ msg.LinkTitle }}</text>
                  <text class="link-card-url">{{ msg.LinkUrl }}</text>
                </view>
              </view>
            </view>
            <!-- ------------------ 文本 ---------------- -->
            <text v-else class="msg-text">{{ msg.DisplayText }}</text>
          </view>
          <image class="msg-avatar" :src="myAvatar" mode="aspectFill" />
        </view>
      </template>

      <!-- 底部占位 -->
      <view class="msg-bottom-anchor" id="msg-bottom"></view>
    </scroll-view>

    <!-- 底部输入框-->
    <view class="chat-footer footer-safe-bottom">
      <view class="footer-input-row">
        <!-- 语音和键盘切换按钮 -->
        <view class="footer-tool-btn" @tap="toggleVoiceMode">
          <view v-if="!isVoiceMode" class="icon-voice-switch">
            <view class="voice-switch-wave"><text></text><text></text><text></text></view>
          </view>
          <view v-else class="icon-keyboard">
            <text></text><text></text><text></text><text></text><text></text><text></text>
          </view>
        </view>

        <!-- 文本输入框 -->
        <input
          v-if="!isVoiceMode"
          class="footer-input"
          type="text"
          v-model="inputText"
          placeholder="输入消息"
          placeholder-class="footer-input-placeholder"
          confirm-type="send"
          :focus="isFocus"
          :adjust-position="true"
          @focus="onInputFocus"
          @blur="onInputBlur"
          @confirm="onSend"
        />

        <!-- 微信式按住说话按钮 -->
        <view
          v-else
          class="hold-talk-btn"
          :class="{ pressing: isVoicePressing, canceling: recordCancelHint }"
          @touchstart.stop.prevent="onVoiceTouchStart"
          @touchmove.stop.prevent="onVoiceTouchMove"
          @touchend.stop.prevent="onVoiceTouchEnd"
          @touchcancel.stop.prevent="onVoiceTouchCancel"
        >
          <text>{{ isVoicePressing ? (recordCancelHint ? '松开手指，取消发送' : '松开 发送') : '按住 说话' }}</text>
        </view>

        <!-- 表情按钮 -->
        <view class="footer-tool-btn" @tap="toggleEmotion">
          <view class="icon-smile-modern">
            <view class="smile-eye left"></view>
            <view class="smile-eye right"></view>
            <view class="smile-mouth"></view>
          </view>
        </view>

        <!-- 发送按钮或更多按钮 -->
        <view v-if="inputText.trim() && !isVoiceMode" class="footer-send-btn" @tap="onSend">
          <text class="footer-send-text">发送</text>
        </view>
        <view v-else class="footer-tool-btn" @tap="toggleMore">
          <view class="icon-plus-modern"><text></text><text></text></view>
        </view>
      </view>

      <!-- 更多操作面板 -->
      <view class="footer-panel" :class="{ 'panel-open': showMore }">
        <view class="panel-grid">
          <view class="panel-item" @tap="onPickImage('album')">
            <view class="panel-icon-wrap">
              <view class="icon-album">
                <view class="icon-album-rect"></view>
                <view class="icon-album-circle"></view>
              </view>
            </view>
            <text class="panel-label">相册</text>
          </view>
          <view class="panel-item" @tap="onPickImage('camera')">
            <view class="panel-icon-wrap">
              <view class="icon-camera">
                <view class="icon-camera-body"></view>
                <view class="icon-camera-lens"></view>
              </view>
            </view>
            <text class="panel-label">拍照</text>
          </view>
          <view class="panel-item" @tap="onPickFile">
            <view class="panel-icon-wrap">
              <view class="icon-file">
                <view class="icon-file-body"></view>
                <view class="icon-file-corner"></view>
                <view class="icon-file-line top"></view>
                <view class="icon-file-line mid"></view>
                <view class="icon-file-line bot"></view>
              </view>
            </view>
            <text class="panel-label">文件</text>
          </view>
          <view class="panel-item" @tap="onSendProduct">
            <view class="panel-icon-wrap">
              <view class="icon-product">
                <view class="icon-product-tag"></view>
                <view class="icon-product-line top"></view>
                <view class="icon-product-line mid"></view>
                <view class="icon-product-line bot"></view>
              </view>
            </view>
            <text class="panel-label">发产品</text>
          </view>
        </view>
      </view>

      <!-- 表情面板 -->
      <view class="footer-panel emotion-panel" :class="{ 'panel-open': showEmotion }">
        <scroll-view class="emotion-scroll" scroll-y>
          <view class="emotion-grid">
            <view
              class="emotion-item"
              v-for="emo in emotionList"
              :key="emo"
              @tap="onEmotionTap(emo)"
            >
              <text class="emotion-text">{{ emo }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 微信式录音状态浮层 -->
    <view v-if="isRecording" class="record-mask" :class="{ canceling: recordCancelHint }">
      <view class="record-card">
        <view class="record-wave"><text></text><text></text><text></text><text></text><text></text></view>
        <text class="record-title">{{ recordCancelHint ? '松开手指，取消发送' : '正在录音 ' + recordSeconds + '″' }}</text>
        <text class="record-tip">{{ recordCancelHint ? '手指移回下方可继续录音' : '上滑取消，松开发送' }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getRecordList, saveRecordByClient } from '../../api/index.js'
import request from '../../api/request.js'
import { formatProductImage } from '../../libs/image.js'

export default {
  data() {
    return {
      interlocutorKey: '',  // 会话标识 "CategoryId:DataId"
      categoryId: '',  // 会话类型ID
      dataId: '',  // 对方ID
      interlocutorName: '',  // 会话名称
      interlocutorLogo: '',  // 会话头像
      defaultAvatar: 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png',  // 默认头像
      myAvatar: 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png',  // 我的头像（静态占位）
      myUserId: '',  // 当前用户ID
      messageList: [],  // 消息列表
      inputText: '',  // 输入内容
      isFocus: false,  // 输入框聚焦状态
      showMore: false,  // 显示更多面板
      showEmotion: false,  // 显示表情面板
      hasMore: false,  // 是否有更多历史消息
      loading: false,  // 加载中状态
      scrollToId: 'msg-bottom',  // 滚动目标
      isVoiceMode: false,  // 是否切换到按住说话模式
      isVoicePressing: false,  // 是否正在按住语音按钮
      recordCancelHint: false,  // 当前松手是否需要取消发送
      recordStartY: 0,  // 按下语音按钮时的纵向坐标
      isRecording: false,  // 是否正在录音
      recordSeconds: 0,  // 当前录音秒数
      playingAudioId: '',  // 当前播放中的语音消息ID
      emotionList: [
        '😀', '😄', '😁', '😆', '😂', '🤣', '😏', '😅', '🥲', '☺️', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', 
        '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', 
        '🥱', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
        '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', 
        '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
        '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', 
        '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'
      ]  // 表情列表
    }
  },
  onLoad(options) {
    // 从路由参数中解构出会话标识、对方名称、对方头像（跳转时做了 encodeURIComponent 编码，这里解码还原）
    const { key, name, logo } = options
    this.interlocutorKey = decodeURIComponent(key || '')  // 会话标识，格式 "CategoryId:DataId"
    this.interlocutorName = decodeURIComponent(name || '')  // 对方昵称，用于导航栏标题
    this.interlocutorLogo = decodeURIComponent(logo || '')  // 对方头像URL
    // 设置导航栏标题为对方名称，没有则默认显示"聊天"
    uni.setNavigationBarTitle({ title: this.interlocutorName || '聊天' })

    // 解析 key 获取 categoryId 和 dataId
    const parts = this.interlocutorKey.split(':')
    this.categoryId = parts[0] || ''
    this.dataId = parts[1] || ''

    // 获取当前用户ID
    const userInfo = uni.getStorageSync('userInfo') || {}
    this.myUserId = String(userInfo.UserID || '')

    // 加载聊天记录
    this.loadMessages()
  },
  onUnload() {
    // 离开聊天页时清理录音计时器，避免计时器继续运行
    if (this._recordTimer) clearInterval(this._recordTimer)
    // 还在录音时按取消处理，防止离开页面后自动发送
    if (this._recorderManager && this.isRecording) {
      this._cancelRecording = true
      this._recorderManager.stop()
    }
    // 销毁语音播放器，释放系统音频资源
    if (this._audioContext) this._audioContext.destroy()
  },
  methods: {
    // ----------- 点击消息区域，收起所有面板和键盘
    onContentTap() {
      if (this.showMore || this.showEmotion) {
        this.showMore = false
        this.showEmotion = false
      }
      if (this.isFocus) {
        uni.hideKeyboard()
      }
    },

    // ----------- 加载聊天记录
    async loadMessages() {
      if (!this.categoryId || !this.dataId) return
      this.loading = true
      try {
        const res = await getRecordList({
          categoryId: this.categoryId,
          dataId: this.dataId,
          msgId: 0,
          pageSize: 15
        })
        // 兼容两种返回格式
        const list = res.List || (res.Data && res.Data.List) || []
        const hasMore = res.HasMore !== undefined ? res.HasMore : (res.Data && res.Data.HasMore) || false

        // 接口返回的是倒序（最新在前），需要反转为正序（最早在前）
        list.reverse()

        // 处理消息：解码HTML实体、设置时间显示、解析消息文本
        this.processMessages(list)

        this.messageList = list
        this.hasMore = hasMore

        // 滚动到底部
        this.$nextTick(() => {
          this.scrollToId = ''
          this.$nextTick(() => {
            this.scrollToId = 'msg-bottom'
          })
        })
      } catch (e) {
        console.error('加载聊天记录失败:', e)
      } finally {
        this.loading = false
      }
    },

    // ----------- 加载更多历史消息
    async loadMore() {
      if (!this.hasMore || this.loading || this.messageList.length === 0) return
      this.loading = true
      try {
        // 取当前最早的消息ID作为游标
        const firstMsg = this.messageList[0]
        const msgId = -parseInt(String(firstMsg.MsgID)) || 0

        const res = await getRecordList({
          categoryId: this.categoryId,
          dataId: this.dataId,
          msgId: msgId,
          pageSize: 15
        })
        const list = res.List || (res.Data && res.Data.List) || []
        const hasMore = res.HasMore !== undefined ? res.HasMore : (res.Data && res.Data.HasMore) || false

        // 历史消息也是倒序返回，反转为正序
        list.reverse()
        this.processMessages(list)

        // 插入到列表头部
        this.messageList.unshift(...list)
        this.hasMore = hasMore
      } catch (e) {
        console.error('加载更多失败:', e)
      } finally {
        this.loading = false
      }
    },

    // ----------- 处理消息列表：解码HTML实体、设置时间显示标记、解析显示文本
    processMessages(messages) {
      let lastTime = ''
      messages.forEach((msg) => {
        // 解码 HTML 实体
        if (msg.MsgText) {
          msg.MsgText = msg.MsgText
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
        }
        // 解析图片消息的线上地址，兼容参考项目的 <m_img,url:地址> 格式
        const imageMatch = String(msg.MsgText || '').match(/<m_img,(?:url:)?([^>]+)>/i)  // 图片消息匹配结果
        if (imageMatch) {
          msg.MsgType = 2
          msg.ImageUrl = imageMatch[1].split(',')[0]
        }
        // 解析语音消息，格式为 <m_audio,bucket/key,时长>
        const audioMatch = String(msg.MsgText || '').match(/<m_audio,([^,>]+),([^>]+)>/i)  // 语音消息匹配结果
        if (audioMatch) {
          msg.MsgType = 8
          msg.AudioPath = audioMatch[1]
          msg.AudioDuration = Math.max(1, Math.ceil(Number(audioMatch[2]) || 1))
        }
        // 解析链接消息，格式为 <m_link,url,title,logo,desc>
        const linkMatch = String(msg.MsgText || '').match(/<m_link,([^,>]*),([^,>]*),([^,>]*),([^>]*)>/i)  // 链接消息匹配结果
        if (linkMatch) {
          msg.MsgType = 21
          msg.LinkUrl = decodeURIComponent(linkMatch[1] || '')  // 链接地址
          msg.LinkTitle = decodeURIComponent(linkMatch[2] || '')  // 链接标题
          msg.LinkLogo = formatProductImage(decodeURIComponent(linkMatch[3] || ''))  // 链接图片
        }
        // 解析显示文本（将特殊消息标签转为可读文字）
        msg.DisplayText = this.parseDisplayText(msg.MsgText)
        // 时间显示：首条消息或与上一条间隔超过1分钟时显示
        if (msg.MsgTime && (!lastTime || this.timeDiffMinutes(msg.MsgTime, lastTime) >= 1)) {
          msg.ShowTime = true
        }
        lastTime = msg.MsgTime
      })
    },

    // ----------- 解析消息文本为可读内
    parseDisplayText(text) {
      if (!text) return ''
      // 纯文本消息直接返
      if (!/^<m_/.test(text)) return text
      // 特殊消息类型转为占位文字
      return text
        .replace(/<m_ico,[^>]*>/g, '[表情]')
        .replace(/<m_img,[^>]*>/g, '[图片]')
        .replace(/<m_file,[^>]*>/g, '[文件]')
        .replace(/<m_audio,[^>]*>/g, '[语音]')
        .replace(/<m_video,[^>]*>/g, '[视频]')
        .replace(/<m_link,[^>]*>/g, '[链接]')
        .replace(/<m_data,[^>]*>/g, '[分享]')
        .replace(/<m_quote,[^>]*>/g, '[引用消息]')
        .replace(/<m_tip,[^>]*>/g, '')
        .replace(/<m_shake>/g, '[窗口抖动]')
        .replace(/<m_revoke,[^>]*>/g, '[撤回了一条消息]')
    },

    // ----------- 计算两个时间相差的分钟数
    timeDiffMinutes(time1, time2) {
      const d1 = new Date(time1).getTime()
      const d2 = new Date(time2).getTime()
      return Math.abs(d1 - d2) / (1000 * 60)
    },

    // ----------- 格式化消息时间显示
    formatMsgTime(timeStr) {
      if (!timeStr) return ''
      const msgDate = new Date(timeStr)
      const now = new Date()
      const nowZero = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const msgZero = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate())
      const diffDay = Math.floor((nowZero - msgZero) / (1000 * 60 * 60 * 24))
      const pad = n => (n < 10 ? '0' + n : n)
      const hms = pad(msgDate.getHours()) + ':' + pad(msgDate.getMinutes())
      if (diffDay === 0) return hms
      if (diffDay === 1) return '昨天 ' + hms
      if (diffDay < 7) {
        const weekArr = ['日', '一', '二', '三', '四', '五', '六']
        return '星期' + weekArr[msgDate.getDay()] + ' ' + hms
      }
      return pad(msgDate.getMonth() + 1) + '-' + pad(msgDate.getDate()) + ' ' + hms
    },

    // ----------- 发送消息
    async onSend() {
      const text = this.inputText.trim()
      if (!text) return
      // 生成消息唯一标识
      const domain = this.generateGuid()
      // 本地先插入消息
      const msg = {
        MsgID: domain,
        MsgText: text,
        DisplayText: text,
        MsgTime: this.formatNow(),
        SendUserID: this.myUserId,
        Domain: domain,
        IsMe: true,
        State: -1
      }
      this.messageList.push(msg)
      this.inputText = ''
      this.scrollToBottom()
      // 调用接口发送
      try {
        await saveRecordByClient({
          RecvDataID: this.dataId,
          SessionCategoryID: this.categoryId,
          MsgText: text,
          Domain: domain
        })
        msg.State = 1
      } catch (e) {
        console.error('发送消息失败:', e)
        msg.State = 0
        uni.showToast({ title: '发送失败', icon: 'none' })
      }
    },

    // ----------- 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollToId = ''
        this.$nextTick(() => {
          this.scrollToId = 'msg-bottom'
        })
      })
    },

    // ----------- 生成 GUID
    generateGuid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },

    // ----------- 格式化当前时间
    formatNow() {
      const d = new Date()
      const pad = n => (n < 10 ? '0' + n : n)
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds())
    },

    // ----------- 输入框聚焦
    onInputFocus() {
      this.isFocus = true
      this.isVoiceMode = false
      this.showMore = false
      this.showEmotion = false
    },

    // ----------- 输入框失焦
    onInputBlur() {
      this.isFocus = false
    },

    // ----------- 切换语音和键盘输入模式
    toggleVoiceMode() {
      this.isVoiceMode = !this.isVoiceMode
      this.showMore = false
      this.showEmotion = false
      this.isVoicePressing = false
      this.recordCancelHint = false
      // 切到语音模式时收起键盘，切回文本模式时自动聚焦输入框
      if (this.isVoiceMode) {
        this.isFocus = false
        uni.hideKeyboard()
        return
      }
      this.$nextTick(() => {
        this.isFocus = true
      })
    },

    // ----------- 按下语音按钮开始录音
    onVoiceTouchStart(event) {
      const touch = event.touches && event.touches[0]  // 当前按下位置
      this.recordStartY = touch ? touch.clientY : 0
      this.recordCancelHint = false
      this.isVoicePressing = true
      this.startRecording()
    },

    // ----------- 按住语音按钮移动，判断是否上滑取消
    onVoiceTouchMove(event) {
      const touch = event.touches && event.touches[0]  // 当前手指位置
      if (!touch || !this.recordStartY) return
      this.recordCancelHint = this.recordStartY - touch.clientY > 70
    },

    // ----------- 松开语音按钮，根据滑动状态发送或取消
    onVoiceTouchEnd() {
      const cancelled = this.recordCancelHint  // 松开时是否处于取消区域
      this.isVoicePressing = false
      this.stopRecording(cancelled)
      this.recordCancelHint = false
    },

    // ----------- 系统打断触摸时取消本次录音
    onVoiceTouchCancel() {
      this.isVoicePressing = false
      this.recordCancelHint = false
      this.stopRecording(true)
    },

    // ----------- 切换表情面板
    toggleEmotion() {
      // 如果当前键盘弹起，先收键盘再展示面板，避免跳动
      if (this.isFocus) {
        this.isFocus = false
        uni.hideKeyboard()
      }
      this.isVoiceMode = false
      this.showEmotion = !this.showEmotion
      this.showMore = false
    },

    // ----------- 切换更多面板
    toggleMore() {
      // 如果当前键盘弹起，先收键盘再展示面板，避免跳动
      if (this.isFocus) {
        this.isFocus = false
        uni.hideKeyboard()
      }
      this.showMore = !this.showMore
      this.showEmotion = false
    },

    // ----------- 选择表情
    onEmotionTap(emo) {
      // 将表情追加到输入框，由用户自己决定是否发送
      this.inputText += emo
    },

    // ----------- 选择并发送图片
    onPickImage(source) {
      uni.chooseImage({
        count: 9,
        sizeType: ['original', 'compressed'],
        sourceType: [source],
        success: async (res) => {
          const paths = res.tempFilePaths || []  // 用户选中的图片临时路径
          this.showMore = false
          for (const path of paths) {
            await this.sendLocalImage(path)
          }
        },
        fail: (error) => {
          if (!String(error.errMsg || '').includes('cancel')) {
            uni.showToast({ title: '选择图片失败', icon: 'none' })
          }
        }
      })
    },

    // ----------- 上传并发送本地图片
    async sendLocalImage(filePath) {
      const domain = this.generateGuid()  // 本次图片消息唯一标识
      const msg = {
        MsgID: domain,
        MsgType: 2,
        MsgText: '<m_img,local:' + filePath + '>',
        DisplayText: '[图片]',
        LocalImage: filePath,
        MsgTime: this.formatNow(),
        SendUserID: this.myUserId,
        Domain: domain,
        IsMe: true,
        State: -1
      }  // 先插入列表展示的本地图片消息
      this.messageList.push(msg)
      this.scrollToBottom()
      try {
        uni.showLoading({ title: '正在发送中...', mask: true })
        const contentType = this.getImageContentType(filePath)  // 当前图片类型
        const fileKey = await this.getImageKey(filePath)  // OBS 文件唯一 key
        const signatureRes = await request({
          url: '/obs/putUrlSignature',
          method: 'post',
          params: { category: 50, key: fileKey, priv: false },
          apiKey: 'profitapi'
        })  // OBS 临时凭证响应
        const signature = signatureRes.data || signatureRes.Data || signatureRes  // 兼容接口不同响应层级
        const options = signature.options || signature.Options  // OBS 上传参数
        const credential = signature.credential || signature.Credential  // OBS 临时访问凭证
        if (!options || !credential) throw new Error('OBS上传凭证无效')
        await this.uploadImageToObs(filePath, contentType, options, credential)
        const displayDomain = String(options.displayDomain || '').replace(/\/$/, '')  // 图片公开访问域名
        if (!displayDomain) throw new Error('图片访问地址无效')
        const imageUrl = displayDomain + '/' + options.key  // 图片最终公开地址
        const msgText = '<m_img,url:' + imageUrl + '>'  // 与参考项目一致的图片消息格式
        await saveRecordByClient({
          RecvDataID: this.dataId,
          SessionCategoryID: this.categoryId,
          MsgText: msgText,
          Domain: domain
        })
        msg.MsgText = msgText
        msg.ImageUrl = imageUrl
        msg.State = 1
      } catch (error) {
        console.error('发送图片失败:', error)
        msg.State = 0
        uni.showToast({ title: error.message || '发送图片失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },

    // ----------- 根据运行端上传图片到 OBS
    async uploadImageToObs(filePath, contentType, options, credential) {
      // #ifdef H5
      const response = await fetch(filePath)  // H5 本地图片响应
      if (!response.ok) throw new Error('读取图片失败')
      const blob = await response.blob()  // H5 图片二进制数据
      const ObsClientClass = await this.loadObsClient()  // 华为云 OBS 浏览器客户端
      const obsClient = new ObsClientClass({
        access_key_id: credential.access,
        secret_access_key: credential.secret,
        security_token: credential.securitytoken,
        server: 'https://' + options.domain
      })  // 当前图片使用的 OBS 客户端
      const uploadRes = await obsClient.putObject({
        Bucket: options.bucket,
        Key: options.key,
        Body: blob,
        ContentType: blob.type || contentType
      })  // OBS 上传结果
      if (uploadRes.CommonMsg && uploadRes.CommonMsg.Status >= 300) {
        throw new Error(uploadRes.CommonMsg.Message || 'OBS上传失败')
      }
      // #endif
      // #ifndef H5
      await this.uploadImageByForm(filePath, contentType, options, credential)
      // #endif
    },

    // ----------- 小程序通过 POST 表单上传图片到 OBS
    uploadImageByForm(filePath, contentType, options, credential) {
      const bucket = options.bucket  // OBS 桶名称
      const key = options.key  // OBS 文件路径
      const token = credential.securitytoken  // OBS 临时安全令牌
      const expiration = new Date(Date.now() + 10 * 60 * 1000).toISOString()  // 上传凭证过期时间
      const conditions = [
        { bucket },
        { key },
        { 'content-type': contentType },
        { 'x-obs-security-token': token }
      ]  // OBS 上传限制条件
      const policyText = JSON.stringify({ expiration, conditions })  // OBS 原始 Policy
      const policy = this.bytesToBase64(this.utf8ToBytes(policyText))  // Base64 编码后的 Policy
      const signatureBytes = this.hmacSha1(this.utf8ToBytes(policy), this.utf8ToBytes(credential.secret))  // Policy 签名结果
      const signature = this.bytesToBase64(signatureBytes)  // OBS 表单签名
      const domain = String(options.domain || '').replace(/^https?:\/\//, '').replace(/\/$/, '')  // OBS 服务域名
      const uploadDomain = domain.indexOf(bucket + '.') === 0 ? domain : bucket + '.' + domain  // OBS 桶上传域名
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: 'https://' + uploadDomain,
          filePath,
          name: 'file',
          formData: {
            key,
            AccessKeyId: credential.access,
            policy,
            signature,
            'content-type': contentType,
            'x-obs-security-token': token
          },
          success: (res) => {
            if ([200, 201, 204].includes(Number(res.statusCode))) {
              resolve(res)
              return
            }
            reject(new Error('OBS上传失败，状态码：' + res.statusCode + (res.data ? '，' + res.data : '')))
          },
          fail: reject
        })
      })
    },

    // ----------- 字符串转 UTF-8 字节数组
    utf8ToBytes(value) {
      const text = unescape(encodeURIComponent(String(value)))  // UTF-8 二进制字符串
      const bytes = []  // UTF-8 字节数组
      for (let index = 0; index < text.length; index++) {
        bytes.push(text.charCodeAt(index))
      }
      return bytes
    },

    // ----------- 字节数组转 Base64
    bytesToBase64(bytes) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'  // Base64 字符表
      let result = ''  // Base64 编码结果
      for (let index = 0; index < bytes.length; index += 3) {
        const first = bytes[index]  // 第一个字节
        const second = index + 1 < bytes.length ? bytes[index + 1] : 0  // 第二个字节
        const third = index + 2 < bytes.length ? bytes[index + 2] : 0  // 第三个字节
        const value = (first << 16) | (second << 8) | third  // 三字节组合值
        result += chars[(value >>> 18) & 63]
        result += chars[(value >>> 12) & 63]
        result += index + 1 < bytes.length ? chars[(value >>> 6) & 63] : '='
        result += index + 2 < bytes.length ? chars[value & 63] : '='
      }
      return result
    },

    // ----------- 计算 HMAC-SHA1
    hmacSha1(messageBytes, keyBytes) {
      let key = keyBytes.slice()  // HMAC 使用的密钥字节
      if (key.length > 64) key = this.sha1(key)
      while (key.length < 64) key.push(0)
      const innerKey = key.map(item => item ^ 0x36)  // HMAC 内层密钥
      const outerKey = key.map(item => item ^ 0x5c)  // HMAC 外层密钥
      return this.sha1(outerKey.concat(this.sha1(innerKey.concat(messageBytes))))
    },

    // ----------- 计算 SHA1 字节摘要
    sha1(bytes) {
      const words = []  // SHA1 原始数据块
      const bitLength = bytes.length * 8  // 原始数据位数
      for (let index = 0; index < bytes.length; index++) {
        words[index >> 2] = (words[index >> 2] || 0) | (bytes[index] << (24 - (index % 4) * 8))
      }
      words[bitLength >> 5] = (words[bitLength >> 5] || 0) | (0x80 << (24 - bitLength % 32))
      words[((bitLength + 64 >> 9) << 4) + 15] = bitLength
      let h0 = 0x67452301  // SHA1 摘要分量一
      let h1 = 0xefcdab89  // SHA1 摘要分量二
      let h2 = 0x98badcfe  // SHA1 摘要分量三
      let h3 = 0x10325476  // SHA1 摘要分量四
      let h4 = 0xc3d2e1f0  // SHA1 摘要分量五
      for (let offset = 0; offset < words.length; offset += 16) {
        const block = []  // 当前 SHA1 扩展数据块
        let a = h0  // 当前轮分量一
        let b = h1  // 当前轮分量二
        let c = h2  // 当前轮分量三
        let d = h3  // 当前轮分量四
        let e = h4  // 当前轮分量五
        for (let round = 0; round < 80; round++) {
          if (round < 16) {
            block[round] = words[offset + round] || 0
          } else {
            const value = block[round - 3] ^ block[round - 8] ^ block[round - 14] ^ block[round - 16]  // 扩展块临时值
            block[round] = (value << 1) | (value >>> 31)
          }
          let logic = 0  // 当前轮逻辑运算结果
          let constant = 0  // 当前轮常量
          if (round < 20) {
            logic = (b & c) | (~b & d)
            constant = 0x5a827999
          } else if (round < 40) {
            logic = b ^ c ^ d
            constant = 0x6ed9eba1
          } else if (round < 60) {
            logic = (b & c) | (b & d) | (c & d)
            constant = 0x8f1bbcdc
          } else {
            logic = b ^ c ^ d
            constant = 0xca62c1d6
          }
          const temp = ((((a << 5) | (a >>> 27)) + logic + e + constant + block[round]) | 0)  // 当前轮计算结果
          e = d
          d = c
          c = (b << 30) | (b >>> 2)
          b = a
          a = temp
        }
        h0 = (h0 + a) | 0
        h1 = (h1 + b) | 0
        h2 = (h2 + c) | 0
        h3 = (h3 + d) | 0
        h4 = (h4 + e) | 0
      }
      const result = []  // SHA1 最终字节摘要
      ;[h0, h1, h2, h3, h4].forEach((value) => {
        result.push((value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255)
      })
      return result
    },

    // ----------- 获取图片上传 key
    getImageKey(filePath) {
      return new Promise((resolve) => {
        const fallbackKey = this.generateGuid().replace(/-/g, '')  // 不支持文件摘要时使用的随机 key
        if (typeof uni.getFileInfo !== 'function') {
          resolve(fallbackKey)
          return
        }
        uni.getFileInfo({
          filePath,
          digestAlgorithm: 'md5',
          success: (res) => resolve(res.digest || fallbackKey),
          fail: () => resolve(fallbackKey)
        })
      })
    },

    // ----------- 加载华为云 OBS 浏览器 SDK
    loadObsClient() {
      const globalObsClient = typeof globalThis !== 'undefined' ? globalThis.ObsClient : null  // 页面已经加载的 OBS 客户端
      if (globalObsClient) return Promise.resolve(globalObsClient)
      // #ifdef H5
      return new Promise((resolve, reject) => {
        const oldScript = document.getElementById('huawei-obs-sdk')  // 页面中已存在的 SDK 标签
        if (oldScript) {
          oldScript.addEventListener('load', () => resolve(window.ObsClient), { once: true })
          oldScript.addEventListener('error', () => reject(new Error('OBS SDK加载失败')), { once: true })
          return
        }
        const script = document.createElement('script')  // 动态加载的 OBS SDK 标签
        script.id = 'huawei-obs-sdk'
        script.src = 'https://unpkg.com/esdk-obs-browserjs@3.24.3/dist/esdk-obs-browserjs.3.24.3.min.js'
        script.onload = () => window.ObsClient ? resolve(window.ObsClient) : reject(new Error('OBS SDK加载失败'))
        script.onerror = () => reject(new Error('OBS SDK加载失败'))
        document.head.appendChild(script)
      })
      // #endif
    },

    // ----------- 获取图片 ContentType
    getImageContentType(filePath) {
      const ext = String(filePath).split(/[?#]/)[0].split('.').pop().toLowerCase()  // 图片文件后缀
      const types = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        bmp: 'image/bmp',
        webp: 'image/webp'
      }  // 图片后缀与 ContentType 对照表
      return types[ext] || 'image/jpeg'
    },

    // ----------- 预览图片
    previewImage(msg) {
      const urls = this.messageList.filter(item => item.MsgType === 2).map(item => item.LocalImage || item.ImageUrl).filter(Boolean)  // 当前会话全部图片地址
      const current = msg.LocalImage || msg.ImageUrl  // 当前点击的图片地址
      uni.previewImage({ current, urls })
    },

    // ----------- 获取录音权限
    ensureRecordPermission() {
      // #ifdef MP-WEIXIN
      // 微信小程序录音前需要先申请麦克风权限
      return new Promise((resolve, reject) => {
        uni.authorize({
          scope: 'scope.record',
          success: resolve,
          fail: () => {
            // 用户拒绝授权时，引导用户前往小程序设置手动开启
            uni.showModal({
              title: '需要麦克风权限',
              content: '请在设置中允许使用麦克风后再发送语音',
              confirmText: '去设置',
              success: (res) => {
                if (res.confirm) uni.openSetting()
              }
            })
            reject(new Error('未获得麦克风权限'))
          }
        })
      })
      // #endif
      // #ifndef MP-WEIXIN
      // 其他运行端交给系统在真正录音时处理权限
      return Promise.resolve()
      // #endif
    },

    // ----------- 开始录音
    async startRecording() {
      // 已经处于录音状态时不重复创建录音任务
      if (this.isRecording) return
      try {
        // 先拿到麦克风权限，首次授权期间如果已经松手则不再启动录音
        await this.ensureRecordPermission()
        if (!this.isVoicePressing) return
        if (typeof uni.getRecorderManager !== 'function') throw new Error('当前运行端不支持录音')
        // 开始录音前停止正在播放的语音，避免录进去播放声音
        if (this._audioContext) {
          this._audioContext.stop()
          this.playingAudioId = ''
        }
        const recorderManager = uni.getRecorderManager()  // uni-app 全局录音管理器
        this._recorderManager = recorderManager
        this._cancelRecording = false
        // 录音管理器是全局单例，先移除旧监听，避免第二次录音重复发送
        if (typeof recorderManager.offStart === 'function') recorderManager.offStart()
        if (typeof recorderManager.offStop === 'function') recorderManager.offStop()
        if (typeof recorderManager.offError === 'function') recorderManager.offError()
        // 系统真正开始录音后显示录音浮层，并启动秒数计时
        recorderManager.onStart(() => {
          // 录音真正启动前已经松手时立即取消，避免首次授权后意外录音
          if (!this.isVoicePressing) {
            this._cancelRecording = true
            recorderManager.stop()
            return
          }
          this.isRecording = true
          this.recordSeconds = 0
          this.showMore = false
          this._recordTimer = setInterval(() => {
            this.recordSeconds = Math.min(60, this.recordSeconds + 1)
          }, 1000)
        })
        // 停止录音后清理状态，再根据取消状态决定是否上传
        recorderManager.onStop(async (res) => {
          if (this._recordTimer) clearInterval(this._recordTimer)
          this._recordTimer = null
          this.isRecording = false
          this.isVoicePressing = false
          const cancelled = this._cancelRecording  // 本次录音是否被用户取消
          this._cancelRecording = false
          // 用户点了取消时直接结束，不上传也不发送消息
          if (cancelled) return
          const duration = Math.max(1, Math.ceil(Number(res.duration || 0) / 1000))  // 录音时长，单位秒
          // 没有临时文件或录音不足一秒时，不发送无效语音
          if (!res.tempFilePath || Number(res.duration || 0) < 1000) {
            uni.showToast({ title: '录音时间太短', icon: 'none' })
            return
          }
          // 录音有效时，将临时 MP3 文件上传并发送给对方
          await this.sendAudioMessage(res.tempFilePath, duration)
        })
        // 录音异常时关闭浮层并清理计时器
        recorderManager.onError((error) => {
          if (this._recordTimer) clearInterval(this._recordTimer)
          this._recordTimer = null
          this.isRecording = false
          console.error('录音失败:', error)
          uni.showToast({ title: '录音失败', icon: 'none' })
        })
        // 使用适合聊天语音的单声道 MP3 参数，最长录制 60 秒
        recorderManager.start({
          duration: 60000,
          sampleRate: 16000,
          numberOfChannels: 1,
          encodeBitRate: 48000,
          format: 'mp3'
        })
      } catch (error) {
        console.error('开始录音失败:', error)
      }
    },

    // ----------- 停止或取消录音
    stopRecording(cancelled) {
      // 先保存用户是取消还是发送，录音稍后启动时也能正确识别取消状态
      this._cancelRecording = cancelled
      // 录音管理器不存在或当前没有录音时，不执行停止操作
      if (!this._recorderManager || !this.isRecording) return
      this._recorderManager.stop()
    },

    // ----------- 上传并发送语音消息
    async sendAudioMessage(filePath, duration) {
      const domain = this.generateGuid()  // 本次语音消息唯一标识
      const msg = {
        MsgID: domain,
        MsgType: 8,
        MsgText: '<m_audio,local:' + filePath + '>',
        DisplayText: '[语音]',
        LocalAudio: filePath,
        AudioDuration: duration,
        MsgTime: this.formatNow(),
        SendUserID: this.myUserId,
        Domain: domain,
        IsMe: true,
        State: -1
      }  // 先插入聊天列表的本地语音消息
      // 先展示本地语音气泡，让用户不用等待上传完成
      this.messageList.push(msg)
      this.scrollToBottom()
      try {
        uni.showLoading({ title: '正在发送中...', mask: true })
        const fileKey = await this.getImageKey(filePath)  // 语音文件上传 key
        const signatureRes = await request({
          url: '/obs/putUrlSignature',
          method: 'post',
          params: { category: 50, key: fileKey, priv: false },
          apiKey: 'profitapi'
        })  // OBS 临时凭证响应
        const signature = signatureRes.data || signatureRes.Data || signatureRes  // OBS 签名信息
        const options = signature.options || signature.Options  // OBS 上传参数
        const credential = signature.credential || signature.Credential  // OBS 临时访问凭证
        if (!options || !credential) throw new Error('OBS上传凭证无效')
        // 使用现有 OBS 上传能力，把录音临时文件上传为音频文件
        await this.uploadImageToObs(filePath, 'audio/mpeg', options, credential)
        const displayDomain = String(options.displayDomain || '').replace(/\/$/, '')  // 语音公开访问域名
        if (!displayDomain) throw new Error('语音访问地址无效')
        const audioPath = displayDomain + '/' + options.key  // 可以直接播放的语音公开地址
        const msgText = '<m_audio,' + audioPath + ',' + duration + '>'  // 语音消息标准格式
        // 保存标准语音消息，对方会根据公开地址和时长展示、播放
        await saveRecordByClient({
          RecvDataID: this.dataId,
          SessionCategoryID: this.categoryId,
          MsgText: msgText,
          Domain: domain
        })
        // 上传和消息保存成功后，把本地气泡更新成线上语音消息
        msg.MsgText = msgText
        msg.AudioPath = audioPath
        msg.State = 1
      } catch (error) {
        console.error('发送语音失败:', error)
        msg.State = 0
        uni.showToast({ title: error.message || '发送语音失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },

    // ----------- 播放或停止语音消息
    async toggleAudio(msg) {
      // 当前语音正在播放时，再次点击就暂停播放
      if (this.playingAudioId === msg.MsgID && this._audioContext) {
        this._audioContext.pause()
        this.playingAudioId = ''
        return
      }
      // 当前播放器播放过这条语音时，重置进度后直接复用，不重复下载
      if (this._audioContext && this._audioMessageId === msg.MsgID) {
        const audioContext = this._audioContext  // 需要重新播放的语音播放器
        audioContext.stop()
        setTimeout(() => {
          if (this._audioContext !== audioContext) return
          this.playingAudioId = msg.MsgID
          audioContext.play()
        }, 50)
        return
      }
      // 切换到其他语音前销毁旧播放器，避免两条语音同时播放
      if (this._audioContext) {
        this._audioContext.destroy()
        this._audioContext = null
      }
      try {
        this.playingAudioId = msg.MsgID
        const audioSource = msg.LocalAudio || await this.downloadAudio(msg)  // 本地可播放的语音地址
        const audioContext = uni.createInnerAudioContext()  // 当前语音播放器
        this._audioContext = audioContext
        this._audioMessageId = msg.MsgID
        // 关闭自动播放和循环播放，由点击事件主动控制每次只播放一遍
        audioContext.autoplay = false
        audioContext.loop = false
        // 音频资源准备好后开始播放
        audioContext.onCanplay(() => {
          if (this._audioContext === audioContext && this.playingAudioId === msg.MsgID) audioContext.play()
        })
        // 播放结束后只清理动画状态，不自动循环播放
        audioContext.onEnded(() => {
          if (this._audioContext !== audioContext) return
          this.playingAudioId = ''
        })
        // 暂停或停止时同步关闭语音波形动画
        audioContext.onPause(() => {
          if (this._audioContext === audioContext) this.playingAudioId = ''
        })
        audioContext.onStop(() => {
          if (this._audioContext === audioContext) this.playingAudioId = ''
        })
        // 播放异常时恢复气泡状态并提示用户
        audioContext.onError((error) => {
          if (this._audioContext !== audioContext) return
          console.error('播放语音失败:', error)
          this.playingAudioId = ''
          uni.showToast({ title: '语音播放失败', icon: 'none' })
        })
        audioContext.src = audioSource
        audioContext.play()
      } catch (error) {
        console.error('下载语音失败:', error)
        this.playingAudioId = ''
        uni.showToast({ title: '语音加载失败', icon: 'none' })
      }
    },

    // ----------- 下载线上语音到本地
    downloadAudio(msg) {
      const audioPath = String(msg.AudioPath || '')  // 消息中保存的语音路径
      const remoteUrl = audioPath.indexOf('http') === 0
        ? audioPath
        : 'https://big-engineer.oss-cn-hangzhou.aliyuncs.com/' + audioPath.replace(/^[^/]+\//, '')  // 兼容历史 bucket/key 格式
      // 先下载到小程序临时目录，解决远程音频重复播放不稳定的问题
      return new Promise((resolve, reject) => {
        uni.downloadFile({
          url: remoteUrl,
          success: (res) => {
            if (Number(res.statusCode) === 200 && res.tempFilePath) {
              // 缓存本地临时路径，后续点击同一条语音时不用再次下载
              msg.LocalAudio = res.tempFilePath
              resolve(res.tempFilePath)
              return
            }
            reject(new Error('语音下载失败，状态码：' + res.statusCode))
          },
          fail: reject
        })
      })
    },

    // ----------- 选择文件
    onPickFile() {
      // TODO: 小程序环境选择文件
      uni.showToast({ title: '文件选择功能开发中', icon: 'none' })
    },

    // ----------- 点击链接卡片跳转
    onLinkTap(msg) {
      if (!msg.LinkUrl) return
      // 产品详情链接跳转小程序原生页面
      if (msg.LinkUrl.indexOf('product-detail') > -1) {
        const idMatch = msg.LinkUrl.match(/[?&]id=(\d+)/)  // 产品ID匹配结果
        const prodId = idMatch ? idMatch[1] : ''  // 提取的产品ID
        if (prodId) {
          uni.navigateTo({ url: '/pages-sub/explore/comp-detail/index?prodId=' + prodId })
          return
        }
      }
      // 非产品链接用webview打开
      uni.navigateTo({ url: '/pages-sub/web-view/index?url=' + encodeURIComponent(msg.LinkUrl) })
    },

    // ----------- 跳转发产品页面
    onSendProduct() {
      this.showMore = false
      const params = [
        'key=' + encodeURIComponent(this.interlocutorKey),
        'name=' + encodeURIComponent(this.interlocutorName),
        'logo=' + encodeURIComponent(this.interlocutorLogo)
      ].join('&')
      uni.navigateTo({ url: '/im-message/pages/product/index?' + params })
    }
  }
}
</script>

<style scoped lang="scss">
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #ededed;

  /* 消息列表 */
  .chat-content {
    flex: 1;
    overflow: hidden;
    padding: 0 20rpx;
    box-sizing: border-box;

    /* 加载更多 */
    .load-more-tip {
      display: flex;
      justify-content: center;
      padding: 20rpx 0;
      .load-more-text {
        font-size: 22rpx;
        color: #b2b2b2;
      }
    }

    /* 时间分割线*/
    .time-divider {
      display: flex;
      justify-content: center;
      padding: 32rpx 0 24rpx;
      .time-divider-text {
        font-size: 24rpx;
        color: #b2b2b2;
      }
    }

    /* 消息行*/
    .msg-row {
      display: flex;
      align-items: flex-start;
      margin-top: 0;
      margin-bottom: 40rpx;

      &.msg-row-left {
        flex-direction: row;
        .msg-avatar {
          margin-right: 20rpx;
        }
      }
      &.msg-row-right {
        flex-direction: row;
        justify-content: flex-end;
        .msg-avatar {
          margin-left: 20rpx;
        }
      }

      /* 头像 */
      .msg-avatar {
        width: 84rpx;
        height: 84rpx;
        border-radius: 12rpx;
        flex-shrink: 0;
        background: #d8d8d8;
      }

      /* 气泡 */
      .msg-bubble {
        max-width: 480rpx;
        padding: 18rpx 24rpx;
        border-radius: 10rpx;
        position: relative;

        &.msg-bubble-left {
          background: #fff;
          &::after {
            content: '';
            position: absolute;
            top: 26rpx;
            left: -12rpx;
            border-style: solid;
            border-width: 10rpx 14rpx 10rpx 0;
            border-color: transparent #fff transparent transparent;
          }
        }
        &.msg-bubble-right {
          background: #95ec69;
          &::after {
            content: '';
            position: absolute;
            top: 26rpx;
            right: -12rpx;
            border-style: solid;
            border-width: 10rpx 0 10rpx 14rpx;
            border-color: transparent transparent transparent #95ec69;
          }
        }

        .msg-text {
          font-size: 32rpx;
          line-height: 1.4;
          color: #191919;
          word-break: break-all;
        }

        /* 图片消息气泡：去掉背景色和内边距，只保留浅边框 */
        &.msg-bubble-image {
          background: transparent !important;
          padding: 0;

          &::after { display: none; }

          .msg-image {
            width: 220rpx;
            border-radius: 8rpx;
            border: 1rpx solid rgba(15, 23, 42, 0.08);
            box-sizing: border-box;
          }
        }

        /* 链接卡片气泡：去掉气泡尖角，用卡片自身样式 */
        &.msg-bubble-link {
          background: transparent !important;
          padding: 0;
          max-width: 480rpx;

          &::after { display: none; }
        }

        /* 图片消息 */
        .msg-image {
          width: 220rpx;
          border-radius: 8rpx;
        }

        /* 链接卡片 */
        .msg-link-card {
          width: 480rpx;
          border-radius: 16rpx;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 2rpx 12rpx rgba(15, 23, 42, 0.06);

          .link-card-header {
            display: flex;
            align-items: center;
            font-size: 22rpx;
            color: #8a8f99;
            padding: 18rpx 24rpx 14rpx;
            border-bottom: 1rpx solid rgba(15, 23, 42, 0.04);

            &::before {
              content: '';
              width: 6rpx;
              height: 6rpx;
              border-radius: 50%;
              background: #4a6fa5;
              margin-right: 10rpx;
              flex-shrink: 0;
            }
          }

          .link-card-body {
            display: flex;
            align-items: center;
            padding: 22rpx 24rpx;

            .link-card-logo {
              width: 88rpx;
              height: 88rpx;
              border-radius: 12rpx;
              flex-shrink: 0;
              margin-right: 18rpx;
              background: #f4f5f7;
            }

            .link-card-logo-placeholder {
              width: 88rpx;
              height: 88rpx;
              border-radius: 12rpx;
              flex-shrink: 0;
              margin-right: 18rpx;
              background: linear-gradient(135deg, #f0f3f7, #e8edf3);
              display: flex;
              align-items: center;
              justify-content: center;

              text {
                font-size: 40rpx;
                opacity: 0.15;
              }
            }

            .link-card-info {
              flex: 1;
              min-width: 0;
              display: flex;
              flex-direction: column;
              gap: 8rpx;

              .link-card-title {
                font-size: 26rpx;
                color: #2c3e50;
                font-weight: 400;
                line-height: 36rpx;
                display: -webkit-box;
                overflow: hidden;
                line-clamp: 2;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
              }

              .link-card-url {
                font-size: 20rpx;
                color: #a8adb5;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }
          }

          &:active {
            transform: scale(0.98);
            box-shadow: 0 1rpx 6rpx rgba(15, 23, 42, 0.04);
          }
        }

        /* 语音消息 */
        .msg-audio {
          min-width: 160rpx;
          height: 44rpx;
          display: flex;
          align-items: center;
          justify-content: space-between;

          .audio-wave {
            height: 30rpx;
            display: flex;
            align-items: center;
            gap: 5rpx;

            text {
              width: 5rpx;
              background: #333;
              border-radius: 4rpx;

              &:nth-child(1) { height: 10rpx; }
              &:nth-child(2) { height: 18rpx; }
              &:nth-child(3) { height: 28rpx; }
              &:nth-child(4) { height: 20rpx; }
              &:nth-child(5) { height: 12rpx; }
            }
          }

          .audio-duration {
            margin-left: 24rpx;
            font-size: 28rpx;
            color: #333;
          }

          &.playing .audio-wave text {
            animation: audio-wave 0.7s ease-in-out infinite alternate;

            &:nth-child(2) { animation-delay: 0.1s; }
            &:nth-child(3) { animation-delay: 0.2s; }
            &:nth-child(4) { animation-delay: 0.3s; }
            &:nth-child(5) { animation-delay: 0.4s; }
          }
        }
      }
    }

    /* 底部锚点 */
    .msg-bottom-anchor {
      height: 1rpx;
    }
  }

  /* 底部输入区 */
  .chat-footer {
    flex-shrink: 0;
    background: rgba(247, 248, 250, 0.98);
    border-top: 1rpx solid rgba(15, 23, 42, 0.07);
    box-shadow: 0 -8rpx 28rpx rgba(15, 23, 42, 0.04);

    &.footer-safe-bottom {
      padding-bottom: env(safe-area-inset-bottom);
    }

    .footer-input-row {
      min-height: 92rpx;
      padding: 12rpx 14rpx;
      display: flex;
      align-items: center;
      gap: 10rpx;

      /* 左右工具按钮 */
      .footer-tool-btn {
        width: 68rpx;
        height: 68rpx;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.15s ease, transform 0.15s ease;

        &:active {
          background: #e7e9ec;
          transform: scale(0.94);
        }

        /* 语音切换图标 */
        .icon-voice-switch {
          width: 43rpx;
          height: 43rpx;
          border: 3rpx solid #272b30;
          border-radius: 50%;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;

          .voice-switch-wave {
            height: 22rpx;
            display: flex;
            align-items: center;
            gap: 4rpx;

            text {
              width: 3rpx;
              border-radius: 4rpx;
              background: #272b30;

              &:nth-child(1) { height: 9rpx; }
              &:nth-child(2) { height: 20rpx; }
              &:nth-child(3) { height: 13rpx; }
            }
          }
        }

        /* 键盘切换图标 */
        .icon-keyboard {
          width: 44rpx;
          height: 34rpx;
          padding: 6rpx;
          border: 3rpx solid #272b30;
          border-radius: 7rpx;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4rpx;

          text {
            border-radius: 2rpx;
            background: #272b30;
          }
        }

        /* 表情图标 */
        .icon-smile-modern {
          position: relative;
          width: 43rpx;
          height: 43rpx;
          border: 3rpx solid #272b30;
          border-radius: 50%;
          box-sizing: border-box;

          .smile-eye {
            position: absolute;
            top: 11rpx;
            width: 5rpx;
            height: 6rpx;
            border-radius: 50%;
            background: #272b30;

            &.left { left: 10rpx; }
            &.right { right: 10rpx; }
          }

          .smile-mouth {
            position: absolute;
            left: 50%;
            bottom: 8rpx;
            width: 17rpx;
            height: 8rpx;
            border: 3rpx solid #272b30;
            border-top: 0;
            border-radius: 0 0 12rpx 12rpx;
            transform: translateX(-50%);
            box-sizing: border-box;
          }
        }

        /* 更多加号图标 */
        .icon-plus-modern {
          position: relative;
          width: 43rpx;
          height: 43rpx;
          border: 3rpx solid #272b30;
          border-radius: 50%;
          box-sizing: border-box;

          text {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20rpx;
            height: 3rpx;
            border-radius: 3rpx;
            background: #272b30;
            transform: translate(-50%, -50%);

            &:nth-child(2) {
              transform: translate(-50%, -50%) rotate(90deg);
            }
          }
        }
      }

      /* 文本输入框 */
      .footer-input {
        flex: 1;
        min-width: 0;
        height: 72rpx;
        padding: 0 24rpx;
        border: 1rpx solid rgba(15, 23, 42, 0.04);
        border-radius: 18rpx;
        box-sizing: border-box;
        background: #fff;
        color: #20242a;
        font-size: 30rpx;
        box-shadow: 0 2rpx 10rpx rgba(15, 23, 42, 0.035);
      }

      .footer-input-placeholder {
        color: #a8adb5;
        font-size: 29rpx;
      }

      /* 按住说话按钮 */
      .hold-talk-btn {
        flex: 1;
        min-width: 0;
        height: 72rpx;
        border: 1rpx solid rgba(15, 23, 42, 0.06);
        border-radius: 18rpx;
        box-sizing: border-box;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #30343a;
        font-size: 29rpx;
        font-weight: 500;
        box-shadow: 0 2rpx 10rpx rgba(15, 23, 42, 0.035);

        &.pressing {
          background: #e5e7ea;
          box-shadow: inset 0 2rpx 8rpx rgba(15, 23, 42, 0.08);
        }

        &.canceling {
          color: #f04444;
          background: #fff0f0;
        }
      }

      /* 发送按钮 */
      .footer-send-btn {
        height: 66rpx;
        padding: 0 24rpx;
        flex-shrink: 0;
        border-radius: 14rpx;
        background: linear-gradient(135deg, #18c56e, #07b85b);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6rpx 14rpx rgba(7, 193, 96, 0.2);

        &:active { transform: scale(0.96); }

        .footer-send-text {
          color: #fff;
          font-size: 27rpx;
          font-weight: 600;
        }
      }
    }

    /* 底部面板 */
    .footer-panel {
      padding: 0 22rpx;
      background: #f3f4f6;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.22s ease, padding 0.22s ease;

      &.panel-open {
        max-height: 500rpx;
        padding: 30rpx 22rpx 22rpx;
        border-top: 1rpx solid rgba(15, 23, 42, 0.05);
      }

      /* 更多操作面板 */
      .panel-grid {
        display: flex;
        flex-wrap: wrap;

        .panel-item {
          width: 25%;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 32rpx;

          .panel-icon-wrap {
            width: 112rpx;
            height: 112rpx;
            background: #fff;
            border: 1rpx solid rgba(15, 23, 42, 0.04);
            border-radius: 24rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 14rpx;
            box-shadow: 0 6rpx 18rpx rgba(15, 23, 42, 0.05);

            /* 相册图标 */
            .icon-album {
              position: relative;
              width: 48rpx;
              height: 48rpx;

              .icon-album-rect {
                width: 48rpx;
                height: 40rpx;
                border: 3rpx solid #555;
                border-radius: 6rpx;
                position: absolute;
                bottom: 0;
                box-sizing: border-box;
              }
              .icon-album-circle {
                width: 16rpx;
                height: 16rpx;
                border: 3rpx solid #555;
                border-radius: 50%;
                position: absolute;
                top: 4rpx;
                right: 8rpx;
                box-sizing: border-box;
              }
            }

            /* 拍照图标 */
            .icon-camera {
              position: relative;
              width: 48rpx;
              height: 48rpx;

              .icon-camera-body {
                width: 48rpx;
                height: 36rpx;
                border: 3rpx solid #555;
                border-radius: 6rpx;
                position: absolute;
                bottom: 0;
                box-sizing: border-box;
              }
              .icon-camera-lens {
                width: 18rpx;
                height: 18rpx;
                border: 3rpx solid #555;
                border-radius: 50%;
                position: absolute;
                bottom: 9rpx;
                left: 50%;
                transform: translateX(-50%);
                box-sizing: border-box;
              }
            }

            /* 语音图标 */
            .icon-voice {
              position: relative;
              width: 48rpx;
              height: 52rpx;

              .icon-voice-head {
                width: 22rpx;
                height: 32rpx;
                border: 3rpx solid #555;
                border-radius: 14rpx;
                position: absolute;
                top: 0;
                left: 13rpx;
                box-sizing: border-box;
              }

              .icon-voice-body {
                width: 38rpx;
                height: 28rpx;
                border: 3rpx solid #555;
                border-top: none;
                border-radius: 0 0 20rpx 20rpx;
                position: absolute;
                top: 12rpx;
                left: 5rpx;
                box-sizing: border-box;
              }

              .icon-voice-line {
                width: 3rpx;
                height: 12rpx;
                background: #555;
                position: absolute;
                bottom: 0;
                left: 23rpx;
              }
            }

            /* 文件图标 */
            .icon-file {
              position: relative;
              width: 40rpx;
              height: 48rpx;

              .icon-file-body {
                width: 32rpx;
                height: 48rpx;
                border: 3rpx solid #555;
                border-radius: 4rpx;
                position: absolute;
                left: 4rpx;
                box-sizing: border-box;
              }
              .icon-file-corner {
                width: 12rpx;
                height: 12rpx;
                border-top: 3rpx solid #555;
                border-right: 3rpx solid #555;
                position: absolute;
                top: 0;
                right: 0;
              }
              .icon-file-line {
                width: 20rpx;
                height: 3rpx;
                background: #555;
                border-radius: 2rpx;
                position: absolute;
                left: 10rpx;

                &.top { top: 18rpx; }
                &.mid { top: 28rpx; }
                &.bot { top: 38rpx; }
              }
            }

            /* 产品图标 */
            .icon-product {
              position: relative;
              width: 44rpx;
              height: 48rpx;

              .icon-product-tag {
                width: 16rpx;
                height: 16rpx;
                background: #555;
                border-radius: 4rpx;
                position: absolute;
                top: 0;
                left: 0;
              }

              .icon-product-line {
                width: 28rpx;
                height: 3rpx;
                background: #555;
                border-radius: 2rpx;
                position: absolute;
                left: 16rpx;

                &.top { top: 4rpx; }
                &.mid { top: 14rpx; }
                &.bot { top: 24rpx; }
              }
            }
          }

          .panel-label {
            font-size: 24rpx;
            color: #626872;
          }
        }
      }

      /* 表情面板 */
      &.emotion-panel {
        .emotion-scroll {
          height: 440rpx;
        }

        .emotion-grid {
          display: flex;
          flex-wrap: wrap;

          .emotion-item {
            width: 12.5%;
            height: 80rpx;
            display: flex;
            align-items: center;
            justify-content: center;

            .emotion-text {
              font-size: 44rpx;
            }
          }
        }
      }
    }
  }

  /* 微信式录音浮层 */
  .record-mask {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 160rpx;
    left: 0;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;

    .record-card {
      width: 310rpx;
      min-height: 270rpx;
      padding: 42rpx 28rpx 32rpx;
      border-radius: 28rpx;
      box-sizing: border-box;
      background: rgba(26, 29, 34, 0.84);
      backdrop-filter: blur(14rpx);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 18rpx 50rpx rgba(0, 0, 0, 0.22);

      .record-wave {
        height: 78rpx;
        display: flex;
        align-items: center;
        gap: 11rpx;
        margin-bottom: 28rpx;

        text {
          width: 9rpx;
          height: 30rpx;
          border-radius: 8rpx;
          background: #fff;
          animation: record-wave 0.65s ease-in-out infinite alternate;

          &:nth-child(2) { height: 54rpx; animation-delay: 0.1s; }
          &:nth-child(3) { height: 76rpx; animation-delay: 0.2s; }
          &:nth-child(4) { height: 48rpx; animation-delay: 0.3s; }
          &:nth-child(5) { height: 26rpx; animation-delay: 0.4s; }
        }
      }

      .record-title {
        color: #fff;
        font-size: 29rpx;
        font-weight: 600;
      }

      .record-tip {
        margin-top: 14rpx;
        color: rgba(255, 255, 255, 0.68);
        font-size: 23rpx;
      }
    }

    &.canceling .record-card {
      background: rgba(214, 55, 55, 0.9);

      .record-wave text { animation: none; }
      .record-tip { color: rgba(255, 255, 255, 0.82); }
    }
  }
}

@keyframes audio-wave {
  from { transform: scaleY(0.45); }
  to { transform: scaleY(1); }
}

@keyframes record-wave {
  from { transform: scaleY(0.4); opacity: 0.55; }
  to { transform: scaleY(1); opacity: 1; }
}
</style>