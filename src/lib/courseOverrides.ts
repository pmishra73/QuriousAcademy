import { db } from "./db";
import { variants as baseVariants } from "./variants";
import type { CourseVariant } from "./variants";
import { getUpcomingDates } from "./dates";
import type { ScheduleRule } from "./dates";

export type MergedVariant = CourseVariant & {
  hidden: boolean;
  effectiveScheduleDates: string[];
};

export async function getMergedVariants(): Promise<MergedVariant[]> {
  let overrides: Record<string, { hidden: boolean; title: string | null; tagline: string | null; price: number | null; recordedPrice: number | null; level: string | null; scheduleDates: string[] }> = {};

  try {
    const rows = await db.courseOverride.findMany();
    for (const row of rows) {
      overrides[row.courseId] = row;
    }
  } catch {
    // DB unavailable — use JSON defaults
  }

  return baseVariants.map((v) => {
    const ov = overrides[v.id];
    const merged: MergedVariant = {
      ...v,
      title: ov?.title ?? v.title,
      tagline: ov?.tagline ?? v.tagline,
      price: ov?.price ?? v.price,
      recordedPrice: ov?.recordedPrice ?? v.recordedPrice,
      level: ov?.level ?? v.level,
      hidden: ov?.hidden ?? false,
      effectiveScheduleDates:
        ov && ov.scheduleDates.length > 0
          ? ov.scheduleDates
          : getUpcomingDates(v.schedule as ScheduleRule),
    };
    return merged;
  });
}

export async function getVisibleVariants(): Promise<MergedVariant[]> {
  const all = await getMergedVariants();
  return all.filter((v) => !v.hidden);
}
