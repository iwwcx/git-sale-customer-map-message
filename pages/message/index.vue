<template>
  <view class="msg-page">
    <loading-overlay :visible="loading" text="加载中..." />

    <!-- 消息列表 -->
    <scroll-view class="msg-scroll" scroll-y :refresher-enabled="true" :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
      <!-- 消息列表 -->
      <view v-if="chatList.length" class="msg-list">
        <view
          class="msg-item"
          v-for="item in chatList"
          :key="item.ID"
          hover-class="msg-item-hover"
          :hover-stay-time="80"
          @tap="goDetail(item)"
        >
          <!-- 头像 -->
          <view class="msg-avatar-box">
            <image
              v-if="item.SessionCategoryID == 52"
              class="msg-avatar"
              src="https://img2cdn.global-dsc.cn/dgzz_img/6ddfb1a24a56be29919936e7e6641f76.jpg"
              mode="aspectFill"
            />
            <image
              v-else-if="item.SessionCategoryID == 54"
              class="msg-avatar"
              src="https://img2cdn.global-dsc.cn/dgzz_img/9f804858d1f0854707bd90b942326fe6.jpg"
              mode="aspectFill"
            />
            <image
              v-else
              class="msg-avatar"
              :src="getAvatarSrc(item)"
              mode="aspectFill"
              @error="onAvatarError(item)"
            />
            <!-- 未读角标 -->
            <view v-if="item.UnReadCount > 0" class="msg-badge">
              <text class="msg-badge-text">{{ item.UnReadCount > 99 ? '99+' : item.UnReadCount }}</text>
            </view>
          </view>

          <!-- 消息内容 -->
          <view class="msg-content">
            <view class="msg-row-top">
              <view class="msg-name-wrap">
                <text class="msg-name">{{ item.SessionName }}</text>
                <text v-if="item.SessionCategoryID == 52" class="msg-group-tag">群聊</text>
                <text v-if="item.SessionCategoryID == 54" class="msg-notice-tag">通知</text>
              </view>
              <text class="msg-time">{{ formatTime(item.LastSendTime) }}</text>
            </view>
            <view class="msg-row-bottom">
              <text class="msg-preview">{{ parseMsgText(item.LastSendText) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!loading" class="msg-empty">
        <image class="msg-empty-img" src="https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png" mode="aspectFit" />
        <text class="msg-empty-title">暂无消息</text>
        <text class="msg-empty-hint">快去联系感兴趣的工程师吧</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getChatList, getSummary } from '@/im-message/api/index.js'
import { IMService } from '@/im-message/services/im.js'
import { RecentService } from '@/im-message/services/recent.js'
import { getProductImageUrlChat, formatTime, parseMsgText } from '@/common/utils/index.js'

export default {
  data() {
    return {
      chatList: [], // 会话列表
      loading: false, // loading-overlay 显示状态
      refreshing: false, // 下拉刷新状态
      avatarErrorMap: {}, // 头像加载失败的 ID 映射
      summaryCache: {}, // 概要信息缓存 'type:id' -> { DataTitle }
      myUserId: '' // 当前用户ID
    }
  },
  onLoad() {
    const userInfo = uni.getStorageSync('userInfo') || {}
    this.myUserId = String(userInfo.UserID || '')
    // 登录 IM 并订阅会话列表变化（新消息置顶、未读数实时更新，失败有重连机制）
    IMService.login().catch(() => {})
    this._recentHandler = (list) => this.onRecentChange(list)  // 会话列表变化回调引用，取消订阅时用
    RecentService.subscribe(this._recentHandler)
    this.getChatList()
  },
  onUnload() {
    // 取消会话列表订阅
    RecentService.unsubscribe(this._recentHandler)
  },
  methods: {
    // ----------- 获取会话列表
    async getChatList() {
      this.loading = true
      try {
        await RecentService.init(true)
        // 过滤掉 LastSendText 为空的会话
        this.chatList = RecentService.getList().filter(item => item.LastSendText)
        // 翻译团队通知的占位符
        this.translateNoticeList()
      } finally {
        this.loading = false
      }
    },

    // ----------- 会话列表实时变化（新消息置顶、未读数更新）
    onRecentChange(list) {
      // 过滤掉 LastSendText 为空的会话
      this.chatList = list.filter(item => item.LastSendText)
      // 翻译团队通知的占位符
      this.translateNoticeList()
    },

    // ----------- 下拉刷新
    async onRefresh() {
      this.refreshing = true
      try {
        await RecentService.init(true)
        // 过滤掉 LastSendText 为空的会话
        this.chatList = RecentService.getList().filter(item => item.LastSendText)
        // 翻译团队通知的占位符
        this.translateNoticeList()
      } finally {
        this.refreshing = false
      }
    },

    // ----------- 翻译团队通知列表中的占位符
    async translateNoticeList() {
      const noticeItems = this.chatList.filter(item => item.SessionCategoryID == 54)
      for (const item of noticeItems) {
        const translated = await this.translateNoticeText(item.LastSendText)
        item.LastSendText = translated
      }
    },

    // ----------- 翻译单条文本中的 {U:xxx} {G:xxx} 为用户名/群名
    async translateNoticeText(text) {
      if (!text) return text
      const regexp = /\{(U|G):(\d+)\}/gi
      const matches = text.match(regexp)
      if (!matches || !matches.length) return text
      // 收集需要查询的唯一 key
      const keys = [...new Set(matches.map(m => {
        const [, type, id] = m.match(/\{(U|G):(\d+)\}/i)
        return `${type}:${id}`
      }))]
      // 查询所有未缓存的概要信息
      const summaries = {}
      await Promise.all(keys.map(async (key) => {
        if (this.summaryCache[key]) {
          summaries[key] = this.summaryCache[key]
          return
        }
        const [type, id] = key.split(':')
        const categoryId = type === 'U' ? 20 : 52
        try {
          const res = await getSummary(categoryId, id)
          const info = res.Data || res
          const title = info.ViewName || info.UserName || info.IMGroupName || info.DataTitle || id
          this.summaryCache[key] = { DataTitle: title }
          summaries[key] = this.summaryCache[key]
        } catch (e) {
          summaries[key] = { DataTitle: id }
        }
      }))
      // 替换占位符
      let translated = text
      matches.forEach(m => {
        const [, type, id] = m.match(/\{(U|G):(\d+)\}/i)
        const key = `${type}:${id}`
        const summary = summaries[key] || { DataTitle: id }
        const display = type === 'U' && id === this.myUserId ? '您' : summary.DataTitle
        translated = translated.replace(m, display)
      })
      return translated
    },

    // ----------- 点击消息项跳转聊天详情
    goDetail(record) {
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.navigateTo({ url: '/pages/common/login/index' })
        return
      }

      // 团队通知跳转到通知页面
      if (record.SessionCategoryID == 54) {
        uni.navigateTo({ url: '/im-message/pages/notice/index' })
        return
      }

      // 拼接会话标识 "CategoryId:DataId"
      const key = `${record.SessionCategoryID}:${record.SessionDataID}`
      const name = encodeURIComponent(record.SessionName || '')
      const logo = encodeURIComponent(record.SessionLogo || '')

      uni.navigateTo({
        url: `/im-message/pages/chat/detail?key=${encodeURIComponent(key)}&name=${name}&logo=${logo}`
      })
    },

    // ----------- 获取头像地址，加载失败时兜底默认图
    getAvatarSrc(item) {
      if (this.avatarErrorMap[item.ID]) {
        return 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png'
      }
      return item.SessionLogo ? getProductImageUrlChat(item.SessionLogo) : 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png'
    },

    // ----------- 头像加载失败回调
    onAvatarError(item) {
      this.avatarErrorMap[item.ID] = true
    },

    getProductImageUrlChat,
    formatTime,
    parseMsgText
  }
}
</script>

