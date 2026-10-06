import type { Metadata } from 'next';
import { Container } from '@/components/layout/Section';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Torrelio — o espelho de vendas virou um prédio em 3D | Blajeen Labs',
  descricao:
    'Demonstração do que o estúdio constrói sob medida para incorporadoras e hotéis: um prédio fictício em 3D, no navegador, com cada unidade ligada à tabela, a vista de cada andar e um painel de controle aberto para teste.',
  rota: ROTAS.produtoTorrelio,
});

/** Esqueleto da etapa 0: a demonstração entra aqui nas próximas etapas. */
export default function TorrelioPage() {
  return (
    <header className="pt-[clamp(3rem,7vw,7rem)]">
      <Container>
        <p className="tecnica text-signal">DEMONSTRAÇÃO SOB MEDIDA / INCORPORADORAS E HOTÉIS</p>
        <h1 className="mt-8 text-[clamp(3rem,7vw,7rem)] leading-[0.92] tracking-[-0.06em]">Torrelio</h1>
        <p className="mt-5 max-w-[26ch] text-[clamp(1.3rem,2.4vw,2rem)] leading-[1.15] tracking-[-0.03em] text-paper/85">
          O espelho de vendas virou um prédio.
        </p>
        <p className="medida-texto mt-6 text-mineral">
          Prédio, cidade, entorno, valores, condições, obra, quartos e planta são fictícios.
        </p>
      </Container>
    </header>
  );
}
