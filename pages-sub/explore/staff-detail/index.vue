<template>
  <view class="explore-container">
    <staff-detail mode="page" :staffInfo="staffInfo" :prodName="prodName"></staff-detail>
  </view>
</template>

<script>
import StaffDetail from '@/common/components/staff-detail.vue'

export default {
  components: { StaffDetail },
  data() {
    return {
      staffInfo: {}, // 路由传过来的工程师信息
      prodName: '' // 搜索的产品名称
    }
  },
  onLoad(options) {
    // 接收产品名称
    if (options.prodName) {
      this.prodName = decodeURIComponent(options.prodName)
    }
    // 接收工程师信息
    if (options.staffInfo) {
      try {
        const raw = JSON.parse(decodeURIComponent(options.staffInfo))
        // 接口返回大写字段，映射成组件内部使用的小写字段
        this.staffInfo = {
          userId: raw.UserId || raw.userId || '',
          nickName: raw.NickName || raw.nickName || '',
          compName: raw.CompName || raw.compName || '',
          sex: raw.Sex || raw.sex || 1,
          userMdt: raw.UserMdt || raw.userMdt || '',
          ...raw // 保留其他字段
        }
      } catch (error) {
        this.staffInfo = {}
      }
    }
  }
}
</script>

<style scoped lang="scss">
</style>
