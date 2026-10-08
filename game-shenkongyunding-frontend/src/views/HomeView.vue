<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { fetchGame, fetchBanners, fetchFeatures, fetchCharacters, fetchSects, fetchLatestNews } from '@/api/portal'
import type { GameMeta, Banner, Feature, Character, Sect, NewsItem } from '@/types'
import { coverGradient, roleColor, newsCategoryLabel, newsCategoryColor, formatMonthDay } from '@/utils'
import { useReveal, refreshReveal } from '@/composables/useReveal'

useReveal()

// ============ 数据 ============
const game = ref<GameMeta | null>(null)
const banners = ref<Banner[]>([])
const features = ref<Feature[]>([])
const characters = ref<Character[]>([])
const sects = ref<Sect[]>([])
const news = ref<NewsItem[]>([])
const loading = ref(true)

// ============ 兜底数据 ============
const fallbackCharacters: Character[] = [
  {
    id: 1, name: '星岚', title: '云端王储', faction: '云顶王庭', role: '法师',
    difficulty: '中', description: '云顶王庭的年轻王储，掌星辉之力，能操纵陨星划破长空。其血脉承载着深空王座的传承，亦背负王国存亡的重任。',
    cover: 'linear-gradient(160deg,#1a2a5a 0%,#3a5a9a 50%,#9cc4ff 100%)', sort: 1
  },
  {
    id: 2, name: '风行', title: '飞舟船长', faction: '自由航行者', role: '射手',
    difficulty: '高', description: '自由航行者的传奇船长，驾驭「裂风号」穿行云海。从星港到边境，他的航迹遍布深空，是无数旅人心中的远航象征。',
    cover: 'linear-gradient(160deg,#0a3a3a 0%,#2a6a6a 50%,#8fe3c8 100%)', sort: 2
  },
  {
    id: 3, name: '花语', title: '深空魔女', faction: '神秘学社', role: '辅助',
    difficulty: '中', description: '神秘学社的魔女，能听懂星花的低语。她在云端花园培育异种星卉，以花香编织治愈与诅咒的双重咒文。',
    cover: 'linear-gradient(160deg,#3a1a4a 0%,#6a3a7a 50%,#d29eff 100%)', sort: 3
  },
  {
    id: 4, name: '岩铸', title: '要塞守将', faction: '钢铁议会', role: '坦克',
    difficulty: '低', description: '钢铁议会的要塞守将，身披陨铁重甲。他守卫云顶边境已有三十年，从未让任何深空灾兽突破防线半步。',
    cover: 'linear-gradient(160deg,#3a2a1a 0%,#6a4a2a 50%,#ffd29e 100%)', sort: 4
  },
  {
    id: 5, name: '影织', title: '虚空行者', faction: '隐修会', role: '战士',
    difficulty: '高', description: '隐修会的虚空行者，行走于现实与虚空的夹缝。她的双刃能斩断空间本身，亦能在影中瞬间位移。',
    cover: 'linear-gradient(160deg,#1a1a2a 0%,#3a3a5a 50%,#9e8eff 100%)', sort: 5
  }
]

const fallbackSects: Sect[] = [
  {
    id: 1, name: '云顶王庭', subtitle: 'CROWN OF SKYLAND', philosophy: '秩序即王座',
    description: '悬浮于云海最高处的中央王国，传承千年的星辉王族统治之地。城堡全景动态铺展，空中飞船在塔尖穿梭，是深空文明的灯塔。王庭的星辉术士维系着整片云顶的引力场，让无数岛屿永悬天际。',
    cover: 'linear-gradient(135deg,#1a2a5a,#9cc4ff)', sort: 1
  },
  {
    id: 2, name: '自由航行者', subtitle: 'FREE VOYAGERS', philosophy: '航迹即国土',
    description: '由飞舟船长们组成的松散联盟，拒绝任何王权。他们的国土是航迹，他们的城市是移动的船团。从星港到边境遗迹，自由航行者开辟了深空最密集的航线，亦是情报与奇珍的流通网络。',
    cover: 'linear-gradient(135deg,#0a3a3a,#8fe3c8)', sort: 2
  },
  {
    id: 3, name: '神秘学社', subtitle: 'ARCANE CIRCLE', philosophy: '万物有灵',
    description: '隐于云端花园的学者组织，研究深空秘术与异种星卉。他们相信星花是宇宙意志的载体，通过花香与星语沟通深空。学社的魔女们既是治愈者，也是预言者，其咒文常左右王国决策。',
    cover: 'linear-gradient(135deg,#3a1a4a,#d29eff)', sort: 3
  },
  {
    id: 4, name: '钢铁议会', subtitle: 'IRON COUNCIL', philosophy: '锻造永恒',
    description: '由工匠与守卫组成的工业势力，坐拥云顶最大的陨铁熔炉。他们锻造飞船骨架、要塞装甲与战争机械，是深空最坚实的后盾。议会信奉永恒的锻造，认为唯有钢铁能抵御深空灾厄。',
    cover: 'linear-gradient(135deg,#3a2a1a,#ffd29e)', sort: 4
  }
]

const fallbackFeatures: Feature[] = [
  {
    id: 1, title: '空中飞船自由航行', summary: 'CLOUD FLEET', icon: '✦',
    description: '驾驭飞舟穿越云海，从星港启航探访悬浮岛屿。每艘飞船可自由改装舱室、武装与动力，既是座驾也是家园。航行途中遭遇天气、商队、海盗与未知遗迹，每次出航都是一段独特史诗。'
  },
  {
    id: 2, title: '城堡全景动态铺展', summary: 'PANORAMIC CASTLE', icon: '✧',
    description: '云顶王庭以全景动态技术呈现，城堡的每一扇窗、每一座塔都能实时观察。从王座厅到天文台，从花园到舰船码头，整座云端王国在你眼前活态运转，沉浸感如临其境。'
  },
  {
    id: 3, title: '深空探索与遗迹', summary: 'DEEP SPACE EXPLORE', icon: '✦',
    description: '云海深处藏着古老文明遗迹，星门、空洞、陨星冢等待旅人发掘。组队潜入遗迹解谜战斗，可获取稀有星核、远古蓝图与失落咒文，是探险者最向往的深空秘境。'
  },
  {
    id: 4, title: '四大势力阵营博弈', summary: 'FACTION WAR', icon: '✧',
    description: '云顶王庭、自由航行者、神秘学社、钢铁议会四大势力各据一方，玩家可加入任一阵营，参与航线争夺、星港攻防、星辉议会投票。你的选择将重塑深空版图。'
  },
  {
    id: 5, title: '星辉术与连招战斗', summary: 'STELLAR COMBAT', icon: '✦',
    description: '以星辉为源的战斗系统，每个角色拥有独立技能组与连招树。连续释放技能累积星轨共鸣，触发觉醒态与终结技。深空 Boss 战考验走位、连击与时机把握。'
  },
  {
    id: 6, title: 'UGC 飞船建造', summary: 'UGC SHIPYARD', icon: '✧',
    description: '玩家可在自家船坞自由设计飞船蓝图，从骨架到舱室到外观全自定义。优秀蓝图可上架星港交易所，让全服旅人竞相购买，打造属于你的传奇舰队。'
  }
]

const fallbackNews: NewsItem[] = [
  { id: 1, title: '《深空云顶》首次测试定档 8 月开启', summary: '云端王国大门即将向旅人开启，四大势力角色陆续登场，星辉术战斗系统首次公开测试。', category: 'news', publishTime: '2026-08-05' },
  { id: 2, title: '空中飞船自由航行系统详解', summary: '飞舟改装、舱室布置、航线探索一网打尽，抢先了解云端舰队的玩法核心。', category: 'news', publishTime: '2026-07-28' },
  { id: 3, title: '云顶王庭世界观设定首曝', summary: '星辉王族、深空王座、引力场术士——云端王国的千年传承在此揭开一角。', category: 'news', publishTime: '2026-07-20' },
  { id: 4, title: '夏季测试预约活动开启', summary: '完成预约问卷可获专属星辉徽章与限量飞船涂装，邀旅人共启航程。', category: 'activity', publishTime: '2026-07-12' },
  { id: 5, title: '星辉术连招战斗演示', summary: '连击累积、星轨共鸣、觉醒态终结技——深空战斗系统的核心机制详解。', category: 'news', publishTime: '2026-07-05' },
  { id: 6, title: '服务器维护公告', summary: '为提供更稳定的云端体验，将于本周凌晨进行服务器维护，预计 4 小时。', category: 'notice', publishTime: '2026-07-01' }
]

