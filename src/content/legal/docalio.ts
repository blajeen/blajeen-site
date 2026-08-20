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

const VERSAO = '16 de agosto de 2026';
const FONTE_DATA = 'Data de redação desta versão de trabalho, após auditoria do repositório do Docalio.';

const relacionadosDocalio = [
  { href: ROTAS.projetoDocalio, rotulo: 'Sobre o Docalio' },
  { href: ROTAS.docalioSuporte, rotulo: 'Suporte do Docalio' },
  { href: ROTAS.docalioPrivacidade, rotulo: 'Privacidade do Docalio' },
  { href: ROTAS.docalioTermos, rotulo: 'Termos do Docalio' },
  { href: ROTAS.docalioExclusao, rotulo: 'Excluir conta do Docalio' },
] as const;

const AVISO_SEM_BUILD =
  'O Docalio está em desenvolvimento e ainda não foi distribuído em nenhuma loja. Este documento descreve o estado atual do projeto e os compromissos assumidos para o primeiro build público; ele será substituído pela versão definitiva quando esse build existir e for auditado.';

export const privacidadeDocalio: LegalDocument = {
  rota: ROTAS.docalioPrivacidade,
  kind: 'privacidade',
  produto: 'Docalio',
  titulo: 'Política de Privacidade do Docalio',
  resumo: 'O que o Docalio trata hoje, o que ainda não existe e o que já está decidido para quando existir.',
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
      titulo: '2. O que o projeto trata hoje',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Na versão em desenvolvimento, o jogo guarda progresso, preferências, escolhas da partida, inventário e cosméticos no armazenamento local do próprio aparelho.',
        },
        {
          tipo: 'lista',
          itens: [
            'não existe conta, cadastro ou login;',
            'não existe servidor, nuvem, placar ou ranking on-line;',
            'nenhum dado da partida é enviado para fora do aparelho;',
            'não há anúncios, rastreamento publicitário ou venda de dados.',
          ],
        },
      ],
    },
    {
      id: 'compromissos',
      titulo: '3. Compromissos para o primeiro build público',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Estes requisitos foram fixados antes da implementação. Se o código divergir de qualquer um deles, esta política e os formulários das lojas mudam antes do envio:',
        },
        {
          tipo: 'lista',
          itens: [
            'jogar localmente sem conta sempre que tecnicamente possível;',
            'conta opcional por e-mail ou provedor aprovado, nunca obrigatória para jogar;',
            'sincronizar apenas progresso, inventário, decisões ficcionais e estado do jogo necessários;',
            'proibir entrada e envio de nome, prontuário, imagem ou qualquer dado de paciente real;',
            'não usar dados de saúde do aparelho, HealthKit ou Health Connect na versão inicial;',
            'não solicitar localização, contatos, câmera ou microfone sem função documentada;',
            'sem anúncios comportamentais ou venda de dados;',
            'compras digitais somente pelos mecanismos das lojas;',
            'exclusão de conta e dados dentro do jogo e por URL pública;',
            'casos, personagens e resultados declarados como ficcionais e educacionais.',
          ],
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
            'Nenhum prestador processa dados do Docalio hoje, porque nada sai do aparelho. Quando existir build distribuído, a lista efetiva de autenticação, banco, relatório de falhas, hospedagem, lojas e serviço de compras será publicada aqui após auditoria do ambiente de produção.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Compras digitais, se existirem, serão processadas pela App Store ou pelo Google Play; o Docalio não receberá o número completo do cartão.',
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
            'Enquanto todos os dados forem locais, apagar os dados do aplicativo ou desinstalá-lo remove o que existe. Não há cópia remota a solicitar.',
        },
        {
          tipo: 'pendente',
          bloqueador: 'contaDocalio',
          explicacao:
            'Conta, nuvem, compras e telemetria ainda não foram decididas para o Docalio. Enquanto essa decisão não existir, esta política não pode descrever fluxo de conta, prazo de retenção ou compartilhamento como se já funcionassem.',
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
    'Política de privacidade do Docalio: estado atual do projeto, dados locais e compromissos para o primeiro build público.',
};

