"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useMotion } from "@/components/motion/MotionProvider";
import { reservarGpu } from "@/lib/fila-da-gpu";
import type { createLab, Station } from "./LabScene";

const stations = {
  lab: {
    name: "O laboratório",
    description:
      "Uma bancada de possibilidades. Escolha um objeto e descubra o que sai daqui.",
    link: "#configurador",
    cta: "Dar forma a uma ideia",
  },
  produto: {
    name: "Produtos que funcionam",
    description:
      "Uma interface bonita é o começo. Experimente como ela responde às suas escolhas.",
    link: "#configurador",
    cta: "Experimentar o configurador",
  },
  morvelio: {
    name: "Jogos interativos",
    description:
      "Cenários, personagens e mecânicas que transformam uma ideia em uma experiência jogável.",
    link: "#desafio-morvelio",
    cta: "Experimentar o desafio",
  },
};
/** Tempo, depois de criada a cena, em que os primeiros quadros dela ainda pesam na GPU. */
const QUADROS_PESADOS_MS = 700;

export function LabHero() {
  const host = useRef<HTMLDivElement>(null),
    scene = useRef<ReturnType<typeof createLab> | null>(null);
  const { ativo } = useMotion();
  const [station, setStation] = useState<Station>("lab"),
    [requested, setRequested] = useState(false),
    [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!window.matchMedia('(min-width: 851px) and (pointer: fine)').matches) return;
    const node = host.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setRequested(true); observer.disconnect(); }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!requested) return;
    let stopped = false;
    const node = host.current;
    if (!node) return;
    // A cena compila os shaders ao criar o ambiente e nos primeiros desenhos (sombras, materiais).
    // Até eles passarem, a fila da GPU fica reservada: o conduto de energia espera, a cena não trava
    // atrás da compilação dele, e as consultas dele não esperam atrás dos quadros pesados da cena.
    const liberarGpu = reservarGpu();
    let liberarDepois = 0;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      observer.disconnect();
      void import("./LabScene")
        .then(({ createLab }) => {
          if (stopped) return;
          try {
            scene.current = createLab(node, setStation);
            setReady(true);
          } catch {
            setFailed(true);
          }
          liberarDepois = window.setTimeout(liberarGpu, QUADROS_PESADOS_MS);
        })
        .catch(() => {
          setFailed(true);
          liberarGpu();
        });
    });
    observer.observe(node);
    return () => {
      stopped = true;
      observer.disconnect();
      window.clearTimeout(liberarDepois);
      liberarGpu();
      scene.current?.dispose();
      scene.current = null;
    };
  }, [requested]);
  useEffect(() => {
    scene.current?.select(station);
    scene.current?.motion(ativo);
  }, [station, ativo, ready]);
  return (
    <section className="hx-hero" aria-labelledby="lab-title" data-conduto-lado="direita">
      <div className="hx-hero-copy">
        <p className="hx-kicker">ESTÚDIO INDEPENDENTE / IDEIAS EM MOVIMENTO</p>
        <BrandLogo
          prioridade
          className="hx-wordmark"
          sizes="(max-width:760px) 65vw, 340px"
        />
        <h1 id="lab-title">
          Imagine o que
          <br />
          podemos <em>criar.</em>
        </h1>
        <p>
          Sites, aplicativos, sistemas e mundos inteiros.
          <br />
          Entre no laboratório. Aqui, você pode experimentar.
        </p>
        <div className="hx-links">
          <a className="hx-button" href="#configurador">
            Experimente uma ideia <span>↗</span>
          </a>
          <a href="/crie-seu-projeto">Vamos criar seu projeto →</a>
        </div>
        <span className="hx-footnote">
          DESIGN COM IDENTIDADE. ENGENHARIA EM CADA DETALHE.
        </span>
      </div>
      <div className="hx-lab">
        <div className="hx-lab-meta">
          <span>LAB / 001</span>
          <span>
            {ready
              ? "CENA 3D INTERATIVA"
              : failed
                ? "EXPLORE O LABORATÓRIO"
                : "BANCADA DO LABORATÓRIO"}
          </span>
        </div>
        <div className="hx-scene-wrap">
          <Image
            src="/brand/lab-3d-poster.webp"
            alt="Bancada do laboratório Blajeen"
            fill
            priority
            sizes="(max-width:900px) 90vw, 60vw"
            className={ready ? "hx-fallback is-hidden" : "hx-fallback"}
          />
          <div ref={host} className="hx-scene" />
          {!requested && !failed && <button className="hx-button hx-activate" onClick={() => setRequested(true)}>Explorar em 3D ↗</button>}
          {requested && !ready && !failed && <span className="hx-loading" role="status">Abrindo a bancada 3D…</span>}
          <span className="hx-scene-hint">Arraste para girar · escolha uma estação ↓</span>
        </div>
        <div
          className="hx-stations"
          role="group"
          aria-label="Estações do laboratório"
        >
          {(Object.keys(stations) as Station[]).map((id, i) => (
            <button
              key={id}
              aria-pressed={station === id}
              onClick={() => { setStation(id); setRequested(true); }}
            >
              <span>0{i + 1}</span>
              {stations[id].name}
            </button>
          ))}
        </div>
        <div className="hx-station-copy" aria-live="polite">
          <p>{stations[station].description}</p>
          <a href={stations[station].link}>{stations[station].cta} ↗</a>
        </div>
      </div>
    </section>
  );
}
