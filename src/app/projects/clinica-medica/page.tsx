import type { Metadata } from 'next';
import { UpcomingProductPage, type UpcomingProduct } from '@/components/projects/UpcomingProductPage';
import { metadadosDaRota } from '@/lib/metadata';
import { ROTAS } from '@/lib/routes';

export const metadata: Metadata = metadadosDaRota({
  titulo: 'Clínica Médica',
  descricao:
    'Produto em desenvolvimento para médicos que atendem de forma independente: site, agenda, pacientes, prontuário e documentos clínicos em uma única base.',
  rota: ROTAS.clinicaMedica,
});

const produto: UpcomingProduct = {
  icon: 'medico',
  eyebrow: 'PRODUTO 05 / CLÍNICA MÉDICA',
  title: 'Clínica Médica',
  headline: 'Presença profissional e rotina clínica em uma única base.',
  introduction:
    'Um produto em desenvolvimento para o médico que atende de forma independente e quer organizar sua presença digital, seus pacientes e o dia a dia do consultório.',
  contactId: 'clinica-medica',
  contactLabel: 'Tenho interesse na Clínica Médica',
  directions: [
    {
      title: 'Site profissional',
      text: 'Apresentação do médico, especialidades, formas de atendimento, localização, orientações e canais de contato com uma identidade própria.',
    },
    {
      title: 'Agendamento e agenda',
      text: 'O paciente solicita um horário pela internet e o médico acompanha compromissos, disponibilidade e rotina de atendimento em uma visão organizada.',
    },
    {
      title: 'Pacientes e prontuário',
      text: 'Cadastro, histórico, evolução e informações clínicas reunidos por paciente, com acesso restrito e estrutura pensada para registros sensíveis.',
    },
    {
      title: 'Documentos clínicos',
      text: 'Modelos para facilitar receitas, encaminhamentos, atestados e solicitações de exames, sempre revisados e assinados pelo médico responsável.',
    },
    {
      title: 'Controle e privacidade',
      text: 'Permissões, histórico de ações, cópias de segurança e regras de acesso entram no desenho do produto antes de qualquer dado real ser utilizado.',
    },
  ],
  servicesTitle: 'A primeira versão está sendo desenhada ao redor da rotina do médico individual.',
  servicesIntroduction:
    'Os módulos abaixo representam a direção do produto. Integrações, assinatura digital e regras específicas só serão anunciadas depois de validadas.',
  services: [
    'Site profissional',
    'Agendamento online',
    'Agenda médica',
    'Cadastro de pacientes',
    'Prontuário eletrônico',
    'Histórico clínico',
    'Receitas médicas',
    'Encaminhamentos',
    'Atestados',
    'Solicitações de exames',
    'Documentos em PDF',
    'Controle de acesso',
  ],
};

export default function ClinicaMedicaPage() {
  return <UpcomingProductPage product={produto} />;
}
