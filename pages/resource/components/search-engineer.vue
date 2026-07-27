<!-- 搜资源-搜工程师 tab：搜索框 + 省市区筛选（功能未接，纯 UI 占位） -->
<template>
  <view class="search-engineer">
    <!-- 顶部卡片：tab-bar(slot) + 搜索框 + 省市区 -->
    <view class="control-card">
      <slot name="header" />

      <!-- 搜索栏：地区选择 + 搜索框 + 搜索按钮 三个独立元素并排一行 -->
      <view class="search-row">
        <!-- 地区选择（左侧） -->
        <picker class="region-picker" mode="region" :value="region" @change="onRegionChange">
          <view class="region-pill">
            <text class="region-value">📍{{ hasRegion ? (region[2] || region[1] || region[0]) : '全国' }}</text>
            <!-- 未选地区显示下箭头，已选地区显示 × 并重置 -->
            <text class="region-arrow" @tap.stop="hasRegion && clearRegion()">{{ hasRegion ? '×' : '▾' }}</text>
          </view>
        </picker>

        <!-- 搜索输入框（中间，灰色大胶囊） -->
        <view class="search-wrap">
          <text class="search-icon">🔍</text>
          <input
            class="search-input"
            type="text"
            v-model="keyword"
            placeholder="输入姓名、电话、账号"
            placeholder-class="search-placeholder"
            confirm-type="search"
            @confirm="onSearch"
          />
          <text v-if="keyword" class="clear-icon" @tap="keyword = ''">×</text>
        </view>

        <!-- 搜索按钮（右侧） -->
        <view class="search-btn" @tap="onSearch">搜索</view>
      </view>
    </view>

    <!-- 搜索结果数量标题 -->
    <view v-if="hasSearched && list.length > 0" class="search-result-title">
      🔥本次搜索共计 <text style="color: red; font-weight: bold;">
        {{ list.length > 99 ? '99+' : list.length }}
      </text> 位工程师符合要求
    </view>

    <!-- 结果列表（与探客工程师卡片保持一致，活跃度位置换成地点） -->
    <view class="card-list" v-if="list.length > 0">
      <view class="eng-card" v-for="(item, index) in list" :key="index" @click="goStaffDetail(item)">
        <view class="eng-avatar-wrap">
          <image
            class="eng-avatar-img"
            :src="item.userLogo ? getProductImageUrlChat(item.userLogo) :
                  item.userSex == 2 ? 'https://img2cdn.global-dsc.cn/dgzz_img/6842d00b7f7db24082ed4f59f2bba02a.png' : 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png'"
            mode="aspectFill"
            @error="onAvatarError(item)"
          />
          <view class="online-dot" v-if="item.online"></view>
        </view>
        <view class="eng-info">
          <view class="eng-name">{{ showName(item) }}</view>
          <view class="company-chip" v-if="item.compName">
            <view class="company-chip-icon">企</view>
            <text class="company-chip-name">{{ item.compName }}</text>
          </view>
          <view class="eng-meta">
            <view class="location-pill">
              <text class="location-icon">📍</text>
              <text class="location-text">{{ (item.CProvince || item.CCity || item.CDistrict) ? (item.CProvince + item.CCity + item.CDistrict) : '暂无地址' }}</text>
            </view>
          </view>
        </view>
        <view class="comp-right">
          <view class="distance-tag" v-if="item.distance">{{ (parseInt(item.distance) / 1000).toFixed(2) }}km</view>
          <text class="arrow-right">›</text>
        </view>
      </view>
    </view>
    <empty-state v-else title="请输入姓名、电话、账号搜索" hint="未找到匹配的工程师" />

    <loading-overlay :visible="showLoading" text="正在加载..." />

    <!-- 非会员点击搜索时弹出的会员引导蒙层 -->
    <member-mask
      v-if="showMemberMask"
      :visible="true"
      title="会员专属"
      sub-title="开通会员后可使用搜工程师功能"
      btn-text="去开通"
      @close="showMemberMask = false"
    />
  </view>
</template>

<script>
import { searchUsersByProduct } from '@/static/api/index.js'
import { showName, getProductImageUrlChat } from '@/common/utils/index.js'
import { mixinCheckIsMember } from '@/common/utils/member.js'
import EmptyState from '@/common/components/empty-state.vue'
import LoadingOverlay from '@/common/components/loading-overlay.vue'
import MemberMask from '@/common/components/member-mask.vue'