const fallbackGame: GameMeta = {
  id: 1, gameId: 'skyward-crown', name: '深空云顶', subtitle: 'SKYWARD CROWN',
  category: 'MMORPG', tagline: '空中飞船 · 城堡全景 · 深空探索',
  summary: '漂浮于云端的未来科幻王国，空中飞船穿行，悬浮岛屿城堡全景动态铺展，深空探索邀你启航。',
  description: '《深空云顶》构筑一座漂浮于云端的未来科幻王国。空中飞船穿行于云海，悬浮岛屿上城堡全景动态铺展，深空蓝与星辉银晕染出无尽天穹。驾驭飞舟启航云端，探索深空遗迹，与四大势力共绘星图，书写属于你的云端史诗。',
  url: '#', cover: 'linear-gradient(160deg,#050818,#1a2a5a)', style: 'cinematic', featured: 1, sort: 1, status: 1
}

// ============ 数据加载 ============
async function loadAll() {
  const [g, b, f, c, s, n] = await Promise.all([
    fetchGame(),
    fetchBanners(),
    fetchFeatures(),
    fetchCharacters(),
    fetchSects(),
    fetchLatestNews(6)
  ])
  game.value = g || fallbackGame
  banners.value = b
  features.value = f.length ? f : fallbackFeatures
  characters.value = c.length ? c : fallbackCharacters
  sects.value = s.length ? s : fallbackSects
  news.value = n.length ? n : fallbackNews
  loading.value = false
  requestAnimationFrame(() => refreshReveal())
}

// ============ Hero 星空粒子 ============
const stars = ref<{ left: number; top: number; size: number; delay: number; dur: number }[]>([])
function initStars() {
  const arr: { left: number; top: number; size: number; delay: number; dur: number }[] = []
  for (let i = 0; i < 120; i++) {
    arr.push({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 6,
      dur: Math.random() * 4 + 2
    })
  }
  stars.value = arr
}

