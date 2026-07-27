<template>
  <view class="report-page">
    <!-- 背景装饰光晕 -->
    <view class="page-decor">
      <view class="decor-blob blob-blue"></view>
      <view class="decor-blob blob-purple"></view>
    </view>

    <scroll-view class="page-scroll" scroll-y refresher-enabled :refresher-triggered="refreshing" @refresherrefresh="onRefresh" @scrolltolower="onLoadMore">
      <!-- ========== 顶部主视觉 ========== -->
      <view class="hero">
        <view class="hero-row">
          <view class="hero-info">
            <view class="hero-title-row">
              <text class="hero-title hero-title-gradient">我的AI报告</text>
              <text class="hero-sparkle">✨</text>
            </view>
            <text class="hero-desc">查看已生成的客户分析结果</text>
          </view>
          <view class="hero-orb">
            <view class="orb-ring orb-ring-1"></view>
            <view class="orb-ring orb-ring-2"></view>
            <view class="hero-orb-inner">
              <text class="hero-orb-text">AI</text>
            </view>
          </view>
        </view>

        <!-- 统计卡片组 -->
        <view class="stat-row">
          <view class="stat-tile">
            <view class="stat-ico stat-ico-blue"><text class="stat-ico-txt">📊</text></view>
            <view class="stat-info">
              <text class="stat-num">{{ animStats.total }}</text>
              <text class="stat-label">份报告</text>
            </view>
          </view>
          <view class="stat-tile">
            <view class="stat-ico stat-ico-green"><text class="stat-ico-txt">🏢</text></view>
            <view class="stat-info">
              <text class="stat-num">{{ animStats.company }}</text>
              <text class="stat-label">覆盖企业</text>
            </view>
          </view>
          <view class="stat-tile">
            <view class="stat-ico stat-ico-purple"><text class="stat-ico-txt">🔍</text></view>
            <view class="stat-info">
              <text class="stat-num">{{ animStats.keyword }}</text>
              <text class="stat-label">关键词</text>
            </view>
          </view>
        </view>
      </view>

      <!-- ========== 列表区标题 ========== -->
      <view class="list-head">
        <view class="lh-bar"></view>
        <text class="lh-title">分析报告</text>
        <text class="lh-count" v-if="total">共 {{ total }} 份</text>
      </view>

      <!-- ========== 骨架屏 ========== -->
      <view v-if="loading && !list.length" class="skeleton-wrap">
        <view class="skeleton-card" v-for="i in 4" :key="i">
          <view class="skeleton-line skeleton-title"></view>
          <view class="skeleton-tags">
            <view class="skeleton-tag"></view>
            <view class="skeleton-tag"></view>
          </view>
          <view class="skeleton-line skeleton-short"></view>
        </view>
      </view>

      <!-- ========== 报告列表 ========== -->
      <view v-else-if="list.length" class="report-list">
        <view class="r-card" v-for="(item, index) in list" :key="item.id || index" :style="{ animationDelay: (0.05 + index * 0.08) + 's' }" @tap="goDetail(item)">
          <!-- 右上角柔和光晕 -->
          <view class="rc-halo"></view>

          <!-- 头部：状态 + 编号 -->
          <view class="rc-head">
            <view class="rc-status">
              <view class="rc-status-dot-wrap"><view class="rc-status-dot"></view></view>
              <text class="rc-status-text">已生成</text>
            </view>
            <view class="rc-no">
              <text class="rc-no-hash">#</text>
              <text class="rc-no-num">{{ String(index + 1).padStart(2, '0') }}</text>
            </view>
          </view>

          <!-- 标题 -->
          <text class="rc-title">{{ item.title }}</text>

          <!-- 标签芯片 -->
          <view class="rc-chips">
            <view class="rc-chip chip-kw" v-if="item.product_keywords">
              <text class="chip-ico">🔍</text>
              <text class="chip-text">{{ item.product_keywords }}</text>
            </view>
            <view class="rc-chip chip-comp" v-if="item.company_count != null">
              <text class="chip-ico">🏢</text>
              <text class="chip-text">{{ item.company_count }} 家企业</text>
            </view>
          </view>

          <!-- 底部：时间 + 查看详情按钮 -->
          <view class="rc-foot">
            <text class="rc-time">{{ formatTime(item.created_at) }}</text>
            <view class="rc-btn">
              <text class="rc-btn-text">查看详情</text>
              <text class="rc-btn-arrow">→</text>
            </view>
          </view>
        </view>

        <view class="footer-tip" v-if="loadingMore">
          <view class="loading-spinner"></view>
          <text>加载中...</text>
        </view>
        <view class="footer-tip" v-else-if="noMore && list.length">
          <text>· 到底了 ·</text>
        </view>
      </view>

      <!-- ========== 空状态 ========== -->
      <empty-state
        v-else
        title="暂时还没有AI报告"
        hint="生成AI分析报告后，记录会展示在这里。"
      />
    </scroll-view>
  </view>
