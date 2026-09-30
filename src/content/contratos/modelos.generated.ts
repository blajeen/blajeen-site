/*
 * GERADO pelo kit comercial (Blajeen Labs - Kit Comercial/_fonte/build.py --site).
 * Os textos jurídicos vêm de _fonte/contratos.py e os preços-base de _fonte/dados.py.
 * {{campo|exemplo|padrão|opcional}} e [[caixa|rótulo|grupo]] são resolvidos por src/lib/contracts/documento.ts.
 * Os preços publicados no painel (Catálogo) sobrescrevem os preços-base daqui.
 */
import type { ModeloContrato, ServicoCatalogo, ServicoId } from './tipos';

export const MODELOS: Record<ServicoId, ModeloContrato> = {
 "site": {
  "slug": "site",
  "codigo": "SITE",
  "indice": "01",
  "tituloCurto": "Site",
  "h1": "Desenvolvimento<br>de <span class=\"em\">Site.</span>",
  "lead": "Um site com a identidade da sua marca, pensado para apresentar, convencer e converter — em qualquer tela.",
  "revisoesCurto": "2 rodadas no layout + 1 antes de publicar",
  "garantiaCurto": "7 dias de satisfação · 90 dias de garantia técnica",
  "pagamento": "50% adiantado, na assinatura, e 50% no final, antes da publicação",
  "multiPlano": false,
  "etapas": [
   {
    "titulo": "Diagnóstico",
    "descricao": "Briefing, objetivos e mapa do site"
   },
   {
    "titulo": "Layout",
    "descricao": "Proposta visual exclusiva"
   },
   {
    "titulo": "Desenvolvimento",
    "descricao": "Site completo em link de prévia"
   },
   {
    "titulo": "Validação",
    "descricao": "Testes e ajustes finais"
   },
   {
    "titulo": "Publicação",
    "descricao": "Domínio, SSL e analytics"
   },
   {
    "titulo": "Evolução",
    "descricao": "Garantia de 90 dias e suporte"
   }
  ],
  "anexo2": [
   [
    "Diagnóstico & briefing",
    "Mapa do site e cronograma",
    "2 a 3 dias úteis",
    "50% adiantado, na assinatura"
   ],
   [
    "Layout",
    "Proposta visual da página inicial e das internas",
    "5 a 10 dias úteis",
    "—"
   ],
   [
    "Desenvolvimento",
    "Site completo em link de prévia",
    "5 a 20 dias úteis",
    "—"
   ],
   [
    "Validação",
    "Rodada final de ajustes",
    "2 a 5 dias úteis",
    "—"
   ],
   [
    "Publicação",
    "Site no ar, com domínio e SSL",
    "1 a 2 dias úteis",
    "50% no final, antes da publicação"
   ],
   [
    "Garantia técnica",
    "Correções sem custo",
    "90 dias",
    "—"
   ]
  ],
  "entregaveis": [
   "site publicado no domínio do CONTRATANTE;",
   "acessos administrativos do site, do painel e das ferramentas configuradas;",
   "arquivos do site e código-fonte específico, mediante solicitação;",
   "guia rápido de uso e orientações de manutenção."
  ],
  "clausulas": [
   {
    "n": 1,
    "titulo": "Das Partes",
    "itens": [
     {
      "html": "<strong>CONTRATADA:</strong> {{contratada_nome|Razão social ou nome completo do titular|57.194.521 BRENO RICARDO GUIMARAES|}}, inscrita no CNPJ/CPF sob o nº {{contratada_doc|00.000.000/0001-00|57.194.521/0001-44|}}, com endereço em {{contratada_endereco|endereço completo com CEP||}}, e-mail {{contratada_email|e-mail oficial|brg.ftw@gmail.com|}}, que atua sob o nome <strong>BLAJEEN LABS</strong>, doravante denominada <strong>CONTRATADA</strong>."
     },
     {
      "html": "<strong>CONTRATANTE:</strong> {{contratante_nome|Nome completo ou razão social||}}, inscrito(a) no CPF/CNPJ sob o nº {{contratante_doc|000.000.000-00||}}, com endereço em {{contratante_endereco|endereço completo com CEP||}}, e-mail {{contratante_email|e-mail para comunicações||}}, telefone {{contratante_tel|(00) 00000-0000||}}, representado(a), quando pessoa jurídica, por {{contratante_repr|nome e CPF do representante legal||1}}, doravante denominado(a) <strong>CONTRATANTE</strong>."
     },
     {
      "html": "CONTRATANTE e CONTRATADA, em conjunto denominadas <strong>PARTES</strong>, celebram o presente contrato, que se regerá pelas cláusulas a seguir e pela legislação aplicável, em especial pelos arts. 593 a 609 do Código Civil."
     }
    ]
   },
   {
    "n": 2,
    "titulo": "Do Objeto",
    "itens": [
     {
      "html": "Constitui objeto deste contrato a prestação, pela CONTRATADA, de serviços de <strong>criação e desenvolvimento de site</strong> para o projeto {{projeto_nome|nome do projeto ou da marca||}} (“PROJETO”), conforme o plano, o escopo e as condições definidos no Quadro-Resumo — inclusive no resumo “O combinado”, que registra a ideia e o acordo entre as PARTES — e nos Anexos."
     },
     {
      "html": "O site será desenvolvido com layout exclusivo, alinhado à identidade visual do CONTRATANTE, de forma responsiva (adaptado a celulares, tablets e computadores), e publicado no domínio indicado pelo CONTRATANTE."
     },
     {
      "html": "Integram este contrato, em ordem de prevalência: (i) este instrumento e seu Quadro-Resumo; (ii) o Anexo I — Plano e Escopo; (iii) o Anexo II — Etapas, Prazos e Pagamento; e (iv) a proposta comercial eventualmente enviada, naquilo que não conflitar com os anteriores."
     }
    ]
   },
   {
    "n": 3,
    "titulo": "Do Escopo e das Exclusões",
    "itens": [
     {
      "html": "Estão incluídos no PROJETO, observados os limites do plano escolhido no Anexo I:",
      "lista": [
       "diagnóstico do negócio e briefing;",
       "arquitetura de páginas e organização do conteúdo;",
       "layout exclusivo alinhado à identidade da marca;",
       "desenvolvimento responsivo e otimizado para velocidade;",
       "integrações previstas no plano, como WhatsApp, formulários, mapa, redes sociais, avaliações do Google e ferramentas de análise;",
       "SEO técnico básico (títulos, descrições, sitemap, dados estruturados e boas práticas de desempenho);",
       "configuração de domínio, certificado de segurança (SSL) e publicação;",
       "painel de gestão e treinamento de uso, quando previstos no plano."
      ]
     },
     {
      "html": "Não estão incluídos, salvo contratação expressa no Anexo I ou por aditivo:",
      "lista": [
       "produção de textos (copywriting), fotografias e vídeos;",
       "criação de logotipo ou identidade visual completa;",
       "gestão de redes sociais, tráfego pago ou campanhas;",
       "cadastro de produtos ou conteúdos acima do volume previsto no plano;",
       "versões em outros idiomas;",
       "custos de terceiros previstos na Cláusula 9."
      ]
     },
     {
      "html": "Qualquer item não descrito expressamente no Anexo I será considerado fora do escopo e poderá ser orçado à parte, nos termos da Cláusula 10."
     }
    ]
   },
   {
    "n": 4,
    "titulo": "Do Domínio, da Hospedagem e do Conteúdo",
    "itens": [
     {
      "html": "O domínio do site (por exemplo, www.suamarca.com.br) será registrado em nome do CONTRATANTE, que será seu titular. A CONTRATADA poderá auxiliar no registro, mediante acesso concedido pelo CONTRATANTE."
     },
     {
      "html": "A hospedagem poderá ser:",
      "lista": [
       "gerenciada pela CONTRATADA, mediante contratação do plano de hospedagem e manutenção indicado no Anexo I; ou",
       "contratada diretamente pelo CONTRATANTE, caso em que a CONTRATADA fará a publicação inicial e o CONTRATANTE responderá pela continuidade do serviço."
      ]
     },
     {
      "html": "Cancelado o plano de hospedagem gerenciada, a CONTRATADA fornecerá, em até 15 (quinze) dias, os arquivos do site para migração, desde que não haja pendências financeiras."
     },
     {
      "html": "O CONTRATANTE enviará textos, imagens, logotipo e demais conteúdos em até 10 (dez) dias úteis após o início. Na falta de conteúdo, a CONTRATADA poderá utilizar textos e imagens provisórios, que deverão ser substituídos ou aprovados pelo CONTRATANTE antes da publicação."
     },
     {
      "html": "O site será testado nas versões atuais dos navegadores Chrome, Safari, Edge e Firefox, em celulares e computadores. Versões descontinuadas de navegadores não estão cobertas."
     },
     {
      "html": "Loja virtual (quando contratada): a conta de meios de pagamento (ex.: Mercado Pago, Pagar.me, Stripe) será aberta em nome do CONTRATANTE, que responde pelas taxas, pela emissão de documentos fiscais, pela política de trocas e pelas obrigações do Código de Defesa do Consumidor e do Decreto nº 7.962/2013 (comércio eletrônico)."
     },
     {
      "html": "O posicionamento no Google e em outros buscadores depende de fatores externos (concorrência, conteúdo, algoritmos) e não é garantido."
     }
    ]
   },
   {
    "n": 5,
    "titulo": "Das Etapas, Prazos e Aprovações",
    "itens": [
     {
      "html": "O PROJETO será desenvolvido nas etapas descritas no Anexo II, com prazo estimado de {{prazo|00 dias úteis||}}, contado a partir do último dos seguintes eventos: (i) assinatura deste contrato; (ii) confirmação do pagamento da primeira parcela; e (iii) recebimento dos materiais e informações necessários ao início."
     },
     {
      "html": "Ao final de cada etapa, a CONTRATADA apresentará o respectivo entregável. O CONTRATANTE terá até 5 (cinco) dias úteis para aprová-lo ou solicitar ajustes, de forma consolidada e por escrito."
     },
     {
      "html": "Decorrido esse prazo sem manifestação, a etapa será considerada aprovada e o PROJETO seguirá para a etapa seguinte."
     },
     {
      "html": "Estão incluídas 2 (duas) rodadas de ajustes na etapa de layout e 1 (uma) rodada após a implementação, antes da publicação. Ajustes além desse limite, ou mudanças de direção após a aprovação de uma etapa, serão tratados como alteração de escopo."
     },
     {
      "html": "Os prazos serão prorrogados pelo mesmo período de eventuais atrasos do CONTRATANTE no envio de materiais, aprovações ou pagamentos, bem como em caso fortuito ou de força maior (art. 393 do Código Civil)."
     },
     {
      "html": "Se o PROJETO permanecer parado por mais de 30 (trinta) dias corridos por falta de retorno do CONTRATANTE, a CONTRATADA poderá suspendê-lo e reagendar a retomada conforme sua disponibilidade. Após 60 (sessenta) dias de paralisação, a CONTRATADA poderá considerar o contrato encerrado, sendo devidos os valores das etapas executadas até então."
     }
    ]
   },
   {
    "n": 6,
    "titulo": "Das Obrigações da CONTRATADA",
    "itens": [
     {
      "html": "São obrigações da CONTRATADA:",
      "lista": [
       "executar os serviços com qualidade técnica, zelo e boas práticas de mercado;",
       "manter o CONTRATANTE informado sobre o andamento do PROJETO, com atualizações ao menos semanais;",
       "cumprir os prazos estabelecidos, ressalvadas as hipóteses de prorrogação previstas neste contrato;",
       "orientar o CONTRATANTE sobre os materiais, acessos e decisões necessários em cada etapa;",
       "corrigir, sem custo, as falhas cobertas pela garantia técnica;",
       "entregar, após a quitação, os arquivos, acessos e credenciais previstos no Anexo I;",
       "entregar ao CONTRATANTE os acessos administrativos do site e do painel, quando houver."
      ]
     }
    ]
   },
   {
    "n": 7,
    "titulo": "Das Obrigações do CONTRATANTE",
    "itens": [
     {
      "html": "São obrigações do CONTRATANTE:",
      "lista": [
       "fornecer, nos prazos combinados, as informações, conteúdos, materiais, acessos e aprovações necessários;",
       "garantir que possui os direitos e as autorizações sobre marcas, textos, imagens, vídeos, músicas, dados e demais materiais que fornecer, respondendo por eventuais violações de direitos de terceiros;",
       "efetuar os pagamentos nas datas acordadas;",
       "indicar um responsável pelas aprovações, com autonomia para decidir em seu nome;",
       "contratar e manter ativos os serviços de terceiros previstos na Cláusula 9;",
       "revisar o conteúdo final antes de sua publicação ou utilização;",
       "manter ativos o domínio e, se for o caso, a hospedagem contratada diretamente."
      ]
     }
    ]
   },
   {
    "n": 8,
    "titulo": "Do Investimento e das Condições de Pagamento",
    "itens": [
     {
      "html": "Pelos serviços, o CONTRATANTE pagará à CONTRATADA o valor total de <strong>R$ {{valor_total|0.000,00||}}</strong> ({{valor_extenso|valor por extenso||}}), correspondente ao plano e aos itens selecionados no Anexo I."
     },
     {
      "html": "Condições de pagamento: {{forma_pagamento|condições de pagamento|50% adiantado, na assinatura, e 50% no final, antes da publicação|}}, conforme o Anexo II. Meios aceitos: Pix, transferência, boleto ou cartão de crédito."
     },
     {
      "html": "Parcelamento: {{parcelamento|à vista|à vista|}}. Os valores podem ser parcelados com juros — no cartão de crédito, conforme as taxas vigentes do meio de pagamento, ou em outra forma combinada por escrito —, e os juros e encargos do parcelamento são de responsabilidade do CONTRATANTE, somando-se ao valor total deste contrato."
     },
     {
      "html": "O início dos trabalhos está condicionado à confirmação do pagamento da parcela adiantada (50%). O saldo de 50% é devido no final, na etapa indicada no Anexo II, antes da liberação definitiva dos arquivos, acessos e da publicação."
     },
     {
      "html": "Em caso de atraso, incidirão sobre o valor devido multa de 2% (dois por cento), juros de mora de 1% (um por cento) ao mês, calculados pro rata die, e correção monetária pelo IPCA/IBGE."
     },
     {
      "html": "Atrasos superiores a 10 (dez) dias autorizam a CONTRATADA a suspender os serviços até a regularização, com prorrogação dos prazos pelo mesmo período. A entrega final e a transferência de arquivos-fonte, credenciais e direitos ficam condicionadas à quitação integral."
     },
     {
      "html": "Os planos mensais, quando contratados, serão cobrados mensalmente, com vencimento no dia {{dia_venc|10||1}} de cada mês, e reajustados a cada 12 (doze) meses pelo IPCA/IBGE."
     },
     {
      "html": "A CONTRATADA emitirá recibo ou documento fiscal referente a cada pagamento, conforme seu enquadramento tributário."
     }
    ]
   },
   {
    "n": 9,
    "titulo": "Dos Custos de Terceiros",
    "itens": [
     {
      "html": "Não estão incluídos no valor deste contrato, salvo indicação expressa no Anexo I, os custos de serviços, contas e licenças de terceiros, tais como: registro de domínio, hospedagem (quando não gerenciada pela CONTRATADA), e-mails profissionais, temas, plugins ou fontes pagos, bancos de imagens premium e taxas de meios de pagamento."
     },
     {
      "html": "Sempre que possível, esses serviços serão contratados em nome e com os meios de pagamento do CONTRATANTE, que será o titular das respectivas contas. Quando a CONTRATADA adiantar algum desses custos, com autorização prévia, o valor será reembolsado mediante comprovante."
     },
     {
      "html": "A CONTRATADA poderá recomendar fornecedores, mas não responde por alterações de preço, políticas, indisponibilidade ou descontinuidade de serviços de terceiros."
     }
    ]
   },
   {
    "n": 10,
    "titulo": "Das Alterações de Escopo",
    "itens": [
     {
      "html": "Solicitações de novas funcionalidades, páginas, conteúdos, mudanças de direção criativa ou de qualquer item não previsto no Anexo I serão avaliadas pela CONTRATADA, que apresentará orçamento e impacto no prazo antes de executá-las."
     },
     {
      "html": "A alteração somente será executada após aprovação escrita do CONTRATANTE (e-mail é suficiente) e passará a integrar este contrato como aditivo."
     },
     {
      "html": "Pequenos ajustes poderão, a critério da CONTRATADA, ser absorvidos sem custo, o que não gera obrigação de absorver ajustes futuros."
     },
     {
      "html": "Valor de referência para serviços adicionais: R$ {{hora_tecnica|150|150|}} por hora técnica, ou orçamento fechado por item."
     }
    ]
   },
   {
    "n": 11,
    "titulo": "Da Propriedade Intelectual",
    "itens": [
     {
      "html": "Após a quitação integral, a CONTRATADA cede ao CONTRATANTE, em caráter definitivo e exclusivo, os direitos patrimoniais sobre os elementos criados especificamente para o site — como layout, interfaces, código-fonte específico, textos e artes produzidos sob encomenda —, nos termos da Lei nº 9.609/1998 (Lei do Software) e da Lei nº 9.610/1998 (Lei de Direitos Autorais)."
     },
     {
      "html": "Permanecem de titularidade da CONTRATADA os componentes pré-existentes ou genéricos por ela desenvolvidos — bibliotecas, módulos reutilizáveis, modelos-base, ferramentas internas e know-how —, sobre os quais o CONTRATANTE recebe licença de uso perpétua, gratuita, irrevogável e não exclusiva, vinculada ao PROJETO. A CONTRATADA poderá reutilizá-los em outros trabalhos, sem utilizar dados, marca ou conteúdo exclusivo do CONTRATANTE."
     },
     {
      "html": "Componentes de código aberto e de terceiros incorporados ao PROJETO seguem suas próprias licenças, que o CONTRATANTE se compromete a respeitar."
     },
     {
      "html": "Até a quitação integral, o CONTRATANTE terá licença provisória de uso, que poderá ser suspensa em caso de inadimplemento."
     },
     {
      "html": "Portfólio: conforme a opção marcada no Quadro-Resumo, a CONTRATADA poderá exibir o PROJETO (nome, imagens e descrição geral) em seu site, portfólio e redes sociais, sem revelar informações confidenciais."
     },
     {
      "html": "Crédito: conforme a opção marcada no Quadro-Resumo, a CONTRATADA poderá manter crédito discreto (“Desenvolvido por Blajeen Labs”) no rodapé, nos créditos ou na tela “Sobre”. Os direitos morais de autor são preservados em qualquer hipótese (art. 24 da Lei nº 9.610/1998)."
     }
    ]
   },
   {
    "n": 12,
    "titulo": "Das Garantias",
    "itens": [
     {
      "html": "<strong>Garantia Blajeen de 7 dias.</strong> O CONTRATANTE poderá desistir da contratação em até 7 (sete) dias corridos contados da assinatura, com devolução integral dos valores pagos em até 10 (dez) dias úteis, pelo mesmo meio de pagamento, em consonância com o art. 49 do Código de Defesa do Consumidor. O exercício dessa garantia implica a não utilização de qualquer material eventualmente entregue."
     },
     {
      "html": "<strong>Garantia técnica.</strong> Por 90 (noventa) dias contados da publicação, a CONTRATADA corrigirá sem custo as falhas de funcionamento do site em relação ao escopo aprovado."
     },
     {
      "html": "A garantia técnica não cobre:",
      "lista": [
       "alterações feitas pelo CONTRATANTE ou por terceiros;",
       "novas funcionalidades, melhorias ou mudanças de escopo;",
       "falhas, mudanças ou atualizações de serviços de terceiros (hospedagem, APIs, lojas de aplicativos, navegadores, sistemas operacionais);",
       "uso em desacordo com as orientações fornecidas;",
       "conteúdos inseridos pelo CONTRATANTE após a entrega."
      ]
     },
     {
      "html": "As garantias deste contrato somam-se aos direitos previstos na legislação aplicável, sem substituí-los."
     }
    ]
   },
   {
    "n": 13,
    "titulo": "Do Suporte e da Evolução",
    "itens": [
     {
      "html": "Após a garantia técnica, suporte, ajustes, atualizações e melhorias poderão ser contratados por plano mensal (Anexo I) ou por hora técnica."
     },
     {
      "html": "O plano de hospedagem e manutenção, quando contratado, inclui hospedagem, certificado SSL, backups periódicos, monitoramento de disponibilidade e as horas mensais de ajustes indicadas no Anexo I, que não são cumulativas."
     },
     {
      "html": "As solicitações de suporte serão atendidas em dias úteis e horário comercial, pelos canais oficiais, com primeira resposta em até 1 (um) dia útil."
     }
    ]
   },
   {
    "n": 14,
    "titulo": "Da Confidencialidade",
    "itens": [
     {
      "html": "As PARTES manterão sigilo sobre as informações confidenciais a que tiverem acesso em razão deste contrato — dados comerciais e financeiros, estratégias, credenciais, dados de clientes, código-fonte e as condições deste instrumento —, utilizando-as exclusivamente para a execução do PROJETO."
     },
     {
      "html": "A obrigação de sigilo permanece por 5 (cinco) anos após o término do contrato e não se aplica a informações que sejam ou se tornem públicas sem culpa da parte receptora, que já fossem de seu conhecimento, que tenham sido desenvolvidas de forma independente ou cuja divulgação seja exigida por lei ou ordem judicial."
     },
     {
      "html": "Senhas e credenciais compartilhadas durante o PROJETO deverão ser alteradas pelo CONTRATANTE após a entrega final."
     }
    ]
   },
   {
    "n": 15,
    "titulo": "Da Proteção de Dados Pessoais",
    "itens": [
     {
      "html": "As PARTES cumprirão a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD). Em relação aos dados pessoais tratados por meio do PROJETO (por exemplo, dados de clientes, usuários ou contatos do CONTRATANTE), o CONTRATANTE atua como controlador e a CONTRATADA, quando os tratar, como operadora, seguindo exclusivamente as instruções lícitas do CONTRATANTE."
     },
     {
      "html": "A CONTRATADA adotará medidas técnicas e administrativas razoáveis de segurança, limitará o acesso aos profissionais envolvidos no PROJETO e comunicará ao CONTRATANTE, em prazo razoável, os incidentes de segurança de que tiver conhecimento."
     },
     {
      "html": "Cabe ao CONTRATANTE definir as bases legais do tratamento, disponibilizar sua política de privacidade e atender às solicitações dos titulares, podendo a CONTRATADA prestar apoio técnico dentro do escopo contratado."
     },
     {
      "html": "Encerrado o contrato, a CONTRATADA devolverá ou eliminará os dados pessoais sob sua guarda, ressalvadas as hipóteses legais de conservação."
     },
     {
      "html": "Os dados das PARTES e de seus representantes serão tratados apenas para a gestão e a execução deste contrato."
     }
    ]
   },
   {
    "n": 16,
    "titulo": "Da Vigência e da Rescisão",
    "itens": [
     {
      "html": "Este contrato vigora da assinatura até a conclusão do PROJETO e o término da garantia técnica. Os planos mensais, quando contratados, vigoram por prazo indeterminado e podem ser cancelados por qualquer das PARTES mediante aviso prévio de 30 (trinta) dias."
     },
     {
      "html": "Qualquer das PARTES poderá rescindir o contrato em caso de descumprimento da outra que não seja sanado em até 10 (dez) dias após notificação por escrito."
     },
     {
      "html": "Rescisão sem justa causa pelo CONTRATANTE, após o prazo da Garantia Blajeen de 7 dias: serão devidos os valores das etapas já executadas e, proporcionalmente, da etapa em andamento, acrescidos de multa compensatória de 10% (dez por cento) sobre o saldo não executado do contrato."
     },
     {
      "html": "Rescisão sem justa causa pela CONTRATADA: esta devolverá os valores pagos referentes às etapas não executadas, entregará o que tiver sido produzido até então e pagará multa compensatória de 10% (dez por cento) sobre o saldo não executado do contrato."
     },
     {
      "html": "Em qualquer hipótese de encerramento, a CONTRATADA entregará os materiais correspondentes às etapas pagas."
     }
    ]
   },
   {
    "n": 17,
    "titulo": "Da Responsabilidade",
    "itens": [
     {
      "html": "A CONTRATADA responde pelos danos diretos que comprovadamente causar por culpa na execução dos serviços, limitados, na máxima extensão permitida pela legislação, ao valor total efetivamente pago por este contrato."
     },
     {
      "html": "A CONTRATADA não responde por:",
      "lista": [
       "lucros cessantes, perda de receita ou resultados comerciais esperados, como vendas, acessos, engajamento ou posição em buscadores;",
       "indisponibilidade, falhas ou mudanças de serviços de terceiros;",
       "incidentes decorrentes de senhas ou acessos mal guardados pelo CONTRATANTE ou por sua equipe;",
       "conteúdos fornecidos, publicados ou alterados pelo CONTRATANTE."
      ]
     },
     {
      "html": "A CONTRATADA se obriga a entregar o escopo contratado; resultados de negócio dependem de fatores externos e não são garantidos."
     }
    ]
   },
   {
    "n": 18,
    "titulo": "Das Disposições Gerais",
    "itens": [
     {
      "html": "Este contrato não cria vínculo empregatício, societário ou de representação entre as PARTES. Cada parte responde por seus tributos, encargos e colaboradores."
     },
     {
      "html": "A CONTRATADA poderá contar com colaboradores e parceiros especializados, permanecendo responsável perante o CONTRATANTE pela execução do PROJETO."
     },
     {
      "html": "As comunicações oficiais serão feitas pelos e-mails indicados no Quadro-Resumo. Aprovações e solicitações também poderão ser registradas por aplicativo de mensagens, desde que de forma clara e inequívoca."
     },
     {
      "html": "A tolerância quanto ao descumprimento de qualquer cláusula não implica renúncia nem novação. Nenhuma das PARTES poderá ceder este contrato sem a concordância da outra, e a invalidade de qualquer disposição não prejudica as demais."
     },
     {
      "html": "Alterações a este contrato somente terão validade por escrito, inclusive por e-mail ou aditivo assinado eletronicamente."
     },
     {
      "html": "<strong>Assinatura eletrônica.</strong> As PARTES reconhecem a validade da assinatura deste contrato por meio eletrônico, nos termos do art. 10, § 2º, da Medida Provisória nº 2.200-2/2001 e da Lei nº 14.063/2020, e concordam que, conferida a integridade pelo provedor de assinatura, fica dispensada a assinatura de testemunhas (art. 784, § 4º, do Código de Processo Civil)."
     }
    ]
   },
   {
    "n": 19,
    "titulo": "Do Foro",
    "itens": [
     {
      "html": "Fica eleito o foro da Comarca de {{cidade_foro|Cidade/UF||}} para dirimir as questões oriundas deste contrato, ressalvado o direito do CONTRATANTE, quando consumidor, de demandar no foro de seu domicílio."
     },
     {
      "html": "Antes de qualquer medida judicial, as PARTES se comprometem a buscar solução amigável por negociação direta, pelo prazo mínimo de 15 (quinze) dias."
     }
    ]
   }
  ]
 },
 "sistema": {
  "slug": "sistema",
  "codigo": "SIS",
  "indice": "02",
  "tituloCurto": "Sistema",
  "h1": "Desenvolvimento<br>de <span class=\"em\">Sistema.</span>",
  "lead": "Sistemas, aplicativos e programas sob medida para tirar a operação do improviso — com clareza, segurança e espaço para crescer.",
  "revisoesCurto": "2 rodadas no protótipo + correções do aceite",
  "garantiaCurto": "7 dias de satisfação · 90 dias de garantia técnica",
  "pagamento": "50% adiantado, na assinatura, e 50% no final, no aceite do SISTEMA",
  "multiPlano": false,
  "etapas": [
   {
    "titulo": "Diagnóstico",
    "descricao": "Operação e requisitos"
   },
   {
    "titulo": "Protótipo",
    "descricao": "Telas principais para aprovar"
   },
   {
    "titulo": "Desenvolvimento",
    "descricao": "Entregas parciais em ciclos"
   },
   {
    "titulo": "Homologação",
    "descricao": "Testes de aceite"
   },
   {
    "titulo": "Implantação",
    "descricao": "Produção e treinamento"
   },
   {
    "titulo": "Evolução",
    "descricao": "Garantia de 90 dias e suporte"
   }
  ],
  "anexo2": [
   [
    "Diagnóstico & requisitos",
    "Documento de Requisitos",
    "5 a 10 dias úteis",
    "50% adiantado, na assinatura"
   ],
   [
    "Protótipo de interface",
    "Telas principais navegáveis",
    "5 a 10 dias úteis",
    "—"
   ],
   [
    "Desenvolvimento",
    "Entregas parciais a cada ~15 dias",
    "20 a 90 dias úteis",
    "—"
   ],
   [
    "Homologação",
    "Ambiente de testes e correções",
    "5 a 10 dias úteis",
    "—"
   ],
   [
    "Implantação & treinamento",
    "SISTEMA em produção + treinamento",
    "2 a 5 dias úteis",
    "50% no final, no aceite"
   ],
   [
    "Garantia técnica",
    "Correções sem custo",
    "90 dias",
    "—"
   ]
  ],
  "entregaveis": [
   "SISTEMA implantado em produção, com acessos de administrador;",
   "código-fonte em repositório transferido ao CONTRATANTE;",
   "Documento de Requisitos e documentação técnica de implantação;",
   "gravação ou material de apoio do treinamento;",
   "aplicativos publicados nas contas do CONTRATANTE, quando previstos."
  ],
  "clausulas": [
   {
    "n": 1,
    "titulo": "Das Partes",
    "itens": [
     {
      "html": "<strong>CONTRATADA:</strong> {{contratada_nome|Razão social ou nome completo do titular|57.194.521 BRENO RICARDO GUIMARAES|}}, inscrita no CNPJ/CPF sob o nº {{contratada_doc|00.000.000/0001-00|57.194.521/0001-44|}}, com endereço em {{contratada_endereco|endereço completo com CEP||}}, e-mail {{contratada_email|e-mail oficial|brg.ftw@gmail.com|}}, que atua sob o nome <strong>BLAJEEN LABS</strong>, doravante denominada <strong>CONTRATADA</strong>."
     },
     {
      "html": "<strong>CONTRATANTE:</strong> {{contratante_nome|Nome completo ou razão social||}}, inscrito(a) no CPF/CNPJ sob o nº {{contratante_doc|000.000.000-00||}}, com endereço em {{contratante_endereco|endereço completo com CEP||}}, e-mail {{contratante_email|e-mail para comunicações||}}, telefone {{contratante_tel|(00) 00000-0000||}}, representado(a), quando pessoa jurídica, por {{contratante_repr|nome e CPF do representante legal||1}}, doravante denominado(a) <strong>CONTRATANTE</strong>."
     },
     {
      "html": "CONTRATANTE e CONTRATADA, em conjunto denominadas <strong>PARTES</strong>, celebram o presente contrato, que se regerá pelas cláusulas a seguir e pela legislação aplicável, em especial pelos arts. 593 a 609 do Código Civil."
     }
    ]
   },
   {
    "n": 2,
    "titulo": "Do Objeto",
    "itens": [
     {
      "html": "Constitui objeto deste contrato a prestação, pela CONTRATADA, de serviços de <strong>desenvolvimento de sistema, aplicativo ou programa sob medida</strong> para o projeto {{projeto_nome|nome do projeto ou da marca||}} (“PROJETO”), conforme o plano, o escopo e as condições definidos no Quadro-Resumo — inclusive no resumo “O combinado”, que registra a ideia e o acordo entre as PARTES — e nos Anexos."
     },
     {
      "html": "Para fins deste contrato, “SISTEMA” compreende a aplicação web, o aplicativo móvel e/ou o programa de computador descritos no plano contratado."
     },
     {
      "html": "O SISTEMA será desenvolvido de acordo com o Documento de Requisitos elaborado na etapa de Diagnóstico e aprovado pelo CONTRATANTE, que passará a integrar o Anexo I como referência do escopo."
     },
     {
      "html": "Integram este contrato, em ordem de prevalência: (i) este instrumento e seu Quadro-Resumo; (ii) o Anexo I — Plano e Escopo; (iii) o Anexo II — Etapas, Prazos e Pagamento; e (iv) a proposta comercial eventualmente enviada, naquilo que não conflitar com os anteriores."
     }
    ]
   },
   {
    "n": 3,
    "titulo": "Do Escopo e das Exclusões",
    "itens": [
     {
      "html": "Estão incluídos no PROJETO, observados os limites do plano escolhido no Anexo I:",
      "lista": [
       "diagnóstico da operação e levantamento de requisitos;",
       "Documento de Requisitos, com módulos, perfis de acesso e fluxos principais;",
       "protótipo de interface das telas principais para aprovação;",
       "desenvolvimento de interface, regras de negócio, banco de dados e painel administrativo;",
       "autenticação de usuários e perfis de permissão;",
       "integrações previstas no plano (ex.: pagamentos, WhatsApp, e-mail, APIs);",
       "ambiente de homologação para testes do CONTRATANTE;",
       "implantação em produção e treinamento de uso (até 2 horas, online);",
       "documentação técnica básica de implantação e manutenção."
      ]
     },
     {
      "html": "Não estão incluídos, salvo contratação expressa no Anexo I ou por aditivo:",
      "lista": [
       "migração ou importação de dados de sistemas anteriores, salvo previsão no Anexo I;",
       "integrações, módulos ou relatórios não descritos no Documento de Requisitos;",
       "cadastro de dados operacionais (clientes, produtos, estoque);",
       "infraestrutura, licenças e contas de terceiros;",
       "equipamentos (computadores, impressoras, leitores);",
       "suporte aos usuários finais do CONTRATANTE após a garantia, salvo plano mensal."
      ]
     },
     {
      "html": "Qualquer item não descrito expressamente no Anexo I será considerado fora do escopo e poderá ser orçado à parte, nos termos da Cláusula 11."
     }
    ]
   },
   {
    "n": 4,
    "titulo": "Dos Requisitos, da Homologação e do Aceite",
    "itens": [
     {
      "html": "O Documento de Requisitos aprovado constitui a referência do escopo. Funcionalidades nele não previstas seguirão a Cláusula 11."
     },
     {
      "html": "A CONTRATADA disponibilizará ambiente de homologação para testes. O CONTRATANTE terá até 7 (sete) dias úteis para realizar os testes de aceite, registrando por escrito as falhas encontradas, com descrição e, se possível, os passos para reproduzi-las."
     },
     {
      "html": "Considera-se falha o comportamento do SISTEMA divergente dos requisitos aprovados. Sugestões de melhoria são bem-vindas e serão tratadas como evolução."
     },
     {
      "html": "Corrigidas as falhas apontadas, ou decorrido o prazo sem apontamentos, o SISTEMA será considerado aceito e poderá ser implantado em produção. A utilização do SISTEMA em produção pelo CONTRATANTE também caracteriza o aceite."
     }
    ]
   },
   {
    "n": 5,
    "titulo": "Da Tecnologia, da Infraestrutura e do Código-Fonte",
    "itens": [
     {
      "html": "A CONTRATADA definirá a arquitetura e as tecnologias mais adequadas ao PROJETO, priorizando soluções consolidadas, seguras e com custo de operação compatível com o porte do CONTRATANTE."
     },
     {
      "html": "As contas de infraestrutura (hospedagem, banco de dados, armazenamento, envio de e-mails, lojas de aplicativos e similares) serão, preferencialmente, abertas em nome do CONTRATANTE, que concederá à CONTRATADA o acesso técnico necessário."
     },
     {
      "html": "Após a quitação integral, a CONTRATADA entregará o código-fonte do SISTEMA por meio de repositório transferido ao CONTRATANTE (ex.: GitHub), acompanhado de instruções de implantação."
     },
     {
      "html": "Aplicativos móveis dependem de aprovação da Apple (App Store) e do Google (Google Play), cujas decisões não estão sob controle da CONTRATADA, que fará, dentro do escopo, os ajustes razoáveis solicitados pelas lojas."
     },
     {
      "html": "A CONTRATADA adotará boas práticas de desenvolvimento seguro, como controle de acesso por perfil, criptografia em trânsito e validação de dados, o que não representa garantia absoluta contra incidentes."
     },
     {
      "html": "Quando a infraestrutura for gerenciada pela CONTRATADA, serão configuradas rotinas automáticas de backup. Nos demais casos, a política de backup é de responsabilidade do CONTRATANTE."
     },
     {
      "html": "Encerrada a relação, a CONTRATADA apoiará a exportação dos dados do CONTRATANTE em formato aberto (ex.: CSV ou JSON), sem custo adicional quando solicitada em até 30 (trinta) dias."
     }
    ]
   },
   {
    "n": 6,
    "titulo": "Das Etapas, Prazos e Aprovações",
    "itens": [
     {
      "html": "O PROJETO será desenvolvido nas etapas descritas no Anexo II, com prazo estimado de {{prazo|00 dias úteis||}}, contado a partir do último dos seguintes eventos: (i) assinatura deste contrato; (ii) confirmação do pagamento da primeira parcela; e (iii) recebimento dos materiais e informações necessários ao início."
     },
     {
      "html": "Ao final de cada etapa, a CONTRATADA apresentará o respectivo entregável. O CONTRATANTE terá até 5 (cinco) dias úteis para aprová-lo ou solicitar ajustes, de forma consolidada e por escrito."
     },
     {
      "html": "Decorrido esse prazo sem manifestação, a etapa será considerada aprovada e o PROJETO seguirá para a etapa seguinte."
     },
     {
      "html": "Estão incluídas 2 (duas) rodadas de ajustes no protótipo de interface e as correções decorrentes dos testes de aceite. Ajustes além desse limite, ou mudanças de direção após a aprovação de uma etapa, serão tratados como alteração de escopo."
     },
     {
      "html": "Os prazos serão prorrogados pelo mesmo período de eventuais atrasos do CONTRATANTE no envio de materiais, aprovações ou pagamentos, bem como em caso fortuito ou de força maior (art. 393 do Código Civil)."
     },
     {
      "html": "Se o PROJETO permanecer parado por mais de 30 (trinta) dias corridos por falta de retorno do CONTRATANTE, a CONTRATADA poderá suspendê-lo e reagendar a retomada conforme sua disponibilidade. Após 60 (sessenta) dias de paralisação, a CONTRATADA poderá considerar o contrato encerrado, sendo devidos os valores das etapas executadas até então."
     }
    ]
   },
   {
    "n": 7,
    "titulo": "Das Obrigações da CONTRATADA",
    "itens": [
     {
      "html": "São obrigações da CONTRATADA:",
      "lista": [
       "executar os serviços com qualidade técnica, zelo e boas práticas de mercado;",
       "manter o CONTRATANTE informado sobre o andamento do PROJETO, com atualizações ao menos semanais;",
       "cumprir os prazos estabelecidos, ressalvadas as hipóteses de prorrogação previstas neste contrato;",
       "orientar o CONTRATANTE sobre os materiais, acessos e decisões necessários em cada etapa;",
       "corrigir, sem custo, as falhas cobertas pela garantia técnica;",
       "entregar, após a quitação, os arquivos, acessos e credenciais previstos no Anexo I;",
       "entregar o código-fonte e a documentação técnica após a quitação."
      ]
     }
    ]
   },
   {
    "n": 8,
    "titulo": "Das Obrigações do CONTRATANTE",
    "itens": [
     {
      "html": "São obrigações do CONTRATANTE:",
      "lista": [
       "fornecer, nos prazos combinados, as informações, conteúdos, materiais, acessos e aprovações necessários;",
       "garantir que possui os direitos e as autorizações sobre marcas, textos, imagens, vídeos, músicas, dados e demais materiais que fornecer, respondendo por eventuais violações de direitos de terceiros;",
       "efetuar os pagamentos nas datas acordadas;",
       "indicar um responsável pelas aprovações, com autonomia para decidir em seu nome;",
       "contratar e manter ativos os serviços de terceiros previstos na Cláusula 10;",
       "revisar o conteúdo final antes de sua publicação ou utilização;",
       "disponibilizar as pessoas-chave da operação para o levantamento de requisitos e os testes de aceite;",
       "manter a confidencialidade de suas senhas e gerenciar os acessos de sua equipe ao SISTEMA."
      ]
     }
    ]
   },
   {
    "n": 9,
    "titulo": "Do Investimento e das Condições de Pagamento",
    "itens": [
     {
      "html": "Pelos serviços, o CONTRATANTE pagará à CONTRATADA o valor total de <strong>R$ {{valor_total|0.000,00||}}</strong> ({{valor_extenso|valor por extenso||}}), correspondente ao plano e aos itens selecionados no Anexo I."
     },
     {
      "html": "Condições de pagamento: {{forma_pagamento|condições de pagamento|50% adiantado, na assinatura, e 50% no final, no aceite do SISTEMA|}}, conforme o Anexo II. Meios aceitos: Pix, transferência, boleto ou cartão de crédito."
     },
     {
      "html": "Parcelamento: {{parcelamento|à vista|à vista|}}. Os valores podem ser parcelados com juros — no cartão de crédito, conforme as taxas vigentes do meio de pagamento, ou em outra forma combinada por escrito —, e os juros e encargos do parcelamento são de responsabilidade do CONTRATANTE, somando-se ao valor total deste contrato."
     },
     {
      "html": "O início dos trabalhos está condicionado à confirmação do pagamento da parcela adiantada (50%). O saldo de 50% é devido no final, na etapa indicada no Anexo II, antes da liberação definitiva dos arquivos, acessos e da publicação."
     },
     {
      "html": "Em caso de atraso, incidirão sobre o valor devido multa de 2% (dois por cento), juros de mora de 1% (um por cento) ao mês, calculados pro rata die, e correção monetária pelo IPCA/IBGE."
     },
     {
      "html": "Atrasos superiores a 10 (dez) dias autorizam a CONTRATADA a suspender os serviços até a regularização, com prorrogação dos prazos pelo mesmo período. A entrega final e a transferência de arquivos-fonte, credenciais e direitos ficam condicionadas à quitação integral."
     },
     {
      "html": "Os planos mensais, quando contratados, serão cobrados mensalmente, com vencimento no dia {{dia_venc|10||1}} de cada mês, e reajustados a cada 12 (doze) meses pelo IPCA/IBGE."
     },
     {
      "html": "A CONTRATADA emitirá recibo ou documento fiscal referente a cada pagamento, conforme seu enquadramento tributário."
     }
    ]
   },
   {
    "n": 10,
    "titulo": "Dos Custos de Terceiros",
    "itens": [
     {
      "html": "Não estão incluídos no valor deste contrato, salvo indicação expressa no Anexo I, os custos de serviços, contas e licenças de terceiros, tais como: hospedagem e servidores em nuvem, banco de dados, armazenamento de arquivos, envio de e-mails e SMS, APIs pagas (ex.: WhatsApp oficial, mapas, emissão fiscal), taxas de meios de pagamento e contas de desenvolvedor nas lojas de aplicativos."
     },
     {
      "html": "Sempre que possível, esses serviços serão contratados em nome e com os meios de pagamento do CONTRATANTE, que será o titular das respectivas contas. Quando a CONTRATADA adiantar algum desses custos, com autorização prévia, o valor será reembolsado mediante comprovante."
     },
     {
      "html": "A CONTRATADA poderá recomendar fornecedores, mas não responde por alterações de preço, políticas, indisponibilidade ou descontinuidade de serviços de terceiros."
     }
    ]
   },
   {
    "n": 11,
    "titulo": "Das Alterações de Escopo",
    "itens": [
     {
      "html": "Solicitações de novas funcionalidades, páginas, conteúdos, mudanças de direção criativa ou de qualquer item não previsto no Anexo I serão avaliadas pela CONTRATADA, que apresentará orçamento e impacto no prazo antes de executá-las."
     },
     {
      "html": "A alteração somente será executada após aprovação escrita do CONTRATANTE (e-mail é suficiente) e passará a integrar este contrato como aditivo."
     },
     {
      "html": "Pequenos ajustes poderão, a critério da CONTRATADA, ser absorvidos sem custo, o que não gera obrigação de absorver ajustes futuros."
     },
     {
      "html": "Valor de referência para serviços adicionais: R$ {{hora_tecnica|150|150|}} por hora técnica, ou orçamento fechado por item."
     }
    ]
   },
   {
    "n": 12,
    "titulo": "Da Propriedade Intelectual",
    "itens": [
     {
      "html": "Após a quitação integral, a CONTRATADA cede ao CONTRATANTE, em caráter definitivo e exclusivo, os direitos patrimoniais sobre os elementos criados especificamente para o SISTEMA — como layout, interfaces, código-fonte específico, textos e artes produzidos sob encomenda —, nos termos da Lei nº 9.609/1998 (Lei do Software) e da Lei nº 9.610/1998 (Lei de Direitos Autorais)."
     },
     {
      "html": "Permanecem de titularidade da CONTRATADA os componentes pré-existentes ou genéricos por ela desenvolvidos — bibliotecas, módulos reutilizáveis, modelos-base, ferramentas internas e know-how —, sobre os quais o CONTRATANTE recebe licença de uso perpétua, gratuita, irrevogável e não exclusiva, vinculada ao PROJETO. A CONTRATADA poderá reutilizá-los em outros trabalhos, sem utilizar dados, marca ou conteúdo exclusivo do CONTRATANTE."
     },
     {
      "html": "Componentes de código aberto e de terceiros incorporados ao PROJETO seguem suas próprias licenças, que o CONTRATANTE se compromete a respeitar."
     },
     {
      "html": "Até a quitação integral, o CONTRATANTE terá licença provisória de uso, que poderá ser suspensa em caso de inadimplemento."
     },
     {
      "html": "Portfólio: conforme a opção marcada no Quadro-Resumo, a CONTRATADA poderá exibir o PROJETO (nome, imagens e descrição geral) em seu site, portfólio e redes sociais, sem revelar informações confidenciais."
     },
     {
      "html": "Crédito: conforme a opção marcada no Quadro-Resumo, a CONTRATADA poderá manter crédito discreto (“Desenvolvido por Blajeen Labs”) no rodapé, nos créditos ou na tela “Sobre”. Os direitos morais de autor são preservados em qualquer hipótese (art. 24 da Lei nº 9.610/1998)."
     }
    ]
   },
   {
    "n": 13,
    "titulo": "Das Garantias",
    "itens": [
     {
      "html": "<strong>Garantia Blajeen de 7 dias.</strong> O CONTRATANTE poderá desistir da contratação em até 7 (sete) dias corridos contados da assinatura, com devolução integral dos valores pagos em até 10 (dez) dias úteis, pelo mesmo meio de pagamento, em consonância com o art. 49 do Código de Defesa do Consumidor. O exercício dessa garantia implica a não utilização de qualquer material eventualmente entregue."
     },
     {
      "html": "<strong>Garantia técnica.</strong> Por 90 (noventa) dias contados do aceite, a CONTRATADA corrigirá sem custo as falhas do SISTEMA em relação aos requisitos aprovados, com prioridade para as que impeçam a operação."
     },
     {
      "html": "A garantia técnica não cobre:",
      "lista": [
       "alterações feitas pelo CONTRATANTE ou por terceiros;",
       "novas funcionalidades, melhorias ou mudanças de escopo;",
       "falhas, mudanças ou atualizações de serviços de terceiros (hospedagem, APIs, lojas de aplicativos, navegadores, sistemas operacionais);",
       "uso em desacordo com as orientações fornecidas;",
       "conteúdos inseridos pelo CONTRATANTE após a entrega."
      ]
     },
     {
      "html": "As garantias deste contrato somam-se aos direitos previstos na legislação aplicável, sem substituí-los."
     }
    ]
   },
   {
    "n": 14,
    "titulo": "Do Suporte e da Evolução",
    "itens": [
     {
      "html": "Após a garantia técnica, suporte, manutenção evolutiva, atualizações de segurança e melhorias poderão ser contratados por plano mensal (Anexo I) ou por hora técnica."
     },
     {
      "html": "Nos planos mensais, os tempos de primeira resposta, em dias úteis e horário comercial, são:",
      "lista": [
       "falha crítica (SISTEMA indisponível ou operação impedida): até 4 horas úteis no Suporte Profissional e até 1 dia útil no Suporte Essencial;",
       "falha não crítica: até 2 dias úteis;",
       "dúvidas e pequenos ajustes: até 3 dias úteis."
      ]
     },
     {
      "html": "As horas mensais incluídas nos planos não são cumulativas. Horas excedentes, previamente aprovadas, serão cobradas pelo valor da hora técnica."
     }
    ]
   },
   {
    "n": 15,
    "titulo": "Da Confidencialidade",
    "itens": [
     {
      "html": "As PARTES manterão sigilo sobre as informações confidenciais a que tiverem acesso em razão deste contrato — dados comerciais e financeiros, estratégias, credenciais, dados de clientes, código-fonte e as condições deste instrumento —, utilizando-as exclusivamente para a execução do PROJETO."
     },
     {
      "html": "A obrigação de sigilo permanece por 5 (cinco) anos após o término do contrato e não se aplica a informações que sejam ou se tornem públicas sem culpa da parte receptora, que já fossem de seu conhecimento, que tenham sido desenvolvidas de forma independente ou cuja divulgação seja exigida por lei ou ordem judicial."
     },
     {
      "html": "Senhas e credenciais compartilhadas durante o PROJETO deverão ser alteradas pelo CONTRATANTE após a entrega final."
     }
    ]
   },
   {
    "n": 16,
    "titulo": "Da Proteção de Dados Pessoais",
    "itens": [
     {
      "html": "As PARTES cumprirão a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD). Em relação aos dados pessoais tratados por meio do PROJETO (por exemplo, dados de clientes, usuários ou contatos do CONTRATANTE), o CONTRATANTE atua como controlador e a CONTRATADA, quando os tratar, como operadora, seguindo exclusivamente as instruções lícitas do CONTRATANTE."
     },
     {
      "html": "A CONTRATADA adotará medidas técnicas e administrativas razoáveis de segurança, limitará o acesso aos profissionais envolvidos no PROJETO e comunicará ao CONTRATANTE, em prazo razoável, os incidentes de segurança de que tiver conhecimento."
     },
     {
      "html": "Cabe ao CONTRATANTE definir as bases legais do tratamento, disponibilizar sua política de privacidade e atender às solicitações dos titulares, podendo a CONTRATADA prestar apoio técnico dentro do escopo contratado."
     },
     {
      "html": "Encerrado o contrato, a CONTRATADA devolverá ou eliminará os dados pessoais sob sua guarda, ressalvadas as hipóteses legais de conservação."
     },
     {
      "html": "Os dados das PARTES e de seus representantes serão tratados apenas para a gestão e a execução deste contrato."
     }
    ]
   },
   {
    "n": 17,
    "titulo": "Da Vigência e da Rescisão",
    "itens": [
     {
      "html": "Este contrato vigora da assinatura até a conclusão do PROJETO e o término da garantia técnica. Os planos mensais, quando contratados, vigoram por prazo indeterminado e podem ser cancelados por qualquer das PARTES mediante aviso prévio de 30 (trinta) dias."
     },
     {
      "html": "Qualquer das PARTES poderá rescindir o contrato em caso de descumprimento da outra que não seja sanado em até 10 (dez) dias após notificação por escrito."
     },
     {
      "html": "Rescisão sem justa causa pelo CONTRATANTE, após o prazo da Garantia Blajeen de 7 dias: serão devidos os valores das etapas já executadas e, proporcionalmente, da etapa em andamento, acrescidos de multa compensatória de 10% (dez por cento) sobre o saldo não executado do contrato."
     },
     {
      "html": "Rescisão sem justa causa pela CONTRATADA: esta devolverá os valores pagos referentes às etapas não executadas, entregará o que tiver sido produzido até então e pagará multa compensatória de 10% (dez por cento) sobre o saldo não executado do contrato."
     },
     {
      "html": "Em qualquer hipótese de encerramento, a CONTRATADA entregará os materiais correspondentes às etapas pagas."
     }
    ]
   },
   {
    "n": 18,
    "titulo": "Da Responsabilidade",
    "itens": [
     {
      "html": "A CONTRATADA responde pelos danos diretos que comprovadamente causar por culpa na execução dos serviços, limitados, na máxima extensão permitida pela legislação, ao valor total efetivamente pago por este contrato."
     },
     {
      "html": "A CONTRATADA não responde por:",
      "lista": [
       "lucros cessantes, perda de receita ou resultados comerciais esperados, como vendas, acessos, engajamento ou posição em buscadores;",
       "indisponibilidade, falhas ou mudanças de serviços de terceiros;",
       "incidentes decorrentes de senhas ou acessos mal guardados pelo CONTRATANTE ou por sua equipe;",
       "conteúdos fornecidos, publicados ou alterados pelo CONTRATANTE."
      ]
     },
     {
      "html": "A CONTRATADA se obriga a entregar o escopo contratado; resultados de negócio dependem de fatores externos e não são garantidos."
     }
    ]
   },
   {
    "n": 19,
    "titulo": "Das Disposições Gerais",
    "itens": [
     {
      "html": "Este contrato não cria vínculo empregatício, societário ou de representação entre as PARTES. Cada parte responde por seus tributos, encargos e colaboradores."
     },
     {
      "html": "A CONTRATADA poderá contar com colaboradores e parceiros especializados, permanecendo responsável perante o CONTRATANTE pela execução do PROJETO."
     },
     {
      "html": "As comunicações oficiais serão feitas pelos e-mails indicados no Quadro-Resumo. Aprovações e solicitações também poderão ser registradas por aplicativo de mensagens, desde que de forma clara e inequívoca."
     },
     {
      "html": "A tolerância quanto ao descumprimento de qualquer cláusula não implica renúncia nem novação. Nenhuma das PARTES poderá ceder este contrato sem a concordância da outra, e a invalidade de qualquer disposição não prejudica as demais."
     },
     {
      "html": "Alterações a este contrato somente terão validade por escrito, inclusive por e-mail ou aditivo assinado eletronicamente."
     },
     {
      "html": "<strong>Assinatura eletrônica.</strong> As PARTES reconhecem a validade da assinatura deste contrato por meio eletrônico, nos termos do art. 10, § 2º, da Medida Provisória nº 2.200-2/2001 e da Lei nº 14.063/2020, e concordam que, conferida a integridade pelo provedor de assinatura, fica dispensada a assinatura de testemunhas (art. 784, § 4º, do Código de Processo Civil)."
     }
    ]
   },
   {
    "n": 20,
    "titulo": "Do Foro",
    "itens": [
     {
      "html": "Fica eleito o foro da Comarca de {{cidade_foro|Cidade/UF||}} para dirimir as questões oriundas deste contrato, ressalvado o direito do CONTRATANTE, quando consumidor, de demandar no foro de seu domicílio."
     },
     {
      "html": "Antes de qualquer medida judicial, as PARTES se comprometem a buscar solução amigável por negociação direta, pelo prazo mínimo de 15 (quinze) dias."
     }
    ]
   }
  ]
 },
 "video": {
  "slug": "video",
  "codigo": "VID",
  "indice": "03",
  "tituloCurto": "Vídeo",
  "h1": "Produção<br>de <span class=\"em\">Vídeo.</span>",
  "lead": "Vídeo profissional para divulgar seu negócio — roteiro, edição e acabamento pensados para prender a atenção nos primeiros segundos.",
  "revisoesCurto": "2 rodadas por vídeo (Trend: 1)",
  "garantiaCurto": "7 dias de satisfação · 30 dias para defeitos técnicos",
  "pagamento": "50% adiantado, na assinatura, e 50% no final, na aprovação da versão final (pacotes mensais: cobrança mensal)",
  "multiPlano": false,
  "etapas": [
   {
    "titulo": "Briefing",
    "descricao": "Objetivo, público e referências"
   },
   {
    "titulo": "Roteiro",
    "descricao": "Gancho, cenas e chamada"
   },
   {
    "titulo": "Produção",
    "descricao": "Captação, IA e edição"
   },
   {
    "titulo": "Ajustes",
    "descricao": "Até 2 rodadas por vídeo"
   },
   {
    "titulo": "Entrega",
    "descricao": "Arquivos finais em alta"
   },
   {
    "titulo": "Constância",
    "descricao": "Pacote mensal (opcional)"
   }
  ],
  "anexo2": [
   [
    "Briefing",
    "Objetivo, referências e materiais",
    "1 dia útil",
    "50% adiantado, na assinatura"
   ],
   [
    "Roteiro / storyboard",
    "Roteiro para aprovação",
    "1 a 3 dias úteis",
    "—"
   ],
   [
    "Produção & edição",
    "Primeira versão (com marca d’água)",
    "2 a 7 dias úteis",
    "—"
   ],
   [
    "Ajustes",
    "Rodadas de ajustes",
    "1 a 3 dias úteis",
    "—"
   ],
   [
    "Entrega final",
    "Arquivos em alta resolução",
    "1 dia útil",
    "50% no final, na aprovação"
   ]
  ],
  "entregaveis": [
   "vídeo(s) final(is) em MP4, nas proporções contratadas;",
   "capa ou thumbnail, quando prevista no plano;",
   "sugestão de legenda para a publicação, quando prevista no plano;",
   "relação de trilhas e bancos utilizados, com as respectivas licenças."
  ],
  "clausulas": [
   {
    "n": 1,
    "titulo": "Das Partes",
    "itens": [
     {
      "html": "<strong>CONTRATADA:</strong> {{contratada_nome|Razão social ou nome completo do titular|57.194.521 BRENO RICARDO GUIMARAES|}}, inscrita no CNPJ/CPF sob o nº {{contratada_doc|00.000.000/0001-00|57.194.521/0001-44|}}, com endereço em {{contratada_endereco|endereço completo com CEP||}}, e-mail {{contratada_email|e-mail oficial|brg.ftw@gmail.com|}}, que atua sob o nome <strong>BLAJEEN LABS</strong>, doravante denominada <strong>CONTRATADA</strong>."
     },
     {
      "html": "<strong>CONTRATANTE:</strong> {{contratante_nome|Nome completo ou razão social||}}, inscrito(a) no CPF/CNPJ sob o nº {{contratante_doc|000.000.000-00||}}, com endereço em {{contratante_endereco|endereço completo com CEP||}}, e-mail {{contratante_email|e-mail para comunicações||}}, telefone {{contratante_tel|(00) 00000-0000||}}, representado(a), quando pessoa jurídica, por {{contratante_repr|nome e CPF do representante legal||1}}, doravante denominado(a) <strong>CONTRATANTE</strong>."
     },
     {
      "html": "CONTRATANTE e CONTRATADA, em conjunto denominadas <strong>PARTES</strong>, celebram o presente contrato, que se regerá pelas cláusulas a seguir e pela legislação aplicável, em especial pelos arts. 593 a 609 do Código Civil."
     }
    ]
   },
   {
    "n": 2,
    "titulo": "Do Objeto",
    "itens": [
     {
      "html": "Constitui objeto deste contrato a prestação, pela CONTRATADA, de serviços de <strong>produção e edição de vídeo</strong> para o projeto {{projeto_nome|nome do projeto ou da marca||}} (“PROJETO”), conforme o plano, o escopo e as condições definidos no Quadro-Resumo — inclusive no resumo “O combinado”, que registra a ideia e o acordo entre as PARTES — e nos Anexos."
     },
     {
      "html": "A quantidade, a duração, o formato e a periodicidade dos vídeos são os definidos no plano escolhido no Anexo I."
     },
     {
      "html": "Integram este contrato, em ordem de prevalência: (i) este instrumento e seu Quadro-Resumo; (ii) o Anexo I — Plano e Escopo; (iii) o Anexo II — Etapas, Prazos e Pagamento; e (iv) a proposta comercial eventualmente enviada, naquilo que não conflitar com os anteriores."
     }
    ]
   },
   {
    "n": 3,
    "titulo": "Do Escopo e das Exclusões",
    "itens": [
     {
      "html": "Estão incluídos no PROJETO, observados os limites do plano escolhido no Anexo I:",
      "lista": [
       "briefing e definição do objetivo de cada vídeo;",
       "roteiro e/ou storyboard para aprovação;",
       "captação ou geração de imagens, inclusive por inteligência artificial e bancos licenciados, conforme o plano;",
       "edição, montagem, correção de cor e tratamento de áudio;",
       "textos animados, legendas e motion graphics;",
       "trilha sonora e efeitos de bibliotecas licenciadas;",
       "locução por inteligência artificial ou banco de vozes, quando prevista no plano;",
       "exportação nos formatos e proporções previstos."
      ]
     },
     {
      "html": "Não estão incluídos, salvo contratação expressa no Anexo I ou por aditivo:",
      "lista": [
       "gravação presencial e deslocamentos, salvo previsão no Anexo I;",
       "atores, modelos, locutores profissionais e figurino;",
       "entrega de arquivos brutos e projetos editáveis;",
       "publicação, gestão de redes sociais e impulsionamento pago;",
       "licenciamento de músicas comerciais de artistas;",
       "traduções e versões em outros idiomas."
      ]
     },
     {
      "html": "Qualquer item não descrito expressamente no Anexo I será considerado fora do escopo e poderá ser orçado à parte, nos termos da Cláusula 11."
     }
    ]
   },
   {
    "n": 4,
    "titulo": "Do Roteiro, dos Ajustes e da Entrega",
    "itens": [
     {
      "html": "O roteiro ou storyboard aprovado é a referência criativa do vídeo. Mudanças de conceito, roteiro ou estrutura após a aprovação serão tratadas como novo escopo."
     },
     {
      "html": "Os ajustes na edição devem ser enviados em lista única e consolidada por rodada. São considerados ajustes: cortes, ordem de cenas, textos, legendas, cores e troca de trilha dentro da biblioteca licenciada."
     },
     {
      "html": "A versão para aprovação poderá ser enviada em resolução reduzida ou com marca d’água. Os arquivos finais, em alta resolução e sem marca d’água, serão liberados após a quitação."
     },
     {
      "html": "Formato de entrega: MP4 (H.264), em Full HD (1080p) — ou 4K, quando contratado —, nas proporções previstas no plano (ex.: 9:16, 1:1, 16:9)."
     },
     {
      "html": "Os arquivos serão entregues por link de download, disponível por 30 (trinta) dias. Após esse período, a CONTRATADA não é obrigada a manter cópias, cabendo ao CONTRATANTE fazer o seu backup."
     },
     {
      "html": "Pacotes mensais: vídeos não produzidos no mês por falta de materiais ou aprovações do CONTRATANTE poderão ser compensados no mês seguinte, sem acúmulo adicional."
     }
    ]
   },
   {
    "n": 5,
    "titulo": "Do Direito de Imagem, da Música e da Inteligência Artificial",
    "itens": [
     {
      "html": "O CONTRATANTE declara possuir autorização para o uso da imagem, da voz e do nome de todas as pessoas que aparecem nos materiais que fornecer — bem como dos tutores de animais e dos responsáveis por locais e marcas exibidos —, nos termos do art. 20 do Código Civil, e responde por eventuais reclamações de terceiros."
     },
     {
      "html": "Trilhas, efeitos, fontes e imagens de bancos são licenciados para uso no vídeo contratado e não podem ser extraídos ou reutilizados separadamente. Músicas fornecidas pelo CONTRATANTE são de sua responsabilidade, inclusive quanto a bloqueios ou remoções por direitos autorais nas plataformas."
     },
     {
      "html": "A CONTRATADA poderá utilizar ferramentas de inteligência artificial generativa em etapas de criação (imagens, animações, vozes e efeitos), sempre com curadoria e edição humanas. Conteúdos gerados ou alterados por IA serão sinalizados quando exigido pelas políticas das plataformas de publicação."
     },
     {
      "html": "Não serão produzidos conteúdos que simulem pessoas reais sem autorização expressa, nem conteúdos ilícitos, enganosos ou que violem direitos de terceiros."
     },
     {
      "html": "A CONTRATADA não garante número de visualizações, alcance, engajamento ou vendas, que dependem de fatores externos, como algoritmos das plataformas, público e investimento em mídia."
     }
    ]
   },
   {
    "n": 6,
    "titulo": "Das Etapas, Prazos e Aprovações",
    "itens": [
     {
      "html": "O PROJETO será desenvolvido nas etapas descritas no Anexo II, com prazo estimado de {{prazo|00 dias úteis||}}, contado a partir do último dos seguintes eventos: (i) assinatura deste contrato; (ii) confirmação do pagamento da primeira parcela; e (iii) recebimento dos materiais e informações necessários ao início."
     },
     {
      "html": "Ao final de cada etapa, a CONTRATADA apresentará o respectivo entregável. O CONTRATANTE terá até 5 (cinco) dias úteis para aprová-lo ou solicitar ajustes, de forma consolidada e por escrito."
     },
     {
      "html": "Decorrido esse prazo sem manifestação, a etapa será considerada aprovada e o PROJETO seguirá para a etapa seguinte."
     },
     {
      "html": "Estão incluídas 2 (duas) rodadas de ajustes na edição de cada vídeo (1 rodada no plano Vídeo Trend). Ajustes além desse limite, ou mudanças de direção após a aprovação de uma etapa, serão tratados como alteração de escopo."
     },
     {
      "html": "Os prazos serão prorrogados pelo mesmo período de eventuais atrasos do CONTRATANTE no envio de materiais, aprovações ou pagamentos, bem como em caso fortuito ou de força maior (art. 393 do Código Civil)."
     },
     {
      "html": "Se o PROJETO permanecer parado por mais de 30 (trinta) dias corridos por falta de retorno do CONTRATANTE, a CONTRATADA poderá suspendê-lo e reagendar a retomada conforme sua disponibilidade. Após 60 (sessenta) dias de paralisação, a CONTRATADA poderá considerar o contrato encerrado, sendo devidos os valores das etapas executadas até então."
     }
    ]
   },
   {
    "n": 7,
    "titulo": "Das Obrigações da CONTRATADA",
    "itens": [
     {
      "html": "São obrigações da CONTRATADA:",
      "lista": [
       "executar os serviços com qualidade técnica, zelo e boas práticas de mercado;",
       "manter o CONTRATANTE informado sobre o andamento do PROJETO, com atualizações ao menos semanais;",
       "cumprir os prazos estabelecidos, ressalvadas as hipóteses de prorrogação previstas neste contrato;",
       "orientar o CONTRATANTE sobre os materiais, acessos e decisões necessários em cada etapa;",
       "corrigir, sem custo, as falhas cobertas pela garantia técnica;",
       "entregar, após a quitação, os arquivos, acessos e credenciais previstos no Anexo I;",
       "preservar os materiais enviados pelo CONTRATANTE durante a produção e até o fim do prazo de disponibilidade do link."
      ]
     }
    ]
   },
   {
    "n": 8,
    "titulo": "Das Obrigações do CONTRATANTE",
    "itens": [
     {
      "html": "São obrigações do CONTRATANTE:",
      "lista": [
       "fornecer, nos prazos combinados, as informações, conteúdos, materiais, acessos e aprovações necessários;",
       "garantir que possui os direitos e as autorizações sobre marcas, textos, imagens, vídeos, músicas, dados e demais materiais que fornecer, respondendo por eventuais violações de direitos de terceiros;",
       "efetuar os pagamentos nas datas acordadas;",
       "indicar um responsável pelas aprovações, com autonomia para decidir em seu nome;",
       "contratar e manter ativos os serviços de terceiros previstos na Cláusula 10;",
       "revisar o conteúdo final antes de sua publicação ou utilização;",
       "enviar logotipo, fotos, vídeos, textos e referências em boa qualidade e dentro dos prazos combinados;",
       "informar, no briefing, as informações obrigatórias do seu segmento (preços, condições, registros profissionais, avisos legais)."
      ]
     }
    ]
   },
   {
    "n": 9,
    "titulo": "Do Investimento e das Condições de Pagamento",
    "itens": [
     {
      "html": "Pelos serviços, o CONTRATANTE pagará à CONTRATADA o valor total de <strong>R$ {{valor_total|0.000,00||}}</strong> ({{valor_extenso|valor por extenso||}}), correspondente ao plano e aos itens selecionados no Anexo I."
     },
     {
      "html": "Condições de pagamento: {{forma_pagamento|condições de pagamento|50% adiantado, na assinatura, e 50% no final, na aprovação da versão final (pacotes mensais: cobrança mensal)|}}, conforme o Anexo II. Meios aceitos: Pix, transferência, boleto ou cartão de crédito."
     },
     {
      "html": "Parcelamento: {{parcelamento|à vista|à vista|}}. Os valores podem ser parcelados com juros — no cartão de crédito, conforme as taxas vigentes do meio de pagamento, ou em outra forma combinada por escrito —, e os juros e encargos do parcelamento são de responsabilidade do CONTRATANTE, somando-se ao valor total deste contrato."
     },
     {
      "html": "O início dos trabalhos está condicionado à confirmação do pagamento da parcela adiantada (50%). O saldo de 50% é devido no final, na etapa indicada no Anexo II, antes da liberação definitiva dos arquivos, acessos e da publicação."
     },
     {
      "html": "Em caso de atraso, incidirão sobre o valor devido multa de 2% (dois por cento), juros de mora de 1% (um por cento) ao mês, calculados pro rata die, e correção monetária pelo IPCA/IBGE."
     },
     {
      "html": "Atrasos superiores a 10 (dez) dias autorizam a CONTRATADA a suspender os serviços até a regularização, com prorrogação dos prazos pelo mesmo período. A entrega final e a transferência de arquivos-fonte, credenciais e direitos ficam condicionadas à quitação integral."
     },
     {
      "html": "Os planos mensais, quando contratados, serão cobrados mensalmente, com vencimento no dia {{dia_venc|10||1}} de cada mês, e reajustados a cada 12 (doze) meses pelo IPCA/IBGE."
     },
     {
      "html": "A CONTRATADA emitirá recibo ou documento fiscal referente a cada pagamento, conforme seu enquadramento tributário."
     }
    ]
   },
   {
    "n": 10,
    "titulo": "Dos Custos de Terceiros",
    "itens": [
     {
      "html": "Não estão incluídos no valor deste contrato, salvo indicação expressa no Anexo I, os custos de serviços, contas e licenças de terceiros, tais como: músicas comerciais, bancos de imagens premium solicitados pelo CONTRATANTE, locutores e atores profissionais, e deslocamento, hospedagem e alimentação em gravações externas."
     },
     {
      "html": "Sempre que possível, esses serviços serão contratados em nome e com os meios de pagamento do CONTRATANTE, que será o titular das respectivas contas. Quando a CONTRATADA adiantar algum desses custos, com autorização prévia, o valor será reembolsado mediante comprovante."
     },
     {
      "html": "A CONTRATADA poderá recomendar fornecedores, mas não responde por alterações de preço, políticas, indisponibilidade ou descontinuidade de serviços de terceiros."
     }
    ]
   },
   {
    "n": 11,
    "titulo": "Das Alterações de Escopo",
    "itens": [
     {
      "html": "Solicitações de novas funcionalidades, páginas, conteúdos, mudanças de direção criativa ou de qualquer item não previsto no Anexo I serão avaliadas pela CONTRATADA, que apresentará orçamento e impacto no prazo antes de executá-las."
     },
     {
      "html": "A alteração somente será executada após aprovação escrita do CONTRATANTE (e-mail é suficiente) e passará a integrar este contrato como aditivo."
     },
     {
      "html": "Pequenos ajustes poderão, a critério da CONTRATADA, ser absorvidos sem custo, o que não gera obrigação de absorver ajustes futuros."
     },
     {
      "html": "Valor de referência para serviços adicionais: R$ {{hora_tecnica|150|150|}} por hora técnica, ou orçamento fechado por item."
     }
    ]
   },
   {
    "n": 12,
    "titulo": "Da Propriedade Intelectual",
    "itens": [
     {
      "html": "Após a quitação integral, a CONTRATADA cede ao CONTRATANTE os direitos patrimoniais sobre o vídeo final, que poderá ser utilizado livremente para fins de comunicação e divulgação — redes sociais, sites, anúncios, televisão, eventos e pontos de venda —, em território mundial e por prazo indeterminado, nos termos da Lei nº 9.610/1998."
     },
     {
      "html": "Não estão incluídos na cessão:",
      "lista": [
       "trilhas, efeitos, fontes e imagens de bancos de terceiros, que seguem as respectivas licenças;",
       "arquivos brutos, projetos editáveis e elementos intermediários de produção, salvo contratação no Anexo I;",
       "ferramentas, modelos, predefinições e elementos visuais pré-existentes da CONTRATADA."
      ]
     },
     {
      "html": "Até a quitação integral, o CONTRATANTE não poderá veicular o vídeo, salvo autorização expressa da CONTRATADA."
     },
     {
      "html": "Portfólio: conforme a opção marcada no Quadro-Resumo, a CONTRATADA poderá exibir o PROJETO (nome, imagens e descrição geral) em seu site, portfólio e redes sociais, sem revelar informações confidenciais."
     },
     {
      "html": "Crédito: conforme a opção marcada no Quadro-Resumo, a CONTRATADA poderá manter crédito discreto (“Desenvolvido por Blajeen Labs”) ao final do vídeo ou na legenda da publicação. Os direitos morais de autor são preservados em qualquer hipótese (art. 24 da Lei nº 9.610/1998)."
     }
    ]
   },
   {
    "n": 13,
    "titulo": "Das Garantias",
    "itens": [
     {
      "html": "<strong>Garantia Blajeen de 7 dias.</strong> O CONTRATANTE poderá desistir da contratação em até 7 (sete) dias corridos contados da assinatura, com devolução integral dos valores pagos em até 10 (dez) dias úteis, pelo mesmo meio de pagamento, em consonância com o art. 49 do Código de Defesa do Consumidor. O exercício dessa garantia implica a não utilização de qualquer material eventualmente entregue."
     },
     {
      "html": "<strong>Garantia técnica.</strong> Por 30 (trinta) dias contados da entrega, a CONTRATADA corrigirá sem custo defeitos técnicos nos arquivos entregues, como falhas de exportação, arquivos corrompidos ou áudio fora de sincronia."
     },
     {
      "html": "A garantia técnica não cobre:",
      "lista": [
       "alterações de conteúdo, roteiro ou estilo após a aprovação;",
       "alterações feitas pelo CONTRATANTE ou por terceiros nos arquivos;",
       "compressões, cortes ou alterações aplicados pelas plataformas de publicação;",
       "perda dos arquivos após o prazo de disponibilidade do link."
      ]
     },
     {
      "html": "As garantias deste contrato somam-se aos direitos previstos na legislação aplicável, sem substituí-los."
     }
    ]
   },
   {
    "n": 14,
    "titulo": "Do Suporte e da Evolução",
    "itens": [
     {
      "html": "Novos vídeos, versões adicionais e alterações após a entrega poderão ser contratados avulsos ou por pacote mensal (Anexo I)."
     },
     {
      "html": "Os pacotes mensais vigoram por prazo indeterminado, sem fidelidade, e podem ser cancelados com aviso prévio de 30 (trinta) dias."
     }
    ]
   },
   {
    "n": 15,
    "titulo": "Da Confidencialidade",
    "itens": [
     {
      "html": "As PARTES manterão sigilo sobre as informações confidenciais a que tiverem acesso em razão deste contrato — dados comerciais e financeiros, estratégias, credenciais, dados de clientes, código-fonte e as condições deste instrumento —, utilizando-as exclusivamente para a execução do PROJETO."
     },
     {
      "html": "A obrigação de sigilo permanece por 5 (cinco) anos após o término do contrato e não se aplica a informações que sejam ou se tornem públicas sem culpa da parte receptora, que já fossem de seu conhecimento, que tenham sido desenvolvidas de forma independente ou cuja divulgação seja exigida por lei ou ordem judicial."
     },
     {
      "html": "Senhas e credenciais compartilhadas durante o PROJETO deverão ser alteradas pelo CONTRATANTE após a entrega final."
     }
    ]
   },
   {
    "n": 16,
    "titulo": "Da Proteção de Dados Pessoais",
    "itens": [
     {
      "html": "As PARTES cumprirão a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD). Em relação aos dados pessoais tratados por meio do PROJETO (por exemplo, dados de clientes, usuários ou contatos do CONTRATANTE), o CONTRATANTE atua como controlador e a CONTRATADA, quando os tratar, como operadora, seguindo exclusivamente as instruções lícitas do CONTRATANTE."
     },
     {
      "html": "A CONTRATADA adotará medidas técnicas e administrativas razoáveis de segurança, limitará o acesso aos profissionais envolvidos no PROJETO e comunicará ao CONTRATANTE, em prazo razoável, os incidentes de segurança de que tiver conhecimento."
     },
     {
      "html": "Cabe ao CONTRATANTE definir as bases legais do tratamento, disponibilizar sua política de privacidade e atender às solicitações dos titulares, podendo a CONTRATADA prestar apoio técnico dentro do escopo contratado."
     },
     {
      "html": "Encerrado o contrato, a CONTRATADA devolverá ou eliminará os dados pessoais sob sua guarda, ressalvadas as hipóteses legais de conservação."
     },
     {
      "html": "Os dados das PARTES e de seus representantes serão tratados apenas para a gestão e a execução deste contrato."
     }
    ]
   },
   {
    "n": 17,
    "titulo": "Da Vigência e da Rescisão",
    "itens": [
     {
      "html": "Este contrato vigora da assinatura até a conclusão do PROJETO e o término da garantia técnica. Os planos mensais, quando contratados, vigoram por prazo indeterminado e podem ser cancelados por qualquer das PARTES mediante aviso prévio de 30 (trinta) dias."
     },
     {
      "html": "Qualquer das PARTES poderá rescindir o contrato em caso de descumprimento da outra que não seja sanado em até 10 (dez) dias após notificação por escrito."
     },
     {
      "html": "Rescisão sem justa causa pelo CONTRATANTE, após o prazo da Garantia Blajeen de 7 dias: serão devidos os valores das etapas já executadas e, proporcionalmente, da etapa em andamento, acrescidos de multa compensatória de 10% (dez por cento) sobre o saldo não executado do contrato."
     },
     {
      "html": "Rescisão sem justa causa pela CONTRATADA: esta devolverá os valores pagos referentes às etapas não executadas, entregará o que tiver sido produzido até então e pagará multa compensatória de 10% (dez por cento) sobre o saldo não executado do contrato."
     },
     {
      "html": "Em qualquer hipótese de encerramento, a CONTRATADA entregará os materiais correspondentes às etapas pagas."
     }
    ]
   },
   {
    "n": 18,
    "titulo": "Da Responsabilidade",
    "itens": [
     {
      "html": "A CONTRATADA responde pelos danos diretos que comprovadamente causar por culpa na execução dos serviços, limitados, na máxima extensão permitida pela legislação, ao valor total efetivamente pago por este contrato."
     },
     {
      "html": "A CONTRATADA não responde por:",
      "lista": [
       "lucros cessantes, perda de receita ou resultados comerciais esperados, como vendas, acessos, engajamento ou posição em buscadores;",
       "indisponibilidade, falhas ou mudanças de serviços de terceiros;",
       "incidentes decorrentes de senhas ou acessos mal guardados pelo CONTRATANTE ou por sua equipe;",
       "conteúdos fornecidos, publicados ou alterados pelo CONTRATANTE."
      ]
     },
     {
      "html": "A CONTRATADA se obriga a entregar o escopo contratado; resultados de negócio dependem de fatores externos e não são garantidos."
     }
    ]
   },
   {
    "n": 19,
    "titulo": "Das Disposições Gerais",
    "itens": [
     {
      "html": "Este contrato não cria vínculo empregatício, societário ou de representação entre as PARTES. Cada parte responde por seus tributos, encargos e colaboradores."
     },
     {
      "html": "A CONTRATADA poderá contar com colaboradores e parceiros especializados, permanecendo responsável perante o CONTRATANTE pela execução do PROJETO."
     },
     {
      "html": "As comunicações oficiais serão feitas pelos e-mails indicados no Quadro-Resumo. Aprovações e solicitações também poderão ser registradas por aplicativo de mensagens, desde que de forma clara e inequívoca."
     },
     {
      "html": "A tolerância quanto ao descumprimento de qualquer cláusula não implica renúncia nem novação. Nenhuma das PARTES poderá ceder este contrato sem a concordância da outra, e a invalidade de qualquer disposição não prejudica as demais."
     },
     {
      "html": "Alterações a este contrato somente terão validade por escrito, inclusive por e-mail ou aditivo assinado eletronicamente."
     },
     {
      "html": "<strong>Assinatura eletrônica.</strong> As PARTES reconhecem a validade da assinatura deste contrato por meio eletrônico, nos termos do art. 10, § 2º, da Medida Provisória nº 2.200-2/2001 e da Lei nº 14.063/2020, e concordam que, conferida a integridade pelo provedor de assinatura, fica dispensada a assinatura de testemunhas (art. 784, § 4º, do Código de Processo Civil)."
     }
    ]
   },
   {
    "n": 20,
    "titulo": "Do Foro",
    "itens": [
     {
      "html": "Fica eleito o foro da Comarca de {{cidade_foro|Cidade/UF||}} para dirimir as questões oriundas deste contrato, ressalvado o direito do CONTRATANTE, quando consumidor, de demandar no foro de seu domicílio."
     },
     {
      "html": "Antes de qualquer medida judicial, as PARTES se comprometem a buscar solução amigável por negociação direta, pelo prazo mínimo de 15 (quinze) dias."
     }
    ]
   }
  ]
 },
 "jogo": {
  "slug": "jogo",
  "codigo": "JOG",
  "indice": "04",
  "tituloCurto": "Jogo",
  "h1": "Desenvolvimento<br>de <span class=\"em\">Jogo.</span>",
  "lead": "Do conceito ao jogo publicado: mecânicas, arte, som e diversão construídos em marcos jogáveis que você testa a cada etapa.",
  "revisoesCurto": "2 rodadas por marco",
  "garantiaCurto": "7 dias de satisfação · 90 dias de garantia técnica",
  "pagamento": "50% adiantado, na assinatura, e 50% no final, na entrega da versão final",
  "multiPlano": false,
  "etapas": [
   {
    "titulo": "Pré-produção",
    "descricao": "Conceito e GDD"
   },
   {
    "titulo": "Protótipo",
    "descricao": "Vertical slice jogável"
   },
   {
    "titulo": "Produção",
    "descricao": "Fases, arte e som"
   },
   {
    "titulo": "Beta",
    "descricao": "Conteúdo completo e testes"
   },
   {
    "titulo": "Lançamento",
    "descricao": "Versão final e lojas"
   },
   {
    "titulo": "Evolução",
    "descricao": "Garantia de 90 dias"
   }
  ],
  "anexo2": [
   [
    "M1 · Pré-produção",
    "GDD e arte conceitual",
    "10 a 15 dias úteis",
    "50% adiantado, na assinatura"
   ],
   [
    "M2 · Protótipo jogável",
    "Vertical slice",
    "15 a 30 dias úteis",
    "—"
   ],
   [
    "M3 · Beta",
    "Conteúdo completo",
    "20 a 60 dias úteis",
    "—"
   ],
   [
    "M4 · Versão final",
    "Build final + publicação",
    "5 a 15 dias úteis",
    "50% no final, na entrega"
   ],
   [
    "Garantia técnica",
    "Correções sem custo",
    "90 dias",
    "—"
   ]
  ],
  "entregaveis": [
   "builds finais nas plataformas previstas;",
   "projeto-fonte do JOGO na engine e código-fonte específico;",
   "Game Design Document atualizado;",
   "Relatório de Ativos e Licenças;",
   "materiais da página da loja, quando contratados."
  ],
  "clausulas": [
   {
    "n": 1,
    "titulo": "Das Partes",
    "itens": [
     {
      "html": "<strong>CONTRATADA:</strong> {{contratada_nome|Razão social ou nome completo do titular|57.194.521 BRENO RICARDO GUIMARAES|}}, inscrita no CNPJ/CPF sob o nº {{contratada_doc|00.000.000/0001-00|57.194.521/0001-44|}}, com endereço em {{contratada_endereco|endereço completo com CEP||}}, e-mail {{contratada_email|e-mail oficial|brg.ftw@gmail.com|}}, que atua sob o nome <strong>BLAJEEN LABS</strong>, doravante denominada <strong>CONTRATADA</strong>."
     },
     {
      "html": "<strong>CONTRATANTE:</strong> {{contratante_nome|Nome completo ou razão social||}}, inscrito(a) no CPF/CNPJ sob o nº {{contratante_doc|000.000.000-00||}}, com endereço em {{contratante_endereco|endereço completo com CEP||}}, e-mail {{contratante_email|e-mail para comunicações||}}, telefone {{contratante_tel|(00) 00000-0000||}}, representado(a), quando pessoa jurídica, por {{contratante_repr|nome e CPF do representante legal||1}}, doravante denominado(a) <strong>CONTRATANTE</strong>."
     },
     {
      "html": "CONTRATANTE e CONTRATADA, em conjunto denominadas <strong>PARTES</strong>, celebram o presente contrato, que se regerá pelas cláusulas a seguir e pela legislação aplicável, em especial pelos arts. 593 a 609 do Código Civil."
     }
    ]
   },
   {
    "n": 2,
    "titulo": "Do Objeto",
    "itens": [
     {
      "html": "Constitui objeto deste contrato a prestação, pela CONTRATADA, de serviços de <strong>desenvolvimento de jogo digital</strong> para o projeto {{projeto_nome|nome do projeto ou da marca||}} (“PROJETO”), conforme o plano, o escopo e as condições definidos no Quadro-Resumo — inclusive no resumo “O combinado”, que registra a ideia e o acordo entre as PARTES — e nos Anexos."
     },
     {
      "html": "O gênero, as mecânicas, a quantidade de conteúdo e o estilo de arte do jogo (“JOGO”) serão definidos no Game Design Document (GDD) elaborado na pré-produção e aprovado pelo CONTRATANTE, que passará a integrar o Anexo I como referência do escopo."
     },
     {
      "html": "Plataformas previstas: {{plataformas|ex.: navegador, Android e iOS||}}. Engine: {{engine|ex.: Unity, Godot ou Unreal||}}."
     },
     {
      "html": "Integram este contrato, em ordem de prevalência: (i) este instrumento e seu Quadro-Resumo; (ii) o Anexo I — Plano e Escopo; (iii) o Anexo II — Etapas, Prazos e Pagamento; e (iv) a proposta comercial eventualmente enviada, naquilo que não conflitar com os anteriores."
     }
    ]
   },
   {
    "n": 3,
    "titulo": "Do Escopo e das Exclusões",
    "itens": [
     {
      "html": "Estão incluídos no PROJETO, observados os limites do plano escolhido no Anexo I:",
      "lista": [
       "pré-produção: conceito, referências e Game Design Document (GDD);",
       "direção de arte, arte conceitual e produção dos ativos visuais previstos;",
       "programação das mecânicas, fases, progressão e interface;",
       "áudio: trilha e efeitos de bibliotecas licenciadas ou produzidos para o JOGO;",
       "testes internos (playtests) e balanceamento;",
       "builds jogáveis a cada marco para avaliação do CONTRATANTE;",
       "versão final nas plataformas previstas e, quando contratado, publicação e preparação da página da loja (ícone, capturas e descrição)."
      ]
     },
     {
      "html": "Não estão incluídos, salvo contratação expressa no Anexo I ou por aditivo:",
      "lista": [
       "servidores, multiplayer online e contas de jogador, salvo previsão no Anexo I;",
       "operação contínua (eventos, temporadas, novos conteúdos) após a entrega;",
       "marketing, trailer e campanhas de lançamento;",
       "localização para outros idiomas e dublagem;",
       "versões para plataformas não previstas, incluindo consoles;",
       "contas de desenvolvedor, taxas das lojas e licenças da engine."
      ]
     },
     {
      "html": "Qualquer item não descrito expressamente no Anexo I será considerado fora do escopo e poderá ser orçado à parte, nos termos da Cláusula 11."
     }
    ]
   },
   {
    "n": 4,
    "titulo": "Do Game Design, dos Marcos e das Builds",
    "itens": [
     {
      "html": "O JOGO será desenvolvido por marcos (milestones), cada um entregue como documento ou build jogável para avaliação e aprovação:",
      "lista": [
       "M1 — Pré-produção: GDD e arte conceitual;",
       "M2 — Protótipo jogável (vertical slice), com a mecânica central e amostra da arte final;",
       "M3 — Beta: conteúdo completo, para testes e ajustes;",
       "M4 — Versão final (gold) e publicação, quando contratada."
      ]
     },
     {
      "html": "Ajustes de balanceamento, dificuldade e sensação de jogo (game feel) fazem parte natural do processo e estão incluídos em cada marco. Mudanças na mecânica central, no gênero ou no estilo de arte após a aprovação do M2 serão tratadas como alteração de escopo."
     },
     {
      "html": "O JOGO será otimizado para os dispositivos de referência a seguir: {{dispositivos|ex.: Android 10+ com 3 GB de RAM; iPhone 11+; navegadores atuais||}}. Não há garantia de desempenho em dispositivos abaixo dessas especificações."
     },
     {
      "html": "As builds de teste são confidenciais e destinam-se apenas à avaliação do CONTRATANTE e de sua equipe até o lançamento."
     }
    ]
   },
   {
    "n": 5,
    "titulo": "Da Engine, dos Ativos, das Lojas e da Monetização",
    "itens": [
     {
      "html": "Eventuais licenças, assinaturas ou royalties exigidos pela engine em razão do faturamento do JOGO são de responsabilidade do CONTRATANTE, titular do JOGO."
     },
     {
      "html": "O JOGO poderá conter ativos originais, ativos de bancos licenciados (inclusive gratuitos, como os de licença CC0) e ativos criados com apoio de inteligência artificial, sempre com curadoria humana. Na entrega final, a CONTRATADA fornecerá o Relatório de Ativos e Licenças, com a origem e as condições de uso de cada ativo de terceiros."
     },
     {
      "html": "A publicação nas lojas (Google Play, App Store, Steam, itch.io ou web) será feita em contas do CONTRATANTE, que arcará com as respectivas taxas. A aprovação depende exclusivamente das lojas; a CONTRATADA fará, dentro do escopo, os ajustes razoáveis que elas solicitarem."
     },
     {
      "html": "A CONTRATADA auxiliará no preenchimento dos questionários de classificação indicativa (IARC/ClassInd). A responsabilidade pelas informações declaradas é do CONTRATANTE."
     },
     {
      "html": "A monetização (anúncios, compras no aplicativo ou assinaturas), quando prevista, será integrada às contas do CONTRATANTE, a quem pertencem as receitas e as obrigações fiscais, de privacidade e de proteção de crianças e adolescentes, inclusive as do art. 14 da LGPD."
     },
     {
      "bloco": "<div class=\"opt-box\"><span class=\"ttl\">Cláusula opcional · Coparticipação nas receitas</span>[[copart_sim|Aplica-se|copart]] [[copart_nao|Não se aplica|copart]]<p style=\"margin-top:1.4mm\">Quando aplicável, em contrapartida à redução do valor fixo refletida no Quadro-Resumo, a CONTRATADA fará jus a {{copart_pct|00||1}}% da receita líquida do JOGO — valores efetivamente recebidos das lojas e redes de anúncios, deduzidos as taxas das plataformas e os tributos incidentes —, pelo prazo de {{copart_meses|00||1}} meses contados da publicação, com relatório e pagamento mensais até o dia 15 do mês seguinte.</p></div>"
     }
    ]
   },
   {
    "n": 6,
    "titulo": "Das Etapas, Prazos e Aprovações",
    "itens": [
     {
      "html": "O PROJETO será desenvolvido nas etapas descritas no Anexo II, com prazo estimado de {{prazo|00 dias úteis||}}, contado a partir do último dos seguintes eventos: (i) assinatura deste contrato; (ii) confirmação do pagamento da primeira parcela; e (iii) recebimento dos materiais e informações necessários ao início."
     },
     {
      "html": "Ao final de cada etapa, a CONTRATADA apresentará o respectivo entregável. O CONTRATANTE terá até 5 (cinco) dias úteis para aprová-lo ou solicitar ajustes, de forma consolidada e por escrito."
     },
     {
      "html": "Decorrido esse prazo sem manifestação, a etapa será considerada aprovada e o PROJETO seguirá para a etapa seguinte."
     },
     {
      "html": "Estão incluídas 2 (duas) rodadas de ajustes em cada marco, além do balanceamento contínuo durante o desenvolvimento. Ajustes além desse limite, ou mudanças de direção após a aprovação de uma etapa, serão tratados como alteração de escopo."
     },
     {
      "html": "Os prazos serão prorrogados pelo mesmo período de eventuais atrasos do CONTRATANTE no envio de materiais, aprovações ou pagamentos, bem como em caso fortuito ou de força maior (art. 393 do Código Civil)."
     },
     {
      "html": "Se o PROJETO permanecer parado por mais de 30 (trinta) dias corridos por falta de retorno do CONTRATANTE, a CONTRATADA poderá suspendê-lo e reagendar a retomada conforme sua disponibilidade. Após 60 (sessenta) dias de paralisação, a CONTRATADA poderá considerar o contrato encerrado, sendo devidos os valores das etapas executadas até então."
     }
    ]
   },
   {
    "n": 7,
    "titulo": "Das Obrigações da CONTRATADA",
    "itens": [
     {
      "html": "São obrigações da CONTRATADA:",
      "lista": [
       "executar os serviços com qualidade técnica, zelo e boas práticas de mercado;",
       "manter o CONTRATANTE informado sobre o andamento do PROJETO, com atualizações ao menos semanais;",
       "cumprir os prazos estabelecidos, ressalvadas as hipóteses de prorrogação previstas neste contrato;",
       "orientar o CONTRATANTE sobre os materiais, acessos e decisões necessários em cada etapa;",
       "corrigir, sem custo, as falhas cobertas pela garantia técnica;",
       "entregar, após a quitação, os arquivos, acessos e credenciais previstos no Anexo I;",
       "entregar o Relatório de Ativos e Licenças e o projeto-fonte do JOGO após a quitação."
      ]
     }
    ]
   },
   {
    "n": 8,
    "titulo": "Das Obrigações do CONTRATANTE",
    "itens": [
     {
      "html": "São obrigações do CONTRATANTE:",
      "lista": [
       "fornecer, nos prazos combinados, as informações, conteúdos, materiais, acessos e aprovações necessários;",
       "garantir que possui os direitos e as autorizações sobre marcas, textos, imagens, vídeos, músicas, dados e demais materiais que fornecer, respondendo por eventuais violações de direitos de terceiros;",
       "efetuar os pagamentos nas datas acordadas;",
       "indicar um responsável pelas aprovações, com autonomia para decidir em seu nome;",
       "contratar e manter ativos os serviços de terceiros previstos na Cláusula 10;",
       "revisar o conteúdo final antes de sua publicação ou utilização;",
       "jogar e avaliar cada build dentro do prazo de aprovação, enviando retorno consolidado;",
       "manter ativas as contas de desenvolvedor necessárias à publicação."
      ]
     }
    ]
   },
   {
    "n": 9,
    "titulo": "Do Investimento e das Condições de Pagamento",
    "itens": [
     {
      "html": "Pelos serviços, o CONTRATANTE pagará à CONTRATADA o valor total de <strong>R$ {{valor_total|0.000,00||}}</strong> ({{valor_extenso|valor por extenso||}}), correspondente ao plano e aos itens selecionados no Anexo I."
     },
     {
      "html": "Condições de pagamento: {{forma_pagamento|condições de pagamento|50% adiantado, na assinatura, e 50% no final, na entrega da versão final|}}, conforme o Anexo II. Meios aceitos: Pix, transferência, boleto ou cartão de crédito."
     },
     {
      "html": "Parcelamento: {{parcelamento|à vista|à vista|}}. Os valores podem ser parcelados com juros — no cartão de crédito, conforme as taxas vigentes do meio de pagamento, ou em outra forma combinada por escrito —, e os juros e encargos do parcelamento são de responsabilidade do CONTRATANTE, somando-se ao valor total deste contrato."
     },
     {
      "html": "O início dos trabalhos está condicionado à confirmação do pagamento da parcela adiantada (50%). O saldo de 50% é devido no final, na etapa indicada no Anexo II, antes da liberação definitiva dos arquivos, acessos e da publicação."
     },
     {
      "html": "Em caso de atraso, incidirão sobre o valor devido multa de 2% (dois por cento), juros de mora de 1% (um por cento) ao mês, calculados pro rata die, e correção monetária pelo IPCA/IBGE."
     },
     {
      "html": "Atrasos superiores a 10 (dez) dias autorizam a CONTRATADA a suspender os serviços até a regularização, com prorrogação dos prazos pelo mesmo período. A entrega final e a transferência de arquivos-fonte, credenciais e direitos ficam condicionadas à quitação integral."
     },
     {
      "html": "Os planos mensais, quando contratados, serão cobrados mensalmente, com vencimento no dia {{dia_venc|10||1}} de cada mês, e reajustados a cada 12 (doze) meses pelo IPCA/IBGE."
     },
     {
      "html": "A CONTRATADA emitirá recibo ou documento fiscal referente a cada pagamento, conforme seu enquadramento tributário."
     }
    ]
   },
   {
    "n": 10,
    "titulo": "Dos Custos de Terceiros",
    "itens": [
     {
      "html": "Não estão incluídos no valor deste contrato, salvo indicação expressa no Anexo I, os custos de serviços, contas e licenças de terceiros, tais como: contas de desenvolvedor e taxas das lojas (ex.: Google Play, Apple Developer Program, Steam), licenças ou royalties de engine, servidores e serviços online, ativos premium solicitados pelo CONTRATANTE e ferramentas pagas de análise ou monetização."
     },
     {
      "html": "Sempre que possível, esses serviços serão contratados em nome e com os meios de pagamento do CONTRATANTE, que será o titular das respectivas contas. Quando a CONTRATADA adiantar algum desses custos, com autorização prévia, o valor será reembolsado mediante comprovante."
     },
     {
      "html": "A CONTRATADA poderá recomendar fornecedores, mas não responde por alterações de preço, políticas, indisponibilidade ou descontinuidade de serviços de terceiros."
     }
    ]
   },
   {
    "n": 11,
    "titulo": "Das Alterações de Escopo",
    "itens": [
     {
      "html": "Solicitações de novas funcionalidades, páginas, conteúdos, mudanças de direção criativa ou de qualquer item não previsto no Anexo I serão avaliadas pela CONTRATADA, que apresentará orçamento e impacto no prazo antes de executá-las."
     },
     {
      "html": "A alteração somente será executada após aprovação escrita do CONTRATANTE (e-mail é suficiente) e passará a integrar este contrato como aditivo."
     },
     {
      "html": "Pequenos ajustes poderão, a critério da CONTRATADA, ser absorvidos sem custo, o que não gera obrigação de absorver ajustes futuros."
     },
     {
      "html": "Valor de referência para serviços adicionais: R$ {{hora_tecnica|150|150|}} por hora técnica, ou orçamento fechado por item."
     }
    ]
   },
   {
    "n": 12,
    "titulo": "Da Propriedade Intelectual",
    "itens": [
     {
      "html": "Após a quitação integral, a CONTRATADA cede ao CONTRATANTE, em caráter definitivo e exclusivo, os direitos patrimoniais sobre os elementos criados especificamente para o JOGO — como layout, interfaces, código-fonte específico, textos e artes produzidos sob encomenda —, nos termos da Lei nº 9.609/1998 (Lei do Software) e da Lei nº 9.610/1998 (Lei de Direitos Autorais)."
     },
     {
      "html": "Permanecem de titularidade da CONTRATADA os componentes pré-existentes ou genéricos por ela desenvolvidos — bibliotecas, módulos reutilizáveis, modelos-base, ferramentas internas e know-how —, sobre os quais o CONTRATANTE recebe licença de uso perpétua, gratuita, irrevogável e não exclusiva, vinculada ao PROJETO. A CONTRATADA poderá reutilizá-los em outros trabalhos, sem utilizar dados, marca ou conteúdo exclusivo do CONTRATANTE."
     },
     {
      "html": "Componentes de código aberto e de terceiros incorporados ao PROJETO seguem suas próprias licenças, que o CONTRATANTE se compromete a respeitar."
     },
     {
      "html": "Até a quitação integral, o CONTRATANTE terá licença provisória de uso, que poderá ser suspensa em caso de inadimplemento."
     },
     {
      "html": "Personagens, nome, universo, história e artes criados exclusivamente para o JOGO pertencerão ao CONTRATANTE após a quitação. Personagens, universos, jogos e mascotes autorais pré-existentes da CONTRATADA permanecem de sua exclusiva titularidade."
     },
     {
      "html": "Portfólio: conforme a opção marcada no Quadro-Resumo, a CONTRATADA poderá exibir o PROJETO (nome, imagens e descrição geral) em seu site, portfólio e redes sociais, sem revelar informações confidenciais."
     },
     {
      "html": "Crédito: conforme a opção marcada no Quadro-Resumo, a CONTRATADA poderá manter crédito discreto (“Desenvolvido por Blajeen Labs”) na tela de créditos do JOGO. Os direitos morais de autor são preservados em qualquer hipótese (art. 24 da Lei nº 9.610/1998)."
     }
    ]
   },
   {
    "n": 13,
    "titulo": "Das Garantias",
    "itens": [
     {
      "html": "<strong>Garantia Blajeen de 7 dias.</strong> O CONTRATANTE poderá desistir da contratação em até 7 (sete) dias corridos contados da assinatura, com devolução integral dos valores pagos em até 10 (dez) dias úteis, pelo mesmo meio de pagamento, em consonância com o art. 49 do Código de Defesa do Consumidor. O exercício dessa garantia implica a não utilização de qualquer material eventualmente entregue."
     },
     {
      "html": "<strong>Garantia técnica.</strong> Por 90 (noventa) dias contados da entrega da versão final, a CONTRATADA corrigirá sem custo as falhas (bugs) que impeçam ou prejudiquem a jogabilidade prevista no GDD, nas plataformas e dispositivos de referência."
     },
     {
      "html": "A garantia técnica não cobre:",
      "lista": [
       "alterações feitas pelo CONTRATANTE ou por terceiros;",
       "novas funcionalidades, melhorias ou mudanças de escopo;",
       "falhas, mudanças ou atualizações de serviços de terceiros (hospedagem, APIs, lojas de aplicativos, navegadores, sistemas operacionais);",
       "uso em desacordo com as orientações fornecidas;",
       "conteúdos inseridos pelo CONTRATANTE após a entrega."
      ]
     },
     {
      "html": "As garantias deste contrato somam-se aos direitos previstos na legislação aplicável, sem substituí-los."
     }
    ]
   },
   {
    "n": 14,
    "titulo": "Do Suporte e da Evolução",
    "itens": [
     {
      "html": "Após a garantia técnica, correções, atualizações exigidas pelas lojas, novos conteúdos e operação contínua (live ops) poderão ser contratados por plano mensal ou por hora técnica."
     },
     {
      "html": "Atualizações obrigatórias exigidas pelas lojas ou por novas versões de sistemas operacionais após a garantia não estão incluídas no valor deste contrato."
     }
    ]
   },
   {
    "n": 15,
    "titulo": "Da Confidencialidade",
    "itens": [
     {
      "html": "As PARTES manterão sigilo sobre as informações confidenciais a que tiverem acesso em razão deste contrato — dados comerciais e financeiros, estratégias, credenciais, dados de clientes, código-fonte e as condições deste instrumento —, utilizando-as exclusivamente para a execução do PROJETO."
     },
     {
      "html": "A obrigação de sigilo permanece por 5 (cinco) anos após o término do contrato e não se aplica a informações que sejam ou se tornem públicas sem culpa da parte receptora, que já fossem de seu conhecimento, que tenham sido desenvolvidas de forma independente ou cuja divulgação seja exigida por lei ou ordem judicial."
     },
     {
      "html": "Senhas e credenciais compartilhadas durante o PROJETO deverão ser alteradas pelo CONTRATANTE após a entrega final."
     }
    ]
   },
   {
    "n": 16,
    "titulo": "Da Proteção de Dados Pessoais",
    "itens": [
     {
      "html": "As PARTES cumprirão a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD). Em relação aos dados pessoais tratados por meio do PROJETO (por exemplo, dados de clientes, usuários ou contatos do CONTRATANTE), o CONTRATANTE atua como controlador e a CONTRATADA, quando os tratar, como operadora, seguindo exclusivamente as instruções lícitas do CONTRATANTE."
     },
     {
      "html": "A CONTRATADA adotará medidas técnicas e administrativas razoáveis de segurança, limitará o acesso aos profissionais envolvidos no PROJETO e comunicará ao CONTRATANTE, em prazo razoável, os incidentes de segurança de que tiver conhecimento."
     },
     {
      "html": "Cabe ao CONTRATANTE definir as bases legais do tratamento, disponibilizar sua política de privacidade e atender às solicitações dos titulares, podendo a CONTRATADA prestar apoio técnico dentro do escopo contratado."
     },
     {
      "html": "Encerrado o contrato, a CONTRATADA devolverá ou eliminará os dados pessoais sob sua guarda, ressalvadas as hipóteses legais de conservação."
     },
     {
      "html": "Os dados das PARTES e de seus representantes serão tratados apenas para a gestão e a execução deste contrato."
     }
    ]
   },
   {
    "n": 17,
    "titulo": "Da Vigência e da Rescisão",
    "itens": [
     {
      "html": "Este contrato vigora da assinatura até a conclusão do PROJETO e o término da garantia técnica. Os planos mensais, quando contratados, vigoram por prazo indeterminado e podem ser cancelados por qualquer das PARTES mediante aviso prévio de 30 (trinta) dias."
     },
     {
      "html": "Qualquer das PARTES poderá rescindir o contrato em caso de descumprimento da outra que não seja sanado em até 10 (dez) dias após notificação por escrito."
     },
     {
      "html": "Rescisão sem justa causa pelo CONTRATANTE, após o prazo da Garantia Blajeen de 7 dias: serão devidos os valores das etapas já executadas e, proporcionalmente, da etapa em andamento, acrescidos de multa compensatória de 10% (dez por cento) sobre o saldo não executado do contrato."
     },
     {
      "html": "Rescisão sem justa causa pela CONTRATADA: esta devolverá os valores pagos referentes às etapas não executadas, entregará o que tiver sido produzido até então e pagará multa compensatória de 10% (dez por cento) sobre o saldo não executado do contrato."
     },
     {
      "html": "Em qualquer hipótese de encerramento, a CONTRATADA entregará os materiais correspondentes às etapas pagas."
     }
    ]
   },
   {
    "n": 18,
    "titulo": "Da Responsabilidade",
    "itens": [
     {
      "html": "A CONTRATADA responde pelos danos diretos que comprovadamente causar por culpa na execução dos serviços, limitados, na máxima extensão permitida pela legislação, ao valor total efetivamente pago por este contrato."
     },
     {
      "html": "A CONTRATADA não responde por:",
      "lista": [
       "lucros cessantes, perda de receita ou resultados comerciais esperados, como vendas, acessos, engajamento ou posição em buscadores;",
       "indisponibilidade, falhas ou mudanças de serviços de terceiros;",
       "incidentes decorrentes de senhas ou acessos mal guardados pelo CONTRATANTE ou por sua equipe;",
       "conteúdos fornecidos, publicados ou alterados pelo CONTRATANTE."
      ]
     },
     {
      "html": "A CONTRATADA se obriga a entregar o escopo contratado; resultados de negócio dependem de fatores externos e não são garantidos."
     }
    ]
   },
   {
    "n": 19,
    "titulo": "Das Disposições Gerais",
    "itens": [
     {
      "html": "Este contrato não cria vínculo empregatício, societário ou de representação entre as PARTES. Cada parte responde por seus tributos, encargos e colaboradores."
     },
     {
      "html": "A CONTRATADA poderá contar com colaboradores e parceiros especializados, permanecendo responsável perante o CONTRATANTE pela execução do PROJETO."
     },
     {
      "html": "As comunicações oficiais serão feitas pelos e-mails indicados no Quadro-Resumo. Aprovações e solicitações também poderão ser registradas por aplicativo de mensagens, desde que de forma clara e inequívoca."
     },
     {
      "html": "A tolerância quanto ao descumprimento de qualquer cláusula não implica renúncia nem novação. Nenhuma das PARTES poderá ceder este contrato sem a concordância da outra, e a invalidade de qualquer disposição não prejudica as demais."
     },
     {
      "html": "Alterações a este contrato somente terão validade por escrito, inclusive por e-mail ou aditivo assinado eletronicamente."
     },
     {
      "html": "<strong>Assinatura eletrônica.</strong> As PARTES reconhecem a validade da assinatura deste contrato por meio eletrônico, nos termos do art. 10, § 2º, da Medida Provisória nº 2.200-2/2001 e da Lei nº 14.063/2020, e concordam que, conferida a integridade pelo provedor de assinatura, fica dispensada a assinatura de testemunhas (art. 784, § 4º, do Código de Processo Civil)."
     }
    ]
   },
   {
    "n": 20,
    "titulo": "Do Foro",
    "itens": [
     {
      "html": "Fica eleito o foro da Comarca de {{cidade_foro|Cidade/UF||}} para dirimir as questões oriundas deste contrato, ressalvado o direito do CONTRATANTE, quando consumidor, de demandar no foro de seu domicílio."
     },
     {
      "html": "Antes de qualquer medida judicial, as PARTES se comprometem a buscar solução amigável por negociação direta, pelo prazo mínimo de 15 (quinze) dias."
     }
    ]
   }
  ]
 },
 "projeto": {
  "slug": "projeto",
  "codigo": "PRJ",
  "indice": "05",
  "tituloCurto": "Projeto sob medida",
  "h1": "Projeto<br><span class=\"em\">sob medida.</span>",
  "lead": "Para ideias que não cabem em pacotes: entendemos, prototipamos, provamos e construímos junto com você, ciclo a ciclo.",
  "revisoesCurto": "Revisão ao final de cada sprint",
  "garantiaCurto": "7 dias de satisfação · 90 dias por versão publicada",
  "pagamento": "50% adiantado e 50% no final de cada etapa contratada (Diagnóstico, identidade ou cada sprint)",
  "multiPlano": true,
  "etapas": [
   {
    "titulo": "Diagnóstico",
    "descricao": "Imersão e prioridades"
   },
   {
    "titulo": "Protótipo",
    "descricao": "A experiência antes do código"
   },
   {
    "titulo": "Sprints",
    "descricao": "Construção em ciclos"
   },
   {
    "titulo": "Validação",
    "descricao": "Testes com uso real"
   },
   {
    "titulo": "Publicação",
    "descricao": "No ar com segurança"
   },
   {
    "titulo": "Evolução",
    "descricao": "Novas versões"
   }
  ],
  "anexo2": [
   [
    "Diagnóstico (Discovery)",
    "Visão, backlog, protótipo e estimativa",
    "7 a 10 dias úteis",
    "50% no início e 50% na entrega"
   ],
   [
    "Identidade & produto (se contratado)",
    "Marca e interface",
    "10 a 15 dias úteis",
    "50% no início e 50% na entrega"
   ],
   [
    "Sprints ou banco de horas",
    "Entregas testáveis a cada ciclo",
    "ciclos de 2 semanas",
    "50% no início e 50% no fim de cada ciclo"
   ],
   [
    "Publicação",
    "Versão em produção",
    "conforme backlog",
    "—"
   ],
   [
    "Garantia técnica",
    "Correções sem custo, por versão",
    "90 dias",
    "—"
   ]
  ],
  "entregaveis": [
   "Documento de Visão e Escopo, backlog e protótipo do Diagnóstico;",
   "versões publicadas do produto e acessos de administrador;",
   "código-fonte em repositório transferido ao CONTRATANTE, após a quitação de cada ciclo;",
   "relatórios de sprint e de horas."
  ],
  "clausulas": [
   {
    "n": 1,
    "titulo": "Das Partes",
    "itens": [
     {
      "html": "<strong>CONTRATADA:</strong> {{contratada_nome|Razão social ou nome completo do titular|57.194.521 BRENO RICARDO GUIMARAES|}}, inscrita no CNPJ/CPF sob o nº {{contratada_doc|00.000.000/0001-00|57.194.521/0001-44|}}, com endereço em {{contratada_endereco|endereço completo com CEP||}}, e-mail {{contratada_email|e-mail oficial|brg.ftw@gmail.com|}}, que atua sob o nome <strong>BLAJEEN LABS</strong>, doravante denominada <strong>CONTRATADA</strong>."
     },
     {
      "html": "<strong>CONTRATANTE:</strong> {{contratante_nome|Nome completo ou razão social||}}, inscrito(a) no CPF/CNPJ sob o nº {{contratante_doc|000.000.000-00||}}, com endereço em {{contratante_endereco|endereço completo com CEP||}}, e-mail {{contratante_email|e-mail para comunicações||}}, telefone {{contratante_tel|(00) 00000-0000||}}, representado(a), quando pessoa jurídica, por {{contratante_repr|nome e CPF do representante legal||1}}, doravante denominado(a) <strong>CONTRATANTE</strong>."
     },
     {
      "html": "CONTRATANTE e CONTRATADA, em conjunto denominadas <strong>PARTES</strong>, celebram o presente contrato, que se regerá pelas cláusulas a seguir e pela legislação aplicável, em especial pelos arts. 593 a 609 do Código Civil."
     }
    ]
   },
   {
    "n": 2,
    "titulo": "Do Objeto",
    "itens": [
     {
      "html": "Constitui objeto deste contrato a prestação, pela CONTRATADA, de serviços de <strong>concepção, design e desenvolvimento de produto digital sob medida</strong> para o projeto {{projeto_nome|nome do projeto ou da marca||}} (“PROJETO”), conforme o plano, o escopo e as condições definidos no Quadro-Resumo — inclusive no resumo “O combinado”, que registra a ideia e o acordo entre as PARTES — e nos Anexos."
     },
     {
      "html": "O PROJETO será conduzido em modelo colaborativo e iterativo: o escopo inicial é definido na etapa de Diagnóstico (Discovery) e evolui a cada ciclo, conforme as prioridades aprovadas pelo CONTRATANTE."
     },
     {
      "html": "Modalidade de execução: [[mod_fechado|Preço fechado por escopo|mod]] [[mod_sprints|Sprints quinzenais|mod]] [[mod_horas|Banco de horas|mod]]"
     },
     {
      "html": "Integram este contrato, em ordem de prevalência: (i) este instrumento e seu Quadro-Resumo; (ii) o Anexo I — Plano e Escopo; (iii) o Anexo II — Etapas, Prazos e Pagamento; e (iv) a proposta comercial eventualmente enviada, naquilo que não conflitar com os anteriores."
     }
    ]
   },
   {
    "n": 3,
    "titulo": "Do Escopo e das Exclusões",
    "itens": [
     {
      "html": "Estão incluídos no PROJETO, observados os limites do plano escolhido no Anexo I:",
      "lista": [
       "Diagnóstico (Discovery): imersão no negócio, mapeamento de necessidades, referências e priorização do produto mínimo viável (MVP);",
       "protótipo navegável das telas principais;",
       "identidade e interface do produto, quando contratadas;",
       "desenvolvimento iterativo, com entregas testáveis a cada ciclo;",
       "reuniões de planejamento e revisão com o responsável indicado pelo CONTRATANTE;",
       "relatórios periódicos de andamento e, no banco de horas, relatório de horas;",
       "publicação e acompanhamento pós-lançamento, conforme contratado."
      ]
     },
     {
      "html": "Não estão incluídos, salvo contratação expressa no Anexo I ou por aditivo:",
      "lista": [
       "itens não priorizados no backlog ou não aprovados pelo CONTRATANTE;",
       "operação do negócio, atendimento a clientes e produção de conteúdo;",
       "marketing, tráfego pago e gestão de redes;",
       "custos de terceiros previstos na Cláusula 10."
      ]
     },
     {
      "html": "Qualquer item não descrito expressamente no Anexo I será considerado fora do escopo e poderá ser orçado à parte, nos termos da Cláusula 11."
     }
    ]
   },
   {
    "n": 4,
    "titulo": "Do Diagnóstico (Discovery)",
    "itens": [
     {
      "html": "O Diagnóstico tem duração estimada de 7 (sete) a 10 (dez) dias úteis e resulta em: Documento de Visão e Escopo, backlog priorizado, protótipo navegável das telas principais e estimativa de prazo e investimento para a execução."
     },
     {
      "html": "Os entregáveis do Diagnóstico pertencem ao CONTRATANTE após o pagamento e podem ser utilizados livremente, inclusive com outros fornecedores."
     },
     {
      "html": "O valor do Diagnóstico será integralmente abatido do investimento da execução, caso esta seja contratada em até 30 (trinta) dias após a entrega do Diagnóstico."
     }
    ]
   },
   {
    "n": 5,
    "titulo": "Da Execução: Sprints, Banco de Horas e Gestão",
    "itens": [
     {
      "html": "Sprints: ciclos de 2 (duas) semanas. No início de cada sprint, as PARTES definem os itens do backlog a desenvolver (planejamento); ao final, a CONTRATADA apresenta os resultados em ambiente de testes (revisão). Itens não concluídos retornam ao backlog para nova priorização."
     },
     {
      "html": "O CONTRATANTE indicará um responsável pelo produto, com autonomia para priorizar e aprovar, que participará das reuniões de planejamento e revisão (online, com até 1 hora cada)."
     },
     {
      "html": "Banco de horas: as horas contratadas têm validade de 60 (sessenta) dias. Horas excedentes, previamente autorizadas por escrito, serão cobradas pelo valor da hora avulsa (R$ {{hora_tecnica|150|150|}}). A CONTRATADA enviará relatório mensal de horas, com frações mínimas de 30 (trinta) minutos."
     },
     {
      "html": "Preço fechado: após o Diagnóstico, a CONTRATADA apresentará proposta de escopo, prazo e preço fixos, que, aprovada, integrará o Anexo I e seguirá as regras de alteração de escopo deste contrato."
     },
     {
      "html": "Estimativas de prazo e esforço são referências de planejamento e podem variar conforme descobertas e mudanças de prioridade, que serão sempre comunicadas com antecedência."
     },
     {
      "html": "Nas modalidades de sprints e banco de horas, o CONTRATANTE poderá repriorizar o backlog a cada ciclo e encerrar a execução ao final de qualquer sprint ou mês, com aviso mínimo de 14 (catorze) dias, pagando apenas os ciclos realizados, sem a multa prevista na Cláusula 17."
     }
    ]
   },
   {
    "n": 6,
    "titulo": "Das Etapas, Prazos e Aprovações",
    "itens": [
     {
      "html": "O PROJETO será desenvolvido nas etapas descritas no Anexo II, com prazo estimado de {{prazo|00 dias úteis||}}, contado a partir do último dos seguintes eventos: (i) assinatura deste contrato; (ii) confirmação do pagamento da primeira parcela; e (iii) recebimento dos materiais e informações necessários ao início."
     },
     {
      "html": "Ao final de cada etapa, a CONTRATADA apresentará o respectivo entregável. O CONTRATANTE terá até 5 (cinco) dias úteis para aprová-lo ou solicitar ajustes, de forma consolidada e por escrito."
     },
     {
      "html": "Decorrido esse prazo sem manifestação, a etapa será considerada aprovada e o PROJETO seguirá para a etapa seguinte."
     },
     {
      "html": "Estão incluídas 2 (duas) rodadas de ajustes no protótipo do Diagnóstico e revisões ao final de cada sprint, com os ajustes incorporados ao backlog. Ajustes além desse limite, ou mudanças de direção após a aprovação de uma etapa, serão tratados como alteração de escopo."
     },
     {
      "html": "Os prazos serão prorrogados pelo mesmo período de eventuais atrasos do CONTRATANTE no envio de materiais, aprovações ou pagamentos, bem como em caso fortuito ou de força maior (art. 393 do Código Civil)."
     },
     {
      "html": "Se o PROJETO permanecer parado por mais de 30 (trinta) dias corridos por falta de retorno do CONTRATANTE, a CONTRATADA poderá suspendê-lo e reagendar a retomada conforme sua disponibilidade. Após 60 (sessenta) dias de paralisação, a CONTRATADA poderá considerar o contrato encerrado, sendo devidos os valores das etapas executadas até então."
     }
    ]
   },
   {
    "n": 7,
    "titulo": "Das Obrigações da CONTRATADA",
    "itens": [
     {
      "html": "São obrigações da CONTRATADA:",
      "lista": [
       "executar os serviços com qualidade técnica, zelo e boas práticas de mercado;",
       "manter o CONTRATANTE informado sobre o andamento do PROJETO, com atualizações ao menos semanais;",
       "cumprir os prazos estabelecidos, ressalvadas as hipóteses de prorrogação previstas neste contrato;",
       "orientar o CONTRATANTE sobre os materiais, acessos e decisões necessários em cada etapa;",
       "corrigir, sem custo, as falhas cobertas pela garantia técnica;",
       "entregar, após a quitação, os arquivos, acessos e credenciais previstos no Anexo I;",
       "conduzir as reuniões de planejamento e revisão e manter o backlog atualizado e acessível ao CONTRATANTE."
      ]
     }
    ]
   },
   {
    "n": 8,
    "titulo": "Das Obrigações do CONTRATANTE",
    "itens": [
     {
      "html": "São obrigações do CONTRATANTE:",
      "lista": [
       "fornecer, nos prazos combinados, as informações, conteúdos, materiais, acessos e aprovações necessários;",
       "garantir que possui os direitos e as autorizações sobre marcas, textos, imagens, vídeos, músicas, dados e demais materiais que fornecer, respondendo por eventuais violações de direitos de terceiros;",
       "efetuar os pagamentos nas datas acordadas;",
       "indicar um responsável pelas aprovações, com autonomia para decidir em seu nome;",
       "contratar e manter ativos os serviços de terceiros previstos na Cláusula 10;",
       "revisar o conteúdo final antes de sua publicação ou utilização;",
       "participar das reuniões de planejamento e revisão por meio do responsável indicado;",
       "priorizar o backlog com clareza, considerando as recomendações técnicas da CONTRATADA."
      ]
     }
    ]
   },
   {
    "n": 9,
    "titulo": "Do Investimento e das Condições de Pagamento",
    "itens": [
     {
      "html": "Pelos serviços, o CONTRATANTE pagará à CONTRATADA o valor total de <strong>R$ {{valor_total|0.000,00||}}</strong> ({{valor_extenso|valor por extenso||}}), correspondente ao plano e aos itens selecionados no Anexo I."
     },
     {
      "html": "Condições de pagamento: {{forma_pagamento|condições de pagamento|50% adiantado e 50% no final de cada etapa contratada (Diagnóstico, identidade ou cada sprint)|}}, conforme o Anexo II. Meios aceitos: Pix, transferência, boleto ou cartão de crédito."
     },
     {
      "html": "Parcelamento: {{parcelamento|à vista|à vista|}}. Os valores podem ser parcelados com juros — no cartão de crédito, conforme as taxas vigentes do meio de pagamento, ou em outra forma combinada por escrito —, e os juros e encargos do parcelamento são de responsabilidade do CONTRATANTE, somando-se ao valor total deste contrato."
     },
     {
      "html": "O início dos trabalhos está condicionado à confirmação do pagamento da parcela adiantada (50%). O saldo de 50% é devido no final, na etapa indicada no Anexo II, antes da liberação definitiva dos arquivos, acessos e da publicação."
     },
     {
      "html": "Em caso de atraso, incidirão sobre o valor devido multa de 2% (dois por cento), juros de mora de 1% (um por cento) ao mês, calculados pro rata die, e correção monetária pelo IPCA/IBGE."
     },
     {
      "html": "Atrasos superiores a 10 (dez) dias autorizam a CONTRATADA a suspender os serviços até a regularização, com prorrogação dos prazos pelo mesmo período. A entrega final e a transferência de arquivos-fonte, credenciais e direitos ficam condicionadas à quitação integral."
     },
     {
      "html": "Os planos mensais, quando contratados, serão cobrados mensalmente, com vencimento no dia {{dia_venc|10||1}} de cada mês, e reajustados a cada 12 (doze) meses pelo IPCA/IBGE."
     },
     {
      "html": "A CONTRATADA emitirá recibo ou documento fiscal referente a cada pagamento, conforme seu enquadramento tributário."
     }
    ]
   },
   {
    "n": 10,
    "titulo": "Dos Custos de Terceiros",
    "itens": [
     {
      "html": "Não estão incluídos no valor deste contrato, salvo indicação expressa no Anexo I, os custos de serviços, contas e licenças de terceiros, tais como: hospedagem e infraestrutura, domínios, licenças de software, APIs pagas, bancos de imagens, contas de lojas de aplicativos e taxas de meios de pagamento."
     },
     {
      "html": "Sempre que possível, esses serviços serão contratados em nome e com os meios de pagamento do CONTRATANTE, que será o titular das respectivas contas. Quando a CONTRATADA adiantar algum desses custos, com autorização prévia, o valor será reembolsado mediante comprovante."
     },
     {
      "html": "A CONTRATADA poderá recomendar fornecedores, mas não responde por alterações de preço, políticas, indisponibilidade ou descontinuidade de serviços de terceiros."
     }
    ]
   },
   {
    "n": 11,
    "titulo": "Das Alterações de Escopo",
    "itens": [
     {
      "html": "Solicitações de novas funcionalidades, páginas, conteúdos, mudanças de direção criativa ou de qualquer item não previsto no Anexo I serão avaliadas pela CONTRATADA, que apresentará orçamento e impacto no prazo antes de executá-las."
     },
     {
      "html": "A alteração somente será executada após aprovação escrita do CONTRATANTE (e-mail é suficiente) e passará a integrar este contrato como aditivo."
     },
     {
      "html": "Pequenos ajustes poderão, a critério da CONTRATADA, ser absorvidos sem custo, o que não gera obrigação de absorver ajustes futuros."
     },
     {
      "html": "Valor de referência para serviços adicionais: R$ {{hora_tecnica|150|150|}} por hora técnica, ou orçamento fechado por item."
     }
    ]
   },
   {
    "n": 12,
    "titulo": "Da Propriedade Intelectual",
    "itens": [
     {
      "html": "Após a quitação integral, a CONTRATADA cede ao CONTRATANTE, em caráter definitivo e exclusivo, os direitos patrimoniais sobre os elementos criados especificamente para o PROJETO — como layout, interfaces, código-fonte específico, textos e artes produzidos sob encomenda —, nos termos da Lei nº 9.609/1998 (Lei do Software) e da Lei nº 9.610/1998 (Lei de Direitos Autorais)."
     },
     {
      "html": "Permanecem de titularidade da CONTRATADA os componentes pré-existentes ou genéricos por ela desenvolvidos — bibliotecas, módulos reutilizáveis, modelos-base, ferramentas internas e know-how —, sobre os quais o CONTRATANTE recebe licença de uso perpétua, gratuita, irrevogável e não exclusiva, vinculada ao PROJETO. A CONTRATADA poderá reutilizá-los em outros trabalhos, sem utilizar dados, marca ou conteúdo exclusivo do CONTRATANTE."
     },
     {
      "html": "Componentes de código aberto e de terceiros incorporados ao PROJETO seguem suas próprias licenças, que o CONTRATANTE se compromete a respeitar."
     },
     {
      "html": "Até a quitação integral, o CONTRATANTE terá licença provisória de uso, que poderá ser suspensa em caso de inadimplemento."
     },
     {
      "html": "Portfólio: conforme a opção marcada no Quadro-Resumo, a CONTRATADA poderá exibir o PROJETO (nome, imagens e descrição geral) em seu site, portfólio e redes sociais, sem revelar informações confidenciais."
     },
     {
      "html": "Crédito: conforme a opção marcada no Quadro-Resumo, a CONTRATADA poderá manter crédito discreto (“Desenvolvido por Blajeen Labs”) no rodapé, nos créditos ou na tela “Sobre”. Os direitos morais de autor são preservados em qualquer hipótese (art. 24 da Lei nº 9.610/1998)."
     }
    ]
   },
   {
    "n": 13,
    "titulo": "Das Garantias",
    "itens": [
     {
      "html": "<strong>Garantia Blajeen de 7 dias.</strong> O CONTRATANTE poderá desistir da contratação em até 7 (sete) dias corridos contados da assinatura, com devolução integral dos valores pagos em até 10 (dez) dias úteis, pelo mesmo meio de pagamento, em consonância com o art. 49 do Código de Defesa do Consumidor. O exercício dessa garantia implica a não utilização de qualquer material eventualmente entregue."
     },
     {
      "html": "<strong>Garantia técnica.</strong> Por 90 (noventa) dias contados da publicação de cada versão (release), a CONTRATADA corrigirá sem custo as falhas de funcionamento em relação aos itens aprovados naquela versão."
     },
     {
      "html": "A garantia técnica não cobre:",
      "lista": [
       "alterações feitas pelo CONTRATANTE ou por terceiros;",
       "novas funcionalidades, melhorias ou mudanças de escopo;",
       "falhas, mudanças ou atualizações de serviços de terceiros (hospedagem, APIs, lojas de aplicativos, navegadores, sistemas operacionais);",
       "uso em desacordo com as orientações fornecidas;",
       "conteúdos inseridos pelo CONTRATANTE após a entrega."
      ]
     },
     {
      "html": "As garantias deste contrato somam-se aos direitos previstos na legislação aplicável, sem substituí-los."
     }
    ]
   },
   {
    "n": 14,
    "titulo": "Do Suporte e da Evolução",
    "itens": [
     {
      "html": "Após a garantia técnica, suporte e evolução contínua poderão ser contratados por banco de horas mensal ou por hora técnica (Anexo I)."
     }
    ]
   },
   {
    "n": 15,
    "titulo": "Da Confidencialidade",
    "itens": [
     {
      "html": "As PARTES manterão sigilo sobre as informações confidenciais a que tiverem acesso em razão deste contrato — dados comerciais e financeiros, estratégias, credenciais, dados de clientes, código-fonte e as condições deste instrumento —, utilizando-as exclusivamente para a execução do PROJETO."
     },
     {
      "html": "A obrigação de sigilo permanece por 5 (cinco) anos após o término do contrato e não se aplica a informações que sejam ou se tornem públicas sem culpa da parte receptora, que já fossem de seu conhecimento, que tenham sido desenvolvidas de forma independente ou cuja divulgação seja exigida por lei ou ordem judicial."
     },
     {
      "html": "Senhas e credenciais compartilhadas durante o PROJETO deverão ser alteradas pelo CONTRATANTE após a entrega final."
     }
    ]
   },
   {
    "n": 16,
    "titulo": "Da Proteção de Dados Pessoais",
    "itens": [
     {
      "html": "As PARTES cumprirão a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados — LGPD). Em relação aos dados pessoais tratados por meio do PROJETO (por exemplo, dados de clientes, usuários ou contatos do CONTRATANTE), o CONTRATANTE atua como controlador e a CONTRATADA, quando os tratar, como operadora, seguindo exclusivamente as instruções lícitas do CONTRATANTE."
     },
     {
      "html": "A CONTRATADA adotará medidas técnicas e administrativas razoáveis de segurança, limitará o acesso aos profissionais envolvidos no PROJETO e comunicará ao CONTRATANTE, em prazo razoável, os incidentes de segurança de que tiver conhecimento."
     },
     {
      "html": "Cabe ao CONTRATANTE definir as bases legais do tratamento, disponibilizar sua política de privacidade e atender às solicitações dos titulares, podendo a CONTRATADA prestar apoio técnico dentro do escopo contratado."
     },
     {
      "html": "Encerrado o contrato, a CONTRATADA devolverá ou eliminará os dados pessoais sob sua guarda, ressalvadas as hipóteses legais de conservação."
     },
     {
      "html": "Os dados das PARTES e de seus representantes serão tratados apenas para a gestão e a execução deste contrato."
     }
    ]
   },
   {
    "n": 17,
    "titulo": "Da Vigência e da Rescisão",
    "itens": [
     {
      "html": "Este contrato vigora da assinatura até a conclusão do PROJETO e o término da garantia técnica. Os planos mensais, quando contratados, vigoram por prazo indeterminado e podem ser cancelados por qualquer das PARTES mediante aviso prévio de 30 (trinta) dias."
     },
     {
      "html": "Qualquer das PARTES poderá rescindir o contrato em caso de descumprimento da outra que não seja sanado em até 10 (dez) dias após notificação por escrito."
     },
     {
      "html": "Rescisão sem justa causa pelo CONTRATANTE, após o prazo da Garantia Blajeen de 7 dias: serão devidos os valores das etapas já executadas e, proporcionalmente, da etapa em andamento, acrescidos de multa compensatória de 10% (dez por cento) sobre o saldo não executado do contrato."
     },
     {
      "html": "Rescisão sem justa causa pela CONTRATADA: esta devolverá os valores pagos referentes às etapas não executadas, entregará o que tiver sido produzido até então e pagará multa compensatória de 10% (dez por cento) sobre o saldo não executado do contrato."
     },
     {
      "html": "Em qualquer hipótese de encerramento, a CONTRATADA entregará os materiais correspondentes às etapas pagas."
     },
     {
      "html": "Nas modalidades de sprints e banco de horas, aplica-se o encerramento sem multa previsto na Cláusula 5."
     }
    ]
   },
   {
    "n": 18,
    "titulo": "Da Responsabilidade",
    "itens": [
     {
      "html": "A CONTRATADA responde pelos danos diretos que comprovadamente causar por culpa na execução dos serviços, limitados, na máxima extensão permitida pela legislação, ao valor total efetivamente pago por este contrato."
     },
     {
      "html": "A CONTRATADA não responde por:",
      "lista": [
       "lucros cessantes, perda de receita ou resultados comerciais esperados, como vendas, acessos, engajamento ou posição em buscadores;",
       "indisponibilidade, falhas ou mudanças de serviços de terceiros;",
       "incidentes decorrentes de senhas ou acessos mal guardados pelo CONTRATANTE ou por sua equipe;",
       "conteúdos fornecidos, publicados ou alterados pelo CONTRATANTE."
      ]
     },
     {
      "html": "A CONTRATADA se obriga a entregar o escopo contratado; resultados de negócio dependem de fatores externos e não são garantidos."
     }
    ]
   },
   {
    "n": 19,
    "titulo": "Das Disposições Gerais",
    "itens": [
     {
      "html": "Este contrato não cria vínculo empregatício, societário ou de representação entre as PARTES. Cada parte responde por seus tributos, encargos e colaboradores."
     },
     {
      "html": "A CONTRATADA poderá contar com colaboradores e parceiros especializados, permanecendo responsável perante o CONTRATANTE pela execução do PROJETO."
     },
     {
      "html": "As comunicações oficiais serão feitas pelos e-mails indicados no Quadro-Resumo. Aprovações e solicitações também poderão ser registradas por aplicativo de mensagens, desde que de forma clara e inequívoca."
     },
     {
      "html": "A tolerância quanto ao descumprimento de qualquer cláusula não implica renúncia nem novação. Nenhuma das PARTES poderá ceder este contrato sem a concordância da outra, e a invalidade de qualquer disposição não prejudica as demais."
     },
     {
      "html": "Alterações a este contrato somente terão validade por escrito, inclusive por e-mail ou aditivo assinado eletronicamente."
     },
     {
      "html": "<strong>Assinatura eletrônica.</strong> As PARTES reconhecem a validade da assinatura deste contrato por meio eletrônico, nos termos do art. 10, § 2º, da Medida Provisória nº 2.200-2/2001 e da Lei nº 14.063/2020, e concordam que, conferida a integridade pelo provedor de assinatura, fica dispensada a assinatura de testemunhas (art. 784, § 4º, do Código de Processo Civil)."
     }
    ]
   },
   {
    "n": 20,
    "titulo": "Do Foro",
    "itens": [
     {
      "html": "Fica eleito o foro da Comarca de {{cidade_foro|Cidade/UF||}} para dirimir as questões oriundas deste contrato, ressalvado o direito do CONTRATANTE, quando consumidor, de demandar no foro de seu domicílio."
     },
     {
      "html": "Antes de qualquer medida judicial, as PARTES se comprometem a buscar solução amigável por negociação direta, pelo prazo mínimo de 15 (quinze) dias."
     }
    ]
   }
  ]
 }
};

