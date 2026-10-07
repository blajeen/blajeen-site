import type { CorId, VersaoId, Vista } from './tipos';

/**
 * O carro da demonstração: Jaecoo 5, SUV compacto híbrido da Omoda | Jaecoo, à venda no Brasil
 * desde 01/10/2026. Pedido do titular (07/10/2026): demonstração para a Comeri Omoda, que pediu
 * carros chineses para atrair clientes.
 *
 * Tudo aqui é público e vem das fontes no fim do arquivo (lançamento de 30/09/2026). Os tons das
 * cores são aproximações para o 3D, não a amostra de fábrica. O do Azul Gaia foi medido na foto de
 * divulgação do porta-malas (a lataria azul), para o 3D e as fotos dos pontos mostrarem o mesmo
 * azul ("deixa as cores iguais das fotos dos carros", pedido do titular em 07/10/2026). Os preços
 * são os de lançamento divulgados pela marca: na loja, valem os da tabela do dia (a demonstração
 * diz isso).
 */

/**
 * A loja para quem a demonstração foi preparada (pedido do titular, 07/10/2026). Fica aqui, num
 * módulo comum, porque a página (servidor) e a demonstração (cliente) usam o mesmo nome.
 */
export const LOJA = 'Comeri Omoda';

export type Cor = {
  id: CorId;
  nome: string;
  /** Tom aproximado, em sRGB, para a pintura do 3D e a amostra da interface. */
  hex: string;
  /** No Prestige, esta cor vem com o teto pintado de preto. */
  tetoPretoNoPrestige: boolean;
};

export type Versao = {
  id: VersaoId;
  nome: string;
  preco: {
    /** Preço promocional do primeiro lote (3.600 unidades). */
    lancamento: number;
    /** Preço anunciado para depois do primeiro lote. */
    depois: number;
  };
  /** Itens de série. No Prestige, só o que ele soma ao Comfort. */
  itens: readonly string[];
  /** O que muda no 3D (quando o modelo tem a peça). */
  noTresD: { tetoPanoramico: boolean; rackDeTeto: boolean; faroisFullLed: boolean };
};

/**
 * Um ponto de toque no carro: a interface o desenha sobre o 3D (posição vem do manifesto do
 * modelo) e o repete numa lista, para teclado e leitor de tela. `texto` por versão; `null` quando
 * a versão não tem o item.
 */
export type PontoDeToque = {
  id: string;
  rotulo: string;
  vista: Vista;
  texto: Readonly<Record<VersaoId, string | null>>;
  /**
   * Um ponto que faz uma coisa em vez de abrir o balão: o "+" na porta leva para dentro do carro
   * (pedido do titular, 07/10/2026: "coloca um + na porta como alternativa para entrar no carro").
   */
  acao?: 'entrar';
};

export type ItemDaFicha = { rotulo: string; valor: string };

export type Fonte = { rotulo: string; url: string };

export type Carro = {
  id: 'jaecoo-5';
  marca: string;
  nome: string;
  resumo: string;
  ficha: readonly ItemDaFicha[];
  cores: readonly Cor[];
  versoes: readonly Versao[];
  pontos: readonly PontoDeToque[];
  lancamento: { inicioDasVendas: string; primeiroLote: number; divulgadoEm: string };
  fontes: readonly Fonte[];
};

