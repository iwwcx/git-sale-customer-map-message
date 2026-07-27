<!-- 工程师详情个人名片页 -->
<template>
  <view v-if="visible || pageMode" :class="['drawer-wrapper', pageMode ? 'page-mode' : '', isClosing ? 'closing' : '']" @tap="handleMaskTap">
    <view class="drawer-panel" @tap.stop :class="isClosing ? 'closing' : ''">
      <!-- 头部 -->
      <view class="drawer-header" v-if="mode === 'drawer'">
        <text class="header-title">个人名片</text>
        <view class="close-btn" @tap="handleClose">
          <text class="close-icon">返回</text>
        </view>
      </view>

      <!-- 加载中动画 -->
      <view v-if="loading" class="loading-container">
        <view class="loading-content">
          <view class="loading-dots">
            <view class="loading-dot dot-1"></view>
            <view class="loading-dot dot-2"></view>
            <view class="loading-dot dot-3"></view>
          </view>
          <text class="loading-text">正在加载行为轨迹...</text>
        </view>
      </view>

      <!-- 内容 -->
      <!-- 会员引导蒙层：点击能力/联系/查看电话时非会员弹出 -->
      <member-mask
        v-if="showMemberMask"
        :visible="true"
        title="会员专属"
        sub-title="开通会员后可查看该工程师信息"
        btn-text="去开通"
        navigate-url="/pages/common/pay/pay"
        @close="showMemberMask = false"
      />

      <!-- 联系提示弹窗 -->
      <view class="contact-modal-mask" v-if="showContactTip" @tap="cancelContact">
        <view class="contact-modal-panel" @tap.stop>
          <view class="contact-modal-header">
            <text class="contact-modal-icon">💡</text>
            <text class="contact-modal-title">温馨提示</text>
          </view>
          <view class="contact-modal-body">
            <text class="contact-modal-text">
              如果你联系的该工程师不在线，也可以致电询问。如果你需要他帮你引荐关键人，建议你告诉他可以通过本平台在线沟通，通过他的收款二维码支付一定介绍费，以便促成线下拜访。
            </text>
          </view>
          <view class="contact-modal-footer">
            <view class="contact-btn-modal cancel" @tap="cancelContact">取消</view>
            <view class="contact-btn-modal confirm" @tap="confirmContact">我知道了</view>
          </view>
        </view>
      </view>

      <!-- 致电提示弹窗 -->
      <view class="contact-modal-mask" v-if="showCallTip" @tap="cancelCall">
        <view class="contact-modal-panel" @tap.stop>
          <view class="contact-modal-header">
            <text class="contact-modal-icon">💡</text>
            <text class="contact-modal-title">友情提示</text>
          </view>
          <view class="contact-modal-body">
            <text class="contact-modal-text">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 如果您确定致电该工程师，有可能会被对方认为是骚扰。强烈建议您先将话术准备好，寻求拜访或者拜托引荐关键人，引导对方登录大国工匠平台，通过平台在线沟通，必要的话，向对方索要收款二维码支付一定介绍费，以便促成线下拜访。
            </text>
          </view>
          <view class="contact-modal-footer">
            <view class="contact-btn-modal cancel" @tap="cancelCall">取消</view>
            <view class="contact-btn-modal confirm" @tap="confirmCall">确认拨打</view>
          </view>
        </view>
      </view>

      <scroll-view v-show="!loading" class="drawer-content" scroll-y>
        <!-- 用户信息 -->
        <view class="section-user">
          <view class="user-left">
            <view class="avatar-container">
              <image
                class="user-avatar-img"
                :src="staffInfo.userLogo ? getProductImageUrlChat(staffInfo.userLogo) :
                      staffInfo.sex == 2 ? 'https://img2cdn.global-dsc.cn/dgzz_img/6842d00b7f7db24082ed4f59f2bba02a.png' : 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png'"
                mode="aspectFill"
                @error="staffInfo.userLogo = ''"
              />
              <!-- <image class="user-avatar-img" :src="staffInfo.sex == 2 ? 'https://img2cdn.global-dsc.cn/dgzz_img/6842d00b7f7db24082ed4f59f2bba02a.png' : 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png'" mode="aspectFill"></image> -->
              <view class="follow-btn" @tap.stop="toggleFollow" :class="{ active: isFollowed, animating: followAnimating }">
                <text class="follow-icon">{{ isFollowed ? '❤️' : '🤍' }}</text>
              </view>
            </view>
            <text class="user-name">{{ staffInfo.nickName || '大工程师' }}</text>
            <view class="ability-btn" style="background: #FF9800;" @tap="showAbility">TA的能力</view>
            <view class="contact-btn" @tap="contactTA">联系TA</view>
          </view>
          <view class="user-right">
            <view class="info-row">
              <text class="info-label">所在公司：</text>
              <text class="info-value company-link" @tap="goToCompany">{{ staffInfo.compName || '-' }}</text>
            </view>
            <view class="info-row phone-row">
              <text class="info-label">联系电话：</text>
              <!-- 只在电话号区域叠蒙版，label 保持清晰且不可点 -->
              <view class="phone-value-wrap">
                <text class="info-value">{{ isMember ? (maskedPhoneNumber || '-') : '' }}</text>
                <!-- 会员：致电按钮 -->
                <view v-if="isMember && phoneNumber" class="call-btn" :class="{ disabled: phoneHasMask }" @tap.stop="callPhone">
                  <text class="call-btn-text">致电</text>
                </view>
                <!-- 非会员：查看蒙层 -->
                <view v-if="!isMember" class="phone-mask" @tap.stop="onViewPhone">
                  <text class="phone-mask-text">查看</text>
                </view>
              </view>
            </view>
            <view class="info-row">
              <text class="info-label">邮箱地址：</text>
              <text class="info-value">{{ staffInfo.email || '-' }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">岗位职务：</text>
              <text class="info-value">{{ staffInfo.position || (staffInfo.isManager == 1 ? '主管' : '工程师') }}</text>
            </view>
            <view class="info-row account-row">
              <text class="info-label">联系账号：</text>
              <view class="phone-value-wrap">
                <text class="info-value">{{ isMember ? (staffInfo.userMdt || staffInfo.userId || '-') : '' }}</text>
                <view v-if="!isMember" class="phone-mask" @tap.stop="onViewPhone">
                  <text class="phone-mask-text">查看</text>
                </view>
              </view>
            </view>
            <view class="info-row">
              <text class="info-label">所在地址：</text>
              <text class="info-value">{{ staffInfo.CProvince ? staffInfo.CProvince + staffInfo.CCity + staffInfo.CDistrict : '-' }}</text>
            </view>
          </view>
        </view>

        <!-- 时间轴 -->
        <view class="section-timeline">
          <!-- 产品筛选提示（当有筛选产品时显示） -->
          <view v-if="filteredProdName" class="product-filter-tip">
            <text class="filter-tip-icon">🔍</text>
            <text class="filter-tip-text">正在查看 <text style="color: orange;font-weight: bold;">「{{ filteredProdName }}」</text>的相关记录</text>
          </view>

          <!-- Tab切换 -->
          <view class="tab-bar">
            <!-- 滑动指示器 -->
            <view class="tab-indicator" :class="{ right: type === 1 }"></view>
            <view
              class="tab-item"
              :class="{ active: type === 0 }"
              @tap="switchTab(0)"
            >
              <text class="tab-text">他感兴趣的外购件</text>
            </view>
            <view
              class="tab-item"
              :class="{ active: type === 1 }"
              @tap="switchTab(1)"
            >
              <text class="tab-text">他感兴趣的标准件</text>
            </view>
          </view>

          <!-- 非会员引导卡片：白色精致风格 -->
          <view v-if="!isMember" class="member-required-tip" @tap="skipMember">
            <!-- 金色皇冠徽标 -->
            <view class="tip-icon">
              <text class="tip-icon-text">👑</text>
            </view>

            <!-- 标题 + 金色装饰线 -->
            <text class="tip-title">会员专属内容</text>
            <view class="tip-divider">
              <view class="divider-line"></view>
              <view class="divider-dot"></view>
              <view class="divider-line"></view>
            </view>
            <text class="tip-desc">开通会员即可查看完整记录轨迹</text>

            <!-- 按钮 -->
            <view class="tip-btn">
              <text class="btn-text">立即查看</text>
              <text class="btn-arrow">→</text>
            </view>
          </view>

          <template v-else>
            <view v-if="listLoading" class="list-loading">
              <view class="loading-box">
                <view class="loading-dots">
                  <view class="loading-dot dot-1"></view>
                  <view class="loading-dot dot-2"></view>
                  <view class="loading-dot dot-3"></view>
                </view>
                <text class="loading-hint">数据加载中...</text>
              </view>
            </view>

            <empty-state v-else-if="activityList.length === 0" title="暂无数据" hint="该工程师暂无记录" />

            <view v-else v-for="(item, index) in activityList" :key="item.id || index" class="timeline-item">
            <!-- 时间轴左侧标记 -->
            <view class="timeline-left">
              <view class="timeline-dot" :class="getActivityTypeClass(item.type)"></view>
              <view v-if="index < activityList.length - 1" class="timeline-line"></view>
            </view>

            <!-- 时间轴右侧内容 -->
            <view class="timeline-right">
              <view class="activity-header">
                <text class="activity-type" :class="getActivityTypeClass(item.type)">{{ getActivityTypeName(item.type) }}</text>
                <text class="activity-time">{{ item.date || item.createdAt }}</text>
              </view>

              <!-- 产品信息 -->
              <view class="product-card">
                <view v-if="item.prodLogo" class="product-image">
                  <image :src="getProductImageUrl(item.prodLogo)" mode="aspectFill" class="product-img"></image>
                </view>
                <view class="product-info">
                  <text class="product-name">{{ item.prodName || '未知产品' }}</text>
                  <text class="supplier-name">{{ item.compName || '' }}</text>
                </view>
              </view>
            </view>
          </view>
          </template>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { getTankeUserActivityTrailList, followUser, unfollowUser, isFollowUser, getUserPhone } from "@/static/api/index.js"
import { mixinCheckIsMember } from '@/common/utils/member.js'
import EmptyState from "@/common/components/empty-state.vue"
import { getProductImageUrlChat } from '@/common/utils/index.js'
import MemberMask from '@/common/components/member-mask.vue'

export default {
  name: 'StaffDetail',
  components: { EmptyState, MemberMask },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    staffInfo: {
      type: Object,
      default: () => ({})
    },
    // 展示模式：drawer-抽屉弹窗 | page-路由页面
    mode: {
      type: String,
      default: 'drawer'
    },
    // 从"搜产品需求"进入时携带的产品名称
    prodName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      activityList: [],
      loading: false,
      listLoading: false, // 列表单独加载状态
      isClosing: false,
      type: 0, // 0 通用件  1 标准件
      isFollowed: false,        // 是否已关注
      following: false,         // 关注操作进行中
      followAnimating: false,   // 关注动画状态
      phoneNumber: '',          // 从接口获取的手机号
      showContactTip: false,    // 联系提示弹窗显示状态
      showCallTip: false,       // 致电提示弹窗显示状态
      isMember: false,          // 当前用户是否会员，mounted/onShow 时刷新
      showMemberMask: false,     // 非会员点击受限功能时弹出会员引导
      filteredProdName: ''       // 筛选后的产品名称（用于显示"查看的是XXX的数据"）
    }
  },
  computed: {
    // 是否为路由页面模式
    pageMode() {
      return this.mode === 'page'
    },
    // 判断电话号码是否包含*号（脱敏号码不可拨打）
    phoneHasMask() {
      return this.phoneNumber && this.phoneNumber.includes('*')
    },
    // 脱敏后的电话号码（后四位改成****）
    maskedPhoneNumber() {
      if (!this.phoneNumber) return '-'
      if (this.phoneNumber.includes('*')) return this.phoneNumber
      if (this.phoneNumber.length >= 4) {
        return this.phoneNumber.slice(0, -4) + '****'
      }
      return this.phoneNumber
    }
  },
  watch: {
    // 监听页面模式下工程师信息变化
    'staffInfo.userId'(val) {
      if (this.pageMode && val) {
        this.getDetail()
        this.checkFollowStatus()
      }
    }
  },
  mounted() {
    this.isMember = mixinCheckIsMember() // 初始化会员状态
    if (this.staffInfo.userId) {
      this.getDetail()
    }
  },
  onShow() {
    this.isMember = mixinCheckIsMember() // 页面重新显示时刷新会员状态（从付费页返回后发生改变）
  },
  methods: {
    async getDetail() {
      // 非会员不调记录列表接口，避免浪费请求
      if (!this.isMember) {
        this.activityList = []
        this.checkFollowStatus()
        this.getPhone()
        return
      }
      this.listLoading = true
      try {
        const params = { 
          userId: this.staffInfo.userId,
          type: this.type
        }
        // 如果有筛选的产品名称，传入 prodName 参数
        if (this.prodName) {
          params.prodName = this.prodName
          this.filteredProdName = this.prodName
        }
        let res = await getTankeUserActivityTrailList(params)
        this.activityList = res.data || []
      } catch (error) {
        console.error('获取记录失败:', error)
        this.activityList = []
      } finally {
        this.listLoading = false
      }
      // 检查关注状态
      this.checkFollowStatus()
      // 获取手机号
      this.getPhone()
    },

    // 检查关注状态
    async checkFollowStatus() {
      try {
        const res = await isFollowUser({ followUserId: this.staffInfo.userId })
        this.isFollowed = res.data.isFollow
      } catch (e) {
        this.isFollowed = false
      }
    },

    // 切换关注状态
    async toggleFollow() {
      if (this.following) return
      this.following = true
      this.followAnimating = true
      try {
        if (this.isFollowed) {
          await unfollowUser({ followUserId: this.staffInfo.userId })
          this.isFollowed = false
          uni.showToast({ title: '已取消收藏', icon: 'success' })
        } else {
          await followUser({ followUserId: this.staffInfo.userId })
          this.isFollowed = true
          uni.showToast({ title: '收藏成功', icon: 'success' })
        }
      } catch (e) {
        uni.showToast({ title: '操作失败', icon: 'none' })
      } finally {
        this.following = false
        setTimeout(() => {
          this.followAnimating = false
        }, 400)
      }
    },

    // -------------- 获取头像图片
    getAvatarImage(sex) {
      return sex === 2 ? '/static/images/4.png' : '/static/images/1.png'
    },

    // 切换Tab
    switchTab(tab) {
      this.type = tab
      this.getDetail()
    },

    getNameChar(name) {
      if (!name) return '大'
      return name.charAt(0)
    },

    getActivityTypeClass(type) {
      // type: 1 为浏览，2 为下载
      if (type === 2) {
        return 'dot-red'  // 下载产品为红色实心圆
      }
      return 'dot-blue'  // 浏览产品为蓝色空心圆
    },

    getActivityTypeName(type) {
      // type: 1 为浏览，2 为下载
      if (type === 2) {
        return '下载产品'
      } else if (type === 1) {
        return '浏览产品'
      }
      return '未知操作'
    },

    getProductImageUrl(val) {
      if(val.includes('prod') || 
        val.includes('series') || 
        val.includes('logo') || 
        val.includes('mx') || 
        val.includes('yb') || 
        val.includes('sw') || 
        val.includes('wx') || 
        val.includes('images')
      ) {
        return "https://img2cdn.global-dsc.cn/" + val + "_165x165.jpg";
      } else {
        return "https://prodimg.global-dsc.cn/" + val + "?x-0ss-process=image/resize,_165";
      }
    },

    // ----------- 获取用户手机号【仅会员调接口】
    async getPhone() {
      // 非会员不调用接口，避免浪费请求
      if (!mixinCheckIsMember()) {
        this.phoneNumber = ''
        return
      }
      try {
        const res = await getUserPhone({ userId: this.staffInfo.userId })
        this.phoneNumber = res.data || ''
      } catch (e) {
        this.phoneNumber = ''
      }
    },

    // ----------- 点击联系电话蒙层上的“查看”按钮
    onViewPhone() {
      this.showMemberMask = true // 非会员才会出现蒙层，点击直接弹会员引导
    },

    // ----------- 展示能力，跳转到能力档案页面【会员专属】
    showAbility() {
      if (!mixinCheckIsMember()) {
        this.showMemberMask = true
        return
      }
      uni.navigateTo({
        url: `/pages-sub/mine/ability-detail/index?userId=${this.staffInfo.userId}`
      })
    },

    // ----------- 联系TA：先弹出提示弹窗【会员专属】
    contactTA() {
      if (!mixinCheckIsMember()) {
        this.showMemberMask = true
        return
      }
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.navigateTo({ url: '/pages/common/login/index' })
        return
      }
      this.showContactTip = true
    },

    // ----------- 确认联系：关闭弹窗并跳转聊天
    confirmContact() {
      this.showContactTip = false
      const userId = this.staffInfo.userId
      const userName = this.staffInfo.nickName || '大工程师'
      const redirect = `/message/${userId}?name=${encodeURIComponent(userName)}`
      uni.navigateTo({
        url: `/pages-sub/web-view/im?url=${encodeURIComponent(redirect)}`
      })
    },

    // ----------- 取消联系：关闭弹窗
    cancelContact() {
      this.showContactTip = false
    },

    // ----------- 致电TA：弹出致电提示弹窗【会员专属】
    callPhone() {
      if (!mixinCheckIsMember()) {
        this.showMemberMask = true
        return
      }
      // 如果号码包含*号（脱敏号码），不弹出弹窗
      if (this.phoneHasMask) {
        return
      }
      this.showCallTip = true
    },

    // ----------- 确认致电：关闭弹窗并拨打电话
    confirmCall() {
      this.showCallTip = false
      if (this.phoneNumber && !this.phoneHasMask) {
        uni.makePhoneCall({
          phoneNumber: this.phoneNumber
        })
      }
    },

    // ----------- 取消致电：关闭弹窗
    cancelCall() {
      this.showCallTip = false
    },

    // 点击遮罩关闭
    handleMaskTap() {
      if (!this.pageMode) {
        this.handleClose()
      }
    },

    handleClose() {
      if (this.pageMode) {
        uni.navigateBack()
        return
      }
      this.isClosing = true
      setTimeout(() => {
        this.$emit('close')
        this.isClosing = false
      }, 200)
    },

    goToCompany() {
      if (!this.staffInfo.compName || this.staffInfo.compName === '-') return
      uni.navigateTo({
        url: `/pages-sub/explore/enterprise-detail/index?keyword=${encodeURIComponent(this.staffInfo.compName)}`
      })
    },

    skipMember() {
      uni.navigateTo({ url: "/pages/common/pay/pay" })
    },

    getProductImageUrlChat
  }
}
</script>

