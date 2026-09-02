import { ROTAS } from '@/lib/routes';
import { site } from '../site';
import type { LegalDocument } from '../types';

const VERSAO = '20 de agosto de 2026';
const FONTE_DATA = 'Data de redação desta versão de trabalho.';

const relacionadosEstudio = [
  { href: ROTAS.privacidade, rotulo: 'Privacidade da Blajeen Labs' },
  { href: ROTAS.termos, rotulo: 'Termos do site' },
  { href: ROTAS.suporte, rotulo: 'Suporte' },
] as const;

export const privacidadeEstudio: LegalDocument = {
  rota: ROTAS.privacidade,
  kind: 'privacidade',
  produto: 'Blajeen Labs',
  titulo: 'Política de Privacidade da Blajeen Labs',
  resumo:
    'Como este site trata dados. Cada jogo tem uma política própria, porque o comportamento de um aplicativo não é o mesmo de uma página web.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'escopo',
      titulo: 'O que esta política cobre',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Esta política descreve o site institucional da Blajeen Labs, o portal usado para personalizar projetos adquiridos e as páginas de apoio dos produtos publicados ou em preparação. Ela não descreve o funcionamento dos aplicativos.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Cada produto tem política, termos, suporte e exclusão próprios, porque cada um trata dados de forma diferente. Os links estão no fim desta página.',
        },
      ],
    },
    {
      id: 'coleta',
      titulo: 'Navegação pública',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'As páginas públicas continuam sem qualquer camada de medição ou identificação adicional de visitantes.',
        },
        {
          tipo: 'lista',
          itens: [
            'não usa analytics, pixels de rastreamento ou identificadores publicitários;',
            'não grava cookies não essenciais nem exibe banner de consentimento, porque não há o que consentir;',
            'não cria perfil para visitantes das páginas institucionais;',
            'o formulário público de contato não envia dados ao servidor — ele prepara uma mensagem no aplicativo de e-mail do seu aparelho;',
            'fontes, scripts e imagens das páginas públicas são entregues pelo próprio domínio.',
          ],
        },
        {
          tipo: 'destaque',
          texto:
            'A central de onboarding é uma área separada, acessada por link exclusivo por clientes que adquiriram um projeto. O tratamento feito nessa área está explicado abaixo.',
        },
      ],
    },
    {
      id: 'onboarding',
      titulo: 'Central de onboarding de projetos',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Depois da contratação, a Blajeen pode criar um link exclusivo para o cliente enviar as informações necessárias à personalização do projeto. Não é preciso criar senha: o próprio link funciona como credencial temporária e pode expirar, ser revogado ou regenerado.',
        },
        {
          tipo: 'lista',
          itens: [
            'dados de contato e identificação do responsável e do negócio;',
            'dados comerciais, endereços, domínio desejado e usuários que receberão convites de acesso;',
            'textos, identidade visual, logos, fotos, documentos não sensíveis e informações específicas do produto adquirido;',
            'progresso de preenchimento, revisões, aprovações e histórico de ações necessárias à implantação.',
          ],
        },
        {
          tipo: 'paragrafo',
          texto:
            'Esses dados são usados para preparar, revisar, implantar e documentar o projeto contratado, manter contato sobre pendências e gerar um pacote de configuração aprovado. O portal não pede senha de domínio, registrador, e-mail, banco ou gateway; acessos devem ser concedidos por convite em canal apropriado.',
        },
        {
          tipo: 'destaque',
          texto:
            'O cliente só deve enviar imagens, marcas, depoimentos e outros materiais que esteja autorizado a usar. O envio final registra a confirmação dessa autorização para utilização no próprio projeto.',
        },
      ],
    },
    {
      id: 'onboarding-seguranca',
      titulo: 'Segurança, fornecedores e retenção do onboarding',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O token do cliente é armazenado em forma de hash, e a cópia necessária ao painel interno fica criptografada. O painel administrativo usa sessão protegida; alterações de estado, salvamentos, revisões e exportações geram histórico de auditoria.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Em produção, os registros e arquivos são armazenados de forma privada em PostgreSQL hospedado na Neon. A Vercel hospeda a aplicação e pode ser usada como armazenamento adicional. Esses fornecedores processam os dados técnicos necessários para armazenar e entregar o conteúdo do projeto. Arquivos são acessados pelo próprio portal e não são publicados automaticamente.',
        },
        {
          tipo: 'pendente',
          bloqueador: 'onboardingRetencao',
          explicacao:
            'Ainda precisa ser definido por quanto tempo respostas, arquivos, revisões e histórico serão mantidos depois da publicação ou do arquivamento do projeto. Até essa decisão, nenhum prazo é prometido nesta política.',
        },
      ],
    },
    {
      id: 'servidor',
      titulo: 'Hospedagem e registros de acesso',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Este site é hospedado pela Vercel, que entrega as páginas a partir de sua rede de servidores.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Para entregar uma página e proteger a infraestrutura contra abuso, qualquer serviço de hospedagem processa os dados de conexão que o seu navegador envia: endereço IP, identificação do navegador, data, hora e o endereço solicitado. Isso é inerente ao funcionamento da web e acontece antes de o site existir como conteúdo.',
        },
        {
          tipo: 'destaque',
          texto:
            'Esse processamento é da hospedagem. O site não acrescenta camada de medição: a versão publicada não carrega analytics nem grava cookies publicitários. A área administrativa usa apenas um cookie essencial de sessão, e o portal do cliente usa o link exclusivo como credencial.',
        },
        {
          tipo: 'pendente',
          bloqueador: 'hospedagemLogs',
          explicacao:
            'Falta declarar por quanto tempo esses registros ficam guardados e confirmar o acordo de tratamento de dados da Vercel. Os dois dependem do plano contratado, e um prazo estimado aqui seria um compromisso que ninguém verificou.',
        },
      ],
    },
    {
      id: 'preferencias',
      titulo: 'Preferências guardadas no seu navegador',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O site guarda no seu próprio navegador duas preferências de exibição: se o movimento da interface está ligado ou desligado, e se a abertura do laboratório já foi exibida nesta sessão.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Essas informações ficam no seu aparelho, não são enviadas ao servidor, não identificam você e podem ser apagadas limpando os dados do site no navegador.',
        },
      ],
    },
    {
      id: 'controlador',
      titulo: 'Quem responde por este site',
      blocos: [
        {
          tipo: 'pendente',
          bloqueador: 'titularNome',
          explicacao:
            'A forma jurídica do titular — pessoa física ou pessoa jurídica — ainda não foi escolhida. Enquanto isso, o site não nomeia controlador, porque uma identificação incorreta em documento de privacidade é pior do que a ausência dela.',
        },
        {
          tipo: 'pendente',
          bloqueador: 'canalLgpd',
          explicacao:
            'O canal de atendimento a titulares previsto na LGPD depende da mesma escolha acima.',
        },
        {
          tipo: 'contato',
          rotulo: 'Contato de privacidade do estúdio',
          email: site.emailEstudio,
          assunto: 'Privacidade — Blajeen Labs',
        },
      ],
    },
  ],
  relacionados: [
    { href: ROTAS.termos, rotulo: 'Termos do site' },
    { href: ROTAS.revalioPrivacidade, rotulo: 'Privacidade do Revalio' },
    { href: ROTAS.docalioPrivacidade, rotulo: 'Privacidade do Docalio' },
    { href: ROTAS.gramelioPrivacidade, rotulo: 'Privacidade do Gramelio' },
    { href: ROTAS.catelioPrivacidade, rotulo: 'Privacidade do Catelio' },
    { href: ROTAS.dogolioPrivacidade, rotulo: 'Privacidade do Dogolio' },
    { href: ROTAS.morvelioPrivacidade, rotulo: 'Privacidade do Morvelio' },
    { href: ROTAS.suporte, rotulo: 'Suporte' },
  ],
  metaTitulo: 'Privacidade — Blajeen Labs',
  metaDescricao:
    'Política de privacidade da Blajeen Labs: navegação pública, central de onboarding, arquivos e segurança dos projetos.',
};

