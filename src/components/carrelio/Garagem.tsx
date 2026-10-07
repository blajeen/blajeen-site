'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import styles from './Carrelio.module.css';

type Plataforma = 'iphone' | 'android' | 'computador';

type Props = {
  /** O .glb do carro, para o Scene Viewer do Android (precisa de endereço absoluto). */
  urlDoModelo: string;
  titulo: string;
  /** O link desta configuração, para abrir no celular. */
  link: string;
  com3d: boolean;
  exportarUsdz(): Promise<Blob | null>;
  aoFechar(): void;
};

function plataforma(): Plataforma {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'iphone';
  if (/Android/i.test(ua)) return 'android';
  return 'computador';
}

const nada = () => () => {};

/**
 * "Na sua garagem": o carro em tamanho real, pela câmera do celular. No iPhone, o Quick Look abre
 * o USDZ que a própria cena exporta, já na cor escolhida; no Android, o Scene Viewer do Google
 * abre o .glb do carro; no computador, a pessoa leva o link para o celular. Nada é instalado.
 */
export function Garagem({ urlDoModelo, titulo, link, com3d, exportarUsdz, aoFechar }: Props) {
  const onde = useSyncExternalStore(nada, plataforma, () => 'computador' as const);
  const [situacao, setSituacao] = useState<'pronta' | 'preparando' | 'falhou'>('pronta');
  const [copiado, setCopiado] = useState(false);
  const cabecalho = useRef<HTMLHeadingElement>(null);
  const urlDoUsdz = useRef<string | null>(null);

  useEffect(() => {
    cabecalho.current?.focus();
    return () => {
      if (urlDoUsdz.current) URL.revokeObjectURL(urlDoUsdz.current);
    };
  }, []);

  const abrirNoIphone = async () => {
    setSituacao('preparando');
    const arquivo = await exportarUsdz();
    if (!arquivo) {
      setSituacao('falhou');
      return;
    }
    if (urlDoUsdz.current) URL.revokeObjectURL(urlDoUsdz.current);
    urlDoUsdz.current = URL.createObjectURL(arquivo);
    // O Quick Look só abre por um link `rel="ar"` com uma imagem dentro.
    const ancora = document.createElement('a');
    ancora.rel = 'ar';
    ancora.href = urlDoUsdz.current;
    ancora.appendChild(document.createElement('img'));
    ancora.click();
    setSituacao('pronta');
  };

  const intencaoDoAndroid = () => {
    const arquivo = new URL(urlDoModelo, window.location.href).href;
    const volta = encodeURIComponent(window.location.href);
    return `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(arquivo)}&mode=ar_preferred&title=${encodeURIComponent(titulo)}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${volta};end;`;
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <section
      className={styles.garagem}
      aria-labelledby="carrelio-garagem-titulo"
      onKeyDown={(evento) => {
        // Esc fecha, como as outras camadas do site; quem abriu recebe o foco de volta.
        if (evento.key !== 'Escape') return;
        evento.preventDefault();
        aoFechar();
      }}
    >
      <h3 id="carrelio-garagem-titulo" ref={cabecalho} tabIndex={-1}>
        Na sua garagem
      </h3>
      <p>O carro em tamanho real, pela câmera do celular.</p>
      {onde === 'iphone' ? (
        <button type="button" className={styles.botaoPrincipal} onClick={() => void abrirNoIphone()} disabled={!com3d || situacao === 'preparando'}>
          {!com3d ? 'Preparando o carro…' : situacao === 'preparando' ? 'Preparando…' : 'Abrir na câmera'}
        </button>
      ) : null}
      {onde === 'android' ? (
        <a className={styles.botaoPrincipal} href={intencaoDoAndroid()}>
          Abrir na câmera
        </a>
      ) : null}
      {onde === 'computador' ? (
        <>
          <p className={styles.nota}>Funciona no celular (Android com Google Play ou iPhone). Abra este link nele:</p>
          <button type="button" className={styles.botaoPequeno} onClick={() => void copiar()}>
            {copiado ? 'Link copiado' : 'Copiar o link'}
          </button>
        </>
      ) : null}
      {situacao === 'falhou' ? <p className={styles.nota}>Este aparelho não abriu a realidade aumentada.</p> : null}
      <button type="button" className={styles.fecharGaragem} onClick={aoFechar} aria-label="Fechar o Na sua garagem">
        ×
      </button>
    </section>
  );
}
