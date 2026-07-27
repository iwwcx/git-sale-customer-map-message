<!-- 搜资源-AI助手 tab：AI智能搜索助手 -->
<template>
  <view class="search-ai-assistant">
    <view class="control-card">
      <slot name="header" />

      <!-- 搜索栏：产品名输入框 + 搜索按钮 -->
      <view class="search-row">
        <!-- 搜索输入框（中间，灰色大胶囊） -->
        <view class="search-wrap">
          <text class="search-icon">🔍</text>
          <input
            class="search-input"
            type="text"
            v-model="searchKeyword"
            placeholder="输入产品名，比如：减速机"
            placeholder-class="search-placeholder"
            confirm-type="search"
            @confirm="onSearch"
          />
          <text v-if="searchKeyword" class="clear-icon" @tap="searchKeyword = ''">×</text>
        </view>

        <!-- 搜索按钮（右侧） -->
        <view class="search-btn" @tap="onSearch">AI报告</view>
      </view>
    </view>

    <view class="content-wrap">
      <!-- 无数据时的引导页（搜索 loading 时作为背景） -->
      <view v-if="!reportSections.length" class="intro">
        <view class="insight">
          <!-- 动态渐变背景 -->
          <view class="insight-bg"></view>
          <!-- 背景网格 -->
          <view class="insight-grid"></view>
          <!-- 扫描线 -->
          <view class="insight-scan"></view>
          <!-- 浮动粒子 -->
          <view class="particle p1"></view>
          <view class="particle p2"></view>
          <view class="particle p3"></view>
          <view class="particle p4"></view>
          <view class="particle p5"></view>
          <view class="particle p6"></view>

          <!-- AI 核心 + 轨道 -->
          <view class="ai-core-wrap">
            <view class="orbit orbit-1"><view class="orbit-dot"></view></view>
            <view class="orbit orbit-2"><view class="orbit-dot orbit-dot-2"></view></view>
            <view class="radar-pulse pulse-1"></view>
            <view class="radar-pulse pulse-2"></view>
            <view class="radar-pulse pulse-3"></view>
            <view class="ai-core">
              <text class="ai-core-text">AI</text>
              <view class="ai-core-shine"></view>
            </view>
          </view>

          <!-- 标题 -->
          <view class="insight-head animate-in" style="animation-delay: 0.3s">
            <view class="insight-tag">
              <view class="tag-dot"></view>
              <text>AI · 智能分析引擎</text>
            </view>
            <text class="insight-title">智能客户分析</text>
            <view class="insight-desc-wrap">
              <text class="insight-desc">输入产品名，AI 扫描区域企业，匹配高价值目标客户并生成分阶段合作策略</text>
            </view>
          </view>

          <!-- 能力数据 -->
          <view class="insight-stats animate-in" style="animation-delay: 0.5s">
            <view class="stat-item">
              <text class="stat-num">20万<text class="stat-unit">+</text></text>
              <text class="stat-label">企业扫描</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
              <text class="stat-num">6<text class="stat-unit">维</text></text>
              <text class="stat-label">智能匹配</text>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
              <text class="stat-num">3<text class="stat-unit">级</text></text>
              <text class="stat-label">客户分级</text>
            </view>
            <!-- 闪光扫过 -->
            <view class="stats-shimmer"></view>
          </view>
        </view>

        <!-- 内容卡：能力 / 预览 / 快速分析 -->
        <view class="intro-body">
          <!-- 核心能力：科技感卡片 -->
          <view class="body-sec animate-in" style="animation-delay: 0.7s">
            <view class="sec-head">
              <view class="sec-bar"></view>
              <text class="sec-title">核心能力</text>
            </view>
            <view class="caps-tech">
              <!-- 能力 1 -->
              <view class="tech-card tech-1">
                <view class="tech-border"></view>
                <view class="tech-scan"></view>
                <view class="tech-particle tp1"></view>
                <view class="tech-particle tp2"></view>
                <view class="tech-inner">
                  <view class="tech-ico-wrap">
                    <view class="tech-ico-ring"></view>
                    <view class="tech-ico"><text class="tech-ico-txt">🎯</text></view>
                  </view>
                  <view class="tech-content">
                    <view class="tech-name-row">
                      <text class="tech-name">精准匹配</text>
                      <text class="tech-tag">CORE</text>
                    </view>
                    <text class="tech-desc">基于产品关键词，AI 智能分级目标客户</text>
                    <view class="tech-bar-wrap">
                      <view class="tech-bar-track"><view class="tech-bar-fill"></view></view>
                      <text class="tech-bar-num">98%</text>
                    </view>
                  </view>
                </view>
              </view>
              <!-- 能力 2 -->
              <view class="tech-card tech-2">
                <view class="tech-border"></view>
                <view class="tech-scan"></view>
                <view class="tech-particle tp1"></view>
                <view class="tech-particle tp2"></view>
                <view class="tech-inner">
                  <view class="tech-ico-wrap">
                    <view class="tech-ico-ring"></view>
                    <view class="tech-ico"><text class="tech-ico-txt">📊</text></view>
                  </view>
                  <view class="tech-content">
                    <view class="tech-name-row">
                      <text class="tech-name">产业洞察</text>
                      <text class="tech-tag">CORE</text>
                    </view>
                    <text class="tech-desc">识别产业集群分布，挖掘区域潜在客户</text>
                    <view class="tech-bar-wrap">
                      <view class="tech-bar-track"><view class="tech-bar-fill"></view></view>
                      <text class="tech-bar-num">95%</text>
                    </view>
                  </view>
                </view>
              </view>
              <!-- 能力 3 -->
              <view class="tech-card tech-3">
                <view class="tech-border"></view>
                <view class="tech-scan"></view>
                <view class="tech-particle tp1"></view>
                <view class="tech-particle tp2"></view>
                <view class="tech-inner">
                  <view class="tech-ico-wrap">
                    <view class="tech-ico-ring"></view>
                    <view class="tech-ico"><text class="tech-ico-txt">🤝</text></view>
                  </view>
                  <view class="tech-content">
                    <view class="tech-name-row">
                      <text class="tech-name">合作策略</text>
                      <text class="tech-tag">CORE</text>
                    </view>
                    <text class="tech-desc">生成分阶段合作方案，助力精准落地</text>
                    <view class="tech-bar-wrap">
                      <view class="tech-bar-track"><view class="tech-bar-fill"></view></view>
                      <text class="tech-bar-num">92%</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 效果预览：AI 对话气泡 -->
          <view class="body-sec animate-in" style="animation-delay: 0.9s">
            <view class="sec-head">
              <view class="sec-bar"></view>
              <text class="sec-title">效果预览</text>
              <!-- <text class="sec-hint">搜索后生成</text> -->
            </view>
            <view class="preview-chat">
              <!-- 用户提问气泡 -->
              <view class="chat-user">
                <view class="chat-user-bubble">
                  <text class="chat-user-text">帮我找「减速机」的目标客户</text>
                </view>
                <view class="chat-avatar avatar-user"><text class="avatar-txt">我</text></view>
              </view>
              <!-- AI 回复气泡 -->
              <view class="chat-ai">
                <view class="chat-avatar avatar-ai"><text class="avatar-txt">AI</text></view>
                <view class="chat-ai-bubble">
                  <view class="chat-ai-head">
                    <text class="chat-ai-name">杭州精玖标准件有限公司</text>
                    <text class="chat-ai-badge">高匹配</text>
                  </view>
                  <view class="chat-ai-body">
                    <text class="chat-ai-label">匹配理由</text>
                    <text class="chat-ai-value">包装机械制造，大量使用减速机驱动输送与旋转机构</text>
                  </view>
                  <view class="chat-ai-dots">
                    <view class="dot dot-1"></view>
                    <view class="dot dot-2"></view>
                    <view class="dot dot-3"></view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 快速分析：搜索推荐 -->
          <view class="body-sec animate-in" style="animation-delay: 1.1s">
            <view class="sec-head">
              <view class="sec-bar"></view>
              <text class="sec-title">快速分析</text>
            </view>
            <view class="quick-wrap">
              <text class="quick-hint">试试这些常用关键词 →</text>
              <view class="quick-chips">
                <view class="chip" v-for="tag in quickTags" :key="tag" @tap="onTagTap(tag)">
                  <text class="chip-icon">🔍</text>
                  <text class="chip-text">{{ tag }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 结构化报告：仪表盘概览布局 -->
      <view v-else class="dash">
        <!-- 概览头部 -->
        <view class="dash-hero animate-in" style="animation-delay: 0.3s">
          <view class="dh-bg-glow"></view>
          <view class="dh-content">
            <view class="dh-hero-top">
              <text class="dh-kw">{{ keyword || '目标产品' }}</text>
              <view class="dh-ai-badge">
                <text class="dh-ai-ico">🤖</text>
                <text class="dh-ai-txt">AI 智能分析</text>
              </view>
            </view>
            <view class="dh-grid">
              <view class="dh-grid-item dg-blue">
                <view class="dg-ico-circle"><text class="dg-ico">📍</text></view>
                <text class="dg-label">当前定位</text>
                <text class="dg-val">附近<text style="color: red;">5km</text>搜索</text>
              </view>
              <view class="dh-grid-item dg-green">
                <view class="dg-ico-circle"><text class="dg-ico">👥</text></view>
                <text class="dg-label">工程师数量</text>
                <text class="dg-val">维度筛选</text>
              </view>
              <view class="dh-grid-item dg-purple">
                <view class="dg-ico-circle"><text class="dg-ico">📥</text></view>
                <text class="dg-label">下载匹配度</text>
                <text class="dg-val">维度筛选</text>
              </view>
              <view class="dh-grid-item dg-orange">
                <view class="dg-ico-circle"><text class="dg-ico">📊</text></view>
                <text class="dg-label">下载频率</text>
                <text class="dg-val">维度筛选</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 关键指标卡 -->
        <view class="metrics animate-in" style="animation-delay: 0.5s">
          <view class="metric m-blue">
            <view class="m-info">
              <text class="m-num">{{ metrics.total }}</text>
              <text class="m-label">🏢 目标客户</text>
            </view>
          </view>
          <view class="metric m-green">
            <view class="m-info">
              <text class="m-num">{{ metrics.high }}</text>
              <text class="m-label">⭐ 高优先级</text>
            </view>
          </view>
          <view class="metric m-orange">
            <view class="m-info">
              <text class="m-num">{{ metrics.mid }}</text>
              <text class="m-label">📌 中优先级</text>
            </view>
          </view>
        </view>

        <!-- 分区面板 -->
        <view v-for="(sec, si) in reportSections" :key="si" class="panel animate-in" :class="sec.title && sec.title.includes('高') ? 'panel-high' : (sec.title && sec.title.includes('中') ? 'panel-mid' : '')" :style="{ animationDelay: (0.7 + si * 0.2) + 's' }">
          <!-- 分区标题 -->
          <view v-if="sec.title" class="panel-title">
            <view class="pt-bar"></view>
            <text v-for="(sg, gi) in hl(sec.title)" :key="gi" :class="{ 'seg-hl': sg.hl }">{{ sg.text }}</text>
          </view>

          <block v-for="(b, bi) in sec.blocks" :key="bi">
              <!-- 三级小标题 -->
              <view v-if="b.type === 'h3'" class="sub-title">
                <view class="sub-dot"></view>
                <text v-for="(sg, gi) in hl(b.text)" :key="gi" :class="{ 'seg-hl': sg.hl }">{{ sg.text }}</text>
              </view>

              <!-- 段落 -->
              <text v-else-if="b.type === 'p'" class="paragraph">
                <text v-for="(sg, gi) in hlSegs(b.segs)" :key="gi" :class="{ 'seg-bold': sg.bold, 'seg-hl': sg.hl }">{{ sg.text }}</text>
              </text>

              <!-- 无序/有序列表 -->
              <view v-else-if="b.type === 'list'" class="list">
                <view v-for="(item, ii) in b.items" :key="ii" class="list-item">
                  <view class="list-dot"></view>
                  <text class="list-text">
                    <text v-for="(sg, gi) in hlSegs(item)" :key="gi" :class="{ 'seg-bold': sg.bold, 'seg-hl': sg.hl }">{{ sg.text }}</text>
                  </text>
                </view>
              </view>

              <!-- 表格 → 匹配度排名列表 -->
              <view v-else-if="b.type === 'table'" class="rank-list">
                <view
                  v-for="(row, ri) in b.cards"
                  :key="ri"
                  class="rank-item"
                  :class="'lvl-' + row.levelKey"
                >
                  <view class="rank-line-col"></view>
                  <view class="rank-node">
                    <text class="rank-num">{{ ri + 1 }}</text>
                  </view>
                  <view class="rank-body">
                    <view class="rank-top">
                      <text class="rank-name">
                        <text v-for="(sg, gi) in hl(row.title)" :key="gi" :class="{ 'seg-hl': sg.hl }">{{ sg.text }}</text>
                      </text>
                      <view v-if="row.level" class="rank-tag" :class="'tag-' + row.levelKey">
                        <view class="tag-dot"></view>
                        <text class="tag-txt">{{ row.level }}</text>
                      </view>
                    </view>
                    <view class="rank-fields">
                      <view v-for="(f, fi) in row.fields" :key="fi" class="rank-field">
                        <text class="rf-label">{{ f.label }}</text>
                        <text class="rf-sep">·</text>
                        <text class="rf-value">
                          <text v-for="(sg, gi) in hl(f.value)" :key="gi" :class="{ 'seg-hl': sg.hl }">{{ sg.text }}</text>
                        </text>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
          </block>
        </view>
      </view>

      <!-- 仅在结果区域显示 loading -->
      <loading-overlay v-if="showLoading" class="result-loading" :visible="showLoading" text="AI正在为您出分析报告..." />
    </view>

    <!-- 会员引导蒙层：非会员点击搜索时弹出 -->
    <member-mask
      v-if="showMemberMask"
      :visible="true"
      title="会员专属"
      sub-title="开通会员后可使用AI智能分析功能"
      btn-text="去开通"
      navigate-url="/pages/common/pay/pay"
      @close="onCloseMemberMask"
    />
  </view>
</template>

<script>
import { deepseekQuery, getUserConfig } from '@/static/api/index.js'
import { mixinCheckIsMember } from '@/common/utils/member.js'
import MemberMask from '@/common/components/member-mask.vue'

export default {
  name: 'SearchAiAssistant',
  components: { MemberMask },
  data() {
    return {
      reportSections: [], // 解析后的报告分区数据
      showLoading: false,
      searchKeyword: '', // 产品名搜索关键词
      keyword: "",
      showMemberMask: false, // 非会员点击搜索时弹出会员引导蒙层
      quickTags: ['减速机', '电缸', '模组', '导轨', '铝型材', '电机', '气动', '液压', '五金件'] // 快捷关键词列表
    }
  },
  computed: {
    // ----------- 从报告里实时统计指标：目标客户总数 / 高匹配 / 中匹配
    metrics() {
      let total = 0 // 目标客户总数
      let high = 0 // 高匹配数量
      let mid = 0 // 中匹配数量
      this.reportSections.forEach(sec => {
        sec.blocks.forEach(b => {
          if (b.type === 'table' && b.cards) {
            b.cards.forEach(c => {
              total++
              if (c.levelKey === 'high') high++
              else if (c.levelKey === 'mid') mid++
            })
          }
        })
      })
      return { total, high, mid }
    }
  },
  methods: {
    // ----------- 点击搜索/回车：用输入的产品名重新生成报告
    onSearch() {
      const kw = (this.searchKeyword || '').trim()
      if (!kw) {
        uni.showToast({ title: '请输入产品名', icon: 'none' })
        return
      }
      // 非会员弹出会员引导蒙层，不执行搜索
      if (!mixinCheckIsMember()) {
        this.showMemberMask = true
        return
      }
      this.keyword = this.searchKeyword
      this.fetchAiData([kw]) // 用输入的产品名作为感兴趣产品
    },

    // ----------- 点击热门产品标签：填入并直接搜索
    onTagTap(tag) {
      // 非会员弹出会员引导蒙层，不执行搜索
      if (!mixinCheckIsMember()) {
        this.showMemberMask = true
        return
      }
      this.searchKeyword = tag
      this.keyword = tag
      this.fetchAiData([tag])
    },

    // ----------- 关闭会员引导蒙层
    onCloseMemberMask() {
      this.showMemberMask = false
    },
    // ----------- 生成 AI 分析报告，products 为空时取用户配置的关键词
    async fetchAiData(products) {
      try {
        this.showLoading = true
        let keywords = products
        if (!keywords) {
          const resConfig = await getUserConfig()
          keywords = resConfig?.data?.productKeywords || []
        }
        const res = await deepseekQuery({
          interestedProducts: keywords,
          lat: uni.getStorageSync('myLatitude'),
          lng: uni.getStorageSync('myLongitude'),
          distance: 5000
        })
        console.log('AI原始返回:', res?.data?.report)
        const raw = res?.data?.report || ''
        this.reportSections = this.parseReport(this.cleanHtml(raw))
      } catch (e) {
        console.error('AI接口报错', e)
      } finally {
        this.showLoading = false
      }
    },

    cleanHtml(html) {
      if (!html) return ''
      let content = html

      // 1. 去掉 <!DOCTYPE ...>
      content = content.replace(/<!DOCTYPE[^>]*>/gi, '')
      // 2. 去掉 <html ...> 和 </html>
      content = content.replace(/<\/?html[^>]*>/gi, '')
      // 3. 去掉 <head>...</head>（含其中的内联样式）
      content = content.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      // 4. 去掉 <body> 和 </body> 标签本身，只留内部内容
      content = content.replace(/<body[^>]*>/gi, '')
      content = content.replace(/<\/?body[^>]*>/gi, '')

      return content.trim()
    },

    // ----------- 把清洗后的 HTML 解析为分区数据：每个 h2 开启一个新分区
    parseReport(html) {
      if (!html) return []
      const flat = this.parseBlocks(html) // 先解析成扁平块
      const sections = [] // 最终分区数组
      let cur = null
      flat.forEach(b => {
        if (b.type === 'h1' || b.type === 'h2') {
          cur = { title: b.text, blocks: [] }
          sections.push(cur)
        } else {
          if (!cur) {
            cur = { title: '', blocks: [] }
            sections.push(cur)
          }
          cur.blocks.push(b)
        }
      })
      return sections
    },

    // ----------- 把 HTML 顶层标签逐个解析为块对象
    parseBlocks(html) {
      const blocks = []
      const tagReg = /<(h1|h2|h3|p|ul|ol|table)\b[^>]*>([\s\S]*?)<\/\1>/gi
      let m
      while ((m = tagReg.exec(html))) {
        const tag = m[1].toLowerCase()
        const inner = m[2]
        if (tag === 'ul' || tag === 'ol') {
          // 列表：每个 li 解析为「行内片段数组」
          const items = []
          const liReg = /<li\b[^>]*>([\s\S]*?)<\/li>/gi
          let lm
          while ((lm = liReg.exec(inner))) items.push(this.parseInline(lm[1]))
          blocks.push({ type: 'list', items })
        } else if (tag === 'table') {
          // 表格：解析后转为匹配度卡片
          blocks.push({ type: 'table', cards: this.buildCards(inner) })
        } else if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
          blocks.push({ type: tag, text: this.decode(this.stripTags(inner)) })
        } else {
          blocks.push({ type: 'p', segs: this.parseInline(inner) })
        }
      }
      return blocks
    },

    // ----------- 把表格 HTML 解析为卡片数组
    buildCards(html) {
      // 表头
      const headers = []
      const thReg = /<th\b[^>]*>([\s\S]*?)<\/th>/gi
      let hm
      while ((hm = thReg.exec(html))) headers.push(this.decode(this.stripTags(hm[1])))
      // 数据行（只含 td 的行）
      const levelKeyMap = { 高: 'high', 中: 'mid', 低: 'low' }
      const cards = []
      const trReg = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi
      let tm
      while ((tm = trReg.exec(html))) {
        const cells = []
        const tdReg = /<td\b[^>]*>([\s\S]*?)<\/td>/gi
        let dm
        while ((dm = tdReg.exec(tm[1]))) cells.push(this.decode(this.stripTags(dm[1])))
        if (!cells.length) continue
        const card = { title: cells[0] || '', level: '', levelKey: 'none', fields: [] }
        for (let i = 1; i < cells.length; i++) {
          const val = cells[i]
          if (levelKeyMap[val]) {
            // 命中匹配度 → 作为徽章
            card.level = val
            card.levelKey = levelKeyMap[val]
          } else {
            card.fields.push({ label: headers[i] || '', value: val })
          }
        }
        cards.push(card)
      }
      return cards
    },

    // ----------- 把行内 HTML 拆成片段数组，保留 <strong> 加粗
    parseInline(html) {
      const segs = []
      const s = html.replace(/<br\s*\/?>/gi, '\n')
      const strongReg = /<strong\b[^>]*>([\s\S]*?)<\/strong>|<b\b[^>]*>([\s\S]*?)<\/b>/gi
      let last = 0
      let m
      while ((m = strongReg.exec(s))) {
        if (m.index > last) segs.push({ text: this.decode(this.stripTags(s.slice(last, m.index))), bold: false })
        segs.push({ text: this.decode(this.stripTags(m[1] || m[2] || '')), bold: true })
        last = strongReg.lastIndex
      }
      if (last < s.length) segs.push({ text: this.decode(this.stripTags(s.slice(last))), bold: false })
      return segs.filter(x => x.text)
    },

    // ----------- 去掉所有 HTML 标签
    stripTags(str) {
      return (str || '').replace(/<[^>]+>/g, '').trim()
    },

    // ----------- HTML 实体反转义
    decode(str) {
      return (str || '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
    },

    // ----------- 把纯文本按搜索关键词分割成片段数组，匹配部分标记 hl: true
    hl(text) {
      if (!text || !this.searchKeyword) return [{ text, hl: false }]
      const kw = this.searchKeyword.trim()
      if (!kw) return [{ text, hl: false }]
      const result = []
      const reg = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      let last = 0
      let m
      while ((m = reg.exec(text))) {
        if (m.index > last) result.push({ text: text.slice(last, m.index), hl: false })
        result.push({ text: m[0], hl: true })
        last = reg.lastIndex
      }
      if (last < text.length) result.push({ text: text.slice(last), hl: false })
      return result.length ? result : [{ text, hl: false }]
    },

    // ----------- 对已有的 segs 数组再做关键词高亮分割
    hlSegs(segs) {
      if (!segs || !segs.length) return segs
      const result = []
      segs.forEach(sg => {
        const parts = this.hl(sg.text)
        parts.forEach(p => {
          result.push({ text: p.text, bold: sg.bold, hl: p.hl })
        })
      })
      return result
    }
  }
}
</script>

<style lang="scss" scoped>
$primary: #3b6cff;
$ink: #1a2b4a;
$muted: #6b7896;

.search-ai-assistant {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #eef2fb 0%, #f5f7fc 240rpx, #f5f7fc 100%);
  padding-bottom: 40rpx;
  box-sizing: border-box;
}

.control-card {
  position: sticky;
  top: 12rpx;
  z-index: 10;
  margin: 0 24rpx 22rpx;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20rpx);
  border-radius: 28rpx;
  box-shadow: 0 8rpx 26rpx rgba(20, 45, 90, 0.06);
  border: 1rpx solid rgba(255, 255, 255, 0.6);
}

