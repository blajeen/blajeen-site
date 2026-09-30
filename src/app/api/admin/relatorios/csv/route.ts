import { contratosCsv } from '@/lib/admin/relatorios';
import { listarContratos } from '@/lib/contracts/repository';
import { adminGuard } from '@/lib/onboarding/http';

/** Planilha com todos os contratos, para abrir no Excel ou no Google Planilhas. */
export async function GET() {
  const negado = await adminGuard();
  if (negado) return negado;
  const data = new Date().toISOString().slice(0, 10);
  return new Response(contratosCsv(await listarContratos()), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="contratos-blajeen-${data}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
