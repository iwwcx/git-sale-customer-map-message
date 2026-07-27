<template>
  <view class="page-wrapper">
    <view class="mine-container">
    <!-- ========== 顶部用户信息卡片 ========== -->
    <view class="profile-card" :class="isMember ? 'is-vip' : 'is-normal'">
      <!-- 装饰背景圆 -->
      <view class="deco-circle deco-circle-1"></view>
      <view class="deco-circle deco-circle-2"></view>

      <!-- VIP 专属动效层：极光光晕 + 对角扫光 -->
      <template v-if="isMember">
        <view class="vip-aurora"></view>
        <view class="vip-sweep"></view>
      </template>

      <!-- 用户信息行 -->
      <view class="profile-main">
        <!-- 头像 -->
        <image
          class="avatar"
          :src="userInfo.UserLogo ? getProductImageUrlChat(userInfo.UserLogo) :
                userInfo.UserSex == 2 ? 'https://img2cdn.global-dsc.cn/dgzz_img/6842d00b7f7db24082ed4f59f2bba02a.png' : 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png'"
          mode="aspectFill"
        />

        <!-- 核心信息 -->
        <view class="profile-info">
          <view class="user-name-row">
            <view class="user-name">{{ showName(userInfo) }}</view>
            <!-- 试用 VIP 会员标签 -->
            <view v-if="isTrialMember" class="vip-badge" @tap="onVipBadgeTap">
              <text class="vip-badge-icon">👑</text>
              <text class="vip-badge-text">试用会员</text>
              <view class="vip-badge-shine"></view>
            </view>
            <!-- VIP 会员标签：金属质感徽章 -->
            <view v-else-if="isMember" class="vip-badge">
              <text class="vip-badge-icon">👑</text>
              <text class="vip-badge-text">正式会员</text>
              <view class="vip-badge-shine"></view>
            </view>
            <!-- 普通用户：开通VIP 按钮 -->
            <view v-else class="open-vip-btn" @tap="onVipBadgeTap">
              <text class="open-vip-icon">👑</text>
              <text class="open-vip-text">开通会员</text>
            </view>
          </view>
          <view class="user-account">账号：{{ userInfo.Mdt }}</view>
        </view>
      </view>

      <!-- 详细信息行 -->
      <view class="detail-row">
        <!-- <view class="detail-item" v-if="userInfo.OrgDuty">
          <text class="detail-icon">💼</text>
          <text class="detail-text">{{ userInfo.OrgDuty }}</text>
        </view> -->
        <view class="detail-item" v-if="userInfo.Phone">
          <text class="detail-icon">📞</text>
          <text class="detail-text">{{ userInfo.Phone }}</text>
        </view>
        <view v-if="isOfficialMember && (!isInvite || canApplyPromoter == 1)" class="promoter-btn" @tap="goPromoter">
          <text class="promoter-icon">{{ promoterStatus == 'approved' ? '🔥' : '💰' }}</text>
          <text class="promoter-text">{{ promoterStatus == 'approved' ? '认证推荐官' : '我想当推荐官'}} </text>
          <view class="promoter-shine"></view>
        </view>
        <!-- <view class="detail-item" v-if="userInfo.Signature">
          <text class="detail-icon">💬</text>
          <text class="detail-text">{{ userInfo.Signature }}</text>
        </view> -->
      </view>

    </view>

    <!-- ========== 当前企业切换 ========== -->
    <view class="company-card" @tap="onSwitchCompany">
      <view class="company-left">
        <text class="company-icon">🏢</text>
        <view class="company-text">
          <view class="company-name">当前企业：
            <text class="company-chip-name">{{ userInfo.CompName }}</text>
          </view>
        </view>
      </view>
      <!-- <view class="switch-btn">
        <text class="switch-text">切换</text>
        <text class="switch-arrow">›</text>
      </view> -->
    </view>

    <!-- ========== 企业选择弹窗 ========== -->
    <view class="company-mask" v-if="companyPickerVisible" @tap="closeCompanyPicker">
      <view class="company-panel" @tap.stop>
        <view class="panel-header">
          <text class="panel-title">切换企业</text>
          <text class="panel-sub">选择要切换的企业账号</text>
        </view>
        <scroll-view class="company-scroll" scroll-y>
          <view
            class="company-item"
            v-for="(item, index) in accountList"
            :key="item.UserID || index"
            @tap="onSelectCompany(item)"
          >
            <image
              class="company-avatar"
              :src="item.UserLogo ? getProductImageUrlChat(item.UserLogo) : defaultAvatar"
              mode="aspectFill"
            />
            <view class="company-info">
              <view class="company-row">
                <text class="company-item-name">{{ showName(item) }}</text>
                <text class="company-item-mdt" v-if="item.UserMdt">（{{ item.UserMdt }}）</text>
              </view>
              <text class="company-item-company" v-if="item.CompName">{{ item.CompName }}</text>
            </view>
            <text class="company-item-check" v-if="currentUserID === item.UserID">✓</text>
            <text class="company-arrow" v-else>›</text>
          </view>
        </scroll-view>
        <view class="panel-cancel" @tap="closeCompanyPicker">取消</view>
      </view>
    </view>

    <!-- ========== 会员权益提示卡片 ========== -->
    <view class="benefit-tip-card" v-if="!isOfficialMember" @tap="showMemberTipModal">
      <view class="benefit-card-inner">
        <view class="benefit-card-left">
          <view class="benefit-card-badge">
            <text class="benefit-card-icon">💡</text>
          </view>
          <view class="benefit-card-text">
            <text class="benefit-card-title">会员权益说明</text>
            <text class="benefit-card-sub">了解您的专属权益与服务</text>
          </view>
        </view>
        <view class="benefit-card-btn">
          <text class="benefit-card-btn-text">查看</text>
          <text class="benefit-card-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- ========== 会员权益详情弹窗 ========== -->
    <view class="member-tip-mask" v-if="memberTipVisible" @tap="hideMemberTipModal">
      <view class="member-tip-modal" @tap.stop>
        <!-- 顶部装饰线 -->
        <view class="modal-top-line"></view>
        <!-- 背景星星粒子 -->
        <view class="modal-stars">
          <view class="star"></view>
          <view class="star"></view>
          <view class="star"></view>
          <view class="star"></view>
          <view class="star"></view>
          <view class="star"></view>
          <view class="star"></view>
          <view class="star"></view>
          <view class="star"></view>
          <view class="star"></view>
          <view class="star"></view>
          <view class="star"></view>
        </view>
        <view class="tip-modal-header">
          <text class="tip-modal-title">会员权益说明</text>
          <view class="tip-modal-close" @tap="hideMemberTipModal">✕</view>
        </view>

        <view class="tip-modal-content">
          <view class="tip-section">
            <view class="tip-section-title">
              <text class="tip-section-icon">⭐</text>
              <text>试用会员权益</text>
            </view>
            <text class="tip-section-text">试用期内，功能开放使用，<text style="color: yellow;">每天可以选看3次工程师信息</text>，您可以认真体验</text>
          </view>

          <view class="tip-section">
            <view class="tip-section-title">
              <text class="tip-section-icon">🔥</text>
              <text>正式会员权益</text>
            </view>
            <text class="tip-section-text">功能全开放，<text style="color: yellow;">无查看次数限制</text>，随时随地联系工程师和企业详细资料。</text>
          </view>

          <view class="tip-section">
            <view class="tip-section-title">
              <text class="tip-section-icon">🎯</text>
              <text>成为认证推荐官</text>
            </view>
            <text class="tip-section-text">成为正式会员后，可申请成为认证推荐官。具体申请规则您可以<text style="color: yellow;">向您的推荐人直接咨询。</text>经推荐人推荐审核通过后，<text style="color: yellow;">您即可有权直接收取客户的服务年费</text>，然后根据结算规则支付代理费用即可。</text>
          </view>

          <!-- <view class="tip-section highlight-section">
            <view class="tip-section-title">
              <text class="tip-section-icon">💰</text>
              <text>长期收益</text>
            </view>
            <text class="tip-section-text">如果您的客户每年续费，那么您的收益将会越来越大！</text>
          </view> -->

          <view class="tip-section contact-section">
            <view class="tip-section-title">
              <text class="tip-section-icon">📞</text>
              <text>咨询客服</text>
            </view>
            <text class="tip-section-text">联系电话：19819976695（微信同号）</text>
          </view>
        </view>

        <view class="tip-modal-footer" @tap="hideMemberTipModal">
          <text>我知道了</text>
        </view>
      </view>
    </view>

    <!-- ========== 数据概览 ========== -->
    <view class="stat-row">
      <view class="stat-item" @tap="goPage('interestedCompany')">
        <view class="stat-num">{{ followEnterpriseTotal }}</view>
        <view class="stat-label">收藏的公司</view>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @tap="goPage('interestedEngineer')">
        <view class="stat-num">{{ followUserTotal }}</view>
        <view class="stat-label">收藏的工程师</view>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @tap="goPage('contactedEngineer')">
        <view class="stat-num">{{ chatTotal }}</view>
        <view class="stat-label">联系记录</view>
      </view>
    </view>

    <!-- ========== 功能单元格 ========== -->
    <view class="menu-card">
      <view class="menu-item" @tap="goPage('aiReport')">
        <view class="menu-icon icon-cyan">
          <text class="icon-emoji">📊</text>
        </view>
        <view class="menu-content">
          <view class="menu-title">我的AI报告</view>
          <view class="menu-desc">查看已生成的AI分析报告记录</view>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-divider"></view>

      <!-- 没有填写邀请人才展示 -->
      <view v-if="!isInvite && !isOfficialMember" class="menu-item" @tap="goPage('invite')">
        <view class="menu-icon icon-green">
          <text class="icon-emoji">🎁</text>
        </view>
        <view class="menu-content">
          <view class="menu-title">添加推荐官电话</view>
          <view class="menu-desc">填写推荐官手机号，绑定后不可修改</view>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view v-if="!isInvite" class="menu-divider"></view>
      
      <!-- 推广菜单部分 （正式会员且填写了邀请人才展示） -->
      <view v-if="isOfficialMember && isInvite">
        <view v-if="isMember" class="menu-item" @tap="goPage('customerList')">
          <view class="menu-icon icon-blue">
            <text class="icon-emoji">🧑‍💻</text>
          </view>
          <view class="menu-content">
            <view class="menu-title">我的客户列表</view>
            <view class="menu-desc">查看我的客户信息与跟进记录</view>
          </view>
          <text class="menu-arrow">›</text>
        </view>

        <view v-if="isMember" class="menu-divider"></view>

        <view v-if="isMember" class="menu-item" @tap="goPage('paymentInfo')">
          <view class="menu-icon icon-orange">
            <text class="icon-emoji">✍</text>
          </view>
          <view class="menu-content">
            <view class="menu-title">我的收款信息</view>
            <view class="menu-desc">查看和维护当前收款账户资料</view>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <!-- 我收藏的工程师，公司，最近联系人等 -->
      <view v-else>
        <view class="menu-item" @tap="goPage('interestedCompany')">
          <view class="menu-icon icon-blue">
            <text class="icon-emoji">⛺</text>
          </view>
          <view class="menu-content">
            <view class="menu-title">我收藏的公司</view>
            <view class="menu-desc">查看我收藏的所有公司</view>
          </view>
          <text class="menu-arrow">›</text>
        </view>

        <view class="menu-divider"></view>

        <view class="menu-item" @tap="goPage('interestedEngineer')">
          <view class="menu-icon icon-cyan">
            <text class="icon-emoji" style="position: relative; top: -6rpx;">🧑‍💻</text>
          </view>
          <view class="menu-content">
            <view class="menu-title">我收藏的工程师</view>
            <view class="menu-desc">查看我收藏的所有工程师</view>
          </view>
          <text class="menu-arrow">›</text>
        </view>

        <view class="menu-divider"></view>

        <view class="menu-item" @tap="goPage('contactedEngineer')">
          <view class="menu-icon icon-orange">
            <text class="icon-emoji">✍</text>
          </view>
          <view class="menu-content">
            <view class="menu-title">我联系过的工程师</view>
            <view class="menu-desc">查看历史联系记录</view>
          </view>
          <text class="menu-arrow">›</text>
        </view>
      </view>

      <view class="menu-divider"></view>

      <view class="menu-item" @tap="goPage('settings')">
        <view class="menu-icon icon-purple">
          <text class="icon-emoji">⚙️</text>
        </view>
        <view class="menu-content">
          <view class="menu-title">筛选条件设置</view>
          <view class="menu-desc">设置产品关键词、主机企业、零部件企业等</view>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- ========== 底部操作按钮 ========== -->
    <view class="action-row">
      <view class="action-btn btn-switch" @tap="onSwitchCompany">
        <text class="btn-text">切换企业</text>
      </view>
      <view class="action-btn btn-logout" @tap="onLogout">
        <text class="btn-text">退出登录</text>
      </view>
    </view>
  </view>

  <!-- ========== 推荐官支付提示弹窗 ========== -->
  <view class="promoter-mask" v-if="showPromoterPayModal" @tap="showPromoterPayModal = false">
    <view class="promoter-modal" @tap.stop>
      <!-- 顶部渐变 header -->
      <view class="modal-hero">
        <view class="hero-blob blob-a"></view>
        <view class="hero-blob blob-b"></view>
        <view class="hero-grid"></view>

        <view class="modal-close-btn" @tap="showPromoterPayModal = false">
          <text class="close-x">✕</text>
        </view>

        <view class="hero-tag">
          <text class="tag-dot"></text>
          <text class="tag-text">{{ isOfficialMember ? '会员续费 · 到期提醒' : (inviterPayInfo && inviterPayInfo.companyName ? '对公转账 · 安全可信' : '个人转账 · 快速开通') }}</text>
        </view>
        <view class="hero-title-main">{{ isOfficialMember ? '会员续费' : '缴费成为会员' }}</view>
        <view class="hero-sub-desc">
          <block v-if="isOfficialMember && expireTime">
            <text style="color: white;">当前会员到期时间：<text style="color: orange;font-weight: bold;font-size: 28rpx;">{{ expireTime }}</text></text>
          </block>
          <block v-else>请选择合适的方案，按下方账户信息汇款</block>
        </view>
      </view>

      <view class="modal-body">
        <!-- 会员类型选项卡片 -->
        <view class="plan-tabs">
          <view class="plan-tab personal">
            <view class="plan-tab-head">
              <view class="plan-badge personal-badge">个人会员</view>
              <view class="plan-amount">
                <text class="amount-symbol">¥</text>
                <text class="amount-num">2980</text>
                <text class="amount-unit">/年</text>
              </view>
            </view>
            <text class="plan-tab-desc">适合销售人员个人使用</text>
          </view>

          <view class="plan-tab enterprise">
            <view class="plan-recommend">推荐</view>
            <view class="plan-tab-head">
              <view class="plan-badge enterprise-badge">企业会员</view>
              <view class="plan-amount enterprise-amount">
                <text class="amount-symbol">¥</text>
                <text class="amount-num">29800</text>
                <text class="amount-unit">/年</text>
              </view>
            </view>
            <text class="plan-tab-desc">企业集中购买，含15个账号</text>
          </view>
        </view>

        <!-- 汇款信息卡片 -->
        <view class="bank-card">
          <view class="bank-card-head">
            <view class="bank-logo">
              <text class="bank-logo-text">银行</text>
            </view>
            <view class="bank-head-info">
              <text class="bank-head-name">{{ myPromoter ? (myPromoter.bankName ? parseBankMainName(myPromoter.bankName) : '招商银行') : '招商银行' }}</text>
              <text class="bank-head-sub">{{ myPromoter ? (myPromoter.bankName ? parseBankSubName(myPromoter.bankName) : '苏州独墅湖支行') : '苏州独墅湖支行' }}</text>
            </view>
          </view>

          <view class="bank-account-row">
            <text class="bank-account-label">收款账号</text>
            <text class="bank-account-num">{{ myPromoter ? (myPromoter.bankAccount || myPromoter.alipay || '暂未填写信息') : '暂未填写信息' }}</text>
          </view>

          <view class="bank-card-foot">
            <view class="bank-foot-item">
              <text class="foot-label">户名</text>
              <text class="foot-value">{{ myPromoter ? (myPromoter.companyName || myPromoter.name || '暂未填写信息') : '暂未填写信息' }}</text>
            </view>
            <view class="bank-foot-item">
              <text class="foot-label">备注</text>
              <text class="foot-value highlight">探客工兵会员 + 手机号</text>
            </view>
          </view>
        </view>

        <!-- 友情提示 -->
        <view class="notice-bar">
          <view class="notice-icon-wrap">
            <text class="notice-icon">!</text>
          </view>
          <view class="notice-text">
            <text>转账后请立即联系您的推荐官开通：</text>
            <text
              v-if="myPromoter && myPromoter.phone"
              class="notice-phone"
              @tap.stop="onCallPromoter"
            >{{ myPromoter.phone }}</text>
            <text v-else class="notice-phone-muted">（暂无电话）</text>
          </view>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="modal-footer">
        <view class="btn-copy" @tap="onCopyPayInfo">
          <text class="btn-copy-text">复制汇款信息</text>
        </view>
        <view class="btn-know" @tap="showPromoterPayModal = false">
          <text class="btn-know-text">我知道了</text>
        </view>
      </view>
    </view>
  </view>
  </view>
