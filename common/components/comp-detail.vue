<!-- 公司详情组件 -->
<!-- 因为之前不知道后边有需要作为路由跳转的需求，所以做成弹窗了，确实不太好，现在只能加个 mode 来判断当前是路由还是弹窗了 -->
<template>
  <view v-if="visible || pageMode" :class="['drawer-wrapper', pageMode ? 'page-mode' : '', isClosing ? 'closing' : '']" @tap="handleMaskTap">
    <view class="drawer-panel" @tap.stop :class="isClosing ? 'closing' : ''">
      <!-- 头部 -->
      <view class="drawer-header" v-if="mode === 'drawer'">
        <text class="header-title">公司详情</text>
        <view class="close-btn" @tap="handleClose">
          <text class="close-icon">✕</text>
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
          <text class="loading-text">正在加载工程师数据...</text>
          <text class="loading-sub">{{ loadingTips }}</text>
        </view>
      </view>

      <!-- 内容 -->
      <scroll-view v-else class="drawer-content" scroll-y>
        <!-- 公司名称 -->
        <view class="section-company">
          <view class="company-logo">
            <text class="logo-text">{{ getCompChar(companyInfo.compName) }}</text>
            <view class="favorite-btn" @tap.stop="toggleFavorite" :class="{ active: isFavorited, animating: favoriteAnimating }">
              <text class="favorite-icon">{{ isFavorited ? '❤️' : '🤍' }}</text>
            </view>
          </view>
          <view class="company-name-row">
            <text class="company-name">{{ companyInfo.compName || '未知公司' }}</text>
          </view>
          <view class="distance-tag">
            <text class="distance-value" v-if="skipDistance">未知距离</text>
            <text class="distance-value" v-else> {{ companyInfo.distance ? '距您约' + (parseInt(companyInfo.distance) / 1000).toFixed(2) + 'km' : '未知距离' }}</text>
          </view>
          <view class="company-location">
            <text style="margin-right: 6rpx;">📍</text>
            <text class="location-text">{{ compList[0] ? compList[0].CProvince : '' }}</text>
            <text class="location-sep">·</text>
            <text class="location-text">{{ compList[0] ? compList[0].CCity : '' }}</text>
            <text class="location-sep">·</text>
            <text class="location-text">{{ compList[0] ? compList[0].CDistrict : '' }}</text>
          </view>
        </view>

        <!-- 基本信息 -->
        <view class="section-info">
          <view class="info-row">
            <text class="info-label">工程师人数</text>
            <text class="info-value">{{ compList.length }} 人</text>
          </view>
        </view>

        <!-- 员工列表 / 企业信息 -->
        <view class="section-staff">
          <!-- Tab切换 -->
          <view class="section-header">
            <view class="tab-switch">
              <view
                class="tab-btn"
                :class="{ active: infoTab === 'engineer' }"
                @tap="switchInfoTab('engineer')"
              >
                <text class="tab-btn-text">工程师列表</text>
              </view>
              <view
                class="tab-btn"
                :class="{ active: infoTab === 'enterprise' }"
                @tap="switchInfoTab('enterprise')"
              >
                <text class="tab-btn-text">企业信息</text>
              </view>
              <view class="tab-indicator" :class="{ 'to-right': infoTab === 'enterprise' }"></view>
            </view>
          </view>

          <!-- ------------ 工程师列表 tab -->
          <view v-show="infoTab === 'engineer'" class="staff-container">
            <view v-for="(item, index) in compList" :key="item.id" class="staff-row" @tap="showStaffDetail(item)">
              <view class="staff-left">
                <text class="staff-num">{{ index + 1 }}</text>
                <view class="staff-avatar" :class="item.sex == 2 ? 'female' : 'male'">
                  <text class="avatar-text">{{ getNameChar(item.nickName) }}</text>
                </view>
                <text class="staff-name">{{ item.nickName || '大工程师' }}</text>
              </view>
              <view class="staff-right">
                <text class="staff-mdt">{{ item.userMdt }}</text>
              </view>
            </view>
          </view>

          <!-- ------------------- 企业信息 tab -->
          <view v-show="infoTab === 'enterprise'" class="enterprise-content">
            <!-- 企业信息卡片 -->
            <view class="enterprise-card" v-if="enterpriseInfo.companyName">

              <!-- 企业名称卡片 -->
              <view class="ent-name-card" @tap.stop="goEnterpriseDetail">
                <view class="ent-name-main">
                  <text class="ent-name-text">{{ enterpriseInfo.companyName }}</text>
                  <view class="ent-status" :class="getStatusClass(enterpriseInfo.businessstatus)">
                    <text class="ent-status-dot"></text>
                    <text class="ent-status-text">经营状态：{{ enterpriseInfo.businessstatus || '存续' }}</text>
                  </view>
                </view>
                <!-- 详情入口按钮 -->
                <view class="ent-detail-btn">
                  <text class="ent-detail-btn-text">企业详情</text>
                  <text class="ent-detail-btn-arrow">➔</text>
                </view>
              </view>

              <!-- 核心信息 -->
              <view class="ent-key-grid">
                <view class="ent-key-cell" v-if="enterpriseInfo.faRen">
                  <text class="ent-key-label">法人代表</text>
                  <text class="ent-key-value">{{ enterpriseInfo.faRen }}</text>
                </view>
                <view class="ent-key-cell" v-if="enterpriseInfo.regDate">
                  <text class="ent-key-label">成立日期</text>
                  <text class="ent-key-value">{{ formatDate(enterpriseInfo.regDate) }}</text>
                </view>
              </view>

              <!-- 基本信息 -->
              <view class="ent-block">
                <view class="ent-block-title">
                  <view class="title-accent"></view>
                  <text class="title-text">基本信息</text>
                </view>
                <view class="ent-block-body">
                  <view class="ent-row" v-if="enterpriseInfo.industry">
                    <text class="ent-row-label">所属行业</text>
                    <text class="ent-row-value tag">{{ enterpriseInfo.industry.includes("Industry") ? JSON.parse(enterpriseInfo.industry)?.Industry : enterpriseInfo.industry }}</text>
                  </view>
                  <view class="ent-row" v-if="enterpriseInfo.regMoney">
                    <text class="ent-row-label">注册资本</text>
                    <text class="ent-row-value">{{ formatRegMoney(enterpriseInfo.regMoney) }}</text>
                  </view>
                  <view class="ent-row" v-if="enterpriseInfo.CreditCode">
                    <text class="ent-row-label">信用代码</text>
                    <text class="ent-row-value">{{ enterpriseInfo.CreditCode }}</text>
                  </view>
                  <view class="ent-row" v-if="enterpriseInfo.regorgName">
                    <text class="ent-row-label">登记机关</text>
                    <text class="ent-row-value">{{ enterpriseInfo.regorgName }}</text>
                  </view>
                  <view class="ent-row" v-if="enterpriseInfo.companyNameold">
                    <text class="ent-row-label">企业曾用名</text>
                    <text class="ent-row-value">{{ enterpriseInfo.companyNameold }}</text>
                  </view>
                  <view class="ent-row" v-if="enterpriseInfo.address">
                    <text class="ent-row-label">注册地址</text>
                    <text class="ent-row-value">📍{{ enterpriseInfo.address }}</text>
                  </view>
                </view>
              </view>

              <!-- 经营范围 -->
              <view class="ent-block" v-if="enterpriseInfo.bussinessDes">
                <view class="ent-block-title">
                  <view class="title-accent"></view>
                  <text class="title-text">经营范围</text>
                </view>
                <view class="ent-block-body">
                  <text class="ent-scope-text">{{ enterpriseInfo.bussinessDes }}</text>
                </view>
              </view>

            </view>

            <!-- 无数据/加载中 -->
            <view v-else-if="enterpriseLoading" class="enterprise-loading">
              <view class="loading-dots">
                <view class="loading-dot dot-1"></view>
                <view class="loading-dot dot-2"></view>
                <view class="loading-dot dot-3"></view>
              </view>
              <text class="loading-text">正在加载企业信息...</text>
            </view>
            <view v-else class="enterprise-empty">
              <text class="empty-icon">🏢</text>
              <text class="empty-text">暂无企业信息</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 员工详情抽屉（放在drawer-panel外面，确保z-index层级正确） -->
    <staff-detail
      v-if="staffDetailVisible"
      ref="staffDetailRef"
      :visible="staffDetailVisible"
      :staffInfo="currentStaff"
      mode="drawer"
      @close="staffDetailVisible = false"
    />

    <!-- 非会员弹出的会员引导蒙层 -->
    <member-mask
      v-if="showMemberMask"
      :visible="true"
      title="会员专属"
      sub-title="开通会员后可查看完整信息"
      btn-text="去开通"
      navigate-url="/pages/common/pay/pay"
      @close="showMemberMask = false"
    />
  </view>
