"""Finaliza os banners com títulos exatos e a assinatura tipográfica Blajeen Labs.

Revalio e Docalio chegam sem título: o texto é aplicado aqui, deterministicamente, com a fonte do
próprio jogo. O Gramelio chegou com o título já composto na arte, então para ele só a assinatura é
aplicada — `title: None`.

A posição da assinatura também é por projeto. O padrão é o canto inferior direito; a arte do
Gramelio ocupa esse canto com a placa da campanha da ovelha, e o único vão limpo é o céu do alto à
esquerda, onde ela entra sem cobrir título, vaca, cartelas ou mundos.

    python tools/compose_project_banner.py gramelio <origem> <destino>
"""

from argparse import ArgumentParser
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "public" / "brand" / "blajeen-labs-simple.png"
REVALIO_FONT = Path(r"C:\dev\revalio\app\assets\fonts\NunitoSans-Variable.ttf")
DOCALIO_FONT = Path(r"C:\dev\docalio\public\assets\fonts\Kenney-Blocks.ttf")


# Assinatura no canto inferior direito, medida em fração da arte. Vale para quem não sobrescreve.
BRAND_PADRAO = {"largura": 0.255, "x": None, "y": None, "fumaca": 118}


PROJECTS = {
    "revalio": {
        "title": "REVALIO",
        "font": REVALIO_FONT,
        "fill_top": (250, 254, 255, 255),
        "fill_bottom": (107, 226, 255, 255),
        "stroke": (5, 46, 83, 255),
    },
    "docalio": {
        "title": "DOCALIO",
        "font": DOCALIO_FONT,
        "fill_top": (255, 251, 224, 255),
        "fill_bottom": (255, 199, 92, 255),
        "stroke": (19, 59, 53, 255),
    },
    "gramelio": {
        # O título `GRAMELIO` já vem desenhado na placa de madeira da arte.
        "title": None,
        # Céu do alto à esquerda: o único vão limpo da composição. A assinatura entra menor que o
        # padrão porque o vão é menor, e ainda assim lê — o fundo é céu liso, não cena carregada.
        "brand": {"largura": 0.215, "x": 0.030, "y": 0.045, "fumaca": 118},
    },
}


def _font(project: str, size: int) -> ImageFont.FreeTypeFont:
    font = ImageFont.truetype(str(PROJECTS[project]["font"]), size)
    if project == "revalio":
        try:
            font.set_variation_by_axes([920, 105, 12, 500])
        except (AttributeError, OSError):
            pass
    return font


def _vertical_gradient(size: tuple[int, int], top: tuple[int, ...], bottom: tuple[int, ...]) -> Image.Image:
    width, height = size
    gradient = Image.new("RGBA", size)
    pixels = gradient.load()
    for y in range(height):
        amount = y / max(1, height - 1)
        color = tuple(round(a + (b - a) * amount) for a, b in zip(top, bottom))
        for x in range(width):
            pixels[x, y] = color
    return gradient


def add_title(banner: Image.Image, project: str) -> Image.Image:
    spec = PROJECTS[project]
    max_width = round(banner.width * 0.39)
    font_size = round(banner.height * 0.135)
    stroke_width = max(6, round(banner.height * 0.009))

    while True:
        font = _font(project, font_size)
        box = font.getbbox(spec["title"], stroke_width=stroke_width)
        if box[2] - box[0] <= max_width or font_size <= 54:
            break
        font_size -= 2

    x = round(banner.width * 0.034)
    y = round(banner.height * 0.032) - box[1]

    fill_mask = Image.new("L", banner.size, 0)
    ImageDraw.Draw(fill_mask).text((x, y), spec["title"], font=font, fill=255)

    outline_mask = Image.new("L", banner.size, 0)
    ImageDraw.Draw(outline_mask).text(
        (x, y), spec["title"], font=font, fill=255,
        stroke_width=stroke_width, stroke_fill=255,
    )

    shadow_mask = outline_mask.filter(ImageFilter.GaussianBlur(max(5, stroke_width)))
    shadow = Image.new("RGBA", banner.size, (0, 8, 18, 0))
    shadow.putalpha(shadow_mask.point(lambda value: round(value * 0.78)))
    banner = Image.alpha_composite(banner, shadow)

    outline = Image.new("RGBA", banner.size, spec["stroke"])
    outline.putalpha(outline_mask)
    banner = Image.alpha_composite(banner, outline)

    gradient = _vertical_gradient(banner.size, spec["fill_top"], spec["fill_bottom"])
    gradient.putalpha(fill_mask)
    return Image.alpha_composite(banner, gradient)


def add_brand(banner: Image.Image, project: str) -> Image.Image:
    spec = {**BRAND_PADRAO, **PROJECTS[project].get("brand", {})}

    logo = Image.open(BRAND).convert("RGBA")
    width = round(banner.width * spec["largura"])
    height = round(width * logo.height / logo.width)
    logo = logo.resize((width, height), Image.Resampling.LANCZOS)

    # Sem posição declarada, o padrão continua sendo o canto inferior direito.
    x = round(banner.width * spec["x"]) if spec["x"] is not None else banner.width - width - round(banner.width * 0.027)
    y = round(banner.height * spec["y"]) if spec["y"] is not None else banner.height - height - round(banner.height * 0.035)

    # Névoa escura difusa: é ela que segura a assinatura clara sobre fundo claro, sem placa dura.
    smoke_mask = Image.new("L", banner.size, 0)
    ImageDraw.Draw(smoke_mask).ellipse(
        (x - 52, y - 24, x + width + 48, y + height + 42), fill=spec["fumaca"]
    )
    smoke_mask = smoke_mask.filter(ImageFilter.GaussianBlur(34))
    smoke = Image.new("RGBA", banner.size, (2, 9, 15, 0))
    smoke.putalpha(smoke_mask)
    banner = Image.alpha_composite(banner, smoke)

    alpha = logo.getchannel("A")
    shadow_alpha = alpha.filter(ImageFilter.GaussianBlur(7)).point(
        lambda value: round(value * 0.72)
    )
    shadow = Image.new("RGBA", logo.size, (0, 4, 9, 0))
    shadow.putalpha(shadow_alpha)
    banner.alpha_composite(shadow, (x + 2, y + 5))
    banner.alpha_composite(logo, (x, y))
    return banner


def compose(source: Path, target: Path, project: str) -> None:
    banner = Image.open(source).convert("RGBA")
    if PROJECTS[project]["title"] is not None:
        banner = add_title(banner, project)
    banner = add_brand(banner, project)
    target.parent.mkdir(parents=True, exist_ok=True)
    banner.convert("RGB").save(target, quality=96)


parser = ArgumentParser()
parser.add_argument("project", choices=sorted(PROJECTS))
parser.add_argument("source", type=Path)
parser.add_argument("target", type=Path)
args = parser.parse_args()
compose(args.source, args.target, args.project)
