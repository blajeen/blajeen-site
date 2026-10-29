import { ROTAS } from '@/lib/routes';
import { site } from '../site';
import type { LegalDocument } from '../types';

const VERSAO = '26 de setembro de 2026';
const FONTE_DATA = 'Disponibilidade conferida na ficha pública do Catelio na App Store, Google Play informado pelo titular em 29/10/2026; revisão de dados ainda pendente.';
const AVISO =
  'Catelio está disponível na App Store e no Google Play. Esta documentação está em revisão para refletir integralmente a versão distribuída; a publicação do jogo não confirma que os textos antigos sobre dados, compras ou conta permaneçam válidos.';

const relacionados = [
  { href: ROTAS.projetoCatelio, rotulo: 'Sobre o Catelio' },
  { href: ROTAS.catelioSuporte, rotulo: 'Suporte do Catelio' },
  { href: ROTAS.catelioPrivacidade, rotulo: 'Privacidade do Catelio' },
  { href: ROTAS.catelioTermos, rotulo: 'Termos do Catelio' },
  { href: ROTAS.catelioExclusao, rotulo: 'Excluir conta do Catelio' },
  { href: ROTAS.contato, rotulo: 'Contato do estúdio' },
] as const;

export const privacidadeCatelio: LegalDocument = {
  "rota": ROTAS.catelioPrivacidade,
  "kind": "privacidade",
  "produto": "Catelio",
  "titulo": "Política de Privacidade do Catelio para Android",
  "resumo": "Privacidade da versão Android 1.3 (1), com Unity IAP 5.4.3. Esta revisão não abrange o iOS.",
  "estado": "publicado",
  "atualizacao": {
    "definido": true,
    "valor": "17 de outubro de 2026",
    "fonte": "Auditoria da versão Android 1.3 (1) e revisão expressamente aprovada pelo titular em 17/10/2026."
  },
  "secoes": [
    {
      "id": "responsavel",
      "titulo": "1. Responsável e contato",
      "blocos": [
        {
          "tipo": "paragrafo",
          "texto": "O Catelio é um jogo da Blajeen Labs. Publicado por 57.194.521 BRENO RICARDO GUIMARAES, CNPJ 57.194.521/0001-44. O contato de privacidade é brg.ftw@gmail.com, com o assunto “Privacidade Catelio”."
        }
      ]
    },
    {
      "id": "dados-locais",
      "titulo": "2. Dados guardados no aparelho",
      "blocos": [
        {
          "tipo": "paragrafo",
          "texto": "O jogo guarda localmente o nome e a aparência escolhidos para o gato, preferências e progresso da aventura. A versão Android auditada não oferece criação de conta nem sincronização desse progresso com um servidor da Blajeen Labs. O armazenamento local não deve ser considerado um cofre criptografado. Limpar os dados do aplicativo nas configurações do Android apaga o progresso local; essa ação não cancela uma compra registrada pelo Google Play."
        }
      ]
    },
    {
      "id": "compras",
      "titulo": "3. Compra do jogo completo",
      "blocos": [
        {
          "tipo": "paragrafo",
          "texto": "O início pode ser jogado gratuitamente. Uma compra única pelo Google Play libera a história completa. A loja administra o pagamento e o vínculo da compra à conta Google. O Catelio recebe o resultado da compra e informações necessárias para reconhecer ou restaurar esse acesso. Não recebemos o número completo do cartão de pagamento."
        }
      ]
    },
    {
      "id": "dados-tecnicos",
      "titulo": "4. Componente de compras e dados técnicos",
      "blocos": [
        {
          "tipo": "paragrafo",
          "texto": "O AAB auditado usa Unity IAP 5.4.3. Esse componente envia à Unity eventos de compras com produto, valor e moeda, identificadores de transação, recibos e informações de falhas. Também pode enviar modelo do aparelho, versão do sistema, idioma, região, versão do jogo e dados técnicos de instalação e sessão. Identificadores dos serviços Unity dependem dos componentes disponíveis. A auditoria não identificou coleta do nome do gato por esse caminho."
        },
        {
          "tipo": "paragrafo",
          "texto": "Esses dados apoiam a operação e análise das compras, diagnóstico, prevenção a fraudes e obrigações de faturamento. Google e Unity podem tratar dados fora do Brasil conforme suas políticas e mecanismos de proteção aplicáveis. Consulte a política do Google em https://policies.google.com/privacy e a da Unity em https://unity.com/legal/game-player-and-app-user-privacy-policy."
        }
      ]
    },
    {
      "id": "publicidade",
      "titulo": "5. Publicidade e recursos do Android",
      "blocos": [
        {
          "tipo": "paragrafo",
          "texto": "Esta versão não exibe anúncios. O manifesto auditado não solicita identificador de publicidade, localização, câmera, microfone ou contatos. O componente Meta encontrado no projeto é exclusivo do iOS e não integra o fluxo Android auditado. A ausência de anúncios não significa ausência de dados técnicos no componente de compras."
        }
      ]
    },
    {
      "id": "criancas",
      "titulo": "6. Crianças e responsáveis",
      "blocos": [
        {
          "tipo": "paragrafo",
          "texto": "O público pretendido inclui crianças a partir de 6 anos. O jogo não oferece chat entre usuários. Compras devem ser acompanhadas por um responsável e seguem os controles da conta Google. Responsáveis podem usar o contato de privacidade para obter informações ou solicitar a eliminação dos dados da criança. O acompanhamento das compras por um responsável e os controles da loja não equivalem, por si só, a um mecanismo de consentimento para o tratamento de dados pelo componente de compras."
        }
      ]
    },
    {
      "id": "exclusao",
      "titulo": "7. Conservação e exclusão",
      "blocos": [
        {
          "tipo": "paragrafo",
          "texto": "Os dados locais permanecem no aparelho até serem apagados ou substituídos; eventuais cópias mantidas pelo próprio sistema seguem suas configurações. A compra permanece vinculada à loja para permitir restauração. A documentação do Unity IAP informa retenção de registros de serviço por 90 dias e de pedidos até solicitação de exclusão, observadas as retenções aplicáveis para obrigações legais, segurança e defesa de direitos. Consulte os canais abaixo para pedidos relativos a esses registros."
        },
        {
          "tipo": "paragrafo",
          "texto": "Pedidos relativos a dados processados pela Unity em nosso nome serão recebidos no canal de privacidade e encaminhados pelo estúdio. Quando a Unity atuar como controladora independente, pode ser necessário encaminhar o pedido diretamente a ela; orientaremos o responsável. O estúdio não consegue apagar remotamente o progresso existente somente no aparelho nem apagar o histórico da conta Google. Solicitações de acesso, correção e eliminação podem ser enviadas ao canal acima; nenhuma senha ou número de cartão deve ser enviado."
        }
      ]
    },
    {
      "id": "atendimento",
      "titulo": "8. Atendimento e alterações",
      "blocos": [
        {
          "tipo": "paragrafo",
          "texto": "Se você entrar em contato por e-mail, trataremos o endereço e as informações fornecidas para responder à solicitação. Evite enviar dados desnecessários de crianças. Os e-mails de atendimento serão excluídos em até 90 dias após o encerramento, salvo quando a conservação for necessária para obrigação legal ou defesa de direitos, conforme decisão do responsável."
        },
        {
          "tipo": "paragrafo",
          "texto": "Esta política descreve a versão Android 1.3 (1). A navegação neste site é abrangida pela política geral do site da Blajeen Labs. Mudanças no aplicativo, nos serviços ou nas práticas de dados exigem atualização deste texto e das declarações da loja."
        }
      ]
    }
  ],
  "relacionados": [...relacionados],
  "metaTitulo": "Privacidade do Catelio para Android — Blajeen Labs",
  "metaDescricao": "Dados locais, compras no Google Play, dados técnicos do Unity IAP e contato de privacidade do Catelio Android."
};