<style scoped lang="scss">
// ==================== 抽屉容器
.drawer-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  animation: fadeIn 0.2s ease forwards;

  &.closing {
    animation: fadeOut 0.2s ease forwards;
  }

  // 抽屉面板
  .drawer-panel {
    position: absolute;
    top: 0;
    right: 0;
    width: 700rpx;
    height: 100%;
    background: #f5f5f5;
    display: flex;
    flex-direction: column;
    animation: slideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;

    &.closing {
      animation: slideOut 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    // 头部
    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20rpx 36rpx;
      background: #fff;
      border-bottom: 1px solid #eee;

      .header-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #222;
      }

      .close-btn {
        padding: 12rpx 24rpx;
        background: #3c7df0;
        border-radius: 8rpx;

        .close-icon {
          font-size: 26rpx;
          color: #fff;
        }
      }
    }

    // 内容区域
    .drawer-content {
      flex: 1;
      overflow-y: auto;

      // 用户信息
      .section-user {
        display: flex;
        align-items: flex-start;
        gap: 24rpx;
        padding: 40rpx 26rpx;
        background: #fff;
        height: 340rpx;

        // 左侧：头像 + 名字 + 能力按钮
        .user-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          width: 180rpx;
          height: 100%;

          .avatar-container {
            position: relative;
            margin-bottom: 16rpx;

            .user-avatar-img {
              width: 140rpx;
              height: 140rpx;
              border-radius: 50%;
              box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
            }

            .follow-btn {
              position: absolute;
              right: -4rpx;
              bottom: -4rpx;
              width: 44rpx;
              height: 44rpx;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              background: #fff;
              box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
              border: 1rpx solid #f0f0f0;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

              &:active {
                transform: scale(0.85);
              }

              &.active {
                background: #fff1f5;
                border-color: #ffccd5;
              }

              &.animating {
                animation: heartPop 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              }

              .follow-icon {
                font-size: 24rpx;
              }
            }
          }

          .user-name {
            font-size: 32rpx;
            font-weight: 700;
            color: #222;
            margin-bottom: 16rpx;
          }

          .ability-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 160rpx;
            padding: 12rpx 0;
            font-size: 24rpx;
            color: #fff;
            font-weight: 500;
            background: #6988f7;
            border-radius: 28rpx;
            box-shadow: 0 4rpx 12rpx rgba(71, 103, 222, 0.3);
            transition: all 0.2s;

            &:active {
              transform: scale(0.96);
              box-shadow: 0 2rpx 6rpx rgba(71, 103, 222, 0.2);
            }
          }

          .contact-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 160rpx;
            margin-top: 12rpx;
            padding: 12rpx 0;
            font-size: 24rpx;
            color: #fff;
            font-weight: 500;
            background: #6988f7;
            border-radius: 28rpx;
            box-shadow: 0 4rpx 12rpx rgba(60, 125, 240, 0.3);
            transition: all 0.2s;

            &:active {
              transform: scale(0.96);
              box-shadow: 0 2rpx 6rpx rgba(60, 125, 240, 0.2);
            }
          }
        }

        // 右侧：信息列表 + 联系按钮
        .user-right {
          flex: 1;
          height: 100%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding-top: 8rpx;

          .info-row {
            display: flex;
            align-items: center;
            gap: 8rpx;

            // 联系电话号码包裹层：作为蒙层的定位上下文，只蒙住号码不蒙 label
            .phone-value-wrap {
              flex: 1;
              position: relative;
              min-width: 0;
              display: flex;
              align-items: center;
            }

            // 非会员联系电话行上的蒙层样式
            .phone-mask {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              display: flex;
              align-items: center;
              padding-right: 12rpx;
              background: rgba(255, 255, 255, 0.55);
              backdrop-filter: blur(2rpx);
              border-radius: 8rpx;

              .phone-mask-text {
                padding: 8rpx 22rpx;
                font-size: 22rpx;
                color: #fff;
                background: #6988f7;
                border-radius: 20rpx;
                box-shadow: 0 4rpx 12rpx rgba(60, 125, 240, 0.3);
              }
            }

            .info-label {
              font-size: 28rpx;
              color: #666;
              flex-shrink: 0;
              text-align: justify;
              text-align-last: justify;
            }

            .info-value {
              font-size: 26rpx;
              color: #222;
              font-weight: 500;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .company-link {
              color: #2563eb;
            }

            // 致电按钮样式
            .call-btn {
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 8rpx 20rpx;
              background: linear-gradient(135deg, #4f8eff 0%, #2962ff 100%);
              border-radius: 20rpx;
              margin-left: 12rpx;
              flex-shrink: 0;
              transition: all 0.2s;

              &:active {
                transform: scale(0.96);
                opacity: 0.9;
              }

              &.disabled {
                background: #ccc;
                opacity: 0.7;
              }

              .call-btn-text {
                font-size: 22rpx;
                color: #fff;
                font-weight: 500;
              }
            }
          }
        }
      }

      // 时间轴
      .section-timeline {
        padding: 26rpx 36rpx 36rpx;
        background: #f5f5f5;

        // 产品筛选提示
        .product-filter-tip {
          display: flex;
          align-items: center;
          gap: 10rpx;
          padding: 16rpx 20rpx;
          background: linear-gradient(135deg, #e8f4ff 0%, #dbeeff 100%);
          border-radius: 12rpx;
          margin-bottom: 20rpx;
          border: 1rpx solid #b8d9ff;

          .filter-tip-icon {
            font-size: 24rpx;
          }

          .filter-tip-text {
            font-size: 24rpx;
            color: #2a6ac5;
            font-weight: 500;
          }
        }

        // Tab切换栏
        .tab-bar {
          display: flex;
          background: #f0f4fa;
          border-radius: 16rpx;
          padding: 6rpx;
          margin-bottom: 24rpx;
          position: relative;
          overflow: hidden;

          // 滑动背景指示器
          .tab-indicator {
            position: absolute;
            top: 6rpx;
            left: 6rpx;
            width: calc(50% - 6rpx);
            height: calc(100% - 12rpx);
            background: #3c7df0;
            border-radius: 12rpx;
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);

            &.right {
              transform: translateX(calc(100% + 6rpx));
            }
          }

          .tab-item {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20rpx 0;
            border-radius: 12rpx;
            position: relative;
            z-index: 1;
            transition: all 0.2s ease;

            .tab-icon {
              font-size: 28rpx;
              margin-right: 8rpx;
              transition: transform 0.3s ease;
            }

            .tab-text {
              font-size: 28rpx;
              color: #666;
              font-weight: 500;
              transition: all 0.2s ease;
            }

            &.active {
              .tab-icon, .tab-text {
                color: #fff;
                font-weight: 600;
              }
              .tab-icon {
                transform: scale(1.1);
              }
            }

            &:not(.active):active {
              .tab-text {
                color: #888;
              }
            }
          }
        }

        .title-row {
          display: flex;
          align-items: center;
          margin-bottom: 24rpx;

          .section-title {
            font-size: 28rpx;
            font-weight: 600;
            color: #333;
            display: block;
            margin-bottom: 30rpx;
          }

          .count-badge {
            background: linear-gradient(135deg, #ff9f43, #ff7f43);
            border-radius: 20rpx;
            padding: 4rpx 16rpx;
            margin-left: 12rpx;

            .count-text {
              font-size: 22rpx;
              color: #fff;
              font-weight: 600;
            }
          }
        }

        // 非会员引导卡片：白底 + 金色点缀，简洁高级
        .member-required-tip {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 70rpx 40rpx 60rpx;
          background: linear-gradient(180deg, #ffffff 0%, #fcfaf5 100%);
          border-radius: 30rpx;
          box-shadow: 0 8rpx 28rpx rgba(180, 155, 95, 0.1);
          border: 1rpx solid rgba(212, 175, 55, 0.18);
          transition: transform 0.2s;

          &:active {
            transform: scale(0.99);
          }

          // 金色皇冠图标（柔和圆底）
          .tip-icon {
            width: 96rpx;
            height: 96rpx;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #fff5d8 0%, #fae5a8 100%);
            border: 1rpx solid rgba(212, 175, 55, 0.35);
            box-shadow: 0 6rpx 18rpx rgba(212, 175, 55, 0.18);
            margin-bottom: 28rpx;

            .tip-icon-text {
              font-size: 48rpx;
              line-height: 1;
            }
          }

          .tip-title {
            font-size: 32rpx;
            font-weight: 700;
            color: #2c2616;
            letter-spacing: 2rpx;
            margin-bottom: 18rpx;
          }

          // 金色装饰分隔线
          .tip-divider {
            display: flex;
            align-items: center;
            gap: 10rpx;
            margin-bottom: 18rpx;

            .divider-line {
              width: 50rpx;
              height: 1rpx;
              background: linear-gradient(90deg, transparent, #d4af37, transparent);
            }

            .divider-dot {
              width: 8rpx;
              height: 8rpx;
              border-radius: 50%;
              background: #d4af37;
              box-shadow: 0 0 6rpx rgba(212, 175, 55, 0.6);
            }
          }

          .tip-desc {
            font-size: 24rpx;
            color: #8a8270;
            margin-bottom: 40rpx;
            letter-spacing: 1rpx;
          }

          // 按钮：深色背景 + 金色文字（与背景反差，高级不街头）
          .tip-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10rpx;
            min-width: 240rpx;
            padding: 18rpx 48rpx;
            background: linear-gradient(135deg, #2c2616 0%, #4a3f24 100%);
            border-radius: 40rpx;
            box-shadow: 0 6rpx 18rpx rgba(44, 38, 22, 0.25);

            .btn-text {
              font-size: 26rpx;
              font-weight: 600;
              color: #f5d76e;
              letter-spacing: 2rpx;
            }

            .btn-arrow {
              font-size: 26rpx;
              font-weight: 600;
              color: #f5d76e;
            }
          }
        }

        .list-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 120rpx 0;

          .loading-box {
            display: flex;
            flex-direction: column;
            align-items: center;

            .loading-dots {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 20rpx;

              .loading-dot {
                width: 16rpx;
                height: 16rpx;
                border-radius: 50%;
                margin: 0 8rpx;
                animation: dotBounce 1.4s ease-in-out infinite both;

                &.dot-1 {
                  background: #4a83f9;
                  animation-delay: -0.32s;
                }

                &.dot-2 {
                  background: #6d9dff;
                  animation-delay: -0.16s;
                }

                &.dot-3 {
                  background: #a8c6ff;
                  animation-delay: 0s;
                }
              }
            }

            .loading-hint {
              font-size: 26rpx;
              color: #8c929d;
              line-height: 36rpx;
            }
          }
        }

        .timeline-item {
          display: flex;
          animation: slideIn 0.4s ease-out backwards;

          &:nth-child(1) { animation-delay: 0.05s; }
          &:nth-child(2) { animation-delay: 0.1s; }
          &:nth-child(3) { animation-delay: 0.15s; }
          &:nth-child(4) { animation-delay: 0.2s; }
          &:nth-child(5) { animation-delay: 0.25s; }

          .timeline-left {
            width: 60rpx;
            display: flex;
            flex-direction: column;
            align-items: center;
            flex-shrink: 0;

            .timeline-dot {
              margin-top: 8rpx;
              width: 16rpx;
              height: 16rpx;
              border-radius: 50%;
              flex-shrink: 0;
              animation: dotPulse 2s ease-in-out infinite;

              &.dot-red {
                border: 3rpx solid #ff5252;
                box-shadow: 0 0 8rpx rgba(255, 82, 82, 0.4);
              }

              &.dot-blue {
                background: #fff;
                border: 3rpx solid #3c7df0;
                box-shadow: 0 0 8rpx rgba(60, 125, 240, 0.4);
              }
            }

            .timeline-line {
              flex: 1;
              width: 2rpx;
              background: linear-gradient(180deg, #ddd 0%, #e8e8e8 50%, transparent 100%);
              min-height: 60rpx;
            }
          }

          .timeline-right {
            flex: 1;
            padding-left: 20rpx;
            margin-bottom: 40rpx;

            .activity-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 16rpx;

              .activity-type {
                font-size: 28rpx;
                color: #222;

                &.dot-red {
                  color: #ff5252;
                }

                &.dot-blue {
                  color: #3c7df0;
                }
              }

              .activity-time {
                font-size: 24rpx;
                color: #999;
              }
            }

            .product-card {
              background: #fff;
              border-radius: 16rpx;
              padding: 20rpx;
              display: flex;
              align-items: center;
              gap: 20rpx;
              box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
              border: 1rpx solid #f0f0f0;
              transition: all 0.25s ease;

              &:active {
                transform: scale(0.98);
                box-shadow: 0 1rpx 6rpx rgba(0, 0, 0, 0.08);
              }

              .product-image {
                width: 100rpx;
                height: 100rpx;
                flex-shrink: 0;
                border-radius: 12rpx;
                overflow: hidden;
                background: #f5f5f5;
                box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

                .product-img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                }
              }

              .product-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 12rpx;
                min-width: 0;

                .product-name {
                  font-size: 28rpx;
                  color: #333;
                  font-weight: 500;
                  line-height: 1.4;
                  word-break: break-all;
                  position: relative;
                }

                .supplier-name {
                  font-size: 26rpx;
                  color: #999;
                  line-height: 1.4;
                  word-break: break-all;
                  display: flex;
                  align-items: center;

                  &::before {
                    content: '🏭';
                    margin-right: 6rpx;
                    font-size: 22rpx;
                  }
                }
              }
            }
          }
        }
      }
    }

    // Loading 动画
    .loading-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;

      .loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;

        .loading-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24rpx;

          .loading-dot {
            width: 18rpx;
            height: 18rpx;
            border-radius: 50%;
            margin: 0 12rpx;
            animation: dotBounce 1.4s ease-in-out infinite both;

            &.dot-1 {
              background: #3c7df0;
              animation-delay: -0.32s;
            }

            &.dot-2 {
              background: #5a9eff;
              animation-delay: -0.16s;
            }

            &.dot-3 {
              background: #8bb8ff;
              animation-delay: 0s;
            }
          }
        }

        .loading-text {
          font-size: 26rpx;
          color: #666;
        }
      }
    }
  }
}

