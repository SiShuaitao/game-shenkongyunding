<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchSects } from '@/api/portal'
import type { Sect } from '@/types'
import { coverGradient } from '@/utils'
import { useReveal, refreshReveal } from '@/composables/useReveal'

useReveal()

const sects = ref<Sect[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  sects.value = await fetchSects()
  loading.value = false
  requestAnimationFrame(() => refreshReveal())
}

onMounted(load)
</script>

<template>
  <div class="page">
    <!-- 页面顶部 Hero -->
    <section class="page-hero">
      <div class="page-hero-bg" aria-hidden="true">
        <span v-for="n in 6" :key="'sc' + n" class="page-cloud" :class="'page-cloud-' + n"></span>
        <span v-for="n in 5" :key="'sb' + n" class="page-balloon" :class="'page-balloon-' + n"></span>
        <div class="page-castle" aria-hidden="true">
          <svg viewBox="0 0 1200 180" preserveAspectRatio="xMidYMax slice">
            <g fill="#ffffff" opacity="0.5">
              <path d="M0 180 L0 120 L80 120 L80 70 L110 50 L140 70 L140 120 L260 120 L260 60 L300 60 L300 90 L360 90 L360 40 L390 20 L420 40 L420 120 L560 120 L560 80 L620 80 L620 50 L650 30 L680 50 L680 120 L820 120 L820 70 L880 70 L880 100 L940 100 L940 50 L970 30 L1000 50 L1000 120 L1120 120 L1120 80 L1160 80 L1160 120 L1200 120 L1200 180 Z" />
            </g>
          </svg>
        </div>
      </div>
      <div class="container page-hero-inner">
        <p class="section-kicker">SKYLAND REALMS</p>
        <h1 class="page-title">云顶国度</h1>
        <p class="page-subtitle">四大势力据守云端，各有理念，各据一方</p>
      </div>
    </section>

    <!-- 国度列表 -->
    <section class="sects-section">
      <div class="container">
        <div v-if="sects.length > 0" class="sects-list">
          <article
            v-for="(sect, i) in sects"
            :key="sect.id"
            class="sect-item reveal"
            :class="{ reverse: i % 2 === 1 }"
          >
            <div class="sect-visual" :style="{ background: coverGradient(sect.cover || '') }">
              <div class="sect-deco" aria-hidden="true">
                <i v-for="n in 4" :key="n" :style="{ left: (n * 24 - 5) + '%', top: (20 + n * 12) + '%', animationDelay: (n * 1.2) + 's' }"></i>
              </div>
              <div class="sect-island" aria-hidden="true">
                <svg viewBox="0 0 200 90" width="220" height="100">
                  <defs>
                    <linearGradient :id="'isl' + i" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
                      <stop offset="100%" stop-color="#e8dcff" stop-opacity="0.4" />
                    </linearGradient>
                  </defs>
                  <path d="M20 50 Q60 20 100 30 Q150 18 180 50 Q160 78 100 74 Q40 78 20 50 Z" :fill="'url(#isl' + i + ')'" />
                  <rect x="90" y="14" width="14" height="22" fill="#ffffff" opacity="0.8" />
                  <polygon points="90,14 97,6 104,14" fill="#ffffff" opacity="0.9" />
                  <rect x="94" y="22" width="3" height="4" fill="#c8b6ff" />
                  <rect x="100" y="22" width="3" height="4" fill="#c8b6ff" />
                </svg>
              </div>
              <span class="sect-philosophy">{{ sect.philosophy }}</span>
            </div>
            <div class="sect-text">
              <p class="sect-index">{{ String(i + 1).padStart(2, '0') }} / {{ String(sects.length).padStart(2, '0') }}</p>
              <h3 class="sect-name">{{ sect.name }}</h3>
              <p v-if="sect.subtitle" class="sect-sub">{{ sect.subtitle }}</p>
              <div class="sect-divider"></div>
              <p class="sect-desc">{{ sect.description }}</p>
            </div>
          </article>
        </div>

        <div v-else-if="!loading" class="sects-empty">
          <p>暂无国度资料</p>
        </div>

        <div v-if="loading" class="sects-loading">
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  width: 100%;
}

.page-hero {
  position: relative;
  padding: 130px 0 90px;
  text-align: center;
  overflow: hidden;
  background: linear-gradient(170deg, #9ed8ff 0%, #c8b6ff 55%, #ffd6f0 100%);
}

.page-hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.page-cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.75);
  border-radius: 32px;
  filter: blur(3px);
}

.page-cloud::before,
.page-cloud::after {
  content: '';
  position: absolute;
  background: inherit;
  border-radius: 50%;
}

.page-cloud-1 { width: 100px; height: 30px; top: 18%; left: 8%; }
.page-cloud-1::before { width: 44px; height: 44px; top: -18px; left: 18px; }
.page-cloud-1::after { width: 32px; height: 32px; top: -12px; right: 16px; }
.page-cloud-2 { width: 76px; height: 24px; top: 55%; left: 82%; }
.page-cloud-2::before { width: 34px; height: 34px; top: -14px; left: 14px; }
.page-cloud-2::after { width: 26px; height: 26px; top: -10px; right: 12px; }
.page-cloud-3 { width: 60px; height: 20px; top: 28%; left: 86%; }
.page-cloud-3::before { width: 28px; height: 28px; top: -12px; left: 10px; }
.page-cloud-3::after { width: 20px; height: 20px; top: -8px; right: 8px; }
.page-cloud-4 { width: 84px; height: 26px; top: 68%; left: 12%; }
.page-cloud-4::before { width: 38px; height: 38px; top: -16px; left: 16px; }
.page-cloud-4::after { width: 28px; height: 28px; top: -10px; right: 14px; }
.page-cloud-5 { width: 50px; height: 18px; top: 42%; left: 6%; }
.page-cloud-5::before { width: 24px; height: 24px; top: -10px; left: 8px; }
.page-cloud-5::after { width: 18px; height: 18px; top: -6px; right: 8px; }
.page-cloud-6 { width: 70px; height: 22px; top: 38%; left: 70%; }
.page-cloud-6::before { width: 32px; height: 32px; top: -14px; left: 12px; }
.page-cloud-6::after { width: 24px; height: 24px; top: -8px; right: 10px; }

