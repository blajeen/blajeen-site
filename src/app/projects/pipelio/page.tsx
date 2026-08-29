import type { Metadata } from 'next';
import { UpcomingProductPage, type UpcomingProduct } from '@/components/projects/UpcomingProductPage';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Pipelio — Blajeen Labs',
  descricao: 'SaaS em desenvolvimento para organizar relacionamento e oportunidades comerciais.',
  rota: ROTAS.pipelio,
});

const produto: UpcomingProduct = {
  icon: 'crm',
  eyebrow: 'SAAS 07 / RELACIONAMENTO COMERCIAL',
  title: 'Pipelio',
  headline: 'Relacionamento comercial com contexto para cada oportunidade.',
  introduction: 'Uma base em desenvolvimento para acompanhar contatos, oportunidades, etapas e próximos passos sem perder o fio da conversa.',
  contactId: 'pipelio',
  contactLabel: 'Tenho interesse no Pipelio',
  directions: [
    { title: 'Visão do pipeline', text: 'Oportunidades organizadas por etapa para entender o que precisa avançar.' },
    { title: 'Contexto do contato', text: 'Histórico, responsáveis, notas e próximos passos reunidos em cada relacionamento.' },
    { title: 'Rotina comercial', text: 'Filtros, tarefas e lembretes configurados para o processo real de cada equipe.' },
  ],
};

export default function PipelioPage() {
  return <UpcomingProductPage product={produto} />;
}