/* 搜索行：产品名搜索框 + 搜索按钮 */
.search-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-top: 22rpx;

  // 搜索输入框（中间灰色大胶囊，占主要宽度）
  .search-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10rpx;
    height: 72rpx;
    padding: 0 24rpx;
    background: #f6f8fb;
    border-radius: 36rpx;

    .search-icon {
      font-size: 24rpx;
      color: #2f73ff;
    }

    .search-input {
      flex: 1;
      font-size: 26rpx;
      color: #333;
      height: 72rpx;
      line-height: 72rpx;
    }

    .search-placeholder {
      color: #bbb;
      font-size: 26rpx;
    }

    .clear-icon {
      font-size: 36rpx;
      color: #999;
      line-height: 1;
      padding: 0 8rpx;
    }
  }

  // 搜索按钮（右侧蓝色）
  .search-btn {
    flex-shrink: 0;
    height: 60rpx;
    line-height: 60rpx;
    padding: 0 32rpx;
    background: linear-gradient(135deg, #2f73ff 0%, #1c5ee6 100%);
    border-radius: 12rpx;
    font-size: 24rpx;
    font-weight: 600;
    color: #fff;
    text-align: center;
    box-shadow: 0 4rpx 16rpx rgba(47, 115, 255, 0.25);
  }
}

