-- Loja: os exemplos saem de "Em breve" para "Sob encomenda", com o preço sugerido e as imagens novas.
--
-- Só toca no que ainda está como o catálogo nasceu: produto em "Em breve" com todos os preços
-- zerados. O que o titular já mudou no painel fica como está. As imagens novas moram nos mesmos
-- endereços (`public/loja/exemplos`); aqui muda só a descrição delas (o `alt`), e só nas imagens
-- que ainda são as do catálogo. Os valores são os de `src/lib/loja/exemplos.ts`.

WITH sugerido (slug, fisico, digital) AS (VALUES
  ('boneco-3d-revalio', 14990, 14990),
  ('camiseta-revalio', 8990, 8990),
  ('caneca-revalio', 5490, 5490),
  ('boneco-3d-docalio', 14990, 14990),
  ('camiseta-docalio', 8990, 8990),
  ('caneca-docalio', 5490, 5490),
  ('boneco-3d-gramelio', 14990, 14990),
  ('camiseta-gramelio', 8990, 8990),
  ('caneca-gramelio', 5490, 5490),
  ('boneco-3d-catelio', 14990, 14990),
  ('camiseta-catelio', 8990, 8990),
  ('caneca-catelio', 5490, 5490),
  ('boneco-3d-morvelio', 14990, 14990),
  ('camiseta-morvelio', 8990, 8990),
  ('caneca-morvelio', 5490, 5490),
  ('boneco-3d-mazelio', 14990, 14990),
  ('camiseta-mazelio', 8990, 8990),
  ('caneca-mazelio', 5490, 5490),
  ('boneco-3d-socialio', 14990, 14990),
  ('camiseta-socialio', 8990, 8990),
  ('caneca-socialio', 5490, 5490),
  ('camiseta-blajeen-labs', 7990, 7990),
  ('copo-blajeen-labs', 7990, 7990),
  ('livro-de-morvelio', 14990, 3990)
)
UPDATE store_products AS p
SET options = (
      SELECT jsonb_agg(
        jsonb_set(o.valor, '{precoCentavos}', to_jsonb(CASE WHEN (o.valor->>'digital')::boolean THEN s.digital ELSE s.fisico END))
        ORDER BY o.n)
      FROM jsonb_array_elements(p.options) WITH ORDINALITY AS o(valor, n)
    ),
    availability = 'SOB_ENCOMENDA',
    updated_at = now()
FROM sugerido AS s
WHERE p.slug = s.slug
  AND p.availability = 'EM_BREVE'
  AND jsonb_array_length(p.options) > 0
  AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p.options) AS x WHERE (x->>'precoCentavos')::numeric <> 0);

