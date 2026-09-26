import { ROTAS } from '@/lib/routes';
import { site } from '../site';
import type { LegalDocument } from '../types';

/**
 * Textos do Docalio.
 *
 * Estado auditado em modo somente leitura, em 16/08/2026, a partir de
 * `C:\dev\docalio\docs\00-HANDOFF.md` e `docs\10-UI-UX-CONTA-LIGAS.md`:
 * o protótipo persiste tudo em armazenamento local do próprio aparelho; não existe conta,
 * nuvem, placar, backend nem build distribuído em loja.
 *
 * Os requisitos de produto listados como compromisso vêm de `docs/LEGAL_LOJAS_E_DADOS.md` §4.
 * Nenhum fluxo de conta é descrito como existente — descrever seria prometer comportamento
 * diferente do build, o que `CLAUDE.md` proíbe.
 */

const VERSAO = '26 de setembro de 2026';
const FONTE_DATA = 'Disponibilidade conferida na App Store; revisão do inventário de dados da versão distribuída ainda pendente.';

const relacionadosDocalio = [
  { href: ROTAS.projetoDocalio, rotulo: 'Sobre o Docalio' },
  { href: ROTAS.docalioSuporte, rotulo: 'Suporte do Docalio' },
  { href: ROTAS.docalioPrivacidade, rotulo: 'Privacidade do Docalio' },
  { href: ROTAS.docalioTermos, rotulo: 'Termos do Docalio' },
  { href: ROTAS.docalioExclusao, rotulo: 'Excluir conta do Docalio' },
] as const;

const AVISO_SEM_BUILD =
  'O Docalio está disponível na App Store. Esta documentação está em revisão para refletir integralmente a versão distribuída; informações antigas do protótipo não devem ser tomadas como descrição do aplicativo atual.';

export const privacidadeDocalio: LegalDocument = {
  rota: ROTAS.docalioPrivacidade,
  kind: 'privacidade',
  produto: 'Docalio',
  titulo: 'Política de Privacidade do Docalio',
  resumo: 'Privacidade do Docalio e canal para solicitações. Documento em revisão.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'estado',
      titulo: '1. Estado do projeto',
      blocos: [
        { tipo: 'destaque', texto: AVISO_SEM_BUILD },
        {
          tipo: 'paragrafo',
          texto:
            'Docalio é um jogo de simulação e aprendizagem com situações e personagens ficcionais. Não oferece diagnóstico, tratamento ou orientação para casos reais.',
        },
      ],
    },
    {
      id: 'hoje',
      titulo: '2. Versão distribuída',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O inventário de dados, permissões e prestadores da versão distribuída está em revisão. Para dúvidas ou solicitações relacionadas aos seus dados, use o contato abaixo.',
        },
        {
          tipo: 'paragrafo',
          texto: 'A navegação nesta página pertence ao site da Blajeen Labs e é coberta pela política geral do site.',
        },
      ],
    },
    {
      id: 'compromissos',
      titulo: '3. Revisão da versão publicada',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Esta seção será confrontada com o aplicativo distribuído e as declarações da App Store antes de informar categorias de dados, retenção ou compartilhamento.',
        },
      ],
    },
    {
      id: 'pacientes',
      titulo: '4. Dados de pacientes reais',
      blocos: [
        {
          tipo: 'destaque',
          texto:
            'Docalio não solicita dados reais de pacientes. Não insira nomes, prontuários, imagens, resultados de exames ou outras informações pessoais ou clínicas reais no jogo ou no suporte.',
        },
      ],
    },
    {
      id: 'prestadores',
      titulo: '5. Prestadores e compras',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'A compra no aplicativo usa a infraestrutura da loja e RevenueCat, conforme a documentação do jogo. Outros prestadores e o fluxo completo de dados ainda precisam ser conferidos na versão distribuída.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'A disponibilidade e as condições da compra são apresentadas na App Store e no próprio jogo.',
        },
      ],
    },
    {
      id: 'retencao',
      titulo: '6. Retenção, direitos e exclusão',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Para pedir informações ou exclusão de dados relacionados ao Docalio, use o contato abaixo. A descrição específica de retenção e exclusão da versão distribuída ainda está em revisão.',
        },
        {
          tipo: 'pendente',
          bloqueador: 'contaDocalio',
          explicacao:
            'O inventário de dados e os procedimentos da versão distribuída precisam de validação antes de serem descritos como definitivos.',
        },
        {
          tipo: 'pendente',
          bloqueador: 'titularNome',
          explicacao:
            'A identificação do controlador depende da escolha entre pessoa física e pessoa jurídica, comum a todos os produtos do estúdio.',
        },
        {
          tipo: 'contato',
          rotulo: 'Dúvidas e pedidos sobre dados do Docalio',
          email: site.emailDocalio,
          assunto: 'Privacidade Docalio',
        },
      ],
    },
  ],
  relacionados: [...relacionadosDocalio],
  metaTitulo: 'Privacidade do Docalio — Blajeen Labs',
  metaDescricao:
    'Privacidade do Docalio, disponível na App Store. Documento em revisão e canal de contato.',
};

