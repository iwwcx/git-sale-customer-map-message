<template>
  <view class="pay-page">
    <!-- 顶部深色 VIP 横幅 -->
    <view class="hero">
      <view class="hero-decor decor-1"></view>
      <view class="hero-decor decor-2"></view>
      <view class="hero-decor decor-3"></view>

      <!-- 炫彩流光动效层 -->
      <view class="hero-aurora"></view>
      <view class="hero-sweep"></view>

      <view class="hero-top">
        <view class="hero-crown">
          <text class="crown-icon">👑</text>
        </view>
        <view class="hero-brand">
          <view class="brand-main">
            <text class="brand-svip">VIP</text>
            <text class="brand-divider">|</text>
            <text class="brand-cn">尊享身份</text>
          </view>
          <text class="brand-sub">全功能无限制使用</text>
        </view>
      </view>

      <view class="hero-title">探客工兵正式会员</view>
      <view class="hero-sub">解锁平台资源，专属数据服务</view>

      <view class="hero-stats">
        <view class="stat-item">
          <text class="stat-num">40w+</text>
          <text class="stat-label">企业资源</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-num">200w+</text>
          <text class="stat-label">工程师应用</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-num">365</text>
          <text class="stat-label">天专属</text>
        </view>
      </view>
    </view>

    <!-- 套餐卡片 -->
    <view class="plan-card">
      <view class="plan-shine"></view>
      <view class="plan-tag">限时优惠 · 立省 ¥619</view>

      <view class="plan-head">
        <view class="plan-name">
          <text class="plan-title">年度尊享</text>
          <text class="plan-desc">有效期 1 年 · 即开即用</text>
        </view>
        <view class="plan-price">
          <view class="price-row">
            <text class="price-symbol">¥</text>
            <text class="price-num">1980</text>
          </view>
          <view class="price-meta">
            <text class="price-origin">¥2599</text>
            <text class="price-unit">/ 年</text>
          </view>
        </view>
      </view>

      <view class="plan-divider"></view>

      <view class="plan-benefits">
        <view class="benefit-item" v-for="(item, index) in benefits" :key="index">
          <view class="benefit-icon">
            <text class="icon-check">✓</text>
          </view>
          <text class="benefit-text">{{ item }}</text>
        </view>
      </view>
    </view>

    <!-- 信任徽章 -->
    <view class="trust-row">
      <view class="trust-item">
        <text class="trust-icon">🛡️</text>
        <text class="trust-text">官方保障</text>
      </view>
      <view class="trust-item">
        <text class="trust-icon">🚀</text>
        <text class="trust-text">即时开通</text>
      </view>
      <view class="trust-item">
        <text class="trust-icon">💁</text>
        <text class="trust-text">专属客服</text>
      </view>
      <view class="trust-item">
        <text class="trust-icon">🙈</text>
        <text class="trust-text">隐私加密</text>
      </view>
    </view>

    <!-- 支付方式 -->
    <view class="pay-section">
      <view class="section-head">
        <text class="section-title">支付方式</text>
        <text class="section-tip">可使用以下方式</text>
      </view>
      <!-- 对公支付 -->
      <view class="pay-method">
        <view class="method-left">
          <view class="method-icon bank-method-icon">
            <text class="bank-method-text">银行</text>
          </view>
          <view class="method-info">
            <text class="method-name">对公支付</text>
            <text class="method-tip">通过银行对公账户转账</text>
          </view>
        </view>
        <view class="method-check checked">
          <text class="check-icon">✓</text>
        </view>
      </view>
    </view>

    <!-- 协议 -->
    <view class="agreement">
      <view class="agree-check" :class="{ checked: agreed }" @tap="agreed = !agreed">
        <text v-if="agreed" class="check-icon">✓</text>
      </view>
      <text class="agree-text">我已阅读并同意</text>
      <text class="agree-link" @tap="showAgreement = true">《会员服务协议》</text>
    </view>

    <!-- 底部支付栏 -->
    <view class="pay-bar-placeholder"></view>
    <view class="pay-bar">
      <view class="bar-left">
        <view class="bar-amount-row">
          <text class="bar-symbol">¥</text>
          <text class="bar-amount">1980</text>
          <text class="bar-origin">¥2599</text>
        </view>
        <text class="bar-label">已优惠 ¥619</text>
      </view>
      <view class="bar-btn" :class="{ disabled: !agreed }" @tap="onSubmitPay">
        <text class="btn-text">查看信息</text>
      </view>
    </view>

    <!-- 转账信息弹框 -->
    <view class="transfer-overlay" v-if="showTransferModal" :class="{ 'closing': closing }" @tap="closeModal" @animationend="onModalAniEnd">
      <view class="transfer-modal" @tap.stop>
        <!-- 顶部渐变 header -->
        <view class="modal-hero">
          <view class="hero-blob blob-a"></view>
          <view class="hero-blob blob-b"></view>
          <view class="hero-grid"></view>

          <view class="modal-close-btn" @tap="closeModal">
            <text class="close-x">✕</text>
          </view>

          <view class="hero-tag">
            <text class="tag-dot"></text>
            <text class="tag-text">对公转账 · 安全可信</text>
          </view>
          <view class="hero-title-main">转账开通会员</view>
          <view class="hero-sub-desc">请选择合适的方案，按下方账户信息汇款</view>
        </view>

        <view class="modal-body">
          <!-- 会员类型选项卡片 -->
          <view class="plan-tabs">
            <view class="plan-tab personal">
              <view class="plan-tab-head">
                <view class="plan-badge personal-badge">个人会员</view>
                <view class="plan-amount">
                  <text class="amount-symbol">¥</text>
                  <text class="amount-num">1980</text>
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
                  <text class="amount-num">19800</text>
                  <text class="amount-unit">/年</text>
                </view>
              </view>
              <text class="plan-tab-desc">适合企业直接集中购买</text>
            </view>
          </view>

          <!-- 汇款信息卡片 -->
          <view class="bank-card">
            <view class="bank-card-head">
              <view class="bank-logo">
                <text class="bank-logo-text">银行</text>
              </view>
              <view class="bank-head-info">
                <text class="bank-head-name">{{ transferInfo.bankName }}</text>
                <text class="bank-head-sub">{{ transferInfo.branchName }}</text>
              </view>
              <!-- <view class="bank-chip"></view> -->
            </view>

            <view class="bank-account-row">
              <text class="bank-account-label">收款账号</text>
              <text class="bank-account-num">{{ transferInfo.accountNo }}</text>
            </view>

            <view class="bank-card-foot">
              <view class="bank-foot-item">
                <text class="foot-label">户名</text>
                <text class="foot-value">{{ transferInfo.accountName }}</text>
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
            <text class="notice-text">转账完成后请保留截图并联系客服开通会员</text>
          </view>
        </view>

        <!-- 底部按钮 -->
        <view class="modal-footer">
          <view class="btn-copy" @tap="onCopyTransfer">
            <text class="btn-copy-text">复制汇款信息</text>
          </view>
          <view class="btn-know" @tap="closeModal">
            <text class="btn-know-text">我知道了</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 会员服务协议弹窗 -->
    <view class="agreement-overlay" v-if="showAgreement" @tap="showAgreement = false">
      <view class="agreement-modal" @tap.stop>
        <view class="agr-header">
          <text class="agr-header-title">会员服务协议</text>
          <view class="agr-close" @tap="showAgreement = false">
            <text class="agr-close-icon">✕</text>
          </view>
        </view>

        <scroll-view class="agr-body" scroll-y show-scrollbar="false">
          <view class="agr-title">探客工兵小程序会员服务协议</view>

          <view class="agr-block">
            <view class="agr-block-title">重要提示</view>
            <view class="agr-hint">
              <view class="agr-hint-num">1</view>
              <text class="agr-hint-text">用户在开通、续费本小程序会员服务前，请务必认真阅读本《会员服务协议》（以下简称“本协议”）全部条款。您主动勾选同意本协议、完成会员费用支付、开通会员服务的行为，即表示您已充分阅读、理解并自愿接受本协议所有约定，自愿受本协议法律约束。</text>
            </view>
            <view class="agr-hint">
              <view class="agr-hint-num">2</view>
              <text class="agr-hint-text">本协议是您（以下简称“会员/乙方”）与本小程序运营主体（以下简称“平台/甲方”）之间关于小程序会员付费服务的有效法律合约，具备完全法律效力。若您不同意本协议任意条款，请立即终止会员开通及付费操作，不得使用本平台会员服务。</text>
            </view>
            <view class="agr-hint">
              <view class="agr-hint-num">3</view>
              <text class="agr-hint-text">本协议严格遵守《中华人民共和国民法典》《网络安全法》《个人信息保护法》及微信小程序平台运营规范，仅适用于本小程序注册付费会员的数据查询专属服务。</text>
            </view>
          </view>

          <view class="agr-info">
            <view class="agr-info-title">甲方（平台运营方）信息</view>
            <view class="agr-info-row"><text class="agr-info-label">主体名称</text><text class="agr-info-value">苏州聚深软件有限公司</text></view>
            <view class="agr-info-row"><text class="agr-info-label">统一社会信用代码</text><text class="agr-info-value">91320594MAEUDN0896</text></view>
            <view class="agr-info-row"><text class="agr-info-label">联系电话</text><text class="agr-info-value">18962521935</text></view>
            <view class="agr-info-row"><text class="agr-info-label">联系地址</text><text class="agr-info-value">苏州工业园区宏业路178号4幢F158室</text></view>
            <view class="agr-info-row"><text class="agr-info-label">乙方</text><text class="agr-info-value">自愿注册本小程序账号、缴纳会员年费、开通会员服务的自然人/合法单位</text></view>
          </view>

          <view class="agr-section">
            <view class="agr-section-title">第一条 服务定义与服务范围</view>
            <view class="agr-para">1.1 本服务为付费年度会员专属服务，甲方依托自主运营的微信小程序，为乙方提供全国范围内对应行业、对应品类的应用数据查询、数据浏览、合规数据参考等专属服务，非会员用户无法解锁对应权限。</view>
            <view class="agr-para">1.2 会员服务内容以小程序内公示的会员权益为准，核心权益包含：数据查询权限、专属数据更新查看权限、会员专属功能使用权限、基础客服咨询服务等。甲方可根据运营需求优化、升级服务功能，新增合规权益将自动归属于有效会员，无额外收费。</view>
            <view class="agr-para">1.3 乙方确认：本平台提供的所有数据仅供用户参考、研究、合规使用，不构成任何商业决策、法律、投资、专业权威定论建议，乙方需自行承担数据使用的全部风险与责任。</view>
            <view class="agr-para">1.4 本会员服务仅限乙方本人/本单位合规使用，账号仅限本人登录操作，禁止转借、出租、出售、共享会员权限。</view>
          </view>

          <view class="agr-section">
            <view class="agr-section-title">第二条 会员费用与缴费规则</view>
            <view class="agr-para">2.1 本平台会员采用按年付费、先付费后使用模式，无免费试用周期，会员有效期为缴费成功当日起365天。</view>
            <view class="agr-para">2.2 会员年费为年度会员服务费，包含本协议约定的全部会员基础权益，无隐形消费、强制增值收费。</view>
            <view class="agr-para">2.3 缴费方式：乙方通过本小程序官方支付通道，使用微信支付完成线上缴费或者直接对公线下缴费，所有缴费记录以小程序后台及微信支付官方账单为准，作为双方服务履约凭证。</view>
            <view class="agr-para">2.4 价格调整：甲方有权根据运营成本、市场调整优化会员年费标准，价格调整仅对新续费、新开通会员生效，不会影响乙方当前已生效的会员服务周期及权益。价格调整前，甲方将在小程序首页、会员中心公示，公示期3个工作日。</view>
            <view class="agr-para">2.5 续费规则：会员到期前，乙方可自主选择续费延续会员权限；会员到期未续费的，会员权益自动失效，所有专属数据查询权限、会员功能将自动关闭，直至乙方完成续费重新开通。</view>
            <view class="agr-para">2.6 乙方确认：缴费开通会员属于虚拟网络服务消费，服务一经开通、权益即时生效，乙方自愿认可该付费规则，不得以此为由恶意投诉、索赔。</view>
          </view>

          <view class="agr-section">
            <view class="agr-section-title">第三条 会员账号与用户义务</view>
            <view class="agr-para">3.1 乙方需自主完成小程序账号注册，如实填写合规信息，确保账号信息真实、有效、合法，不得使用虚假信息、他人信息注册会员。</view>
            <view class="agr-para">3.2 乙方负责保管自身小程序账号、登录信息、支付信息，因乙方泄露账号、密码、主动共享账号、转借账号导致的账号异常、权限盗用、数据泄露、财产损失等，全部由乙方自行承担责任，甲方不承担任何赔偿责任。</view>
            <view class="agr-para">3.3 乙方使用会员服务时，必须遵守国家法律法规、微信平台规则及本协议约定，禁止以下行为：</view>
            <view class="agr-list">
              <view class="agr-list-item">（1）利用会员权限爬取、批量采集、复制、倒卖、传播平台数据，用于商业售卖、非法牟利；</view>
              <view class="agr-list-item">（2）破解、篡改小程序系统、数据，攻击平台服务器、干扰平台正常运营；</view>
              <view class="agr-list-item">（3）多设备批量登录、多人共享会员账号、转租会员权限；</view>
              <view class="agr-list-item">（4）利用本平台数据及服务从事违法违规、侵权、造谣、损害平台声誉等行为；</view>
              <view class="agr-list-item">（5）其他违反法律法规及平台规则的行为。</view>
            </view>
            <view class="agr-para">3.4 若乙方存在上述违规行为，甲方有权立即暂停、终止会员服务，冻结或封禁账号，不予退费，同时保留追究乙方法律责任的权利，若造成甲方损失，乙方需全额赔偿。</view>
          </view>

          <view class="agr-section">
            <view class="agr-section-title">第四条 退款与退费规则</view>
            <view class="agr-para">4.1 常规不予退款情形：会员年费缴纳成功、权益生效后，除本协议明确约定情形外，不支持任何理由退费，包括但不限于：用户个人原因不想使用、误充值、忘记使用、认为服务不符合个人预期等主观原因。</view>
            <view class="agr-para">4.2 可退款特殊情形：因甲方系统故障、平台长期停服（连续7天及以上无法正常提供会员服务）、甲方单方面终止服务且无替代方案的，乙方可申请按未使用天数比例折算退款。</view>
            <view class="agr-para">4.3 退款流程：符合退款条件的，乙方需向甲方提交书面退款申请及缴费凭证，甲方审核通过后，1-7个工作日内原路退回对应费用。</view>
            <view class="agr-para">4.4 乙方若存在违规使用账号、共享账号、恶意薅取权益、恶意投诉、违反本协议约定的，甲方有权直接拒绝退款，并终止全部会员服务。</view>
          </view>

          <view class="agr-section">
            <view class="agr-section-title">第五条 平台权利与义务</view>
            <view class="agr-para">5.1 甲方按照本协议约定，为有效会员提供稳定、合规的数据查询会员服务，持续维护小程序系统正常运营，定期优化数据内容与服务功能。</view>
            <view class="agr-para">5.2 甲方保障平台运营、收费模式、服务内容合规，严格遵守微信小程序运营规范，保障用户合法合规的使用权益。</view>
            <view class="agr-para">5.3 甲方有权对平台违规账号进行核查、处罚、封禁，有权根据法律法规、平台规则调整服务细则、优化协议条款。</view>
            <view class="agr-para">5.4 因系统升级、服务器维护、网络故障、政策调整、不可抗力等客观因素导致临时停服、服务短暂中断的，甲方无需承担违约责任，可根据实际情况适当顺延会员有效期。</view>
            <view class="agr-para">5.5 甲方严格保护乙方个人信息，不会私自泄露、出售、非法使用用户个人信息，仅用于账号核验、服务履约、售后对接。</view>
          </view>

          <view class="agr-section">
            <view class="agr-section-title">第六条 免责声明</view>
            <view class="agr-para">6.1 平台所展示的各类应用数据均为公开合规整理汇总数据，仅供用户参考使用，甲方不对数据的绝对准确性、完整性、时效性做绝对承诺，乙方自行承担数据使用风险，不得因数据偏差向甲方索赔、追责。</view>
            <view class="agr-para">6.2 因网络波动、微信平台接口故障、运营商故障、设备异常等非甲方原因导致的服务无法访问、数据加载失败等问题，甲方不承担违约责任。</view>
            <view class="agr-para">6.3 因不可抗力（自然灾害、疫情、政策监管调整、平台下架整改等）导致本服务暂停、终止的，双方互不承担违约责任，甲方可根据剩余会员时长酌情顺延服务或折算退款。</view>
            <view class="agr-para">6.4 乙方通过本平台数据做出的任何商业决策、个人行为，全部后果由乙方自行承担，甲方不承担任何连带法律责任。</view>
          </view>

          <view class="agr-section">
            <view class="agr-section-title">第七条 协议变更与终止</view>
            <view class="agr-para">7.1 甲方可根据运营及合规需求修订本协议条款，修订后的协议将在小程序会员中心、公示页面更新，更新后公示3个工作日，公示期满即自动生效，乙方继续使用会员服务视为认可更新后的协议。</view>
            <view class="agr-para">7.2 乙方违反本协议约定、违规使用会员服务的，甲方有权单方面终止协议、关闭会员权益、封禁账号，且不予退费。</view>
            <view class="agr-para">7.3 会员服务到期后，本协议自动终止，乙方不再享有任何会员专属权益，如需继续使用，需重新缴费签约。</view>
          </view>

          <view class="agr-section">
            <view class="agr-section-title">第八条 争议解决</view>
            <view class="agr-para">8.1 本协议的订立、履行、解释及争议解决均适用中华人民共和国法律。</view>
            <view class="agr-para">8.2 双方因本协议产生的任何争议，优先通过友好协商解决；协商不成的，任何一方均有权向甲方运营主体所在地人民法院提起诉讼。</view>
          </view>

          <view class="agr-section">
            <view class="agr-section-title">第九条 其他约定</view>
            <view class="agr-para">9.1 本协议未约定事宜，均以甲方小程序公示的各项规则、公告为准。</view>
            <view class="agr-para">9.2 本协议条款无论因何种原因部分无效，不影响其余条款的法律效力。</view>
            <view class="agr-para">9.3 乙方确认：已完整阅读、充分理解本协议全部条款，自愿开通会员、缴纳年费，自愿遵守全部约定，无任何异议。</view>
          </view>

          <view class="agr-footer-text">（本协议最终解释权归本小程序运营主体所有）</view>
          <view class="agr-date">生效日期：2026年6月1日</view>

          <view class="agr-bottom-space"></view>
        </scroll-view>

        <view class="agr-footer">
          <view class="agr-btn" @tap="showAgreement = false">
            <text class="agr-btn-text">我已阅读并同意</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// 对公转账开通会员页（无线上支付，纯信息展示）
