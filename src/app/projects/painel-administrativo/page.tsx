import type { Metadata } from 'next';
import { UpcomingProductPage, type UpcomingProduct } from '@/components/projects/UpcomingProductPage';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Painel Administrativo Central — Blajeen Labs',
  descricao: 'Painel central em desenvolvimento para configurar e controlar o SaaS inteiro de cada negócio.',
  rota: ROTAS.painelAdministrativo,
});

const produto: UpcomingProduct = {
  icon: 'admin',
  eyebrow: 'SAAS 08 / CONTROLE CENTRAL',
  title: 'Painel Administrativo Central',
  headline: 'Ajuste, acompanhe e controle o seu SaaS inteiro.',
  introduction: 'Um painel completo em desenvolvimento para configurar a identidade do negócio, organizar módulos e acompanhar a operação em um só lugar.',
  contactId: 'painel-administrativo',
  contactLabel: 'Tenho interesse no Painel Central',
  directions: [
    { title: 'Identidade do negócio', text: 'Logo, cores, tipografia, imagens, textos e domínio preparados para representar sua marca.' },
    { title: 'Módulos e regras', text: 'Ative o que faz sentido para sua operação e ajuste permissões, catálogos, agenda e fluxos.' },
    { title: 'Visão da operação', text: 'Acompanhe dados e pendências do seu SaaS com uma visão central para decisões rápidas.' },
  ],
};

export default function PainelAdministrativoPage() {
  return <UpcomingProductPage product={produto} />;
}
