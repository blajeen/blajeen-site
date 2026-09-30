import type { Metadata } from 'next';
import { MODELOS } from '@/content/contratos/modelos.generated';
import { site } from '@/content/site';
import { ContratoCliente } from '@/components/contracts/ContratoCliente';
import { contratoDoLink } from '@/lib/contracts/service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Seu contrato',
  description: 'Confira o combinado, leia o contrato e envie seus dados para a Blajeen Labs.',
  robots: { index: false, follow: false, noarchive: true },
};

const MENSAGENS = {
  invalido: ['Link não encontrado.', 'Confira se o endereço está completo. Se o problema continuar, peça um novo link à Blajeen Labs.'],
  expirado: ['Este link expirou.', 'Por segurança, os links de contrato têm validade. Peça um novo link à Blajeen Labs pelo WhatsApp ou e-mail.'],
  cancelado: ['Este contrato foi cancelado.', 'Se isso não era esperado, fale com a Blajeen Labs.'],
} as const;

export default async function ContratoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const estado = await contratoDoLink(token);

  if (estado.tipo !== 'ok') {
    const [titulo, texto] = MENSAGENS[estado.tipo];
    return (
      <div className="mx-auto w-full max-w-3xl px-[var(--gutter)] py-24">
        <p className="tecnica text-signal">CONTRATO</p>
        <h1 className="mt-5 text-[clamp(2.2rem,5vw,3.6rem)] leading-none tracking-[-0.04em]">{titulo}</h1>
        <p className="mt-5 text-mineral">{texto}</p>
      </div>
    );
  }

  const { contrato } = estado;
  const termos = contrato.termos;
  return (
    <ContratoCliente token={token} resumo={{
      numero: contrato.numero,
      servico: MODELOS[contrato.servico].tituloCurto,
      projeto: termos.projeto_nome ?? '',
      plano: termos.plano_nome ?? '',
      valor: termos.valor_total ?? '',
      pagamento: termos.forma_pagamento ?? MODELOS[contrato.servico].pagamento,
      parcelamento: termos.parcelamento ?? 'à vista',
      prazo: termos.prazo ?? '',
      combinado: termos.resumo_combinado ?? '',
      contratada: `${site.razaoSocial} · CNPJ ${site.cnpj}`,
      expiraEm: contrato.tokenExpiresAt,
      jaEnviado: contrato.status !== 'AGUARDANDO_CLIENTE',
      iniciais: Object.fromEntries((['contratante_nome', 'contratante_doc', 'contratante_endereco', 'contratante_email', 'contratante_tel', 'contratante_repr'] as const)
        .filter((chave) => contrato.cliente[chave]).map((chave) => [chave, contrato.cliente[chave]!])),
    }} />
  );
}
