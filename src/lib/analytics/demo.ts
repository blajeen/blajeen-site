import { dateInZone, shiftDate } from './dates';
import { aggregate, type AccountRow } from './unity';
import type { Dashboard, Review, Source } from './types';
export function demoDashboard(): Dashboard {
  const now = new Date(); const today = dateInZone(now);
  const ok = <T>(data: T): Source<T> => ({ status: 'ok', data, message: '', checkedAt: now.toISOString() });
  const days = Array.from({ length: 30 }, (_, i) => shiftDate(today, i - 30));
  const reviews: Review[] = Array.from({ length: 28 }, (_, i) => ({ id: `exemplo-${i}`, store: i % 2 ? 'play' : 'apple', rating: i < 4 ? [2, 1, 4, 5][i]! : i < 14 ? 4 : 5, text: i === 0 ? 'Gostei do jogo, mas travou ao voltar para a campanha.' : i === 1 ? 'O jogo fechou no meu aparelho depois da partida.' : 'O combate e a exploração estão muito bons. Quero jogar mais!', date: `${shiftDate(today, -1 - Math.floor(i / 2))}T15:00:00Z`, version: i % 2 ? '1.3.6' : null, language: i % 2 ? 'pt-BR' : null }));
  return { demo: true, crash: ok(days.map((date, i) => ({ date, value: i === 29 ? 1.24 : 0.35 + (i % 7) * 0.09 }))), anr: ok(days.map((date, i) => ({ date, value: i === 29 ? 0.43 : 0.12 + (i % 5) * 0.03 }))), devices: ok([{ model: 'Samsung Galaxy A14', crashes: 18 }, { model: 'Motorola Moto G54', crashes: 12 }, { model: 'Samsung Galaxy A34', crashes: 9 }, { model: 'Xiaomi Redmi Note 12', crashes: 6 }, { model: 'Google Pixel 7', crashes: 3 }]), play: ok(reviews.filter((r) => r.store === 'play')), apple: ok(reviews.filter((r) => r.store === 'apple')), installs: ok({ daily: days.map((date, i) => ({ date, value: 24 + (i * 13 % 63) })), versions: [{ version: '136 (1.3.6)', installs: 724 }, { version: '135 (1.3.5)', installs: 183 }, { version: '134 (1.3.4)', installs: 41 }], versionDate: shiftDate(today, -1) }), unity: ok(demoUnity(now)), history: 'Exemplo fictício para revisão visual. Nenhum número representa o jogo publicado.' };
}
/** Contas inventadas passadas pelo mesmo agregador da coleta real. */
function demoUnity(now: Date) {
  const t = Math.floor(now.getTime() / 1000); const day = 86400;
  const stops = ['J01', 'J02', 'J02', 'J03', 'J04', 'J05', 'J07', 'J07', 'J09', 'J12', 'J18', 'J25', 'J33', 'FIM'];
  const rows: AccountRow[] = Array.from({ length: 840 }, (_, i) => {
    const age = (i * 7919 % 60) * day + (i % 24) * 3600; const linked = i % 5 < 3; const stay = [0, 0, 0.5, 1.2, 2, 4, 8, 15][i % 8]! * day;
    const cerco = i % 3 === 0 ? 1 + (i * 37 % 40) : 0; const campaign = !(cerco && i % 6 === 0);
    return { createdAt: t - age, lastLoginAt: t - age + Math.min(stay, age), linked, summary: linked ? { cloudSave: true, adventurers: 1 + (i % 3 === 0 ? 1 : 0), claimed: campaign ? 1 + (i % 20) : 0, stoppedAt: campaign ? stops[i * 13 % stops.length]! : 'J01', cercoMatches: cerco, gold: 120 + (i * 53 % 4000), gems: i % 4 === 0 ? 0 : 15 + (i * 11 % 300) } : { cloudSave: false, adventurers: 0, claimed: 0, stoppedAt: null, cercoMatches: 0, gold: null, gems: null } };
  });
  return aggregate(rows, t, { read: 214, failed: 0, pending: 0 });
}
