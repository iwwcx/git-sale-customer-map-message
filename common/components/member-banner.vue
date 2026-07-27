<!-- 非会员使用横幅组件 -->
<template>
  <view>
    <view v-if="showBanner" class="member-banner" :class="{ fixed: fixed }" @tap="onClickBanner">
      <text class="banner-text" v-if="remainingDays > 0">您当前试用时间剩余 {{ remainingDays }} 天，</text>
      <text class="banner-text" v-else>您的试用期已过，</text>
      <text class="banner-link">点击成为正式会员</text>
      <view class="banner-close" @tap.stop="onCloseBanner">
        <text class="close-icon">×</text>
      </view>
    </view>

    <!-- 开通会员提示弹窗 -->
    <view v-if="showDialog" class="member-dialog-mask" :class="{ closing: dialogClosing }" @tap="onCancelDialog">
      <view class="member-dialog" :class="{ closing: dialogClosing }" @tap.stop>
        <view class="dialog-close" @tap="onCancelDialog">
          <text class="close-icon">×</text>
        </view>
        <view class="dialog-title">温馨提示</view>
        <view class="dialog-content">您目前不是正式会员，请联系客服开通会员，或者直接缴费成为会员。</view>
        <view class="dialog-actions">
          <view class="dialog-btn btn-contact" @tap="onContactService">{{ isInvite ? '联系推荐官' : '联系客服' }}</view>
          <view class="dialog-btn btn-pay" @tap="onPay">我要缴费</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getInvite, getInviterPromoterPayInfo } from '@/static/api/index.js'

export default {
  name: 'MemberBanner',
  props: {
    fixed: { type: Boolean, default: false }     // 是否 fixed 定位（用于原生组件页面置顶）
  },
  data() {
    return {
      showBanner: true, // 是否展示横幅（可手动关闭）
      showDialog: false, // 是否展示开通会员提示弹窗
      dialogClosing: false, // 弹窗是否处于关闭动画中
      isInvite: false, // 是否已填写邀请码
      invitePhone: '', // 邀请人手机号
      servicePhone: '19819976695' // 客服电话
    }
  },
  computed: {
    // ----------- 根据 expireTime 计算剩余天数，非会员或过期返回 0
    remainingDays() {
      const memberInfo = uni.getStorageSync('memberInfo') || {}
      if (!memberInfo.isMember) return 0 // 非会员
      const expireTime = memberInfo.expireTime
      if (!expireTime) return 0
      const expire = new Date(expireTime.replace(/-/g, '/'))
      const now = new Date()
      const diff = expire.getTime() - now.getTime()
      if (diff <= 0) return 0 // 已过期
      return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }
  },
  mounted() {
    this.fetchInviteStatus()
  },
  methods: {
    // ----------- 查询是否已填写邀请码
    async fetchInviteStatus() {
      try {
        const res = await getInvite()
        if (res && res.data) {
          // isInvite 为 true 表示已填写
          this.isInvite = !!res.data.isInvite
          if (this.isInvite) {
            // 已绑定时额外调用 inviteeList 获取邀请人手机号
            this.fetchInvitePhone()
          }
        }
      } catch (e) {
        this.checked = true
        // 接口异常保持未填写状态，允许用户尝试提交
      }
    },

    // ----------- 调用 getInviterPromoterPayInfo 获取推荐官电话
    async fetchInvitePhone() {
      try {
        const res = await getInviterPromoterPayInfo()
        const data = res?.data || {}
        const phone = data.phone || ''
        this.invitePhone = phone || ""
      } catch (e) {
        this.invitePhone = ""
      }
    },

    // ----------- 点击横幅触发事件，弹出开通会员提示
    onClickBanner() {
      this.showDialog = true
      this.$emit('click')
    },
    // ----------- 点击关闭按钮
    onCloseBanner() {
      this.showBanner = false
      this.$emit('close')
    },
    // ----------- 关闭弹窗：点击遮罩或右上角×，带退场动画
    onCancelDialog(cb) {
      if (this.dialogClosing) return
      this.dialogClosing = true
      setTimeout(() => {
        this.showDialog = false
        this.dialogClosing = false
        if (typeof cb === 'function') cb()
      }, 220)
    },
    // ----------- 联系客服：先走关闭动画再拨打客服电话
    onContactService() {
      this.onCancelDialog(() => {
        uni.makePhoneCall({
          phoneNumber: this.isInvite ? this.invitePhone : this.servicePhone,
          fail: (err) => {
            console.warn('拨打电话失败', err)
          }
        })
      })
    },
    // ----------- 我要缴费：先走关闭动画再跳转到缴费页
    onPay() {
      if (this.isInvite) {
        // 有推荐官时，跳转到我的页面并自动打开转账弹框
        uni.setStorageSync('autoOpenPromoterPay', '1')
        uni.switchTab({ url: '/pages/mine/index' })
      } else {
        this.onCancelDialog(() => {
          uni.navigateTo({ url: '/pages/common/pay/pay' })
        })
      }
    }
  }
}
</script>

<style scoped lang="scss">
// ==================== 会员提示横幅
.member-banner {
  position: relative;
  width: 100%;
  padding: 22rpx 64rpx 22rpx 32rpx;
  box-sizing: border-box;
  background: linear-gradient(90deg, #2962ff 0%, #4f8eff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6rpx;

  &.fixed {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 101;
  }

  .banner-text {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.95);
  }

  .banner-link {
    font-size: 26rpx;
    color: #ffeb3b;
    font-weight: 600;
    text-underline-offset: 4rpx;
  }

  .banner-close {
    position: absolute;
    right: 16rpx;
    top: 50%;
    transform: translateY(-50%);
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .close-icon {
      font-size: 40rpx;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1;
    }

    &:active { opacity: 0.7; }
  }
}

// ==================== 开通会员提示弹窗
.member-dialog-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;

  &.closing {
    animation: fadeOut 0.22s ease forwards;
  }
}

.member-dialog {
  position: relative;
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx 40rpx;
  box-sizing: border-box;
  animation: zoomIn 0.25s ease;

  &.closing {
    animation: zoomOut 0.22s ease forwards;
  }

  .dialog-close {
    position: absolute;
    top: 12rpx;
    right: 16rpx;
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .close-icon {
      font-size: 40rpx;
      color: #9ca3af;
      line-height: 1;
    }

    &:active { opacity: 0.6; }
  }

  .dialog-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #1f2937;
    text-align: center;
    margin-bottom: 24rpx;
  }

  .dialog-content {
    font-size: 28rpx;
    color: #4b5563;
    line-height: 1.6;
    text-align: center;
    margin-bottom: 40rpx;
  }

  .dialog-actions {
    display: flex;
    flex-direction: row;
    gap: 24rpx;
  }

  .dialog-btn {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    border-radius: 40rpx;
    font-size: 28rpx;
    font-weight: 500;

    &:active { opacity: 0.8; }
  }

  .btn-contact {
    color: #2962ff;
    border: 2rpx solid #2962ff;
  }

  .btn-pay {
    color: #fff;
    background: linear-gradient(90deg, #2962ff 0%, #4f8eff 100%);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes zoomOut {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.9); }
}
</style>
