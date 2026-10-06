'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMotion } from '@/components/motion/MotionProvider';
import { formatarArea, norteDaUnidade, PLANTA, type ComodoId } from '@/lib/torrelio/planta';
import { nascerEPorDoSol } from '@/lib/torrelio/sol';
import type { Estacao } from '@/lib/torrelio/tipos';
import { useContextoDoApartamento } from '../ponte';
import type { EstadoDoApartamento, ModoDoApartamento } from './3d/contrato';
import { ListaDeComodos, TabelaDeAreas } from './Comodos';
import type { Giro } from './desenho';
import { PalcoDoApartamento } from './PalcoDoApartamento';
import styles from './Apartamento.module.css';

/**
 * O apartamento por dentro (Torrelio): a planta fictícia de 2 dormitórios com suíte vira maquete.
 *
 * A planta técnica em SVG aparece primeiro e funciona sem WebGL; a maquete 3D só carrega por
 * intenção (o botão do palco ou, no computador, o ponteiro entrando nele). A lista de cômodos e o
 * quadro de áreas fazem pelo teclado tudo o que o 3D faz. A unidade, a hora e a estação chegam da
 * torre pela ponte (`../ponte.ts`): o final 03 vê a planta espelhada e o sol da mesma hora.
 */

const LUZES = [
  { rotulo: 'Dia', hora: 10 },
  { rotulo: 'Fim de tarde', hora: 17.5 },
  { rotulo: 'Noite', hora: 20.5 },
] as const;

const NA_ESTACAO: Readonly<Record<Estacao, string>> = { verao: 'no verão', equinocio: 'no equinócio', inverno: 'no inverno' };

export function formatarHora(hora: number): string {
  const minutos = Math.round(hora * 60);
  return `${Math.floor(minutos / 60)}h${String(minutos % 60).padStart(2, '0')}`;
}

function textoDoSol(hora: number, estacao: Estacao): string {
  const { nascer, por } = nascerEPorDoSol(estacao);
  if (hora < nascer || hora > por) return `${formatarHora(hora)}: o sol já se pôs e as luzes da casa estão acesas.`;
  return `Sol das ${formatarHora(hora)} (hora solar), ${NA_ESTACAO[estacao]}, entrando pelas janelas. Simulação aproximada.`;
}

