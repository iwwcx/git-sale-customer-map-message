<template>
  <view class="promoter-page">
    <view class="hero-section">
      <view class="hero-orb hero-orb-left"></view>
      <view class="hero-orb hero-orb-right"></view>
      <view class="hero-grid"></view>

      <view class="hero-badge">认证推荐官</view>
      <view v-if="statusText" class="status-ribbon" :class="statusRibbonClass">
        <text class="status-ribbon-text">{{ statusText }}</text>
      </view>
      <text class="hero-title"><text style="font-size: 36rpx;">🚀</text> 有效信息填写上传</text>
      <text class="hero-desc">提交基础资料后即可加入推广计划，审核通过后开始推广并<text style="color: yellow;font-weight: bold;">💰获得直接收益，</text><text style="color: #ffb263;font-weight: bold;">🔥每年仅可填写一次，请仔细核对！</text></text>

      <view class="hero-stats">
        <view class="hero-stat-item">
          <text class="hero-stat-value">3步</text>
          <text class="hero-stat-label">快速申请</text>
        </view>
        <view class="hero-stat-divider"></view>
        <view class="hero-stat-item">
          <text class="hero-stat-value">高效率</text>
          <text class="hero-stat-label">审核流程</text>
        </view>
        <view class="hero-stat-divider"></view>
        <view class="hero-stat-item">
          <text class="hero-stat-value">灵活</text>
          <text class="hero-stat-label">结算方式</text>
        </view>
      </view>
    </view>

    <view class="content-wrapper">
      <view class="guide-card">
        <view class="guide-card-header">
          <text class="guide-card-title">申请说明</text>
          <text class="guide-card-tag">请如实填写</text>
        </view>
        <view class="guide-list">
          <view class="guide-item">
            <text class="guide-index">01</text>
            <text class="guide-text">填写真实身份与联系方式，便于后续审核与联络。</text>
          </view>
          <view class="guide-item">
            <text class="guide-index">02</text>
            <text class="guide-text">默认填写个人信息，如有对公结算可切换为企业。</text>
          </view>
          <view class="guide-item">
            <text class="guide-index">03</text>
            <text class="guide-text">提交后审核通过后即可正式加入推广计划。</text>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-header">
          <view>
            <text class="section-title">基础信息</text>
            <text class="section-desc">请填写本人真实信息</text>
          </view>
        </view>

        <view class="form-list">
          <view class="field-item">
            <view class="field-top">
              <view class="field-label-wrap">
                <text class="field-label">真实姓名</text>
                <text class="field-required">*</text>
              </view>
            </view>
            <view class="input-shell">
              <text class="input-icon">姓名</text>
              <input v-model="form.name" class="field-input" placeholder="请输入您的姓名" maxlength="20" />
            </view>
          </view>

          <view class="field-item">
            <view class="field-top">
              <view class="field-label-wrap">
                <text class="field-label">联系电话</text>
                <text class="field-required">*</text>
              </view>
            </view>
            <view class="input-shell">
              <text class="input-icon">手机</text>
              <input v-model="form.phone" class="field-input" placeholder="请输入联系电话" maxlength="11" type="number" />
            </view>
          </view>

          <view class="field-item">
            <view class="field-top">
              <view class="field-label-wrap">
                <text class="field-label">身份证号</text>
                <text class="field-required">*</text>
              </view>
            </view>
            <view class="input-shell">
              <text class="input-icon">证件</text>
              <input v-model="form.idCard" class="field-input" placeholder="请输入18位身份证号" maxlength="18" />
            </view>
          </view>

          <view class="field-item">
            <view class="field-top">
              <view class="field-label-wrap">
                <text class="field-label">联系地址</text>
                <text class="field-required">*</text>
              </view>
            </view>
            <view class="input-shell textarea-shell">
              <text class="input-icon">地址</text>
              <input v-model="form.address" class="field-input" placeholder="请输入详细联系地址" maxlength="200" />
            </view>
          </view>

          <view class="field-item">
            <view class="field-top">
              <view v-if="!form.hasCompany" class="field-label-wrap">
                <text class="field-label">开户银行</text>
                <text class="field-required">*</text>
              </view>
              <text v-else class="field-hint">企业结算时使用下方信息</text>
            </view>
            <view class="input-shell" :class="{ 'input-shell-disabled': form.hasCompany }">
              <text class="input-icon">银行</text>
              <input
                v-model="form.bankName"
                class="field-input"
                :class="{ 'field-input-disabled': form.hasCompany }"
                placeholder="xx银行xxx支行"
                maxlength="100"
                :disabled="form.hasCompany"
              />
            </view>
          </view>

          <view class="field-item no-margin">
            <view class="field-top">
              <view v-if="!form.hasCompany" class="field-label-wrap">
                <text class="field-label">银行卡号</text>
                <text class="field-required">*</text>
              </view>
              <text v-else class="field-hint">企业结算时使用下方信息</text>
            </view>
            <view class="input-shell" :class="{ 'input-shell-disabled': form.hasCompany }">
              <text class="input-icon">账户</text>
              <input
                v-model="form.bankAccount"
                class="field-input"
                :class="{ 'field-input-disabled': form.hasCompany }"
                placeholder="请输入本人银行卡号"
                maxlength="30"
                type="number"
                :disabled="form.hasCompany"
              />
            </view>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="settlement-header">
          <view class="settlement-title-wrap">
            <text class="section-title">企业对公结算</text>
            <text class="section-desc">如需企业账户结算，可开启后填写企业信息</text>
          </view>
          <switch :checked="form.hasCompany" color="#3b82f6" @change="onHasCompanyChange" />
        </view>

        <view v-if="form.hasCompany" class="form-list company-list">
          <view class="field-item">
            <view class="field-top">
              <view class="field-label-wrap">
                <text class="field-label">公司名称</text>
                <text class="field-required">*</text>
              </view>
            </view>
            <view class="input-shell">
              <text class="input-icon">企业</text>
              <input v-model="form.companyName" class="field-input" placeholder="请输入营业执照企业名称" maxlength="100" />
            </view>
          </view>

          <view class="field-item">
            <view class="field-top">
              <view class="field-label-wrap">
                <text class="field-label">开户银行</text>
                <text class="field-required">*</text>
              </view>
            </view>
            <view class="input-shell">
              <text class="input-icon">银行</text>
              <input v-model="form.bankName" class="field-input" placeholder="xx银行xxx支行" maxlength="100" />
            </view>
          </view>

          <view class="field-item no-margin">
            <view class="field-top">
              <view class="field-label-wrap">
                <text class="field-label">对公账户</text>
                <text class="field-required">*</text>
              </view>
            </view>
            <view class="input-shell">
              <text class="input-icon">账号</text>
              <input v-model="form.bankAccount" class="field-input" placeholder="请输入企业对公银行卡号" maxlength="30" type="number" />
            </view>
          </view>
        </view>

        <view v-else class="settlement-tip">
          <view class="settlement-tip-dot"></view>
          <text class="settlement-tip-text">当前为个人结算，请填写本人银行卡信息用于佣金结算</text>
        </view>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="bottom-panel">
        <view class="bottom-copy">
          <text class="bottom-title">提交后进入审核流程</text>
          <text class="bottom-desc">请确保信息准确无误</text>
        </view>
        <view class="submit-btn" :class="{ 'submit-btn-disabled': !canSubmit }" @tap="onSubmit">
          <text class="submit-btn-text">提交申请</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { applyPromoter, getMyPromoterInfo } from '@/static/api/index.js'

