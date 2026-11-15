import { dateInZone, shiftDate } from './dates';
import { LIMITS, type Dashboard, type Review } from './types';
export function weekly(reviews: Review[], today = dateInZone()) {
  const rating = (start: string, end: string) => {
    const sample = reviews.filter((r) => { const date = dateInZone(new Date(r.date)); return date >= start && date < end; });
    return { count: sample.length, average: sample.length ? sample.reduce((sum, r) => sum + r.rating, 0) / sample.length : null };
  };
  // Seven completed Brasilia dates; compared with the seven preceding dates.
  const current = rating(shiftDate(today, -7), today);
  const previous = rating(shiftDate(today, -14), shiftDate(today, -7));
  return { ...current, previous: previous.average, drop: current.average !== null && previous.average !== null ? previous.average - current.average : null };
}
export function dailySummary(data: Dashboard, today = dateInZone()) {
  const yesterday = shiftDate(today, -1);
  const crash = data.crash.data?.find((p) => p.date === yesterday)?.value ?? null;
  const anr = data.anr.data?.find((p) => p.date === yesterday)?.value ?? null;
  const installs = data.installs.data?.daily.find((p) => p.date === yesterday)?.value ?? null;
  const reviews = [...(data.play.data ?? []), ...(data.apple.data ?? [])];
  const newReviews = reviews.filter((r) => dateInZone(new Date(r.date)) === yesterday);
  const averages = { play: weekly(data.play.data ?? [], today), apple: weekly(data.apple.data ?? [], today) };
  const alerts = [
    ...(crash !== null && crash > LIMITS.alertCrash ? ['Travamentos acima de 1%.'] : []),
    ...(anr !== null && anr > LIMITS.alertAnr ? ['ANR acima de 0,4%.'] : []),
    ...(newReviews.some((r) => r.rating <= 2) ? ['Avaliação nova de 1–2 estrelas.'] : []),
    ...Object.entries(averages).filter(([, s]) => s.drop !== null && s.drop + 1e-9 >= 0.3).map(([store]) => `Média semanal caiu pelo menos 0,3 (${store === 'play' ? 'Google Play' : 'App Store'}).`),
  ];
  return { yesterday, crash, anr, installs, newReviews, averages, alerts };
}
export function number(value: number | null, decimals = 2): string {
  return value === null ? 'Sem dados' : value.toLocaleString('pt-BR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}