</template>

<script>
import EmptyState from '@/common/components/empty-state.vue'
import { getAiReportList } from '@/static/api/index.js'

export default {
  components: {
    EmptyState
  },
  data() {
    return {
      list: [], // 报告列表数据
      total: 0, // 报告总数
      page: 1, // 当前页码
      limit: 20, // 每页条数
      loading: false, // 是否正在加载（首次）
      loadingMore: false, // 是否正在加载更多
      noMore: false, // 是否已加载全部
      refreshing: false, // 下拉刷新状态
      animStats: { total: 0, company: 0, keyword: 0 }, // 顶部统计数字（动画补间显示用）
      _tweenTimers: {} // 内部计时器存储
    }
  },
  watch: {
    // ----------- 监听统计数据变化，触发滚动动画
    total(v) { this.tweenStat('total', v) },
    totalCompanyCount(v) { this.tweenStat('company', v) },
    totalKeywords(v) { this.tweenStat('keyword', v) }
  },
  computed: {
    // ----------- 覆盖企业总数
    totalCompanyCount() {
      return this.list.reduce((sum, item) => sum + (item.company_count || 0), 0)
    },
    // ----------- 关键词去重数量
    totalKeywords() {
      const keywords = this.list.map(item => item.product_keywords).filter(Boolean)
      return new Set(keywords).size
    }
  },
  onLoad() {
    this.fetchList()
  },
  methods: {
    // ----------- 数字补间动画：从当前值缓动到目标值
    tweenStat(key, target) {
      const start = this.animStats[key] || 0
      if (start === target) return
      // 清掉旧的定时器，避免动画叠加
      if (this._tweenTimers[key]) clearInterval(this._tweenTimers[key])
      const duration = 900 // 总时长 ms
      const startTime = Date.now()
      this._tweenTimers[key] = setInterval(() => {
        const t = Math.min(1, (Date.now() - startTime) / duration)
        const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic 缓动
        this.animStats[key] = Math.round(start + (target - start) * eased)
        if (t >= 1) clearInterval(this._tweenTimers[key])
      }, 24)
    },

    // ----------- 点击卡片跳转报告详情
    goDetail(item) {
      if (!item || !item.id) return
      uni.navigateTo({
        url: `/pages-sub/mine/ai-report/detail?id=${item.id}`
      })
    },

    // ----------- 格式化时间戳
    formatTime(ts) {
      if (!ts) return '暂无时间'
      const d = new Date(ts * 1000)
      const Y = d.getFullYear()
      const M = String(d.getMonth() + 1).padStart(2, '0')
      const D = String(d.getDate()).padStart(2, '0')
      const h = String(d.getHours()).padStart(2, '0')
      const m = String(d.getMinutes()).padStart(2, '0')
      return `${Y}-${M}-${D} ${h}:${m}`
    },

    // ----------- 获取报告列表
    async fetchList(isRefresh = false) {
      if (!isRefresh && !this.list.length) {
        this.loading = true
      }
      if (isRefresh) {
        this.page = 1
        this.noMore = false
        this.refreshing = true
      }
      if (this.loadingMore || this.noMore) return

      try {
        const res = await getAiReportList({ page: this.page, limit: this.limit })
        const data = res?.data || {}
        const items = data.list || []
        const total = Number(data.total || 0)

        if (isRefresh || this.page === 1) {
          this.list = items
        } else {
          this.list = this.list.concat(items)
        }
        this.total = total || this.list.length

        if (items.length < this.limit) {
          this.noMore = true
        }
      } catch (e) {
        if (isRefresh || this.page === 1) {
          this.list = []
          this.total = 0
        }
      } finally {
        this.loading = false
        this.loadingMore = false
        this.refreshing = false
      }
    },

    // ----------- 下拉刷新
    onRefresh() {
      this.fetchList(true)
    },

    // ----------- 触底加载更多
    onLoadMore() {
      if (this.loadingMore || this.noMore || this.loading) return
      this.loadingMore = true
      this.page++
      this.fetchList()
    }
  }
}
</script>

