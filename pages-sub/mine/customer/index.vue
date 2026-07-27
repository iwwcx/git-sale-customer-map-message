<template>
  <view class="customer-page">
    <scroll-view class="page-scroll" scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
      <view class="hero-card">
        <view class="hero-glow hero-glow-left"></view>
        <view class="hero-glow hero-glow-right"></view>
        <view class="hero-grid"></view>
        <view class="hero-title-row">
          <view class="hero-copy">
            <text class="hero-title">我的客户列表</text>
            <text class="hero-desc">沉淀你的邀请客户，随时查看客户信息与注册进度。</text>
          </view>
        </view>
        <view class="hero-stats">
          <view class="hero-stat-item">
            <text class="hero-stat-value">{{ total }}</text>
            <text class="hero-stat-label">累计客户</text>
          </view>
          <view class="hero-stat-divider"></view>
          <view class="hero-stat-item">
            <text class="hero-stat-value">{{ officialMemberCount }}</text>
            <text class="hero-stat-label">正式会员</text>
          </view>
          <view class="hero-stat-divider"></view>
          <view class="hero-stat-item">
            <text class="hero-stat-value">{{ normalUserCount }}</text>
            <text class="hero-stat-label">普通用户</text>
          </view>
        </view>
      </view>

      <view class="section-header">客户明细</view>

      <view v-if="loading && !list.length" class="loading-wrap">
        <view class="loading-card" v-for="item in 3" :key="item">
          <view class="loading-avatar"></view>
          <view class="loading-content">
            <view class="loading-line loading-line-lg"></view>
            <view class="loading-line"></view>
          </view>
        </view>
      </view>

      <view v-else-if="list.length" class="customer-list">
        <view class="customer-card" v-for="(item, index) in list" :key="item.id || item.UserID || item.Phone || index">
          <view class="card-accent"></view>
          <view class="card-top">
            <view class="avatar-wrap">
              <text class="avatar-text">{{ getAvatarText(item) }}</text>
            </view>
            <view class="card-main">
              <view class="name-row">
                <text class="customer-name">{{ showName(item) }}</text>
                <view class="status-chip">
                  <text class="status-dot"></text>
                  <text class="status-text">{{ getStatusText(item) }}</text>
                </view>
              </view>
              <text class="customer-phone">{{ formatPhone(item.phone || item.Phone || item.Mobile) }}</text>
            </view>
          </view>

          <!-- <view class="card-tags">
            <view class="mini-tag mini-tag-blue">
              <text class="mini-tag-text">邀请注册</text>
            </view>
            <view class="mini-tag" :class="item.compName ? 'mini-tag-green' : 'mini-tag-gray'">
              <text class="mini-tag-text">{{ item.compName ? '已关联企业' : '待关联企业' }}</text>
            </view>
          </view> -->

          <view class="card-body">
            <view class="info-item">
              <text class="info-label">客户来源</text>
              <text class="info-value">🔥推广计划</text>
            </view>
            <view class="info-item">
              <text class="info-label">关联企业</text>
              <text class="info-value info-value-ellipsis">{{ item.compName || '暂未绑定企业' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">加入时间</text>
              <text class="info-value">{{ item.createdAt || '暂无时间' }}</text>
            </view>
          </view>
        </view>
      </view>

      <empty-state
        v-else
        title="暂时还没有客户"
        hint="邀请客户注册开通会员后，会展示在这里，方便你持续跟进。"
      />
    </scroll-view>
  </view>
</template>

<script>
import EmptyState from '@/common/components/empty-state.vue'
import { getMyCustomerList } from '@/static/api/index.js'
import { showName } from '@/common/utils/index.js'

export default {
  components: {
    EmptyState
  },
  data() {
    return {
      loading: false,
      refreshing: false,
      list: [],
      total: 0
    }
  },
  computed: {
    officialMemberCount() {
      return this.list.filter(item => item.isMember).length
    },
    normalUserCount() {
      return this.list.filter(item => !item.isMember).length
    }
  },
  onLoad() {
    this.fetchCustomerList()
  },
  onPullDownRefresh() {
    this.fetchCustomerList(true)
  },
  methods: {
    async fetchCustomerList(isRefresh = false) {
      if (!isRefresh) {
        this.loading = true
      }
      this.refreshing = !!isRefresh
      try {
        const res = await getMyCustomerList()
        const data = res?.Data || res?.data || []
        const list = Array.isArray(data) ? data : (data?.list || data?.rows || [])
        const total = Number(data?.total || data?.count || list.length || 0)
        this.list = list
        this.total = total
      } catch (error) {
        this.list = []
        this.total = 0
      } finally {
        this.loading = false
        this.refreshing = false
        uni.stopPullDownRefresh()
      }
    },
    onRefresh() {
      this.fetchCustomerList(true)
    },
    getAvatarText(item) {
      const name = this.getDisplayName(item)
      return name.slice(0, 1)
    },
    getDisplayName(item) {
      return item.userName || item.UserName || item.name || '未命名客户'
    },
    getStatusText(item) {
      if(item.isTrial) {
        return '试用会员'
      }
      if(!item.isTrial && item.isMember) {
        return '正式会员'
      }
      return '普通会员'
    },
    getStatusClass(item) {
      if (item.compName) return 'status-chip-success'
      if (item.phone || item.Phone || item.Mobile) return 'status-chip-warning'
      return 'status-chip-default'
    },
    formatPhone(phone) {
      if (!phone) return '未登记手机号'
      const phoneText = String(phone)
      if (phoneText.length !== 11) return phoneText
      return `${phoneText.slice(0, 3)} ${phoneText.slice(3, 7)} ${phoneText.slice(7)}`
    },

    showName
  }
}
</script>

<style scoped lang="scss">
page {
  background: linear-gradient(180deg, #f6f8fc 0%, #eef3fb 100%);
}

.customer-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f6f8fc 0%, #eef3fb 100%);
}

.page-scroll {
  height: 100vh;
  box-sizing: border-box;
}

.hero-card {
  position: relative;
  margin: 24rpx 24rpx 20rpx;
  padding: 32rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #0a57ff 0%, #4f8cff 55%, #6c98d8 100%);
  box-shadow: 0 18rpx 40rpx rgba(37, 99, 235, 0.22);
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(6rpx);
}

.hero-glow-left {
  top: -80rpx;
  left: -40rpx;
  width: 240rpx;
  height: 240rpx;
  background: rgba(255, 255, 255, 0.14);
}

.hero-glow-right {
  top: 20rpx;
  right: -50rpx;
  width: 280rpx;
  height: 280rpx;
  background: rgba(191, 219, 254, 0.1);
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1rpx, transparent 1rpx),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1rpx, transparent 1rpx);
  background-size: 44rpx 44rpx;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.8), transparent 92%);
}

