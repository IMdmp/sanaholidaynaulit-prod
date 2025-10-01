import type { Holiday, LongWeekend } from "./types";

const DAY = 24 * 60 * 60 * 1000;

export type Weekday = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

// Convert YYYY-MM-DD to PHT midnight ISO string
export function toPHTMidnightISO(dateISO: string): string {
  return `${dateISO}T00:00:00+08:00`;
}

// Get weekday label in PHT for a PHT ISO string
export function weekdayPHT(phtIso: string): Weekday {
  return new Date(phtIso).toLocaleString("en-US", {
    timeZone: "Asia/Manila",
    weekday: "short",
  }) as Weekday;
}

// Add days (integer) to a Date and return a new Date
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY);
}

// Format Date as YYYY-MM-DD
export function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Main algorithm: compute PHT long weekends from a list of PH holidays.
// - Natural (Fri/Mon): 3-day weekend (Fri–Sun or Sat–Mon)
// - Suggested (Tue/Thu): 4-day weekend with 1-day leave (Sat–Tue or Thu–Sun)
export function computeLongWeekendsPHT(holidays: Holiday[]): LongWeekend[] {
  const results: LongWeekend[] = [];
  const seen = new Set<string>();
  const holidayMap = new Map<string, Holiday>();

  for (const holiday of holidays) {
    holidayMap.set(holiday.dateISO, holiday);
  }

  const pushUnique = (entry: LongWeekend) => {
    const extras = entry.extraHolidayISOs?.join(",") ?? "";
    const key = `${entry.type}|${entry.title}|${entry.startISO}|${entry.endISO}|${extras}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push(entry);
  };

  for (const h of holidays) {
    const holidayISO = toPHTMidnightISO(h.dateISO); // PHT midnight
    const holidayDate = new Date(holidayISO);
    const wd = weekdayPHT(holidayISO);

    if (wd === "Fri") {
      const start = holidayDate;
      const end = addDays(holidayDate, 2); // Fri–Sun
      pushUnique({
        type: "natural",
        title: h.name,
        startISO: toPHTMidnightISO(toYMD(start)),
        endISO: toPHTMidnightISO(toYMD(end)),
        holiday: h,
        durationLabel: "3-day weekend",
      });
      continue;
    }

    if (wd === "Mon") {
      const start = addDays(holidayDate, -2); // Sat
      const end = holidayDate; // Mon
      pushUnique({
        type: "natural",
        title: h.name,
        startISO: toPHTMidnightISO(toYMD(start)),
        endISO: toPHTMidnightISO(toYMD(end)),
        holiday: h,
        durationLabel: "3-day weekend",
      });
      continue;
    }

    if (wd === "Tue") {
      // Sat–Tue, suggested leave Monday
      const suggestedLeave = addDays(holidayDate, -1); // Mon
      const start = addDays(holidayDate, -3); // Sat
      let end = holidayDate; // Tue
      const extraHolidayISOs: string[] = [];

      let cursor = addDays(holidayDate, 1);
      while (true) {
        const cursorYMD = toYMD(cursor);
        const extraHoliday = holidayMap.get(cursorYMD);
        if (!extraHoliday) break;
        const extraISO = toPHTMidnightISO(extraHoliday.dateISO);
        extraHolidayISOs.push(extraISO);
        end = new Date(extraISO);
        cursor = addDays(cursor, 1);
      }

      const extendedWeekend = extraHolidayISOs.length > 0;
      if (extendedWeekend) {
        const finalExtraISO = extraHolidayISOs[extraHolidayISOs.length - 1];
        const finalExtraDate = new Date(finalExtraISO);
        const nextDay = addDays(finalExtraDate, 1);
        const nextDayWeekday = weekdayPHT(toPHTMidnightISO(toYMD(nextDay)));
        if (nextDayWeekday === "Sat") {
          end = addDays(nextDay, 1);
        } else if (nextDayWeekday === "Sun") {
          end = nextDay;
        }
      }

      const durationLabel = extendedWeekend
        ? "very long weekend"
        : "4-day weekend";
      pushUnique({
        type: "suggested",
        title: h.name,
        startISO: toPHTMidnightISO(toYMD(start)),
        endISO: toPHTMidnightISO(toYMD(end)),
        holiday: h,
        suggestedLeaveISO: toPHTMidnightISO(toYMD(suggestedLeave)),
        extraHolidayISOs:
          extraHolidayISOs.length > 0 ? extraHolidayISOs : undefined,
        durationLabel,
      });
      continue;
    }

    if (wd === "Thu") {
      // Thu–Sun, suggested leave Friday
      const suggestedLeave = addDays(holidayDate, 1); // Fri
      const start = holidayDate; // Thu
      const end = addDays(holidayDate, 3); // Sun
      pushUnique({
        type: "suggested",
        title: h.name,
        startISO: toPHTMidnightISO(toYMD(start)),
        endISO: toPHTMidnightISO(toYMD(end)),
        holiday: h,
        suggestedLeaveISO: toPHTMidnightISO(toYMD(suggestedLeave)),
        durationLabel: "4-day weekend",
      });
      continue;
    }
  }

  // Sort by start date ascending
  return results.sort((a, b) => a.startISO.localeCompare(b.startISO));
}

// Optional: helper to compute all months spanned by a range, useful for rendering.
export function monthsInRange(
  startISO: string,
  endISO: string
): { year: number; month: number }[] {
  const out: { year: number; month: number }[] = [];
  const start = new Date(startISO);
  const end = new Date(endISO);
  let y = start.getFullYear();
  let m = start.getMonth();
  while (
    y < end.getFullYear() ||
    (y === end.getFullYear() && m <= end.getMonth())
  ) {
    out.push({ year: y, month: m });
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }
  return out;
}