export const termosEstudio: LegalDocument = {
  rota: ROTAS.termos,
  kind: 'termos',
  produto: 'Blajeen Labs',
  titulo: 'Termos de uso do site',
  resumo:
    'Regras de uso destas páginas. Os jogos possuem termos próprios, e são eles que valem para cada produto.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'objeto',
      titulo: 'O que este documento regula',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Estes termos valem para a navegação neste site: páginas institucionais, páginas de projeto e páginas de apoio de Revalio, Docalio, Gramelio, Catelio, Dogolio e Morvelio.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'O uso de cada aplicativo é regulado pelos termos daquele produto, aceitos dentro do próprio aplicativo.',
        },
      ],
    },
    {
      id: 'conteudo',
      titulo: 'Conteúdo publicado',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'As páginas descrevem projetos em desenvolvimento. Recursos, escopo e estado podem mudar, e o site é atualizado conforme os produtos avançam.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Nada neste site constitui oferta de venda, promessa de lançamento, data de disponibilidade ou garantia de resultado. Quando um produto tiver loja, preço ou data, isso será dito explicitamente na página do produto.',
        },
        {
          tipo: 'destaque',
          texto:
            'Os produtos do estúdio incluem educação, entretenimento e ferramentas para negócios. Revalio e Docalio tratam de temas médicos, e nenhum deles presta atendimento, faz diagnóstico, prescreve tratamento ou substitui formação, supervisão profissional ou protocolos oficiais. Gramelio, Catelio, Dogolio e Morvelio são jogos; os produtos SaaS são bases de software adaptáveis e não substituem orientação profissional específica de cada operação.',
        },
      ],
    },
    {
      id: 'propriedade',
      titulo: 'Marca, arte e código',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'A marca Blajeen Labs, os nomes Revalio, Docalio, Gramelio, Catelio, Dogolio, Morvelio e das linhas SaaS, as artes-chave, os personagens, a identidade visual e os textos autorais deste site são protegidos e pertencem ao titular do projeto, ressalvados materiais e licenças de terceiros.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Não é permitido reproduzir a identidade de modo que sugira vínculo, autorização ou parceria inexistentes.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'As fontes tipográficas usadas nestas páginas são distribuídas sob a SIL Open Font License e servidas pelo próprio site, com os arquivos de licença preservados no repositório.',
        },
      ],
    },
    {
      id: 'uso',
      titulo: 'Uso aceitável',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'não tentar acessar áreas, servidores ou recursos sem autorização;',
            'não automatizar coleta em massa nem degradar a disponibilidade do site;',
            'não republicar as páginas como se fossem canal oficial de terceiros.',
          ],
        },
      ],
    },
    {
      id: 'materiais-cliente',
      titulo: 'Materiais enviados para personalização',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Quem usa a central de onboarding declara que as informações fornecidas são corretas e que possui autorização para utilizar as marcas, textos, imagens, depoimentos e demais arquivos enviados.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'A autorização dada no envio final permite que a Blajeen use esses materiais somente para analisar, desenvolver, revisar, publicar e manter o projeto contratado. O conteúdo não é publicado automaticamente: ele passa por revisão e aprovação.',
        },
      ],
    },
    {
      id: 'lei',
      titulo: 'Lei aplicável',
      blocos: [
        {
          tipo: 'pendente',
          bloqueador: 'foroJuridico',
          explicacao:
            'A cláusula de lei aplicável e resolução de conflitos precisa de validação jurídica antes de ser publicada como definitiva. Ela não pode ser redigida por inferência.',
        },
        {
          tipo: 'pendente',
          bloqueador: 'revisaoJuridica',
          explicacao:
            'Enquanto a revisão jurídica não for concluída, este documento é uma versão de trabalho pública e não uma condição contratual aprovada.',
        },
      ],
    },
  ],
  relacionados: [...relacionadosEstudio],
  metaTitulo: 'Termos — Blajeen Labs',
  metaDescricao: 'Termos de uso do site institucional da Blajeen Labs.',
};

