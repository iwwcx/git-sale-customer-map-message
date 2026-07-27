<template>
  <view class="ability-page">
    <!-- 加载中 -->
    <view v-if="loading" class="loading-box">
      <view class="loading-dots">
        <view class="loading-dot dot-1"></view>
        <view class="loading-dot dot-2"></view>
        <view class="loading-dot dot-3"></view>
      </view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 顶部用户信息卡片 -->
    <scroll-view v-else scroll-y class="scroll-content">
     <!--  <view class="profile-card">
        <view class="profile-bg"></view>
        <view class="profile-main">
          <view class="avatar-wrap">
            <image
              class="avatar"
              :src="info.userLogo || (info.gender === '女' ? 'https://img2cdn.global-dsc.cn/dgzz_img/6842d00b7f7db24082ed4f59f2bba02a.png' : 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png')"
              mode="aspectFill"
            ></image>
          </view>
          <view class="profile-info">
            <view class="name-row">
              <text class="name">{{ info.expertName || '工程师' }}</text>
              <text v-if="info.gender" class="gender-tag" :class="info.gender === '女' ? 'female' : 'male'">{{ info.gender }}</text>
              <text v-if="info.ageRange" class="age-tag">{{ info.ageRange }}</text>
            </view>
            <view v-if="locationText" class="meta-row">
              <text class="meta-icon">📍</text>
              <text class="meta-text">{{ locationText }}</text>
            </view>
            <view v-if="info.industry" class="meta-row">
              <text class="meta-icon">🏭</text>
              <text class="meta-text">{{ info.industry }}</text>
            </view>
            <view v-if="info.hopeContact === 1" class="contact-badge">
              <text>✓ 可联系</text>
            </view>
          </view>
        </view>
      </view> -->

      <!-- 简介 -->
      <view class="section card">
        <view class="section-header">
          <view class="icon-box red">
            <text class="icon-text">简</text>
          </view>
          <text class="section-title">简介</text>
        </view>
        <text class="intro-text">{{ info.description || '暂无简介' }}</text>
      </view>

      <!-- 特长 -->
      <view class="section card">
        <view class="section-header">
          <view class="icon-box orange">
            <text class="icon-text">特</text>
          </view>
          <text class="section-title">特长</text>
        </view>

        <!-- 设计软件 -->
        <view class="info-row" :class="{ 'row-wrap': designSoftwareList.length > 5 }">
          <text class="info-label">设计软件</text>
          <view v-if="designSoftwareList.length" class="tag-list">
            <text v-for="(item, index) in designSoftwareList" :key="'ds' + index" class="tag tag-red">{{ item }}</text>
          </view>
          <text v-else class="info-value">-</text>
        </view>
        <view class="divider"></view>

        <!-- 分析软件 -->
        <view class="info-row" :class="{ 'row-wrap': analysisSoftwareList.length > 5 }">
          <text class="info-label">分析软件</text>
          <view v-if="analysisSoftwareList.length" class="tag-list">
            <text v-for="(item, index) in analysisSoftwareList" :key="'as' + index" class="tag tag-blue">{{ item }}</text>
          </view>
          <text v-else class="info-value">-</text>
        </view>
        <view class="divider"></view>

        <!-- 技术能力 -->
        <view class="info-row" :class="{ 'row-wrap': techAbilitiesList.length > 5 }">
          <text class="info-label">技术能力</text>
          <view v-if="techAbilitiesList.length" class="tag-list">
            <text v-for="(item, index) in techAbilitiesList" :key="'ta' + index" class="tag tag-green">{{ item }}</text>
          </view>
          <text v-else class="info-value">-</text>
        </view>
        <view class="divider"></view>

        <view class="info-row">
          <text class="info-label">擅长产品</text>
          <text class="info-value">{{ info.goodAtProducts || '-' }}</text>
        </view>
        <view class="divider"></view>

        <view class="info-row">
          <text class="info-label">当前使用软件</text>
          <text class="info-value">{{ info.currentSoftware || '-' }}</text>
        </view>
        <view class="divider"></view>

        <view class="info-row">
          <text class="info-label">当前工作行业</text>
          <text class="info-value">{{ info.industry || '-' }}</text>
        </view>
      </view>

      <!-- 技术能力描述 -->
      <view v-if="info.isTechAbilityDesc === 1" class="section card">
        <view class="section-header">
          <view class="desc-bar"></view>
          <text class="section-title">技术能力描述</text>
        </view>
        <text class="desc-text">{{ info.techAbilityDesc || '暂无描述' }}</text>
      </view>

      <!-- 解决问题描述 -->
      <view v-if="info.isProblemSolvedDesc === 1" class="section card">
        <view class="section-header">
          <view class="desc-bar bar-blue"></view>
          <text class="section-title">解决问题描述</text>
        </view>
        <text class="desc-text">{{ info.problemSolvedDesc || '暂无描述' }}</text>
      </view>

      <!-- 项目简介 -->
      <view v-if="info.isProjectIntro === 1" class="section card">
        <view class="section-header">
          <view class="desc-bar bar-green"></view>
          <text class="section-title">项目简介</text>
        </view>
        <text class="desc-text">{{ info.projectIntro || '暂无描述' }}</text>
      </view>

      <!-- 等级证书 -->
      <view v-if="info.isCertificate === 1 && certificateList.length" class="section card">
        <view class="section-header">
          <view class="icon-box gold">
            <text class="icon-text">证</text>
          </view>
          <text class="section-title">等级证书</text>
        </view>
        <view class="cert-list">
          <image
            v-for="(item, index) in certificateList"
            :key="'cert' + index"
            class="cert-img"
            :src="item"
            mode="aspectFill"
            @tap="previewCert(index)"
          ></image>
        </view>
      </view>

      <view class="footer-tip">— 已经到底啦 —</view>
    </scroll-view>
  </view>
