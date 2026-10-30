# 🎵 Lyrics Automate

An automated, high-performance lyric video generation pipeline for vertical short-form content (**9:16 aspect ratio, 1080x1920, 30 FPS** for Instagram Reels, YouTube Shorts, and TikTok). It produces accurate word-level timestamps using **Deepgram Nova-3** speech-to-text and renders smooth, animated typography and music player interfaces using **Remotion** (React 19 + TypeScript + Rspack).

---

## 📁 Project Overview

```text
Lyrics_Automate_Project/
├── backgrounds/                       # Custom background portrait images (.png, .jpg, .webp)
├── final_video/                       # Exported MP4 lyric videos & ProRes 4444 MOV overlays
├── input/                             # Source audio files (.mp3)
├── output/                            # Word-level timestamp JSON files (*_timing.json)
├── Partitioned/                       # Pre-packaged song distribution bundles (audio, srt, mov)
├── remotion/                          # Remotion React video rendering engine
│   ├── public/assets/                 # Staged active audio & active_timing.json
│   ├── public/backgrounds/            # Staged background images for Remotion server
│   └── src/                           # Compositions, templates, shared utils, and components
├── generate_transcript_english_v2.py  # Deepgram Nova-3 transcription for English songs
├── generate_transcript_tamil_v2.py    # Deepgram Nova-3 transcription for Tamil songs
├── render.py                          # Primary CLI for interactive/headless preview & MP4 rendering
├── render_intro.py                    # Transparent Apple ProRes 4444 overlay exporter (.mov)
├── filetree.md                        # Comprehensive codebase structure reference
├── requirements.txt                   # Python dependencies (deepgram-sdk, python-dotenv)
└── .env                               # Deepgram API credentials
```