// ============ CHARACTERS 轮播 ============
const activeCharIndex = ref(0)
const activeChar = computed(() => characters.value[activeCharIndex.value] || fallbackCharacters[0])
function prevChar() {
  if (!characters.value.length) return
  activeCharIndex.value = (activeCharIndex.value - 1 + characters.value.length) % characters.value.length
}
function nextChar() {
  if (!characters.value.length) return
  activeCharIndex.value = (activeCharIndex.value + 1) % characters.value.length
}
function selectChar(i: number) {
  activeCharIndex.value = i
}
const charIndexLabel = computed(() => {
  const total = characters.value.length
  if (!total) return '00 / 00'
  return String(activeCharIndex.value + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0')
})

// ============ LORE 世界观分页 ============
const activeLoreIndex = ref(0)
const activeLore = computed(() => sects.value[activeLoreIndex.value] || fallbackSects[0])
function prevLore() {
  if (!sects.value.length) return
  activeLoreIndex.value = (activeLoreIndex.value - 1 + sects.value.length) % sects.value.length
}
function nextLore() {
  if (!sects.value.length) return
  activeLoreIndex.value = (activeLoreIndex.value + 1) % sects.value.length
}
function selectLore(i: number) {
  activeLoreIndex.value = i
}

// ============ GALLERY 画廊 ============
interface GalleryItem {
  title: string
  desc: string
  cover: string
  span: 'wide' | 'tall' | 'normal'
}
const galleryItems: GalleryItem[] = [
  { title: '云顶王庭', desc: '悬浮王国中央城堡', cover: 'linear-gradient(155deg,#1a2a5a 0%,#3a5a9a 40%,#9cc4ff 100%)', span: 'wide' },
  { title: '深空航迹', desc: '飞舟穿越云海', cover: 'linear-gradient(155deg,#0a0f22 0%,#1a3a5a 50%,#6ea8ff 100%)', span: 'normal' },
  { title: '星辉花园', desc: '神秘学社的星卉', cover: 'linear-gradient(155deg,#3a1a4a 0%,#6a3a7a 50%,#d29eff 100%)', span: 'tall' },
  { title: '陨铁熔炉', desc: '钢铁议会工业区', cover: 'linear-gradient(155deg,#3a2a1a 0%,#6a4a2a 50%,#ffd29e 100%)', span: 'normal' },
  { title: '虚空遗迹', desc: '深空古老文明', cover: 'linear-gradient(155deg,#1a1a2a 0%,#3a3a5a 50%,#9e8eff 100%)', span: 'normal' },
  { title: '星门基地', desc: '本球星门枢纽', cover: 'linear-gradient(155deg,#0a1a3a 0%,#2a4a7a 50%,#8fc0ff 100%)', span: 'wide' },
  { title: '裂风号', desc: '自由航行者旗舰', cover: 'linear-gradient(155deg,#0a2a3a 0%,#2a5a6a 50%,#8fe3c8 100%)', span: 'normal' },
  { title: '陨星冢', desc: '深空灾厄之地', cover: 'linear-gradient(155deg,#1a0a2a 0%,#4a1a3a 50%,#ff9ec8 100%)', span: 'normal' }
]
const galleryTab = ref<'all' | 'scene' | 'character'>('all')
const filteredGallery = computed(() => galleryItems)

// ============ GAMEPLAY 玩法分页 ============
const activeFeatureIndex = ref(0)
const activeFeature = computed(() => features.value[activeFeatureIndex.value] || fallbackFeatures[0])
function prevFeature() {
  if (!features.value.length) return
  activeFeatureIndex.value = (activeFeatureIndex.value - 1 + features.value.length) % features.value.length
}
function nextFeature() {
  if (!features.value.length) return
  activeFeatureIndex.value = (activeFeatureIndex.value + 1) % features.value.length
}
function selectFeature(i: number) {
  activeFeatureIndex.value = i
}

// ============ Hero Banner 自动轮播 ============
const heroBanners = computed<Banner[]>(() => {
  if (banners.value.length > 0) return banners.value
  return [
    {
      id: 0,
      title: '深空云顶',
      subtitle: '空中飞船 · 城堡全景 · 深空探索',
      cover: 'linear-gradient(180deg,#02030a 0%,#050818 40%,#0a1a3a 100%)',
      link: '#characters'
    }
  ]
})
const activeBannerIndex = ref(0)
const activeBanner = computed(() => heroBanners.value[activeBannerIndex.value] || heroBanners.value[0])
let bannerTimer: ReturnType<typeof setInterval> | null = null
function startBannerRotation() {
  stopBannerRotation()
  if (heroBanners.value.length <= 1) return
  bannerTimer = setInterval(() => {
    activeBannerIndex.value = (activeBannerIndex.value + 1) % heroBanners.value.length
  }, 7000)
}
function stopBannerRotation() {
  if (bannerTimer) {
    clearInterval(bannerTimer)
    bannerTimer = null
  }
}

onMounted(() => {
  initStars()
  loadAll().finally(() => {
    requestAnimationFrame(() => {
      refreshReveal()
      startBannerRotation()
    })
  })
})

onBeforeUnmount(() => {
  stopBannerRotation()
})
</script>

<template>
  <div class="home">
    <!-- ============ 1. CINEMATIC HERO ============ -->
    <section class="hero">
      <!-- DB Banner 封面底 -->
      <div class="hero-bg" :style="{ background: activeBanner?.cover }"></div>
      <!-- 宏大本地星云渐变（叠加，确保史诗感） -->
      <div class="hero-nebula-grand" aria-hidden="true"></div>

      <!-- 3D 星图网格透视地平 -->
      <div class="hero-grid-3d" aria-hidden="true"></div>

      <!-- 远景星空粒子（视差远景） -->
      <div class="hero-stars hero-stars-far" aria-hidden="true">
        <span
          v-for="(s, i) in stars"
          :key="'sf' + i"
          class="star star-far"
          :style="{
            left: s.left + '%',
            top: s.top + '%',
            width: s.size + 'px',
            height: s.size + 'px',
            animationDelay: s.delay + 's',
            animationDuration: s.dur + 's'
          }"
        ></span>
      </div>

      <!-- 近景星空粒子（视差近景） -->
      <div class="hero-stars hero-stars-near" aria-hidden="true">
        <span
          v-for="(s, i) in stars"
          :key="'sn' + i"
          class="star star-near"
          :style="{
            left: s.left + '%',
            top: s.top + '%',
            width: (s.size * 1.8) + 'px',
            height: (s.size * 1.8) + 'px',
            animationDelay: (s.delay + 1.2) + 's',
            animationDuration: (s.dur + 1.8) + 's'
          }"
        ></span>
      </div>

      <!-- 深空光柱 -->
      <div class="hero-lightbeam" aria-hidden="true"></div>

      <!-- 星云光晕 -->
      <div class="hero-nebula" aria-hidden="true">
        <span class="nebula nebula-1"></span>
        <span class="nebula nebula-2"></span>
        <span class="nebula nebula-3"></span>
      </div>

      <!-- 行星轮廓 -->
      <div class="hero-planet" aria-hidden="true">
        <svg viewBox="0 0 200 200" width="240" height="240">
          <defs>
            <radialGradient id="planetG" cx="38%" cy="34%" r="72%">
              <stop offset="0%" stop-color="#1c2858" />
              <stop offset="55%" stop-color="#0a0f24" />
              <stop offset="100%" stop-color="#03050f" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="70" fill="url(#planetG)" stroke="rgba(96,140,255,0.35)" stroke-width="1" />
          <ellipse cx="100" cy="100" rx="94" ry="26" fill="none" stroke="rgba(180,108,255,0.42)" stroke-width="1" transform="rotate(-18 100 100)" />
          <ellipse cx="100" cy="100" rx="88" ry="22" fill="none" stroke="rgba(125,160,216,0.26)" stroke-width="0.6" transform="rotate(-18 100 100)" />
          <circle cx="78" cy="78" r="7" fill="rgba(96,140,255,0.18)" />
          <circle cx="122" cy="112" r="5" fill="rgba(180,108,255,0.16)" />
        </svg>
      </div>

      <!-- 飞船剪影 -->
      <div class="hero-airship" aria-hidden="true">
        <svg viewBox="0 0 240 90" width="240" height="90">
          <defs>
            <linearGradient id="shipG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#8AAEFF" stop-opacity="0.95" />
              <stop offset="60%" stop-color="#608CFF" stop-opacity="0.7" />
              <stop offset="100%" stop-color="#B46CFF" stop-opacity="0.5" />
            </linearGradient>
          </defs>
          <ellipse cx="120" cy="40" rx="88" ry="22" fill="url(#shipG)" />
          <rect x="96" y="56" width="48" height="16" rx="5" fill="#8AAEFF" opacity="0.85" />
          <circle cx="120" cy="40" r="5" fill="#ffffff" opacity="0.98" />
          <circle cx="84" cy="40" r="2.5" fill="#ffffff" opacity="0.8" />
          <circle cx="156" cy="40" r="2.5" fill="#ffffff" opacity="0.8" />
          <path d="M32 40 Q14 40 8 48" stroke="#8AAEFF" stroke-width="2.5" fill="none" opacity="0.7" />
          <path d="M32 40 L4 40" stroke="url(#shipG)" stroke-width="2" opacity="0.45" stroke-dasharray="2 5" />
        </svg>
      </div>

      <!-- 城堡剪影 -->
      <div class="hero-castle" aria-hidden="true">
        <svg viewBox="0 0 1400 240" preserveAspectRatio="xMidYMax slice">
          <g fill="#02030a" opacity="0.96">
            <path d="M0 240 L0 160 L70 160 L70 120 L100 100 L130 120 L130 160 L220 160 L220 100 L260 100 L260 130 L320 130 L320 80 L350 55 L380 80 L380 160 L500 160 L500 110 L540 110 L540 140 L620 140 L620 65 L650 38 L680 65 L680 160 L820 160 L820 120 L860 120 L860 90 L890 65 L920 90 L920 160 L1040 160 L1040 110 L1080 110 L1080 140 L1160 140 L1160 80 L1190 55 L1220 80 L1220 160 L1320 160 L1320 120 L1360 120 L1360 160 L1400 160 L1400 240 Z" />
          </g>
          <g fill="#8AAEFF" opacity="0.95">
            <circle cx="100" cy="108" r="2.5" />
            <circle cx="350" cy="63" r="3" />
            <circle cx="650" cy="46" r="3.5" />
            <circle cx="890" cy="73" r="3" />
            <circle cx="1190" cy="60" r="3.5" />
          </g>
          <g fill="#608CFF" opacity="0.7">
            <rect x="115" y="135" width="3" height="6" />
            <rect x="365" y="100" width="3" height="6" />
            <rect x="665" y="85" width="3" height="6" />
            <rect x="905" y="110" width="3" height="6" />
            <rect x="1205" y="95" width="3" height="6" />
          </g>
        </svg>
      </div>

      <div class="hero-vignette"></div>

      <div class="hero-content">
        <p class="hero-eyebrow"><span class="hero-eyebrow-sym">✦</span> SKYWARD CROWN · 深空云顶 <span class="hero-eyebrow-sym">✦</span></p>
        <h1 class="hero-title">
          <span class="hero-title-cn">深空云顶</span>
          <span class="hero-title-en">SKYWARD CROWN</span>
        </h1>
        <p class="hero-slogan">
          {{ activeBanner?.subtitle || '空中飞船 · 城堡全景 · 深空探索' }}
        </p>
        <p v-if="game?.tagline" class="hero-meta">{{ game.tagline }}</p>
        <div class="hero-actions">
          <router-link to="/play" class="btn btn-primary">
            <span>立即试玩</span>
            <span class="arrow">→</span>
          </router-link>
          <a class="btn btn-ghost" href="#characters">探索角色</a>
        </div>
      </div>

      <a href="#characters" class="hero-scroll" aria-label="向下滚动">
        <span class="hero-scroll-line"></span>
        <span class="hero-scroll-text">SCROLL</span>
      </a>

      <div v-if="heroBanners.length > 1" class="hero-dots">
        <button
          v-for="(b, i) in heroBanners"
          :key="b.id"
          class="dot"
          :class="{ active: i === activeBannerIndex }"
          @click="activeBannerIndex = i; startBannerRotation()"
          :aria-label="`切换至 ${b.title}`"
        ></button>
      </div>
    </section>

    <!-- ============ 2. CHARACTERS 角色展示 ============ -->
    <section id="characters" class="characters">
      <div class="section-deco section-deco-left" aria-hidden="true"></div>
      <div class="section-head reveal">
        <p class="section-kicker">CHARACTERS</p>
        <h2 class="section-title">云端角色</h2>
        <p class="section-desc">星岚王储、风行船长、花语魔女……云端王国的旅人们等你相遇。</p>
      </div>

      <div class="char-stage reveal">
        <!-- 左侧大卡 -->
        <transition name="char-fade" mode="out-in">
          <div class="char-card" :key="activeChar.id">
            <div class="char-cover" :style="{ background: coverGradient(activeChar.cover || '') }">
              <!-- 深空主题兜底叠层（themeCover 兜底） -->
              <div class="cover-overlay" :class="'accent-' + ((activeCharIndex % 5) + 1)" aria-hidden="true"></div>
              <div class="char-grid-deco" aria-hidden="true"></div>
              <div class="char-orbit" aria-hidden="true">
                <span class="orbit-ring"></span>
                <span class="orbit-ring orbit-ring-2"></span>
                <span class="orbit-dot orbit-dot-1"></span>
                <span class="orbit-dot orbit-dot-2"></span>
              </div>
              <div class="char-portrait" aria-hidden="true">
                <svg viewBox="0 0 160 200" width="160" height="200">
                  <defs>
                    <linearGradient id="portG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
                      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.4" />
                    </linearGradient>
                  </defs>
                  <circle cx="80" cy="60" r="32" fill="url(#portG)" />
                  <path d="M28 200 Q28 120 80 120 Q132 120 132 200 Z" fill="url(#portG)" />
                  <circle cx="80" cy="60" r="32" fill="none" stroke="#8AAEFF" stroke-width="1" opacity="0.6" />
                </svg>
              </div>
              <span class="char-role-tag" :style="{ color: roleColor(activeChar.role), borderColor: roleColor(activeChar.role) }">{{ activeChar.role }}</span>
              <span class="char-diff-tag">{{ activeChar.difficulty }}难度</span>
              <h3 class="char-name">{{ activeChar.name }}</h3>
              <p class="char-title-on-cover">{{ activeChar.title }}</p>
            </div>
          </div>
        </transition>

        <!-- 右侧档案 -->
        <transition name="char-fade" mode="out-in">
          <div class="char-profile" :key="'p' + activeChar.id">
            <div class="char-index">{{ charIndexLabel }}</div>
            <h3 class="char-profile-name">{{ activeChar.name }}</h3>
            <p class="char-profile-title">{{ activeChar.title }}</p>

            <div class="char-meta-grid">
              <div class="meta-item">
                <span class="meta-label">阵营</span>
                <span class="meta-value">{{ activeChar.faction }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">定位</span>
                <span class="meta-value" :style="{ color: roleColor(activeChar.role) }">{{ activeChar.role }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">难度</span>
                <span class="meta-value">{{ activeChar.difficulty }}</span>
              </div>
            </div>

            <p class="char-profile-desc">{{ activeChar.description }}</p>

            <p class="char-quote">「{{ activeChar.title }}，为云端而战。」</p>
          </div>
        </transition>

        <!-- 切换按钮 -->
        <button class="char-nav char-prev" @click="prevChar" aria-label="上一个角色">‹</button>
        <button class="char-nav char-next" @click="nextChar" aria-label="下一个角色">›</button>

        <!-- 编号指示器 -->
        <div class="char-thumbs">
          <button
            v-for="(ch, i) in characters"
            :key="ch.id"
            class="char-thumb"
            :class="{ active: i === activeCharIndex }"
            @click="selectChar(i)"
            :aria-label="`切换至 ${ch.name}`"
          >
            <span class="thumb-num">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="thumb-name">{{ ch.name }}</span>
          </button>
        </div>
      </div>

      <div class="section-more">
        <router-link to="/characters" class="btn btn-ghost">查看全部角色 →</router-link>
      </div>
    </section>

    <!-- ============ 3. LORE 世界观 ============ -->
    <section id="lore" class="lore">
      <div class="section-deco section-deco-right" aria-hidden="true"></div>
      <div class="section-head reveal">
        <p class="section-kicker">LORE</p>
        <h2 class="section-title">云端世界观</h2>
        <p class="section-desc">四大势力据守云端，各有理念，各据一方。</p>
      </div>

      <div class="lore-stage reveal">
        <transition name="lore-fade" mode="out-in">
          <div class="lore-card" :key="activeLore.id">
            <div class="lore-visual" :style="{ background: coverGradient(activeLore.cover || '') }">
              <div class="cover-overlay" :class="'accent-' + ((activeLoreIndex % 5) + 1)" aria-hidden="true"></div>
              <div class="lore-grid-deco" aria-hidden="true"></div>
              <div class="lore-rune" aria-hidden="true">
                <svg viewBox="0 0 120 120" width="120" height="120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.4" />
                  <circle cx="60" cy="60" r="38" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.5" />
                  <circle cx="60" cy="60" r="26" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.7" />
                  <path d="M60 10 L60 110 M10 60 L110 60" stroke="#ffffff" stroke-width="0.5" opacity="0.4" />
                  <circle cx="60" cy="60" r="6" fill="#ffffff" opacity="0.9" />
                </svg>
              </div>
              <span class="lore-philosophy">{{ activeLore.philosophy }}</span>
              <p class="lore-index-num">{{ String(activeLoreIndex + 1).padStart(2, '0') }}</p>
            </div>

            <div class="lore-text">
              <p class="lore-subtitle">{{ activeLore.subtitle }}</p>
              <h3 class="lore-name">{{ activeLore.name }}</h3>
              <p class="lore-desc">{{ activeLore.description }}</p>

              <div class="lore-controls">
                <button class="lore-nav-btn" @click="prevLore" aria-label="上一条">‹ 上一个</button>
                <span class="lore-progress">{{ String(activeLoreIndex + 1).padStart(2, '0') }} / {{ String(sects.length).padStart(2, '0') }}</span>
                <button class="lore-nav-btn" @click="nextLore" aria-label="下一条">下一个 ›</button>
              </div>
            </div>
          </div>
        </transition>

        <div class="lore-tabs">
          <button
            v-for="(s, i) in sects"
            :key="s.id"
            class="lore-tab"
            :class="{ active: i === activeLoreIndex }"
            @click="selectLore(i)"
          >{{ s.name }}</button>
        </div>
      </div>
    </section>

    <!-- ============ 4. GALLERY 影像画廊 ============ -->
    <section id="gallery" class="gallery">
      <div class="section-head reveal">
        <p class="section-kicker">GALLERY</p>
        <h2 class="section-title">影像画廊</h2>
        <p class="section-desc">深空云顶的壮阔景致与角色瞬间，尽在影像之间。</p>
      </div>

      <div class="gallery-tabs reveal">
        <button
          v-for="tab in [{ k: 'all', l: '全部' }, { k: 'scene', l: '场景' }, { k: 'character', l: '角色' }]"
          :key="tab.k"
          class="gallery-tab"
          :class="{ active: galleryTab === (tab.k as typeof galleryTab) }"
          @click="galleryTab = tab.k as typeof galleryTab"
        >{{ tab.l }}</button>
      </div>

      <div class="gallery-grid reveal">
        <div
          v-for="(item, i) in filteredGallery"
          :key="i"
          class="gallery-item"
          :class="['span-' + item.span, 'accent-' + ((i % 5) + 1)]"
          :style="{ background: item.cover }"
        >
          <div class="cover-overlay" aria-hidden="true"></div>
          <div class="gallery-grid-deco" aria-hidden="true"></div>
          <div class="gallery-info">
            <p class="gallery-title">{{ item.title }}</p>
            <p class="gallery-desc">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 5. GAMEPLAY 玩法介绍 ============ -->
    <section id="gameplay" class="gameplay">
      <div class="section-deco section-deco-left" aria-hidden="true"></div>
      <div class="section-head reveal">
        <p class="section-kicker">GAMEPLAY</p>
        <h2 class="section-title">玩法特色</h2>
        <p class="section-desc">飞船航行、城堡全景、深空探索、阵营博弈——云端王国的多元玩法。</p>
      </div>

      <div class="gameplay-stage reveal">
        <transition name="gp-fade" mode="out-in">
          <div class="gameplay-card" :key="activeFeature.id">
            <div class="gameplay-visual">
              <div class="gp-grid-deco" aria-hidden="true"></div>
              <div class="gp-orbit" aria-hidden="true"></div>
              <div class="gp-icon">{{ activeFeature.icon || '✦' }}</div>
              <div class="gp-glow" aria-hidden="true"></div>
              <p class="gp-summary">{{ activeFeature.summary }}</p>
              <p class="gp-index">{{ String(activeFeatureIndex + 1).padStart(2, '0') }}</p>
            </div>

            <div class="gameplay-text">
              <h3 class="gp-title">{{ activeFeature.title }}</h3>
              <p class="gp-desc">{{ activeFeature.description }}</p>

              <div class="gp-controls">
                <button class="gp-nav-btn" @click="prevFeature" aria-label="上一个">‹</button>
                <span class="gp-progress">{{ String(activeFeatureIndex + 1).padStart(2, '0') }} / {{ String(features.length).padStart(2, '0') }}</span>
                <button class="gp-nav-btn" @click="nextFeature" aria-label="下一个">›</button>
              </div>
            </div>
          </div>
        </transition>

        <div class="gp-tabs">
          <button
            v-for="(f, i) in features"
            :key="f.id"
            class="gp-tab"
            :class="{ active: i === activeFeatureIndex }"
            @click="selectFeature(i)"
          >
            <span class="gp-tab-icon">{{ f.icon || '✦' }}</span>
            <span class="gp-tab-name">{{ f.title }}</span>
          </button>
        </div>

        <div class="gp-cta">
          <router-link to="/play" class="btn btn-primary">
            <span>进入 PC 试玩</span>
            <span class="arrow">→</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- ============ 6. NOTICE 公告 ============ -->
    <section id="notice" class="notice">
      <div class="section-deco section-deco-right" aria-hidden="true"></div>
      <div class="section-head reveal">
        <p class="section-kicker">NOTICE</p>
        <h2 class="section-title">最新资讯</h2>
        <p class="section-desc">来自深空云顶的最新动态与公告。</p>
      </div>

      <div class="news-list reveal">
        <article
          v-for="item in news"
          :key="item.id"
          class="news-row"
          @click="$router.push(`/news/${item.id}`)"
        >
          <div class="news-date">
            <span class="news-day">{{ formatMonthDay(item.publishTime).day }}</span>
            <span class="news-month">{{ formatMonthDay(item.publishTime).year }}.{{ formatMonthDay(item.publishTime).month }}</span>
          </div>
          <div class="news-body">
            <span
              class="news-tag"
              :style="{
                background: newsCategoryColor(item.category),
                borderColor: newsCategoryColor(item.category)
              }"
            >{{ newsCategoryLabel(item.category) }}</span>
            <h3 class="news-title">{{ item.title }}</h3>
            <p class="news-summary">{{ item.summary }}</p>
          </div>
          <span class="news-arrow">→</span>
        </article>
      </div>

      <div class="section-more">
        <router-link to="/news" class="btn btn-ghost">查看全部资讯 →</router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  width: 100%;
  position: relative;
}