export const SERVICOS_BASE: Record<ServicoId, ServicoCatalogo> = {
 "site": {
  "numero": "01",
  "nome": "Sites",
  "rotulo": "Desenvolvimento",
  "tag": "Lojas, hotéis e marcas no ar.",
  "intro": "Sites com identidade própria, rápidos e feitos para transformar visita em contato. Do cartão de visitas digital à loja virtual com painel de gestão.",
  "ideal": [
   "Negócios locais",
   "Hotéis e pousadas",
   "Lojas",
   "Profissionais liberais",
   "Marcas em lançamento"
  ],
  "destaque": null,
  "planos": [
   {
    "id": "lp",
    "nivel": "Essencial",
    "nome": "Landing Page",
    "preco": 749,
    "unidade": "",
    "aPartir": false,
    "prazo": "10 a 15 dias úteis",
    "itens": [
     "Página única com até 7 seções",
     "Layout exclusivo com a sua identidade",
     "100% responsiva: celular, tablet e computador",
     "WhatsApp e formulário de contato",
     "SEO técnico e Google Analytics",
     "Publicação com domínio e SSL"
    ],
    "destaque": false
   },
   {
    "id": "inst",
    "nivel": "Profissional",
    "nome": "Site Institucional",
    "preco": 1490,
    "unidade": "",
    "aPartir": false,
    "prazo": "20 a 30 dias úteis",
    "itens": [
     "Até 6 páginas (início, sobre, serviços, galeria, contato…)",
     "Tudo do Essencial",
     "Galeria, portfólio e mapa",
     "Avaliações do Google integradas",
     "Blog ou página de novidades",
     "SEO local e otimização de velocidade"
    ],
    "destaque": true
   },
   {
    "id": "painel",
    "nivel": "Premium",
    "nome": "Site + Painel de Gestão",
    "preco": 2990,
    "unidade": "",
    "aPartir": false,
    "prazo": "30 a 45 dias úteis",
    "itens": [
     "Site completo com até 8 páginas",
     "Painel privado: reservas, agenda ou pedidos",
     "Cadastro de quartos, serviços ou produtos",
     "Acesso seguro para a equipe",
     "Avisos por e-mail e WhatsApp",
     "Treinamento de uso (1h online)"
    ],
    "destaque": false
   },
   {
    "id": "loja",
    "nivel": "E-commerce",
    "nome": "Loja Virtual",
    "preco": 3990,
    "unidade": "",
    "aPartir": true,
    "prazo": "45 a 60 dias úteis",
    "itens": [
     "Catálogo com busca, filtros e ofertas",
     "Carrinho e checkout com Pix e cartão",
     "Gestão de estoque e pedidos",
     "Painel sob medida para o lojista",
     "Frete, entrega ou retirada",
     "Relatórios de vendas"
    ],
    "destaque": false
   }
  ],
  "mensais": [
   {
    "id": "hosp",
    "nome": "Hospedagem + Manutenção",
    "preco": 69,
    "unidade": "/mês",
    "descricao": "Hospedagem, SSL, backups, monitoramento e até 1h de ajustes por mês."
   },
   {
    "id": "plus",
    "nome": "Manutenção Plus",
    "preco": 129,
    "unidade": "/mês",
    "descricao": "Para sites com painel ou loja: tudo do anterior, até 3h de ajustes e prioridade."
   }
  ],
  "adicionais": [
   {
    "id": "add_0",
    "nome": "Página extra",
    "preco": 149,
    "qualificador": ""
   },
   {
    "id": "add_1",
    "nome": "Textos profissionais (copywriting)",
    "preco": 249,
    "qualificador": ""
   },
   {
    "id": "add_2",
    "nome": "Versão em outro idioma",
    "preco": 349,
    "qualificador": ""
   },
   {
    "id": "add_3",
    "nome": "Google Perfil da Empresa configurado",
    "preco": 149,
    "qualificador": ""
   },
   {
    "id": "add_4",
    "nome": "Agendamento online integrado",
    "preco": 249,
    "qualificador": ""
   },
   {
    "id": "add_5",
    "nome": "E-mails profissionais @suamarca",
    "preco": 99,
    "qualificador": ""
   }
  ]
 },
 "sistema": {
  "numero": "02",
  "nome": "Sistemas",
  "rotulo": "Sistemas, apps e programas",
  "tag": "A operação saindo do improviso.",
  "intro": "Sistemas, aplicativos e programas sob medida para organizar vendas, estoque, agenda, equipe e financeiro — com o seu jeito de trabalhar, não o contrário.",
  "ideal": [
   "Comércios e distribuidoras",
   "Clínicas e consultórios",
   "Prestadores de serviço",
   "Indústrias",
   "Startups"
  ],
  "destaque": [
   "No mundo real",
   "Dom Guima",
   "E-commerce multimarcas com painel sob medida para produtos, estoque, vendas e comissões de vendedores. Organização que antes vivia em planilhas, agora em um só lugar."
  ],
  "planos": [
   {
    "id": "ess",
    "nivel": "Essencial",
    "nome": "Sistema de Gestão",
    "preco": 3490,
    "unidade": "",
    "aPartir": false,
    "prazo": "30 a 45 dias úteis",
    "itens": [
     "Até 5 módulos (ex.: clientes, agenda, estoque, vendas)",
     "Login com perfis de administrador e equipe",
     "Painel com indicadores do dia a dia",
     "Relatórios e exportação em planilha",
     "Funciona no computador e no celular",
     "Treinamento incluso"
    ],
    "destaque": false
   },
   {
    "id": "pro",
    "nivel": "Profissional",
    "nome": "Sistema Completo",
    "preco": 6490,
    "unidade": "",
    "aPartir": false,
    "prazo": "60 a 90 dias úteis",
    "itens": [
     "Até 10 módulos sob medida",
     "Permissões por função e unidade",
     "Dashboards e relatórios avançados",
     "Integrações: pagamentos, WhatsApp, e-mail, APIs",
     "Portal ou área do cliente",
     "Comissões, metas e automações"
    ],
    "destaque": true
   },
   {
    "id": "app",
    "nivel": "Avançado",
    "nome": "Plataforma + Aplicativo",
    "preco": 12490,
    "unidade": "",
    "aPartir": true,
    "prazo": "90 a 150 dias úteis",
    "itens": [
     "Sistema web + app Android e iOS",
     "Ou programa desktop para Windows",
     "Notificações push",
     "Publicação nas lojas de aplicativos",
     "Arquitetura multiunidade, pronta para crescer",
     "Documentação técnica completa"
    ],
    "destaque": false
   }
  ],
  "mensais": [
   {
    "id": "sup1",
    "nome": "Suporte Essencial",
    "preco": 199,
    "unidade": "/mês",
    "descricao": "Até 4h por mês, resposta em até 1 dia útil e atualizações de segurança."
   },
   {
    "id": "sup2",
    "nome": "Suporte Profissional",
    "preco": 399,
    "unidade": "/mês",
    "descricao": "Até 10h por mês, falha crítica atendida em até 4h úteis e melhorias contínuas."
   }
  ],
  "adicionais": [
   {
    "id": "add_0",
    "nome": "Módulo extra",
    "preco": 449,
    "qualificador": "a partir de"
   },
   {
    "id": "add_1",
    "nome": "Importação de dados de planilhas",
    "preco": 349,
    "qualificador": ""
   },
   {
    "id": "add_2",
    "nome": "Integração com pagamentos (Pix/cartão)",
    "preco": 599,
    "qualificador": ""
   },
   {
    "id": "add_3",
    "nome": "App mobile para sistema existente",
    "preco": 4490,
    "qualificador": "a partir de"
   },
   {
    "id": "add_4",
    "nome": "Integração de nota fiscal",
    "preco": 749,
    "qualificador": "a partir de"
   },
   {
    "id": "add_5",
    "nome": "Treinamento extra",
    "preco": 150,
    "qualificador": "/hora"
   }
  ]
 },
 "video": {
  "numero": "03",
  "nome": "Vídeos",
  "rotulo": "Produção de vídeo",
  "tag": "Vídeo profissional para divulgar seu negócio.",
  "intro": "Reels, vídeos institucionais e trends com roteiro, edição e acabamento pensados para prender a atenção nos primeiros segundos — e levar o público à ação.",
  "ideal": [
   "Perfis comerciais",
   "Lançamentos",
   "Pet shops e lojistas",
   "Restaurantes",
   "Prestadores de serviço"
  ],
  "destaque": null,
  "planos": [
   {
    "id": "trend",
    "nivel": "Rápido",
    "nome": "Vídeo Trend",
    "preco": 79,
    "unidade": "",
    "aPartir": false,
    "prazo": "até 3 dias úteis",
    "itens": [
     "Vídeo curto no formato das trends",
     "Ideal para pets, pessoas e produtos",
     "Até 15 segundos, vertical (9:16)",
     "Criação com IA + edição",
     "1 rodada de ajuste"
    ],
    "destaque": false
   },
   {
    "id": "reels",
    "nivel": "Essencial",
    "nome": "Reels Profissional",
    "preco": 390,
    "unidade": "",
    "aPartir": false,
    "prazo": "5 dias úteis",
    "itens": [
     "1 vídeo vertical de até 45 segundos",
     "Roteiro com gancho e chamada para ação",
     "Edição dinâmica, legendas e textos animados",
     "Trilha sonora licenciada",
     "2 rodadas de ajustes"
    ],
    "destaque": false
   },
   {
    "id": "pacote",
    "nivel": "Mensal",
    "nome": "Pacote Social",
    "preco": 1290,
    "unidade": "/mês",
    "aPartir": false,
    "prazo": "4 vídeos por mês",
    "itens": [
     "4 Reels/TikToks por mês",
     "Calendário de pautas mensal",
     "Capas personalizadas para o feed",
     "Identidade visual consistente",
     "Sem fidelidade (aviso de 30 dias)"
    ],
    "destaque": true
   },
   {
    "id": "inst",
    "nivel": "Premium",
    "nome": "Institucional / Lançamento",
    "preco": 1890,
    "unidade": "",
    "aPartir": false,
    "prazo": "10 a 15 dias úteis",
    "itens": [
     "Vídeo de até 90 segundos",
     "Roteiro + storyboard",
     "Motion graphics, 3D ou IA generativa",
     "Locução (IA ou banco de vozes)",
     "Versões 9:16 e 16:9",
     "2 rodadas de ajustes"
    ],
    "destaque": false
   }
  ],
  "mensais": [],
  "adicionais": [
   {
    "id": "add_0",
    "nome": "Vídeo extra no pacote",
    "preco": 290,
    "qualificador": ""
   },
   {
    "id": "add_1",
    "nome": "Formato adicional (1:1 ou 16:9)",
    "preco": 90,
    "qualificador": ""
   },
   {
    "id": "add_2",
    "nome": "Legendas em outro idioma",
    "preco": 90,
    "qualificador": ""
   },
   {
    "id": "add_3",
    "nome": "Captação presencial (meio período)",
    "preco": 690,
    "qualificador": "+ deslocamento"
   },
   {
    "id": "add_4",
    "nome": "Entrega de arquivos editáveis",
    "preco": 190,
    "qualificador": ""
   },
   {
    "id": "add_5",
    "nome": "Locução profissional humana",
    "preco": "sob orçamento",
    "qualificador": ""
   }
  ]
 },
 "jogo": {
  "numero": "04",
  "nome": "Jogos",
  "rotulo": "Desenvolvimento de jogos",
  "tag": "Algumas ideias viram jogos.",
  "intro": "Jogos para marcas, escolas e criadores: do minijogo de campanha ao jogo mobile publicado nas lojas, construídos em marcos jogáveis que você testa a cada etapa.",
  "ideal": [
   "Marcas e campanhas",
   "Escolas e cursos",
   "Eventos",
   "Empresas (treinamento)",
   "Criadores e estúdios"
  ],
  "destaque": null,
  "planos": [
   {
    "id": "web",
    "nivel": "Advergame",
    "nome": "Minijogo Web",
    "preco": 4900,
    "unidade": "",
    "aPartir": false,
    "prazo": "30 a 45 dias úteis",
    "itens": [
     "Jogo de navegador para sites, campanhas e eventos",
     "1 a 3 fases com a identidade da marca",
     "Funciona no celular e no computador",
     "Placar e ranking local",
     "Ótimo para engajamento e captação de contatos"
    ],
    "destaque": false
   },
   {
    "id": "edu",
    "nivel": "Gamificação",
    "nome": "Jogo Educativo",
    "preco": 9900,
    "unidade": "",
    "aPartir": false,
    "prazo": "45 a 75 dias úteis",
    "itens": [
     "Quizzes, trilhas e desafios",
     "Pontos, níveis e conquistas",
     "Web ou mobile",
     "Painel para editar perguntas e fases",
     "Relatório de desempenho dos jogadores"
    ],
    "destaque": false
   },
   {
    "id": "mobile",
    "nivel": "Mobile",
    "nome": "Jogo Mobile Casual",
    "preco": 14900,
    "unidade": "",
    "aPartir": false,
    "prazo": "90 a 120 dias úteis",
    "itens": [
     "Android e iOS",
     "Até 20 fases ou modo infinito",
     "Arte 2D ou 3D estilizada",
     "Anúncios e compras no app integrados",
     "Publicação nas lojas"
    ],
    "destaque": true
   },
   {
    "id": "indie",
    "nivel": "Autoral",
    "nome": "Jogo Indie Completo",
    "preco": 39900,
    "unidade": "",
    "aPartir": true,
    "prazo": "cronograma por marcos",
    "itens": [
     "RPG, aventura, narrativa ou mundo aberto",
     "Game Design Document completo",
     "Universo, personagens e história",
     "Protótipo → beta → lançamento",
     "A mesma base técnica do nosso RPG Morvelio"
    ],
    "destaque": false
   }
  ],
  "mensais": [
   {
    "id": "live",
    "nome": "Suporte & Atualizações",
    "preco": 490,
    "unidade": "/mês",
    "descricao": "Correções, atualizações exigidas pelas lojas e até 3h de melhorias por mês."
   }
  ],
  "adicionais": [
   {
    "id": "add_0",
    "nome": "Fase ou nível extra",
    "preco": 490,
    "qualificador": "a partir de"
   },
   {
    "id": "add_1",
    "nome": "Ranking online",
    "preco": 1490,
    "qualificador": ""
   },
   {
    "id": "add_2",
    "nome": "Publicação em loja adicional",
    "preco": 790,
    "qualificador": ""
   },
   {
    "id": "add_3",
    "nome": "Versão em outro idioma",
    "preco": 890,
    "qualificador": ""
   },
   {
    "id": "add_4",
    "nome": "Personagem ou mascote exclusivo",
    "preco": 690,
    "qualificador": ""
   },
   {
    "id": "add_5",
    "nome": "Trilha sonora original",
    "preco": "sob orçamento",
    "qualificador": ""
   }
  ]
 },
 "projeto": {
  "numero": "05",
  "nome": "Sob medida",
  "rotulo": "Projetos personalizados",
  "tag": "Sua ideia, do zero ao produto.",
  "intro": "Para ideias que não cabem em pacotes. Você não precisa chegar com tudo definido: entendemos, prototipamos, provamos e construímos junto com você, ciclo a ciclo.",
  "ideal": [
   "Novos negócios digitais",
   "Ideias ainda no começo",
   "Produtos com regras próprias",
   "Empresas em transformação"
  ],
  "destaque": [
   "Por onde começar",
   "Comece pelo Diagnóstico",
   "Em 7 a 10 dias você tem protótipo navegável, prioridades e estimativa de prazo e investimento. O material é seu, e o valor é 100% abatido se o projeto seguir com a gente."
  ],
  "planos": [
   {
    "id": "disc",
    "nivel": "Comece aqui",
    "nome": "Diagnóstico & Protótipo",
    "preco": 1490,
    "unidade": "",
    "aPartir": false,
    "prazo": "7 a 10 dias úteis",
    "itens": [
     "Imersão no negócio e nas pessoas",
     "Mapa de funcionalidades e prioridades (MVP)",
     "Protótipo navegável das telas principais",
     "Estimativa de prazo e investimento",
     "100% abatido se o projeto for contratado em até 30 dias"
    ],
    "destaque": true
   },
   {
    "id": "id",
    "nivel": "Marca",
    "nome": "Identidade & Produto",
    "preco": 1290,
    "unidade": "",
    "aPartir": false,
    "prazo": "10 a 15 dias úteis",
    "itens": [
     "Nome (naming) e logotipo",
     "Paleta de cores e tipografia",
     "Direção visual e aplicações",
     "Mini manual de marca"
    ],
    "destaque": false
   },
   {
    "id": "sprint",
    "nivel": "Construção",
    "nome": "Sprint de Desenvolvimento",
    "preco": 4800,
    "unidade": "/sprint",
    "aPartir": false,
    "prazo": "ciclos de 2 semanas",
    "itens": [
     "Entregas testáveis a cada 2 semanas",
     "Planejamento e revisão com você",
     "Prioridades ajustáveis a cada ciclo",
     "Encerre quando quiser, entre sprints"
    ],
    "destaque": false
   },
   {
    "id": "horas",
    "nivel": "Contínuo",
    "nome": "Banco de Horas",
    "preco": 2600,
    "unidade": "/mês",
    "aPartir": false,
    "prazo": "20 horas por mês",
    "itens": [
     "Para evoluções e demandas contínuas",
     "Equivale a R$ 130 por hora",
     "Relatório mensal de horas",
     "Hora avulsa: R$ 150"
    ],
    "destaque": false
   }
  ],
  "mensais": [],
  "adicionais": [
   {
    "id": "add_0",
    "nome": "Consultoria técnica (1 hora)",
    "preco": 190,
    "qualificador": ""
   },
   {
    "id": "add_1",
    "nome": "Hora avulsa de desenvolvimento",
    "preco": 150,
    "qualificador": "/hora"
   },
   {
    "id": "add_2",
    "nome": "Pesquisa com usuários (5 entrevistas)",
    "preco": 890,
    "qualificador": ""
   }
  ]
 }
};

