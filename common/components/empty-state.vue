<!-- 暂无数据空状态组件 -->
<template>
  <view class="empty-tip">
    <view class="empty-illustration">
      <view class="empty-float empty-float-1"></view>
      <view class="empty-float empty-float-2"></view>
      <view class="empty-box">
        <text class="empty-box-icon">📦</text>
      </view>
    </view>
    <text class="empty-text">{{ title }}</text>
    <text v-if="hint" class="empty-hint">{{ hint }}</text>
  </view>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    title: {
      type: String,
      default: '暂无记录'
    },
    hint: {
      type: String,
      default: '目前暂时没有数据呢'
    }
  }
}
</script>

<style scoped lang="scss">
.empty-tip {
  text-align: center;
  padding: 80rpx 0;

  .empty-illustration {
    position: relative;
    width: 240rpx;
    height: 200rpx;
    margin: 0 auto 48rpx;

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

      .empty-box-icon {
        font-size: 60rpx;
        line-height: 60rpx;
        animation: iconShake 2.5s ease-in-out infinite;
      }
    }
  }

  .empty-text {
    color: #4a83f9;
    font-size: 32rpx;
    font-weight: 600;
    line-height: 44rpx;
    margin-bottom: 16rpx;
    display: block;
  }

  .empty-hint {
    display: block;
    color: #a0aab8;
    font-size: 26rpx;
    line-height: 36rpx;
  }
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
</style>
