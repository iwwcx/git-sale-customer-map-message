<template>
  <view class="explore-container" :class="{ 'has-banner': showMemberBanner }">
    <!-- 会员提示横幅 -->
    <member-banner v-if="showMemberBanner" @click="onMemberBannerClick" @close="showMemberBanner = false" />

    <view class="control-card">
      <!-- 顶部 Tab 切换：公司 / 工程师（胶囊按钮风格） -->
      <view class="tab-bar">
        <view
          class="tab-item"
          :class="{ active: currentTab === 'company' }"
          @tap="changeTab('company')"
        >
          公司
        </view>
        <view
          class="tab-item"
          :class="{ active: currentTab === 'engineer' }"
          @tap="changeTab('engineer')"
        >
          工程师
        </view>
      </view>

      <!-- 公司 Tab 内容 -->
      <block v-if="currentTab === 'company'">
        <!-- 筛选栏：排序 + 距离 -->
        <view class="filter-bar engineer-filter">
          <picker
            class="filter-item"
            mode="selector"
            :range="companySortOptions"
            :value="companySortIndex"
            @change="onCompanySortChange"
          >
            <view class="filter-item-inner">
              <text class="filter-icon">📊</text>
              <text class="filter-label">排序</text>
              <view class="filter-select">
                <text class="filter-value">{{ companySortOptions[companySortIndex] }}</text>
                <text class="filter-arrow">▾</text>
              </view>
            </view>
          </picker>

          <picker
            class="filter-item"
            mode="selector"
            :range="distanceLabels"
            :value="distanceIndex"
            @change="onDistanceChange"
          >
            <view class="filter-item-inner">
              <text class="filter-icon">📍</text>
              <text class="filter-label">距离</text>
              <view class="filter-select">
                <text class="filter-value">{{ distanceLabels[distanceIndex] }}</text>
                <text class="filter-arrow">▾</text>
              </view>
            </view>
          </picker>
        </view>
      </block>

      <!-- 工程师 Tab 内容 -->
      <block v-if="currentTab === 'engineer'">
        <!-- 筛选栏：距离 + 排序方式 -->
        <view class="filter-bar engineer-filter">
          <picker
            class="filter-item"
            mode="selector"
            :range="sortOptions"
            :value="sortIndex"
            @change="onSortChange"
          >
            <view class="filter-item-inner">
              <text class="filter-icon">📊</text>
              <text class="filter-label">排序</text>
              <view class="filter-select">
                <text class="filter-value">{{ sortOptions[sortIndex] }}</text>
                <text class="filter-arrow">▾</text>
              </view>
            </view>
          </picker>

          <picker
            class="filter-item"
            mode="selector"
            :range="distanceLabels"
            :value="distanceIndex"
            @change="onDistanceChange"
          >
            <view class="filter-item-inner">
              <text class="filter-icon">📍</text>
              <text class="filter-label">距离</text>
              <view class="filter-select">
                <text class="filter-value">{{ distanceLabels[distanceIndex] }}</text>
                <text class="filter-arrow">▾</text>
              </view>
            </view>
          </picker>
        </view>
      </block>
    </view>

    <!-- 公司 Tab 内容 -->
    <block v-if="currentTab === 'company'">
      <view class="card-list" v-if="companyList.length > 0">
        <view class="comp-card" v-for="(item, index) in companyList" :key="index" @click="goCompany(item)">
          <view class="comp-logo" :class="['logo-' + ((index % 3) + 1)]">
            <text class="logo-text">{{ getCompChar(item.compName, index) }}</text>
          </view>
          <view class="comp-info">
            <view class="comp-name">{{ item.compName }}</view>
            <view class="comp-meta">
              <text class="meta-icon">📍{{ item.CProvince }}{{ item.CCity }}{{ item.CDistrict }}</text>
              <text class="meta-text"></text>
            </view>
            <view class="comp-meta">
              <text class="engineer-count-icon">🧑‍🔧</text>
              <text class="meta-text">工程师 <text style="color: #ff4700;"> {{ item.userCount }} </text> 人</text>
            </view>
          </view>
          <view class="comp-right">
            <view class="distance-tag">{{ (parseInt(item.distance) / 1000).toFixed(2) }}km</view>
            <text class="arrow-right">›</text>
          </view>
        </view>
      </view>
      <empty-state v-else title="暂无数据" hint="附近暂无可匹配的公司" />
    </block>

    <!-- 工程师 Tab 内容 -->
    <block v-if="currentTab === 'engineer'">
      <view class="card-list" v-if="engineerList.length > 0">
        <view class="eng-card" v-for="(item, index) in engineerList" :key="index" @click="goStaffDetail(item)">
          <view class="eng-avatar-wrap">
            <image class="eng-avatar-img" :src="item.sex == 2 ? 'https://img2cdn.global-dsc.cn/dgzz_img/6842d00b7f7db24082ed4f59f2bba02a.png' : 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png'" mode="aspectFill"></image>
            <view class="online-dot" v-if="item.online"></view>
          </view>
          <view class="eng-info">
            <view class="eng-name">{{ showName(item) }}</view>
            <view class="company-chip">
              <view class="company-chip-icon">企</view>
              <text class="company-chip-name">{{ item.compName }}</text>
            </view>
            <view class="eng-meta" v-if="!item.online">
              <view class="activity-pill" :class="getActivityClass(item.activityLevel)">
                <text class="activity-label">活跃</text>
                <view class="activity-dots">
                  <text
                    v-for="activityNum in 5"
                    :key="activityNum"
                    :class="{ active: activityNum <= (item.activityLevel || 1) }"
                  ></text>
                </view>
                <text class="activity-score">{{ item.activityLevel || 1 }}级</text>
              </view>
            </view>
            <view class="eng-online" v-else>当前在线</view>
          </view>
          <view class="comp-right">
            <view class="distance-tag">{{ (parseInt(item.distance) / 1000).toFixed(2) }}km</view>
            <text class="arrow-right">›</text>
          </view>
        </view>
      </view>
      <empty-state v-else title="暂无数据" hint="附近暂无可匹配的工程师" />
    </block>

    <!-- 接口请求 loading -->
    <loading-overlay :visible="showLoading" :text="loadingText" />
  </view>