</template>

<script>
import { getUserMyInfo, followEnterpriseList, followUserList, getChatList, getInvite, getMyPromoterInfo, getInviterPromoterPayInfo, getUserConfig } from '@/static/api/index.js'
import { showName, getProductImageUrl, getProductImageUrlChat } from '@/common/utils/index.js'

export default {
  data() {
    return {
      userInfo: {},
      accountList: uni.getStorageSync('accountList') || [],
      followEnterpriseTotal: 0,
      followUserTotal: 0,
      chatTotal: 0,
      companyPickerVisible: false,
      currentCompanyName: '',
      currentUserID: '',
      defaultAvatar: 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png',
      isMember: !!(uni.getStorageSync('memberInfo')?.isMember), // 是否会员，从全局 storage 读取
      isTrialMember: true,  // 是否是试用用户
      isOfficialMember: true,  // 是否是正式会员用户
      isInvite: false,  // 是否已填写邀请人
      canApplyPromoter: 0, // 是否允许申请推荐官（getConfig 返回，默认 0）
      promoterStatus: '', // 推广员申请状态 pending=待审核 approved=通过 rejected=拒绝
      myPromoter: '', // 查询我的推广人的状态
      showPromoterPayModal: false, // 是否显示推荐官支付提示弹窗
      memberTipVisible: false, // 是否显示会员权益说明弹窗
      inviterPayInfo: null, // 邀请人收款信息
      expireTime: '' // 会员到期时间，正式会员续费弹窗需要展示
    }
  },
  onLoad() {
    // 预留 onLoad 初始化逻辑
  },
  onShow() {
    // 进入"我的"前校验登录态，未登录跳到登录页
    if (!this.checkLogin()) return
    const memberInfo = uni.getStorageSync('memberInfo') || {}
    this.isMember = !!memberInfo.isMember
    this.isTrialMember = !!(memberInfo.type == 'trial')
    this.isOfficialMember = !!(memberInfo.type == 'enterprise')
    this.expireTime = memberInfo.expireTime || ''
    // 初始化当前企业名称
    const storedUserInfo = uni.getStorageSync('userInfo') || {}
    this.currentCompanyName = storedUserInfo.NickName || '未命名'
    this.currentUserID = storedUserInfo.UserID || ''
    this.getUserMyInfo()
    this.getFollowEnterpriseList()
    this.getFollowUserList()
    this.getChatList()
    this.fetchInviteStatus()
    this.fetchUserConfig()
    this.fetchPromoterStatus()
    this.getInviterPromoterPayInfo()
  },
  methods: {
    // ----------- 跳转推广者申请页
    goPromoter() {
      uni.navigateTo({ url: '/pages-sub/mine/promoter/index' })
    },

    // ----------- 显示会员权益说明弹窗
    showMemberTipModal() {
      this.memberTipVisible = true
    },

    // ----------- 隐藏会员权益说明弹窗
    hideMemberTipModal() {
      this.memberTipVisible = false
    },

    // ----------- 显示会员权益说明弹窗
    showMemberTipModal() {
      this.memberTipVisible = true
    },

    // ----------- 隐藏会员权益说明弹窗
    hideMemberTipModal() {
      this.memberTipVisible = false
    },

    // ----------- 点击会员标签/开通会员按钮
    async onVipBadgeTap() {
      // 已填写邀请人，则弹窗提示给推荐官汇款（试用、普通、正式会员都走此逻辑）
      if (this.isInvite) {
        this.showPromoterPayModal = true
        return
      }
      // 没有邀请人时，非会员走开通会员逻辑
      // if (!this.isMember) {
        this.goOpenVip()
      // }
    },

    // ----------- 拨打推荐官电话
    onCallPromoter() {
      const phone = this.myPromoter && this.myPromoter.phone
      if (!phone) {
        uni.showToast({ title: '推荐官暂未填写电话', icon: 'none' })
        return
      }
      uni.makePhoneCall({
        phoneNumber: String(phone),
        fail: (err) => {
          // 用户取消不提示错误
          if (err && err.errMsg && err.errMsg.indexOf('cancel') === -1) {
            uni.showToast({ title: '拨打失败', icon: 'none' })
          }
        }
      })
    },

    // ----------- 一键复制推荐官收款信息
    // 顺序：户名 → 银行（含支行）→ 收款账号
    onCopyPayInfo() {
      const info = this.myPromoter
      if (!info) {
        uni.showToast({ title: '暂无可复制的信息', icon: 'none' })
        return
      }
      // 户名：对公取 companyName，个人取 name
      const accountName = info.companyName || info.name || '—'
      // 银行：主名 + 支行拼接
      const bankMain = info.bankName ? this.parseBankMainName(info.bankName) : ''
      const bankSub = info.bankName ? this.parseBankSubName(info.bankName) : ''
      const bankFull = [bankMain, bankSub].filter(Boolean).join('') || '—'
      // 收款账号：银行卡优先，没卡号用支付宝
      const accountNo = info.bankAccount || info.alipay || '—'

      const lines = [
        `户名：${accountName}`,
        `银行：${bankFull}`,
        `收款账号：${accountNo}`
      ]
      const text = lines.join('\n')

      uni.setClipboardData({
        data: text,
        success: () => {
          uni.showToast({ title: '已复制汇款信息', icon: 'success' })
        },
        fail: () => {
          uni.showToast({ title: '复制失败，请手动复制', icon: 'none' })
        }
      })
    },

    // ----------- 解析银行主名称 (如: 招商银行)
    parseBankMainName(bankName) {
      if (!bankName) return '招商银行'
      const spaceIdx = bankName.indexOf(' ')
      if (spaceIdx > 0) {
        return bankName.substring(0, spaceIdx)
      }
      const idx = bankName.indexOf('银行')
      if (idx !== -1) {
        const after = bankName.substring(idx + 2)
        const suffixMatch = after.match(/^(股份)?(有限)?(公司)?/)
        let end = idx + 2
        if (suffixMatch && suffixMatch[0]) {
          end += suffixMatch[0].length
        }
        return bankName.substring(0, end)
      }
      return bankName
    },

    // ----------- 解析银行支行名称 (如: 苏州独墅湖支行)
    parseBankSubName(bankName) {
      if (!bankName) return '苏州独墅湖支行'
      const spaceIdx = bankName.indexOf(' ')
      if (spaceIdx > 0) {
        return bankName.substring(spaceIdx + 1)
      }
      const idx = bankName.indexOf('银行')
      if (idx !== -1) {
        const after = bankName.substring(idx + 2)
        const suffixMatch = after.match(/^(股份)?(有限)?(公司)?/)
        let end = idx + 2
        if (suffixMatch && suffixMatch[0]) {
          end += suffixMatch[0].length
        }
        return bankName.substring(end) || '支行'
      }
      return '支行'
    },

    // ----------- 校验登录态，未登录则跳转登录页
    checkLogin() {
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.reLaunch({ url: '/pages/common/login/index' })
        return false
      }
      return true
    },

    // ----------- 查询自己的推广员申请状态
    async fetchPromoterStatus() {
      try {
        const res = await getMyPromoterInfo()
        if (res && res.data) {
          this.promoterStatus = res.data.status || ''
          this.inviterPayInfo = res.data.apply
        }
      } catch (e) {
        // 接口异常静默处理
      }
    },

    // ----------- 查询填写的推广员申请状态
    async getInviterPromoterPayInfo() {
      try {
        const res = await getInviterPromoterPayInfo()
        if (res && res.data) {
          this.myPromoter = res.data
        }
      } catch (e) {
        // 接口异常静默处理
      }
    },

    // ----------- 获取用户配置（canApplyPromoter 控制申请推荐官入口显隐）
    async fetchUserConfig() {
      try {
        const res = await getUserConfig()
        if (res && res.data) {
          this.canApplyPromoter = res.data.canApplyPromoter || 0
        }
      } catch (e) {
        // 接口异常静默处理
      }
    },

    // ----------- 查询是否已填写邀请码
    async fetchInviteStatus() {
      try {
        const res = await getInvite()
        if (res && res.data) {
          this.isInvite = res.data.isInvite
          // 如果需要自动打开推荐官支付弹框
          if (this.isInvite && uni.getStorageSync('autoOpenPromoterPay') === '1') {
            uni.removeStorageSync('autoOpenPromoterPay')
            this.showPromoterPayModal = true
          }
        }
      } catch (e) {
        // 接口异常静默处理
      }
    },

    // ----------- 获取用户信息
    async getUserMyInfo() {
      const res = await getUserMyInfo()
      this.userInfo = res.Data
    },

    // ----------- 获取关注企业列表
    async getFollowEnterpriseList() {
      const res = await followEnterpriseList()
      this.followEnterpriseTotal = res.data.total
    },

    // ----------- 获取关注用户列表
    async getFollowUserList() {
      const res = await followUserList()
      this.followUserTotal = res.data.total
    },

    // ----------- 获取最近联系人
    async getChatList() {
      const res = await getChatList()
      this.chatTotal = res.Data.length || 0
    },

    // ----------- 切换企业 - 打开弹窗
    onSwitchCompany() {
      this.accountList = uni.getStorageSync('accountList') || []
      this.companyPickerVisible = true
    },

    // ----------- 关闭企业选择弹窗
    closeCompanyPicker() {
      this.companyPickerVisible = false
    },

    // ----------- 选择某个企业账号进行切换
    onSelectCompany(item) {
      if (this.currentUserID === item.UserID) {
        this.closeCompanyPicker()
        return
      }
      uni.showModal({
        title: '提示',
        content: `确认切换到账号「${item.NickName || '未命名'}」？`,
        success: (res) => {
          if (res.confirm) {
            this.doSwitchCompany(item)
          }
        }
      })
    },

    // ----------- 执行企业切换逻辑
    doSwitchCompany(item) {
      if (!item || !item.Token) {
        uni.showToast({ title: '切换失败，账号信息异常', icon: 'none' })
        return
      }
      // 更新 storage 中的 token 和 userInfo
      uni.setStorageSync('token', item.Token)
      uni.setStorageSync('userInfo', item)
      uni.setStorageSync('isLoggedIn', true)
      this.closeCompanyPicker()
      uni.showToast({ title: '切换成功', icon: 'success' })
      // 重新刷新当前页面
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/mine/index' })
      }, 800)
    },

    // ----------- 退出登录
    onLogout() {
      uni.showModal({
        title: '提示',
        content: '确认退出当前登录？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
            uni.removeStorageSync('accountList')
            uni.removeStorageSync('isLoggedIn')
            uni.removeStorageSync('memberInfo')
            uni.reLaunch({ url: '/pages/common/login/index' })
          }
        }
      })
    },

    // ----------- 跳转到支付页开通VIP
    goOpenVip() {
      uni.navigateTo({ url: '/pages/common/pay/pay' })
    },

    // ----------- 跳转到指定的功能页
    goPage(type) {
      // type: interestedCompany / interestedEngineer / contactedEngineer
      const routes = {
        interestedCompany: '/pages-sub/mine/company/index',
        interestedEngineer: '/pages-sub/mine/user/index',
        contactedEngineer: '/pages-sub/mine/chat/index',
        invite: '/pages-sub/mine/invite/index',
        customerList: '/pages-sub/mine/customer/index',
        paymentInfo: '/pages-sub/mine/payment/index',
        aiReport: '/pages-sub/mine/ai-report/index',
        settings: '/pages-sub/mine/settings/index'
      }
      if (routes[type]) {
        uni.navigateTo({ url: routes[type] })
      }
    },

    showName,
    getProductImageUrl,
    getProductImageUrlChat
  }
}
</script>

