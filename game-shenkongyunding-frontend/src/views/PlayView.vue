<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useReveal, refreshReveal } from '@/composables/useReveal'

useReveal()

// ============ 职业定义 ============
interface Skill {
  id: number
  name: string
  key: string
  slot: number
  type: 'normal' | 'active' | 'combo'
  cooldown: number
  mpCost: number
  damage: number
  desc: string
  color: string
}

interface Profession {
  id: string
  name: string
  title: string
  desc: string
  cover: string
  color: string
  hp: number
  mp: number
  atk: number
  skills: Skill[]
}

const professions: Profession[] = [
  {
    id: 'swordsman', name: '剑士', title: '云顶近卫', color: '#ff9ec8',
    cover: 'linear-gradient(155deg,#3a1a2a 0%,#7a2a4a 50%,#ff9ec8 100%)',
    desc: '近战均衡型，以星辉重剑斩敌。技能连段顺畅，攻防一体，是深空王庭近卫的标准培养路线。',
    hp: 1200, mp: 100, atk: 28,
    skills: [
      { id: 1, name: '星辉斩', key: '1', slot: 1, type: 'normal', cooldown: 0.6, mpCost: 0, damage: 30, desc: '基础近战三连斩', color: '#e8eaf5' },
      { id: 2, name: '裂空斩', key: '2', slot: 2, type: 'active', cooldown: 4, mpCost: 15, damage: 95, desc: '上挑剑气，浮空敌人', color: '#6ea8ff' },
      { id: 3, name: '旋风斩', key: '3', slot: 3, type: 'active', cooldown: 6, mpCost: 22, damage: 130, desc: '范围旋转斩击', color: '#9cc4ff' },
      { id: 4, name: '冲锋突刺', key: '4', slot: 4, type: 'active', cooldown: 8, mpCost: 28, damage: 160, desc: '直线突进重击', color: '#8fe3c8' },
      { id: 5, name: '斩铁', key: 'Q', slot: 5, type: 'active', cooldown: 12, mpCost: 40, damage: 240, desc: '蓄力一击，破甲效果', color: '#ffd29e' },
      { id: 6, name: '流星落', key: 'W', slot: 6, type: 'combo', cooldown: 18, mpCost: 55, damage: 360, desc: '连招终结：天降流星', color: '#ff9ec8' },
      { id: 7, name: '烈焰裂波', key: 'E', slot: 7, type: 'combo', cooldown: 22, mpCost: 65, damage: 440, desc: '连招觉醒：烈焰爆发', color: '#ff7e8e' },
      { id: 8, name: '星辉终焉', key: 'R', slot: 8, type: 'combo', cooldown: 35, mpCost: 90, damage: 720, desc: '终极奥义：剑斩深空', color: '#ffffff' }
    ]
  },
  {
    id: 'mage', name: '法师', title: '星辉术士', color: '#a98eff',
    cover: 'linear-gradient(155deg,#1a1a4a 0%,#3a3a8a 50%,#a98eff 100%)',
    desc: '远程群伤型，以星辉术轰击敌阵。范围伤害强大，机动性较低，是云端学社培养的核心法系。',
    hp: 850, mp: 200, atk: 38,
    skills: [
      { id: 1, name: '星辉弹', key: '1', slot: 1, type: 'normal', cooldown: 0.5, mpCost: 0, damage: 32, desc: '基础远程弹幕', color: '#e8eaf5' },
      { id: 2, name: '烈焰术', key: '2', slot: 2, type: 'active', cooldown: 4, mpCost: 20, damage: 100, desc: '范围火球灼烧', color: '#ff7e8e' },
      { id: 3, name: '寒冰环', key: '3', slot: 3, type: 'active', cooldown: 6, mpCost: 25, damage: 120, desc: '冰环减速敌人', color: '#8fc0ff' },
      { id: 4, name: '雷霆击', key: '4', slot: 4, type: 'active', cooldown: 9, mpCost: 32, damage: 180, desc: '单体雷击高伤', color: '#9cc4ff' },
      { id: 5, name: '陨星术', key: 'Q', slot: 5, type: 'active', cooldown: 13, mpCost: 48, damage: 280, desc: '召唤陨石范围爆', color: '#ffd29e' },
      { id: 6, name: '元素共鸣', key: 'W', slot: 6, type: 'combo', cooldown: 18, mpCost: 60, damage: 380, desc: '连招终结：三系齐发', color: '#a98eff' },
      { id: 7, name: '虚空裂隙', key: 'E', slot: 7, type: 'combo', cooldown: 24, mpCost: 75, damage: 460, desc: '连招觉醒：撕裂虚空', color: '#9e8eff' },
      { id: 8, name: '深空湮灭', key: 'R', slot: 8, type: 'combo', cooldown: 38, mpCost: 100, damage: 780, desc: '终极奥义：湮灭深空', color: '#ffffff' }
    ]
  },
  {
    id: 'archer', name: '弓手', title: '风行射手', color: '#8fe3c8',
    cover: 'linear-gradient(155deg,#0a3a3a 0%,#2a6a5a 50%,#8fe3c8 100%)',
    desc: '远程高敏型，以星辉长弓连射。攻速极快机动性强，是自由航行者培养的远程游侠。',
    hp: 950, mp: 130, atk: 32,
    skills: [
      { id: 1, name: '星辉箭', key: '1', slot: 1, type: 'normal', cooldown: 0.4, mpCost: 0, damage: 28, desc: '快速连射', color: '#e8eaf5' },
      { id: 2, name: '三连射', key: '2', slot: 2, type: 'active', cooldown: 3, mpCost: 15, damage: 85, desc: '三箭连发', color: '#8fe3c8' },
      { id: 3, name: '穿透箭', key: '3', slot: 3, type: 'active', cooldown: 5, mpCost: 22, damage: 120, desc: '穿透直线敌人', color: '#6ea8ff' },
      { id: 4, name: '风行步', key: '4', slot: 4, type: 'active', cooldown: 7, mpCost: 25, damage: 0, desc: '位移并回MP', color: '#9cc4ff' },
      { id: 5, name: '爆裂箭', key: 'Q', slot: 5, type: 'active', cooldown: 11, mpCost: 38, damage: 230, desc: '爆炸范围伤害', color: '#ffd29e' },
      { id: 6, name: '箭雨术', key: 'W', slot: 6, type: 'combo', cooldown: 17, mpCost: 55, damage: 350, desc: '连招终结：箭雨覆盖', color: '#8fe3c8' },
      { id: 7, name: '穿心箭', key: 'E', slot: 7, type: 'combo', cooldown: 22, mpCost: 68, damage: 450, desc: '连招觉醒：贯穿心脏', color: '#a98eff' },
      { id: 8, name: '裂风神射', key: 'R', slot: 8, type: 'combo', cooldown: 34, mpCost: 88, damage: 700, desc: '终极奥义：风神之矢', color: '#ffffff' }
    ]
  },
  {
    id: 'mechanic', name: '机工', title: '钢铁工程师', color: '#ffd29e',
    cover: 'linear-gradient(155deg,#3a2a1a 0%,#6a4a2a 50%,#ffd29e 100%)',
    desc: '远程机关型，以星辉机械部署作战。技能多样持续输出强，是钢铁议会培养的工程专家。',
    hp: 1050, mp: 160, atk: 30,
    skills: [
      { id: 1, name: '扳手击', key: '1', slot: 1, type: 'normal', cooldown: 0.6, mpCost: 0, damage: 30, desc: '基础扳手敲击', color: '#e8eaf5' },
      { id: 2, name: '榴弹炮', key: '2', slot: 2, type: 'active', cooldown: 4, mpCost: 18, damage: 95, desc: '投掷榴弹爆炸', color: '#ff7e8e' },
      { id: 3, name: '炮台部署', key: '3', slot: 3, type: 'active', cooldown: 8, mpCost: 30, damage: 140, desc: '召唤炮台射击', color: '#ffd29e' },
      { id: 4, name: '地雷阵', key: '4', slot: 4, type: 'active', cooldown: 7, mpCost: 26, damage: 130, desc: '埋设地雷触发', color: '#9cc4ff' },
      { id: 5, name: '火箭飞弹', key: 'Q', slot: 5, type: 'active', cooldown: 12, mpCost: 42, damage: 250, desc: '追踪火箭群射', color: '#8fe3c8' },
      { id: 6, name: '过载过热', key: 'W', slot: 6, type: 'combo', cooldown: 18, mpCost: 58, damage: 360, desc: '连招终结：机械过载', color: '#ffd29e' },
      { id: 7, name: '连锁爆裂', key: 'E', slot: 7, type: 'combo', cooldown: 23, mpCost: 70, damage: 440, desc: '连招觉醒：连锁爆破', color: '#ff9ec8' },
      { id: 8, name: '深空歼星炮', key: 'R', slot: 8, type: 'combo', cooldown: 37, mpCost: 95, damage: 740, desc: '终极奥义：歼星主炮', color: '#ffffff' }
    ]
  }
]

