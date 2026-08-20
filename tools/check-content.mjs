/**
 * Portão de conteúdo.
 *
 * Confere três coisas que nenhum lint pega:
 *
 * 1. nenhum campo entre colchetes vazou dos rascunhos para o conteúdo publicado;
 * 2. os projetos fictícios do protótipo não voltaram para a implementação;
 * 3. o site não está prestes a ir ao ar com bloqueador humano em aberto.
 *
 * Em desenvolvimento ele apenas lista os bloqueadores. Com `SITE_PUBLICACAO=1` — o modo que a
 * publicação deve usar — ele falha enquanto houver bloqueador aberto ou domínio indefinido.
 *
 *   node tools/check-content.mjs
 *   SITE_PUBLICACAO=1 node tools/check-content.mjs
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const RAIZ = process.cwd();
const CONTEUDO = path.join(RAIZ, 'src', 'content');

const PUBLICACAO = process.env.SITE_PUBLICACAO === '1';

/** Projetos fictícios do protótipo. Não podem existir na implementação final. */
const FICCIONAIS = ['Oracle Without a Name', 'The Last Signal', 'Synthetic Memory'];

/** Endereço fictício herdado do protótipo. */
const ENDERECO_DO_PROTOTIPO = 'hello@blajeenlabs.com';

const erros = [];
const avisos = [];

async function arquivosDe(diretorio) {
  const entradas = await readdir(diretorio, { withFileTypes: true });
  const arquivos = [];
  for (const entrada of entradas) {
    const completo = path.join(diretorio, entrada.name);
    if (entrada.isDirectory()) arquivos.push(...(await arquivosDe(completo)));
    else if (entrada.name.endsWith('.ts') || entrada.name.endsWith('.tsx')) arquivos.push(completo);
  }
  return arquivos;
}

const fontes = [
  ...(await arquivosDe(CONTEUDO)),
  ...(await arquivosDe(path.join(RAIZ, 'src', 'components'))),
  ...(await arquivosDe(path.join(RAIZ, 'src', 'app'))),
];

/**
 * Marca as linhas que são comentário de código.
 *
 * Um comentário pode — e deve — citar o endereço fictício do protótipo ou um campo de rascunho
 * para explicar por que ele não é usado. O que não pode é isso chegar à interface.
 */
function linhasDeComentario(texto) {
  const linhas = texto.split(/\r?\n/);
  const comentario = new Array(linhas.length).fill(false);
  let dentroDeBloco = false;

  for (const [indice, linha] of linhas.entries()) {
    const aparado = linha.trim();
    if (dentroDeBloco) {
      comentario[indice] = true;
      if (aparado.includes('*/')) dentroDeBloco = false;
      continue;
    }
    if (aparado.startsWith('//') || aparado.startsWith('*')) {
      comentario[indice] = true;
      continue;
    }
    if (aparado.startsWith('/*')) {
      comentario[indice] = true;
      if (!aparado.includes('*/')) dentroDeBloco = true;
    }
  }

  return comentario;
}

for (const arquivo of fontes) {
  const texto = await readFile(arquivo, 'utf8');
  const relativo = path.relative(RAIZ, arquivo);
  const comentario = linhasDeComentario(texto);

  // Campos entre colchetes em texto de interface. Comentários de código estão liberados.
  for (const [numero, linha] of texto.split(/\r?\n/).entries()) {
    if (comentario[numero]) continue;
    const semComentario = linha.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const colchetes = semComentario.match(/\*\*\[[A-ZÀ-Ú][^\]]*\]\*\*|'[^']*\[[A-ZÀ-Ú]{3}[^\]]*\][^']*'/);
    if (colchetes) {
      erros.push(`${relativo}:${numero + 1} — campo entre colchetes em conteúdo: ${colchetes[0].slice(0, 70)}`);
    }
  }

  for (const ficticio of FICCIONAIS) {
    if (texto.includes(ficticio)) {
      erros.push(`${relativo} — projeto fictício do protótipo presente: ${ficticio}`);
    }
  }

  // O endereço fictício do protótipo pode ser citado em comentário, nunca em conteúdo.
  for (const [numero, linha] of texto.split(/\r?\n/).entries()) {
    if (comentario[numero] || !linha.includes(ENDERECO_DO_PROTOTIPO)) continue;
    erros.push(
      `${relativo}:${numero + 1} — endereço do protótipo (${ENDERECO_DO_PROTOTIPO}) fora de comentário`,
    );
  }
}