<style scoped lang="scss">
// ==================== 我的页容器
.mine-container {
  width: 100%;
  min-height: 100vh;
  background: #f4f6fa;
  padding: 20rpx 0 60rpx 0;
  box-sizing: border-box;
}

// ==================== 顶部用户信息卡片
.profile-card {
  position: relative;
  margin: 0 24rpx;
  padding: 40rpx 36rpx 32rpx;
  border-radius: 24rpx;
  overflow: hidden;
  color: #fff;
  transition: all 0.3s ease;

  // 非会员：低饱和灰蓝调，整体显得朴素
  &.is-normal {
    background: linear-gradient(135deg, #b8c2d4 0%, #8a98b3 60%, #7787a3 100%);
    box-shadow: 0 8rpx 20rpx rgba(120, 130, 150, 0.22);
  }

  // 会员：深紫金渐变，加金色边框与光泽，整体更高级
  &.is-vip {
    background: linear-gradient(135deg, #2a2350 0%, #4a3a8a 45%, #6c4fb8 100%);
    box-shadow: 0 14rpx 36rpx rgba(60, 40, 120, 0.45),
                inset 0 0 60rpx rgba(255, 215, 130, 0.08);
    border: 1rpx solid rgba(255, 215, 130, 0.4);

    // 顶部金色高光条
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2rpx;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(255, 215, 130, 0.85) 50%,
        transparent 100%);
      z-index: 3;
    }
  }

  // 背景装饰圆
  .deco-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    pointer-events: none;
  }

  // 会员卡装饰圆改为金色光晕，并加呼吸动效
  &.is-vip .deco-circle {
    background: radial-gradient(circle,
      rgba(255, 215, 130, 0.28) 0%,
      rgba(255, 215, 130, 0) 70%);
  }
  &.is-vip .deco-circle-1 {
    animation: vipBreath1 6s ease-in-out infinite;
  }
  &.is-vip .deco-circle-2 {
    animation: vipBreath2 7.5s ease-in-out infinite;
  }

  // 极光光晕层：缓慢旋转的多彩径向光，营造高级感
  .vip-aurora {
    position: absolute;
    top: -40%;
    left: -20%;
    width: 140%;
    height: 180%;
    background:
      radial-gradient(circle at 30% 30%, rgba(255, 200, 120, 0.32) 0%, transparent 35%),
      radial-gradient(circle at 70% 60%, rgba(180, 130, 255, 0.30) 0%, transparent 40%),
      radial-gradient(circle at 50% 80%, rgba(120, 180, 255, 0.22) 0%, transparent 38%);
    filter: blur(20rpx);
    pointer-events: none;
    z-index: 1;
    animation: vipAurora 12s linear infinite;
  }

  // 对角扫光层：周期性掠过整张卡片
  .vip-sweep {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 60%;
    height: 200%;
    background: linear-gradient(115deg,
      transparent 0%,
      rgba(255, 235, 180, 0.18) 45%,
      rgba(255, 255, 255, 0.32) 50%,
      rgba(255, 235, 180, 0.18) 55%,
      transparent 100%);
    transform: rotate(8deg);
    pointer-events: none;
    z-index: 1;
    animation: vipSweep 5s ease-in-out infinite;
  }

  .deco-circle-1 {
    width: 280rpx;
    height: 280rpx;
    top: -100rpx;
    right: -80rpx;
  }

  .deco-circle-2 {
    width: 180rpx;
    height: 180rpx;
    bottom: -60rpx;
    left: -40rpx;
    background: rgba(255, 255, 255, 0.08);
  }

  // 用户信息主体
  .profile-main {
    display: flex;
    align-items: center;
    gap: 24rpx;
    position: relative;
    z-index: 2;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      background: #fff;
      flex-shrink: 0;
    }

    .profile-info {
      flex: 1;
      min-width: 0;

      .user-name-row {
        display: flex;
        align-items: center;
        gap: 14rpx;
        margin-bottom: 6rpx;

        .user-name {
          font-size: 40rpx;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
        }

        // VIP 会员徽章：金属质感
        .vip-badge {
          position: relative;
          display: flex;
          align-items: center;
          gap: 6rpx;
          padding: 14rpx 16rpx;
          border-radius: 999rpx;
          background: linear-gradient(135deg,
            #fff5d1 0%,
            #ffd76b 25%,
            #f5b73a 55%,
            #d99224 85%,
            #ffe49a 100%);
          box-shadow:
            0 4rpx 14rpx rgba(217, 146, 36, 0.55),
            inset 0 1rpx 0 rgba(255, 255, 255, 0.7),
            inset 0 -1rpx 0 rgba(140, 80, 0, 0.35);
          overflow: hidden;

          .vip-badge-icon {
            font-size: 24rpx;
            position: relative;
            top: -4rpx;
            line-height: 1;
            filter: drop-shadow(0 1rpx 1rpx rgba(120, 70, 0, 0.4));
          }

          .vip-badge-text {
            font-size: 22rpx;
            color: #5a3300;
            font-weight: 800;
            letter-spacing: 2rpx;
            text-shadow: 0 1rpx 0 rgba(255, 255, 255, 0.5);
          }

          // 流光高光
          .vip-badge-shine {
            position: absolute;
            top: 0;
            left: -60%;
            width: 60%;
            height: 100%;
            background: linear-gradient(120deg,
              transparent 0%,
              rgba(255, 255, 255, 0.65) 50%,
              transparent 100%);
            transform: skewX(-20deg);
            animation: vipShine 3.5s ease-in-out infinite;
          }
        }

        // 开通VIP 按钮：深色高级款
        .open-vip-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 4rpx;
          padding: 10rpx 16rpx;
          border-radius: 999rpx;
          background: linear-gradient(135deg, #2a2a3a 0%, #3d3d52 100%);
          border: 1rpx solid rgba(255, 215, 130, 0.55);
          box-shadow:
            0 4rpx 14rpx rgba(0, 0, 0, 0.25),
            inset 0 1rpx 0 rgba(255, 255, 255, 0.08);

          .open-vip-icon {
            font-size: 24rpx;
            position: relative;
            top: -4rpx;
            line-height: 1;
          }

          .open-vip-text {
            font-size: 22rpx;
            font-weight: 700;
            letter-spacing: 1rpx;
            // 金色渐变文字
            background: linear-gradient(135deg, #ffe9a8 0%, #ffc657 50%, #f1a82d 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            color: transparent;
          }

          .open-vip-arrow {
            font-size: 28rpx;
            line-height: 1;
            color: #ffc657;
            margin-left: 2rpx;
            font-weight: 700;
          }
        }
      }

      .user-account {
        font-size: 28rpx;
        margin-top: 20rpx;
        color: rgba(255, 255, 255, 0.75);
      }
    }
  }

  // 详细信息行（职务、电话、签名）
  .detail-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx 32rpx;
    margin-top: 24rpx;
    padding: 16rpx 24rpx;
    background: rgba(255, 255, 255, 0.12);
    border-radius: 16rpx;
    position: relative;
    z-index: 2;

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8rpx;

      .detail-icon {
        font-size: 26rpx;
      }

      .detail-text {
        font-size: 26rpx;
        color: rgba(255, 255, 255, 0.9);
      }
    }

    .promoter-btn {
      position: relative;
      display: flex;
      align-items: center;
      gap: 6rpx;
      margin-left: auto;
      padding: 14rpx 18rpx;
      border-radius: 999rpx;
      background: linear-gradient(135deg,
        #fff5d1 0%,
        #ffd76b 25%,
        #f5b73a 55%,
        #d99224 85%,
        #ffe49a 100%);
      box-shadow:
        0 4rpx 14rpx rgba(217, 146, 36, 0.55),
        inset 0 1rpx 0 rgba(255, 255, 255, 0.7),
        inset 0 -1rpx 0 rgba(140, 80, 0, 0.35);
      overflow: hidden;

      .promoter-icon {
        font-size: 24rpx;
        position: relative;
        top: -2rpx;
        line-height: 1;
        filter: drop-shadow(0 1rpx 1rpx rgba(120, 70, 0, 0.4));
      }

      .promoter-text {
        font-size: 22rpx;
        color: #5a3300;
        font-weight: 800;
        letter-spacing: 1rpx;
        text-shadow: 0 1rpx 0 rgba(255, 255, 255, 0.5);
      }

      // 流光高光
      .promoter-shine {
        position: absolute;
        top: 0;
        left: -60%;
        width: 60%;
        height: 100%;
        background: linear-gradient(120deg,
          transparent 0%,
          rgba(255, 255, 255, 0.65) 50%,
          transparent 100%);
        transform: skewX(-20deg);
        animation: vipShine 3s ease-in-out infinite;
      }
    }
  }
}

