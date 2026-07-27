<template>
  <view class="enterprise-detail-component">
    <view v-if="loading" class="loading-screen">
      <!-- 装饰光斑 -->
      <view class="loading-blob loading-blob-1"></view>
      <view class="loading-blob loading-blob-2"></view>
      <view class="loading-card">
        <!-- 顶部旋转环 + 中心脉动点 -->
        <view class="loading-ring-wrap">
          <view class="loading-ring loading-ring-1"></view>
          <view class="loading-ring loading-ring-2"></view>
          <view class="loading-ring loading-ring-3"></view>
          <view class="loading-dot"></view>
        </view>

        <text class="loading-kicker">ENTERPRISE · INTELLIGENCE</text>
        <text class="loading-title">企业档案正在编排</text>
        <text class="loading-subtitle">正在把工商、股权、资质和风险线索重新组织成更易读的结构。</text>

        <!-- 骨架预览：模拟真实页面布局 -->
        <view class="loading-skeleton">
          <view class="skeleton-hero">
            <view class="skel-row skel-logo"></view>
            <view class="skel-col">
              <view class="skel-row skel-line skel-line-1"></view>
              <view class="skel-row skel-line skel-line-2"></view>
              <view class="skel-row skel-line skel-line-3"></view>
            </view>
          </view>
          <view class="skel-grid">
            <view class="skel-row skel-cell"></view>
            <view class="skel-row skel-cell"></view>
            <view class="skel-row skel-cell"></view>
            <view class="skel-row skel-cell"></view>
          </view>
          <view class="skel-block">
            <view class="skel-row skel-line skel-line-4"></view>
            <view class="skel-row skel-line skel-line-5"></view>
            <view class="skel-row skel-line skel-line-6"></view>
          </view>
        </view>
      </view>
    </view>

    <view v-else-if="enterpriseData" class="page-shell">
      <view class="hero-zone">
        <view class="hero-bg hero-bg-1"></view>
        <view class="hero-bg hero-bg-2"></view>
        <view class="hero-grid"></view>

        <view class="hero-topline">
          <view class="hero-eyebrow">
            <text class="eyebrow-dot"></text>
            <text style="font-size: 26rpx; white-space: nowrap;">企业档案</text>
          </view>
          <view class="hero-pills">
            <text v-for="(tag, index) in headerTags.slice(0, 2)" :key="index" class="hero-pill" :class="getTagClass(tag)">{{ tag }}</text>
          </view>
        </view>

        <view class="hero-main">
          <view class="hero-letterbox">
            <view class="hero-letter">{{ getFirstChar(baseInfo.CompanyName) }}</view>
            <view class="hero-letter-ring"></view>
          </view>
          <view class="hero-copy">
            <text class="company-name">{{ baseInfo.CompanyName || '-' }}</text>
            <text class="company-subtitle">{{ baseInfo.CompanyType || '企业详情档案' }}</text>
            <text class="company-address">{{ baseInfo.CompanyAddress || '暂无注册地址信息' }}</text>
          </view>
        </view>

        <view class="hero-snapshots">
          <view class="snapshot">
            <text class="snapshot-label">法定代表人</text>
            <text class="snapshot-value">{{ baseInfo.LegalPerson || '-' }}</text>
          </view>
          <view class="snapshot snapshot-credit" v-if="baseInfo.CreditNo">
            <view>
              <text class="snapshot-label">统一社会信用代码</text>
              <text class="snapshot-value">{{ baseInfo.CreditNo }}</text>
            </view>
          </view>
          <view class="snapshot">
            <text class="snapshot-label">成立日期</text>
            <text class="snapshot-value">{{ formatDate(baseInfo.BusinessDateFromStr || baseInfo.EstablishDate) }}</text>
          </view>
          <view class="snapshot">
            <text class="snapshot-label">注册资本</text>
            <text class="snapshot-value">{{ formatRegMoney(baseInfo.Capital) }}</text>
          </view>
          <view class="snapshot" v-if="contactInfo.PhoneNumber" @tap="callPhone(contactInfo.PhoneNumber)">
            <text class="snapshot-label">电话</text>
            <text class="snapshot-value">{{ contactInfo.PhoneNumber }}</text>
          </view>
          <view class="snapshot" v-if="contactInfo.Email">
            <text class="snapshot-label">邮箱</text>
            <text class="snapshot-value">{{ contactInfo.Email }}</text>
          </view>
          <view
            class="snapshot big"
            v-if="annualReportInfo.length && annualReportInfo[0].WebSiteList && annualReportInfo[0].WebSiteList.length"
          >
            <text class="snapshot-label">企业官网</text>
            <text class="snapshot-value snapshot-link" @tap="openWebSite(annualReportInfo[0].WebSiteList[0].WebSite)">
              {{ annualReportInfo[0].WebSiteList[0].WebSite }}
            </text>
          </view>
        </view>
      </view>

      <view class="section-nav">
        <scroll-view
          class="section-nav-scroll"
          scroll-x
          :show-scrollbar="false"
        >
          <view class="section-nav-track">
            <view class="section-nav-indicator" :style="sliderStyle"></view>
            <view
              v-for="tab in tabs"
              :key="tab.key"
              class="section-nav-item"
              :class="{ active: activeTab === tab.key }"
              @tap="switchTab(tab.key)"
            >
              <text class="section-nav-name">{{ tab.name }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="content-grid">
        <view v-if="activeTab === 'basic'" class="basic-layout">
          <!-- 企业概况 -->
          <view class="basic-group">
            <view class="basic-group-head">
              <text class="basic-group-title">企业概况</text>
            </view>
            <view class="basic-grid">
              <view class="basic-cell" v-if="baseInfo.CompanyStatus">
                <text class="basic-label">企业状态</text>
                <text class="basic-tag" :class="getTagClass(baseInfo.CompanyStatus)">{{ baseInfo.CompanyStatus }}</text>
              </view>
              <view class="basic-cell" v-if="baseInfo.CompanyType">
                <text class="basic-label">企业类型</text>
                <text class="basic-value">{{ baseInfo.CompanyType }}</text>
              </view>
              <view class="basic-cell" v-if="baseInfo.Capital">
                <text class="basic-label">注册资本</text>
                <text class="basic-value blue">{{ formatRegMoney(baseInfo.Capital) }}</text>
              </view>
              <view class="basic-cell">
                <text class="basic-label">营业期限</text>
                <text class="basic-value blue">{{ baseInfo.BusinessDateToStr || '无固定期限' }}</text>
              </view>
              <view class="basic-cell" v-if="baseInfo.EstablishDate">
                <text class="basic-label">成立日期</text>
                <text class="basic-value">{{ formatDate(baseInfo.EstablishDate) }}</text>
              </view>
              <view class="basic-cell" v-if="baseInfo.IssueDate">
                <text class="basic-label">发照日期</text>
                <text class="basic-value">{{ formatDate(baseInfo.IssueDate) }}</text>
              </view>
            </view>
          </view>

          <!-- 登记信息 -->
          <view class="basic-group">
            <view class="basic-group-head">
              <text class="basic-group-title">登记信息</text>
            </view>
            <view class="basic-grid">
              <view class="basic-cell" v-if="baseInfo.LegalPerson">
                <text class="basic-label">法定代表人</text>
                <text class="basic-value blue">{{ baseInfo.LegalPerson }}</text>
              </view>
              <view class="basic-cell" v-if="baseInfo.OrgCode">
                <text class="basic-label">组织机构代码</text>
                <text class="basic-value">{{ baseInfo.OrgCode }}</text>
              </view>
              <view class="basic-cell" v-if="baseInfo.CreditNo">
                <text class="basic-label">统一社会信用代码</text>
                <text class="basic-value">{{ baseInfo.CreditNo }}</text>
              </view>
              <view class="basic-cell" v-if="baseInfo.CompanyCode">
                <text class="basic-label">注册号</text>
                <text class="basic-value">{{ baseInfo.CompanyCode }}</text>
              </view>
              <view class="basic-cell full" v-if="baseInfo.ProvinceName || baseInfo.CityName || baseInfo.DistrictName">
                <text class="basic-label">所属行政区</text>
                <text class="basic-value blue">{{ baseInfo.ProvinceName || '' }}{{ baseInfo.CityName || '' }}{{ baseInfo.DistrictName || '' }}</text>
              </view>
            </view>
          </view>

          <!-- 位置与机关 -->
          <view class="basic-group">
            <view class="basic-group-head">
              <text class="basic-group-title">位置与机关</text>
            </view>
            <view class="basic-grid">
              <view class="basic-cell full" v-if="baseInfo.Authority">
                <text class="basic-label">登记机关</text>
                <text class="basic-value">{{ baseInfo.Authority }}</text>
              </view>
              <view class="basic-cell full" v-if="baseInfo.CompanyAddress">
                <text class="basic-label">注册地址</text>
                <text class="basic-value">{{ baseInfo.CompanyAddress }}</text>
              </view>
            </view>
          </view>

          <!-- 上市信息 -->
          <view class="basic-group" v-if="baseInfo.IsOnStock == '1' || baseInfo.StockType || baseInfo.StockNumber">
            <view class="basic-group-head">
              <text class="basic-group-title">上市信息</text>
            </view>
            <view class="basic-grid">
              <view class="basic-cell" v-if="baseInfo.IsOnStock">
                <text class="basic-label">上市状态</text>
                <text class="basic-tag" :class="baseInfo.IsOnStock == '1' ? 'pill-green' : 'pill-gray'">{{ baseInfo.IsOnStock == '1' ? '上市' : '未上市' }}</text>
              </view>
              <view class="basic-cell" v-if="baseInfo.StockNumber">
                <text class="basic-label">股票代码</text>
                <text class="basic-tag pill-blue">{{ baseInfo.StockNumber }}</text>
              </view>
              <view class="basic-cell" v-if="baseInfo.StockType">
                <text class="basic-label">上市类型</text>
                <text class="basic-value">{{ baseInfo.StockType }}</text>
              </view>
            </view>
          </view>

          <!-- 行业与范围 -->
          <view class="basic-group" v-if="industryInfo.Industry || baseInfo.BusinessScope">
            <view class="basic-group-head">
              <text class="basic-group-title">行业与范围</text>
            </view>
            <view class="basic-grid">
              <view class="basic-cell full" v-if="industryInfo.Industry">
                <text class="basic-label">行业分类</text>
                <text class="basic-value blue">{{ industryInfo.Industry }}</text>
              </view>
              <view class="basic-cell full" v-if="industryInfo.SubIndustry">
                <text class="basic-label">细分行业</text>
                <text class="basic-value blue">{{ industryInfo.SubIndustry }}</text>
              </view>
              <view class="basic-cell full" v-if="baseInfo.BusinessScope">
                <text class="basic-label">经营范围</text>
                <text class="basic-value block">{{ baseInfo.BusinessScope }}</text>
              </view>
            </view>
          </view>
        </view>

        <view v-else-if="activeTab === 'people'" class="feature-layout">
          <!-- <view class="feature-lead compact">
            <view class="feature-head">
              <text class="feature-kicker">组织结构</text>
              <text class="feature-title">股东与管理层</text>
            </view>
            <view class="feature-summary">
              <text>采用左右分栏和层级卡片，把股权结构、管理层与分支机构分开呈现。</text>
            </view>
          </view> -->

          <view class="column-card full" v-if="branches && branches.length">
            <view class="column-head">
              <text class="column-title">分支机构</text>
              <text class="column-count">{{ branches.length }}</text>
            </view>
            <view class="branch-list">
              <view class="branch-item" v-for="(branch, index) in branches" :key="index">
                <view class="branch-dot">{{ index + 1 }}</view>
                <view class="branch-body">
                  <text class="branch-name" style="font-weight: bold;color: #2563eb;">{{ branch.BranchName || branch.CompanyName || branch.Name || '-' }}</text>
                  <view class="branch-meta-item" v-if="branch.LegalPerson">
                    <text class="branch-meta-label">法人：</text>
                    <text class="branch-meta-value">{{ branch.LegalPerson }}</text>
                  </view>
                  <view class="branch-meta">
                    <view class="branch-meta-item" v-if="branch.CompanyCode">
                      <text class="branch-meta-label">注册号：</text>
                      <text class="branch-meta-value">{{ branch.CompanyCode }}</text>
                    </view>
                    <view class="branch-meta-item" v-if="branch.CreditNo">
                      <text class="branch-meta-label">信用代码：</text>
                      <text class="branch-meta-value">{{ branch.CreditNo }}</text>
                    </view>
                    
                    <view class="branch-meta-item" v-if="branch.Authority">
                      <text class="branch-meta-label">登记机关：</text>
                      <text class="branch-meta-value">{{ branch.Authority }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <view class="column-card" v-if="employees && employees.length">
            <view class="column-head">
              <text class="column-title">核心管理层</text>
              <text class="column-count">{{ employees.length }}</text>
            </view>
            <view class="people-grid">
              <view class="people-card" v-for="(emp, index) in employees" :key="index">
                <view class="people-avatar">{{ getFirstChar(emp.Name || emp.EmployeeName || emp.PersonName) }}</view>
                <view class="people-info">
                  <text class="people-name">{{ emp.Name || emp.EmployeeName || emp.PersonName || '-' }}</text>
                  <text class="people-role">{{ emp.Job || emp.Position || '高管' }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="dual-columns" style="border-radius: 20rpx;">
            <view class="column-card" v-if="partners && partners.length">
              <view class="column-head">
                <text class="column-title">股东结构</text>
                <text class="column-count">{{ partners.length }}</text>
              </view>
              <view class="share-list">
                <view class="share-row" v-for="(partner, index) in partners" :key="index">
                  <view class="share-rank">{{ index + 1 }}</view>
                  <view class="share-body">
                    <view class="share-line">
                      <text class="share-name">{{ partner.StockName }}</text>
                      <text class="share-percent">{{ formatPercent(partner.StockPercent) }}</text>
                    </view>
                    <view class="share-track"><view class="share-fill" :style="{ width: percentWidth(partner.StockPercent) }"></view></view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view v-else-if="activeTab === 'lawsuit'" class="feature-layout">
          <view class="column-card">
            <view class="column-head">
              <text class="column-title">失信被执行人</text>
              <text class="column-count" v-if="disEnforcements && disEnforcements.length">{{ disEnforcements.length }}</text>
            </view>
            <view class="dishonest-list" v-if="disEnforcements && disEnforcements.length">
              <view class="dishonest-item" v-for="(item, index) in disEnforcements" :key="index">
                <view class="dishonest-rank">{{ index + 1 }}</view>
                <view class="dishonest-body">
                  <text class="dishonest-name">{{ item.realname || '失信被执行人' }}</text>
                  <view class="dishonest-meta">
                    <view class="dishonest-meta-item" v-if="item.caseno">
                      <text class="dishonest-meta-label">案号： </text>
                      <text class="dishonest-meta-value">{{ item.caseno }}</text>
                    </view>
                    <view class="dishonest-meta-item" v-if="item.court">
                      <text class="dishonest-meta-label">法院：</text>
                      <text class="dishonest-meta-value">{{ item.court }}</text>
                    </view>
                    <view class="dishonest-meta-item" v-if="item.description">
                      <text class="dishonest-meta-label">情形： </text>
                      <text class="dishonest-meta-value">{{ item.description }}</text>
                    </view>
                    <view class="dishonest-meta-item" v-if="item.performance">
                      <text class="dishonest-meta-label">履行： </text>
                      <text class="dishonest-meta-value">{{ item.performance }}</text>
                    </view>
                    <view class="dishonest-meta-item" v-if="item.duty">
                      <text class="dishonest-meta-label" style="color: red;">义务：</text>
                      <text class="dishonest-meta-value" style="color: red;">{{ item.duty }}</text>
                    </view>
                    <view class="dishonest-meta-item" v-if="item.filingdate">
                      <text class="dishonest-meta-label">立案：</text>
                      <text class="dishonest-meta-value">{{ formatDate(item.filingdate) }}</text>
                    </view>
                    <view class="dishonest-meta-item" v-if="item.pubdate">
                      <text class="dishonest-meta-label">发布：</text>
                      <text class="dishonest-meta-value">{{ formatDate(item.pubdate) }}</text>
                    </view>
                    <view class="dishonest-meta-item" v-if="item.province">
                      <text class="dishonest-meta-label">省份：</text>
                      <text class="dishonest-meta-value">{{ item.province }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view v-else class="empty-state">
              <text class="empty-state-text">该企业无失信人</text>
            </view>
          </view>

          <view class="column-card">
            <view class="column-head">
              <text class="column-title">法律诉讼</text>
              <text class="column-count">{{ lawsuits.length }}</text>
            </view>
            <view class="lawsuit-list" v-if="lawsuits && lawsuits.length">
              <view class="lawsuit-item" v-for="(item, index) in lawsuits" :key="index">
                <view class="lawsuit-rank">{{ index + 1 }}</view>
                <view class="lawsuit-body">
                  <text class="lawsuit-name">{{ item.title || '法律文书' }}</text>
                  <view class="lawsuit-meta">
                    <view class="lawsuit-meta-item" v-if="item.caseNo">
                      <text class="lawsuit-meta-label">案号：</text>
                      <text class="lawsuit-meta-value">{{ item.caseNo }}</text>
                    </view>
                    <view class="lawsuit-meta-item" v-if="item.caseReason">
                      <text class="lawsuit-meta-label">案由：</text>
                      <text class="lawsuit-meta-value red" style="font-weight: bold;">{{ item.caseReason }}</text>
                    </view>
                    <view class="lawsuit-meta-item" v-if="item.plaintiffs">
                      <text class="lawsuit-meta-label">原告：</text>
                      <text class="lawsuit-meta-value">{{ item.plaintiffs ? JSON.parse(item.plaintiffs)[0].name : '-' }}</text>
                    </view>
                    <view class="lawsuit-meta-item" v-if="item.defendants">
                      <text class="lawsuit-meta-label">被告：</text>
                      <text class="lawsuit-meta-value">{{ item.defendants ? JSON.parse(item.defendants)[0].name : '-' }}</text>
                    </view>
                    <view class="lawsuit-meta-item" v-if="item.thirdParties">
                      <text class="lawsuit-meta-label">第三人：</text>
                      <text class="lawsuit-meta-value">{{ item.thirdParties }}</text>
                    </view>
                    <view class="lawsuit-meta-item" v-if="item.caseType">
                      <text class="lawsuit-meta-label">案件类型：</text>
                      <text class="lawsuit-meta-value">{{ item.caseType }}</text>
                    </view>
                    <view class="lawsuit-meta-item" v-if="item.docType">
                      <text class="lawsuit-meta-label">文书类型：</text>
                      <text class="lawsuit-meta-value">{{ item.docType }}</text>
                    </view>
                    <view class="lawsuit-meta-item" v-if="item.court">
                      <text class="lawsuit-meta-label">审理法院：</text>
                      <text class="lawsuit-meta-value">{{ item.court }}</text>
                    </view>
                    <view class="lawsuit-meta-item" v-if="item.courtProvince">
                      <text class="lawsuit-meta-label">法院地区：</text>
                      <text class="lawsuit-meta-value">{{ item.courtProvince }}</text>
                    </view>
                    <view class="lawsuit-meta-item" v-if="item.trialName">
                      <text class="lawsuit-meta-label">审理程序：</text>
                      <text class="lawsuit-meta-value">{{ item.trialName }}</text>
                    </view>
                    <view class="lawsuit-meta-item" v-if="item.judgeDate">
                      <text class="lawsuit-meta-label">裁判日期：</text>
                      <text class="lawsuit-meta-value">{{ formatDate(item.judgeDate) }}</text>
                    </view>
                    <view class="lawsuit-meta-item" v-if="item.publishDate">
                      <text class="lawsuit-meta-label">发布日期：</text>
                      <text class="lawsuit-meta-value">{{ formatDate(item.publishDate) }}</text>
                    </view>
                    <view class="lawsuit-meta-item" v-if="item.resultAmount">
                      <text class="lawsuit-meta-label">涉案金额：</text>
                      <text class="lawsuit-meta-value">{{ item.resultAmount }}元</text>
                    </view>
                    <view class="lawsuit-meta-item" v-if="item.judgeResult">
                      <text class="lawsuit-meta-label">裁判结果：</text>
                      <text class="lawsuit-meta-value">{{ item.judgeResult }}</text>
                    </view>
                    <!-- <view class="lawsuit-meta-item" v-if="item.otherParty">
                      <text class="lawsuit-meta-label">其他当事人：</text>
                      <text class="lawsuit-meta-value">{{ item.otherParty ? JSON.parse(item.otherParty)[0].name : '-' }}</text>
                    </view> -->
                  </view>
                </view>
              </view>
            </view>
            <view v-else class="empty-state">
              <text class="empty-state-text">该企业法暂无法律诉讼记录</text>
            </view>
          </view>
          <empty-state v-if="!disEnforcements?.length && !lawsuits?.length" title="暂无法律诉讼记录" hint="该企业暂无失信被执行人及法律诉讼信息" />
        </view>

        <view v-else-if="activeTab === 'intellectual'" class="feature-layout">
          <!-- <view class="feature-lead compact">
            <view class="feature-head">
              <text class="feature-kicker">知识资产</text>
              <text class="feature-title">软著与资质</text>
            </view>
            <view class="feature-summary">
              <text>把知识产权做成“资产流”而不是列表，减少阅读疲劳。</text>
            </view>
          </view> -->

          <view class="column-card" v-if="copyrights && copyrights.length">
            <view class="column-head">
              <text class="column-title">软件著作</text>
              <text class="column-count">{{ copyrightCount }}</text>
            </view>
            <view class="copyright-list">
              <view class="copyright-item" v-for="(item, index) in copyrights" :key="index">
                <view class="copyright-dot">{{ index + 1 }}</view>
                <view class="copyright-body">
                  <text class="copyright-name">{{ item.Name || item.Rname || '软件著作权' }}</text>
                  <view class="copyright-meta">
                    <view class="copyright-meta-item" v-if="item.VersionNo">
                      <text class="copyright-meta-label">版本号: </text>
                      <text class="copyright-meta-value">{{ item.VersionNo }}</text>
                    </view>
                    <view class="copyright-meta-item" v-if="item.RegisterNo">
                      <text class="copyright-meta-label">登记号: </text>
                      <text class="copyright-meta-value">{{ item.RegisterNo }}</text>
                    </view>
                    <view class="copyright-meta-item" v-if="item.ShortName">
                      <text class="copyright-meta-label">软件简称: </text>
                      <text class="copyright-meta-value">{{ item.ShortName }}</text>
                    </view>
                    <view class="copyright-meta-item" v-if="item.Owner">
                      <text class="copyright-meta-label">著作权人: </text>
                      <text class="copyright-meta-value">{{ item.Owner }}</text>
                    </view>
                    <view class="copyright-meta-item" v-if="item.RegisterAperDate">
                      <text class="copyright-meta-label">登记日期: </text>
                      <text class="copyright-meta-value">{{ formatDate(item.RegisterAperDate) }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <view class="column-card" v-if="patents && patents.length">
            <view class="column-head">
              <text class="column-title">专利</text>
              <text class="column-count">{{ patents.length }}</text>
            </view>
            <view class="patent-list">
              <view class="patent-item" v-for="(patent, index) in patents" :key="index">
                <view class="patent-rank">{{ index + 1 }}</view>
                <view class="patent-body">
                  <text class="patent-name">{{ patent.patentName || '专利' }}</text>
                  <view class="patent-meta">
                    <view class="patent-meta-item" v-if="patent.domicile">
                      <text class="patent-meta-label">地址：</text>
                      <text class="patent-meta-value">{{ patent.domicile }}</text>
                    </view>
                    <view class="patent-meta-item" v-if="patent.agentPerson">
                      <text class="patent-meta-label">代理人：</text>
                      <text class="patent-meta-value">{{ patent.agentPerson }}</text>
                    </view>
                    <view class="patent-meta-item" v-if="patent.inventor">
                      <text class="patent-meta-label">发明人：</text>
                      <text class="patent-meta-value">{{ patent.inventor }}</text>
                    </view>
                    <view class="patent-meta-item" v-if="patent.licenseCode">
                      <text class="patent-meta-label">申请号：</text>
                      <text class="patent-meta-value">{{ patent.licenseCode }}</text>
                    </view>
                    <view class="patent-meta-item" v-if="patent.outherNum">
                      <text class="patent-meta-label">专利号：</text>
                      <text class="patent-meta-value">{{ patent.outherNum }}</text>
                    </view>
                    <view class="patent-meta-item" v-if="patent.pubTime">
                      <text class="patent-meta-label">公告日期：</text>
                      <text class="patent-meta-value">{{ formatDate(patent.pubTime) }}</text>
                    </view>
                    <view class="patent-meta-item" v-if="patent.stateMeaning">
                      <text class="patent-meta-label">法律状态：</text>
                      <text class="patent-meta-value">{{ patent.stateMeaning }}</text>
                    </view>
                    <view class="patent-meta-item" v-if="patent.patentCategory">
                      <text class="patent-meta-label">专利类型：</text>
                      <text class="patent-meta-value">{{ patent.patentCategory }}</text>
                    </view>
                    <view class="patent-meta-item" v-if="patent.agentUnit">
                      <text class="patent-meta-label">代理机构：</text>
                      <text class="patent-meta-value">{{ patent.agentUnit }}</text>
                    </view>
                    <view class="patent-meta-item" v-if="patent.requestDate">
                      <text class="patent-meta-label">申请时间：</text>
                      <text class="patent-meta-value">{{ formatDate(patent.requestDate) }}</text>
                    </view>
                    <view class="patent-meta-item" v-if="patent.stateLevel1">
                      <text class="patent-meta-label">一级分类：</text>
                      <text class="patent-meta-value">{{ patent.stateLevel1 }}</text>
                    </view>
                    <view class="patent-meta-item" v-if="patent.stateLevel2">
                      <text class="patent-meta-label">二级分类：</text>
                      <text class="patent-meta-value">{{ patent.stateLevel2 }}</text>
                    </view>
                    <view class="patent-meta-item" v-if="patent.mainCategoryCode">
                      <text class="patent-meta-label">主分类号：</text>
                      <text class="patent-meta-value">{{ patent.mainCategoryCode }}</text>
                    </view>
                    <view class="patent-meta-item" v-if="patent.summary">
                      <text class="patent-meta-label">专利摘要：</text>
                      <text class="patent-meta-value">{{ patent.summary }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <view class="column-card" v-if="permissions && permissions.length">
            <view class="column-head">
              <text class="column-title">行政许可与资质</text>
              <text class="column-count">{{ permissions.length }}</text>
            </view>
            <view class="perm-list">
              <view class="perm-item" v-for="(perm, index) in permissions" :key="index">
                <view class="perm-rank">{{ index + 1 }}</view>
                <view class="perm-body">
                  <text class="perm-name">{{ perm.Name || '行政许可及资格证书' }}</text>
                  <view class="perm-meta">
                    <view class="perm-meta-item" v-if="perm.CaseNo">
                      <text class="perm-meta-label">文书号：</text>
                      <text class="perm-meta-value">{{ perm.CaseNo }}</text>
                    </view>
                    <view class="perm-meta-item" v-if="perm.Province">
                      <text class="perm-meta-label">地域：</text>
                      <text class="perm-meta-value">{{ perm.Province }}</text>
                    </view>
                    <view class="perm-meta-item" v-if="perm.Liandate">
                      <text class="perm-meta-label">发证日期：</text>
                      <text class="perm-meta-value">{{ formatDate(perm.Liandate) }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <empty-state v-if="!copyrights.length && !patents.length && !permissions.length" title="暂无知识资产" hint="该企业暂未登记软件著作、专利或行政许可" />
        </view>

        <view v-else-if="activeTab === 'annual'" class="feature-layout">
          <view v-if="!annualReportInfo || annualReportInfo.length === 0" class="column-card annual-placeholder">
            <view class="column-head">
              <text class="column-title">企业年报</text>
            </view>
            <empty-state title="暂无年报数据" hint="该企业暂未公示年度报告" />
          </view>

          <view
            v-for="(report, rIndex) in annualReportInfo"
            :key="rIndex"
            class="column-card"
          >
            <view class="column-head">
              <view class="change-mark" style="background: #fe9700;"></view>
              <text class="column-title">{{ report.Year || '-' }} 年度企业年报</text>
              <!-- <text class="column-count" v-if="report.PublishDate">{{ report.PublishDate }}</text> -->
            </view>

            <!-- ==================== 网站或网店信息 ==================== -->
            <view class="basic-group annual-subgroup" v-if="report.WebSiteList && report.WebSiteList.length">
              <view class="basic-group-head">
                <text class="basic-group-title">网站或网店信息</text>
                <text class="column-count">{{ report.WebSiteList.length }}</text>
              </view>
              <view class="website-list">
                <view
                  class="website-item"
                  v-for="(site, index) in report.WebSiteList"
                  :key="index"
                  @tap="site.WebSite && openWebSite(site.WebSite)"
                >
                  <view class="website-rank">{{ index + 1 }}</view>
                  <view class="website-body">
                    <view class="website-header">
                      <text class="website-name">{{ site.Name || '-' }}</text>
                      <text class="website-type">{{ site.Type || '-' }}</text>
                    </view>
                    <text class="website-url">{{ site.WebSite || '-' }}</text>
                  </view>
                </view>
              </view>
            </view>

            <!-- ==================== 企业基本信息 ==================== -->
            <view class="basic-group annual-subgroup" v-if="report.BasicInfoData">
              <view class="basic-group-head">
                <text class="basic-group-title">企业基本信息</text>
              </view>
              <view class="basic-grid">
                <view class="basic-cell full" v-if="report.BasicInfoData.CompanyName">
                  <text class="basic-label">企业名称</text>
                  <text class="basic-value blue">{{ report.BasicInfoData.CompanyName }}</text>
                </view>
                <view class="basic-cell" v-if="report.BasicInfoData.RegNo">
                  <text class="basic-label">注册号</text>
                  <text class="basic-value">{{ report.BasicInfoData.RegNo }}</text>
                </view>
                <view class="basic-cell" v-if="report.BasicInfoData.MainType">
                  <text class="basic-label">企业类型</text>
                  <text class="basic-value">{{ report.BasicInfoData.MainType }}</text>
                </view>
                <view class="basic-cell" v-if="report.BasicInfoData.Status">
                  <text class="basic-label">经营状态</text>
                  <text class="basic-tag pill-green">{{ report.BasicInfoData.Status }}</text>
                </view>
                <view class="basic-cell" v-if="report.BasicInfoData.ContactNo">
                  <text class="basic-label">企业联系电话</text>
                  <text class="basic-value blue">{{ report.BasicInfoData.ContactNo }}</text>
                </view>
                <view class="basic-cell" v-if="report.BasicInfoData.EmailAddress">
                  <text class="basic-label">电子邮箱</text>
                  <text class="basic-value">{{ report.BasicInfoData.EmailAddress }}</text>
                </view>
                <view class="basic-cell" v-if="report.BasicInfoData.PostCode">
                  <text class="basic-label">邮政编码</text>
                  <text class="basic-value">{{ report.BasicInfoData.PostCode }}</text>
                </view>
                <!-- 从业人数 -->
                <view class="basic-cell" v-if="hasField(report.BasicInfoData.EmployeeCount)">
                  <text class="basic-label">从业人数</text>
                  <text class="basic-value blue">{{ report.BasicInfoData.EmployeeCount }}</text>
                </view>
                <view class="basic-cell full" v-if="report.BasicInfoData.Address">
                  <text class="basic-label">通信地址</text>
                  <text class="basic-value">📍{{ report.BasicInfoData.Address }}</text>
                </view>
                <!-- <view class="basic-cell full" v-if="report.BasicInfoData.OperationPlaces">
                  <text class="basic-label">经营场所</text>
                  <text class="basic-value">📍{{ report.BasicInfoData.OperationPlaces }}</text>
                </view> -->
                <!-- 状态标签行 -->
                <view class="basic-cell full" v-if="hasAnyStatus(report.BasicInfoData)">
                  <text class="basic-label">经营状态</text>
                  <view class="annual-tag-row">
                    <text class="basic-tag" :class="report.BasicInfoData.HasWebSite === '是' ? 'pill-green' : 'pill-gray'">网站{{ report.BasicInfoData.HasWebSite === '是' ? ' ✔' : ' ✘' }}</text>
                    <text class="basic-tag" :class="report.BasicInfoData.HasNewStockOrByStock === '是' ? 'pill-green' : 'pill-gray'">新增股{{ report.BasicInfoData.HasNewStockOrByStock === '是' ? ' ✔' : ' ✘' }}</text>
                    <text class="basic-tag" :class="report.BasicInfoData.IsStockRightTransfer === '是' ? 'pill-orange' : 'pill-gray'">股权转让{{ report.BasicInfoData.IsStockRightTransfer === '是' ? ' ✔' : ' ✘' }}</text>
                    <text class="basic-tag" :class="report.BasicInfoData.HasProvideAssurance === '是' ? 'pill-orange' : 'pill-gray'">对外担保{{ report.BasicInfoData.HasProvideAssurance === '是' ? ' ✔' : ' ✘' }}</text>
                  </view>
                </view>
              </view>
            </view>

            <!-- ==================== 社保信息 ==================== -->
            <view class="basic-group annual-subgroup" v-if="report.SocialSecurity && report.SocialSecurity.length">
              <view class="basic-group-head">
                <text class="basic-group-title">社保信息</text>
              </view>
              <view class="social-list">
                <view
                  class="social-item"
                  v-for="(ss, si) in report.SocialSecurity"
                  :key="si"
                >
                  <view class="social-header">
                    <view class="social-rank">{{ si + 1 }}</view>
                    <text class="social-name">{{ ss.InsuranceName || '-' }}</text>
                  </view>
                  <view class="social-grid">
                    <view class="social-cell">
                      <text class="social-label">参保人数</text>
                      <text class="social-value">{{ ss.InsuranceAmount || '-' }}</text>
                    </view>
                    <view class="social-cell">
                      <text class="social-label">缴费基数</text>
                      <text class="social-value">{{ ss.InsuranceBase || '-' }}</text>
                    </view>
                    <view class="social-cell">
                      <text class="social-label">本期实缴金额</text>
                      <text class="social-value">{{ ss.InsuranceRealCapital || '-' }}</text>
                    </view>
                    <view class="social-cell">
                      <text class="social-label">欠缴金额</text>
                      <text class="social-value" :class="ss.InsuranceArrearage && ss.InsuranceArrearage !== '企业选择不公示' ? 'red' : ''">{{ ss.InsuranceArrearage || '-' }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>

            <!-- ==================== 企业资产状况 ==================== -->
            <view class="basic-group annual-subgroup" v-if="report.AssetsData && hasAnyAssets(report.AssetsData)">
              <view class="basic-group-head">
                <text class="basic-group-title">企业资产状况</text>
              </view>
              <view class="basic-grid">
                <view class="basic-cell" v-if="hasField(report.AssetsData.TotalAssets)">
                  <text class="basic-label">资产总额</text>
                  <text class="basic-value blue">{{ report.AssetsData.TotalAssets }}</text>
                </view>
                <view class="basic-cell" v-if="hasField(report.AssetsData.TotalOwnersEquity)">
                  <text class="basic-label">所有者权益合计</text>
                  <text class="basic-value blue">{{ report.AssetsData.TotalOwnersEquity }}</text>
                </view>
                <view class="basic-cell" v-if="hasField(report.AssetsData.TotalLiabilities)">
                  <text class="basic-label">负债总额</text>
                  <text class="basic-value">{{ report.AssetsData.TotalLiabilities }}</text>
                </view>
                <view class="basic-cell" v-if="hasField(report.AssetsData.GrossTradingIncome)">
                  <text class="basic-label">营业总收入</text>
                  <text class="basic-value">{{ report.AssetsData.GrossTradingIncome }}</text>
                </view>
                <view class="basic-cell" v-if="hasField(report.AssetsData.MainBusinessIncome)">
                  <text class="basic-label">主营业务收入</text>
                  <text class="basic-value">{{ report.AssetsData.MainBusinessIncome }}</text>
                </view>
                <view class="basic-cell" v-if="hasField(report.AssetsData.TotalProfit)">
                  <text class="basic-label">利润总额</text>
                  <text class="basic-value">{{ report.AssetsData.TotalProfit }}</text>
                </view>
                <view class="basic-cell" v-if="hasField(report.AssetsData.NetProfit)">
                  <text class="basic-label">净利润</text>
                  <text class="basic-value">{{ report.AssetsData.NetProfit }}</text>
                </view>
                <view class="basic-cell full" v-if="hasField(report.AssetsData.TotalTaxAmount)">
                  <text class="basic-label">纳税总额</text>
                  <text class="basic-value blue">{{ report.AssetsData.TotalTaxAmount }}</text>
                </view>
              </view>
            </view>

            <!-- ==================== 股东及出资信息 ==================== -->
            <view class="basic-group annual-subgroup" v-if="report.PartnerList && report.PartnerList.length">
              <view class="basic-group-head">
                <text class="basic-group-title">股东及出资信息</text>
                <text class="column-count">{{ report.PartnerList.length }}</text>
              </view>
              <view class="partner-list">
                <view
                  class="partner-item"
                  v-for="(p, pi) in report.PartnerList"
                  :key="pi"
                >
                  <view class="partner-header">
                    <view class="partner-rank">{{ pi + 1 }}</view>
                    <text class="partner-name">{{ p.Name || '-' }}</text>
                  </view>
                  <view class="partner-detail">
                    <view class="partner-section">
                      <text class="partner-section-title">认缴信息</text>
                      <view class="partner-row">
                        <text class="partner-label">出资方式</text>
                        <text class="partner-value">{{ p.ShouldType || '-' }}</text>
                      </view>
                      <view class="partner-row">
                        <text class="partner-label">出资额(万元)</text>
                        <text class="partner-value">{{ p.ShouldCapi || '-' }}</text>
                      </view>
                      <view class="partner-row">
                        <text class="partner-label">出资日期</text>
                        <text class="partner-value">{{ p.ShouldDate || '-' }}</text>
                      </view>
                    </view>
                    <view class="partner-section">
                      <text class="partner-section-title">实缴信息</text>
                      <view class="partner-row">
                        <text class="partner-label">出资方式</text>
                        <text class="partner-value">{{ p.RealType || '-' }}</text>
                      </view>
                      <view class="partner-row">
                        <text class="partner-label">出资额(万元)</text>
                        <text class="partner-value">{{ p.RealCapi || '-' }}</text>
                      </view>
                      <view class="partner-row">
                        <text class="partner-label">出资日期</text>
                        <text class="partner-value">{{ p.RealDate || '-' }}</text>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>

            <!-- ==================== 对外投资信息 ==================== -->
            <view class="basic-group annual-subgroup" v-if="report.InvestInfoList && report.InvestInfoList.length">
              <view class="basic-group-head">
                <text class="basic-group-title">对外投资信息</text>
                <text class="column-count">{{ report.InvestInfoList.length }}</text>
              </view>
              <view class="invest-list">
                <view
                  v-for="(inv, idx) in report.InvestInfoList"
                  :key="idx"
                  class="invest-item"
                >
                  <view class="invest-rank">{{ idx + 1 }}</view>
                  <view class="invest-body">
                    <text class="invest-name">{{ inv.Name || '对外投资企业' }}</text>
                    <view class="invest-meta">
                      <view class="invest-meta-item" v-if="inv.CreditCode">
                        <text class="invest-meta-label">统一社会信用代码：</text>
                        <text class="invest-meta-value">{{ inv.CreditCode }}</text>
                      </view>
                      <view class="invest-meta-item" v-if="inv.RegNo">
                        <text class="invest-meta-label">注册号：</text>
                        <text class="invest-meta-value">{{ inv.RegNo }}</text>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>

            <!-- ==================== 经营状况变更 ==================== -->
            <view class="basic-group annual-subgroup" v-if="report.ChangeList && report.ChangeList.length">
              <view class="basic-group-head">
                <text class="basic-group-title">经营状况变更</text>
                <text class="column-count">{{ report.ChangeList.length }}</text>
              </view>
              <view class="annual-change">
                <view
                  class="change-item"
                  v-for="(ch, ci) in report.ChangeList"
                  :key="ci"
                >
                  <view class="change-mark"></view>
                  <view class="change-card">
                    <view class="change-header">
                      <text class="change-tag">{{ ch.ChangeName || '经营变更' }}</text>
                      <text class="change-date" v-if="ch.ChangeDate">{{ ch.ChangeDate }}</text>
                    </view>
                    <view class="change-row" v-if="hasField(ch.Before)">
                      <text class="change-label">变更前：</text>
                      <text class="change-value">{{ ch.Before }}</text>
                    </view>
                    <view class="change-row" v-if="hasField(ch.After)">
                      <text class="change-label">变更后：</text>
                      <text class="change-value">{{ ch.After }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>

            <!-- ==================== 股权变更信息 ==================== -->
            <view class="basic-group annual-subgroup" v-if="report.StockChangeList && report.StockChangeList.length">
              <view class="basic-group-head">
                <text class="basic-group-title">股权变更信息</text>
                <text class="column-count">{{ report.StockChangeList.length }}</text>
              </view>
              <view class="annual-change">
                <view
                  class="change-item"
                  v-for="(sc, sci) in report.StockChangeList"
                  :key="sci"
                >
                  <view class="change-mark"></view>
                  <view class="change-card">
                    <text class="change-tag">{{ sc.Name || '股权变更' }}</text>
                    <view class="change-row" v-if="hasField(sc.BeforeContent)">
                      <text class="change-label">变更前：</text>
                      <text class="change-value">{{ sc.BeforeContent }}</text>
                    </view>
                    <view class="change-row" v-if="hasField(sc.AfterContent)">
                      <text class="change-label">变更后：</text>
                      <text class="change-value">{{ sc.AfterContent }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>

            <!-- ==================== 对外提供保证担保信息 ==================== -->
            <view class="basic-group annual-subgroup" v-if="report.ProvideAssuranceList && report.ProvideAssuranceList.length">
              <view class="basic-group-head">
                <text class="basic-group-title">对外提供保证担保</text>
                <text class="column-count">{{ report.ProvideAssuranceList.length }}</text>
              </view>
              <view class="assurance-list">
                <view
                  v-for="(as, ai) in report.ProvideAssuranceList"
                  :key="ai"
                  class="assurance-item"
                >
                  <view class="assurance-rank">{{ ai + 1 }}</view>
                  <view class="assurance-body">
                    <text class="assurance-name">{{ as.Creditor || as.Name || '保证担保' }}</text>
                    <view class="assurance-meta">
                      <view class="assurance-meta-item" v-if="hasField(as.GuaranteeAmount)">
                        <text class="assurance-meta-label">担保金额：</text>
                        <text class="assurance-meta-value red">{{ as.GuaranteeAmount }}</text>
                      </view>
                      <view class="assurance-meta-item" v-if="as.GuaranteePeriod">
                        <text class="assurance-meta-label">担保期间：</text>
                        <text class="assurance-meta-value">{{ as.GuaranteePeriod }}</text>
                      </view>
                      <view class="assurance-meta-item" v-if="as.GuaranteeRange">
                        <text class="assurance-meta-label">担保范围：</text>
                        <text class="assurance-meta-value">{{ as.GuaranteeRange }}</text>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-else class="feature-layout">
          <view class="column-card" v-if="taxCredits && taxCredits.length">
            <view class="column-head">
              <text class="column-title">纳税信息</text>
              <text class="column-count">{{ taxCredits.length }}</text>
            </view>
            <view class="tax-list">
              <view class="tax-item" v-for="(tax, index) in taxCredits" :key="index">
                <view class="tax-rank">{{ index + 1 }}</view>
                <view class="tax-body">
                  <view class="tax-header">
                    <text class="tax-year">评价年度：{{ tax.Year || '-' }}</text>
                  </view>
                  <view class="tax-meta">
                    <view class="tax-meta-item" v-if="tax.TaxPayerName">
                      <text class="tax-meta-label">纳税人: </text>
                      <text class="tax-meta-value">{{ tax.TaxPayerName }}</text>
                    </view>
                    <view class="tax-meta-item" v-if="tax.TaxPayerNo">
                      <text class="tax-meta-label">识别号: </text>
                      <text class="tax-meta-value">{{ tax.TaxPayerNo }}</text>
                    </view>
                    <view class="tax-meta-item" v-if="tax.TaxPayerName">
                      <text class="tax-meta-label">信用等级: </text>
                      <text class="tax-level">{{ tax.Level || '-' }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <view class="column-card" v-if="changes && changes.length">
            <view class="column-head">
              <text class="column-title">企业变更</text>
              <text class="column-count">{{ changes.length }}</text>
            </view>
            <view class="change-timeline">
              <view class="change-item" v-for="(change, index) in changes" :key="index">
                <view class="change-date">
                  <text class="change-year">{{ (change.ChangeDate || '').slice(0, 4) }}</text>
                  <text class="change-monthday">{{ (change.ChangeDate || '').slice(5, 10) }}</text>
                </view>
                <view class="change-mark"></view>
                <view class="change-card">
                  <text class="change-tag">{{ change.ChangeField || '变更' }}</text>
                  <view class="change-row" v-if="change.ChangeBefore">
                    <text class="change-label" style="color: #333">变更前：</text>
                    <text class="change-value old">{{ change.ChangeBefore }}</text>
                  </view>
                  <view class="change-row" v-if="change.ChangeAfter">
                    <text class="change-label" style="color: #333">变更后：</text>
                    <text class="change-value new">{{ change.ChangeAfter }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <view class="column-card" v-if="spotChecks && spotChecks.length">
            <view class="column-head">
              <text class="column-title">行政抽查</text>
              <text class="column-count">{{ spotChecks.length }}</text>
            </view>
            <view class="spot-list">
              <view class="spot-item" v-for="(check, index) in [...spotChecks].reverse()" :key="index">
                <view class="spot-rank">{{ index + 1 }}</view>
                <view class="spot-body">
                  <text class="spot-name">{{ check.Type || '行政抽查' }}</text>
                  <view class="spot-meta">
                    <view class="spot-meta-item" v-if="check.Date">
                      <text class="spot-meta-label">日期： </text>
                      <text class="spot-meta-value">{{ formatDate(check.Date) }}</text>
                    </view>
                    <view class="spot-meta-item" v-if="check.Consequence">
                      <text class="spot-meta-label">结果： </text>
                      <text class="spot-meta-value">{{ check.Consequence }}</text>
                    </view>
                    <view class="spot-meta-item" v-if="check.ExecutiveOrg">
                      <text class="spot-meta-label">机关：</text>
                      <text class="spot-meta-value">{{ check.ExecutiveOrg }}</text>
                    </view>
                    <view class="spot-meta-item" v-if="check.Remark">
                      <text class="spot-meta-label">备注：</text>
                      <text class="spot-meta-value">{{ check.Remark }}</text>
                    </view>
                    <view class="spot-meta-item" v-if="check.No">
                      <text class="spot-meta-label">登记编号： </text>
                      <text class="spot-meta-value">{{ check.No }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 企业官网确认弹窗 -->
    <view v-if="webSiteDialogVisible" class="webs-dialog-mask" @tap="closeWebSiteDialog">
      <view class="webs-dialog" @tap.stop>
        <view class="webs-dialog-title">访问企业官网</view>
        <view class="webs-dialog-url" @tap="copyWebSite">{{ webSiteDialogUrl }}</view>
        <view class="webs-dialog-hint">点击网址可复制 · 复制后到浏览器粘贴打开</view>
        <view class="webs-dialog-actions">
          <view class="webs-btn webs-btn--cancel" @tap="closeWebSiteDialog">取消</view>
          <view class="webs-btn webs-btn--ok" @tap="confirmOpenWebSite">复制并打开</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { searchEnterprise } from "@/static/api/index.js"
import EmptyState from '@/common/components/empty-state.vue'

export default {
  name: 'EnterpriseDetail',
  components: { EmptyState },
  props: {
    keyword: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      enterpriseData: null,
      loading: false,
      activeTab: 'basic',
      webSiteDialogVisible: false,
      webSiteDialogUrl: '',
      tabs: [
        { key: 'basic', name: '基础档案' },
        { key: 'annual', name: '企业年报' },
        { key: 'people', name: '组织结构' },
        { key: 'lawsuit', name: '法律诉讼' },
        { key: 'intellectual', name: '知识资产' },
        { key: 'risk', name: '企业变更' }
      ],
    }
  },
  computed: {
    /**
     * 工商基础信息
     * 数据来源：enterpriseData.businessInfo.Base（驼峰 Base，不是 baseInfo）
     * 典型字段：企业名、注册号、状态、注册资本、成立日期、法人、股东类型等
     * 用于：基础信息 Tab 的工商卡片 + 头部公司名/状态标签
     */
    baseInfo() {
      return this.enterpriseData?.businessInfo?.Base || {}
    },
    /**
     * 联系信息
     * 数据来源：enterpriseData.businessInfo.ContactInfo
     * 典型字段：注册地址、办公地址、电话、邮箱、邮编等
     * 用于：基础信息 Tab 的联系方式区块
     */
    contactInfo() {
      return this.enterpriseData?.businessInfo?.ContactInfo || {}
    },
    /**
     * 行业信息
     * 数据来源：enterpriseData.businessInfo.Industry
     * 典型字段：行业大类、行业小类、国民经济行业分类代码
     * 用于：基础信息 Tab 的行业展示 + 头部标签
     */
    industryInfo() {
      return this.enterpriseData?.businessInfo?.Industry || {}
    },
    /**
     * 头部状态标签（企业名下方的小 chip 列表）
     * 来源：baseInfo.CompanyStatus（经营状态）+ StockStatus/IsOnStock（是否上市）+ ProvinceName（省份）+ industryInfo.Industry（行业）
     * 用于：详情页头部企业名下方的标签条
     */
    headerTags() {
      const list = []
      if (this.baseInfo.CompanyStatus) list.push(this.baseInfo.CompanyStatus.split('（')[0])
      if (this.baseInfo.StockStatus === '上市' || this.baseInfo.IsOnStock == '1') {
        list.push('上市')
        if (this.baseInfo.StockType) list.push(this.baseInfo.StockType)
      }
      if (this.baseInfo.ProvinceName) list.push(this.baseInfo.ProvinceName)
      if (this.industryInfo.Industry) list.push(this.industryInfo.Industry)
      return list
    },
    /**
     * 横向滚动 tab 下的 indicator 位置和宽度
     * 每个 tab 占 22%
     */
    sliderStyle() {
      const index = Math.max(0, this.tabs.findIndex(item => item.key === this.activeTab))
      return {
        left: `${index * 22}%`,
        width: '22%'
      }
    },
    /**
     * 企业员工 / 主要人员列表
     * 数据来源：enterpriseData.businessInfo.Employees
     * 典型字段：姓名、职位、身份证号（脱敏）等
     * 用于：基础信息 Tab 的主要人员区块
     */
    employees() {
      return this.enterpriseData?.businessInfo?.Employees || []
    },
    /**
     * 股东及出资信息
     * 数据来源：enterpriseData.businessInfo.Partners
     * 典型字段：股东名称、认缴出资、实缴出资、出资日期、持股比例
     * 用于：基础信息 Tab 的股东及出资区块
     */
    partners() {
      return this.enterpriseData?.businessInfo?.Partners || []
    },
    /**
     * 分支机构列表
     * 数据来源：enterpriseData.businessInfo.Branches
     * 典型字段：分支机构名称、注册号、负责人、地址
     * 用于：基础信息 Tab 的分支机构区块
     */
    branches() {
      return this.enterpriseData?.businessInfo?.Branches || []
    },
    /**
     * 工商变更记录
     * 数据来源：enterpriseData.businessInfo.Changes
     * 典型字段：变更项目、变更前内容、变更后内容、变更日期
     * 用于：基础信息 Tab 的变更记录区块（时间线展示）
     */
    changes() {
      return this.enterpriseData?.businessInfo?.Changes || []
    },
    /**
     * 抽查检查信息（双随机抽查结果）
     * 数据来源：enterpriseData.businessInfo.SpotChecks
     * 典型字段：检查机关、检查类型、检查日期、检查结果
     * 用于：基础信息 Tab 的抽查检查区块
     */
    spotChecks() {
      return this.enterpriseData?.businessInfo?.SpotChecks || []
    },
    /**
     * 软件著作权列表
     * 数据来源：enterpriseData.copyrightInfo.items（注意是 items 不是 list）
     * 典型字段：软件名称、登记号、登记日期、版本号
     * 用于：知识资产 Tab 的软件著作权区块
     */
    copyrights() {
      return this.enterpriseData?.copyrightInfo?.items || []
    },
    /**
     * 软件著作权总数（用于标题角标）
     * 优先取分页器返回的 recordCount，没分页器则 fallback 到当前数组长度
     */
    copyrightCount() {
      return this.enterpriseData?.copyrightInfo?.page?.recordCount || this.copyrights.length
    },
    /**
     * 专利列表
     * 数据来源：enterpriseData.patentInfo.list
     * 典型字段：专利名称、专利号、申请日期、专利类型、申请人
     * 用于：知识资产 Tab 的专利区块
     */
    patents() {
      return this.enterpriseData?.patentInfo?.list || []
    },
    /**
     * 纳税信用信息
     * 数据来源：enterpriseData.businessInfo.TaxCreditItems
     * 典型字段：评价年度、信用等级、纳税人识别号、税务机关
     * 用于：纳税信息 Tab
     */
    taxCredits() {
      return this.enterpriseData?.businessInfo?.TaxCreditItems || []
    },
    /**
     * 行政许可列表
     * 数据来源：enterpriseData.businessInfo.Permissions
     * 典型字段：许可文件名称、许可编号、有效期、许可机关
     * 用于：知识资产 Tab 的行政许可区块
     */
    permissions() {
      return this.enterpriseData?.businessInfo?.Permissions || []
    },
    /**
     * 失信被执行人记录
     * 数据来源：enterpriseData.disEnforcementInfo（兼容 .list 字段）
     * 典型字段：被执行人、案号、执行法院、立案日期、失信行为
     * 用于：风险信息 Tab 的失信记录区块
     */
    disEnforcements() {
      const list = this.enterpriseData?.disEnforcementInfo?.list || this.enterpriseData?.disEnforcementInfo || []
      if (list && list.length) return list
      return []
    },
    /**
     * 法律诉讼记录
     * 数据来源：enterpriseData.lawsuitInfo.items（兼容 LawsuitInfo 大小写）
     * 典型字段：案号、案由、原告、被告、审理法院、判决结果、标的金额
     * 用于：风险信息 Tab 的法律诉讼区块
     */
    lawsuits() {
      const info = this.enterpriseData?.lawsuitInfo || this.enterpriseData?.LawsuitInfo || {}
      return info?.items || []
    },
    // 企业年报数据（最多显示最近3年）
    annualReportInfo() {
      const info = this.enterpriseData?.annualReportInfo || []
      return info.slice(0, 3)
    }
  },
  watch: {
    keyword: {
      immediate: true,
      handler(val) {
        if (val) this.fetchEnterpriseDetail()
      }
    }
  },
  methods: {
    getFirstChar(name) {
      if (!name) return '企'
      return name.charAt(0)
    },
    getTagClass(tag) { // 根据标签内容返回对应颜色类名
      if (!tag) return ''
      if (tag.includes('存续') || tag.includes('开业') || tag.includes('在业')) return 'pill-green'
      if (tag === '上市') return 'pill-blue'
      if (tag.includes('科创板') || tag.includes('A股') || tag.includes('新三板')) return 'pill-orange'
      if (tag.includes('吊销') || tag.includes('注销') || tag.includes('撤销')) return 'pill-red'
      return 'pill-gray'
    },
    formatRegMoney(val) {
      if (!val) return '-'
      const str = String(val)
      return str.replace(/(\d+\.\d*?)0+(?=\D|$)/g, '$1').replace(/(\d+)\.(?=\D|$)/g, '$1')
    },
    /**
     * 把"1234567.89"格式化为带千分位 + 元单位的金额
     * 输入为空时返回 '-'，避免 0 元时出现 "-0"
     */
    formatMoney(val) {
      if (val === null || val === undefined || val === '') return '-'
      const num = Number(val)
      if (Number.isNaN(num)) return String(val)
      const fixed = num.toFixed(2)
      const [intPart, decPart] = fixed.split('.')
      const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return `${withSep}.${decPart}`
    },
    /**
     * 统一字段非空判断（兼容 0 值）
     */
    hasField(val) {
      return val !== undefined && val !== null && val !== ''
    },
    /**
     * 判断 AssetsData 中是否有至少一个非空字段
     */
    hasAnyAssets(assets) {
      if (!assets) return false
      const keys = ['TotalAssets', 'TotalOwnersEquity', 'TotalLiabilities', 'GrossTradingIncome', 'MainBusinessIncome', 'TotalProfit', 'NetProfit', 'TotalTaxAmount']
      return keys.some(k => this.hasField(assets[k]))
    },
    /**
     * 判断 BasicInfoData 中是否有任意状态标签
     */
    hasAnyStatus(bi) {
      return this.hasField(bi.HasWebSite) || this.hasField(bi.HasNewStockOrByStock) || this.hasField(bi.IsStockRightTransfer) || this.hasField(bi.HasProvideAssurance)
    },
    formatDate(val) {
      if (!val) return '-'
      const str = String(val)
      const m = str.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
      if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
      return str.split(' ')[0]
    },
    formatPercent(val) {
      if (val === null || val === undefined || val === '') return '-'
      const num = Number.parseFloat(val)
      if (Number.isNaN(num)) return String(val)
      const percent = num <= 1 ? num * 100 : num
      return `${percent.toFixed(2)}%`
    },
    percentWidth(val) {
      if (val === null || val === undefined || val === '') return '0%'
      const num = Number.parseFloat(val)
      if (Number.isNaN(num)) return '0%'
      const percent = num <= 1 ? num * 100 : num
      return `${Math.max(0, Math.min(percent, 100)).toFixed(2)}%`
    },
    copyCreditNo(code) {
      uni.setClipboardData({
        data: code,
        success: () => uni.showToast({ title: '已复制信用代码', icon: 'success' })
      })
    },
    callPhone(phone) {
      if (!phone) return
      uni.makePhoneCall({ phoneNumber: phone })
    },
    async fetchEnterpriseDetail() {
      if (!this.keyword) return
      this.loading = true
      try {
        const res = await searchEnterprise({ keyword: this.keyword })
        if (res && res.code === 0) {
          this.enterpriseData = res.data
        } else {
          uni.showToast({ title: '未能成功获取工商详情', icon: 'none' })
        }
      } catch (err) {
        uni.showToast({ title: '穿透接口请求失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    switchTab(tabKey) {
      this.activeTab = tabKey
    },
    /**
     * 打开企业官网：先弹窗让用户确认/复制
     * 自动补全协议头（http:// 或 https://）
     */
    openWebSite(url) {
      if (!url) return
      let target = String(url).trim()
      if (!/^https?:\/\//i.test(target)) target = 'https://' + target
      this.webSiteDialogUrl = target
      this.webSiteDialogVisible = true
    },
    /**
     * "打开/复制" 主按钮：
     *   - H5：直接 window.open 新窗口
     *   - App：plus.runtime.openURL 调起浏览器
     *   - 微信小程序：复制到剪贴板（小程序无 openURL API）
     */
    confirmOpenWebSite() {
      const url = this.webSiteDialogUrl
      // #ifdef H5
      this.webSiteDialogVisible = false
      window.open(url, '_blank')
      return
      // #endif
      // #ifdef APP-PLUS
      this.webSiteDialogVisible = false
      plus.runtime.openURL(url, () => {
        uni.setClipboardData({ data: url, success: () => {
          uni.showToast({ title: '打开失败，链接已复制', icon: 'none' })
        }})
      })
      return
      // #endif
      // #ifdef MP-WEIXIN
      // 微信小程序：弹窗先保留，复制成功后再关，让用户看清"已复制"提示
      uni.setClipboardData({
        data: url,
        success: () => {
          uni.showToast({ title: '链接已复制，请到浏览器粘贴打开', icon: 'none', duration: 2200 })
          // 稍等 toast 显示后再关弹窗
          setTimeout(() => { this.webSiteDialogVisible = false }, 400)
        },
        fail: () => {
          uni.showToast({ title: '复制失败，请手动复制', icon: 'none' })
        }
      })
      // #endif
    },
    copyWebSite() {
      uni.setClipboardData({
        data: this.webSiteDialogUrl,
        success: () => uni.showToast({ title: '已复制', icon: 'none' })
      })
    },
    closeWebSiteDialog() {
      this.webSiteDialogVisible = false
    }
  }
}
</script>

<style scoped lang="scss">
.enterprise-detail-component {
  min-height: 100vh;
  position: relative;
  font-family: 'Microsoft YaHei', sans-serif;
  padding: 24rpx;
  box-sizing: border-box;
  // background:
  //   radial-gradient(circle at top left, rgba(59, 130, 246, 0.2), transparent 22%),
  //   radial-gradient(circle at top right, rgba(124, 58, 237, 0.15), transparent 20%),
  //   linear-gradient(180deg, #f7f9fc 0%, #eef2f8 100%);
}

.page-shell {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.loading-screen {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 80rpx;
  overflow: hidden;
}

// 背景柔光斑
.loading-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(20px);
  pointer-events: none;
  z-index: 0;
}

.loading-blob-1 {
  width: 360rpx;
  height: 360rpx;
  top: -60rpx;
  right: -80rpx;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.28), transparent 65%);
}

.loading-blob-2 {
  width: 280rpx;
  height: 280rpx;
  bottom: 80rpx;
  left: -60rpx;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.22), transparent 70%);
}

// 主卡片（白底 + 投影）
.loading-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 660rpx;
  padding: 56rpx 40rpx 40rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  border: 1rpx solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 24rpx 60rpx rgba(15, 23, 42, 0.08);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

// 旋转环 + 中心点
.loading-ring-wrap {
  position: relative;
  width: 140rpx;
  height: 140rpx;
  margin-bottom: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-ring {
  position: absolute;
  border-radius: 50%;
  border-style: solid;
  border-color: transparent;
}

.loading-ring-1 {
  inset: 0;
  border-width: 4rpx;
  border-top-color: #3775fb;
  border-right-color: rgba(55, 117, 251, 0.25);
  animation: ringSpin 1.2s linear infinite;
}

.loading-ring-2 {
  inset: 16rpx;
  border-width: 3rpx;
  border-bottom-color: #7c3aed;
  border-left-color: rgba(124, 58, 237, 0.2);
  animation: ringSpin 0.9s linear infinite reverse;
}

.loading-ring-3 {
  inset: 30rpx;
  border-width: 2rpx;
  border-top-color: #60a5fa;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: transparent;
  animation: ringSpin 1.6s linear infinite;
}

.loading-dot {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #3775fb, #7c3aed);
  box-shadow: 0 0 18rpx rgba(55, 117, 251, 0.5);
  animation: dotPulse 1.4s ease-in-out infinite;
}

.loading-kicker {
  display: block;
  font-size: 20rpx;
  letter-spacing: 4rpx;
  font-weight: 700;
  color: #7c3aed;
  opacity: 0.75;
}

.loading-title {
  display: block;
  margin-top: 10rpx;
  font-size: 36rpx;
  font-weight: 800;
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.loading-subtitle {
  display: block;
  margin-top: 12rpx;
  margin-bottom: 36rpx;
  font-size: 24rpx;
  line-height: 1.7;
  color: #64748b;
  max-width: 520rpx;
}

// 骨架预览区
.loading-skeleton {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  align-items: stretch;
}

.skeleton-hero {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 22rpx 24rpx;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 22rpx;
  border: 1rpx solid rgba(15, 23, 42, 0.04);
}

.skel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14rpx;
}

.skel-block {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 22rpx 24rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 22rpx;
  border: 1rpx solid rgba(15, 23, 42, 0.04);
}

.skel-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

// 所有骨架条通用：渐变 + shimmer 动画
.skel-row {
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, #eef2f7 0%, #f6f8fc 50%, #eef2f7 100%);
  background-size: 200% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
  border-radius: 10rpx;
}

.skel-logo {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  flex-shrink: 0;
}

.skel-cell {
  height: 96rpx;
  border-radius: 18rpx;
}

.skel-line {
  height: 22rpx;
  border-radius: 6rpx;
}

.skel-line-1 { width: 70%; }
.skel-line-2 { width: 45%; }
.skel-line-3 { width: 90%; }
.skel-line-4 { width: 40%; height: 24rpx; }
.skel-line-5 { width: 100%; }
.skel-line-6 { width: 80%; }

.hero-zone,
.section-nav,
.feature-layout > view,
.column-card,
.vault-card,
.asset-tile,
.timeline-card,
.scene-card,
.story-card,
.hero-action,
.hero-credit {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 16rpx 40rpx rgba(15, 23, 42, 0.07);
}
.story-card-white {
  background: rgba(255, 255, 255, 0.9) !important;
}

.hero-zone {
  position: relative;
  overflow: hidden;
  border-radius: 36rpx;
  padding: 28rpx;
}

.hero-bg {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(12px);
}

.hero-bg-1 {
  width: 300rpx;
  height: 300rpx;
  top: -100rpx;
  right: -80rpx;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.18), transparent 65%);
}

.hero-bg-2 {
  width: 220rpx;
  height: 220rpx;
  left: -60rpx;
  bottom: -50rpx;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.14), transparent 70%);
}

.hero-grid {
  position: absolute;
  inset: 0;
  opacity: 0.24;
  background-image: linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
  background-size: 38rpx 38rpx;
  pointer-events: none;
}

.hero-topline,
.hero-main,
.hero-snapshots,
.hero-actions {
  position: relative;
  z-index: 1;
}

.hero-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  font-size: 24rpx;
  letter-spacing: 2rpx;
  color: #64748b;
  text-transform: uppercase;
  flex-shrink: 0;
}

.eyebrow-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #2563eb;
}

.hero-pills {
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.hero-pill {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.pill-green {
  background: #b2f6d6;
  color: #059669;
}

.pill-blue {
  background: #c5dcf9;
  color: #2563eb;
}

.pill-orange {
  background: #ffead1;
  color: #ea580c;
}

.pill-red {
  background: #f5c7c7;
  color: #dc2626;
}

.pill-gray {
  background: #dde6f6;
  color: #6b7280;
}

.hero-main {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-top: 22rpx;
}

.hero-letterbox {
  position: relative;
  width: 126rpx;
  height: 126rpx;
  flex-shrink: 0;
}

.hero-letter {
  position: relative;
  z-index: 2;
  width: 126rpx;
  height: 126rpx;
  border-radius: 34rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 52rpx;
  font-weight: 900;
  background: linear-gradient(135deg, #0957ff 0%, #3c85ff 100%);
  box-shadow: 0 18rpx 42rpx rgba(37, 99, 235, 0.34);
}

.hero-letter-ring {
  position: absolute;
  inset: -16rpx;
  border-radius: 42rpx;
}

.hero-copy {
  flex: 1;
  min-width: 0;
}

.company-name {
  display: block;
  font-size: 34rpx;
  line-height: 1.25;
  font-weight: 900;
  color: #333;
}

.company-subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #2563eb;
  font-weight: 700;
}

.company-address {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #64748b;
  line-height: 1.7;
}

.hero-snapshots {
  margin-top: 22rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14rpx;
}

.snapshot {
  padding: 18rpx;
  border-radius: 22rpx;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.snapshot.big {
  grid-column: span 2;
  // background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(124, 58, 237, 0.08));
}

.snapshot-credit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.snapshot-label,
.action-label,
.scene-label,
.split-label,
.feature-kicker,
.story-kicker,
.vault-title,
.column-title,
.asset-meta,
.branch-sub,
.share-percent {
  display: block;
  font-size: 24rpx;
  color: #64748b;
}

.snapshot-value,
.action-value,
.scene-value,
.split-value,
.story-text,
.branch-name,
.asset-name,
.vault-name,
.share-name,
.timeline-body {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  line-height: 1.55;
  color: #333;
}

.people-name {
  display: block;
  font-size: 26rpx;
  line-height: 1.4;
  color: #333;
}

.people-role {
  display: block;
  margin-top: 2rpx;
  font-size: 24rpx;
  color: #64748b;
}

.hero-actions {
  margin-top: 18rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14rpx;
}

.hero-action {
  padding: 18rpx;
  border-radius: 22rpx;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.copy-badge {
  flex-shrink: 0;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  color: #fff;
  font-size: 24rpx;
}

.mono {
  font-family: monospace;
}

.section-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  border-radius: 28rpx;
  padding: 10rpx;
  overflow: hidden; // 让 track 圆角裁切生效
  background: #f9faff;
}

// 横向滚动容器：每个 tab 占 22%，支持横向滑动
.section-nav-scroll {
  width: 100%;
  white-space: nowrap;
}

// track 使用 flex 布局，每个 tab 占 22%
.section-nav-track {
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  border-radius: 22rpx;
  width: max-content;
  min-width: 100%;
}

.section-nav-indicator {
  position: absolute;
  top: 0;
  bottom: 0;
  // 宽度由 sliderStyle 动态给出（22%/项）
  border-radius: 18rpx;
  background: linear-gradient(135deg, #3775fb 0%, #3c85ff 100%);
  box-shadow: 0 10rpx 24rpx rgba(37, 99, 235, 0.24);
  transition: left 0.25s ease;
  z-index: 0;
}

.section-nav-item {
  position: relative;
  z-index: 1;
  flex: 0 0 22%;            // 每个 tab 占 22%
  padding: 22rpx 4rpx;
  text-align: center;
  box-sizing: border-box;
}

.section-nav-name {
  font-size: 24rpx;
  font-weight: 800;
  color: #475569;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section-nav-item.active .section-nav-name {
  color: #fff;
}

// 企业年报占位卡片：保持和其它 column-card 视觉一致，内容用 empty-state 居中
.annual-placeholder {
  min-height: 320rpx;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

// 年报内部的子分组（基础组卡片样式），与基础档案 Tab 视觉保持一致
.annual-subgroup {
  margin-top: 18rpx;
  background: rgba(248, 250, 252, 0.7);
  border: 1rpx solid rgba(15, 23, 42, 0.04);
  box-shadow: none;
}

// 年报基础信息中的状态标签行（横排不换行）
.annual-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 8rpx;
}

.annual-tag-row .basic-tag {
  font-size: 24rpx;
  padding: 4rpx 14rpx;
}

// 年报内的企业网站列表
.website-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 14rpx;
}

.website-item {
  display: flex;
  gap: 12rpx;
  padding: 16rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.82);
}

.website-rank {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3775fb 0%, #3c85ff 100%);
  color: white;
  font-size: 24rpx;
  font-weight: 900;
}

.website-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.website-name {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  line-height: 1.4;
  color: #333;
  word-break: break-all;
}

.website-url {
  display: block;
  font-size: 24rpx;
  color: #2563eb;
  text-decoration: underline;
  word-break: break-all;
}

.website-type {
  display: block;
  font-size: 24rpx;
  color: #64748b;
}

// 年报内的对外投资列表
.invest-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 14rpx;
}

.invest-item {
  display: flex;
  gap: 12rpx;
  padding: 16rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.82);
}

.invest-rank {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3775fb 0%, #3c85ff 100%);
  color: white;
  font-size: 24rpx;
  font-weight: 900;
  position: relative;
  top: 4rpx;
}

.invest-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.invest-name {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  line-height: 1.4;
  color: #3775fb;
  word-break: break-all;
}

.invest-meta {
  gap: 12rpx 24rpx;
  margin-top: 6rpx;
}

.invest-meta-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  line-height: 44rpx;
}

.invest-meta-label {
  font-size: 24rpx;
  color: #64748b;
}

.invest-meta-value {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: #333;
  word-break: break-all;
}

// 年报表格（股东出资 / 网站网店）
.annual-table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-top: 14rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.82);
}

.annual-table {
  min-width: 900rpx;
  display: flex;
  flex-direction: column;
}

.annual-table-head {
  display: flex;
  background: linear-gradient(135deg, #3775fb 0%, #3c85ff 100%);
  padding: 16rpx 14rpx;
  border-radius: 16rpx 16rpx 0 0;
}

.annual-table-row {
  display: flex;
  padding: 16rpx 14rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.annual-table-row:last-child {
  border-bottom: none;
  border-radius: 0 0 16rpx 16rpx;
}

.at-col {
  font-size: 24rpx;
  color: #333;
  padding: 0 8rpx;
  word-break: break-all;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  overflow: hidden;
}

.at-col-1 { flex: 1; }
.at-col-2 { flex: 2; }

.at-cell-name {
  font-weight: 600;
  color: #2563eb;
}

.at-cell-link { color: #2563eb; }
.at-cell-link-active { text-decoration: underline; cursor: pointer; }

// 年报经营变更/股权变更时间线（简化版）
.annual-change {
  margin-top: 14rpx;
}

.annual-change .change-item {
  display: flex;
  gap: 12rpx;
  padding: 14rpx 0;
  border-bottom: 1rpx dashed rgba(0, 0, 0, 0.07);
}

.annual-change .change-item:last-child {
  border-bottom: none;
}

.annual-change .change-mark {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #3775fb 0%, #3c85ff 100%);
  box-shadow: 0 0 0 8rpx rgba(55, 117, 251, 0.08);
  flex-shrink: 0;
  margin-top: 22rpx;
}

.annual-change .change-card {
  flex: 1;
  min-width: 0;
  padding: 0;
  background: none;
  margin-top: 0;
}

.annual-change .change-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 6rpx;
}

.annual-change .change-date {
  font-size: 24rpx;
  color: #94a3b8;
  flex-shrink: 0;
}

.annual-change .change-tag {
  font-size: 26rpx;
  font-weight: 600;
  color: #3775fb;
  margin-bottom: 6rpx;
  display: block;
}

.annual-change .change-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  line-height: 44rpx;
}

.annual-change .change-label {
  font-size: 24rpx;
  flex-shrink: 0;
}

.annual-change .change-value {
  font-size: 24rpx;
  flex: 1;
  min-width: 0;
  word-break: break-all;
  color: #333;
}

// 年报对外担保列表
.assurance-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 14rpx;
}

.assurance-item {
  display: flex;
  gap: 12rpx;
  padding: 16rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.82);
}

.assurance-rank {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  color: white;
  font-size: 24rpx;
  font-weight: 900;
  position: relative;
  top: 4rpx;
}

.assurance-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.assurance-name {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  line-height: 1.4;
  color: #d97706;
  word-break: break-all;
}

.assurance-meta {
  gap: 12rpx 24rpx;
  margin-top: 6rpx;
}

.assurance-meta-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  line-height: 44rpx;
}

.assurance-meta-label {
  font-size: 24rpx;
  color: #64748b;
}

.assurance-meta-value {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: #333;
  word-break: break-all;
}

// 股东及出资信息卡片
.partner-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 14rpx;
}

.partner-item {
  padding: 18rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.82);
}

