import request from './request';

// 微信一键登录（探客工兵）
export function tankeLogin(data) {
  return request({
    url: '/wxLogin/tankeLogin',
    method: 'post',
    data,
    apiKey: 'api80',
  });
}

// 推广员申请
export function applyPromoter(data) {
  return request({
    url: '/promoter/apply',
    method: 'post',
    data,
    apiKey: 'api80'
  });
}

// 查询当前用户推广员状态/资料
export function getMyPromoterInfo(params) {
  return request({
    url: '/promoter/status',
    method: 'get',
    params,
    apiKey: 'api80'
  });
}

// 企业列表搜索（用于未注册手机号选择公司）
export function searchCompany(params) {
  return request({
    url: '/share/searchCompany',
    method: 'get',
    params,
    apiKey: 'profitapi',
  });
}

// 个人账号注册（未注册手机号选择公司后调用）
export function tankeRegister(data) {
  return request({
    url: '/oauth/tankeRegister',
    method: 'post',
    data,
    apiKey: 'api80',
  });
}

// 绑定邀请人手机号
export function bindInvite(data) {
  return request({
    url: '/tanke/bindInvite',
    method: 'post',
    data,
    apiKey: 'api80',
  });
}

// 查询是否已填写邀请码
export function getInvite() {
  return request({
    url: '/tanke/getInvite',
    method: 'post',
    apiKey: 'api80',
  });
}

// 根据经纬度查询周边企业
export function searchNearbyUsersByCompany(params) {
  return request({
    url: '/customer/searchNearbyUsersByCompany',
    method: 'get',
    params,
    apiKey: 'api80',
  });
}

// 搜索企业名称列表（用于搜索框下拉建议）
export function searchCompanyByName(params) {
  return request({
    url: '/data/searchCompanyByName',
    method: 'get',
    params,
    apiKey: 'accapi',
  });
}

// 根据企业名称查询用户列表
export function getUsersByCompanyName(params) {
  return request({
    url: '/customer/getUsersByCompanyName',
    method: 'get',
    params,
    apiKey: 'api80',
  });
}

export function getTankeUserActivityTrailList(params) {
  return request({
    url: '/data/getTankeUserActivityTrailList',
    method: 'get',
    params,
    apiKey: 'accapi',
  });
}

// 外购件记录
export function getUserExternalPartsList(params) {
  return request({
    url: '/data/getUserExternalPartsList',
    method: 'get',
    params,
    apiKey: 'accapi',
  });
}

// 标准件记录
export function getUserStandardPartsList(params) {
  return request({
    url: '/data/getUserStandardPartsList',
    method: 'get',
    params,
    apiKey: 'accapi',
  });
}

// 企业工商信息详细
export function shareCompanyInfo(params) {
  return request({
    url: '/share/companyInfo',
    method: 'get',
    params,
    apiKey: 'profitapi',
  });
}

// 获取产品分类
export function GetClassAllComposes(params) {
  return request({
    url: '/api/Class/GetClassAllComposes',
    method: 'post',
    params,
    apiKey: 'api60',
  });
}

// ==================== 设置页面相关接口 ====================

// 获取用户配置
export function getUserConfig() {
  return request({
    url: '/tanke/getConfig',
    method: 'get',
    apiKey: 'api80'
  });
}

// 保存用户配置
export function saveUserConfig(data) {
  return request({
    url: '/tanke/saveConfig',
    method: 'post',
    data,
    apiKey: 'api80'
  });
}

// ==================== 用户名片相关接口 ====================

// 获取当前用户详细信息（名片）
export function getUserMyInfo(params) {
  return request({
    url: '/user/getmyinfo',
    method: 'get',
    params,
    apiKey: 'api60',
  });
}

// 关注企业列表
export function followEnterpriseList(params) {
  return request({
    url: '/tanke/followEnterpriseList',
    method: 'get',
    params,
    apiKey: 'api80',
  });
}

// 关注用户列表
export function followUserList(params) {
  return request({
    url: '/tanke/followUserList',
    method: 'get',
    params,
    apiKey: 'api80',
  });
}

// ==================== 收藏相关接口 ====================