export default {
  data() {
    return {
      submitting: false,
      status: '',
      form: {
        name: '',
        phone: '',
        idCard: '',
        address: '',
        qrCode: '',
        alipayQrCode: '',
        hasCompany: false,
        companyName: '',
        bankName: '',
        bankAccount: ''
      }
    }
  },
  onLoad() {
    // 进入页面先查询已提交过的推广资料；有值就回填，没有则保持空表单
    this.fetchMyPromoterInfo()
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
    canSubmit() {
      const { name, phone, idCard, address, companyName, bankName, bankAccount, hasCompany } = this.form
      if (!name || !phone || !idCard || !address) return false
      if (hasCompany) {
        if (!companyName || !bankName || !bankAccount) return false
      } else if (!bankName || !bankAccount) {
        return false
      }
      return !this.submitting
    }
  },
  methods: {
    chooseQrCode() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.form.qrCode = res.tempFilePaths[0]
        }
      })
    },
    onHasCompanyChange(e) {
      const isOn = e.detail.value
      this.form.hasCompany = isOn
      if (isOn) {
        this.form.companyName = ''
      } else {
        this.form.companyName = ''
      }
    },
    normalizePromoterInfo(raw = {}) {
      // 统一映射到当前表单结构
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
      try {
        const res = await getMyPromoterInfo()
        this.status = res?.data?.status || ''
        const data = res?.data?.apply
        if (!data || (Array.isArray(data) && !data.length)) return
        const formData = this.normalizePromoterInfo(Array.isArray(data) ? data[0] : data)
        // 保留本地默认结构，只覆盖接口里确实返回的字段
        this.form = {
          ...this.form,
          ...formData
        }
      } catch (e) {
      }
    },
    sanitizeForm() {
      this.form.name = (this.form.name || '').trim()
      this.form.phone = String(this.form.phone || '').replace(/\D/g, '').slice(0, 11)
      this.form.idCard = (this.form.idCard || '').trim().toUpperCase()
      this.form.address = (this.form.address || '').trim()
      this.form.companyName = (this.form.companyName || '').trim()
      this.form.bankName = (this.form.bankName || '').trim()
      this.form.bankAccount = String(this.form.bankAccount || '').replace(/\s/g, '')
    },
    validateForm() {
      const { name, phone, idCard, address, companyName, bankName, bankAccount, hasCompany } = this.form
      if (!name) {
        uni.showToast({ title: '请输入真实姓名', icon: 'none' })
        return false
      }
      if (!/^1\d{10}$/.test(phone)) {
        uni.showToast({ title: '请输入正确的联系电话', icon: 'none' })
        return false
      }
      if (!/(^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9X]$)|(^[1-9]\d{5}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}$)/.test(idCard)) {
        uni.showToast({ title: '请输入正确的身份证号', icon: 'none' })
        return false
      }
      if (!address) {
        uni.showToast({ title: '请输入联系地址', icon: 'none' })
        return false
      }
      if (hasCompany && !companyName) {
        uni.showToast({ title: '请输入公司名称', icon: 'none' })
        return false
      }
      if (!bankName) {
        uni.showToast({ title: hasCompany ? '请输入企业开户银行' : '请输入开户银行', icon: 'none' })
        return false
      }
      if (!bankAccount) {
        uni.showToast({ title: hasCompany ? '请输入对公账户' : '请输入银行卡号', icon: 'none' })
        return false
      }
      return true
    },
    buildSubmitPayload() {
      return {
        name: this.form.name,
        phone: this.form.phone,
        idCard: this.form.idCard,
        address: this.form.address,
        // 个人结算时不传公司名称，避免把旧的对公数据误提交出去
        companyName: this.form.hasCompany ? this.form.companyName : '',
        bankName: this.form.bankName,
        bankAccount: this.form.bankAccount,
      }
    },
    async onSubmit() {
      if (this.submitting) return
      this.sanitizeForm()
      if (!this.validateForm()) return
      this.submitting = true
      uni.showLoading({ title: '提交中...', mask: true })
      try {
        await applyPromoter(this.buildSubmitPayload())
        uni.showToast({ title: '提交成功，等待审核', icon: 'none' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } catch (e) {
      } finally {
        this.submitting = false
        uni.hideLoading()
      }
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
  margin: 36rpx 0;
  font-size: 42rpx;
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

.status-ribbon {
  position: absolute;
  top: 34rpx;
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

.guide-card,
.section-card {
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
  background: #eff6ff;
  font-size: 24rpx;
  color: #2563eb;
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
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
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

.field-required {
  font-size: 28rpx;
  line-height: 1;
  color: #ef4444;
}

.field-hint {
  font-size: 22rpx;
  color: #94a3b8;
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

.input-shell-disabled {
  background: #f1f5f9;
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

.field-input-disabled {
  color: #94a3b8;
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

.settlement-tip {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #eff6ff 0%, #f8fbff 100%);
  border: 1rpx solid #dbeafe;
}

.settlement-tip-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #3b82f6;
  box-shadow: 0 0 0 8rpx rgba(59, 130, 246, 0.12);
}

.settlement-tip-text {
  flex: 1;
  font-size: 24rpx;
  line-height: 1.7;
  color: #475569;
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
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  box-shadow: 0 12rpx 28rpx rgba(37, 99, 235, 0.28);
}

.submit-btn-disabled {
  opacity: 0.45;
}

.submit-btn-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #ffffff;
}
</style>