<style scoped lang="scss">
page {
  background: #f5f7fc;
}

.report-page {
  position: relative;
  min-height: 100vh;
  background: #f5f7fc;
  overflow: hidden;
}

.page-scroll {
  position: relative;
  z-index: 2;
  height: 100vh;
  box-sizing: border-box;
}

// ==================== 背景光晕装饰
.page-decor {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.decor-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60rpx);
  opacity: 0.55;
}

.blob-blue {
  top: -120rpx;
  left: -100rpx;
  width: 420rpx;
  height: 420rpx;
  background: #c8d6ff;
}

.blob-purple {
  top: -60rpx;
  right: -120rpx;
  width: 360rpx;
  height: 360rpx;
  background: #e6d8ff;
}

// ==================== 顶部主视觉
.hero {
  padding: 36rpx 32rpx 8rpx;
}

.hero-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-info {
  flex: 1;
}

.hero-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.hero-title {
  font-size: 46rpx;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
  letter-spacing: 0.5rpx;
}

// 标题渐变文字效果
.hero-title-gradient {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.hero-sparkle {
  font-size: 30rpx;
  line-height: 1;
}

.hero-desc {
  margin-top: 12rpx;
  font-size: 25rpx;
  color: #64748b;
  line-height: 1.45;
}

// AI Orb
.hero-orb {
  position: relative;
  flex-shrink: 0;
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #818cf8, #c084fc);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 14rpx 30rpx rgba(129, 140, 248, 0.4), 0 4rpx 10rpx rgba(192, 132, 252, 0.25);
}

// AI Orb 外圈扩散脉冲环
.orb-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2rpx solid rgba(139, 92, 246, 0.5);
  pointer-events: none;
}