// ============ 敌人定义 ============
interface Enemy {
  id: number
  name: string
  hp: number
  maxHp: number
  damage: number
  atkInterval: number
  isBoss?: boolean
  phase: number
  cover: string
  lastAtk: number
}

let enemyIdSeq = 1

function makeEnemy(name: string, hp: number, damage: number, atkInterval: number, cover: string, isBoss = false): Enemy {
  return {
    id: enemyIdSeq++,
    name,
    hp,
    maxHp: hp,
    damage,
    atkInterval,
    isBoss,
    phase: 1,
    cover,
    lastAtk: 0
  }
}

// ============ 房间定义 ============
interface Room {
  id: number
  type: 'normal' | 'elite' | 'boss'
  name: string
  enemies: Enemy[]
  cleared: boolean
  visited: boolean
}

function buildDungeon(): Room[] {
  enemyIdSeq = 1
  const rooms: Room[] = [
    {
      id: 1, type: 'normal', name: '云端廊道', cleared: false, visited: true,
      enemies: [
        makeEnemy('星骸哨兵', 220, 28, 3.2, 'linear-gradient(155deg,#1a1a2a,#6ea8ff)'),
        makeEnemy('星骸哨兵', 220, 28, 3.5, 'linear-gradient(155deg,#1a1a2a,#6ea8ff)')
      ]
    },
    {
      id: 2, type: 'normal', name: '浮岛回廊', cleared: false, visited: false,
      enemies: [
        makeEnemy('虚空游魂', 180, 24, 2.8, 'linear-gradient(155deg,#2a1a3a,#9e8eff)'),
        makeEnemy('星骸弩手', 200, 32, 3.0, 'linear-gradient(155deg,#1a2a3a,#8fc0ff)'),
        makeEnemy('虚空游魂', 180, 24, 3.4, 'linear-gradient(155deg,#2a1a3a,#9e8eff)')
      ]
    },
    {
      id: 3, type: 'elite', name: '陨铁监牢', cleared: false, visited: false,
      enemies: [
        makeEnemy('陨铁守卫', 520, 48, 3.6, 'linear-gradient(155deg,#3a2a1a,#ffd29e)'),
        makeEnemy('星骸弩手', 200, 32, 3.0, 'linear-gradient(155deg,#1a2a3a,#8fc0ff)')
      ]
    },
    {
      id: 4, type: 'boss', name: '深空王座', cleared: false, visited: false,
      enemies: [
        makeEnemy('深空灾兽·虚渊', 2400, 70, 3.2, 'linear-gradient(155deg,#1a0a2a 0%,#4a1a3a 50%,#ff9ec8 100%)', true)
      ]
    }
  ]
  return rooms
}

// ============ 游戏状态 ============
type Phase = 'select' | 'battle' | 'clear' | 'fail'
const phase = ref<Phase>('select')
const selectedProf = ref<Profession | null>(null)
const rooms = ref<Room[]>([])
const currentRoomIdx = ref(0)
const startTime = ref(0)
const endTime = ref(0)
const totalCombo = ref(0)
const maxCombo = ref(0)
const drops = ref<string[]>([])

const player = reactive({
  hp: 0,
  maxHp: 0,
  mp: 0,
  maxMp: 0,
  atk: 0,
  combo: 0,
  comboTimer: 0,
  skillCDs: {} as Record<number, number>,
  buffAtk: 0,
  buffDef: 0
})

interface DamageNum {
  id: number
  value: number
  x: number
  y: number
  type: 'normal' | 'crit' | 'heal' | 'boss'
  born: number
}
const damages = ref<DamageNum[]>([])
let dmgIdSeq = 1

const currentRoom = computed(() => rooms.value[currentRoomIdx.value])
const aliveEnemies = computed(() => currentRoom.value?.enemies.filter(e => e.hp > 0) || [])
const bossEnemy = computed(() => currentRoom.value?.enemies.find(e => e.isBoss) || null)
const bossPhase = computed(() => {
  if (!bossEnemy.value) return 1
  const ratio = bossEnemy.value.hp / bossEnemy.value.maxHp
  if (ratio < 0.25) return 3
  if (ratio < 0.5) return 2
  return 1
})

// 连击倍率
const comboMultiplier = computed(() => {
  const c = player.combo
  if (c >= 100) return 3.0
  if (c >= 50) return 2.2
  if (c >= 30) return 1.8
  if (c >= 15) return 1.5
  if (c >= 5) return 1.25
  return 1.0
})

const comboLabel = computed(() => {
  const c = player.combo
  if (c >= 100) return '觉醒'
  if (c >= 50) return '狂热'
  if (c >= 30) return '连段'
  if (c >= 15) return '连击'
  if (c >= 5) return '起手'
  return ''
})

// ============ 选择职业 ============
function selectProfession(p: Profession) {
  selectedProf.value = p
}