.content-wrap {
  position: relative;
  margin: 0 24rpx;
  min-height: 200rpx;

  .result-loading {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 5;
    border-radius: 28rpx;
  }
}

/* 未搜索引导页 */
.intro {
  padding-top: 8rpx;
}

/* 入场动画基类 */
.animate-in {
  animation: fadeInUp 0.7s ease-out both;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40rpx); }
  to { opacity: 1; transform: translateY(0); }
}

/* AI 引导主视觉卡 */
.insight {
  position: relative;
  overflow: hidden;
  padding: 60rpx 44rpx 48rpx;
  border-radius: 32rpx;
  background: linear-gradient(180deg, #eaf1ff 0%, #f7faff 100%);
  box-shadow: 0 16rpx 40rpx rgba(45, 80, 200, 0.1);
  border: 1rpx solid rgba(120, 160, 255, 0.18);

  /* 动态渐变背景 */
  .insight-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(99, 140, 255, 0.08) 0%, rgba(180, 200, 255, 0.04) 50%, rgba(99, 140, 255, 0.08) 100%);
    background-size: 200% 200%;
    animation: gradientShift 6s ease-in-out infinite;
  }

  /* 背景网格 */
  .insight-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(99, 140, 255, 0.06) 1rpx, transparent 1rpx),
      linear-gradient(90deg, rgba(99, 140, 255, 0.06) 1rpx, transparent 1rpx);
    background-size: 56rpx 56rpx;
    opacity: 0.9;
    animation: gridMove 8s linear infinite;
  }

  /* 扫描线 */
  .insight-scan {
    position: absolute;
    left: 0;
    right: 0;
    height: 2rpx;
    background: linear-gradient(90deg, transparent, rgba(99, 140, 255, 0.5), transparent);
    animation: scanLine 4s ease-in-out infinite;
  }
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes gridMove {
  from { background-position: 0 0; }
  to { background-position: 56rpx 56rpx; }
}

