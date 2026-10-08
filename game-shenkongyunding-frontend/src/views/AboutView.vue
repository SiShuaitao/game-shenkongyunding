<script setup lang="ts">
import { useReveal } from '@/composables/useReveal'

useReveal()

const values = [
  {
    icon: '◈',
    title: '童话',
    desc: '以欧式童话魔幻笔触构筑云端王国，让每一位玩家找回童年仰望天空时的那份心动。'
  },
  {
    icon: '❀',
    title: '治愈',
    desc: '柔和马卡龙色调与轻快旋律共鸣，把每一次航行都酿成放松心灵的治愈之旅。'
  },
  {
    icon: '✦',
    title: '自由',
    desc: '飞船自由航行、岛屿随机探索、UGC 造船，把整片云海交给玩家去书写。'
  }
]

const milestones = [
  { year: '2024', event: '深空云顶立项', desc: '一支相信童话魔幻仍有无限可能的团队，开始构筑漂浮的云端王国。' },
  { year: '2025', event: '城堡全景技术首曝', desc: '开放世界空中城堡全景动态铺展技术预演完成，奠定云端视觉基础。' },
  { year: '2026', event: '空中飞船系统揭晓', desc: '飞船自由航行与 UGC 建造系统公开，玩家驾驭飞舟穿行云海。' },
  { year: '2026', event: '首次测试开启', desc: '云端王国大门首次向旅人开启，四大势力角色陆续登场。' }
]
</script>