.hero-orb-inner {
  width: 86rpx;
  height: 86rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-orb-text {
  font-size: 32rpx;
  font-weight: 800;
  color: #fff;
  letter-spacing: 2rpx;
}

// 统计卡片组
.stat-row {
  display: flex;
  gap: 14rpx;
  margin-top: 36rpx;
}

.stat-tile {
  flex: 1;
  min-width: 0;
  padding: 22rpx 18rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 8rpx 22rpx rgba(99, 102, 241, 0.07);
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.stat-ico {
  flex-shrink: 0;
  width: 64rpx;
  height: 64rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-ico-txt {
  font-size: 30rpx;
}

.stat-ico-blue {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.18);
}

.stat-ico-green {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  box-shadow: 0 4rpx 12rpx rgba(16, 185, 129, 0.18);
}

.stat-ico-purple {
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
  box-shadow: 0 4rpx 12rpx rgba(139, 92, 246, 0.18);
}

.stat-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.stat-num {
  font-size: 34rpx;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
}

.stat-label {
  font-size: 21rpx;
  color: #94a3b8;
}

// ==================== 列表区标题
.list-head {
  display: flex;
  align-items: center;
  margin: 44rpx 32rpx 20rpx;
}

.lh-bar {
  width: 8rpx;
  height: 28rpx;
  border-radius: 6rpx;
  margin-right: 14rpx;
  background: linear-gradient(180deg, #6366f1, #a855f7);
}

.lh-title {
  flex: 1;
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.lh-count {
  font-size: 22rpx;
  color: #94a3b8;
}

// ==================== 报告列表
.report-list,
.skeleton-wrap {
  padding: 0 28rpx 56rpx;
}

.r-card {
  position: relative;
  overflow: hidden;
  margin-bottom: 22rpx;
  padding: 28rpx 30rpx 26rpx;
  border-radius: 28rpx;
  background: #fff;
  border: 1rpx solid #eef0f6;
  box-shadow: 0 10rpx 28rpx rgba(15, 23, 42, 0.05);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:active {
    transform: scale(0.99);
    box-shadow: 0 4rpx 14rpx rgba(15, 23, 42, 0.06);
  }
}

// 卡片右上角柔和光晕
.rc-halo {
  position: absolute;
  right: -80rpx;
  top: -80rpx;
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, rgba(99, 102, 241, 0.08) 40%, transparent 70%);
  pointer-events: none;
}

// 卡片编号胶囊
.rc-no {
  display: flex;
  align-items: baseline;
  gap: 2rpx;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #eef2ff, #f5f3ff);
  border: 1rpx solid rgba(139, 92, 246, 0.15);
}

.rc-no-hash {
  font-size: 22rpx;
  color: #a78bfa;
  font-weight: 600;
}

.rc-no-num {
  font-size: 24rpx;
  font-weight: 800;
  color: #6d28d9;
  letter-spacing: 1rpx;
}

.rc-head {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18rpx;
}

.rc-status {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 6rpx 16rpx 6rpx 8rpx;
  border-radius: 999rpx;
  background: rgba(16, 185, 129, 0.1);
}

.rc-status-dot-wrap {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.rc-status-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #10b981;
}

.rc-status-text {
  font-size: 22rpx;
  font-weight: 600;
  color: #059669;
}

.rc-time {
  font-size: 26rpx;
  color: #5e6a7c;
}

.rc-title {
  position: relative;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  font-size: 33rpx;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.45;
}

// 标签芯片
.rc-chips {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 22rpx;
}

.rc-chip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  max-width: 100%;
  padding: 10rpx 18rpx;
  border-radius: 14rpx;
}

.chip-ico {
  font-size: 22rpx;
}

.chip-text {
  font-size: 24rpx;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-kw {
  background: linear-gradient(135deg, #eef2ff, #ede9fe);
  border: 1rpx solid rgba(99, 102, 241, 0.12);
  .chip-text { color: #6366f1; }
}

.chip-comp {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: 1rpx solid rgba(16, 185, 129, 0.12);
  .chip-text { color: #059669; }
}

// 底部：时间 + 按钮
.rc-foot {
  position: relative;
  margin-top: 24rpx;
  padding-top: 22rpx;
  border-top: 1rpx dashed #eef0f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rc-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 26rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  box-shadow: 0 8rpx 18rpx rgba(99, 102, 241, 0.3);
}

.rc-btn-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #fff;
}

.rc-btn-arrow {
  font-size: 26rpx;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

// ==================== 骨架屏
.skeleton-card {
  margin-bottom: 22rpx;
  padding: 28rpx;
  border-radius: 26rpx;
  background: #fff;
  box-shadow: 0 10rpx 26rpx rgba(33, 57, 96, 0.05);
}

.skeleton-line {
  height: 28rpx;
  border-radius: 8rpx;
  background: #e9eef5;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-title {
  width: 75%;
  height: 32rpx;
  margin-bottom: 24rpx;
}

.skeleton-tags {
  display: flex;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.skeleton-tag {
  width: 110rpx;
  height: 40rpx;
  border-radius: 999rpx;
  background: #e9eef5;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-short {
  width: 40%;
}

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

// ==================== 底部提示
.footer-tip {
  padding: 28rpx 0 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  font-size: 23rpx;
  color: #94a3b8;
  letter-spacing: 4rpx;
}

.loading-spinner {
  width: 28rpx;
  height: 28rpx;
  border: 3rpx solid #e3eaf4;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// ==================== 动画
// 通用淡入上移
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28rpx); }
  to { opacity: 1; transform: translateY(0); }
}

// 缩放淡入
@keyframes popIn {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}

// 背景光晕缓慢漂浮呼吸
@keyframes blobDrift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30rpx, 20rpx) scale(1.1); }
}

.blob-blue {
  animation: blobDrift 11s ease-in-out infinite;
}

.blob-purple {
  animation: blobDrift 13s ease-in-out infinite reverse;
}

// Hero 信息淡入
.hero-info {
  animation: fadeUp 0.6s 0.05s ease-out both;
}

// 标题 ✨ 表情扭动闪烁
@keyframes sparkleTwinkle {
  0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
  50% { opacity: 0.55; transform: scale(1.25) rotate(18deg); }
}

.hero-sparkle {
  display: inline-block;
  animation: sparkleTwinkle 2.2s ease-in-out infinite;
}

// AI Orb 弹入 + 呼吸光晕
@keyframes orbBreath {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 14rpx 30rpx rgba(129, 140, 248, 0.4), 0 4rpx 10rpx rgba(192, 132, 252, 0.25);
  }
  50% {
    transform: scale(1.06);
    box-shadow: 0 18rpx 40rpx rgba(129, 140, 248, 0.55), 0 6rpx 16rpx rgba(192, 132, 252, 0.4);
  }
}

.hero-orb {
  animation: popIn 0.6s 0.2s ease-out both, orbBreath 3s ease-in-out infinite 0.9s;
}

// Orb 内核：旋转高光环
.hero-orb-inner {
  position: relative;
  overflow: hidden;
}

.hero-orb-inner::after {
  content: '';
  position: absolute;
  inset: -50%;
  background: conic-gradient(from 0deg, transparent 60%, rgba(255, 255, 255, 0.5) 75%, transparent 90%);
  animation: spin 4s linear infinite;
}

// 统计卡片错峰淡入
.stat-tile {
  animation: fadeUp 0.55s ease-out both;
}

.stat-tile:nth-child(1) { animation-delay: 0.25s; }
.stat-tile:nth-child(2) { animation-delay: 0.35s; }
.stat-tile:nth-child(3) { animation-delay: 0.45s; }

// 图标徽章悬浮微弹
@keyframes icoBob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4rpx); }
}

