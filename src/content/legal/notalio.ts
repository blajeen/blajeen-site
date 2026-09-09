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
 * A POLÍTICA DE PRIVACIDADE está publicada. O titular leu e aprovou o texto em
 * 07/09/2026, para o envio à App Store — a Apple abre a URL durante a análise, e uma
 * página que se declara rascunho é motivo de recusa.
 *
 * Os TERMOS e o SUPORTE continuam como versão de trabalho, e o teste
 * `só publica documento que o titular aprovou` segura isso: publicar mais algum exige
 * editar a lista daquele teste, de propósito. Não sou eu que decido que a revisão
 * aconteceu.
 */

const VERSAO = '7 de setembro de 2026';
const FONTE_DATA = 'Escrito a partir do código publicado do Notalio 0.2.0.';

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
  titulo: 'Política de privacidade — Notalio',
  resumo: 'O Notalio não coleta nada.',
  /*
   * Aprovado pelo titular em 07/09/2026, para o envio à App Store. O texto abaixo é o
   * que ele revisou, palavra por palavra — as seções aqui só dão forma de página ao que
   * ele escreveu, sem acrescentar nem tirar afirmação nenhuma.
   */
  estado: 'publicado',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'resumo',
      titulo: 'O Notalio não coleta nada',
      blocos: [
        {
          tipo: 'destaque',
          texto:
            'Não é uma promessa de intenção: não existe uma única linha de código de rede no programa. Ele não tem como enviar dado nenhum para lugar nenhum, nem se quisesse.',
        },
      ],
    },
    {
      id: 'no-aparelho',
      titulo: 'O que fica no seu aparelho',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Tudo. O que você escreve é gravado em arquivos comuns — .txt, .csv e .md — dentro da pasta do Notalio no seu aparelho. Esses arquivos são seus, ficam visíveis no aplicativo Arquivos, e podem ser abertos, copiados ou apagados por você a qualquer momento, com ou sem o Notalio instalado.',
        },
      ],
    },
    {
      id: 'nao-existe',
      titulo: 'O que não existe',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'Não há conta, cadastro nem login.',
            'Não há servidor, nuvem nem sincronização.',
            'Não há anúncio, rastreador nem ferramenta de análise de uso.',
            'Não há contagem de quantas vezes você abriu o programa.',
            'Não há notificação nem pedido de avaliação.',
          ],
        },
      ],
    },
    {
      id: 'gaveta',
      titulo: 'A gaveta com senha',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O Notalio permite proteger uma anotação com senha. A chave é derivada da sua senha com Argon2id e o conteúdo é fechado com XChaCha20-Poly1305, tudo dentro do seu aparelho. A senha não é guardada em lugar nenhum e não é transmitida para lugar nenhum.',
        },
        {
          tipo: 'destaque',
          texto:
            'Como consequência, não existe recuperação: se a senha for esquecida, o conteúdo é perdido, e nem a Blajeen Labs pode abri-lo.',
        },
      ],
    },
    {
      id: 'criancas',
      titulo: 'Crianças',
      blocos: [
        {
          tipo: 'paragrafo',
          texto: 'O Notalio não coleta dados de ninguém, de nenhuma idade.',
        },
      ],
    },
    {
      id: 'mudancas',
      titulo: 'Mudanças',
      blocos: [
        {
          tipo: 'paragrafo',
          texto: 'Se esta política mudar, a data no topo muda junto.',
        },
      ],
    },
    {
      id: 'contato',
      titulo: 'Contato',
      blocos: [
        {
          tipo: 'paragrafo',
          texto: 'Blajeen Labs — https://www.blajeen.com.br',
        },
      ],
    },
  ],
  relacionados,
  metaTitulo: 'Política de privacidade — Notalio | Blajeen Labs',
  /* A descrição acompanha o texto aprovado. A anterior citava uma seção "como apagar
     tudo" que não existe mais nele, e meta que promete seção inexistente é a primeira
     coisa que quem revisa uma loja percebe. */
  metaDescricao:
    'O Notalio não coleta nada: não existe uma linha de código de rede no programa. O que você escreve fica em arquivos comuns no seu aparelho, sem conta, sem nuvem e sem rastreador.',
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
