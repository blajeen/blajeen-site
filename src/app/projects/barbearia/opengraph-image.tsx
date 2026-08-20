import { criarOgProduto, tamanhoOgProduto } from '@/lib/product-og';

export const alt = 'Plataforma para barbearias — Blajeen Labs';
export const size = tamanhoOgProduto;
export const contentType = 'image/png';

export default function Image() {
  return criarOgProduto({
    etiqueta: 'PRODUTO PRÓPRIO / BARBEARIAS',
    titulo: 'Agenda simples. Operação conectada.',
    descricao: 'Site, agendamento sem conta e gestão em uma plataforma com a identidade da barbearia.',
    simbolo: 'B',
  });
}
