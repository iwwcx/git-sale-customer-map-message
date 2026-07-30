import request from './request';

// 获取聊天列表
export function getChatList(params) {
  return request({
    url: '/im/GetChatList',
    method: 'get',
    params,
    apiKey: 'profitapi'
  });
}

// 获取群成员列表
export function getGroupUserList(params) {
  return request({
    url: '/im/GroupUserList',
    method: 'get',
    params, // { groupId }
    apiKey: 'profitapi'
  });
}

// 获取团队通知列表
export function getGroupNoticeList(params) {
  return request({
    url: '/im/group/GroupNoticeList',
    method: 'get',
    params, // { noticeId, pageSize }
    apiKey: 'api60'
  });
}

// 获取用户或群组概要信息（categoryId: 20=用户, 52=群组）
export function getSummary(categoryId, dataId) {
  return request({
    url: `/data/${categoryId}/info?DataId=${dataId}`,
    method: 'get',
    apiKey: 'api60'
  });
}

// 获取聊天记录列表
export function getRecordList(params) {
  return request({
    url: '/im/GetRecordList',
    method: 'get',
    params,
    apiKey: 'api60'
  });
}

// 发送消息（客户端抄送）
export function saveRecordByClient(data) {
  return request({
    url: '/im/SaveRecordByClient',
    method: 'post',
    data,
    apiKey: 'api60'
  });
}

// 获取网易云信登录 token（IM SDK 登录用，对应 big 项目 /im/generateToken）
export function generateToken() {
  return request({
    url: '/im/generateToken',
    method: 'get',
    apiKey: 'api80'
  });
}

// 开始会话（新会话同步到服务端，对应 big 项目 /im/StartChat）
export function startChat(params) {
  return request({
    url: '/im/StartChat',
    method: 'post',
    params, // { chatCategoryId, chatDataId }
    apiKey: 'api60'
  });
}

// 清空会话未读数（对应 big 项目 /im/ResetChat）
export function resetChat(params) {
  return request({
    url: '/im/ResetChat',
    method: 'post',
    params, // { chatId, sendUserId? }
    apiKey: 'api60'
  });
}

// ----------- 获取企业产品列表
export function getCompanyProductList(params) {
  return request({
    url: '/prod/GetSList',
    method: 'get',
    params,
    apiKey: 'api60'
  });
}

// ----------- 获取企业产品目录
export function getCompanyProductDirList(params) {
  return request({
    url: '/site/comp/proddir/list',
    method: 'get',
    params,
    apiKey: 'api60'
  });
}

// ----------- 获取收藏目录
export function getCollectProductDirList(params) {
  return request({
    url: '/dir/2205/list',
    method: 'get',
    params,
    apiKey: 'api60'
  });
}

// ----------- 获取收藏产品列表
export function getCollectProductList(params) {
  return request({
    url: '/favorite/prod/list',
    method: 'get',
    params,
    apiKey: 'api60'
  });
}

// ----------- 获取产品浏览足迹
export function getBrowseProductList(params) {
  return request({
    url: '/logs/ViewProdLogsForUser',
    method: 'get',
    params,
    apiKey: 'api60'
  });
}

// ----------- 图片上传相关接口（对应 supply-chain-im 的上传流程） -----------

// 接口2：获取OBS上传签名，POST /obs/putUrlSignature?category={categoryId}&key={key}&priv={priv}
// 对应 IM 项目：DataService.post(`${ApiService.EngineerApi}/obs/putUrlSignature?category=...&key=...&priv=...`, { ContentType })
export function obsPutUrlSignature(params, data) {
  return request({
    url: '/obs/putUrlSignature',
    method: 'post',
    params, // { category, key, priv }
    data,   // { ContentType }
    apiKey: 'profitapi'
  });
}

// 接口4：保存文档信息到资料库，POST /data/110/savelife
// 对应 IM 项目：DataService.post(`${ApiService.Common}/data/${Category.Document}/savelife`, info)
// Category.Document = 110
export function saveDocumentLife(data) {
  return request({
    url: '/data/110/savelife',
    method: 'post',
    data,
    apiKey: 'api60'
  });
}

// 接口5：黑名单检查，GET /im/getIsUserBlock?blockUserId={blockUserId}
// 对应 IM 项目：DataService.get(`${ApiService.EngineerApi}/im/getIsUserBlock?blockUserId=${blockUserId}`)
export function getIsUserBlock(params) {
  return request({
    url: '/im/getIsUserBlock',
    method: 'get',
    params, // { blockUserId }
    apiKey: 'profitapi'
  });
}
