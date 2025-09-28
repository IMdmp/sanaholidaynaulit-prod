/*
  Minimal JS: PHT-aware countdown and simple upcoming list
  Black-and-white only; no external deps.
*/

(function () {
  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------
  const TIME_ZONE = "Asia/Manila";
  const MATCH_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";
  const FAST_INTERVAL_MS = 1000;
  const SLOW_INTERVAL_MS = 10000;
  const ZERO_DIGIT = "00";
  const NO_DATA_DIGIT = "--";

  // ---------------------------------------------------------------------------
  // Date helpers
  // ---------------------------------------------------------------------------
  const pad2 = (value) => String(value).padStart(2, "0");
  const toManilaMidnight = (dateISO) => `${dateISO}T00:00:00+08:00`;
  const formatPHT = (iso) =>
    new Date(iso).toLocaleString("en-PH", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  const getTodayISOInPHT = () => {
    const nowPHT = new Date(
      new Date().toLocaleString("en-US", { timeZone: TIME_ZONE })
    );
    const yy = nowPHT.getFullYear();
    const mm = pad2(nowPHT.getMonth() + 1);
    const dd = pad2(nowPHT.getDate());
    return `${yy}-${mm}-${dd}`;
  };

  // ---------------------------------------------------------------------------
  // DOM references and data attributes
  // ---------------------------------------------------------------------------
  const timerEl = document.getElementById("countdown-timer");
  if (!timerEl) {
    console.warn(
      "Countdown: skipping bootstrap because #countdown-timer is missing."
    );
    return;
  }

  const elements = {
    digits: {
      days: document.getElementById("d"),
      hours: document.getElementById("h"),
      minutes: document.getElementById("m"),
      seconds: document.getElementById("s"),
    },
    holidayName: document.getElementById("holidayName"),
    holidayDate: document.getElementById("holidayDate"),
    todayBanner: document.getElementById("todayBanner"),
    todayName: document.getElementById("todayName"),
    upcomingList: document.getElementById("upcomingList"),
    year: document.getElementById("year"),
  };

  if (elements.year) {
    elements.year.textContent = String(new Date().getFullYear());
  }

  const {
    targetIso: targetIsoFromServer,
    holidayName: nameFromServer,
    apiBase,
  } = timerEl.dataset ?? {};

  // ---------------------------------------------------------------------------
  // Rendering helpers
  // ---------------------------------------------------------------------------
  const setDigits = (days, hours, minutes, seconds) => {
    const { days: d, hours: h, minutes: m, seconds: s } = elements.digits;
    if (d) d.textContent = days;
    if (h) h.textContent = hours;
    if (m) m.textContent = minutes;
    if (s) s.textContent = seconds;
  };

  const setDigitsFromNumbers = ({ days, hours, minutes, seconds }) => {
    setDigits(pad2(days), pad2(hours), pad2(minutes), pad2(seconds));
  };

  const setHolidayMeta = (name, iso) => {
    if (elements.holidayName && name) {
      elements.holidayName.textContent = name;
    }
    if (elements.holidayDate && iso) {
      elements.holidayDate.textContent = formatPHT(iso);
    }
  };

  const resetHolidayMeta = () => {
    if (elements.holidayName) elements.holidayName.textContent = "";
    if (elements.holidayDate) elements.holidayDate.textContent = "";
  };

  const setTodayMode = (name) => {
    setDigits(ZERO_DIGIT, ZERO_DIGIT, ZERO_DIGIT, ZERO_DIGIT);
    if (elements.todayBanner) elements.todayBanner.hidden = false;
    if (elements.todayName && name) elements.todayName.textContent = name;
  };

  const hideTodayMode = () => {
    if (elements.todayBanner) elements.todayBanner.hidden = true;
    if (elements.todayName) elements.todayName.textContent = "";
  };

  const renderUpcoming = (items = []) => {
    if (!elements.upcomingList || !Array.isArray(items)) return;
    elements.upcomingList.innerHTML = items
      .map((item) => {
        const note = item.longWeekend ? " — long weekend" : "";
        return `<li><span class="name">${
          item.name
        }${note}</span><span class="date">${formatPHT(item.iso)}</span></li>`;
      })
      .join("");
  };

  const showNoDataState = () => {
    setDigits(NO_DATA_DIGIT, NO_DATA_DIGIT, NO_DATA_DIGIT, NO_DATA_DIGIT);
    hideTodayMode();
    resetHolidayMeta();
  };

  // ---------------------------------------------------------------------------
  // Countdown engine
  // ---------------------------------------------------------------------------
  const startTimer = (targetIso, displayName) => {
    if (!targetIso) {
      console.warn("Countdown: missing target ISO date for timer.");
      showNoDataState();
      return false;
    }

    const target = new Date(targetIso);
    if (Number.isNaN(target.getTime())) {
      console.warn("Countdown: invalid target ISO date", targetIso);
      showNoDataState();
      return false;
    }

    setHolidayMeta(displayName, targetIso);

    let timerId;
    const tick = () => {
      const diff = target.getTime() - Date.now();

      if (diff <= 0) {
        setTodayMode(displayName);
        if (timerId) clearInterval(timerId);
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setDigitsFromNumbers({ days, hours, minutes, seconds });
    };

    tick();

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia(MATCH_MEDIA_QUERY).matches;

    const interval = prefersReducedMotion ? SLOW_INTERVAL_MS : FAST_INTERVAL_MS;
    timerId = setInterval(tick, interval);
    return true;
  };

  // ---------------------------------------------------------------------------
  // Data hydration
  // ---------------------------------------------------------------------------
  const hydrateFromApi = async () => {
    if (!apiBase) return false;

    try {
      const res = await fetch(`${apiBase}/api/next`);
      if (!res.ok) return false;

      const json = await res.json();
      const next = json?.next;
      if (!next?.dateISO) return false;

      const nextTwo = Array.isArray(json?.nextTwo) ? json.nextTwo : [];
      const items = [next, ...nextTwo].map((item) => ({
        name: item.name,
        iso: toManilaMidnight(item.dateISO),
        longWeekend: Boolean(item.longWeekend),
      }));

      renderUpcoming(items);

      const todayISO = getTodayISOInPHT();
      if (todayISO === next.dateISO) {
        const midnightIso = toManilaMidnight(next.dateISO);
        setHolidayMeta(next.name, midnightIso);
        setTodayMode(next.name);
        return true;
      }

      return startTimer(toManilaMidnight(next.dateISO), next.name);
    } catch (error) {
      console.warn("Countdown: runtime API fetch failed", error);
      return false;
    }
  };

  const hydrateFromServer = () => {
    if (!targetIsoFromServer || !nameFromServer) return false;

    const started = startTimer(targetIsoFromServer, nameFromServer);
    if (!started) return false;

    if (
      elements.upcomingList &&
      elements.upcomingList.children.length === 0 &&
      targetIsoFromServer
    ) {
      renderUpcoming([
        {
          name: nameFromServer,
          iso: targetIsoFromServer,
          longWeekend: false,
        },
      ]);
    }

    return true;
  };

  // ---------------------------------------------------------------------------
  // Bootstrap
  // ---------------------------------------------------------------------------
  const boot = async () => {
    const hydrated = (await hydrateFromApi()) || hydrateFromServer();

    if (!hydrated) {
      console.warn(
        "Countdown: no API data or server-provided target available."
      );
      showNoDataState();
    }
  };

  boot();
})();