import { getInviterPromoterPayInfo } from '@/static/api/index.js'

export default {
  data() {
    return {
      agreed: true,        // 是否同意会员协议
      showTransferModal: false, // 是否显示转账信息弹框
      showAgreement: false,     // 是否显示会员服务协议弹框
      closing: false,      // 是否正在关闭动画中
      transferInfo: { bankName: '招商银行', branchName: '苏州独墅湖支行', accountNo: '512918325010002', accountName: '苏州聚深软件有限公司' }, // 对公转账信息，接口有值时覆盖
      // 会员权益列表
      benefits: [
        '无限制查看公司及工程师详情',
        '一键联系服务商，专属客服支持',
        '地图全量资源可视化查看和高级筛选',
        '所有企业和工程师资源全部开放'
      ]
    }
  },
  onLoad() {
    // 一进入页面就获取邀请人推广员支付信息
    this.fetchInviterPayInfo()
  },
  methods: {
    // ----------- 点击立即支付：显示对公转账弹框
    onSubmitPay() {
      if (!this.agreed) {
        uni.showToast({ title: '请先同意会员服务协议', icon: 'none' })
        return
      }
      this.closing = false
      this.showTransferModal = true
    },

    // ----------- 关闭弹框（带动画）
    closeModal() {
      this.closing = true
    },

    // ----------- 动画结束后的回调
    onModalAniEnd() {
      if (this.closing) {
        this.showTransferModal = false
        this.closing = false
      }
    },

    // ----------- 复制汇款信息
    onCopyTransfer() {
      const info = `户名：${this.transferInfo.accountName}\n开户行：${this.transferInfo.bankName}${this.transferInfo.branchName}\n账号：${this.transferInfo.accountNo}\n备注：探客工兵会员+手机号`
      uni.setClipboardData({
        data: info,
        success: () => {
          uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
        }
      })
    },

    // ----------- 获取邀请人推广员支付信息
    async fetchInviterPayInfo() {
      try {
        const res = await getInviterPromoterPayInfo()
        if (res && res.data) {
          const data = res.data
          const { bank, branch } = this.parseBankName(data.bankName || '')
          this.transferInfo.bankName = bank || this.transferInfo.bankName
          this.transferInfo.branchName = branch || this.transferInfo.branchName
          this.transferInfo.accountNo = data.bankAccount || this.transferInfo.accountNo
          this.transferInfo.accountName = (data.companyName || data.name) || this.transferInfo.accountName
        }
      } catch (e) {
        // 接口异常保持默认值，静默处理
      }
    },

    // ----------- 从开户行字符串中解析银行和支行
    parseBankName(bankName) {
      if (!bankName) return { bank: '', branch: '' }
      // 优先按空格分割
      const spaceIdx = bankName.indexOf(' ')
      if (spaceIdx > 0) {
        return {
          bank: bankName.substring(0, spaceIdx),
          branch: bankName.substring(spaceIdx + 1)
        }
      }
      // 无空格时从"银行"后切分，保留"股份/有限/公司"在银行名内
      const idx = bankName.indexOf('银行')
      if (idx !== -1) {
        const after = bankName.substring(idx + 2)
        const suffixMatch = after.match(/^(股份)?(有限)?(公司)?/)
        let end = idx + 2
        if (suffixMatch && suffixMatch[0]) {
          end += suffixMatch[0].length
        }
        return {
          bank: bankName.substring(0, end),
          branch: bankName.substring(end)
        }
      }
      return { bank: bankName, branch: '' }
    },
  }
}
</script>