function startDungeon() {
  if (!selectedProf.value) return
  player.maxHp = selectedProf.value.hp
  player.hp = selectedProf.value.hp
  player.maxMp = selectedProf.value.mp
  player.mp = selectedProf.value.mp
  player.atk = selectedProf.value.atk
  player.combo = 0
  player.comboTimer = 0
  player.buffAtk = 0
  player.buffDef = 0
  player.skillCDs = {}
  rooms.value = buildDungeon()
  currentRoomIdx.value = 0
  totalCombo.value = 0
  maxCombo.value = 0
  drops.value = []
  phase.value = 'battle'
  startTime.value = Date.now()
  requestAnimationFrame(() => refreshReveal())
}

function backToSelect() {
  phase.value = 'select'
  selectedProf.value = null
  requestAnimationFrame(() => refreshReveal())
}

// ============ 释放技能 ============
function castSkill(skill: Skill) {
  if (phase.value !== 'battle') return
  if (!aliveEnemies.value.length) return
  // 冷却检查
  if ((player.skillCDs[skill.id] || 0) > 0) return
  // MP 检查
  if (player.mp < skill.mpCost) return

  player.mp -= skill.mpCost
  player.skillCDs[skill.id] = skill.cooldown

  // 连击 +1
  player.combo += 1
  player.comboTimer = 2.0
  totalCombo.value += 1
  if (player.combo > maxCombo.value) maxCombo.value = player.combo

  // 计算伤害
  const isCrit = Math.random() < 0.2
  const baseDmg = (skill.damage + player.atk + player.buffAtk) * comboMultiplier.value
  const finalDmg = Math.round(isCrit ? baseDmg * 1.6 : baseDmg)

  // 风行步特殊：位移回MP不造成伤害
  if (skill.name === '风行步') {
    player.mp = Math.min(player.maxMp, player.mp + 30)
    spawnDamage(0, 50, 50, 'heal')
    return
  }

  // 选择目标：Boss 优先，否则第一个存活敌人
  const target = bossEnemy.value && bossEnemy.value.hp > 0
    ? bossEnemy.value
    : aliveEnemies.value[0]
  if (!target) return

  target.hp = Math.max(0, target.hp - finalDmg)
  spawnDamage(finalDmg, 50, 30, isCrit ? 'crit' : 'normal')

  // 范围技能：对所有存活敌人造成 40% 伤害
  if (skill.type === 'active' || skill.type === 'combo') {
    aliveEnemies.value.forEach(e => {
      if (e.id !== target.id && e.hp > 0) {
        const splash = Math.round(finalDmg * 0.4)
        e.hp = Math.max(0, e.hp - splash)
      }
    })
  }

  // 检查敌人死亡
  checkRoomClear()
}

function spawnDamage(value: number, x: number, y: number, type: DamageNum['type']) {
  const id = dmgIdSeq++
  damages.value.push({ id, value, x: x + (Math.random() * 40 - 20), y: y + (Math.random() * 20 - 10), type, born: Date.now() })
  // 1.2 秒后移除
  setTimeout(() => {
    const idx = damages.value.findIndex(d => d.id === id)
    if (idx >= 0) damages.value.splice(idx, 1)
  }, 1200)
}

// ============ 房间清理检查 ============
function checkRoomClear() {
  if (!currentRoom.value) return
  if (aliveEnemies.value.length === 0) {
    currentRoom.value.cleared = true
    // 掉落
    if (Math.random() < 0.5) {
      const items = ['星辉碎片', '陨铁矿石', '深空药水', '星核晶石', '古老符文']
      drops.value.push(items[Math.floor(Math.random() * items.length)])
    }
    // 最后一房 → 通关
    if (currentRoomIdx.value >= rooms.value.length - 1) {
      finishDungeon(true)
    }
  }
}

// Boss 阶段切换
function checkBossPhase() {
  if (!bossEnemy.value) return
  const ratio = bossEnemy.value.hp / bossEnemy.value.maxHp
  // 50% 狂暴
  if (ratio < 0.5 && bossEnemy.value.phase === 1) {
    bossEnemy.value.phase = 2
    bossEnemy.value.damage = Math.round(bossEnemy.value.damage * 1.4)
    bossEnemy.value.atkInterval = Math.max(1.6, bossEnemy.value.atkInterval * 0.75)
    spawnDamage(0, 50, 50, 'boss')
  }
  // 25% 极狂暴
  if (ratio < 0.25 && bossEnemy.value.phase < 3) {
    bossEnemy.value.phase = 3
    bossEnemy.value.damage = Math.round(bossEnemy.value.damage * 1.3)
    bossEnemy.value.atkInterval = Math.max(1.2, bossEnemy.value.atkInterval * 0.8)
  }
}

// ============ 进入下一房间 ============
function goNextRoom() {
  if (!currentRoom.value?.cleared) return
  if (currentRoomIdx.value >= rooms.value.length - 1) return
  currentRoomIdx.value += 1
  if (currentRoom.value) currentRoom.value.visited = true
  // 进入房间回 MP
  player.mp = Math.min(player.maxMp, player.mp + 40)
  // 连击不重置
  requestAnimationFrame(() => refreshReveal())
}

// ============ 完成副本 ============
function finishDungeon(success: boolean) {
  endTime.value = Date.now()
  phase.value = success ? 'clear' : 'fail'
  // 通关额外掉落
  if (success) {
    drops.value.push('深空王座徽章')
    if (maxCombo.value >= 50) drops.value.push('连击大师勋章')
  }
}

function resetGame() {
  phase.value = 'select'
  selectedProf.value = null
  requestAnimationFrame(() => refreshReveal())
}

// ============ 评分 ============
const grade = computed<'S' | 'A' | 'B' | 'C'>(() => {
  if (phase.value !== 'clear' && phase.value !== 'fail') return 'C'
  const time = (endTime.value - startTime.value) / 1000
  let score = 0
  if (maxCombo.value >= 80) score += 40
  else if (maxCombo.value >= 50) score += 30
  else if (maxCombo.value >= 30) score += 20
  else if (maxCombo.value >= 10) score += 10
  if (time < 60) score += 40
  else if (time < 120) score += 30
  else if (time < 180) score += 20
  else if (time < 300) score += 10
  if (player.hp / player.maxHp > 0.7) score += 20
  else if (player.hp / player.maxHp > 0.4) score += 10
  if (score >= 80) return 'S'
  if (score >= 60) return 'A'
  if (score >= 40) return 'B'
  return 'C'
})

const clearTime = computed(() => {
  const t = Math.max(0, Math.floor((endTime.value - startTime.value) / 1000))
  const m = String(Math.floor(t / 60)).padStart(2, '0')
  const s = String(t % 60).padStart(2, '0')
  return `${m}:${s}`
})

// ============ 游戏主循环 ============
let gameTimer: ReturnType<typeof setInterval> | null = null