.page-mode {
  position: relative;
  z-index: auto;
  height: 100vh;
  min-height: 100vh;
  background: #f5f5f5;
  animation: none;

  &.closing {
    animation: none;
  }

  .drawer-panel {
    position: relative;
    width: 100%;
    height: 100vh;
    min-height: 100vh;
    animation: none;

    &.closing {
      animation: none;
    }
  }
}

// ==================== 动画keyframes
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes slideOut {
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
}

// Tab 滑动进入动画
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 时间线圆点脉冲
@keyframes dotPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@keyframes dotBounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

// ==================== 联系提示弹窗样式
.contact-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease forwards;

  .contact-modal-panel {
    width: 500rpx;
    background: #fff;
    border-radius: 24rpx;
    padding: 40rpx 32rpx 32rpx;
    box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.16);
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: scaleIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;

    .contact-modal-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 24rpx;

      .contact-modal-icon {
        font-size: 60rpx;
        line-height: 1;
        margin-bottom: 12rpx;
      }

      .contact-modal-title {
        font-size: 34rpx;
        font-weight: 700;
        color: #1a1a1a;
      }
    }

    .contact-modal-body {
      margin-bottom: 32rpx;

      .contact-modal-text {
        font-size: 28rpx;
        color: #555;
        line-height: 1.7;
        text-align: justify;
      }
    }

    .contact-modal-footer {
      display: flex;
      align-items: center;
      justify-content: space-around;
      gap: 20rpx;
      width: 100%;

      .contact-btn-modal {
        width: 200rpx;
        height: 70rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 40rpx;
        font-size: 26rpx;
        font-weight: 500;
        transition: all 0.2s;

        &:active {
          transform: scale(0.96);
        }

        &.cancel {
          background: #f4f6fa;
          color: #666;
        }

        &.confirm {
          background: linear-gradient(135deg, #4f8eff 0%, #2962ff 100%);
          color: #fff;
          font-weight: 600;
          box-shadow: 0 8rpx 24rpx rgba(41, 98, 255, 0.3);
        }
      }
    }
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes heartPop {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.4);
  }
  50% {
    transform: scale(0.9);
  }
  75% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}
</style>
