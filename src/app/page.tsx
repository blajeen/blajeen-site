import { ScreenshotFrame } from "@/components/projects/ScreenshotFrame";
import Link from "next/link";
import { LabHero } from "@/components/home/LabHero";
import { ProductConfigurator } from "@/components/home/ProductConfigurator";
import { MorvelioChallenge } from "@/components/home/MorvelioChallenge";
import { Conduto } from "@/components/conduto/Conduto";
import { trabalhos } from "@/content/portfolio";
import "@/components/home/HomeExperience.css";

export const revalidate = 3600;
export default function Home() {
  return (
    <div className="hx">
      {/* Tubo de energia: corre pelas seções marcadas com data-conduto-lado. */}
      <Conduto />
      <LabHero />
      <noscript>
        <p className="px-6 py-4 text-sm">
          Ative o JavaScript para experimentar o laboratório, o configurador e o
          desafio. Os projetos e os links de contato continuam disponíveis
          abaixo.
        </p>
      </noscript>
      <div className="hx-ribbon" aria-label="O que criamos">
        <span>EXPERIÊNCIAS DIGITAIS</span>
        <span>PRODUTOS SOB MEDIDA</span>
        <span>UNIVERSOS JOGÁVEIS</span>
      </div>
      <ProductConfigurator />
      <section
        id="trabalhos"
        className="hx-section"
        aria-labelledby="home-work-title"
        data-conduto-lado="direita"
      >
        <div className="hx-section-heading">
          <div>
            <p className="hx-kicker">
              02 / FORA DO LABORATÓRIO. NO MUNDO REAL.
            </p>
            <h2 id="home-work-title">
              Cada projeto,
              <br />
              <em>uma resposta própria.</em>
            </h2>
          </div>
          <p>
            Identidades diferentes. Necessidades reais.
            <br />
            Conheça o trabalho por trás de cada entrega.
            <br />
            <Link
              href="/trabalhos"
              className="inline-block mt-4 underline underline-offset-4"
            >
              Todos os projetos ↗
            </Link>
          </p>
        </div>
        <div className="hx-work-grid">
          {trabalhos.slice(0, 3).map((t) => (
            <Link href={t.href} className="hx-work-card" key={t.id}>
              <ScreenshotFrame src={t.capa} alt={t.capaAlt} label={t.cliente}/>
              <div>
                <small>{t.categoria}</small>
                <h3>{t.cliente}</h3>
                <p>{t.resumo}</p>
                <span>Conheça o projeto ↗</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <MorvelioChallenge />
      <section
        className="hx-final"
        aria-labelledby="home-final-title"
        data-conduto-lado="direita"
      >
        <div>
          <p className="hx-kicker">O PRÓXIMO PROJETO PODE COMEÇAR AQUI.</p>
          <h2 id="home-final-title">
            Agora imagine isso
            <br />
            <em>com a sua ideia.</em>
          </h2>
          <p>
            Você traz o que quer transformar. Nós ajudamos a desenhar, construir
            e colocar em funcionamento.
          </p>
        </div>
        <Link
          href="/crie-seu-projeto"
          className="hx-button"
          data-conduto-destino=""
        >
          Vamos criar seu projeto ↗
        </Link>
      </section>
      <nav className="hx-directory" aria-label="Continue explorando">
        <Link href="/produtos">Produtos para usar</Link>
        <Link href="/projects">Jogos e sistemas</Link>
        <Link href="/morvelio/wiki">Morvelio Wiki</Link>
        <Link href="/about">Conheça o estúdio</Link>
        <Link href="/contact">Contato</Link>
      </nav>
    </div>
  );
}
