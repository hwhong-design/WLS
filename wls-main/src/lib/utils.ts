import { CaseCard } from "./types";

const T = new Date();

export function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return "-";
  return Number(n).toLocaleString();
}

export function daysUntil(dateStr: string): number {
  return Math.round((new Date(dateStr).getTime() - T.getTime()) / 86400000);
}

export function isStale(c: CaseCard): boolean {
  if (["추심종료", "종결"].includes(c.col)) return false;
  return (T.getTime() - new Date(c.lu).getTime()) / 86400000 > 30;
}

export function getGreeting(): string {
  const h = T.getHours();
  if (h < 12) return "좋은 아침이에요";
  if (h < 18) return "안녕하세요";
  return "수고 많으셨어요";
}

export function getTodayStr(): string {
  return T.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function getTodayISO(): string {
  return T.toISOString().split("T")[0];
}

export function getYear(): number {
  return T.getFullYear();
}
