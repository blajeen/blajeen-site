"""Build reviewed wiki records from the PO's Desktop edition and matching structured sources.
Never copies raw PDF/Unity/agent files into public. Re-running replaces only generated wiki data.
Usage: python tools/morvelio-wiki/import.py --desktop <Morvelio - Documentação> --game C:/dev/morvelio
"""
from pathlib import Path
import argparse, json, re, hashlib, unicodedata, collections
from pypdf import PdfReader

p=argparse.ArgumentParser()
p.add_argument('--desktop',required=True); p.add_argument('--game',required=True)
a=p.parse_args(); desktop=Path(a.desktop); game=Path(a.game)
root=Path(__file__).resolve().parents[2]; out=root/'src/content/morvelio/wiki'
out.mkdir(parents=True,exist_ok=True)
base=game/'docs/consulta/fontes'; direction=desktop/'Direção atual'
def read(name): return json.loads((base/(name+'.json')).read_text(encoding='utf-8-sig'))
H=read('hero_npc_data'); E=read('enemy_data'); Q=read('questline_data')
pdfs={}; manifest=[]
for f in sorted(desktop.glob('0[1-8]_*.pdf')):
    corresponding=game/'docs/consulta'/f.name
    digest=hashlib.sha256(f.read_bytes()).hexdigest()
    assert corresponding.exists() and hashlib.sha256(corresponding.read_bytes()).hexdigest()==digest, f'Edition mismatch: {f.name}'
    pdfs[int(f.name[:2])]=(f.stem.split('_',2)[-1].replace('_',' '),[x.extract_text() or '' for x in PdfReader(f).pages])
    manifest.append({'file':f.name,'sha256':digest,'pages':len(pdfs[int(f.name[:2])][1])})
def slug(v): return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',v).encode('ascii','ignore').decode().lower()).strip('-')
def clean(v):
    s=str(v or '').replace('herói','aventureiro').replace('heróis','aventureiros').replace('Herói','Aventureiro')
    return re.sub(r'\s+',' ',s).strip()
def source(vol,label=''):
    title,pages=pdfs[vol]; found=next((i+1 for i,t in enumerate(pages) if label and label.casefold() in t.casefold()),None)
    return {'title':f'Volume {vol:02} · {title}','edition':'24/09/2026' if vol==1 else '27/09/2026' if vol in (4,5) else '26/09/2026','locator':f'p. {found}' if found else 'Edição de consulta'}
def normsource(file,title):return {'title':title,'edition':'27/09/2026','locator':f'Direção atual · {file}'}
classsource=normsource('01','Classes, origens e nome'); itemsource=normsource('03','Catálogo de itens'); broochsource=normsource('02','Broches e gemas')
records=[]; links=[]; images=[]; omissions=[]
def add(id,category,title,summary,vol=2,**extra):
    x={'id':id,'category':category,'slug':slug(title),'title':clean(title),'summary':clean(summary),'scope':'Mobile','status':'Documentado','spoiler':0,'kind':'','className':'','region':'','rarity':'','level':None,'facts':[],'sections':[],'sources':[source(vol,title)],'aliases':[]}
    x.update(extra); records.append(x); return x
def facts(x,**values):x['facts'] += [{'label':k.replace('_',' '),'value':clean(v)} for k,v in values.items() if v is not None and v!='']
def section(x,title,text,spoiler=0):x['sections'].append({'title':title,'paragraphs':[clean(t) for t in (text if isinstance(text,list) else [text]) if t],'spoiler':spoiler})
def table(x,title,heads,rows,spoiler=0):
    if rows:x['sections'].append({'title':title,'headers':heads,'rows':[[clean(v) for v in row] for row in rows],'spoiler':spoiler})
def link(a,b,label,inverse):
    if b and re.fullmatch(r'quest\.([DW])\d{2}–[DW]\d{2}',b):
        k=b[6]; start,end=map(int,re.findall(r'\d+',b))
        for i in range(start,end+1):link(a,f'quest.{k}{i:02}',label,inverse)
        return
    if a and b and a!=b:links.append({'from':a,'to':b,'label':label,'inverse':inverse})
def image(x,path,folder='icons',caption='Ilustração de referência do jogo',width=512):
    if path.exists():
        dest=f'/projects/morvelio/wiki/{folder}/{slug(x["id"])}.webp'
        x['image']={'src':dest,'alt':x['title'],'caption':caption,'width':width,'height':width}
        images.append({'source':str(path),'output':dest,'width':width,'entity':x['id']})

