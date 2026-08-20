import { ImageResponse } from 'next/og';

type EntradaOgProduto = {
  etiqueta: string;
  titulo: string;
  descricao: string;
  simbolo: string;
};

export const tamanhoOgProduto = { width: 1200, height: 630 };

export function criarOgProduto({ etiqueta, titulo, descricao, simbolo }: EntradaOgProduto) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '58px 64px',
          color: '#f4f4ef',
          background: '#080b08',
          border: '1px solid #2f382f',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontSize: 27, fontWeight: 800, letterSpacing: '-1px' }}>BLAJEEN</span>
            <span style={{ fontSize: 14, letterSpacing: '5px', color: '#a8b0a7' }}>LABS</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: 22,
              border: '1px solid #b9ff35',
              color: '#b9ff35',
              fontSize: 33,
              fontWeight: 700,
            }}
          >
            {simbolo}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 980 }}>
          <span style={{ color: '#b9ff35', fontSize: 15, letterSpacing: '4px' }}>{etiqueta}</span>
          <div
            style={{
              display: 'flex',
              marginTop: 22,
              fontSize: 66,
              fontWeight: 650,
              lineHeight: 0.98,
              letterSpacing: '-3.5px',
            }}
          >
            {titulo}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 24,
              maxWidth: 850,
              color: '#a8b0a7',
              fontSize: 24,
              lineHeight: 1.35,
            }}
          >
            {descricao}
          </div>
        </div>
      </div>
    ),
    tamanhoOgProduto,
  );
}