-- statement-breakpoint
WITH foto (url, alt) AS (VALUES
  ('/loja/exemplos/boneco-revalio.jpg', 'Boneco 3D de Revalio: o mascote azul, de jaleco e estetoscópio, segurando uma prancheta, sobre a base com o nome do jogo.'),
  ('/loja/exemplos/camiseta-revalio.jpg', 'Camiseta preta com a arte de Revalio no peito: o mascote azul.'),
  ('/loja/exemplos/caneca-revalio.jpg', 'Caneca branca de cerâmica com a arte de Revalio: o mascote azul.'),
  ('/loja/exemplos/boneco-docalio.jpg', 'Boneco 3D de Docalio: o personagem de óculos e jaleco, com a maleta de primeiros socorros, sobre a base com o nome do jogo.'),
  ('/loja/exemplos/camiseta-docalio.jpg', 'Camiseta preta com a arte de Docalio no peito: o emblema com a mochila de primeiros socorros.'),
  ('/loja/exemplos/caneca-docalio.jpg', 'Caneca branca de cerâmica com a arte de Docalio: o emblema com a mochila de primeiros socorros.'),
  ('/loja/exemplos/boneco-gramelio.jpg', 'Boneco 3D de Gramelio: a vaquinha de sino no pescoço, com grama aos pés, sobre a base com o nome do jogo.'),
  ('/loja/exemplos/camiseta-gramelio.jpg', 'Camiseta preta com a arte de Gramelio no peito: a vaquinha no campo.'),
  ('/loja/exemplos/caneca-gramelio.jpg', 'Caneca branca de cerâmica com a arte de Gramelio: a vaquinha no campo.'),
  ('/loja/exemplos/boneco-catelio.jpg', 'Boneco 3D de Catelio: o gato laranja, sobre a base com o nome do jogo.'),
  ('/loja/exemplos/camiseta-catelio.jpg', 'Camiseta preta com a arte de Catelio no peito: o gato laranja na cidade à noite.'),
  ('/loja/exemplos/caneca-catelio.jpg', 'Caneca branca de cerâmica com a arte de Catelio: o gato laranja na cidade à noite.'),
  ('/loja/exemplos/boneco-morvelio.jpg', 'Boneco 3D de Morvelio: o velho de barba branca, casaco roxo e bolsa de couro, sobre a base com o nome do jogo.'),
  ('/loja/exemplos/camiseta-morvelio.jpg', 'Camiseta preta com a arte de Morvelio no peito: Morvelio diante do castelo, ao pôr do sol.'),
  ('/loja/exemplos/caneca-morvelio.jpg', 'Caneca branca de cerâmica com a arte de Morvelio: Morvelio diante do castelo, ao pôr do sol.'),
  ('/loja/exemplos/boneco-mazelio.jpg', 'Boneco 3D de Mazelio: o rei de coroa, armadura azul e capa vermelha, sobre a base com o nome do jogo.'),
  ('/loja/exemplos/camiseta-mazelio.jpg', 'Camiseta preta com a arte de Mazelio no peito: o rei entre as torres.'),
  ('/loja/exemplos/caneca-mazelio.jpg', 'Caneca branca de cerâmica com a arte de Mazelio: o rei entre as torres.'),
  ('/loja/exemplos/boneco-socialio.jpg', 'Boneco 3D de Socialio: o jogador de fone de ouvido e moletom verde, sobre a base com o nome do jogo.'),
  ('/loja/exemplos/camiseta-socialio.jpg', 'Camiseta preta com a arte de Socialio no peito: os amigos jogando à mesa.'),
  ('/loja/exemplos/caneca-socialio.jpg', 'Caneca branca de cerâmica com a arte de Socialio: os amigos jogando à mesa.'),
  ('/loja/exemplos/camiseta-blajeen.jpg', 'Camiseta preta com o emblema da Blajeen Labs no peito: o frasco de gosma verde-ácido.'),
  ('/loja/exemplos/copo-blajeen.jpg', 'Copo térmico preto, com tampa, e o frasco de gosma verde-ácido da Blajeen Labs.'),
  ('/loja/exemplos/livro-morvelio-colecionador.jpg', 'Edição de colecionador do Livro de Morvelio, de capa dura, saindo da luva roxa.'),
  ('/loja/exemplos/livro-morvelio-digital.jpg', 'A capa do Livro de Morvelio na tela de um tablet.')
)
UPDATE store_products AS p
SET images = (
      SELECT jsonb_agg(CASE WHEN f.alt IS NULL THEN i.valor ELSE jsonb_set(i.valor, '{alt}', to_jsonb(f.alt)) END ORDER BY i.n)
      FROM jsonb_array_elements(p.images) WITH ORDINALITY AS i(valor, n)
      LEFT JOIN foto AS f ON f.url = i.valor->>'url'
    ),
    updated_at = now()
WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(p.images) AS x JOIN foto AS f ON f.url = x->>'url');

-- statement-breakpoint
-- A foto mostra um copo térmico com tampa; a descrição acompanha, se ainda for a do catálogo.
UPDATE store_products
SET description = 'Copo térmico com tampa e o frasco de gosma da Blajeen Labs, o mesmo que vive no canto do site.', updated_at = now()
WHERE slug = 'copo-blajeen-labs'
  AND description = 'Copo com o frasco de gosma da Blajeen Labs, o mesmo que vive no canto do site.';
