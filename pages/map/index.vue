<template>
  <view class="map-container">
    <!-- 会员提示横幅 -->
    <member-banner v-if="showMemberBanner" :fixed="true" @click="onMemberBannerClick" @close="showMemberBanner = false" />

    <!-- 顶部搜索区域 -->
    <view class="search-bar" :style="{ top: showMemberBanner ? '68rpx' : '0' }">
      <view class="search-input-wrap" @tap="openLocationSearch">
        <text class="search-icon">🔍</text>
        <view class="search-text">{{ searchAddress || '手动设置定位地点' }}</view>
      </view>
      <picker
        class="distance-picker"
        mode="selector"
        :range="distanceLabels"
        :value="distanceIndex"
        @change="onDistanceChange"
      >
        <view class="distance-picker-inner">
          <text class="distance-icon">📍</text>
          <text class="distance-text">{{ distanceLabels[distanceIndex] }}</text>
          <text class="arrow-icon">▾</text>
        </view>
      </picker>
    </view>

    <!-- 微信原生地图 -->
    <map
      id="myMap"
      :longitude="longitude"
      :latitude="latitude"
      :enable-traffic="true"
      :markers="markers"
      :circles="circles"
      :scale="mapScale"
      style="width: 100%; height: 100%;"
      @markertap="onMarkerTap"
    ></map>

    <!-- 标注显示切换按钮 -->
    <view class="label-toggle-btn" @tap="toggleLabels">
      <view class="btn-tooltip" v-if="labelTipVisible">
        <text>{{ showLabels ? '展示公司名' : '隐藏公司名' }}</text>
        <view class="tooltip-arrow tooltip-arrow-down"></view>
      </view>
      <text class="label-toggle-icon">{{ showLabels ? '🙈' : '🏷️'}}</text>
    </view>

    <!-- 定位按钮 -->
    <view class="location-btn" @tap="goToMyLocation">
      <view class="btn-tooltip tooltip-wide" v-if="locationTipVisible">
        <text>刷新位置</text>
        <view class="tooltip-arrow tooltip-arrow-down"></view>
      </view>
      <text class="location-btn-icon">♻</text>
    </view>

    <!-- 筛选按钮（漏斗图标） -->
    <view class="filter-btn" @tap="openFilter">🔍</view>

    <!-- 公司详情抽屉 -->
    <comp-detail
      v-if="showDetailDrawer"
      ref="compDetailRef"
      :visible="showDetailDrawer"
      :companyInfo="currentCompany"
      :myLatitude="latitude"
      :myLongitude="longitude"
      @close="showDetailDrawer = false"
    />

    <!-- 定位/接口请求 loading -->
    <loading-overlay :visible="showLoading" :text="loadingText" />

    <!-- 筛选抽屉 -->
    <map-filter :visible="showFilter" @close="showFilter = false" @confirm="onFilterConfirm" @need-member="onNeedMember" />

    <!-- 非会员筛选时弹出的会员引导蒙层 -->
    <member-mask
      v-if="showMemberMask"
      :visible="true"
      title="会员专属"
      sub-title="开通会员后可使用全部筛选功能"
      btn-text="去开通"
      navigate-url="/pages/common/pay/pay"
      @close="showMemberMask = false"
    />

  </view>
</template>

<script>
import { searchNearbyUsersByCompany } from '@/static/api/index.js'
import CompDetail from '@/common/components/comp-detail.vue'
import LoadingOverlay from '@/common/components/loading-overlay.vue'
import MapFilter from '@/common/components/map-filter.vue'
import MemberBanner from '@/common/components/member-banner.vue'
import MemberMask from '@/common/components/member-mask.vue'
import { getMemberInfo } from '@/static/api/index.js'
import { mixinShowMemberBanner } from '@/common/utils/member.js'