.partner-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 14rpx;
  padding-bottom: 14rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.partner-rank {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3775fb 0%, #3c85ff 100%);
  color: white;
  font-size: 24rpx;
  font-weight: 900;
}

.partner-name {
  flex: 1;
  font-size: 28rpx;
  font-weight: 600;
  color: #2563eb;
  word-break: break-all;
}

.partner-detail {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.partner-section {
  background: rgba(245, 247, 250, 0.7);
  border-radius: 12rpx;
  padding: 12rpx 14rpx;
}

.partner-section-title {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12rpx;
}

.partner-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4rpx 0;
}

.partner-label {
  font-size: 24rpx;
  color: #64748b;
}

.partner-value {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
  text-align: right;
  max-width: 55%;
  word-break: break-all;
}

// 网站或网店信息卡片
.website-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-top: 14rpx;
}

.website-item {
  display: flex;
  gap: 14rpx;
  padding: 16rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.82);
}

.website-rank {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-size: 24rpx;
  font-weight: 900;
  position: relative;
  top: 4rpx;
}

.website-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.website-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.website-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #059669;
  word-break: break-all;
}

.website-type {
  font-size: 20rpx;
  padding: 2rpx 10rpx;
  border-radius: 20rpx;
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.website-url {
  font-size: 24rpx;
  color: #2563eb;
  word-break: break-all;
}

// 社保信息卡片
.social-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-top: 14rpx;
}

