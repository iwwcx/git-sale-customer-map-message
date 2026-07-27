<!-- 搜资源-搜企业 tab：自包含输入框 + 下拉建议 + 结果列表 -->
<template>
  <view class="search-company">
    <!-- 顶部卡片：包含 tab-bar(slot) + 搜索输入框 -->
    <view class="control-card">
      <!-- tab-bar 由父组件通过 header 插槽注入 -->
      <slot name="header" />

      <view class="filter-bar search-company-filter">
        <view class="search-wrap">
          <text class="search-icon">🔍</text>
          <input
            class="search-input"
            type="text"
            v-model="searchCompanyInput"
            placeholder="请输入企业名称"
            placeholder-class="search-placeholder"
            confirm-type="search"
            @focus="onSearchInputFocus"
          />
          <text
            v-if="searchCompanyInput"
            class="clear-icon"
            @tap="clearSearchCompanyKeyword"
          >×</text>
        </view>

        <!-- 输入后下拉企业名称建议列表 -->
        <view class="suggest-dropdown" v-if="showSuggest && suggestList.length > 0">
          <view
            class="suggest-item"
            v-for="(item, idx) in suggestList"
            :key="idx"
            @tap="onSuggestSelect(item)"
          >
            <text class="suggest-icon">🏢</text>
            <text class="suggest-name">{{ getSuggestName(item) }}</text>
          </view>
        </view>
        <view class="suggest-dropdown empty" v-else-if="showSuggest && !suggestLoading && searchCompanyInput">
          <text class="suggest-empty">暂无匹配企业</text>
        </view>
      </view>
    </view>

    <!-- 搜索结果数量标题 -->
    <!-- <view v-if="hasSearched && companyList.length > 0" class="search-result-title">
      🔥本次搜索共计 <text style="color: red; font-weight: bold;">
        {{ companyList.length > 99 ? '99+' : companyList.length }}
      </text> 家企业符合要求
    </view> -->

    <!-- 企业结果列表 -->
    <view class="card-list" v-if="companyList.length > 0">
      <view class="comp-card" v-for="(item, index) in companyList" :key="index" @click="skipDetail(item)">
        <view class="comp-logo" :class="['logo-' + ((index % 3) + 1)]">
            <text class="logo-text">{{ getCompChar(item.compName, index) }}</text>
          </view>
        <view class="comp-info">
          <view class="comp-name">{{ item.compName }}</view>
          <view class="comp-meta">
            <text class="meta-icon">📍{{ item.CProvince }}{{ item.CCity }}{{ item.CDistrict }}</text>
          </view>
          <view class="comp-meta">
            <text class="engineer-count-icon">🧑‍🔧</text>
            <text class="meta-text">工程师 <text style="color: #ff4700;"> {{ item.userCount }} </text> 人</text>
          </view>
        </view>
      </view>
    </view>
    <empty-state v-else-if="hasSearched" title="暂无数据" hint="未找到匹配的企业" />
    <empty-state v-else title="请输入企业名称" hint="在上方输入企业名称并从下拉中选择" />

    <loading-overlay :visible="showLoading" text="正在加载..." />

    <!-- 非会员点击搜索时弹出的会员引导蒙层 -->
    <member-mask
      v-if="showMemberMask"
      :visible="true"
      title="会员专属"
      sub-title="开通会员后可使用搜公司功能"
      btn-text="去开通"
      @close="showMemberMask = false"
    />
  </view>
</template>

<script>
import { searchNearbyUsersByCompany, searchCompanyByName } from '@/static/api/index.js'
import { mixinCheckIsMember } from '@/common/utils/member.js'
import LoadingOverlay from '@/common/components/loading-overlay.vue'
import EmptyState from '@/common/components/empty-state.vue'
import MemberMask from '@/common/components/member-mask.vue'

