// Types for API holidays and computed long weekends (PHT-aware)
export type HolidayType = "regular" | "special";
export type HolidayStatus = "official" | "tba" | "pending";

export interface Holiday {
  dateISO: string; // YYYY-MM-DD (civil date in PH)
  name: string;
  type: HolidayType;
  status: HolidayStatus;
}

export type LongWeekendType = "natural" | "suggested";

export interface LongWeekend {
  type: LongWeekendType;
  title: string;
  startISO: string; // PHT midnight ISO: YYYY-MM-DDT00:00:00+08:00
  endISO: string; // PHT midnight ISO: YYYY-MM-DDT00:00:00+08:00
  holiday: Holiday;
  suggestedLeaveISO?: string; // PHT midnight ISO if suggested leave is used
  extraHolidayISOs?: string[];
  durationLabel: "3-day weekend" | "4-day weekend" | "very long weekend";
}