<style scoped lang="scss">
page {
  background: #f4f6fb;
}

.pay-page {
  min-height: 100vh;
  padding: 0 24rpx 40rpx;
  box-sizing: border-box;
}

// ==================== 顶部 VIP 横幅
.hero {
  position: relative;
  margin: 24rpx 0 0;
  padding: 44rpx 40rpx 76rpx 36rpx;
  border-radius: 32rpx;
  background:
    radial-gradient(120% 120% at 0% 0%, rgba(255, 215, 145, 0.18) 0%, transparent 50%),
    radial-gradient(120% 120% at 100% 100%, rgba(99, 140, 255, 0.35) 0%, transparent 60%),
    linear-gradient(135deg, #0b1838 0%, #142a5e 60%, #1d3b8c 100%);
  overflow: hidden;
  box-shadow: 0 16rpx 40rpx rgba(11, 24, 56, 0.35);
}

.hero-decor {
  position: absolute;
  border-radius: 50%;
  filter: blur(2rpx);
  pointer-events: none;
}

.decor-1 {
  width: 360rpx;
  height: 360rpx;
  top: -160rpx;
  right: -120rpx;
  background: radial-gradient(circle, rgba(255, 199, 122, 0.35) 0%, transparent 70%);
  animation: heroBreath1 6s ease-in-out infinite;
}

.decor-2 {
  width: 240rpx;
  height: 240rpx;
  bottom: -100rpx;
  left: -80rpx;
  background: radial-gradient(circle, rgba(120, 160, 255, 0.35) 0%, transparent 70%);
  animation: heroBreath2 7.5s ease-in-out infinite;
}

.decor-3 {
  width: 6rpx;
  height: 6rpx;
  top: 60rpx;
  left: 200rpx;
  background: rgba(255, 255, 255, 0.6);
  box-shadow:
    40rpx 80rpx 0 -1rpx rgba(255, 255, 255, 0.4),
    180rpx 30rpx 0 0 rgba(255, 255, 255, 0.55),
    260rpx 100rpx 0 -1rpx rgba(255, 255, 255, 0.3);
}

.hero-top {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
}

.hero-crown {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  // background: linear-gradient(135deg, #ffd58a 0%, #f5a742 100%);
  box-shadow: 0 6rpx 16rpx rgba(245, 167, 66, 0.45);
  margin-right: 20rpx;

  .crown-icon {
    font-size: 40rpx;
    color: #5a2a00;
    font-weight: 700;
    position: relative;
    top: -4rpx;
  }
}

.hero-brand {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6rpx;

  .brand-main {
    display: flex;
    align-items: baseline;
    gap: 12rpx;
  }

  .brand-svip {
    font-size: 32rpx;
    font-weight: 800;
    letter-spacing: 4rpx;
    background: linear-gradient(90deg, #ffe6b8 0%, #f5a742 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .brand-divider {
    color: rgba(255, 215, 145, 0.4);
    font-size: 24rpx;
  }

  .brand-cn {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.85);
    letter-spacing: 2rpx;
  }

  .brand-sub {
    font-size: 20rpx;
    color: rgba(255, 215, 145, 0.65);
    letter-spacing: 2rpx;
  }
}

.hero-title {
  font-size: 48rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  margin-bottom: 8rpx;
  background: #f8f3f3;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-sub {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 36rpx;
}

.hero-stats {
  display: flex;
  align-items: center;
  padding: 24rpx 0 0;
  border-top: 1rpx solid rgba(255, 255, 255, 0.12);

  .stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-num {
    font-size: 34rpx;
    font-weight: 700;
    color: #ffd58a;
    line-height: 1.2;
    margin-bottom: 4rpx;
  }

  .stat-label {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.6);
  }

  .stat-divider {
    width: 1rpx;
    height: 40rpx;
    background: rgba(255, 255, 255, 0.12);
  }
}