> 📖 *For a complete file-by-file breakdown of the repository, see [filetree.md](file:///d:/Lyrics_Automate/Lyrics_Automate_Project/filetree.md).*

---

## ⚙️ Prerequisites & Setup

### 1. Requirements
* **Python**: 3.10 or higher
* **Node.js**: v18+ & **npm**
* **FFmpeg**: Installed and accessible in your system `PATH` (used by Remotion for audio processing and frame encoding)
* **Deepgram API Key**: [Obtain an API key from Deepgram Console](https://console.deepgram.com/)

### 2. Installation

1. **Set up Python Virtual Environment:**
   ```bash
   # Create virtual environment
   python -m venv lyric_automate

   # Activate on Windows (PowerShell / Command Prompt):
   lyric_automate\Scripts\activate
   # Or on macOS / Linux:
   # source lyric_automate/bin/activate

   # Install dependencies
   pip install -r requirements.txt
   ```

2. **Install Remotion Dependencies:**
   ```bash
   cd remotion
   npm install
   cd ..
   ```

3. **Configure Environment Variables:**
   Create or verify `.env` in the project root:
   ```env
   DEEPGRAM_API_KEY=your_deepgram_api_key_here
   ```

---

## 🎨 Available Templates

All 7 visual templates are modular React components located in `remotion/src/templates/` and registered through `remotion/src/templates/registry.ts`.

| # | Template Key | Template Name | Visual Style & Animation | Watermark Position | Supported Custom Options |
| :-: | :--- | :--- | :--- | :-: | :--- |
| **1** | `sad` | **Sad Song** | Melancholic dark blue / deep navy atmosphere, serif typography (*Playfair Display*), glowing slow-fading word highlights, progress bar. | Top | Default Theme |
| **2** | `rap` | **Rap / Hip-Hop** | High-energy kinetic text with neon lime accents, industrial dark grunge background, rapid word burst clustering (`groupWordsIntoClusters`). | Top | Default Theme |
| **3** | `feelgood` | **Feel-Good** | Warm golden-hour sunset ambiance with floating ambient bokeh particles and smooth typography transitions. | Top | Default Theme |
| **4** | `energetic` | **Energetic / Party** | Cyberpunk club aesthetic with electric cyan & magenta beat light pulses and dynamic high-contrast reactive text. | Top | Default Theme |
| **5** | `backgrounds` | **Backgrounds** | Custom portrait background artwork with frosted glass music player card, animated progress bar, and active lyric highlighting. | Bottom | `--bg-image`, `--color` |
| **6** | `verticalglass` | **Vertical Glass** | Modern glassmorphic floating player card with progress bar, volume/track controls, and adaptive contrast theme. | Bottom | `--bg-image`, `--color` |
| **7** | `justlyrics` | **Just Lyrics** | Minimalist distraction-free typography overlay with customizable Google Fonts, font size, and text color over optional background image. | Bottom | `--bg-image`, `--color`, `--font-family`, `--font-size` |

---

## 🚀 Quick Start (3 Steps)

### Step 1: Add Source Audio
Place your source song (`.mp3`) into the `input/` directory:
```text
input/
└── MySong.mp3
```

### Step 2: Generate Word-Level Timestamps
Run the Deepgram transcription script matching the song's language. The script prompts you to choose the file from `input/` and writes a word-level timing JSON file to `output/`:

* **For English audio:**
  ```bash
  python generate_transcript_english_v2.py
  ```

* **For Tamil audio:**
  ```bash
  python generate_transcript_tamil_v2.py
  ```

> 💡 *Tip: The generated `output/<song>_timing.json` file contains `index`, `start`, `end`, and `text` for every word. You can open and edit words directly to polish spelling, casing, punctuation, or phonetics before rendering.*

### Step 3: Preview in Studio or Render MP4
Run the interactive CLI:
```bash
python render.py
```

The CLI will guide you step-by-step:
1. Select the audio file from `input/`.
2. Select the timing JSON from `output/` (auto-detects matching filename).
3. Select any of the 7 visual templates.
4. If choosing `backgrounds`, `verticalglass`, or `justlyrics`, select a background image from `backgrounds/`, highlight color, font, etc.
5. Select the action:
   - `1` **Preview**: Launches Remotion Studio at `http://localhost:3000` with instant live scrubbing.
   - `2` **Render**: Renders a production 1080x1920 MP4 directly to `final_video/<song>_<template>.mp4`.
   - `3` **Both**: Renders the MP4 first, then opens Remotion Studio.

---

## ⚡ Direct CLI Commands & Automation

You can bypass interactive prompts entirely by passing CLI arguments:

```bash
# Preview 'sad' template in Remotion Studio
python render.py --song "MySong.mp3" --json "MySong_timing.json" --template sad --action preview

# Render 'rap' template directly to 1080x1920 MP4
python render.py --song "MySong.mp3" --json "MySong_timing.json" --template rap --action render

# Render 'verticalglass' with custom background image and lyric color
python render.py --song "MySong.mp3" --json "MySong_timing.json" --template verticalglass --bg-image "Superstar.png" --color "#E0E7FF" --action render

# Render 'justlyrics' with Google Font, custom size, and background
python render.py --song "MySong.mp3" --json "MySong_timing.json" --template justlyrics --bg-image "Elephant_Sunrise.png" --color "#FFFFFF" --font-family "Montserrat" --font-size 72 --action render

# Render both MP4 and launch Remotion Studio
python render.py --song "MySong.mp3" --json "MySong_timing.json" --template feelgood --action both
```

### CLI Flag Reference
| Flag | Description | Type / Accepted Values | Example |
| :--- | :--- | :--- | :--- |
| `--song` | MP3 filename inside `input/` | String | `--song "Song.mp3"` |
| `--json` | Lyrics JSON filename inside `output/` | String | `--json "Song_timing.json"` |
| `--template` | Template slug identifier | `sad`, `rap`, `feelgood`, `energetic`, `backgrounds`, `verticalglass`, `justlyrics` | `--template verticalglass` |
| `--bg-image` | Background image file from `backgrounds/` | String (`.png`, `.jpg`, `.webp`) | `--bg-image "Radhima.png"` |
| `--color` | Highlight hex color code | Hex color string | `--color "#F5C842"` |
| `--font-family` | Google Font family name *(JustLyrics)* | String (valid Google Font) | `--font-family "Outfit"` |
| `--font-size` | Base font size in pixels *(JustLyrics)* | Number or `px` string | `--font-size 64` |
| `--action` | Execution mode | `preview`, `render`, `both` | `--action render` |

---

## 🎬 Transparent Video Overlays (`render_intro.py`)

If you edit your videos inside external software like **CapCut**, **Adobe Premiere Pro**, **DaVinci Resolve**, or **Final Cut Pro**, you can export standalone motion graphics overlays with an alpha channel.

[render_intro.py](file:///d:/Lyrics_Automate/Lyrics_Automate_Project/render_intro.py) renders transparent **Apple ProRes 4444** (`yuva444p10le`) `.mov` files directly into `final_video/`:

```bash
# Export both Intro Slider and Watermark overlays
python render_intro.py

# Export ONLY the 6-second Intro Slider animation
python render_intro.py --intro

# Export ONLY the 45-second Watermark overlay
python render_intro.py --watermark
```

### Exported Compositions:
* **`WatermarkOnly`** (`final_video/Watermark_45s.mov`): 45-second looping transparent watermark badge with YouTube icon positioned at the bottom.
* **`IntroOnly`** (`final_video/IntroAnimation_6s_beta.mov`): 6-second transparent mobile-style Brightness & Volume slider animation.

> 🎬 **CapCut / Premiere Pro Tip**: Import the exported `.mov` files into your video editor and place them on a track directly above your video or photos. Alpha transparency is preserved automatically without requiring any green screen keying.

---

## 💡 Dynamic Intro Animation Mechanism

All 7 templates automatically include the interactive intro animation during the instrumental lead-in before vocals begin:

1. **Automatic Timing Detection**: The engine inspects `words[0].start`. If `words[0].start > 0`, the intro animation runs strictly within `[0, words[0].start]` seconds and automatically unmounts as soon as the first lyric is sung.
2. **Interactive UI Concept**: Displays mobile control center sliders:
   - **Brightness slider** (left, with `SunMedium` icon) smoothly slides down.
   - **Volume slider** (right, with `Volume2` icon) smoothly slides up.
3. **Smooth Cubic Easing**: Interpolated with smooth easing (`t < 0.5 ? 2*t*t : -1 + (4-2*t)*t`) with micro fade-in and fade-out phases.
4. **Adaptive Contrast Theming**: Uses relative luminance calculation (`shared/utils.ts`) to automatically switch intro slider text and accents between `white` and `black` based on the background color luminance.

---

## 🏗️ Architecture & Technical Highlights

* **Single Master Composition Pattern**: Video rendering flows through `LyricsVideo` ([MasterComposition.tsx](file:///d:/Lyrics_Automate/Lyrics_Automate_Project/remotion/src/MasterComposition.tsx)), which dynamically renders only the selected template component. This avoids compiling unused templates and drastically reduces rendering memory overhead.
* **Dynamic Asset Synchronization**: When `render.py` executes, `sync_selected_assets()` copies the selected audio into `remotion/public/assets/`, copies required background imagery to `remotion/public/backgrounds/`, and produces `active_timing.json` loaded by `calculateMetadata`.
* **Rspack Compilation**: Enabled via `remotion.config.ts` (`Config.setRspack(true)`) for lightning-fast bundling, instant hot-reloading in Remotion Studio, and rapid cold starts.
* **GPU Acceleration**: Configured with `--gl=angle` and `--concurrency=50%` for reliable hardware-accelerated video rendering on Windows.
* **Dynamic Google Fonts**: In the `justlyrics` template, fonts are loaded on-the-fly from `@remotion/google-fonts` via [GoogleFontLoader.tsx](file:///d:/Lyrics_Automate/Lyrics_Automate_Project/remotion/src/templates/JustLyrics/GoogleFontLoader.tsx).

---

## 🛠️ Troubleshooting & Tips

* **Transcription Accuracy**: If a word is slightly mistranscribed or phonetically off, edit the corresponding entry in `output/<song>_timing.json`. The `text`, `start`, or `end` values can be modified directly; Remotion will immediately pick up changes upon re-running `render.py`.
* **Missing FFmpeg**: Ensure `ffmpeg` and `ffprobe` are installed on your machine and accessible via your terminal (`ffmpeg -version`).
* **Studio Port**: Remotion Studio runs by default on port `3000` (`http://localhost:3000`). If port 3000 is occupied, you can change the port flag in `render.py` (`--port=3001`).
* **Hardware Rendering**: If you experience rendering crashes on older GPUs, remove `--gl=angle` from `render.py` to use CPU/software rendering (`--gl=swangle`).

---

## 📄 License
This project is private and maintained for automated lyric video production.
