import { describe, expect, it } from 'vitest';
import { BLOQUEADORES } from './blockers';
import { disponibilidadeVisivel, statusVisivel } from './estado-do-projeto';
import {
  estado,
  experimentos,
  hero,
  hipotese,
  instrumentos,
  laboratorio,
  metadados,
  origem,
  proximo,
  rodapeCopy,
} from './home';
import { documentosLegais } from './legal';
import { atalhosDeJogo, rodape } from './navigation';
import { contato, sobre } from './pages';
import { docalio, gramelio, projetos, revalio, rotasDoProjeto } from './projects';
import { site } from './site';
import { ROTAS_DE_LOJA } from '@/lib/routes';

/**
 * Estes testes protegem promessas, não estilo.
 *
 * Cada um trava uma regra de `CLAUDE.md` que, se quebrada, publicaria informação que o produto
 * não sustenta — e as lojas cobram exatamente isso.
 */

describe('projetos', () => {
  it('apresenta apenas os produtos reais do estúdio', () => {
    expect(projetos.map((projeto) => projeto.nome)).toEqual(['Revalio', 'Docalio', 'Gramelio']);
  });

  it('usa os banners finais aprovados, sem versão numerada', () => {
    /*
     * A medida é por jogo. Revalio e Docalio foram compostos em 1672×941; a arte do Gramelio
     * chegou em 1536×1024 e é usada como veio — recortar para uniformizar cortaria o título do
     * jogo, que é justamente o que `ASSETS_APROVADOS.md` proíbe.
     */
    const arte = {
      revalio: { src: '/projects/revalio/revalio-banner-final.png', largura: 1672, altura: 941 },
      docalio: { src: '/projects/docalio/docalio-banner-final.png', largura: 1672, altura: 941 },
      gramelio: { src: '/projects/gramelio/gramelio-banner-final.png', largura: 1536, altura: 1024 },
    };

    for (const projeto of projetos) {
      expect(projeto.banner).toMatchObject(arte[projeto.id]);
      expect(projeto.banner.src).not.toMatch(/-v\d|_\d+\./);
    }
  });

  it('dá a cada projeto rotas próprias de página, suporte, política, termos e exclusão', () => {
    for (const projeto of projetos) {
      const rotas = rotasDoProjeto[projeto.id];
      expect(rotas.pagina).toBe(`/projects/${projeto.id}`);
      expect(rotas.suporte).toBe(`/${projeto.id}/support`);
      expect(rotas.privacidade).toBe(`/${projeto.id}/privacy`);
      expect(rotas.termos).toBe(`/${projeto.id}/terms`);
      expect(rotas.exclusao).toBe(`/${projeto.id}/delete-account`);
    }
  });

  it('guarda a data de lançamento em um lugar só', () => {
    // O estado exibido é derivado dela; o campo `status` é o valor de antes do lançamento.
    expect(revalio.lancamento).toBe('2026-08-25');
    expect(revalio.status).toBe('EM DESENVOLVIMENTO');
    expect(docalio.lancamento).toBeUndefined();
    expect(gramelio.lancamento).toBeUndefined();
    expect(revalio.estado).toBe('ATIVO');
    expect(docalio.estado).toBe('EM FORMAÇÃO');
    expect(gramelio.estado).toBe('EM FORMAÇÃO');
  });

  it('não transforma disponibilidade em link antes de ter a URL da ficha', () => {
    // Um botão de loja que não abre a loja é pior do que a ausência dele.
    for (const projeto of projetos) {
      expect(projeto.disponibilidade).toHaveLength(2);
      for (const loja of projeto.disponibilidade) {
        if (loja.url === null) continue;
        expect(loja.url).toMatch(/^https:\/\//);
      }
    }
  });

  it('só anuncia "em breve" sem data', () => {
    for (const projeto of [docalio, gramelio]) {
      const texto = JSON.stringify(projeto.disponibilidade);
      expect(texto, projeto.nome).not.toMatch(/\d{4}|janeiro|fevereiro|mar[çc]o|trimestre/i);
    }
  });

  it('não anuncia plataforma sem prova', () => {
    // `INVENTARIO_RELEASE.md` registra que nenhum pacote de produção foi gerado.
    for (const projeto of projetos) {
      expect(projeto.plataformas).toEqual([]);
    }
  });

  it('não lista recursos do Docalio antes da aprovação para comunicação', () => {
    expect(docalio.recursos).toEqual([]);
  });

  it('nunca apresenta desenho de jogo como recurso de build', () => {
    /*
     * `recursos` é rotulado na página como "o que existe no build hoje" e `pilares` como desenho.
     * Um produto sem build não pode ter o primeiro preenchido — foi essa confusão que a separação
     * dos dois campos veio impedir.
     */
    for (const projeto of projetos) {
      const temBuild = projeto.disponibilidade.some((loja) => loja.estado === 'disponivel');
      if (!temBuild) expect(projeto.recursos, projeto.nome).toEqual([]);
    }

    expect(gramelio.recursos).toEqual([]);
    expect(gramelio.pilares?.length).toBeGreaterThan(0);
  });

  it('só descreve recursos do Revalio confirmados no build auditado', () => {
    const titulos = revalio.recursos.map((recurso) => recurso.titulo);
    expect(titulos).toEqual(['Trilhas', 'Atividades', 'Revisão', 'Progressão', 'Ritmo']);
  });

  it('usa o ícone de loja de cada jogo, quadrado e sem alt duplicado', () => {
    for (const projeto of projetos) {
      expect(projeto.icone.src).toBe(`/projects/${projeto.id}/${projeto.id}-icon-512.png`);
    }
    for (const projeto of projetos) {
      expect(projeto.icone.tamanho).toBe(512);
      // O nome do jogo aparece no mesmo link; descrever o ícone criaria leitura dupla.
      expect(projeto.icone.alt).toBe('');
    }
  });

  it('deriva os atalhos de escolha de jogo da mesma fonte tipada dos projetos', () => {
    expect(atalhosDeJogo.map((atalho) => atalho.rotulo)).toEqual([
      'Revalio',
      'Docalio',
      'Gramelio',
    ]);
    for (const atalho of atalhosDeJogo) {
      const projeto = projetos.find((item) => item.nome === atalho.rotulo);
      expect(atalho.estado).toBe(projeto?.status);
      expect(atalho.icone.src).toBe(projeto?.icone.src);
    }
  });

  it('mantém a galeria vazia enquanto não houver mídia selecionada pelo titular', () => {
    for (const projeto of projetos) {
      expect(projeto.galeria).toEqual([]);
      expect(BLOQUEADORES[projeto.galeriaBloqueador]).toBeDefined();
    }
  });

  it('carrega o aviso educacional/médico obrigatório', () => {
    expect(revalio.aviso).toMatch(/não realiza diagnóstico/i);
    expect(revalio.aviso).toMatch(/não garante aprovação/i);
    expect(docalio.aviso).toMatch(/ficcionais/i);
    expect(docalio.aviso).toMatch(/não oferece diagnóstico/i);
  });

  it('avisa que o Gramelio ainda não é um aplicativo distribuído', () => {
    // O jogo não é médico; o risco aqui é outro — parecer um app que já dá para baixar.
    expect(gramelio.aviso).toMatch(/não existe build público/i);
    expect(gramelio.aviso).toMatch(/ficcionais/i);
    expect(gramelio.notaCurta).toMatch(/desenvolvimento/i);
  });

  it('só afirma estar nas lojas quando está', () => {
    /*
     * A frase deixou de ser proibida e virou condicional: ela é verdadeira para o Revalio desde
     * 18/08/2026 e continua proibida para qualquer produto sem publicação confirmada.
     */
    const afirmaLoja = /dispon[ií]vel na App Store|dispon[ií]vel no Google Play|baixe (na|no)/i;
    for (const projeto of projetos) {
      const texto = [projeto.descricao, projeto.introducao, projeto.metaDescricao, projeto.ogDescricao].join(' ');
      const publicado = projeto.disponibilidade.some((loja) => loja.estado === 'disponivel');
      if (!publicado) {
        expect(texto, `${projeto.nome} afirma estar em loja sem publicação confirmada`).not.toMatch(
          afirmaLoja,
        );
      }
    }
  });

  it('não promete lançamento, multiplayer, IA generativa ou situações infinitas', () => {
    const proibido =
      /multiplayer|IA generativa|geração infinita|situações infinitas|lançamento em/i;
    for (const projeto of projetos) {
      const texto = [
        projeto.descricao,
        projeto.introducao,
        projeto.notaCurta,
        projeto.metaDescricao,
        ...projeto.manifesto,
        ...projeto.recursos.map((recurso) => `${recurso.titulo} ${recurso.texto}`),
      ].join(' ');
      expect(texto).not.toMatch(proibido);
    }
  });
});

/** As sete seções da home, na ordem em que a página as apresenta. */
const secoesDaHome = [laboratorio, experimentos, estado, hipotese, origem, instrumentos, proximo];

describe('idioma da interface', () => {
  /*
   * Decisão do titular em 17/08/2026: a interface é toda em português. Estas eram as frases e os
   * rótulos em inglês da versão anterior — nenhum deles pode voltar por descuido de edição.
   */
  const inglesAposentado = [
    'Build strange things',
    'Make them matter',
    'Some ideas need a laboratory',
    'Two games. One question',
    'The lab is active',
    'Learning doesn’t have to feel like studying',
    'Curiosity became a career change',
    'Tools change',
    'These are the first experiments',
    'A game about becoming a better doctor',
    'Every patient changes the story',
    'Have something strange in mind',
    'IN DEVELOPMENT',
    'ENTER THE LAB',
    'SYSTEM ONLINE',
    'EXPLORE REVALIO',
    'DISCOVER DOCALIO',
    'FOLLOW THE SIGNAL',
    'ALL SYSTEMS NOMINAL',
    'ACTIVE EXPERIMENTS',
    'LIVE STATUS',
    'HYPOTHESIS',
    'INSTRUMENTS',
    'OPEN END',
    'SIGNAL LOST',
    'CONTAINMENT FAILURE',
    'EXPERIMENT 0',
  ];

  it('não traz de volta os textos em inglês da versão anterior', () => {
    const conteudo = JSON.stringify({
      hero,
      secoes: secoesDaHome,
      rodapeCopy,
      metadados,
      projetos,
      sobre,
      contato,
    });
    for (const frase of inglesAposentado) {
      expect(conteudo, `"${frase}" voltou ao conteúdo`).not.toContain(frase);
    }
  });

  it('mantém a marca e os nomes próprios intactos', () => {
    // Traduzir a interface não traduz nome de produto nem de loja.
    expect(site.nome).toBe('Blajeen Labs');
    expect(revalio.nome).toBe('Revalio');
    expect(docalio.nome).toBe('Docalio');
  });
});

describe('seções da home', () => {
  it('segue a ordem numerada do plano mestre', () => {
    const indices = secoesDaHome.map((secao) => secao.indice.split(' / ')[0]);
    expect(indices).toEqual(['01', '02', '03', '04', '05', '06', '07']);
  });

  it('não repete âncora entre seções', () => {
    const ids = secoesDaHome.map((secao) => secao.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('faz o botão do hero apontar para uma seção que existe', () => {
    const destino = hero.cta.href.replace('#', '');
    expect(secoesDaHome.some((secao) => secao.id === destino)).toBe(true);
  });

  it('deriva o estado dos projetos da data de lançamento', () => {
    // Antes do lançamento o Revalio é "em desenvolvimento"; a partir dele, "disponível".
    const vespera = new Date('2026-08-24T12:00:00Z');
    const noDia = new Date('2026-08-25T12:00:00Z');

    expect(statusVisivel(revalio, vespera)).toBe('EM DESENVOLVIMENTO');
    expect(statusVisivel(revalio, noDia)).toBe('DISPONÍVEL');
    // O Docalio não tem data, então nunca vira disponível sozinho.
    expect(statusVisivel(docalio, noDia)).toBe('EM DESENVOLVIMENTO');
  });

  it('não anuncia loja antes da data de lançamento', () => {
    const vespera = disponibilidadeVisivel(revalio, new Date('2026-08-24T12:00:00Z'));
    expect(vespera.every((loja) => loja.estado === 'em-breve')).toBe(true);

    const noDia = disponibilidadeVisivel(revalio, new Date('2026-08-25T12:00:00Z'));
    expect(noDia.every((loja) => loja.estado === 'disponivel')).toBe(true);
  });
});

describe('documentos legais', () => {
  it('mantém as páginas de exclusão a um clique do rodapé, e nomeadas', () => {
    // As lojas exigem que a exclusão seja pública e direta, sem passar pela política.
    const destinos = rodape.dados.links.map((link) => link.href);
    for (const projeto of projetos) {
      expect(destinos).toContain(`/${projeto.id}/delete-account`);
    }
    // O rótulo do subgrupo é o que diz o que acontece ali.
    expect(rodape.dados.titulo.toLowerCase()).toContain('excluir');
  });

  it('mantém a palavra "excluir" explícita no título de cada página de exclusão', () => {
    const exclusoes = documentosLegais.filter((documento) => documento.kind === 'exclusao');
    // Uma por produto: as lojas cobram a página de exclusão de cada aplicativo.
    expect(exclusoes).toHaveLength(projetos.length);
    for (const documento of exclusoes) {
      expect(documento.titulo.toLowerCase()).toContain('excluir');
    }
  });

  it('cobre todas as rotas exigidas pelas lojas', () => {
    const rotas = documentosLegais.map((documento) => documento.rota).sort();
    expect(rotas).toEqual([...ROTAS_DE_LOJA].sort());
  });

  it('não publica campo entre colchetes', () => {
    for (const documento of documentosLegais) {
      const texto = JSON.stringify(documento);
      expect(texto, `${documento.rota} contém campo entre colchetes`).not.toMatch(
        /\[[A-ZÀ-Ú][A-ZÀ-Ú\s/ÇÃÕÉÍÓÚÂÊÔ]{3,}\]/,
      );
    }
  });

  it('se declara versão de trabalho enquanto houver revisão jurídica pendente', () => {
    for (const documento of documentosLegais) {
      expect(documento.estado).toBe('preparacao');
    }
  });

  it('marca todo bloqueador citado como bloqueador conhecido', () => {
    for (const documento of documentosLegais) {
      for (const secao of documento.secoes) {
        for (const bloco of secao.blocos) {
          if (bloco.tipo === 'pendente') {
            expect(BLOQUEADORES[bloco.bloqueador], `${documento.rota}/${secao.id}`).toBeDefined();
          }
        }
      }
    }
  });

  it('não descreve fluxo de conta do Docalio como existente', () => {
    const docalioDocs = documentosLegais.filter((documento) => documento.produto === 'Docalio');
    expect(docalioDocs.length).toBeGreaterThan(0);
    for (const documento of docalioDocs) {
      const texto = JSON.stringify(documento);
      // O caminho de menu não existe no build auditado: descrevê-lo seria instrução falsa.
      expect(texto).not.toMatch(/Conta e privacidade → Excluir conta/);
    }
  });

  it('dá ao Gramelio as quatro páginas de produto, com o canal do próprio jogo', () => {
    const paginas = documentosLegais.filter((documento) => documento.produto === 'Gramelio');
    expect(paginas.map((documento) => documento.kind).sort()).toEqual([
      'exclusao',
      'privacidade',
      'suporte',
      'termos',
    ]);
    // O endereço foi confirmado pelo titular em 20/08/2026; até então a página mostrava
    // "Em definição". O que o teste trava é que ele saiu de `site.ts`, e não do padrão dos outros.
    expect(site.emailGramelio.definido).toBe(true);
  });

  it('usa somente os canais confirmados, e o canal certo em cada produto', () => {
    const esperado: Record<string, string> = {
      Revalio: 'contato.revalio@gmail.com',
      Docalio: 'contato.docalio@gmail.com',
      Gramelio: 'contato.gramelio@gmail.com',
      'Blajeen Labs': 'brg.ftw@gmail.com',
    };

    for (const documento of documentosLegais) {
      for (const secao of documento.secoes) {
        for (const bloco of secao.blocos) {
          if (bloco.tipo !== 'contato' || !bloco.email.definido) continue;

          // O suporte central lista os três canais; as demais páginas usam o do próprio produto.
          const permitidos =
            documento.rota === '/support'
              ? Object.values(esperado)
              : [esperado[documento.produto]!];

          expect(permitidos, `${documento.rota}/${secao.id}`).toContain(bloco.email.valor);
        }
      }
    }
  });
});

describe('identidade do estúdio', () => {
  it('mantém bloqueados os dados que dependem de decisão humana', () => {
    expect(site.titular.definido).toBe(false);
    expect(site.documento.definido).toBe(false);
    expect(site.endereco.definido).toBe(false);
    expect(site.prazoExclusao.definido).toBe(false);
    expect(site.canalLgpd.definido).toBe(false);
  });

  it('tem um canal confirmado por produto, cada um com a fonte registrada', () => {
    const canais = [
      { campo: site.emailEstudio, valor: 'brg.ftw@gmail.com' },
      { campo: site.emailRevalio, valor: 'contato.revalio@gmail.com' },
      { campo: site.emailDocalio, valor: 'contato.docalio@gmail.com' },
      { campo: site.emailGramelio, valor: 'contato.gramelio@gmail.com' },
    ];

    for (const canal of canais) {
      expect(canal.campo.definido).toBe(true);
      if (canal.campo.definido) {
        expect(canal.campo.valor).toBe(canal.valor);
        expect(canal.campo.fonte.length).toBeGreaterThan(0);
      }
    }
  });

  it('não reintroduz o endereço fictício do protótipo', () => {
    const todos = JSON.stringify([site, ...documentosLegais]);
    expect(todos).not.toMatch(/hello@blajeenlabs\.com/);
  });

  it('não apresenta o estúdio como agência ou consultoria', () => {
    expect(site.descricao).not.toMatch(/agência|consultoria|software house|SaaS/i);
    // O posicionamento nomeia o que o estúdio faz: software próprio, jogos à frente.
    expect(site.posicionamento).toMatch(/DESENVOLVIMENTO DE SOFTWARE/);
    expect(site.posicionamento).toMatch(/JOGOS/);
  });
});
