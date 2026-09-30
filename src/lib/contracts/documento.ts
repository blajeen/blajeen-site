import { MODELOS } from '@/content/contratos/modelos.generated';
import type { ItemDeClausula } from '@/content/contratos/tipos';
import { valorOu } from '@/content/blockers';
import { site } from '@/content/site';
import type { CatalogoVigente } from './catalogo';
import type { CamposContrato, Contrato } from './types';
import { dataBr, lerValor, numeroBr, reais, valorPorExtenso } from './valores';

/**
 * Documento do contrato em HTML completo, pronto para imprimir ou salvar em PDF.
 *
 * Mesmo layout do kit comercial: capa escura, quadro-resumo, cláusulas, assinaturas e anexos.
 * Os textos dos modelos são confiáveis (vêm do repositório); tudo que vem do painel ou do cliente
 * passa por `esc` antes de entrar no HTML.
 */

export function esc(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

type Valores = Record<string, string>;

const CAMPOS_MULTILINHA = new Set(['resumo_combinado', 'escopo_detalhe']);

export function valoresDoContrato(contrato: Pick<Contrato, 'termos' | 'cliente' | 'numero'>): Valores {
  const valores: Valores = {
    contratada_nome: site.razaoSocial,
    contratada_doc: site.cnpj,
    contratada_email: valorOu(site.emailEstudio, ''),
    ...contrato.termos,
    ...contrato.cliente,
    contrato_numero: contrato.numero,
  };
  const numero = lerValor(valores.valor_total ?? '');
  if (numero !== null) {
    valores.valor_total = numeroBr(numero);
    valores.valor_extenso = valorPorExtenso(numero);
  }
  if (valores.data_assinatura) valores.data_assinatura = dataBr(valores.data_assinatura);
  return valores;
}

function campo(v: Valores, chave: string, exemplo: string, padrao = '', opcional = false): string {
  const valor = (v[chave] ?? '').trim() || padrao.trim();
  if (valor) return `<span class="v${CAMPOS_MULTILINHA.has(chave) ? ' multi' : ''}">${esc(valor)}</span>`;
  if (opcional) return '—';
  return `<span class="vazio">${esc(exemplo)}</span>`;
}

function caixa(v: Valores, chave: string, rotulo: string): string {
  return `<span class="ckl"><span class="ck${v[chave] === '1' ? ' on' : ''}" role="img" aria-label="${v[chave] === '1' ? 'marcado' : 'não marcado'}"></span>${rotulo}</span>`;
}

/** Resolve `{{chave|exemplo|padrão|opcional}}` e `[[chave|rótulo|grupo]]` dos modelos. */
export function resolverMarcadores(html: string, v: Valores): string {
  return html
    .replace(/\{\{([a-z0-9_]+)\|([^|}]*)\|([^|}]*)\|(1?)\}\}/g, (_, chave: string, exemplo: string, padrao: string, opcional: string) =>
      campo(v, chave, exemplo, padrao, opcional === '1'))
    .replace(/\[\[([a-z0-9_]+)\|([^|\]]*)\|([^|\]]*)\]\]/g, (_, chave: string, rotulo: string) => caixa(v, chave, rotulo));
}

const LOCKUP = '<div class="lockup"><img src="/brand/blajeen-crest-header.webp" alt=""><span class="wm">BLAJEEN<small>LABS</small></span></div>';

const NOME_DO_SERVICO: Record<string, string> = {
  site: 'DESENVOLVIMENTO DE SITE', sistema: 'DESENVOLVIMENTO DE SISTEMA', video: 'PRODUÇÃO DE VÍDEO',
  jogo: 'DESENVOLVIMENTO DE JOGO', projeto: 'PROJETO SOB MEDIDA',
};

function item(n: number, i: number, it: ItemDeClausula, v: Valores): string {
  let corpo: string;
  if ('bloco' in it) corpo = it.bloco;
  else if (it.lista) corpo = `<p>${it.html}</p><ol class="al">${it.lista.map((x) => `<li>${x}</li>`).join('')}</ol>`;
  else corpo = `<p>${it.html}</p>`;
  return `<div class="item"><span class="in">${n}.${i}</span><div>${resolverMarcadores(corpo, v)}</div></div>`;
}

export type OpcoesDocumento = {
  /** Painel mostra "voltar ao painel"; cliente volta para a página do link. */
  voltarPara: string;
  rotuloVoltar: string;
};