.stat-ico {
  animation: icoBob 3s ease-in-out infinite;
}

.stat-tile:nth-child(2) .stat-ico { animation-delay: 0.4s; }
.stat-tile:nth-child(3) .stat-ico { animation-delay: 0.8s; }

// 列表区标题淡入
.list-head {
  animation: fadeUp 0.5s 0.55s ease-out both;
}

// 报告卡片错峰淡入（动画 delay 来自模板内联 style）
.r-card {
  animation: fadeUp 0.55s ease-out both;
}

// 状态点呼吸脉冲
@keyframes dotPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
  70% { box-shadow: 0 0 0 12rpx rgba(16, 185, 129, 0); }
}

.rc-status-dot {
  animation: dotPulse 1.8s ease-in-out infinite;
}

// AI Orb 外圈脉冲环：从中心向外扩散
@keyframes orbRingPulse {
  0% { transform: scale(1); opacity: 0.7; }
  100% { transform: scale(2); opacity: 0; }
}

.orb-ring {
  animation: orbRingPulse 2.4s ease-out infinite;
}

.orb-ring-2 {
  animation-delay: 1.2s;
}

// 卡片右上角光晕缓慢呼吸
@keyframes haloBreath {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.12); }
}

.rc-halo {
  animation: haloBreath 4s ease-in-out infinite;
}

// 标题渐变流动
@keyframes gradientFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.hero-title-gradient {
  background-size: 200% 200%;
  animation: gradientFlow 5s ease-in-out infinite;
}

// 渐变按钮：光带扫过
.rc-btn {
  position: relative;
  overflow: hidden;
}

.rc-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: -60%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
  transform: skewX(-20deg);
  animation: btnShimmer 3.5s ease-in-out infinite;
}

@keyframes btnShimmer {
  0% { left: -60%; }
  55%, 100% { left: 160%; }
}

// 按钮文字相对定位避免被光带盖住
.rc-btn-text,
.rc-btn-arrow {
  position: relative;
  z-index: 1;
}

// 按钮箭头微移
@keyframes arrowSlide {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(4rpx); }
}

.rc-btn-arrow {
  animation: arrowSlide 1.6s ease-in-out infinite;
}
</style>
