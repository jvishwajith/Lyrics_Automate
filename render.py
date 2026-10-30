import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROJECT_DIR = Path(__file__).resolve().parent
INPUT_DIR = PROJECT_DIR / "input"
OUTPUT_DIR = PROJECT_DIR / "output"
FINAL_VIDEO_DIR = PROJECT_DIR / "final_video"
REMOTION_DIR = PROJECT_DIR / "remotion"
REMOTION_ASSETS = REMOTION_DIR / "public" / "assets"
BACKGROUNDS_DIR = PROJECT_DIR / "backgrounds"
REMOTION_PUBLIC_BACKGROUNDS = REMOTION_DIR / "public" / "backgrounds"

TEMPLATES = {
    "1": ("sad",           "Sad Song"),
    "2": ("rap",           "Rap / Hip-Hop"),
    "3": ("feelgood",      "Feel-Good"),
    "4": ("energetic",     "Energetic / Party"),
    "5": ("backgrounds",   "Backgrounds"),
    "6": ("verticalglass", "Vertical Glass"),
    "7": ("justlyrics",    "Just Lyrics"),
}

TEMPLATE_SLUGS = {v[0]: k for k, v in TEMPLATES.items()}


def select_song(cli_song: str = None) -> Path:
    mp3_files = sorted(INPUT_DIR.glob("*.mp3"))
    if not mp3_files:
        sys.exit("✗ No MP3 files found in input/.")

    if cli_song:
        target = INPUT_DIR / cli_song
        if target.exists():
            return target
        for f in mp3_files:
            if f.name.lower() == cli_song.lower():
                return f
        print(f"✗ '{cli_song}' not found in input/.")

    if len(mp3_files) == 1:
        print(f"Song: {mp3_files[0].name}")
        return mp3_files[0]

    print("\nSelect song:")
    for i, f in enumerate(mp3_files, 1):
        print(f"  {i}. {f.name}")

    while True:
        try:
            idx = int(input(f"[1-{len(mp3_files)}]: ").strip())
            if 1 <= idx <= len(mp3_files):
                return mp3_files[idx - 1]
        except (ValueError, EOFError):
            pass


def select_json(song_path: Path, cli_json: str = None) -> Path:
    json_files = sorted(OUTPUT_DIR.glob("*.json"))
    if not json_files:
        sys.exit("✗ No timing JSON files found in output/. Run a transcript generator first.")

    if cli_json:
        target = OUTPUT_DIR / cli_json
        if target.exists():
            return target
        for f in json_files:
            if f.name.lower() == cli_json.lower():
                return f
        print(f"✗ '{cli_json}' not found in output/.")

    song_stem = song_path.stem.lower()
    default_idx = 1
    for i, f in enumerate(json_files, 1):
        if song_stem in f.stem.lower():
            default_idx = i
            break

    if len(json_files) == 1:
        print(f"JSON: {json_files[0].name}")
        return json_files[0]

    print("\nSelect lyrics JSON:")
    for i, f in enumerate(json_files, 1):
        tag = " *" if i == default_idx else ""
        print(f"  {i}. {f.name}{tag}")

    while True:
        try:
            raw = input(f"[default: {default_idx}]: ").strip()
            idx = int(raw) if raw else default_idx
            if 1 <= idx <= len(json_files):
                return json_files[idx - 1]
        except (ValueError, EOFError):
            pass


def select_template(cli_template: str = None) -> str:
    if cli_template:
        norm = cli_template.strip().lower()
        if norm in TEMPLATE_SLUGS:
            return norm
        if norm in TEMPLATES:
            return TEMPLATES[norm][0]

    print("\nSelect template:")
    for key, (_, name) in TEMPLATES.items():
        print(f"  {key}. {name}")

    while True:
        choice = input(f"[1-{len(TEMPLATES)}]: ").strip()
        if choice in TEMPLATES:
            return TEMPLATES[choice][0]


def select_background_image(cli_image: str = None) -> Path:
    valid_exts = {".png", ".jpg", ".jpeg", ".webp"}
    images = sorted([f for f in BACKGROUNDS_DIR.iterdir() if f.is_file() and f.suffix.lower() in valid_exts]) if BACKGROUNDS_DIR.exists() else []

    if not images:
        sys.exit("✗ No images found in backgrounds/.")

    if cli_image:
        target = BACKGROUNDS_DIR / cli_image
        if target.exists():
            return target
        for f in images:
            if f.name.lower() == cli_image.lower():
                return f
        print(f"✗ '{cli_image}' not found in backgrounds/.")

    if len(images) == 1:
        print(f"Image: {images[0].name}")
        return images[0]

    print("\nSelect background image:")
    for i, f in enumerate(images, 1):
        print(f"  {i}. {f.name}")

    while True:
        try:
            raw = input(f"[1-{len(images)}, default: 1]: ").strip()
            idx = int(raw) if raw else 1
            if 1 <= idx <= len(images):
                return images[idx - 1]
        except (ValueError, EOFError):
            pass


