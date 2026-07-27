<template>
  <view class="member-mask-wrap">
    <!-- 默认插槽：放正常页面内容 -->
    <slot />

    <!-- 非会员时显示模糊蒙层 -->
    <view v-if="showMask" class="member-mask" :class="{ 'mask-leave': closing }" @touchmove.stop.prevent>
      <view class="blur-layer" />

      <!-- 黑金豪华卡片 -->
      <view class="mask-card" :class="{ 'card-leave': closing }">
        <!-- 金色边框光层 -->
        <view class="card-border" />
        <!-- 背景装饰光晕 -->
        <view class="bg-glow bg-glow-top" />
        <view class="bg-glow bg-glow-bottom" />
        <!-- 四角金纹装饰 -->
        <view class="corner corner-tl" />
        <view class="corner corner-tr" />
        <view class="corner corner-bl" />
        <view class="corner corner-br" />
        <!-- 漂浮粒子 -->
        <view class="particle particle-1" />
        <view class="particle particle-2" />
        <view class="particle particle-3" />
        <view class="particle particle-4" />

        <view class="mask-content">
          <!-- 顶部 VIP 标识 -->
          <view class="vip-badge">
            <view class="badge-line" />
            <text class="badge-text">EXCLUSIVE MEMBER</text>
            <view class="badge-line" />
          </view>

          <!-- 中央冠图标 -->
          <view class="icon-wrap">
            <view class="icon-ring icon-ring-outer" />
            <view class="icon-ring icon-ring-inner" />
            <view class="icon-core">
              <text class="mask-icon">♕</text>
            </view>
          </view>

          <!-- 主标题 -->
          <text class="mask-title">{{ title }}</text>
          <view class="title-deco">
            <view class="deco-line" />
            <text class="deco-diamond">◆</text>
            <view class="deco-line" />
          </view>
          <text class="mask-sub">{{ subTitle }}</text>

          <!-- 开通按钮 -->
          <view class="member-btn" @tap="onBtnTap">
            <view class="btn-shine" />
            <text class="btn-text">{{ btnText }}</text>
            <text class="btn-arrow">→</text>
          </view>

          <text v-if="showClose" class="mask-close" @tap="onClose">{{ closeText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { mixinCheckIsMember } from '@/common/utils/member.js'
/**
 * visible的作用
 * 包裹模式（不传 visible）：把要保护的内容塞进 <member-mask> 默认插槽里，组件自己 mounted 时调 mixinCheckIsMember() 检测会员状态，非会员才显示蒙层，会员就看见正常内容。
 * 弹窗模式（传 :visible="true"）：手动控制何时弹（比如点击筛选确定、点工程师后），强制显示，不再依赖组件内部会员判断。
 */
export default {
  name: 'MemberMask',
  props: {
    visible: { type: Boolean, default: false }, // 是否强制显示蒙层（默认自动检测会员状态）
    title: { type: String, default: '该内容仅限会员查看' }, // 蒙层主标题
    subTitle: { type: String, default: '开通会员即可查看完整信息' }, // 蒙层副标题
    btnText: { type: String, default: '立即开通' }, // 开通按钮文案
    showClose: { type: Boolean, default: true }, // 是否显示关闭按钮
    closeText: { type: String, default: '暂不开通' }, // 关闭按钮文案
    navigateUrl: { type: String, default: '/pages/common/pay/pay' }, // 点击开通按钮后的跳转路径，不传则只触发事件
    // closeBack: { type: Boolean, default: false } // 点击关闭时是否返回上一页（弹窗模式传 false，仅关闭蒙层）
  },
  data() {
    return {
      isMember: false, // 当前是否会员，onShow/mounted 时刷新
      closing: false   // 关闭动画标记，为 true 时添加退场动画类名
    }
  },
  computed: {
    showMask() { // 计算是否显示蒙层：强制显示 或 非会员
      return this.visible || !this.isMember
    }
  },
  onShow() {
    this.refresh() // 页面显示时刷新会员状态，处理后退回来的情况
  },
  mounted() {
    this.refresh() // 组件挂载时刷新会员状态
  },
  methods: {
    // -------------- 刷新会员状态
    refresh() {
      this.isMember = mixinCheckIsMember()
    },

    // -------------- 点击开通按钮
    onBtnTap() {
      this.$emit('confirm') // 通知父组件点击了开通
      if (this.navigateUrl) {
        uni.navigateTo({ url: this.navigateUrl }) // 配置了跳转路径就直接跳转
      }
    },

    // -------------- 点击关闭/暂不查看（带退场动画）
    onClose() {
      if (this.closing) return // 防重复点击
      this.closing = true
      // 动画结束后再通知父组件销毁，与 CSS 中的 0.28s 保持一致
      setTimeout(() => {
        this.closing = false
        this.$emit('close') // 通知父组件点击了关闭
        // if (this.closeBack) uni.navigateBack({ delta: 1 }) // 默认不返回上一页，只有 closeBack=true 时才返回
      }, 280)
    }
  }
}
</script>

<style scoped lang="scss">
.member-mask-wrap {
  position: relative;
}

.member-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  // 入场：背景层淡入
  animation: maskFadeIn 0.28s ease both;

  // 退场：背景层淡出
  &.mask-leave {
    animation: maskFadeOut 0.28s ease both;
  }

  // 入场时卡片缩放上浮
  .mask-card {
    animation: cardZoomIn 0.32s cubic-bezier(0.34, 1.3, 0.64, 1) both;
  }

  // 退场时卡片缩小淡出
  .mask-card.card-leave {
    animation: cardZoomOut 0.26s ease both;
  }

  .blur-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(16rpx);
    -webkit-backdrop-filter: blur(16rpx);
    background: rgba(10, 14, 30, 0.45);
  }

  // 黑金豪华卡片外层
  .mask-card {
    position: relative;
    width: 580rpx;
    border-radius: 28rpx;
    background:
      radial-gradient(ellipse at top, #2a2f55 0%, #1a1d3a 40%, #0d0f24 100%);
    box-shadow:
      0 30rpx 80rpx rgba(0, 0, 0, 0.5),
      0 8rpx 24rpx rgba(0, 0, 0, 0.3),
      inset 0 1rpx 0 rgba(255, 255, 255, 0.08);
    overflow: hidden;
  }

  // 金色渐变边框
  .card-border {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 28rpx;
    padding: 2rpx;
    background: linear-gradient(135deg,
      rgba(245, 200, 100, 0.6) 0%,
      rgba(245, 200, 100, 0.1) 25%,
      rgba(245, 200, 100, 0) 50%,
      rgba(245, 200, 100, 0.1) 75%,
      rgba(245, 200, 100, 0.5) 100%);
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
            mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    pointer-events: none;
  }

  // 背景装饰光晕
  .bg-glow {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(20rpx);
  }
  .bg-glow-top {
    top: -150rpx;
    right: -80rpx;
    width: 320rpx;
    height: 320rpx;
    background: radial-gradient(circle, rgba(245, 200, 100, 0.25) 0%, transparent 70%);
  }
  .bg-glow-bottom {
    bottom: -100rpx;
    left: -80rpx;
    width: 280rpx;
    height: 280rpx;
    background: radial-gradient(circle, rgba(100, 140, 255, 0.2) 0%, transparent 70%);
  }

  // 四角装饰线
  .corner {
    position: absolute;
    width: 40rpx;
    height: 40rpx;
    pointer-events: none;
  }
  .corner-tl {
    top: 20rpx;
    left: 20rpx;
    border-top: 2rpx solid rgba(245, 200, 100, 0.5);
    border-left: 2rpx solid rgba(245, 200, 100, 0.5);
    border-top-left-radius: 8rpx;
  }
  .corner-tr {
    top: 20rpx;
    right: 20rpx;
    border-top: 2rpx solid rgba(245, 200, 100, 0.5);
    border-right: 2rpx solid rgba(245, 200, 100, 0.5);
    border-top-right-radius: 8rpx;
  }
  .corner-bl {
    bottom: 20rpx;
    left: 20rpx;
    border-bottom: 2rpx solid rgba(245, 200, 100, 0.5);
    border-left: 2rpx solid rgba(245, 200, 100, 0.5);
    border-bottom-left-radius: 8rpx;
  }
  .corner-br {
    bottom: 20rpx;
    right: 20rpx;
    border-bottom: 2rpx solid rgba(245, 200, 100, 0.5);
    border-right: 2rpx solid rgba(245, 200, 100, 0.5);
    border-bottom-right-radius: 8rpx;
  }

  // 漂浮粒子
  .particle {
    position: absolute;
    width: 6rpx;
    height: 6rpx;
    border-radius: 50%;
    background: #f5c864;
    box-shadow: 0 0 12rpx 2rpx rgba(245, 200, 100, 0.8);
    pointer-events: none;
    animation: floatParticle 4s ease-in-out infinite;
  }
  .particle-1 { top: 18%; left: 15%; animation-delay: 0s; }
  .particle-2 { top: 30%; right: 12%; width: 4rpx; height: 4rpx; animation-delay: 1s; }
  .particle-3 { bottom: 28%; left: 18%; width: 5rpx; height: 5rpx; animation-delay: 2s; }
  .particle-4 { bottom: 18%; right: 16%; width: 4rpx; height: 4rpx; animation-delay: 3s; }

  .mask-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64rpx 48rpx 52rpx;
  }

  // 顶部 VIP 标识行
  .vip-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    margin-bottom: 36rpx;

    .badge-line {
      width: 60rpx;
      height: 1rpx;
      background: linear-gradient(90deg, transparent, rgba(245, 200, 100, 0.6), transparent);
    }
    .badge-text {
      font-size: 20rpx;
      letter-spacing: 6rpx;
      font-weight: 500;
      background: linear-gradient(135deg, #f5d98f 0%, #d4a052 50%, #f5d98f 100%);
      -webkit-background-clip: text;
              background-clip: text;
      color: transparent;
    }
  }

  // 冠图标容器
  .icon-wrap {
    position: relative;
    width: 180rpx;
    height: 180rpx;
    margin-bottom: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // 环状装饰
  .icon-ring {
    position: absolute;
    border-radius: 50%;
    border: 1rpx solid rgba(245, 200, 100, 0.3);
  }
  .icon-ring-outer {
    width: 180rpx;
    height: 180rpx;
    animation: ringRotate 12s linear infinite;

    &::before, &::after {
      content: '';
      position: absolute;
      width: 8rpx;
      height: 8rpx;
      border-radius: 50%;
      background: #f5c864;
      box-shadow: 0 0 10rpx rgba(245, 200, 100, 0.9);
    }
    &::before { top: -4rpx; left: 50%; margin-left: -4rpx; }
    &::after { bottom: -4rpx; left: 50%; margin-left: -4rpx; }
  }
  .icon-ring-inner {
    width: 144rpx;
    height: 144rpx;
    border-color: rgba(245, 200, 100, 0.2);
    animation: ringRotate 8s linear infinite reverse;
  }

  // 冠中心渐变球
  .icon-core {
    position: relative;
    width: 108rpx;
    height: 108rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(circle at 30% 30%, #fff4d6 0%, #f5c864 30%, #c89538 70%, #8a6020 100%);
    box-shadow:
      0 0 40rpx rgba(245, 200, 100, 0.5),
      0 8rpx 20rpx rgba(0, 0, 0, 0.4),
      inset 0 -6rpx 12rpx rgba(80, 50, 10, 0.5),
      inset 0 3rpx 8rpx rgba(255, 240, 200, 0.6);
    animation: corePulse 3s ease-in-out infinite;
  }

  .mask-icon {
    font-size: 60rpx;
    line-height: 1;
    color: #4a3010;
    text-shadow: 0 2rpx 4rpx rgba(255, 240, 200, 0.5);
  }

  // 主标题（金色渐变文字）
  .mask-title {
    font-size: 40rpx;
    font-weight: 700;
    line-height: 1.4;
    letter-spacing: 6rpx;
    background: linear-gradient(135deg, #fff4d6 0%, #f5c864 40%, #d4a052 60%, #fff4d6 100%);
    -webkit-background-clip: text;
            background-clip: text;
    color: transparent;
  }

  // 标题下方菱形装饰
  .title-deco {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    margin-top: 18rpx;

    .deco-line {
      width: 50rpx;
      height: 1rpx;
      background: linear-gradient(90deg, transparent, rgba(245, 200, 100, 0.6), transparent);
    }
    .deco-diamond {
      font-size: 14rpx;
      color: #f5c864;
    }
  }

  .mask-sub {
    margin-top: 22rpx;
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.55);
    line-height: 1.5;
    letter-spacing: 1rpx;
  }

  // 金色渐变按钮
  .member-btn {
    position: relative;
    margin-top: 52rpx;
    width: 380rpx;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5d98f 0%, #e0b865 50%, #c89538 100%);
    border-radius: 44rpx;
    box-shadow:
      0 12rpx 32rpx rgba(200, 149, 56, 0.4),
      0 4rpx 12rpx rgba(0, 0, 0, 0.2),
      inset 0 1rpx 2rpx rgba(255, 255, 255, 0.6),
      inset 0 -2rpx 6rpx rgba(140, 90, 20, 0.3);
    transition: transform 0.2s, box-shadow 0.2s;
    overflow: hidden;

    // 按钮扫光动画层
    .btn-shine {
      position: absolute;
      top: 0;
      left: -100%;
      width: 60%;
      height: 100%;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.5) 50%,
        transparent 100%);
      animation: btnShine 2.8s ease-in-out infinite;
    }

    .btn-text {
      position: relative;
      font-size: 30rpx;
      font-weight: 700;
      letter-spacing: 6rpx;
      color: #4a3010;
    }
    .btn-arrow {
      position: relative;
      margin-left: 12rpx;
      font-size: 28rpx;
      font-weight: 600;
      color: #4a3010;
    }

    &:active {
      transform: translateY(2rpx);
      box-shadow:
        0 6rpx 16rpx rgba(200, 149, 56, 0.35),
        inset 0 1rpx 2rpx rgba(255, 255, 255, 0.4);
    }
  }

  .mask-close {
    margin-top: 30rpx;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.55);
    letter-spacing: 2rpx;
    transition: color 0.2s;

    &:active {
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

// 外环旋转动画
@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

// 中心球呼吸动画
@keyframes corePulse {
  0%, 100% {
    box-shadow:
      0 0 40rpx rgba(245, 200, 100, 0.5),
      0 8rpx 20rpx rgba(0, 0, 0, 0.4),
      inset 0 -6rpx 12rpx rgba(80, 50, 10, 0.5),
      inset 0 3rpx 8rpx rgba(255, 240, 200, 0.6);
  }
  50% {
    box-shadow:
      0 0 60rpx rgba(245, 200, 100, 0.75),
      0 8rpx 20rpx rgba(0, 0, 0, 0.4),
      inset 0 -6rpx 12rpx rgba(80, 50, 10, 0.5),
      inset 0 3rpx 8rpx rgba(255, 240, 200, 0.6);
  }
}

// 粒子漂浮动画
@keyframes floatParticle {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
  50%      { transform: translateY(-20rpx) scale(1.3); opacity: 1; }
}

// 按钮扫光动画
@keyframes btnShine {
  0%   { left: -60%; }
  60%  { left: 110%; }
  100% { left: 110%; }
}

// 蒙层入场淡入
@keyframes maskFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

// 蒙层退场淡出
@keyframes maskFadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}

// 卡片入场：从下方略小淡入弹出
@keyframes cardZoomIn {
  0%   { opacity: 0; transform: translateY(40rpx) scale(0.85); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

// 卡片退场：缩小淡出
@keyframes cardZoomOut {
  0%   { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(20rpx) scale(0.9); }
}
</style>
