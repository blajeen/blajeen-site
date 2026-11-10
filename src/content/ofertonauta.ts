import { ROTAS } from '@/lib/routes';

/** Auditado contra C:/dev/ofertonauta em 10/11/2026; lojas ainda sem ficha pública. */
export const ofertonauta = {
  nome: 'Ofertonauta',
  rota: ROTAS.produtoOfertonauta,
  estado: 'WEB DISPONÍVEL · APP EM PREPARAÇÃO',
  lema: 'Exploradores de promoções.',
  resumo: 'Um radar de ofertas e cupons com uma tripulação que vota, comenta e salva os achados. A compra acontece na loja de origem.',
  site: 'https://ofertonauta.vercel.app',
  icone: { src: '/produtos/ofertonauta/icon.png', alt: '', tamanho: 512 },
  documentos: [
    { href: ROTAS.ofertonautaSuporte, rotulo: 'Suporte' },
    { href: ROTAS.ofertonautaPrivacidade, rotulo: 'Privacidade' },
    { href: ROTAS.ofertonautaTermos, rotulo: 'Termos de uso' },
    { href: ROTAS.ofertonautaExclusao, rotulo: 'Excluir conta' },
  ],
  recursos: [
    { titulo: 'Um radar para os achados', texto: 'Consulte ofertas, preços, cupons e a loja de origem. A busca ajuda a encontrar o produto que você procura.' },
    { titulo: 'Decola! ou Aborta!', texto: 'Entre na sua conta para votar nas ofertas, comentar e salvar os achados para consultar depois.' },
    { titulo: 'Sua identidade de explorador', texto: 'O perfil recebe um apelido espacial e um avatar. O e-mail de login não é exibido no perfil público.' },
    { titulo: 'A compra é na loja', texto: 'Confira preço, frete, vendedor e condições antes de finalizar. Cupons e ofertas podem mudar ou expirar.' },
  ],
} as const;