export const termosDocalio: LegalDocument = {
  rota: ROTAS.docalioTermos,
  kind: 'termos',
  produto: 'Docalio',
  titulo: 'Termos de Uso do Docalio',
  resumo: 'Finalidade e limites do jogo publicado. Documento em revisão.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'estado',
      titulo: '1. Estado do projeto',
      blocos: [
        { tipo: 'destaque', texto: AVISO_SEM_BUILD },
        {
          tipo: 'pendente',
          bloqueador: 'titularNome',
          explicacao:
            'A identificação de quem disponibilizará o jogo depende da escolha entre pessoa física e pessoa jurídica.',
        },
        {
          tipo: 'contato',
          rotulo: 'Contato',
          email: site.emailDocalio,
          assunto: 'Termos de Uso — Docalio',
        },
      ],
    },
    {
      id: 'finalidade',
      titulo: '2. Finalidade',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Docalio é uma experiência de entretenimento e aprendizagem. Casos, personagens e resultados são ficcionais e existem para criar decisão, consequência e progressão dentro do jogo.',
        },
        {
          tipo: 'destaque',
          texto:
            'Este produto tem finalidade educacional e de entretenimento. Não substitui formação, supervisão profissional, protocolos oficiais, avaliação clínica nem decisão médica. Não use casos do jogo para diagnosticar ou tratar pessoas reais.',
        },
      ],
    },
    {
      id: 'uso',
      titulo: '3. Uso responsável',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'não inserir dados reais de pacientes, prontuários ou informações confidenciais;',
            'não apresentar o jogo como serviço de saúde, protocolo clínico ou material oficial;',
            'não tentar acessar contas, dados ou recursos sem autorização;',
            'não distribuir malware, automatizar abuso ou degradar o serviço.',
          ],
        },
      ],
    },
    {
      id: 'propriedade',
      titulo: '4. Propriedade intelectual',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Código próprio, marca, identidade visual, personagens, narrativa e áudios originais são protegidos, ressalvados materiais e licenças de terceiros usados sob suas próprias condições.',
        },
      ],
    },
    {
      id: 'compras',
      titulo: '5. Conta, compras e disponibilidade',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Docalio está disponível na App Store e oferece uma compra opcional no aplicativo. As condições da oferta aparecem na loja e no jogo; esta seção aguarda revisão editorial e jurídica da versão distribuída.',
        },
        {
          tipo: 'pendente',
          bloqueador: 'contaDocalio',
          explicacao:
            'Conta, nuvem e telemetria da versão distribuída ainda precisam ser conferidas antes de serem descritas aqui.',
        },
      ],
    },
    {
      id: 'lei',
      titulo: '6. Lei aplicável',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Aplicam-se as leis da República Federativa do Brasil, sem prejuízo das normas obrigatórias do local da pessoa usuária.',
        },
        {
          tipo: 'pendente',
          bloqueador: 'foroJuridico',
          explicacao: 'O foro ou método de resolução de conflitos depende de validação jurídica.',
        },
      ],
    },
  ],
  relacionados: [...relacionadosDocalio],
  metaTitulo: 'Termos do Docalio — Blajeen Labs',
  metaDescricao: 'Termos de uso do Docalio, jogo de estratégia médica ficcional disponível na App Store.',
};

