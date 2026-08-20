import { ROTAS } from '@/lib/routes';
import { site } from '../site';
import type { LegalDocument } from '../types';

/**
 * Textos do Revalio.
 *
 * Fonte de verdade auditada, em modo somente leitura:
 * - `C:\dev\revalio\docs\publicacao\RASCUNHO_POLITICA_DE_PRIVACIDADE.md`
 * - `C:\dev\revalio\docs\publicacao\RASCUNHO_TERMOS_DE_USO.md`
 * - `C:\dev\revalio\docs\publicacao\CONTEUDO_PAGINA_DE_EXCLUSAO.md`
 * - `C:\dev\revalio\docs\publicacao\INVENTARIO_RELEASE.md`
 * - `C:\dev\revalio\docs\publicacao\MATRIZ_DECLARACOES_DAS_LOJAS.md`
 * - `docs/LEGAL_LOJAS_E_DADOS.md` §3
 *
 * Nenhuma afirmação sobre coleta, retenção, criptografia ou compartilhamento foi acrescentada
 * além do que esses documentos registram.
 */

const VERSAO = '16 de agosto de 2026';
const FONTE_DATA = 'Data de redação desta versão de trabalho, alinhada ao rascunho de 12/08/2026 do projeto Revalio.';

const relacionadosRevalio = [
  { href: ROTAS.projetoRevalio, rotulo: 'Sobre o Revalio' },
  { href: ROTAS.revalioSuporte, rotulo: 'Suporte do Revalio' },
  { href: ROTAS.revalioPrivacidade, rotulo: 'Privacidade do Revalio' },
  { href: ROTAS.revalioTermos, rotulo: 'Termos do Revalio' },
  { href: ROTAS.revalioExclusao, rotulo: 'Excluir conta do Revalio' },
] as const;