function gameLoop() {
  if (phase.value !== 'battle') return
  const now = Date.now()

  // 技能冷却递减
  Object.keys(player.skillCDs).forEach(k => {
    const key = Number(k)
    if (player.skillCDs[key] > 0) {
      player.skillCDs[key] = Math.max(0, player.skillCDs[key] - 0.1)
    }
  })

  // 连击计时
  if (player.combo > 0) {
    player.comboTimer -= 0.1
    if (player.comboTimer <= 0) {
      player.combo = 0
    }
  }

  // MP 缓慢回复
  if (player.mp < player.maxMp) {
    player.mp = Math.min(player.maxMp, player.mp + 1.5)
  }

  // 敌人攻击
  if (currentRoom.value) {
    currentRoom.value.enemies.forEach(e => {
      if (e.hp <= 0) return
      // 用真实时间计算
      if (e.lastAtk === 0) e.lastAtk = now / 1000
      const elapsed = now / 1000 - e.lastAtk
      if (elapsed >= e.atkInterval) {
        e.lastAtk = now / 1000
        // Boss 阶段检查
        if (e.isBoss) checkBossPhase()
        const dmg = Math.max(5, e.damage - player.buffDef)
        player.hp = Math.max(0, player.hp - dmg)
        spawnDamage(dmg, 30, 70, e.isBoss ? 'boss' : 'normal')
        if (player.hp <= 0) {
          finishDungeon(false)
        }
      }
    })
  }
}

// ============ 键盘 ============
function onKeydown(e: KeyboardEvent) {
  if (phase.value !== 'battle' || !selectedProf.value) return
  const key = e.key.toUpperCase()
  const skill = selectedProf.value.skills.find(s => s.key.toUpperCase() === key)
  if (skill) {
    e.preventDefault()
    castSkill(skill)
  }
  // 空格进入下一房
  if (e.code === 'Space' && currentRoom.value?.cleared && currentRoomIdx.value < rooms.value.length - 1) {
    e.preventDefault()
    goNextRoom()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  gameTimer = setInterval(gameLoop, 100)
  requestAnimationFrame(() => refreshReveal())
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (gameTimer) {
    clearInterval(gameTimer)
    gameTimer = null
  }
})

// ============ 技能槽计算 ============
const skillSlots = computed(() => {
  if (!selectedProf.value) return []
  const slots: (Skill | null)[] = Array(8).fill(null)
  selectedProf.value.skills.forEach(s => {
    slots[s.slot - 1] = s
  })
  return slots
})

function skillCDPercent(skill: Skill): number {
  const cd = player.skillCDs[skill.id] || 0
  if (cd <= 0) return 0
  return (cd / skill.cooldown) * 100
}

function isSkillReady(skill: Skill): boolean {
  return (player.skillCDs[skill.id] || 0) <= 0 && player.mp >= skill.mpCost
}

// HP/MP 百分比
const hpPercent = computed(() => (player.hp / player.maxHp) * 100)
const mpPercent = computed(() => (player.mp / player.maxMp) * 100)

// Boss HP
const bossHpPercent = computed(() => {
  if (!bossEnemy.value) return 0
  return (bossEnemy.value.hp / bossEnemy.value.maxHp) * 100
})

const bossName = computed(() => bossEnemy.value?.name || '')
</script>