.social-item {
  padding: 16rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.82);
}

.social-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
  padding-bottom: 12rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.social-rank {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2563eb 0%, #2563eb 100%);
  color: white;
  font-size: 24rpx;
  font-weight: 900;
}

.social-name {
  flex: 1;
  font-size: 26rpx;
  font-weight: 600;
  color: #2563eb;
  word-break: break-all;
}

.social-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
}

.social-cell {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  background: rgba(245, 247, 250, 0.7);
  border-radius: 10rpx;
  padding: 10rpx 12rpx;
}

.social-label {
  font-size: 24rpx;
  color: #64748b;
}

.social-value {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
  margin-top: 4rpx;
}

// 金额红色（亏损/欠税等）
.red {
  color: #dc2626 !important;
}

.content-grid {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding-bottom: 24rpx;
}

.feature-layout {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.feature-lead {
  padding: 24rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 16rpx 40rpx rgba(15, 23, 42, 0.07);
}

.feature-lead.compact {
  padding: 22rpx 24rpx;
}

.feature-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14rpx;
}

.feature-title {
  display: block;
  margin-top: 8rpx;
  font-size: 34rpx;
  font-weight: 900;
  color: #333;
}

.feature-summary {
  margin-top: 12rpx;
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.7;
}

.info-scene {
  display: grid;
  gap: 14rpx;
}

