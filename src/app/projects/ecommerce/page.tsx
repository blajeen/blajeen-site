import type { Metadata } from 'next';
import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section, TituloSecao } from '@/components/layout/Section';
import { SystemScreenshot } from '@/components/media/SystemScreenshot';
import { Reveal } from '@/components/motion/Reveal';
import { ProductAudience } from '@/components/projects/ProductAudience';
import { ProductGallery } from '@/components/projects/ProductGallery';
import { ProjectFormCard } from '@/components/projects/ProjectFormCard';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

const DEMONSTRACAO = 'https://site-ecommerce-bay.vercel.app';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'E-commerce',
  descricao:
    'E-commerce white-label com vitrine, catálogo, busca, carrinho, checkout assistido e painel administrativo.',
  rota: ROTAS.ecommerce,
});

const publicos = [
  {
    title: 'Loja física ou negócio local',
    text: 'Para quem quer apresentar o catálogo online, receber pedidos organizados e concluir condições, disponibilidade e entrega pelo WhatsApp.',
  },
  {
    title: 'Marca com catálogo próprio',
    text: 'Para fabricantes, revendedores e operações que precisam de uma vitrine com identidade própria, categorias, ofertas e controle de estoque.',
  },
] as const;

const jornada = [
  {
    titulo: 'Descoberta',
    texto:
      'Banners, ofertas, categorias e coleções organizam a vitrine para apresentar o catálogo sem sobrecarregar a navegação.',
  },
  {
    titulo: 'Busca e escolha',
    texto:
      'Busca com sugestões, filtros, ordenação e páginas de produto ajudam o cliente a comparar e encontrar o que procura.',
  },
  {
    titulo: 'Carrinho',
    texto:
      'Produtos, quantidades e variações permanecem reunidos enquanto o cliente continua navegando pela loja.',
  },
  {
    titulo: 'Atendimento e pedido',
    texto:
      'O checkout assistido envia produtos e valores ao WhatsApp. Entrega e pagamento são confirmados diretamente com o vendedor.',
  },
] as const;

const operacao = [
  ['Produtos', 'Cadastro, edição, publicação, rascunho e arquivamento.'],
  ['Ofertas', 'Organização dos itens promocionais exibidos na vitrine.'],
  ['Estoque', 'Ajustes, alertas de estoque baixo e histórico de movimentações.'],
  ['Categorias', 'Estrutura do catálogo e presença no menu principal.'],
  ['Catálogo PDF', 'Seleção por categoria e ofertas para salvar ou imprimir.'],
  ['Configurações', 'Dados públicos, atendimento e informações da loja.'],
] as const;

const personalizacoes = [
  'Nome, logotipo, assinatura e identidade visual.',
  'Domínio, contatos, redes sociais e canais de atendimento.',
  'Categorias, produtos, fotos, preços, ofertas e disponibilidade.',
  'Textos institucionais, políticas e informações públicas da empresa.',
  'Forma de entrega e jornada de fechamento definidas com cada operação.',
] as const;

const demonstracoes = ([
  ['01-vitrine.png', 'Vitrine principal da demonstração de e-commerce.', 'Vitrine: marca, busca, categorias, campanhas e produtos em destaque.'],
  ['02-ofertas.png', 'Página de ofertas do e-commerce.', 'Ofertas: produtos promocionais reunidos em uma página própria.'],
  ['03-mais-vendidos.png', 'Página de produtos mais vendidos.', 'Mais vendidos: uma coleção comercial para facilitar a descoberta.'],
  ['04-categoria-smart-tvs.png', 'Categoria de Smart TVs no catálogo.', 'Categorias: filtros e ordenação ajudam o cliente a percorrer o catálogo.'],
  ['05-produto-smart-tv.png', 'Página detalhada de uma Smart TV.', 'Produto: imagens, informações, condições e disponibilidade em uma única tela.'],
  ['06-produto-starlink.png', 'Página detalhada de um kit para Starlink.', 'Produto: outra categoria real da base demonstrativa e suas informações.'],
  ['07-sobre-loja.png', 'Página institucional sobre a loja.', 'Institucional: história, posicionamento e informações públicas da empresa.'],
  ['08-frete-entrega.png', 'Página sobre frete e entrega.', 'Entrega: áreas atendidas, prazos e regras apresentados com transparência.'],
  ['09-trocas-devolucoes.png', 'Página de trocas e devoluções.', 'Pós-venda: política de troca e devolução acessível ao cliente.'],
  ['10-area-do-cliente.png', 'Área de acompanhamento e ajuda para pedidos.', 'Atendimento: pedido, troca, entrega e suporte direcionados para o canal humano.'],
] as const).map(([arquivo, alt, legenda]) => ({
  imagem: `/projects/ecommerce/screenshots/${arquivo}`,
  alt,
  legenda,
  largura: 1600,
  altura: 900,
}));

