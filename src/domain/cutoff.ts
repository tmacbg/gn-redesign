/**
 * Weekly order window (verified on the legacy homepage): orders received until
 * Saturday 13:00 Bulgarian time are processed that week; later orders roll to the next week.
 */
const TZ = 'Europe/Sofia';
const CUTOFF_WEEKDAY = 6; // Saturday
const CUTOFF_HOUR = 13;

function sofiaParts(d: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short', hourCycle: 'h23',
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { y: +get('year'), m: +get('month'), d: +get('day'), h: +get('hour'), min: +get('minute'), s: +get('second'), weekday };
}

/** Offset of Europe/Sofia from UTC at the given instant, in minutes. */
function sofiaOffsetMinutes(at: Date): number {
  const p = sofiaParts(at);
  return Math.round((Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - at.getTime()) / 60000);
}

/** The next Saturday 13:00 Sofia time strictly after `now`. */
export function nextCutoff(now: Date): Date {
  const p = sofiaParts(now);
  let daysAhead = (CUTOFF_WEEKDAY - p.weekday + 7) % 7;
  if (daysAhead === 0 && (p.h > CUTOFF_HOUR || (p.h === CUTOFF_HOUR && (p.min > 0 || p.s > 0)))) daysAhead = 7;
  const guess = new Date(Date.UTC(p.y, p.m - 1, p.d + daysAhead, CUTOFF_HOUR, 0, 0));
  // Convert Sofia wall-clock to UTC; re-evaluate offset at the target date to handle DST changes.
  return new Date(guess.getTime() - sofiaOffsetMinutes(guess) * 60000);
}

export function timeUntilCutoff(now: Date): { days: number; hours: number; minutes: number; totalMs: number } {
  const totalMs = nextCutoff(now).getTime() - now.getTime();
  const totalMin = Math.floor(totalMs / 60000);
  return { days: Math.floor(totalMin / 1440), hours: Math.floor((totalMin % 1440) / 60), minutes: totalMin % 60, totalMs };
}