<template>
  <div class="play-view">
    <!-- ============ 职业选择 ============ -->
    <section v-if="phase === 'select'" class="select-phase">
      <div class="select-bg" aria-hidden="true">
        <span v-for="n in 60" :key="'ps' + n" class="bg-star" :style="{
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          width: Math.random() * 2 + 0.5 + 'px',
          height: Math.random() * 2 + 0.5 + 'px',
          animationDelay: Math.random() * 5 + 's'
        }"></span>
      </div>

      <div class="container select-inner reveal">
        <p class="section-kicker">PC DEMO · 副本闯关</p>
        <h1 class="select-title">选择你的职业</h1>
        <p class="select-desc">深空云顶副本闯关试玩沙盒。选择一名云端旅人，挑战深空王座副本，击败深空灾兽·虚渊。</p>

        <div class="prof-grid">
          <button
            v-for="p in professions"
            :key="p.id"
            class="prof-card"
            :class="{ active: selectedProf?.id === p.id }"
            :style="{ '--prof-color': p.color }"
            @click="selectProfession(p)"
          >
            <div class="prof-cover" :style="{ background: p.cover }">
              <div class="prof-portrait" aria-hidden="true">
                <svg viewBox="0 0 100 120" width="100" height="120">
                  <circle cx="50" cy="42" r="22" fill="rgba(255,255,255,0.5)" />
                  <path d="M18 120 Q18 78 50 78 Q82 78 82 120 Z" fill="rgba(255,255,255,0.5)" />
                </svg>
              </div>
              <div class="prof-grid-deco" aria-hidden="true"></div>
              <span class="prof-name-cn">{{ p.name }}</span>
            </div>
            <div class="prof-info">
              <p class="prof-title">{{ p.title }}</p>
              <div class="prof-stats">
                <span class="stat">体力 {{ p.hp }}</span>
                <span class="stat">法力 {{ p.mp }}</span>
                <span class="stat">攻击 {{ p.atk }}</span>
              </div>
              <p class="prof-desc">{{ p.desc }}</p>
            </div>
          </button>
        </div>

        <div v-if="selectedProf" class="prof-detail reveal">
          <h3 class="detail-title">{{ selectedProf.name }} · 技能组</h3>
          <div class="skill-preview">
            <div v-for="s in selectedProf.skills" :key="s.id" class="skill-prev-item">
              <span class="sp-key" :style="{ borderColor: s.color, color: s.color }">{{ s.key }}</span>
              <div class="sp-text">
                <p class="sp-name">{{ s.name }}</p>
                <p class="sp-desc">{{ s.desc }}</p>
              </div>
              <span class="sp-dmg" :style="{ color: s.color }">{{ s.damage }}</span>
            </div>
          </div>
          <button class="btn btn-primary start-btn" @click="startDungeon">
            <span>进入副本</span>
            <span class="arrow">→</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ============ 战斗 ============ -->
    <section v-else-if="phase === 'battle' && selectedProf" class="battle-phase">
      <div class="battle-bg" aria-hidden="true">
        <div class="battle-grid-deco"></div>
        <div class="battle-vignette"></div>
      </div>

      <!-- 顶部：Boss 血条 -->
      <div v-if="bossEnemy && bossEnemy.hp > 0" class="boss-bar">
        <div class="boss-bar-head">
          <span class="boss-name">{{ bossName }}</span>
          <span class="boss-phase">阶段 {{ bossPhase }}</span>
        </div>
        <div class="boss-hp-track">
          <div class="boss-hp-fill" :style="{ width: bossHpPercent + '%' }"></div>
          <div class="boss-hp-marker" style="left: 25%"></div>
          <div class="boss-hp-marker" style="left: 50%"></div>
        </div>
      </div>

      <!-- 主战斗区 -->
      <div class="battle-main">
        <!-- 左侧：玩家信息 -->
        <aside class="player-panel">
          <div class="player-head">
            <div class="player-portrait" :style="{ background: selectedProf.cover }">
              <span class="pp-name">{{ selectedProf.name }}</span>
            </div>
            <div class="player-meta">
              <p class="pm-name">{{ selectedProf.name }}</p>
              <p class="pm-title">{{ selectedProf.title }}</p>
            </div>
          </div>

          <div class="resource-bar">
            <div class="rb-row">
              <span class="rb-label">HP</span>
              <div class="rb-track hp-track">
                <div class="rb-fill hp-fill" :style="{ width: hpPercent + '%' }"></div>
                <span class="rb-text">{{ Math.floor(player.hp) }} / {{ player.maxHp }}</span>
              </div>
            </div>
            <div class="rb-row">
              <span class="rb-label">MP</span>
              <div class="rb-track mp-track">
                <div class="rb-fill mp-fill" :style="{ width: mpPercent + '%' }"></div>
                <span class="rb-text">{{ Math.floor(player.mp) }} / {{ player.maxMp }}</span>
              </div>
            </div>
          </div>

          <!-- 连击计数器 -->
          <div class="combo-meter" :class="{ active: player.combo >= 5 }">
            <div class="combo-head">
              <span class="combo-label">{{ comboLabel || '待命' }}</span>
              <span class="combo-mult">x{{ comboMultiplier.toFixed(2) }}</span>
            </div>
            <div class="combo-value">
              <span class="cv-num">{{ player.combo }}</span>
              <span class="cv-unit">COMBO</span>
            </div>
            <div class="combo-timer-track">
              <div class="combo-timer-fill" :style="{ width: (player.combo > 0 ? (player.comboTimer / 2) * 100 : 0) + '%' }"></div>
            </div>
            <div class="combo-stats">
              <span>最高 {{ maxCombo }}</span>
              <span>累计 {{ totalCombo }}</span>
            </div>
          </div>

          <!-- 小地图 -->
          <div class="minimap">
            <p class="mm-title">副本小地图</p>
            <div class="mm-grid">
              <div
                v-for="(r, i) in rooms"
                :key="r.id"
                class="mm-room"
                :class="{
                  current: i === currentRoomIdx,
                  cleared: r.cleared,
                  visited: r.visited,
                  boss: r.type === 'boss',
                  elite: r.type === 'elite'
                }"
              >
                <span class="mm-room-num">{{ i + 1 }}</span>
                <span class="mm-room-type">{{ r.type === 'boss' ? 'B' : r.type === 'elite' ? 'E' : 'N' }}</span>
              </div>
            </div>
            <div class="mm-legend">
              <span><i class="dot-n"></i>普通</span>
              <span><i class="dot-e"></i>精英</span>
              <span><i class="dot-b"></i>Boss</span>
            </div>
          </div>
        </aside>

        <!-- 中央：战场 -->
        <div class="arena">
          <div class="arena-head">
            <div class="room-info">
              <span class="room-num">房间 {{ currentRoomIdx + 1 }} / {{ rooms.length }}</span>
              <span class="room-name">{{ currentRoom?.name }}</span>
            </div>
            <button class="quit-btn" @click="resetGame">放弃副本</button>
          </div>

          <div class="arena-stage" :style="{ background: currentRoom?.type === 'boss' ? 'linear-gradient(180deg,#1a0a2a 0%,#3a1a2a 100%)' : 'linear-gradient(180deg,#0a0f22 0%,#131a35 100%)' }">
            <div class="arena-grid-deco" aria-hidden="true"></div>

            <!-- 敌人区 -->
            <div class="enemy-zone">
              <div
                v-for="e in currentRoom?.enemies"
                :key="e.id"
                v-show="e.hp > 0"
                class="enemy-card"
                :class="{ boss: e.isBoss, 'phase-2': e.isBoss && e.phase === 2, 'phase-3': e.isBoss && e.phase === 3 }"
              >
                <div class="enemy-portrait" :style="{ background: e.cover }">
                  <div class="enemy-portrait-deco" aria-hidden="true"></div>
                  <span v-if="e.isBoss" class="enemy-boss-tag">BOSS</span>
                </div>
                <div class="enemy-info">
                  <div class="enemy-name-row">
                    <span class="enemy-name">{{ e.name }}</span>
                    <span class="enemy-hp-num">{{ Math.floor(e.hp) }}</span>
                  </div>
                  <div class="enemy-hp-track">
                    <div class="enemy-hp-fill" :style="{ width: (e.hp / e.maxHp) * 100 + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 房间清理提示 -->
            <div v-if="currentRoom?.cleared" class="room-clear">
              <p class="rc-title">房间已清理</p>
              <p class="rc-sub">击败全部敌人，前方还有 {{ rooms.length - currentRoomIdx - 1 }} 个房间</p>
              <button
                v-if="currentRoomIdx < rooms.length - 1"
                class="btn btn-primary next-room-btn"
                @click="goNextRoom"
              >
                <span>进入下一房</span>
                <span class="arrow">→</span>
              </button>
              <p v-else class="rc-final">已抵达最终房间，击败 Boss 即可通关！</p>
            </div>

            <!-- 伤害数字层 -->
            <div class="damage-layer">
              <span
                v-for="d in damages"
                :key="d.id"
                class="damage-num"
                :class="'dmg-' + d.type"
                :style="{ left: d.x + '%', top: d.y + '%' }"
              >{{ d.value > 0 ? d.value : 'MISS' }}{{ d.type === 'crit' ? '!' : '' }}{{ d.type === 'heal' ? '+MP' : '' }}</span>
            </div>
          </div>

          <!-- 技能栏 -->
          <div class="skill-bar">
            <button
              v-for="(skill, idx) in skillSlots"
              :key="idx"
              class="skill-slot"
              :class="{
                empty: !skill,
                ready: skill && isSkillReady(skill),
                'on-cd': skill && !isSkillReady(skill),
                'skill-normal': skill?.type === 'normal',
                'skill-active': skill?.type === 'active',
                'skill-combo': skill?.type === 'combo'
              }"
              :style="skill ? { '--skill-color': skill.color } : {}"
              :disabled="!skill || !isSkillReady(skill)"
              @click="skill && castSkill(skill)"
            >
              <template v-if="skill">
                <span class="ss-key">{{ skill.key }}</span>
                <span class="ss-icon">{{ skill.type === 'combo' ? '★' : skill.type === 'active' ? '◆' : '●' }}</span>
                <span class="ss-name">{{ skill.name }}</span>
                <span class="ss-mp" v-if="skill.mpCost > 0">{{ skill.mpCost }}MP</span>
                <span class="ss-cd" v-if="(player.skillCDs[skill.id] || 0) > 0">{{ (player.skillCDs[skill.id] || 0).toFixed(1) }}</span>
                <div class="ss-cd-overlay" v-if="(player.skillCDs[skill.id] || 0) > 0" :style="{ height: skillCDPercent(skill) + '%' }"></div>
              </template>
              <span v-else class="ss-empty">未装备</span>
            </button>
          </div>

          <!-- 操作提示 -->
          <div class="hint-bar">
            <span>键盘 1/2/3/4/Q/W/E/R 释放技能</span>
            <span>空格键进入下一房</span>
            <span>点击技能槽也可释放</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 通关 / 失败 ============ -->
    <section v-else class="result-phase">
      <div class="result-bg" aria-hidden="true">
        <span v-for="n in 80" :key="'rs' + n" class="bg-star" :style="{
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          width: Math.random() * 2 + 0.5 + 'px',
          height: Math.random() * 2 + 0.5 + 'px',
          animationDelay: Math.random() * 5 + 's'
        }"></span>
      </div>

      <div class="container result-inner reveal">
        <p class="result-kicker">{{ phase === 'clear' ? 'DUNGEON CLEAR' : 'DEFEATED' }}</p>
        <h1 class="result-title" :class="{ fail: phase === 'fail' }">
          {{ phase === 'clear' ? '副本通关' : '挑战失败' }}
        </h1>

        <div class="result-grade" :class="'grade-' + grade">
          <span class="grade-letter">{{ grade }}</span>
          <span class="grade-label">评级</span>
        </div>

        <div class="result-stats">
          <div class="rs-item">
            <span class="rs-label">通关时间</span>
            <span class="rs-value">{{ clearTime }}</span>
          </div>
          <div class="rs-item">
            <span class="rs-label">最高连击</span>
            <span class="rs-value">{{ maxCombo }}</span>
          </div>
          <div class="rs-item">
            <span class="rs-label">累计连击</span>
            <span class="rs-value">{{ totalCombo }}</span>
          </div>
          <div class="rs-item">
            <span class="rs-label">剩余生命</span>
            <span class="rs-value">{{ Math.floor(player.hp) }} / {{ player.maxHp }}</span>
          </div>
        </div>

        <div class="result-drops">
          <p class="rd-title">副本掉落</p>
          <div class="rd-list">
            <span v-for="(item, i) in drops" :key="i" class="rd-item">{{ item }}</span>
            <span v-if="!drops.length" class="rd-empty">无掉落</span>
          </div>
        </div>

        <div class="result-actions">
          <button class="btn btn-primary" @click="startDungeon">
            <span>再次挑战</span>
            <span class="arrow">→</span>
          </button>
          <button class="btn btn-ghost" @click="backToSelect">更换职业</button>
          <router-link to="/" class="btn btn-ghost">返回首页</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.play-view {
  min-height: 100vh;
  background: #02030a;
  position: relative;
}

