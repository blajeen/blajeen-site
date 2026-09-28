import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WikiAbout, WikiCompare, WikiList } from '@/components/morvelio/Wiki';
import { WIKI, ICON, categories, type Query } from '@/content/morvelio/wiki/registry';
import { metadadosDaRota } from '@/lib/metadata';

type Props = { params: Promise<{ category: string }>; searchParams: Promise<Query> };
const special: Record<string,string> = { busca:'Busca', comparar:'Comparar equipamento', sobre:'Sobre a wiki', atualizacoes:'Atualizações da wiki' };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const {category}=await params;
  const title=special[category]??categories.find(c=>c.id===category)?.title;
  if(!title)notFound();
  const meta=metadadosDaRota({titulo:`${title} — Morvelio Wiki`,descricao:`Consulte ${title.toLocaleLowerCase('pt-BR')} no universo de Morvelio, com fontes e estado de cada informação.`,rota:`${WIKI}/${category}`,imagem:ICON});
  if(category==='busca'||category==='comparar')meta.robots={index:false,follow:true};
  return meta;
}
export default async function Page({params,searchParams}:Props){
  const {category}=await params;const query=await searchParams;
  if(category==='sobre')return <WikiAbout/>;
  if(category==='atualizacoes')return <WikiAbout updates/>;
  if(category==='comparar')return <WikiCompare query={query}/>;
  if(category==='busca')return <WikiList query={query}/>;
  if(!categories.some(c=>c.id===category))notFound();
  return <WikiList category={category} query={query}/>;
}
