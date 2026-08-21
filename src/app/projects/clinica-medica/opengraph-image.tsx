import { criarOgProduto, tamanhoOgProduto } from '@/lib/product-og';

export const alt = 'Clínica Médica — Blajeen Labs';
export const size = tamanhoOgProduto;
export const contentType = 'image/png';

export default function Image() {
  return criarOgProduto({
    etiqueta: 'EM BREVE / CLÍNICA MÉDICA',
    titulo: 'Site, agenda e rotina clínica em uma única base.',
    descricao: 'Produto em desenvolvimento para médicos que atendem de forma independente.',
    simbolo: '+',
  });
}
