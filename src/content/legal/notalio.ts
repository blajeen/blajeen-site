import { ROTAS } from '@/lib/routes';
import { site } from '../site';
import type { LegalDocument } from '../types';

/**
 * Documentos legais do Notalio.
 *
 * Diferente dos jogos, o programa está publicado e o que ele faz com os dados da pessoa
 * é verificável hoje. O texto afirma em vez de prometer, e afirma pouco — porque
 * tratamento de dado é o que não acontece.
 *
 * A ausência de controlador não é omissão. Sem coleta de dado pessoal não há operação de
 * tratamento, e nomear um controlador para uma relação que não existe seria inventar
 * responsabilidade jurídica onde não há fato. *
 * Marcados como versão de trabalho, como todos os outros documentos legais do site.
 * O conteúdo aqui é fato verificável — não existe rede no programa, e dá pra conferir
 * abrindo o código —, mas a revisão jurídica do titular continua em aberto, e é o teste
 * `se declara versão de trabalho enquanto houver revisão jurídica pendente` que segura
 * isso. Quando ele ler e aprovar, é trocar `preparacao` por `publicado` aqui e ajustar
 * aquele teste. Não sou eu que decido que a revisão dele aconteceu.
 */

const VERSAO = '6 de setembro de 2026';
const FONTE_DATA = 'Escrito a partir do código publicado do Notalio 0.1.0.';

const relacionados = [
  { href: ROTAS.produtoNotalio, rotulo: 'Sobre o Notalio' },
  { href: ROTAS.notalioSuporte, rotulo: 'Suporte do Notalio' },
  { href: ROTAS.notalioPrivacidade, rotulo: 'Privacidade do Notalio' },
  { href: ROTAS.notalioTermos, rotulo: 'Termos do Notalio' },
  { href: ROTAS.contato, rotulo: 'Contato do estúdio' },
] as const;

export const privacidadeNotalio: LegalDocument = {
  rota: ROTAS.notalioPrivacidade,
  kind: 'privacidade',
  produto: 'Notalio',
  titulo: 'Privacidade do Notalio',
  resumo: 'O programa não coleta nada, não envia nada e não tem conta.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'resumo',
      titulo: '1. Em uma frase',
      blocos: [
        {
          tipo: 'destaque',
          texto:
            'O Notalio não coleta, não guarda e não envia nenhum dado seu. Ele não tem conta, não tem cadastro e não fala com servidor nenhum — nem nosso, nem de terceiro.',
        },
      ],
    },
    {
      id: 'internet',
      titulo: '2. Ele não usa a internet',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Não existe uma linha de rede no programa. Ele não tem biblioteca de rede embutida, não abre conexão, não busca atualização e não envia relatório de erro. Depois de instalado, funciona igual com o computador desconectado.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Isso quer dizer que não há como o que você escreve sair da sua máquina por meio dele — não por promessa nossa, mas porque o caminho não existe.',
        },
      ],
    },
    {
      id: 'arquivos',
      titulo: '3. O que ele grava, e onde',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O que você escreve é gravado em arquivos comuns dentro da sua pasta Documentos, em uma pasta chamada Notalio: um arquivo de texto, um de tabela e uma pasta com as versões anteriores. Eles são seus, ficam no seu computador e abrem em qualquer programa.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'O programa também guarda as suas preferências — tema, idioma, divisão da folha e cor da letra. São ajustes de aparência, não informação sobre você.',
        },
        {
          tipo: 'destaque',
          texto:
            'Se você puser senha na gaveta, a chave não é guardada em lugar nenhum: ela existe na memória enquanto a gaveta está aberta e some quando ela fecha. Não existe recuperação, e isso está escrito dentro do programa antes de você escolher.',
        },
      ],
    },
    {
      id: 'terceiros',
      titulo: '4. Terceiros, anúncio e medição',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'não há anúncio de nenhum tipo;',
            'não há medição de uso, contagem de sessão nem identificador de aparelho;',
            'não há serviço de terceiro embutido;',
            'nada é vendido nem compartilhado, porque nada é coletado.',
          ],
        },
        {
          tipo: 'paragrafo',
          texto:
            'Se você instalar pela Microsoft Store, a própria loja mede a instalação do jeito dela e sob a política dela. Isso acontece fora do programa e nós não recebemos dado individual de ninguém.',
        },
      ],
    },
    {
      id: 'crianca',
      titulo: '5. Crianças',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O Notalio não é dirigido a crianças e não pede idade, porque não pede nada. Como não há coleta, não há dado de criança a proteger.',
        },
      ],
    },
    {
      id: 'apagar',
      titulo: '6. Como apagar tudo',
      blocos: [
        {
          tipo: 'passos',
          itens: [
            'Apague a pasta Notalio dentro dos seus Documentos: ali está tudo o que você escreveu.',
            'Desinstale o programa pelo "Adicionar ou remover programas" do Windows.',
            'Pronto. Não existe conta nossa a encerrar nem pedido a fazer, porque não temos nada seu.',
          ],
        },
      ],
    },
    {
      id: 'mudanca',
      titulo: '7. Se isto mudar',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Uma versão futura que passe a usar a internet por qualquer motivo terá esta página atualizada antes de ser publicada, e a mudança será dita na página do produto. Um programa que muda o que faz com os seus dados sem avisar não merece confiança, mesmo quando a mudança é pequena.',
        },
      ],
    },
    {
      id: 'contato',
      titulo: '8. Dúvidas',
      blocos: [
        {
          tipo: 'contato',
          rotulo: 'Privacidade do Notalio',
          email: site.emailEstudio,
          assunto: 'Privacidade Notalio',
        },
      ],
    },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Privacidade do Notalio — Blajeen Labs',
  metaDescricao:
    'O Notalio não coleta, não envia e não guarda dado nenhum: não existe rede no programa. Onde ficam os seus arquivos e como apagar tudo.',
};

