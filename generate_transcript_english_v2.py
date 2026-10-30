import json
import os
import sys
from pathlib import Path

from deepgram import DeepgramClient
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
INPUT_DIR = BASE_DIR / "input"
OUTPUT_DIR = BASE_DIR / "output"

load_dotenv(BASE_DIR / ".env")
API_KEY = os.getenv("DEEPGRAM_API_KEY")
if not API_KEY:
    sys.exit("DEEPGRAM_API_KEY not found in .env")

client = DeepgramClient(api_key=API_KEY)


def choose_file() -> Path:
    files = sorted(INPUT_DIR.glob("*.mp3"))
    if not files:
        sys.exit(f"No .mp3 files found in {INPUT_DIR}")

    print("Available audio files:")
    for i, f in enumerate(files, start=1):
        print(f"  {i}. {f.name}")

    while True:
        choice = input(f"Choose a file (1-{len(files)}): ").strip()
        if choice.isdigit() and 1 <= int(choice) <= len(files):
            return files[int(choice) - 1]
        print("Invalid choice, try again.")


def transcribe(audio_path: Path) -> list:
    with open(audio_path, "rb") as f:
        audio_bytes = f.read()

    response = client.listen.v1.media.transcribe_file(
        request=audio_bytes,
        model="nova-3",
        language="en",
    )
    words_raw = response.results.channels[0].alternatives[0].words

    return [
        {
            "index": i,
            "start": round(w.start, 2),
            "end": round(w.end, 2),
            "text": w.word,
        }
        for i, w in enumerate(words_raw, start=1)
    ]


def write_json(path: Path, audio_name: str, words: list) -> None:
    word_lines = ["    " + json.dumps(w, ensure_ascii=False) for w in words]
    text = (
        "{\n"
        f'  "audio_file": {json.dumps(audio_name, ensure_ascii=False)},\n'
        '  "language": "en",\n'
        '  "words": [\n'
        + ",\n".join(word_lines)
        + "\n  ]\n}\n"
    )
    path.write_text(text, encoding="utf-8")


def main() -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)

    audio = choose_file()
    out_path = OUTPUT_DIR / f"{audio.stem}_timing.json"

    if out_path.exists():
        answer = input(f"{out_path.name} already exists. Overwrite? (y/n): ").strip().lower()
        if answer != "y":
            print("Cancelled.")
            return

    print(f"Transcribing {audio.name} ...")
    words = transcribe(audio)
    write_json(out_path, audio.name, words)
    print(f"Saved {len(words)} words to {out_path}")


if __name__ == "__main__":
    main()