@keyframes scanLine {
  0% { top: 0; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

/* 浮动粒子 */
.particle {
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: rgba(99, 140, 255, 0.6);
  animation: floatParticle 6s ease-in-out infinite;
}
.p1 { top: 15%; left: 12%; animation-delay: 0s; }
.p2 { top: 25%; right: 15%; animation-delay: 1s; width: 6rpx; height: 6rpx; }
.p3 { top: 55%; left: 8%; animation-delay: 2s; width: 10rpx; height: 10rpx; }
.p4 { top: 70%; right: 10%; animation-delay: 1.5s; }
.p5 { top: 40%; right: 22%; animation-delay: 3s; width: 5rpx; height: 5rpx; }
.p6 { top: 80%; left: 25%; animation-delay: 2.5s; width: 7rpx; height: 7rpx; }

@keyframes floatParticle {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
  50% { transform: translateY(-30rpx) scale(1.3); opacity: 1; }
}

/* AI 核心 + 轨道 */
.ai-core-wrap {
  position: relative;
  width: 240rpx;
  height: 240rpx;
  margin: 6rpx auto 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 轨道环 */
.orbit {
  position: absolute;
  border-radius: 50%;
  border: 1rpx solid rgba(99, 140, 255, 0.2);
}
.orbit-1 {
  width: 240rpx;
  height: 240rpx;
  animation: spin 8s linear infinite;
}
.orbit-2 {
  width: 160rpx;
  height: 160rpx;
  border-color: rgba(99, 140, 255, 0.3);
  animation: spin 5s linear infinite reverse;
}

/* 轨道上的点 */
.orbit-dot {
  position: absolute;
  top: -5rpx;
  left: 50%;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #5b8cff;
  box-shadow: 0 0 12rpx rgba(91, 140, 255, 0.8);
  margin-left: -5rpx;
}
.orbit-dot-2 {
  background: #4fd1c5;
  box-shadow: 0 0 12rpx rgba(79, 209, 197, 0.8);
  width: 8rpx;
  height: 8rpx;
  top: -4rpx;
  margin-left: -4rpx;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 扩散脉冲 */
.radar-pulse {
  position: absolute;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(96, 165, 255, 0.5);
  animation: radarPulse 2.8s ease-out infinite;
}
.pulse-1 { animation-delay: 0s; }
.pulse-2 { animation-delay: 0.9s; }
.pulse-3 { animation-delay: 1.8s; }

@keyframes radarPulse {
  0% { transform: scale(1); opacity: 0.7; }
  100% { transform: scale(2.4); opacity: 0; }
}

/* AI 发光核心 */
.ai-core {
  position: relative;
  z-index: 2;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #5e9bff 0%, #3b6cff 100%);
  box-shadow: 0 0 28rpx rgba(78, 140, 255, 0.8), inset 0 0 12rpx rgba(255, 255, 255, 0.4);
  animation: corePulse 2.5s ease-in-out infinite;
  overflow: hidden;

  .ai-core-text {
    font-size: 36rpx;
    font-weight: 700;
    color: #fff;
    z-index: 2;
  }

  /* 核心高光扫过 */
  .ai-core-shine {
    position: absolute;
    top: -50%;
    left: -30%;
    width: 60%;
    height: 200%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transform: rotate(25deg);
    animation: coreShine 3s ease-in-out infinite;
  }
}

@keyframes corePulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 28rpx rgba(78, 140, 255, 0.8), inset 0 0 12rpx rgba(255, 255, 255, 0.4); }
  50% { transform: scale(1.08); box-shadow: 0 0 40rpx rgba(78, 140, 255, 1), inset 0 0 16rpx rgba(255, 255, 255, 0.6); }
}

@keyframes coreShine {
  0%, 100% { left: -30%; }
  50% { left: 120%; }
}

/* 标题区 */
.insight-head {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  .insight-tag {
    display: flex;
    align-items: center;
    font-size: 22rpx;
    color: #3b6cff;
    padding: 8rpx 24rpx;
    border-radius: 24rpx;
    background: rgba(99, 140, 255, 0.1);
    border: 1rpx solid rgba(99, 140, 255, 0.22);
    margin-bottom: 24rpx;

    .tag-dot {
      width: 10rpx;
      height: 10rpx;
      border-radius: 50%;
      background: #3b6cff;
      margin-right: 10rpx;
      animation: tagDotBlink 1.5s ease-in-out infinite;
    }
  }

  .insight-title {
    font-size: 44rpx;
    font-weight: 700;
    color: $ink;
    margin-bottom: 18rpx;
    animation: titleGlow 3s ease-in-out infinite;
  }

  .insight-desc-wrap {
    display: flex;
    align-items: flex-start;
    justify-content: center;

    .insight-desc {
      font-size: 25rpx;
      line-height: 1.8;
      color: $muted;
      padding: 0 10rpx;
    }

    .typing-cursor {
      font-size: 25rpx;
      color: #3b6cff;
      font-weight: 600;
      animation: cursorBlink 0.8s step-end infinite;
      line-height: 1.8;
    }
  }
}

@keyframes tagDotBlink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.8); }
}