export const privacidadeRevalio: LegalDocument = {
  rota: ROTAS.revalioPrivacidade,
  kind: 'privacidade',
  produto: 'Revalio',
  titulo: 'Política de Privacidade do Revalio',
  resumo:
    'Como o Revalio trata dados: o que fica no aparelho, o que a conta opcional sincroniza e como pedir exclusão.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'controlador',
      titulo: '1. Quem controla os dados',
      blocos: [
        {
          tipo: 'pendente',
          bloqueador: 'titularNome',
          explicacao:
            'A identificação do controlador — nome civil ou razão social, documento e endereço legal — depende da escolha entre pessoa física e pessoa jurídica. Enquanto essa decisão não existir, o documento não nomeia o controlador.',
        },
        {
          tipo: 'contato',
          rotulo: 'Canal de privacidade e suporte do Revalio',
          email: site.emailRevalio,
          assunto: 'Privacidade Revalio',
        },
      ],
    },
    {
      id: 'finalidade',
      titulo: '2. Finalidade do aplicativo',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O Revalio é um aplicativo educacional de microaprendizagem voltado à preparação para provas médicas.',
        },
        {
          tipo: 'destaque',
          texto:
            'Ele não presta atendimento, não realiza diagnóstico, não prescreve tratamento e não substitui formação, supervisão profissional ou protocolos oficiais.',
        },
      ],
    },
    {
      id: 'aparelho',
      titulo: '3. Dados armazenados somente no aparelho',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Sem uma conta conectada, a jornada funciona localmente. O aparelho pode armazenar:',
        },
        {
          tipo: 'lista',
          itens: [
            'nome preferido, forma de tratamento e aparência escolhida;',
            'trilha, níveis, respostas, revisões e desempenho;',
            'energia, sequência, metas, XP, recompensas e cosméticos;',
            'preferências de áudio, notificações, acessibilidade e privacidade;',
            'histórico de atividades educacionais e conteúdo já visto;',
            'eventos aguardando sincronização, quando a conta estiver habilitada.',
          ],
        },
        {
          tipo: 'paragrafo',
          texto:
            'Apagar os dados do aplicativo ou usar a opção “Apagar todos os meus dados” remove a cópia local, ressalvadas as limitações do sistema operacional e as cópias de segurança controladas pela própria pessoa.',
        },
      ],
    },
    {
      id: 'conta',
      titulo: '4. Dados tratados quando a conta é usada',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'A conta é opcional. Quando a pessoa solicita um link mágico e entra, podem ser tratados:',
        },
        {
          tipo: 'lista',
          itens: [
            'endereço de e-mail;',
            'identificador técnico da conta;',
            'datas e informações técnicas necessárias à autenticação;',
            'marcos de progresso permitidos pela política de sincronização, como conclusão de nível, XP, recompensas, inventário e sequência;',
            'registros técnicos necessários para evitar duplicidade, manter segurança e diagnosticar falhas.',
          ],
        },
        {
          tipo: 'destaque',
          texto:
            'O desenho atual não envia enunciados, respostas abertas, alternativa marcada, diagnóstico pessoal, prontuário, dado de paciente ou desempenho clínico detalhado por especialidade.',
        },
      ],
    },
    {
      id: 'compras',
      titulo: '5. Compras e assinatura',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O Revalio Pro é vendido pela App Store e pelo Google Play. O pagamento é processado pela loja, e o Revalio não recebe nem armazena número de cartão, código de segurança ou dados bancários.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Para reconhecer quem assinou e manter o acesso ao trocar de aparelho, o aplicativo usa o RevenueCat, que trata:',
        },
        {
          tipo: 'lista',
          itens: [
            'um identificador da instalação, gerado pelo próprio serviço;',
            'o identificador técnico da sua conta do Revalio, quando você entra em uma;',
            'identificadores do produto e da transação fornecidos pela loja;',
            'situação da assinatura — ativa, cancelada, expirada ou em período de carência;',
            'datas de compra, renovação e expiração;',
            'país da conta da loja e moeda da cobrança;',
            'informações técnicas do aparelho e da versão do aplicativo necessárias à validação da compra.',
          ],
        },
        {
          tipo: 'paragrafo',
          texto:
            'O identificador da conta é enviado por um motivo específico: sem ele, a assinatura ficaria presa à conta da loja em que foi comprada, e quem assinasse no Google Play não teria acesso ao abrir o aplicativo em um iPhone. É o que permite pagar uma vez e usar nos dois sistemas.',
        },
        {
          tipo: 'destaque',
          texto:
            'O RevenueCat não recebe seu nome, seu e-mail nem qualquer dado de estudo — apenas o identificador técnico, que sozinho não identifica você. Ao sair da conta, o aplicativo desfaz essa ligação e o aparelho volta a responder de forma anônima.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Sem conta, a recuperação da assinatura em outro aparelho continua possível pelo botão “Restaurar compra”, usando a mesma conta da App Store ou do Google Play.',
        },
      ],
    },
    {
      id: 'notificacoes',
      titulo: '6. Notificações',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Com autorização do sistema operacional, o aplicativo pode agendar lembretes locais de estudo. A permissão pode ser negada ou revogada nas configurações do aparelho sem perder o acesso ao conteúdo.',
        },
      ],
    },
    {
      id: 'finalidades',
      titulo: '7. Finalidades do tratamento',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'executar funcionalidades solicitadas pela pessoa, como salvar e sincronizar a jornada;',
            'autenticar a conta e proteger o acesso;',
            'atender solicitações de suporte e de exercício de direitos;',
            'prevenir abuso, fraude, duplicidade e falhas técnicas;',
            'cumprir obrigações legais ou regulatórias;',
            'melhorar o produto por meio de eventos técnicos e de progresso limitados;',
            'obter consentimento quando uma funcionalidade exigir autorização específica.',
          ],
        },
        {
          tipo: 'pendente',
          bloqueador: 'revisaoJuridica',
          explicacao:
            'A base legal aplicável a cada operação será confirmada no registro interno de tratamento e revisada juridicamente antes da publicação definitiva.',
        },
      ],
    },
    {
      id: 'prestadores',
      titulo: '8. Prestadores e transferências',
      blocos: [
        {
          tipo: 'paragrafo',
          texto: 'Conforme os serviços habilitados no build publicado, dados podem ser processados por:',
        },
        {
          tipo: 'lista',
          itens: [
            'Supabase, para autenticação, banco de dados e sincronização;',
            'Apple e Google, para distribuição, notificações do sistema e futuras compras;',
            'RevenueCat, somente quando a assinatura for habilitada;',
            'provedores de hospedagem do site, suporte e infraestrutura definidos antes do lançamento.',
          ],
        },
        {
          tipo: 'paragrafo',
          texto:
            'Esses prestadores podem operar infraestrutura em outros países. A lista efetiva será revista e publicada aqui depois da auditoria do ambiente de produção.',
        },
      ],
    },
    {
      id: 'retencao',
      titulo: '9. Retenção e exclusão',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Os dados da conta são mantidos enquanto ela estiver ativa e pelo tempo necessário às finalidades informadas. Após pedido válido de exclusão, serão eliminados ou anonimizados, exceto quando a legislação permitir ou exigir conservação.',
        },
        {
          tipo: 'pendente',
          bloqueador: 'prazoExclusao',
          explicacao:
            'Os prazos de retenção de logs técnicos e de backups e o prazo operacional para concluir pedidos de titulares ainda não foram definidos. Um prazo estimado aqui viraria uma promessa que o serviço não sabe cumprir.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Excluir a conta não cancela automaticamente eventual assinatura administrada pela loja. O cancelamento deve ser feito na conta da App Store ou do Google Play.',
        },
      ],
    },
    {
      id: 'direitos',
      titulo: '10. Direitos da pessoa titular',
      blocos: [
        {
          tipo: 'paragrafo',
          texto: 'Nos termos da LGPD, a pessoa pode solicitar, conforme aplicável:',
        },
        {
          tipo: 'lista',
          itens: [
            'confirmação e acesso;',
            'correção;',
            'informação sobre compartilhamento;',
            'anonimização, bloqueio ou eliminação de dados inadequados ou excessivos;',
            'portabilidade, conforme regulamentação;',
            'revogação do consentimento;',
            'oposição e revisão de decisões automatizadas, quando cabível.',
          ],
        },
        {
          tipo: 'paragrafo',
          texto:
            'O aplicativo oferece exportação e exclusão, e esta página de exclusão funciona como alternativa pública. Poderá ser solicitada confirmação de identidade para impedir que um terceiro apague ou obtenha dados de outra pessoa.',
        },
      ],
    },
    {
      id: 'seguranca',
      titulo: '11. Segurança',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O Revalio adota medidas técnicas e administrativas proporcionais aos dados tratados. Nenhum sistema é invulnerável; incidentes relevantes serão avaliados e comunicados conforme a legislação.',
        },
        {
          tipo: 'destaque',
          texto:
            'O armazenamento local atual utiliza recursos de preferências do sistema operacional e não deve ser descrito como banco criptografado. Por isso o aplicativo não deve armazenar prontuário, credenciais médicas, dados de pacientes ou outras informações clínicas pessoais.',
        },
      ],
    },
    {
      id: 'criancas',
      titulo: '12. Crianças e adolescentes',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O Revalio é destinado a adultos em preparação educacional médica e não é direcionado a crianças. Se o titular decidir aceitar adolescentes, esta seção e os fluxos de consentimento serão revistos antes da disponibilização.',
        },
      ],
    },
    {
      id: 'atualizacoes',
      titulo: '13. Atualizações e contato',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Mudanças relevantes serão informadas no aplicativo ou pelos canais apropriados, e a data desta versão fica visível no início da página.',
        },
        {
          tipo: 'pendente',
          bloqueador: 'canalLgpd',
          explicacao:
            'A indicação de encarregado ou canal LGPD depende da definição do controlador.',
        },
        {
          tipo: 'contato',
          rotulo: 'Pedidos de acesso, correção, informação, portabilidade ou eliminação',
          email: site.emailRevalio,
          assunto: 'Direitos do titular — Revalio',
        },
      ],
    },
  ],
  relacionados: [...relacionadosRevalio],
  metaTitulo: 'Privacidade do Revalio — Blajeen Labs',
  metaDescricao:
    'Política de privacidade do Revalio: dados locais, conta opcional por link mágico, prestadores, direitos e exclusão.',
};

