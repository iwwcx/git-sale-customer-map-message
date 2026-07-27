<template>
  <view class="settings-container">
    <!-- ========== 卡片1：设置我的产品关键词 ========== -->
    <view class="card">
      <view class="card-header">
        <view class="card-icon icon-tag">
          <text class="icon-emoji">🏷️</text>
        </view>
        <view class="card-title-wrap">
          <view class="card-title">设置我的产品关键词</view>
          <view class="card-desc">添加关键词，精准匹配您的产品</view>
        </view>
      </view>

      <!-- 关键词输入框 -->
      <view class="keyword-input-row">
        <view class="search-input">
          <text class="search-icon">🔍</text>
          <input class="input-field" v-model="keywordInput" placeholder="请添加产品关键词" placeholder-class="input-ph" @confirm="addKeyword" />
        </view>
        <view class="confirm-btn" @tap="addKeyword">确定</view>
      </view>

      <!-- 已添加关键词列表 -->
      <view class="added-label">已添加关键词 ({{ productKeywordsList.length }}/10)</view>
      <view class="keyword-tags">
        <view class="keyword-tag" v-for="(keyword, index) in productKeywordsList" :key="index">
          <text class="kw-text">{{ keyword }}</text>
          <text class="kw-close" @tap="removeKeyword(index)">×</text>
        </view>
      </view>
    </view>

    <!-- ========== 卡片2：设置查询条件 ========== -->
    <view class="card">
      <view class="card-header">
        <view class="card-icon icon-filter">
          <text class="icon-emoji">📋</text>
        </view>
        <view class="card-title-wrap">
          <view class="card-title">设置查询条件</view>
          <view class="card-desc">选择查询时需要展示的企业类型</view>
        </view>
      </view>

      <!-- 开关项列表 -->
      <view class="switch-list">
        <!-- 主开关：只显示企业 -->
        <view class="switch-row">
          <text class="switch-label">只显示企业</text>
          <switch :key="'ent' + showOnlyEnterprise" :checked="showOnlyEnterprise" color="#2962ff" style="transform:scale(0.85)" @change="onShowOnlyEnterpriseChange" />
        </view>

        <!-- 企业子开关（缩进显示） -->
        <view class="switch-row switch-row-child" :class="{ 'row-disabled': !showOnlyEnterprise }">
          <text class="switch-label sub-label" :class="{ 'text-disabled': !showOnlyEnterprise }">只显示主机企业</text>
          <switch :key="'host' + showOnlyHostEnterprise" :checked="showOnlyHostEnterprise" color="#2962ff" style="transform:scale(0.85)" :disabled="!showOnlyEnterprise" @change="onShowOnlyHostEnterpriseChange" />
        </view>

        <view class="switch-row switch-row-child" :class="{ 'row-disabled': !showOnlyEnterprise }">
          <text class="switch-label sub-label" :class="{ 'text-disabled': !showOnlyEnterprise }">只显示零部件企业</text>
          <switch :key="'parts' + showOnlyPartsEnterprise" :checked="showOnlyPartsEnterprise" color="#2962ff" style="transform:scale(0.85)" :disabled="!showOnlyEnterprise" @change="onShowOnlyPartsEnterpriseChange" />
        </view>

        <!-- 主开关：只显示院校 -->
        <view class="switch-row">
          <text class="switch-label">只显示院校</text>
          <switch :key="'school' + showOnlySchool" :checked="showOnlySchool" color="#2962ff" style="transform:scale(0.85)" @change="onShowOnlySchoolChange" />
        </view>
      </view>
    </view>

    <!-- ========== 卡片3：分类显示设置（两行） ========== -->
    <view class="card classify-card">
      <view class="classify-row" @tap="openClassifyPopup('host')">
        <view class="card-icon icon-host">
          <text class="icon-emoji">🏭</text>
        </view>
        <view class="classify-content">
          <view class="classify-title">设置分类显示主机企业</view>
          <view class="classify-desc">选择后，将在对应分类中展示主机企业</view>
        </view>
        <view class="classify-right">
          <text class="classify-value">{{ hostClassNames.join('、') || '请选择' }}</text>
          <text class="classify-arrow">›</text>
        </view>
      </view>

      <view class="classify-divider"></view>

      <view class="classify-row" @tap="openClassifyPopup('parts')">
        <view class="card-icon icon-part">
          <text class="icon-emoji">⚙️</text>
        </view>
        <view class="classify-content">
          <view class="classify-title">设置分类显示零部件企业</view>
          <view class="classify-desc">选择后，将在对应分类中展示零部件企业</view>
        </view>
        <view class="classify-right">
          <text class="classify-value">{{ partsClassNames.join('、') || '请选择' }}</text>
          <text class="classify-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- ========== 卡片4：设置我的名片 ========== -->
    <view class="card">
      <view class="card-header">
        <view class="card-icon icon-card">
          <text class="icon-emoji">✍</text>
        </view>
        <view class="card-title-wrap">
          <view class="card-title">我的名片</view>
          <view class="card-desc">完善信息，让更多客户快速联系到您</view>
        </view>
      </view>

      <!-- 名片表单 -->
      <view class="form-list">
        <view class="form-row">
          <text class="form-label">姓名</text>
          <view class="form-divider-v"></view>
          <view class="form-value">
            <image class="eng-avatar-img" :src="userInfo.UserSex == 2 ? 'https://img2cdn.global-dsc.cn/dgzz_img/6842d00b7f7db24082ed4f59f2bba02a.png' : 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png'" mode="aspectFill"></image>
            {{ userInfo.UserName || '未设置' }}
          </view>
        </view>
        <view class="form-row">
          <text class="form-label">电话</text>
          <view class="form-divider-v"></view>
          <text class="form-value">{{ userInfo.Phone || '未设置' }}</text>
        </view>
        <view class="form-row">
          <text class="form-label">邮箱</text>
          <view class="form-divider-v"></view>
          <text class="form-value">{{ userInfo.EMail || '未设置' }}</text>
        </view>
        <view class="form-row">
          <text class="form-label">公司名称</text>
          <view class="form-divider-v"></view>
          <view class="form-value">
            <view class="company-chip">
              <view class="company-chip-icon">企</view>
              <text class="company-chip-name">{{ userInfo.CompName }}</text>
            </view>
          </view>
        </view>
        <view class="form-row">
          <text class="form-label">职务</text>
          <view class="form-divider-v"></view>
          <text class="form-value">{{ userInfo.OrgDuty || '未设置' }}</text>
        </view>
      </view>
    </view>

    <!-- ========== 底部保存按钮 ========== -->
    <view class="save-btn" @tap="saveConfig">保存设置</view>

    <view v-if="classifyPopupVisible" class="classify-popup-mask" :class="{ 'popup-mask-hide': classifyPopupClosing }" @tap="closeClassifyPopup">
      <view class="classify-popup" :class="{ 'popup-card-hide': classifyPopupClosing }" @tap.stop>
        <view class="popup-header">
          <view>
            <view class="popup-title">{{ classifyPopupTitle }}</view>
            <view class="popup-desc">请选择需要展示的产品分类</view>
          </view>
          <view class="popup-close" @tap="closeClassifyPopup">×</view>
        </view>
        <scroll-view scroll-y class="classify-popup-list">
          <view v-if="classifyLoading" class="popup-status">分类加载中...</view>
          <view v-else-if="!classifyPopupList.length" class="popup-status">暂无分类数据</view>
          <view v-else class="popup-tag-wrap">
            <view class="popup-classify-tag" :class="{ 'tag-active': tempSelectedCids.includes(item.CID) }" v-for="item in classifyPopupList" :key="item.CID" @tap="toggleClassify(item)">
              {{ item.CName }}
            </view>
          </view>
        </scroll-view>
        <view class="popup-footer">
          <view class="popup-btn popup-btn-cancel" @tap="closeClassifyPopup">取消</view>
          <view class="popup-btn popup-btn-confirm" @tap="confirmClassify">确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { GetClassAllComposes, getUserConfig, saveUserConfig, getUserMyInfo } from '@/static/api/index.js'

