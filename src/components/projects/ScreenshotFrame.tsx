import Image from "next/image";
import { SystemScreenshot } from "@/components/media/SystemScreenshot";

/** Editorial mount for real interface captures; photographs and game art keep their own treatment. */
export function ScreenshotFrame({
  src,
  alt,
  label,
  priority = false,
  wide = false,
  original = false,
  retrato,
}: {
  src: string;
  alt: string;
  label: string;
  priority?: boolean;
  wide?: boolean;
  original?: boolean;
  /**
   * Print de celular, em pé.
   *
   * A moldura de janela (barra com três bolinhas, 16:10) foi feita pra print de computador.
   * Um print de 720×1520 lá dentro vira uma tira estreita no meio de uma faixa clara — não
   * corta, mas parece erro. Aqui a área continua 16:10, pra o cartão ficar do mesmo tamanho
   * dos outros, e cada print entra inteiro, como uma tela de celular. `telas` são as outras,
   * lado a lado; duas cabem sem ficar pequenas demais pra ler.
   */
  retrato?: { telas?: readonly string[] } | undefined;
}) {
  if (retrato) {
    const todas = [src, ...(retrato.telas ?? [])].slice(0, 2);
    return (
      <div className="screenshot-mount">
        <div className="phone-stage relative w-full overflow-hidden" style={{ aspectRatio: "16 / 10" }}>
          <div className="absolute inset-0 flex items-center justify-center gap-[5%] py-[6%]">
            {todas.map((tela, i) => (
              <div
                key={tela}
                className={["phone-frame relative h-full", i === 0 ? "-translate-y-[3%]" : "translate-y-[3%]"].join(" ")}
                style={{ aspectRatio: "720 / 1520" }}
              >
                <Image
                  src={tela}
                  // Só a primeira tela leva a descrição: a segunda acompanha, e repetir a
                  // leitura não ajuda quem usa leitor de tela.
                  alt={i === 0 ? alt : ""}
                  fill
                  sizes="(min-width:1024px) 12vw, 34vw"
                  priority={priority && i === 0}
                  quality={90}
                  className="object-cover object-top"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screenshot-mount">
      <SystemScreenshot
        src={src}
        alt={alt}
        label={label}
        prioridade={priority}
        largura={wide ? 21 : 16}
        altura={wide ? 11 : 10}
        sizes="(min-width:1280px) 45vw, (min-width:768px) 70vw, 94vw"
      />
      {original ? (
        <a
          className="screenshot-original"
          href={src}
          target="_blank"
          rel="noreferrer"
        >
          Abrir captura completa <span aria-hidden="true">↗</span>
        </a>
      ) : null}
    </div>
  );
}