export default {
  components: { CompDetail, LoadingOverlay, MapFilter, MemberBanner, MemberMask },
  data() {
    return {
      latitude: 0,
      longitude: 0,
      markers: [], // 点标记
      circles: [], // 圆形覆盖物
      mapContext: null, // 地图上下文
      showLoading: false, // 定位loading状态
      loadingText: '正在定位中...', // loading文案
      searchAddress: '', // 搜索地址
      distanceOptions: [0.5, 1, 2, 3, 5], // 距离选项（km，与探客页保持一致）
      distanceLabels: ['0.5km', '1km', '2km', '3km', '5km'], // 距离选项展示文案（带单位）
      distanceIndex: 2, // 当前选中的距离索引，默认 2km
      showLabels: false, // 是否显示标注文字
      labelTipVisible: false, // 标注切换按钮 tooltip 显示状态
      locationTipVisible: false, // 定位按钮 tooltip 显示状态
      showDetailDrawer: false, // 显示公司详情抽屉
      currentCompany: {}, // 当前选中的公司信息
      allNearbyData: [], // 周边用户原始数据列表
      requestId: 0, // 请求 ID，用于处理竞态条件
      showFilter: false, // 是否显示筛选抽屉
      filterConditions: uni.getStorageSync("filterConditions"), // 筛选条件，由筛选组件 confirm 抛出
      showMemberBanner: mixinShowMemberBanner(), // 根据会员状态初始决定是否显示横幅
      showMemberMask: false // 非会员点击筛选确定时弹出会员引导蒙层
    }
  },
  computed: {
    // 当前实际使用的距离（单位：米）
    currentDistance() {
      return this.distanceOptions[this.distanceIndex] * 1000
    },
    // 根据距离计算地图缩放级别
    mapScale() {
      // 根据距离返回合适的缩放级别
      // scale值范围：3-20，值越大地图放大越厉害
      const distance = this.currentDistance
      if (distance <= 200) return 16
      if (distance <= 500) return 15
      if (distance <= 1000) return 14
      if (distance <= 2000) return 13
      if (distance <= 3000) return 13
      return 12
    }
  },
  onShow() {
    this.showMemberBanner = mixinShowMemberBanner()
    this.syncDistanceFromExplore()
  },
  onLoad() {
    this.checkMemberStatus()
    // 尝试从本地缓存读取之前保存的经纬度
    const savedLatitude = uni.getStorageSync('myLatitude')
    const savedLongitude = uni.getStorageSync('myLongitude')
    if (savedLatitude && savedLongitude) {
      this.latitude = savedLatitude
      this.longitude = savedLongitude
    }
    this.getMyLocation()
  },
  onReady() {
    // 获取地图上下文
    this.mapContext = uni.createMapContext('myMap', this)
    // 初始化圆形覆盖物
    this.updateCircle()
  },
  methods: {
    // ----------- 查询会员状态，保存到全局 storage 并更新横幅显示
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

    // ----------- 收到子组件 need-member 事件：展示会员引导弹窗
    onNeedMember() {
      console.log('[map] 收到 need-member, 展示 member-mask')
      this.showMemberMask = true
    },

    // 打开位置搜索
    openLocationSearch() {
      uni.chooseLocation({
        success: (res) => {
          console.log('选择的位置:', res)
          this.searchAddress = res.name || res.address
          this.latitude = res.latitude
          this.longitude = res.longitude
          // 保存到本地缓存（全局使用）
          uni.setStorageSync('myLatitude', res.latitude)
          uni.setStorageSync('myLongitude', res.longitude)
          // 移动地图到选中位置
          if (this.mapContext) {
            this.mapContext.moveToLocation({
              latitude: res.latitude,
              longitude: res.longitude
            })
          }
          // 更新圆形覆盖物
          this.updateCircle()
          // 重新查询周边用户
          this.getNearbyUsers()

        },
        fail: (err) => {
          console.log('选择位置失败:', err)
          if (err.errMsg && err.errMsg.includes('auth deny')) {
            uni.showToast({ title: '请授权位置权限', icon: 'none' })
          }
        }
      })
    },

    // ----------- 距离选择变更方法
    onDistanceChange(e) {
      // 获取选中的索引
      this.distanceIndex = Number(e.detail.value)
      // 更新圆形覆盖物
      this.updateCircle()
      // 重新查询周边用户
      this.getNearbyUsers()
      // 同步距离到 explore 页面（单位：km）
      uni.setStorageSync('sharedDistance', this.distanceOptions[this.distanceIndex])
    },

    // -------------------- 点击定位按钮，定位到当前GPS位置，同时清空筛选条件并重置距离
    goToMyLocation() {
      // 显示 tooltip，2秒后自动关闭
      this.locationTipVisible = true
      setTimeout(() => { this.locationTipVisible = false }, 2000)
      // 重置距离为 1km
      this.distanceIndex = 2
      uni.setStorageSync('sharedDistance', this.distanceOptions[this.distanceIndex])
      // 清空筛选条件（内存 + 本地缓存）
      this.filterConditions = null
      uni.removeStorageSync('filterConditions')
      uni.removeStorageSync('mapFilterState')
      // 清除搜索地址
      this.searchAddress = ''
      // 获取当前GPS定位
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          console.log('定位成功:', res)
          this.latitude = res.latitude
          this.longitude = res.longitude
          // 保存到本地缓存（全局使用）
          uni.setStorageSync('myLatitude', res.latitude)
          uni.setStorageSync('myLongitude', res.longitude)
          // 移动地图到当前位置
          if (this.mapContext) {
            this.mapContext.moveToLocation({
              latitude: res.latitude,
              longitude: res.longitude
            })
          }
          // 更新圆形覆盖物
          this.updateCircle()
          // 重新查询周边用户
          this.getNearbyUsers()
        },
        fail: (err) => {
          console.error('定位失败:', err)
          uni.showToast({ title: '定位失败', icon: 'none' })
        }
      })
    },

    // -------------------- 切换标注显示
    toggleLabels() {
      // 显示 tooltip，2秒后自动关闭
      this.labelTipVisible = true
      setTimeout(() => { this.labelTipVisible = false }, 3000)
      this.showLabels = !this.showLabels
      // 更新所有 markers 的 callout 显示状态
      if (this.markers && this.markers.length > 0) {
        this.markers = this.markers.map(marker => ({
          ...marker,
          callout: {
            ...marker.callout,
            display: this.showLabels ? 'ALWAYS' : 'BYCLICK'
          }
        }))
      }
      // 让地图回到当前位置中心
      this.$nextTick(() => {
        if (this.mapContext && this.latitude && this.longitude) {
          this.mapContext.moveToLocation({
            latitude: this.latitude,
            longitude: this.longitude
          })
        }
      })
    },

    // ---------------- 获取当前定位
    getMyLocation() {
      // 显示loading
      this.showLoading = true

      // 先检查权限
      uni.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userLocation'] === false) {
            // 曾经拒绝过，引导开启
            this.showLoading = false
            uni.showModal({
              title: '定位权限申请',
              content: '地图功能需要定位权限，请在设置中开启',
              confirmText: '去设置',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  uni.openSetting()
                }
              }
            })
          } else if (res.authSetting['scope.userLocation'] === undefined) {
            // 首次使用，发起授权
            this.requestLocation()
          } else {
            // 已有权限，直接获取
            this.requestLocation()
          }
        },
        fail: () => {
          // 检查失败，直接尝试获取
          this.requestLocation()
        }
      })
    },

    // -------------------- 切换至当前定位
    requestLocation() {
      uni.getLocation({
        type: 'gcj02',
        success: async (res) => {
          console.log("--------------------定位成功", res)
          this.latitude = res.latitude
          this.longitude = res.longitude

          // 保存到本地缓存（全局使用）
          uni.setStorageSync('myLatitude', res.latitude)
          uni.setStorageSync('myLongitude', res.longitude)

          // 更新地图中心位置
          if (this.mapContext) {
            this.mapContext.moveToLocation()
          }

          // 更新圆形覆盖物
          this.updateCircle()

          // 改变文案为"定位成功"
          this.loadingText = '定位成功'

          this.getNearbyUsers()

          // 延迟后关闭loading
          setTimeout(() => {
            this.showLoading = false
          }, 500)

        },
        fail: (err) => {
          console.log("--------------------定位失败", err)
          let msg = '定位失败'
          if (err.errMsg) {
            if (err.errMsg.includes('auth deny')) {
              msg = '定位权限被拒绝'
            } else if (err.errMsg.includes('timeout')) {
              msg = '定位超时'
            }
          }
          // 隐藏loading
          setTimeout(() => {
            this.showLoading = false
          }, 1000)
          uni.showToast({ title: msg, icon: 'none', duration: 2000 })
        }
      })
    },

    // -------------------- 同步 explore 页面的距离
    syncDistanceFromExplore() {
      const saved = uni.getStorageSync('sharedDistance')
      if (saved && saved > 0) {
        // 存储的是 km 值，在选项中查找对应索引
        const index = this.distanceOptions.indexOf(saved)
        if (index !== -1 && this.distanceIndex !== index) {
          this.distanceIndex = index
          this.updateCircle()
          this.getNearbyUsers()
        }
      }
    },

    // -------------------- 获取周边用户
    async getNearbyUsers() {
      // 生成新的请求 ID，用于处理竞态条件
      const currentRequestId = ++this.requestId

      // 显示 loading
      this.showLoading = true
      this.loadingText = '正在获取数据'

      let params = {
        lat: this.latitude,
        lng: this.longitude,
        distance: this.currentDistance,
      }
      if(this.filterConditions) {
        params = { ...params, ...this.filterConditions }
      }
      try {
        // 调用周边用户查询接口
        const result = await searchNearbyUsersByCompany({
          ...params,
        })

        // 检查是否是最新请求，防止旧请求覆盖新数据
        if (currentRequestId !== this.requestId) {
          console.log('getNearbyUsers: 丢弃过期请求', currentRequestId, this.requestId)
          return
        }

        // 保存原始数据用于详情查询
        this.allNearbyData = result.data || []
        this.markers = new Array();
        this.markers = this.allNearbyData.map((item, index) => ({
          ...item,
          id: index + 1,
          compName: item.compName,
          latitude: item.mapLat,
          longitude: item.mapLng,
          width: 20,
          height: 30,
          anchor: { x: 0.5, y: 1 },
          callout: {
            content: item.compName,
            color: '#333333',
            fontSize: 13,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#dbdbdb',
            bgColor: '#ffffff',
            padding: 8,
            display: this.showLabels ? 'ALWAYS' : 'BYCLICK',
            textAlign: 'center',
            whiteSpace: 'nowrap'
          }
        }))
      } catch (error) {
        console.error('获取周边用户失败:', error)
        uni.showToast({ title: '获取数据失败', icon: 'none' })
      } finally {
        // 隐藏 loading
        this.showLoading = false
      }
    },

    // 点击marker打开详情
    onMarkerTap(e) {
      const index = e.detail.markerId - 1
      const company = this.markers[index]
      if (company) {
        this.currentCompany = company
        this.showDetailDrawer = true
        this.$nextTick(() => {
          this.$refs.compDetailRef.getUsersByCompanyName()
        })
      }
    },

    // ----------- 打开筛选抽屉
    openFilter() {
      this.showFilter = true
    },

    // ----------- 刷新地图数据（走现有 loading-overlay，不再额外弹 toast）
    refreshData() {
      this.getNearbyUsers()
    },

    // ----------- 筛选确认回调
    onFilterConfirm(conditions) {
      this.filterConditions = conditions
      uni.setStorageSync("filterConditions", this.filterConditions)
      uni.setStorageSync("exploreNeedRefresh", true)
      // 重新查询周边用户（按需在 getNearbyUsers 内组合参数）
      this.getNearbyUsers()
    },

    // 更新圆形覆盖物
    updateCircle() {
      try {
        // 确保坐标有效
        if (typeof this.latitude !== 'number' || typeof this.longitude !== 'number') {
          console.error('updateCircle: 无效的坐标', this.latitude, this.longitude)
          return
        }

        // 确保距离有效
        if (typeof this.currentDistance !== 'number' || this.currentDistance <= 0) {
          console.error('updateCircle: 无效的距离', this.currentDistance)
          return
        }

        this.circles = [{
          id: 1,
          latitude: this.latitude,
          longitude: this.longitude,
          radius: this.currentDistance, // 半径，单位米
          strokeWidth: 2, // 边框宽度
          color: '#4facfe', // 边框颜色
          fillColor: '#4FACFE59' // 填充颜色，十六进制格式（约75%透明度）
        }]
      } catch (error) {
        console.error('updateCircle 更新圆形覆盖物时出错:', error)
      }
    }
  }
}
</script>

