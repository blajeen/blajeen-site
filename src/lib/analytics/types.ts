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
  history: string;
};
export const LIMITS = { crash: 1.09, anr: 0.47, alertCrash: 1, alertAnr: 0.4 };
export const UNITY_METRICS = ['Jogadores ativos por dia', 'Retenção D1 / D7', 'Escolha inicial: Cerco ou Campanha', 'Partidas do Cerco', 'Economia: gemas e ouro', 'Vendas'] as const;
/** Integração intencionalmente desligada até a telemetria da versão 1.3.7. */
export async function readUnity(): Promise<null> { return null; }
