"use client";

import { useEffect, useRef, useState } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import type { createMascot } from "./MascotScene";
import styles from "./DancingMascot.module.css";

/** A companhia da home: a posição existe só enquanto esta página está aberta. */
export function DancingMascot() {
  const host = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const scene = useRef<ReturnType<typeof createMascot> | null>(null);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const { ativo } = useMotion();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let disposed = false;
    import("./MascotScene").then(({ createMascot }) => {
      if (disposed || !host.current) return;
      scene.current = createMascot(host.current, () => {
        if (!disposed) setStatus("ready");
      }, () => {
        if (!disposed) setStatus("failed");
      });
    }).catch(() => { if (!disposed) setStatus("failed"); });
    return () => { disposed = true; scene.current?.dispose(); scene.current = null; };
  }, []);

  useEffect(() => {
    if (status === "failed") { scene.current?.dispose(); scene.current = null; }
    else scene.current?.setMotion(ativo);
  }, [ativo, status]);

  function moveTo(x: number, y: number) {
    const node = panel.current;
    if (!node) return;
    const bounds = node.getBoundingClientRect();
    node.style.left = `${Math.max(8, Math.min(x, window.innerWidth - bounds.width - 8))}px`;
    node.style.top = `${Math.max(8, Math.min(y, window.innerHeight - bounds.height - 8))}px`;
    node.style.right = "auto";
    node.style.bottom = "auto";
  }

  useEffect(() => {
    function resize() {
      const node = panel.current;
      if (!node || !node.style.left) return;
      const bounds = node.getBoundingClientRect();
      moveTo(bounds.left, bounds.top);
    }
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  if (status === "failed") return null;

  return (
    <div ref={panel} className={styles.mascot} data-mascot-state={status}>
      <button
        type="button"
        className={styles.handle}
        aria-label="Mover mascote. Segure e arraste ou use as setas do teclado."
        aria-describedby="mascot-instructions"
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0 || !panel.current) return;
          const bounds = panel.current.getBoundingClientRect();
          drag.current = { id: event.pointerId, x: event.clientX - bounds.left, y: event.clientY - bounds.top };
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.dataset.dragging = "true";
        }}
        onPointerMove={(event) => {
          const current = drag.current;
          if (current?.id === event.pointerId) moveTo(event.clientX - current.x, event.clientY - current.y);
        }}
        onPointerUp={(event) => {
          if (drag.current?.id !== event.pointerId) return;
          drag.current = null;
          event.currentTarget.dataset.dragging = "false";
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onLostPointerCapture={(event) => { drag.current = null; event.currentTarget.dataset.dragging = "false"; }}
        onPointerCancel={(event) => { drag.current = null; event.currentTarget.dataset.dragging = "false"; }}
        onKeyDown={(event) => {
          const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
          if (!direction || !panel.current) return;
          event.preventDefault();
          const bounds = panel.current.getBoundingClientRect();
          const step = event.shiftKey ? 40 : 12;
          moveTo(bounds.left + direction[0]! * step, bounds.top + direction[1]! * step);
        }}
      >
        <span ref={host} className={styles.canvas} aria-hidden="true" />
        <span id="mascot-instructions" className={styles.hint}>
          {status === "loading" ? "Chegando do laboratório…" : "Mascote"}
        </span>
      </button>
    </div>
  );
}