</template>

<script>
import { searchNearbyUsersByCompany, getUsersByCompanyName } from '@/static/api/index.js'
import { showName } from '@/common/utils/index.js'
import LoadingOverlay from '@/common/components/loading-overlay.vue'
import EmptyState from '@/common/components/empty-state.vue'
import MemberBanner from '@/common/components/member-banner.vue'
import { mixinShowMemberBanner } from '@/common/utils/member.js'

export default {
  components: { LoadingOverlay, EmptyState, MemberBanner },
  data() {
    return {
      currentTab: 'company', // 当前激活的 tab，可选值：company / engineer
      distanceOptions: [0.5, 1, 2, 3, 5], // 距离下拉选项（km）
      distanceLabels: ['0.5km', '1km', '2km', '3km', '5km'], // 距离下拉选项展示文案（带单位）
      filterConditions: null,
      distanceIndex: 1,
      companyList: [],
      engineerList: [],
      productKeyword: '', // 产品名称搜索关键词
      sortOptions: ['活跃度', '距离'], // 工程师排序选项
      sortIndex: 0, // 默认按活跃度排序
      companySortOptions: ['距离', '工程师数量', '活跃度'], // 公司排序选项
      companySortIndex: 0, // 默认按距离排序
      searchTimer: null, // 防抖计时器
      latitude: uni.getStorageSync('myLatitude'),
      longitude: uni.getStorageSync('myLongitude'),
      prevLatitude: uni.getStorageSync('myLatitude'), // 上次的经纬度，用于检测地图页拖动后刷新
      prevLongitude: uni.getStorageSync('myLongitude'),
      showLoading: false, // 接口请求 loading 状态
      loadingText: '正在加载...', // loading 文案
      showMemberBanner: mixinShowMemberBanner() // 根据本地会员状态初始决定是否显示横幅
    }
  },
  onShow() {
    this.showMemberBanner = mixinShowMemberBanner()
    // 同步最新经纬度
    this.latitude = uni.getStorageSync('myLatitude')
    this.longitude = uni.getStorageSync('myLongitude')

    console.log('onShow', this.latitude, this.longitude)
    console.log('prevLatitude', this.prevLatitude, this.prevLongitude)

    // 检测经纬度是否变化（地图页拖动后刷新）
    const locationChanged = (this.latitude !== this.prevLatitude) || (this.longitude !== this.prevLongitude)

    this.syncDistance()
    // 同步地图页的搜索条件，如果搜索条件变化需要重新加载
    const newFilters = uni.getStorageSync("filterConditions")
    const filtersChanged = JSON.stringify(newFilters) !== JSON.stringify(this.prevFilterConditions)
    // 地图页点击筛选确定后强制刷新
    const needRefresh = uni.getStorageSync("exploreNeedRefresh")
    if (filtersChanged || needRefresh || locationChanged) {
      this.prevFilterConditions = newFilters
      this.filterConditions = newFilters
      if (needRefresh) {
        uni.removeStorageSync("exploreNeedRefresh")
      }
      if (locationChanged) {
        this.prevLatitude = this.latitude
        this.prevLongitude = this.longitude
      }
      if (this.currentTab === 'company') {
        this.getCompanyList()
      } else if (this.currentTab === 'engineer') {
        this.getEngineerList()
      }
    }
  },
  mounted() {
    this.syncDistance()
    this.prevFilterConditions = uni.getStorageSync("filterConditions")
    this.filterConditions = this.prevFilterConditions
    this.getCompanyList();
  },
  watch: {
    // 监听搜索关键词变化，300ms 防抖后自动搜索
    productKeyword(newVal) {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      this.searchTimer = setTimeout(() => {
        this.getCompanyList()
      }, 300)
    }
  },
  methods: {
    // -------------- 获取当前公司数据
    async getCompanyList() {
      this.showLoading = true
      this.loadingText = '正在加载...'
      
      // 排序字段
      let sortBy = 'distance'
      switch(this.companySortOptions[this.companySortIndex]) {
        case '距离':
          sortBy = 'distance'
          break;
        case '工程师数量':
          sortBy = 'engineerCount'
          break;
        case '活跃度':
          sortBy = 'activity'
          break;
      }
      
      try {
        const res = await searchNearbyUsersByCompany({
          lat: this.latitude,
          lng: this.longitude,
          page: 1,
          pageSize: 100,
          distance: this.distanceOptions[this.distanceIndex] * 1000,
          sortBy: sortBy,
          ...this.filterConditions,
          // 如果首页有筛选，需要用首页的筛选加这里的字段用逗号分隔，如果没有，就直接用现在的这个
          productKeywords: this.filterConditions?.productKeywords ? this.filterConditions.productKeywords + this.productKeyword : this.productKeyword,
        })
        this.companyList = res.data || []
      } finally {
        this.showLoading = false
      }
    },

    // -------------- 获取工程师列表
    async getEngineerList() {
      this.showLoading = true
      this.loadingText = '正在加载...'
      try {
        const sortBy = this.sortIndex === 0 ? 'activity' : 'distance'
        const res = await getUsersByCompanyName({
          lat: this.latitude,
          lng: this.longitude,
          distance: this.distanceOptions[this.distanceIndex] * 1000,
          ...this.filterConditions,
          sortBy
        })
        this.engineerList = res.data?.list || []
      } catch (e) {
        this.engineerList = []
        uni.showToast({ title: '加载失败，请重试', icon: 'none' })
      } finally {
        this.showLoading = false
      }
    },

    // -------------- 获取性别对应的样式类
    getSexClass(sex) {
      return sex === 2 ? 'female' : 'male'
    },

    // -------------- 获取名字首字符
    getNameChar(name) {
      if (!name) return '大'
      return name.charAt(0)
    },

    // -------------- 获取公司名头像字符：第 3 个字（兼容短名）
    getCompChar(compName, index) {
      const name = (compName || '').trim()
      if (name.length >= 3) return name.charAt(2)
      if (name.length > 0) return name.charAt(0)
      return '企'
    },

    // -------------- 获取活跃度对应的样式类
    getActivityClass(level) {
      const activityLevel = Number(level) || 1
      if (activityLevel >= 5) return 'activity-super'
      if (activityLevel >= 4) return 'activity-high'
      if (activityLevel >= 3) return 'activity-middle'
      if (activityLevel >= 2) return 'activity-two'
      return 'activity-low'
    },

    // -------------- 距离选择变更
    onDistanceChange(e) {
      this.distanceIndex = Number(e.detail.value)
      if (this.currentTab === 'company') {
        this.getCompanyList()
      } else if (this.currentTab === 'engineer') {
        this.getEngineerList()
      }
      // 同步距离到 map 页面（转换为米并存储）
      uni.setStorageSync('sharedDistance', this.distanceOptions[this.distanceIndex])
    },

    // -------------- 公司排序选择变更
    onCompanySortChange(e) {
      this.companySortIndex = Number(e.detail.value)
      if (this.currentTab === 'company') {
        this.getCompanyList()
      }
    },

    // -------------- 排序选择变更
    onSortChange(e) {
      this.sortIndex = Number(e.detail.value)
      if (this.currentTab === 'engineer') {
        this.getEngineerList()
      }
    },

    // -------------- 同步 map 页面的距离
    syncDistance() {
      const saved = uni.getStorageSync('sharedDistance')
      if (saved && saved > 0) {
        const index = this.distanceOptions.indexOf(saved)
        if (index !== -1 && index !== this.distanceIndex) {
          this.distanceIndex = index
          if (this.currentTab === 'company') {
            this.getCompanyList()
          } else if (this.currentTab === 'engineer') {
            this.getEngineerList()
          }
        }
      }
    },

    // -------------- 切换Tab
    changeTab(tab) {
      this.currentTab = tab
      if (tab === 'company') {
        this.getCompanyList()
      } else if (tab === 'engineer') {
        this.getEngineerList()
      }
    },

    // -------------- 清空产品搜索关键词
    clearProductKeyword() {
      this.productKeyword = ''
      // 防抖会自动触发搜索，无需手动调用
    },

    // -------------- 跳转公司详情
    goCompany(item) {
      const companyInfo = encodeURIComponent(JSON.stringify(item)) // 路由传递的公司信息
      uni.navigateTo({
        url: `/pages-sub/explore/comp-detail/index?companyInfo=${companyInfo}&myLatitude=${this.latitude}&myLongitude=${this.longitude}`
      })
    },

    // -------------- 跳转工程师详情
    goStaffDetail(item) {
      const staffInfo = encodeURIComponent(JSON.stringify(item)) // 路由传递的工程师信息
      uni.navigateTo({
        url: `/pages-sub/explore/staff-detail/index?staffInfo=${staffInfo}`
      })
    },
    showName
  }
}
</script>