<style scoped lang="scss">
.msg-page {
  width: 100%;
  height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.msg-scroll {
  flex: 1;
  overflow: hidden;
}

.msg-list {
  background: #fff;
}

.msg-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  position: relative;
}
.msg-item::after {
  content: '';
  position: absolute;
  left: 128rpx;
  right: 0;
  bottom: 0;
  height: 1rpx;
  background: #f0f0f0;
  transform: scaleY(0.5);
}
.msg-item-hover {
  background: #f7f7f7;
}

.msg-avatar-box {
  position: relative;
  width: 88rpx;
  height: 88rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}
.msg-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 16rpx;
  background: #f0f0f0;
}
.msg-badge {
  position: absolute;
  top: -8rpx;
  right: -12rpx;
  min-width: 38rpx;
  height: 38rpx;
  padding: 0 10rpx;
  border-radius: 19rpx;
  background: #fa5151;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #fff;
  box-sizing: border-box;
}
.msg-badge-text {
  font-size: 20rpx;
  color: #fff;
  line-height: 1;
}

.msg-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.msg-row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}
.msg-name-wrap {
  display: flex;
  align-items: center;
  overflow: hidden;
}
.msg-name {
  font-size: 30rpx;
  color: #4c4c4c;
  font-weight: 500;
  max-width: 380rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.msg-group-tag {
  font-size: 22rpx;
  color: #fff;
  background: #fa9d3b;
  border-radius: 8rpx;
  padding: 6rpx 10rpx;
  margin-left: 8rpx;
  flex-shrink: 0;
  line-height: 1.2;
}
.msg-notice-tag {
  font-size: 22rpx;
  color: #fff;
  background: #4cbc84;
  border-radius: 8rpx;
  padding: 6rpx 10rpx;
  margin-left: 8rpx;
  flex-shrink: 0;
  line-height: 1.2;
}
.msg-time {
  font-size: 24rpx;
  color: #a0a0a0;
  flex-shrink: 0;
  margin-left: 16rpx;
}
.msg-row-bottom {
  display: flex;
  align-items: center;
}
.msg-preview {
  flex: 1;
  font-size: 26rpx;
  color: #8c8c8c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 6rpx;
}

.msg-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 240rpx;
}
.msg-empty-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-bottom: 24rpx;
  opacity: 0.6;
}
.msg-empty-title {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 8rpx;
}
.msg-empty-hint {
  font-size: 24rpx;
  color: #ccc;
}
</style>