export default function EcommercePage() {
  return (
    <>
      <section
        className="relative isolate overflow-hidden pt-[clamp(3rem,7vw,6rem)]"
        aria-labelledby="ecommerce-titulo"
      >
        <LabBackdrop />
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <p className="tecnica text-signal">PRODUTO DIGITAL WHITE-LABEL / E-COMMERCE</p>
              <h1
                id="ecommerce-titulo"
                className="mt-8 max-w-[14ch] text-[clamp(2.4rem,5.2vw,4.6rem)] leading-[0.98] tracking-[-0.05em]"
              >
                Sua loja. Sua marca. Uma jornada de compra própria.
              </h1>
              <p className="medida-texto mt-8 text-[1.1rem] leading-relaxed text-mineral">
                Vitrine, catálogo, busca, carrinho e atendimento reunidos em uma plataforma
                adaptada à identidade, aos produtos e à operação real de cada negócio.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/projects/ecommerce/formulario"
                  className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-signal bg-signal px-5 text-ink transition-colors hover:bg-signal-pale"
                >
                  Quero minha loja
                  <span aria-hidden="true">→</span>
                </Link>
                <a
                  href={DEMONSTRACAO}
                  target="_blank"
                  rel="noreferrer"
                  className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-line-strong px-5 text-paper transition-colors hover:border-signal hover:text-signal"
                >
                  Ver demonstração
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
              <p className="medida-texto mt-5 max-w-[58ch] rounded-2xl bg-ink px-4 py-3 text-sm leading-relaxed text-paper">
                <strong>7 dias de garantia.</strong> Dentro desse prazo, você pode cancelar a
                contratação e solicitar a devolução do valor pago.
              </p>
            </div>

            <Reveal className="lg:col-span-6">
              <figure>
                <SystemScreenshot
                  src="/projects/ecommerce/screenshots/01-vitrine.png"
                  alt="Vitrine principal da demonstração de E-commerce."
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  largura={1600}
                  altura={900}
                  prioridade
                  label="E-COMMERCE / VITRINE"
                />
                <figcaption className="tecnica mt-4 px-1 text-mineral-dim">
                  Vitrine real da base demonstrativa, pronta para receber outra marca e outro catálogo.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </Container>
      </section>

      <Section indice="01 / PARA QUEM É" rotuladaPor="publico-ecommerce-titulo">
        <ProductAudience
          id="publico-ecommerce-titulo"
          title="Para negócios que precisam vender com a própria marca e manter o atendimento próximo."
          introduction="O produto atende operações que querem organizar a vitrine e o pedido sem prometer automações de pagamento ou frete que ainda não fazem parte da base."
          audiences={publicos}
        />
      </Section>

      <Section indice="02 / JORNADA DE COMPRA" rotuladaPor="jornada-ecommerce-titulo">
        <TituloSecao id="jornada-ecommerce-titulo" className="max-w-[18ch]">
          Da descoberta ao atendimento, sem esconder como a venda termina.
        </TituloSecao>
        <ol className="mt-12">
          {jornada.map((etapa, index) => (
            <li
              key={etapa.titulo}
              className="grid gap-x-8 gap-y-3 border-t border-line py-8 last:border-b sm:grid-cols-12"
            >
              <span className="tecnica text-signal sm:col-span-1">{String(index + 1).padStart(2, '0')}</span>
              <h2 className="text-[1.35rem] leading-tight tracking-[-0.03em] sm:col-span-4">{etapa.titulo}</h2>
              <p className="text-[0.95rem] leading-relaxed text-mineral sm:col-span-6 sm:col-start-6">{etapa.texto}</p>
            </li>
          ))}
        </ol>
        <p className="medida-texto mt-6 max-w-[72ch] text-sm leading-relaxed text-mineral-dim">
          Na demonstração, nenhuma cobrança é feita pelo site e o frete não recebe valor inventado.
          Pagamento, disponibilidade e entrega são confirmados no atendimento da loja.
        </p>
      </Section>

      <Section indice="03 / GESTÃO" rotuladaPor="gestao-ecommerce-titulo">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <TituloSecao id="gestao-ecommerce-titulo" className="lg:col-span-7">
            Controle do catálogo sem inventar métricas de faturamento.
          </TituloSecao>
          <p className="medida-texto text-[1rem] leading-relaxed text-mineral lg:col-span-4 lg:col-start-9">
            O painel foi construído para tarefas concretas da operação, com dados de produtos e
            estoque em vez de indicadores comerciais fictícios.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {operacao.map(([titulo, texto], index) => (
            <Reveal key={titulo}>
              <article className="h-full rounded-[var(--radius-panel)] border border-line bg-surface/60 p-6">
                <span className="tecnica text-signal">{String(index + 1).padStart(2, '0')}</span>
                <h2 className="mt-8 text-[1.45rem] tracking-[-0.035em]">{titulo}</h2>
                <p className="mt-4 text-sm leading-relaxed text-mineral">{texto}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section indice="04 / PRODUTO REAL" rotuladaPor="demonstracao-ecommerce-titulo">
        <TituloSecao id="demonstracao-ecommerce-titulo">
          Dez telas reais para percorrer a experiência de compra.
        </TituloSecao>
        <ProductGallery slides={demonstracoes} />
        <p className="medida-texto mt-8 max-w-[72ch] text-sm leading-relaxed text-mineral-dim">
          A marca, os produtos, os preços e os dados desta demonstração são fictícios. A base mostra
          a jornada funcional e recebe o catálogo autorizado de cada contratante.
        </p>
      </Section>

      <Section indice="05 / IDENTIDADE E ADAPTAÇÃO" rotuladaPor="adaptacao-ecommerce-titulo">
        <div className="grid gap-10 lg:grid-cols-12">
          <TituloSecao id="adaptacao-ecommerce-titulo" className="lg:col-span-5">
            Uma base funcional, adaptada à identidade e à operação da loja.
          </TituloSecao>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="medida-texto text-[1.05rem] leading-relaxed text-mineral">
              A demonstração mostra a estrutura do produto. Na implantação, marca, catálogo,
              conteúdo, contatos e regras são preparados com as informações fornecidas pelo contratante.
            </p>
            <ul className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-panel)] border border-line bg-line">
              {personalizacoes.map((item) => (
                <li key={item} className="flex gap-3 bg-surface px-5 py-4 text-sm leading-relaxed text-mineral">
                  <span aria-hidden="true" className="mt-[0.55em] size-1 flex-none rounded-full bg-signal" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section indice="06 / FORMULÁRIO" rotuladaPor="formulario-ecommerce-titulo">
        <ProjectFormCard slug="ecommerce" />
      </Section>

      <Section className="pb-[clamp(4rem,10vw,10rem)]" rotuladaPor="cta-ecommerce-titulo">
        <Reveal>
          <div className="rounded-[var(--radius-panel)] border border-line-strong bg-raised px-6 py-10 sm:px-10 sm:py-14">
            <p className="tecnica text-signal">E-COMMERCE / BLAJEEN LABS</p>
            <h2 id="cta-ecommerce-titulo" className="mt-6 max-w-[17ch] text-[clamp(2rem,4.5vw,3.8rem)] leading-[1.02] tracking-[-0.05em]">
              Uma base pronta para vender com a identidade da sua marca.
            </h2>
            <p className="medida-texto mt-6 max-w-[64ch] text-[1rem] leading-relaxed text-mineral">
              Conte como sua loja trabalha. A estrutura será adaptada ao catálogo, ao atendimento e
              às prioridades reais do seu negócio.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/projects/ecommerce/formulario" className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-signal bg-signal px-5 text-ink transition-colors hover:bg-signal-pale">
                Preencher formulário <span aria-hidden="true">→</span>
              </Link>
              <a href={DEMONSTRACAO} target="_blank" rel="noreferrer" className="alvo-toque tecnica inline-flex items-center gap-3 rounded-full border border-line-strong px-5 text-paper transition-colors hover:border-signal hover:text-signal">
                Abrir demonstração <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