# Classes: normative names and weapon families override legacy portraits/equipment text.
classes=[('brann','Cavaleiro','Espada'),('rurik','Bárbaro','Machados'),('nara','Ladina','Adaga'),('lyra','Maga','Cajado solar'),('sylren','Patrulheira','Arco'),('elowen','Druida','Cajado natural'),('torvik','Engenheiro','Martelo')]
class_ids={}; class_names={}; active={h['slug']:h for h in H['heroes'][:7]}
for key,name,weapon in classes:
    h=active[key]; cid='class.'+key; class_ids[h['id']]=cid; class_names[h['id']]=name
    x=add(cid,'classes',name,h['function'],kind=h['role'],className=name)
    x['sources'].insert(0,classsource)
    facts(x,Arma=weapon,Estilo=h['role'],Alcance_básico=f'{h["basic_range_m"]} m',Nível_máximo='50 · edição de combate')
    section(x,'Seu aventureiro',f'{name} é uma classe. O nome do personagem é escolhido pelo jogador. A origem determina a raça, sem bônus de combate: humanos de Velidor, Caldria e Sahram; anões de Durnagal; elfos de Orissel. Esta criação de identidade é direção aprovada, ainda em implementação.')
    image(x,game/f'Assets/Morvelio/UI/Portraits/Generated/mvl_avatar_{key}_v03.png','portraits','Retrato ilustrado da classe',384)
    for ability in h['abilities']:
        y=add(ability['id'],'habilidades',ability['displayName'],ability['mechanics'],className=name,kind=['Ataque básico','Habilidade automática','Especial'][ability['kind']])
        y['slug']+='-'+slug(name)
        facts(y,Classe=name,Tipo=y['kind'],Recarga=f'{ability["cooldownSeconds"]} s' if ability['cooldownSeconds'] else 'Sem recarga própria',Raio=f'{ability["radiusMeters"]} m' if ability['radiusMeters'] else None)
        section(y,'Como funciona',ability['mechanics']);link(cid,y['id'],'Habilidade','Classe')
    for t in h['talents']:
        y=add(t['id'],'habilidades',t['name'],t['effect'],className=name,kind='Talento',level=t['minimum_level'])
        y['slug']+='-'+slug(name)+'-'+t['node'].lower()
        facts(y,Classe=name,Nível_mínimo=t['minimum_level'],Graduações=t['max_rank'],Pontos_anteriores=t['earlier_points'],Ramo=t['node'],Assinatura_exclusiva='Sim' if t['exclusive_signature'] else 'Não')
        section(y,'Efeito documentado',t['effect']);link(cid,y['id'],'Talento','Classe')
        if t['prerequisite']:link(y['id'],'talent.'+key+'.'+t['prerequisite'].lower(),'Requer talento','Libera talento')
    section(x,'Progressão',h['milestone_description'])

# Regions, rooms and quest relations use the localized edition, not asset filenames.
regionids={}; descriptions={
'1':'A entrada de Ourim, onde o contrato de Morvelio dá início à jornada.', '1.1':'O refúgio da estrada real: treino, descanso e uma casa para tornar sua.',
'2':'Vila de ofícios, com o moinho, a ponte e a forja de Bento Ferrolume.', '2.1':'O embarque de madeira junto ao rio.', '2.2':'Um ponto de vigia que liga a vila às trilhas adiante.',
'3':'A antiga reserva real, agora passagem para a descida da Cova Alva.', '3.2':'Uma mina de escoras e contrapesos, ligada ao trabalho de Olavo.',
'4':'A travessia a bordo da Nau Andorinha.', '5':'O porto de Velidor, entre navegadores, cargas e histórias do reino.', '5.1':'Um farol da Vigília que ainda guarda os sinais do Norte.',
'6':'O complexo mecânico construído depois da queda, com máquinas e passagens industriais.', '6.1':'Uma passagem de serviço junto à Grande Roda.',
'7':'A fronteira militar nas Marcas Rubras.', '7.1':'A torre que vigia o caminho pelas Marcas.', '8':'A antiga sede real na Serra Alva, ocupada pelo poder das sombras.', '8.1':'Um posto de vigia diante da ameaça que permanece.'}
for rid in Q['world_route']:
    name=Q['regions'][rid]; x=add('region.'+rid,'regioes',name,descriptions[rid],vol=4,region=name,kind='Campanha')
    regionids[rid]=x['id']; facts(x,Reino='Velidor',Local=rid)
    link(x['id'],'kingdom.velidor','Reino','Lugar')
    if rid=='8.1':x['spoiler']=1
for d in E['dungeons']:
    rid=d['mapId']; name=Q['regions'][rid]; family='Cova Alva' if rid.startswith('C') else 'A Grande Roda'
    x=add('region.'+rid,'dungeons',name,f'{family} · sala {d["mapIndex"]}. '+'. '.join(d['sectorNames'])+'.',region=family,kind='Caverna' if rid.startswith('C') else 'Factory')
    regionids[rid]=x['id']; facts(x,Sala=rid,Masmorra=family,Missão=d['questId'])
    table(x,'Objetivos da sala',['Objetivo','Etapa'],[(o['label'],o['sector']+1) for o in d['objectives']])
    section(x,'Retorno ao refúgio','O portal do refúgio conecta a expedição ao acampamento. A abertura dos acessos depende das condições da jornada; revelar um território não libera automaticamente a passagem.')
    link(x['id'],'quest.'+d['questId'],'Missão','Dungeon');link(x['id'],'region.3' if rid.startswith('C') else 'region.6','Entrada','Acesso à dungeon')
