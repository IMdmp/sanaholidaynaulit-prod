(function () {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const pad2 = (n) => String(n).padStart(2, '0');
  const toManilaMidnightISO = (dateISO) => `${dateISO}T00:00:00+08:00`;
  const formatPHT = (iso) => new Date(iso).toLocaleString('en-PH', {
    timeZone: 'Asia/Manila', year: 'numeric', month: 'long', day: 'numeric'
  });
  const getWeekday = (iso) => new Date(iso).toLocaleString('en-US', {
    timeZone: 'Asia/Manila', weekday: 'short'
  });
  const isWeekend = (date) => { const d = date.getDay(); return d === 0 || d === 6; };

  const getCurrentYearPHT = () => {
    const nowPHT = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    return nowPHT.getFullYear();
  };

  const monthsInRange = (startDate, endDate) => {
    const results = [];
    let y = startDate.getFullYear();
    let m = startDate.getMonth();
    while (y < endDate.getFullYear() || (y === endDate.getFullYear() && m <= endDate.getMonth())) {
      results.push({ year: y, month: m });
      m++;
      if (m > 11) { m = 0; y++; }
    }
    return results;
  };

  const findLongWeekends = (holidays) => {
    const longWeekends = [];
    holidays.forEach((h) => {
      const holidayISO = toManilaMidnightISO(h.dateISO);
      const holidayDate = new Date(holidayISO);
      const weekday = getWeekday(holidayISO);

      if (weekday === 'Fri' || weekday === 'Mon') {
        // Natural 3-day weekend
        const range = (weekday === 'Fri')
          ? { startDate: holidayDate, endDate: new Date(holidayDate.getTime() + 2 * 86400000) }
          : { startDate: new Date(holidayDate.getTime() - 2 * 86400000), endDate: holidayDate };
        longWeekends.push({
          type: 'natural',
          title: h.name,
          startDate: range.startDate,
          endDate: range.endDate,
          holiday: { ...h, iso: holidayISO },
          duration: '3-day weekend'
        });
      } else if (weekday === 'Tue' || weekday === 'Thu') {
        // Suggested 4-day weekend
        const suggestedLeave = (weekday === 'Tue')
          ? new Date(holidayDate.getTime() - 86400000) // Monday
          : new Date(holidayDate.getTime() + 86400000); // Friday
        const startDate = (weekday === 'Tue')
          ? new Date(holidayDate.getTime() - 2 * 86400000)
          : holidayDate;
        const endDate = (weekday === 'Thu')
          ? new Date(holidayDate.getTime() + 2 * 86400000)
          : holidayDate;
        longWeekends.push({
          type: 'suggested',
          title: h.name,
          startDate,
          endDate,
          holiday: { ...h, iso: holidayISO },
          suggestedLeave,
          duration: '4-day weekend'
        });
      }
    });
    return longWeekends.sort((a, b) => a.startDate - b.startDate);
  };

  const generateCalendar = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendar = [];
    const current = new Date(startDate);
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        weekDays.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      calendar.push(weekDays);
    }
    return calendar;
  };

  const renderCalendar = (year, month, longWeekend) => {
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dayHeaders = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    const calendar = generateCalendar(year, month);

    let html = `
      <div class="mini-calendar">
        <div class="calendar-header">${monthNames[month]} ${year}</div>
        <div class="calendar-grid">
          ${dayHeaders.map(d => `<div class="calendar-day header">${d}</div>`).join('')}
    `;

    calendar.forEach(week => {
      week.forEach(date => {
        const isCurrentMonth = date.getMonth() === month;
        const isWeekendDay = isWeekend(date);
        const dateStr = date.toISOString().split('T')[0];
        const isHoliday = longWeekend.holiday && dateStr === new Date(longWeekend.holiday.iso).toISOString().split('T')[0];
        const isSuggestedLeave = longWeekend.suggestedLeave && dateStr === longWeekend.suggestedLeave.toISOString().split('T')[0];
        const isInRange = date >= longWeekend.startDate && date <= longWeekend.endDate;

        const classes = ['calendar-day'];
        if (!isCurrentMonth) classes.push('other-month');
        if (isWeekendDay) classes.push('weekend');
        if (isHoliday) classes.push('holiday');
        if (isSuggestedLeave) classes.push('suggested-leave');
        if (isInRange && (isWeekendDay || isHoliday || isSuggestedLeave)) classes.push('long-weekend-range');

        html += `<div class="${classes.join(' ')}">${date.getDate()}</div>`;
      });
    });

    html += '</div></div>';
    return html;
  };

  const renderLongWeekendCard = (longWeekend, index) => {
    const months = monthsInRange(longWeekend.startDate, longWeekend.endDate);
    const calendarsHtml = months.map(m => renderCalendar(m.year, m.month, longWeekend)).join('');
    const ctaMessage = longWeekend.type === 'suggested'
      ? `<div class="cta-message"><span class="cta-highlight">Take 1 day off</span> for a ${longWeekend.duration}!</div>`
      : '';
    const badge = longWeekend.type === 'suggested' ? '<span class="suggestion-badge">Suggested</span>' : '';

    return `
      <section class="holiday-card" id="card-${index}">
        <div class="holiday-header">
          <h2 class="holiday-title">${longWeekend.title}${badge}</h2>
          <p class="holiday-subtitle muted">${formatPHT(longWeekend.holiday.iso)} • ${longWeekend.duration}</p>
        </div>
        ${ctaMessage}
        <div class="calendar-container">${calendarsHtml}</div>
      </section>
    `;
  };

  const renderSidebar = (longWeekends) => {
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return longWeekends.map((lw, index) => {
      const month = monthNames[lw.startDate.getMonth()];
      const day = lw.startDate.getDate();
      return `<li><a href="#card-${index}" data-card="${index}">${month} ${day}</a></li>`;
    }).join('');
  };

  const initScrollSpy = () => {
    const cards = $$('.holiday-card');
    const navLinks = $$('.sidebar-nav a');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cardIndex = entry.target.id.split('-')[1];
          navLinks.forEach((link) => link.classList.remove('active'));
          const activeLink = document.querySelector(`.sidebar-nav a[data-card="${cardIndex}"]`);
          if (activeLink) activeLink.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -20% 0px', threshold: 0.5 });

    cards.forEach((card) => observer.observe(card));
  };

  const initSmoothScroll = () => {
    $$('.sidebar-nav a').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetEl = $(targetId);
        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  const boot = async () => {
    const app = $('#visualizerApp');
    const apiBase = app?.dataset?.apiBase;
    const currentYear = getCurrentYearPHT();

    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = String(currentYear);
    const pageYear = $('#pageYear');
    if (pageYear) pageYear.textContent = `(${currentYear})`;
    const sidebarTitle = $('#sidebarTitle');
    if (sidebarTitle) sidebarTitle.textContent = `${currentYear} Long Weekends`;

    let holidays = [];
    try {
      const res = await fetch(`${apiBase}/api/holidays?year=${currentYear}`);
      if (res.ok) {
        holidays = await res.json();
      }
    } catch (_) {
      holidays = [];
    }

    // Compute long weekends
    const longWeekends = findLongWeekends(holidays);

    // Render
    const cardsContainer = $('#holidayCards');
    const sidebarNav = $('#sidebarNav');
    if (cardsContainer) cardsContainer.innerHTML = longWeekends.map((lw, i) => renderLongWeekendCard(lw, i)).join('');
    if (sidebarNav) sidebarNav.innerHTML = renderSidebar(longWeekends);

    // Init interactions
    setTimeout(() => {
      initScrollSpy();
      initSmoothScroll();
    }, 100);
  };

  boot();
})();