.scene-a {
  grid-template-columns: 1.2fr 1fr;
}

.scene-card {
  padding: 20rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.9);
}

.scene-large {
  min-height: 128rpx;
}

.basic-layout {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.basic-group {
  padding: 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 16rpx 40rpx rgba(15, 23, 42, 0.07);
}

.basic-group-head {
  display: flex;
  margin-bottom: 16rpx;
  padding-bottom: 12rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.basic-group-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #333;
}

.basic-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14rpx 20rpx;
}

.basic-cell {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  padding: 10rpx 0;
}

.basic-cell.full {
  grid-column: span 2;
}

.basic-label {
  display: block;
  font-size: 24rpx;
  color: #707884;
  line-height: 1.4;
}

.basic-value {
  display: block;
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  line-height: 1.5;
  word-break: break-all;
}

.basic-value.blue {
  color: #2563eb;
}

.basic-value.orange {
  color: #f59e0b;
  font-weight: 600;
}

.basic-value.green {
  color: #22c55e;
}

.basic-tag {
  display: inline-block;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 500;
  width: fit-content;
}

.pill-green {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
}

.pill-blue {
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
}

.pill-orange {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}

.pill-red {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}

.pill-gray {
  background: rgba(148, 163, 184, 0.12);
  color: #64748b;
}

