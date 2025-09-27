/*
  Minimal JS: PHT-aware countdown and simple upcoming list
  Black-and-white only; no external deps.
*/

(function () {
  const $ = (sel) => document.querySelector(sel);
  const pad2 = (n) => String(n).padStart(2, '0');
  const toISOManila = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}T00:00:00+08:00`;
  const formatPHT = (iso) => new Date(iso).toLocaleString('en-PH', {
    timeZone: 'Asia/Manila', year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
  });
  const approxLongWeekend = (iso) => {
    const wd = new Date(iso).toLocaleString('en-US', { timeZone: 'Asia/Manila', weekday: 'short' });
    return wd === 'Fri' || wd === 'Mon';
  };

  const now = new Date();
  const y = now.getFullYear();

  const data = [
    { name: 'Bonifacio Day', iso: toISOManila(y, 11, 30) },
    { name: 'Christmas Day', iso: toISOManila(y, 12, 25) },
    { name: 'Rizal Day', iso: toISOManila(y, 12, 30) },
    { name: "New Year's Day", iso: toISOManila(y + 1, 1, 1) },
  ].map(h => ({ ...h, longWeekend: approxLongWeekend(h.iso) }));

  const nextIdx = data.findIndex(h => new Date(h.iso).getTime() > now.getTime());
  const idx = nextIdx === -1 ? data.length - 1 : nextIdx;
  const nextHoliday = data[idx];

  const d = $('#d'), h = $('#h'), m = $('#m'), s = $('#s');
  const holidayName = $('#holidayName');
  const holidayDate = $('#holidayDate');
  const todayBanner = $('#todayBanner');
  const todayName = $('#todayName');
  const upcomingList = $('#upcomingList');
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(y);

  const renderUpcoming = () => {
    const items = data.slice(idx, idx + 3);
    upcomingList.innerHTML = items.map(it => {
      const txt = it.longWeekend ? ' — long weekend' : '';
      return `<li><span class="name">${it.name}${txt}</span><span class="date">${formatPHT(it.iso)}</span></li>`;
    }).join('');
  };

  const target = new Date(nextHoliday.iso);
  holidayName.textContent = nextHoliday.name;
  holidayDate.textContent = formatPHT(nextHoliday.iso);

  let timerId;
  const tick = () => {
    const now = new Date();
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      d.textContent = h.textContent = m.textContent = s.textContent = '00';
      todayBanner.hidden = false;
      todayName.textContent = nextHoliday.name;
      clearInterval(timerId);
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    d.textContent = pad2(days);
    h.textContent = pad2(hours);
    m.textContent = pad2(mins);
    s.textContent = pad2(secs);
  };

  tick();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  timerId = setInterval(tick, reduce ? 10000 : 1000);

  renderUpcoming();
})();
