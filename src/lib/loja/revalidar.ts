import { revalidatePath } from 'next/cache';
import { ROTA_DA_LOJA, rotaDoProduto } from './tipos';

/**
 * As páginas da loja ficam em cache por um minuto. Uma alteração no painel atualiza na hora a
 * vitrine, o sitemap e a página de cada produto tocado (o endereço antigo e o novo, se mudou).
 */
export function revalidarLoja(...slugs: Array<string | undefined>): void {
  revalidatePath(ROTA_DA_LOJA);
  revalidatePath('/sitemap.xml');
  for (const slug of new Set(slugs.filter(Boolean))) revalidatePath(rotaDoProduto(slug!));
}
