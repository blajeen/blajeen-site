export function dateInZone(now = new Date(), zone = 'America/Sao_Paulo'): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function shiftDate(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
export function googleDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, day, timeZone: { id: 'America/Los_Angeles' } };
}
