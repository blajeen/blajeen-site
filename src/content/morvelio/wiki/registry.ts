import raw from './data.json';

export const WIKI = '/morvelio/wiki';
export const ICON = '/projects/morvelio/morvelio-icon-montanha-nome-v04.webp';
export const categories = [
  { id: 'classes', title: 'Classes', symbol: 'Ⅰ', description: 'Sete maneiras de enfrentar Velidor.' },
  { id: 'habilidades', title: 'Habilidades e talentos', symbol: '✦', description: 'Ataques, especiais e caminhos de evolução.' },
  { id: 'itens', title: 'Itens e equipamentos', symbol: '◇', description: 'Armas, broches, recursos e obtenção.' },
  { id: 'receitas', title: 'Receitas da forja', symbol: '⌁', description: 'Materiais, requisitos e o ofício de Bento.' },
  { id: 'missoes', title: 'Missões', symbol: '!', description: 'Siga objetivos, requisitos e recompensas.' },
  { id: 'personagens', title: 'Personagens', symbol: '♙', description: 'Quem vive, trabalha e guarda histórias no reino.' },
  { id: 'criaturas', title: 'Criaturas e chefes', symbol: '♜', description: 'Encontros, habitats e padrões de ataque.' },
  { id: 'regioes', title: 'Regiões', symbol: '⌖', description: 'Os caminhos e lugares da campanha.' },
  { id: 'dungeons', title: 'Dungeons', symbol: '▱', description: 'Cova Alva, Grande Roda e Castelo.' },
  { id: 'reinos', title: 'Cinco reinos', symbol: '♛', description: 'Casas reais e territórios de Erdávia.' },
  { id: 'guias', title: 'Guias de aventura', symbol: '≡', description: 'Comece, aprenda e prepare a próxima travessia.' },
  { id: 'cronicas', title: 'Crônicas', symbol: '◈', description: 'Orbe, famílias e eras. Você controla os spoilers.' },
  { id: 'mundo', title: 'Atlas de Erdávia', symbol: '◎', description: 'Dois continentes e um mundo de histórias.' },
] as const;
export type Category = (typeof categories)[number]['id'];
export type Section = { title: string; paragraphs?: string[]; headers?: string[]; rows?: string[][]; spoiler: number };
export type Entry = {
  id: string; category: string; slug: string; title: string; summary: string;
  scope: string; status: string; spoiler: number; kind: string; className: string;
  region: string; rarity: string; level: number | null; aliases: string[];
  facts: { label: string; value: string }[]; sections: Section[];
  sources: { title: string; edition: string; locator: string }[];
  image?: { src: string; alt: string; caption: string; width: number; height: number };
};
export const entries = raw.records as Entry[];
export const relations = raw.relations;
export const edition = raw.edition;
const byId = new Map(entries.map(e => [e.id, e]));
export const getEntry = (id: string) => byId.get(id);
export const entryPath = (e: Entry) => `${WIKI}/${e.category}/${e.slug}`;
export const categoryName = (id: string) => categories.find(c => c.id === id)?.title ?? id;
export const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
export type Query = Record<string, string | string[] | undefined>;
export const value = (q: Query, key: string) => typeof q[key] === 'string' ? q[key] as string : '';
export const values = (q: Query, key: string): string[] => Array.isArray(q[key]) ? q[key] as string[] : value(q,key) ? [value(q,key)] : [];
export function spoilerLevel(q: Query): number {
  const v = value(q, 'spoilers'); return ['1', '2', '3'].includes(v) ? Number(v) : 0;
}
export function scoped(path: string, level: number): string {
  return level ? `${path}${path.includes('?') ? '&' : '?'}spoilers=${level}` : path;
}
export function queryUrl(path: string, q: Query, change: Record<string, string>): string {
  const p = new URLSearchParams();
  for (const k of Object.keys(q)) for (const v of values(q,k)) if(v) p.append(k,v);
  for (const [k, v] of Object.entries(change)) { if (v) p.set(k, v); else p.delete(k); }
  return `${path}${p.size ? '?' + p.toString() : ''}`;
}
export function related(e: Entry, level: number) {
  const found = new Map<string, { entry: Entry; label: string }>();
  for (const r of relations) {
    const id = r.from === e.id ? r.to : r.to === e.id ? r.from : '';
    const target = byId.get(id);
    if (target && target.spoiler <= level) found.set(target.id, { entry: target, label: r.from === e.id ? r.label : r.inverse });
  }
  return [...found.values()];
}
export function listEntries(q: Query, category?: string) {
  const level = spoilerLevel(q); const search = normalize(value(q, 'q')).slice(0, 160);
  const chosenCategory = category ?? value(q, 'categoria');
  const base = entries.filter(e => (!chosenCategory || e.category === chosenCategory) && e.spoiler <= level);
  const filtered = base.filter(e => {
    const text = normalize([e.title, e.summary, ...e.aliases, e.kind, e.className].join(' '));
    if (search && !search.split(/\s+/).every(t => text.includes(t))) return false;
    for (const [key, field] of [['tipo','kind'],['classe','className'],['regiao','region'],['raridade','rarity'],['estado','status'],['escopo','scope']] as const) {
      const selected = values(q,key);
      const universal = key==='classe' && e.category==='itens' && e.kind==='Broche';
      if (selected.length && !selected.includes(e[field]) && !universal) return false;
    }
    const min = value(q, 'nivel');
    if (min && /^\d+$/.test(min) && (e.level === null || e.level < Number(min))) return false;
    const max = value(q, 'ate');
    if (max && /^\d+$/.test(max) && (e.level === null || e.level > Number(max))) return false;
    return true;
  });
  const rank = (e: Entry) => normalize(e.title) === search ? 0 : e.aliases.some(a => normalize(a) === search) ? 1 : normalize(e.title).startsWith(search) ? 2 : 3;
  filtered.sort((a,b) => {
    if (value(q,'ordem') === 'nivel') return (a.level ?? Infinity) - (b.level ?? Infinity) || a.title.localeCompare(b.title,'pt-BR');
    if (search && value(q,'ordem') !== 'nome') return rank(a)-rank(b) || a.title.localeCompare(b.title,'pt-BR');
    return a.title.localeCompare(b.title,'pt-BR');
  });
  const pages = Math.max(1, Math.ceil(filtered.length/25));
  const requested = Number(value(q,'pagina'));
  const page = Math.max(1, Math.min(pages, Number.isFinite(requested) ? Math.floor(requested) : 1));
  return { base, results: filtered.slice((page-1)*25,page*25), total: filtered.length, pages, page, hidden: entries.filter(e=>(!chosenCategory || e.category===chosenCategory)&&e.spoiler>level).length };
}
export const wikiPaths = () => [WIKI, ...categories.map(c => `${WIKI}/${c.id}`), `${WIKI}/sobre`, `${WIKI}/atualizacoes`, ...entries.map(entryPath)];