export const JAECOO_5: Carro = {
  id: 'jaecoo-5',
  marca: 'Jaecoo',
  nome: 'Jaecoo 5',
  resumo: 'SUV compacto híbrido pleno, de 224 cv.',
  ficha: [
    { rotulo: 'Conjunto híbrido', valor: '224 cv e 30,1 kgfm' },
    { rotulo: 'Motor a gasolina', valor: '1.5 turbo, 135 cv e 20,4 kgfm' },
    { rotulo: 'Motor elétrico', valor: '204 cv e 31,6 kgfm' },
    { rotulo: 'Câmbio', valor: 'Híbrido dedicado (1DHT)' },
    { rotulo: 'Bateria', valor: '1,83 kWh' },
    { rotulo: '0 a 100 km/h', valor: '7,9 s' },
    { rotulo: 'Velocidade máxima', valor: '175 km/h' },
    { rotulo: 'Consumo homologado', valor: '15,5 km/l na cidade e 13,7 km/l na estrada' },
    { rotulo: 'Autonomia', valor: 'Perto de 1.000 km por tanque, segundo a marca' },
    { rotulo: 'Comprimento', valor: '4.380 mm' },
    { rotulo: 'Largura', valor: '1.860 mm' },
    { rotulo: 'Altura', valor: '1.650 mm' },
    { rotulo: 'Entre-eixos', valor: '2.620 mm' },
    { rotulo: 'Porta-malas', valor: '410 l (1.214 l com o banco traseiro rebatido)' },
    { rotulo: 'Garantia', valor: '7 anos; bateria e sistema elétrico, 8 anos' },
  ],
  cores: [
    { id: 'branco-arctic', nome: 'Branco Arctic', hex: '#e6e8e6', tetoPretoNoPrestige: true },
    { id: 'preto-andromeda', nome: 'Preto Andromeda', hex: '#15171b', tetoPretoNoPrestige: false },
    { id: 'cinza-centaurus', nome: 'Cinza Centaurus', hex: '#6c7075', tetoPretoNoPrestige: false },
    { id: 'azul-gaia', nome: 'Azul Gaia', hex: '#435a8a', tetoPretoNoPrestige: false },
  ],
  versoes: [
    {
      id: 'comfort',
      nome: 'Comfort',
      preco: { lancamento: 154_990, depois: 159_990 },
      itens: [
        'Rodas de liga leve de 18"',
        'Faróis halógenos com luz diurna de LED e acendimento automático',
        'Sensor de chuva',
        'Painel de instrumentos digital de 8"',
        'Multimídia de 9"',
        'Som com 4 alto-falantes',
        'Ar-condicionado digital de duas zonas',
        'Câmera de ré',
        '6 airbags',
        'Freio de estacionamento eletrônico com Auto Hold',
        'Piloto automático',
        'Partida por botão',
        'Controle de estabilidade e Isofix',
        'Bancos de tecido',
      ],
      noTresD: { tetoPanoramico: false, rackDeTeto: false, faroisFullLed: false },
    },
    {
      id: 'prestige',
      nome: 'Prestige',
      preco: { lancamento: 179_990, depois: 184_990 },
      itens: [
        'Faróis full LED',
        'Teto panorâmico fixo de 1,45 m²',
        'Rack de teto',
        'Multimídia de 13,2"',
        'Painel de instrumentos digital de 8,8"',
        'Som Sony com 8 alto-falantes',
        'Interior revestido de couro',
        'Bancos dianteiros com ajuste elétrico e ventilação',
        'Porta-malas com abertura elétrica',
        'Câmeras 360°',
        'Carregador de celular por indução de 50 W',
        'Chave presencial e luz ambiente personalizável',
        'Retrovisores com rebatimento automático',
        'Sensor de estacionamento dianteiro',
        'Pacote ADAS 2.5, com 17 assistências à condução',
      ],
      noTresD: { tetoPanoramico: true, rackDeTeto: true, faroisFullLed: true },
    },
  ],
  pontos: [
    {
      id: 'farois',
      rotulo: 'Faróis',
      vista: 'fora',
      texto: { comfort: 'Halógenos, com luz diurna de LED.', prestige: 'Full LED.' },
    },
    { id: 'rodas', rotulo: 'Rodas', vista: 'fora', texto: { comfort: 'Liga leve de 18".', prestige: 'Liga leve de 18".' } },
    { id: 'entrar', rotulo: 'Entrar no carro', vista: 'fora', texto: { comfort: 'Ver por dentro.', prestige: 'Ver por dentro.' }, acao: 'entrar' },
    { id: 'teto', rotulo: 'Teto panorâmico', vista: 'fora', texto: { comfort: null, prestige: 'Fixo, de 1,45 m².' } },
    {
      id: 'portaMalas',
      rotulo: 'Porta-malas',
      vista: 'fora',
      texto: { comfort: '410 l; 1.214 l com o banco rebatido.', prestige: '410 l, com abertura elétrica.' },
    },
    { id: 'multimidia', rotulo: 'Multimídia', vista: 'dentro', texto: { comfort: 'Tela de 9".', prestige: 'Tela de 13,2".' } },
    { id: 'painel', rotulo: 'Painel digital', vista: 'dentro', texto: { comfort: 'Tela de 8".', prestige: 'Tela de 8,8".' } },
    {
      id: 'bancos',
      rotulo: 'Bancos',
      vista: 'dentro',
      texto: { comfort: 'De tecido.', prestige: 'De couro; os da frente com ajuste elétrico e ventilação.' },
    },
    { id: 'carregador', rotulo: 'Carregador', vista: 'dentro', texto: { comfort: null, prestige: 'Por indução, de 50 W.' } },
    {
      id: 'volante',
      rotulo: 'Assistências à condução',
      vista: 'dentro',
      texto: { comfort: 'Piloto automático.', prestige: 'Pacote ADAS 2.5, com 17 assistências.' },
    },
    { id: 'luzAmbiente', rotulo: 'Luz ambiente', vista: 'dentro', texto: { comfort: null, prestige: 'Personalizável, no painel e nas portas.' } },
    { id: 'som', rotulo: 'Som', vista: 'dentro', texto: { comfort: '4 alto-falantes.', prestige: 'Sony, com 8 alto-falantes.' } },
    { id: 'cambio', rotulo: 'Câmbio', vista: 'dentro', texto: { comfort: 'Automático, híbrido dedicado (1DHT).', prestige: 'Automático, híbrido dedicado (1DHT).' } },
  ],
  lancamento: { inicioDasVendas: '2026-10-01', primeiroLote: 3600, divulgadoEm: '2026-09-30' },
  fontes: [
    {
      rotulo: 'Vrum: lançamento, versões e preços',
      url: 'https://www.vrum.com.br/mercado/2026/09/7510652-jaecoo-5-e-lancado-em-duas-versoes-tem-mais-de-mil-km-de-autonomia-e-custa-entre-rs-154-mil-rs-179-mil.html',
    },
    {
      rotulo: 'O Tempo: preço e conjunto híbrido',
      url: 'https://www.otempo.com.br/autotempo/2026/9/30/jaecoo-5-chega-ao-brasil-a-partir-de-r-154-990-com-motor-hibrido-de-224-cv',
    },
    {
      rotulo: 'Tribuna: ficha e equipamentos',
      url: 'https://www.tribunapr.com.br/noticias/automoveis/novo-jaecoo-5-chega-hibrido-com-224-cv-e-preco-a-partir-de-r-159-mil/',
    },
    {
      rotulo: 'Auto+: itens de série das duas versões',
      url: 'https://www.automaistv.com.br/segredos/exclusivo-descobrimos-versoes-do-jaecoo-5-e-todos-os-itens-de-serie/',
    },
    {
      rotulo: 'Comprecar: equipamentos da Prestige, com a luz ambiente personalizável',
      url: 'https://www.comprecar.com.br/revista/jaecoo-5-chega-ao-brasil-a-partir-de-r-154990',
    },
  ],
};

export function corPorId(carro: Carro, id: CorId): Cor {
  return carro.cores.find((c) => c.id === id) ?? carro.cores[0]!;
}

export function versaoPorId(carro: Carro, id: VersaoId): Versao {
  return carro.versoes.find((v) => v.id === id) ?? carro.versoes[0]!;
}

/** A cor desta versão tem o teto preto? (Branco Arctic no Prestige.) */
export function temTetoPreto(carro: Carro, versao: VersaoId, cor: CorId): boolean {
  return versao === 'prestige' && corPorId(carro, cor).tetoPretoNoPrestige;
}
