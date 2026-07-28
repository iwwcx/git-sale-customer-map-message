<template>
  <view class="group-info-page">
    <!-- 群信息头部 -->
    <view class="group-header">
      <image class="group-logo" :src="groupLogo || defaultGroupLogo" mode="aspectFill" />
      <view class="group-header-info">
        <text class="group-name">{{ groupName }}</text>
        <text class="group-member-count">共 {{ memberList.length }} 人</text>
      </view>
    </view>

    <!-- 群成员列表 -->
    <view class="member-section">
      <view class="member-section-title">
        <text class="member-section-text">群成员</text>
      </view>
      <view class="member-list">
        <view class="member-item" v-for="member in memberList" :key="member.UserID">
          <image class="member-avatar" :src="member.UserLogo || defaultAvatar" mode="aspectFill" />
          <view class="member-info">
            <text class="member-name">{{ member.UserName || member.UserNameInGroup || '未知' }}</text>
            <text v-if="member.RoleInGroup === 1" class="member-role-tag">群主</text>
            <text v-else-if="member.RoleInGroup === 2" class="member-role-tag admin">管理员</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="group-loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
import { getGroupUserList } from '../../api/index.js'
import { getProductImageUrlChat } from '@/common/utils/index.js'

export default {
  data() {
    return {
      groupId: '',  // 群ID
      groupName: '',  // 群名称
      groupLogo: '',  // 群头像
      memberList: [],  // 群成员列表
      loading: false,  // 加载中状态
      defaultAvatar: 'https://img2cdn.global-dsc.cn/dgzz_img/8520f53eeff21f5a388f30b67e54e287.png',  // 默认头像
      defaultGroupLogo: 'https://img2cdn.global-dsc.cn/dgzz_img/6ddfb1a24a56be29919936e7e6641f76.jpg'  // 默认群头像
    }
  },
  onLoad(options) {
    this.groupId = options.groupId || ''
    this.groupName = decodeURIComponent(options.name || '')
    this.groupLogo = decodeURIComponent(options.logo || '')
    uni.setNavigationBarTitle({ title: this.groupName || '群信息' })
    this.loadMembers()
  },
  methods: {
    // ----------- 加载群成员列表
    async loadMembers() {
      if (!this.groupId) return
      this.loading = true
      try {
        const res = await getGroupUserList({ groupId: this.groupId })
        const list = res.Data || res.data || []
        // 按角色排序：群主 > 管理员 > 普通成员
        this.memberList = list.sort((a, b) => {
          const roleOrder = { 1: 0, 2: 1 }
          return (roleOrder[a.RoleInGroup] || 2) - (roleOrder[b.RoleInGroup] || 2)
        }).map(item => ({
          ...item,
          UserLogo: item.UserLogo ? getProductImageUrlChat(item.UserLogo) : ''
        }))
      } catch (e) {
        console.error('加载群成员失败:', e)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped lang="scss">
.group-info-page {
  min-height: 100vh;
  background: #ededed;
}

/* 群信息头部 */
.group-header {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 30rpx 24rpx;
  margin-bottom: 20rpx;
}

.group-logo {
  width: 96rpx;
  height: 96rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  margin-right: 24rpx;
}

.group-header-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.group-name {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-member-count {
  font-size: 24rpx;
  color: #999;
}

/* 群成员列表 */
.member-section {
  background: #fff;
}

.member-section-title {
  padding: 24rpx 30rpx 12rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.member-section-text {
  font-size: 26rpx;
  color: #999;
}

.member-list {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx 15rpx;
}

.member-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6rpx 0;
}

.member-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  margin-bottom: 12rpx;
}

.member-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.member-name {
  margin: 6rpx 0;
  font-size: 26rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}

.member-role-tag {
  position: absolute;
  margin-top: -40rpx;
  margin-left: 6rpx;
  font-size: 20rpx;
  color: #fff;
  background: #fa9d3b;
  border-radius: 10rpx;
  padding: 6rpx 12rpx;
  line-height: 1.2;

  &.admin {
    background: #4cbc84;
  }
}

.group-loading {
  text-align: center;
  padding: 60rpx;
  font-size: 26rpx;
  color: #c0c0c0;
}
</style>
