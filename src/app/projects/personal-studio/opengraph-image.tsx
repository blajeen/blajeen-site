import { criarOgProduto, tamanhoOgProduto } from '@/lib/product-og';
import { obterSaas } from '@/content/saas';

const produto = obterSaas('studelio');
export const alt = 'Studelio — Blajeen Labs';
export const size = tamanhoOgProduto;
export const contentType = 'image/png';

export default function Image() {
  return criarOgProduto({
    etiqueta: `${produto.nome.toUpperCase()} / ATIVO`,
    titulo: produto.titulo,
    descricao: produto.resumo,
    simbolo: 'S',
  });
}
