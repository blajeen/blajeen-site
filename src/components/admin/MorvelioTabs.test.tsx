import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { MorvelioTabs } from './MorvelioTabs';
import { MorvelioAnalytics } from './MorvelioAnalytics';
import { demoDashboard } from '@/lib/analytics/demo';

const tabs = [{ id: 'jogadores', label: 'Jogadores', content: <p>Conteúdo jogadores</p> }, { id: 'jornada', label: 'Jornada', content: <p>Conteúdo jornada</p> }, { id: 'cerco', label: 'Cerco', content: <p>Conteúdo cerco</p> }];
afterEach(() => { window.history.replaceState(null, '', '/'); });

describe('abas da Analytics do Morvelio', () => {
  it('troca por clique e grava a aba no hash', async () => {
    render(<MorvelioTabs tabs={tabs} />);
    expect(screen.getByText('Conteúdo jogadores')).toBeVisible();
    await userEvent.click(screen.getByRole('tab', { name: 'Jornada' }));
    expect(screen.getByRole('tab', { name: 'Jornada' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Conteúdo jornada')).toBeVisible();
    expect(screen.getByText('Conteúdo jogadores')).not.toBeVisible();
    expect(window.location.hash).toBe('#jornada');
  });
  it('abre a aba do link e navega com setas, Home e End', async () => {
    window.history.replaceState(null, '', '/#cerco');
    render(<MorvelioTabs tabs={tabs} />);
    expect(await screen.findByRole('tab', { name: 'Cerco', selected: true })).toBeInTheDocument();
    screen.getByRole('tab', { name: 'Cerco' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Jogadores' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Cerco', selected: true })).toHaveFocus();
    expect(screen.getAllByRole('tab').filter((t) => t.tabIndex === 0)).toHaveLength(1);
  });
  it('ignora hash desconhecido', () => {
    window.history.replaceState(null, '', '/#nada');
    render(<MorvelioTabs tabs={tabs} />);
    expect(screen.getByRole('tab', { name: 'Jogadores', selected: true })).toBeInTheDocument();
  });
  it('a página mostra o resumo no topo com alerta de travamento e as seis abas', () => {
    render(<MorvelioAnalytics data={demoDashboard()} />);
    const resumo = screen.getByRole('region', { name: 'Resumo do que importa' });
    for (const label of ['Contas novas · 7 dias', 'Voltaram depois de 1 dia', 'Ativos em 3 dias', 'Maior parada da jornada', 'Jogadores no Cerco', 'Travamentos · Android', 'ANR · Android']) expect(resumo).toHaveTextContent(label);
    expect(resumo).toHaveTextContent('▲ acima do limite'); // exemplo: 1,24% de travamentos no último dia
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['Jogadores', 'Jornada', 'Cerco', 'Estabilidade', 'Lojas', 'Conexões']);
  });
});
