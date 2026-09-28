import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { entries, relations, entryPath, getEntry, listEntries, related, spoilerLevel, wikiPaths } from './registry';

describe('Morvelio Wiki: integridade editorial e navegação', () => {
  it('mantém IDs, slugs e destinos únicos', () => {
    expect(new Set(entries.map(e=>e.id)).size).toBe(entries.length);
    expect(new Set(entries.map(entryPath)).size).toBe(entries.length);
    for(const r of relations){expect(getEntry(r.from),r.from).toBeDefined();expect(getEntry(r.to),r.to).toBeDefined();}
    expect(new Set(wikiPaths()).size).toBe(wikiPaths().length);
  });
  it('cobre as classes, missões, broches e salas da edição autorizada', () => {
    expect(entries.filter(e=>e.category==='classes').map(e=>e.title)).toEqual(['Cavaleiro','Bárbaro','Ladina','Maga','Patrulheira','Druida','Engenheiro']);
    expect(entries.filter(e=>e.category==='missoes')).toHaveLength(93);
    expect(entries.filter(e=>e.kind==='Broche')).toHaveLength(9);
    expect(entries.filter(e=>e.category==='dungeons')).toHaveLength(20);
    expect(entries.filter(e=>e.category==='reinos')).toHaveLength(5);
    expect(entries.filter(e=>e.category==='habilidades'&&e.kind==='Talento')).toHaveLength(112);
    expect(entries.some(e=>e.id.includes('item.armor.')||e.id.includes('weapon.onyx'))).toBe(false);
  });
  it('liga broche, requisito, forja e ingrediente pelos registros reais', () => {
    expect(related(getEntry('item.brooch.guard')!,0).some(r=>r.entry.id==='quest.J13')).toBe(true);
    const sacred=entries.find(e=>e.category==='receitas'&&e.title==='Forjar Broche Sagrado')!;
    expect(sacred).toBeDefined();
    expect(related(sacred,0).map(r=>r.entry.id)).toContain('currency.light_fragment');
    expect(related(sacred,0).some(r=>r.entry.title.includes('Bento'))).toBe(true);
  });
  it('busca sem acentos, por código e por efeito', () => {
    expect(listEntries({q:'cavaleiro'}).results[0]?.title).toBe('Cavaleiro');
    expect(listEntries({q:'J13'}).results[0]?.id).toBe('quest.J13');
    expect(listEntries({q:'esquiva'},'itens').results.some(e=>e.id==='item.brooch.scout')).toBe(true);
    expect(listEntries({q:'Barbaro'},'classes').total).toBe(1);
  });
  it('combina filtros e trata valores desconhecidos e páginas inválidas', () => {
    expect(listEntries({tipo:'Broche'},'itens').total).toBe(9);
    expect(listEntries({tipo:'Broche',classe:'Cavaleiro'},'itens').total).toBe(9);
    expect(listEntries({tipo:['Broche','Arma']},'itens').total).toBe(100);
    expect(listEntries({nivel:'7',ate:'10'},'habilidades').results.every(e=>e.level!==null&&e.level>=7&&e.level<=10)).toBe(true);
    expect(listEntries({nivel:'1'},'criaturas').total).toBe(0);
    expect(listEntries({pagina:'NaN'}).page).toBe(1);
    expect(listEntries({pagina:'-100'}).page).toBe(1);
    const last=listEntries({pagina:'999999'});expect(last.page).toBe(last.pages);
  });
  it('não revela registros protegidos na busca ou nas relações sem consentimento', () => {
    expect(spoilerLevel({spoilers:'999'})).toBe(0);
    expect(listEntries({q:'J57'}).total).toBe(0);
    expect(listEntries({q:'J57',spoilers:'2'}).total).toBeGreaterThan(0);
    for(const e of entries)expect(related(e,0).every(r=>r.entry.spoiler===0)).toBe(true);
  });
  it('fontes e imagens existem sem publicar caminhos de produção', () => {
    for(const e of entries){
      expect(e.sources.length).toBeGreaterThan(0);
      if(e.image){expect(existsSync(join(process.cwd(),'public',e.image.src)),e.image.src).toBe(true);expect(e.image.width).toBeGreaterThan(0);expect(e.image.height).toBeGreaterThan(0);}
      expect(JSON.stringify(e)).not.toMatch(/C:[\\/]|Assets[\\/]|\.prefab|\.cs\b/);
    }
  });
  it('não permite ciclos de pré-requisitos entre missões', () => {
    const edges=relations.filter(r=>r.label==='Requisito'&&r.from.startsWith('quest.'));
    const visit=(id:string,seen:Set<string>)=>{expect(seen.has(id),id).toBe(false);const next=new Set(seen).add(id);for(const r of edges.filter(r=>r.from===id))visit(r.to,next);};
    for(const e of entries.filter(e=>e.category==='missoes'))visit(e.id,new Set());
  });
});
