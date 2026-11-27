import type { UnitySnapshot } from './unity';
export type Source<T> = { status: 'ok' | 'missing' | 'error'; data: T | null; message: string; checkedAt: string };
export type Daily = { date: string; value: number };
export type Review = { id: string; store: 'play' | 'apple'; rating: number; text: string; date: string; version: string | null; language: string | null };
export type Installs = { daily: Daily[]; versions: Array<{ version: string; installs: number }>; versionDate: string | null };
export type Dashboard = {
  demo: boolean;
  crash: Source<Daily[]>;
  anr: Source<Daily[]>;
  devices: Source<Array<{ model: string; crashes: number }>>;
  play: Source<Review[]>;
  apple: Source<Review[]>;
  installs: Source<Installs>;
  unity: Source<UnitySnapshot>;
  history: string;
};
export const LIMITS = { crash: 1.09, anr: 0.47, alertCrash: 1, alertAnr: 0.4 };
/** Espaços sem fonte confiável nos saves: continuam "Em breve" em vez de inventar número. */
export const UNITY_PENDING = [
  { label: 'Escolha inicial: Cerco ou Campanha', reason: 'A escolha fica só no aparelho (PlayerPrefs), não no save da nuvem.' },
  { label: 'Vendas', reason: 'Sem fonte confiável integrada: o saldo de gemas não separa compra de prêmio.' },
] as const;
