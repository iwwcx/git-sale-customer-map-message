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
              src="https://img2cdn.global-dsc.cn/dgzz_img/71efaaeefc353c09d5ccde4bd1a15310.png"
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
              <text class="msg-name">{{ item.SessionName }}</text>
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
import { getChatList } from '@/im-message/api/index.js'
import { getProductImageUrlChat, formatTime, parseMsgText } from '@/common/utils/index.js'

export default {
  data() {
    return {
      chatList: [], // 会话列表
      loading: false, // loading-overlay 显示状态
      refreshing: false, // 下拉刷新状态
      avatarErrorMap: {} // 头像加载失败的 ID 映射
    }
  },
  onLoad() {
    this.getChatList()
  },
  methods: {
    // ----------- 获取会话列表
    async getChatList() {
      this.loading = true
      try {
        const res = await getChatList()
        // 过滤掉 LastSendText 为空的会话
        this.chatList = (res.Data || []).filter(item => item.LastSendText)
      } finally {
        this.loading = false
      }
    },

    // ----------- 下拉刷新
    async onRefresh() {
      this.refreshing = true
      try {
        const res = await getChatList()
        // 过滤掉 LastSendText 为空的会话
        this.chatList = (res.Data || []).filter(item => item.LastSendText)
      } finally {
        this.refreshing = false
      }
    },

    // ----------- 点击消息项跳转聊天详情
    goDetail(record) {
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.navigateTo({ url: '/pages/common/login/index' })
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
      this.$set(this.avatarErrorMap, item.ID, true)
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
.msg-name {
  font-size: 30rpx;
  color: #1a1a1a;
  font-weight: 500;
  max-width: 420rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.msg-time {
  font-size: 22rpx;
  color: #c8c8c8;
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
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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