for d in E['castle']:
    rid=d['map']; x=add('region.'+rid,'dungeons',Q['regions'][rid],f'Castelo de Velidor · ala {int(rid[1:])} de dez. Uma etapa da travessia da antiga sede real.',region='Castelo de Velidor',kind='Castelo',spoiler=2 if rid in ('M08','M09','M10') else 0)
    regionids[rid]=x['id'];facts(x,Ala=rid,Encontros=len(d['encounters']));link(x['id'],'region.8','Entrada','Ala do Castelo')
    table(x,'Sequência de encontros',['Encontro','Grupos'],[(f'Encontro {i+1}',len(c['batches'])) for i,c in enumerate(d['encounters'])])

for q in Q['quests']:
    qid=q['Id']; late=qid.startswith('J') and int(qid[1:])>=47
    sp=2 if late and int(qid[1:])<=58 else 1 if late or qid[0] in 'DW' else 0
    x=add('quest.'+qid,'missoes',q['title_ptBR'],q['offer_ptBR'] or q['title_ptBR'],vol=3,slug=qid.lower()+'-'+slug(q['title_ptBR']),kind={'principal':'Principal','opcional':'Opcional','diaria':'Diária','semanal':'Semanal'}[q['category']],region=Q['regions'].get(q['Region'],q['Region']),spoiler=sp,aliases=[qid])
    reward=q['reward'];facts(x,Missão=qid,Tipo=x['kind'],Local=x['region'],Oferecida_por=q['giver_ptBR'],Ouro=reward.get('gold'),XP_nominal=reward.get('xp_nominal'),Fragmentos_de_Luz=reward.get('light_fragments'))
    section(x,'O pedido',q['offer_ptBR']);section(x,'Entrega',q['turnin_ptBR'],max(1,sp))
    table(x,'Objetivos',['Etapa','O que fazer','Quantidade','Local'],[(i+1,o.get('instruction_ptBR') or o.get('label_ptBR') or o['Title'],o['RequiredCount'],Q['regions'].get(o['Region'],x['region'])) for i,o in enumerate(q['Objectives'])])
    for pre in q['Requires']:link(x['id'],'quest.'+pre,'Requisito','Próxima missão')
    for objective in q['Objectives']:
        link(x['id'],regionids.get(objective['Region']),'Objetivo em','Missão no local')
    link(x['id'],regionids.get(q['Region']),'Local','Missão')
    if q.get('RequiresActiveOrClaimed'):section(x,'Condição de acesso','A missão anterior pode estar ativa ou já entregue. Confira o objetivo rastreado antes de procurar a passagem.')
    if qid=='J13':section(x,'A ponte','A passagem abre depois de encaixar a peça no moinho e girar a manivela durante J13. A travessia faz parte da própria missão; não é necessário entregar J13 antes de cruzar.')

# NPCs: public introductions stay separate from plot revelations.
for n in H['local_npcs']:
    x=add('npc.'+n['id'],'personagens',n['name'],n['role'],region=Q['regions'].get(n['region_id'],n['region_name']),kind='Morador')
    section(x,'No lugar',n['function']);facts(x,Papel=n['role'],Local=x['region']);link(x['id'],regionids.get(n['region_id']),'Local','Personagem')
    for q in n.get('related_quests',[]):link(x['id'],'quest.'+q,'Oferece missão','Personagem relacionado')
safe_npc={
'Morvelio':('O conselheiro que oferece um contrato a quem chega a Velidor. Sua história está ligada ao Orbe.',0),
'Kael':('Um integrante da Vigília que orienta a jornada e guarda passagens do reino.',0),
'Aldren':('Navegador, tio de Marenne e estudioso das relíquias antigas. Procura notícias da sobrinha no porto.',0),
'Operária da Feira':('Uma presença ligada ao trabalho e à travessia pela Grande Roda.',0),
'Aprendiz':('Uma figura da jornada cuja participação se esclarece ao atravessar o Castelo.',1),
'Clérigas da Luz':('Ligadas à princesa e à história da corte de Velidor.',1),
'Marenne':('A princesa de Velidor, filha da casa real. Sua história atravessa a queda do reino.',0)}
for n in H['narrative_npcs']:
    summary,sp=safe_npc[n['name']]; x=add('npc.'+n['id'],'personagens',n['name'],summary,kind='Personagem da história',spoiler=sp)
    section(x,'Participação na campanha',n['function'],2)
    for q in n.get('related_quests',[]):link(x['id'],'quest.'+q,'Participa da missão','Personagem relacionado')
bento=next(x['id'] for x in records if x['category']=='personagens' and x['title'].startswith('Bento'))
for q in Q['quests']:
    for n in records:
        if n['category']=='personagens' and q['giver_ptBR']==n['title']:link(n['id'],'quest.'+q['Id'],'Oferece missão','Personagem relacionado')

