import {
  computeLongWeekendsPHT,
  toPHTMidnightISO,
  toYMD,
} from "../lib/longweekend";
import type { Holiday, LongWeekend } from "../lib/types";

const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null;
const $$ = (sel: string) =>
  Array.from(document.querySelectorAll(sel)) as HTMLElement[];

const pad2 = (n: number) => String(n).padStart(2, "0");
const MONTH_NAMES_FULL = [
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
];
const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type CalendarModifiers = {
  holiday: Set<string>;
  suggested: Set<string>;
  range: Set<string>;
};

type GroupedWeekend = {
  lw: LongWeekend;
  index: number;
  groupKey: string;
};

interface MonthGroup {
  key: string;
  year: number;
  month: number;
  label: string;
  longWeekends: GroupedWeekend[];
  modifiers: CalendarModifiers;
}
const formatPHT = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const isWeekend = (date: Date) => {
  const d = date.getDay();
  return d === 0 || d === 6;
};

const getCurrentYearPHT = () => {
  const nowPHT = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
  );
  return nowPHT.getFullYear();
};

const generateCalendar = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const calendar: Date[][] = [];
  const current = new Date(startDate);
  for (let week = 0; week < 6; week++) {
    const weekDays: Date[] = [];
    for (let day = 0; day < 7; day++) {
      weekDays.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    calendar.push(weekDays);
  }
  return calendar;
};

const renderCalendar = (
  year: number,
  month: number,
  modifiers: CalendarModifiers
) => {
  const dayHeaders = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const calendar = generateCalendar(year, month);

  let html = `
    <div class="mini-calendar">
      <div class="calendar-grid">
        ${dayHeaders
          .map((d) => `<div class="calendar-day header">${d}</div>`)
          .join("")}
  `;

  calendar.forEach((week) => {
    week.forEach((date) => {
      const isCurrentMonth = date.getMonth() === month;
      const isWeekendDay = isWeekend(date);
      const dateYMD = `${date.getFullYear()}-${pad2(
        date.getMonth() + 1
      )}-${pad2(date.getDate())}`;
      const dateISO = toPHTMidnightISO(dateYMD);

      const isHoliday = modifiers.holiday.has(dateISO);
      const isSuggestedLeave = modifiers.suggested.has(dateISO);
      const inRange = modifiers.range.has(dateISO);

      const classes = ["calendar-day"];
      if (!isCurrentMonth) classes.push("other-month");
      if (isWeekendDay) classes.push("weekend");
      if (isHoliday) classes.push("holiday");
      if (isSuggestedLeave) classes.push("suggested-leave");
      if (inRange && (isWeekendDay || isHoliday || isSuggestedLeave))
        classes.push("long-weekend-range");

      html += `<div class="${classes.join(" ")}">${date.getDate()}</div>`;
    });
  });

  html += "</div></div>";
  return html;
};

const renderLongWeekendCard = (lw: LongWeekend, index: number) => {
  const leaveVerb =
    lw.durationLabel === "very long weekend"
      ? "Take 1 day off"
      : "Take 1 day off";
  const leaveTail =
    lw.durationLabel === "very long weekend"
      ? "for a very long weekend!"
      : `for a ${lw.durationLabel}!`;
  const ctaMessage =
    lw.type === "suggested"
      ? `<div class="cta-message"><span class="cta-highlight">${leaveVerb}</span> ${leaveTail}</div>`
      : "";
  const badge =
    lw.type === "suggested"
      ? '<span class="suggestion-badge">Suggested</span>'
      : "";

  const titleHtml = `${lw.title}${badge ? " " + badge : ""}`;

  return `
    <article class="holiday-card" id="card-${index}">
      <div class="holiday-header">
        <h3 class="holiday-title">${titleHtml}</h3>
        <p class="holiday-subtitle muted">${formatPHT(
          toPHTMidnightISO(lw.holiday.dateISO)
        )} • ${lw.durationLabel}</p>
      </div>
      ${ctaMessage}
    </article>
  `;
};

const makeMonthKey = (year: number, month: number) =>
  `${year}-${pad2(month + 1)}`;