/* ============ 公共背景星点 ============ */
.bg-star {
  position: absolute;
  background: #ffffff;
  border-radius: 50%;
  opacity: 0.6;
  animation: starTwinkle ease-in-out infinite;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
}

@keyframes starTwinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* ============ 职业选择 ============ */
.select-phase {
  position: relative;
  min-height: calc(100vh - var(--header-h));
  padding: 80px 0 120px;
  overflow: hidden;
}

.select-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.select-inner {
  position: relative;
  z-index: 1;
}

.select-title {
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 800;
  letter-spacing: 8px;
  color: var(--text);
  margin-bottom: 16px;
  text-align: center;
}

.select-desc {
  font-size: 15px;
  color: var(--text-muted);
  letter-spacing: 2px;
  line-height: 1.9;
  max-width: 640px;
  margin: 0 auto 64px;
  text-align: center;
}

.prof-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 56px;
}

.prof-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  background: rgba(12, 18, 40, 0.5);
  transition: var(--transition);
  text-align: left;
  cursor: pointer;
}

.prof-card:hover {
  border-color: var(--prof-color);
  transform: translateY(-6px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.prof-card.active {
  border-color: var(--prof-color);
  box-shadow: 0 0 30px var(--prof-color), 0 20px 50px rgba(0, 0, 0, 0.5);
}

.prof-cover {
  position: relative;
  height: 220px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.prof-portrait {
  opacity: 0.85;
  filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.4));
}

.prof-grid-deco {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
  pointer-events: none;
}

.prof-name-cn {
  position: absolute;
  bottom: 14px;
  left: 16px;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 4px;
  color: #ffffff;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
}

.prof-info {
  padding: 18px 20px 22px;
}

.prof-title {
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--prof-color);
  margin-bottom: 12px;
  font-weight: 600;
}

.prof-stats {
  display: flex;
  gap: 14px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.stat {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 1px;
}

.prof-desc {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.8;
}

.prof-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px;
  background: rgba(12, 18, 40, 0.6);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.detail-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--text);
  margin-bottom: 24px;
  text-align: center;
}

.skill-preview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 32px;
}

.skill-prev-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: rgba(5, 8, 24, 0.5);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.sp-key {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.sp-text {
  flex: 1;
  min-width: 0;
}

.sp-name {
  font-size: 13px;
  color: var(--text);
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 2px;
}

.sp-desc {
  font-size: 11px;
  color: var(--text-dim);
  line-height: 1.5;
}

.sp-dmg {
  font-size: 14px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.start-btn {
  display: flex;
  margin: 0 auto;
}

.start-btn .arrow {
  transition: transform 0.3s ease;
}

.start-btn:hover .arrow {
  transform: translateX(4px);
}

/* ============ 战斗 ============ */
.battle-phase {
  position: relative;
  min-height: calc(100vh - var(--header-h));
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.battle-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.battle-grid-deco {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(110, 168, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(110, 168, 255, 0.04) 1px, transparent 1px);
  background-size: 60px 60px;
}

.battle-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 30%, rgba(2, 3, 10, 0.7) 100%);
}

/* Boss 血条 */
.boss-bar {
  position: relative;
  z-index: 2;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  padding: 14px 20px;
  background: rgba(2, 3, 10, 0.7);
  border: 1px solid #ff9ec8;
  border-radius: var(--radius);
  backdrop-filter: blur(8px);
}

.boss-bar-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.boss-name {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #ff9ec8;
  text-shadow: 0 0 12px rgba(255, 158, 200, 0.6);
}

.boss-phase {
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--text-muted);
  padding: 2px 10px;
  border: 1px solid var(--border-strong);
  border-radius: 999px;
}

.boss-hp-track {
  position: relative;
  height: 14px;
  background: rgba(255, 158, 200, 0.12);
  border-radius: 7px;
  overflow: hidden;
  border: 1px solid rgba(255, 158, 200, 0.3);
}

.boss-hp-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff7e8e, #ff9ec8, #ffd29e);
  transition: width 0.3s ease;
  box-shadow: 0 0 12px rgba(255, 158, 200, 0.5);
}

.boss-hp-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(255, 255, 255, 0.5);
}

