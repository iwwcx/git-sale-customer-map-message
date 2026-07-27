<!-- 时间筛选抽屉：右侧滑入，目前只有「线索时间」筛选 -->
<template>
  <view v-if="visible" class="tf-mask" :class="{ 'mask-hide': closing }" @tap="close">
    <view class="tf-drawer" :class="{ 'drawer-hide': closing }" @tap.stop>
      <!-- 顶部标题栏 -->
      <view class="drawer-header">
        <text class="header-title">搜索条件</text>
        <view class="header-close" @tap="close">×</view>
      </view>

      <!-- 内容区 -->
      <scroll-view scroll-y class="drawer-body">
        <!-- 时间筛选 -->
        <view class="section">
          <view class="section-title">时间筛选</view>
          <view class="tag-wrap">
            <view
              v-for="item in timeOptions"
              :key="item.value"
              class="filter-tag"
              :class="{ 'tag-active': selectedTime === item.value }"
              @tap="selectedTime = item.value"
            >
              {{ item.label }}
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 底部操作按钮 -->
      <view class="drawer-footer">
        <view class="footer-btn btn-reset" @tap="onReset">重置</view>
        <view class="footer-btn btn-confirm" @tap="onConfirm">确定</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TimeFilterDrawer',
  props: {
    visible: { type: Boolean, default: false }
  },
  data() {
    return {
      closing: false, // 关闭动画标记
      selectedTime: 'all', // 当前选中的时间范围
      // 时间选项：all=全部，1=1个月以内，3=3个月以内，6=6个月以内
      timeOptions: [
        { label: '全部', value: 'all' },
        { label: '1个月以内', value: '1' },
        { label: '3个月以内', value: '3' },
        { label: '6个月以内', value: '6' }
      ]
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.closing = false
      }
    }
  },
  methods: {
    // ----------- 计算时间范围
    getTimeRange() {
      if (this.selectedTime === 'all') return null
      const now = new Date()
      const endTime = this.formatDate(now)
      const start = new Date()
      start.setMonth(start.getMonth() - parseInt(this.selectedTime))
      const startTime = this.formatDate(start)
      return { startTime, endTime }
    },

    // ----------- 格式化日期为 YYYY-MM-DD HH:mm:ss
    formatDate(date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const h = String(date.getHours()).padStart(2, '0')
      const min = String(date.getMinutes()).padStart(2, '0')
      const s = String(date.getSeconds()).padStart(2, '0')
      return `${y}-${m}-${d} ${h}:${min}:${s}`
    },

    // ----------- 重置
    onReset() {
      this.selectedTime = 'all'
    },

    // ----------- 确定：抛出时间范围并关闭
    onConfirm() {
      const range = this.getTimeRange()
      this.$emit('confirm', range)
      this.close()
    },

    // ----------- 关闭抽屉
    close() {
      this.closing = true
      setTimeout(() => {
        this.closing = false
        this.$emit('close')
      }, 240)
    }
  }
}
</script>

<style scoped lang="scss">
// ==================== 遮罩
.tf-mask {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 999;
  animation: maskShow 0.25s ease both;
}
.mask-hide {
  animation: maskHide 0.22s ease both;
}

// ==================== 抽屉主体（右侧滑入）
.tf-drawer {
  position: absolute;
  top: 0; right: 0; bottom: 0;
  width: 78%;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: -8rpx 0 24rpx rgba(0, 0, 0, 0.08);
  animation: drawerShow 0.26s ease both;
}
.drawer-hide {
  animation: drawerHide 0.24s ease both;
}

// 顶部标题
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 28rpx 20rpx;
  padding-top: calc(32rpx + env(safe-area-inset-top));

  .header-title {
    font-size: 34rpx;
    font-weight: 700;
    color: #1a1a1a;
  }

  .header-close {
    width: 56rpx;
    height: 56rpx;
    line-height: 50rpx;
    text-align: center;
    font-size: 40rpx;
    color: #666;

    &:active { opacity: 0.7; }
  }
}

// 内容区
.drawer-body {
  flex: 1;
  height: 0;
  padding: 0 28rpx;
  box-sizing: border-box;
}

.section {
  padding: 30rpx 0 10rpx;

  .section-title {
    font-size: 30rpx;
    color: #2962ff;
    margin-bottom: 30rpx;
  }
}

.tag-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.filter-tag {
  padding: 0 28rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 10rpx;
  background: #f4f6fa;
  border: 2rpx solid transparent;
  color: #5a6178;
  font-size: 26rpx;

  &:active { opacity: 0.82; }

  &.tag-active {
    background: #eaf1ff;
    color: #2962ff;
    border-color: #2962ff;
    font-weight: 500;
  }
}

// 底部按钮
.drawer-footer {
  display: flex;
  gap: 24rpx;
  padding: 40rpx 28rpx;
  border-top: 1rpx solid #f0f2f5;

  .footer-btn {
    flex: 1;
    height: 80rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    font-weight: 600;

    &:active { opacity: 0.85; }

    &.btn-reset {
      background: #ff6d61;
      color: #fff;
    }

    &.btn-confirm {
      flex: 1;
      background: #2962ff;
      color: #fff;
      box-shadow: 0 6rpx 18rpx rgba(41, 98, 255, 0.25);
    }
  }
}

@keyframes maskShow {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes maskHide {
  from { opacity: 1; }
  to   { opacity: 0; }
}
@keyframes drawerShow {
  from { transform: translate3d(100%, 0, 0); }
  to   { transform: translate3d(0, 0, 0); }
}
@keyframes drawerHide {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(100%, 0, 0); }
}
</style>
