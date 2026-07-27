<!-- 地图条件筛选组件 -->
<template>
  <view>
    <!-- 筛选抽屉：从右侧滑入，遮罩可点击关闭 -->
    <view v-if="visible" class="filter-mask" :class="{ 'mask-hide': closing }" @tap="close">
    <view class="filter-drawer" :class="{ 'drawer-hide': closing }" @tap.stop>
      <!-- 顶部标题栏 -->
      <view class="drawer-header">
        <text class="header-title">筛选</text>
        <view class="header-close" @tap="close">×</view>
      </view>

      <!-- 内容滚动区 -->
      <scroll-view scroll-y class="drawer-body">
        <!-- 产品关键词搜索 -->
        <view class="section">
          <view class="section-title">产品关键词搜索</view>
          <view class="tag-wrap">
            <view
              v-for="(kw, idx) in productKeywords"
              :key="idx"
              class="filter-tag"
              :class="{ 'tag-active': selectedKeywords.includes(kw) }"
              @tap="toggleTag('kw', kw)"
            >
              {{ kw }}
            </view>
            <view v-if="!productKeywords.length" class="empty-tip" @tap="goSettings">暂无关键词，请去<text style="color: orange;"> 设置 </text>中添加产品关键词</view>
          </view>
        </view>
        
        <!-- 主机企业分类 -->
        <view class="section">
          <view class="section-title">主机企业分类</view>
          <view class="tag-wrap">
            <view
              v-for="item in hostCategories"
              :key="item.cname"
              class="filter-tag"
              :class="{ 'tag-active': selectedHostCName.includes(item.cname) }"
              @tap="toggleTag('host', item.cname)"
            >
              {{ item.cname }}
            </view>
            <view v-if="!hostCategories.length" class="empty-tip" @tap="goSettings">暂无分类，请去<text style="color: orange;"> 设置 </text>中选择主机企业分类</view>
          </view>
        </view>

        <!-- 零部件企业分类 -->
        <view class="section">
          <view class="section-title">零部件企业分类</view>
          <view class="tag-wrap">
            <view
              v-for="item in partsCategories"
              :key="item.cname"
              class="filter-tag"
              :class="{ 'tag-active': selectedPartsCName.includes(item.cname) }"
              @tap="toggleTag('parts', item.cname)"
            >
              {{ item.cname }}
            </view>
            <view v-if="!partsCategories.length" class="empty-tip" @tap="goSettings">暂无分类，请去<text style="color: orange;"> 设置 </text>中选择零部件企业分类</view>
          </view>
        </view>

        <view class="section-divider"></view>

        <!-- 企业类型开关组 -->
        <view class="switch-sub-title">选择查询时需要展示的企业类型</view>
        <view class="switch-list">
          <!-- 主开关：只显示企业 -->
          <view class="switch-row">
            <text class="switch-label">只显示企业</text>
            <switch :checked="showOnlyEnterprise" color="#2962ff" style="transform:scale(0.85)" @change="onShowOnlyEnterpriseChange" />
          </view>
          <!-- 子开关：只显示主机企业 -->
          <view class="switch-row switch-row-child" :class="{ 'row-disabled': !showOnlyEnterprise }">
            <text class="switch-label sub-label" :class="{ 'text-disabled': !showOnlyEnterprise }">只显示主机企业</text>
            <switch :checked="showOnlyHostEnterprise" color="#2962ff" style="transform:scale(0.85)" :disabled="!showOnlyEnterprise" @change="onShowOnlyHostEnterpriseChange" />
          </view>
          <!-- 子开关：只显示零部件企业 -->
          <view class="switch-row switch-row-child" :class="{ 'row-disabled': !showOnlyEnterprise }">
            <text class="switch-label sub-label" :class="{ 'text-disabled': !showOnlyEnterprise }">只显示零部件企业</text>
            <switch :checked="showOnlyPartsEnterprise" color="#2962ff" style="transform:scale(0.85)" :disabled="!showOnlyEnterprise" @change="onShowOnlyPartsEnterpriseChange" />
          </view>
          <!-- 主开关：只显示院校 -->
          <view class="switch-row">
            <text class="switch-label">只显示院校</text>
            <switch :checked="showOnlySchool" color="#2962ff" style="transform:scale(0.85)" @change="onShowOnlySchoolChange" />
          </view>
        </view>
      </scroll-view>

      <!-- 底部操作按钮 -->
      <view class="drawer-footer">
        <view class="footer-btn btn-reset" @tap="onReset">清空搜索条件</view>
        <view class="footer-btn btn-confirm" @tap="onConfirm">确定</view>
      </view>
    </view>
  </view>
  </view>