def sync_selected_assets(
    song_path: Path,
    json_path: Path,
    template: str,
    text_color: str = "#FFFFFF",
    bg_image_path: Path = None,
    font_family: str = "Outfit",
    font_size: int = 64,
) -> dict:
    REMOTION_ASSETS.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(exist_ok=True)

    with open(json_path, "r", encoding="utf-8") as f:
        timing_data = json.load(f)

    timing_data["audio_file"] = song_path.name
    timing_data["template"] = template
    timing_data["textColor"] = text_color

    shutil.copy2(song_path, REMOTION_ASSETS / song_path.name)

    if template in ("backgrounds", "verticalglass", "justlyrics"):
        REMOTION_PUBLIC_BACKGROUNDS.mkdir(parents=True, exist_ok=True)
        if BACKGROUNDS_DIR.exists():
            for img_file in sorted(BACKGROUNDS_DIR.iterdir()):
                if img_file.is_file() and img_file.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp"):
                    shutil.copy2(img_file, REMOTION_PUBLIC_BACKGROUNDS / img_file.name)

        chosen_name = bg_image_path.name if bg_image_path else "1.png"
        timing_data["backgroundImage"] = chosen_name
        timing_data["background_image"] = chosen_name

    if template == "justlyrics":
        timing_data["fontFamily"] = font_family
        timing_data["fontSize"] = font_size

    active_json_path = REMOTION_ASSETS / "active_timing.json"
    with open(active_json_path, "w", encoding="utf-8") as f:
        json.dump(timing_data, f, ensure_ascii=False, indent=2)

    words_count = len(timing_data.get("words", []))
    print(f"\n✓ Ready  [{template}]  {song_path.name}  {words_count} words")
    if template in ("backgrounds", "verticalglass", "justlyrics"):
        extras = f"  image={timing_data.get('backgroundImage')}  color={text_color}"
        if template == "justlyrics":
            extras += f"  font={font_family} {font_size}px"
        print(extras)

    return timing_data


def render_mp4(template: str, song_path: Path, timing_data: dict) -> Path:
    FINAL_VIDEO_DIR.mkdir(exist_ok=True)
    output_filename = f"{song_path.stem}_{template}.mp4"
    final_output = FINAL_VIDEO_DIR / output_filename

    print(f"\nRendering → {final_output.name}")

    npx = "npx.cmd" if sys.platform == "win32" else "npx"
    cmd = [npx, "remotion", "render", "LyricsVideo", str(final_output), "--concurrency=50%", "--gl=angle"]
    result = subprocess.run(cmd, cwd=str(REMOTION_DIR))

    if result.returncode == 0:
        print(f"✓ Saved → {final_output}")
        return final_output
    else:
        sys.exit(f"✗ Render failed (exit {result.returncode})")


def launch_studio(template: str = None):
    npx = "npx.cmd" if sys.platform == "win32" else "npx"
    subprocess.run([npx, "remotion", "studio", "--port=3000"], cwd=str(REMOTION_DIR))


def select_action(cli_action: str = None) -> str:
    if cli_action:
        norm = cli_action.strip().lower()
        if norm in ("1", "preview", "studio"):
            return "preview"
        if norm in ("2", "render", "cli"):
            return "render"
        if norm in ("3", "both"):
            return "both"

    print("\nAction:")
    print("  1. Preview in browser (default)")
    print("  2. Render MP4")
    print("  3. Both")

    choice = input("[1-3, default: 1]: ").strip()
    if choice == "2":
        return "render"
    elif choice == "3":
        return "both"
    return "preview"


def main():
    parser = argparse.ArgumentParser(description="Lyric Video Generator")
    parser.add_argument("--song", type=str)
    parser.add_argument("--json", type=str)
    parser.add_argument("--template", type=str)
    parser.add_argument("--bg-image", type=str)
    parser.add_argument("--color", type=str)
    parser.add_argument("--font-family", type=str)
    parser.add_argument("--font-size", type=str)
    parser.add_argument("--action", choices=["preview", "render", "both"])
    args = parser.parse_args()

    print("Lyric Video Generator")
    print("─" * 30)

    song_path = select_song(args.song)
    json_path = select_json(song_path, args.json)
    template = select_template(args.template)

    bg_image_path = None
    text_color = "#FFFFFF"
    font_family = "Outfit"
    font_size = 64

    if template in ("backgrounds", "verticalglass", "justlyrics"):
        bg_image_path = select_background_image(args.bg_image)

        if args.color:
            text_color = args.color.strip()
            if not text_color.startswith("#"):
                text_color = "#" + text_color
        else:
            raw = input("Lyric colour [default: #FFFFFF]: ").strip()
            if raw:
                text_color = raw if raw.startswith("#") else "#" + raw
                stripped = text_color.lstrip("#")
                if len(stripped) not in (3, 6) or not all(c in "0123456789abcdefABCDEF" for c in stripped):
                    print(f"⚠ Invalid hex — using #FFFFFF")
                    text_color = "#FFFFFF"
                elif len(stripped) == 3:
                    text_color = "#" + "".join(c * 2 for c in stripped)

        if template == "justlyrics":
            if args.font_family:
                font_family = args.font_family.strip()
            else:
                raw_font = input("Google Font [default: Outfit]: ").strip()
                if raw_font:
                    font_family = raw_font

            if args.font_size:
                try:
                    font_size = int(str(args.font_size).replace("px", "").strip())
                except ValueError:
                    font_size = 64
            else:
                raw_size = input("Font size px [default: 64]: ").strip()
                if raw_size:
                    try:
                        font_size = int(raw_size.replace("px", "").strip())
                    except ValueError:
                        print("⚠ Invalid size — using 64px")
                        font_size = 64

    timing_data = sync_selected_assets(
        song_path, json_path, template,
        text_color=text_color,
        bg_image_path=bg_image_path,
        font_family=font_family,
        font_size=font_size,
    )

    action = select_action(args.action)

    if action == "render":
        render_mp4(template, song_path, timing_data)
    elif action == "preview":
        launch_studio(template)
    elif action == "both":
        render_mp4(template, song_path, timing_data)
        launch_studio(template)


if __name__ == "__main__":
    main()