export function renderizarContrato(contrato: Contrato, catalogo: CatalogoVigente, opcoes: OpcoesDocumento): string {
  const modelo = MODELOS[contrato.servico];
  const servico = catalogo.servicos[contrato.servico];
  const v = valoresDoContrato(contrato);
  const f = (chave: string, exemplo: string, padrao = '', opcional = false) => campo(v, chave, exemplo, padrao, opcional);
  const ck = (chave: string, rotulo: string) => caixa(v, chave, rotulo);

  const capa = `
<section class="cover">
  <div class="rail"></div>
  <div class="ghost">${modelo.indice}</div>
  <div class="cover-top">${LOCKUP}<div class="num">CONTRATO Nº<b>${esc(contrato.numero)}</b></div></div>
  <div class="cover-mid">
    <div class="kicker">Contrato de prestação de serviços</div>
    <h1>${modelo.h1}</h1>
    <p class="lead">${modelo.lead}</p>
  </div>
  <div class="cover-meta">
    <div><span class="lbl">Contratante</span><span class="val">${f('contratante_nome', 'Nome do cliente')}</span></div>
    <div><span class="lbl">Projeto</span><span class="val">${f('projeto_nome', 'Nome do projeto')}</span></div>
    <div><span class="lbl">Data</span><span class="val">${f('data_assinatura', 'dd/mm/aaaa')}</span></div>
  </div>
  <div class="cover-foot"><span>Design com identidade. <b>Engenharia em cada detalhe.</b></span><span>blajeen.com.br · ${esc(site.instagram.rotulo)}</span></div>
</section>`;

  const celulas: Array<[string, string, string]> = [
    ['Contratante', `${f('contratante_nome', 'Nome completo ou razão social')}<small>CPF/CNPJ ${f('contratante_doc', '000.000.000-00')}</small>`, ''],
    ['Contratada', `${f('contratada_nome', 'Razão social')}<small>Blajeen Labs · CNPJ ${f('contratada_doc', '00.000.000/0001-00')}</small>`, ''],
    ['Projeto', f('projeto_nome', 'Nome do projeto ou da marca'), ''],
    ['Plano contratado', f('plano_nome', 'Plano escolhido no Anexo I'), ''],
    ['Investimento total', `R$ ${f('valor_total', '0.000,00')}<small>${f('forma_pagamento', 'condições de pagamento', modelo.pagamento)}<br>Parcelamento: ${f('parcelamento', 'à vista', 'à vista')}</small>`, 'price'],
    ['Prazo estimado', `${f('prazo', '00 dias úteis')}<small>após assinatura, entrada e envio dos materiais</small>`, ''],
    ['Ajustes incluídos', modelo.revisoesCurto, ''],
    ['Garantias', modelo.garantiaCurto, ''],
    ['Plano mensal', f('plano_mensal', 'Não contratado', 'Não contratado'), ''],
    ['Portfólio e crédito', `${ck('port_sim', 'Autorizo exibir o projeto no portfólio')}<br>${ck('cred_sim', 'Autorizo o crédito “Desenvolvido por Blajeen Labs”')}`, ''],
    ['E-mails oficiais', `${f('contratante_email', 'e-mail do cliente')} &nbsp;·&nbsp; ${f('contratada_email', 'e-mail da Blajeen')}`, 'full'],
    ['O combinado', f('resumo_combinado', 'Resumo da ideia e do que foi combinado com o cliente.'), 'full combinado'],
  ];
  const etapas = modelo.etapas.map((e, i) => `<div class="st"><div class="n">${String(i + 1).padStart(2, '0')}</div><div class="t">${e.titulo}</div><div class="d">${e.descricao}</div></div>`).join('');
  const resumo = `
<section class="resumo">
  <div class="sec-head"><span class="mono">Quadro-resumo · ${modelo.tituloCurto}</span>
    <h2>O essencial, <span class="em">em uma página.</span></h2>
    <p>Os pontos principais deste contrato, para consulta rápida. Os detalhes estão nas cláusulas e nos anexos, que prevalecem em caso de dúvida.</p></div>
  <div class="summary">${celulas.map(([l, val, c]) => `<div class="cell ${c}"><span class="lbl">${l}</span><div class="val">${val}</div></div>`).join('')}</div>
  <div class="sub">Como o projeto acontece</div>
  <div class="steps" style="grid-template-columns: repeat(${modelo.etapas.length}, 1fr)">${etapas}</div>
  <div class="note"><img src="/brand/dinorobo-olhos-abertos.png" alt=""><div><b>Um contrato claro é o começo de um bom projeto.</b>
  Escrevemos este documento em linguagem direta, para que você saiba exatamente o que vai receber, quando e em que condições.
  Se algo não ficar claro, pergunte antes de assinar — respondemos por escrito.</div></div>
</section>`;

  const clausulas = `
<section class="clauses"><div class="sec-head"><span class="mono">Cláusulas</span><h2>Termos e <span class="em">condições.</span></h2></div>
${modelo.clausulas.map((c) => `<div class="clause"><div class="clause-head"><span class="n">CLÁUSULA ${String(c.n).padStart(2, '0')}</span><h3>${c.titulo}</h3></div>${c.itens.map((it, i) => item(c.n, i + 1, it, v)).join('')}</div>`).join('')}
</section>`;

  const assinaturas = `
<section class="signs">
  <div class="sec-head"><span class="mono">Assinaturas</span><h2>Tudo certo. Agora é <span class="em">assinar.</span></h2>
  <p>E, por estarem de acordo, as PARTES assinam este contrato eletronicamente, para que produza seus efeitos legais.</p>
  <p>${f('local_assinatura', 'Cidade/UF')}, ${f('data_assinatura', 'dd/mm/aaaa')}.</p></div>
  <div class="sign-grid">
    <div class="sign"><span class="role">Contratante</span><span class="nm">${f('contratante_nome', 'Nome completo ou razão social')}</span><span class="dc">CPF/CNPJ ${f('contratante_doc', '000.000.000-00')}</span></div>
    <div class="sign"><span class="role">Contratada · Blajeen Labs</span><span class="nm">${f('contratada_nome', 'Razão social')}</span><span class="dc">CNPJ ${f('contratada_doc', '00.000.000/0001-00')}</span></div>
  </div>
  <div class="wit">
    <div class="sign"><span class="role">Testemunha 1 (opcional)</span><span class="nm">${f('test1_nome', 'Nome', '', true)}</span><span class="dc">CPF ${f('test1_cpf', '000.000.000-00', '', true)}</span></div>
    <div class="sign"><span class="role">Testemunha 2 (opcional)</span><span class="nm">${f('test2_nome', 'Nome', '', true)}</span><span class="dc">CPF ${f('test2_cpf', '000.000.000-00', '', true)}</span></div>
  </div>
  <div class="esign">
    <div><span class="mono">01 · Validade</span><b>Assinatura eletrônica</b>Tem validade jurídica (MP 2.200-2/2001 e Lei 14.063/2020). Com a integridade conferida pela plataforma, as testemunhas são dispensáveis (CPC, art. 784, § 4º).</div>
    <div><span class="mono">02 · Como assinar</span><b>Pelo link enviado por e-mail</b>Você recebe o contrato por e-mail ou WhatsApp, confere tudo e assina pelo celular ou computador, em poucos minutos.</div>
    <div><span class="mono">03 · Registro</span><b>Cópia para as duas partes</b>Ao final, a plataforma envia a todos o PDF assinado com o relatório de assinaturas (data, hora, IP e autenticação).</div>
  </div>
</section>`;

  const cards = servico.planos.map((p) => {
    const pequeno = p.aPartir ? 'a partir de' : p.unidade === '/mês' ? 'recorrente' : p.unidade ? 'por ciclo' : 'investimento';
    return `<div class="plan${p.destaque ? ' hl' : ''}"><div class="top"><div><span class="lvl">${ck(`plano_${p.id}`, '')}${esc(p.nivel)}</span>
      <span class="nm">${esc(p.nome)}</span></div><div class="pr"><small>${pequeno}</small>${reais(p.preco)}${p.unidade ? `<span style="font-size:7.5pt;font-weight:500">${esc(p.unidade)}</span>` : ''}</div></div>
      <span class="pz">Prazo estimado: ${esc(p.prazo)}</span><ul>${p.itens.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
  }).join('');
  const mensais = servico.mensais.length ? `<div class="sub">Planos mensais (opcional)</div><table class="rows"><tbody>${servico.mensais.map((m) =>
    `<tr><td>${ck(`mensal_${m.id}`, '')}<b>${esc(m.nome)}</b><span class="d">${esc(m.descricao)}</span></td><td class="r">${reais(m.preco)}${esc(m.unidade)}</td></tr>`).join('')}
    <tr><td>${ck('mensal_nao', '')}<b>Não contratar plano mensal agora</b></td><td class="r">—</td></tr></tbody></table>` : '';
  const precoAdicional = (preco: number | string, q: string) => typeof preco === 'string' ? esc(preco)
    : q === 'a partir de' ? `a partir de ${reais(preco)}` : q.startsWith('+') ? `${reais(preco)} ${esc(q)}` : `${reais(preco)}${esc(q)}`;
  const adicionais = servico.adicionais.map((a) => `<div class="cellrow"><span>${ck(a.id, '')}${esc(a.nome)}</span><b>${precoAdicional(a.preco, a.qualificador)}</b></div>`).join('')
    + [1, 2].filter((i) => (v[`extra${i}_desc`] ?? '').trim()).map((i) =>
      `<div class="cellrow"><span>${f(`extra${i}_desc`, 'Item adicional', '', true)}</span><b>R$ ${f(`extra${i}_valor`, '0,00', '', true)}</b></div>`).join('');
  const anexo1 = `
<section class="annex">
  <div class="sec-head"><span class="mono">Anexo I</span><h2>Plano e <span class="em">escopo.</span></h2>
  <p>${modelo.multiPlano ? 'Itens contratados marcados abaixo.' : 'Plano contratado marcado abaixo.'} Valores de referência da Blajeen Labs; o valor final é o registrado no Quadro-Resumo.</p></div>
  <div class="plans${servico.planos.length === 3 ? ' c3' : ''}">${cards}</div>
  ${mensais}
  <div class="sub">Itens adicionais</div>
  <div class="addg">${adicionais}</div>
  <div class="sub">Detalhamento do escopo acordado</div>
  <div class="scope">${f('escopo_detalhe', 'Detalhes do escopo', '', true)}</div>
</section>`;

  const linhas = modelo.anexo2.map((r) => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td class="r">${r[3]}</td></tr>`).join('');
  const anexo2 = `
<section class="annex">
  <div class="sec-head"><span class="mono">Anexo II</span><h2>Etapas, prazos e <span class="em">pagamento.</span></h2>
  <p>Prazos estimados em dias úteis, contados conforme o Quadro-Resumo. Os valores de cada parcela seguem o percentual indicado sobre o investimento total.</p></div>
  <table class="rows"><thead><tr><th>Etapa</th><th>O que você recebe</th><th>Prazo estimado</th><th style="text-align:right">Pagamento</th></tr></thead><tbody>${linhas}</tbody></table>
  <div class="sub">O que você recebe ao final</div>
  <ol class="al">${modelo.entregaveis.map((x) => `<li>${x}</li>`).join('')}</ol>
  <div class="note" style="margin-top:6mm"><img src="/brand/blajeen-crest-header.webp" alt=""><div><b>Acompanhamento de perto.</b>
  Você recebe atualizações semanais e aprova cada etapa antes de seguirmos. Nada de surpresas no fim: o que muda é combinado por escrito antes.</div></div>
</section>`;

  const numero = esc(contrato.numero).replace(/"/g, '');
  const estiloPagina = `<style>@page { @top-right { content: "CONTRATO · ${NOME_DO_SERVICO[contrato.servico]}"; } @bottom-left { content: "blajeen.com.br  ·  CONTRATO Nº ${numero}"; } }</style>`;
  const barra = `
<div class="bar"><img src="/brand/blajeen-crest-header.webp" alt=""><span class="t">BLAJEEN LABS<small>Contrato ${esc(contrato.numero)}</small></span>
  <a href="${esc(opcoes.voltarPara)}">${esc(opcoes.rotuloVoltar)}</a>
  <button type="button" class="go" onclick="window.print()">Imprimir / salvar PDF</button></div>
<div class="help">Em “Imprimir”, escolha <b>Salvar como PDF</b> e desmarque <b>Cabeçalhos e rodapés</b>.</div>`;

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive"><title>Contrato ${esc(contrato.numero)} — Blajeen Labs</title>
<link rel="stylesheet" href="/documentos/contrato.css">${estiloPagina}</head>
<body>${barra}<main class="doc">${capa}${resumo}${clausulas}${assinaturas}${anexo1}${anexo2}</main></body></html>`;
}

/** Campos do contrato usados em relatórios e listas. */
export function valorNumerico(campos: CamposContrato): number {
  return lerValor(campos.valor_total ?? '') ?? 0;
}