<template>
  <div class="page">
    <!-- Hero -->
    <section class="about-hero">
      <div class="about-hero-bg" aria-hidden="true">
        <span v-for="n in 6" :key="'ac' + n" class="ah-cloud" :class="'ah-cloud-' + n"></span>
        <span v-for="n in 5" :key="'ab' + n" class="ah-balloon" :class="'ah-balloon-' + n"></span>
        <div class="ah-castle" aria-hidden="true">
          <svg viewBox="0 0 1200 180" preserveAspectRatio="xMidYMax slice">
            <g fill="#ffffff" opacity="0.5">
              <path d="M0 180 L0 120 L80 120 L80 70 L110 50 L140 70 L140 120 L260 120 L260 60 L300 60 L300 90 L360 90 L360 40 L390 20 L420 40 L420 120 L560 120 L560 80 L620 80 L620 50 L650 30 L680 50 L680 120 L820 120 L820 70 L880 70 L880 100 L940 100 L940 50 L970 30 L1000 50 L1000 120 L1120 120 L1120 80 L1160 80 L1160 120 L1200 120 L1200 180 Z" />
            </g>
          </svg>
        </div>
      </div>
      <div class="container about-hero-inner">
        <p class="section-kicker">ABOUT THE GAME</p>
        <h1 class="about-hero-title">深空云顶</h1>
        <p class="about-hero-sub">SKYLAND OF DEEP SPACE · 云端童话王国</p>
        <p class="about-hero-slogan">
          漂浮于云端的未来童话王国，等你启航。
        </p>
      </div>
    </section>

    <!-- 关于正文 -->
    <section class="about-intro">
      <div class="container about-intro-inner">
        <p class="intro-lead reveal">
          欧式童话魔幻画风，蓝天白云、城堡全景动态，轻快治愈。
        </p>
        <p class="intro-p reveal">
          《深空云顶》构筑一座漂浮于云端的未来童话王国。空中飞船穿行于云海，悬浮岛屿上城堡全景动态铺展，柔和马卡龙色调晕染出蓝天白云。轻快治愈的魔幻旅程，邀你驾驭飞舟启航云端，书写属于自己的童话史诗。
        </p>
        <p class="intro-p reveal">
          云顶王国、风行商会、花语森林、月华骑士团四大势力各据一方，艾莉娅、凯尔、米娅、雷恩等角色等你相遇。我们相信，童话不只属于童年，它属于每一个仍愿仰望云端的人。
        </p>
      </div>
    </section>

    <!-- 价值观 -->
    <section class="values">
      <div class="container">
        <div class="section-head reveal">
          <p class="section-kicker">OUR VISION</p>
          <h2 class="section-title">研发理念</h2>
        </div>
        <div class="values-grid">
          <div v-for="v in values" :key="v.title" class="value-card reveal">
            <div class="value-icon">{{ v.icon }}</div>
            <h3 class="value-title">{{ v.title }}</h3>
            <p class="value-desc">{{ v.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 里程碑 -->
    <section class="timeline-section">
      <div class="container">
        <div class="section-head reveal">
          <p class="section-kicker">MILESTONES</p>
          <h2 class="section-title">云顶之路</h2>
        </div>
        <div class="timeline">
          <div v-for="(m, i) in milestones" :key="i" class="timeline-item reveal">
            <div class="timeline-dot"></div>
            <div class="timeline-body">
              <span class="timeline-year">{{ m.year }}</span>
              <h3 class="timeline-event">{{ m.event }}</h3>
              <p class="timeline-desc">{{ m.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系方式 -->
    <section class="contact">
      <div class="container contact-inner reveal">
        <p class="section-kicker">CONTACT</p>
        <h2 class="contact-title">与我们对话</h2>
        <div class="contact-grid">
          <a class="contact-card" href="mailto:hr@shixingxu.com">
            <h3 class="contact-label">招聘合作</h3>
            <p class="contact-value">hr@shixingxu.com</p>
            <p class="contact-desc">技术、美术、策划多岗位持续开放招募。</p>
          </a>
          <a class="contact-card" href="mailto:bd@shixingxu.com">
            <h3 class="contact-label">商务合作</h3>
            <p class="contact-value">bd@shixingxu.com</p>
            <p class="contact-desc">投资、发行、IP 联动等商务合作洽谈。</p>
          </a>
          <a class="contact-card" href="mailto:pr@shixingxu.com">
            <h3 class="contact-label">媒体联络</h3>
            <p class="contact-value">pr@shixingxu.com</p>
            <p class="contact-desc">采访、媒体合作与新闻素材索取。</p>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  width: 100%;
}

.about-hero {
  position: relative;
  padding: 130px 0 90px;
  text-align: center;
  overflow: hidden;
  background: linear-gradient(170deg, #9ed8ff 0%, #c8b6ff 55%, #ffd6f0 100%);
}

.about-hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ah-cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.75);
  border-radius: 36px;
  filter: blur(3px);
}

.ah-cloud::before,
.ah-cloud::after {
  content: '';
  position: absolute;
  background: inherit;
  border-radius: 50%;
}

.ah-cloud-1 { width: 110px; height: 34px; top: 18%; left: 8%; }
.ah-cloud-1::before { width: 48px; height: 48px; top: -20px; left: 20px; }
.ah-cloud-1::after { width: 36px; height: 36px; top: -12px; right: 18px; }
.ah-cloud-2 { width: 80px; height: 26px; top: 35%; left: 80%; }
.ah-cloud-2::before { width: 36px; height: 36px; top: -16px; left: 14px; }
.ah-cloud-2::after { width: 26px; height: 26px; top: -10px; right: 12px; }
.ah-cloud-3 { width: 60px; height: 20px; top: 25%; left: 86%; }
.ah-cloud-3::before { width: 28px; height: 28px; top: -12px; left: 10px; }
.ah-cloud-3::after { width: 20px; height: 20px; top: -8px; right: 8px; }
.ah-cloud-4 { width: 90px; height: 28px; top: 55%; left: 12%; }
.ah-cloud-4::before { width: 40px; height: 40px; top: -18px; left: 16px; }
.ah-cloud-4::after { width: 30px; height: 30px; top: -10px; right: 14px; }
.ah-cloud-5 { width: 70px; height: 22px; top: 48%; left: 70%; }
.ah-cloud-5::before { width: 32px; height: 32px; top: -14px; left: 12px; }
.ah-cloud-5::after { width: 24px; height: 24px; top: -8px; right: 10px; }
.ah-cloud-6 { width: 50px; height: 18px; top: 65%; left: 40%; }
.ah-cloud-6::before { width: 24px; height: 24px; top: -10px; left: 8px; }
.ah-cloud-6::after { width: 18px; height: 18px; top: -6px; right: 8px; }

.ah-balloon {
  position: absolute;
  width: 12px;
  height: 16px;
  border-radius: 50% 50% 45% 45%;
  bottom: -20px;
  animation: balloonRise linear infinite;
}

.ah-balloon-1 { left: 15%; background: #ffd6f0; animation-duration: 17s; animation-delay: -2s; }
.ah-balloon-2 { left: 35%; background: #c8b6ff; animation-duration: 21s; animation-delay: -8s; }
.ah-balloon-3 { left: 62%; background: #9ed8ff; animation-duration: 19s; animation-delay: -12s; }
.ah-balloon-4 { left: 78%; background: #ffb3d9; animation-duration: 23s; animation-delay: -5s; }
.ah-balloon-5 { left: 90%; background: #b6e0ff; animation-duration: 20s; animation-delay: -14s; }

@keyframes balloonRise {
  0% { transform: translateY(0); opacity: 0; }
  10% { opacity: 0.7; }
  90% { opacity: 0.5; }
  100% { transform: translateY(-80vh); opacity: 0; }
}

.ah-castle {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  line-height: 0;
}

.ah-castle svg {
  width: 100%;
  height: auto;
  display: block;
}

.about-hero-inner {
  position: relative;
  z-index: 1;
}

.about-hero-title {
  font-size: clamp(56px, 10vw, 120px);
  font-weight: 800;
  letter-spacing: 16px;
  color: var(--text);
  margin: 18px 0 14px;
  text-shadow: 0 6px 30px rgba(255, 255, 255, 0.6);
}

.about-hero-sub {
  font-size: 13px;
  letter-spacing: 6px;
  color: var(--accent-hover);
  margin-bottom: 32px;
  font-weight: 600;
}

.about-hero-slogan {
  font-size: clamp(16px, 1.8vw, 20px);
  color: var(--text-muted);
  letter-spacing: 3px;
  line-height: 2;
}

/* Intro */
.about-intro {
  padding: 96px 0;
  background: var(--bg);
}

.about-intro-inner {
  max-width: 820px;
  margin: 0 auto;
  text-align: center;
}

.intro-lead {
  font-size: clamp(20px, 2.2vw, 26px);
  font-weight: 300;
  letter-spacing: 2px;
  color: var(--text);
  line-height: 1.8;
  margin-bottom: 32px;
}

.intro-p {
  font-size: 15px;
  color: var(--text-muted);
  line-height: 2.2;
  margin-bottom: 18px;
}

/* Values */
.values {
  padding: 96px 0;
  background: linear-gradient(180deg, var(--bg) 0%, var(--bg-elev-2) 100%);
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.value-card {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 40px 32px;
  text-align: center;
  transition: transform 0.4s var(--ease), border-color 0.4s var(--ease), box-shadow 0.4s var(--ease);
}

.value-card:hover {
  transform: translateY(-6px);
  border-color: var(--accent);
  box-shadow: var(--shadow-card);
}

.value-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 26px;
  color: var(--accent-hover);
  background: var(--accent-soft);
  border-radius: var(--radius-sm);
}

.value-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--text);
  margin-bottom: 14px;
}

.value-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 2;
}

/* Timeline */
.timeline-section {
  padding: 96px 0;
  background: var(--bg);
}

.timeline {
  max-width: 820px;
  margin: 0 auto;
  position: relative;
  padding-left: 32px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, var(--accent), transparent);
}

.timeline-item {
  position: relative;
  padding-bottom: 40px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -32px;
  top: 6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--bg);
  border: 2px solid var(--accent);
  box-shadow: 0 0 0 5px var(--bg);
}

.timeline-year {
  display: inline-block;
  font-size: 13px;
  letter-spacing: 3px;
  color: var(--accent-hover);
  margin-bottom: 6px;
  font-family: 'Courier New', monospace;
}

.timeline-event {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.timeline-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.9;
}

/* Contact */
.contact {
  padding: 96px 0;
  background: linear-gradient(180deg, var(--bg) 0%, var(--bg-soft) 100%);
}

.contact-inner {
  text-align: center;
}

.contact-title {
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 700;
  letter-spacing: 6px;
  margin-bottom: 48px;
  color: var(--text);
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  text-align: left;
}

.contact-card {
  display: block;
  padding: 32px 28px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: transform 0.35s var(--ease), border-color 0.35s var(--ease), box-shadow 0.35s var(--ease);
}

.contact-card:hover {
  transform: translateY(-6px);
  border-color: var(--accent);
  box-shadow: var(--shadow-card);
  color: inherit;
}

.contact-label {
  font-size: 13px;
  letter-spacing: 3px;
  color: var(--accent-hover);
  margin-bottom: 12px;
}

.contact-value {
  font-size: 16px;
  color: var(--text);
  letter-spacing: 1px;
  margin-bottom: 10px;
  font-family: 'Courier New', monospace;
}

.contact-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.8;
}

@media (max-width: 768px) {
  .about-hero,
  .about-intro,
  .values,
  .timeline-section,
  .contact {
    padding: 64px 0;
  }

  .values-grid,
  .contact-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .value-card {
    padding: 28px 24px;
  }
}
</style>
