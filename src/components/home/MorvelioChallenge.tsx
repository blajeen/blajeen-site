"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { attack, enemy, freshArena, stepArena } from "./arena";
import { drawCourtyard, drawDragon, drawKnight } from "./arena-art";
import { useMotion } from "@/components/motion/MotionProvider";

export function MorvelioChallenge() {
  const canvas = useRef<HTMLCanvasElement>(null),
    state = useRef(freshArena()),
    keys = useRef(new Set<string>()),
    destination = useRef<{ x: number; y: number } | null>(null),
    pausedRef = useRef(false);
  const [view, setView] = useState(freshArena()),
    [paused, setPaused] = useState(false);
  const { ativo } = useMotion();
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    let frame = 0,
      last = 0,
      visible = true;
    let lastPublished = 0;
    const publish = () => setView({ ...state.current });
    const pause = () => {
      if (state.current.status === "playing") {
        pausedRef.current = true;
        setPaused(true);
        keys.current.clear();
        destination.current = null;
      }
    };
    const visibility = () => {
      if (document.hidden) pause();
    };
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      if (!visible) pause();
    });
    observer.observe(c);
    function draw(t: number) {
      if (!ctx || !c) return;
      const s = state.current;
      const dt = Math.min((t - last) / 1000, 0.04);
      last = t;
      if (visible && !pausedRef.current && s.status === "playing") {
        let dx =
          Number(keys.current.has("ArrowRight") || keys.current.has("d")) -
          Number(keys.current.has("ArrowLeft") || keys.current.has("a"));
        let dy =
          Number(keys.current.has("ArrowDown") || keys.current.has("s")) -
          Number(keys.current.has("ArrowUp") || keys.current.has("w"));
        if (destination.current && !dx && !dy) {
          dx = destination.current.x - s.x;
          dy = destination.current.y - s.y;
          if (Math.hypot(dx, dy) < 5) {
            destination.current = null;
            dx = 0;
            dy = 0;
          }
        }
        stepArena(s, dt, dx, dy);
        if (t - lastPublished > 100 || s.status !== "playing") {
          publish();
          lastPublished = t;
        }
      }
      ctx.clearRect(0, 0, 480, 320);
      drawCourtyard(ctx);
      ctx.strokeStyle = s.fragment ? "#9cebd4" : "#608c83";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(425, 64, 21, 30, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#79bfaf33";
      ctx.fill();
      ctx.font = "9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#c5e4d5";
      ctx.fillText("REFÚGIO", 425, 110);
      if (s.enemyHp > 0) {
        drawDragon(ctx, s);
      } else if (!s.fragment) {
        ctx.fillStyle = "#fce8a6";
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y - 16);
        ctx.lineTo(enemy.x + 9, enemy.y);
        ctx.lineTo(enemy.x, enemy.y + 13);
        ctx.lineTo(enemy.x - 9, enemy.y);
        ctx.closePath();
        ctx.fill();
      }
      drawKnight(ctx, s);
      if (s.slash > 0) {
        ctx.strokeStyle = "#fff0b5";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 40, -1.2, 1.2);
        ctx.stroke();
      }
      if (s.status === "ready") {
        ctx.fillStyle = "#101e2288";
        ctx.fillRect(0, 0, 480, 320);
        ctx.fillStyle = "#f2e5c6";
        ctx.font = "600 25px sans-serif";
        ctx.fillText("Um fragmento. Uma saída.", 240, 140);
        ctx.font = "13px sans-serif";
        ctx.fillText("Seu próximo passo pode mudar tudo.", 240, 166);
      }
      if (
        visible &&
        ((s.status === "playing" && !pausedRef.current) ||
          (ativo && s.status === "ready"))
      )
        frame = requestAnimationFrame(draw);
    }
    draw(0);
    const redraw = () => {
      cancelAnimationFrame(frame);
      last = performance.now();
      draw(last);
    };
    c.addEventListener("arena-redraw", redraw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      c.removeEventListener("arena-redraw", redraw);
    };
  }, [ativo]);
  function refresh() {
    setView({ ...state.current });
    canvas.current?.dispatchEvent(new Event("arena-redraw"));
  }
  function start() {
    state.current = freshArena();
    state.current.status = "playing";
    keys.current.clear();
    destination.current = null;
    pausedRef.current = false;
    setPaused(false);
    refresh();
    canvas.current?.focus({ preventScroll: true });
  }
  function togglePause() {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    keys.current.clear();
    destination.current = null;
    refresh();
  }
  function move(key: string) {
    keys.current.add(key);
    destination.current = null;
  }
  return (
    <section
      id="desafio-morvelio"
      className="hx-section hx-challenge"
      aria-labelledby="challenge-title"
      data-conduto-lado="direita"
    >
      <div>
        <p className="hx-kicker">03 / DO LIVRO PARA O SEU CONTROLE</p>
        <h2 id="challenge-title">
          Algumas ideias
          <br />
          viram <em>jogos.</em>
        </h2>
        <p className="hx-lead">
          O portal está aberto.
          <br />
          Você tem 15 segundos para voltar.
        </p>
        <p>
          Derrote o dragão, recolha o fragmento e alcance o portal. Saia da
          faixa marcada antes da baforada verde.
        </p>
        <ol className="hx-mission">
          <li>
            <span>01</span>Aproxime-se e ataque o dragão.
          </li>
          <li>
            <span>02</span>Pegue o fragmento que ele deixa.
          </li>
          <li>
            <span>03</span>Volte ao portal do refúgio.
          </li>
        </ol>
        <div className="hx-links">
          <Link href="/projects/morvelio">Conheça Morvelio ↗</Link>
          <Link href="/morvelio/wiki">Explore a wiki ↗</Link>
        </div>
        <small>
          Demonstração feita para este site, inspirada em Morvelio. Não é uma
          captura nem uma versão do jogo mobile.
        </small>
      </div>
      <div className="hx-game">
        <div className="hx-game-hud">
          <span>VELIDOR / CAMPO DE PROVA</span>
          <span aria-label={`${view.hp} pontos de vida`}>
            {"♥".repeat(Math.max(0, view.hp))}
          </span>
          <strong>{Math.ceil(view.time)}s</strong>
        </div>
        <canvas
          ref={canvas}
          width={960}
          height={640}
          tabIndex={0}
          aria-label="Arena: setas ou WASD movem; espaço ataca. No toque, toque no chão para caminhar e use Atacar."
          onBlur={() => {
            keys.current.clear();
          }}
          onKeyDown={(e) => {
            const k = e.key.toLowerCase();
            if (
              [
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright",
                "w",
                "a",
                "s",
                "d",
                " ",
              ].includes(k)
            ) {
              e.preventDefault();
              if (k === " ") {
                if (!pausedRef.current) attack(state.current);
                refresh();
              } else move(e.key.startsWith("Arrow") ? e.key : k);
            }
          }}
          onKeyUp={(e) =>
            keys.current.delete(
              e.key.startsWith("Arrow") ? e.key : e.key.toLowerCase(),
            )
          }
          onPointerDown={(e) => {
            if (state.current.status !== "playing") return;
            const r = e.currentTarget.getBoundingClientRect();
            destination.current = {
              x: ((e.clientX - r.left) / r.width) * 480,
              y: ((e.clientY - r.top) / r.height) * 320,
            };
            e.currentTarget.focus({ preventScroll: true });
          }}
        >
          Demonstração de combate com movimento, ataque, fragmento e portal.
          Conheça também o jogo e a wiki pelos links desta seção.
        </canvas>
        <div className="hx-game-status" role="status">
          {view.status === "won"
            ? "Fragmento recuperado. Você voltou ao refúgio!"
            : view.status === "lost"
              ? "O portal ficou para trás. Tente uma nova rota."
              : paused
                ? "Expedição pausada."
                : view.status === "playing"
                  ? view.fragment
                    ? "Fragmento coletado! Vá ao portal no canto superior direito."
                    : view.enemyHp === 0
                      ? "Dragão derrotado. Pegue o fragmento."
                      : "Saia da faixa marcada. Ataque o dragão pelos flancos."
                  : "15 segundos. Um dragão. Pouca margem para errar."}
        </div>
        <div className="hx-game-controls">
          {view.status !== "playing" ? (
            <button className="hx-button" onClick={start}>
              {view.status === "ready"
                ? "Iniciar expedição"
                : "Tentar novamente"}{" "}
              ↗
            </button>
          ) : (
            <>
              <div
                className="hx-dpad"
                role="group"
                aria-label="Mover aventureiro"
              >
                {[
                  ["↑", "ArrowUp"],
                  ["←", "ArrowLeft"],
                  ["↓", "ArrowDown"],
                  ["→", "ArrowRight"],
                ].map(([label, key]) => (
                  <button
                    key={key}
                    aria-label={`Mover ${label}`}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      move(key!);
                    }}
                    onPointerUp={() => keys.current.clear()}
                    onPointerCancel={() => keys.current.clear()}
                    onLostPointerCapture={() => keys.current.clear()}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        move(key!);
                      }
                    }}
                    onKeyUp={() => keys.current.clear()}
                    onBlur={() => keys.current.clear()}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                className="hx-button"
                onClick={() => {
                  if (!pausedRef.current) attack(state.current);
                  refresh();
                }}
              >
                Atacar
              </button>
              <button className="hx-pause" onClick={togglePause}>
                {paused ? "Continuar" : "Pausar"}
              </button>
            </>
          )}
        </div>
        <p className="hx-game-help">
          Setas / WASD + espaço · No celular, toque no chão ou use as setas.
        </p>
      </div>
    </section>
  );
}
