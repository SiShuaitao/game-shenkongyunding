<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchNewsById } from '@/api/portal'
import type { NewsItem } from '@/types'
import { newsCategoryLabel, newsCategoryColor, formatDate } from '@/utils'

const route = useRoute()
const router = useRouter()
const news = ref<NewsItem | null>(null)
const loading = ref(true)

async function load(id: string | string[]) {
  loading.value = true
  news.value = await fetchNewsById(id as string)
  loading.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  if (route.params.id) load(route.params.id)
})

watch(
  () => route.params.id,
  (id) => {
    if (id) load(id)
  }
)
</script>

<template>
  <div class="page">
    <section class="detail-hero">
      <div class="detail-hero-bg" aria-hidden="true">
        <span v-for="n in 4" :key="'dc' + n" class="detail-cloud" :class="'detail-cloud-' + n"></span>
      </div>
      <div class="container detail-hero-inner">
        <button class="back-btn" @click="router.push('/news')">← 返回资讯列表</button>
        <template v-if="news">
          <p class="detail-kicker">NEWS · {{ newsCategoryLabel(news.category) }}</p>
          <h1 class="detail-title">{{ news.title }}</h1>
          <p class="detail-meta">发布于 {{ formatDate(news.publishTime) }}</p>
        </template>
      </div>
    </section>

    <section class="detail-body">
      <div class="container detail-container">
        <div v-if="loading" class="loading">
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
          <span class="loading-dot"></span>
        </div>

        <article v-else-if="news" class="article">
          <p v-if="news.summary" class="article-summary">{{ news.summary }}</p>
          <div v-if="news.content" class="article-content">
            <p v-for="(para, i) in news.content.split('\n')" :key="i" v-show="para.trim()">{{ para }}</p>
          </div>
          <p v-else class="article-empty">暂无正文内容</p>
        </article>

        <div v-else class="empty">
          <p>资讯不存在或已下线</p>
          <button class="btn btn-ghost" @click="router.push('/news')">返回列表</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  width: 100%;
}

.detail-hero {
  position: relative;
  padding: 110px 0 48px;
  background: linear-gradient(170deg, #9ed8ff 0%, #c8b6ff 60%, #ffd6f0 100%);
  border-bottom: 1px solid var(--border);
  overflow: hidden;
}

.detail-hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.detail-cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 30px;
  filter: blur(3px);
}

.detail-cloud::before,
.detail-cloud::after {
  content: '';
  position: absolute;
  background: inherit;
  border-radius: 50%;
}

.detail-cloud-1 { width: 90px; height: 28px; top: 25%; left: 8%; }
.detail-cloud-1::before { width: 40px; height: 40px; top: -16px; left: 16px; }
.detail-cloud-1::after { width: 30px; height: 30px; top: -10px; right: 14px; }
.detail-cloud-2 { width: 70px; height: 22px; top: 60%; left: 80%; }
.detail-cloud-2::before { width: 32px; height: 32px; top: -14px; left: 12px; }
.detail-cloud-2::after { width: 24px; height: 24px; top: -8px; right: 10px; }
.detail-cloud-3 { width: 60px; height: 20px; top: 40%; left: 85%; }
.detail-cloud-3::before { width: 28px; height: 28px; top: -12px; left: 10px; }
.detail-cloud-3::after { width: 20px; height: 20px; top: -8px; right: 8px; }
.detail-cloud-4 { width: 80px; height: 26px; top: 75%; left: 12%; }
.detail-cloud-4::before { width: 36px; height: 36px; top: -16px; left: 14px; }
.detail-cloud-4::after { width: 26px; height: 26px; top: -10px; right: 12px; }

.detail-hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.back-btn {
  padding: 6px 16px;
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--text-muted);
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(4px);
  transition: var(--transition);
}

.back-btn:hover {
  color: var(--text);
  border-color: var(--accent);
  background: rgba(255, 255, 255, 0.9);
}

.detail-kicker {
  font-size: 12px;
  letter-spacing: 4px;
  color: var(--accent-hover);
  font-weight: 600;
}

.detail-title {
  font-size: clamp(26px, 4vw, 38px);
  font-weight: 700;
  letter-spacing: 2px;
  line-height: 1.4;
  color: var(--text);
  margin-bottom: 6px;
}

.detail-meta {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.detail-body {
  padding: 56px 0 96px;
}

.detail-container {
  max-width: 820px;
}

.article-summary {
  font-size: 16px;
  color: var(--accent-hover);
  letter-spacing: 1px;
  line-height: 2;
  padding: 18px 24px;
  border-left: 3px solid var(--accent);
  background: var(--accent-dim);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin-bottom: 32px;
}

.article-content {
  font-size: 15px;
  color: var(--text);
  line-height: 2.2;
  letter-spacing: 0.5px;
}

.article-content p {
  margin-bottom: 18px;
  text-indent: 2em;
}

.loading {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 80px 0;
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

.empty {
  text-align: center;
  padding: 80px 0;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}
</style>