/* ============ 通用 section ============ */
.characters,
.lore,
.gallery,
.gameplay,
.notice {
  padding: 150px 0;
  position: relative;
  overflow: hidden;
}

.section-more {
  margin-top: 56px;
  text-align: center;
}

/* 章节装饰星轨 */
.section-deco {
  position: absolute;
  top: 18%;
  width: 360px;
  height: 360px;
  pointer-events: none;
  opacity: 0.5;
  z-index: 0;
}

.section-deco-left {
  left: -120px;
  background: radial-gradient(circle, rgba(96, 140, 255, 0.16), transparent 65%);
  filter: blur(20px);
}

.section-deco-right {
  right: -120px;
  background: radial-gradient(circle, rgba(180, 108, 255, 0.14), transparent 65%);
  filter: blur(20px);
}

/* 深空主题兜底叠层（themeCover 兜底：把任意 DB 封面压暗为星际暗调） */
.cover-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(3, 5, 15, 0.30) 0%, transparent 35%, rgba(3, 5, 15, 0.55) 100%),
    radial-gradient(ellipse at 30% 20%, rgba(96, 140, 255, 0.18), transparent 60%);
  z-index: 1;
}

.cover-overlay.accent-1 { box-shadow: inset 0 0 80px rgba(96, 140, 255, 0.22); }
.cover-overlay.accent-2 { box-shadow: inset 0 0 80px rgba(180, 108, 255, 0.22); }
.cover-overlay.accent-3 { box-shadow: inset 0 0 80px rgba(125, 160, 216, 0.22); }
.cover-overlay.accent-4 { box-shadow: inset 0 0 80px rgba(110, 232, 200, 0.18); }
.cover-overlay.accent-5 { box-shadow: inset 0 0 80px rgba(242, 194, 107, 0.18); }

