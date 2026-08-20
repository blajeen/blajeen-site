import { ROTAS } from '@/lib/routes';
import { site } from '../site';
import type { LegalDocument } from '../types';

/**
 * Textos do Gramelio.
 *
 * Estado verificado em 19/08/2026: `C:\dev\gramelio` contém somente arte. Não há build, código,
 * pacote, backend nem ficha de loja — este é o produto mais cedo dos três, e os documentos
 * precisam dizer isso com todas as letras.
 *
 * A diferença para o Docalio é deliberada: lá existe um protótipo jogável com save local, e a
 * política pode descrever o que ele guarda. Aqui não existe aplicativo, então nada é descrito como
 * comportamento — apenas o estado do projeto e os compromissos fixados antes da implementação,
 * conforme `docs/LEGAL_LOJAS_E_DADOS.md`.
 */

const VERSAO = '20 de agosto de 2026';
const FONTE_DATA = 'Data desta versão de trabalho, revisada quando o canal do jogo foi confirmado.';

const relacionadosGramelio = [
  { href: ROTAS.projetoGramelio, rotulo: 'Sobre o Gramelio' },
  { href: ROTAS.gramelioSuporte, rotulo: 'Suporte do Gramelio' },
  { href: ROTAS.gramelioPrivacidade, rotulo: 'Privacidade do Gramelio' },
  { href: ROTAS.gramelioTermos, rotulo: 'Termos do Gramelio' },
  { href: ROTAS.gramelioExclusao, rotulo: 'Excluir conta do Gramelio' },
  { href: ROTAS.contato, rotulo: 'Contato do estúdio' },
] as const;

const AVISO_SEM_BUILD =
  'O Gramelio está em desenvolvimento e não foi distribuído em nenhuma loja. Não existe aplicativo público, build de teste ou ficha de loja. Este documento descreve o estado do projeto e os compromissos assumidos para o primeiro build público; ele será substituído pela versão definitiva quando esse build existir e for auditado.';

export const privacidadeGramelio: LegalDocument = {
  rota: ROTAS.gramelioPrivacidade,
  kind: 'privacidade',
  produto: 'Gramelio',
  titulo: 'Política de Privacidade do Gramelio',
  resumo:
    'O Gramelio ainda não existe como aplicativo. Esta página diz o que isso significa hoje e o que já está decidido para quando o primeiro build existir.',
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
            'Gramelio é um jogo casual de fazenda, com animais, mapas e missões ficcionais. Ele é feito para entreter.',
        },
      ],
    },
    {
      id: 'hoje',
      titulo: '2. O que é tratado hoje',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Nada. Não existe aplicativo instalado em nenhum aparelho, não existe conta, não existe servidor e não há dado de pessoa alguma sendo tratado em nome deste jogo.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Se você chegou até aqui, está lendo uma página deste site — e o tratamento de dados da navegação está descrito na política do site, não nesta.',
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
            'jogar sem conta e sem cadastro sempre que tecnicamente possível;',
            'conta opcional, nunca obrigatória para jogar;',
            'sincronizar apenas progresso, cosméticos e estado do jogo, se houver sincronização;',
            'não solicitar localização, contatos, câmera, microfone ou identificadores de publicidade sem função documentada;',
            'sem anúncios comportamentais e sem venda de dados;',
            'compras digitais, se existirem, somente pelos mecanismos das lojas;',
            'exclusão de conta e dados dentro do jogo e por URL pública;',
            'definir e declarar o público-alvo antes do envio, cumprindo as regras de aplicativos para famílias das lojas se o jogo for direcionado também a crianças.',
          ],
        },
        {
          tipo: 'destaque',
          texto:
            'O último item não é formalidade. Um jogo de fazenda com desenho fofo atrai público infantil, e isso muda declarações, anúncios, análise de dados e classificação nas duas lojas.',
        },
      ],
    },
    {
      id: 'direitos',
      titulo: '4. Retenção, direitos e exclusão',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Não existe dado guardado a pedir, corrigir ou apagar, porque não existe aplicativo distribuído. Quando existir, esta seção passará a descrever categorias de dados, prazos e o caminho de exclusão, com o comportamento real do build.',
        },
        {
          tipo: 'pendente',
          bloqueador: 'escopoGramelio',
          explicacao:
            'Conta, nuvem, compras e telemetria ainda não foram decididas para o Gramelio. Descrever qualquer uma delas agora seria prometer comportamento de um aplicativo que ainda não foi escrito.',
        },
        {
          tipo: 'pendente',
          bloqueador: 'titularNome',
          explicacao:
            'A identificação do controlador depende da escolha entre pessoa física e pessoa jurídica, comum a todos os produtos do estúdio.',
        },
        {
          tipo: 'contato',
          rotulo: 'Dúvidas e pedidos sobre dados do Gramelio',
          email: site.emailGramelio,
          assunto: 'Privacidade Gramelio',
        },
      ],
    },
  ],
  relacionados: [...relacionadosGramelio],
  metaTitulo: 'Privacidade do Gramelio — Blajeen Labs',
  metaDescricao:
    'Política de privacidade do Gramelio: o jogo está em desenvolvimento, não trata dados hoje, e estes são os compromissos para o primeiro build público.',
};

