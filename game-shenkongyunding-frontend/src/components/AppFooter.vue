<script setup lang="ts">
import { ref } from 'vue'

const year = ref(new Date().getFullYear())
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <div class="brand-row">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="34" height="34">
              <defs>
                <linearGradient id="fg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#9cc4ff" />
                  <stop offset="100%" stop-color="#6ea8ff" />
                </linearGradient>
              </defs>
              <path d="M7 22 a6 6 0 0 1 0.5 -11 a8 8 0 0 1 15 1 a5.5 5.5 0 0 1 -1 10 z" fill="url(#fg)" />
              <g fill="#ffffff" opacity="0.9">
                <circle cx="11" cy="11" r="1" />
                <circle cx="22" cy="9" r="0.8" />
                <circle cx="24" cy="17" r="0.9" />
              </g>
            </svg>
          </span>
          <div class="brand-text">
            <span class="brand-cn">深空云顶</span>
            <span class="brand-en">SKYWARD CROWN</span>
          </div>
        </div>
        <p class="brand-slogan">空中飞船 · 城堡全景 · 深空探索</p>
      </div>

      <div class="footer-cols">
        <div class="footer-col">
          <h4 class="footer-title">游戏</h4>
          <ul>
            <li><router-link to="/characters">角色档案</router-link></li>
            <li><router-link to="/sects">云顶国度</router-link></li>
            <li><a href="/#gameplay">玩法特色</a></li>
            <li><router-link to="/play">PC 试玩</router-link></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-title">动态</h4>
          <ul>
            <li><router-link to="/news">新闻中心</router-link></li>
            <li><a href="/#notice">最新资讯</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-title">关于</h4>
          <ul>
            <li><router-link to="/about">关于深空云顶</router-link></li>
            <li><a href="mailto:hr@shixingxu.com">加入我们</a></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="container footer-bottom">
      <p class="footer-copy">© {{ year }} 深空云顶 SKYWARD CROWN · 版权所有</p>
      <p class="footer-icp">沪ICP备XXXXXXXX号-1 · 沪公网安备 XXXXXXXXXXXX号</p>
      <p class="footer-tip">
        健康游戏忠告：抵制不良游戏，拒绝盗版游戏。注意自我保护，谨防受骗上当。适度游戏益脑，沉迷游戏伤身。合理安排时间，享受健康生活。
      </p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: linear-gradient(180deg, #050818 0%, #02030a 100%);
  border-top: 1px solid var(--border);
  padding: 64px 0 28px;
  position: relative;
}

.site-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 800px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0.5;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.4fr 2fr;
  gap: 56px;
  padding-bottom: 48px;
  border-bottom: 1px solid var(--border);
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-cn {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--text);
}

.brand-en {
  font-size: 10px;
  letter-spacing: 3px;
  color: var(--accent-hover);
  margin-top: 4px;
}

.brand-slogan {
  font-size: 14px;
  color: var(--text-muted);
  letter-spacing: 2px;
  line-height: 2;
}

.footer-cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.footer-title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 3px;
  color: var(--accent-hover);
  margin-bottom: 18px;
}

.footer-col ul {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-col a {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1px;
  transition: color 0.25s ease, transform 0.25s ease;
  display: inline-block;
}

.footer-col a:hover {
  color: var(--accent-hover);
  transform: translateX(3px);
}

.footer-bottom {
  padding-top: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-copy {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.footer-icp {
  font-size: 12px;
  color: var(--text-dim);
  letter-spacing: 1px;
}

.footer-tip {
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 1px;
  line-height: 1.8;
  max-width: 720px;
  margin: 8px auto 0;
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 36px;
    padding-bottom: 32px;
  }

  .footer-cols {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media (max-width: 520px) {
  .footer-cols {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