// -------------------------------------------------------------- bloqueadores

const blockers = await readFile(path.join(CONTEUDO, 'blockers.ts'), 'utf8');
const idsDeBloqueador = [...blockers.matchAll(/^ {2}([a-zA-Z]+): \{$/gm)].map((achado) => achado[1]);

/*
 * Todo bloqueador declarado está, por definição, em aberto: ele sai de `blockers.ts` quando a
 * decisão humana existir. O que se confere aqui é se cada um chega a alguma tela — um bloqueador
 * que ninguém referencia é um bloqueador que o site esconde.
 */
const abertos = idsDeBloqueador;
// Verificado em infraestrutura (DNS e certificado), não referenciado por nenhuma tela.
const usados = new Set(['dominioAtivo']);

for (const arquivo of fontes) {
  if (path.basename(arquivo) === 'blockers.ts') continue;
  const texto = await readFile(arquivo, 'utf8');
  for (const id of idsDeBloqueador) {
    if (texto.includes(`'${id}'`) || texto.includes(`"${id}"`)) usados.add(id);
  }
}

for (const id of idsDeBloqueador.filter((valor) => !usados.has(valor))) {
  avisos.push(`bloqueador '${id}' está declarado mas nenhuma tela o referencia`);
}

// ------------------------------------------------------------------- domínio

// O domínio definitivo está gravado em `src/content/site.ts`; a variável só sobrescreve.
const site = await readFile(path.join(CONTEUDO, 'site.ts'), 'utf8');
const dominioNoCodigo = site.match(/const DOMINIO = '([^']+)'/)?.[1];
const dominioDefinido = Boolean(dominioNoCodigo);

// ------------------------------------------------------------------ relatório

console.log('Portão de conteúdo — Blajeen Labs\n');

if (abertos.length > 0) {
  console.log(`Bloqueadores humanos em aberto (${abertos.length}), exibidos no site como "Em definição":`);
  for (const id of abertos) console.log(`  - ${id}`);
  console.log('\nRegistro completo: docs/DECISOES_ANTES_DE_PUBLICAR.md\n');
}

console.log(
  dominioDefinido
    ? `Domínio: ${process.env.NEXT_PUBLIC_SITE_URL ?? dominioNoCodigo}` +
        (process.env.NEXT_PUBLIC_SITE_URL ? ' (sobrescrito por NEXT_PUBLIC_SITE_URL)' : '') +
        '\n'
    : 'Domínio: nenhum definido em src/content/site.ts.\n',
);

for (const aviso of avisos) console.warn(`aviso: ${aviso}`);
for (const erro of erros) console.error(`erro: ${erro}`);

if (erros.length > 0) {
  console.error(`\nReprovado: ${erros.length} problema(s) de conteúdo.`);
  process.exit(1);
}

if (PUBLICACAO) {
  const impedimentos = [];
  if (abertos.length > 0) impedimentos.push(`${abertos.length} bloqueador(es) humano(s) em aberto`);
  if (!dominioDefinido) impedimentos.push('NEXT_PUBLIC_SITE_URL não definido');

  if (impedimentos.length > 0) {
    console.error('\nSITE_PUBLICACAO=1 e o site NÃO está pronto para ir ao ar:');
    for (const impedimento of impedimentos) console.error(`  - ${impedimento}`);
    process.exit(1);
  }
  console.log('Pronto para publicação: nenhum bloqueador humano em aberto.');
} else {
  console.log('Conteúdo consistente. Rode com SITE_PUBLICACAO=1 para checar prontidão de publicação.');
}
