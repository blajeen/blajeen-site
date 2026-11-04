/** Extensões reais do laboratório; análise da loja não equivale a disponibilidade. */
export const extensoes = [
  {
    id: 'growlio', nome: 'Growlio', versao: '0.1.0',
    lema: 'Seu dia rende. Seu mundo cresce.',
    resumo: 'Pequenas tarefas fazem uma ilha evoluir. Metas pessoais, pausas rápidas e os últimos sete dias de progresso no navegador.',
    limite: 'A contagem de atividade é opcional e estimada. O histórico fica neste dispositivo por sete dias.',
    repositorio: 'https://github.com/blajeen/growlio',
    privacidade: 'https://github.com/blajeen/growlio/blob/main/PRIVACY.md',
    imagem: '/produtos/extensoes/growlio.webp',
    imagemAlt: 'Interface real do Growlio com ilha, tarefas concluídas e pausa rápida; dados de exemplo.',
    loja: 'aguarda-limite',
  },
  {
    id: 'findlio', nome: 'Findlio', versao: '0.1.0',
    lema: 'Uma busca. Todo o site.',
    resumo: 'Busque palavras nas páginas descobertas do site atual e encontre links, títulos e trechos sem sair da extensão.',
    limite: 'A busca fica no mesmo site e depende das páginas acessíveis. Não contorna login nem garante indexação completa.',
    repositorio: 'https://github.com/blajeen/Findlio',
    privacidade: 'https://github.com/blajeen/Findlio#privacidade-e-permissões',
    imagem: '/produtos/extensoes/findlio.webp',
    imagemAlt: 'Interface real do Findlio com resultado de busca em uma página local de teste.',
    loja: 'aguarda-limite',
  },
  {
    id: 'grammarlio', nome: 'Grammarlio', versao: '0.3.0',
    lema: 'Suas palavras, mais claras.',
    resumo: 'Revise ortografia e regras gramaticais em português e inglês direto nos campos dos sites. O painel também oferece reescrita com IA local opcional.',
    limite: 'Versão experimental. A gramática tem cobertura inicial e alguns editores não são compatíveis. A IA exige download e GPU com WebGPU.',
    repositorio: 'https://github.com/blajeen/Grammarlio',
    privacidade: 'https://github.com/blajeen/Grammarlio/blob/main/PRIVACY.md',
    imagem: '/produtos/extensoes/grammarlio.webp',
    imagemAlt: 'Correção direta do Grammarlio em campo de texto com frases de teste em português.',
    loja: 'aguarda-limite',
  },
  {
    id: 'taskelio', nome: 'Taskelio', versao: '0.1.0',
    lema: 'Seu trabalho, contado.',
    resumo: 'Crie regras por site para contar páginas abertas, cliques ou mudanças de campos. Acompanhe metas, histórico e relatórios locais.',
    limite: 'As regras dependem da estrutura de cada site. Cliques representam intenção, não confirmação de sucesso. O CSV é um relatório.',
    repositorio: 'https://github.com/blajeen/taskelio',
    privacidade: 'https://github.com/blajeen/taskelio#privacidade-e-limites',
    imagem: '/produtos/extensoes/taskelio.webp',
    imagemAlt: 'Painel real do Taskelio com metas e contadores fictícios de demonstração.',
    loja: 'em-analise',
  },
  {
    id: 'scopelio', nome: 'Scopelio', versao: '0.1.0',
    lema: 'Suas palavras. Suas cores. Mais clareza.',
    resumo: 'Destaque termos por cor, navegue pelas ocorrências e compare sua distribuição em um gráfico de rosca. Até 2.000 termos por filtro.',
    limite: 'O gráfico mostra correspondências de termos, não o significado ou a qualidade do texto. A análise ocorre nas páginas autorizadas.',
    repositorio: 'https://github.com/blajeen/Scopelio',
    privacidade: 'https://github.com/blajeen/Scopelio/blob/main/PRIVACY.md',
    imagem: '/produtos/extensoes/scopelio.webp',
    imagemAlt: 'Texto de demonstração com os destaques coloridos reais da Scopelio.',
    loja: 'em-analise',
  },
] as const;

export function estadoDaExtensao(loja: (typeof extensoes)[number]['loja']) {
  return loja === 'em-analise' ? 'Em análise na Chrome Web Store' : 'Instalação manual disponível';
}
