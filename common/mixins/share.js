import { getShareValue } from '@/static/api/index.js'

export default {
	// ----------- 转发给好友
	onShareAppMessage() {
		const basePath = '/pages/common/start/index' // 分享跳转的基础路径（首页）
		// 微信支持返回 promise 异步补充分享数据，这里先拿分享标识再拼到链接里，用于统计分享的人
		const shareImageUrl = "https://img2cdn.global-dsc.cn/dggjxcx/fenxxiang650x524.jpg" // 分享封面图
		const sharePromise = getShareValue().then((res) => {
			const shareValue = res.data && res.data.shareValue // 后端返回的分享标识值
			return {
				title: '机电零部件销售人员必备神器',
				path: shareValue ? `${basePath}?shareValue=${shareValue}` : basePath,
				imageUrl: shareImageUrl
			}
		}).catch(() => {
			// 获取分享标识失败时降级为普通分享
			return {
				title: '机电零部件销售人员必备神器',
				path: basePath,
				imageUrl: "https://img2cdn.global-dsc.cn/dggjxcx/fenxxiang650x524.jpg"
			}
		})
		return {
			title: '机电零部件销售人员必备神器',
			path: basePath,
			promise: sharePromise,
			imageUrl: "https://img2cdn.global-dsc.cn/dggjxcx/fenxxiang650x524.jpg"
		}
	},
	// ----------- 分享到朋友圈
	onShareTimeline() {
		return {
			title: '机电零部件销售人员必备神器',
			imageUrl: "https://img2cdn.global-dsc.cn/dggjxcx/fenxxiang650x524.jpg"
		}
	}
}