@keyframes titleGlow {
  0%, 100% { text-shadow: 0 0 0 transparent; }
  50% { text-shadow: 0 0 20rpx rgba(59, 108, 255, 0.3); }
}

@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* 能力数据 */
.insight-stats {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 44rpx;
  padding: 30rpx 0;
  border-radius: 24rpx;
  background: rgba(99, 140, 255, 0.05);
  border: 1rpx solid rgba(99, 140, 255, 0.14);
  overflow: hidden;

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;

    .stat-num {
      font-size: 46rpx;
      font-weight: 700;
      color: #3b6cff;
      line-height: 1;
      animation: numPop 0.6s ease-out both;
      animation-delay: 0.6s;

      .stat-unit {
        font-size: 24rpx;
        font-weight: 600;
        color: #6c9bff;
        margin-left: 2rpx;
      }
    }

    .stat-label {
      margin-top: 12rpx;
      font-size: 23rpx;
      color: $muted;
    }
  }

  .stat-divider {
    width: 1rpx;
    height: 56rpx;
    background: rgba(99, 140, 255, 0.18);
  }

  /* 闪光扫过 */
  .stats-shimmer {
    position: absolute;
    top: 0;
    left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(99, 140, 255, 0.12), transparent);
    animation: shimmerSweep 4s ease-in-out infinite;
    animation-delay: 1.5s;
  }
}