export const termosRevalio: LegalDocument = {
  rota: ROTAS.revalioTermos,
  kind: 'termos',
  produto: 'Revalio',
  titulo: 'Termos de Uso do Revalio',
  resumo: 'Finalidade educacional, regras de conta, conteúdo e limites do aplicativo.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'identificacao',
      titulo: '1. Identificação',
      blocos: [
        {
          tipo: 'pendente',
          bloqueador: 'titularNome',
          explicacao:
            'A identificação de quem disponibiliza o aplicativo depende da escolha entre pessoa física e pessoa jurídica.',
        },
        {
          tipo: 'contato',
          rotulo: 'Contato',
          email: site.emailRevalio,
          assunto: 'Termos de Uso — Revalio',
        },
      ],
    },
    {
      id: 'finalidade',
      titulo: '2. Finalidade educacional',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O Revalio oferece atividades de estudo, questões, estações simuladas, flashcards, revisões, estatísticas e recursos de gamificação para preparação educacional médica.',
        },
        { tipo: 'paragrafo', texto: 'O aplicativo:' },
        {
          tipo: 'lista',
          itens: [
            'não é serviço de telemedicina ou assistência à saúde;',
            'não fornece diagnóstico ou prescrição para casos reais;',
            'não substitui formação, protocolos, supervisão ou julgamento profissional;',
            'não garante aprovação, nota, revalidação de diploma ou ingresso em residência;',
            'não representa nem mantém vínculo oficial com órgãos examinadores, salvo declaração expressa e documentada em sentido contrário.',
          ],
        },
      ],
    },
    {
      id: 'elegibilidade',
      titulo: '3. Elegibilidade e uso responsável',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O serviço é destinado a adultos. A pessoa se compromete a usar casos e condutas apenas para fins educacionais.',
        },
        {
          tipo: 'destaque',
          texto:
            'É proibido inserir dados reais de pacientes, prontuários, segredos profissionais ou informações confidenciais nos campos do aplicativo ou no suporte.',
        },
      ],
    },
    {
      id: 'conta',
      titulo: '4. Conta',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'A conta é opcional e pode ser usada para sincronizar parte da jornada. A pessoa é responsável por controlar o acesso ao e-mail utilizado no link mágico e por comunicar uso não autorizado.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'É possível sair, exportar dados e solicitar exclusão. A exclusão da conta não cancela assinatura administrada por uma loja, caso esse recurso venha a ser ativado.',
        },
      ],
    },
    {
      id: 'conteudo',
      titulo: '5. Conteúdo e atualizações',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O Revalio pode organizar conteúdo a partir de provas, gabaritos, referências e documentos identificados. Ainda que haja revisão editorial, normas clínicas e provas podem mudar; confira fontes oficiais quando uma informação atualizada for relevante.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'A indicação de que uma questão é baseada em prova oficial não transforma o Revalio em aplicativo oficial nem transfere a ele a titularidade do documento de origem.',
        },
      ],
    },
    {
      id: 'propriedade',
      titulo: '6. Propriedade intelectual',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Código próprio, marca, personagens, identidade visual, textos autorais, animações e áudios originais são protegidos, ressalvados materiais e licenças de terceiros.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Não é permitido copiar, extrair em massa, revender, republicar, contornar controles de acesso, descompilar além do permitido por lei, remover créditos ou usar a marca de maneira que sugira vínculo ou autorização inexistente.',
        },
      ],
    },
    {
      id: 'assinatura',
      titulo: '7. Plano gratuito e Revalio Pro',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O Revalio funciona sem pagar, e o plano gratuito não tem prazo. O Revalio Pro é uma assinatura opcional que remove os limites do plano gratuito: energético ilimitado, Sprint sem limite semanal, simulados sem cota mensal e relatório de desempenho de todas as áreas em vez de apenas as mais fracas. Trilhas, acervo e revisões são iguais nos dois planos.',
        },
        {
          tipo: 'paragrafo',
          texto: 'A assinatura é oferecida em dois ciclos, cobrados no início de cada período:',
        },
        {
          tipo: 'lista',
          itens: [
            'Revalio Pro Mensal — renova a cada 1 mês;',
            'Revalio Pro Anual — renova a cada 12 meses, por um valor menor que doze cobranças mensais.',
          ],
        },
        {
          tipo: 'destaque',
          texto:
            'O preço mostrado dentro do aplicativo é sempre o que será cobrado, na moeda da sua conta na loja. Os valores variam por país e podem ser reajustados; um reajuste só passa a valer após aviso e conforme as regras da loja.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'A cobrança é feita pela App Store ou pelo Google Play, nunca pelo Revalio. Nenhum número de cartão, código de segurança ou dado bancário passa pelo aplicativo.',
        },
        {
          tipo: 'passos',
          itens: [
            'O pagamento é debitado da sua conta na loja ao confirmar a compra.',
            'A assinatura renova sozinha, pelo mesmo período, a menos que a renovação automática seja desligada até 24 horas antes do fim do período em curso.',
            'A cobrança da renovação ocorre nas 24 horas anteriores ao fim do período em curso.',
            'A renovação automática pode ser desligada a qualquer momento nos ajustes da sua conta na App Store ou no Google Play — esse controle pertence à loja, não ao aplicativo.',
          ],
        },
        {
          tipo: 'paragrafo',
          texto:
            'Cancelar desliga a renovação e não interrompe o período já pago: o acesso ao Pro continua até o fim dele. Desinstalar o aplicativo não cancela a assinatura, e excluir a conta do Revalio também não — a assinatura é administrada pela loja e precisa ser cancelada lá.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Se um período gratuito de avaliação for oferecido, as condições dele aparecem na própria tela de compra antes da confirmação. Assinar durante um período gratuito encerra a parte não utilizada dele.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Quem troca de aparelho ou reinstala o aplicativo recupera a assinatura pelo botão “Restaurar compra”, na aba Pro, entrando com a mesma conta de loja usada na compra.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Reembolsos são processados pela loja que recebeu o pagamento, segundo as políticas dela. O Revalio não devolve valores diretamente, mas o suporte ajuda a encaminhar o pedido.',
        },
        {
          tipo: 'destaque',
          texto:
            'Nada nesta seção afasta os direitos garantidos pelo Código de Defesa do Consumidor, inclusive o direito de arrependimento em até 7 dias contados da contratação, previsto no artigo 49.',
        },
      ],
    },
    {
      id: 'disponibilidade',
      titulo: '8. Disponibilidade e condutas proibidas',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O aplicativo pode sofrer manutenção, falhas de rede, indisponibilidade de serviços externos e mudanças necessárias à segurança ou às regras das lojas.',
        },
        { tipo: 'paragrafo', texto: 'É proibido:' },
        {
          tipo: 'lista',
          itens: [
            'usar o aplicativo para fraude, violação de prova ou atividade ilegal;',
            'tentar acessar contas, dados, servidores ou recursos sem autorização;',
            'distribuir malware, automatizar abuso ou degradar o serviço;',
            'inserir dados reais de pacientes;',
            'explorar conteúdo de modo a violar direitos autorais, marcas ou contratos de terceiros;',
            'representar o Revalio ou seus personagens sem autorização.',
          ],
        },
      ],
    },
    {
      id: 'responsabilidade',
      titulo: '9. Limitação, encerramento e privacidade',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O Revalio busca manter conteúdo e software consistentes, mas não promete funcionamento ininterrupto nem resultado acadêmico. Nada nestes termos exclui direitos que não possam ser afastados pela legislação de defesa do consumidor.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Uso abusivo, ilegal ou que ameace o serviço pode resultar em limitação ou encerramento de acesso. A pessoa pode deixar de usar o aplicativo e solicitar a exclusão da conta a qualquer momento.',
        },
        {
          tipo: 'paragrafo',
          texto: 'O tratamento de dados é descrito na Política de Privacidade, que integra estes termos.',
        },
      ],
    },
    {
      id: 'lei',
      titulo: '10. Lei aplicável',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Aplicam-se as leis da República Federativa do Brasil, sem prejuízo das normas obrigatórias do local da pessoa usuária.',
        },
        {
          tipo: 'pendente',
          bloqueador: 'foroJuridico',
          explicacao:
            'O foro ou método de resolução de conflitos está marcado como pendente de validação jurídica no rascunho de origem e não pode ser redigido por inferência.',
        },
      ],
    },
  ],
  relacionados: [...relacionadosRevalio],
  metaTitulo: 'Termos do Revalio — Blajeen Labs',
  metaDescricao: 'Termos de uso do Revalio: finalidade educacional, conta opcional, conteúdo e limites.',
};