# Normative catalog from Desktop. Objective counters and closed commercial packs are not items.
catalog=(direction/'03_Catalogo_de_itens.md').read_text(encoding='utf-8')
brooch_effects={}
for row in (direction/'02_Broches_e_gemas.md').read_text(encoding='utf-8').splitlines():
    cells=[v.strip().replace('`','') for v in row.strip().strip('|').split('|')]
    if len(cells)==5 and cells[0].startswith('item.') and 'brooch' in cells[0]:brooch_effects[cells[0]]=cells[2]
auras={'training':'Sem aura','guard':'Azul-aço','scout':'Verde-claro','spring':'Turquesa','thorns':'Vermelho-escuro','vigor':'Âmbar','wind':'Branco-ciano','platinum':'Prata','sacred':'Dourado'}
iconfiles={f.stem:f for f in (game/'Assets/Morvelio/UI/Icons').rglob('*.png') if 'Sheets~' not in str(f)}
for line in catalog.splitlines():
    if not line.startswith('| '):continue
    cells=[x.strip().replace('`','') for x in line.strip().strip('|').split('|')]
    if len(cells)!=8 or not re.match(r'(item\.|currency\.|food\.|decor\.|quest\.|pack\.)',cells[0]):continue
    id,title,en,rarity,origin,cost,effect,state=cells
    effect=brooch_effects.get(id,effect)
    if id.startswith(('quest.','pack.')):
        omissions.append({'id':id,'reason':'Objetivo de missão ou oferta comercial fechada; não é uma peça equipável.'});continue
    future='.weapon.' in id and any('.'+g+'.' in id for g in ['ruby','sapphire','aquamarine','topaz','amber','quartz','emerald'])
    kind='Broche' if 'brooch' in id else 'Arma' if 'weapon' in id else 'Moeda' if id.startswith('currency.') else 'Comida' if id.startswith('food.') else 'Decoração'
    cn=next((name for hid,name in class_names.items() if id.endswith(hid)),'')
    status='Planejado' if future or any(s in state.lower() for s in ['propost','alterar','ausente','migrar']) or kind=='Broche' else 'Documentado'
    x=add(id,'itens',title,effect,vol=5,kind=kind,className=cn,rarity=rarity if rarity in ['Inicial','Comum','Incomum','Raro','Épico','Sagrado'] else '',status=status,sources=[itemsource,source(5,title)])
    facts(x,Tipo=kind,Classe=cn or 'Todas / sem restrição de classe documentada',Efeito=effect,Origem=origin,Custo=cost,Raridade=x['rarity'])
    section(x,'Obtenção',origin)
    if future:section(x,'Afinidade elemental','As gemas elementais são minerais naturais. Não são a moeda premium nem fragmentos arrancados do Orbe. Receitas ainda não definidas permanecem sem preço de aquisição.')
    if kind=='Broche':
        facts(x,Aura=auras['training' if id=='item.training.brooch' else id.split('.')[-1]])
        section(x,'Como aparece','O broche não aparece como acessório no corpo. Sua aura é discreta; o broche de treino não produz aura. Apenas um broche pode ser equipado por aventureiro.')
        x['sources'].insert(0,broochsource)
    if id in iconfiles:image(x,iconfiles[id])
    for hid,cid in class_ids.items():
        if id.endswith(hid):link(x['id'],cid,'Classe compatível','Equipamento')
    for qid in re.findall(r'\b[JODW]\d{2}\b',origin):link(x['id'],'quest.'+qid,'Desbloqueio','Libera equipamento')
    if 'Bento' in origin:
        recipe=add('recipe.'+id,'receitas','Forjar '+title,'Receita documentada para '+title+'.',vol=5,status='Planejado',className=cn,kind='Forja',sources=[itemsource])
        facts(recipe,Resultado=title,Custo=cost,Forjador='Bento Ferrolume',Requisito=origin)
        section(recipe,'Forja de Bento','A direção de Platina e Sagrado depende da técnica antiga preservada por Bento. A receita desta edição é planejada e substitui custos legados; não representa uma compra disponível hoje.')
        link(recipe['id'],id,'Resultado','Receita');link(recipe['id'],bento,'Forjador','Forja')
        if 'Sombra' in cost:link(recipe['id'],'currency.shadow_fragment','Ingrediente','Usado na receita')
        if 'Luz' in cost:link(recipe['id'],'currency.light_fragment','Ingrediente','Usado na receita')
        for qid in re.findall(r'\b[JODW]\d{2}\b',origin):link(recipe['id'],'quest.'+qid,'Requisito','Libera receita')

# Boss attack values are kept per encounter, without inventing HP or drop probabilities.
def attackrows(attacks):
    rows=[]
    for i,at in enumerate(attacks):
        t=at.get('telegraph') or {}; name=at.get('displayName','')
        if '_' in name or name.startswith('attack.'):name=f'Padrão {i+1}'
        rows.append([name,at.get('phase',0)+1,str(at.get('cooldownSeconds','—'))+' s',str(t.get('windupSeconds','—'))+' s',str(t.get('damageCoefficient','—'))+' × Poder',t.get('element','—')])
    return rows
