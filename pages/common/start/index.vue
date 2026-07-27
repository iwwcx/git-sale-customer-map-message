<template>
  <view class="splash-container">
    <!-- 启动图背景 -->
    <view class="splash-bg-container">
      <image
        class="splash-bg"
        src="https://img2cdn.global-dsc.cn/dgzz_img/9a7371551b21f63449a088af071bd889.jpg"
        mode="aspectFill"
      ></image>
    </view>

    <!-- 倒计时跳过按钮 -->
    <view class="skip-btn" @tap="onSkip">
      <text class="skip-text">{{ countdown }} 秒 | 跳过</text>
    </view>
  </view>
</template>

<script>
import { bindShare } from '@/static/api/index.js'

export default {
  data() {
    return {
      countdown: 3,
      timer: null
    }
  },
  onLoad(options) {
    // 检查是否有分享参数，有的话绑定分享关系
    if (options && options.shareValue) {
      this.bindShareRelation(options.shareValue)
    }
    this.startCountdown()
  },
  onUnload() {
    this.clearTimer()
  },
  methods: {
    // 开始倒计时
    startCountdown() {
      this.timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 1) {
          this.clearTimer()
          this.goToMain()
        }
      }, 1000)
    },

    // 清除定时器
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },

    // 跳过按钮点击
    onSkip() {
      this.clearTimer()
      this.goToMain()
    },

    // 跳转到主页
    goToMain() {
      uni.switchTab({
        url: '/pages/map/index'
      })
    },

    // ----------- 绑定分享关系
    async bindShareRelation(shareValue) {
      try {
        await bindShare({ shareValue })
      } catch (e) {
        // 接口异常静默处理
      }
    }
  }
}
</script>

<style scoped lang="scss">
page {
  width: 100%;
  margin: 0;
  padding: 0;
}

.splash-container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;

  .splash-bg {
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
  }

  .skip-btn {
    position: absolute;
    top: 110rpx;
    left: 30rpx;
    width: 170rpx;
    height: 60rpx;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;

    .skip-text {
      font-size: 26rpx;
      color: #ffffff;
    }
  }
}
</style>