// ==================== 当前企业卡片
.company-card {
  margin: 20rpx 24rpx 0;
  padding: 24rpx;
  background: #fff;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);

  .company-left {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 20rpx;

    .company-icon {
      font-size: 36rpx;
      flex-shrink: 0;
      position: relative;
      top: -2rpx;
    }

    .company-text {
      flex: 1;
      min-width: 0;

      .company-label {
        font-size: 25rpx;
        color: #9a9797;
        line-height: 1.2;
        margin-bottom: 10rpx;
      }

      .company-name {
        font-size: 30rpx;
        font-weight: 500;
        color: #353535;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        .company-chip-name {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 30rpx;
          color: #146ff6;
        }
      }
    }
  }

  .switch-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 4rpx;
    padding: 12rpx 24rpx;
    background: #f0f4ff;
    border: 2rpx solid #ddd5d5;
    border-radius: 10rpx;

    .switch-text {
      font-size: 26rpx;
      color: #2962ff;
      font-weight: 500;
    }

    .switch-arrow {
      font-size: 30rpx;
      color: #2962ff;
      line-height: 1;
    }
  }
}

// ==================== 数据概览
.stat-row {
  margin: 24rpx 24rpx 0;
  padding: 32rpx 0;
  background: #fff;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);

  .stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;

    .stat-num {
      font-size: 40rpx;
      font-weight: 700;
      color: #2962ff;
      line-height: 1;
    }

    .stat-label {
      font-size: 24rpx;
      color: #888;
    }
  }

  .stat-divider {
    width: 1rpx;
    height: 56rpx;
    background: #eef1f6;
  }
}