</template>

<script>
import { getUsersByCompanyName, shareCompanyInfo, followEnterprise, unfollowEnterprise, isFollowEnterprise } from "@/static/api/index.js"
import { mixinCheckIsMember } from '@/common/utils/member.js'
import StaffDetail from './staff-detail.vue'
import MemberMask from '@/common/components/member-mask.vue'

export default {
  name: 'CompDetail',
  components: {
    StaffDetail,
    MemberMask
  },
  props: {
    // 抽屉是否显示
    visible: {
      type: Boolean,
      default: false
    },
    // 公司信息（从父组件传入）
    companyInfo: {
      type: Object,
      default: () => ({})
    },
    // 当前用户纬度
    myLatitude: {
      type: Number,
      default: 0
    },
    // 当前用户经度
    myLongitude: {
      type: Number,
      default: 0
    },
    // 展示模式：drawer-抽屉弹窗 | page-路由页面
    mode: {
      type: String,
      default: 'drawer'
    },
    // 是否从搜企业过来的，如果是，距离就展示"未知距离"
    skipDistance: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      compList: [],              // 工程师列表数据
      enterpriseInfo: {},        // 企业信息数据
      enterpriseLoading: false,  // 企业信息加载状态
      infoTab: 'engineer',      // 当前Tab：engineer-工程师列表 | enterprise-企业信息
      staffDetailVisible: false, // 员工详情抽屉显示状态
      currentStaff: {},          // 当前查看的员工信息
      loading: false,           // 加载状态
      loadingTips: '拼命加载中', // 加载提示文字
      isClosing: false,          // 抽屉关闭动画状态
      isFavorited: false,        // 是否已收藏
      favoriting: false,         // 收藏操作进行中
      favoriteAnimating: false,   // 收藏动画状态
      showMemberMask: false       // 非会员时弹出会员引导蒙层
    }
  },
  computed: {
    // 是否为路由页面模式
    pageMode() {
      return this.mode === 'page'
    },

    // 计算公司距离我的距离（千米）
    computedDistance() {
      if (!this.myLatitude || !this.myLongitude || !this.companyInfo.latitude || !this.companyInfo.longitude) {
        return '未知距离'
      }
      const distance = this.calculateDistance(
        this.myLatitude,
        this.myLongitude,
        this.companyInfo.latitude,
        this.companyInfo.longitude
      )
      const km = (distance / 1000).toFixed(1)
      return `${km}km`
    }
  },
  watch: {
    // 监听抽屉显示状态，打开时加载工程师数据
    visible(val) {
      if (val && this.companyInfo.compName) {
        this.getUsersByCompanyName()
        this.checkFavoriteStatus()
      }
    },
    // 监听页面模式下公司信息变化
    'companyInfo.compName'(val) {
      if (this.pageMode && val) {
        this.getUsersByCompanyName()
        this.checkFavoriteStatus()
      }
    }
  },
  mounted() {
    if (this.pageMode && this.companyInfo.compName) {
      this.getUsersByCompanyName()
      this.checkFavoriteStatus()
    }
  },
  methods: {
    // 获取公司名称首字母（大写）
    getFirstChar(name) {
      if (!name) return '?'
      return name.charAt(0).toUpperCase()
    },

    // 获取公司名头像字符：第 3 个字（兼容短名）
    getCompChar(compName) {
      const name = (compName || '').trim()
      if (name.length >= 3) return name.charAt(2)
      if (name.length > 0) return name.charAt(0)
      return '?'
    },

    // 获取昵称首字符
    getNameChar(name) {
      if (!name) return '大'
      return name.charAt(0)
    },

    // ----------- 格式化注册资本，去掉数字部分小数末尾的0
    formatRegMoney(val) {
      if (!val) return '-'
      const str = String(val)
      // 把字符串里的数字（含小数）做尾随0去除
      return str.replace(/(\d+\.\d*?)0+(?=\D|$)/g, '$1').replace(/(\d+)\.(?=\D|$)/g, '$1')
    },

    // ----------- 格式化日期，只保留 yyyy-MM-dd
    formatDate(val) {
      if (!val) return '-'
      const str = String(val)
      // 兼容 ISO 字符串和普通日期
      const m = str.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
      if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
      return str
    },

    // 根据经营状态返回对应的CSS类名
    getStatusClass(status) {
      const statusMap = {
        '存续': 'status-active',
        '在业': 'status-active',
        '开业': 'status-active',
        '存续（在营）': 'status-active',
        '吊销': 'status-danger',
        '注销': 'status-danger',
        '撤销': 'status-danger',
        '歇业': 'status-warning',
        '停业': 'status-warning'
      }
      return statusMap[status] || 'status-default'
    },

    // 切换Tab
    switchInfoTab(tab) {
      if (this.infoTab !== tab) {
        // 切换到企业信息需要会员权限
        if (tab === 'enterprise' && !mixinCheckIsMember()) {
          this.showMemberMask = true
          return
        }
        this.infoTab = tab
        if (tab === 'enterprise' && !this.enterpriseInfo.companyName && !this.enterpriseLoading) {
          this.shareCompanyInfo()
        }
      }
    },

    // ----------- 跳转到企业深度工商详情页面
    goEnterpriseDetail() {
      const compName = this.companyInfo.compName || this.enterpriseInfo.companyName // 公司名称
      if (!compName) {
        uni.showToast({
          title: '暂无公司名称',
          icon: 'none'
        }) // 弹窗提示公司名称缺失
        return
      } // 阻断跳转逻辑
      uni.navigateTo({
        url: `/pages-sub/explore/enterprise-detail/index?keyword=${encodeURIComponent(compName)}`
      }) // 携带企业名称跳转至详情路由
    },

    // 查看员工详情
    showStaffDetail(staff) {
      // 非会员拦截：弹出开通会员引导
      if (!mixinCheckIsMember()) {
        this.showMemberMask = true
        return
      }
      if (this.pageMode) {
        const staffInfo = encodeURIComponent(JSON.stringify({ ...staff, compName: this.companyInfo.compName })) // 路由传递的工程师信息
        uni.navigateTo({
          url: `/pages-sub/explore/staff-detail/index?staffInfo=${staffInfo}`
        })
        return
      }
      this.currentStaff = { ...staff, compName: this.companyInfo.compName }
      this.staffDetailVisible = true
      this.$nextTick(() => {
        this.$refs.staffDetailRef.getDetail()
      })
    },

    // 获取工程师列表
    async getUsersByCompanyName() {
      this.loading = true
      this.loadingTips = `正在查询「${this.companyInfo.compName}」的工程师信息...`
      try {
        const res = await getUsersByCompanyName({
          lat: this.myLatitude,
          lng: this.myLongitude,
          page: 1,
          pageSize: 100,
          companyName: this.companyInfo.compName
        })
        this.compList = res.data?.list || []
      } finally {
        this.loading = false
      }
    },

    // 获取企业信息
    async shareCompanyInfo() {
      this.enterpriseLoading = true
      try {
        const res = await shareCompanyInfo({
          compName: this.companyInfo.compName
        })
        this.enterpriseInfo = res.data
      } catch (e) {
        this.enterpriseInfo = {}
      } finally {
        this.enterpriseLoading = false
      }
    },

    // ----------- 点击遮罩关闭
    handleMaskTap() {
      if (!this.pageMode) {
        this.handleClose()
      }
    },

    // 关闭抽屉
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

    // Haversine公式：计算两个经纬度坐标之间的距离（米）
    calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371000 // 地球半径（米）
      const dLat = this.toRad(lat2 - lat1)
      const dLon = this.toRad(lon2 - lon1)
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    },

    // 角度转弧度
    toRad(deg) {
      return deg * (Math.PI / 180)
    },

    // 切换收藏状态
    async toggleFavorite() {
      if (this.favoriting) return
      this.favoriting = true
      this.favoriteAnimating = true
      try {
        if (this.isFavorited) {
          await unfollowEnterprise({ followEnterpriseName: this.companyInfo.compName })
          this.isFavorited = false
          uni.showToast({ title: '已取消收藏', icon: 'success' })
        } else {
          await followEnterprise({ followEnterpriseName: this.companyInfo.compName })
          this.isFavorited = true
          uni.showToast({ title: '收藏成功', icon: 'success' })
        }
      } catch (e) {
        uni.showToast({ title: '操作失败', icon: 'none' })
      } finally {
        this.favoriting = false
        setTimeout(() => {
          this.favoriteAnimating = false
        }, 400)
      }
    },

    // 检查收藏状态
    async checkFavoriteStatus() {
      try {
        const res = await isFollowEnterprise({ followEnterpriseName: this.companyInfo.compName })
        this.isFavorited = res.data.isFollow
      } catch (e) {
        this.isFavorited = false
      }
    }
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
  z-index: 999;
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
    width: 620rpx;
    height: 100%;
    background: #fff;
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
      border-bottom: 1px solid #eee;

      .header-title {
        font-size: 34rpx;
        font-weight: 600;
        color: #222;
      }

      .close-btn {
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;

        .close-icon {
          font-size: 26rpx;
          color: #666;
        }
      }
    }

    // 内容区域
    .drawer-content {
      flex: 1;
      overflow-y: auto;

      // 公司名称
      .section-company {
        padding: 60rpx 36rpx 30rpx;
        text-align: center;
        background: #fafafa;
        position: relative;

        .company-logo {
          width: 100rpx;
          height: 100rpx;
          border-radius: 24rpx;
          background: #3c7df0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24rpx;
          position: relative;

          .logo-text {
            font-size: 48rpx;
            font-weight: 600;
            color: #fff;
          }

          .favorite-btn {
            position: absolute;
            right: -8rpx;
            bottom: -8rpx;
            width: 40rpx;
            height: 40rpx;
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

            .favorite-icon {
              font-size: 24rpx;
            }
          }
        }

        .company-name-row {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12rpx;

          .company-name {
            font-size: 36rpx;
            font-weight: 700;
            color: #222;
          }
        }

        .distance-tag {
          display: inline-flex;
          align-items: center;
          background: linear-gradient(135deg, #d6b636, #fe7e00);
          padding: 6rpx 16rpx;
          border-radius: 20rpx;
          margin-bottom: 12rpx;

          .distance-icon {
            font-size: 22rpx;
            margin-right: 4rpx;
          }

          .distance-value {
            font-size: 24rpx;
            color: #fff;
            font-weight: 500;
          }
        }

        .company-location {
          display: flex;
          align-items: center;
          justify-content: center;

          .location-text {
            font-size: 26rpx;
            color: #888;
          }

          .location-sep {
            font-size: 26rpx;
            color: #ccc;
            margin: 0 8rpx;
          }
        }
      }

      // 基本信息
      .section-info {
        padding: 0 36rpx;
        border-bottom: 20rpx solid #fafafa;

        .info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 32rpx 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .info-label {
            font-size: 28rpx;
            color: #666;
          }

          .info-value {
            font-size: 28rpx;
            color: #222;
            font-weight: 500;
          }
        }
      }

      // 员工列表
      .section-staff {
        padding: 20rpx 36rpx 36rpx;

        .section-header {
          margin-bottom: 24rpx;

          .tab-switch {
            display: flex;
            background: #fff;
            border-radius: 16rpx;
            padding: 6rpx;
            box-shadow: 0 0 0 1rpx #e8e8e8;

            .tab-btn {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20rpx 0;
              border-radius: 12rpx;
              transition: all 0.2s ease;

              .tab-icon {
                font-size: 26rpx;
                margin-right: 8rpx;
              }

              .tab-btn-text {
                font-size: 28rpx;
                color: #999;
                font-weight: 500;
              }

              &.active {
                background: linear-gradient(135deg, #3c7df0 0%, #5a9eff 100%);
                box-shadow: 0 4rpx 16rpx rgba(60, 125, 240, 0.3);

                .tab-icon {
                  transform: scale(1.1);
                }

                .tab-btn-text {
                  color: #fff;
                  font-weight: 600;
                }
              }
            }
          }
        }

        .staff-container {
          border: 1px solid #eee;
          border-radius: 16rpx;
          overflow: hidden;

          .staff-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20rpx 24rpx;
            background: #fff;
            border-bottom: 1px solid #f0f0f0;

            &:last-child {
              border-bottom: none;
            }

            &:nth-child(even) {
              background: #fafafa;
            }

            &:active {
              background: #f0f5ff;
            }

            .staff-left {
              display: flex;
              align-items: center;

              .staff-num {
                font-size: 24rpx;
                color: #999;
                width: 40rpx;
              }

              .staff-avatar {
                width: 50rpx;
                height: 50rpx;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 16rpx 0 8rpx;
                flex-shrink: 0;

                &.male {
                  background: #e3f2fd;
                  border: 2rpx solid #b1c7ec;
                }

                &.female {
                  background: #fce4ec;
                  border: 2rpx solid #deabbd;
                }

                .avatar-text {
                  font-size: 24rpx;
                  font-weight: 600;
                  color: #555;
                }
              }

              .staff-name {
                font-size: 28rpx;
                color: #222;
                font-weight: 500;
              }
            }

            .staff-right {
              display: flex;
              align-items: center;

              .staff-mdt {
                text-align: right;
                font-size: 24rpx;
                color: #999;
              }
            }
          }
        }

        // 企业信息内容（新版样式）
        .enterprise-content {
          position: relative;
          margin: 0 -20rpx;
          padding: 24rpx 20rpx 32rpx;
          border-radius: 24rpx;
          background:
            radial-gradient(circle at 0% 0%, rgba(107, 91, 255, 0.10) 0%, transparent 40%),
            radial-gradient(circle at 100% 100%, rgba(60, 125, 240, 0.10) 0%, transparent 45%),
            linear-gradient(160deg, #f5f8ff 0%, #eef3fb 100%);
          overflow: hidden;

          // 装饰圆斑
          &::before {
            content: '';
            position: absolute;
            top: -80rpx;
            right: -80rpx;
            width: 280rpx;
            height: 280rpx;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(107, 91, 255, 0.18), transparent 70%);
            pointer-events: none;
          }

          .enterprise-card {
            position: relative;
            z-index: 1;
            // 企业名称卡片（渐变蓝紫底）
            .ent-name-card {
              display: flex;
              align-items: center;
              background: linear-gradient(135deg, #2196F3 0%, #FF9800 100%);
              border-radius: 24rpx;
              padding: 32rpx 28rpx;
              margin-bottom: 20rpx;
              box-shadow: 0 12rpx 32rpx rgba(60, 125, 240, 0.28);
              position: relative;
              overflow: hidden;

              .ent-detail-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.18);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.35);
                padding: 10rpx 20rpx;
                border-radius: 30rpx;
                flex-shrink: 0;
                margin-left: 16rpx;
                box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
                transition: all 0.2s ease;

                &:active {
                  transform: scale(0.95);
                  background: rgba(255, 255, 255, 0.28);
                }

                .ent-detail-btn-text {
                  font-size: 24rpx;
                  color: #ffffff;
                  font-weight: 600;
                  margin-right: 6rpx;
                }

                .ent-detail-btn-arrow {
                  font-size: 24rpx;
                  color: #ffffff;
                  font-weight: bold;
                  line-height: 1;
                }
              }

              // 右上角装饰
              &::after {
                content: '';
                position: absolute;
                top: -60rpx;
                right: -60rpx;
                width: 180rpx;
                height: 180rpx;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.12);
              }
              &::before {
                content: '';
                position: absolute;
                bottom: -40rpx;
                right: 40rpx;
                width: 100rpx;
                height: 100rpx;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.08);
              }

              .ent-name-bar {
                width: 8rpx;
                border-radius: 4rpx;
                background: rgba(255, 255, 255, 0.85);
                margin-right: 20rpx;
                flex-shrink: 0;
                position: relative;
                z-index: 1;
              }

              .ent-name-main {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                position: relative;
                z-index: 1;

                .ent-name-text {
                  font-size: 32rpx;
                  font-weight: 700;
                  color: #ffe923;
                  line-height: 1.4;
                  margin-bottom: 14rpx;
                  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
                }

                .ent-status {
                  display: inline-flex;
                  align-items: center;
                  align-self: flex-start;
                  padding: 6rpx 16rpx;
                  border-radius: 20rpx;
                  margin-top: 6rpx;
                  font-size: 22rpx;
                  background: rgb(210, 172, 61);
                  backdrop-filter: blur(10px);

                  .ent-status-dot {
                    width: 10rpx;
                    height: 10rpx;
                    border-radius: 50%;
                    margin-right: 8rpx;
                    background: #fff;
                  }

                  .ent-status-text {
                    font-weight: 600;
                    color: #fff;
                  }

                  &.status-active {
                    background: rgba(52, 211, 153, 0.9);
                    .ent-status-dot { background: #fff; box-shadow: 0 0 0 4rpx rgba(255, 255, 255, 0.3); }
                  }

                  &.status-warning {
                    background: rgba(251, 173, 20, 0.9);
                  }

                  &.status-danger {
                    background: rgba(248, 113, 113, 0.9);
                  }
                }
              }
            }

            // 核心信息三宫格
            .ent-key-grid {
              display: flex;
              background: rgba(255, 255, 255, 0.9);
              backdrop-filter: blur(20px);
              border-radius: 20rpx;
              padding: 32rpx 0;
              margin-bottom: 20rpx;
              box-shadow: 0 6rpx 20rpx rgba(60, 125, 240, 0.08);
              border: 1rpx solid rgba(255, 255, 255, 0.8);

              .ent-key-cell {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 0 12rpx;
                position: relative;

                &:not(:last-child)::after {
                  content: '';
                  position: absolute;
                  right: 0;
                  top: 12rpx;
                  bottom: 12rpx;
                  width: 1rpx;
                  background: #eef0f5;
                }

                .ent-key-label {
                  font-size: 24rpx;
                  color: #828a9a;
                  margin-bottom: 10rpx;
                }

                .ent-key-value {
                  font-size: 26rpx;
                  color: #1a2233;
                  font-weight: 600;
                  text-align: center;
                  line-height: 1.3;

                  &.highlight {
                    color: #3c7df0;
                  }
                }
              }
            }

            // 信息区块（基本信息 / 经营范围）
            .ent-block {
              background: rgba(255, 255, 255, 0.9);
              backdrop-filter: blur(20px);
              border-radius: 20rpx;
              margin-bottom: 20rpx;
              box-shadow: 0 6rpx 20rpx rgba(60, 125, 240, 0.08);
              border: 1rpx solid rgba(255, 255, 255, 0.8);
              overflow: hidden;

              .ent-block-title {
                display: flex;
                align-items: center;
                padding: 24rpx 28rpx 16rpx;

                .title-accent {
                  width: 6rpx;
                  height: 24rpx;
                  border-radius: 3rpx;
                  background: linear-gradient(180deg, #3c7df0, #5a9eff);
                  margin-right: 14rpx;
                }

                .title-text {
                  font-size: 28rpx;
                  font-weight: 700;
                  color: #1a2233;
                }
              }

              .ent-block-body {
                padding: 0 28rpx 8rpx;

                .ent-row {
                  display: flex;
                  align-items: flex-start;
                  padding: 20rpx 0;
                  border-top: 1rpx solid #f5f7fb;

                  .ent-row-label {
                    width: 160rpx;
                    flex-shrink: 0;
                    font-size: 26rpx;
                    color: #8b95a7;
                  }

                  .ent-row-value {
                    flex: 1;
                    font-size: 26rpx;
                    color: #1a2233;
                    font-weight: 500;
                    line-height: 1.6;
                    word-break: break-all;
                    text-align: right;

                    &.tag {
                      display: inline-block;
                      flex: 0 0 auto;
                      align-self: flex-start;
                      margin-left: auto;
                      color: #3c7df0;
                      background: #e8f0ff;
                      padding: 4rpx 14rpx;
                      border-radius: 8rpx;
                      font-size: 24rpx;
                      font-weight: 600;
                    }
                  }
                }

                .ent-scope-text {
                  display: block;
                  padding: 4rpx 0 24rpx;
                  font-size: 26rpx;
                  color: #5a6478;
                  line-height: 1.8;
                  word-break: break-all;
                }
              }
            }

            // 兼容旧样式占位（保留以避免影响其它结构）
            .enterprise-header {
              display: flex;
              align-items: flex-start;
              background: linear-gradient(135deg, #3c7df0 0%, #6b5bff 100%);
              border-radius: 24rpx;
              padding: 32rpx;
              margin-bottom: 20rpx;
              box-shadow: 0 8rpx 32rpx rgba(60, 125, 240, 0.25);

              .enterprise-logo {
                width: 100rpx;
                height: 100rpx;
                border-radius: 24rpx;
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 24rpx;
                flex-shrink: 0;

                .enterprise-logo-text {
                  font-size: 48rpx;
                  font-weight: 700;
                  color: #fff;
                }
              }

              .enterprise-basic {
                flex: 1;

                .enterprise-name {
                  font-size: 34rpx;
                  font-weight: 700;
                  color: #fff;
                  display: block;
                  margin-bottom: 12rpx;
                  line-height: 1.3;
                }

                .enterprise-tags {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 12rpx;

                  .status-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 8rpx 16rpx;
                    border-radius: 20rpx;
                    font-size: 22rpx;

                    .status-dot {
                      width: 10rpx;
                      height: 10rpx;
                      border-radius: 50%;
                      margin-right: 8rpx;
                    }

                    .status-text {
                      color: #fff;
                      font-weight: 600;
                    }

                    &.status-active {
                      background: rgba(52, 211, 153, 0.9);
                      .status-dot { background: #fff; }
                    }

                    &.status-warning {
                      background: rgba(251, 173, 20, 0.9);
                      .status-dot { background: #fff; }
                    }

                    &.status-danger {
                      background: rgba(248, 113, 113, 0.9);
                      .status-dot { background: #fff; }
                    }

                    &.status-default {
                      background: rgba(255, 255, 255, 0.25);
                      .status-dot { background: rgba(255, 255, 255, 0.7); }
                    }
                  }
                }
              }
            }

            // 核心信息行
            .key-info-row {
              display: flex;
              align-items: center;
              justify-content: space-around;
              background: #fff;
              border-radius: 20rpx;
              padding: 28rpx 16rpx;
              margin-bottom: 20rpx;
              box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

              .key-item {
                display: flex;
                align-items: center;
                flex: 1;
                justify-content: center;

                .key-icon {
                  font-size: 36rpx;
                  margin-right: 12rpx;
                }

                .key-content {
                  .key-label {
                    font-size: 22rpx;
                    color: #999;
                    display: block;
                    margin-bottom: 4rpx;
                  }

                  .key-value {
                    font-size: 26rpx;
                    color: #333;
                    font-weight: 600;
                    display: block;

                    &.highlight {
                      color: #3c7df0;
                    }
                  }
                }
              }

              .key-divider {
                width: 1rpx;
                height: 60rpx;
                background: #eee;
              }
            }

            // 详情列表
            .detail-list {
              background: #fff;
              border-radius: 20rpx;
              padding: 8rpx 0;
              margin-bottom: 20rpx;
              box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

              .detail-section-title {
                display: flex;
                align-items: center;
                padding: 20rpx 28rpx;
                border-bottom: 1rpx solid #f5f5f5;

                .title-icon {
                  font-size: 28rpx;
                  margin-right: 12rpx;
                }

                .title-text {
                  font-size: 28rpx;
                  font-weight: 600;
                  color: #333;
                }
              }

                .detail-item {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 24rpx 28rpx;
                  border-bottom: 1rpx solid #f5f5f5;

                  &:last-child {
                    border-bottom: none;
                  }

                  .detail-label {
                    font-size: 26rpx;
                    color: #666;
                    flex-shrink: 0;
                    margin-right: 20rpx;
                  }

                  .detail-value {
                    font-size: 26rpx;
                    color: #333;
                    font-weight: 500;
                    text-align: right;
                    max-width: 320rpx;
                    word-break: break-all;

                    &.tag-value {
                      color: #667eea;
                      background: #f0f5ff;
                      padding: 4rpx 12rpx;
                      border-radius: 8rpx;
                      font-size: 24rpx;
                    }
                  }
                }
            }

            // 地址和范围区块
            .address-section,
            .scope-section {
              background: #fff;
              border-radius: 20rpx;
              padding: 24rpx;
              margin-bottom: 20rpx;
              box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

              .detail-section-title {
                display: flex;
                align-items: center;
                margin-bottom: 16rpx;

                .title-icon {
                  font-size: 28rpx;
                  margin-right: 12rpx;
                }

                .title-text {
                  font-size: 28rpx;
                  font-weight: 600;
                  color: #333;
                }
              }

              .address-box,
              .scope-box {
                background: #f8f9ff;
                border-radius: 16rpx;
                padding: 24rpx;

                .address-text,
                .scope-text {
                  font-size: 26rpx;
                  color: #555;
                  line-height: 1.7;
                }
              }
            }
          }

          .enterprise-loading,
          .enterprise-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 120rpx 0;

            .loading-dots {
              display: flex;
              align-items: center;
              margin-bottom: 32rpx;

              .loading-dot {
                width: 16rpx;
                height: 16rpx;
                border-radius: 50%;
                margin: 0 8rpx;
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
              font-size: 28rpx;
              color: #999;
            }

            .empty-icon {
              font-size: 100rpx;
              margin-bottom: 24rpx;
              opacity: 0.4;
            }

            .empty-text {
              font-size: 28rpx;
              color: #999;
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
      background: #fff;

      .loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;

        .loading-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32rpx;

          .loading-dot {
            width: 20rpx;
            height: 20rpx;
            border-radius: 50%;
            margin: 0 10rpx;
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
          font-size: 28rpx;
          color: #333;
          font-weight: 500;
        }

        .loading-sub {
          font-size: 24rpx;
          color: #999;
          margin-top: 12rpx;
          max-width: 400rpx;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
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
  background: #fff;
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
