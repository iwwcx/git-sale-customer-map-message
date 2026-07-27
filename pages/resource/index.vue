<!-- 搜资源 tab 主页：搜产品 / 搜企业 / 搜工程师 三个子 tab，tab-bar 通过插槽注入到子组件卡片中 -->
<!-- 主要是为了把搜索条件塞到tab栏下，好看才有以下的写法 -->
<template>
  <view class="resource-container">
    <!-- 会员提示横幅（非会员才展示） -->
    <member-banner v-if="showMemberBanner" @click="onMemberBannerClick" @close="showMemberBanner = false" />

    <!-- 搜产品（为了把搜索条件塞到tab栏下才有了这种写法） -->
    <search-product ref="searchProductRef" v-show="currentTab === 'product'">
      <template #header>
        <view class="tab-bar">
          <view class="tab-item" :class="{ active: currentTab === 'product' }" @tap="changeTab('product')">搜产品需求</view>
          <view class="tab-item" :class="{ active: currentTab === 'company' }" @tap="changeTab('company')">搜企业</view>
          <view class="tab-item" :class="{ active: currentTab === 'engineer' }" @tap="changeTab('engineer')">搜工程师</view>
          <view class="tab-item ai" :class="{ active: currentTab === 'ai' }" @tap="changeTab('ai')">AI助手</view>
        </view>
      </template>
    </search-product>

    <!-- 搜企业 -->
    <search-company ref="searchCompanyRef" v-show="currentTab === 'company'">
      <template #header>
        <view class="tab-bar">
          <view class="tab-item" :class="{ active: currentTab === 'product' }" @tap="changeTab('product')">搜产品需求</view>
          <view class="tab-item" :class="{ active: currentTab === 'company' }" @tap="changeTab('company')">搜企业</view>
          <view class="tab-item" :class="{ active: currentTab === 'engineer' }" @tap="changeTab('engineer')">搜工程师</view>
          <view class="tab-item ai" :class="{ active: currentTab === 'ai' }" @tap="changeTab('ai')">AI助手</view>
        </view>
      </template>
    </search-company>

    <!-- 搜工程师 -->
    <search-engineer ref="searchEngineerRef" v-show="currentTab === 'engineer'">
      <template #header>
        <view class="tab-bar">
          <view class="tab-item" :class="{ active: currentTab === 'product' }" @tap="changeTab('product')">搜产品需求</view>
          <view class="tab-item" :class="{ active: currentTab === 'company' }" @tap="changeTab('company')">搜企业</view>
          <view class="tab-item" :class="{ active: currentTab === 'engineer' }" @tap="changeTab('engineer')">搜工程师</view>
          <view class="tab-item ai" :class="{ active: currentTab === 'ai' }" @tap="changeTab('ai')">AI助手</view>
        </view>
      </template>
    </search-engineer>

    <!-- AI助手 -->
    <search-ai-assistant ref="searchAiAssistantRef" v-show="currentTab === 'ai'">
      <template #header>
        <view class="tab-bar">
          <view class="tab-item" :class="{ active: currentTab === 'product' }" @tap="changeTab('product')">搜产品需求</view>
          <view class="tab-item" :class="{ active: currentTab === 'company' }" @tap="changeTab('company')">搜企业</view>
          <view class="tab-item" :class="{ active: currentTab === 'engineer' }" @tap="changeTab('engineer')">搜工程师</view>
          <view class="tab-item ai" :class="{ active: currentTab === 'ai' }" @tap="changeTab('ai')">AI助手</view>
        </view>
      </template>
    </search-ai-assistant>
  </view>
</template>

<script>
import SearchProduct from './components/search-product.vue'
import SearchCompany from './components/search-company.vue'
import SearchEngineer from './components/search-engineer.vue'
import SearchAiAssistant from './components/search-ai-assistant.vue'
import MemberBanner from '@/common/components/member-banner.vue'
import { getMemberInfo } from '@/static/api/index.js'
import { mixinShowMemberBanner } from '@/common/utils/member.js'

export default {
  components: { SearchProduct, SearchCompany, SearchEngineer, SearchAiAssistant, MemberBanner },
  data() {
    return {
      currentTab: 'product', // 当前激活的子 tab：product / company / engineer / ai
      showMemberBanner: mixinShowMemberBanner() // 是否展示非会员/试用横幅
    }
  },
  onShow() {
    this.showMemberBanner = mixinShowMemberBanner()
  },
  onLoad() {
    this.checkMemberStatus()
  },
  // 开启下拉刷新
  onPullDownRefresh() {
    this.onRefresh()
  },
  methods: {
    // ----------- 查询会员状态，缓存到本地并更新横幅显示
    async checkMemberStatus() {
      try {
        const res = await getMemberInfo()
        uni.setStorageSync('memberInfo', res.data)
        this.showMemberBanner = mixinShowMemberBanner()
      } catch (e) {
        // 查询失败不阻断页面流程
      }
    },

    // ----------- 点击会员横幅（弹窗逻辑已在 member-banner 组件内处理）
    onMemberBannerClick() {},

    // ----------- 切换 Tab
    changeTab(tab) {
      this.currentTab = tab
    },

    // ----------- 下拉刷新：根据当前 tab 触发对应子组件的 refresh
    async onRefresh() {
      const refMap = {
        product: this.$refs.searchProductRef,
        company: this.$refs.searchCompanyRef,
        engineer: this.$refs.searchEngineerRef,
        ai: this.$refs.searchAiAssistantRef
      }
      const target = refMap[this.currentTab]
      try {
        if (target && typeof target.refresh === 'function') {
          await target.refresh()
        }
      } catch (e) {
        console.warn('下拉刷新失败', e)
      } finally {
        uni.stopPullDownRefresh()
      }
    }
  }
}
</script>

<style lang="scss">
/* 注：tab-bar 通过插槽传入子组件作用域，故样式不加 scoped，全局生效 */

// ==================== 搜资源页容器
.resource-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f4f6fa;
  padding-bottom: 40rpx;
  box-sizing: border-box;
}

// ==================== Tab 切换（与探客页保持一致），位于子组件 control-card 顶部
.tab-bar {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  flex-wrap: nowrap;
  white-space: nowrap;

  .tab-item {
    position: relative;
    height: 54rpx;
    line-height: 54rpx;
    margin-right: 40rpx;
    text-align: center;
    font-size: 28rpx;
    color: #8a8f99;
    transition: all 0.3s;
    flex-shrink: 0;
    white-space: nowrap;

    &:last-child {
      margin-right: 0;
    }

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

    // AI助手菜单：红色高亮
    &.ai {
      color: #ff4d4f;
      font-weight: 600;
      
      &.active {
        color: #ff4d4f;

        &::after {
          background: #ff4d4f;
        }
      }
    }
  }
}
</style>