<style scoped lang="scss">
// ==================== 探索页容器
.explore-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f4f6fa;
  padding-bottom: 40rpx;
  box-sizing: border-box;
}

// ==================== 顶部控制面板（滚动时吸顶）
.control-card {
  position: sticky;
  top: 0;
  z-index: 10;
  margin: 0 24rpx 22rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 28rpx;
  box-shadow: 0 8rpx 26rpx rgba(20, 45, 90, 0.06);
  border: 1rpx solid rgba(0, 0, 0, 0.03);
}

// ==================== 顶部 Tab 切换（文字导航 + 下划线）
.tab-bar {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;

  .tab-item {
    position: relative;
    height: 54rpx;
    line-height: 54rpx;
    margin-right: 56rpx;
    text-align: center;
    font-size: 30rpx;
    color: #8a8f99;
    transition: all 0.3s;

    // 激活态：文字加深 + 底部蓝色短线
    &.active {
      color: #2f73ff;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: -2rpx;
        width: 46rpx;
        height: 6rpx;
        border-radius: 6rpx;
        background: #2f73ff;
        transform: translateX(-50%);
      }
    }
  }
}

// ==================== 筛选栏
.filter-bar {
  display: flex;
  align-items: center;
  gap: 14rpx;

  .filter-item {
    flex-shrink: 0;
  }

  .filter-item-inner {
    display: flex;
    align-items: center;
    gap: 12rpx;
    height: 68rpx;
    padding: 0 22rpx;
    background: #f6f8fb;
    border-radius: 30rpx;
  }

  // 产品搜索框
  .search-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10rpx;
    height: 72rpx;
    padding: 0 24rpx;
    background: #f6f8fb;
    border-radius: 36rpx;

    .search-icon {
      font-size: 24rpx;
      color: #2f73ff;
    }

    .search-input {
      flex: 1;
      font-size: 26rpx;
      color: #333;
      height: 72rpx;
      line-height: 72rpx;
    }

    .search-placeholder {
      color: #bbb;
      font-size: 26rpx;
    }

    .clear-icon {
      font-size: 36rpx;
      color: #999;
      line-height: 1;
      padding: 0 8rpx;
      cursor: pointer;
      transition: color 0.2s;

      &:active {
        color: #666;
      }
    }
  }

  .filter-icon {
    font-size: 28rpx;
    color: #2f73ff;
  }

  .filter-label {
    font-size: 26rpx;
    color: #8a8f99;
    white-space: nowrap;
  }

  .filter-select {
    display: flex;
    align-items: center;
    gap: 6rpx;

    .filter-value {
      font-size: 26rpx;
      color: #f2a65a;
      font-weight: 500;
      white-space: nowrap;
    }

    .filter-arrow {
      font-size: 30rpx;
      color: #8a8f99;
      line-height: 1;
    }
  }

  // 公司筛选栏：搜索优先，距离靠右
  &.company-filter {
    .filter-item {
      width: 260rpx;
    }
  }

  // 搜企业筛选栏：包裹相对定位，承载下拉
  &.search-company-filter {
    position: relative;
    flex-wrap: wrap;

    .search-wrap {
      flex: 1;
    }

    .suggest-dropdown {
      position: absolute;
      left: 0;
      right: 0;
      top: calc(100% + 8rpx);
      max-height: 600rpx;
      overflow-y: auto;
      background: #fff;
      border-radius: 20rpx;
      box-shadow: 0 8rpx 30rpx rgba(20, 45, 90, 0.12);
      border: 1rpx solid rgba(0, 0, 0, 0.04);
      z-index: 99;
      padding: 8rpx 0;

      &.empty {
        padding: 24rpx;
        text-align: center;
      }

      .suggest-empty {
        font-size: 26rpx;
        color: #999;
      }

      .suggest-item {
        display: flex;
        align-items: center;
        gap: 14rpx;
        padding: 22rpx 28rpx;
        font-size: 28rpx;
        color: #333;
        border-bottom: 1rpx solid #f2f4f8;
        transition: background 0.2s;

        &:last-child {
          border-bottom: none;
        }

        &:active {
          background: #f6f8fb;
        }

        .suggest-icon {
          font-size: 28rpx;
          flex-shrink: 0;
        }

        .suggest-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  // 工程师筛选栏：排序 + 距离
  &.engineer-filter {
    .filter-item {
      flex: 1;
      max-width: 50%;
    }
  }
}

// ==================== 卡片列表通用
.card-list {
  padding: 0 24rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

// ==================== 公司卡片
.comp-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 26rpx 30rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(0, 0, 0, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
  }

  .comp-logo {
    width: 96rpx;
    height: 96rpx;
    border-radius: 20rpx;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
    background: #3c7df0;

    image {
      width: 100%;
      height: 100%;
    }

    .logo-text {
      font-size: 40rpx;
      font-weight: 700;
      color: #fff;
    }
  }

  .comp-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    .comp-name {
      font-size: 30rpx;
      font-weight: 600;
      color: #1a1a1a;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .comp-meta {
      display: flex;
      align-items: center;
      margin: 6rpx 0;
      gap: 6rpx;

      .meta-icon {
        font-size: 22rpx;
        color: #999;
      }

      .meta-text {
        font-size: 24rpx;
        color: #888;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .engineer-count-icon {
        width: 30rpx;
        font-size: 22rpx;
        line-height: 1;
        flex-shrink: 0;
      }
    }
  }
}

// 公司/工程师卡片右侧通用：距离标签 + 箭头
.comp-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;

  .distance-tag {
    background: #fff4d6;
    color: #c98a00;
    font-size: 22rpx;
    padding: 6rpx 14rpx;
    border-radius: 20rpx;
    line-height: 1;
  }

  .arrow-right {
    font-size: 32rpx;
    color: #bbb;
  }
}

