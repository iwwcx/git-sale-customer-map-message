<!-- 搜资源-搜产品 tab：搜索框 + 省市区筛选 -->
<template>
  <view class="search-product">
    <view class="control-card">
      <slot name="header" />

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
            placeholder="请输入产品名称"
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

    <!-- 右下角搜索条件浮动按钮 -->
    <view class="fab-filter" @tap="showTimeFilter = true">
      <text class="fab-icon">🔍</text>
      <!-- 已选时间范围时显示小红点 -->
      <!-- <view v-if="timeRange" class="fab-dot"></view> -->
    </view>

    <!-- 结果列表（与探客工程师卡片保持一致，只是活跃度位置换成地点） -->
    <!-- <view v-if="isRecommend && recommendKeyword" class="recommend-title">🔥猜您对<text style="color: red;font-weight: bold;">「{{ this.recommendKeyword }}」</text>感兴趣，本次为您推荐
      <text style="color: red;font-weight: bold;"> 
        {{ displayList.length ?
        (displayList.length > 99 ? '99+' : displayList.length)
        : 0 
        }}
      </text> 位工程师
    </view> -->
    <view v-if="isRecommend && recommendKeyword" class="recommend-title">🔥根据您的销售产品类别，本次为您推荐
     <text style="color: red;font-weight: bold;"> 
        {{ displayList.length ?
        (displayList.length > 99 ? '99+' : displayList.length)
        : 0 
        }}
      </text> 位潜在客户
    </view>
    <view v-if="isRecommend && !recommendKeyword" class="recommend-title">🔥猜您对以下工程师感兴趣，为您推荐</view>
    <view v-if="!recommendLoading && !isRecommend && recommendKeyword" class="recommend-title">🔥本次搜索共计 <text style="color: red;font-weight: bold;"> 
      {{ displayList.length ?
        (displayList.length > 99 ? '99+' : displayList.length)
        : 0 
      }}
     </text> 位工程师符合要求</view>
    <!-- 局部加载骨架屏 -->
    <view v-if="recommendLoading" class="recommend-loading">
      <view class="loading-spinner">
        <view class="spinner-ring ring-outer"></view>
        <view class="spinner-ring ring-inner"></view>
      </view>
      <text class="loading-text">加载中...</text>
    </view>

    <view class="card-list" v-else-if="displayList.length > 0">
      <view class="eng-card" v-for="(item, index) in displayList" :key="index" @click="goStaffDetail(item)">
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
            <!-- 地点胶囊（替代探客页的活跃度胶囊），无地址时显示"暂无地址" -->
            <view class="location-pill">
              <text class="location-icon">📍</text>
              <text class="location-text">{{ (item.CProvince || item.CCity || item.CDistrict) ? (item.CProvince + item.CCity + item.CDistrict) : '暂无地址' }}</text>
            </view>
          </view>
        </view>
        <view class="comp-right">
          <view class="comp-right-spacer"></view>
          <view class="distance-tag" v-if="item.distance">{{ (parseInt(item.distance) / 1000).toFixed(2) }}km</view>
          <view class="comp-right-bottom">
            <!-- 只有推荐客户才显示不感兴趣按钮，避免影响正常搜索结果 -->
            <view v-if="isRecommend" class="not-interested-btn" @tap.stop="openExcludeDialog(item, index)">不感兴趣</view>
          </view>
        </view>
      </view>
    </view>
    <empty-state v-else-if="hasSearched" title="暂无数据" hint="未找到匹配的工程师" />
    <empty-state v-else-if="recommendList.length === 0" title="请输入产品名称" hint="输入产品名称并点击搜索" />

    <loading-overlay :visible="showLoading" text="正在加载..." />

    <!-- 不感兴趣二次确认弹窗（自定义样式替代 uni.showModal） -->
    <view v-if="showExcludeDialog" class="exclude-dialog-mask" @tap="closeExcludeDialog">
      <view class="exclude-dialog-card" @tap.stop>
        <view class="exclude-dialog-title">不感兴趣</view>
        <view class="exclude-dialog-content">确认不再推荐这位工程师？</view>
        <view class="exclude-dialog-actions">
          <view class="exclude-dialog-btn cancel" @tap="closeExcludeDialog">取消</view>
          <view class="exclude-dialog-btn confirm" @tap="confirmExclude">确定</view>
        </view>
      </view>
    </view>

    <!-- 非会员点击搜索时弹出的会员引导蒙层 -->
    <member-mask
      v-if="showMemberMask"
      :visible="true"
      title="会员专属"
      sub-title="开通会员后可使用搜产品功能"
      btn-text="去开通"
      @close="showMemberMask = false"
    />

    <!-- 时间筛选抽屉（右侧滑入） -->
    <time-filter-drawer
      :visible="showTimeFilter"
      @close="showTimeFilter = false"
      @confirm="onTimeFilterConfirm"
    />
  </view>
