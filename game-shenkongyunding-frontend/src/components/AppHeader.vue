<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

const scrolled = ref(false)
const menuOpen = ref(false)
const route = useRoute()

function onScroll() {
  scrolled.value = window.scrollY > 24
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header class="app-header" :class="{ scrolled: scrolled || menuOpen }">
    <!-- 顶部星辉光带 -->
    <span class="header-lightband" aria-hidden="true"></span>
    <div class="header-inner">
      <router-link to="/" class="logo" @click="closeMenu">
        <span class="logo-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="30" height="30">
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#8AAEFF" />
                <stop offset="55%" stop-color="#608CFF" />
                <stop offset="100%" stop-color="#B46CFF" />
              </linearGradient>
              <radialGradient id="lgCore" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
                <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
              </radialGradient>
            </defs>
            <!-- 星辉核心晕 -->
            <circle cx="16" cy="16" r="13" fill="url(#lgCore)" opacity="0.55" />
            <!-- 四芒星王冠 -->
            <path d="M16 3 L18.4 13.6 L29 16 L18.4 18.4 L16 29 L13.6 18.4 L3 16 L13.6 13.6 Z" fill="url(#lg)" />
            <!-- 外环轨道 -->
            <circle cx="16" cy="16" r="14" fill="none" stroke="#608CFF" stroke-width="0.6" opacity="0.45" />
            <circle cx="16" cy="16" r="10.5" fill="none" stroke="#B46CFF" stroke-width="0.5" opacity="0.35" stroke-dasharray="2 3" />
            <!-- 卫星点 -->
            <g fill="#ffffff">
              <circle cx="16" cy="2.5" r="1.1" />
              <circle cx="16" cy="29.5" r="0.8" opacity="0.8" />
              <circle cx="27.5" cy="9" r="0.7" opacity="0.7" />
              <circle cx="4.5" cy="23" r="0.7" opacity="0.7" />
            </g>
          </svg>
        </span>
        <span class="logo-text">
          <span class="logo-cn">深空云顶</span>
          <span class="logo-en">SKYWARD CROWN</span>
        </span>
      </router-link>

      <nav class="nav" :class="{ open: menuOpen }">
        <router-link to="/" class="nav-link" :class="{ active: route.path === '/' }" @click="closeMenu">首页</router-link>
        <router-link to="/characters" class="nav-link" :class="{ active: route.path === '/characters' }" @click="closeMenu">角色</router-link>
        <router-link to="/sects" class="nav-link" :class="{ active: route.path === '/sects' }" @click="closeMenu">世界观</router-link>
        <a href="/#gameplay" class="nav-link" @click="closeMenu">玩法</a>
        <a href="/#notice" class="nav-link" @click="closeMenu">资讯</a>
        <router-link to="/about" class="nav-link" :class="{ active: route.path === '/about' }" @click="closeMenu">关于</router-link>
        <router-link to="/play" class="nav-link nav-play" :class="{ active: route.path === '/play' }" @click="closeMenu">
          <span class="nav-play-dot"></span>试玩
        </router-link>
      </nav>

      <button class="nav-toggle" :class="{ open: menuOpen }" @click="toggleMenu" aria-label="菜单">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--header-h);
  background: linear-gradient(180deg, rgba(3, 5, 15, 0.55) 0%, rgba(3, 5, 15, 0.18) 100%);
  backdrop-filter: blur(16px) saturate(1.1);
  -webkit-backdrop-filter: blur(16px) saturate(1.1);
  border-bottom: 1px solid transparent;
  transition: background 0.4s var(--ease), border-color 0.4s var(--ease);
}

.app-header.scrolled {
  background: linear-gradient(180deg, rgba(3, 5, 15, 0.92) 0%, rgba(3, 5, 15, 0.78) 100%);
  border-bottom-color: var(--border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

/* 顶部贯穿星辉光带 */
.header-lightband {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(96, 140, 255, 0) 8%,
    rgba(96, 140, 255, 0.6) 30%,
    rgba(180, 108, 255, 0.7) 50%,
    rgba(96, 140, 255, 0.6) 70%,
    rgba(96, 140, 255, 0) 92%,
    transparent 100%);
  opacity: 0.5;
  transition: opacity 0.4s var(--ease);
}

.app-header.scrolled .header-lightband {
  opacity: 1;
}

.header-inner {
  max-width: var(--container);
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 6px rgba(96, 140, 255, 0.55));
  transition: filter 0.4s var(--ease), transform 0.6s var(--ease);
}