@keyframes numPop {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes shimmerSweep {
  0% { left: -100%; }
  100% { left: 200%; }
}

/* 内容卡 */
.intro-body {
  margin-top: 24rpx;
  padding: 14rpx 30rpx 30rpx;
  border-radius: 28rpx;
  background: #fff;
  box-shadow: 0 10rpx 30rpx rgba(20, 45, 90, 0.05);
}

/* 分区小标题 */
.body-sec {
  margin-top: 28rpx;

  &:first-child {
    margin-top: 14rpx;
  }

  .sec-head {
    display: flex;
    align-items: center;
    margin-bottom: 22rpx;

    .sec-bar {
      width: 8rpx;
      height: 28rpx;
      border-radius: 6rpx;
      margin-right: 16rpx;
      background: linear-gradient(180deg, #5b8cff, #3b6cff);
    }

    .sec-title {
      font-size: 28rpx;
      font-weight: 700;
      color: $ink;
    }

    .sec-hint {
      margin-left: auto;
      font-size: 22rpx;
      color: #3b6cff;
      padding: 4rpx 18rpx;
      border-radius: 20rpx;
      background: rgba(99, 140, 255, 0.1);
    }
  }
}

/* 核心能力：科技感卡片 */
.caps-tech {
  display: flex;
  flex-direction: column;

  .tech-card {
    position: relative;
    margin-bottom: 20rpx;
    border-radius: 24rpx;
    overflow: hidden;
    animation: techCardIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;

    &:nth-child(1) { animation-delay: 0.8s; }
    &:nth-child(2) { animation-delay: 0.95s; }
    &:nth-child(3) { animation-delay: 1.1s; }

    /* 霓虹光边框 */
    .tech-border {
      position: absolute;
      inset: 0;
      border-radius: 24rpx;
      padding: 1rpx;
      background: linear-gradient(135deg, var(--tech-color, #3b6cff), transparent 40%, transparent 60%, var(--tech-color, #3b6cff));
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      animation: borderFlow 4s linear infinite;
      opacity: 0.6;
    }

    /* 光线扫过 */
    .tech-scan {
      position: absolute;
      top: 0;
      left: -100%;
      width: 60%;
      height: 100%;
      background: linear-gradient(90deg, transparent, var(--tech-glow, rgba(59, 108, 255, 0.15)), transparent);
      animation: techScan 4s ease-in-out infinite;
    }

    /* 粒子 */
    .tech-particle {
      position: absolute;
      width: 6rpx;
      height: 6rpx;
      border-radius: 50%;
      background: var(--tech-color, #3b6cff);
      animation: techParticle 5s ease-in-out infinite;
    }
    .tp1 { top: 20%; right: 15%; animation-delay: 0s; }
    .tp2 { bottom: 25%; right: 30%; animation-delay: 2s; width: 4rpx; height: 4rpx; }

    /* 内部内容 */
    .tech-inner {
      position: relative;
      display: flex;
      align-items: center;
      padding: 30rpx 28rpx;
      background: linear-gradient(135deg, #f0f5ff 0%, #ffffff 50%, #f5f8ff 100%);
    }

    /* 图标容器 */
    .tech-ico-wrap {
      flex-shrink: 0;
      position: relative;
      width: 88rpx;
      height: 88rpx;
      margin-right: 26rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      /* 外圈旋转环 */
      .tech-ico-ring {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 2rpx dashed var(--tech-color, #3b6cff);
        opacity: 0.3;
        animation: ringSpin 6s linear infinite;
      }

      /* 图标核心 */
      .tech-ico {
        width: 64rpx;
        height: 64rpx;
        border-radius: 18rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--tech-color, #3b6cff), var(--tech-color-dark, #1c5ee6));
        box-shadow: 0 0 20rpx var(--tech-glow, rgba(59, 108, 255, 0.5));
        animation: icoPulse 2.5s ease-in-out infinite;

        .tech-ico-txt {
          font-size: 32rpx;
          font-weight: 700;
          color: #fff;
        }
      }
    }

    /* 文字内容 */
    .tech-content {
      flex: 1;
      min-width: 0;

      .tech-name-row {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx;

        .tech-name {
          font-size: 30rpx;
          font-weight: 700;
          color: $ink;
          margin-right: 14rpx;
        }

        .tech-tag {
          font-size: 18rpx;
          font-weight: 600;
          color: var(--tech-color, #3b6cff);
          padding: 2rpx 12rpx;
          border-radius: 8rpx;
          background: var(--tech-glow, rgba(59, 108, 255, 0.15));
        }
      }

      .tech-desc {
        font-size: 22rpx;
        color: $muted;
        line-height: 1.5;
        margin-bottom: 14rpx;
      }

      /* 能力进度条 */
      .tech-bar-wrap {
        display: flex;
        align-items: center;

        .tech-bar-track {
          flex: 1;
          height: 6rpx;
          border-radius: 3rpx;
          background: rgba(99, 140, 255, 0.1);
          overflow: hidden;
          margin-right: 14rpx;

          .tech-bar-fill {
            height: 100%;
            border-radius: 3rpx;
            background: linear-gradient(90deg, var(--tech-color, #3b6cff), var(--tech-color-light, #6c9bff));
            box-shadow: 0 0 8rpx var(--tech-glow, rgba(59, 108, 255, 0.5));
            animation: barFill 1.5s ease-out both;
            animation-delay: 1.3s;
            transform-origin: left;
          }
        }

        .tech-bar-num {
          flex-shrink: 0;
          font-size: 22rpx;
          font-weight: 700;
          color: var(--tech-color, #3b6cff);
        }
      }
    }
  }

  /* 三张卡片各自配色 */
  .tech-1 {
    --tech-color: #4d8dff;
    --tech-color-dark: #1c5ee6;
    --tech-color-light: #8ab8ff;
    --tech-glow: rgba(59, 108, 255, 0.4);

    .tech-bar-fill { width: 98%; }
  }
  .tech-2 {
    --tech-color: #34d399;
    --tech-color-dark: #059669;
    --tech-color-light: #6ee7b7;
    --tech-glow: rgba(52, 211, 153, 0.4);

    .tech-bar-fill { width: 95%; }
  }
  .tech-3 {
    --tech-color: #fbbf24;
    --tech-color-dark: #d97706;
    --tech-color-light: #fcd34d;
    --tech-glow: rgba(251, 191, 36, 0.4);

    .tech-bar-fill { width: 92%; }
  }
}

@keyframes techCardIn {
  from { opacity: 0; transform: translateY(30rpx) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes borderFlow {
  from { background-position: 0% 0%; }
  to { background-position: 200% 0%; }
}

@keyframes techScan {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}

@keyframes techParticle {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
  50% { transform: translateY(-20rpx) scale(1.5); opacity: 0.9; }
}

@keyframes ringSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes icoPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 20rpx var(--tech-glow, rgba(59, 108, 255, 0.5)); }
  50% { transform: scale(1.06); box-shadow: 0 0 32rpx var(--tech-glow, rgba(59, 108, 255, 0.8)); }
}

@keyframes barFill {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* 效果预览：AI 对话气泡 */
.preview-chat {
  padding: 8rpx 0;

  .chat-user {
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    margin-bottom: 24rpx;
    animation: chatUserIn 0.5s ease-out both;
    animation-delay: 1s;

    .chat-user-bubble {
      max-width: 440rpx;
      padding: 18rpx 26rpx;
      border-radius: 24rpx 24rpx 6rpx 24rpx;
      background: linear-gradient(135deg, #3b6cff, #2f73ff);
      box-shadow: 0 8rpx 20rpx rgba(59, 108, 255, 0.2);

      .chat-user-text {
        font-size: 26rpx;
        color: #fff;
        line-height: 1.5;
      }
    }

    .chat-avatar {
      flex-shrink: 0;
      width: 56rpx;
      height: 56rpx;
      border-radius: 50%;
      margin-left: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e0e8ff, #c8d4f8);

      .avatar-txt {
        font-size: 24rpx;
        font-weight: 700;
        color: #3b6cff;
      }
    }
  }

  .chat-ai {
    display: flex;
    align-items: flex-start;
    animation: chatAiIn 0.5s ease-out both;
    animation-delay: 1.3s;

    .chat-avatar {
      flex-shrink: 0;
      width: 56rpx;
      height: 56rpx;
      border-radius: 50%;
      margin-right: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #5e9bff, #3b6cff);
      box-shadow: 0 4rpx 16rpx rgba(59, 108, 255, 0.3);

      .avatar-txt {
        font-size: 22rpx;
        font-weight: 700;
        color: #fff;
      }
    }

    .chat-ai-bubble {
      flex: 1;
      padding: 22rpx 26rpx;
      border-radius: 6rpx 24rpx 24rpx 24rpx;
      background: #fff;
      border: 1rpx solid rgba(99, 140, 255, 0.12);
      box-shadow: 0 8rpx 20rpx rgba(20, 45, 90, 0.06);

      .chat-ai-head {
        display: flex;
        align-items: center;
        margin-bottom: 14rpx;

        .chat-ai-name {
          flex: 1;
          font-size: 27rpx;
          font-weight: 700;
          color: $ink;
        }

        .chat-ai-badge {
          flex-shrink: 0;
          padding: 4rpx 18rpx;
          border-radius: 20rpx;
          font-size: 21rpx;
          font-weight: 600;
          color: #1f9254;
          background: rgba(52, 211, 154, 0.16);
          animation: badgePulse 2s ease-in-out infinite;
        }
      }

      .chat-ai-body {
        display: flex;
        flex-direction: column;

        .chat-ai-label {
          font-size: 22rpx;
          color: #3b6cff;
          margin-bottom: 6rpx;
        }

        .chat-ai-value {
          font-size: 24rpx;
          line-height: 1.6;
          color: $muted;
        }
      }

      .chat-ai-dots {
        display: flex;
        align-items: center;
        margin-top: 16rpx;
        gap: 8rpx;

        .dot {
          width: 10rpx;
          height: 10rpx;
          border-radius: 50%;
          background: rgba(99, 140, 255, 0.4);
          animation: dotBounce 1.4s ease-in-out infinite;
        }
        .dot-1 { animation-delay: 0s; }
        .dot-2 { animation-delay: 0.2s; }
        .dot-3 { animation-delay: 0.4s; }
      }
    }
  }
}

@keyframes chatUserIn {
  from { opacity: 0; transform: translateX(30rpx); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes chatAiIn {
  from { opacity: 0; transform: translateX(-30rpx); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1.2); opacity: 1; }
}

/* 快速分析：搜索推荐 */
.quick-wrap {
  .quick-hint {
    display: block;
    font-size: 24rpx;
    color: $muted;
    margin-bottom: 20rpx;
  }

  .quick-chips {
    display: flex;
    flex-wrap: wrap;

    .chip {
      display: flex;
      align-items: center;
      padding: 8rpx 20rpx;
      margin: 0 14rpx 14rpx 0;
      border-radius: 36rpx;
      background: linear-gradient(135deg, #f2f6ff, #eaf0ff);
      border: 1rpx solid rgba(99, 140, 255, 0.18);
      animation: chipIn 0.5s ease-out both;
      transition: transform 0.2s;

      &:active {
        transform: scale(0.95);
      }

      .chip-icon {
        font-size: 20rpx;
        margin-right: 8rpx;
        opacity: 0.6;
      }

      .chip-text {
        font-size: 24rpx;
        color: #3b6cff;
        font-weight: 500;
      }
    }

    .chip:nth-child(1) { animation-delay: 1.2s; }
    .chip:nth-child(2) { animation-delay: 1.3s; }
    .chip:nth-child(3) { animation-delay: 1.4s; }
    .chip:nth-child(4) { animation-delay: 1.5s; }
    .chip:nth-child(5) { animation-delay: 1.6s; }
  }
}

@keyframes chipIn {
  from { opacity: 0; transform: scale(0.7) translateY(10rpx); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

/* 仪表盘布局 */
.dash {
  padding-top: 8rpx;
}

/* 概览头部 */
.dash-hero {
  position: relative;
  border-radius: 24rpx;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f4ff 0%, #e6ecfa 50%, #eef3ff 100%);
  border: 1rpx solid rgba(59, 108, 255, 0.1);
  box-shadow: 0 8rpx 24rpx rgba(30, 50, 100, 0.08);

  /* 背景光晕 */
  .dh-bg-glow {
    position: absolute;
    right: -50rpx;
    top: -50rpx;
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    background: rgba(99, 140, 255, 0.15);
    filter: blur(36rpx);
    animation: glowBreath 4s ease-in-out infinite;
  }

  .dh-content {
    position: relative;
    padding: 28rpx 26rpx 24rpx;
  }

  /* 顶部：关键词 + AI徽章 */
  .dh-hero-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 22rpx;

    .dh-kw {
      font-size: 34rpx;
      font-weight: 800;
      color: #e53e3e;
      line-height: 1.2;
    }

    .dh-ai-badge {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      padding: 7rpx 16rpx;
      border-radius: 20rpx;
      background: linear-gradient(135deg, rgba(59, 108, 255, 0.12), rgba(108, 155, 255, 0.06));
      border: 1rpx solid rgba(59, 108, 255, 0.1);

      .dh-ai-ico {
        font-size: 22rpx;
        margin-right: 7rpx;
      }

      .dh-ai-txt {
        font-size: 21rpx;
        font-weight: 600;
        color: $primary;
      }
    }
  }

  /* 四格维度网格 */
  .dh-grid {
    display: flex;
    gap: 14rpx;

    .dh-grid-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 22rpx 8rpx 18rpx;
      border-radius: 20rpx;
      background: rgba(255, 255, 255, 0.7);
      border: 1rpx solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 4rpx 16rpx rgba(30, 50, 100, 0.05), 0 1rpx 4rpx rgba(30, 50, 100, 0.03);

      /* 图标圆框 */
      .dg-ico-circle {
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10rpx;
      }

      .dg-ico {
        font-size: 24rpx;
      }

      .dg-label {
        font-size: 21rpx;
        font-weight: 600;
        color: #3b5a8a;
        margin-bottom: 4rpx;
      }

      .dg-val {
        font-size: 19rpx;
        color: $muted;
      }
    }

    /* 主题色 */
    .dg-blue {
      .dg-ico-circle { background: linear-gradient(135deg, rgba(59, 108, 255, 0.15), rgba(108, 155, 255, 0.08)); border: 1rpx solid rgba(59, 108, 255, 0.1); }
    }
    .dg-green {
      .dg-ico-circle { background: linear-gradient(135deg, rgba(52, 211, 154, 0.15), rgba(31, 146, 84, 0.08)); border: 1rpx solid rgba(52, 211, 154, 0.1); }
    }
    .dg-purple {
      .dg-ico-circle { background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 139, 250, 0.08)); border: 1rpx solid rgba(139, 92, 246, 0.1); }
    }
    .dg-orange {
      .dg-ico-circle { background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(255, 182, 72, 0.08)); border: 1rpx solid rgba(245, 158, 11, 0.1); }
    }
  }
}

/* 关键指标卡 */
.metrics {
  display: flex;
  margin: 22rpx 0 24rpx;

  .metric {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24rpx 20rpx;
    margin-right: 18rpx;
    border-radius: 24rpx;
    background: #fff;
    box-shadow: 0 10rpx 26rpx rgba(20, 45, 90, 0.06);
    border: 1rpx solid rgba(59, 108, 255, 0.05);
    position: relative;
    overflow: hidden;

    &:last-child {
      margin-right: 0;
    }

    /* 图标 */
    .m-ico {
      flex-shrink: 0;
      width: 56rpx;
      height: 56rpx;
      border-radius: 16rpx;
      margin-right: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .m-ico-txt {
        font-size: 28rpx;
      }
    }

    .m-info {
      display: flex;
      align-items: center;
      flex-direction: column;

      .m-num {
        font-size: 48rpx;
        font-weight: 800;
        line-height: 1;
      }

      .m-label {
        margin-top: 16rpx;
        font-size: 24rpx;
        color: $muted;
      }
    }
  }

  .m-blue {
    .m-ico { background: linear-gradient(135deg, rgba(108, 155, 255, 0.15), rgba(59, 108, 255, 0.08)); }
    .m-num { color: #3b6cff; }
  }
  .m-green {
    .m-ico { background: linear-gradient(135deg, rgba(52, 211, 154, 0.15), rgba(31, 146, 84, 0.08)); }
    .m-num { color: #1f9254; }
  }
  .m-orange {
    .m-ico { background: linear-gradient(135deg, rgba(255, 182, 72, 0.15), rgba(245, 134, 11, 0.08)); }
    .m-num { color: #f59e0b; }
  }
}

/* 分区面板 */
.panel {
  position: relative;
  background: linear-gradient(160deg, #ffffff 0%, #f9fbff 60%, #f5f8ff 100%);
  border-radius: 28rpx;
  padding: 32rpx 28rpx 28rpx;
  margin-bottom: 22rpx;
  box-shadow: 0 8rpx 28rpx rgba(30, 50, 100, 0.06), 0 2rpx 8rpx rgba(30, 50, 100, 0.03);
  border: 1rpx solid rgba(99, 140, 255, 0.06);
  overflow: hidden;

  /* 右上角微光 */
  &::after {
    content: '';
    position: absolute;
    right: -40rpx;
    top: -40rpx;
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    background: rgba(99, 140, 255, 0.04);
    filter: blur(30rpx);
  }

  /* 高优先级：蓝青主题 */
  &.panel-high {
    background: linear-gradient(160deg, #ffffff 0%, #f0f7ff 60%, #ecf5ff 100%);
    border-color: rgba(30, 120, 200, 0.1);

    &::after { background: rgba(30, 120, 200, 0.05); }

    .panel-title {
      .pt-bar { background: linear-gradient(180deg, #3b82c4, #1e5a96); box-shadow: 0 0 10rpx rgba(30, 120, 200, 0.25); }
      border-bottom-color: rgba(30, 120, 200, 0.06);
    }

    .sub-title {
      background: linear-gradient(135deg, rgba(30, 120, 200, 0.07), rgba(30, 90, 150, 0.03));
      border-color: rgba(30, 120, 200, 0.05);

      .sub-dot { background: linear-gradient(135deg, #3b82c4, #1e5a96); box-shadow: 0 0 8rpx rgba(30, 120, 200, 0.25); }
    }

    .list-item {
      background: linear-gradient(135deg, rgba(30, 120, 200, 0.03), rgba(30, 90, 150, 0.01));
      border-color: rgba(30, 120, 200, 0.04);

      .list-dot { background: linear-gradient(135deg, #3b82c4, #1e5a96); box-shadow: 0 0 0 5rpx rgba(30, 120, 200, 0.06); }
    }
  }

  /* 中优先级：暖琥珀主题 */
  &.panel-mid {
    background: linear-gradient(160deg, #ffffff 0%, #fef9f3 60%, #fdf6ee 100%);
    border-color: rgba(200, 130, 50, 0.1);

    &::after { background: rgba(200, 130, 50, 0.05); }

    .panel-title {
      .pt-bar { background: linear-gradient(180deg, #d4956a, #b07030); box-shadow: 0 0 10rpx rgba(200, 130, 50, 0.25); }
      border-bottom-color: rgba(200, 130, 50, 0.06);
    }

    .sub-title {
      background: linear-gradient(135deg, rgba(200, 130, 50, 0.07), rgba(180, 110, 40, 0.03));
      border-color: rgba(200, 130, 50, 0.05);

      .sub-dot { background: linear-gradient(135deg, #d4956a, #b07030); box-shadow: 0 0 8rpx rgba(200, 130, 50, 0.25); }
    }

    .list-item {
      background: linear-gradient(135deg, rgba(200, 130, 50, 0.03), rgba(180, 110, 40, 0.01));
      border-color: rgba(200, 130, 50, 0.04);

      .list-dot { background: linear-gradient(135deg, #d4956a, #b07030); box-shadow: 0 0 0 5rpx rgba(200, 130, 50, 0.06); }
    }
  }
}

/* 面板标题 */
.panel-title {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid rgba(99, 140, 255, 0.06);

  .pt-bar {
    width: 8rpx;
    height: 32rpx;
    border-radius: 6rpx;
    margin-right: 14rpx;
    background: linear-gradient(180deg, #8b5cf6, #3b6cff);
    box-shadow: 0 0 10rpx rgba(99, 140, 255, 0.3);
  }

  text {
    font-size: 32rpx;
    font-weight: 700;
    color: #1e293b;
  }

  .seg-hl {
    color: #e53e3e;
  }
}

/* 三级小标题 */
.sub-title {
  margin-top: 16rpx;
  display: inline-flex;
  align-items: center;
  padding: 10rpx 22rpx 10rpx 16rpx;
  border-radius: 12rpx;
  background: #7effdb;
  border: 1rpx solid rgba(99, 140, 255, 0.06);

  .sub-dot {
    width: 10rpx;
    height: 10rpx;
    border-radius: 50%;
    margin-right: 12rpx;
    background: linear-gradient(135deg, #8b5cf6, #3b6cff);
    box-shadow: 0 0 8rpx rgba(99, 140, 255, 0.3);
  }

  text {
    font-size: 27rpx;
    font-weight: 600;
    color: #e64141;
  }

  .seg-hl {
    color: #e53e3e;
  }
}

/* 段落 */
.paragraph {
  display: block;
  font-size: 27rpx;
  line-height: 1.9;
  color: #313131;
  margin: 14rpx 0;
  text-align: justify;

  .seg-bold {
    color: #1387ff;
    font-weight: 600;
  }

  .seg-hl {
    color: #e53e3e;
    font-weight: 700;
  }
}

/* 列表 */
.list {
  margin: 16rpx 0 4rpx;

  .list-item {
    position: relative;
    display: flex;
    align-items: flex-start;
    padding: 16rpx 8rpx 16rpx 4rpx;
    margin-bottom: 8rpx;
    border-radius: 14rpx;

    .list-dot {
      flex-shrink: 0;
      width: 10rpx;
      height: 10rpx;
      border-radius: 50%;
      margin: 14rpx 18rpx 0 0;
      background: linear-gradient(135deg, #8b5cf6, #3b6cff);
      box-shadow: 0 0 0 5rpx rgba(99, 140, 255, 0.08);
    }

    .list-text {
      flex: 1;
      font-size: 26rpx;
      line-height: 1.8;
      color: #394353;

      .seg-bold {
        color: #1387ff;
        font-weight: 600;
      }

      .seg-hl {
        color: #e53e3e;
      }
    }
  }
}

/* 匹配度排名列表 */
.rank-list {
  margin: 18rpx 0 4rpx;
  padding-left: 4rpx;
}

.rank-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 0 0 28rpx 0;

  &:last-child {
    padding-bottom: 0;

    .rank-line-col { display: none; }
  }

  /* 竖向连接线 */
  .rank-line-col {
    position: absolute;
    left: 19rpx;
    top: 44rpx;
    bottom: 0;
    width: 2rpx;
    background: linear-gradient(180deg, rgba(59, 108, 255, 0.15), rgba(59, 108, 255, 0.04));
  }

  /* 编号圆点 */
  .rank-node {
    flex-shrink: 0;
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    margin-top: 2rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f0f5ff, #e0e8f8);
    border: 2rpx solid rgba(59, 108, 255, 0.15);

    .rank-num {
      font-size: 22rpx;
      font-weight: 700;
      color: $primary;
    }
  }

  /* 内容区 */
  .rank-body {
    flex: 1;
    min-width: 0;
    position: relative;
    border-radius: 20rpx;
    padding: 24rpx 26rpx 24rpx 34rpx;
    overflow: hidden;
    background: linear-gradient(135deg, #ffffff 0%, #f8faff 50%, #f5f8ff 100%);
    border: 1rpx solid rgba(99, 140, 255, 0.08);
    box-shadow: 0 8rpx 24rpx rgba(30, 50, 100, 0.06), 0 2rpx 8rpx rgba(30, 50, 100, 0.04);
  }

  /* 卡片左侧主题色条 */
  .rank-body::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6rpx;
  }

  /* 卡片右上角主题色光晕 */
  .rank-body::after {
    content: '';
    position: absolute;
    right: -30rpx;
    top: -30rpx;
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    filter: blur(28rpx);
    opacity: 0.4;
  }

  /* 顶部：企业名 + 标签 */
  .rank-top {
    display: flex;
    align-items: center;
    margin-bottom: 14rpx;

    .rank-name {
      flex: 1;
      font-size: 28rpx;
      font-weight: 700;
      color: $ink;
      line-height: 1.4;
      margin-right: 14rpx;

      .seg-hl {
        color: #e53e3e;
      }
    }

    /* 匹配度标签 */
    .rank-tag {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      padding: 5rpx 14rpx;
      border-radius: 20rpx;

      .tag-dot {
        width: 8rpx;
        height: 8rpx;
        border-radius: 50%;
        margin-right: 7rpx;
      }

      .tag-txt {
        font-size: 21rpx;
        font-weight: 600;
      }

      &.tag-high { background: linear-gradient(135deg, rgba(52, 211, 154, 0.12), rgba(31, 146, 84, 0.08)); .tag-dot { background: #34d39a; box-shadow: 0 0 8rpx rgba(52, 211, 154, 0.5); } .tag-txt { color: #1f9254; } }
      &.tag-mid  { background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 140, 18, 0.08)); .tag-dot { background: #f59e0b; box-shadow: 0 0 8rpx rgba(245, 158, 11, 0.5); } .tag-txt { color: #d98c12; } }
      &.tag-low  { background: linear-gradient(135deg, rgba(138, 148, 166, 0.12), rgba(120, 130, 150, 0.08)); .tag-dot { background: #8a94a6; } .tag-txt { color: #8a94a6; } }
    }
  }

  /* 字段区：内联展示 */
  .rank-fields {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .rank-field {
    display: flex;
    align-items: flex-start;
    font-size: 24rpx;
    line-height: 1.6;

    .rf-label {
      flex-shrink: 0;
      color: #8a93a8;
      font-size: 23rpx;
      font-weight: 600;
    }

    .rf-sep {
      margin: 0 8rpx;
      color: #d0d6e0;
    }

    .rf-value {
      flex: 1;
      color: #3d4860;

      .seg-hl {
        color: #e53e3e;
      }
    }
  }

  /* 编号 + 卡片主题色 */
  &.lvl-high {
    .rank-node { background: linear-gradient(135deg, #d4f3e4, #a7e6c8); border-color: rgba(52, 211, 154, 0.25); box-shadow: 0 4rpx 12rpx rgba(52, 211, 154, 0.15); .rank-num { color: #1f9254; } }
    .rank-body { border-color: rgba(52, 211, 154, 0.1); background: linear-gradient(135deg, #f0fdf7 0%, #f0fdf7 100%); }
    .rank-body::before { background: linear-gradient(180deg, #34d39a, #1f9254); }
    .rank-body::after { background: rgba(52, 211, 154, 0.1); }
    .rf-label { color: #2a9d6e; }
  }
  &.lvl-mid {
    .rank-node { background: linear-gradient(135deg, #ffe9cc, #ffd9a8); border-color: rgba(245, 158, 11, 0.25); box-shadow: 0 4rpx 12rpx rgba(245, 158, 11, 0.15); .rank-num { color: #d98c12; } }
    .rank-body { border-color: rgba(245, 158, 11, 0.1); background: linear-gradient(135deg, #fffaf0 0%, #fff8ec 100%); }
    .rank-body::before { background: linear-gradient(180deg, #ffb648, #f59e0b); }
    .rank-body::after { background: rgba(245, 158, 11, 0.1); }
    .rf-label { color: #c97e10; }
  }
  &.lvl-low {
    .rank-node { background: linear-gradient(135deg, #e6e9f0, #d0d6e0); border-color: rgba(138, 148, 166, 0.25); .rank-num { color: #8a94a6; } }
    .rank-body { border-color: rgba(138, 148, 166, 0.08); }
    .rank-body::before { background: linear-gradient(180deg, #c0c8d8, #909aae); }
    .rank-body::after { background: rgba(138, 148, 166, 0.08); }
  }
  &.lvl-none {
    .rank-node { background: linear-gradient(135deg, #e0e8f8, #c8d4f8); border-color: rgba(59, 108, 255, 0.2); box-shadow: 0 4rpx 12rpx rgba(59, 108, 255, 0.12); .rank-num { color: #3b6cff; } }
    .rank-body { border-color: rgba(59, 108, 255, 0.08); }
    .rank-body::before { background: linear-gradient(180deg, #8db1ff, #3b6cff); }
    .rank-body::after { background: rgba(59, 108, 255, 0.08); }
  }
}
</style>