// 添加收藏
export function followEnterprise(params) {
  return request({
    url: '/tanke/followEnterprise',
    method: 'post',
    params,
    apiKey: 'api80'
  });
}

// 取消收藏
export function unfollowEnterprise(params) {
  return request({
    url: '/tanke/unfollowEnterprise',
    method: 'post',
    params,
    apiKey: 'api80'
  });
}

// 判断是否已收藏企业
export function isFollowEnterprise(params) {
  return request({
    url: '/tanke/isFollowEnterprise',
    method: 'get',
    params,
    apiKey: 'api80'
  });
}

// ==================== 用户关注相关接口 ====================

// 添加关注用户
export function followUser(params) {
  return request({
    url: '/tanke/followUser',
    method: 'post',
    params,
    apiKey: 'api80'
  });
}

// 取消关注用户
export function unfollowUser(params) {
  return request({
    url: '/tanke/unfollowUser',
    method: 'post',
    params,
    apiKey: 'api80'
  });
}

// 获取用户关注状态
export function isFollowUser(params) {
  return request({
    url: '/tanke/isFollowUser',
    method: 'get',
    params,
    apiKey: 'api80'
  });
}

// 获取最近联系人
export function getChatList(params) {
  return request({
    url: '/im/GetChatList',
    method: 'get',
    params,
    apiKey: 'profitapi'
  });
}

// 获取用户手机号
export function getUserPhone(params) {
  return request({
    url: '/user/getPhone',
    method: 'get',
    params,
    apiKey: 'api80'
  });
}

// 查询指定专家用户技能
export function getUserProfileInfo(params) {
  return request({
    url: '/userProfile/getUserInfo',
    method: 'get',
    params,
    apiKey: 'api80'
  });
}

// ==================== 微信支付相关接口 ====================

// 创建支付订单
export function applyMember(data) {
  return request({
    url: '/user/applyMember',
    method: 'post',
    data,
    apiKey: 'api80'
  });
}

// 查询支付订单状态
export function getMemberInfo(params) {
  return request({
    url: '/user/getMemberInfo',
    method: 'get',
    params,
    apiKey: 'api80',
    skipErrorToast: true // 后台静默调用，失败不弹 toast
  });
}

// ==================== 搜产品相关接口 ====================

// 根据产品名称搜索用户列表
export function searchUsersByProduct(params) {
  return request({
    url: '/tanke/searchUsersByProduct',
    method: 'get',
    params,
    apiKey: 'api80'
  });
}

// 添加不感兴趣用户
export function excludeUser(data) {
  return request({
    url: '/tanke/excludeUser',
    method: 'post',
    data,
    apiKey: 'api80'
  });
}

// 获取深度工商信息
export function searchEnterprise(params) {
  return request({
    url: '/tanke/searchEnterprise',
    method: 'get',
    params,
    apiKey: 'api80'
  });
}

// 查询邀请人的推广员支付信息
export function getInviterPromoterPayInfo(params) {
  return request({
    url: '/promoter/inviterPayInfo',
    method: 'get',
    params,
    apiKey: 'api80'
  });
}

// 我的客户列表
export function getMyCustomerList(params) {
  return request({
    url: '/tanke/inviteeList',
    method: 'get',
    params,
    apiKey: 'api80'
  });
}

// AI区域企业报告
export function deepseekQuery(data) {
  return request({
    url: '/tanke/deepseekQuery',
    method: 'post',
    data,
    apiKey: 'api80'
  });
}

// 我的AI报告列表
export function getAiReportList(params) {
  return request({
    url: '/tanke/aiReportList',
    method: 'get',
    params,
    apiKey: 'api80'
  });
}

// AI报告详情
export function getAiReportDetail(params) {
  return request({
    url: '/tanke/aiReportDetail',
    method: 'get',
    params,
    apiKey: 'api80'
  });
}

// ==================== 分享统计相关接口 ====================

// 获取分享标识值
export function getShareValue() {
  return request({
    url: '/tanke/getShareValue',
    method: 'get',
    apiKey: 'api80'
  });
}

// 绑定分享关系
export function bindShare(data) {
  return request({
    url: '/tanke/bindShare',
    method: 'post',
    data,
    apiKey: 'api80'
  });
}
