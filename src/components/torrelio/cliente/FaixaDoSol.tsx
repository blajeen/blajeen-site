import { formatarHora } from '@/lib/torrelio/formatar';
import { horasDeSol, type Intervalo } from '@/lib/torrelio/sol';
import type { Estacao, Fachada } from '@/lib/torrelio/tipos';
import { NOMES_DAS_ESTACOES, NOMES_DAS_FACHADAS } from '../interface';
import styles from '../Torrelio.module.css';

const INICIO = 5;
const FIM = 19;

function periodoDoDia(intervalos: readonly Intervalo[]): string {
  if (!intervalos.length) return 'sem sol direto';
  const manha = intervalos.some((i) => i.de < 12);
  const tarde = intervalos.some((i) => i.ate > 12);
  if (manha && tarde) return intervalos.length > 1 ? 'cedo e no fim da tarde' : 'o dia quase todo';
  return manha ? 'de manhã' : 'à tarde';
}

const PELA: Readonly<Record<Fachada, string>> = {
  norte: 'pela frente',
  sul: 'pelos fundos',
  leste: 'pela lateral leste',
  oeste: 'pela lateral oeste',
};

/** Para a ficha do cartão: "à tarde pela lateral oeste; cedo e no fim da tarde pelos fundos". */
export function resumoDoSol(fachadas: readonly Fachada[], estacao: Estacao): string {
  const partes = fachadas
    .map((f) => ({ f, intervalos: horasDeSol(f, estacao) }))
    .filter((p) => p.intervalos.length)
    .map((p) => `${periodoDoDia(p.intervalos)} ${PELA[p.f]}`);
  return partes.length ? partes.join('; ') : 'sem sol direto nesta estação';
}

/** Em texto, para leitores de tela e para quem está sem o 3D. */
export function textoDoSol(fachadas: readonly Fachada[], estacao: Estacao): string {
  const partes = fachadas.map((f) => {
    const intervalos = horasDeSol(f, estacao);
    if (!intervalos.length) return `${NOMES_DAS_FACHADAS[f]}: sem sol direto`;
    return `${NOMES_DAS_FACHADAS[f]}: ${intervalos.map((i) => `das ${formatarHora(i.de)} às ${formatarHora(i.ate)}`).join(' e ')}`;
  });
  return `Sol direto no ${NOMES_DAS_ESTACOES[estacao].toLowerCase()} (hora solar): ${partes.join('; ')}.`;
}

/** A faixa do sol: uma régua de 5h a 19h por fachada, com os trechos de sol direto e a hora escolhida. */
export function FaixaDoSol({ fachadas, estacao, hora }: { fachadas: readonly Fachada[]; estacao: Estacao; hora: number }) {
  const x = (h: number) => `${(((Math.min(FIM, Math.max(INICIO, h)) - INICIO) / (FIM - INICIO)) * 100).toFixed(2)}%`;
  return (
    <figure className={styles.faixaDoSol}>
      <div aria-hidden="true">
        {fachadas.map((f) => (
          <div key={f} className={styles.solLinha}>
            <span className={styles.solRotulo}>{NOMES_DAS_FACHADAS[f]}</span>
            <span className={styles.solTrilho}>
              {horasDeSol(f, estacao).map((i) => (
                <span key={i.de} className={styles.solTrecho} style={{ left: x(i.de), right: `calc(100% - ${x(i.ate)})` }} />
              ))}
              <span className={styles.solAgora} style={{ left: x(hora) }} />
            </span>
          </div>
        ))}
        <div className={styles.solLinha}>
          <span />
          <span className={styles.solHoras}>
            {[6, 12, 18].map((h) => (
              <span key={h} style={{ left: x(h) }}>
                {h}h
              </span>
            ))}
          </span>
        </div>
      </div>
      <figcaption className="sr-only">{textoDoSol(fachadas, estacao)}</figcaption>
    </figure>
  );
}