</template>

<script>
import { searchUsersByProduct, getUserConfig, getUsersByCompanyName, excludeUser } from '@/static/api/index.js'
import { showName, getProductImageUrlChat } from '@/common/utils/index.js'
import { mixinCheckIsMember } from '@/common/utils/member.js'
import EmptyState from '@/common/components/empty-state.vue'
import LoadingOverlay from '@/common/components/loading-overlay.vue'
import MemberMask from '@/common/components/member-mask.vue'
import TimeFilterDrawer from '@/common/components/time-filter-drawer.vue'

export default {
  components: { EmptyState, LoadingOverlay, MemberMask, TimeFilterDrawer },
  data() {
    return {
      keyword: '', // 产品搜索关键词
      region: [], // 省市区选择结果 [省, 市, 区]
      list: [], // 搜索结果列表
      hasSearched: false, // 是否已发起搜索
      showLoading: false, // 加载状态
      showMemberMask: false, // 非会员搜索时弹出会员引导
      showTimeFilter: false, // 是否显示时间筛选抽屉
      timeRange: null, // 当前选中的时间范围 { startTime, endTime }
      recommendKeyword: '', // 推荐关键词
      recommendList: [], // 推荐搜索结果列表
      recommendLoading: false, // 推荐列表局部加载状态
      showExcludeDialog: false, // 是否显示不感兴趣二次确认弹窗
      pendingExclude: null // 当前待确认不感兴趣的用户数据 { item, index }
    }
  },
  computed: {
    // 是否已选择省市区
    hasRegion() {
      return this.region && this.region.length === 3 && this.region[0]
    },
    // 当前要展示的列表：手动搜索结果优先，否则用推荐结果
    displayList() {
      if (this.list.length > 0) return this.list
      if (!this.hasSearched && this.recommendList.length > 0) return this.recommendList
      return []
    },
    // 当前展示的是否为推荐结果
    isRecommend() {
      return this.list.length === 0 && this.recommendList.length > 0 && !this.hasSearched
    },
    recommendTitle() {
      if (this.recommendKeyword) {
        return ``
      }
      return ''
    }
  },
  mounted() {
    this.loadRegionFromCache()
    this.loadRecommend()
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
        // 搜索框为空时，重置手动搜索状态并重新加载推荐数据
        this.list = []
        this.hasSearched = false
        this.loadRecommend()
        return
      }
      this.showLoading = true
      this.hasSearched = true
      try {
        const params = {
          productName: keyword,
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
        // 有时间范围则传入 startTime / endTime
        if (this.timeRange) {
          params.startTime = this.timeRange.startTime
          params.endTime = this.timeRange.endTime
        }
        const res = await searchUsersByProduct(params)
        this.list = res?.data?.list || []
      } catch (e) {
        console.log('搜产品失败', e)
        this.list = []
      } finally {
        this.showLoading = false
      }
    },

    // ----------- 跳转工程师详情
    goStaffDetail(item) {
      const staffInfo = encodeURIComponent(JSON.stringify({
        ...item,
        userLogo: item.userLogo,
        nickName: this.showName(item)
      }))
      // 把当前搜索关键词也带上
      const keyword = encodeURIComponent(this.keyword || '')
      uni.navigateTo({
        url: `/pages-sub/explore/staff-detail/index?staffInfo=${staffInfo}&prodName=${keyword}`
      })
    },

    // ----------- 点击不感兴趣：打开自定义确认弹窗
    openExcludeDialog(item, index) {
      // 接口返回字段可能是大写 UserId，兼容取值
      const userId = item.UserId || item.userId
      if (!userId) {
        uni.showToast({ title: '缺少用户标识', icon: 'none' })
        return
      }
      // 缓存待操作数据并打开弹窗
      this.pendingExclude = { item, index, userId }
      this.showExcludeDialog = true
    },

    // ----------- 关闭不感兴趣弹窗
    closeExcludeDialog() {
      this.showExcludeDialog = false
      this.pendingExclude = null
    },

    // ----------- 确认不感兴趣：调用 excludeUser 接口并从推荐列表移除
    async confirmExclude() {
      if (!this.pendingExclude) return
      const { index, userId } = this.pendingExclude
      try {
        uni.showLoading({ title: '处理中...', mask: true })
        // 调用不感兴趣接口，参数为 excludeUserId
        await excludeUser({ excludeUserId: userId })
        uni.hideLoading()
        // 接口成功后从推荐列表中移除该卡片
        this.recommendList.splice(index, 1)
        this.showExcludeDialog = false
        this.pendingExclude = null
        uni.showToast({ title: '操作成功', icon: 'success' })
      } catch (e) {
        uni.hideLoading()
        console.log('不感兴趣操作失败', e)
        uni.showToast({ title: '操作失败，请重试', icon: 'none' })
      }
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

    // ----------- 从缓存读取地区（areaObj.searchProduct）
    loadRegionFromCache() {
      try {
        const areaObj = uni.getStorageSync('areaObj') || {}
        if (areaObj.searchProduct && Array.isArray(areaObj.searchProduct)) {
          this.region = areaObj.searchProduct
        }
      } catch (e) {
        console.log('读取地区缓存失败', e)
      }
    },

    // ----------- 保存地区到缓存（areaObj.searchProduct）
    saveRegionToCache() {
      try {
        const areaObj = uni.getStorageSync('areaObj') || {}
        areaObj.searchProduct = this.region
        uni.setStorageSync('areaObj', areaObj)
      } catch (e) {
        console.log('保存地区缓存失败', e)
      }
    },

    // ----------- 时间筛选确定回调
    onTimeFilterConfirm(range) {
      this.timeRange = range
    },

    // ----------- 下拉刷新：已搜索则重搜当前关键词，否则重载推荐
    async refresh() {
      const keyword = (this.keyword || '').trim()
      if (keyword) {
        await this.onSearch()
      } else {
        await this.loadRecommend()
      }
    },

    // ----------- 加载推荐关键词并自动搜索（轮询所有关键词）
    async loadRecommend() {
      this.recommendLoading = true
      try {
        const res = await getUserConfig()
        const config = res?.data || {}
        const keywords = config.productKeywords || []
        if (keywords.length > 0) {
          // 从缓存读取上次使用的关键词
          const lastKeyword = uni.getStorageSync('productKeywords') || ''
          // 找下一个关键词（如果上次的不在列表里了）
          const lastIndex = keywords.indexOf(lastKeyword)
          const nextIndex = lastIndex === -1 ? 0 : (lastIndex + 1) % keywords.length
          this.recommendKeyword = keywords[nextIndex]
          uni.setStorageSync('productKeywords', this.recommendKeyword)
          
          const params = { productName: this.recommendKeyword, distance: 0, sortBy: "random", pageSize: 50 }
          const lat = uni.getStorageSync('myLatitude')
          const lng = uni.getStorageSync('myLongitude')
          if (lat && lng) {
            params.lat = lat
            params.lng = lng
          }
          const searchRes = await searchUsersByProduct(params)
          this.recommendList = searchRes?.data?.list || []
        } else {
          // 没有配置关键词时，调用探客页工程师接口获取默认推荐
          this.recommendKeyword = ''
          const lat = uni.getStorageSync('myLatitude')
          const lng = uni.getStorageSync('myLongitude')
          const distance = uni.getStorageSync('sharedDistance') || 2
          const searchRes = await getUsersByCompanyName({
            lat,
            lng,
            distance: distance * 1000,
            sortBy: 'activity'
          })
          this.recommendList = searchRes?.data?.list || []
        }
      } catch (e) {
        console.log('加载推荐失败', e)
        this.recommendList = []
      } finally {
        this.recommendLoading = false
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

// ==================== 结果列表（与探客页保持一致）
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
  align-items: stretch;
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

      // 地点胶囊（位置与样式模仿探客的活跃胶囊）
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

// 右侧距离标签 + 不感兴趣
.comp-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  min-height: 100%;

  .comp-right-spacer {
    flex: 1;
  }

  .distance-tag {
    background: #fff4d6;
    color: #c98a00;
    font-size: 22rpx;
    padding: 6rpx 14rpx;
    border-radius: 20rpx;
    line-height: 1;
  }

  .comp-right-bottom {
    flex: 1;
    display: flex;
    align-items: flex-end;
  }

  .not-interested-btn {
    font-size: 20rpx;
    color: #999;
    padding: 6rpx 12rpx;
    border: 1rpx solid #e0e0e0;
    border-radius: 40rpx;
    background: #f9f9f9;
    line-height: 1;

    &:active {
      background: #f0f0f0;
    }
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
      font-size: 32rpx;
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

// ==================== 推荐标题
.recommend-title {
  margin: 36rpx 24rpx 26rpx;
  font-size: 26rpx;
  color: #1a1a1a;
}

// ==================== 局部加载骨架屏
.recommend-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  gap: 20rpx;

  .loading-spinner {
    width: 80rpx;
    height: 80rpx;
    position: relative;

    .spinner-ring {
      position: absolute;
      border-radius: 50%;
      border: 5rpx solid transparent;
    }

    .ring-outer {
      width: 100%;
      height: 100%;
      border-top-color: #2f73ff;
      border-right-color: rgba(47, 115, 255, 0.2);
      animation: recommendSpin 1s linear infinite;
    }

    .ring-inner {
      width: 60rpx;
      height: 60rpx;
      top: 10rpx;
      left: 10rpx;
      border-bottom-color: #4a9eff;
      border-left-color: rgba(74, 158, 255, 0.2);
      animation: recommendSpin 0.7s linear infinite reverse;
    }
  }

  .loading-text {
    margin-top: 20rpx;
    font-size: 30rpx;
    color: #666;
  }
}

@keyframes recommendSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// ==================== 右下角搜索条件浮动按钮
.fab-filter {
  position: fixed;
  right: 32rpx;
  bottom: 140rpx;
  z-index: 50;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: white;
  box-shadow: 0 8rpx 24rpx rgba(141, 141, 142, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;

  // &:active {
  //   transform: scale(0.94);
  //   box-shadow: 0 4rpx 12rpx rgba(47, 115, 255, 0.25);
  // }

  .fab-icon {
    font-size: 44rpx;
    color: #fff;
    line-height: 1;
  }

  .fab-dot {
    position: absolute;
    top: 8rpx;
    right: 8rpx;
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background: #ff4d4f;
    border: 2rpx solid #fff;
  }
}

// ==================== 不感兴趣二次确认弹窗
.exclude-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;

  .exclude-dialog-card {
    width: 500rpx;
    background: #fff;
    border-radius: 28rpx;
    padding: 48rpx 40rpx 40rpx;
    text-align: center;
    box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
    animation: dialogScale 0.2s ease-out;

    .exclude-dialog-title {
      font-size: 34rpx;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 24rpx;
    }

    .exclude-dialog-content {
      font-size: 30rpx;
      color: #666;
      line-height: 1.5;
      margin-bottom: 48rpx;
    }

    .exclude-dialog-actions {
      display: flex;
      align-items: center;
      gap: 24rpx;

      .exclude-dialog-btn {
        flex: 1;
        height: 84rpx;
        line-height: 84rpx;
        border-radius: 16rpx;
        font-size: 30rpx;
        font-weight: 500;
        text-align: center;

        &.cancel {
          background: #f2f3f5;
          color: #666;
        }

        &.confirm {
          background: linear-gradient(135deg, #ff5a5a 0%, #ff4d4f 100%);
          color: #fff;
          box-shadow: 0 8rpx 24rpx rgba(255, 77, 79, 0.25);
        }

        &:active {
          opacity: 0.85;
        }
      }
    }
  }
}

@keyframes dialogScale {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
