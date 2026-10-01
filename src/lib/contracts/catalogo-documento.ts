import { CASES, DEPOIMENTOS, QR_CRIE_SEU_PROJETO } from '@/content/contratos/modelos.generated';
import { SERVICOS_IDS, type ServicoCatalogo, type ServicoId } from '@/content/contratos/tipos';
import { valorOu } from '@/content/blockers';
import { site } from '@/content/site';
import { DESCRICAO_CURTA, planoInicial, type CatalogoVigente } from './catalogo';
import { esc } from './documento';
import { reais } from './valores';

/**
 * Catálogo de serviços em HTML completo (A4, páginas escuras), com os preços vigentes do painel.
 * Mesmo layout do kit comercial.
 */

const LOCKUP = '<div class="lockup"><img src="/brand/blajeen-crest-header.webp" alt=""><span class="wm">BLAJEEN<small>LABS</small></span></div>';
const ANO = new Date().getFullYear();

function ph(pagina: number): string {
  return `<div class="ph">${LOCKUP}<span class="pn">Catálogo de serviços ${ANO} · <b>${String(pagina).padStart(2, '0')}</b></span></div>`;
}

function pf(texto = 'Valores de referência · cada projeto recebe proposta personalizada'): string {
  return `<div class="pf"><span>blajeen.com.br</span><span>${texto}</span></div>`;
}

function aPartir(servico: ServicoCatalogo): string {
  const menor = planoInicial(servico);
  return reais(menor.preco) + menor.unidade;
}

function precoAdicional(preco: number | string, q: string): string {
  if (typeof preco === 'string') return `<b>${esc(preco)}</b>`;
  if (q === 'a partir de') return `<b><small>a partir de </small>${reais(preco)}</b>`;
  if (q.startsWith('+')) return `<b>${reais(preco)} <small>${esc(q)}</small></b>`;
  return `<b>${reais(preco)}${esc(q)}</b>`;
}

