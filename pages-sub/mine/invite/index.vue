<template>
  <view class="invite-page">
    <!-- 顶部提示区 -->
    <view class="hero-section">
      <view class="hero-orb hero-orb-left"></view>
      <view class="hero-orb hero-orb-right"></view>
      <view class="hero-grid"></view>

      <view class="hero-badge">绑定推荐人</view>
      <text class="hero-title">🎁 录入推荐人电话</text>
      <text class="hero-desc">正确填入推荐人的手机号，贴心服务就在您身边</text>

      <view class="hero-stats">
        <view class="hero-stat-item">
          <text class="hero-stat-value">1次</text>
          <text class="hero-stat-label">每年可修改</text>
        </view>
        <view class="hero-stat-divider"></view>
        <view class="hero-stat-item">
          <text class="hero-stat-value">可信</text>
          <text class="hero-stat-label">绑定有效</text>
        </view>
        <view class="hero-stat-divider"></view>
        <view class="hero-stat-item">
          <text class="hero-stat-value">即时</text>
          <text class="hero-stat-label">生效时间</text>
        </view>
      </view>
    </view>

    <!-- 主体内容区 -->
    <view class="content-wrapper">
      <!-- 已绑定状态 -->
      <view v-if="isInvite" class="state-card done-card">
        <view class="done-icon-wrap">
          <view class="done-ring">
            <text class="done-icon">✓</text>
          </view>
        </view>
        <view class="done-title">邀请人已绑定</view>
        <view class="done-phone">{{ invitePhone || '***********' }}</view>
        <view class="done-tip">您已成功绑定邀请人手机号，绑定关系已生效</view>
        <view class="done-divider"></view>
        <view class="done-footer">
          <text class="done-footer-icon">🛡️</text>
          <text class="done-footer-text">绑定信息已加密保护，仅用于推广关系确认</text>
        </view>
      </view>

      <!-- 未绑定：填写表单 -->
      <view v-else class="form-card">
        <view class="form-header">
          <view class="form-header-left">
            <text class="form-header-title">填入推荐人电话</text>
            <text class="form-header-desc">请核对无误后再提交，提交后每年仅可修改一次</text>
          </view>
          <view class="form-header-tag">必填</view>
        </view>

        <view class="warn-bar">
          <text class="warn-text">⚠️ 重要提示：邀请人手机号只能填写一次，提交后每年仅能更改一次，请务必仔细核对</text>
        </view>

        <view class="input-area">
          <view class="field-top">
            <view class="field-label-wrap">
              <text class="field-label">邀请人手机号</text>
              <text class="field-required">*</text>
            </view>
          </view>
          <view class="input-shell">
            <text class="input-icon">📱</text>
            <input
              v-model="phone"
              class="field-input"
              placeholder="请输入邀请人11位手机号"
              maxlength="11"
              type="number"
            />
          </view>
        </view>

        <view class="safe-tip">
          <text class="safe-tip-icon">🔒</text>
          <text class="safe-tip-text">您的信息将被严格保密，仅用于绑定邀请关系</text>
        </view>

        <view class="submit-bar">
          <view class="submit-btn" :class="{ 'submit-btn-disabled': !canSubmit }" @tap="onSubmit">
            <text class="submit-btn-text">确认提交</text>
          </view>
          <text class="submit-hint">点击提交即表示您已确认信息无误</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getInvite, bindInvite, getMyCustomerList } from '@/static/api/index.js'

export default {
  data() {
    return {
      isInvite: false,   // 是否已填写邀请码
      invitePhone: '',   // 已绑定的邀请人手机号
      phone: '',         // 输入框中的手机号
      loading: false,    // 是否正在提交
      checked: false     // 是否已查询过状态
    }
  },
  onLoad() {
    // 一进入页面先查询是否已填写邀请码
    this.fetchInviteStatus()
  },
  computed: {
    // 是否可以提交：11位数字且未在提交中
    canSubmit() {
      const p = String(this.phone || '').replace(/\D/g, '')
      return p.length === 11 && !this.loading
    }
  },
  methods: {
    // ----------- 查询是否已填写邀请码
    async fetchInviteStatus() {
      try {
        const res = await getInvite()
        this.checked = true
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

    // ----------- 调用 inviteeList 获取邀请人手机号
    async fetchInvitePhone() {
      try {
        const res = await getMyCustomerList()
        const list = res?.data?.list || res?.data || []
        const first = Array.isArray(list) && list.length > 0 ? list[0] : (res?.data || {})
        const phone = first.phone || first.Phone || ''
        this.invitePhone = phone || '***********'
      } catch (e) {
        this.invitePhone = '***********'
      }
    },

    // ----------- 校验手机号格式
    validatePhone() {
      const p = String(this.phone || '').replace(/\D/g, '')
      if (!p) {
        uni.showToast({ title: '请输入邀请人手机号', icon: 'none' })
        return false
      }
      if (p.length !== 11) {
        uni.showToast({ title: '请输入正确的11位手机号', icon: 'none' })
        return false
      }
      return true
    },

    // ----------- 提交绑定邀请人
    async onSubmit() {
      if (this.loading || this.isInvite) return
      if (!this.validatePhone()) return
      this.loading = true
      uni.showLoading({ title: '提交中...', mask: true })
      try {
        const p = String(this.phone || '').replace(/\D/g, '')
        await bindInvite({ invitePhone: p })
        uni.showToast({ title: '绑定成功', icon: 'success' })
        // 绑定成功后刷新状态
        this.isInvite = true
        this.invitePhone = p
      } catch (e) {
        uni.showToast({ title: e || '绑定失败，请重试', icon: 'none' })
      } finally {
        this.loading = false
        uni.hideLoading()
      }
    }
  }
}
</script>

<style scoped lang="scss">
.invite-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #eef4ff 0%, #f6f9ff 32%, #f8fafc 100%);
  padding-bottom: 220rpx;
}

.hero-section {
  position: relative;
  padding: 52rpx 36rpx 168rpx;
  background: linear-gradient(135deg, #0f172a 0%, #172554 45%, #1d4ed8 100%);
  border-bottom-left-radius: 22rpx;
  border-bottom-right-radius: 22rpx;
  overflow: hidden;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(10rpx);
}

.hero-orb-left {
  top: -60rpx;
  left: -40rpx;
  width: 260rpx;
  height: 260rpx;
  background: rgba(59, 130, 246, 0.28);
}

.hero-orb-right {
  top: 40rpx;
  right: -50rpx;
  width: 320rpx;
  height: 320rpx;
  background: rgba(167, 139, 250, 0.24);
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1rpx, transparent 1rpx),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1rpx, transparent 1rpx);
  background-size: 44rpx 44rpx;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.85), transparent 90%);
}

