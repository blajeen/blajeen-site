"""Aplica a assinatura tipográfica simples da Blajeen Labs em um banner."""

from argparse import ArgumentParser
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "public" / "brand" / "blajeen-labs-simple.png"


def composite(source: Path, target: Path) -> None:
    banner = Image.open(source).convert("RGBA")
    logo = Image.open(LOGO).convert("RGBA")

    width = round(banner.width * 0.255)
    height = round(width * logo.height / logo.width)
    logo = logo.resize((width, height), Image.Resampling.LANCZOS)

    x = banner.width - width - round(banner.width * 0.027)
    y = banner.height - height - round(banner.height * 0.035)

    smoke_mask = Image.new("L", banner.size, 0)
    ImageDraw.Draw(smoke_mask).ellipse(
        (x - 52, y - 24, x + width + 48, y + height + 42), fill=118
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

    target.parent.mkdir(parents=True, exist_ok=True)
    banner.convert("RGB").save(target, quality=96)


parser = ArgumentParser()
parser.add_argument("source", type=Path)
parser.add_argument("target", type=Path)
args = parser.parse_args()
composite(args.source, args.target)