// 内容层 z-index 隔离，确保在动效层之上
.hero-top,
.hero-title,
.hero-sub,
.hero-stats {
  position: relative;
  z-index: 2;
}

// 极光光晕层：缓慢旋转的多彩径向光
.hero-aurora {
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
  animation: heroAurora 12s linear infinite;
}

// 对角扫光层：周期性掠过整张卡片
.hero-sweep {
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
  animation: heroSweep 5s ease-in-out infinite;
}

// ==================== 套餐卡片
.plan-card {
  position: relative;
  margin-top: -42rpx;
  padding: 40rpx 32rpx 36rpx;
  background: #fff;
  border-radius: 28rpx;
  box-shadow: 0 12rpx 32rpx rgba(20, 42, 94, 0.08);
  overflow: hidden;
  z-index: 2;
  border: 1rpx solid rgba(245, 167, 66, 0.18);
}

.plan-shine {
  position: absolute;
  top: 0;
  left: -40%;
  width: 60%;
  height: 100%;
  background: linear-gradient(120deg, transparent 0%, rgba(255, 215, 145, 0.18) 50%, transparent 100%);
  transform: skewX(-20deg);
  pointer-events: none;
}

.plan-tag {
  display: inline-block;
  padding: 6rpx 18rpx;
  background: linear-gradient(135deg, #ff7a45 0%, #ff4d4f 100%);
  color: #fff;
  font-size: 22rpx;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.25);
}