// ==================== 工程师卡片
.eng-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(0, 0, 0, 0.04);
  transition: transform 0.2s, box-shadow 0.2s;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
  }

  .eng-avatar-wrap {
    position: relative;
    width: 96rpx;
    height: 96rpx;
    flex-shrink: 0;

    .eng-avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    }

    // 在线状态绿点
    .online-dot {
      position: absolute;
      right: 2rpx;
      bottom: 6rpx;
      width: 20rpx;
      height: 20rpx;
      border-radius: 50%;
      background: #26d97f;
      border: 2rpx solid #fff;
    }
  }

  .eng-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 10rpx;

    .eng-name {
      font-size: 30rpx;
      font-weight: 600;
      color: #1a1a1a;
      line-height: 1.2;
    }

    .company-chip {
      max-width: 100%;
      align-self: flex-start;
      display: flex;
      align-items: center;
      gap: 6rpx;
      margin: 6rpx 0;
      padding: 4rpx 12rpx 4rpx 6rpx;
      background: #eef5ff;
      border: 1rpx solid #b9d6ff;
      border-radius: 999rpx;

      .company-chip-icon {
        width: 28rpx;
        height: 28rpx;
        line-height: 28rpx;
        text-align: center;
        flex-shrink: 0;
        font-size: 18rpx;
        font-weight: 700;
        color: #fff;
        border-radius: 50%;
        background: #4a8cff;
      }

      .company-chip-name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 23rpx;
        color: #3f7edb;
      }
    }

    .eng-meta {
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-top: 2rpx;

      .activity-pill {
        display: inline-flex;
        align-items: center;
        gap: 8rpx;
        padding: 5rpx 12rpx;
        border-radius: 999rpx;
        background: #f6f8fb;

        .activity-label {
          font-size: 21rpx;
          color: #8b94a3;
        }

        .activity-dots {
          display: flex;
          align-items: center;
          gap: 5rpx;
        }

        .activity-dots text {
          width: 8rpx;
          height: 8rpx;
          border-radius: 50%;
          background: #dfe4ec;
        }

        .activity-score {
          font-size: 21rpx;
          font-weight: 700;
          color: #8b94a3;
        }

        &.activity-low {
          .activity-label,
          .activity-score {
            color: #c09036;
          }

          .activity-dots text.active {
            background: #d7aa4a;
          }
        }

        &.activity-middle {
          .activity-label,
          .activity-score {
            color: #4f7db8;
          }

          .activity-dots text.active {
            background: #8aa6cf;
          }
        }

        &.activity-two {
          .activity-label,
          .activity-score {
            color: #4fb8a0;
          }

          .activity-dots text.active {
            background: #4fb8a0;
          }
        }

        &.activity-high,
        &.activity-super {
          .activity-label,
          .activity-score {
            color: #3f9c68;
          }

          .activity-dots text.active {
            background: #78ad8f;
          }
        }
      }
    }
  }
  .eng-online {
    margin-top: 2rpx;
    font-size: 24rpx;
    color: #8BC34A;
  }
}
</style>