export function ApartamentoDemo() {
  const contexto = useContextoDoApartamento();
  const { ativo: movimento } = useMotion();
  const [modo, setModo] = useState<ModoDoApartamento>('planta');
  const [selecionado, setSelecionado] = useState<ComodoId | null>(null);
  const [destacado, setDestacado] = useState<ComodoId | null>(null);
  const [giro, setGiro] = useState<Giro>(0);
  const [luz, setLuz] = useState<{ hora: number; pedido: number } | null>(null);

  const unidade = contexto.unidade;
  const outraTipologia = unidade !== null && unidade.tipologia !== 'tipo-2d';
  const espelhada = unidade !== null && !outraTipologia && unidade.final === '03';
  // A hora escolhida aqui vale até a torre mandar outro pedido.
  const hora = luz && luz.pedido === contexto.pedido ? luz.hora : contexto.hora;

  // Pedido vindo da torre ("Ver o apartamento por dentro"): rola até a seção e põe o foco no título.
  const ultimoPedido = useRef(contexto.pedido);
  useEffect(() => {
    if (contexto.pedido === ultimoPedido.current) return;
    ultimoPedido.current = contexto.pedido;
    const secao = document.getElementById('apartamento');
    secao?.scrollIntoView?.({ behavior: movimento ? 'smooth' : 'auto', block: 'start' });
    document.getElementById('apartamento-titulo')?.focus({ preventScroll: true });
  }, [contexto.pedido, movimento]);

  const estado: EstadoDoApartamento = useMemo(
    () => ({
      modo,
      selecionado,
      destacado,
      espelhada,
      norteGraus: norteDaUnidade(espelhada),
      giro,
      hora,
      estacao: contexto.estacao,
      movimento,
    }),
    [modo, selecionado, destacado, espelhada, giro, hora, contexto.estacao, movimento],
  );

  const linha = unidade
    ? outraTipologia
      ? `Unidade ${unidade.id} · final ${unidade.final} · ${unidade.tipologia === 'cobertura' ? 'cobertura duplex' : '3 dormitórios'}`
      : `Unidade ${unidade.id} · final ${unidade.final} · ${espelhada ? 'planta espelhada' : 'planta-base'}`
    : 'Final 02 · planta-base · o final 03 usa a mesma, espelhada';

  const descricao = `${espelhada ? 'Planta do final 03, espelhada da planta-base. ' : ''}Dois dormitórios com suíte, ${formatarArea(PLANTA.areaPrivativaCentesimos)} privativos e ${formatarArea(PLANTA.areaUtilCentesimos)} úteis: estar e jantar na quina, com varanda em L nas duas fachadas; cozinha integrada, com a porta de entrada; área de serviço; circulação para o dormitório, a suíte com banho e o banho social.`;

  const escolhido = PLANTA.comodos.find((c) => c.id === selecionado);
  const escolher = (id: ComodoId | null) => setSelecionado((atual) => (id !== null && atual === id ? null : id));

  return (
    <div className={styles.demo}>
      <div className={styles.contexto}>
        <p className={styles.contextoTexto}>{linha}</p>
        {unidade ? (
          <a href="#demonstracao" className={styles.voltar}>
            Voltar para a torre <span aria-hidden="true">↑</span>
          </a>
        ) : null}
      </div>
      {outraTipologia ? (
        <p className={styles.avisoTipologia}>
          A demonstração tem a planta 3D só da tipologia de 2 dormitórios. Abaixo, a do final 02, com 66,45 m²; num projeto
          real, cada tipologia ganha a sua.
        </p>
      ) : null}

      <div className={styles.grade}>
        <PalcoDoApartamento
          estado={estado}
          descricao={descricao}
          aoEscolher={escolher}
          aoPassar={setDestacado}
          aoPedirMaquete={() => setModo('maquete')}
        />

        <div className={styles.lateral}>
          <div className={styles.grupo} role="group" aria-labelledby="apartamento-vista">
            <p id="apartamento-vista" className={styles.rotuloDoGrupo}>
              Vista
            </p>
            <div className={styles.linhaDeControles}>
              <div className={styles.segmentos}>
                {(['maquete', 'planta'] as const).map((m) => (
                  <button key={m} type="button" className={styles.segmento} aria-pressed={modo === m} onClick={() => setModo(m)}>
                    {m === 'maquete' ? 'Maquete' : 'Planta'}
                  </button>
                ))}
              </div>
              <button type="button" className={styles.botao} onClick={() => setGiro((g) => ((g + 90) % 360) as Giro)}>
                Girar planta <span aria-hidden="true">↻</span>
              </button>
            </div>
          </div>

          <div className={styles.grupo} role="group" aria-labelledby="apartamento-luz">
            <p id="apartamento-luz" className={styles.rotuloDoGrupo}>
              Luz
            </p>
            <div className={styles.segmentos}>
              {LUZES.map((l) => (
                <button
                  key={l.rotulo}
                  type="button"
                  className={styles.segmento}
                  aria-pressed={hora === l.hora}
                  onClick={() => setLuz({ hora: l.hora, pedido: contexto.pedido })}
                >
                  {l.rotulo}
                </button>
              ))}
            </div>
            <p className={styles.sol}>{textoDoSol(hora, contexto.estacao)}</p>
          </div>

          <ListaDeComodos selecionado={selecionado} aoEscolher={escolher} aoPassar={setDestacado} />
        </div>
      </div>

      <div className={styles.rodape}>
        <TabelaDeAreas selecionado={selecionado} />
        <div>
          <p className={styles.nota}>
            Mobiliário ilustrativo. As áreas são da planta fictícia; num projeto real, vêm do memorial da incorporadora.
          </p>
          <p className={styles.nota}>
            Área privativa: o contorno externo das paredes, com a varanda. Área útil: só o piso de cada cômodo.
          </p>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {escolhido ? `${escolhido.nome}: ${formatarArea(escolhido.areaCentesimos)}.` : ''}
      </p>
    </div>
  );
}
