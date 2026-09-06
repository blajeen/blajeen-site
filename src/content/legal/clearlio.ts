import { ROTAS } from '@/lib/routes';
import { site } from '../site';
import type { LegalDocument } from '../types';

/**
 * Documentos legais do Clearlio.
 *
 * Um limpador de disco precisa dizer mais do que "não coleto nada", porque ele
 * legitimamente **lê** coisas delicadas para funcionar: o que o navegador guardou, a
 * lista de programas instalados, os atalhos, as configurações de rede. Nada disso sai da
 * máquina, mas omitir que é lido seria a mesma desonestia que o produto recusa na
 * interface.
 *
 * Por isso a seção 3 existe e é a mais longa: ela lista o que ele olha, e por quê. *
 * Marcados como versão de trabalho, como todos os outros documentos legais do site.
 * O conteúdo aqui é fato verificável — não existe rede no programa, e dá pra conferir
 * abrindo o código —, mas a revisão jurídica do titular continua em aberto, e é o teste
 * `se declara versão de trabalho enquanto houver revisão jurídica pendente` que segura
 * isso. Quando ele ler e aprovar, é trocar `preparacao` por `publicado` aqui e ajustar
 * aquele teste. Não sou eu que decido que a revisão dele aconteceu.
 */

const VERSAO = '6 de setembro de 2026';
const FONTE_DATA = 'Escrito a partir do código publicado do Clearlio 0.1.0.';

const relacionados = [
  { href: ROTAS.produtoClearlio, rotulo: 'Sobre o Clearlio' },
  { href: ROTAS.clearlioSuporte, rotulo: 'Suporte do Clearlio' },
  { href: ROTAS.clearlioPrivacidade, rotulo: 'Privacidade do Clearlio' },
  { href: ROTAS.clearlioTermos, rotulo: 'Termos do Clearlio' },
  { href: ROTAS.contato, rotulo: 'Contato do estúdio' },
] as const;

export const privacidadeClearlio: LegalDocument = {
  rota: ROTAS.clearlioPrivacidade,
  kind: 'privacidade',
  produto: 'Clearlio',
  titulo: 'Privacidade do Clearlio',
  resumo: 'Ele olha bastante coisa no seu computador, e nada sai de lá.',
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
            'O Clearlio não coleta, não guarda e não envia nenhum dado seu. Ele não tem conta e não fala com servidor nenhum — nem nosso, nem de terceiro. Tudo o que ele descobre aparece na sua tela e morre ali.',
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
            'Não existe uma linha de rede no programa. Ele não tem biblioteca de rede embutida, não abre conexão, não busca atualização e não envia relatório de erro. Funciona igual com o computador desconectado.',
        },
      ],
    },
    {
      id: 'le',
      titulo: '3. O que ele olha para funcionar',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Um limpador de disco precisa olhar bastante coisa, e algumas delas são delicadas. Dizer só "não coleto nada" seria verdade e mentira ao mesmo tempo: nada sai daqui, mas muita coisa é lida. Esta é a lista.',
        },
        {
          tipo: 'lista',
          itens: [
            'Nome, tamanho e data dos arquivos das pastas que você mandar olhar. O conteúdo dos arquivos não é lido, com uma exceção: para achar cópias iguais, ele calcula uma impressão digital do conteúdo — e essa conta acontece na memória, nada é guardado.',
            'As pastas que os programas usam para guardar coisa temporária, incluindo as do navegador.',
            'Se você ligar o agente "Rastros": os arquivos de histórico e de cookies dos navegadores. Ele conta quantos são e quanto ocupam. Não lê os endereços que você visitou nem o conteúdo deles. Esse agente vem desligado, e o que ele encontra só sai do lugar depois que você marca uma caixa dizendo que quer.',
            'A lista de programas instalados e a configuração do Windows Defender, para a checagem de segurança.',
            'Os atalhos de navegador, as regras de página inicial e a configuração de proxy, para achar o que a gente chama de praga.',
            'Quais programas estão usando memória agora, e as peças do computador — processador, memória, disco, placa de vídeo.',
          ],
        },
        {
          tipo: 'destaque',
          texto:
            'Nada disso é guardado nem enviado. É lido, mostrado na tela e esquecido quando você fecha o programa.',
        },
      ],
    },
    {
      id: 'grava',
      titulo: '4. O que ele grava no seu computador',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Quando você manda limpar, os arquivos não são apagados: eles são movidos para uma lixeira do próprio Clearlio, onde ficam 30 dias esperando você mudar de ideia. Junto dela fica um diário, que anota o que foi movido, de onde, para onde e quando — é ele que permite trazer tudo de volta.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Esse diário contém caminhos de arquivos seus. Ele fica no seu computador, em uma pasta dentro dos dados locais do seu usuário, e nunca é enviado a lugar nenhum. Ele existe pelo mesmo motivo que a lixeira existe: sem registro, não há como desfazer.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'O programa também guarda as suas preferências de idioma e tema, e quais agentes você deixou ligados.',
        },
      ],
    },
    {
      id: 'terceiros',
      titulo: '5. Terceiros, anúncio e medição',
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
      id: 'apagar',
      titulo: '6. Como apagar tudo',
      blocos: [
        {
          tipo: 'passos',
          itens: [
            'Se ainda quiser algum arquivo de volta, use o desfazer antes — depois de apagar a lixeira dele, não tem retorno.',
            'Apague a pasta do Clearlio dentro dos dados locais do seu usuário: ali estão a lixeira e o diário.',
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
            'Uma versão futura que passe a usar a internet por qualquer motivo terá esta página atualizada antes de ser publicada, e a mudança será dita na página do produto. Um programa que mexe nos seus arquivos e muda o que faz com eles sem avisar não merece a confiança que pede.',
        },
      ],
    },
    {
      id: 'contato',
      titulo: '8. Dúvidas',
      blocos: [
        {
          tipo: 'contato',
          rotulo: 'Privacidade do Clearlio',
          email: site.emailEstudio,
          assunto: 'Privacidade Clearlio',
        },
      ],
    },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Privacidade do Clearlio — Blajeen Labs',
  metaDescricao:
    'O que o Clearlio olha no seu computador, o que ele grava e por que nada sai da sua máquina: não existe rede no programa.',
};