.basic-value.block {
  white-space: pre-wrap;
  line-height: 1.8;
}

.scene-value.block,
.split-value.block {
  white-space: pre-wrap;
  line-height: 1.8;
}

.story-card,
.split-card,
.column-card,
.vault-card,
.asset-tile,
.timeline-card {
  padding: 20rpx;
  border-radius: 24rpx;
}

.story-card {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.06), rgba(124, 58, 237, 0.04));
}

.story-header,
.vault-head,
.timeline-headline {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.column-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding-bottom: 12rpx;
  margin-bottom: 4rpx;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
}

.story-title,
.vault-title {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #333;
}

.column-title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #fe9700;
  padding-left: 6rpx;
}

.story-badge,
.column-count,
.vault-count,
.timeline-tag {
  padding: 8rpx 12rpx;
  border-radius: 999rpx;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  font-size: 20rpx;
  flex-shrink: 0;
  margin-left: 12rpx;
}

.story-inline {
  margin-top: 20rpx;
}

.split-panel-inline {
  grid-template-columns: 1fr;
}

@media screen and (min-width: 750px) {
  .split-panel-inline {
    grid-template-columns: 1fr 1fr;
  }
}

.tone-a {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.06), rgba(59, 130, 246, 0.04));
}

.tone-b {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.06), rgba(59, 130, 246, 0.04));
}

