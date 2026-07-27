<template>
  <web-view v-if="show" :src="src"></web-view>
</template>

<script>
export default {
  data() {
    return {
      show: false, // 是否显示web-view，等onLoad拿到url后再渲染
      src: '' // 外部链接地址
    }
  },
  onLoad(option) {
    const url = decodeURIComponent(option.url || '') // 解码后的链接地址
    if (url) {
      this.src = url
      this.show = true
    }
  }
}
</script>

<style lang="scss"></style>