</template>

<script>
import { getUserConfig } from '@/static/api/index.js'
import { mixinCheckIsMember } from '@/common/utils/member.js'

// 本地缓存 key：筛选选中状态
const STORAGE_KEY_STATE = 'mapFilterState'
// 本地缓存 key：设置页配置快照（用于检测是否变化）
const STORAGE_KEY_CONFIG = 'mapFilterConfigSnapshot'

export default {
  name: 'MapFilter',
  props: {
    visible: { type: Boolean, default: false }
  },
  data() {
    return {
      closing: false,                  // 关闭动画标记
      hostCategories: [],              // 主机企业分类列表 [{cid,cname}]
      partsCategories: [],             // 零部件企业分类列表 [{cid,cname}]
      productKeywords: [],             // 产品关键词列表
      selectedHostCName: [],            // 已选主机企业分类
      selectedPartsCName: [],           // 已选零部件企业分类
      selectedKeywords: [],            // 已选关键词
      showOnlyEnterprise: true,        // 只显示企业
      showOnlyHostEnterprise: true,    // 只显示主机企业
      showOnlyPartsEnterprise: false,  // 只显示零部件企业
      showOnlySchool: false            // 只显示院校
    }
  },
  watch: {
    // ----------- 监听筛选抽屉显隐：每次打开都重新拉取最新配置，保证与设置页同步
    visible(val) {
      if (val) {
        this.loadConfig()
      }
    }
  },
  methods: {
    // ----------- 拉取个人配置信息
    async loadConfig() {
      try {
        const res = await getUserConfig()
        const config = (res && res.data) || {}
        this.hostCategories = config.hostEnterpriseCategories || []
        this.partsCategories = config.partsEnterpriseCategories || []
        this.productKeywords = config.productKeywords || []

        // 生成本次配置快照（只关心标签维度的字段）
        const snapshot = JSON.stringify({
          kw: this.productKeywords,
          host: this.hostCategories.map(i => i.cname),
          parts: this.partsCategories.map(i => i.cname)
        })
        const lastSnapshot = uni.getStorageSync(STORAGE_KEY_CONFIG) || ''

        if (snapshot !== lastSnapshot) {
          // 设置页配置发生变化，清空本地选中状态，并写入新快照
          uni.removeStorageSync(STORAGE_KEY_STATE)
          uni.setStorageSync(STORAGE_KEY_CONFIG, snapshot)
          this.resetState()
        } else {
          // 配置未变，按本地缓存反显
          this.restoreState()
        }
      } catch (e) {
        console.error('加载筛选配置失败', e)
        // uni.showToast({ title: '加载筛选配置失败', icon: 'none' })
      }
    },

    // ----------- 重置选中状态（不操作本地缓存）
    resetState() {
      this.selectedHostCName = []
      this.selectedPartsCName = []
      this.selectedKeywords = []
      this.showOnlyEnterprise = false
      this.showOnlyHostEnterprise = false
      this.showOnlyPartsEnterprise = false
      this.showOnlySchool = false
    },

    // ----------- 从本地缓存反显选中状态
    restoreState() {
      const saved = uni.getStorageSync(STORAGE_KEY_STATE)
      if (!saved) {
        this.resetState()
        return
      }
      // 过滤掉已经不存在于最新配置中的标签（兜底逻辑）
      const hostNames = this.hostCategories.map(i => i.cname)
      const partsNames = this.partsCategories.map(i => i.cname)
      this.selectedHostCName = (saved.selectedHostCName || []).filter(n => hostNames.includes(n))
      this.selectedPartsCName = (saved.selectedPartsCName || []).filter(n => partsNames.includes(n))
      this.selectedKeywords = (saved.selectedKeywords || []).filter(n => this.productKeywords.includes(n))
      this.showOnlyEnterprise = !!saved.showOnlyEnterprise
      this.showOnlyHostEnterprise = !!saved.showOnlyHostEnterprise
      this.showOnlyPartsEnterprise = !!saved.showOnlyPartsEnterprise
      this.showOnlySchool = !!saved.showOnlySchool
    },

    // ----------- 将当前选中状态写入本地缓存
    persistState() {
      uni.setStorageSync(STORAGE_KEY_STATE, {
        selectedHostCName: this.selectedHostCName,
        selectedPartsCName: this.selectedPartsCName,
        selectedKeywords: this.selectedKeywords,
        showOnlyEnterprise: this.showOnlyEnterprise,
        showOnlyHostEnterprise: this.showOnlyHostEnterprise,
        showOnlyPartsEnterprise: this.showOnlyPartsEnterprise,
        showOnlySchool: this.showOnlySchool
      })
    },

    // ----------- 切换标签选中状态（多选）
    toggleTag(type, key) {
      const map = { host: 'selectedHostCName', parts: 'selectedPartsCName', kw: 'selectedKeywords' }
      const field = map[type]
      const arr = this[field]
      const idx = arr.indexOf(key)
      if (idx > -1) arr.splice(idx, 1)
      else arr.push(key)
    },

    // ----------- 只显示企业开关变化
    onShowOnlyEnterpriseChange(e) {
      const isChecked = e.detail.value
      if (isChecked) {
        // 打开企业总开关，关闭院校；默认开启主机企业
        this.showOnlyEnterprise = true
        this.showOnlySchool = false
        this.showOnlyHostEnterprise = true
      } else {
        // 关闭企业总开关，强制打开院校（保证至少选一个）
        this.showOnlyEnterprise = false
        this.showOnlySchool = true
        this.showOnlyHostEnterprise = false
        this.showOnlyPartsEnterprise = false
      }
    },

    // ----------- 只显示院校开关变化
    onShowOnlySchoolChange(e) {
      const isChecked = e.detail.value
      if (isChecked) {
        this.showOnlySchool = true
        this.showOnlyEnterprise = false
        this.showOnlyHostEnterprise = false
        this.showOnlyPartsEnterprise = false
      } else {
        // 关闭院校，强制打开企业
        this.showOnlySchool = false
        this.showOnlyEnterprise = true
      }
    },

    // ----------- 只显示主机企业开关变化（与零部件互斥）
    onShowOnlyHostEnterpriseChange(e) {
      if (e.detail.value) {
        this.showOnlyHostEnterprise = true
        this.showOnlyPartsEnterprise = false
      } else {
        this.showOnlyHostEnterprise = false
      }
    },

    // ----------- 只显示零部件企业开关变化（与主机互斥）
    onShowOnlyPartsEnterpriseChange(e) {
      if (e.detail.value) {
        this.showOnlyPartsEnterprise = true
        this.showOnlyHostEnterprise = false
      } else {
        this.showOnlyPartsEnterprise = false
      }
    },

    // ----------- 重置：标签和开关全部清空，并同步清空本地缓存
    onReset() {
      this.resetState()
      uni.removeStorageSync(STORAGE_KEY_STATE)
    },

    // ----------- 确定：将筛选条件向外抛出
    onConfirm() {
      // 非会员拦截：通知父页面弹出会员引导，筛选抽屉保持打开
      if (!mixinCheckIsMember()) {
        this.$emit('need-member')
        return
      }
      // 判断是否完全未选（标签为空且开关全关），若是则向外抛 null
      const noneSelected =
        !this.selectedHostCName.length &&
        !this.selectedPartsCName.length &&
        !this.selectedKeywords.length &&
        !this.showOnlyEnterprise &&
        !this.showOnlyHostEnterprise &&
        !this.showOnlyPartsEnterprise &&
        !this.showOnlySchool
      if (noneSelected) {
        // 未选任何项 → 清空本地缓存，向外抛 null
        uni.removeStorageSync(STORAGE_KEY_STATE)
        this.$emit('confirm', null)
      } else {
        const params = {
          hostEnterpriseCategories: [...this.selectedHostCName],
          partsEnterpriseCategories: [...this.selectedPartsCName],
          productKeywords: [...this.selectedKeywords],
        }
        // 计算 showOnlySchools：0=都不搜索, 1=只看学校, 2=只看企业
        if (!this.showOnlyEnterprise && !this.showOnlySchool) {
          params.showOnlySchools = 0
        } else if (this.showOnlySchool) {
          params.showOnlySchools = 1
        } else {
          params.showOnlySchools = 2
        }
        // 如果勾选了只显示企业，附带子开关状态
        if (this.showOnlyEnterprise) {
          params.showOnlyHostEnterprise = this.showOnlyHostEnterprise ? 1 : 0
          params.showOnlyPartsEnterprise = this.showOnlyPartsEnterprise ? 1 : 0
        }
        // 写入本地缓存供下次反显
        this.persistState()
        this.$emit('confirm', params)
      }
      this.close()
    },

    // ----------- 关闭抽屉
    close() {
      this.closing = true
      setTimeout(() => {
        this.closing = false
        this.$emit('close')
      }, 240)
    },

    // ----------- 跳转到设置页
    goSettings() {
      this.close()
      uni.navigateTo({ url: '/pages-sub/mine/settings/index' })
    }
  }
}
</script>