/* 主战斗布局 */
.battle-main {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

/* 玩家面板 */
.player-panel {
  background: rgba(12, 18, 40, 0.7);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  backdrop-filter: blur(8px);
}

.player-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-portrait {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--border-strong);
}

.pp-name {
  font-size: 11px;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.pm-name {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--text);
}

.pm-title {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--accent-hover);
  margin-top: 2px;
}

.resource-bar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rb-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rb-label {
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--text-dim);
  width: 24px;
  font-family: 'Courier New', monospace;
  font-weight: 700;
}

.rb-track {
  position: relative;
  flex: 1;
  height: 18px;
  background: rgba(5, 8, 24, 0.6);
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.rb-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.hp-fill {
  background: linear-gradient(90deg, #ff7e8e, #ff9ec8);
}

.mp-fill {
  background: linear-gradient(90deg, #6ea8ff, #9cc4ff);
}

.rb-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #ffffff;
  letter-spacing: 1px;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

/* 连击计数器 */
.combo-meter {
  padding: 14px;
  background: rgba(5, 8, 24, 0.6);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  transition: var(--transition);
}

.combo-meter.active {
  border-color: var(--accent);
  box-shadow: 0 0 18px rgba(110, 168, 255, 0.3);
}

.combo-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.combo-label {
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--text-muted);
  font-weight: 600;
}

.combo-meter.active .combo-label {
  color: var(--accent-hover);
}

.combo-mult {
  font-size: 13px;
  color: var(--accent);
  font-family: 'Courier New', monospace;
  font-weight: 700;
}

.combo-value {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}

.cv-num {
  font-size: 38px;
  font-weight: 800;
  color: var(--text);
  line-height: 1;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 12px rgba(110, 168, 255, 0.5);
}

.combo-meter.active .cv-num {
  color: var(--accent-hover);
  animation: comboPulse 0.4s ease;
}

@keyframes comboPulse {
  0% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.cv-unit {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--text-dim);
}

.combo-timer-track {
  height: 3px;
  background: rgba(5, 8, 24, 0.6);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.combo-timer-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.1s linear;
}

.combo-stats {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 1px;
}

/* 小地图 */
.minimap {
  margin-top: auto;
  padding: 14px;
  background: rgba(5, 8, 24, 0.6);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.mm-title {
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--text-muted);
  margin-bottom: 10px;
  font-weight: 600;
}

.mm-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  margin-bottom: 10px;
}

.mm-room {
  position: relative;
  padding: 8px 4px;
  text-align: center;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: rgba(5, 8, 24, 0.6);
  font-size: 10px;
  color: var(--text-dim);
  letter-spacing: 1px;
}

.mm-room.visited {
  border-color: var(--border-strong);
  color: var(--text-muted);
}

.mm-room.cleared {
  background: rgba(110, 168, 255, 0.15);
  border-color: var(--accent);
  color: var(--accent-hover);
}

.mm-room.current {
  background: var(--accent);
  color: #050818;
  border-color: var(--accent);
  font-weight: 700;
  box-shadow: 0 0 12px var(--accent);
}

.mm-room.boss {
  border-color: #ff9ec8;
}

.mm-room.boss.current {
  background: #ff9ec8;
  border-color: #ff9ec8;
}

.mm-room.elite {
  border-color: #ffd29e;
}

.mm-room-num {
  display: block;
  font-family: 'Courier New', monospace;
  font-weight: 700;
}

.mm-room-type {
  display: block;
  font-size: 9px;
  opacity: 0.7;
  margin-top: 2px;
}

.mm-legend {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-dim);
  letter-spacing: 1px;
}

.mm-legend span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mm-legend i {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  display: inline-block;
}