export const suporteDocalio: LegalDocument = {
  rota: ROTAS.docalioSuporte,
  kind: 'suporte',
  produto: 'Docalio',
  titulo: 'Suporte do Docalio',
  resumo: 'Suporte do Docalio publicado na App Store.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'estado',
      titulo: 'Estado atual',
      blocos: [
        { tipo: 'destaque', texto: AVISO_SEM_BUILD },
        {
          tipo: 'paragrafo',
          texto:
            'Em pedidos de ajuda, informe aparelho, versão do jogo e o que aconteceu, sem enviar dados reais de pacientes ou informações pessoais desnecessárias.',
        },
      ],
    },
    {
      id: 'canal',
      titulo: 'Canal de atendimento',
      blocos: [
        {
          tipo: 'contato',
          rotulo: 'E-mail de suporte do Docalio',
          email: site.emailDocalio,
          assunto: 'Suporte Docalio',
        },
        {
          tipo: 'paragrafo',
          texto:
            'O mesmo endereço atende dúvidas de privacidade e pedidos relacionados a dados do jogo.',
        },
      ],
    },
    {
      id: 'nao-enviar',
      titulo: 'O que nunca enviar',
      blocos: [
        {
          tipo: 'destaque',
          texto:
            'Não envie dados reais de pacientes, prontuários, imagens clínicas ou resultados de exames. O Docalio trabalha apenas com casos ficcionais.',
        },
      ],
    },
  ],
  relacionados: [...relacionadosDocalio],
  metaTitulo: 'Suporte do Docalio — Blajeen Labs',
  metaDescricao: 'Canal de suporte do Docalio, disponível na App Store.',
};

export const exclusaoDocalio: LegalDocument = {
  rota: ROTAS.docalioExclusao,
  kind: 'exclusao',
  produto: 'Docalio',
  titulo: 'Excluir sua conta do Docalio',
  resumo: 'Canal para pedidos relacionados à exclusão de dados do Docalio.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'hoje',
      titulo: 'Versão publicada',
      blocos: [
        { tipo: 'destaque', texto: AVISO_SEM_BUILD },
        {
          tipo: 'paragrafo',
          texto:
            'Para solicitar informações ou exclusão de dados relacionados ao Docalio, use o contato abaixo. O procedimento específico da versão distribuída está em revisão.',
        },
      ],
    },
    {
      id: 'quando-existir',
      titulo: 'Como solicitar',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Descreva sua solicitação ao canal abaixo. Para localizarmos seus dados, informe apenas os identificadores que o suporte solicitar; nunca envie dados de pacientes reais.',
        },
        {
          tipo: 'pendente',
          bloqueador: 'contaDocalio',
          explicacao:
            'O procedimento e as categorias de dados da versão distribuída precisam ser validados antes de constarem como definitivos nesta página.',
        },
        {
          tipo: 'contato',
          rotulo: 'Dúvidas sobre dados do Docalio',
          email: site.emailDocalio,
          assunto: 'Exclusão de dados Docalio',
        },
      ],
    },
    {
      id: 'assinatura',
      titulo: 'Compras',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Compras no aplicativo são geridas pela loja. Para dúvidas sobre restauração ou reembolso, entre em contato com o suporte e consulte as regras da App Store.',
        },
      ],
    },
  ],
  relacionados: [...relacionadosDocalio],
  metaTitulo: 'Excluir conta do Docalio — Blajeen Labs',
  metaDescricao:
    'Canal público para pedidos relacionados à exclusão de dados do Docalio.',
};
