<template>
  <view class="explore-container">
    <enterprise-detail :keyword="keyword"></enterprise-detail>
  </view>
</template>

<script>
import EnterpriseDetail from '@/common/components/enterprise-detail.vue'

export default {
  components: {
    EnterpriseDetail
  },
  data() {
    return {
      keyword: ''                // 企业查询关键字
    }
  },
  onLoad(options) {
    if (options.keyword) {
      this.keyword = decodeURIComponent(options.keyword) // 解码路由中携带的查询关键字
    } // 参数校验
  }
}
</script>

<style scoped lang="scss">
.explore-container {
  min-height: 100vh;
  background-color: #f0f8ff;
}
</style>
