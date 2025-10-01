// Use environment variables with fallback
const API_BASE_URL =
  (import.meta as any).env.API_BASE_URL || "http://localhost:8787";
const USE_LOCAL_DATA =
  (import.meta as any).env.USE_LOCAL_DATA === "true" ||
  (import.meta as any).env.USE_LOCAL_DATA === true ||
  false;

import type { Holiday, HolidayType, HolidayStatus } from "./types";
import officialData from "../../official_data.json";

export interface NextResponse {
  next: Holiday & { dateISO: string };
  nextTwo: (Holiday & { dateISO: string })[];
  generatedAt: string;
}

export interface SiteData {
  holidays: Holiday[];
  next: Holiday & { dateISO: string };
  nextTwo: (Holiday & { dateISO: string })[];
  generatedAt: string;
  year: string;
}

let cached: Promise<SiteData> | null = null;

const pad2 = (n: number) => String(n).padStart(2, "0");
const currentYearPHT = (): string => {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
  );
  return String(now.getFullYear());
};

// Helper functions for processing local data
const getLocalHolidaysForYear = (year: string): Holiday[] => {
  return officialData
    .filter(
      (holiday) =>
        holiday.dateISO.startsWith(year) &&
        holiday.source === "official_gazette"
    )
    .map((holiday) => ({
      dateISO: holiday.dateISO,
      name: holiday.name,
      type: holiday.type as HolidayType,
      status: holiday.status as HolidayStatus,
    }));
};

const findNextHolidays = (
  holidays: Holiday[]
): {
  next: Holiday & { dateISO: string };
  nextTwo: (Holiday & { dateISO: string })[];
} => {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
  );
  const today = now.toISOString().split("T")[0]; // YYYY-MM-DD format

  // Filter holidays that are today or in the future
  const upcomingHolidays = holidays.filter(
    (holiday) => holiday.dateISO >= today
  );

  if (upcomingHolidays.length === 0) {
    // If no upcoming holidays this year, get holidays from next year
    const nextYear = String(now.getFullYear() + 1);
    const nextYearHolidays = getLocalHolidaysForYear(nextYear);
    return {
      next: nextYearHolidays[0] as Holiday & { dateISO: string },
      nextTwo: nextYearHolidays.slice(1, 3) as (Holiday & {
        dateISO: string;
      })[],
    };
  }

  return {
    next: upcomingHolidays[0] as Holiday & { dateISO: string },
    nextTwo: upcomingHolidays.slice(1, 3) as (Holiday & { dateISO: string })[],
  };
};

const collectLocalHolidays = (years: string[]): Holiday[] => {
  return years
    .flatMap((yr) => getLocalHolidaysForYear(yr))
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
};

const processLocalData = (year: string, extraYears: string[]): SiteData => {
  const holidays = collectLocalHolidays([year, ...extraYears]);
  const { next, nextTwo } = findNextHolidays(holidays);

  return {
    holidays,
    next,
    nextTwo,
    generatedAt: new Date().toISOString(),
    year,
  };
};

export function getSiteData(): Promise<SiteData> {
  if (cached) return cached;
  cached = (async () => {
    const year = currentYearPHT();

    // Use local data if USE_LOCAL_DATA environment variable is true
    if (USE_LOCAL_DATA) {
      const extraYears = [String(Number(year) + 1)];
      return processLocalData(year, extraYears);
    }

    // Otherwise, use API calls as before
    const nextYear = String(Number(year) + 1);

    const [nextRes, holidaysRes, holidaysNextRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/next`),
      fetch(`${API_BASE_URL}/api/holidays?year=${year}`),
      fetch(`${API_BASE_URL}/api/holidays?year=${nextYear}`),
    ]);
    if (!nextRes.ok) throw new Error(`/api/next failed: ${nextRes.status}`);
    if (!holidaysRes.ok)
      throw new Error(`/api/holidays failed: ${holidaysRes.status}`);
    if (!holidaysNextRes.ok)
      throw new Error(
        `/api/holidays (next year) failed: ${holidaysNextRes.status}`
      );

    const nextData = (await nextRes.json()) as NextResponse;
    const holidaysCurrent = (await holidaysRes.json()) as Holiday[];
    const holidaysNext = (await holidaysNextRes.json()) as Holiday[];
    const holidays = [...holidaysCurrent, ...holidaysNext].sort((a, b) =>
      a.dateISO.localeCompare(b.dateISO)
    );

    return {
      holidays,
      next: nextData.next,
      nextTwo: nextData.nextTwo,
      generatedAt: nextData.generatedAt,
      year,
    };
  })();
  return cached;
}