export const CASES = [
 {
  "nome": "Dom Guima",
  "tipo": "E-commerce / Sistema de gestão",
  "desc": "E-commerce multimarcas em Uberlândia com catálogo, busca e ofertas, mais um painel sob medida para produtos, estoque, vendas e comissões."
 },
 {
  "nome": "Pousada Dona Lia",
  "tipo": "Hospedagem / Site + painel",
  "desc": "Presença digital com acomodações, contato direto e painel privado para organizar reservas."
 },
 {
  "nome": "Spot Hotel e Pousada",
  "tipo": "Hospedagem / Site + painel",
  "desc": "Site focado em quartos e reservas, com painel próprio para agenda, hóspedes e operação."
 },
 {
  "nome": "Lina Art Pet",
  "tipo": "Vídeos / Parceria",
  "desc": "Parceria em vídeos “seu pet em modo trend”: conteúdo divertido, rápido e com valores acessíveis."
 },
 {
  "nome": "Morvelio",
  "tipo": "Jogo autoral / RPG mobile",
  "desc": "RPG da casa, com mundo, missões, itens e wiki próprios. É a prova de que construímos jogos de verdade, do universo ao código."
 }
] as const;

export const DEPOIMENTOS = [
 [
  "Criou um site que sanou todas as minhas dificuldades em organização da empresa. Recomendo de olhos fechados.",
  "Dom Guima",
  "E-commerce · Uberlândia"
 ],
 [
  "Super recomendo. Já fez trabalho para mim e para outros lojistas da região.",
  "Lina Art Pet",
  "Parceira em vídeos"
 ]
] as const;