.plan-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.plan-name {
  display: flex;
  flex-direction: column;

  .plan-title {
    font-size: 38rpx;
    font-weight: 700;
    color: #0b1838;
    margin-bottom: 8rpx;
    letter-spacing: 1rpx;
  }

  .plan-desc {
    font-size: 24rpx;
    color: #9aa3b7;
  }
}

.plan-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  .price-row {
    display: flex;
    align-items: baseline;
    color: #1d3b8c;
  }

  .price-symbol {
    font-size: 28rpx;
    font-weight: 700;
  }

  .price-num {
    font-size: 64rpx;
    font-weight: 800;
    line-height: 1;
    margin-left: 4rpx;
    background: linear-gradient(135deg, #1d3b8c 0%, #2962ff 60%, #f5a742 120%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .price-meta {
    margin-top: 6rpx;
    display: flex;
    align-items: center;
    gap: 10rpx;
  }

  .price-origin {
    font-size: 22rpx;
    color: #b3b9c9;
    text-decoration: line-through;
  }

  .price-unit {
    font-size: 22rpx;
    color: #9aa3b7;
  }
}

.plan-divider {
  height: 1rpx;
  background: linear-gradient(90deg, transparent 0%, #e6ebf5 50%, transparent 100%);
  margin: 32rpx 0 28rpx;
}

.plan-benefits {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
}

.benefit-item {
  display: flex;
  align-items: center;

  .benefit-icon {
    width: 36rpx;
    height: 36rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #1d3b8c 0%, #2962ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 18rpx;
    box-shadow: 0 4rpx 8rpx rgba(41, 98, 255, 0.25);

    .icon-check {
      color: #fff;
      font-size: 22rpx;
      font-weight: 700;
    }
  }

  .benefit-text {
    font-size: 27rpx;
    color: #3d4a66;
  }
}

// ==================== 信任徽章
.trust-row {
  display: flex;
  justify-content: space-between;
  margin-top: 28rpx;
  padding: 24rpx 16rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(20, 42, 94, 0.05);

  .trust-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6rpx;
  }

  .trust-icon {
    font-size: 38rpx;
  }

  .trust-text {
    font-size: 24rpx;
    color: #6b7280;
  }
}

