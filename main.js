import App from './App'
import memberMixin from '@/common/mixins/member.js'
import shareMixin from '@/common/mixins/share.js'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
Vue.mixin(memberMixin)
Vue.mixin(shareMixin)
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  app.mixin(shareMixin)
  return {
    app
  }
}
// #endif