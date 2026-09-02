'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navegacaoPrincipal } from '@/content/navigation';
import { ROTAS } from '@/lib/routes';
import { MobileNavIcon } from './MobileNavIcon';
import styles from './MobileSideNav.module.css';

const rotasDeJogos = [
  ROTAS.projetoRevalio,
  ROTAS.projetoDocalio,
  ROTAS.projetoGramelio,
  ROTAS.projetoCatelio,
  ROTAS.projetoDogolio,
  ROTAS.projetoMorvelio,
];
const rotasDeProdutos = [
  ROTAS.projetos,
  ROTAS.barbearia,
  ROTAS.personalStudio,
  ROTAS.salaoEstetica,
  ROTAS.ecommerce,
  ROTAS.clinicaMedica,
  ROTAS.foodelio,
  ROTAS.pipelio,
  ROTAS.painelAdministrativo,
];

function caminhoComecaCom(caminho: string, rota: string) {
  return caminho === rota || caminho.startsWith(`${rota}/`);
}

function itemAtivo(caminho: string, href: string) {
  if (href === ROTAS.home) return caminho === ROTAS.home;
  if (href === ROTAS.projetos) {
    return caminho === ROTAS.projetos || rotasDeProdutos.slice(1).some((rota) => caminhoComecaCom(caminho, rota));
  }
  if (href === ROTAS.projetoRevalio) return rotasDeJogos.some((rota) => caminhoComecaCom(caminho, rota));
  return caminhoComecaCom(caminho, href);
}

export function MobileSideNav() {
  const caminho = usePathname();

  return (
    <nav className={styles.raiz} aria-label="Menu lateral">
      <ul className={styles.lista}>
        {navegacaoPrincipal.map((link) => {
          const ativo = itemAtivo(caminho, link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={ativo ? 'page' : undefined}
                aria-label={`${link.rotulo}. ${link.descricao}`}
                data-servico={link.href === ROTAS.crieSeuProjeto}
                className={styles.link}
              >
                <MobileNavIcon id={link.icone} className={styles.icone} />
                <span className={styles.rotulo}>{link.rotulo}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