export const termosCatelio: LegalDocument = {
  rota: ROTAS.catelioTermos,
  kind: 'termos',
  produto: 'Catelio',
  titulo: 'Termos de Uso do Catelio',
  resumo: 'Finalidade e limites do jogo disponível na App Store e no Google Play. Documento em revisão.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    { id: 'estado', titulo: '1. Estado do projeto', blocos: [{ tipo: 'destaque', texto: AVISO }, { tipo: 'contato', rotulo: 'Contato', email: site.emailEstudio, assunto: 'Termos Catelio' }] },
    { id: 'finalidade', titulo: '2. Finalidade', blocos: [{ tipo: 'paragrafo', texto: 'Catelio é um jogo casual de exploração e entretenimento. Gatos, regiões, objetos e situações são ficcionais.' }, { tipo: 'destaque', texto: 'O jogo não oferece orientação sobre cuidados, alimentação ou saúde de animais reais.' }] },
    { id: 'uso', titulo: '3. Uso aceitável', blocos: [{ tipo: 'lista', itens: ['não tentar acessar recursos sem autorização;', 'não distribuir malware ou automatizar abuso;', 'não apresentar o jogo como canal oficial de terceiros.'] }] },
    { id: 'futuro', titulo: '4. Conta, compras e disponibilidade', blocos: [{ tipo: 'paragrafo', texto: 'Catelio está disponível na App Store e no Google Play. Condições de conta e compras devem ser verificadas na versão distribuída e na ficha da loja; esta seção aguarda revisão editorial e jurídica.' }] },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Termos do Catelio — Blajeen Labs',
  metaDescricao: 'Termos de uso do Catelio, jogo casual disponível na App Store e no Google Play. Documento em revisão.',
};