<style scoped lang="scss">
// ==================== 遮罩
.filter-mask {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 999;
  animation: maskShow 0.25s ease both;
}
.mask-hide {
  animation: maskHide 0.22s ease both;
}

// ==================== 抽屉主体（右侧滑入）
.filter-drawer {
  position: absolute;
  top: 0; right: 0; bottom: 0;
  width: 78%;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: -8rpx 0 24rpx rgba(0, 0, 0, 0.08);
  animation: drawerShow 0.26s ease both;
}
.drawer-hide {
  animation: drawerHide 0.24s ease both;
}

// 顶部标题
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 28rpx 20rpx;
  padding-top: calc(32rpx + env(safe-area-inset-top));

  .header-title {
    font-size: 34rpx;
    font-weight: 700;
    color: #1a1a1a;
  }

  .header-close {
    width: 56rpx;
    height: 56rpx;
    line-height: 50rpx;
    text-align: center;
    font-size: 40rpx;
    color: #666;

    &:active { opacity: 0.7; }
  }
}

// 内容区
.drawer-body {
  flex: 1;
  height: 0;
  padding: 0 28rpx;
  box-sizing: border-box;
}

.section {
  padding: 26rpx 0 8rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 20rpx;
  }
}

.tag-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
}

.filter-tag {
  padding: 0 24rpx;
  height: 56rpx;
  line-height: 56rpx;
  border-radius: 8rpx;
  background: #f4f6fa;
  border: 2rpx solid transparent;
  color: #5a6178;
  font-size: 24rpx;

  &:active { opacity: 0.82; }

  &.tag-active {
    background: #eaf1ff;
    color: #2962ff;
    border-color: #2962ff;
    font-weight: 500;
  }
}