/* ============ 1. HERO ============ */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  background: #03050F;
}

.hero-bg {
  position: absolute;
  inset: 0;
  transition: background 1.4s var(--ease);
  z-index: 0;
  opacity: 0.55;
}

/* 宏大本地星云渐变 */
.hero-nebula-grand {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 70% 50% at 50% 30%, rgba(96, 140, 255, 0.22), transparent 60%),
    radial-gradient(ellipse 60% 45% at 25% 70%, rgba(180, 108, 255, 0.18), transparent 60%),
    radial-gradient(ellipse 60% 45% at 78% 65%, rgba(125, 160, 216, 0.14), transparent 60%),
    linear-gradient(180deg, #03050F 0%, #050818 45%, #0A0F24 100%);
  pointer-events: none;
}

/* 3D 星图网格透视地平 */
.hero-grid-3d {
  position: absolute;
  inset: 0;
  z-index: 1;
  perspective: 520px;
  pointer-events: none;
  overflow: hidden;
}

.hero-grid-3d::before {
  content: '';
  position: absolute;
  left: -60%;
  right: -60%;
  bottom: -2%;
  height: 65%;
  background-image:
    linear-gradient(rgba(96, 140, 255, 0.22) 1px, transparent 1px),
    linear-gradient(90deg, rgba(96, 140, 255, 0.22) 1px, transparent 1px);
  background-size: 64px 64px;
  transform: rotateX(72deg);
  transform-origin: bottom center;
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 45%, #000 100%);
  mask-image: linear-gradient(180deg, transparent 0%, #000 45%, #000 100%);
  animation: gridScroll 14s linear infinite;
}

@keyframes gridScroll {
  from { background-position: 0 0; }
  to { background-position: 0 64px; }
}

.hero-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.hero-stars-near {
  z-index: 2;
}

.star {
  position: absolute;
  background: #ffffff;
  border-radius: 50%;
  opacity: 0.6;
  animation: starTwinkle ease-in-out infinite;
}

.star-far {
  box-shadow: 0 0 3px rgba(232, 238, 255, 0.7);
  opacity: 0.45;
}

.star-near {
  background: #E8EEFF;
  box-shadow: 0 0 6px rgba(138, 174, 255, 0.9), 0 0 12px rgba(96, 140, 255, 0.5);
  opacity: 0.7;
}

@keyframes starTwinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.3); }
}

/* 深空光柱 */
.hero-lightbeam {
  position: absolute;
  top: -12%;
  left: 50%;
  transform: translateX(-50%) rotate(6deg);
  width: 420px;
  height: 130%;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(96, 140, 255, 0.12) 28%,
    rgba(180, 108, 255, 0.10) 58%,
    transparent 90%);
  filter: blur(34px);
  opacity: 0.85;
  animation: beamBreathe 8s ease-in-out infinite;
}

@keyframes beamBreathe {
  0%, 100% { opacity: 0.6; transform: translateX(-50%) rotate(6deg) scaleX(1); }
  50% { opacity: 1; transform: translateX(-50%) rotate(6deg) scaleX(1.15); }
}

.hero-nebula {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.4;
  animation: nebulaDrift 22s ease-in-out infinite;
}

.nebula-1 {
  width: 680px;
  height: 680px;
  top: -12%;
  left: -10%;
  background: radial-gradient(circle, rgba(96, 140, 255, 0.55), transparent 70%);
}

.nebula-2 {
  width: 560px;
  height: 560px;
  bottom: -12%;
  right: -6%;
  background: radial-gradient(circle, rgba(180, 108, 255, 0.5), transparent 70%);
  animation-delay: -7s;
}

.nebula-3 {
  width: 440px;
  height: 440px;
  top: 38%;
  left: 50%;
  transform: translateX(-50%);
  background: radial-gradient(circle, rgba(125, 160, 216, 0.4), transparent 70%);
  animation-delay: -14s;
  opacity: 0.22;
}

@keyframes nebulaDrift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(44px, -34px) scale(1.12); }
}

/* 行星轮廓 */
.hero-planet {
  position: absolute;
  top: 14%;
  right: 7%;
  z-index: 2;
  pointer-events: none;
  opacity: 0.85;
  filter: drop-shadow(0 0 30px rgba(96, 140, 255, 0.25));
  animation: planetFloat 18s ease-in-out infinite;
}

