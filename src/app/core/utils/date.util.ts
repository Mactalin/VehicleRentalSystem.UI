/** "2026-10-15T09:00" (local time from a datetime-local input) -> UTC ISO string for the API. */
export function toUtcIso(localValue: string): string {
  return new Date(localValue).toISOString();
}

/** Date or ISO string -> value for a datetime-local input, in the user's local time. */
export function toLocalInput(value: Date | string): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** A datetime-local value N minutes from now, rounded up to the next 15 minutes. */
export function localInputFromNow(addMinutes = 0): string {
  const d = new Date(Date.now() + addMinutes * 60_000);
  d.setSeconds(0, 0);
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15);   // 60 rolls over into the next hour
  return toLocalInput(d);
}

export class DateUtil {
  static toUtcIso = toUtcIso;
  static toLocalInput = toLocalInput;
  static localInputFromNow = localInputFromNow;
}