</template>

<script>
import { getUserProfileInfo } from '@/static/api/index.js'

export default {
  data() {
    return {
      userId: '', // 用户ID，从页面参数获取
      info: {}, // 能力档案信息
      loading: false, // 加载状态
    }
  },
  computed: {
    // 设计软件列表，合并自定义
    designSoftwareList() {
      return this.mergeListWithCustom(this.info.designSoftware, this.info.designSoftwareCustom)
    },
    // 分析软件列表，合并自定义
    analysisSoftwareList() {
      return this.mergeListWithCustom(this.info.analysisSoftware, this.info.analysisSoftwareCustom)
    },
    // 技术能力列表，合并自定义
    techAbilitiesList() {
      return this.mergeListWithCustom(this.info.techAbilities, this.info.techAbilitiesCustom)
    },
    // 所在地区文本
    locationText() {
      const { province, city, district } = this.info
      const arr = [province, city, district].filter(Boolean)
      return arr.join(' ')
    },
    // 等级证书图片列表（拼接图片域名前缀）
    certificateList() {
      const list = this.info.certificate || []
      if (!Array.isArray(list)) return []
      return list.map(v => {
        if (!v) return ''
        if (v.startsWith('http')) return v
        return 'https://img2cdn.global-dsc.cn/' + v
      }).filter(Boolean)
    }
  },
  onLoad(options) {
    // 获取传入的用户ID
    this.userId = options.userId || ''
    if (this.userId) {
      this.loadAbilityInfo()
    }
  },
  methods: {
    // ----------- 加载能力档案信息
    async loadAbilityInfo() {
      this.loading = true
      try {
        const res = await getUserProfileInfo({ userId: this.userId })
        // 将接口返回数据赋值
        this.info = res.data || {}
      } catch (e) {
        console.error('获取能力档案失败:', e)
        uni.showToast({ title: '获取失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    // ----------- 合并数组列表与用户自定义字段
    mergeListWithCustom(list, custom) {
      const arr = Array.isArray(list) ? [...list] : []
      // 把自定义内容按分隔符切分后追加
      if (custom && typeof custom === 'string') {
        const customArr = custom.split(/[,;，；]/).map(s => s.trim()).filter(Boolean)
        arr.push(...customArr)
      }
      return arr
    },

    // ----------- 预览证书图片
    previewCert(index) {
      uni.previewImage({
        urls: this.certificateList,
        current: this.certificateList[index]
      })
    }
  }
}
</script>

<style scoped lang="scss">
.ability-page {
  min-height: 100vh;
  background: #f5f6fa;

  .loading-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 300rpx;

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

    .loading-text {
      font-size: 26rpx;
      color: #8c929d;
    }
  }

  .scroll-content {
    padding: 24rpx 24rpx 60rpx;
    box-sizing: border-box;
  }

  // ============ 顶部用户信息卡片
  .profile-card {
    position: relative;
    border-radius: 20rpx;
    overflow: hidden;
    margin-bottom: 24rpx;
    background: #fff;
    box-shadow: 0 6rpx 20rpx rgba(60, 125, 240, 0.08);

    .profile-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 160rpx;
      background: linear-gradient(135deg, #5a9eff 0%, #3c7df0 100%);
    }

    .profile-main {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 24rpx;
      padding: 40rpx 28rpx 32rpx;

      .avatar-wrap {
        flex-shrink: 0;
        width: 140rpx;
        height: 140rpx;
        border-radius: 50%;
        padding: 6rpx;
        background: #fff;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);

        .avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
      }

      .profile-info {
        flex: 1;
        min-width: 0;
        padding-top: 16rpx;

        .name-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12rpx;
          margin-bottom: 16rpx;

          .name {
            font-size: 34rpx;
            font-weight: 700;
            color: #fff;
            text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.15);
          }

          .gender-tag {
            padding: 4rpx 14rpx;
            font-size: 22rpx;
            color: #fff;
            border-radius: 20rpx;
            background: rgba(255, 255, 255, 0.3);

            &.male {
              background: rgba(76, 161, 255, 0.95);
            }

            &.female {
              background: rgba(255, 132, 162, 0.95);
            }
          }

          .age-tag {
            padding: 4rpx 14rpx;
            font-size: 22rpx;
            color: #fff;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 20rpx;
          }
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 8rpx;
          margin-top: 10rpx;
          font-size: 24rpx;
          color: #666;

          .meta-icon {
            font-size: 24rpx;
          }

          .meta-text {
            font-size: 24rpx;
            color: #555;
          }
        }

        .contact-badge {
          display: inline-flex;
          align-items: center;
          margin-top: 16rpx;
          padding: 6rpx 18rpx;
          font-size: 22rpx;
          color: #2ea44f;
          background: #eaf7ee;
          border-radius: 20rpx;
        }
      }
    }
  }

  // ============ 通用卡片
  .section {
    margin-bottom: 24rpx;

    &.card {
      background: #fff;
      border-radius: 20rpx;
      padding: 30rpx 26rpx;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 24rpx;

    .icon-box {
      width: 48rpx;
      height: 48rpx;
      border-radius: 10rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      &.red {
        background: linear-gradient(135deg, #ff6b6b, #ff4d4f);
      }

      &.orange {
        background: linear-gradient(135deg, #ffb347, #ff9500);
      }

      &.gold {
        background: linear-gradient(135deg, #ffd86b, #f5a623);
      }

      .icon-text {
        font-size: 24rpx;
        color: #fff;
        font-weight: 700;
      }
    }

    .section-title {
      font-size: 30rpx;
      font-weight: 700;
      color: #222;
    }

    .desc-bar {
      width: 8rpx;
      height: 32rpx;
      background: #d45a5a;
      border-radius: 4rpx;
      flex-shrink: 0;

      &.bar-blue {
        background: #3c7df0;
      }

      &.bar-green {
        background: #2ea44f;
      }
    }
  }

  .intro-text {
    font-size: 28rpx;
    color: #555;
    line-height: 1.8;
  }

  .info-row {
    display: flex;
    align-items: center;
    gap: 20rpx;
    min-height: 56rpx;

    &.row-wrap {
      align-items: flex-start;

      .info-label {
        padding-top: 8rpx;
      }
    }

    .info-label {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
      flex-shrink: 0;
      min-width: 168rpx;
    }

    .info-value {
      flex: 1;
      font-size: 28rpx;
      color: #555;
      word-break: break-all;
    }

    .tag-list {
      display: flex;
      align-items: center;
      gap: 14rpx;
      flex: 1;
      flex-wrap: wrap;

      .tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 8rpx 20rpx;
        font-size: 24rpx;
        border-radius: 30rpx;
        line-height: 1.4;

        &.tag-red {
          color: #e15a5a;
          background: #fff1f0;
          border: 1rpx solid #ffd6d3;
        }

        &.tag-blue {
          color: #3c7df0;
          background: #ecf3ff;
          border: 1rpx solid #d2e2ff;
        }

        &.tag-green {
          color: #2ea44f;
          background: #eaf7ee;
          border: 1rpx solid #c5ebd1;
        }
      }
    }
  }

  .divider {
    height: 1rpx;
    background: #f0f0f0;
    margin: 22rpx 0;
  }

  .desc-text {
    display: block;
    font-size: 28rpx;
    color: #555;
    line-height: 1.8;
    padding-left: 24rpx;
  }

  // ============ 证书列表
  .cert-list {
    display: flex;
    flex-wrap: wrap;
    gap: 18rpx;

    .cert-img {
      width: calc((100% - 36rpx) / 3);
      height: 200rpx;
      border-radius: 12rpx;
      background: #f5f5f5;
    }
  }

  .footer-tip {
    text-align: center;
    margin-top: 30rpx;
    padding: 20rpx 0;
    font-size: 24rpx;
    color: #bbb;
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
</style>
