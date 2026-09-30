import { SERVICOS_BASE } from '@/content/contratos/modelos.generated';
import { catalogoVigente, parseAjustesCatalogo } from '@/lib/contracts/catalogo';
import { lerAjustesCatalogo, salvarAjustesCatalogo } from '@/lib/contracts/repository';
import { adminGuard, jsonError } from '@/lib/onboarding/http';

export async function GET() {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    const ajustes = await lerAjustesCatalogo();
    return Response.json({ base: SERVICOS_BASE, vigente: catalogoVigente(ajustes) });
  } catch (error) {
    return jsonError(error, 500);
  }
}

export async function PUT(request: Request) {
  const negado = await adminGuard();
  if (negado) return negado;
  try {
    const ajustes = parseAjustesCatalogo(await request.json());
    await salvarAjustesCatalogo(ajustes);
    return Response.json({ vigente: catalogoVigente(ajustes) });
  } catch (error) {
    return jsonError(error);
  }
}
