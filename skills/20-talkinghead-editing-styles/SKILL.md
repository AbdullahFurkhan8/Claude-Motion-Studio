---
name: 20-talkinghead-editing-styles
description: 'Pick and apply one of 20 ready-made motion/editing styles (particles, liquid morph, holographic, neon glow, wireframe 3D, glassmorphism, kinetic type, isometric, clay 3D, ASCII art, gradient mesh, comic book, split-flap, retro VHS, halftone, Bauhaus, pixel art, blueprint, Art Deco, neo-brutalism) for talking-head and raw-footage edits: intros, hooks, title cards, lower thirds and transparent overlays. Use when the user wants an edit style, a styled intro or overlay, "make my talking-head video look like X", or asks which of the 20 styles to use.'
---

# 20 Talking-Head Editing Styles (index)

Each style is its own skill in a sub-folder of this directory. Every one ships a **working animated `template.html`** plus a deterministic `render.py`, so the result looks the same every time and renders to MP4, a transparent overlay or a PNG still. This file is the index: choose the style, then open that style's `SKILL.md` and follow it.

Folder: `skills/20-talkinghead-editing-styles/` (inside the plugin: `${CLAUDE_PLUGIN_ROOT}/skills/20-talkinghead-editing-styles/`).
Also here: `README.md` (install and usage), `gallery.html` (open in Chrome to see all 20 running live) and `PREVIEW-all-20-styles.mp4` / `.jpg` (when present).

## Step 1: choose the style

If the user names a style or number, use it. Otherwise ask what the clip is for (hook, title card, lower third, outro, full-screen scene) and the mood, then recommend one or two from the table. Offer to render a short still of each before committing.

| # | Folder (skill name) | Look | Best for |
|---|---|---|---|
| 01 | `motion-particles` | Thousands of glowing dots drift, gather into a word, hold, explode | Hooks, logo/word reveals, "magic" moments |
| 02 | `motion-liquid-morph` | Liquid-chrome metaballs merge and split, pastel iridescent sheen | Premium/tech intros, beauty and product |
| 03 | `motion-holographic` | Holographic foil ring | Futuristic reveals, AI/crypto topics |
| 04 | `motion-neon-glow` | Neon sign that flickers on, wet-floor reflection | Nightlife, gaming, "LIVE"/"OPEN" cards |
| 05 | `motion-wireframe-3d` | Torus-knot wireframe draws itself, spins in perspective | Tech, data, engineering topics |
| 06 | `motion-glassmorphism` | Frosted-glass UI widgets over moving colour blobs | App promos, SaaS, UI explainers |
| 07 | `motion-kinetic-type` | Punchy kinetic typography | Hooks, quotes, lyric-style captions |
| 08 | `motion-isometric` | Isometric block city | Business, real estate, "build" stories |
| 09 | `motion-clay-3d` | Soft clay toys bouncing with squash and stretch | Friendly brands, kids, playful promos |
| 10 | `motion-ascii-art` | ASCII art | Developer/hacker content |
| 11 | `motion-gradient-mesh` | Flowing mesh gradient | Backgrounds, calm/premium title cards |
| 12 | `motion-comic-book` | Comic-book page | Storytelling, comedy, "POW" reactions |
| 13 | `motion-split-flap` | Airport split-flap departures board | Countdowns, schedules, announcements |
| 14 | `motion-retro-vhs` | 80s synthwave VHS scene | Retro, music, nostalgia |
| 15 | `motion-halftone` | Halftone print art | Editorial, punk/zine, bold posters |
| 16 | `motion-bauhaus` | Bauhaus geometric grid | Design, art, clean modern explainers |
| 17 | `motion-pixel-art` | 8-bit pixel-art scene | Gaming, retro tech |
| 18 | `motion-blueprint` | Technical blueprint | Engineering, how-it-works, product specs |
| 19 | `motion-art-deco` | Art Deco gold reveal | Luxury, finance, awards |
| 20 | `motion-neo-brutalism` | Neo-brutalist UI motion | Startups, bold social posts |

## Step 2: render

1. Open `<style-folder>/SKILL.md` and read its style contract, motion and parameters. Do not break the contract (colours, timings and layout are what keep the style recognisable).
2. Check requirements once: Python 3, `pip install playwright && playwright install chromium`, and `ffmpeg`.
3. Render from inside the style folder:
   ```bash
   python3 render.py template.html out.mp4 --text "YOUR WORD" --sub "small line" --w 1080 --h 1920 --dur 5
   ```
   Every style takes the same controls: `--w --h` size, `--dur` duration, `--fps`, `--text`, `--sub`, `--set key=hex` colours (for example `--set c1=ff0000`) and `--alpha` for a transparent `.mov` (ProRes 4444) or `.webm` (VP9 alpha) to lay over footage.
4. Look at a still or two (a frame near the start and one mid-animation) before the full render, and fix text that is too long or colours that clash.
5. Save outputs in the user's project folder under a new version name; never overwrite an earlier render.

## Step 3: use it in an edit

- **Raw talking-head footage:** render the style as a transparent overlay (`--alpha`) or a short full-frame card, then place it in the edit at the hook, at section changes and at the outro. Keep the style consistent across the whole video; do not mix more than two.
- **Pacing:** use short cards (2 to 5 s) and cut on the first word of a beat. Pair every card with a whoosh, click or riser from the plugin's `sound-effects/` folder, one sound per on-screen event, never trains of small pops.
- **Captions:** the kinetic-type, comic-book and neo-brutalism styles double as caption treatments; match their colours to the card style you chose.
- For a full production (script, voiceover, captions, SFX, mixing, QA), hand off to the `motion-video-director` skill (`skills/motion-graphics-skill/`), which loads these styles when editing raw footage.

## Notes

- Everything is original code with no external libraries or CDNs; templates use system fonts. To brand a template, add a font file and change the font stack at the top of `template.html`.
- Animations are deterministic (seeded randomness), so identical settings give identical video.
- Free to use and remix, including in client work. Do not resell the pack as-is.
