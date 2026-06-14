export type ScheduleRule = {
  rule: "monthly-first-saturday" | "biweekly-weekends" | "weekly-monday" | "fixed-days";
  time?: string;
  days?: string;
  nextStart?: string;
};

function nextDayOfWeek(from: Date, dayIndex: number): Date {
  const d = new Date(from);
  const diff = (dayIndex - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
}

function nthWeekdayOfMonth(year: number, month: number, dayIndex: number, n: number): Date {
  const d = new Date(year, month, 1);
  let count = 0;
  while (true) {
    if (d.getDay() === dayIndex) {
      count++;
      if (count === n) return d;
    }
    d.setDate(d.getDate() + 1);
  }
}

const FMT: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
const fmt = (d: Date) => d.toLocaleDateString("en-IN", FMT);

export function getUpcomingDates(schedule: ScheduleRule): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const time = schedule.time ?? "";

  if (schedule.rule === "monthly-first-saturday") {
    const dates: string[] = [];
    for (let offset = 0; offset < 3; offset++) {
      const m = (today.getMonth() + offset) % 12;
      const y = today.getFullYear() + Math.floor((today.getMonth() + offset) / 12);
      const d = nthWeekdayOfMonth(y, m, 6, 1); // 6 = Saturday
      if (d >= today) dates.push(`${fmt(d)} · ${time}`);
    }
    return dates.slice(0, 2);
  }

  if (schedule.rule === "biweekly-weekends") {
    const results: string[] = [];
    const d = new Date(today);
    while (results.length < 2) {
      const day = d.getDay();
      if (day === 6 || day === 0) { // Saturday or Sunday
        if (d >= today) results.push(`${fmt(d)}–${fmt(new Date(d.getTime() + 86400000))} · ${time}`);
        d.setDate(d.getDate() + (day === 6 ? 8 : 7)); // skip to next Sat
      } else {
        d.setDate(d.getDate() + ((6 - day + 7) % 7)); // move to next Saturday
      }
    }
    return results;
  }

  if (schedule.rule === "weekly-monday") {
    const results: string[] = [];
    let d = nextDayOfWeek(today, 1); // 1 = Monday
    for (let i = 0; i < 3; i++) {
      results.push(`Batch starting ${fmt(d)} · ${time}`);
      d = new Date(d.getTime() + 7 * 86400000);
    }
    return results;
  }

  if (schedule.rule === "fixed-days") {
    return [`Ongoing · ${schedule.days} · ${time}`, "New batches start monthly"];
  }

  return [];
}
