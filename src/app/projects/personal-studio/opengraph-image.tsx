import { criarOgProduto, tamanhoOgProduto } from '@/lib/product-og';

export const alt = 'Personal — Blajeen Labs';
export const size = tamanhoOgProduto;
export const contentType = 'image/png';

export default function Image() {
  return criarOgProduto({
    etiqueta: 'PRODUTO PRÓPRIO / FITNESS',
    titulo: 'Aluno, personal e gestão conectados.',
    descricao: 'Agenda, treinos e acompanhamento em uma plataforma adaptável à rotina do negócio.',
    simbolo: 'P',
  });
}