function paginaServico(id: ServicoId, s: ServicoCatalogo, pagina: number): string {
  const cards = s.planos.map((p) => `<div class="card${p.destaque ? ' hl' : ''}">${p.destaque ? '<span class="badge">Mais escolhido</span>' : ''}
    <span class="lvl">${esc(p.nivel)}</span><h3>${esc(p.nome)}</h3>
    <div class="price"><small>${p.aPartir ? 'a partir de' : '&nbsp;'}</small>${reais(p.preco)}${p.unidade ? `<span class="u">${esc(p.unidade)}</span>` : ''}</div>
    <span class="pz">${esc(p.prazo)}</span><ul>${p.itens.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('');
  const adicionais = s.adicionais.map((a) => `<div class="xrow"><span>${esc(a.nome)}</span>${precoAdicional(a.preco, a.qualificador)}</div>`).join('');
  let extras = s.mensais.length
    ? `<div class="extras two"><div class="xbox"><span class="xt">Planos mensais</span>${s.mensais.map((m) =>
      `<div class="xrow"><span>${esc(m.nome)}<span class="d">${esc(m.descricao)}</span></span><b>${reais(m.preco)}<small>${esc(m.unidade)}</small></b></div>`).join('')}</div>
      <div class="xbox"><span class="xt">Adicionais</span>${adicionais}</div></div>`
    : `<div class="extras"><div class="xbox"><span class="xt">Adicionais</span><div class="addgrid">${adicionais}</div></div></div>`;
  if (s.destaque) extras += `<div class="strip"><div><span class="ty">${esc(s.destaque[0] ?? '')}</span><h4>${esc(s.destaque[1] ?? '')}</h4></div><p>${esc(s.destaque[2] ?? '')}</p></div>`;
  const partes = s.tag.split(' ');
  const ultima = partes.pop() ?? '';
  return `
<section class="pg svc grid" data-servico="${id}">
  <div class="glow" style="width:170mm;height:170mm;right:-60mm;top:-50mm"></div>
  <div class="rail"></div>
  <div class="ghost">${s.numero}</div>
  ${ph(pagina)}
  <span class="lbl">${s.numero} / ${esc(s.rotulo)}</span>
  <h2>${esc(s.nome)}<span class="dot">.</span></h2>
  <p class="tag">${esc(partes.join(' '))} <span class="em">${esc(ultima)}</span></p>
  <p class="intro">${esc(s.intro)}</p>
  <div class="chips"><em>Ideal para</em>${s.ideal.map((c) => `<span>${esc(c)}</span>`).join('')}</div>
  <div class="cards ${s.planos.length === 3 ? 'c3' : 'c4'}">${cards}</div>
  ${extras}
  ${pf()}
</section>`;
}

/**
 * `publico`: a versão de `/crie-seu-projeto/catalogo`, para qualquer pessoa baixar. Muda só a barra
 * de cima (voltar à página de valores em vez do painel, e uma instrução curta para salvar o PDF).
 */
export function renderizarCatalogo(catalogo: CatalogoVigente, { publico = false }: { publico?: boolean } = {}): string {
  const s = catalogo.servicos;
  const nav = SERVICOS_IDS.map((id) => `<div><b>${s[id].numero}</b>${esc(s[id].nome)}</div>`).join('');

  const capa = `
<section class="pg cover grid">
  <div class="glow" style="width:230mm;height:230mm;right:-70mm;top:-10mm"></div>
  <div class="rail"></div>
  <div class="ph">${LOCKUP}<span class="pn">Catálogo de serviços · <b>${ANO}</b></span></div>
  <img class="mascot" src="/brand/dinorobo-olhos-abertos.png" alt="">
  <div class="c-mid">
    <span class="kick">Estúdio independente / ideias em movimento</span>
    <h1>Imagine o que<br>podemos <span class="em">criar.</span></h1>
    <p class="lead">Sites, sistemas, vídeos, jogos e projetos sob medida. Do código ao mundo real, com design de identidade e engenharia em cada detalhe.</p>
    <span class="cat">Catálogo de serviços ${ANO}</span>
  </div>
  <div class="nav5">${nav}</div>
  ${pf('Design com identidade. Engenharia em cada detalhe.')}
</section>`;

  const processo = [['Diagnóstico', 'Entendemos a necessidade, as pessoas e o contexto do negócio.'], ['Ideação', 'Organizamos a ideia e sugerimos caminhos, funcionalidades e prioridades.'],
    ['Identidade', 'Definimos a linguagem visual que dá personalidade ao produto.'], ['Protótipo', 'Transformamos decisões em uma experiência clara antes de construir.'],
    ['Desenvolvimento', 'Construímos em etapas verificáveis e conectadas.'], ['Validação', 'Testamos os fluxos essenciais e refinamos o que precisa evoluir.'],
    ['Publicação', 'Preparamos o produto para chegar ao público com segurança.'], ['Evolução', 'Acompanhamos ajustes, manutenção e novas versões.']];
  const estudio = `
<section class="pg grid">
  <div class="glow" style="width:160mm;height:160mm;left:-60mm;bottom:-40mm"></div>
  ${ph(2)}
  <span class="lbl">O estúdio</span>
  <h2 class="h2">Pequeno por escolha.<br><span class="em">Ambicioso</span> por natureza.</h2>
  <p class="p">A Blajeen Labs transforma perguntas, ideias e necessidades em <b>produtos digitais que funcionam</b> — sites, sistemas, vídeos e jogos construídos com atenção ao que realmente importa para o seu negócio.</p>
  <p class="p">Somos um estúdio independente e compacto de propósito: cada projeto recebe atenção de verdade, contato direto com quem constrói e uma razão clara para existir.</p>
  <div class="princ">
    <div><span class="n">01</span><h3>Produto antes de volume.</h3><p>Escolhemos os projetos com cuidado e damos a cada um o tempo que ele merece.</p></div>
    <div><span class="n">02</span><h3>Clareza antes de ruído.</h3><p>Escopo, prazo e preço por escrito. Você sabe o que recebe, quando e como.</p></div>
    <div><span class="n">03</span><h3>Identidade e engenharia.</h3><p>Design com a cara da sua marca e código feito para durar e crescer.</p></div>
  </div>
  <div class="method"><span>Perguntar</span><i>→</i><span>Prototipar</span><i>→</i><span>Provar</span><i>→</i><span class="em">Aprender.</span></div>
  <span class="lbl">Como trabalhamos</span>
  <div class="proc">${processo.map(([t, d], i) => `<div><span class="n">${String(i + 1).padStart(2, '0')}</span><h4>${t}</h4><p>${d}</p></div>`).join('')}</div>
  ${pf('Ideia → produto → publicação → evolução')}
</section>`;

  const descricaoMenu = DESCRICAO_CURTA;
  const menu = `
<section class="pg grid">
  <div class="glow" style="width:170mm;height:170mm;right:-70mm;top:-40mm"></div>
  <div class="rail"></div>
  ${ph(3)}
  <span class="lbl">O que sai do laboratório</span>
  <h2 class="h2">Do código ao <span class="em">mundo real.</span></h2>
  <div class="menu">${SERVICOS_IDS.map((id, i) => `<div class="row"><span class="n">${s[id].numero}</span><div><h3>${esc(s[id].nome)}<span class="dot">.</span></h3>
    <span class="t">${descricaoMenu[id]}</span></div><div class="pr"><small>a partir de</small>${aPartir(s[id])}</div><span class="go">pág. ${String(i + 4).padStart(2, '0')} →</span></div>`).join('')}</div>
  <span class="lbl">Por que contratar a Blajeen</span>
  <div class="trust">
    <div><b>7 dias</b><span>Garantia de satisfação</span><p>Desistiu nos primeiros 7 dias? Devolvemos 100% do valor pago.</p></div>
    <div><b>90 dias</b><span>Garantia técnica</span><p>Correções sem custo depois da entrega de sites, sistemas e jogos.</p></div>
    <div><b>100%</b><span>Contrato digital</span><p>Escopo, prazo e preço por escrito, com assinatura eletrônica.</p></div>
    <div><b>Seu</b><span>Código e arquivos</span><p>Após a quitação, o que foi feito para você é transferido para você.</p></div>
    <div><b>Justo</b><span>Preço acessível</span><p>Qualidade de estúdio com valores pensados para pequenos e médios negócios.</p></div>
    <div><b>Junto</b><span>Depois da entrega</span><p>Suporte, manutenção e novas versões para o produto crescer com você.</p></div>
  </div>
  ${pf()}
</section>`;

  const servicos = SERVICOS_IDS.map((id, i) => paginaServico(id, s[id], i + 4)).join('');

  const casos = CASES.slice(0, 4).map((c) => `<div class="case"><span class="ty">${esc(c.tipo)}</span><h3>${esc(c.nome)}</h3><p>${esc(c.desc)}</p></div>`).join('');
  const autoral = CASES[4];
  const trabalhos = `
<section class="pg grid">
  <div class="glow" style="width:180mm;height:180mm;left:-70mm;top:40mm"></div>
  <div class="rail"></div>
  ${ph(9)}
  <span class="lbl">Fora do laboratório. No mundo real.</span>
  <h2 class="h2">Cada projeto,<br>uma <span class="em">resposta própria.</span></h2>
  <p class="p">Identidades diferentes, necessidades reais. Alguns trabalhos que já saíram da bancada:</p>
  <div class="cases">${casos}${autoral ? `<div class="case wide"><div><span class="ty">${esc(autoral.tipo)}</span><h3>${esc(autoral.nome)}</h3></div><p>${esc(autoral.desc)}</p></div>` : ''}</div>
  <span class="lbl">Quem já contratou</span>
  <div class="quotes">${DEPOIMENTOS.map(([q, a, d]) => `<div class="quote"><span class="qm">“</span><p>${esc(q)}</p><span><b>${esc(a)}</b> · ${esc(d)}</span></div>`).join('')}</div>
  ${pf('Mais projetos em blajeen.com.br/trabalhos')}
</section>`;

  const passos = [['Conversa', 'Você conta a ideia pelo direct, WhatsApp ou e-mail. Sem compromisso e sem precisar ter tudo definido.'],
    ['Proposta', 'Em até 2 dias úteis você recebe escopo, prazo e investimento por escrito.'], ['Contrato digital', 'Você confere tudo e assina pelo celular, com assinatura eletrônica válida juridicamente.'],
    ['Início', 'Com os 50% de entrada confirmados, fazemos a reunião de partida e montamos o cronograma.'], ['Construção', 'Você acompanha, recebe atualizações semanais e aprova cada etapa.'],
    ['Entrega e evolução', 'Com o saldo final, publicamos, entregamos acessos e arquivos e seguimos juntos na garantia.']];
  const contratar = `
<section class="pg grid">
  <div class="glow" style="width:170mm;height:170mm;right:-60mm;bottom:-50mm"></div>
  <div class="rail"></div>
  ${ph(10)}
  <span class="lbl">Como contratar</span>
  <h2 class="h2">Simples, claro e<br><span class="em">por escrito.</span></h2>
  <div class="flow">${passos.map(([t, d], i) => `<div><span class="n">${String(i + 1).padStart(2, '0')}</span><h4>${t}</h4><p>${d}</p></div>`).join('')}</div>
  <div class="conds">
    <div class="xbox"><span class="xt">Condições de pagamento</span><ul>
      <li><b>50% adiantado,</b> na assinatura do contrato</li><li><b>50% no final,</b> na entrega do projeto</li>
      <li><b>Parcelamento com juros</b> no cartão de crédito</li><li><b>Pix, transferência, boleto</b> ou cartão</li>
      <li><b>Planos mensais:</b> sem fidelidade, com aviso de 30 dias</li></ul></div>
    <div class="xbox"><span class="xt">Nossos compromissos</span><ul>
      <li><b>7 dias de garantia:</b> devolução integral se você desistir</li><li><b>90 dias de garantia técnica</b> em sites, sistemas e jogos</li>
      <li><b>Código e arquivos</b> transferidos após a quitação</li><li><b>Aprovação a cada etapa</b>, sem surpresas no fim</li>
      <li><b>Dados protegidos</b> conforme a LGPD</li></ul></div>
  </div>
  <p class="fine">Valores de referência válidos até ${esc(catalogo.validade)}. O investimento final depende do escopo e é confirmado na proposta e no contrato.
  Não estão incluídos custos de terceiros (domínio, hospedagem, lojas de aplicativos, licenças e APIs), que ficam em nome do cliente.</p>
  ${pf()}
</section>`;

  const contatos: Array<[string, string]> = [['Site', 'blajeen.com.br'], ['Instagram', site.instagram.rotulo], ['E-mail', valorOu(site.emailEstudio, '')]];
  const contracapa = `
<section class="pg back grid">
  <div class="glow" style="width:240mm;height:240mm;right:-90mm;bottom:-60mm"></div>
  <div class="rail"></div>
  ${ph(11)}
  <img class="mascot" src="/brand/dinorobo-olhos-abertos.png" alt="">
  <div style="margin-top:28mm">
    <span class="lbl">O próximo projeto pode começar aqui</span>
    <h2>Agora imagine isso<br>com a <span class="em">sua ideia.</span></h2>
    <p class="p" style="max-width:110mm">Você traz o que quer transformar. Nós ajudamos a desenhar, construir e colocar em funcionamento.</p>
    <div class="contact">${contatos.map(([a, b]) => `<div><em>${a}</em><span>${esc(b)}</span></div>`).join('')}</div>
    <div class="qr"><div class="code">${QR_CRIE_SEU_PROJETO}</div><p><b>Aponte a câmera</b>Conte sua ideia em blajeen.com.br/crie-seu-projeto — são só cinco informações.</p></div>
  </div>
  ${pf('Imagine o que podemos criar.')}
</section>`;

  const barra = publico
    ? `<div class="barra-doc"><a href="/crie-seu-projeto">← Voltar aos valores</a><button type="button" onclick="window.print()">Baixar em PDF</button>
<span>Na janela que abrir, escolha <b>Salvar como PDF</b>.</span></div>`
    : `<div class="barra-doc"><a href="/admin/catalogo">← Voltar ao painel</a><button type="button" onclick="window.print()">Imprimir / salvar PDF</button>
<span>Em “Imprimir”, escolha <b>Salvar como PDF</b>, margens <b>Nenhuma</b> e ative <b>Gráficos de plano de fundo</b>.</span></div>`;
  // Na tela de um celular a página A4 (210 mm ≈ 794 px) não cabe: ela encolhe para a largura da
  // tela. Só na tela; a impressão continua em A4. `clientWidth`, e não `innerWidth`: no celular, o
  // `innerWidth` cresce junto com a página larga e a conta nunca encolhe nada.
  const ajusteDeTela = `<script>(function(){function a(){document.body.style.setProperty('--zoom-pagina',String(Math.min(1,(document.documentElement.clientWidth-16)/794)))}a();window.addEventListener('resize',a)})()</script>`;

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive"><title>Catálogo de Serviços ${ANO} — Blajeen Labs</title>
<link rel="stylesheet" href="/documentos/catalogo.css"></head><body>${barra}${capa}${estudio}${menu}${servicos}${trabalhos}${contratar}${contracapa}${ajusteDeTela}</body></html>`;
}
