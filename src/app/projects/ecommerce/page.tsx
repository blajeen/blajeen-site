import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LabBackdrop } from '@/components/brand/LabBackdrop';
import { Container, Section, TituloSecao } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { ProjectFormCard } from '@/components/projects/ProjectFormCard';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

const DEMONSTRACAO = 'https://site-ecommerce-bay.vercel.app';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'E-commerce sob medida',
  descricao:
    'E-commerce white-label com vitrine, catálogo, busca, carrinho, checkout assistido e painel administrativo.',
  rota: ROTAS.ecommerce,
});

const produtosDemonstrativos = [
  {
    nome: 'Kit Starlink Mini',
    imagem: '/projects/ecommerce/produto-starlink.jpg',
    alt: 'Kit para Starlink Mini usado no catálogo demonstrativo do e-commerce.',
  },
  {
    nome: 'Smart TV Samsung',
    imagem: '/projects/ecommerce/produto-smart-tv.jpg',
    alt: 'Smart TV Samsung usada no catálogo demonstrativo do e-commerce.',
  },
  {
    nome: 'Air Fryer Britânia',
    imagem: '/projects/ecommerce/produto-air-fryer.jpg',
    alt: 'Air Fryer Britânia usada no catálogo demonstrativo do e-commerce.',
  },
  {
    nome: 'Esmerilhadeira Bosch',
    imagem: '/projects/ecommerce/produto-esmerilhadeira.jpg',
    alt: 'Esmerilhadeira Bosch usada no catálogo demonstrativo do e-commerce.',
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

function CatalogPreview() {
  return (
    <figure className="overflow-hidden rounded-[var(--radius-panel)] border border-line bg-[#f7f8fb] text-[#0b1d2b] shadow-panel">
      <div className="flex items-center justify-between gap-4 border-b border-black/10 bg-white px-5 py-4 sm:px-7">
        <span className="flex items-center gap-2.5">
          <Image
            src="/projects/ecommerce/logo-ecommerce.png"
            alt=""
            width={40}
            height={40}
            className="size-9 rounded-lg object-cover"
          />
          <strong className="text-sm tracking-[-0.02em]">E-Commerce</strong>
        </span>
        <span className="hidden min-h-9 min-w-48 rounded-full border border-black/10 bg-[#f5f7f9] px-4 py-2 text-xs text-black/45 sm:block">
          Buscar produtos…
        </span>
        <span aria-hidden="true" className="text-lg">⌑</span>
      </div>
      <div className="bg-gradient-to-br from-[#001528] via-[#00344a] to-[#008f93] px-6 py-8 text-white sm:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#48e5dc]">VITRINE DEMONSTRATIVA</p>
        <p className="mt-3 max-w-[18ch] text-2xl font-extrabold leading-tight sm:text-3xl">
          Tudo o que você procura em uma loja organizada.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 sm:p-6">
        {produtosDemonstrativos.map((produto) => (
          <div key={produto.nome} className="overflow-hidden rounded-xl border border-black/10 bg-white">
            <div className="relative aspect-square">
              <Image
                src={produto.imagem}
                alt={produto.alt}
                fill
                sizes="(min-width: 1024px) 12vw, 40vw"
                className="object-contain p-3"
              />
            </div>
            <p className="border-t border-black/5 px-3 py-3 text-xs font-bold leading-tight">
              {produto.nome}
            </p>
          </div>
        ))}
      </div>
      <figcaption className="border-t border-black/10 bg-white px-5 py-4 text-xs text-black/55 sm:px-7">
        Produtos e imagens presentes na base demonstrativa do repositório oficial.
      </figcaption>
    </figure>
  );
}

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
              <figure className="overflow-hidden rounded-[var(--radius-panel)] border border-line bg-raised">
                <Image
                  src="/projects/ecommerce/social-ecommerce.jpg"
                  alt="Identidade visual da demonstração E-Commerce."
                  width={1200}
                  height={630}
                  priority
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="h-auto w-full"
                />
                <figcaption className="tecnica border-t border-line px-5 py-4 text-mineral-dim">
                  Uma base neutra, pronta para receber outra marca e outro catálogo.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </Container>
      </section>

      <Section indice="01 / PRODUTO REAL" rotuladaPor="produto-real-ecommerce-titulo">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <TituloSecao id="produto-real-ecommerce-titulo" className="lg:col-span-7">
            Uma vitrine para o cliente. Um painel para a operação.
          </TituloSecao>
          <p className="medida-texto text-[1rem] leading-relaxed text-mineral lg:col-span-4 lg:col-start-9">
            A demonstração usa um catálogo funcional para apresentar as principais jornadas. Os
            dados são substituídos pelos conteúdos autorizados de cada contratante.
          </p>
        </div>
        <div className="mt-12"><CatalogPreview /></div>
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

      <Section indice="04 / IDENTIDADE E ADAPTAÇÃO" rotuladaPor="adaptacao-ecommerce-titulo">
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

      <Section indice="05 / FORMULÁRIO" rotuladaPor="formulario-ecommerce-titulo">
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