export const termosClearlio: LegalDocument = {
  rota: ROTAS.clearlioTermos,
  kind: 'termos',
  produto: 'Clearlio',
  titulo: 'Termos de Uso do Clearlio',
  resumo: 'Para que serve, quem decide o que sai, e o que não prometemos.',
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
            'O Clearlio é um programa para Windows que acha o que não serve mais no computador, explica o que é cada coisa e move o que você mandar para uma lixeira própria. É gratuito: não tem versão paga, função trancada nem assinatura.',
        },
        {
          tipo: 'destaque',
          texto:
            'Ele não é antivírus e não se apresenta como um. Ele confere se o Windows Defender está ativo e aponta sinais que não têm explicação inocente num computador de casa — não faz varredura de arquivo nem detecção de ameaça.',
        },
      ],
    },
    {
      id: 'decide',
      titulo: '2. Quem decide o que sai é você',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O programa nunca move nada sozinho. Ele mostra o que encontrou, explica o que é, e só age depois que você marca e confirma. O que sai vai para uma lixeira dele e fica 30 dias, e o desfazer devolve cada arquivo no lugar exato de onde saiu.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Ainda assim, você é quem conhece os seus arquivos. Confira a lista antes de confirmar, especialmente em pastas de trabalho.',
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
            'O nome "Clearlio" e os mascotes não estão na licença: eles identificam o produto e não podem ser usados para apresentar outro programa como se fosse este.',
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
            'O programa é fornecido como está, sem garantia. Ele mexe em arquivos do seu computador a seu pedido, e nenhum programa que faz isso pode prometer acerto absoluto. É por isso que ele move em vez de apagar, guarda por 30 dias e registra tudo no diário.',
        },
        {
          tipo: 'destaque',
          texto:
            'Se algo importante for movido por engano, use o desfazer. Depois de esvaziar a lixeira do Clearlio ou de passar os 30 dias, não há recuperação.',
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
            'não usar em computador de outra pessoa sem a autorização dela;',
            'não redistribuir o programa alterado apresentando-o como oficial;',
            'não usar o nome ou os mascotes para se passar pelo estúdio.',
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
          rotulo: 'Termos do Clearlio',
          email: site.emailEstudio,
          assunto: 'Termos Clearlio',
        },
      ],
    },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Termos do Clearlio — Blajeen Labs',
  metaDescricao:
    'Termos de uso do Clearlio: licença MIT, você decide o que sai, e os limites declarados.',
};

export const suporteClearlio: LegalDocument = {
  rota: ROTAS.clearlioSuporte,
  kind: 'suporte',
  produto: 'Clearlio',
  titulo: 'Suporte do Clearlio',
  resumo: 'Onde pedir ajuda, e como trazer de volta o que saiu.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'desfazer',
      titulo: 'Saiu alguma coisa que você não queria?',
      blocos: [
        {
          tipo: 'destaque',
          texto:
            'Nada foi apagado. O que sai fica 30 dias na lixeira do Clearlio, e o botão de desfazer devolve tudo no lugar exato de onde saiu. Faça isso antes de qualquer outra coisa.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Pela linha de comando, o comando é "clearlio undo". Para escolher um lote específico, "clearlio lixeira" mostra o que está guardado.',
        },
      ],
    },
    {
      id: 'canal',
      titulo: 'Onde falar com a gente',
      blocos: [
        {
          tipo: 'contato',
          rotulo: 'E-mail de suporte do Clearlio',
          email: site.emailEstudio,
          assunto: 'Suporte Clearlio',
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
            'O que você mandou olhar, e o que você marcou.',
            'O que esperava que acontecesse.',
            'O que aconteceu.',
            'Sua versão do Windows e a versão do Clearlio.',
            'Uma foto da tela, se ajudar.',
          ],
        },
        {
          tipo: 'destaque',
          texto:
            'Não mande o diário nem a lista completa de achados: eles contêm caminhos de arquivos seus. Quase sempre uma descrição do que aconteceu já basta.',
        },
      ],
    },
    {
      id: 'segurou',
      titulo: 'Ele deixou de limpar uma pasta',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Isso é de propósito, e a tela diz o motivo. Pasta de projeto com trabalho não salvo no Git, arquivo aberto por outro programa e coisa do sistema ficam de fora — os guardiões seguram, e a explicação aparece na seção "o que eu segurei".',
        },
      ],
    },
  ],
  relacionados: [...relacionados],
  metaTitulo: 'Suporte do Clearlio — Blajeen Labs',
  metaDescricao:
    'Suporte do Clearlio: como desfazer uma limpeza, o que contar ao pedir ajuda e por que ele segura algumas pastas.',
};
