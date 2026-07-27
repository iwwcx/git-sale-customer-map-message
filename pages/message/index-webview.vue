<template>
  <view class="wx-message-page">
    <loading-overlay :visible="loading" text="加载中..." />
    <!-- 消息列表 -->
    <scroll-view class="wx-message-list" scroll-y>
      <block v-if="chatList.length">
        <view class="wx-msg-item" v-for="item in chatList" :key="item.ID" @tap="goDetail(item)">
          <view class="wx-avatar-wrap">
            <image
              v-if="item.SessionCategoryID == 52"
              class="wx-avatar"
              src="https://img2cdn.global-dsc.cn/dgzz_img/71efaaeefc353c09d5ccde4bd1a15310.png"
              mode="aspectFill"
            />
            <image
              v-else
              class="wx-avatar"
              :src="getAvatarSrc(item)"
              mode="aspectFill"
              @error="onAvatarError(item)"
            />
            <view class="wx-badge-num" v-if="item.UnReadCount > 0">{{ item.UnReadCount }}</view>
          </view>
          <view class="wx-msg-body">
            <view class="wx-msg-top">
              <text class="wx-msg-name">{{ item.SessionName }}</text>
              <text class="wx-msg-time">{{ formatTime(item.LastSendTime) }}</text>
            </view>
            <view class="wx-msg-bottom">
              <!-- 格式化消息展示 -->
              <text class="wx-msg-text">{{ parseMsgText(item.LastSendText) }}</text>
            </view>
          </view>
        </view>
      </block>
      <empty-state v-else-if="!loading" title="暂无消息" hint="快去联系感兴趣的工程师吧" />
    </scroll-view>
  </view>
</template>

<script>
import { GetChatList } from '@/static/api/index.js'
import { getProductImageUrlChat, formatTime, parseMsgText } from '@/common/utils/index.js'
import EmptyState from '@/common/components/empty-state.vue'

export default {
  components: { EmptyState },
  data() {
    return {
      chatList: [],
      loading: false, // loading-overlay 显示状态
      avatarErrorMap: {} // 头像加载失败的 ID 映射
    }
  },
  onLoad() {
    this.getChatList()
  },
  methods: {
    async getChatList() {
      this.loading = true
      try {
        const res = await GetChatList()
        this.chatList = res.Data || []
      } finally {
        this.loading = false
      }
    },

    // ----------- 点击消息项跳转聊天详情
    goDetail(record) {
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.navigateTo({ url: '/pages/common/login/index' })
        return
      }

      let redirect = ''
      if (record.SessionCategoryID === 20) {
        // 单人聊天
        redirect = `/message/${record.SessionDataID}?name=${encodeURIComponent(record.SessionName)}`
      } else {
        // 群聊
        redirect = `/group-message/${record.SessionDataID}?name=${encodeURIComponent(record.SessionName)}`
      }

      uni.navigateTo({
        url: `/pages-sub/web-view/im?url=${encodeURIComponent(redirect)}`
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
/* 整个消息页面容器 */
.wx-message-page {
  width: 100%;
  height: 100vh;
  background-color: #ededed; // 微信经典灰色背景
  display: flex;
  flex-direction: column;
}

/* 消息列表 */
.wx-message-list {
  flex: 1;
  background-color: #fdfdfd;
  overflow: hidden;
}

/* 单条消息行 */
.wx-msg-item {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: #fdfdfd;
  position: relative;
}
/* 分割线：留出左侧头像宽度，仿微信效果 */
.wx-msg-item::after {
  content: '';
  position: absolute;
  left: 132rpx;
  right: 0;
  bottom: 0;
  height: 1rpx;
  background-color: #ededed;
  transform: scaleY(0.5);
}
/* 头像容器：用于叠加未读角标 */
.wx-avatar-wrap {
  position: relative;
  width: 96rpx;
  height: 96rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}
.wx-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 14rpx; // 微信头像是圆角方形而非圆形
}
/* 红色小圆点 */
.wx-badge-dot {
  position: absolute;
  top: -4rpx;
  right: -4rpx;
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background-color: #fa5151;
  border: 2rpx solid #ffffff;
}
/* 红色数字角标 */
.wx-badge-num {
  position: absolute;
  top: -10rpx;
  right: -14rpx;
  min-width: 36rpx;
  height: 36rpx;
  padding: 0 8rpx;
  border-radius: 16rpx;
  background-color: #fa5151;
  color: #ffffff;
  font-size: 22rpx;
  line-height: 32rpx;
  text-align: center;
  border: 2rpx solid #ffffff;
  box-sizing: border-box;
}

/* 右侧消息内容主体 */
.wx-msg-body {
  flex: 1;
  min-width: 0; // 让子元素 ellipsis 生效
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.wx-msg-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}
.wx-msg-name {
  font-size: 32rpx;
  color: #181818;
  font-weight: 400;
  max-width: 440rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.wx-msg-time {
  font-size: 24rpx;
  color: #b2b2b2;
  flex-shrink: 0;
  margin-left: 16rpx;
}
.wx-msg-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rpx;
}
.wx-msg-text {
  flex: 1;
  font-size: 26rpx;
  color: #999999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
