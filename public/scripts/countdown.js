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

  const timerEl = document.getElementById('countdown-timer');
  const targetIsoFromServer = timerEl?.dataset?.targetIso;
  const nameFromServer = timerEl?.dataset?.holidayName;
  const apiBase = timerEl?.dataset?.apiBase;

  const d = $('#d'), h = $('#h'), m = $('#m'), s = $('#s');
  const holidayName = $('#holidayName');
  const holidayDate = $('#holidayDate');
  const todayBanner = $('#todayBanner');
  const todayName = $('#todayName');
  const upcomingList = $('#upcomingList');
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(y);

  const setTodayMode = (name) => {
    const dEl = $('#d'), hEl = $('#h'), mEl = $('#m'), sEl = $('#s');
    if (dEl && hEl && mEl && sEl) {
      dEl.textContent = hEl.textContent = mEl.textContent = sEl.textContent = '00';
    }
    if (todayBanner) todayBanner.hidden = false;
    if (todayName) todayName.textContent = name;
  };

  const renderUpcoming = (items) => {
    if (!upcomingList) return;
    upcomingList.innerHTML = items.map(it => {
      const txt = it.longWeekend ? ' — long weekend' : '';
      return `<li><span class="name">${it.name}${txt}</span><span class="date">${formatPHT(it.iso)}</span></li>`;
    }).join('');
  };

  const startTimer = (targetIso, displayName) => {
    const target = new Date(targetIso);
    if (holidayName && displayName) holidayName.textContent = displayName;
    if (holidayDate && targetIso) holidayDate.textContent = formatPHT(targetIso);

    let timerId;
    const tick = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTodayMode(displayName);
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
  };

  const toManilaMidnight = (dateISO) => `${dateISO}T00:00:00+08:00`;
  const getTodayISOInPHT = () => {
    const nowPHT = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const yy = nowPHT.getFullYear();
    const mm = pad2(nowPHT.getMonth() + 1);
    const dd = pad2(nowPHT.getDate());
    return `${yy}-${mm}-${dd}`;
  };

  const boot = async () => {
    // Prefer runtime API data if available
    if (apiBase) {
      try {
        const res = await fetch(`${apiBase}/api/next`);
        if (res.ok) {
          const json = await res.json();
          const next = json?.next;
          const nextTwo = Array.isArray(json?.nextTwo) ? json.nextTwo : [];
          if (next && next.dateISO) {
            const items = [next, ...nextTwo].map(it => ({ name: it.name, iso: toManilaMidnight(it.dateISO), longWeekend: !!it.longWeekend }));
            renderUpcoming(items);

            const todayISO = getTodayISOInPHT();
            if (todayISO === next.dateISO) {
              setTodayMode(next.name);
              return;
            }
            startTimer(toManilaMidnight(next.dateISO), next.name);
            return;
          }
        }
      } catch (_) {
        // Ignore and fall back to SSR/static
      }
    }

    // Fallback to server-provided dataset or static
    if (targetIsoFromServer && nameFromServer) {
      startTimer(targetIsoFromServer, nameFromServer);
      if (upcomingList && upcomingList.children.length === 0 && targetIsoFromServer) {
        renderUpcoming([{ name: nameFromServer, iso: targetIsoFromServer, longWeekend: false }]);
      }
      return;
    }

    // Static fallback
    let data = [
      { name: 'Bonifacio Day', iso: toISOManila(y, 11, 30) },
      { name: 'Christmas Day', iso: toISOManila(y, 12, 25) },
      { name: 'Rizal Day', iso: toISOManila(y, 12, 30) },
      { name: "New Year's Day", iso: toISOManila(y + 1, 1, 1) },
    ].map(h => ({ ...h, longWeekend: approxLongWeekend(h.iso) }));

    const nextIdx = data.findIndex(h => new Date(h.iso).getTime() > now.getTime());
    const idx = nextIdx === -1 ? data.length - 1 : nextIdx;
    const nextHoliday = data[idx];
    renderUpcoming(data.slice(idx, idx + 3));
    startTimer(nextHoliday.iso, nextHoliday.name);
  };

  boot();
})();
