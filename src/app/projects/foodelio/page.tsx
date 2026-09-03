import { obterSaas } from '@/content/saas';
import { SaasProductPage, metadadosSaas } from '@/components/projects/SaasProductPage';

const produto = obterSaas('foodelio');
export const metadata = metadadosSaas(produto);

export default function Page() {
  return <SaasProductPage produto={produto} />;
}
