import { mixinCheckIsMember, mixinRequireMember } from '@/common/utils/member.js'

// ------ 使用的话 之后所有页面都能直接 this.mixinCheckIsMember() / this.mixinRequireMember()。

// -------------- 全局会员相关 mixin
// 注入 mixinCheckIsMember / mixinRequireMember 两个方法到所有页面
// 在 main.js 中用 Vue.mixin(memberMixin) 全局挂载，或按需 import 到单个页面
export default {
  methods: {
    mixinCheckIsMember, // 判断是否是会员
    mixinRequireMember  // 需要会员时阻断并提示
  }
}
