import { describe, it, expect } from "vitest";
import { freshArena, stepArena, attack, enemy, inDragonBreath } from "./arena";
describe("Expedição do site", () => {
  it("começa com 15 segundos e protege quem está atrás do dragão", () => {
    const s = freshArena();
    expect(s.time).toBe(15);
    expect(s.enemyHp).toBe(6);
    s.markX = enemy.x + 100; s.markY = enemy.y;
    s.x = enemy.x - 40; s.y = enemy.y;
    expect(inDragonBreath(s)).toBe(false);
    s.x = enemy.x + 100;
    expect(inDragonBreath(s)).toBe(true);
    s.y += 70;
    expect(inDragonBreath(s)).toBe(false);
  });
  it("não permite dano à distância nem ataques durante a recarga", () => {
    const s = freshArena();
    s.status = "playing";
    attack(s);
    expect(s.enemyHp).toBe(6);
    s.x = enemy.x;
    s.y = enemy.y;
    attack(s);
    expect(s.enemyHp).toBe(6);
    stepArena(s, 0.5, 0, 0);
    attack(s);
    expect(s.enemyHp).toBe(5);
    attack(s);
    expect(s.enemyHp).toBe(5);
  });
  it("avisa antes de golpear e permite escapar da área marcada", () => {
    const s = freshArena();
    s.status = "playing";
    stepArena(s, 0.85, 0, 0);
    expect(s.hp).toBe(3);
    stepArena(s, 0.65, 0, -1);
    stepArena(s, 0.2, 0, 0);
    expect(s.hp).toBe(3);
    const stationary = freshArena();
    stationary.status = "playing";
    stepArena(stationary, 0.85, 0, 0);
    stepArena(stationary, 1, 0, 0);
    expect(stationary.hp).toBe(2);
  });
  it("exige guardião derrotado, fragmento coletado e chegada ao portal para vencer", () => {
    const s = freshArena();
    s.status = "playing";
    s.x = 425;
    s.y = 65;
    stepArena(s, 0.01, 0, 0);
    expect(s.status).toBe("playing");
    s.x = enemy.x;
    s.y = enemy.y;
    for (let i = 0; i < 6; i++) {
      attack(s);
      stepArena(s, 0.51, 0, 0);
    }
    expect(s.enemyHp).toBe(0);
    expect(s.fragment).toBe(true);
    s.x = 425;
    s.y = 65;
    stepArena(s, 0.01, 0, 0);
    expect(s.status).toBe("won");
  });
  it("encerra por tempo ou vida e não movimenta partidas encerradas", () => {
    const s = freshArena();
    s.status = "playing";
    s.time = 0.01;
    stepArena(s, 0.1, 0, 0);
    expect(s.status).toBe("lost");
    const x = s.x;
    stepArena(s, 1, 1, 0);
    expect(s.x).toBe(x);
    const other = freshArena();
    other.status = "playing";
    other.hp = 0;
    stepArena(other, 0.01, 0, 0);
    expect(other.status).toBe("lost");
  });
  it("mantém velocidade diagonal e limites da arena", () => {
    const a = freshArena(),
      b = freshArena();
    a.status = b.status = "playing";
    stepArena(a, 0.2, 1, 0);
    stepArena(b, 0.2, 1, 1);
    expect(Math.hypot(b.x - 95, b.y - 240)).toBeCloseTo(a.x - 95);
    stepArena(a, 10, 1, 0);
    expect(a.x).toBe(448);
  });
});
