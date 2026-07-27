<template>
  <view class="promoter-page">
    <view class="hero-section payment-hero">
      <view class="hero-orb hero-orb-left"></view>
      <view class="hero-orb hero-orb-right"></view>
      <view class="hero-grid"></view>

      <text class="hero-title"><text style="font-size: 36rpx;">🚀</text> 我的收款信息</text>
      <text class="hero-desc">查看当前推广佣金结算资料，支持个人收款与企业对公结算信息展示。</text>

      <view class="hero-stats">
        <view class="hero-stat-item">
          <text class="hero-stat-value">{{ form.hasCompany ? '对公' : '个人' }}</text>
          <text class="hero-stat-label">结算模式</text>
        </view>
        <view class="hero-stat-divider"></view>
        <view class="hero-stat-item">
          <text class="hero-stat-value">{{ displayBankName }}</text>
          <text class="hero-stat-label">开户银行</text>
        </view>
        <view class="hero-stat-divider"></view>
        <view class="hero-stat-item">
          <text class="hero-stat-value">{{ maskedAccountTail }}</text>
          <text class="hero-stat-label">账户尾号</text>
        </view>
      </view>
    </view>

    <view class="content-wrapper">
      <view class="guide-card">
        <view class="guide-card-header">
          <text class="guide-card-title">资料说明</text>
        </view>
        <view class="guide-list">
          <view class="guide-item">
            <text class="guide-index">01</text>
            <text class="guide-text">信息每年仅可修改一次，请谨慎填写。</text>
          </view>
          <view class="guide-item">
            <text class="guide-index">02</text>
            <text class="guide-text">如为企业对公结算，将优先显示对公账户。</text>
          </view>
          <view class="guide-item">
            <text class="guide-index">03</text>
            <text class="guide-text">当前页面展示你已提交并保存的推广结算资料。</text>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-header">
          <view>
            <text class="section-title">基础信息</text>
            <text class="section-desc">以下信息来源于你当前保存的推广资料</text>
          </view>
        </view>

        <view class="form-list">
          <view class="field-item">
            <view class="field-top">
              <view class="field-label-wrap">
                <text class="field-label">真实姓名</text>
              </view>
            </view>
            <view class="input-shell">
              <text class="input-icon">姓名</text>
              <input :value="displayValue(form.name)" class="field-input field-input-disabled" disabled placeholder="未填写" />
            </view>
          </view>

          <view class="field-item">
            <view class="field-top">
              <view class="field-label-wrap">
                <text class="field-label">联系电话</text>
              </view>
            </view>
            <view class="input-shell">
              <text class="input-icon">手机</text>
              <input :value="displayValue(form.phone)" class="field-input field-input-disabled" disabled placeholder="未填写" />
            </view>
          </view>

          <view class="field-item">
            <view class="field-top">
              <view class="field-label-wrap">
                <text class="field-label">身份证号</text>
              </view>
            </view>
            <view class="input-shell">
              <text class="input-icon">证件</text>
              <input :value="maskedIdCard" class="field-input field-input-disabled" disabled placeholder="未填写" />
            </view>
          </view>

          <view class="field-item no-margin">
            <view class="field-top">
              <view class="field-label-wrap">
                <text class="field-label">联系地址</text>
              </view>
            </view>
            <view class="input-shell textarea-shell">
              <text class="input-icon">地址</text>
              <input :value="displayValue(form.address)" class="field-input field-input-disabled" disabled placeholder="未填写" />
            </view>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="settlement-header">
          <view class="settlement-title-wrap">
            <text class="section-title">{{ form.hasCompany ? '企业对公结算' : '个人收款信息' }}</text>
            <text class="section-desc">{{ form.hasCompany ? '当前为企业账户结算模式' : '当前为个人银行卡结算模式' }}</text>
          </view>
          <view class="mode-chip" :class="{ 'mode-chip-company': form.hasCompany }">
            <text class="mode-chip-text">{{ form.hasCompany ? '对公' : '个人' }}</text>
          </view>
        </view>

        <view v-if="form.hasCompany" class="form-list company-list">
          <view class="field-item">
            <view class="field-top">
              <view class="field-label-wrap">
                <text class="field-label">公司名称</text>
              </view>
            </view>
            <view class="input-shell">
              <text class="input-icon">企业</text>
              <input :value="displayValue(form.companyName)" class="field-input field-input-disabled" disabled placeholder="未填写" />
            </view>
          </view>

          <view class="field-item">
            <view class="field-top">
              <view class="field-label-wrap">
                <text class="field-label">开户银行</text>
              </view>
            </view>
            <view class="input-shell">
              <text class="input-icon">银行</text>
              <input :value="displayValue(form.bankName)" class="field-input field-input-disabled" disabled placeholder="未填写" />
            </view>
          </view>

          <view class="field-item no-margin">
            <view class="field-top">
              <view class="field-label-wrap">
                <text class="field-label">对公账户</text>
              </view>
            </view>
            <view class="input-shell">
              <text class="input-icon">账号</text>
              <input :value="maskedBankAccount" class="field-input field-input-disabled" disabled placeholder="未填写" />
            </view>
          </view>
        </view>

        <view v-else class="form-list company-list">
          <view class="field-item">
            <view class="field-top">
              <view class="field-label-wrap">
                <text class="field-label">开户银行</text>
              </view>
            </view>
            <view class="input-shell">
              <text class="input-icon">银行</text>
              <input :value="displayValue(form.bankName)" class="field-input field-input-disabled" disabled placeholder="未填写" />
            </view>
          </view>

          <view class="field-item no-margin">
            <view class="field-top">
              <view class="field-label-wrap">
                <text class="field-label">银行卡号</text>
              </view>
            </view>
            <view class="input-shell">
              <text class="input-icon">账户</text>
              <input :value="maskedBankAccount" class="field-input field-input-disabled" disabled placeholder="未填写" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="bottom-panel">
        <view class="bottom-copy">
          <text class="bottom-title">需要调整收款资料？</text>
          <text class="bottom-desc"><text style="color: red;">每年仅可修改一次</text> ，进入推广者申请页面后可继续修改并重新提交</text>
        </view>
        <view class="submit-btn" @tap="goEditPaymentInfo">
          <text class="submit-btn-text">修改收款信息</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getMyPromoterInfo } from '@/static/api/index.js'

