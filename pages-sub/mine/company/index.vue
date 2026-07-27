<template>
  <view class="interest-page" :class="{ 'page-empty': !loading && !list.length }">
    <!-- 公司列表 -->
    <scroll-view class="company-scroll" scroll-y :class="{ 'empty-scroll': !loading && !list.length }">
      <view class="company-list">
        <view
          class="company-card"
          v-for="(item, index) in list"
          :key="index"
          @tap="onCardTap(item)"
        >
          <view class="card-icon" :class="`icon-color-${index % 4}`">
            <text class="icon-text">🏢</text>
          </view>
          <view class="card-info">
            <text class="company-name">{{ item.companyName || '未知公司' }}</text>
            <view class="info-row">
              <text class="info-icon">📍</text>
              <text class="info-text">{{ getAddressText(item) }}</text>
            </view>
            <view class="info-row">
              <text class="info-icon">🧑‍💻</text>
              <text class="info-text">法人： {{ item.faRen || '--' }}</text>
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
            <text class="empty-box-icon">📦</text>
          </view>
        </view>
        <text class="empty-text">暂无收藏的公司</text>
        <text class="empty-hint">去探客页收藏感兴趣的企业吧</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { followEnterpriseList } from '@/static/api/index.js'

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
    this.getCompanyList()
  },
  onPullDownRefresh() {
    this.getCompanyList()
  },
  methods: {
    // ----------- 获取公司列表
    async getCompanyList() {
      this.loading = true
      try {
        const res = await followEnterpriseList({
          lat: uni.getStorageSync('myLatitude'),
          lng: uni.getStorageSync('myLongitude')
        })
        this.list = res.data?.list || []
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
      // 把收藏列表字段映射成 comp-detail 需要的格式
      const companyInfo = encodeURIComponent(JSON.stringify({
        ...item,
        compName: item.companyName,
        province: item.province,
        city: item.city,
        district: item.district,
        faRen: item.faRen,
        latitude: item.latitude,
        longitude: item.longitude,
        distance: item.distance
      }))
      const myLatitude = uni.getStorageSync('myLatitude') || '' // 当前定位纬度
      const myLongitude = uni.getStorageSync('myLongitude') || '' // 当前定位经度
      uni.navigateTo({
        url: `/pages-sub/explore/comp-detail/index?companyInfo=${companyInfo}&myLatitude=${myLatitude}&myLongitude=${myLongitude}`
      })
    },

    // ----------- 返回上一页
    goBack() {
      uni.navigateBack()
    }
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

.company-scroll {
  height: 100vh;
  box-sizing: border-box;
}

.company-scroll.empty-scroll {
  display: flex;
  align-items: center;
  justify-content: center;
}

.company-list {
  padding: 24rpx 24rpx 40rpx;
}

// 卡片样式
.company-card {
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

// 左侧图标
.card-icon {
  flex-shrink: 0;
  width: 80rpx;
  height: 80rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;

  .icon-text {
    font-size: 38rpx;
  }
}

.icon-color-0 {
  background: linear-gradient(135deg, #4a83f9, #6d9dff);
  box-shadow: 0 6rpx 16rpx rgba(74, 131, 249, 0.25);
}

.icon-color-1 {
  background: linear-gradient(135deg, #26c6da, #00bcd4);
  box-shadow: 0 6rpx 16rpx rgba(38, 198, 218, 0.25);
}

.icon-color-2 {
  background: linear-gradient(135deg, #ff8a65, #ff7043);
  box-shadow: 0 6rpx 16rpx rgba(255, 112, 67, 0.25);
}

.icon-color-3 {
  background: linear-gradient(135deg, #ab47bc, #8e24aa);
  box-shadow: 0 6rpx 16rpx rgba(142, 36, 170, 0.25);
}

// 中间信息
.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.company-name {
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
