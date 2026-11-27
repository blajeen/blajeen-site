import { timingSafeEqual } from 'node:crypto';
/** A Vercel envia CRON_SECRET como Bearer; só esse segredo autoriza as rotas de cron. */
export function cronAutorizado(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const received = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret ?? ''}`);
  return !!secret && expected.length === received.length && timingSafeEqual(expected, received);
}
