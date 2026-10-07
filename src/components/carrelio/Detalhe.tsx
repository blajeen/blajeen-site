'use client';

import type { CSSProperties } from 'react';
import type { DetalheDoPonto } from './detalhes';
import type { PontoNoPalco } from './PalcoCarro';
import styles from './Carrelio.module.css';

/**
 * A foto de detalhe de um ponto: no balão (computador) e no cartão (celular). Com uma alternativa
 * (o porta-malas vazio e cheio), as duas se alternam devagar, com movimento; sem movimento, fica a
 * primeira. É decorativa: o texto do ponto já está no nome do botão.
 */
export function FotoDoDetalhe({ detalhe }: { detalhe: DetalheDoPonto }) {
  return (
    <span
      className={styles.fotoDoDetalhe}
      data-alterna={detalhe.alternativa ? 'sim' : 'nao'}
      style={{ aspectRatio: `${detalhe.largura} / ${detalhe.altura}` } as CSSProperties}
    >
      <picture>
        <img src={detalhe.src} width={detalhe.largura} height={detalhe.altura} alt="" decoding="async" />
      </picture>
      {detalhe.legenda ? <span className={styles.seloDoDetalhe}>{detalhe.legenda}</span> : null}
      {detalhe.alternativa ? (
        <span className={styles.alternativaDoDetalhe}>
          <picture>
            <img src={detalhe.alternativa.src} width={detalhe.largura} height={detalhe.altura} alt="" decoding="async" />
          </picture>
          <span className={styles.seloDoDetalhe}>{detalhe.alternativa.legenda}</span>
        </span>
      ) : null}
    </span>
  );
}

/**
 * No palco estreito (o celular), a foto não cabe no balão: o ponto aberto vira um cartão grande, com
 * a foto, o texto e um botão de fechar. No palco largo, o cartão não aparece (o balão mostra a foto).
 */
export function CartaoDoDetalhe({ ponto, detalhe, aoFechar }: { ponto: PontoNoPalco; detalhe: DetalheDoPonto; aoFechar(): void }) {
  return (
    <div className={styles.cartaoDoDetalhe}>
      <div aria-hidden="true">
        <FotoDoDetalhe detalhe={detalhe} />
        <p className={styles.textoDoCartao}>
          <strong>{ponto.rotulo}</strong>
          <span>{ponto.texto}</span>
        </p>
      </div>
      <button type="button" className={styles.fecharDetalhe} aria-label={`Fechar: ${ponto.rotulo}`} onClick={aoFechar}>
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}