const groupWeekendsByMonth = (longWeekends: LongWeekend[]): MonthGroup[] => {
  const map = new Map<string, MonthGroup>();

  longWeekends.forEach((lw, index) => {
    const holidayDate = new Date(toPHTMidnightISO(lw.holiday.dateISO));
    const year = holidayDate.getFullYear();
    const month = holidayDate.getMonth();
    const key = makeMonthKey(year, month);

    if (!map.has(key)) {
      map.set(key, {
        key,
        year,
        month,
        label: `${MONTH_NAMES_FULL[month]} ${year}`,
        longWeekends: [],
        modifiers: {
          holiday: new Set<string>(),
          suggested: new Set<string>(),
          range: new Set<string>(),
        },
      });
    }

    const group = map.get(key)!;
    group.longWeekends.push({ lw, index, groupKey: key });

    const holidayISO = toPHTMidnightISO(lw.holiday.dateISO);
    group.modifiers.holiday.add(holidayISO);
    if (lw.extraHolidayISOs) {
      lw.extraHolidayISOs.forEach((iso) => group.modifiers.holiday.add(iso));
    }
    if (lw.suggestedLeaveISO) {
      group.modifiers.suggested.add(lw.suggestedLeaveISO);
    }

    const start = new Date(lw.startISO);
    const end = new Date(lw.endISO);

    const cursor = new Date(start);
    while (cursor <= end) {
      group.modifiers.range.add(toPHTMidnightISO(toYMD(cursor)));
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
};

const filterUpcomingGroups = (groups: MonthGroup[]) => {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();

  return groups.filter((group) => {
    if (group.year > todayYear) return true;
    if (group.year < todayYear) return false;
    return group.month >= todayMonth;
  });
};

const renderMonthSections = (groups: MonthGroup[]) => {
  return groups
    .map((group) => {
      const calendarHtml = renderCalendar(
        group.year,
        group.month,
        group.modifiers
      );
      const cardsHtml = group.longWeekends
        .map(({ lw, index }) => renderLongWeekendCard(lw, index))
        .join("");

      return `
        <section class="month-block" id="month-${group.key}">
          <header class="month-header">
            <h2 class="month-title">${group.label}</h2>
          </header>
          <div class="month-details">${cardsHtml}</div>
          <div class="month-calendar">${calendarHtml}</div>
        </section>
      `;
    })
    .join("");
};

const renderSidebar = (flat: GroupedWeekend[]) => {
  let currentYear: number | null = null;
  const parts: string[] = [];

  flat.forEach(({ lw, index, groupKey }) => {
    const start = new Date(lw.startISO);
    const month = MONTH_NAMES_SHORT[start.getMonth()];
    const day = start.getDate();
    const year = start.getFullYear();

    if (currentYear !== year) {
      if (currentYear !== null) {
        parts.push("</ul></li>");
      }
      parts.push(
        `<li class="sidebar-year"><span class="sidebar-year-label">${year} Long Weekends</span><ul class="sidebar-year-list">`
      );
      currentYear = year;
    }

    parts.push(
      `<li><a href="#month-${groupKey}" data-card="${index}">${month} ${day}</a></li>`
    );
  });

  if (currentYear !== null) {
    parts.push("</ul></li>");
  }

  return parts.join("");
};

const initScrollSpy = () => {
  const cards = $$(".holiday-card");
  const navLinks = $$(".sidebar-nav a");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cardIndex = (entry.target as HTMLElement).id.split("-")[1];
          navLinks.forEach((l) => l.classList.remove("active"));
          const active = document.querySelector(
            `.sidebar-nav a[data-card="${cardIndex}"]`
          ) as HTMLElement | null;
          if (active) active.classList.add("active");
        }
      });
    },
    { rootMargin: "-20% 0px -20% 0px", threshold: 0.5 }
  );
  cards.forEach((c) => observer.observe(c));
};

const initSmoothScroll = () => {
  $$(".sidebar-nav a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = (link as HTMLAnchorElement).getAttribute("href")!;
      const targetEl = document.querySelector(targetId);
      if (targetEl)
        (targetEl as HTMLElement).scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  });
};

const initScrollTop = () => {
  const button = document.getElementById("scrollTop");
  if (!button) return;

  const toggleVisibility = () => {
    if (window.scrollY > 320) {
      button.classList.add("visible");
    } else {
      button.classList.remove("visible");
    }
  };

  toggleVisibility();
  document.addEventListener("scroll", toggleVisibility, { passive: true });

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

// Get today's PHT midnight ISO (YYYY-MM-DDT00:00:00+08:00)
const getTodayPHTISO = () => {
  const nowPHT = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
  );
  const y = nowPHT.getFullYear();
  const m = pad2(nowPHT.getMonth() + 1);
  const d = pad2(nowPHT.getDate());
  return `${y}-${m}-${d}T00:00:00+08:00`;
};