for d in E['dungeons']:
    for b in d['bosses']:
        id=b['id']+'.'+d['mapId'];x=add(id,'criaturas',b.get('localized_name') or b['displayName'],'Chefe encontrado em '+Q['regions'][d['mapId']]+'.',kind='Chefe',region=Q['regions'][d['mapId']])
        x['slug']+='-'+d['mapId'].lower();facts(x,Local=x['region'],HP=b.get('hp'),Encontro=d['mapId'])
        table(x,'Padrões de ataque',['Ataque','Fase','Recarga','Preparação','Dano','Elemento'],attackrows(b.get('attack_definitions',[])))
        section(x,'Leitura do encontro','Observe a área anunciada antes do impacto. Os valores desta ficha pertencem a esta sala e à edição de combate consultada; não são universais para outras dificuldades.')
        link(id,regionids[d['mapId']],'Encontro em','Chefe')
for d in E['castle']:
    b=d['boss'];x=add(b['id'],'criaturas',d['localized_name'],'Chefe da ala '+d['map']+' do Castelo de Velidor.',kind='Chefe',region=Q['regions'][d['map']],spoiler=2 if d['map'] in ['M08','M09','M10'] else 0)
    facts(x,Ala=d['map'],Local=x['region'],HP='Não documentado como valor único nesta ficha')
    table(x,'Padrões de ataque',['Ataque','Fase','Recarga','Preparação','Dano','Elemento'],attackrows(d['attacks']))
    link(x['id'],regionids[d['map']],'Encontro em','Chefe')
for e in E['enemy_definitions']:
    x=add(e['id'],'criaturas',e['displayName'],'Criatura do elenco de combate de Velidor.',kind='Monstro')
    if e.get('isWarden'):section(x,'Papel no encontro','Esta criatura é identificada como guardiã na edição de combate. Recompensas e estatísticas variam conforme o encontro; não há chance de drop publicada nesta ficha.')
    for d in E['castle']:
        if any(z['enemyId']==e['id'] for z in d['pool']):link(x['id'],regionids[d['map']],'Encontrado em','Criatura')
for e in E['regional_creatures']:
    title=e['model']+' · '+e['family'];x=add('regional.'+e['subject'],'criaturas',title,e['temperament']+' · '+e['biome']+'.',kind='Fauna' if 'neutra' in e['temperament'].lower() else 'Criatura regional',region=Q['regions'].get(e['primary_node'],e['biome']))
    facts(x,Comportamento=e['temperament'],Ambiente=e['biome'],Localização=e['micro_area'])
    section(x,'Identificação','O título conserva o nome de referência da criatura no volume de produção. Não é um nome próprio novo de personagem. Sua presença regional e a variante de elite são registradas separadamente.')
    if e['elite_name']:facts(x,Variante_de_elite=e['elite_name'])
    section(x,'Uso previsto na região',e['quest_use'])
    for pl in e.get('placements',[]):link(x['id'],regionids.get(pl['region']),'Habitat','Criatura regional')

# Curated public guides and world texts: no internal implementation prose is published.
kingdoms=[
('velidor','Velidor','Dervan','Humano','Ardel','O reino do Sorne, das vilas de ofício e do castelo na Serra Alva. É o território da campanha mobile.','01_VELIDOR.png'),
('caldria','Caldria','Valcera','Humano','Ardel','Ao sul de Velidor, outro reino humano sustenta sua própria corte, caminhos e disputas. Sua história pertence à saga de Erdávia.','02_CALDRIA.png'),
('durnagal','Durnagal','Granveio','Anão','Namar','Um reino anão de montanhas, minas, galerias e trabalho de forja. Sua arquitetura acompanha a pedra e a defesa dos acessos.','03_DURNAGAL.png'),
('sahram','Sahram','Namaris','Humano','Namar','O pequeno reino do deserto vive de reservatórios, canais, hortas e rotas de caravana. A água define sua vida cotidiana.','04_SAHRAM.png'),
('orissel','Orissel','Sevandor','Elfo','Ilha isolada','Bosques antigos, falésias e ancoradouros vigiados protegem o reino élfico. O acesso ao interior permanece controlado.','05_ORISSEL.png')]
atlas=desktop/'Mapas e atlas/Atlas dos cinco reinos'
for key,name,house,race,continent,summary,png in kingdoms:
    x=add('kingdom.'+key,'reinos',name,summary,vol=4,scope='Saga',kind='Reino')
    facts(x,Casa_real=house,Raça=race,Localização=continent)
    section(x,'Reino e campanha','A presença deste reino na história e na escolha de origem não significa um território jogável liberado no mobile. A campanha de Velidor e as futuras adaptações da saga possuem escopos diferentes.')
    image(x,atlas/png,'maps','Carta ilustrada do atlas de Erdávia; não é captura de gameplay',1600)
    link(x['id'],'world.erdavia','Mundo','Reino')