export const suporteEstudio: LegalDocument = {
  rota: ROTAS.suporte,
  kind: 'suporte',
  produto: 'Blajeen Labs',
  titulo: 'Suporte',
  resumo:
    'Algo não funcionou, ficou uma dúvida de uso ou você encontrou um bug. É aqui que se resolve — e por produto, porque cada app tem o seu canal.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'revalio',
      titulo: 'Suporte do Revalio',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O Revalio tem canal próprio, usado também para pedidos de privacidade e exclusão de conta.',
        },
        {
          tipo: 'contato',
          rotulo: 'E-mail de suporte do Revalio',
          email: site.emailRevalio,
          assunto: 'Suporte Revalio',
        },
      ],
    },
    {
      id: 'docalio',
      titulo: 'Suporte do Docalio',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O Docalio está em desenvolvimento e ainda não tem build público. Não existe conta, servidor ou dado sincronizado a recuperar, mas o canal já está aberto para dúvidas sobre o projeto.',
        },
        {
          tipo: 'contato',
          rotulo: 'E-mail de suporte do Docalio',
          email: site.emailDocalio,
          assunto: 'Suporte Docalio',
        },
      ],
    },
    {
      id: 'gramelio',
      titulo: 'Suporte do Gramelio',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O Gramelio está em desenvolvimento e ainda não foi distribuído: não existe instalação, conta ou compra a atender. O canal já está aberto para dúvidas sobre o projeto e para pedidos relacionados a dados.',
        },
        {
          tipo: 'contato',
          rotulo: 'E-mail de suporte do Gramelio',
          email: site.emailGramelio,
          assunto: 'Suporte Gramelio',
        },
      ],
    },
    {
      id: 'bug',
      titulo: 'Reportar um bug',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Encontrou algo quebrado, travando ou se comportando de forma estranha? Escreva para o canal do produto com “Bug” no assunto — é o caminho mais curto até quem conserta.',
        },
        { tipo: 'paragrafo', texto: 'Um bom relato costuma ter cinco coisas:' },
        {
          tipo: 'passos',
          itens: [
            'O que você fez, na ordem em que fez.',
            'O que você esperava que acontecesse.',
            'O que aconteceu no lugar.',
            'Aparelho, sistema operacional e versão do aplicativo, quando visível na tela “Sobre”.',
            'Uma captura de tela ou vídeo curto, se não contiver informação pessoal.',
          ],
        },
        {
          tipo: 'paragrafo',
          texto:
            'Diga também se o problema acontece toda vez ou se foi uma vez só: saber se ele se repete muda bastante a investigação.',
        },
        {
          tipo: 'contato',
          rotulo: 'Bug no Revalio',
          email: site.emailRevalio,
          assunto: 'Bug — Revalio',
        },
        {
          tipo: 'contato',
          rotulo: 'Bug no Docalio',
          email: site.emailDocalio,
          assunto: 'Bug — Docalio',
        },
        {
          tipo: 'contato',
          rotulo: 'Bug no Gramelio',
          email: site.emailGramelio,
          assunto: 'Bug — Gramelio',
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
            'Não envie dados reais de pacientes, prontuários, imagens clínicas ou resultados de exames em nenhum relato. São produtos de educação e entretenimento, e não devem receber esse tipo de conteúdo.',
        },
      ],
    },
    {
      id: 'estudio',
      titulo: 'Não é sobre um produto?',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Parceria, imprensa ou qualquer assunto que não seja de um aplicativo específico falam com o estúdio, na página de contato.',
        },
      ],
    },
  ],
  relacionados: [
    { href: ROTAS.revalioSuporte, rotulo: 'Suporte do Revalio' },
    { href: ROTAS.docalioSuporte, rotulo: 'Suporte do Docalio' },
      { href: ROTAS.gramelioSuporte, rotulo: 'Suporte do Gramelio' },
      { href: ROTAS.catelioSuporte, rotulo: 'Suporte do Catelio' },
      { href: ROTAS.dogolioSuporte, rotulo: 'Suporte do Dogolio' },
      { href: ROTAS.morvelioSuporte, rotulo: 'Suporte do Morvelio' },
      { href: ROTAS.contato, rotulo: 'Contato do estúdio' },
      { href: ROTAS.privacidade, rotulo: 'Privacidade' },
  ],
  metaTitulo: 'Suporte — Blajeen Labs',
  metaDescricao:
    'Suporte de Revalio, Docalio, Gramelio, Catelio, Dogolio e Morvelio: ajuda com os produtos, dúvidas de uso e como reportar um bug.',
};
