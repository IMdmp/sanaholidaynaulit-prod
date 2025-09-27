import { computeLongWeekendsPHT, monthsInRange, toPHTMidnightISO } from "../lib/longweekend"
import type { Holiday, LongWeekend } from "../lib/types"

const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => Array.from(document.querySelectorAll(sel)) as HTMLElement[]

const pad2 = (n: number) => String(n).padStart(2, "0")
const formatPHT = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

const isWeekend = (date: Date) => {
  const d = date.getDay()
  return d === 0 || d === 6
}

const getCurrentYearPHT = () => {
  const nowPHT = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
  )
  return nowPHT.getFullYear()
}

const generateCalendar = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const calendar: Date[][] = []
  const current = new Date(startDate)
  for (let week = 0; week < 6; week++) {
    const weekDays: Date[] = []
    for (let day = 0; day < 7; day++) {
      weekDays.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    calendar.push(weekDays)
  }
  return calendar
}

const renderCalendar = (year: number, month: number, lw: LongWeekend) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const dayHeaders = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
  const calendar = generateCalendar(year, month)

  const holidayIso = toPHTMidnightISO(lw.holiday.dateISO)
  const startISO = lw.startISO
  const endISO = lw.endISO
  const suggestedLeaveISO = lw.suggestedLeaveISO

  let html = `
    <div class="mini-calendar">
      <div class="calendar-header">${monthNames[month]} ${year}</div>
      <div class="calendar-grid">
        ${dayHeaders
          .map((d) => `<div class="calendar-day header">${d}</div>`) 
          .join("")}
  `

  calendar.forEach((week) => {
    week.forEach((date) => {
      const isCurrentMonth = date.getMonth() === month
      const isWeekendDay = isWeekend(date)
      const dateYMD = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
        date.getDate()
      )}`
      const dateISO = toPHTMidnightISO(dateYMD)

      const isHoliday = dateISO === holidayIso
      const isSuggestedLeave = !!suggestedLeaveISO && dateISO === suggestedLeaveISO
      const inRange = dateISO >= startISO && dateISO <= endISO

      const classes = ["calendar-day"]
      if (!isCurrentMonth) classes.push("other-month")
      if (isWeekendDay) classes.push("weekend")
      if (isHoliday) classes.push("holiday")
      if (isSuggestedLeave) classes.push("suggested-leave")
      if (inRange && (isWeekendDay || isHoliday || isSuggestedLeave))
        classes.push("long-weekend-range")

      html += `<div class="${classes.join(" ")}">${date.getDate()}</div>`
    })
  })

  html += "</div></div>"
  return html
}

const renderLongWeekendCard = (lw: LongWeekend, index: number) => {
  const months = monthsInRange(lw.startISO, lw.endISO)
  const calendarsHtml = months.map((m) => renderCalendar(m.year, m.month, lw)).join("")

  const ctaMessage = lw.type === "suggested"
    ? `<div class="cta-message"><span class="cta-highlight">Take 1 day off</span> for a ${lw.durationLabel}!</div>`
    : ""
  const badge = lw.type === "suggested" ? '<span class="suggestion-badge">Suggested</span>' : ""

  const titleHtml = `${lw.title}${badge ? ' ' + badge : ''}`

  return `
    <section class="holiday-card" id="card-${index}">
      <div class="holiday-header">
        <h2 class="holiday-title">${titleHtml}</h2>
        <p class="holiday-subtitle muted">${formatPHT(toPHTMidnightISO(lw.holiday.dateISO))} • ${lw.durationLabel}</p>
      </div>
      ${ctaMessage}
      <div class="calendar-container">${calendarsHtml}</div>
    </section>
  `
}

const renderSidebar = (longWeekends: LongWeekend[]) => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return longWeekends
    .map((lw, i) => {
      const start = new Date(lw.startISO)
      const month = monthNames[start.getMonth()]
      const day = start.getDate()
      return `<li><a href="#card-${i}" data-card="${i}">${month} ${day}</a></li>`
    })
    .join("")
}

const initScrollSpy = () => {
  const cards = $$(".holiday-card")
  const navLinks = $$(".sidebar-nav a")
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cardIndex = (entry.target as HTMLElement).id.split("-")[1]
          navLinks.forEach((l) => l.classList.remove("active"))
          const active = document.querySelector(
            `.sidebar-nav a[data-card="${cardIndex}"]`
          ) as HTMLElement | null
          if (active) active.classList.add("active")
        }
      })
    },
    { rootMargin: "-20% 0px -20% 0px", threshold: 0.5 }
  )
  cards.forEach((c) => observer.observe(c))
}

const initSmoothScroll = () => {
  $$(".sidebar-nav a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const targetId = (link as HTMLAnchorElement).getAttribute("href")!
      const targetEl = document.querySelector(targetId)
      if (targetEl) (targetEl as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" })
    })
  })
}

// Get today's PHT midnight ISO (YYYY-MM-DDT00:00:00+08:00)
const getTodayPHTISO = () => {
  const nowPHT = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }))
  const y = nowPHT.getFullYear()
  const m = pad2(nowPHT.getMonth() + 1)
  const d = pad2(nowPHT.getDate())
  return `${y}-${m}-${d}T00:00:00+08:00`
}

async function boot() {
  const app = $("#visualizerApp")
  const currentYear = getCurrentYearPHT()

  const yearEl = $("#year")
  if (yearEl) yearEl.textContent = String(currentYear)
  const pageYear = $("#pageYear")
  if (pageYear) pageYear.textContent = `(${currentYear})`
  const sidebarTitle = $("#sidebarTitle")
  if (sidebarTitle) sidebarTitle.textContent = `${currentYear} Long Weekends`

  // Read holidays from build-time embedded data on window
  let holidays: Holiday[] = []
  const anyWin = window as any
  if (anyWin.__SITE_DATA__ && Array.isArray(anyWin.__SITE_DATA__.holidays)) {
    holidays = anyWin.__SITE_DATA__.holidays as Holiday[]
  } else {
    console.error('[visualizer] Missing __SITE_DATA__ or holidays array')
    // Show error message to user if no data is available
    const cardsContainer = $("#holidayCards")
    if (cardsContainer) {
      cardsContainer.innerHTML = `
        <div style="text-align: center; padding: 48px 24px; color: var(--ink-2);">
          <h3 style="margin-bottom: 16px; color: var(--ink);">Holiday Data Unavailable</h3>
          <p>Unable to load holiday information at the moment.<br>Please try again later or check your internet connection.</p>
        </div>
      `
    }
    return // Exit early if no data
  }

  // Handle case where holidays array is empty
  if (holidays.length === 0) {
    const cardsContainer = $("#holidayCards")
    if (cardsContainer) {
      cardsContainer.innerHTML = `
        <div style="text-align: center; padding: 48px 24px; color: var(--ink-2);">
          <h3 style="margin-bottom: 16px; color: var(--ink);">No Holiday Data</h3>
          <p>No Philippine national holidays found for ${currentYear}.<br>This could be due to a temporary data issue.</p>
        </div>
      `
    }
    return
  }

  const longWeekends = computeLongWeekendsPHT(holidays)

  const cardsContainer = $("#holidayCards")
  const sidebarNav = $("#sidebarNav")
  if (cardsContainer)
    cardsContainer.innerHTML = longWeekends
      .map((lw, i) => renderLongWeekendCard(lw, i))
      .join("")
  if (sidebarNav) sidebarNav.innerHTML = renderSidebar(longWeekends)

  // Jump to the nearest upcoming long weekend (or the current one if today is within a range)
  const todayISO = getTodayPHTISO()
  let jumpIndex = longWeekends.findIndex(lw => lw.startISO <= todayISO && lw.endISO >= todayISO)
  if (jumpIndex === -1) {
    jumpIndex = longWeekends.findIndex(lw => lw.startISO >= todayISO)
  }
  if (jumpIndex === -1) jumpIndex = 0 // fallback to first

  // Scroll to the target card and mark sidebar as active
  const target = document.getElementById(`card-${jumpIndex}`)
  if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' })
  const navLinks = document.querySelectorAll('.sidebar-nav a') as NodeListOf<HTMLAnchorElement>
  navLinks.forEach(l => l.classList.remove('active'))
  const active = document.querySelector(`.sidebar-nav a[data-card="${jumpIndex}"]`) as HTMLElement | null
  if (active) active.classList.add('active')

  setTimeout(() => {
    initScrollSpy()
    initSmoothScroll()
  }, 100)
}

boot()
