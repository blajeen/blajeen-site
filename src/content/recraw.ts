import type { Aplicativo } from './produtos';
import { ROTAS } from '@/lib/routes';

export const RECRAW_RELEASES = 'https://github.com/blajeen/recraw-download/releases';
export const RECRAW_DOWNLOAD = `${RECRAW_RELEASES}/download/v0.1.1`;

export const recraw: Aplicativo = {
  tipo: 'aplicativo',
  id: 'recraw',
  nome: 'Recraw',
  simbolo: 'recraw',
  rota: ROTAS.produtoRecraw,
  estado: 'VERSÃO INICIAL · GRATUITO',
  versao: '0.1.1',
  requisitos: 'Windows 10 ou 11, 64 bits, com WebView2',
  lema: 'A conversa fica. A ideia também.',
  resumo:
    'Sua voz, o som do computador e a tela inteira. Um quadro para desenhar, colar imagens e explicar. Tudo salvo no seu computador.',
  descricao: [
    'Grave uma reunião para ouvir e transcrever depois, guarde uma referência da tela ou abra o quadro para organizar uma explicação.',
    'Áudio, tela e anotações no mesmo programa, com temas claro e escuro e arquivos locais. Sem conta e sem mensalidade.',
  ],
  imagem: {
    src: '/produtos/recraw/recraw-audio.webp',
    alt: 'Interface real do Recraw em tema escuro, com cronômetro e controles de microfone e som do computador.',
    legenda: 'Área de áudio do Recraw 0.1.1, em tema escuro.',
  },
  faz: [
    {
      titulo: 'Ouvir e guardar',
      texto: 'Grave o microfone e o som da saída selecionada, juntos em M4A. Teste as fontes por cinco segundos, pause e continue quando precisar.',
    },
    {
      titulo: 'Gravar a tela inteira',
      texto: 'Escolha um monitor e salve em MP4. O padrão é até 720p e 15 quadros por segundo; há opção de 1080p para preservar textos menores.',
    },
    {
      titulo: 'Desenhar uma explicação',
      texto: 'Um quadro com Excalidraw para escrever, criar formas e setas, colar imagens e recortar o enquadramento. Exporte em PNG, SVG ou no formato editável.',
    },
  ],
  naoFaz: [
    'A transcrição e o resumo são feitos depois, na ferramenta que você escolher. O Recraw entrega os arquivos de áudio e vídeo.',
    'A captura de tela inclui todo o monitor selecionado, com cursor e avisos que aparecerem. A captura de áudio inclui os sons da saída selecionada.',
    'Esta versão passou por capturas reais curtas e uma gravação de 65 segundos com união de trechos. Ainda não passou por ensaios de várias horas em diferentes computadores.',
  ],
  arquivos: [
    {
      id: 'instalador',
      nome: 'Instalador',
      arquivo: 'Recraw-0.1.1-instalador.exe',
      tamanho: '17,3 MB',
      paraQuem: 'Para deixar no seu computador. Instala para o seu usuário e prepara o WebView2, caso ele esteja ausente.',
      recomendado: true,
      hash: 'ace0b137ab200b19d3fb66304c547739a01f2f2b9e56d0e07fefcad838d9ee76',
    },
    {
      id: 'portatil',
      nome: 'Versão portátil',
      arquivo: 'Recraw-0.1.1-portatil.zip',
      tamanho: '17,9 MB',
      paraQuem: 'Para usar sem instalar o Recraw. Extraia o ZIP e abra Recraw.exe. Precisa do WebView2 já instalado no Windows.',
      hash: '801441a60b552058db9fb05a9143bdc12ebe2000eaeb1351cd105b6ba2de34c7',
    },
  ],
  avisoDoWindows: {
    porque: 'O aplicativo e o instalador ainda não têm assinatura digital. O Windows pode mostrar um aviso de aplicativo não reconhecido. Confira a origem do download e os hashes disponíveis abaixo.',
    passos: [
      { onde: 'Instalador', texto: 'Baixe o arquivo .exe e abra para instalar. A preparação do WebView2, se necessária, pode precisar de internet.' },
      { onde: 'Portátil', texto: 'Extraia todo o ZIP antes de abrir Recraw.exe. O guia de uso e os créditos acompanham o programa.' },
    ],
  },
  codigoAberto: false,
};