.page-balloon {
  position: absolute;
  width: 12px;
  height: 16px;
  border-radius: 50% 50% 45% 45%;
  bottom: -20px;
  animation: balloonRise linear infinite;
}

.page-balloon-1 { left: 15%; background: #ffd6f0; animation-duration: 17s; animation-delay: -2s; }
.page-balloon-2 { left: 38%; background: #c8b6ff; animation-duration: 21s; animation-delay: -8s; }
.page-balloon-3 { left: 62%; background: #9ed8ff; animation-duration: 19s; animation-delay: -12s; }
.page-balloon-4 { left: 80%; background: #ffb3d9; animation-duration: 23s; animation-delay: -5s; }
.page-balloon-5 { left: 92%; background: #b6e0ff; animation-duration: 20s; animation-delay: -14s; }

@keyframes balloonRise {
  0% { transform: translateY(0); opacity: 0; }
  10% { opacity: 0.7; }
  90% { opacity: 0.5; }
  100% { transform: translateY(-70vh); opacity: 0; }
}

.page-castle {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  line-height: 0;
}

.page-castle svg {
  width: 100%;
  height: auto;
  display: block;
}

.page-hero-inner {
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 700;
  letter-spacing: 8px;
  margin: 12px 0 16px;
  color: var(--text);
}

.page-subtitle {
  font-size: 15px;
  color: var(--text-muted);
  letter-spacing: 2px;
}

/* ===== Sects section ===== */
.sects-section {
  padding: 90px 0 110px;
}

.sects-list {
  display: flex;
  flex-direction: column;
  gap: 80px;
}

.sect-item {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 64px;
  align-items: center;
}

.sect-item.reverse .sect-visual {
  order: 2;
}

.sect-visual {
  position: relative;
  height: 380px;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-card);
}

.sect-visual::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.25) 100%);
}

.sect-deco {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.sect-deco i {
  position: absolute;
  width: 64px;
  height: 20px;
  background: rgba(255, 255, 255, 0.78);
  border-radius: 20px;
  filter: blur(2px);
  animation: cloudDrift 18s linear infinite;
}

.sect-deco i::before,
.sect-deco i::after {
  content: '';
  position: absolute;
  background: inherit;
  border-radius: 50%;
}

.sect-deco i::before {
  width: 28px;
  height: 28px;
  top: -12px;
  left: 12px;
}

.sect-deco i::after {
  width: 22px;
  height: 22px;
  top: -8px;
  right: 12px;
}

@keyframes cloudDrift {
  0% { transform: translateX(-40px); }
  100% { transform: translateX(60px); }
}

.sect-island {
  position: absolute;
  top: 52%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  filter: drop-shadow(0 12px 24px rgba(58, 52, 96, 0.18));
}

.sect-philosophy {
  position: absolute;
  bottom: 22px;
  left: 22px;
  z-index: 2;
  padding: 7px 18px;
  font-size: 13px;
  letter-spacing: 2px;
  font-weight: 600;
  color: var(--text);
  background: rgba(255, 255, 255, 0.88);
  border-radius: 999px;
  backdrop-filter: blur(4px);
}

.sect-text {
  padding: 0 8px;
}

.sect-index {
  font-size: 14px;
  letter-spacing: 4px;
  color: var(--accent-hover);
  margin-bottom: 14px;
  font-family: 'Courier New', monospace;
}

.sect-name {
  font-size: clamp(30px, 4vw, 44px);
  font-weight: 700;
  letter-spacing: 5px;
  margin-bottom: 10px;
  color: var(--text);
}

.sect-sub {
  font-size: 13px;
  letter-spacing: 4px;
  color: var(--accent-hover);
  margin-bottom: 20px;
}

.sect-divider {
  width: 48px;
  height: 3px;
  border-radius: 2px;
  background: var(--accent);
  margin-bottom: 22px;
}

.sect-desc {
  font-size: 15px;
  color: var(--text-muted);
  line-height: 2.1;
}

.sects-empty,
.sects-loading {
  text-align: center;
  padding: 80px 0;
  color: var(--text-muted);
}

.sects-loading {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.loading-dot {
  width: 8px;
  height: 8px;
  background: var(--accent);
  border-radius: 50%;
  animation: dotPulse 1.2s ease-in-out infinite;
}

.loading-dot:nth-child(2) { animation-delay: 0.2s; }
.loading-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotPulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

@media (max-width: 960px) {
  .sects-list {
    gap: 56px;
  }

  .sect-item,
  .sect-item.reverse {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .sect-item.reverse .sect-visual {
    order: 0;
  }

  .sect-visual {
    height: 280px;
  }
}
</style>