export default {
  components: { EmptyState, LoadingOverlay, MemberMask },
  data() {
    return {
      keyword: '', // 工程师搜索关键词
      region: [], // 省市区选择结果 [省, 市, 区]
      list: [], // 搜索结果列表
      hasSearched: false, // 是否已发起搜索
      showLoading: false, // 加载状态
      showMemberMask: false // 非会员搜索时弹出会员引导
    }
  },
  computed: {
    // 是否已选择省市区
    hasRegion() {
      return this.region && this.region.length === 3 && this.region[0]
    }
  },
  mounted() {
    this.loadRegionFromCache()
  },
  methods: {
    // ----------- 省市区选择变更
    onRegionChange(e) {
      this.region = e.detail.value || []
      this.saveRegionToCache()
    },

    // ----------- 点击搜索按钮
    async onSearch() {
      // 非会员拦截：弹出会员开通引导，不调搜索接口
      if (!mixinCheckIsMember()) {
        this.showMemberMask = true
        return
      }
      const keyword = (this.keyword || '').trim()
      if (!keyword) {
        uni.showToast({ title: '请输入关键词', icon: 'none' })
        return
      }
      this.showLoading = true
      this.hasSearched = true
      try {
        const params = {
          keyword, // 工程师关键词
          distance: 0
        }
        // 选择了省市区才传
        if (this.hasRegion) {
          params.province = this.region[0]
          params.city = this.region[1]
          params.district = this.region[2]
        }
        // 有缓存经纬度则传（用于排序）
        const lat = uni.getStorageSync('myLatitude')
        const lng = uni.getStorageSync('myLongitude')
        if (lat && lng) {
          params.lat = lat
          params.lng = lng
        }
        const res = await searchUsersByProduct(params)
        this.list = res?.data?.list || []
      } catch (e) {
        console.log('搜工程师失败', e)
        this.list = []
      } finally {
        this.showLoading = false
      }
    },

    // ----------- 跳转工程师详情
    goStaffDetail(item) {
      const staffInfo = encodeURIComponent(JSON.stringify(item))
      uni.navigateTo({
        url: `/pages-sub/explore/staff-detail/index?staffInfo=${staffInfo}`
      })
    },

    // ----------- 头像加载失败：清空 userLogo，让模板回退到默认性别头像
    onAvatarError(item) {
      item.userLogo = ''
    },
    
    // ----------- 清空省市区
    clearRegion() {
      this.region = []
      this.saveRegionToCache()
    },

    // ----------- 从缓存读取地区（areaObj.searchEngineer）
    loadRegionFromCache() {
      try {
        const areaObj = uni.getStorageSync('areaObj') || {}
        if (areaObj.searchEngineer && Array.isArray(areaObj.searchEngineer)) {
          this.region = areaObj.searchEngineer
        }
      } catch (e) {
        console.log('读取地区缓存失败', e)
      }
    },

    // ----------- 保存地区到缓存（areaObj.searchEngineer）
    saveRegionToCache() {
      try {
        const areaObj = uni.getStorageSync('areaObj') || {}
        areaObj.searchEngineer = this.region
        uni.setStorageSync('areaObj', areaObj)
      } catch (e) {
        console.log('保存地区缓存失败', e)
      }
    },

    // ----------- 下拉刷新：仅当已搜索时重搜当前关键词
    async refresh() {
      if (this.hasSearched && this.keyword && this.keyword.trim()) {
        await this.onSearch()
      }
    },

    showName,
    getProductImageUrlChat
  }
}
</script>

<style scoped lang="scss">
// ==================== 顶部控制面板（与探客页保持一致）
.control-card {
  position: sticky;
  top: 12rpx;
  z-index: 10;
  margin: 0 24rpx 22rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 28rpx;
  box-shadow: 0 8rpx 26rpx rgba(20, 45, 90, 0.06);
  border: 1rpx solid rgba(0, 0, 0, 0.03);
}

// ==================== 结果列表（与搜产品保持一致）
.card-list {
  padding: 0 24rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

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

      .location-pill {
        display: inline-flex;
        align-items: center;
        gap: 6rpx;
        padding: 5rpx 14rpx;
        border-radius: 999rpx;
        background: #f6f8fb;

        .location-icon {
          font-size: 20rpx;
        }

        .location-text {
          font-size: 24rpx;
          color: #5a6c8a;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 320rpx;
        }
      }
    }
  }
}

// 右侧距离标签 + 箭头
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

// ==================== 搜索行：地区选择 + 搜索框 + 搜索按钮（三个独立元素并排）
.search-row {
  display: flex;
  align-items: center;
  gap: 14rpx;

  // 地区选择（左侧白色小胶囊）
  .region-picker {
    flex-shrink: 0;
  }

  .region-pill {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 72rpx;
    width: 150rpx;
    padding: 0 16rpx;
    background: #f6f8fb;
    border-radius: 40rpx;

    .region-value {
      font-size: 26rpx;
      color: #5a6c8a;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: center;
    }

    .region-arrow {
      margin-left: 10rpx;
      font-size: 30rpx;
      color: #5a6c8a;
      line-height: 1;
    }
  }

  // 搜索输入框（中间灰色大胶囊，占主要宽度）
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
    }
  }

  // 搜索按钮（右侧蓝色）
  .search-btn {
    flex-shrink: 0;
    height: 60rpx;
    line-height: 60rpx;
    padding: 0 32rpx;
    background: linear-gradient(135deg, #2f73ff 0%, #1c5ee6 100%);
    border-radius: 12rpx;
    font-size: 24rpx;
    font-weight: 600;
    color: #fff;
    text-align: center;
    box-shadow: 0 4rpx 16rpx rgba(47, 115, 255, 0.25);
  }
}

// ==================== 搜索结果数量标题
.search-result-title {
  margin: 30rpx 24rpx 16rpx;
  font-size: 26rpx;
  color: #1a1a1a;
}
</style>