.mm-legend .dot-n { background: var(--accent); }
.mm-legend .dot-e { background: #ffd29e; }
.mm-legend .dot-b { background: #ff9ec8; }

/* 中央战场 */
.arena {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.arena-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.room-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.room-num {
  font-size: 12px;
  letter-spacing: 3px;
  color: var(--accent-hover);
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.room-name {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--text);
}

.quit-btn {
  padding: 6px 14px;
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--text-muted);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: transparent;
  transition: var(--transition);
}

.quit-btn:hover {
  border-color: #ff7e8e;
  color: #ff7e8e;
}

.arena-stage {
  position: relative;
  flex: 1;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  overflow: hidden;
  min-height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arena-grid-deco {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

.enemy-zone {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 24px;
  max-width: 100%;
}

.enemy-card {
  display: flex;
  flex-direction: column;
  width: 160px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: rgba(2, 3, 10, 0.6);
  transition: var(--transition);
  animation: enemyIn 0.4s var(--ease);
}

@keyframes enemyIn {
  from { opacity: 0; transform: translateY(20px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.enemy-card.boss {
  width: 280px;
  border-color: #ff9ec8;
  box-shadow: 0 0 30px rgba(255, 158, 200, 0.3);
}

.enemy-card.boss.phase-2 {
  border-color: #ff7e8e;
  box-shadow: 0 0 40px rgba(255, 126, 142, 0.5);
  animation: bossRage 1.5s ease-in-out infinite;
}

.enemy-card.boss.phase-3 {
  border-color: #ff4e6e;
  box-shadow: 0 0 50px rgba(255, 78, 110, 0.7);
  animation: bossRage 0.8s ease-in-out infinite;
}

@keyframes bossRage {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

.enemy-portrait {
  position: relative;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.enemy-card.boss .enemy-portrait {
  height: 200px;
}

.enemy-portrait-deco {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}

.enemy-boss-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #050818;
  background: #ff9ec8;
  border-radius: 3px;
}

.enemy-info {
  padding: 10px 12px;
}

.enemy-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.enemy-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: 1px;
}

.enemy-hp-num {
  font-size: 11px;
  color: var(--text-muted);
  font-family: 'Courier New', monospace;
}

.enemy-hp-track {
  height: 6px;
  background: rgba(5, 8, 24, 0.8);
  border-radius: 3px;
  overflow: hidden;
}

.enemy-hp-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff7e8e, #ff9ec8);
  transition: width 0.3s ease;
}

/* 房间清理提示 */
.room-clear {
  position: absolute;
  inset: 0;
  z-index: 5;
  background: rgba(2, 3, 10, 0.85);
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  text-align: center;
}

.rc-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 6px;
  color: var(--accent-hover);
  text-shadow: 0 0 20px var(--accent);
}

.rc-sub {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 2px;
}

.next-room-btn .arrow {
  transition: transform 0.3s ease;
}

.next-room-btn:hover .arrow {
  transform: translateX(4px);
}

.rc-final {
  font-size: 13px;
  color: #ff9ec8;
  letter-spacing: 2px;
}

/* 伤害数字层 */
.damage-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 4;
  overflow: hidden;
}

.damage-num {
  position: absolute;
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
  animation: dmgFloat 1.2s ease-out forwards;
  transform: translate(-50%, -50%);
}

.damage-num.dmg-crit {
  font-size: 32px;
  color: #ffd29e;
  text-shadow: 0 0 10px #ff9ec8, 0 2px 6px rgba(0, 0, 0, 0.8);
}

.damage-num.dmg-heal {
  color: #8fe3c8;
  font-size: 18px;
}

.damage-num.dmg-boss {
  font-size: 20px;
  color: #ff7e8e;
}

@keyframes dmgFloat {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
  20% { opacity: 1; transform: translate(-50%, -80%) scale(1.2); }
  100% { opacity: 0; transform: translate(-50%, -150%) scale(1); }
}

/* 技能栏 */
.skill-bar {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  padding: 12px;
  background: rgba(12, 18, 40, 0.8);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  backdrop-filter: blur(8px);
}

.skill-slot {
  position: relative;
  aspect-ratio: 1 / 1.2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: rgba(5, 8, 24, 0.6);
  overflow: hidden;
  transition: var(--transition);
  cursor: pointer;
}

.skill-slot.empty {
  opacity: 0.3;
  cursor: not-allowed;
}

.skill-slot.ready {
  border-color: var(--skill-color);
  background: rgba(110, 168, 255, 0.08);
}

.skill-slot.ready:hover {
  background: var(--accent-soft);
  transform: translateY(-2px);
  box-shadow: 0 0 14px var(--skill-color);
}

.skill-slot.skill-combo.ready {
  background: rgba(255, 158, 200, 0.1);
}

.skill-slot.on-cd {
  opacity: 0.65;
}

.ss-key {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-dim);
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.skill-slot.ready .ss-key {
  color: var(--skill-color);
}

.ss-icon {
  font-size: 20px;
  color: var(--skill-color);
  text-shadow: 0 0 8px var(--skill-color);
  line-height: 1;
}

.ss-name {
  font-size: 11px;
  color: var(--text);
  letter-spacing: 1px;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
}

.ss-mp {
  font-size: 9px;
  color: #8fc0ff;
  letter-spacing: 0.5px;
  font-family: 'Courier New', monospace;
}

.ss-cd {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.9);
  z-index: 3;
}

.ss-cd-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(2, 3, 10, 0.7);
  transition: height 0.1s linear;
  z-index: 2;
}

.ss-empty {
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 1px;
}

.hint-bar {
  display: flex;
  justify-content: center;
  gap: 24px;
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 1px;
  padding: 4px 0;
  flex-wrap: wrap;
}

/* ============ 结果 ============ */
.result-phase {
  position: relative;
  min-height: calc(100vh - var(--header-h));
  padding: 80px 0;
  overflow: hidden;
}

.result-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.result-inner {
  position: relative;
  z-index: 1;
  text-align: center;
}

.result-kicker {
  font-size: 12px;
  letter-spacing: 6px;
  color: var(--accent-hover);
  margin-bottom: 16px;
  font-weight: 600;
}

.result-title {
  font-size: clamp(40px, 6vw, 64px);
  font-weight: 800;
  letter-spacing: 12px;
  color: var(--accent-hover);
  margin-bottom: 40px;
  text-shadow: 0 0 30px var(--accent);
}

.result-title.fail {
  color: #ff7e8e;
  text-shadow: 0 0 30px #ff7e8e;
}

.result-grade {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 48px;
  border: 2px solid var(--accent);
  border-radius: var(--radius-lg);
  margin-bottom: 48px;
  background: rgba(110, 168, 255, 0.08);
  box-shadow: 0 0 40px rgba(110, 168, 255, 0.3);
}

.result-grade.grade-S {
  border-color: #ffd29e;
  background: rgba(255, 210, 158, 0.12);
  box-shadow: 0 0 50px rgba(255, 210, 158, 0.4);
}

.result-grade.grade-S .grade-letter {
  color: #ffd29e;
  text-shadow: 0 0 20px #ffd29e;
}

.result-grade.grade-A .grade-letter {
  color: #ff9ec8;
}

.result-grade.grade-B .grade-letter {
  color: #9cc4ff;
}

.result-grade.grade-C .grade-letter {
  color: var(--text-muted);
}

.grade-letter {
  font-size: 80px;
  font-weight: 800;
  line-height: 1;
  color: var(--accent-hover);
  font-family: 'Courier New', monospace;
}

.grade-label {
  font-size: 12px;
  letter-spacing: 4px;
  color: var(--text-muted);
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  max-width: 720px;
  margin: 0 auto 40px;
}

.rs-item {
  padding: 18px 14px;
  background: rgba(12, 18, 40, 0.6);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.rs-label {
  display: block;
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--text-dim);
  margin-bottom: 8px;
}

.rs-value {
  display: block;
  font-size: 22px;
  font-weight: 800;
  color: var(--accent-hover);
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
}

.result-drops {
  max-width: 720px;
  margin: 0 auto 40px;
}

.rd-title {
  font-size: 13px;
  letter-spacing: 4px;
  color: var(--accent-hover);
  margin-bottom: 16px;
  font-weight: 600;
}

.rd-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.rd-item {
  padding: 8px 18px;
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--text);
  background: rgba(110, 168, 255, 0.12);
  border: 1px solid var(--accent);
  border-radius: 999px;
}

.rd-empty {
  font-size: 13px;
  color: var(--text-dim);
  letter-spacing: 2px;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.result-actions .arrow {
  transition: transform 0.3s ease;
}

.result-actions .btn-primary:hover .arrow {
  transform: translateX(4px);
}

/* ============ 响应式 ============ */
@media (max-width: 1080px) {
  .prof-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .skill-preview {
    grid-template-columns: 1fr;
  }

  .battle-main {
    grid-template-columns: 1fr;
  }

  .player-panel {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
  }

  .player-head,
  .resource-bar,
  .combo-meter,
  .minimap {
    flex: 1;
    min-width: 200px;
  }

  .minimap {
    margin-top: 0;
  }

  .result-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .select-phase {
    padding: 60px 0 80px;
  }

  .prof-grid {
    grid-template-columns: 1fr;
  }

  .prof-detail {
    padding: 24px 18px;
  }

  .battle-phase {
    padding: 10px;
  }

  .player-panel {
    flex-direction: column;
  }

  .enemy-card {
    width: 130px;
  }

  .enemy-card.boss {
    width: 240px;
  }

  .enemy-portrait {
    height: 90px;
  }

  .enemy-card.boss .enemy-portrait {
    height: 160px;
  }

  .skill-bar {
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    padding: 8px;
  }

  .skill-slot {
    padding: 6px 2px;
  }

  .ss-name {
    font-size: 10px;
  }

  .ss-icon {
    font-size: 16px;
  }

  .hint-bar {
    gap: 12px;
    font-size: 10px;
  }

  .result-stats {
    grid-template-columns: 1fr;
  }

  .result-grade {
    padding: 18px 32px;
  }

  .grade-letter {
    font-size: 56px;
  }

  .result-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
