// 封面渐变：cover 已是 CSS gradient 字符串则直接返回，否则包成深空 linear-gradient
export function coverGradient(cover: string): string {
  if (!cover) return 'linear-gradient(135deg,#0A0F24 0%,#1A2450 50%,#608CFF 100%)'
  if (/gradient/i.test(cover)) return cover
  return `linear-gradient(135deg,#0A0F24,${cover})`
}

// 角色定位 -> 深空星际主色
export function roleColor(role?: string): string {
  const map: Record<string, string> = {
    法师: '#B46CFF',
    战士: '#FF7A9C',
    辅助: '#7DA0D8',
    坦克: '#F2C26B',
    射手: '#6EE8C8'
  }
  return map[role || ''] || '#608CFF'
}

// 难度 -> 深空文案颜色
export function difficultyColor(difficulty?: string): string {
  const map: Record<string, string> = {
    低: '#6EE8C8',
    中: '#608CFF',
    高: '#FF7A9C'
  }
  return map[difficulty || ''] || '#7DA0D8'
}

// 资讯分类标签文案
export function newsCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    activity: '活动',
    notice: '公告',
    news: '资讯'
  }
  return map[category] || '资讯'
}

// 资讯分类 -> 深空星际色
export function newsCategoryColor(category: string): string {
  const map: Record<string, string> = {
    activity: '#B46CFF',
    notice: '#F2C26B',
    news: '#608CFF'
  }
  return map[category] || '#7DA0D8'
}

// 时间格式化：'2026-08-05' 或 '2026年08月05日'
export function formatDate(input?: string, style: 'cn' | 'iso' = 'cn'): string {
  if (!input) return ''
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return style === 'cn' ? `${yyyy}年${mm}月${dd}日` : `${yyyy}-${mm}-${dd}`
}

// 时间格式化（带月日）
export function formatMonthDay(input?: string): { month: string; day: string; year: string } {
  if (!input) return { month: '--', day: '--', year: '----' }
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return { month: '--', day: '--', year: '----' }
  return {
    year: String(d.getFullYear()),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    day: String(d.getDate()).padStart(2, '0')
  }
}
