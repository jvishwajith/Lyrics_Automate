import argparse
import subprocess
import sys
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parent
REMOTION_DIR = PROJECT_DIR / "remotion"
FINAL_VIDEO = PROJECT_DIR / "final_video"

NPX = "npx.cmd" if sys.platform == "win32" else "npx"

COMPOSITIONS = [
    (
        "WatermarkOnly",
        "Watermark_45s.mov",
        "Watermark badge — bottom position, transparent, 45 seconds",
    ),
    (
        "IntroOnly",
        "IntroAnimation_6s_beta.mov",
        "Intro slider animation (white sun / black volume), transparent",
    ),
]

PRORES_FLAGS = [
    "--codec=prores",
    "--prores-profile=4444",
    "--pixel-format=yuva444p10le",
    "--image-format=png",
    "--concurrency=50%",
    "--gl=angle",
]


def render_composition(comp_id: str, output_file: Path, label: str) -> bool:
    print(f"\n{'='*50}")
    print(f"  Composition : {comp_id}")
    print(f"  Label       : {label}")
    print(f"  Output      : {output_file.relative_to(PROJECT_DIR)}")
    print(f"{'='*50}")

    cmd = [NPX, "remotion", "render", comp_id, str(output_file)] + PRORES_FLAGS
    print("$", " ".join(cmd))
    print()

    result = subprocess.run(cmd, cwd=str(REMOTION_DIR))

    print()
    if result.returncode == 0:
        size_mb = output_file.stat().st_size / (1024 * 1024)
        print(f"  Saved  -> {output_file}  ({size_mb:.1f} MB)")
        return True
    else:
        print(f"  FAILED (exit code {result.returncode})")
        return False


def main() -> None:
    parser = argparse.ArgumentParser(description="Transparent overlay exporter")
    parser.add_argument("--watermark", action="store_true", help="Export watermark only")
    parser.add_argument("--intro", action="store_true", help="Export intro animation only")
    args = parser.parse_args()

    FINAL_VIDEO.mkdir(parents=True, exist_ok=True)

    if args.watermark:
        to_render = [COMPOSITIONS[0]]
    elif args.intro:
        to_render = [COMPOSITIONS[1]]
    else:
        to_render = COMPOSITIONS

    print("Transparent Overlay Exporter")
    print(f"Rendering {len(to_render)} composition(s) ...")

    failed = []
    for comp_id, filename, label in to_render:
        output_file = FINAL_VIDEO / filename
        ok = render_composition(comp_id, output_file, label)
        if not ok:
            failed.append(comp_id)

    print()
    print("=" * 50)
    if not failed:
        print("All exports complete! Files in final_video/:")
        for _, filename, _ in to_render:
            f = FINAL_VIDEO / filename
            if f.exists():
                print(f"  {filename}  ({f.stat().st_size / 1024 / 1024:.1f} MB)")
        print()
        print("CapCut tip: import the .mov files and place them on tracks")
        print("above your video/photo — transparency is preserved automatically.")
    else:
        print(f"Some exports FAILED: {failed}")
        sys.exit(1)


if __name__ == "__main__":
    main()
