import { SystemScreenshot } from "@/components/media/SystemScreenshot";

/** Editorial mount for real interface captures; photographs and game art keep their own treatment. */
export function ScreenshotFrame({
  src,
  alt,
  label,
  priority = false,
  wide = false,
  original = false,
}: {
  src: string;
  alt: string;
  label: string;
  priority?: boolean;
  wide?: boolean;
  original?: boolean;
}) {
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
