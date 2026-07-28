<template>
  <view class="notice-page">
    <scroll-view class="notice-scroll" scroll-y :refresher-enabled="true" :refresher-triggered="refreshing" @refresherrefresh="onRefresh" @scrolltolower="loadMore">
      <!-- 通知列表 -->
      <view v-if="noticeList.length" class="notice-list">
        <view class="notice-item" v-for="item in noticeList" :key="item.ID">
          <!-- 左侧通知图标 -->
          <view class="notice-icon-box">
            <view class="notice-icon-circle">
              <text class="notice-icon-emoji">📢</text>
            </view>
          </view>
          <!-- 右侧内容 -->
          <view class="notice-item-content">
            <view class="notice-title">
              <text v-for="(part, pIndex) in (item.TranslatedParts || [{ text: item.Tittle }])" :key="pIndex" :class="part.highlight ? 'notice-name-highlight' : 'notice-text-normal'">{{ part.text }}</text>
            </view>
            <text class="notice-time">{{ formatNoticeTime(item.NoticeDate) }}</text>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="loading" class="notice-loading">
        <text>加载中...</text>
      </view>
      <view v-else-if="!hasMore && noticeList.length" class="notice-loading">
        <text>没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && !noticeList.length" class="notice-empty">
        <image class="notice-empty-img" src="https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png" mode="aspectFit" />
        <text class="notice-empty-text">暂无团队通知</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { getGroupNoticeList, getSummary } from '../../api/index.js'

export default {
  data() {
    return {
      noticeList: [],  // 通知列表
      loading: false,  // 加载中状态
      refreshing: false,  // 下拉刷新状态
      hasMore: true,  // 是否有更多数据
      lastNoticeId: 0,  // 最后一条通知ID，用于分页
      summaryCache: {},  // 概要信息缓存 'categoryId:dataId' -> { DataTitle, DataLogo }
      myUserId: ''  // 当前用户ID
    }
  },
  onLoad() {
    const userInfo = uni.getStorageSync('userInfo') || {}
    this.myUserId = String(userInfo.UserID || '')
    this.loadNoticeList(true)
  },
  methods: {
    // ----------- 加载通知列表
    async loadNoticeList(isRefresh = false) {
      if (this.loading) return
      if (!isRefresh && !this.hasMore) return
      this.loading = true
      try {
        const noticeId = isRefresh ? 0 : this.lastNoticeId
        const res = await getGroupNoticeList({ noticeId: '-' + noticeId, pageSize: 20 })
        const resData = res.Data || res
        const list = resData.List || []
        if (isRefresh) {
          this.noticeList = list
        } else {
          this.noticeList = this.noticeList.concat(list)
        }
        this.hasMore = resData.HasMore !== undefined ? resData.HasMore : (list.length >= 20)
        if (list.length) {
          this.lastNoticeId = list[list.length - 1].ID
        }
        // 翻译每条通知中的 {U:xxx} 和 {G:xxx}
        this.translateAllNotice()
      } catch (e) {
        console.error('加载团队通知失败:', e)
      } finally {
        this.loading = false
      }
    },

    // ----------- 下拉刷新
    async onRefresh() {
      this.refreshing = true
      this.hasMore = true
      this.lastNoticeId = 0
      await this.loadNoticeList(true)
      this.refreshing = false
    },

    // ----------- 上拉加载更多
    loadMore() {
      if (!this.hasMore || this.loading) return
      this.loadNoticeList(false)
    },

    // ----------- 格式化通知时间
    formatNoticeTime(time) {
      if (!time) return ''
      const date = new Date(time)
      if (isNaN(date.getTime())) return time
      const pad = (n) => String(n).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    },

    // ----------- 翻译所有通知中的占位符
    async translateAllNotice() {
      for (let i = 0; i < this.noticeList.length; i++) {
        await this.translateNotice(this.noticeList[i], i)
      }
    },

    // ----------- 翻译单条通知中的 {U:xxx} {G:xxx} 为用户名/群名
    async translateNotice(item, index) {
      const content = item.Tittle || ''
      const regexp = /\{(U|G):(\d+)\}/gi
      const matches = content.match(regexp)
      if (!matches || !matches.length) return
      // 收集需要查询的唯一 key
      const keys = [...new Set(matches.map(m => {
        const [, type, id] = m.match(/\{(U|G):(\d+)\}/i)
        return `${type}:${id}`
      }))]
      // 查询所有未缓存的概要信息
      const summaries = {}
      await Promise.all(keys.map(async (key) => {
        if (this.summaryCache[key]) {
          summaries[key] = this.summaryCache[key]
          return
        }
        const [type, id] = key.split(':')
        const categoryId = type === 'U' ? 20 : 52
        try {
          const res = await getSummary(categoryId, id)
          const info = res.Data || res
          const title = info.ViewName || info.UserName || info.IMGroupName || info.DataTitle || id
          const logo = info.UserLogo || info.IMGroupLogo || info.DataLogo || ''
          this.summaryCache[key] = { DataTitle: title, DataLogo: logo }
          summaries[key] = this.summaryCache[key]
        } catch (e) {
          summaries[key] = { DataTitle: id, DataLogo: '' }
        }
      }))
      // 替换占位符，拆分为文本片段数组
      const parts = []
      let lastIndex = 0
      const regGlobal = /\{(U|G):(\d+)\}/gi
      let match
      while ((match = regGlobal.exec(content)) !== null) {
        // 普通文本段
        if (match.index > lastIndex) {
          parts.push({ text: content.substring(lastIndex, match.index), highlight: false })
        }
        const [, type, id] = match
        const key = `${type}:${id}`
        const summary = summaries[key] || { DataTitle: id }
        // 如果是当前用户，显示"您"
        const display = type === 'U' && id === this.myUserId ? '您' : summary.DataTitle
        parts.push({ text: ' ' + display + ' ', highlight: true })
        lastIndex = match.index + match[0].length
      }
      // 剩余普通文本
      if (lastIndex < content.length) {
        parts.push({ text: content.substring(lastIndex), highlight: false })
      }
      this.$set(this.noticeList, index, { ...item, TranslatedParts: parts })
    }
  }
}
</script>

<style scoped lang="scss">
.notice-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #ededed;
}

.notice-scroll {
  flex: 1;
  overflow: hidden;
  padding: 20rpx;
  box-sizing: border-box;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.15);
}

/* 左侧通知图标 */
.notice-icon-box {
  flex-shrink: 0;
  margin-right: 20rpx;
}

.notice-icon-circle {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #fa9d3b, #f5a623);
  display: flex;
  align-items: center;
  justify-content: center;
}

.notice-icon-emoji {
  font-size: 36rpx;
}

/* 右侧内容 */
.notice-item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.notice-title {
  font-size: 28rpx;
  line-height: 1.6;
  margin-bottom: 12rpx;
  flex-wrap: wrap;
  display: flex;
  align-items: center;
}

.notice-text-normal {
  color: #333;
  margin: 0 10rpx;
}

.notice-name-highlight {
  color: #f68f21;
  font-weight: 500;
}

.notice-time {
  font-size: 24rpx;
  color: #b0b0b0;
}

.notice-loading {
  text-align: center;
  padding: 30rpx;
  font-size: 24rpx;
  color: #c0c0c0;
}

.notice-empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 200rpx 0;
}

.notice-empty-img {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 24rpx;
  opacity: 0.4;
}

.notice-empty-text {
  font-size: 28rpx;
  color: #c0c0c0;
}
</style>