@keyframes planetFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-18px) rotate(6deg); }
}

.hero-airship {
  position: absolute;
  top: 24%;
  left: -18%;
  z-index: 3;
  pointer-events: none;
  filter: drop-shadow(0 8px 28px rgba(96, 140, 255, 0.35));
  animation: airshipFly 44s linear infinite;
  opacity: 0.9;
}

@keyframes airshipFly {
  0% { transform: translate(0, 0) rotate(-3deg); }
  50% { transform: translate(80vw, -44px) rotate(2deg); }
  100% { transform: translate(168vw, 0) rotate(-3deg); }
}

.hero-castle {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  pointer-events: none;
  line-height: 0;
}

.hero-castle svg {
  width: 100%;
  height: auto;
  display: block;
}

.hero-vignette {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at center, transparent 0%, transparent 38%, rgba(3, 5, 15, 0.62) 100%),
    linear-gradient(180deg, rgba(3, 5, 15, 0.45) 0%, transparent 28%, transparent 58%, rgba(3, 5, 15, 0.88) 100%);
  pointer-events: none;
  z-index: 4;
}

.hero-content {
  position: relative;
  z-index: 6;
  padding: 0 24px;
  width: 100%;
  max-width: 920px;
  animation: heroIn 1.6s var(--ease);
}

@keyframes heroIn {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-eyebrow {
  font-size: 12px;
  letter-spacing: 6px;
  color: var(--accent-hover);
  margin-bottom: 32px;
  text-transform: uppercase;
  font-weight: 600;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 0 32px;
}

.hero-eyebrow::before,
.hero-eyebrow::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 26px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent));
}

.hero-eyebrow::before { left: 0; background: linear-gradient(90deg, transparent, var(--accent)); }
.hero-eyebrow::after { right: 0; background: linear-gradient(90deg, var(--violet), transparent); }

.hero-eyebrow-sym {
  color: var(--violet);
  font-size: 14px;
}

.hero-title {
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.hero-title-cn {
  font-size: clamp(56px, 11vw, 140px);
  font-weight: 800;
  letter-spacing: 16px;
  line-height: 1;
  color: #ffffff;
  text-shadow:
    0 0 40px rgba(96, 140, 255, 0.65),
    0 0 90px rgba(96, 140, 255, 0.35),
    0 0 140px rgba(180, 108, 255, 0.25);
  padding-left: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #E8EEFF 55%, #B8C8FF 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-title-en {
  font-size: clamp(13px, 1.6vw, 18px);
  letter-spacing: 10px;
  color: var(--accent-hover);
  font-weight: 300;
  padding-left: 10px;
  font-family: var(--font-mono);
}

.hero-slogan {
  font-size: clamp(14px, 1.5vw, 17px);
  color: var(--text-muted);
  letter-spacing: 4px;
  line-height: 2;
  max-width: 580px;
  margin: 0 auto 18px;
}

.hero-meta {
  font-size: 12px;
  letter-spacing: 5px;
  color: var(--violet);
  margin: 0 auto 44px;
  font-family: var(--font-mono);
  opacity: 0.85;
}

.hero-actions {
  display: flex;
  gap: 18px;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-actions .arrow {
  transition: transform 0.3s ease;
}

.hero-actions .btn-primary:hover .arrow {
  transform: translateX(4px);
}

.hero-dots {
  position: absolute;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 6;
  display: flex;
  gap: 10px;
}

.dot {
  width: 28px;
  height: 3px;
  background: rgba(232, 238, 255, 0.2);
  border-radius: 2px;
  transition: var(--transition);
}

.dot.active {
  background: linear-gradient(90deg, var(--accent), var(--violet));
  width: 48px;
  box-shadow: 0 0 12px var(--accent);
}

.hero-scroll {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: var(--text-muted);
  font-size: 10px;
  letter-spacing: 3px;
  font-family: var(--font-mono);
}

.hero-scroll-line {
  width: 1px;
  height: 50px;
  background: linear-gradient(180deg, transparent, var(--accent));
  position: relative;
  overflow: hidden;
}

.hero-scroll-line::after {
  content: '';
  position: absolute;
  top: -50%;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(180deg, transparent, #ffffff);
  animation: scrollLine 1.8s ease-in-out infinite;
}

@keyframes scrollLine {
  0% { top: -50%; }
  100% { top: 100%; }
}

/* ============ 2. CHARACTERS ============ */
.characters {
  background:
    radial-gradient(ellipse 60% 50% at 80% 0%, rgba(180, 108, 255, 0.08), transparent 60%),
    linear-gradient(180deg, #03050F 0%, #050818 50%, #050818 100%);
}

.char-stage {
  position: relative;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 80px;
  align-items: center;
  z-index: 1;
}

.char-card {
  position: relative;
  transition: transform 0.6s var(--ease);
}

.char-card:hover {
  transform: translateY(-6px) perspective(1000px) rotateY(-2deg);
}

.char-cover {
  position: relative;
  height: 560px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-star);
  box-shadow: var(--shadow-card), 0 0 1px rgba(180, 108, 255, 0.2);
}

.char-grid-deco {
  position: absolute;
  inset: 0;
  z-index: 1;
  background-image:
    linear-gradient(rgba(232, 238, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(232, 238, 255, 0.05) 1px, transparent 1px);
  background-size: 42px 42px;
  pointer-events: none;
  -webkit-mask-image: radial-gradient(circle at 50% 45%, #000 30%, transparent 85%);
  mask-image: radial-gradient(circle at 50% 45%, #000 30%, transparent 85%);
}

.char-orbit {
  position: absolute;
  top: 42%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 260px;
  height: 260px;
  pointer-events: none;
  z-index: 2;
}

.orbit-ring {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(232, 238, 255, 0.22);
  border-radius: 50%;
  animation: orbitRotate 18s linear infinite;
}

.orbit-ring::before {
  content: '';
  position: absolute;
  inset: 30px;
  border: 1px dashed rgba(232, 238, 255, 0.16);
  border-radius: 50%;
}

.orbit-ring-2 {
  inset: 56px;
  border-color: rgba(180, 108, 255, 0.22);
  animation-duration: 12s;
  animation-direction: reverse;
}

.orbit-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 12px #ffffff;
}

.orbit-dot-1 {
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
}

.orbit-dot-2 {
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent);
  box-shadow: 0 0 12px var(--accent);
}

@keyframes orbitRotate {
  from { transform: rotate(0); }
  to { transform: rotate(360deg); }
}

.char-portrait {
  position: absolute;
  bottom: 64px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0.9;
  filter: drop-shadow(0 8px 22px rgba(0, 0, 0, 0.45));
  z-index: 2;
}

.char-role-tag,
.char-diff-tag {
  position: absolute;
  top: 20px;
  z-index: 3;
  padding: 5px 14px;
  font-size: 11px;
  letter-spacing: 2px;
  font-weight: 600;
  border-radius: 999px;
  backdrop-filter: blur(6px);
  background: rgba(3, 5, 15, 0.55);
}

.char-role-tag {
  left: 20px;
  border: 1px solid;
}

.char-diff-tag {
  right: 20px;
  color: var(--text);
  border: 1px solid var(--border-strong);
}

.char-name {
  position: absolute;
  bottom: 24px;
  left: 28px;
  z-index: 3;
  font-size: clamp(36px, 4vw, 56px);
  font-weight: 800;
  letter-spacing: 8px;
  color: #ffffff;
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.7), 0 0 30px rgba(96, 140, 255, 0.3);
  line-height: 1;
}

.char-title-on-cover {
  position: absolute;
  bottom: 14px;
  left: 28px;
  z-index: 3;
  font-size: 12px;
  letter-spacing: 4px;
  color: var(--accent-hover);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s var(--ease);
}

/* 档案 */
.char-profile {
  position: relative;
}

.char-index {
  font-size: 14px;
  letter-spacing: 6px;
  color: var(--accent);
  margin-bottom: 24px;
  font-family: var(--font-mono);
  font-weight: 700;
}

.char-profile-name {
  font-size: clamp(40px, 5vw, 64px);
  font-weight: 800;
  letter-spacing: 12px;
  color: var(--text);
  line-height: 1;
  margin-bottom: 12px;
  text-shadow: 0 0 30px rgba(96, 140, 255, 0.2);
}

.char-profile-title {
  font-size: 14px;
  letter-spacing: 4px;
  color: var(--accent-hover);
  margin-bottom: 32px;
}

.char-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 24px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  margin-bottom: 32px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-label {
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--text-dim);
  text-transform: uppercase;
}

.meta-value {
  font-size: 16px;
  letter-spacing: 2px;
  color: var(--text);
  font-weight: 600;
}

.char-profile-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 2;
  margin-bottom: 28px;
}

.char-quote {
  font-size: 16px;
  color: var(--accent-hover);
  letter-spacing: 2px;
  line-height: 1.8;
  font-style: italic;
  padding-left: 20px;
  border-left: 2px solid var(--accent);
}

.char-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--border-strong);
  background: rgba(7, 10, 26, 0.6);
  color: var(--text);
  font-size: 28px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  transition: var(--transition);
  z-index: 5;
}