// ==================== 功能单元格
.menu-card {
  margin: 24rpx 24rpx 0;
  background: #fff;
  border-radius: 20rpx;
  padding: 8rpx 0;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);

  .menu-item {
    display: flex;
    align-items: center;
    padding: 28rpx 32rpx;
    gap: 24rpx;
    transition: background 0.15s;

    &:active {
      background: #f7f9fc;
    }

    .menu-icon {
      width: 76rpx;
      height: 76rpx;
      border-radius: 18rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .icon-emoji {
        font-size: 40rpx;
      }

      // 蓝色调
      &.icon-blue {
        background: linear-gradient(135deg, #e8f0ff, #d6e4ff);
      }

      // 青色调
      &.icon-cyan {
        background: linear-gradient(135deg, #e0f7fa, #b2ebf2);
      }

      // 橙色调
      &.icon-orange {
        background: linear-gradient(135deg, #fff4e0, #ffe0b2);
      }

      // 紫色调
      &.icon-purple {
        background: linear-gradient(135deg, #efe6ff, #d9c8ff);
      }

      // 绿色调
      &.icon-green {
        background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      }
    }

    .menu-content {
      flex: 1;
      min-width: 0;

      .menu-title {
        font-size: 30rpx;
        color: #1a1a1a;
        font-weight: 500;
        line-height: 1.3;
        margin-bottom: 6rpx;
      }

      .menu-desc {
        font-size: 24rpx;
        color: #999;
        line-height: 1.2;
      }
    }

    .menu-arrow {
      font-size: 36rpx;
      color: #ccc;
      flex-shrink: 0;
      line-height: 1;
    }
  }

  .menu-divider {
    height: 1rpx;
    background: #f0f2f5;
    margin: 0 32rpx 0 132rpx;
  }
}

// ==================== 底部操作按钮
.action-row {
  margin: 48rpx 24rpx 0;
  display: flex;
  gap: 30rpx;

  .action-btn {
    flex: 1;
    height: 92rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    font-size: 28rpx;
    transition: opacity 0.15s;

    &:active {
      opacity: 0.85;
    }

    .btn-icon {
      font-size: 30rpx;
    }
  }

  // 切换账号：浅色描边按钮
  .btn-switch {
    background: #fff;
    color: #2962ff;
    border: 1rpx solid #d6e4ff;
  }

  // 退出登录：红色填充
  .btn-logout {
    background: linear-gradient(135deg, #ff6b6b, #ee5253);
    color: #fff;
    box-shadow: 0 8rpx 20rpx rgba(238, 82, 83, 0.25);
  }
}

// ==================== 企业选择弹窗
.company-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 99;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: maskFade 0.2s ease;
}

.company-panel {
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx 32rpx 32rpx;
  box-sizing: border-box;
  animation: panelSlideUp 0.28s ease;

  .panel-header {
    padding: 0 8rpx 28rpx;
    border-bottom: 1rpx solid #f0f2f5;

    .panel-title {
      display: block;
      font-size: 34rpx;
      font-weight: 700;
      color: #1a1a1a;
      line-height: 1.3;
    }

    .panel-sub {
      display: block;
      margin-top: 10rpx;
      font-size: 24rpx;
      color: #999;
    }
  }

  .company-scroll {
    max-height: 60vh;
  }

  .company-item {
    display: flex;
    align-items: center;
    padding: 24rpx 12rpx;
    gap: 24rpx;
    border-bottom: 1rpx solid #f5f7fa;
    transition: background 0.15s;

    &:active {
      background: #f7f9fc;
    }

    &:last-child {
      border-bottom: none;
    }

    .company-avatar {
      width: 88rpx;
      height: 88rpx;
      border-radius: 50%;
      flex-shrink: 0;
      background: #f0f2f5;
    }

    .company-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4rpx;

      .company-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
      }

      .company-item-name {
        font-size: 30rpx;
        font-weight: 600;
        color: #1a1a1a;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .company-item-mdt {
        font-size: 26rpx;
        color: #888;
        margin-left: 4rpx;
      }

      .company-item-company {
        font-size: 24rpx;
        color: #848383;
        margin-top: 8rpx;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .company-item-check {
      font-size: 36rpx;
      color: #2962ff;
      flex-shrink: 0;
      line-height: 1;
    }

    .company-arrow {
      font-size: 40rpx;
      color: #ccc;
      line-height: 1;
      flex-shrink: 0;
    }
  }

  .panel-cancel {
    margin-top: 24rpx;
    height: 88rpx;
    border-radius: 44rpx;
    background: #f4f6fa;
    color: #555;
    font-size: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
      background: #e8ebf0;
    }
  }
}

// ==================== 推荐官支付提示弹窗（转账开通会员风格）
.promoter-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: maskFade 0.2s ease-out;
}

.promoter-modal {
  width: 100%;
  max-height: 92vh;
  background: #fff;
  border-radius: 36rpx 36rpx 0 0;
  overflow: hidden;
  animation: panelSlideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  box-shadow: 0 -20rpx 60rpx rgba(11, 24, 56, 0.18);

  // ==================== 顶部渐变 hero
  .modal-hero {
    position: relative;
    padding: 56rpx 44rpx 80rpx;
    background:
      radial-gradient(120% 100% at 0% 0%, rgba(255, 215, 145, 0.16) 0%, transparent 55%),
      radial-gradient(120% 100% at 100% 100%, rgba(99, 140, 255, 0.32) 0%, transparent 60%),
      linear-gradient(135deg, #0b1838 0%, #142a5e 55%, #1d3b8c 100%);
    overflow: hidden;

    // 顶部光晕装饰
    .hero-blob {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      filter: blur(2rpx);
    }

    .blob-a {
      width: 260rpx;
      height: 260rpx;
      top: -120rpx;
      right: -80rpx;
      background: radial-gradient(circle, rgba(255, 199, 122, 0.35) 0%, transparent 70%);
    }

    .blob-b {
      width: 220rpx;
      height: 220rpx;
      bottom: -110rpx;
      left: -70rpx;
      background: radial-gradient(circle, rgba(120, 160, 255, 0.4) 0%, transparent 70%);
    }

    // 细网格纹理
    .hero-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255, 255, 255, 0.04) 1rpx, transparent 1rpx),
        linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1rpx, transparent 1rpx);
      background-size: 40rpx 40rpx;
      pointer-events: none;
    }

    .modal-close-btn {
      position: absolute;
      top: 32rpx;
      right: 32rpx;
      width: 56rpx;
      height: 56rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.14);
      backdrop-filter: blur(20rpx);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1rpx solid rgba(255, 255, 255, 0.18);
      z-index: 3;

      .close-x {
        font-size: 26rpx;
        color: rgba(255, 255, 255, 0.85);
        font-weight: 500;
      }
    }

    .hero-tag {
      position: relative;
      z-index: 2;
      display: inline-flex;
      align-items: center;
      gap: 10rpx;
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
      background: rgba(255, 255, 255, 0.12);
      border: 1rpx solid rgba(255, 215, 145, 0.3);
      margin-bottom: 24rpx;

      .tag-dot {
        width: 10rpx;
        height: 10rpx;
        border-radius: 50%;
        background: #4ade80;
        box-shadow: 0 0 8rpx rgba(74, 222, 128, 0.8);
      }

      .tag-text {
        font-size: 22rpx;
        color: rgba(255, 215, 145, 0.9);
        letter-spacing: 1rpx;
      }
    }

    .hero-title-main {
      position: relative;
      z-index: 2;
      font-size: 44rpx;
      font-weight: 700;
      color: #fff;
      letter-spacing: 2rpx;
      background: linear-gradient(90deg, #fff 0%, #ffe6b8 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 12rpx;
    }

    .hero-sub-desc {
      position: relative;
      z-index: 2;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.65);
      letter-spacing: 0.5rpx;
      margin: 10rpx 0;
    }
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 0 32rpx 24rpx;
    margin-top: -48rpx;
    position: relative;
    z-index: 5;
  }

  // ==================== 会员方案 tabs
  .plan-tabs {
    display: flex;
    gap: 20rpx;
    margin-bottom: 28rpx;
  }

  .plan-tab {
    position: relative;
    flex: 1;
    padding: 28rpx 24rpx 24rpx;
    border-radius: 24rpx;
    background: #fff;
    border: 1rpx solid #c0d0ff;
    box-shadow: 0 12rpx 30rpx rgba(20, 42, 94, 0.08);
    overflow: hidden;

    &.enterprise {
      background: linear-gradient(160deg, #fffaf0 0%, #fff 60%);
      border-color: #fcd6a2;
      box-shadow: 0 14rpx 32rpx rgba(245, 167, 66, 0.18);
    }

    .plan-recommend {
      position: absolute;
      top: 0;
      right: 0;
      padding: 6rpx 16rpx 6rpx 22rpx;
      font-size: 20rpx;
      color: #fff;
      font-weight: 600;
      letter-spacing: 1rpx;
      background: linear-gradient(135deg, #ff9447 0%, #f5572b 100%);
      border-radius: 0 24rpx 0 16rpx;
      box-shadow: 0 4rpx 10rpx rgba(245, 87, 43, 0.35);
    }

    .plan-tab-head {
      display: flex;
      flex-direction: column;
      gap: 16rpx;
      margin-bottom: 12rpx;
    }

    .plan-badge {
      align-self: flex-start;
      padding: 6rpx 16rpx;
      border-radius: 8rpx;
      font-size: 22rpx;
      font-weight: 600;
      color: #fff;
      letter-spacing: 1rpx;

      &.personal-badge {
        background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
        box-shadow: 0 4rpx 10rpx rgba(37, 99, 235, 0.3);
      }

      &.enterprise-badge {
        background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
        box-shadow: 0 4rpx 10rpx rgba(217, 119, 6, 0.3);
      }
    }

    .plan-amount {
      display: flex;
      align-items: baseline;
      color: #0b1838;

      .amount-symbol {
        font-size: 24rpx;
        font-weight: 700;
        margin-right: 4rpx;
      }

      .amount-num {
        font-size: 44rpx;
        font-weight: 800;
        line-height: 1;
        background: linear-gradient(135deg, #1d3b8c 0%, #2962ff 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .amount-unit {
        font-size: 22rpx;
        color: #9aa3b7;
        margin-left: 4rpx;
      }

      &.enterprise-amount .amount-num {
        background: linear-gradient(135deg, #b45309 0%, #f59e0b 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .plan-tab-desc {
      font-size: 22rpx;
      color: #6b7280;
      line-height: 1.5;
    }
  }

  // ==================== 银行卡风格汇款信息
  .bank-card {
    position: relative;
    padding: 32rpx 32rpx 28rpx;
    border-radius: 28rpx;
    background:
      radial-gradient(120% 100% at 100% 0%, rgba(255, 215, 145, 0.12) 0%, transparent 50%),
      linear-gradient(135deg, #122a64 0%, #1e3a8a 60%, #2962ff 130%);
    box-shadow: 0 14rpx 36rpx rgba(20, 42, 94, 0.28);
    overflow: hidden;
    margin-bottom: 24rpx;

    &::before {
      content: '';
      position: absolute;
      top: -60rpx;
      right: -60rpx;
      width: 240rpx;
      height: 240rpx;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 199, 122, 0.18) 0%, transparent 70%);
      pointer-events: none;
    }

    // 白色斜向扫光特效
    &::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -60%;
      width: 50%;
      height: 200%;
      background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.18) 45%, rgba(255, 255, 255, 0.32) 50%, rgba(255, 255, 255, 0.18) 55%, transparent 100%);
      transform: skewX(-20deg);
      pointer-events: none;
      animation: bankShine 4s ease-in-out infinite;
    }

    .bank-card-head {
      display: flex;
      align-items: center;
      gap: 18rpx;
      margin-bottom: 36rpx;
      position: relative;
      z-index: 1;
    }

    .bank-logo {
      width: 72rpx;
      height: 72rpx;
      border-radius: 16rpx;
      background: linear-gradient(135deg, #c8102e 0%, #8b0000 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4rpx 12rpx rgba(200, 16, 46, 0.4);

      .bank-logo-text {
        font-size: 22rpx;
        font-weight: 800;
        color: #fff;
        letter-spacing: 1rpx;
      }
    }

    .bank-head-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4rpx;

      .bank-head-name {
        font-size: 28rpx;
        font-weight: 700;
        color: #fff;
        letter-spacing: 1rpx;
      }

      .bank-head-sub {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .bank-account-row {
      position: relative;
      z-index: 1;
      margin-bottom: 28rpx;

      .bank-account-label {
        display: block;
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.55);
        letter-spacing: 1rpx;
        margin-bottom: 8rpx;
      }

      .bank-account-num {
        font-size: 40rpx;
        font-weight: 600;
        color: #fff;
        letter-spacing: 2rpx;
        text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.25);
      }
    }

    .bank-card-foot {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: 14rpx;
      padding-top: 22rpx;
      border-top: 1rpx dashed rgba(255, 255, 255, 0.18);
    }

    .bank-foot-item {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .foot-label {
        width: 70rpx;
        flex-shrink: 0;
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.55);
        letter-spacing: 1rpx;
        padding-top: 2rpx;
      }

      .foot-value {
        flex: 1;
        font-size: 26rpx;
        color: #fff;
        font-weight: 500;
        line-height: 1.5;
        word-break: break-all;

        &.highlight {
          color: #ffd58a;
          font-weight: 600;
        }
      }
    }
  }

  // ==================== 友情提示条
  .notice-bar {
    display: flex;
    align-items: center;
    gap: 14rpx;
    padding: 20rpx 24rpx;
    background: linear-gradient(135deg, #fff7ed 0%, #fff1e0 100%);
    border-radius: 16rpx;
    border: 1rpx solid #fed7aa;

    .notice-icon-wrap {
      width: 36rpx;
      height: 36rpx;
      border-radius: 50%;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4rpx 8rpx rgba(217, 119, 6, 0.3);

      .notice-icon {
        font-size: 24rpx;
        color: #fff;
        font-weight: 800;
        line-height: 1;
      }
    }

    .notice-text {
      font-size: 24rpx;
      color: #9a3412;
      font-weight: 500;
      line-height: 1.5;
      flex: 1;
    }

    .notice-phone {
      color: #2962ff;
      font-weight: 700;
      text-decoration: underline;
      margin-left: 4rpx;
    }

    .notice-phone-muted {
      color: #b58a6a;
      font-weight: 500;
      margin-left: 4rpx;
    }
  }

  // ==================== 底部按钮
  .modal-footer {
    display: flex;
    gap: 18rpx;
    padding: 20rpx 32rpx 36rpx;
    background: #fff;
    border-top: 1rpx solid #f4f6fb;

    .btn-copy {
      flex: 1;
      height: 92rpx;
      border-radius: 46rpx;
      background: linear-gradient(90deg, #1d3b8c 0%, #2962ff 60%, #4f73d6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10rpx 24rpx rgba(41, 98, 255, 0.4);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -60%;
        width: 50%;
        height: 100%;
        background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.28), transparent);
        transform: skewX(-20deg);
        animation: btnShine 3s ease-in-out infinite;
      }

      .btn-copy-text {
        font-size: 30rpx;
        font-weight: 600;
        color: #fff;
        letter-spacing: 2rpx;
      }

      &:active {
        opacity: 0.9;
      }
    }

    .btn-know {
      width: 240rpx;
      height: 86rpx;
      border-radius: 46rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      border: 1px solid #5683dc;

      .btn-know-text {
        font-size: 28rpx;
        font-weight: 600;
        color: #1d3b8c;
        letter-spacing: 1rpx;
      }

      &:active {
        background: #e6ebf5;
      }
    }

    .btn-call {
      width: 280rpx;
      border: none;
      background: linear-gradient(90deg, #1d3b8c 0%, #2962ff 60%, #4f73d6 100%);
      box-shadow: 0 10rpx 24rpx rgba(41, 98, 255, 0.4);
      position: relative;
      overflow: hidden;

      .btn-call-icon {
        font-size: 28rpx;
        line-height: 1;
        filter: drop-shadow(0 1rpx 1rpx rgba(0, 0, 0, 0.15));
      }

      .btn-know-text {
        color: #fff;
      }

      &:active {
        opacity: 0.9;
        background: linear-gradient(90deg, #1d3b8c 0%, #2962ff 60%, #4f73d6 100%);
      }

      &.is-disabled {
        opacity: 0.5;
        filter: grayscale(0.4);
      }
    }
  }
}