export const termosNotalio: LegalDocument = {
  rota: ROTAS.notalioTermos,
  kind: 'termos',
  produto: 'Notalio',
  titulo: 'Termos de Uso do Notalio',
  resumo: 'Para que serve, o que é seu, e o que não prometemos.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'oque',
      titulo: '1. O que é',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O Notalio é um bloco de notas para Windows, gratuito. Não tem versão paga, função trancada, assinatura nem compra dentro do programa.',
        },
      ],
    },
    {
      id: 'seu',
      titulo: '2. O que você escreve é seu',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Não reivindicamos nenhum direito sobre o que você escreve. Os arquivos ficam no seu computador, em formato comum, e continuam funcionando sem o Notalio.',
        },
      ],
    },
    {
      id: 'licenca',
      titulo: '3. Licença de uso',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Os binários são distribuídos sob a licença MIT. Você pode usar no computador que quiser, inclusive comercialmente, e pode redistribuir o arquivo como recebeu.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'O nome "Notalio" e o desenho do mascote não estão na licença: eles identificam o produto e não podem ser usados para apresentar outro programa como se fosse este.',
        },
      ],
    },
    {
      id: 'garantia',
      titulo: '4. Sem garantia, e o que isso quer dizer',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O programa é fornecido como está, sem garantia. Ele grava sozinho sete décimos de segundo depois que você para de digitar; se faltar luz nesse intervalo, as últimas palavras não chegaram ao disco. Esse limite está medido, está escrito dentro do programa e não é defeito escondido.',
        },
        {
          tipo: 'destaque',
          texto:
            'A gaveta com senha não tem recuperação. Se você esquecer a senha, o conteúdo não volta — não existe segunda chave, nem conosco.',
        },
      ],
    },
    {
      id: 'uso',
      titulo: '5. Uso aceitável',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'não redistribuir o programa alterado apresentando-o como oficial;',
            'não usar o nome ou o mascote para se passar pelo estúdio;',
            'não distribuir o arquivo junto de outro programa sem dizer que está fazendo isso.',
          ],
        },
      ],
    },
    {
      id: 'contato',
      titulo: '6. Contato',
      blocos: [
        {
          tipo: 'contato',
          rotulo: 'Termos do Notalio',
          email: site.emailEstudio,
          assunto: 'Termos Notalio',
        },
      ],
    },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Termos do Notalio — Blajeen Labs',
  metaDescricao: 'Termos de uso do Notalio: licença MIT, o que você escreve é seu, e os limites declarados.',
};

export const suporteNotalio: LegalDocument = {
  rota: ROTAS.notalioSuporte,
  kind: 'suporte',
  produto: 'Notalio',
  titulo: 'Suporte do Notalio',
  resumo: 'Onde pedir ajuda, e o que contar para a ajuda ser rápida.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'canal',
      titulo: 'Onde falar com a gente',
      blocos: [
        {
          tipo: 'contato',
          rotulo: 'E-mail de suporte do Notalio',
          email: site.emailEstudio,
          assunto: 'Suporte Notalio',
        },
      ],
    },
    {
      id: 'antes',
      titulo: 'Antes de escrever, duas coisas resolvem quase tudo',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'Perdeu o que escreveu? Olhe em "versões" dentro do programa: ele guarda até 100 versões anteriores de cada caderno, e a pasta "Versões anteriores" fica ao lado dos seus arquivos, em Documentos.',
            'Alguma coisa ficou estranha na tela? Na aba "sobre" tem "voltar ao padrão de fábrica": devolve tema, idioma, divisão e cor sem encostar em nenhuma palavra escrita.',
          ],
        },
      ],
    },
    {
      id: 'relato',
      titulo: 'O que contar',
      blocos: [
        {
          tipo: 'passos',
          itens: [
            'O que você fez.',
            'O que esperava que acontecesse.',
            'O que aconteceu.',
            'Sua versão do Windows e a versão do Notalio, que aparece na aba "sobre".',
            'Uma foto da tela, se ajudar — o próprio programa tem um botão de câmera que salva na Área de trabalho.',
          ],
        },
        {
          tipo: 'destaque',
          texto:
            'Não mande a sua nota junto se ela tiver algo pessoal. Quase sempre o que você fez já basta para a gente reproduzir aqui.',
        },
      ],
    },
    {
      id: 'senha',
      titulo: 'Senha da gaveta',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Não conseguimos abrir uma gaveta trancada, nem recuperar a senha. Isso não é política de atendimento: a chave nunca sai do seu computador e não existe segunda chave em lugar nenhum. É o preço de a tranca ser de verdade.',
        },
      ],
    },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Suporte do Notalio — Blajeen Labs',
  metaDescricao: 'Suporte do Notalio: onde pedir ajuda, como recuperar versões anteriores e o que contar.',
};