x=add('world.erdavia','mundo','Erdávia','Dois continentes, cinco reinos e um mar que conecta caminhos, famílias e eras.',vol=4,scope='Saga',kind='Atlas')
image(x,atlas/'00_ERDAVIA.png','maps','Carta ilustrada de Erdávia; rotas representativas da saga',1800)
section(x,'Travessias','Ardel e Namar são ligados pela navegação no Mar das Duas Margens e por corredores sazonais de zepelins. As viagens precisam de portos, amarração, tripulação e manutenção. Orissel não é uma parada comercial de acesso livre.')
section(x,'Como ler o atlas','As cartas apresentam a geografia e a identidade de cada reino. Não são mapas de viagem disponíveis no aplicativo. As distâncias e coordenadas não devem ser medidas como escala real quando a carta não a declarar.')
guides=[
('primeiros-passos','Primeiros passos em Velidor','Do contrato ao refúgio, aprenda o ritmo da jornada.',[
('Um aventureiro, uma jornada','A campanha é solo. Escolha uma das sete classes e conheça sua arma, sua habilidade automática e seu especial. A direção atual permite nome próprio e origem; confira o estado de implementação na edição usada.'),
('Mover, marcar e agir','Arraste em uma área livre da tela para se mover. Um toque curto no inimigo marca o alvo. O básico e a habilidade acontecem automaticamente; o especial depende da sua decisão e de estar pronto.'),
('Siga o objetivo','Converse com Morvelio na Portela de Ourim. A missão rastreada indica o próximo passo; portas e travessias dependem de cumprir os objetivos, não apenas de visitar o mapa.')]),
('combate','Combate e leitura dos ataques','Movimento, alvo e preparação dos golpes importam tanto quanto o poder.',[
('Ataques anunciados','A área no chão avisa onde o golpe vai acontecer. O tempo de preparação aparece nas fichas de chefes quando documentado. Sair dessa área antes do impacto é parte central do combate.'),
('Alvo e especial','Só um inimigo fica marcado por vez. Marcar outro troca a prioridade. O indicador AUTO informa a habilidade automática; ele não é um segundo botão de ataque.'),
('Pausa e retirada','O menu e as janelas da interface pausam o combate na edição de regras. Segurar RETIRAR encerra a tentativa. Consulte a versão do jogo antes de interpretar os números das fichas.')]),
('equipamento','Armas e broches','Dois espaços, duas decisões para o seu aventureiro.',[
('Arma','A família de arma pertence à classe. Madeira, bronze, ferro, prata, platina e sagrado compõem a direção base; elementos são uma expansão identificada separadamente.'),
('Broche','O broche ocupa o segundo espaço, com efeito próprio. Não muda a roupa nem aparece como peça física: manifesta uma aura leve, exceto o treino. Apenas um pode estar equipado.'),
('Antes de comparar','Observe efeito, requisitos e custo, além do estado da ficha. Uma receita aprovada ainda pode estar pendente de implementação. A cor da aura não acrescenta um segundo poder elemental.')]),
('forja','A forja de Bento','Platina, Luz e o ofício que atravessa gerações.',[
('O ferreiro','Bento Ferrolume guarda a técnica de reforjar os equipamentos de Platina e Sagrado na era mobile. Na saga, esse conhecimento continua por trabalho e estudo em sua família.'),
('Direção das receitas','A revisão indica 10 Fragmentos de Sombra para Platina; Sagrado combina 20 Sombra e 3 Luz. O acesso exige J29 e O19. Essas receitas substituem a regra legada de 20 Luz e estão marcadas como planejadas.'),
('Gemas','Rubi é fogo; safira, água; água-marinha, gelo; topázio, raio; âmbar, terra; quartzo, vento; esmeralda, veneno. Ônix ativo de sombra é reservado aos portadores corrompidos. Gemas premium não são esses minerais.')]),
('casa','Sua casa no acampamento','Um refúgio que ganha vida com o avanço da jornada.',[
('Começa vazia','A direção da casa prevê o interior inicialmente vazio. Ao entrar, o aventureiro acessa a loja para gastar ouro com a mobília.'),
('Comprar e encontrar no lugar','Cada decoração comprada aparece em uma posição estabelecida. Não há sistema de arrastar móveis ou escolher livremente o local de cada peça.'),
('Um espaço seguro','A casa pertence à rotina de descanso e personalização do refúgio. Seus detalhes não devem ser confundidos com encontros hostis ou tesouros aleatórios de dungeon.')]),
('progressao','Níveis, talentos e atributos','Entenda o que muda quando seu aventureiro evolui.',[
('Nível e experiência','A edição de combate documenta teto de nível 50. O total de XP para alcançar um nível N é 100 × (N − 1)². São 100 XP para nível 2, 8.100 para nível 10 e 240.100 para nível 50.'),
('Talentos','O total documentado é min(nível, 10) pontos de talento. Cada classe possui quatro ramos com pré-requisitos e graduações. As fichas de talento mostram nível mínimo e pontos anteriores.'),
('Atributos','A partir do nível 11, o total de pontos de atributo é max(0, nível − 10). Números de combate e progressão são da edição consultada, sujeitos ao balanceamento da versão jogável.')]),
('dungeons','Cova Alva, Grande Roda e Castelo','Três percursos, identidades e desafios distintos.',[
('A descida','Cova Alva reúne C1 a C5; a Grande Roda, P1 a P5. Cada sala tem objetivos, encontros e passagem para a seguinte. Consulte a missão associada antes de procurar a saída.'),
('O Castelo','M01 a M10 atravessam as alas da sede real. Os chefes têm padrões próprios, e suas fichas mostram os ataques documentados por encontro.'),
('Portais e acesso','Os acessos dependem dos marcos de missão. Revelar uma região não abre um portal. O portal do refúgio integra o retorno das salas C/P ao acampamento.')]),
('provacao','Provação e atividades recorrentes','O ciclo de desafios além da jornada principal.',[
('Vigília','Na sequência final da campanha, Kael conduz a Vigília. As diárias, semanais e atividades da Provação devem ser consultadas pela missão que as libera.'),
('Semanas e recompensas','A edição de missões contém sete diárias e quatro semanais. As fichas mostram seus requisitos e recompensas; não converter uma recompensa de missão em chance de drop de um inimigo.'),
('Saga futura','O ciclo de resistência dos quatro reinos é outro escopo de adaptação. Resgatar pessoas, interromper instalações e voltar ao abrigo são direções futuras, não um MMO disponível no mobile.')])]
for key,title,summary,sections in guides:
    x=add('guide.'+key,'guias',title,summary,vol=6,slug=key,kind='Guia',spoiler=1 if key=='provacao' else 0)
    if key in ['equipamento','forja','casa']:x['sources']=[source(5),itemsource]
    for t,b in sections:section(x,t,b)
    if key=='forja':link(x['id'],bento,'Conheça o forjador','Guia')
    if key=='casa':link(x['id'],'region.1.1','Refúgio','Guia')
