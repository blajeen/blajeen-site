import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { LiveWordmark } from './LiveWordmark';

function montar(props: Parameters<typeof LiveWordmark>[0] = {}) {
  return render(
    <MotionProvider>
      <LiveWordmark {...props} />
    </MotionProvider>,
  );
}

describe('LiveWordmark', () => {
  it('expõe a marca com nome acessível único', () => {
    montar();
    expect(screen.getByRole('img', { name: 'Blajeen Labs' })).toBeInTheDocument();
  });

  it('renderiza a palavra inteira, com os dois E como olhos', () => {
    const { container } = montar();
    const marca = screen.getByRole('img', { name: 'Blajeen Labs' });

    // O texto visível é BLAJ + dois olhos + N: a leitura de "BLAJEEN" é preservada.
    expect(marca.textContent).toContain('BLAJ');
    expect(marca.textContent).toContain('N');
    expect(container.querySelectorAll('svg')).toHaveLength(2);
  });

  it('desenha a gosma com poucos pingos no hero', () => {
    const { container } = montar({ variante: 'hero' });
    const pingos = container.querySelectorAll('i');
    expect(pingos).toHaveLength(4);
  });

  it('não aplica gosma na variante reduzida do header', () => {
    const { container } = montar({ variante: 'reduzida' });
    expect(container.querySelectorAll('i')).toHaveLength(0);
    expect(container.querySelectorAll('svg')).toHaveLength(2);
  });

  it('mantém o qualificador LABS fora da árvore de acessibilidade, sem duplicar o nome', () => {
    montar();
    // "LABS" já está no rótulo da marca; repetir criaria leitura dupla.
    expect(screen.queryByText('LABS', { ignore: '[aria-hidden="true"] *, [aria-hidden="true"]' })).toBeNull();
  });

  it('renderiza olhos abertos e estáticos na primeira pintura', () => {
    const { container } = montar();
    for (const svg of container.querySelectorAll('svg')) {
      expect(svg.getAttribute('data-piscando')).toBe('false');
    }
  });
});