.hero-badge,
.hero-title,
.hero-desc,
.hero-stats {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  height: 50rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.14);
  border: 1rpx solid rgba(255, 255, 255, 0.18);
  font-size: 22rpx;
  color: #dbeafe;
  letter-spacing: 1rpx;
}

.hero-title {
  display: block;
  margin-top: 26rpx;
  font-size: 52rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.18;
}

.hero-desc {
  display: block;
  margin-top: 18rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.78);
}

.hero-stats {
  display: flex;
  align-items: center;
  margin-top: 42rpx;
  padding: 24rpx 12rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255, 255, 255, 0.14);
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
  font-size: 22rpx;
  color: rgba(219, 234, 254, 0.82);
}

.hero-stat-divider {
  width: 1rpx;
  height: 52rpx;
  background: rgba(255, 255, 255, 0.18);
}

.content-wrapper {
  position: relative;
  z-index: 2;
  margin-top: -120rpx;
  padding: 0 24rpx;
}

.state-card,
.form-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1rpx solid rgba(226, 232, 240, 0.9);
  border-radius: 32rpx;
  box-shadow: 0 20rpx 50rpx rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(16px);
}

// ========== 已绑定状态卡片
.done-card {
  padding: 60rpx 36rpx 40rpx;
  text-align: center;
}

.done-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}

.done-ring {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  box-shadow: 0 12rpx 28rpx rgba(34, 197, 94, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
}

.done-icon {
  font-size: 56rpx;
  color: #ffffff;
  font-weight: 700;
}

.done-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 12rpx;
}

.done-phone {
  font-size: 32rpx;
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 20rpx;
  letter-spacing: 2rpx;
}

.done-tip {
  font-size: 26rpx;
  line-height: 1.7;
  color: #64748b;
  padding: 0 16rpx;
}

.done-divider {
  height: 1rpx;
  background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
  margin: 32rpx 0;
}

.done-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.done-footer-icon {
  font-size: 26rpx;
}

.done-footer-text {
  font-size: 22rpx;
  color: #94a3b8;
}

// ========== 表单卡片
.form-card {
  padding: 34rpx 28rpx 40rpx;
}

.form-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.form-header-left {
  flex: 1;
  min-width: 0;
}

.form-header-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #0f172a;
}

.form-header-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #64748b;
}

.form-header-tag {
  flex-shrink: 0;
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  font-size: 22rpx;
  font-weight: 600;
  color: #ef4444;
}

.warn-bar {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1rpx solid #fde68a;
  margin-bottom: 32rpx;
}

.warn-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #f59e0b;
  box-shadow: 0 0 0 8rpx rgba(245, 158, 11, 0.12);
  flex-shrink: 0;
  margin-top: 6rpx;
}

.warn-text {
  flex: 1;
  font-size: 26rpx;
  line-height: 1.7;
  color: #92400e;
  font-weight: 500;
}

.input-area {
  margin-bottom: 28rpx;
}

.field-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.field-label-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
}

.field-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.field-required {
  font-size: 28rpx;
  line-height: 1;
  color: #ef4444;
}

.input-shell {
  display: flex;
  align-items: center;
  min-height: 96rpx;
  padding: 0 24rpx;
  border-radius: 24rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
}

.input-icon {
  flex-shrink: 0;
  min-width: 72rpx;
  margin-right: 20rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #3b82f6;
}

.field-input {
  flex: 1;
  height: 96rpx;
  font-size: 28rpx;
  color: #0f172a;
}

.safe-tip {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 18rpx 20rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #eff6ff 0%, #f8fbff 100%);
  border: 1rpx solid #dbeafe;
  margin-bottom: 36rpx;
}

.safe-tip-icon {
  font-size: 26rpx;
  flex-shrink: 0;
}

.safe-tip-text {
  flex: 1;
  font-size: 24rpx;
  line-height: 1.6;
  color: #475569;
}

.submit-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 96rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  box-shadow: 0 12rpx 28rpx rgba(37, 99, 235, 0.28);
}

.submit-btn-disabled {
  opacity: 0.45;
}

.submit-btn-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 2rpx;
}

.submit-hint {
  font-size: 22rpx;
  color: #94a3b8;
}
</style>
