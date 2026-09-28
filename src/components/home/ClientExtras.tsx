"use client";
import { useState } from "react";
import { DemoArtwork } from "./DemoArtwork";
const content = {
  restaurante: [
    {title:"Sabores que merecem uma pausa.",text:"Conheça a seleção da casa e encontre seu próximo favorito.",tag:"ESCOLHAS DA CASA"},
    {title:"Uma mesa, boas histórias.",text:"Um espaço para celebrar os encontros e apreciar cada detalhe.",tag:"VIVA A EXPERIÊNCIA"},
    {title:"Seu favorito, no seu ritmo.",text:"Explore o cardápio e monte seu pedido na demonstração.",tag:"DO CARDÁPIO À SACOLA"},
  ],
  loja: [
    {title:"Peças que transformam ambientes.",text:"Uma seleção de formas, cores e materiais para sua casa.",tag:"CURADORIA DA SEMANA"},
    {title:"Detalhes que fazem a diferença.",text:"Descubra objetos que combinam beleza e uso no dia a dia.",tag:"DESIGN PARA VIVER"},
    {title:"Encontre sua próxima escolha.",text:"Explore a coleção e experimente adicionar uma peça à sacola.",tag:"EXPLORE A COLEÇÃO"},
  ],
  servico: [
    {title:"Um momento só seu.",text:"Conheça as experiências e escolha o cuidado que faz sentido para você.",tag:"CUIDADO EM CADA DETALHE"},
    {title:"Seu tempo merece atenção.",text:"Serviços apresentados com clareza para facilitar sua escolha.",tag:"ESCOLHA COM CALMA"},
    {title:"Sua próxima pausa começa aqui.",text:"Escolha um serviço e experimente reservar um horário.",tag:"RESERVE SEU MOMENTO"},
  ],
};
export function ClientExtras({ business, brand }: {business:keyof typeof content;brand:string}) {
  const [slide,setSlide]=useState(0),[contact,setContact]=useState(false);
  const current=content[business][slide]!;
  return <div className="hx-client-extras">
    <section className="hx-client-carousel" aria-label="Carrossel de destaques" aria-roledescription="carrossel">
      <div className="hx-client-section-heading"><span>DESCUBRA {brand}</span><small>Conteúdo demonstrativo</small></div>
      <div className="hx-client-slide" aria-live="polite" aria-atomic="true">
        <div><small>{current.tag}</small><h4>{current.title}</h4><p>{current.text}</p><a href="#demo-catalog">{business==="servico"?"Ver serviços":"Explorar seleção"} →</a></div>
        <div className="hx-client-slide-art" aria-hidden="true"><DemoArtwork business={business} index={slide}/></div>
      </div>
      <div className="hx-client-carousel-controls"><button aria-label="Destaque anterior" onClick={()=>setSlide((slide+2)%3)}>←</button><div role="group" aria-label="Escolher destaque">{content[business].map((item,i)=><button key={item.tag} aria-label={`Mostrar destaque ${i+1}`} aria-pressed={slide===i} onClick={()=>setSlide(i)}><span/></button>)}</div><span>{slide+1} / 3</span><button aria-label="Próximo destaque" onClick={()=>setSlide((slide+1)%3)}>→</button></div>
    </section>
    <section className="hx-client-reviews" aria-label="Exemplo de avaliações do Google">
      <div className="hx-client-section-heading"><span>AVALIAÇÕES DO GOOGLE</span><small>Exemplo de integração</small></div>
      <h4>Confiança também<br/>faz parte da experiência.</h4>
      <p className="hx-client-review-note">Aqui podem aparecer avaliações reais do perfil da sua empresa no Google. Os textos abaixo são fictícios, apenas para mostrar o layout.</p>
      <div className="hx-client-review-grid">{["Um espaço acolhedor, com atenção em cada detalhe.","Foi fácil encontrar o que eu precisava e entrar em contato.","Uma experiência simples, organizada e agradável."].map((quote,i)=><article key={quote}><span className="hx-review-stars" aria-label="Cinco estrelas ilustrativas">★★★★★</span><p>“{quote}”</p><div><span aria-hidden="true">{i+1}</span><strong>Avaliação de exemplo<small>Conteúdo fictício</small></strong></div></article>)}</div>
    </section>
    <section className="hx-client-contact">
      <div><small>VAMOS CONVERSAR?</small><h4>Um toque.<br/>Uma conversa.</h4><p>Tire dúvidas sobre {business==="servico"?"serviços e horários":"produtos e pedidos"} pelo canal que já faz parte do seu dia.</p><button className="hx-whatsapp-demo" aria-expanded={contact} aria-controls="demo-whatsapp" onClick={()=>setContact(!contact)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.2A8.5 8.5 0 1 1 20 11.5Z"/><path d="M8 7.5c0 4 2.5 6.5 6.5 7l1-2-2-1-1 1c-1.5-.5-2.5-1.5-3-3l1-1-1-2Z"/></svg>Conversar no WhatsApp ↗</button></div>
      <div className="hx-client-faq"><h5>Antes de chamar</h5><details><summary>Como funciona {business==="servico"?"a reserva":"o pedido"}?</summary><p>{business==="servico"?"Escolha um serviço e um horário no site. Nesta prévia, a reserva é apenas simulada.":"Adicione itens à sacola e simule o pedido. Nesta prévia, não existe cobrança nem envio."}</p></details><details><summary>Posso tirar dúvidas pelo WhatsApp?</summary><p>O projeto pode abrir uma conversa com sua equipe, já com uma mensagem sobre o produto ou serviço escolhido.</p></details><details><summary>Posso editar essas informações?</summary><p>Conteúdos, perguntas frequentes, destaques e contatos podem fazer parte do painel de edição do projeto.</p></details></div>
      {contact && <div className="hx-whatsapp-example" id="demo-whatsapp" role="status"><strong>Prévia da mensagem</strong><p>Olá, {brand}! Gostaria de saber mais sobre {business==="servico"?"os serviços e horários disponíveis":"os produtos e como fazer um pedido"}.</p><small>No seu site, o botão pode abrir o WhatsApp do negócio com esta mensagem. Esta demonstração não envia mensagens.</small><button onClick={()=>setContact(false)}>Fechar prévia</button></div>}
    </section>
    <div className="hx-client-footer"><strong>{brand}</strong><span>Site demonstrativo · sua identidade, seus canais.</span></div>
  </div>;
}