export const termosDocalio: LegalDocument = {
  rota: ROTAS.docalioTermos,
  kind: 'termos',
  produto: 'Docalio',
  titulo: 'Termos de Uso do Docalio',
  resumo: 'Finalidade, limites e regras de uso do jogo em desenvolvimento.',
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
            'Não existe conta, assinatura ou compra no projeto atual. Se qualquer um desses recursos for implementado, estes termos passarão a informar preço, renovação, cancelamento, restauração e reembolso antes de a funcionalidade ficar disponível.',
        },
        {
          tipo: 'pendente',
          bloqueador: 'contaDocalio',
          explicacao:
            'A decisão sobre conta, nuvem, compras e telemetria ainda não foi tomada; ela define quais cláusulas desta seção passam a existir.',
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
  metaDescricao: 'Termos de uso do Docalio, jogo de simulação médica ficcional em desenvolvimento.',
};

export const suporteDocalio: LegalDocument = {
  rota: ROTAS.docalioSuporte,
  kind: 'suporte',
  produto: 'Docalio',
  titulo: 'Suporte do Docalio',
  resumo: 'O que existe hoje e o que será publicado junto com o primeiro build.',
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
            'Como não há build distribuído, não existe instalação a recuperar, conta a restaurar, compra a reembolsar ou progresso salvo em servidor.',
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
            'Quando o canal existir, não envie dados reais de pacientes, prontuários, imagens clínicas ou resultados de exames. O Docalio trabalha apenas com casos ficcionais.',
        },
      ],
    },
  ],
  relacionados: [...relacionadosDocalio],
  metaTitulo: 'Suporte do Docalio — Blajeen Labs',
  metaDescricao: 'Estado do suporte do Docalio, jogo em desenvolvimento na Blajeen Labs.',
};

export const exclusaoDocalio: LegalDocument = {
  rota: ROTAS.docalioExclusao,
  kind: 'exclusao',
  produto: 'Docalio',
  titulo: 'Excluir sua conta do Docalio',
  resumo: 'Como os dados do Docalio são apagados hoje e como serão apagados quando existir conta.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'hoje',
      titulo: 'Hoje não existe conta a excluir',
      blocos: [
        { tipo: 'destaque', texto: AVISO_SEM_BUILD },
        {
          tipo: 'paragrafo',
          texto:
            'A versão em desenvolvimento não cria conta e não envia nada para servidores. Todo o progresso fica no armazenamento local do aparelho, e apagar os dados do aplicativo ou desinstalá-lo remove tudo o que existe.',
        },
      ],
    },
    {
      id: 'quando-existir',
      titulo: 'Quando a conta existir',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'A criação de conta só será habilitada depois que a exclusão dentro do jogo estiver implementada e testada. Esta página passará a descrever, com o comportamento real do build:',
        },
        {
          tipo: 'lista',
          itens: [
            'o caminho exato de exclusão dentro do jogo;',
            'como pedir a exclusão sem acesso ao jogo;',
            'como a identidade da pessoa é confirmada;',
            'quais categorias de dados são apagadas e quais são retidas por obrigação legal;',
            'o prazo de conclusão do pedido;',
            'o canal de contato para acompanhar o pedido.',
          ],
        },
        {
          tipo: 'pendente',
          bloqueador: 'contaDocalio',
          explicacao:
            'Descrever agora um caminho de menu que não existe no jogo criaria uma instrução falsa para quem precisar apagar dados — exatamente o que a exigência de exclusão de conta do Google Play pretende evitar.',
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
            'Não existem compras no Docalio. Se existirem, excluir a conta não cancelará assinatura administrada pela loja: o cancelamento será feito diretamente na App Store ou no Google Play.',
        },
      ],
    },
  ],
  relacionados: [...relacionadosDocalio],
  metaTitulo: 'Excluir conta do Docalio — Blajeen Labs',
  metaDescricao:
    'Página pública de exclusão de dados do Docalio: estado atual do projeto e o processo previsto quando houver conta.',
};
