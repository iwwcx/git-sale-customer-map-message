<template>
  <web-view v-if="show" :src="src"></web-view>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      src: ''
    }
  },
  onLoad(option) {
    // 计算底部安全区域高度
    const sysInfo = uni.getSystemInfoSync()
    const { screenHeight, safeArea } = sysInfo
    const safeBottom = screenHeight && safeArea && safeArea.bottom ? screenHeight - safeArea.bottom : 0

    const token = uni.getStorageSync('token') || ''
    const url = option.url || ''

    // IM 移动端地址，可按环境切换
    const baseUrl = 'https://big-engineer.global-dsc.cn/im_mobile'
    // const baseUrl = 'http://172.16.4.19:8010'
    // const baseUrl = 'https://big-engineer.nidcloud.cn/im_mobile'

    this.src = `${baseUrl}/#/login-token?safeBottom=${safeBottom}&redirect=${encodeURIComponent(url)}&token=${encodeURIComponent(token)}`
    this.show = true
  }
}
</script>

<style lang="scss"></style>