export const suporteRevalio: LegalDocument = {
  rota: ROTAS.revalioSuporte,
  kind: 'suporte',
  produto: 'Revalio',
  titulo: 'Suporte do Revalio',
  resumo: 'Canal de atendimento, o que informar e o que nunca enviar.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'canal',
      titulo: 'Como falar com o suporte',
      blocos: [
        {
          tipo: 'contato',
          rotulo: 'E-mail de suporte do Revalio',
          email: site.emailRevalio,
          assunto: 'Suporte Revalio',
        },
        {
          tipo: 'paragrafo',
          texto:
            'O mesmo endereço atende pedidos de privacidade, exercício de direitos e exclusão de conta.',
        },
      ],
    },
    {
      id: 'informar',
      titulo: 'O que ajuda na sua mensagem',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'o que você esperava que acontecesse e o que aconteceu;',
            'aparelho e sistema operacional;',
            'versão do aplicativo, quando estiver visível na tela “Sobre”;',
            'se você usa conta ou apenas o modo local;',
            'captura de tela, se ela não contiver informação pessoal.',
          ],
        },
      ],
    },
    {
      id: 'nao-enviar',
      titulo: 'O que não enviar',
      blocos: [
        {
          tipo: 'destaque',
          texto:
            'Nunca envie dados reais de pacientes, prontuários, imagens clínicas, resultados de exames ou qualquer informação confidencial. O Revalio é um produto educacional e não deve receber esse tipo de conteúdo.',
        },
      ],
    },
    {
      id: 'conta',
      titulo: 'Conta e dados',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O Revalio funciona sem conta. A conta é opcional e serve para sincronizar parte da jornada entre aparelhos.',
        },
        {
          tipo: 'passos',
          itens: [
            'Para exportar ou apagar dados, abra o Menu do aplicativo.',
            'Entre em Sobre e privacidade.',
            'Escolha entre apagar somente a conta ou apagar todos os dados.',
          ],
        },
        {
          tipo: 'paragrafo',
          texto: 'A página de exclusão explica o processo completo, inclusive sem acesso ao aplicativo.',
        },
      ],
    },
    {
      id: 'lojas',
      titulo: 'Compras e assinatura',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'O Revalio Pro é uma assinatura opcional, cobrada pela App Store ou pelo Google Play. Cancelamento, restauração e reembolso seguem as regras da loja e são administrados na conta dela — o suporte ajuda a encaminhar, mas não processa devolução. Para recuperar o Pro num aparelho novo, use “Restaurar compra” na aba Pro.',
        },
      ],
    },
  ],
  relacionados: [...relacionadosRevalio],
  metaTitulo: 'Suporte do Revalio — Blajeen Labs',
  metaDescricao: 'Como obter suporte do Revalio, o que informar e como pedir exclusão de conta.',
};

