<!-- 我的AI报告-详情页：复用搜资源AI助手的报告布局 -->
<template>
  <view class="report-detail">
    <view class="content-wrap">
      <!-- 加载中 -->
      <view v-if="loading" class="loading-box">
        <view class="loading-spinner"></view>
        <text class="loading-text">报告加载中...</text>
      </view>

      <!-- 结构化报告：仪表盘概览布局 -->
      <view v-else-if="reportSections.length" class="dash">
        <!-- 报告标题 -->
        <view v-if="title" class="dash-title animate-in" style="animation-delay: 0.2s">
          <text class="dt-text">🤖 {{ title }}</text>
        </view>

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

      <!-- 空状态 -->
      <view v-else class="empty-box">
        <text class="empty-text">暂无报告内容</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getAiReportDetail } from '@/static/api/index.js'

export default {
  name: 'AiReportDetail',
  data() {
    return {
      reportId: '', // 报告id
      title: '', // 报告标题
      keyword: '', // 报告关键词（同时用于高亮）
      reportSections: [], // 解析后的报告分区数据
      loading: false // 是否加载中
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
  onLoad(options) {
    this.reportId = options.id || ''
    this.fetchDetail()
  },
  methods: {
    // ----------- 获取报告详情
    async fetchDetail() {
      if (!this.reportId) {
        uni.showToast({ title: '缺少报告id', icon: 'none' })
        return
      }
      try {
        this.loading = true
        const res = await getAiReportDetail({ id: this.reportId })
        const data = res?.data || {}
        this.title = data.title || ''
        this.keyword = data.productKeywords || ''
        const raw = data.content || ''
        this.reportSections = this.parseReport(this.cleanHtml(raw))
      } catch (e) {
        console.error('AI报告详情接口报错', e)
      } finally {
        this.loading = false
      }
    },

    // ----------- 清洗 AI 返回的 HTML，去掉文档外层标签
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

    // ----------- 把纯文本按关键词分割成片段数组，匹配部分标记 hl: true
    hl(text) {
      if (!text || !this.keyword) return [{ text, hl: false }]
      const kw = this.keyword.trim()
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

page {
  background: #f5f7fc;
}

.report-detail {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #eef2fb 0%, #f5f7fc 240rpx, #f5f7fc 100%);
  padding-bottom: 40rpx;
  box-sizing: border-box;
}

.content-wrap {
  position: relative;
  margin: 0 24rpx;
  padding-top: 24rpx;
  min-height: 200rpx;
}

/* 加载中 */
.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;

  .loading-spinner {
    width: 56rpx;
    height: 56rpx;
    border: 5rpx solid #e3eaf4;
    border-top-color: #3b6cff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .loading-text {
    margin-top: 24rpx;
    font-size: 25rpx;
    color: $muted;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-box {
  padding-top: 200rpx;
  text-align: center;

  .empty-text {
    font-size: 26rpx;
    color: #9aa6b8;
  }
}

/* 入场动画基类 */
.animate-in {
  animation: fadeInUp 0.7s ease-out both;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40rpx); }
  to { opacity: 1; transform: translateY(0); }
}

/* 仪表盘布局 */
.dash {
  padding-top: 8rpx;
}

/* 报告标题 */
.dash-title {
  display: flex;
  align-items: flex-start;
  margin-bottom: 22rpx;

  .dt-bar {
    flex-shrink: 0;
    width: 8rpx;
    height: 40rpx;
    border-radius: 6rpx;
    margin: 4rpx 16rpx 0 0;
    background: linear-gradient(180deg, #5b8cff, #3b6cff);
    box-shadow: 0 0 10rpx rgba(99, 140, 255, 0.3);
  }

  .dt-text {
    flex: 1;
    font-size: 36rpx;
    font-weight: 800;
    line-height: 1.4;
    color: #5e9321;
  }
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

@keyframes glowBreath {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
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
    .m-num { color: #3b6cff; }
  }
  .m-green {
    .m-num { color: #1f9254; }
  }
  .m-orange {
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
