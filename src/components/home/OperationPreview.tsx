"use client";
export type DemoOrder = {
  id: number; business: "restaurante" | "loja" | "servico"; brand: string;
  items: string[]; total: number; stage: number; detail: string;
};
const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export function OperationPreview({ brand, business, orders, onAdvance, onReturn }: {
  brand: string; business: DemoOrder["business"]; orders: DemoOrder[];
  onAdvance: (id: number) => void; onReturn: () => void;
}) {
  const service = business === "servico";
  const stages = service ? ["Recebida", "Confirmada", "Em atendimento", "Concluída"] : ["Recebido", "Em preparo", "Pronto", "Concluído"];
  return <div className="hx-operation">
    <header><strong>{brand}</strong><span>OPERAÇÃO / DEMO</span></header>
    <div className="hx-operation-heading"><div><small>DO OUTRO LADO DA TELA</small><h3>Seu negócio,<br/>em movimento.</h3></div><span className="hx-operation-live"><i/> Sessão local</span></div>
    <div className="hx-operation-stats">
      <div><small>{service ? "Reservas simuladas" : "Pedidos simulados"}</small><strong>{String(orders.length).padStart(2,"0")}</strong></div>
      <div><small>Em andamento</small><strong>{String(orders.filter(order => order.stage < 3).length).padStart(2,"0")}</strong></div>
      <div><small>Total simulado</small><strong>{money(orders.reduce((sum,order) => sum + order.total,0))}</strong></div>
    </div>
    <div className="hx-operation-list">
      <div className="hx-operation-list-heading"><h4>{service ? "Agenda de demonstração" : "Central de pedidos"}</h4><span>Últimos 20 registros</span></div>
      {!orders.length ? <div className="hx-operation-empty"><span aria-hidden="true">↗</span><h4>A próxima ação começa no site.</h4><p>{service ? "Escolha um serviço e simule uma reserva." : "Adicione um produto à sacola e simule um pedido."} O registro aparece aqui para você acompanhar.</p><button onClick={onReturn}>Experimentar o site →</button></div> :
        orders.map(order => <article key={order.id} className="hx-operation-order">
          <div className="hx-operation-order-title"><strong>#{String(order.id).padStart(3,"0")} <span>{order.brand}</span></strong><b>{money(order.total)}</b></div>
          <p>{order.items.join(" · ")}</p><small>{order.detail}</small>
          <ol className="hx-operation-steps" aria-label={`Etapas do registro ${order.id}`}>
            {stages.map((stage,index) => <li key={stage} data-state={index <= order.stage ? "done" : "pending"} aria-current={index === order.stage ? "step" : undefined}><span>{index < order.stage ? "✓" : index + 1}</span>{stage}</li>)}
          </ol>
          <div className="hx-operation-order-footer"><span role="status">{stages[order.stage]}</span>{order.stage < 3 ? <button onClick={() => onAdvance(order.id)}>Avançar etapa →</button> : <strong>Fluxo concluído ✓</strong>}</div>
        </article>)}
    </div>
    <section className="hx-control-center" aria-label="Possibilidades para o seu painel">
      <div className="hx-control-intro"><span className="hx-concept-badge">POSSIBILIDADES DO PROJETO</span><h3>Seu site.<br/>Você no controle.</h3><p>Um painel pode reunir conteúdo, gestão e resultados. Escolha o que faz sentido para o seu negócio.</p></div>
      <div className="hx-control-grid">
        <article className="hx-control-card hx-editor-card">
          <div className="hx-control-card-title"><span aria-hidden="true">✎</span><h4>Edite o site inteiro</h4></div>
          <p>Textos, fotos, banners, páginas e menus em um só lugar. Da vitrine aos detalhes de cada produto.</p>
          <div className="hx-editor-preview" aria-label="Exemplo ilustrativo de editor de conteúdo">
            <div className="hx-editor-rail"><span>Páginas</span><b>Início</b><span>Sobre</span><span>{service ? "Serviços" : "Catálogo"}</span><span>Contato</span></div>
            <div className="hx-editor-canvas"><small>SEÇÃO PRINCIPAL</small><div className="hx-editor-image"><span>Imagem de destaque</span></div><strong>Sua próxima ideia começa aqui.</strong><span className="hx-editor-line"/><span className="hx-editor-line short"/><span className="hx-editor-label">Texto e imagem editáveis</span></div>
          </div>
          <ul><li>Rascunhos antes de publicar</li><li>Prévia no celular e no desktop</li><li>Histórico de alterações e restauração</li></ul>
        </article>
        <article className="hx-control-card">
          <div className="hx-control-card-title"><span aria-hidden="true">↗</span><h4>Entenda seu tráfego</h4></div>
          <p>Veja de onde vêm as visitas, quais páginas despertam interesse e onde as pessoas chegam até você.</p>
          <figure className="hx-traffic-preview"><figcaption>VISITAS AO LONGO DO TEMPO <span>Gráfico ilustrativo</span></figcaption><svg viewBox="0 0 300 100" role="img" aria-label="Exemplo de gráfico de visitas, sem dados reais"><path d="M0 25H300M0 55H300M0 85H300" fill="none" stroke="currentColor" opacity=".12"/><path d="M0 83L25 75L50 79L75 59L100 65L125 39L150 46L175 30L200 40L225 22L250 26L275 10L300 16V100H0Z" fill="currentColor" opacity=".09"/><path d="M0 83L25 75L50 79L75 59L100 65L125 39L150 46L175 30L200 40L225 22L250 26L275 10L300 16" fill="none" stroke="currentColor" strokeWidth="2.5"/></svg><div className="hx-traffic-sources"><span>Busca</span><span>Redes sociais</span><span>Acesso direto</span></div></figure>
          <ul><li>Visitas por página e dispositivo</li><li>Origem das campanhas e acessos</li><li>Cliques nos botões de contato</li></ul>
        </article>
        <article className="hx-control-card"><div className="hx-control-card-title"><span aria-hidden="true">◎</span><h4>Métricas que ajudam a decidir</h4></div><p>Acompanhe o caminho entre uma visita e uma ação importante para o negócio.</p><div className="hx-funnel-preview"><span>Visitou o site</span><span>Explorou uma oferta</span><span>{service ? "Solicitou uma reserva" : "Iniciou um pedido"}</span></div><ul><li>Metas de contato, pedido ou reserva</li><li>Comparação entre períodos</li><li>Relatórios para exportar</li></ul></article>
        <article className="hx-control-card"><div className="hx-control-card-title"><span aria-hidden="true">▦</span><h4>{service ? "Agenda e serviços" : "Catálogo e ofertas"}</h4></div><p>{service ? "Organize serviços, profissionais, disponibilidade e duração dos atendimentos." : "Atualize produtos, fotos, preços, categorias e disponibilidade sem refazer o site."}</p><ul><li>{service ? "Horários e bloqueios de agenda" : "Estoque e variações de produto"}</li><li>{service ? "Confirmações e lembretes" : "Cupons e campanhas sazonais"}</li><li>Destaques na página inicial</li></ul></article>
        <article className="hx-control-card"><div className="hx-control-card-title"><span aria-hidden="true">☷</span><h4>Equipe e atendimento</h4></div><p>Concentre as solicitações e distribua o trabalho entre quem cuida de cada etapa.</p><ul><li>Permissões por pessoa e função</li><li>Histórico de contatos e solicitações</li><li>Integração com canais de atendimento</li></ul></article>
        <article className="hx-control-card"><div className="hx-control-card-title"><span aria-hidden="true">⚙</span><h4>Marca, busca e integrações</h4></div><p>Ajuste como sua empresa aparece e conecte os serviços usados no dia a dia.</p><ul><li>Logo, cores, links e contatos</li><li>Títulos e descrições para buscadores</li><li>Pagamentos, e-mail e automações</li></ul></article>
      </div>
      <p className="hx-control-note">Mostruário de recursos possíveis. Editor, gráficos e módulos acima são ilustrativos; a implementação e as integrações são definidas no escopo de cada projeto.</p>
    </section>
    <footer>Simulação local · sem clientes reais, cobrança ou envio de dados. Os registros somem ao recarregar a página.</footer>
  </div>;
}