for cid in class_ids.values():link('guide.progressao',cid,'Classe','Guia de progressão')
for x in records:
    if x['category']=='itens' and x['kind'] in ['Broche','Arma']:link(x['id'],'guide.equipamento','Guia','Equipamento descrito')
chronicles=[
('o-orbe','O Orbe','A força que atravessa a história de Morvelio.',0,[('Um achado no rio','No Remanso Fundo, Morvelio recolhe um Orbe escuro de brilho violeta. Esse encontro liga a vida do conselheiro ao destino de Velidor.'),('O preço do poder','O Orbe oferece poder e estabelece uma relação que cobra cada vez mais do portador. A extensão de sua influência pertence às revelações da saga.')]),
('os-vared','Os Vared','A família que preserva relatos e estuda o Orbe.',0,[('Aldren e os relatos','Aldren, tio da princesa, viu Morvelio com o Orbe e preservou o relato. Seus descendentes levam histórias e investigações por outros reinos.'),('Conhecimento com limites','Os Vared comparam registros, corrigem boatos e estudam as manifestações do Orbe. Conhecer a história não significa saber seu esconderijo nem possuir uma solução infalível.')]),
('os-ferrolume','Os Ferrolume','Uma tradição de forja que atravessa gerações.',0,[('Bento','Na era mobile, Bento domina a técnica antiga da Platina e do Sagrado. Seu ofício liga equipamento, relíquias e a vida de Vilarim.'),('Herança de trabalho','Na saga, filhos e netos preservam e transformam o conhecimento. O talento é transmitido por aprendizado e prática, não por exclusividade biológica.')]),
('era-do-caos','Crônicas da primeira era','A ocupação do trono e as tentativas de retomar Velidor.',2,[('O reino ocupado','Morvelio reina no castelo e sucessivas expedições fracassam. Camponeses, aventureiros e descendentes de famílias reais de outros reinos cruzam seus caminhos na tentativa de libertar Velidor.'),('Consequências','As perdas não se encerram no campo de batalha. Alteram sucessões, alianças, famílias e a memória que chega aos reinos vizinhos.')]),
('paz-e-sucessoes','Crônicas da paz','Libertação, reconstrução e vidas que continuam.',3,[('Odran','Um guerreiro portando uma arma de energia sagrada e elementos derrota Morvelio depressa o suficiente para impedir sua fuga. Sua alma fica presa no Orbe, que Odran esconde na vastidão do deserto.'),('A paz','A paz é real: portos, trabalho, famílias e sucessões desenvolvem o mundo. O esconderijo não é compartilhado; os historiadores não recebem sua localização.')]),
('segundo-portador','Crônicas do segundo portador','Uma nova geração entra na história do Orbe.',3,[('Noel','Um jovem de Sahram foge depois de brigar com os pais. Em uma tempestade, procura abrigo e encontra o Orbe, atraído por sua presença.'),('Ascensão','O treino, o reconhecimento e a obsessão pelo poder transformam o jovem. Suas escolhas conduzem a um regicídio e ao início de outra era de domínio.')]),
('quatro-coroas','Crônicas das quatro coroas','Domínio, resistência e os limites da vitória.',3,[('Quatro reinos','O Orbe acaba dominando os quatro reinos continentais. Orissel conserva soberania e oferece refúgio sob condições, sem se tornar um abrigo ilimitado.'),('Resistência persistente','Na adaptação futura, expedições rompem instalações, resgatam pessoas e retornam ao abrigo. Os resgatados continuam livres e as mortes históricas não são desfeitas. A recomposição do domínio depende de recursos e trabalho, não de um reinício que apaga toda consequência.')])]
for key,title,summary,sp,sections in chronicles:
    x=add('lore.'+key,'cronicas',title,summary,vol=4,slug=key,scope='Saga',kind='Crônica',spoiler=sp)
    for t,b in sections:section(x,t,b)
    link(x['id'],'world.erdavia','Mundo','Crônica')