@keyframes modalScale {
  from { opacity: 0; transform: scale(0.9) translateY(30rpx); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes maskFade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes panelSlideUp {
  from { transform: translateY(100%); opacity: 0.4; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes btnShine {
  0%   { left: -60%; }
  60%  { left: 120%; }
  100% { left: 120%; }
}

@keyframes bankShine {
  0%        { left: -60%; opacity: 0; }
  20%       { opacity: 1; }
  60%, 100% { left: 130%; opacity: 0; }
}

// VIP 徽章流光动画
@keyframes vipShine {
  0% { left: -60%; }
  60%, 100% { left: 120%; }
}

// VIP 卡片极光：缓慢平移+旋转，制造氛围流动感
@keyframes vipAurora {
  0%   { transform: translate(0, 0) rotate(0deg); }
  50%  { transform: translate(-6%, 4%) rotate(180deg); }
  100% { transform: translate(0, 0) rotate(360deg); }
}

// VIP 卡片对角扫光：从左上掠到右下
@keyframes vipSweep {
  0%        { left: -60%; opacity: 0; }
  20%       { opacity: 1; }
  60%, 100% { left: 130%; opacity: 0; }
}

// VIP 装饰圆呼吸动效
@keyframes vipBreath1 {
  0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.9; }
  50%      { transform: scale(1.15) translate(-10rpx, 8rpx); opacity: 1; }
}
@keyframes vipBreath2 {
  0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.8; }
  50%      { transform: scale(1.2) translate(12rpx, -6rpx); opacity: 1; }
}

// ==================== 会员权益提示卡
.benefit-tip-card {
  margin: 24rpx;
  overflow: hidden;
  border-radius: 24rpx;
  animation: cardFloat 3s ease-in-out infinite;
  position: relative;
  box-shadow: 0 4rpx 20rpx rgba(91, 139, 212, 0.2);
  border: 1px solid #fbe4ff;

  // 光晕背景
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at 30% 50%, rgba(251, 191, 36, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 70% 50%, rgba(91, 139, 212, 0.06) 0%, transparent 50%);
    animation: bgRotate 8s linear infinite;
    pointer-events: none;
  }

  .benefit-card-inner {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx 32rpx;
    // 柔和的紫蓝渐变底色，延续页面主题，不刺眼
    background: linear-gradient(135deg, #eef2ff 0%, #f4f0ff 50%, #eaf1ff 100%);
    box-shadow: 0 4rpx 16rpx rgba(99, 102, 241, 0.12);
    border-radius: 24rpx;
    overflow: hidden;
    z-index: 1;

    // 右上角装饰光晕
    &::after {
      content: '';
      position: absolute;
      top: -40rpx;
      right: -30rpx;
      width: 140rpx;
      height: 140rpx;
      background: radial-gradient(circle, rgba(124, 131, 236, 0.18) 0%, transparent 70%);
      border-radius: 50%;
      animation: glowPulse 3s ease-in-out infinite;
    }
  }

  .benefit-card-left {
    display: flex;
    align-items: center;
    gap: 22rpx;
    position: relative;
    z-index: 1;
  }

  // 图标徽章，圆形渐变底衬托图标
  .benefit-card-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 76rpx;
    height: 76rpx;
    border-radius: 22rpx;
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    box-shadow: 0 4rpx 12rpx rgba(251, 191, 36, 0.3);
    flex-shrink: 0;
  }

  .benefit-card-icon {
    font-size: 42rpx;
    animation: iconBounce 2s ease-in-out infinite;
  }

  .benefit-card-text {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }

  .benefit-card-title {
    font-size: 30rpx;
    font-weight: 700;
    color: #4338ca;
    letter-spacing: 1rpx;
    margin-bottom: 4rpx;
  }

  .benefit-card-sub {
    font-size: 23rpx;
    color: #7c7f99;
    letter-spacing: 0.5rpx;
  }

  // 右侧"查看"胶囊按钮
  .benefit-card-btn {
    display: flex;
    align-items: center;
    gap: 4rpx;
    padding: 10rpx 22rpx;
    border-radius: 100rpx;
    background: linear-gradient(135deg, #7c83ec 0%, #6366f1 100%);
    box-shadow: 0 4rpx 12rpx rgba(99, 102, 241, 0.3);
    position: relative;
    z-index: 1;
    flex-shrink: 0;
  }

  .benefit-card-btn-text {
    font-size: 24rpx;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: 1rpx;
  }

  .benefit-card-arrow {
    font-size: 30rpx;
    color: #ffffff;
    line-height: 1;
  }

  &:active .benefit-card-inner {
    transform: scale(0.98);
    transition: transform 0.15s ease;
  }
}

// 卡片浮动动画
@keyframes cardFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6rpx); }
}

