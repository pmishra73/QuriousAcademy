import coursesData from "@/data/courses.json";
import { getUpcomingDates, type ScheduleRule } from "./dates";

export type CourseVariant = {
  id: string;
  subject: string;
  subjectLabel: string;
  icon: string;
  type: "masterclass" | "cohort" | "sprint" | "standard" | "deep-dive";
  title: string;
  tagline: string;
  price: number;
  currency: string;
  duration: string;
  level: string;
  instructor: string;
  schedule: ScheduleRule;
  content: {
    overview: string;
    sessions: { session: string; title: string; topics: string[] }[];
    prerequisites: string;
    outcomes: string[];
    includes: string[];
    certificate: string;
  };
};

export const variants: CourseVariant[] = coursesData.variants as CourseVariant[];

export const typeConfig = {
  masterclass: {
    label: "Masterclass",
    sublabel: "3 hrs · One day",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.2)",
    icon: "⚡",
  },
  cohort: {
    label: "Intensive Cohort",
    sublabel: "1–2 days",
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
    border: "rgba(52,211,153,0.2)",
    icon: "🔥",
  },
  sprint: {
    label: "Sprint Course",
    sublabel: "< 1 month",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.1)",
    border: "rgba(96,165,250,0.2)",
    icon: "⚡",
  },
  standard: {
    label: "Full Course",
    sublabel: "1–3 months",
    color: "#5b7cfa",
    bg: "rgba(91,124,250,0.1)",
    border: "rgba(91,124,250,0.2)",
    icon: "📘",
  },
  "deep-dive": {
    label: "Deep Dive",
    sublabel: "90+ days",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.1)",
    border: "rgba(167,139,250,0.2)",
    icon: "🎯",
  },
} as const;

export const sectionOrder: CourseVariant["type"][] = [
  "masterclass",
  "cohort",
  "sprint",
  "standard",
  "deep-dive",
];

export function getVariantsByType(type: CourseVariant["type"]) {
  return variants.filter((v) => v.type === type);
}

export function getUpcomingForVariant(v: CourseVariant): string[] {
  return getUpcomingDates(v.schedule);
}
