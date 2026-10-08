<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchCharacters } from '@/api/portal'
import type { Character } from '@/types'
import { coverGradient, roleColor, difficultyColor } from '@/utils'
import { useReveal, refreshReveal } from '@/composables/useReveal'

useReveal()

const characters = ref<Character[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  characters.value = await fetchCharacters()
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
        <span v-for="n in 5" :key="'pc' + n" class="page-cloud" :class="'page-cloud-' + n"></span>
        <span v-for="n in 5" :key="'pb' + n" class="page-balloon" :class="'page-balloon-' + n"></span>
      </div>
      <div class="container page-hero-inner">
        <p class="section-kicker">CHARACTERS</p>
        <h1 class="page-title">云端角色</h1>
        <p class="page-subtitle">星岚公主、风行船长、花语魔女……云端王国的旅人们等你相遇</p>
      </div>
    </section>

    <!-- 角色网格 -->
    <section class="chars-section">
      <div class="container">
        <div v-if="characters.length > 0" class="chars-grid">
          <article
            v-for="ch in characters"
            :key="ch.id"
            class="char-card reveal"
          >
            <div class="char-cover" :style="{ background: coverGradient(ch.cover || '') }">
              <div class="char-clouds" aria-hidden="true">
                <i v-for="n in 3" :key="n" :style="{ left: (n * 30 - 10) + '%', top: (20 + n * 12) + '%', animationDelay: (n * 1.1) + 's' }"></i>
              </div>
              <span class="char-role" :style="{ color: roleColor(ch.role), borderColor: roleColor(ch.role) }">{{ ch.role }}</span>
              <span class="char-diff" :style="{ color: difficultyColor(ch.difficulty) }">{{ ch.difficulty }}难度</span>
              <div class="char-cover-overlay"></div>
              <div class="char-portrait" aria-hidden="true">
                <svg viewBox="0 0 100 120" width="100" height="120">
                  <circle cx="50" cy="42" r="22" fill="rgba(255,255,255,0.55)" />
                  <path d="M18 120 Q18 78 50 78 Q82 78 82 120 Z" fill="rgba(255,255,255,0.55)" />
                </svg>
              </div>
              <h3 class="char-name">{{ ch.name }}</h3>
              <p class="char-title-on-cover">{{ ch.title }}</p>
            </div>
            <div class="char-body">
              <div class="char-meta">
                <span class="meta-item">
                  <span class="meta-label">势力</span>
                  <span class="meta-value">{{ ch.faction }}</span>
                </span>
                <span class="meta-item">
                  <span class="meta-label">定位</span>
                  <span class="meta-value" :style="{ color: roleColor(ch.role) }">{{ ch.role }}</span>
                </span>
                <span class="meta-item">
                  <span class="meta-label">难度</span>
                  <span class="meta-value" :style="{ color: difficultyColor(ch.difficulty) }">{{ ch.difficulty }}</span>
                </span>
              </div>
              <p class="char-desc">{{ ch.description }}</p>
            </div>
          </article>
        </div>

        <div v-else-if="!loading" class="chars-empty">
          <p>暂无角色档案</p>
        </div>

        <div v-if="loading" class="chars-loading">
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
  padding: 120px 0 72px;
  text-align: center;
  overflow: hidden;
  background: linear-gradient(170deg, #9ed8ff 0%, #c8b6ff 60%, #ffd6f0 100%);
}

.page-hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.page-cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 30px;
  filter: blur(3px);
}

.page-cloud::before,
.page-cloud::after {
  content: '';
  position: absolute;
  background: inherit;
  border-radius: 50%;
}

.page-cloud-1 { width: 100px; height: 30px; top: 22%; left: 8%; }
.page-cloud-1::before { width: 44px; height: 44px; top: -18px; left: 18px; }
.page-cloud-1::after { width: 32px; height: 32px; top: -12px; right: 16px; }
.page-cloud-2 { width: 76px; height: 24px; top: 62%; left: 80%; }
.page-cloud-2::before { width: 34px; height: 34px; top: -14px; left: 14px; }
.page-cloud-2::after { width: 26px; height: 26px; top: -10px; right: 12px; }
.page-cloud-3 { width: 60px; height: 20px; top: 30%; left: 84%; }
.page-cloud-3::before { width: 28px; height: 28px; top: -12px; left: 10px; }
.page-cloud-3::after { width: 20px; height: 20px; top: -8px; right: 8px; }
.page-cloud-4 { width: 84px; height: 26px; top: 72%; left: 14%; }
.page-cloud-4::before { width: 38px; height: 38px; top: -16px; left: 16px; }
.page-cloud-4::after { width: 28px; height: 28px; top: -10px; right: 14px; }
.page-cloud-5 { width: 50px; height: 18px; top: 45%; left: 5%; }
.page-cloud-5::before { width: 24px; height: 24px; top: -10px; left: 8px; }
.page-cloud-5::after { width: 18px; height: 18px; top: -6px; right: 8px; }