export default {
  data() {
    return {
      keywordInput: '',
      productKeywordsList: [],  //  产品关键词
      // 查询条件开关
      showOnlyEnterprise: true,       // 只显示企业
      showOnlyHostEnterprise: true,    // 只显示主机企业
      showOnlyPartsEnterprise: false,  // 只显示零部件企业
      showOnlySchool: false,           // 只显示院校
      hostClassNames: [],             // 主机企业分类名称列表
      hostClassCids: [],               // 主机企业分类ID列表
      partsClassNames: [],             // 零部件企业分类名称列表
      partsClassCids: [],              // 零部件企业分类ID列表
      classifyPopupVisible: false,      // 分类弹窗显示
      classifyPopupClosing: false,      // 分类弹窗关闭动画
      classifyPopupType: '',            // 当前分类弹窗类型
      classifyPopupTitle: '',           // 当前分类弹窗标题
      classifyPopupCid: '',             // 当前分类接口入参
      classifyPopupList: [],            // 当前分类列表
      classifyLoading: false,           // 分类加载状态
      tempSelectedCids: [],            // 弹窗内临时选中的分类ID列表
      // 用户名片信息
      userInfo: {},
    }
  },
  onLoad() {
    this.loadUserConfig()
    this.loadUserInfo()
  },
  methods: {
    // ----------- 添加关键词
    addKeyword() {
      const keyword = this.keywordInput.trim()
      if (!keyword) {
        uni.showToast({ title: '请输入关键词', icon: 'none' })
        return
      }
      if (this.productKeywordsList.length >= 10) {
        uni.showToast({ title: '最多添加10个关键词', icon: 'none' })
        return
      }
      if (this.productKeywordsList.includes(keyword)) {
        uni.showToast({ title: '关键词已存在', icon: 'none' })
        return
      }
      this.productKeywordsList.push(keyword)
      this.keywordInput = ''
      // 添加关键词后自动保存
      this.saveConfig()
    },
    // ----------- 删除关键词
    removeKeyword(index) {
      this.productKeywordsList.splice(index, 1)
      // 删除关键词后自动保存
      this.saveConfig()
    },

    // ----------- 只显示企业开关变化
    onShowOnlyEnterpriseChange(e) {
      const isChecked = e.detail.value
      if (isChecked) {
        // 打开只显示企业：与只显示院校互斥，关闭院校
        this.showOnlyEnterprise = true
        this.showOnlySchool = false
        // 默认打开只显示主机企业，并关闭零部件企业（两者互斥）
        this.showOnlyHostEnterprise = true
        this.showOnlyPartsEnterprise = false
      } else {
        // 关闭只显示企业：子开关（主机/零部件）一并关闭
        this.showOnlyEnterprise = false
        this.showOnlyHostEnterprise = false
        this.showOnlyPartsEnterprise = false
        this.showOnlySchool = true;
      }
      this.saveConfig()
    },

    // ----------- 只显示院校开关变化
    onShowOnlySchoolChange(e) {
      const isChecked = e.detail.value
      if (isChecked) {
        // 打开只显示院校：与只显示企业互斥，关闭企业及其子开关
        this.showOnlySchool = true
        this.showOnlyEnterprise = false
        this.showOnlyHostEnterprise = false
        this.showOnlyPartsEnterprise = false
      } else {
        // 关闭只显示院校：自动切到只显示企业，并默认打开只显示主机企业
        this.showOnlySchool = false
        this.showOnlyEnterprise = true
        this.showOnlyHostEnterprise = true
        this.showOnlyPartsEnterprise = false
      }
      this.saveConfig()
    },

    // ----------- 只显示主机企业开关变化
    onShowOnlyHostEnterpriseChange(e) {
      if (e.detail.value) {
        // 打开主机企业，关闭零部件企业
        this.showOnlyHostEnterprise = true
        this.showOnlyPartsEnterprise = false
      } else {
        this.showOnlyHostEnterprise = false
      }
      this.saveConfig()
    },

    // ----------- 只显示零部件企业开关变化
    onShowOnlyPartsEnterpriseChange(e) {
      if (e.detail.value) {
        // 打开零部件企业，关闭主机企业
        this.showOnlyPartsEnterprise = true
        this.showOnlyHostEnterprise = false
      } else {
        this.showOnlyPartsEnterprise = false
      }
      this.saveConfig()
    },

    // ----------- 打开分类弹窗
    openClassifyPopup(type) {
      this.classifyPopupType = type
      this.classifyPopupTitle = type === 'host' ? '设置分类显示主机企业' : '设置分类显示零部件企业'
      this.classifyPopupCid = type === 'host' ? '100559' : '1'
      // 打开弹窗时，将已选项复制到临时选中列表
      this.tempSelectedCids = type === 'host' ? [...this.hostClassCids] : [...this.partsClassCids]
      this.classifyPopupVisible = true
      this.classifyPopupClosing = false
      this.getClassifyList()
    },

    // ----------- 获取分类列表数据
    async getClassifyList() {
      this.classifyLoading = true
      this.classifyPopupList = []
      try {
        const res = await GetClassAllComposes([this.classifyPopupCid])
        this.classifyPopupList = res.Data || []
      } catch (e) {
        uni.showToast({ title: '分类加载失败', icon: 'none' })
      }
      this.classifyLoading = false
    },

    // ----------- 切换分类选中状态（多选）
    toggleClassify(item) {
      const idx = this.tempSelectedCids.indexOf(item.CID)
      if (idx > -1) {
        this.tempSelectedCids.splice(idx, 1)
      } else {
        this.tempSelectedCids.push(item.CID)
      }
    },

    // ----------- 确认分类选择（多选）
    confirmClassify() {
      if (this.classifyPopupType === 'host') {
        this.hostClassCids = [...this.tempSelectedCids]
        // 根据选中ID获取名称
        this.hostClassNames = this.classifyPopupList
          .filter(item => this.hostClassCids.includes(item.CID))
          .map(item => item.CName)
      } else {
        this.partsClassCids = [...this.tempSelectedCids]
        this.partsClassNames = this.classifyPopupList
          .filter(item => this.partsClassCids.includes(item.CID))
          .map(item => item.CName)
      }
      this.closeClassifyPopup()
      this.saveConfig()
    },

    // ----------- 获取当前选中分类ID
    getSelectedClassCids() {
      return this.classifyPopupType === 'host' ? this.hostClassCids : this.partsClassCids
    },

    // ----------- 关闭分类弹窗
    closeClassifyPopup() {
      this.classifyPopupClosing = true
      setTimeout(() => {
        this.classifyPopupVisible = false
        this.classifyPopupClosing = false
      }, 260)
    },

    // ----------- 加载用户配置
    async loadUserConfig() {
      try {
        uni.showLoading({ title: '加载中...', mask: true })
        const res = await getUserConfig()
        uni.hideLoading()
        const config = res.data

        // 关键词
        if (config.productKeywords) {
          this.productKeywordsList = config.productKeywords
        }
        // 开关状态（showOnlySchools 后端返回 0/1/2）
        if (config.showOnlySchools !== undefined) {
          const val = Number(config.showOnlySchools)
          this.showOnlySchool = val === 1
          this.showOnlyEnterprise = val === 2
        }
        if (config.showOnlyHostEnterprise !== undefined) {
          this.showOnlyHostEnterprise = !!config.showOnlyHostEnterprise
        }
        if (config.showOnlyPartsEnterprise !== undefined) {
          this.showOnlyPartsEnterprise = !!config.showOnlyPartsEnterprise
        }
        // 主机企业分类（支持多选）
        if (config.hostEnterpriseCategories && config.hostEnterpriseCategories.length > 0) {
          const hostCats = config.hostEnterpriseCategories.filter(item => item.cid && item.cname)
          this.hostClassCids = hostCats.map(item => item.cid)
          this.hostClassNames = hostCats.map(item => item.cname)
        }
        // 零部件企业分类（支持多选）
        if (config.partsEnterpriseCategories && config.partsEnterpriseCategories.length > 0) {
          const partsCats = config.partsEnterpriseCategories.filter(item => item.cid && item.cname)
          this.partsClassCids = partsCats.map(item => item.cid)
          this.partsClassNames = partsCats.map(item => item.cname)
        }
      } catch (e) {
        uni.hideLoading()
        console.error('加载配置失败', e)
      }
    },

    // ----------- 保存用户配置
    async saveConfig() {
      try {
        const data = {
          productKeywords: this.productKeywordsList,
          hostEnterpriseCategories: this.hostClassCids
            .filter(cid => cid)
            .map((cid, i) => ({ cid, cname: this.hostClassNames[i] || '' })),
          partsEnterpriseCategories: this.partsClassCids
            .filter(cid => cid)
            .map((cid, i) => ({ cid, cname: this.partsClassNames[i] || '' })),
          showOnlyEnterprise: this.showOnlyEnterprise,
          showOnlyHostEnterprise: this.showOnlyHostEnterprise,
          showOnlyPartsEnterprise: this.showOnlyPartsEnterprise,
          showOnlySchools: (!this.showOnlyEnterprise && !this.showOnlySchool) ? 0 : (this.showOnlySchool ? 1 : 2),
        }
        const res = await saveUserConfig(data)
        if(res.code === 0) {
          uni.showToast({ title: '保存配置成功', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: e, icon: 'none' })
      }
    },

    // ----------- 加载用户名片信息
    async loadUserInfo() {
      const res = await getUserMyInfo()
      this.userInfo = res.Data
    }
  }
}
</script>

<style scoped lang="scss">
// ==================== 设置页容器
.settings-container {
  width: 100%;
  min-height: 100vh;
  background: #f4f6fa;
  padding: 24rpx 24rpx 50rpx 24rpx;
  box-sizing: border-box;
}

// ==================== 通用卡片
.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx 32rpx 0 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(0, 0, 0, 0.04);

  // 卡片头部：图标 + 标题 + 描述
  .card-header {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-bottom: 28rpx;

    .card-title-wrap {
      flex: 1;
      min-width: 0;

      .card-title {
        font-size: 30rpx;
        font-weight: 600;
        color: #1a1a1a;
        line-height: 1.3;
      }

      .card-desc {
        font-size: 24rpx;
        color: #999;
        margin-top: 6rpx;
        line-height: 1.3;
      }
    }
  }
}

