<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { fetchLatestNews } from '@/api/portal'
import type { NewsItem } from '@/types'
import { newsCategoryLabel, newsCategoryColor, formatDate } from '@/utils'
import { useReveal, refreshReveal } from '@/composables/useReveal'
import { useRouter } from 'vue-router'

useReveal()
const router = useRouter()

const news = ref<NewsItem[]>([])
const loading = ref(true)
const activeCategory = ref<'all' | 'news' | 'notice' | 'activity'>('all')

async function load() {
  loading.value = true
  news.value = await fetchLatestNews(20)
  loading.value = false
  requestAnimationFrame(() => refreshReveal())
}

const filtered = ref<NewsItem[]>([])
function applyFilter() {
  filtered.value =
    activeCategory.value === 'all'
      ? news.value
      : news.value.filter((n) => n.category === activeCategory.value)
  requestAnimationFrame(() => refreshReveal())
}

watch(activeCategory, applyFilter)
watch(news, applyFilter)

function goDetail(id: number) {
  router.push(`/news/${id}`)
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
        <p class="section-kicker">NEWS CENTER</p>
        <h1 class="page-title">新闻中心</h1>
        <p class="page-subtitle">来自深空云顶的最新动态与公告</p>
      </div>
    </section>

    <!-- 分类筛选 -->
    <section class="filter-bar">
      <div class="container filter-inner">
        <button
          v-for="cat in [
            { k: 'all', label: '全部' },
            { k: 'notice', label: '公告' },
            { k: 'activity', label: '活动' },
            { k: 'news', label: '资讯' }
          ]"
          :key="cat.k"
          class="filter-btn"
          :class="{ active: activeCategory === cat.k }"
          @click="activeCategory = cat.k as any"
        >{{ cat.label }}</button>
      </div>
    </section>

    <!-- 列表 -->
    <section class="news-list-section">
      <div class="container">
        <div v-if="filtered.length > 0" class="news-list">
          <article
            v-for="item in filtered"
            :key="item.id"
            class="news-row reveal"
            @click="goDetail(item.id)"
          >
            <div class="news-row-date">
              <span class="news-row-day">{{ formatDate(item.publishTime, 'iso').slice(8) }}</span>
              <span class="news-row-month">{{ formatDate(item.publishTime, 'iso').slice(0, 7) }}</span>
            </div>
            <div class="news-row-body">
              <div class="news-row-meta">
                <span
                  class="news-row-tag"
                  :style="{
                    background: newsCategoryColor(item.category),
                    borderColor: newsCategoryColor(item.category)
                  }"
                >{{ newsCategoryLabel(item.category) }}</span>
              </div>
              <h3 class="news-row-title">{{ item.title }}</h3>
              <p class="news-row-summary">{{ item.summary }}</p>
            </div>
            <div class="news-row-arrow">→</div>
          </article>
        </div>

        <div v-else-if="!loading" class="news-empty">
          <p>暂无资讯</p>
        </div>

        <div v-if="loading" class="news-loading">
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
  padding: 110px 0 64px;
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

.page-cloud-1 { width: 90px; height: 28px; top: 20%; left: 10%; }
.page-cloud-1::before { width: 40px; height: 40px; top: -16px; left: 16px; }
.page-cloud-1::after { width: 30px; height: 30px; top: -10px; right: 14px; }
.page-cloud-2 { width: 70px; height: 22px; top: 60%; left: 78%; }
.page-cloud-2::before { width: 32px; height: 32px; top: -14px; left: 12px; }
.page-cloud-2::after { width: 24px; height: 24px; top: -8px; right: 10px; }
.page-cloud-3 { width: 60px; height: 20px; top: 30%; left: 82%; }
.page-cloud-3::before { width: 28px; height: 28px; top: -12px; left: 10px; }
.page-cloud-3::after { width: 20px; height: 20px; top: -8px; right: 8px; }
.page-cloud-4 { width: 80px; height: 26px; top: 70%; left: 14%; }
.page-cloud-4::before { width: 36px; height: 36px; top: -16px; left: 14px; }
.page-cloud-4::after { width: 26px; height: 26px; top: -10px; right: 12px; }
.page-cloud-5 { width: 50px; height: 18px; top: 45%; left: 6%; }
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

.filter-bar {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.85);
  position: sticky;
  top: var(--header-h);
  z-index: 10;
  backdrop-filter: blur(10px);
}

.filter-inner {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  overflow-x: auto;
}

.filter-btn {
  padding: 8px 20px;
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  white-space: nowrap;
  transition: var(--transition);
}

.filter-btn:hover {
  color: var(--text);
  border-color: var(--border-strong);
}

.filter-btn.active {
  background: var(--accent);
  color: var(--text);
  border-color: var(--accent);
  font-weight: 600;
}

.news-list-section {
  padding: 64px 0;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.news-row {
  display: grid;
  grid-template-columns: 90px 1fr 24px;
  gap: 28px;
  align-items: center;
  padding: 24px 28px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: transform 0.35s var(--ease), border-color 0.35s var(--ease), box-shadow 0.35s var(--ease);
}

.news-row:hover {
  transform: translateX(6px);
  border-color: var(--accent);
  box-shadow: var(--shadow-card);
}

.news-row-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  border-right: 1px solid var(--border);
}

.news-row-day {
  font-size: 32px;
  font-weight: 700;
  color: var(--accent-hover);
  line-height: 1;
  font-family: 'Courier New', monospace;
}

.news-row-month {
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 1px;
  margin-top: 6px;
}

.news-row-body {
  min-width: 0;
}

.news-row-meta {
  margin-bottom: 8px;
}

.news-row-tag {
  display: inline-flex;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  border-radius: var(--radius-sm);
  letter-spacing: 1px;
}

.news-row-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.news-row-summary {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-row-arrow {
  font-size: 18px;
  color: var(--text-dim);
  transition: transform 0.3s ease, color 0.3s ease;
}

.news-row:hover .news-row-arrow {
  color: var(--accent-hover);
  transform: translateX(4px);
}

.news-empty,
.news-loading {
  text-align: center;
  padding: 80px 0;
  color: var(--text-muted);
}

.news-loading {
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

@media (max-width: 600px) {
  .news-row {
    grid-template-columns: 70px 1fr;
    gap: 16px;
    padding: 18px 20px;
  }

  .news-row-arrow {
    display: none;
  }

  .news-row-day {
    font-size: 24px;
  }
}
</style>