export const HORA_TECNICA_BASE = 150;

export const QR_CRIE_SEU_PROJETO = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 31 31\" class=\"segno\"><path class=\"qrline\" stroke=\"#090a08\" d=\"M1 1.5h7m1 0h4m1 0h2m3 0h1m1 0h1m1 0h7m-29 1h1m5 0h1m1 0h1m3 0h2m3 0h1m1 0h2m1 0h1m5 0h1m-29 1h1m1 0h3m1 0h1m1 0h3m2 0h2m1 0h1m5 0h1m1 0h3m1 0h1m-29 1h1m1 0h3m1 0h1m2 0h1m1 0h3m1 0h3m4 0h1m1 0h3m1 0h1m-29 1h1m1 0h3m1 0h1m1 0h2m1 0h1m4 0h4m2 0h1m1 0h3m1 0h1m-29 1h1m5 0h1m7 0h1m3 0h1m3 0h1m5 0h1m-29 1h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7m-19 1h1m1 0h5m3 0h1m-21 1h1m2 0h7m1 0h1m2 0h1m1 0h2m1 0h1m1 0h1m2 0h1m1 0h3m-28 1h1m2 0h1m3 0h3m1 0h4m3 0h1m3 0h2m1 0h2m-28 1h2m4 0h2m2 0h1m1 0h2m1 0h1m2 0h1m1 0h1m2 0h1m2 0h1m-26 1h1m3 0h1m1 0h4m3 0h10m1 0h1m2 0h1m-29 1h1m1 0h2m1 0h2m1 0h2m1 0h1m1 0h3m4 0h1m1 0h2m4 0h1m-28 1h2m1 0h2m1 0h1m2 0h1m1 0h7m1 0h1m1 0h7m-29 1h4m1 0h5m2 0h2m1 0h2m1 0h3m1 0h3m1 0h1m1 0h1m-28 1h1m2 0h1m4 0h2m3 0h1m1 0h1m4 0h2m1 0h1m1 0h1m1 0h1m-29 1h1m5 0h1m3 0h3m1 0h3m2 0h2m2 0h1m1 0h1m-26 1h1m1 0h1m2 0h1m2 0h1m1 0h1m1 0h2m1 0h1m1 0h4m3 0h1m1 0h2m-28 1h2m4 0h3m1 0h1m4 0h1m1 0h1m1 0h1m3 0h3m2 0h1m-29 1h5m2 0h1m1 0h2m1 0h1m1 0h1m1 0h1m5 0h2m1 0h2m-27 1h2m3 0h3m1 0h2m1 0h3m1 0h3m1 0h8m-20 1h4m2 0h5m1 0h1m3 0h2m-26 1h7m1 0h2m1 0h2m1 0h4m1 0h2m1 0h1m1 0h2m-26 1h1m5 0h1m1 0h2m4 0h1m2 0h1m1 0h2m3 0h1m2 0h1m-28 1h1m1 0h3m1 0h1m1 0h1m2 0h5m3 0h7m2 0h1m-29 1h1m1 0h3m1 0h1m1 0h1m3 0h1m2 0h2m11 0h1m-29 1h1m1 0h3m1 0h1m3 0h4m1 0h1m1 0h3m1 0h1m1 0h2m1 0h3m-29 1h1m5 0h1m2 0h2m1 0h1m1 0h1m6 0h1m3 0h2m1 0h1m-29 1h7m1 0h1m2 0h1m3 0h1m3 0h6\"/></svg>\n";