.logo:hover .logo-mark {
  filter: drop-shadow(0 0 10px rgba(96, 140, 255, 0.85));
  transform: rotate(45deg);
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.logo-cn {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--text);
  text-shadow: 0 0 18px rgba(96, 140, 255, 0.25);
}

.logo-en {
  font-size: 9px;
  letter-spacing: 2px;
  color: var(--accent-hover);
  margin-top: 3px;
  font-family: var(--font-mono);
}

.nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.nav-link {
  position: relative;
  padding: 8px 16px;
  font-size: 14px;
  letter-spacing: 2px;
  color: var(--text-muted);
  transition: color 0.25s ease;
}

.nav-link::before {
  content: '';
  position: absolute;
  left: 50%;
  right: 50%;
  bottom: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent), var(--violet), transparent);
  border-radius: 1px;
  opacity: 0;
  transition: left 0.35s var(--ease), right 0.35s var(--ease), opacity 0.35s var(--ease);
}

.nav-link:hover,
.nav-link.active {
  color: var(--text);
  text-shadow: 0 0 14px rgba(96, 140, 255, 0.35);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 0;
  height: 2px;
  border-radius: 1px;
  background: linear-gradient(90deg, var(--accent), var(--violet));
  box-shadow: 0 0 10px rgba(96, 140, 255, 0.6);
}

.nav-link:not(.nav-play):hover::before {
  left: 14px;
  right: 14px;
  opacity: 1;
}

.nav-play {
  margin-left: 10px;
  padding: 8px 20px;
  font-weight: 700;
  color: var(--accent-hover);
  border: 1px solid var(--border-star);
  border-radius: 999px;
  background: var(--accent-soft);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.nav-play::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 30%, rgba(255, 255, 255, 0.25) 50%, transparent 70%);
  transform: translateX(-120%);
  transition: transform 0.6s var(--ease);
}

.nav-play:hover {
  color: #03050F;
  background: linear-gradient(135deg, var(--accent), var(--violet));
  border-color: transparent;
  box-shadow: 0 0 22px rgba(96, 140, 255, 0.55), 0 0 8px rgba(180, 108, 255, 0.4);
}

.nav-play:hover::before {
  transform: translateX(120%);
}

.nav-play.active {
  color: #03050F;
  background: linear-gradient(135deg, var(--accent), var(--violet));
  border-color: transparent;
}

.nav-play-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
  animation: playPulse 1.8s ease-in-out infinite;
}

.nav-play:hover .nav-play-dot,
.nav-play.active .nav-play-dot {
  background: #03050F;
  box-shadow: none;
}

@keyframes playPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.7); }
}

.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  width: 32px;
  height: 32px;
  justify-content: center;
  align-items: center;
}

.nav-toggle span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--text);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.nav-toggle.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.nav-toggle.open span:nth-child(2) {
  opacity: 0;
}

.nav-toggle.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

@media (max-width: 768px) {
  .nav-toggle {
    display: flex;
  }

  .nav {
    position: fixed;
    top: var(--header-h);
    right: 0;
    width: 72%;
    max-width: 300px;
    height: calc(100vh - var(--header-h));
    flex-direction: column;
    gap: 0;
    background: linear-gradient(180deg, rgba(3, 5, 15, 0.97), rgba(7, 10, 26, 0.97));
    backdrop-filter: blur(16px);
    padding: 24px 0;
    transform: translateX(100%);
    transition: transform 0.35s var(--ease);
    border-left: 1px solid var(--border-star);
    box-shadow: -16px 0 40px rgba(0, 0, 0, 0.5);
  }

  .nav.open {
    transform: translateX(0);
  }

  .nav-link {
    display: block;
    padding: 14px 28px;
    font-size: 15px;
    border-bottom: 1px solid var(--border);
  }

  .nav-link.active::after {
    left: 28px;
    right: auto;
    width: 28px;
  }

  .nav-play {
    margin: 16px 28px 0;
    align-self: stretch;
    justify-content: center;
    border-bottom: none;
  }

  .logo-en {
    display: none;
  }
}
</style>
