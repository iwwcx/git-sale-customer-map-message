<template>
  <view class="explore-container">
    <comp-detail
      mode="page"
      :companyInfo="companyInfo"
      :myLatitude="myLatitude"
      :myLongitude="myLongitude"
      :skipDistance="skipDistance"
    ></comp-detail>
  </view>
</template>

<script>
import CompDetail from '@/common/components/comp-detail.vue'

export default {
  components: { CompDetail },
  data() {
    return {
      companyInfo: {}, // 路由传过来的公司信息
      skipDistance: '',
      myLatitude: 0, // 当前用户纬度
      myLongitude: 0 // 当前用户经度
    }
  },
  onLoad(options) {
    if (options.companyInfo) {
      try {
        this.companyInfo = JSON.parse(decodeURIComponent(options.companyInfo))
        this.skipDistance = options.skipDistance;
      } catch (error) {
        this.companyInfo = {}
      }
    }
    this.myLatitude = Number(options.myLatitude || 0)
    this.myLongitude = Number(options.myLongitude || 0)
  }
}
</script>

<style scoped lang="scss">

</style>