.char-nav:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent-hover);
  box-shadow: 0 0 18px rgba(96, 140, 255, 0.45);
}

.char-prev { left: -68px; }
.char-next { right: -68px; }

.char-thumbs {
  position: absolute;
  bottom: -100px;
  left: 0;
  right: 0;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
}

.char-thumb {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: rgba(7, 10, 26, 0.4);
  transition: var(--transition);
  min-width: 90px;
}

.char-thumb:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
  transform: translateY(-2px);
}

.char-thumb.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  box-shadow: 0 0 14px rgba(96, 140, 255, 0.35);
}

.thumb-num {
  font-size: 10px;
  color: var(--text-dim);
  letter-spacing: 2px;
  font-family: var(--font-mono);
}

.thumb-name {
  font-size: 13px;
  color: var(--text);
  letter-spacing: 2px;
  margin-top: 2px;
}

.char-thumb.active .thumb-num {
  color: var(--accent-hover);
}

.char-fade-enter-active,
.char-fade-leave-active {
  transition: opacity 0.5s var(--ease), transform 0.5s var(--ease);
}

.char-fade-enter-from { opacity: 0; transform: translateX(20px); }
.char-fade-leave-to { opacity: 0; transform: translateX(-20px); }

/* ============ 3. LORE ============ */
.lore {
  background:
    radial-gradient(ellipse 60% 50% at 20% 100%, rgba(96, 140, 255, 0.08), transparent 60%),
    linear-gradient(180deg, #050818 0%, #0A0F24 100%);
}

.lore-stage {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
}

.lore-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
  min-height: 480px;
}

.lore-visual {
  position: relative;
  height: 480px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-star);
  box-shadow: var(--shadow-card);
  transition: transform 0.6s var(--ease);
}

.lore-visual:hover {
  transform: translateY(-4px);
}

.lore-grid-deco {
  position: absolute;
  inset: 0;
  z-index: 2;
  background-image:
    linear-gradient(rgba(232, 238, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(232, 238, 255, 0.06) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}

.lore-rune {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.55;
  animation: runeRotate 30s linear infinite;
  z-index: 2;
}

@keyframes runeRotate {
  from { transform: translate(-50%, -50%) rotate(0); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.lore-philosophy {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 3;
  padding: 8px 18px;
  font-size: 12px;
  letter-spacing: 4px;
  font-weight: 600;
  color: #ffffff;
  background: rgba(3, 5, 15, 0.6);
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  backdrop-filter: blur(6px);
}

.lore-index-num {
  position: absolute;
  bottom: 24px;
  right: 28px;
  z-index: 3;
  font-size: 80px;
  font-weight: 800;
  color: #ffffff;
  opacity: 0.16;
  line-height: 1;
  font-family: var(--font-mono);
  letter-spacing: -2px;
}

.lore-text {
  position: relative;
}

.lore-subtitle {
  font-size: 12px;
  letter-spacing: 6px;
  color: var(--accent);
  margin-bottom: 16px;
  font-weight: 600;
  font-family: var(--font-mono);
}

.lore-name {
  font-size: clamp(36px, 4.5vw, 56px);
  font-weight: 800;
  letter-spacing: 8px;
  color: var(--text);
  margin-bottom: 24px;
  line-height: 1.1;
  text-shadow: 0 0 30px rgba(96, 140, 255, 0.2);
}

.lore-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 2.1;
  margin-bottom: 40px;
}

.lore-controls {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: 28px;
  border-top: 1px solid var(--border);
}

.lore-nav-btn {
  padding: 10px 18px;
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--text-muted);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: transparent;
  transition: var(--transition);
}

.lore-nav-btn:hover {
  border-color: var(--accent);
  color: var(--accent-hover);
  background: var(--accent-soft);
  box-shadow: 0 0 12px rgba(96, 140, 255, 0.3);
}

.lore-progress {
  font-size: 13px;
  letter-spacing: 4px;
  color: var(--accent-hover);
  font-family: var(--font-mono);
  font-weight: 600;
}

.lore-tabs {
  display: flex;
  gap: 12px;
  margin-top: 56px;
  flex-wrap: wrap;
  justify-content: center;
}

.lore-tab {
  padding: 10px 22px;
  font-size: 13px;
  letter-spacing: 3px;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  transition: var(--transition);
}

.lore-tab:hover {
  border-color: var(--accent);
  color: var(--accent-hover);
}

.lore-tab.active {
  border-color: transparent;
  color: #03050F;
  background: linear-gradient(135deg, var(--accent), var(--violet));
  font-weight: 600;
  box-shadow: 0 0 18px rgba(96, 140, 255, 0.4);
}

.lore-fade-enter-active,
.lore-fade-leave-active {
  transition: opacity 0.5s var(--ease);
}

.lore-fade-enter-from { opacity: 0; }
.lore-fade-leave-to { opacity: 0; }

/* ============ 4. GALLERY ============ */
.gallery {
  background: linear-gradient(180deg, #0A0F24 0%, #050818 100%);
}

.gallery-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 48px;
}

.gallery-tab {
  padding: 10px 28px;
  font-size: 13px;
  letter-spacing: 3px;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  transition: var(--transition);
}

.gallery-tab:hover {
  border-color: var(--accent);
  color: var(--accent-hover);
}

.gallery-tab.active {
  border-color: transparent;
  color: #03050F;
  background: linear-gradient(135deg, var(--accent), var(--violet));
  font-weight: 600;
  box-shadow: 0 0 18px rgba(96, 140, 255, 0.4);
}

.gallery-grid {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 220px;
  gap: 16px;
}

.gallery-item {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border-star);
  cursor: pointer;
  transition: transform 0.5s var(--ease), box-shadow 0.5s var(--ease);
}

.gallery-item:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-hover);
  z-index: 2;
  border-color: var(--accent);
}

.gallery-item.span-wide {
  grid-column: span 2;
}

.gallery-item.span-tall {
  grid-row: span 2;
}

.gallery-grid-deco {
  position: absolute;
  inset: 0;
  z-index: 2;
  background-image:
    linear-gradient(rgba(232, 238, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(232, 238, 255, 0.06) 1px, transparent 1px);
  background-size: 30px 30px;
  pointer-events: none;
  opacity: 0.6;
}

.gallery-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 22px;
  z-index: 3;
  transform: translateY(8px);
  opacity: 0.9;
  transition: transform 0.4s var(--ease), opacity 0.4s var(--ease);
}

.gallery-item:hover .gallery-info {
  transform: translateY(0);
  opacity: 1;
}

.gallery-title {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 3px;
  color: #ffffff;
  margin-bottom: 6px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
}

.gallery-desc {
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--text-muted);
}

/* ============ 5. GAMEPLAY ============ */
.gameplay {
  background:
    radial-gradient(ellipse 60% 50% at 80% 0%, rgba(180, 108, 255, 0.08), transparent 60%),
    linear-gradient(180deg, #050818 0%, #0A0F24 100%);
}

.gameplay-stage {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
}

.gameplay-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
  min-height: 420px;
}

