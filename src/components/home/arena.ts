export type Arena = {
  x: number;
  y: number;
  hp: number;
  enemyHp: number;
  time: number;
  cooldown: number;
  phase: number;
  markX: number;
  markY: number;
  fragment: boolean;
  status: "ready" | "playing" | "won" | "lost";
  slash: number;
  hits: number;
};
export const freshArena = (): Arena => ({
  x: 95,
  y: 240,
  hp: 3,
  enemyHp: 6,
  time: 15,
  cooldown: 0,
  phase: 0,
  markX: 95,
  markY: 240,
  fragment: false,
  status: "ready",
  slash: 0,
  hits: 0,
});
export const enemy = { x: 275, y: 145 };
export const breath = { range: 290, halfAngle: 0.3, warning: 0.8, strike: 1.55, end: 2.05 };
export function breathDirection(s: Arena) {
  return Math.atan2(s.markY - enemy.y, s.markX - enemy.x);
}
export function inDragonBreath(s: Arena) {
  const direction = breathDirection(s);
  const dx = s.x - enemy.x, dy = s.y - enemy.y;
  const forward = dx * Math.cos(direction) + dy * Math.sin(direction);
  const sideways = Math.abs(-dx * Math.sin(direction) + dy * Math.cos(direction));
  return forward >= 0 && forward <= breath.range && sideways <= Math.tan(breath.halfAngle) * forward + 8;
}
export function stepArena(s: Arena, dt: number, dx: number, dy: number) {
  if (s.status !== "playing") return;
  s.time = Math.max(0, s.time - dt);
  s.cooldown = Math.max(0, s.cooldown - dt);
  s.slash = Math.max(0, s.slash - dt);
  const length = Math.hypot(dx, dy) || 1;
  s.x = Math.max(32, Math.min(448, s.x + (dx / length) * 115 * dt));
  s.y = Math.max(40, Math.min(286, s.y + (dy / length) * 115 * dt));
  if (s.enemyHp > 0) {
    const before = s.phase;
    s.phase += dt;
    if (before < breath.warning && s.phase >= breath.warning) {
      s.markX = s.x;
      s.markY = s.y;
    }
    if (before < breath.strike && s.phase >= breath.strike) {
      if (inDragonBreath(s)) {
        s.hp--;
        s.hits++;
      }
    }
    if (s.phase > 2.3) s.phase = 0;
  }
  if (
    !s.fragment &&
    s.enemyHp === 0 &&
    Math.hypot(s.x - enemy.x, s.y - enemy.y) < 35
  )
    s.fragment = true;
  if (s.fragment && Math.hypot(s.x - 425, s.y - 65) < 35) s.status = "won";
  else if (s.hp <= 0 || s.time === 0) s.status = "lost";
}
export function attack(s: Arena) {
  if (s.status !== "playing" || s.cooldown > 0) return;
  s.cooldown = 0.5;
  s.slash = 0.2;
  if (s.enemyHp > 0 && Math.hypot(s.x - enemy.x, s.y - enemy.y) < 72)
    s.enemyHp--;
}