// 卡片图标统一样式
.card-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4rpx 16rpx rgba(41, 98, 255, 0.12);

  .icon-emoji {
    font-size: 38rpx;
  }

  // 不同卡片图标的浅色背景
  &.icon-tag    { background: linear-gradient(135deg, #e8f0ff, #d6e4ff); }
  &.icon-filter { background: linear-gradient(135deg, #e0ecff, #c9dcff); }
  &.icon-host   { background: linear-gradient(135deg, #e8f0ff, #d6e4ff); }
  &.icon-part   { background: linear-gradient(135deg, #e0f1ff, #cfe6ff); }
  &.icon-card   { background: linear-gradient(135deg, #e8f0ff, #d6e4ff); }
}

// ==================== 关键词输入框行（输入框 + 确定按钮）
.keyword-input-row {
  display: flex;
  align-items: center;
  gap: 16rpx;

  .search-input {
    flex: 1;
  }

  .confirm-btn {
    width: 100rpx;
    height: 66rpx;
    line-height: 66rpx;
    background: #357dff;
    border-radius:10rpx;
    color: #fff;
    font-size: 26rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
      opacity: 0.85;
    }
  }
}

// ==================== 关键词搜索输入框
.search-input {
  display: flex;
  align-items: center;
  height: 76rpx;
  background: #f7f9fc;
  border-radius: 12rpx;
  padding: 0 24rpx;
  gap: 12rpx;

  .search-icon {
    font-size: 28rpx;
    color: #aaa;
  }

  .input-field {
    flex: 1;
    font-size: 26rpx;
    color: #333;
    height: 100%;
  }
}

// 输入框 placeholder 样式
.input-ph {
  color: #b0b6c0;
  font-size: 26rpx;
}

// ==================== 已添加关键词
.added-label {
  font-size: 24rpx;
  color: #888;
  margin: 24rpx 0 16rpx;
}

.keyword-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding-bottom: 30rpx;

  .keyword-tag {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    height: 52rpx;
    padding: 0 20rpx;
    background: #eef3ff;
    border-radius: 8rpx;

    .kw-text {
      font-size: 24rpx;
      color: #2962ff;
      line-height: 1;
    }

    .kw-close {
      font-size: 26rpx;
      color: #2962ff;
      opacity: 0.55;
      line-height: 1;
      margin-left: 2rpx;
      padding: 4rpx;

      &:active {
        opacity: 1;
      }
    }
  }
}

// ==================== 开关项列表
.switch-list {
  display: flex;
  flex-direction: column;

  .switch-row {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1rpx solid #f0f2f5;

    &:first-child {
      border-top: none;
    }

    .switch-label {
      font-size: 28rpx;
      color: #333;
    }

    // 企业子开关样式（缩进 + 禁用状态）
    &.switch-row-child {
      padding-left: 48rpx;
      background: #fafbfc;

      .sub-label {
        font-size: 26rpx;
        color: #666;
      }

      &.row-disabled {
        .sub-label {
          color: #bbb;
        }
      }
    }

    .text-disabled {
      color: #bbb;
    }
  }
}

// ==================== 分类显示卡片
.classify-card {
  padding: 8rpx 32rpx;

  .classify-row {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 28rpx 0;
    transition: opacity 0.15s;

    &:active {
      opacity: 0.72;
    }

    .classify-content {
      flex: 1;
      min-width: 0;

      .classify-title {
        font-size: 28rpx;
        font-weight: 600;
        color: #1a1a1a;
        line-height: 1.3;
      }

      .classify-desc {
        font-size: 22rpx;
        color: #999;
        margin-top: 6rpx;
        line-height: 1.3;
      }
    }

    .classify-right {
      display: flex;
      align-items: center;
      gap: 6rpx;
      flex-shrink: 0;

      .classify-value {
        font-size: 26rpx;
        color: #2962ff;
        max-width: 200rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .classify-arrow {
        font-size: 32rpx;
        color: #2962ff;
        line-height: 1;
      }
    }
  }

  .classify-divider {
    height: 1rpx;
    background: #f0f2f5;
  }
}

// ==================== 分类弹窗遮罩
.classify-popup-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4rpx);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
  animation: popupMaskShow 0.3s ease both;
}

.popup-mask-hide {
  animation: popupMaskHide 0.26s ease both;
}

// ==================== 分类弹窗主体
.classify-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 80vh;
  max-height: 80vh;
  background: #ffffff;
  border-radius: 40rpx 40rpx 0 0;
  overflow: hidden;
  box-shadow: 0 -8rpx 40rpx rgba(41, 98, 255, 0.15);
  display: flex;
  flex-direction: column;
  animation: popupCardShow 0.25s;
  transform: translateZ(0);

  // 顶部装饰渐变条
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 8rpx;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #2962ff 100%);
  }
}

.popup-card-hide {
  animation: popupCardHide 0.24s ease both;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 48rpx 34rpx 32rpx;
  background: #fff;
  position: relative;

  // 头部装饰圆形
  .header-decor {
    position: absolute;
    right: 100rpx;
    top: -20rpx;
    width: 100rpx;
    height: 100rpx;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.08) 100%);
    border-radius: 50%;
  }

  .header-decor-2 {
    position: absolute;
    right: 160rpx;
    top: 10rpx;
    width: 60rpx;
    height: 60rpx;
    background: linear-gradient(135deg, rgba(79, 172, 254, 0.12) 0%, rgba(41, 98, 255, 0.08) 100%);
    border-radius: 50%;
  }

  > view {
    position: relative;
    z-index: 1;
  }

  .popup-title {
    font-size: 36rpx;
    font-weight: 700;
    background: #4461ea;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.3;
  }

  .popup-desc {
    margin-top: 10rpx;
    font-size: 26rpx;
    color: #8892a6;
    letter-spacing: 1rpx;
  }

  .popup-close {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #f5f7fa 0%, #e8eaed 100%);
    color: #666;
    font-size: 44rpx;
    line-height: 58rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease;

    &:active {
      opacity: 0.75;
      transform: scale(0.92);
    }
  }
}

.classify-popup-list {
  flex: 1;
  height: 0;
  padding: 0 28rpx 0;
  box-sizing: border-box;
  background: #fff;
}

.popup-status {
  height: 260rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a94a6;
  font-size: 28rpx;
  flex-direction: column;
  gap: 16rpx;

  .status-icon {
    font-size: 64rpx;
    opacity: 0.5;
  }
}

.popup-tag-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.popup-classify-tag {
  max-width: 100%;
  min-height: 54rpx;
  padding: 0 30rpx;
  border-radius: 33rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
  border: 2rpx solid #e4e8f0;
  color: #5a6178;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 1.25;
  display: flex;
  align-items: center;
  justify-content: center;
  // box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
  // transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:active {
    opacity: 0.82;
    transform: scale(0.96);
  }

  &.tag-active {
    background: #2a7fff;
    color: #ffffff;
    border-color: transparent;
    transform: scale(1.02);
    font-weight: 600;

    &:active {
      transform: scale(0.98);
    }
  }
}

.popup-footer {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx 34rpx;
  background: #fff;
  border-top: 1rpx solid #f0f2f5;

  .popup-btn {
    flex: 1;
    height: 80rpx;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    font-weight: 600;
    letter-spacing: 2rpx;
    transition: opacity 0.2s;

    &:active {
      opacity: 0.82;
    }

    &.popup-btn-cancel {
      background: #f0f2f5;
      color: #666;
    }

    &.popup-btn-confirm {
      background: linear-gradient(135deg, #4984ff, #3a6bdb);
      color: #fff;
      box-shadow: 0 6rpx 20rpx rgba(73, 132, 255, 0.3);
    }
  }
}

@keyframes popupMaskShow {
  from {
    opacity: 0;
    backdrop-filter: blur(0rpx);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(4rpx);
  }
}

@keyframes popupMaskHide {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes popupCardShow {
  from {
    transform: translate3d(0, 100%, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

@keyframes popupCardHide {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(0, 100%, 0);
  }
}

// ==================== 名片表单
.form-list {
  display: flex;
  flex-direction: column;

  .form-row {
    display: flex;
    align-items: center;
    height: 96rpx;
    gap: 24rpx;
    border-top: 1rpx solid #f0f2f5;

    &:first-child {
      border-top: none;
    }

    .form-label {
      width: 140rpx;
      font-size: 28rpx;
      color: #333;
      flex-shrink: 0;
    }

    .form-divider-v {
      width: 1rpx;
      height: 32rpx;
      background: #e5e8ed;
      flex-shrink: 0;
    }

    .form-input {
      flex: 1;
      font-size: 28rpx;
      color: #333;
      height: 100%;
    }

    .form-value {
      flex: 1;
      font-size: 28rpx;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
      display: flex;
      align-items: center;

      .eng-avatar-img {
        width: 50rpx;
        height: 50rpx;
        border-radius: 40rpx;
        margin-right: 10rpx;
      }

      .company-chip {
        max-width: 100%;
        align-self: flex-start;
        display: flex;
        align-items: center;
        gap: 6rpx;
        margin: 6rpx 0;
        padding: 10rpx 12rpx;
        background: #eef5ff;
        border: 1rpx solid #b9d6ff;
        border-radius: 999rpx;

        .company-chip-icon {
          width: 30rpx;
          height: 30rpx;
          line-height: 30rpx;
          text-align: center;
          flex-shrink: 0;
          font-size: 20rpx;
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
          font-size: 24rpx;
          color: #146ff6;
        }
      }
    }
  }
}

// 卡片提示文字
.card-tip {
  font-size: 22rpx;
  color: #999;
  text-align: center;
  padding: 20rpx 0 32rpx 0;
}

// ==================== 底部保存按钮
.save-btn {
  bottom: calc(40rpx + env(safe-area-inset-bottom));
  width: 300rpx;
  height: 76rpx;
  border-radius: 40rpx;
  background: #4984ff;
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  margin-top: 60rpx;
  letter-spacing: 4rpx;

  &:active {
    opacity: 0.88;
  }
}
</style>