.dual-columns {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.share-list,
.branch-list,
.vault-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 14rpx;
}

.share-row,
.branch-item,
.vault-item {
  display: flex;
  gap: 12rpx;
  padding: 16rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.82);
}

.people-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14rpx;
  margin-top: 14rpx;
}

.people-card {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 16rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.9);
}

.people-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #3775fb 0%, #3c85ff 100%);
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.people-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.share-rank,
.branch-dot {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24rpx;
  position: relative;
  top: 10rpx;
}

.share-rank {
  background: linear-gradient(135deg, #eff6ff 0%, #ede9fe 100%);
  color: #2563eb;
  font-size: 24rpx;
  font-weight: 900;
}

.branch-dot {
  background: linear-gradient(135deg, #3775fb 0%, #3c85ff 100%);
  box-shadow: 0 0 0 8rpx rgba(37, 99, 235, 0.08);
}

.share-body,
.branch-body {
  flex: 1;
  min-width: 0;
}

.branch-body {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.branch-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx 24rpx;
}

.branch-meta-item {
  display: flex;
  flex-wrap: wrap;
  margin-top: 6rpx;
  gap: 8rpx;
}

.branch-meta-label {
  font-size: 26rpx;
  color: #333;
}

.branch-meta-value {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #333;
  word-break: break-all;
}

.copyright-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 14rpx;
}

.copyright-item {
  display: flex;
  gap: 12rpx;
  padding: 16rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.82);
}