.gameplay-visual {
  position: relative;
  height: 420px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-star);
  background:
    radial-gradient(circle at 50% 50%, rgba(96, 140, 255, 0.12), transparent 65%),
    linear-gradient(135deg, #070A1A 0%, #131A35 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-card);
}

.gp-grid-deco {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(96, 140, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(96, 140, 255, 0.08) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  -webkit-mask-image: radial-gradient(circle at 50% 50%, #000 20%, transparent 80%);
  mask-image: radial-gradient(circle at 50% 50%, #000 20%, transparent 80%);
}

.gp-orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 280px;
  height: 280px;
  transform: translate(-50%, -50%);
  border: 1px dashed rgba(180, 108, 255, 0.3);
  border-radius: 50%;
  animation: orbitRotate 26s linear infinite;
  pointer-events: none;
}

.gp-orbit::before {
  content: '';
  position: absolute;
  inset: 36px;
  border: 1px solid rgba(96, 140, 255, 0.18);
  border-radius: 50%;
}

.gp-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(96, 140, 255, 0.32), transparent 70%);
  filter: blur(22px);
  pointer-events: none;
  animation: gpGlow 4s ease-in-out infinite;
}

@keyframes gpGlow {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.95; transform: translate(-50%, -50%) scale(1.18); }
}

.gp-icon {
  position: relative;
  z-index: 2;
  font-size: 120px;
  color: var(--accent);
  text-shadow: 0 0 40px var(--accent), 0 0 80px rgba(180, 108, 255, 0.5);
  line-height: 1;
}

.gp-summary {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 2;
  font-size: 11px;
  letter-spacing: 5px;
  color: var(--accent-hover);
  font-weight: 600;
  font-family: var(--font-mono);
}

.gp-index {
  position: absolute;
  bottom: 20px;
  right: 28px;
  z-index: 2;
  font-size: 72px;
  font-weight: 800;
  color: #ffffff;
  opacity: 0.16;
  line-height: 1;
  font-family: var(--font-mono);
}

.gameplay-text {
  position: relative;
}

.gp-title {
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 800;
  letter-spacing: 6px;
  color: var(--text);
  margin-bottom: 24px;
  line-height: 1.2;
  text-shadow: 0 0 30px rgba(96, 140, 255, 0.2);
}

.gp-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 2.1;
  margin-bottom: 36px;
}

.gp-controls {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: 28px;
  border-top: 1px solid var(--border);
}

.gp-nav-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--border-strong);
  background: transparent;
  color: var(--text);
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.gp-nav-btn:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent-hover);
  box-shadow: 0 0 14px rgba(96, 140, 255, 0.45);
}

.gp-progress {
  font-size: 13px;
  letter-spacing: 4px;
  color: var(--accent-hover);
  font-family: var(--font-mono);
  font-weight: 600;
}

.gp-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 56px;
}

.gp-tab {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 22px;
  text-align: left;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: rgba(7, 10, 26, 0.4);
  transition: var(--transition);
  backdrop-filter: blur(6px);
}

.gp-tab:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.gp-tab.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  box-shadow: 0 0 20px rgba(96, 140, 255, 0.28), inset 0 0 30px rgba(180, 108, 255, 0.08);
}

.gp-tab-icon {
  font-size: 22px;
  color: var(--accent);
  flex-shrink: 0;
  text-shadow: 0 0 12px var(--accent);
}

.gp-tab-name {
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--text);
  font-weight: 600;
}

.gp-cta {
  margin-top: 56px;
  text-align: center;
}

.gp-cta .arrow {
  transition: transform 0.3s ease;
}

.gp-cta .btn-primary:hover .arrow {
  transform: translateX(4px);
}

.gp-fade-enter-active,
.gp-fade-leave-active {
  transition: opacity 0.5s var(--ease);
}

.gp-fade-enter-from { opacity: 0; }
.gp-fade-leave-to { opacity: 0; }

/* ============ 6. NOTICE ============ */
.notice {
  background:
    radial-gradient(ellipse 60% 50% at 20% 100%, rgba(96, 140, 255, 0.08), transparent 60%),
    linear-gradient(180deg, #0A0F24 0%, #03050F 100%);
}

.news-list {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  z-index: 1;
}

.news-row {
  display: grid;
  grid-template-columns: 110px 1fr auto;
  gap: 32px;
  align-items: center;
  padding: 24px 12px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.3s ease, padding 0.3s ease, border-color 0.3s ease;
  position: relative;
}

.news-row::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, var(--accent), var(--violet));
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.35s var(--ease);
}

.news-row:hover {
  background: linear-gradient(90deg, rgba(96, 140, 255, 0.06), transparent 70%);
  padding-left: 24px;
  padding-right: 24px;
  border-bottom-color: var(--border-star);
}

.news-row:hover::before {
  transform: scaleY(1);
}

.news-row:hover .news-arrow {
  transform: translateX(6px);
  color: var(--accent-hover);
}

.news-date {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
  padding-right: 24px;
}

.news-day {
  font-size: 36px;
  font-weight: 800;
  color: var(--accent-hover);
  line-height: 1;
  font-family: var(--font-mono);
  text-shadow: 0 0 18px rgba(96, 140, 255, 0.3);
}

.news-month {
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 2px;
  margin-top: 6px;
  font-family: var(--font-mono);
}

.news-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.news-tag {
  align-self: flex-start;
  padding: 3px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #03050F;
  border-radius: var(--radius-sm);
  letter-spacing: 1px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.3);
}

.news-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 2px;
  line-height: 1.4;
}

.news-summary {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-arrow {
  font-size: 22px;
  color: var(--text-dim);
  transition: transform 0.3s ease, color 0.3s ease;
}

/* ============ 响应式 ============ */
@media (max-width: 1080px) {
  .characters,
  .lore,
  .gallery,
  .gameplay,
  .notice {
    padding: 110px 0;
  }

  .char-stage {
    grid-template-columns: 1fr;
    gap: 56px;
  }

  .char-cover {
    height: 460px;
  }

  .char-prev { left: 12px; }
  .char-next { right: 12px; }

  .char-thumbs {
    position: relative;
    bottom: auto;
    justify-content: flex-start;
  }

  .lore-card {
    grid-template-columns: 1fr;
    gap: 40px;
    min-height: auto;
  }

  .lore-visual {
    height: 360px;
  }

  .gameplay-card {
    grid-template-columns: 1fr;
    gap: 40px;
    min-height: auto;
  }

  .gameplay-visual {
    height: 320px;
  }

  .gp-tabs {
    grid-template-columns: repeat(2, 1fr);
  }

  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .hero-planet {
    right: -40px;
    opacity: 0.55;
  }
}

@media (max-width: 768px) {
  .characters,
  .lore,
  .gallery,
  .gameplay,
  .notice {
    padding: 80px 0;
  }

  .hero-title-cn {
    letter-spacing: 10px;
    padding-left: 10px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-actions .btn {
    width: 100%;
  }

  .hero-planet {
    display: none;
  }

  .char-cover {
    height: 380px;
  }

  .char-name {
    font-size: 36px;
    letter-spacing: 6px;
  }

  .char-meta-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .char-quote {
    font-size: 14px;
  }

  .lore-visual,
  .gameplay-visual {
    height: 280px;
  }

  .gp-icon {
    font-size: 80px;
  }

  .gp-tabs {
    grid-template-columns: 1fr;
  }

  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 160px;
  }

  .gallery-item.span-wide {
    grid-column: span 2;
  }

  .gallery-item.span-tall {
    grid-row: span 1;
  }

  .news-row {
    grid-template-columns: 80px 1fr;
    gap: 18px;
    padding: 18px 8px;
  }

  .news-row:hover {
    padding-left: 12px;
    padding-right: 12px;
  }

  .news-arrow {
    display: none;
  }

  .news-day {
    font-size: 26px;
  }

  .news-date {
    padding-right: 14px;
  }

  .news-title {
    font-size: 15px;
  }

  .lore-controls,
  .gp-controls {
    gap: 14px;
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .gallery-item.span-wide {
    grid-column: span 1;
  }
}
</style>
