/** Fixed session length and daily window (local wall clock). */
export const SLOT_MINUTES = 60;
export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 21;

export type Slot = { start: Date; end: Date; key: string };

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/** YYYY-MM-DD in local timezone */
export function formatLocalDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Parse YYYY-MM-DD as local midnight */
export function parseLocalDate(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function buildSlotsForDay(day: Date): Slot[] {
  const slots: Slot[] = [];
  for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) {
    const start = new Date(day);
    start.setHours(h, 0, 0, 0);
    const end = new Date(start.getTime() + SLOT_MINUTES * 60 * 1000);
    if (end.getHours() > DAY_END_HOUR || (end.getHours() === DAY_END_HOUR && end.getMinutes() > 0)) {
      continue;
    }
    slots.push({
      start,
      end,
      key: start.toISOString(),
    });
  }
  return slots;
}

export function formatSlotLabel(start: Date) {
  return start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