export default {
  data() {
    return {
      loading: false,
      status: '',
      form: {
        name: '',
        phone: '',
        idCard: '',
        address: '',
        hasCompany: false,
        companyName: '',
        bankName: '',
        bankAccount: ''
      }
    }
  },
  computed: {
    statusText() {
      const statusMap = {
        pending: '审核中',
        approved: '已通过',
        rejected: '已驳回'
      }
      return statusMap[this.status] || (this.status ? String(this.status) : '')
    },
    statusRibbonClass() {
      return this.status ? `status-ribbon-${this.status}` : ''
    },
    displayBankName() {
      const bankName = this.form.bankName || '未填写'
      return bankName.length > 6 ? `${bankName.slice(0, 6)}...` : bankName
    },
    maskedBankAccount() {
      const account = String(this.form.bankAccount || '')
      if (!account) return ''
      if (account.length <= 8) return account
      return `${account.slice(0, 4)} **** **** ${account.slice(-4)}`
    },
    maskedAccountTail() {
      const account = String(this.form.bankAccount || '')
      return account ? account.slice(-4) : '--'
    },
    maskedIdCard() {
      const idCard = String(this.form.idCard || '')
      if (!idCard) return ''
      if (idCard.length <= 8) return idCard
      return `${idCard.slice(0, 4)} ********** ${idCard.slice(-4)}`
    },
    hasAnyData() {
      return Object.values(this.form).some(value => value)
    }
  },
  onLoad() {
    this.fetchMyPromoterInfo()
  },
  methods: {
    displayValue(value) {
      const text = value === null || value === undefined ? '' : String(value).trim()
      return text || '未填写'
    },
    normalizePromoterInfo(raw = {}) {
      const data = raw && typeof raw === 'object' ? raw : {}
      const companyName = data.companyName || ''
      const bankName = data.bankName || ''
      const bankAccount = data.bankAccount || ''
      const hasCompany = !!companyName
      return {
        name: data.name || '',
        phone: String(data.phone || ''),
        idCard: data.idCard || '',
        address: data.address || '',
        hasCompany,
        companyName,
        bankName,
        bankAccount: String(bankAccount || '')
      }
    },
    async fetchMyPromoterInfo() {
      this.loading = true
      try {
        const res = await getMyPromoterInfo()
        this.status = res?.data?.status || ''
        const data = res?.data?.apply
        if (!data || (Array.isArray(data) && !data.length)) return
        const formData = this.normalizePromoterInfo(Array.isArray(data) ? data[0] : data)
        this.form = {
          ...this.form,
          ...formData
        }
      } catch (e) {
      } finally {
        this.loading = false
      }
    },
    goEditPaymentInfo() {
      uni.navigateTo({
        url: '/pages-sub/mine/promoter/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.promoter-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #eef4ff 0%, #f6f9ff 32%, #f8fafc 100%);
  padding-bottom: 220rpx;
}

.hero-section {
  position: relative;
  padding: 42rpx 36rpx 168rpx;
  background: linear-gradient(135deg, #0f172a 0%, #172554 45%, #1d4ed8 100%);
  border-bottom-left-radius: 22rpx;
  border-bottom-right-radius: 22rpx;
  overflow: hidden;
}

.payment-hero {
  background: linear-gradient(135deg, #0b1220 0%, #134e5e 42%, #0f766e 100%);
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
  background: rgba(45, 212, 191, 0.24);
}

.hero-orb-right {
  top: 40rpx;
  right: -50rpx;
  width: 320rpx;
  height: 320rpx;
  background: rgba(59, 130, 246, 0.2);
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
  color: #d5fbf5;
  letter-spacing: 1rpx;
}

.hero-title {
  display: block;
  margin: 36rpx 0;
  font-size: 42rpx;
  font-weight: 700;
  color: white;
  line-height: 1.18;
}

.hero-desc {
  display: block;
  margin-top: 18rpx;
  font-size: 26rpx;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.82);
}

.status-ribbon {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  z-index: 3;
  min-width: 132rpx;
  height: 52rpx;
  padding: 0 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  box-shadow: 0 8rpx 18rpx rgba(0, 0, 0, 0.16);
}

.status-ribbon-text {
  display: block;
  font-size: 22rpx;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 1rpx;
  color: #ffffff;
}

.status-ribbon-pending {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
}

.status-ribbon-approved {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.status-ribbon-rejected {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
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
  max-width: 180rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.guide-card,
.section-card,
.empty-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1rpx solid rgba(226, 232, 240, 0.9);
  border-radius: 32rpx;
  box-shadow: 0 20rpx 50rpx rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(16px);
}

.guide-card {
  padding: 30rpx;
  margin-bottom: 24rpx;
}

.guide-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22rpx;
}

.guide-card-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.guide-card-tag {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: #ecfeff;
  font-size: 24rpx;
  color: #0f766e;
}

.guide-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.guide-item {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.guide-index {
  min-width: 52rpx;
  height: 52rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%);
  color: #0f766e;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 52rpx;
  text-align: center;
}

.guide-text {
  flex: 1;
  font-size: 25rpx;
  line-height: 1.7;
  color: #475569;
}

.section-card {
  padding: 34rpx 28rpx;
  margin-bottom: 24rpx;
}

.section-header {
  margin-bottom: 28rpx;
}

.section-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #0f172a;
}

.section-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #64748b;
}

.form-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.field-item {
  margin-bottom: 4rpx;
}

.no-margin {
  margin-bottom: 0;
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

.input-shell {
  display: flex;
  align-items: center;
  min-height: 96rpx;
  padding: 0 24rpx;
  border-radius: 24rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
}

.textarea-shell {
  align-items: center;
}

.input-icon {
  flex-shrink: 0;
  min-width: 72rpx;
  margin-right: 20rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #0f766e;
}

.field-input {
  flex: 1;
  height: 96rpx;
  font-size: 28rpx;
  color: #0f172a;
}

.field-input-disabled {
  color: #334155;
}

.settlement-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 28rpx;
}

.settlement-title-wrap {
  flex: 1;
}

.company-list {
  padding-top: 6rpx;
}

.mode-chip {
  flex-shrink: 0;
  min-width: 92rpx;
  height: 52rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: #e2efff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-chip-company {
  background: #ecfeff;
}

.mode-chip-text {
  font-size: 24rpx;
  font-weight: 700;
  color: #118d82;
}

.empty-card {
  padding: 44rpx 36rpx;
  text-align: center;
}

.empty-card-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #0f172a;
}

.empty-card-desc {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: #64748b;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 24rpx calc(10rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, rgba(248, 250, 252, 0.94) 28%, #f8fafc 100%);
}

.bottom-panel {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 18rpx 18rpx 18rpx 24rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.96);
  border: 1rpx solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 12rpx 36rpx rgba(15, 23, 42, 0.08);
}

.bottom-copy {
  flex: 1;
  min-width: 0;
}

.bottom-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #0f172a;
}

.bottom-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #64748b;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 232rpx;
  height: 88rpx;
  padding: 0 28rpx;
  border-radius: 22rpx;
  background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
  box-shadow: 0 12rpx 28rpx rgba(15, 118, 110, 0.28);
}

.submit-btn-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #ffffff;
}
</style>