// ==================== 支付方式
.pay-section {
  margin-top: 28rpx;
  padding: 28rpx 32rpx 0;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(20, 42, 94, 0.05);
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 24rpx;

  .section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #0b1838;
  }

  .section-tip {
    font-size: 22rpx;
    color: #9aa3b7;
  }
}

.pay-method {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;

  & + .pay-method {
    border-top: 1rpx solid #f0f2f7;
  }

  // 禁用态
  &.disabled {
    opacity: 0.55;
    pointer-events: none;

    .method-name,
    .method-tip {
      color: #9aa3b7 !important;
    }
  }

  .method-left {
    display: flex;
    align-items: center;
    margin: 10rpx 0;
  }

  .method-icon {
    height: 76rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 22rpx;
  }

  .wechat-icon {
    .wechat-logo {
      width: 70rpx;
    }
  }

  // 对公支付 icon（招行 CMB 红底白字 logo 风格）
  .bank-method-icon {
    width: 70rpx;
    height: 70rpx;
    border-radius: 16rpx;
    background: linear-gradient(135deg, #c8102e 0%, #8b0000 100%);
    box-shadow: 0 6rpx 14rpx rgba(200, 16, 46, 0.35);

    .bank-method-text {
      font-size: 22rpx;
      font-weight: 800;
      color: #fff;
      letter-spacing: 1rpx;
    }
  }

  // 禁用提示标签
  .method-disabled-tag {
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    background: #f4f6fb;
    color: #9aa3b7;
    font-size: 22rpx;
    font-weight: 500;
    border: 1rpx solid #e6ebf5;
  }

  .method-info {
    display: flex;
    flex-direction: column;

    .method-name {
      font-size: 30rpx;
      color: #0b1838;
      font-weight: 600;
      margin-bottom: 4rpx;
    }

    .method-tip {
      font-size: 22rpx;
      color: #9aa3b7;
    }
  }

  .method-check {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    border: 2rpx solid #d1d5db;
    display: flex;
    align-items: center;
    justify-content: center;

    &.checked {
      background: linear-gradient(135deg, #1d3b8c 0%, #2962ff 100%);
      border-color: transparent;
      box-shadow: 0 4rpx 10rpx rgba(41, 98, 255, 0.3);
    }

    .check-icon {
      color: #fff;
      font-size: 24rpx;
      font-weight: 700;
    }
  }
}

// ==================== 协议
.agreement {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 28rpx;
  padding: 0 16rpx;

  .agree-check {
    width: 28rpx;
    height: 28rpx;
    border-radius: 50%;
    border: 2rpx solid #c7cdd9;
    margin-right: 10rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    &.checked {
      background: linear-gradient(135deg, #1d3b8c 0%, #2962ff 100%);
      border-color: transparent;
    }

    .check-icon {
      color: #fff;
      font-size: 18rpx;
      font-weight: 700;
    }
  }

  .agree-text {
    font-size: 22rpx;
    color: #6b7280;
  }

  .agree-link {
    font-size: 22rpx;
    color: #2962ff;
  }
}

// ==================== 底部支付栏占位 + 固定栏
.pay-bar-placeholder {
  height: 180rpx;
}

.pay-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18rpx 24rpx;
  padding-bottom: calc(18rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  box-shadow: 0 -6rpx 24rpx rgba(20, 42, 94, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;

  .bar-left {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  .bar-amount-row {
    display: flex;
    align-items: baseline;
  }

  .bar-symbol {
    font-size: 26rpx;
    font-weight: 700;
    color: #ff4d4f;
  }

  .bar-amount {
    font-size: 48rpx;
    font-weight: 800;
    color: #ff4d4f;
    line-height: 1;
    margin: 0 8rpx 0 4rpx;
  }

  .bar-origin {
    font-size: 22rpx;
    color: #b3b9c9;
    text-decoration: line-through;
  }

  .bar-label {
    font-size: 20rpx;
    color: #ff7a45;
    margin-top: 4rpx;
  }

  .bar-btn {
    flex: 1;
    margin-left: 24rpx;
    height: 88rpx;
    border-radius: 44rpx;
    background: linear-gradient(90deg, #2653ce 0%, #4f73d6 50%, #2567dc 100%);
    color: #fff;
    font-size: 30rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 20rpx rgba(41, 98, 255, 0.4);
    position: relative;
    overflow: hidden;

    .btn-text {
      letter-spacing: 2rpx;
    }

    .btn-arrow {
      margin-left: 10rpx;
      font-size: 36rpx;
      line-height: 1;
    }

    &.disabled {
      opacity: 0.5;
      box-shadow: none;
    }

    &:active {
      opacity: 0.88;
    }
  }
}

// ==================== hero 卡片动效 keyframes
@keyframes heroAurora {
  0%   { transform: translate(0, 0) rotate(0deg); }
  50%  { transform: translate(-6%, 4%) rotate(180deg); }
  100% { transform: translate(0, 0) rotate(360deg); }
}

@keyframes heroSweep {
  0%        { left: -60%; opacity: 0; }
  20%       { opacity: 1; }
  60%, 100% { left: 130%; opacity: 0; }
}

@keyframes heroBreath1 {
  0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.9; }
  50%      { transform: scale(1.15) translate(-10rpx, 8rpx); opacity: 1; }
}

@keyframes heroBreath2 {
  0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.8; }
  50%      { transform: scale(1.2) translate(12rpx, -6rpx); opacity: 1; }
}

// ==================== 转账信息弹框
.transfer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.2s ease-out;
}

.transfer-overlay.closing {
  animation: fadeOut 0.2s ease-out forwards;
}

.transfer-modal {
  width: 100%;
  max-height: 92vh;
  background: #fff;
  border-radius: 36rpx 36rpx 0 0;
  overflow: hidden;
  animation: slideDown 0.32s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  box-shadow: 0 -20rpx 60rpx rgba(11, 24, 56, 0.18);
}

.transfer-modal.closing {
  animation: slideUp 0.22s ease-out forwards;
}

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
  border: 1rpx solid #eef0f6;
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

  .bank-chip {
    width: 56rpx;
    height: 42rpx;
    border-radius: 8rpx;
    background: linear-gradient(135deg, #ffd58a 0%, #d4a259 100%);
    box-shadow: inset 0 0 0 2rpx rgba(255, 255, 255, 0.15);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      inset: 6rpx 8rpx;
      border: 1rpx solid rgba(139, 90, 30, 0.35);
      border-radius: 4rpx;
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
    align-items: flex-start;
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

// ==================== 提示条
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
  }
}

// ==================== 底部按钮
.modal-footer {
  display: flex;
  gap: 18rpx;
  padding: 20rpx 32rpx calc(36rpx + env(safe-area-inset-bottom));
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

    .btn-know-arrow {
      font-size: 28rpx;
      color: #1d3b8c;
      font-weight: 500;
    }

    &:active {
      background: #e6ebf5;
    }
  }
}

// ==================== 会员服务协议弹窗
.agreement-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  animation: fadeIn 0.2s ease-out;
}

.agreement-modal {
  width: 100%;
  max-width: 100vw;
  height: 88vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 -20rpx 60rpx rgba(11, 24, 56, 0.2);
  box-sizing: border-box;
}

.agr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 36rpx;
  border-bottom: 1rpx solid #f0f2f7;
  flex-shrink: 0;

  .agr-header-title {
    font-size: 34rpx;
    font-weight: 700;
    color: #0b1838;
    letter-spacing: 1rpx;
  }

  .agr-close {
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    background: #f4f6fb;
    display: flex;
    align-items: center;
    justify-content: center;

    .agr-close-icon {
      font-size: 26rpx;
      color: #9aa3b7;
      font-weight: 500;
    }
  }
}