.page-balloon {
  position: absolute;
  width: 12px;
  height: 16px;
  border-radius: 50% 50% 45% 45%;
  bottom: -20px;
  animation: balloonRise linear infinite;
}

.page-balloon-1 { left: 20%; background: #ffd6f0; animation-duration: 16s; animation-delay: -2s; }
.page-balloon-2 { left: 50%; background: #c8b6ff; animation-duration: 20s; animation-delay: -8s; }
.page-balloon-3 { left: 75%; background: #9ed8ff; animation-duration: 18s; animation-delay: -12s; }
.page-balloon-4 { left: 38%; background: #ffb3d9; animation-duration: 22s; animation-delay: -5s; }
.page-balloon-5 { left: 88%; background: #b6e0ff; animation-duration: 19s; animation-delay: -14s; }

@keyframes balloonRise {
  0% { transform: translateY(0); opacity: 0; }
  10% { opacity: 0.7; }
  90% { opacity: 0.5; }
  100% { transform: translateY(-60vh); opacity: 0; }
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

/* ===== Chars section ===== */
.chars-section {
  padding: 80px 0 100px;
}

.chars-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 26px;
}

.char-card {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: transform 0.4s var(--ease), border-color 0.4s var(--ease), box-shadow 0.4s var(--ease);
}

.char-card:hover {
  transform: translateY(-8px);
  border-color: var(--accent);
  box-shadow: var(--shadow-hover);
}

.char-cover {
  position: relative;
  height: 280px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.char-clouds {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.char-clouds i {
  position: absolute;
  width: 56px;
  height: 18px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 18px;
  filter: blur(2px);
  animation: cloudDrift 14s linear infinite;
}

.char-clouds i::before,
.char-clouds i::after {
  content: '';
  position: absolute;
  background: inherit;
  border-radius: 50%;
}

.char-clouds i::before {
  width: 24px;
  height: 24px;
  top: -10px;
  left: 12px;
}

.char-clouds i::after {
  width: 18px;
  height: 18px;
  top: -6px;
  right: 10px;
}

@keyframes cloudDrift {
  0% { transform: translateX(-30px); }
  100% { transform: translateX(50px); }
}

.char-portrait {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -38%);
  z-index: 1;
  opacity: 0.55;
  filter: drop-shadow(0 6px 16px rgba(58, 52, 96, 0.18));
  transition: transform 0.5s var(--ease), opacity 0.5s var(--ease);
}

.char-card:hover .char-portrait {
  transform: translate(-50%, -42%) scale(1.05);
  opacity: 0.7;
}

.char-role {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 2;
  padding: 4px 12px;
  font-size: 11px;
  letter-spacing: 1px;
  font-weight: 600;
  border: 1px solid;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
}

.char-diff {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  padding: 4px 12px;
  font-size: 11px;
  letter-spacing: 1px;
  font-weight: 600;
  color: var(--text);
  background: rgba(255, 255, 255, 0.7);
  border-radius: 999px;
  backdrop-filter: blur(4px);
}

.char-cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 35%, rgba(58, 52, 96, 0.55) 100%);
}

.char-name {
  position: absolute;
  bottom: 38px;
  left: 20px;
  z-index: 2;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #ffffff;
  text-shadow: 0 2px 12px rgba(58, 52, 96, 0.6);
}

.char-title-on-cover {
  position: absolute;
  bottom: 16px;
  left: 20px;
  z-index: 2;
  font-size: 12px;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.9);
}

.char-body {
  padding: 22px 24px 26px;
}

.char-meta {
  display: flex;
  gap: 18px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--text-dim);
}

.meta-value {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--text);
}

.char-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.9;
}

.chars-empty,
.chars-loading {
  text-align: center;
  padding: 80px 0;
  color: var(--text-muted);
}

.chars-loading {
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
  .chars-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .chars-grid {
    grid-template-columns: 1fr;
  }

  .char-cover {
    height: 240px;
  }
}
</style>
