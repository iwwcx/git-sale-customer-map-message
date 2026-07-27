// -------------- 检查当前用户是否会员
export const mixinCheckIsMember = () => {
  const memberInfo = uni.getStorageSync('memberInfo') // 从本地缓存读取会员信息
  return !!(memberInfo && memberInfo.isMember) // 存在且 isMember 为 true 才算会员
}

// -------------- 需要会员权限时调用
// 会员返回 true，非会员弹提示并返回 false
// tipText: 提示文案，不传使用默认
// onDeny: 非会员时的回调（可选），比如跳转开通页
export const mixinRequireMember = (tipText = '该功能仅限会员使用', onDeny) => {
  if (mixinCheckIsMember()) return true // 会员直接放行
  uni.showToast({ title: tipText, icon: 'none' }) // 非会员弹 toast 提示
  if (typeof onDeny === 'function') onDeny() // 如果有回调就执行
  return false
}

// -------------- 判断是否需要显示会员横幅
// 试用会员(type === 'trial') 或 非会员 → 显示横幅
// 正常/永久/企业会员 → 不显示横幅
export const mixinShowMemberBanner = () => {
  const memberInfo = uni.getStorageSync('memberInfo') || {}
  if (!memberInfo.isMember) return true // 非会员
  return memberInfo.type === 'trial' // 试用会员也要显示横幅，正式会员不显示
}
