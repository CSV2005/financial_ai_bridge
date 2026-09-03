const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(amount: number): string {
  return inr.format(Math.round(amount));
}

export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso + (iso.length === 10 ? "T00:00:00" : "")) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7); // YYYY-MM
}

export function monthLabel(key: string): string {
  const d = new Date(key + "-01T00:00:00");
  return d.toLocaleDateString("en-IN", { month: "short" });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function monthsBetween(fromISO: string, to = new Date()): number {
  const from = new Date(fromISO + "T00:00:00");
  const months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());
  return Math.max(1, months);
}

export const WORKER_TYPES: Record<string, string> = {
  gig: "Gig / Platform Worker",
  "daily-wage": "Daily-Wage Worker",
  freelancer: "Freelancer",
  informal: "Informal / Self-employed",
};

export const CONFIDENCE_LABELS = {
  low: { label: "Low confidence", color: "rose" },
  medium: { label: "Medium confidence", color: "amber" },
  high: { label: "High confidence", color: "emerald" },
} as const;