// 渐变色呼吸
@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

// 边框发光动画
@keyframes borderGlow {
  0%, 100% { background-position: 0% 50%; opacity: 0.7; }
  50% { background-position: 100% 50%; opacity: 1; }
}

// 图标弹跳
@keyframes iconBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

// 箭头滑动
@keyframes arrowSlide {
  0%, 100% { transform: translateX(0); opacity: 0.5; }
  50% { transform: translateX(6rpx); opacity: 0.8; }
}

// 卡片光斑呼吸动画
@keyframes sectionGlow {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.3); opacity: 1; }
}

// 星星闪烁
@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.5); }
}

// 标题流光
@keyframes titleShine {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

// 顶部装饰线脉冲
@keyframes linePulse {
  0%, 100% { opacity: 0.6; width: 120rpx; }
  50% { opacity: 1; width: 160rpx; }
}

// 卡片依次滑入
@keyframes sectionSlideIn {
  from {
    opacity: 0;
    transform: translateX(-100rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 图标摇摆
@keyframes iconWiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

// 文字脉冲
@keyframes textPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

// ==================== 会员权益详情弹窗
.member-tip-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  animation: fadeIn 0.2s ease-out;
}

.member-tip-modal {
  width: 100%;
  max-height: 80vh;
  background: linear-gradient(180deg, #1a2f5a 0%, #0f1f3d 100%);
  border-radius: 32rpx;
  overflow: hidden;
  animation: modalScale 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.5);
  position: relative;

  // 背景星星粒子
  .modal-stars {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    pointer-events: none;

    .star {
      position: absolute;
      width: 4rpx;
      height: 4rpx;
      background: #fff;
      border-radius: 50%;
      animation: twinkle 2s ease-in-out infinite;

      &:nth-child(1) { left: 8%; top: 15%; animation-delay: 0s; }
      &:nth-child(2) { left: 15%; top: 45%; animation-delay: 0.3s; width: 3rpx; height: 3rpx; }
      &:nth-child(3) { left: 25%; top: 25%; animation-delay: 0.6s; }
      &:nth-child(4) { left: 35%; top: 55%; animation-delay: 0.9s; width: 5rpx; height: 5rpx; }
      &:nth-child(5) { left: 45%; top: 12%; animation-delay: 1.2s; }
      &:nth-child(6) { left: 55%; top: 48%; animation-delay: 0.2s; width: 3rpx; height: 3rpx; }
      &:nth-child(7) { left: 65%; top: 22%; animation-delay: 0.5s; }
      &:nth-child(8) { left: 75%; top: 58%; animation-delay: 0.8s; width: 6rpx; height: 6rpx; }
      &:nth-child(9) { left: 85%; top: 35%; animation-delay: 1.1s; }
      &:nth-child(10) { left: 92%; top: 18%; animation-delay: 1.4s; width: 3rpx; height: 3rpx; }
      &:nth-child(11) { left: 50%; top: 70%; animation-delay: 0.4s; }
      &:nth-child(12) { left: 70%; top: 80%; animation-delay: 0.7s; width: 4rpx; height: 4rpx; }
    }
  }

  // 顶部装饰线
  .modal-top-line {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 120rpx;
    height: 6rpx;
    background: linear-gradient(90deg, transparent, #fbbf24, transparent);
    border-radius: 0 0 6rpx 6rpx;
    animation: linePulse 2s ease-in-out infinite;
  }

  .tip-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 36rpx 40rpx 28rpx;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    z-index: 2;
  }

  .tip-modal-title {
    font-size: 34rpx;
    font-weight: 700;
    color: #fff;
    animation: titleShine 3s ease-in-out infinite;
    background: linear-gradient(90deg, #fff, #fbbf24, #fff);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .tip-modal-close {
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.3s;

    &:active {
      background: rgba(255, 255, 255, 0.2);
      transform: rotate(90deg);
    }
  }

  .tip-modal-content {
    padding: 32rpx 40rpx;
    max-height: 55vh;
    overflow-y: auto;
    position: relative;
    z-index: 2;
  }

  .tip-section {
    margin-bottom: 32rpx;
    padding: 24rpx 28rpx;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
    border-radius: 20rpx;
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
    animation: sectionSlideIn 0.5s ease-out backwards;

    &:nth-child(1) { animation-delay: 0.1s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.3s; }
    &:nth-child(4) { animation-delay: 0.4s; }

    // 卡片左上角光斑
    &::before {
      content: '';
      position: absolute;
      top: -30rpx;
      left: -30rpx;
      width: 80rpx;
      height: 80rpx;
      background: radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%);
      border-radius: 50%;
      animation: sectionGlow 4s ease-in-out infinite;
    }

    // 卡片右下角光斑
    &::after {
      content: '';
      position: absolute;
      bottom: -40rpx;
      right: -20rpx;
      width: 100rpx;
      height: 100rpx;
      background: radial-gradient(circle, rgba(91, 139, 212, 0.12) 0%, transparent 70%);
      border-radius: 50%;
      animation: sectionGlow 5s ease-in-out infinite reverse;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .tip-section-title {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 12rpx;
    position: relative;
    z-index: 1;
  }

  .tip-section-icon {
    font-size: 32rpx;
    animation: iconWiggle 2s ease-in-out infinite;
  }

  .tip-section-title text {
    font-size: 28rpx;
    font-weight: 600;
    color: #fbbf24;
    animation: textPulse 2.5s ease-in-out infinite;
  }

  .tip-section-text {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.7;
    position: relative;
    z-index: 1;
  }

  .contact-section {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(251, 191, 36, 0.05) 100%);
    border-color: rgba(251, 191, 36, 0.3);

    .tip-section-text {
      color: #fbbf24;
    }
  }

  .highlight-section {
    background: rgba(34, 197, 94, 0.1);
    border-color: rgba(34, 197, 94, 0.3);

    .tip-section-title text {
      color: #4ade80;
    }

    .tip-section-text {
      color: #86efac;
    }
  }

  .tip-modal-footer {
    margin: 24rpx 40rpx 36rpx;
    padding: 28rpx;
    background: linear-gradient(90deg, #1d3b8c 0%, #2962ff 60%, #2e4ea3 100%);
    border-radius: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.4);

    text {
      font-size: 30rpx;
      font-weight: 600;
      color: #fff;
    }

    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