.empty-tip {
  font-size: 26rpx;
  color: #bbb;
  padding: 4rpx 0;

  &:active { opacity: 0.7; }
}

.section-divider {
  height: 1rpx;
  background: #f0f2f5;
  margin: 24rpx 0 8rpx;
}

.switch-sub-title {
  font-size: 28rpx;
  color: #000;
  font-weight: bold;
  padding: 12rpx 0 8rpx;
}

// 开关列表（结构与设置页保持一致）
.switch-list {
  display: flex;
  flex-direction: column;

  .switch-row {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1rpx solid #f0f2f5;

    &:first-child { border-top: none; }

    .switch-label {
      font-size: 26rpx;
      color: #333;
    }

    &.switch-row-child {
      padding-left: 40rpx;
      background: #fafbfc;

      .sub-label {
        font-size: 26rpx;
        color: #666;
      }

      &.row-disabled .sub-label { color: #bbb; }
    }

    .text-disabled { color: #bbb; }
  }
}

// 底部按钮
.drawer-footer {
  display: flex;
  gap: 24rpx;
  padding: 40rpx 28rpx;
  border-top: 1rpx solid #f0f2f5;

  .footer-btn {
    flex: 1;
    height: 80rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    font-weight: 600;

    &:active { opacity: 0.85; }

    &.btn-reset {
      background: #ff6d61;
      color: #fff;
    }

    &.btn-confirm {
      flex: 1;
      background: #2962ff;
      color: #fff;
      box-shadow: 0 6rpx 18rpx rgba(41, 98, 255, 0.25);
    }
  }
}

@keyframes maskShow {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes maskHide {
  from { opacity: 1; }
  to   { opacity: 0; }
}
@keyframes drawerShow {
  from { transform: translate3d(100%, 0, 0); }
  to   { transform: translate3d(0, 0, 0); }
}
@keyframes drawerHide {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(100%, 0, 0); }
}
</style>