export const termosGramelio: LegalDocument = {
  rota: ROTAS.gramelioTermos,
  kind: 'termos',
  produto: 'Gramelio',
  titulo: 'Termos de Uso do Gramelio',
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
          email: site.emailGramelio,
          assunto: 'Termos de Uso — Gramelio',
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
            'Gramelio é um jogo casual de entretenimento. Fazendas, animais, missões e resultados são ficcionais e existem para criar decisão, ritmo e progressão dentro do jogo.',
        },
        {
          tipo: 'destaque',
          texto:
            'Nada no jogo é orientação de criação, manejo, alimentação ou cuidado de animais reais, nem descrição de produção agropecuária real.',
        },
      ],
    },
    {
      id: 'uso',
      titulo: '3. Uso aceitável',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'não tentar acessar contas, dados ou recursos sem autorização;',
            'não distribuir malware, automatizar abuso ou degradar o serviço;',
            'não apresentar o jogo como canal oficial de terceiros.',
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
            'Código próprio, marca, identidade visual, personagens, arte e áudios originais são protegidos, ressalvados materiais e licenças de terceiros usados sob suas próprias condições.',
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
            'Não existe conta, assinatura ou compra no projeto atual. A loja de cosméticos faz parte do desenho do jogo, e nada nela está implementado, precificado ou disponível.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Se compras forem implementadas, estes termos passarão a informar preço, moeda virtual, renovação, cancelamento, restauração e reembolso antes de a funcionalidade ficar disponível.',
        },
        {
          tipo: 'pendente',
          bloqueador: 'escopoGramelio',
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
  relacionados: [...relacionadosGramelio],
  metaTitulo: 'Termos do Gramelio — Blajeen Labs',
  metaDescricao: 'Termos de uso do Gramelio, jogo casual de fazenda em desenvolvimento na Blajeen Labs.',
};

export const suporteGramelio: LegalDocument = {
  rota: ROTAS.gramelioSuporte,
  kind: 'suporte',
  produto: 'Gramelio',
  titulo: 'Suporte do Gramelio',
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
            'Como não há build distribuído, não existe instalação a recuperar, conta a restaurar, compra a reembolsar ou progresso salvo a devolver.',
        },
      ],
    },
    {
      id: 'canal',
      titulo: 'Canal de atendimento',
      blocos: [
        {
          tipo: 'contato',
          rotulo: 'E-mail de suporte do Gramelio',
          email: site.emailGramelio,
          assunto: 'Suporte Gramelio',
        },
        {
          tipo: 'paragrafo',
          texto:
            'O mesmo endereço atende dúvidas de privacidade e pedidos relacionados a dados do jogo.',
        },
      ],
    },
    {
      id: 'quando-existir',
      titulo: 'Quando o jogo existir',
      blocos: [
        {
          tipo: 'paragrafo',
          texto: 'Um bom relato de problema em jogo costuma ter cinco coisas:',
        },
        {
          tipo: 'passos',
          itens: [
            'O que você fez, na ordem em que fez.',
            'O que você esperava que acontecesse.',
            'O que aconteceu no lugar.',
            'Aparelho, sistema operacional e versão do jogo.',
            'Uma captura de tela ou vídeo curto, se não contiver informação pessoal.',
          ],
        },
      ],
    },
  ],
  relacionados: [...relacionadosGramelio],
  metaTitulo: 'Suporte do Gramelio — Blajeen Labs',
  metaDescricao: 'Estado do suporte do Gramelio, jogo casual em desenvolvimento na Blajeen Labs.',
};

export const exclusaoGramelio: LegalDocument = {
  rota: ROTAS.gramelioExclusao,
  kind: 'exclusao',
  produto: 'Gramelio',
  titulo: 'Excluir sua conta do Gramelio',
  resumo: 'Por que hoje não existe conta a excluir e como a exclusão funcionará quando existir.',
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
            'O jogo não foi distribuído, não cria conta e não envia nada para servidores. Não há cópia de dados a solicitar nem cadastro a encerrar.',
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
          bloqueador: 'escopoGramelio',
          explicacao:
            'Descrever agora um caminho de menu que não existe no jogo criaria uma instrução falsa para quem precisar apagar dados — exatamente o que a exigência de exclusão de conta do Google Play pretende evitar.',
        },
        {
          tipo: 'contato',
          rotulo: 'Dúvidas sobre dados do Gramelio',
          email: site.emailGramelio,
          assunto: 'Exclusão de dados Gramelio',
        },
      ],
    },
    {
      id: 'compras',
      titulo: 'Compras',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Não existem compras no Gramelio. Se existirem, excluir a conta não cancelará assinatura administrada pela loja: o cancelamento será feito diretamente na App Store ou no Google Play.',
        },
      ],
    },
  ],
  relacionados: [...relacionadosGramelio],
  metaTitulo: 'Excluir conta do Gramelio — Blajeen Labs',
  metaDescricao:
    'Página pública de exclusão de dados do Gramelio: estado atual do projeto e o processo previsto quando houver conta.',
};