export default {
  components: { LoadingOverlay, EmptyState, MemberMask },
  data() {
    return {
      searchCompanyInput: '', // 搜索输入框内容（驱动下拉建议）
      searchCompanyKeyword: '', // 真正用于搜索的关键词（点击下拉项后赋值）
      suggestList: [], // 下拉建议列表
      suggestLoading: false, // 下拉建议加载中
      showSuggest: false, // 是否显示下拉建议
      suggestTimer: null, // 下拉建议防抖计时器
      companyList: [], // 企业搜索结果
      hasSearched: false, // 是否已发起搜索（用于区分初始态/空结果态）
      showLoading: false, // 列表加载状态
      showMemberMask: false, // 非会员搜索时弹出会员引导
      latitude: uni.getStorageSync('myLatitude'), // 当前纬度
      longitude: uni.getStorageSync('myLongitude') // 当前经度
    }
  },
  watch: {
    // 监听输入，防抖 300ms 后拉取下拉建议
    searchCompanyInput(newVal) {
      if (this.suggestTimer) {
        clearTimeout(this.suggestTimer)
      }
      const keyword = (newVal || '').trim()
      if (!keyword) {
        this.suggestList = []
        this.showSuggest = false
        return
      }
      this.suggestTimer = setTimeout(() => {
        this.fetchSuggestList(keyword)
      }, 200)
    }
  },
  methods: {
    // ----------- 输入框获取焦点：若已有建议则重新展示（非会员也可输入和看到建议）
    onSearchInputFocus() {
      if (this.suggestList.length > 0) {
        this.showSuggest = true
      }
    },

    // ----------- 拉取企业名称下拉建议列表（非会员也能调用，但点击项时会被拦截）
    async fetchSuggestList(keyword) {
      this.suggestLoading = true
      this.showSuggest = true
      try {
        const res = await searchCompanyByName({ companyName: keyword })
        // 兼容接口返回的多种结构：数组 / { data: [] } / { Data: [] }
        const list = res?.data || res?.Data || res || []
        this.suggestList = Array.isArray(list) ? list : []
      } catch (e) {
        this.suggestList = []
      } finally {
        this.suggestLoading = false
      }
    },

    // ----------- 获取下拉项展示的企业名称（兼容字符串或对象）
    getSuggestName(item) {
      if (!item) return ''
      if (typeof item === 'string') return item
      return item.compName || item.companyName || item.CompanyName || item.name || ''
    },

    // ----------- 点击下拉建议项：触发企业搜索
    onSuggestSelect(item) {
      // 非会员拦截：弹出会员开通引导
      if (!mixinCheckIsMember()) {
        this.showMemberMask = true
        return
      }
      const name = this.getSuggestName(item)
      if (!name) return
      if (this.suggestTimer) {
        clearTimeout(this.suggestTimer)
        this.suggestTimer = null
      }
      this.searchCompanyKeyword = name
      this.showSuggest = false
      // 同步输入框显示
      if (this.searchCompanyInput !== name) {
        this.searchCompanyInput = name
        this.$nextTick(() => {
          if (this.suggestTimer) {
            clearTimeout(this.suggestTimer)
            this.suggestTimer = null
          }
          this.showSuggest = false
        })
      }
      this.loadList()
    },

    // ----------- 加载企业列表
    async loadList() {
      if (!this.searchCompanyKeyword) return
      this.showLoading = true
      this.hasSearched = true
      try {
        const res = await searchNearbyUsersByCompany({
          companyName: this.searchCompanyKeyword,
          distance: 0
        })
        this.companyList = res.data || []
      } finally {
        this.showLoading = false
      }
    },

    // ----------- 下拉刷新：仅当有关键词时重搜
    async refresh() {
      if (this.searchCompanyKeyword) {
        await this.loadList()
      }
    },

    // ----------- 清空搜索关键词与结果
    clearSearchCompanyKeyword() {
      this.searchCompanyInput = ''
      this.searchCompanyKeyword = ''
      this.suggestList = []
      this.showSuggest = false
      this.companyList = []
      this.hasSearched = false
    },
    
    // -------------- 获取公司名头像字符：第 3 个字（兼容短名）
    getCompChar(compName, index) {
      const name = (compName || '').trim()
      if (name.length >= 3) return name.charAt(2)
      if (name.length > 0) return name.charAt(0)
      return '企'
    },

    // ----------- 跳转企业详情
    skipDetail(item) {
      const companyInfo = encodeURIComponent(JSON.stringify(item)) // 路由传递的公司信息
      uni.navigateTo({
        url: `/pages-sub/explore/comp-detail/index?companyInfo=${companyInfo}&myLatitude=${this.latitude}&myLongitude=${this.longitude}&skipDistance='未知距离'`
      })
    }
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

// ==================== 搜索输入栏（位于卡片内、tab 之下）
.filter-bar {
  display: flex;
  align-items: center;
  gap: 14rpx;

  // 搜企业筛选栏：包裹相对定位，承载下拉建议
  &.search-company-filter {
    position: relative;
    flex-wrap: wrap;
  }

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

      &:active {
        color: #666;
      }
    }
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

// ==================== 卡片列表（与探客页保持一致）
.card-list {
  padding: 0 24rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

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

// ==================== tab-bar（通过 header 插槽注入，需要在卡片内有间距）
::v-deep .tab-bar {
  margin-bottom: 24rpx;
}

// ==================== 搜索结果数量标题
.search-result-title {
  margin: 30rpx 24rpx 16rpx;
  font-size: 26rpx;
  color: #1a1a1a;
}
</style>
