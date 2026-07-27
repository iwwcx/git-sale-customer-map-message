<template>
  <view class="interest-page" :class="{ 'page-empty': !loading && !list.length }">
    <!-- 联系人列表 -->
    <scroll-view class="chat-scroll" scroll-y :class="{ 'empty-scroll': !loading && !list.length }">
      <view class="chat-list">
        <view
          class="chat-card"
          v-for="(item, index) in list"
          :key="index"
          @tap="onCardTap(item)"
        >
          <view class="card-avatar">
            <image :src="item.SessionLogo ? getProductImageUrlChat(item.SessionLogo) : 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png'" mode="aspectFill" />
          </view>
          <view class="card-info">
            <text class="contact-name">{{ item.SessionName || '未知联系人' }}</text>
            <view class="info-row">
              <text class="info-icon">🕐</text>
              <text class="info-text">最后联系： {{ item.LastSendTime.replace("T", " ") }}</text>
            </view>
          </view>
          <text class="card-arrow">›</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-wrap" v-if="!loading && !list.length">
        <view class="empty-illustration">
          <view class="empty-float empty-float-1"></view>
          <view class="empty-float empty-float-2"></view>
          <view class="empty-box">
            <text class="empty-box-icon">🕐</text>
          </view>
        </view>
        <text class="empty-text">暂无联系记录</text>
        <text class="empty-hint">去探客页联系感兴趣的工程师吧</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getChatList } from '@/static/api/index.js'
import { getProductImageUrlChat } from '@/common/utils/index.js'

export default {
  data() {
    return {
      statusBarHeight: 20, // 状态栏高度，单位 px
      loading: false,      // 加载状态
      list: []             // 公司列表数据
    }
  },
  onLoad() {
    // 读取系统状态栏高度，避免标题被遮挡
    const sys = uni.getSystemInfoSync()
    this.statusBarHeight = sys.statusBarHeight || 20
    this.getChatList()
  },
  onPullDownRefresh() {
    this.getChatList()
  },
  methods: {
    // ----------- 获取联系人列表
    async getChatList() {
      this.loading = true
      try {
        const res = await getChatList()
        this.list = res.Data || []
      } catch (e) {
        this.list = []  
      } finally {
        this.loading = false
        uni.stopPullDownRefresh()
      }
    },

    // ----------- 拼接地址：省 市 区
    getAddressText(item) {
      const addressList = [item.province, item.city, item.district].filter(Boolean) // 地址字段列表
      return addressList.length ? addressList.join(' ') : '暂无地址'
    },

    // ----------- 点击卡片跳详情
    onCardTap(item) {
      const userId = item.SessionDataID
      const userName = item.SessionName
      let redirect = ""
      if (item.SessionCategoryID === 20) {
        // 单人聊天
        redirect = `/message/${userId}?name=${encodeURIComponent(userName)}`
      } else if(item.SessionCategoryID === 52) {
        // 群聊
        redirect = `/group-message/${item.SessionDataID}?name=${encodeURIComponent(item.SessionName)}`
      }
      
      uni.navigateTo({
        url: `/pages-sub/web-view/im?url=${encodeURIComponent(redirect)}`
      })
    },

    // ----------- 返回上一页
    goBack() {
      uni.navigateBack()
    },

    getProductImageUrlChat
  }
}
</script>

<style scoped lang="scss">
page {
  background: #f5f7fa;
}

.interest-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.chat-scroll {
  height: 100vh;
  box-sizing: border-box;
}

.chat-scroll.empty-scroll {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-list {
  padding: 24rpx 24rpx 40rpx;
}

// 卡片样式
.chat-card {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.1s;

  &:active {
    transform: scale(0.99);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  }
}

// 左侧头像
.card-avatar {
  flex-shrink: 0;
  width: 80rpx;
  height: 80rpx;
  margin-right: 24rpx;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f4ff, #e8ecff);
  border: 2rpx solid rgba(74, 131, 249, 0.15);

  image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}

// 中间信息
.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.contact-name {
  color: #1a1a1a;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 42rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.info-icon {
  font-size: 22rpx;
  line-height: 32rpx;
}

.info-text {
  color: #8c929d;
  font-size: 24rpx;
  line-height: 34rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

// 右侧箭头
.card-arrow {
  flex-shrink: 0;
  font-size: 32rpx;
  color: #ccc;
  margin-left: 12rpx;
}

// 空状态
.empty-wrap {
  text-align: center;
  padding-top: 200rpx;
}

.empty-illustration {
  position: relative;
  width: 240rpx;
  height: 200rpx;
  margin: 0 auto 48rpx;
}

.empty-float {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, #c7d8ff 0%, #e8eeff 100%);
  animation: floatBubble 3s ease-in-out infinite;
}

.empty-float-1 {
  width: 40rpx;
  height: 40rpx;
  top: 20rpx;
  left: 20rpx;
  animation-delay: 0s;
}

.empty-float-2 {
  width: 24rpx;
  height: 24rpx;
  top: 50rpx;
  right: 30rpx;
  animation-delay: 1s;
}

.empty-box {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120rpx;
  height: 120rpx;
  border-radius: 32rpx;
  background: linear-gradient(145deg, #ffffff 0%, #f0f5ff 100%);
  box-shadow: 0 12rpx 40rpx rgba(74, 131, 249, .18);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: boxBounce 2.5s ease-in-out infinite;
}

.empty-box-icon {
  font-size: 60rpx;
  line-height: 60rpx;
  animation: iconShake 2.5s ease-in-out infinite;
}

@keyframes floatBubble {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: .6;
  }
  50% {
    transform: translateY(-16rpx) scale(1.1);
    opacity: 1;
  }
}

@keyframes boxBounce {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-12rpx);
  }
}

@keyframes iconShake {
  0%, 100% {
    transform: rotate(-8deg);
  }
  50% {
    transform: rotate(8deg);
  }
}

.empty-text {
  color: #4a83f9;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 44rpx;
  margin-bottom: 16rpx;
}

.empty-hint {
  display: block;
  color: #a0aab8;
  font-size: 26rpx;
  line-height: 36rpx;
  margin-top: 16rpx;
}
</style>