export const exclusaoRevalio: LegalDocument = {
  rota: ROTAS.revalioExclusao,
  kind: 'exclusao',
  produto: 'Revalio',
  titulo: 'Excluir sua conta do Revalio',
  resumo:
    'Você pode apagar sua conta e os dados associados pelo aplicativo ou por esta página, sem precisar reinstalar nada.',
  estado: 'preparacao',
  atualizacao: { definido: true, valor: VERSAO, fonte: FONTE_DATA },
  secoes: [
    {
      id: 'no-app',
      titulo: 'Pelo aplicativo',
      blocos: [
        {
          tipo: 'passos',
          itens: [
            'Abra o Menu.',
            'Entre em Sobre e privacidade.',
            'Toque em “Apagar somente minha conta” ou “Apagar todos os meus dados”.',
            'Leia as diferenças e confirme a opção desejada.',
          ],
        },
        {
          tipo: 'paragrafo',
          texto:
            '“Apagar somente minha conta” remove conta, e-mail de autenticação e cópia sincronizada, preservando o progresso que existe apenas no aparelho. “Apagar todos os meus dados” remove também os dados locais.',
        },
      ],
    },
    {
      id: 'sem-app',
      titulo: 'Sem acesso ao aplicativo',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Envie um e-mail com o assunto “Exclusão de conta Revalio”, usando o mesmo endereço cadastrado na conta. Se você não tiver mais acesso a esse endereço, informe isso na mensagem.',
        },
        {
          tipo: 'contato',
          rotulo: 'Pedido de exclusão',
          email: site.emailRevalio,
          assunto: 'Exclusão de conta Revalio',
        },
        {
          tipo: 'paragrafo',
          texto:
            'Poderemos solicitar informações adicionais para confirmar sua identidade e impedir a exclusão indevida da conta de outra pessoa.',
        },
      ],
    },
    {
      id: 'apagado',
      titulo: 'O que será apagado',
      blocos: [
        {
          tipo: 'lista',
          itens: [
            'conta e identificador de autenticação;',
            'e-mail associado ao serviço;',
            'eventos de progresso sincronizados;',
            'demais dados vinculados à conta que não precisem ser conservados por obrigação legal.',
          ],
        },
        {
          tipo: 'destaque',
          texto:
            'Dados que existam somente no aparelho não podem ser apagados remotamente. Para removê-los, use “Apagar todos os meus dados” no aplicativo ou limpe os dados do aplicativo no aparelho.',
        },
      ],
    },
    {
      id: 'prazo',
      titulo: 'Prazo',
      blocos: [
        {
          tipo: 'pendente',
          bloqueador: 'prazoExclusao',
          explicacao:
            'O prazo operacional para concluir pedidos ainda não foi definido pelo titular. Ele será publicado nesta página antes de qualquer envio às lojas, porque um prazo estimado aqui viraria um compromisso não verificado.',
        },
        {
          tipo: 'paragrafo',
          texto:
            'A conclusão será informada pelo mesmo canal usado no pedido. Dados sujeitos a obrigação legal poderão ser conservados pelo período aplicável.',
        },
      ],
    },
    {
      id: 'assinatura',
      titulo: 'Assinatura',
      blocos: [
        {
          tipo: 'paragrafo',
          texto:
            'Excluir a conta não cancela a assinatura do Revalio Pro, porque ela é administrada pela App Store ou pelo Google Play. Desligue a renovação automática nos ajustes da sua conta na loja — antes ou depois de apagar a conta, mas não deixe de fazer, ou a cobrança continua.',
        },
      ],
    },
  ],
  relacionados: [...relacionadosRevalio],
  metaTitulo: 'Excluir conta do Revalio — Blajeen Labs',
  metaDescricao:
    'Página pública de exclusão de conta do Revalio: caminho no aplicativo, pedido por e-mail e o que é apagado.',
};