.copyright-dot {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24rpx;
  background: linear-gradient(135deg, #3775fb 0%, #3c85ff 100%);
  box-shadow: 0 0 0 8rpx rgba(55, 117, 251, 0.08);
}

.copyright-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.copyright-name {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  line-height: 1.4;
  color: #3775fb;
}

.copyright-meta {
  gap: 12rpx 24rpx;
  margin-top: 4rpx;
}

.copyright-meta-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  line-height: 50rpx;
}

.copyright-meta-label {
  width: 120rpx;
  font-size: 26rpx;
  color: #333;
}

.copyright-meta-value {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #333;
  word-break: break-all;
}

.share-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.share-percent {
  color: #2563eb;
  font-size: 24rpx;
}

.share-track {
  margin-top: 10rpx;
  height: 12rpx;
  border-radius: 999rpx;
  background: #e2e8f0;
  overflow: hidden;
}

.share-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #2563eb 0%, #3c85ff 100%);
}

.asset-gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14rpx;
}

.asset-tile {
  display: flex;
  gap: 14rpx;
  align-items: flex-start;
}

.asset-icon {
  width: 50rpx;
  height: 50rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #eff6ff 0%, #ede9fe 100%);
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  flex-shrink: 0;
}

.asset-copy {
  flex: 1;
  min-width: 0;
}