async function boot() {
  const app = $("#visualizerApp");
  const currentYear = getCurrentYearPHT();

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(currentYear);
  const pageYear = $("#pageYear");
  if (pageYear) pageYear.textContent = `(${currentYear})`;
  const sidebarTitle = $("#sidebarTitle");

  // Read holidays from build-time embedded data on window
  let holidays: Holiday[] = [];
  const anyWin = window as any;
  if (anyWin.__SITE_DATA__ && Array.isArray(anyWin.__SITE_DATA__.holidays)) {
    holidays = anyWin.__SITE_DATA__.holidays as Holiday[];
  } else {
    console.error("[visualizer] Missing __SITE_DATA__ or holidays array");
    // Show error message to user if no data is available
    const cardsContainer = $("#holidayCards");
    if (cardsContainer) {
      cardsContainer.innerHTML = `
        <div style="text-align: center; padding: 48px 24px; color: var(--ink-2);">
          <h3 style="margin-bottom: 16px; color: var(--ink);">Holiday Data Unavailable</h3>
          <p>Unable to load holiday information at the moment.<br>Please try again later or check your internet connection.</p>
        </div>
      `;
    }
    return; // Exit early if no data
  }

  // Handle case where holidays array is empty
  if (holidays.length === 0) {
    const cardsContainer = $("#holidayCards");
    if (cardsContainer) {
      cardsContainer.innerHTML = `
        <div style="text-align: center; padding: 48px 24px; color: var(--ink-2);">
          <h3 style="margin-bottom: 16px; color: var(--ink);">No Holiday Data</h3>
          <p>No Philippine national holidays found for ${currentYear}.<br>This could be due to a temporary data issue.</p>
        </div>
      `;
    }
    return;
  }

  const longWeekends = computeLongWeekendsPHT(holidays);

  const cardsContainer = $("#holidayCards");
  const sidebarNav = $("#sidebarNav");

  if (longWeekends.length === 0) {
    if (cardsContainer) {
      cardsContainer.innerHTML = `
        <div style="text-align: center; padding: 48px 24px; color: var(--ink-2);">
          <h3 style="margin-bottom: 16px; color: var(--ink);">No Long Weekends Found</h3>
          <p>We couldn't compute any long weekends from the available holiday data. Check back once more holidays are announced.</p>
        </div>
      `;
    }
    if (sidebarNav) sidebarNav.innerHTML = "";
    return;
  }

  const allGroups = groupWeekendsByMonth(longWeekends);
  const upcomingGroups = filterUpcomingGroups(allGroups);
  const flat = upcomingGroups.flatMap((group) => group.longWeekends);

  if (cardsContainer)
    cardsContainer.innerHTML = renderMonthSections(upcomingGroups);
  if (sidebarNav) sidebarNav.innerHTML = renderSidebar(flat);

  // Jump to the nearest upcoming long weekend (or the current one if today is within a range)
  const todayISO = getTodayPHTISO();
  let jumpIndex = flat.findIndex(
    ({ lw }) => lw.startISO <= todayISO && lw.endISO >= todayISO
  );
  if (jumpIndex === -1) {
    jumpIndex = flat.findIndex(({ lw }) => lw.startISO >= todayISO);
  }
  if (jumpIndex === -1) jumpIndex = 0; // fallback to first

  const targetCardIndex = flat[jumpIndex]?.index ?? 0;
  const targetGroupKey = flat[jumpIndex]?.groupKey;

  // Scroll to the target card and mark sidebar as active
  const target =
    document.getElementById(`month-${targetGroupKey}`) ??
    document.getElementById(`card-${targetCardIndex}`);
  if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
  const navLinks = document.querySelectorAll(
    ".sidebar-nav a"
  ) as NodeListOf<HTMLAnchorElement>;
  navLinks.forEach((l) => l.classList.remove("active"));
  const active = document.querySelector(
    `.sidebar-nav a[data-card="${targetCardIndex}"]`
  ) as HTMLElement | null;
  if (active) active.classList.add("active");

  setTimeout(() => {
    initScrollSpy();
    initSmoothScroll();
    initScrollTop();
  }, 100);
}

boot();
