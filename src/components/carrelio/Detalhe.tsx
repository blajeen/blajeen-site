'use client';

import { useId, useState, type CSSProperties, type KeyboardEvent } from 'react';
import type { DetalheDoPonto } from './detalhes';
import type { PontoNoPalco } from './PalcoCarro';
import styles from './Carrelio.module.css';

/**
 * A foto de detalhe de um ponto, no balão (computador) e no cartão (celular). Com mais de uma foto
 * (o porta-malas vazio e cheio), elas ficam em abas, e a primeira abre selecionada. As abas seguem o
 * padrão das abas do site (`Abas.tsx`): setas, Home e End; só a aba atual entra no Tab.
 *
 * Uma foto só é decorativa: o texto do ponto já está no nome do botão. Em abas, a foto à vista tem
 * texto alternativo ("Porta-malas, vazio"), porque é ela que a aba troca.
 */
export function FotoDoDetalhe({ detalhe, rotulo }: { detalhe: DetalheDoPonto; rotulo: string }) {
  const [ativa, setAtiva] = useState(0);
  const base = useId();
  const comAbas = detalhe.fotos.length > 1;
  const idDaAba = (indice: number) => `${base}aba${indice}`;
  const idDoPainel = `${base}painel`;

  function teclar(evento: KeyboardEvent<HTMLButtonElement>, indice: number) {
    const ultimo = detalhe.fotos.length - 1;
    const destino =
      evento.key === 'ArrowRight' ? (indice === ultimo ? 0 : indice + 1)
        : evento.key === 'ArrowLeft' ? (indice === 0 ? ultimo : indice - 1)
          : evento.key === 'Home' ? 0
            : evento.key === 'End' ? ultimo
              : null;
    if (destino === null) return;
    evento.preventDefault();
    setAtiva(destino);
    document.getElementById(idDaAba(destino))?.focus();
  }

  return (
    <span className={styles.detalhe}>
      {comAbas ? (
        <span role="tablist" aria-label={`Fotos: ${rotulo}`} className={styles.abasDoDetalhe}>
          {detalhe.fotos.map((foto, indice) => (
            <button
              key={foto.src}
              id={idDaAba(indice)}
              type="button"
              role="tab"
              aria-selected={indice === ativa}
              aria-controls={idDoPainel}
              tabIndex={indice === ativa ? 0 : -1}
              onClick={() => setAtiva(indice)}
              onKeyDown={(evento) => teclar(evento, indice)}
            >
              {foto.rotulo}
            </button>
          ))}
        </span>
      ) : null}
      <span
        className={styles.fotoDoDetalhe}
        style={{ aspectRatio: `${detalhe.largura} / ${detalhe.altura}` } as CSSProperties}
        {...(comAbas ? { id: idDoPainel, role: 'tabpanel', 'aria-labelledby': idDaAba(ativa) } : {})}
      >
        {/* As fotos ficam empilhadas: trocar de aba é instantâneo (a outra já carregou) e esmaece com movimento. */}
        {detalhe.fotos.map((foto, indice) => (
          <picture key={foto.src} data-ativa={indice === ativa ? 'sim' : 'nao'}>
            <img
              src={foto.src}
              width={detalhe.largura}
              height={detalhe.altura}
              // Só a foto à vista tem texto: a de trás fica fora do leitor de tela.
              alt={comAbas && indice === ativa && foto.rotulo ? `${rotulo}, ${foto.rotulo.toLocaleLowerCase('pt-BR')}` : ''}
              decoding="async"
            />
          </picture>
        ))}
      </span>
    </span>
  );
}

/**
 * O balão de um ponto aberto, ao lado do ponto: a foto de detalhe (com as abas, se houver) e o texto.
 * O texto repete o nome do botão do ponto: fica escondido do leitor de tela.
 */
export function BalaoDoPonto({ ponto }: { ponto: PontoNoPalco }) {
  return (
    <div className={`${styles.pontoBalao}${ponto.detalhe ? ` ${styles.balaoComFoto}` : ''}`}>
      {ponto.detalhe ? <FotoDoDetalhe detalhe={ponto.detalhe} rotulo={ponto.rotulo} /> : null}
      <span className={styles.textoDoBalao} aria-hidden="true">
        <strong>{ponto.rotulo}</strong>
        <span>{ponto.texto}</span>
      </span>
    </div>
  );
}

/**
 * No palco estreito (o celular), a foto não cabe no balão: o ponto aberto vira um cartão grande, com
 * a foto, o texto e um botão de fechar. No palco largo, o cartão não aparece (o balão mostra a foto).
 */
export function CartaoDoDetalhe({ ponto, detalhe, aoFechar }: { ponto: PontoNoPalco; detalhe: DetalheDoPonto; aoFechar(): void }) {
  return (
    <div className={styles.cartaoDoDetalhe} data-abas={detalhe.fotos.length > 1 ? 'sim' : 'nao'}>
      <FotoDoDetalhe detalhe={detalhe} rotulo={ponto.rotulo} />
      <p className={styles.textoDoCartao} aria-hidden="true">
        <strong>{ponto.rotulo}</strong>
        <span>{ponto.texto}</span>
      </p>
      <button type="button" className={styles.fecharDetalhe} aria-label={`Fechar: ${ponto.rotulo}`} onClick={aoFechar}>
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}