.agr-body {
  flex: 1;
  width: 100%;
  padding: 0 36rpx;
  overflow-y: auto;
  box-sizing: border-box;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
    background: transparent;
  }
}

// 协议大标题
.agr-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #0b1838;
  text-align: center;
  padding: 36rpx 0 28rpx;
  letter-spacing: 2rpx;
  word-break: break-all;
}

// 重要提示块
.agr-block {
  background: linear-gradient(135deg, #fff7ed 0%, #fff1e0 100%);
  border: 1rpx solid #fed7aa;
  border-radius: 20rpx;
  padding: 28rpx 24rpx 20rpx;
  margin-bottom: 28rpx;

  .agr-block-title {
    font-size: 30rpx;
    font-weight: 700;
    color: #9a3412;
    margin-bottom: 18rpx;
    text-align: center;
    letter-spacing: 2rpx;
  }
}

.agr-hint {
  display: flex;
  gap: 14rpx;
  align-items: flex-start;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .agr-hint-num {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 24rpx;
    font-weight: 700;
    color: #fff;
    margin-top: 2rpx;
  }

  .agr-hint-text {
    flex: 1;
    font-size: 26rpx;
    color: #7c2d12;
    line-height: 1.7;
    font-weight: 500;
    word-break: break-all;
  }
}

// 甲乙信息块
.agr-info {
  background: #f8fafc;
  border: 1rpx solid #e6ebf5;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 28rpx;

  .agr-info-title {
    font-size: 28rpx;
    font-weight: 700;
    color: #0b1838;
    margin-bottom: 18rpx;
    padding-bottom: 14rpx;
    border-bottom: 1rpx dashed #d1d5db;
  }

  .agr-info-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 12rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .agr-info-label {
    width: 200rpx;
    flex-shrink: 0;
    font-size: 24rpx;
    color: #6b7280;
    font-weight: 500;
    line-height: 1.6;
  }

  .agr-info-value {
    flex: 1;
    font-size: 24rpx;
    color: #0b1838;
    font-weight: 600;
    line-height: 1.6;
    word-break: break-all;
  }
}

// 条款章节
.agr-section {
  margin-bottom: 28rpx;

  .agr-section-title {
    font-size: 30rpx;
    font-weight: 700;
    color: #1d3b8c;
    margin-bottom: 14rpx;
    padding-left: 16rpx;
    border-left: 6rpx solid #2962ff;
    line-height: 1.4;
  }

  .agr-para {
    font-size: 26rpx;
    color: #374151;
    line-height: 1.8;
    margin-bottom: 12rpx;
    text-align: justify;
    word-break: break-all;
  }
}

// 列举项
.agr-list {
  padding-left: 24rpx;
  margin-bottom: 12rpx;

  .agr-list-item {
    font-size: 26rpx;
    color: #374151;
    line-height: 1.8;
    margin-bottom: 8rpx;
    word-break: break-all;
  }
}

// 底部声明文字
.agr-footer-text {
  font-size: 24rpx;
  color: #6b7280;
  text-align: center;
  margin: 20rpx 0 8rpx;
  font-weight: 500;
}

.agr-date {
  font-size: 24rpx;
  color: #6b7280;
  text-align: center;
  font-weight: 500;
  margin-bottom: 24rpx;
}

.agr-bottom-space {
  height: 40rpx;
}

// 底部确认按钮
.agr-footer {
  flex-shrink: 0;
  padding: 20rpx 36rpx calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #f0f2f7;

  .agr-btn {
    height: 88rpx;
    border-radius: 44rpx;
    background: linear-gradient(90deg, #1d3b8c 0%, #2962ff 60%, #4f73d6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 20rpx rgba(41, 98, 255, 0.35);

    .agr-btn-text {
      font-size: 30rpx;
      font-weight: 600;
      color: #fff;
      letter-spacing: 2rpx;
    }

    &:active {
      opacity: 0.9;
    }
  }
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

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}

@keyframes slideDown {
  from { transform: translateY(100%); opacity: 0.4; }
  to   { transform: translateY(0); opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(0); opacity: 1; }
  to   { transform: translateY(100%); opacity: 0; }
}
</style>