.hero-badge,
.hero-title-row,
.hero-desc,
.hero-stats {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  height: 44rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.92);
  font-size: 24rpx;
  letter-spacing: 1rpx;
}

.hero-title-row {
  margin-top: 24rpx;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.hero-copy {
  flex: 1;
  min-width: 0;
}

.hero-title {
  flex: 1;
  font-size: 42rpx;
  font-weight: 700;
  line-height: 1.28;
  color: #ffffff;
}

.hero-count-chip {
  flex-shrink: 0;
  min-width: 128rpx;
  padding: 16rpx 18rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.14);
  text-align: center;
}

.hero-count-num {
  display: block;
  font-size: 34rpx;
  line-height: 1.1;
  font-weight: 700;
  color: #ffffff;
}

.hero-count-label {
  display: block;
  margin-top: 6rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.hero-desc {
  display: block;
  margin-top: 18rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.82);
}

.hero-stats {
  margin-top: 28rpx;
  display: flex;
  align-items: center;
  padding: 20rpx 12rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
}

.hero-stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.hero-stat-value {
  font-size: 30rpx;
  font-weight: 700;
  color: #ffffff;
}

.hero-stat-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.78);
}

.hero-stat-divider {
  width: 1rpx;
  height: 52rpx;
  background: rgba(255, 255, 255, 0.22);
}

.section-header {
  margin: 30rpx 24rpx;
  display: flex;
  align-items: center;
  font-weight: bold;
  justify-content: space-between;
  gap: 20rpx;
}

.section-chip {
  flex-shrink: 0;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(37, 99, 235, 0.08);
  border: 1rpx solid rgba(59, 130, 246, 0.12);
}

.section-chip-text {
  font-size: 24rpx;
  color: #2563eb;
  font-weight: 600;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.section-subtitle {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #64748b;
}

.customer-list,
.loading-wrap {
  padding: 0 24rpx 40rpx;
}

.customer-card,
.loading-card {
  position: relative;
  margin-bottom: 20rpx;
  padding: 28rpx 26rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.96);
  border: 1rpx solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 18rpx 44rpx rgba(15, 23, 42, 0.07);
  overflow: hidden;
}

.card-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 10rpx;
  background: linear-gradient(180deg, #3b82f6 0%, #60a5fa 100%);
  opacity: 0.9;
}

.card-top {
  display: flex;
  align-items: center;
}

.avatar-wrap,
.loading-avatar {
  width: 86rpx;
  height: 86rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.avatar-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 22rpx;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.56);
}

.avatar-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #1d4ed8;
}

.card-main {
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.customer-name {
  flex: 1;
  min-width: 0;
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-chip {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
}

.status-chip-success {
  background: #ecfdf3;
}

.status-chip-warning {
  background: #fff7ed;
}

.status-chip-default {
  background: #f1f5f9;
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: orange;
  margin-right: 4rpx;
}

.status-chip-success .status-dot {
  background: #22c55e;
}

.status-chip-warning .status-dot {
  background: #f59e0b;
}

.status-chip-default .status-dot {
  background: #94a3b8;
}

.status-text {
  font-size: 26rpx;
  color: #cf8600;
}

.status-chip-success .status-text {
  color: #15803d;
}

.status-chip-warning .status-text {
  color: #c2410c;
}

.status-chip-default .status-text {
  color: #64748b;
}

.customer-phone {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #64748b;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.mini-tag {
  display: inline-flex;
  align-items: center;
  height: 44rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
}

.mini-tag-blue {
  background: #eff6ff;
}

.mini-tag-green {
  background: #ecfdf3;
}

.mini-tag-gray {
  background: #f1f5f9;
}

.mini-tag-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #475569;
}

.card-body {
  margin-top: 22rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #eef2f7;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
}

.info-label {
  flex-shrink: 0;
  font-size: 24rpx;
  color: #707884;
}

.info-value {
  flex: 1;
  text-align: right;
  font-size: 24rpx;
  color: #334155;
  line-height: 1.6;
}

.info-value-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loading-card {
  display: flex;
  align-items: center;
}

.loading-avatar {
  margin-right: 22rpx;
  background: linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 100%);
}

.loading-content {
  flex: 1;
}

.loading-line {
  height: 24rpx;
  margin-top: 16rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #eef2f7 0%, #f8fafc 50%, #eef2f7 100%);
}

.loading-line-lg {
  width: 45%;
  height: 28rpx;
  margin-top: 0;
}

.loading-line:not(.loading-line-lg) {
  width: 70%;
}

.footer-tip {
  padding: 8rpx 0 44rpx;
  text-align: center;
  font-size: 24rpx;
  color: #94a3b8;
}
</style>
