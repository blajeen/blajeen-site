"use client";
import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { OperationPreview, type DemoOrder } from "./OperationPreview";
import { ClientContact, ClientFooter, ClientHighlights, ClientReviews } from "./ClientExtras";
import { DemoArtwork } from "./DemoArtwork";

/**
 * Páginas do site demonstrativo. Antes, destaques, avaliações e contato vinham empilhados embaixo
 * do catálogo e a prévia passava de duas telas de altura; agora são abas do menu do próprio site,
 * como num site de verdade, e ocupam o mesmo lugar.
 */
const pages = [
  { id: "inicio", label: "Início" },
  { id: "destaques", label: "Destaques" },
  { id: "avaliacoes", label: "Avaliações" },
  { id: "contato", label: "Contato" },
] as const;
type Page = (typeof pages)[number]["id"];

const businesses = {
  restaurante: {
    label: "Restaurante",
    brand: "OLIVA",
    tag: "COZINHA DE ORIGEM",
    title: "O melhor da estação,\nà sua mesa.",
    description: "Ingredientes frescos. Tempo para apreciar.",
    items: ["Bowl da estação", "Massa artesanal", "Sobremesa da casa"],
    prices: [38, 54, 24],
    action: "Adicionar",
    symbol: "◒",
  },
  loja: {
    label: "Loja",
    brand: "FORMA",
    tag: "OBJETOS PARA VIVER",
    title: "Menos excessos.\nMais significado.",
    description: "Design que encontra lugar na sua rotina.",
    items: ["Luminária Arco", "Vaso Terracota", "Poltrona Nuvem"],
    prices: [289, 89, 890],
    action: "Adicionar",
    symbol: "◐",
  },
  servico: {
    label: "Serviço",
    brand: "ATELIÊ",
    tag: "TEMPO PARA VOCÊ",
    title: "Um cuidado feito\nno seu ritmo.",
    description: "Escolha sua experiência. Reserve seu momento.",
    items: ["Consulta inicial", "Sessão individual", "Experiência completa"],
    prices: [120, 180, 260],
    action: "Escolher",
    symbol: "✳",
  },
};
type Business = keyof typeof businesses;
const identities = {
  natural: {
    label: "Natural",
    accent: "#355c43",
    bg: "#f2efe5",
    ink: "#263d30",
  },
  editorial: {
    label: "Editorial",
    accent: "#852f29",
    bg: "#fbf1e8",
    ink: "#432a25",
  },
  noturna: {
    label: "Noturna",
    accent: "#d8ed97",
    bg: "#182520",
    ink: "#eef2df",
  },
};
type Identity = keyof typeof identities;
export function ProductConfigurator() {
  const [business, setBusiness] = useState<Business>("restaurante"),
    [identity, setIdentity] = useState<Identity>("natural"),
    [mobile, setMobile] = useState(false),
    [operation, setOperation] = useState(false),
    [brands, setBrands] = useState({ restaurante: "OLIVA", loja: "FORMA", servico: "ATELIÊ" }),
    [orders, setOrders] = useState<DemoOrder[]>([]),
    [cart, setCart] = useState<number[]>([0, 0, 0]),
    [done, setDone] = useState(false),
    [slot, setSlot] = useState("14:00"),
    [delivery, setDelivery] = useState(true),
    [page, setPage] = useState<Page>("inicio");
  const uid = useId(),
    tabs = useRef<(HTMLButtonElement | null)[]>([]),
    catalog = useRef<HTMLDivElement>(null);
  const b = businesses[business],
    palette = identities[identity];
  const total = cart.reduce((sum, n, i) => sum + n * (b.prices[i] ?? 0), 0),
    count = cart.reduce((sum, n) => sum + n, 0);
  const brand = brands[business].trim() || b.brand;
  const brief = `Quero um projeto para ${b.label.toLowerCase()}, marca ${brand}, com identidade ${identities[identity].label.toLowerCase()}. Recursos: ${business === "servico" ? "agendamento" : delivery ? "catálogo, carrinho e entrega" : "catálogo e retirada no local"}. Referência: configurador da Blajeen Labs.`;
  function reset() {
    setCart([0, 0, 0]);
    setDone(false);
  }
  // Setas, Home e End trocam de aba, como pede o padrão de abas: só a aba atual fica no Tab.
  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = pages.length - 1;
    const keys: Record<string, number> = { ArrowRight: index === last ? 0 : index + 1, ArrowLeft: index === 0 ? last : index - 1, Home: 0, End: last };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setPage(pages[next]!.id);
    tabs.current[next]?.focus();
  }
  // Só a página atual aparece e recebe foco; as outras ficam no lugar, invisíveis e inertes.
  const panel = (id: Page) => ({
    role: "tabpanel" as const,
    id: `${uid}-${id}`,
    "aria-labelledby": `${uid}-tab-${id}`,
    className: "hx-site-page",
    "data-ativa": page === id,
    inert: page !== id,
  });
  // O "Explorar seleção" dos destaques leva ao catálogo, que mora na aba Início. O foco vai junto:
  // o botão clicado some com a aba dele.
  function explore() {
    setPage("inicio");
    requestAnimationFrame(() => catalog.current?.focus());
  }
  return (
    <section
      id="configurador"
      className="hx-section"
      aria-labelledby="config-title"
      data-conduto-lado="esquerda"
    >
      <div className="hx-section-heading">
        <div>
          <p className="hx-kicker">01 / DA IDEIA À INTERFACE</p>
          <h2 id="config-title">
            E se fosse
            <br />
            <em>o seu negócio?</em>
          </h2>
        </div>
        <p>
          Você escolhe a direção.
          <br />O produto ganha forma, cor e função.
          <br />
          <span className="hx-muted">Experimente: os controles funcionam.</span>
        </p>
      </div>
      <div className="hx-config">
        <aside className="hx-config-controls">
          <fieldset>
            <legend>01. O que vamos criar?</legend>
            <div className="hx-business">
              {(Object.keys(businesses) as Business[]).map((id) => (
                <button
                  key={id}
                  aria-pressed={business === id}
                  onClick={() => {
                    setBusiness(id);
                    reset();
                  }}
                >
                  {businesses[id].label}
                  <span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>02. Qual é a personalidade?</legend>
            <div className="hx-palette">
              {(Object.keys(identities) as Identity[]).map((id) => (
                <button
                  key={id}
                  aria-pressed={identity === id}
                  onClick={() => setIdentity(id)}
                >
                  <i style={{ background: identities[id].accent }} />
                  {identities[id].label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>03. Como funciona?</legend>
            {business === "servico" ? (
              <p>Agenda com seleção de serviço e horário.</p>
            ) : (
              <label className="hx-toggle">
                <input
                  type="checkbox"
                  checked={delivery}
                  onChange={(e) => {
                    setDelivery(e.target.checked);
                    setDone(false);
                  }}
                />
                Oferecer entrega
              </label>
            )}
            <p className="hx-muted hx-hint">
              {business === "servico"
                ? "Experimente reservar um horário na tela ao lado."
                : "Monte um pedido e veja o resumo aparecer."}
            </p>
          </fieldset>
          <fieldset>
            <legend>04. Coloque sua marca</legend>
            <label className="hx-brand-label" htmlFor="demo-brand">Nome na prévia</label>
            <input id="demo-brand" className="hx-brand-input" maxLength={24} value={brands[business]}
              onChange={(e) => setBrands((current) => ({ ...current, [business]: e.target.value }))} />
            <p className="hx-muted hx-hint">Edite o nome e veja sua marca na interface.</p>
          </fieldset>
        </aside>
        <div className="hx-preview-area">
          <div className="hx-preview-toolbar">
            <span>
              <i /> PRÉVIA INTERATIVA
            </span>
            <div className="hx-preview-modes" role="group" aria-label="Visão da experiência">
              <button aria-pressed={!operation} onClick={() => setOperation(false)}><span>01</span> Site do cliente</button>
              <button aria-pressed={operation} onClick={() => setOperation(true)}><span>02</span> Painel da operação <b>{orders.filter((order) => order.business === business).length}</b></button>
            </div>
            <div className="hx-preview-format" role="group" aria-label="Formato da prévia">
              <button aria-pressed={!mobile} onClick={() => setMobile(false)}>
                Desktop
              </button>
              <button aria-pressed={mobile} onClick={() => setMobile(true)}>
                Celular
              </button>
            </div>
          </div>
          <div
            className={`hx-product ${mobile ? "phone" : ""} ${identity}`}
            style={
              {
                "--demo-accent": palette.accent,
                "--demo-bg": palette.bg,
                "--demo-ink": palette.ink,
              } as CSSProperties
            }
          >
            {operation ? <OperationPreview
              brand={brand} business={business} orders={orders.filter((order) => order.business === business)}
              onReturn={() => setOperation(false)}
              onAdvance={(id) => setOrders((current) => current.map((order) => order.id === id ? { ...order, stage: Math.min(3, order.stage + 1) } : order))}
            /> : <>
            <header>
              <strong>
                {brand}

              </strong>
              <div className="hx-site-nav" role="tablist" aria-label="Páginas do site demonstrativo">
                {pages.map((p, i) => (
                  <button
                    key={p.id}
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`${uid}-tab-${p.id}`}
                    aria-selected={page === p.id}
                    aria-controls={`${uid}-${p.id}`}
                    tabIndex={page === p.id ? 0 : -1}
                    onClick={() => setPage(p.id)}
                    onKeyDown={(e) => onTabKey(e, i)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <span>
                {business === "servico"
                  ? "SUA AGENDA"
                  : `SUA SACOLA (${count})`}
              </span>
            </header>
            {/* As quatro páginas ficam empilhadas no mesmo lugar e só a atual aparece: a prévia
                fica com a altura da maior, e trocar de aba não empurra a página para baixo. */}
            <div className="hx-site-pages">
            <div {...panel("inicio")}>
            <div className="hx-product-hero">
              <div>
                <small>{b.tag}</small>
                <h3>
                  {b.title.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </h3>
                <p>{b.description}</p>
                <a href="#demo-catalog">
                  {business === "servico"
                    ? "Encontre seu horário"
                    : "Explore a seleção"}{" "}
                  ↓
                </a>
              </div>
              <div className={`hx-product-art ${business}`} aria-hidden="true">
                <DemoArtwork business={business} />
              </div>
            </div>
            <div id="demo-catalog" ref={catalog} tabIndex={-1} className="hx-demo-catalog">
              {b.items.map((name, i) => (
                <article key={name}>
                  <div
                    className={`hx-demo-object object-${i} ${business}`}
                    aria-hidden="true"
                  >
                    <DemoArtwork business={business} index={i} />
                  </div>
                  <h4>{name}</h4>
                  <p>R$ {b.prices[i]?.toFixed(2).replace(".", ",")}</p>
                  <button
                    aria-label={`${b.action} ${name}`}
                    aria-pressed={
                      business === "servico" ? !!cart[i] : undefined
                    }
                    onClick={() => {
                      setDone(false);
                      setCart((c) =>
                        business === "servico"
                          ? c.map((_, j) => (j === i ? 1 : 0))
                          : c.map((n, j) => (j === i ? Math.min(n + 1, 9) : n)),
                      );
                    }}
                  >
                    {business === "servico" && cart[i]
                      ? "Selecionado"
                      : b.action}{" "}
                    {business !== "servico" && cart[i] ? `(${cart[i]})` : "+"}
                  </button>
                </article>
              ))}
            </div>
            <div className="hx-demo-checkout">
              {business === "servico" ? (
                <label>
                  Horário demonstrativo
                  <select
                    value={slot}
                    onChange={(e) => {
                      setSlot(e.target.value);
                      setDone(false);
                    }}
                  >
                    <option>14:00</option>
                    <option>15:30</option>
                    <option>17:00</option>
                  </select>
                </label>
              ) : (
                <div>
                  <small>
                    {delivery ? "ENTREGA DEMONSTRATIVA" : "RETIRADA NO LOCAL"}
                  </small>
                  <strong>R$ {total.toFixed(2).replace(".", ",")}</strong>
                </div>
              )}
              <button disabled={!count || done} onClick={() => {
                setDone(true);
                setOrders((current) => [{ id: (current[0]?.id ?? 0) + 1, business, brand,
                  items: cart.flatMap((quantity, index) => quantity ? [`${quantity} × ${b.items[index]}`] : []),
                  total, stage: 0, detail: business === "servico" ? `Horário: ${slot}` : delivery ? "Entrega" : "Retirada no local"
                }, ...current].slice(0, 20));
              }}>
                {business === "servico" ? "Simular reserva" : "Simular pedido"}{" "}
                ↗
              </button>
              {count > 0 ? (
                <button className="hx-demo-clear" onClick={reset}>
                  Limpar
                </button>
              ) : null}
            </div>
            {done && <button className="hx-open-operation" onClick={() => setOperation(true)}>Ver {business === "servico" ? "reserva" : "pedido"} no painel da operação <span>→</span></button>}
            <p className="hx-demo-receipt" role="status">
              {done
                ? business === "servico"
                  ? `Reserva demonstrativa: ${b.items[cart.findIndex((n) => n > 0)]}, às ${slot}. Nenhum agendamento real foi feito.`
                  : `Pedido demonstrativo: ${count} ${count === 1 ? "item" : "itens"}, R$ ${total.toFixed(2).replace(".", ",")}. Nenhuma compra ou cobrança foi realizada.`
                : "Demonstração fictícia · sem cadastro, pagamento ou envio de dados."}
            </p>
            </div>
            <div {...panel("destaques")}>
              <ClientHighlights business={business} brand={brand} onExplore={explore} />
            </div>
            <div {...panel("avaliacoes")}>
              <ClientReviews />
            </div>
            <div {...panel("contato")}>
              <ClientContact business={business} brand={brand} />
            </div>
            </div>
            <ClientFooter brand={brand} />
            </>}
          </div>
          <p className="hx-preview-caption">
            Do site à operação: simule um pedido e acompanhe cada etapa no painel.
          </p>
        </div>
        {/* Fora dos controles: no computador ele fica embaixo deles, na mesma coluna; no celular,
            depois da prévia, quando a pessoa já viu o resultado das escolhas. */}
        <div className="hx-config-cta">
          <a
            className="hx-button"
            href={`/crie-seu-projeto?ideia=${encodeURIComponent(brief)}#comecar`}
          >
            Quero um projeto assim ↗
          </a>
          <small>
            Suas escolhas acompanham o briefing. Nenhum pedido ou reserva é
            enviado.
          </small>
        </div>
      </div>
    </section>
  );
}