export const suporteCatelio: LegalDocument = {
  rota: ROTAS.catelioSuporte,
  kind: 'suporte',
  produto: 'Catelio',
  titulo: 'Suporte do Catelio',
  resumo: 'Canal para dúvidas e relatos sobre o jogo publicado.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    { id: 'estado', titulo: 'Estado atual', blocos: [{ tipo: 'destaque', texto: AVISO }, { tipo: 'paragrafo', texto: 'Em pedidos de ajuda, informe o aparelho, a versão do jogo e o que aconteceu, sem enviar informações pessoais desnecessárias.' }] },
    { id: 'canal', titulo: 'Canal de atendimento', blocos: [{ tipo: 'contato', rotulo: 'E-mail de suporte do Catelio', email: site.emailEstudio, assunto: 'Suporte Catelio' }] },
    { id: 'relato', titulo: 'Como relatar um problema', blocos: [{ tipo: 'passos', itens: ['O que você fez.', 'O que esperava que acontecesse.', 'O que aconteceu.', 'Aparelho e versão do jogo.', 'Captura sem dados pessoais, se necessário.'] }] },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Suporte do Catelio — Blajeen Labs',
  metaDescricao: 'Suporte do Catelio e informações sobre o estado do projeto.',
};

export const exclusaoCatelio: LegalDocument = {
  rota: ROTAS.catelioExclusao,
  kind: 'exclusao',
  produto: 'Catelio',
  titulo: 'Excluir sua conta do Catelio',
  resumo: 'Canal para pedidos relacionados à exclusão de dados do Catelio.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    { id: 'hoje', titulo: 'Versão publicada', blocos: [{ tipo: 'destaque', texto: AVISO }, { tipo: 'paragrafo', texto: 'Para solicitar informações ou exclusão de dados relacionados ao Catelio, use o contato abaixo. O procedimento específico da versão distribuída está em revisão.' }] },
    { id: 'futuro', titulo: 'Solicitação', blocos: [{ tipo: 'contato', rotulo: 'Dúvidas sobre dados do Catelio', email: site.emailEstudio, assunto: 'Exclusão Catelio' }] },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Excluir conta do Catelio — Blajeen Labs',
  metaDescricao: 'Página de exclusão de conta do Catelio e estado atual do projeto.',
};
