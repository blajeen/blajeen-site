import type { Aplicativo } from './produtos';
import { ROTAS } from '@/lib/routes';

export const RECRAW_RELEASES = 'https://github.com/blajeen/recraw-download/releases';
export const RECRAW_DOWNLOAD = `${RECRAW_RELEASES}/download/v0.2.0`;

export const recraw: Aplicativo = {
  tipo: 'aplicativo',
  id: 'recraw',
  nome: 'Recraw',
  simbolo: 'recraw',
  rota: ROTAS.produtoRecraw,
  estado: 'VERSÃO INICIAL · GRATUITO',
  versao: '0.2.0',
  requisitos: 'Windows 10 ou 11, 64 bits, com WebView2',
  lema: 'A conversa fica. A ideia também.',
  resumo:
    'Grave sua voz e o som do computador, capture a tela e transcreva em português, sem internet. Um quadro para desenhar, colar imagens e explicar. Tudo no seu computador.',
  descricao: [
    'Grave uma reunião e transcreva depois no próprio Recraw, guarde uma referência da tela ou abra o quadro para organizar uma explicação.',
    'Áudio, tela e anotações no mesmo programa, com temas claro e escuro e arquivos locais. Sem conta e sem mensalidade.',
  ],
  imagem: {
    src: '/produtos/recraw/recraw-audio.webp',
    alt: 'Interface real do Recraw em tema escuro, com cronômetro e controles de microfone e som do computador.',
    legenda: 'Área de áudio do Recraw 0.2.0, em tema escuro.',
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
    {
      titulo: 'Transformar a fala em texto',
      texto: 'Na aba Transcrição, escolha um áudio ou vídeo da pasta de gravações. O Whisper incluído gera texto em português, que você pode revisar, copiar e exportar em TXT. Sem conta ou envio do áudio.',
    },
  ],
  naoFaz: [
    'A transcrição em português acontece depois da gravação, no próprio computador. Revise nomes, números e falas sobrepostas. O resumo pode ser feito em outra ferramenta.',
    'A captura de tela inclui todo o monitor selecionado, com cursor e avisos que aparecerem. A captura de áudio inclui os sons da saída selecionada.',
    'Esta versão passou por capturas reais curtas e uma gravação de 65 segundos com união de trechos. Ainda não passou por ensaios de várias horas em diferentes computadores.',
  ],
  arquivos: [
    {
      id: 'instalador',
      nome: 'Instalador',
      arquivo: 'Recraw-0.2.0-instalador.exe',
      tamanho: '147,0 MB',
      paraQuem: 'Pacote completo com Whisper e modelo incluídos. Instala para o seu usuário e prepara o WebView2, caso ele esteja ausente.',
      recomendado: true,
      hash: 'b1695dc46861f40c469c546c00635fecafc9adb559d50474d5ecb0e237507003',
    },
    {
      id: 'portatil',
      nome: 'Versão portátil',
      arquivo: 'Recraw-0.2.0-portatil.zip',
      tamanho: '153,1 MB',
      paraQuem: 'Whisper e modelo já incluídos para levar a outro PC. Extraia todo o ZIP, mantenha a pasta whisper e abra Recraw.exe. Precisa do WebView2 no Windows.',
      hash: 'dce746df0141ce40bde64cf2c4f0893efa0b72eeb2215ab28a7f6a1f10ac89f2',
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