# Plantas from the exact Desktop atlas: rasterize only diagrams, never production instructions.
support=[('CAMP','Acampamento','O ponto de preparação e retorno entre mapas.'),('HOME','Casa do aventureiro','Um interior inicialmente vazio; móveis comprados aparecem em posições estabelecidas.')]
for key,title,summary in support:
    x=add('region.'+key,'regioes',title,summary,vol=1,kind='Refúgio',status='Planejado')
    link(x['id'],'guide.casa','Guia','Lugar')
atlas_html=(desktop/'Mapas e atlas/Atlas/ATLAS.html').read_text(encoding='utf-8')
diagrams=root/'docs/morvelio-wiki/diagramas';diagrams.mkdir(parents=True,exist_ok=True)
for article in re.findall(r'<article\b[^>]*>.*?</article>',atlas_html,re.S):
    match=re.search(r'id="map-([^"]+)"',article)
    if not match:continue
    key=match.group(1);rid=key[1:].replace('_','.') if key.startswith('R') else key
    if key=='WORLD':continue
    x=next((e for e in records if e['id']=='region.'+rid),None)
    start=article.find('<svg');depth=0;end=None
    for tag in re.finditer(r'</?svg\b[^>]*>',article[start:]):
        depth+=-1 if tag.group().startswith('</') else 1
        if depth==0:end=start+tag.end();break
    if not x or start<0 or end is None:continue
    body=article[start:end]
    # ReportLab's HTML-embedded SVG has unescaped quotes inside style="...".
    # Normalize only local fragment URL syntax in our derived copy; source stays untouched.
    body=re.sub(r'url\("(#[^"]+)"\)',r'url(\1)',body)
    assert not re.search(r'<script|<!DOCTYPE|(?:href|src)=[\"\']https?://',body,re.I)
    path=diagrams/(key+'.svg');path.write_text(body,encoding='utf-8')
    image(x,path,'maps','Planta de composição proposta · grade e escala indicadas na imagem; não é captura da cena atual',1240)
    x['sources'].append(source(1,x['title']))
    section(x,'Sobre esta planta','A imagem é uma planta de produção, com composição e circulação propostas. Não deve ser usada como prova de posição exata no build atual. Os objetivos e vínculos abaixo vêm da edição de missões. Na casa, a mobília representa posições futuras após a compra; o interior começa vazio.') if key=='HOME' else section(x,'Sobre esta planta','Planta de produção com composição e circulação propostas. Não é uma captura do jogo nem prova de posição exata no build atual. Consulte os objetivos e vínculos da edição de missões para orientar a jornada.')

# Validate graph and uniqueness; preserve excluded catalog entries in a private report.
byid={x['id']:x for x in records};assert len(byid)==len(records),'Duplicate ID'
paths=[x['category']+'/'+x['slug'] for x in records]
collisions={k for k,v in collections.Counter(paths).items() if v>1}
for x in records:
    if x['category']+'/'+x['slug'] in collisions: x['slug']+='-'+slug(x['id'])
    if x['spoiler'] and x['category']=='missoes': x['slug']=x['aliases'][0].lower()
paths=[x['category']+'/'+x['slug'] for x in records];assert len(set(paths))==len(paths),'Duplicate slug'
validlinks=[];missing=[]
for l in links:
    if l['from'] in byid and l['to'] in byid:validlinks.append(l)
    else:missing.append(l)
assert not missing,missing[:10]
unique={json.dumps(l,sort_keys=True):l for l in validlinks}
data={'edition':'27/09/2026','records':records,'relations':list(unique.values())}
(out/'data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
private=root/'docs/morvelio-wiki';private.mkdir(parents=True,exist_ok=True)
(private/'ASSETS_IMPORTACAO.json').write_text(json.dumps(images,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
report={'edition':data['edition'],'pdfsMatched':manifest,'counts':dict(collections.Counter(x['category'] for x in records)),'records':len(records),'relations':len(unique),'omissions':omissions,'reconciliations':['Classes e armas atualizadas conforme Direção atual 01.','Broches, receitas e moedas conforme Direção atual 02/03; JSON legado de itens não publicado.','Relatos com desfechos isolados; missões tardias e chefes finais exigem spoilers.','Estatísticas documentadas não recebem selo de build atual.','Nomes de referência de fauna preservados como referências, sem canonização de nomes inventados.']}
(private/'RELATORIO_IMPORTACAO.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'records':len(records),'counts':report['counts'],'relations':len(unique),'assets':len(images)},ensure_ascii=False))