.timeline-panel {
  position: relative;
  padding-left: 28rpx;
}

.timeline-panel::before {
  content: '';
  position: absolute;
  left: 10rpx;
  top: 0;
  bottom: 0;
  width: 2rpx;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.35), rgba(124, 58, 237, 0.18));
}

.change-timeline {
  position: relative;
  margin-top: 40rpx;
}

.change-timeline::before {
  content: '';
  position: absolute;
  left: 104rpx;
  top: 0;
  bottom: 0;
  width: 2rpx;
  background: linear-gradient(180deg, rgba(55, 117, 251, 0.35), rgba(60, 133, 255, 0.18));
}

.change-item {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
  margin-bottom: 18rpx;
}

.change-date {
  width: 80rpx;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2rpx;
}

.change-year {
  font-size: 24rpx;
  margin-top: -4rpx;
  color: #526794;
}

.change-monthday {
  font-size: 26rpx;
  color: #3775fb;
}

.change-mark {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #3775fb 0%, #3c85ff 100%);
  box-shadow: 0 0 0 8rpx rgba(55, 117, 251, 0.08);
  flex-shrink: 0;
  margin-left: 4rpx;
  margin-right: 4rpx;
}

.change-card {
  flex: 1;
  min-width: 0;
  padding: 0 16rpx 16rpx 16rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.9);
  margin-top: -16rpx;
}

.change-tag {
  display: inline-block;
  padding: 4rpx 0;
  border-radius: 10rpx;
  // background: linear-gradient(135deg, #eff6ff 0%, #ede9fe 100%);
  color: #3775fb;
  font-size: 26rpx;
  font-weight: 600;
  margin-bottom: 6rpx;
}

.change-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  line-height: 50rpx;
  margin-top: 4rpx;
}

.change-label {
  font-size: 26rpx;
  color: #333;
  flex-shrink: 0;
}

.change-value {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  word-break: break-all;
}

.change-value.old {
  color: #333;
}

.change-value.new {
  color: #333;
  font-weight: 500;
}

.perm-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 14rpx;
}

.perm-item {
  display: flex;
  gap: 12rpx;
  padding: 16rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.82);
}

.perm-rank {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #2563eb 0%, #3c85ff 100%);
  color: white;
  font-size: 24rpx;
  font-weight: 900;
  position: relative;
  top: 4rpx;
}

.perm-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.perm-name {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  line-height: 1.4;
  color: #333;
}

.perm-meta {
  gap: 12rpx 24rpx;
  margin-top: 12rpx;
}

.perm-meta-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  line-height: 50rpx;
}

.perm-meta-label {
  font-size: 26rpx;
  color: #333;
}

.perm-meta-value {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #333;
  word-break: break-all;
}

.patent-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 14rpx;
}

.patent-item {
  display: flex;
  gap: 12rpx;
  padding: 16rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.82);
}

.patent-rank {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #2563eb 0%, #3c85ff 100%);
  color: white;
  font-size: 24rpx;
  font-weight: 900;
  position: relative;
  top: 4rpx;
}

.patent-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.patent-name {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  line-height: 1.4;
  color: #3c85ff;
}

.patent-meta {
  gap: 12rpx 24rpx;
  margin-top: 8rpx;
}

.patent-meta-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  line-height: 50rpx;
}

.patent-meta-label {
  // width: 126rpx;
  font-size: 26rpx;
  color: #333;
  // text-align: right;
}

.patent-meta-value {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #333;
  word-break: break-all;
}

.dishonest-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 14rpx;
}

.dishonest-item {
  display: flex;
  gap: 12rpx;
  padding: 16rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.82);
}

.dishonest-rank {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%);
  color: white;
  font-size: 24rpx;
  font-weight: 900;
}

.dishonest-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.dishonest-name {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  line-height: 1.4;
  color: #ef4444;
}

.dishonest-meta {
  gap: 12rpx 24rpx;
  margin-top: 8rpx;
}

.dishonest-meta-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  line-height: 44rpx;
}

.dishonest-meta-label {
  font-size: 24rpx;
  color: #64676a;
}

.dishonest-meta-value {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  color: #333;
  word-break: break-all;
}

.spot-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 14rpx;
}

.spot-item {
  display: flex;
  gap: 12rpx;
  padding: 16rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.82);
}

.spot-rank {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #2563eb 0%, #3c85ff 100%);
  color: white;
  font-size: 24rpx;
  font-weight: 900;
}

.spot-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.spot-name {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  line-height: 1.4;
  color: #333;
}

.spot-meta {
  gap: 12rpx 24rpx;
  margin-top: 8rpx;
}

.spot-meta-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 18rpx;
}

.spot-meta-label {
  font-size: 26rpx;
  color: #333;
}

.spot-meta-value {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #333;
  word-break: break-all;
}

.tax-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 14rpx;
}

.tax-item {
  display: flex;
  gap: 12rpx;
  padding: 16rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.82);
}

.tax-rank {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #2563eb 0%, #3c85ff 100%);
  color: white;
  font-size: 24rpx;
  font-weight: 900;
}

.tax-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.tax-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.tax-year {
  font-size: 28rpx;
  font-weight: 700;
  color: #333;
}

.tax-level {
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
  background: linear-gradient(135deg, #eff6ff 0%, #ede9fe 100%);
  color: #3775fb;
  font-size: 24rpx;
  font-weight: 700;
}

.tax-meta {
  gap: 12rpx 24rpx;
  margin-top: 8rpx;
}

.tax-meta-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  line-height: 50rpx;
}

.tax-meta-label {
  width: 116rpx;
  font-size: 26rpx;
  text-align: right;
  color: #333;
}

.tax-meta-value {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #333;
  word-break: break-all;
}

.stack-vault {
  margin-top: 4rpx;
}

@keyframes ringSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes dotPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 18rpx rgba(55, 117, 251, 0.5);
  }
  50% {
    transform: scale(1.3);
    box-shadow: 0 0 32rpx rgba(124, 58, 237, 0.7);
  }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.lawsuit-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 14rpx;
}

.lawsuit-item {
  display: flex;
  gap: 12rpx;
  padding: 16rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.82);
}

.lawsuit-rank {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 900;
}

.lawsuit-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.lawsuit-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.4;
  color: #ef4444;
}
.red {
  color: #ef4444 !important;
}
.lawsuit-meta {
  gap: 12rpx 24rpx;
  margin-top: 8rpx;
}

.lawsuit-meta-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  line-height: 50rpx;
}

.lawsuit-meta-label {
  font-size: 26rpx;
  text-align: right;
  color: #333;
  width: 130rpx;
}

.lawsuit-meta-value {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #333;
  word-break: break-all;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 0;
}

.empty-state-text {
  font-size: 26rpx;
  color: #94a3b8;
  font-weight: 500;
}

// 官网字段：蓝色超链接
.snapshot-link {
  color: #2563eb !important;
  text-decoration: underline;
}

// 官网确认弹窗
.webs-dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 0 60rpx;
}

.webs-dialog {
  width: 100%;
  max-width: 600rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 36rpx 32rpx 28rpx;
  box-shadow: 0 20rpx 50rpx rgba(15, 23, 42, 0.2);
}

.webs-dialog-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #0f172a;
  text-align: center;
  margin-bottom: 24rpx;
}

.webs-dialog-url {
  font-size: 26rpx;
  color: #2563eb;
  background: #f1f5f9;
  padding: 20rpx 24rpx;
  border-radius: 12rpx;
  word-break: break-all;
  text-align: center;
  line-height: 1.5;
  text-decoration: underline;
}

.webs-dialog-hint {
  font-size: 24rpx;
  color: #94a3b8;
  text-align: center;
  margin-top: 12rpx;
}

.webs-dialog-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 28rpx;
}

.webs-btn {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 14rpx;
  font-size: 28rpx;
  font-weight: 700;
}

.webs-btn--cancel {
  background: #f1f5f9;
  color: #475569;
}

.webs-btn--ok {
  background: linear-gradient(135deg, #3775fb 0%, #3c85ff 100%);
  color: #ffffff;
  box-shadow: 0 6rpx 16rpx rgba(55, 117, 251, 0.3);
}
</style>