<style scoped lang="scss">
// ==================== 地图容器
.map-container {
  width: 100%;
  height: 100vh;
  position: relative;

  // 顶部搜索区域
  .search-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 20rpx 30rpx;
    padding-top: calc(20rpx + env(safe-area-inset-top));
    display: flex;
    align-items: center;
    gap: 20rpx;

    .search-input-wrap {
      flex: 1;
      height: 80rpx;
      background: #fff;
      border-radius: 40rpx;
      display: flex;
      align-items: center;
      padding: 0 30rpx;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

      .search-icon {
        font-size: 32rpx;
        margin-right: 16rpx;
      }

      .search-text {
        flex: 1;
        height: 100%;
        font-size: 28rpx;
        color: #333;
        line-height: 80rpx;

        &.placeholder {
          color: #999;
          font-size: 28rpx;
        }
      }

      .search-input {
        display: none;
      }

      .placeholder {
        color: #999;
        font-size: 28rpx;
      }

      .clear-icon {
        font-size: 28rpx;
        color: #999;
        padding: 10rpx;
      }
    }

    .distance-picker {
      flex-shrink: 0;

      .distance-picker-inner {
        height: 80rpx;
        background: #fff;
        border-radius: 40rpx;
        display: flex;
        align-items: center;
        padding: 0 24rpx;
        gap: 8rpx;
        box-shadow: 0 2px 10px rgb(0, 0, 0, 0.2);

        .distance-icon {
          font-size: 28rpx;
        }

        .distance-text {
          font-size: 26rpx;
          color: #333;
          font-weight: 500;
        }

        .arrow-icon {
          font-size: 20rpx;
          color: #999;
          margin-left: 4rpx;
        }
      }
    }
  }

  // 定位按钮
  .location-btn {
    position: fixed;
    right: 30rpx;
    bottom: 200rpx;
    width: 96rpx;
    height: 96rpx;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    z-index: 99;

    .location-btn-icon {
      font-size: 44rpx;
      position: relative;
      top: 0px !important;
      color: #0a77ff;
    }
  }

  // 筛选按钮（右侧悬浮，位于标注切换上方）
  .filter-btn {
    position: fixed;
    right: 30rpx;
    bottom: 80rpx;
    width: 96rpx;
    height: 96rpx;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    z-index: 99;

    &:active { opacity: 0.85; }

    // CSS 绘制的漏斗图标（3 根递减横线）
    .filter-funnel {
      width: 44rpx;
      height: 36rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;

      .funnel-bar {
        height: 6rpx;
        background: #2962ff;
        border-radius: 3rpx;
      }
      .bar1 { width: 44rpx; }
      .bar2 { width: 30rpx; }
      .bar3 { width: 16rpx; }
    }
  }

  // 刷新按钮
  .refresh-btn {
    position: fixed;
    right: 30rpx;
    bottom: 440rpx;
    width: 96rpx;
    height: 96rpx;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    z-index: 99;

    &:active { opacity: 0.85; }

    .refresh-icon {
      font-size: 46rpx;
      color: #397fff;
      line-height: 1;
    }
  }

  // 标注显示切换按钮
  .label-toggle-btn {
    position: fixed;
    right: 30rpx;
    bottom: 320rpx;
    width: 96rpx;
    height: 96rpx;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    z-index: 99;

    .label-toggle-icon {
      font-size: 44rpx;
    }
  }

  // 定位按钮
  .location-btn {
    position: fixed;
    right: 30rpx;
    bottom: 200rpx;
    width: 96rpx;
    height: 96rpx;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    z-index: 99;

    .location-btn-icon {
      font-size: 44rpx;
      position: relative;
      top: 1px;
    }
  }

  // 按钮 tooltip 气泡
  .btn-tooltip {
    position: absolute;
    right: calc(100% + 14rpx);
    top: 50%;
    transform: translateY(-50%);
    padding: 14rpx 24rpx;
    border-radius: 12rpx;
    background: #000000;
    white-space: nowrap;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);

    text {
      color: #ffffff;
      font-size: 24rpx;
      line-height: 34rpx;
      font-weight: 500;
    }

    // 宽版 tooltip（定位按钮）
    &.tooltip-wide {
      white-space: normal;
      text-align: center;
      width: 130rpx;
      padding: 14rpx 20rpx;

      text { white-space: normal; }
    }
  }

  // tooltip 向右箭头
  .tooltip-arrow-down {
    position: absolute;
    right: -12rpx;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 12rpx solid transparent;
    border-bottom: 12rpx solid transparent;
    border-left: 12rpx solid #000000;
  }
}

// ==================== 动画keyframes（放在根层级，不嵌套）
</style>
