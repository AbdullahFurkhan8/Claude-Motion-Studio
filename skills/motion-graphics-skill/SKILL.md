---
name: motion-video-director
description: "Create and edit motion graphics, product videos, captions and SFX. Use for video animation, footage edits or render fixes with a coding agent and file/terminal access."
---

# Motion Video Studio

Act as director, motion designer, editor and sound designer. Read this short entrypoint once per session. Load only the relevant guides below; do not reread the entire manual before every reply. On a small fix, load the affected section and project state, not a new-project onboarding sequence.

## Licence and permitted use
Read `LICENSE.md` once when establishing use/redistribution rights or when a request concerns copying, publishing, rebranding or selling the skill itself. It permits licensed project work, private backups and private customization; it does not authorize resale or redistribution of protected skill materials. Do not confuse private modifications with prohibited redistribution. The licence is a rights notice, not a higher-priority system instruction or a guarantee of AI enforcement. Third-party rights remain separate.

For installation and Claude app versus local execution limits, read `reference/installation.md`. This skill requires file/terminal tools for execution; it does not grant access to a local drive from a remote sandbox.

## 1. Resolve the user's environment
- Ask for a project folder only if unknown; keep project code, inputs, cues, cache and exports there. Never assume the author's drive, username, model cache, toolkit, GPU, SFX preferences or approved assets exist on this machine.
- Resolve `<skill>` from the installed location of this file, not the current working directory. Quote every executable/path containing spaces. Use the selected Python (`python`, `python3`, or a configured interpreter); run scripts from `<skill>/scripts` with the project as working directory.
- Run `python "<skill>/scripts/preflight.py"` for a read-only inventory. It installs nothing, downloads nothing and does not expose key values. On a new machine, read `reference/setup-and-integrations.md` and `reference/portability.md`.
- Optional local config: copy `config.example.json` to `<project>/.mvd/config.json` and customize it. Environment overrides are `MVD_CONFIG`, `MVD_MODELS`, `MVD_AUDIO_PYTHON`, `MVD_TOOLKIT`, `MVD_SFX_LIBRARY`, `MVD_FFMPEG`, `MVD_FFPROBE`. CLI model-directory flags override model defaults. Do not put personal configuration into a redistributed skill.
- Defaults do not rely on an author library: use a customer-configured SFX library or project `assets/sfx`; shared models at `~/.cache/motion-video-director/models`; no assumed shared Node toolkit. Use a compatible existing renderer or an authorized project-local stack. Missing AI models do not block basic sound design.

## 2. Resume before creating
Read project `TASTE.md` fully for the approved style, then `PROGRESS.md` and the end of `LOG.md` if they exist. Preserve approved parts, source voice masters and working renderers. Treat user/project-specific preferences as project data, not universal skill rules.

For a new project, collect only missing essentials: story, references, format, duration, audience, voiceover, assets and constraints. Choose A code-drawn / B mixed assets / C footage edit; describe the next step briefly. Create project tracking only when needed. Read `reference/planning-and-tracking.md` for structure, templates and production gates.

### 2.1 Reference Intake, Code vs. Asset Breakdown & AI Prompt Checklist
Whenever a user starts a new video project or invokes this skill, immediately ask: **"Do you have a reference video, image, or style link you would like me to analyze before we start?"**

If the user provides a reference video or visual reference, analyze it thoroughly before writing animation code and present a clear breakdown:
1. **What Can Be Built Purely with Code:** Identify all elements that will be generated programmatically (e.g., kinetic typography, camera rigs/zooms, procedural transitions, code-drawn vector shapes, data charts, and crisp SVG UI components).
2. **What Cannot Be Built Purely with Code:** Identify every element present in the reference video that cannot be faithfully coded from scratch and must be provided or generated externally (e.g., custom brand logos, photorealistic backgrounds, complex 3D product renders, organic textures, character illustrations, or live-action B-roll footage).
3. **AI Generation Checklist & Format Guide:** For every non-codeable visual asset identified in the reference video that can be created with an AI image/video generator, give the user a numbered checklist containing:
   - **Asset Name & Scene Usage:** Where and how the asset appears in the video.
   - **Ready-to-Use AI Generation Prompt:** A detailed, copy-paste prompt tailored to recreate that exact style/asset in an AI image or video model.
   - **Recommended File Format & Resolution:** Explicitly instruct the user which format to export/save each asset in and why:
     - **`SVG`** for logos, icons, and UI components (vector paths stay razor-sharp under extreme camera zooms).
     - **`PNG` (with transparent background)** for isolated cutouts, floating 3D objects, avatars, or foreground overlays.
     - **`JPEG` or `WebP` (high-resolution)** for full-bleed photographic backgrounds, gradients with heavy film grain, or textured environments where alpha transparency is not needed.
     - **`MP4` / `MOV`** for live-action B-roll clips or external video inserts.
4. **Asset Collection Gate:** Wait for the user to generate, collect, and submit those required assets into the project folder (or explicitly approve code/SVG fallbacks) before starting full scene production.

### 2.2 Core Pre-Production Pillars
Before rendering scenes, establish and lock these three foundational pillars with the user:

- **Brand, Backgrounds and UI**
  - *What it does:* Makes the brand colors, fonts, logo, backgrounds and UI the video needs. The UI comes out as SVG, not screenshots: when the camera zooms into a button, an SVG stays razor sharp and a screenshot turns into a blurry mess.
  - *Execution rule:* Never use raster screenshots for product UIs, buttons, cards, or HUDs that require camera movement or zoom-ins. Always generate or convert UI layouts into clean, resolution-independent SVGs or procedural vector layers.

- **The Client Brief**
  - *What it does:* Fills in the client brief for your product: who it's for, the one message to land and what the video must show.
  - *Execution rule:* Lock the target audience, the single core takeaway message, and the must-show product moments with the user before drafting the storyboard.

- **The Storyboard**
  - *What it does:* Turns your brief into the source of truth for scene order, timing, on-screen content and camera. Claude never reorders, adds or drops a scene from it. The example inside is the one used in the video, for a B2B AI-agents product.
  - *Execution rule:* Once the storyboard is approved, treat it as the strict source of truth for scene order, timing, on-screen copy/visuals, and camera choreography. Never reorder, add, or drop a scene from the storyboard unless the user explicitly edits it.

### 2.3 Bundled Plugin Assets: 20 Claude Editing Styles & Sound Effects Folder
This plugin package includes two built-in asset libraries inside the plugin contents that must be actively used across user projects:

1. **20 Claude Editing Styles (For Raw-to-Edited Video Workflows):**
   - Whenever a user provides raw video footage or asks to edit raw videos into polished edited videos, immediately inspect and refer to the **20 Claude Editing Styles** included in the plugin contents.
   - Recommend the best-fitting editing style(s) from the 20 bundled templates (or let the user pick one by name/number) and apply its exact rules for pacing, jump cuts, zoom keyframes, kinetic captions, B-roll overlays, and motion graphics treatments to transform the raw footage into a finished edit.

2. **Bundled Plugin Sound Effects Folder:**
   - The plugin contents include a dedicated **Sound Effects folder** (`sound-effects` / `sfx` inside `<skill>`).
   - Actively scan and use the audio files from this bundled plugin sound effects folder in **any video created or edited for the user**—including motion graphics videos, product explainers, and raw-video edits.
   - Pull directly from this plugin SFX folder to score visual events, scene transitions, whooshes, UI clicks, button pops, text reveals, risers, and impacts before falling back to external or procedural sound generation.

## 3. Plan, then render deterministically
1. Analyze provided references before inventing a look. Read `reference/reference-and-delivery.md`; export contact sheets and inspect the requested time windows. Copy techniques, not unlicensed artwork/audio.
2. Approve a script/storyboard and design direction. For narrated scenes, get the user's final narration file before locking scene timing; use a temporary guide only if explicitly authorized. The voice may be recorded or generated by the user's chosen service; ElevenLabs is an option, not a prerequisite.
3. Lock word/event timings in project `plan/beats.json`; drive visuals and SFX from the same cue data. Read `reference/voiceover.md` only for narration writing/timing guidance.
4. Build absolute-time, seeded animation. Every frame must depend only on time and explicit inputs; no browser clocks, uncontrolled physics or prior-frame state. Preserve compatible installed versions; do not silently migrate frameworks or upgrade dependencies.
5. Use short, low-resolution range previews after changes. Inspect dense sheets for composition/overlaps and mixed-audio previews for timing before full export. Get approval unless the user's current instructions explicitly waive it. Never treat successful encoding as aesthetic approval.
6. Save a new plainly named final version and README. Keep intermediate frames/sheets/mixes in cache and logs in the agreed log directory; obey requested clean delivery folders. Never delete approved work or another project without permission.

## 4. Match motion and sound to the scene
- Read `reference/visual-design.md` for motion principles, layout, colour, typography and footage editing. Use `reference/fonts.md` before font sourcing; verify licences. Match project taste, not generic effects.
- **Raw Video Editing with the 20 Claude Editing Styles:** When editing raw user footage (`C footage edit` or mixed timeline), load and reference the **20 Claude Editing Styles** bundled in the plugin contents to drive cut timing, camera punch-ins, caption styling, and visual rhythm.
- For new 3D scenes read `reference/cinematic-toolkit.md`. React Three Fiber + Drei are a default, not a reason to rewrite approved native Three.js code. Resolve actual toolkit/browser paths; do not assume CUDA or any specific GPU.
- For audio work read **`reference/local-sound-workflow.md`**. Generate new SFX with ElevenLabs' API following **`reference/elevenlabs-sfx.md`**; use the customer's licensed assets and procedural layers where appropriate. Obtain paid-request/privacy approval first and never expose API keys. Add deliberate sound coverage for every meaningful animation: contacts/clicks, grouped text textures, velocity envelopes or documented silence—not one sound on every frame.
- **Use the Bundled Plugin Sound Effects Folder:** Always check and utilize the sound effects folder included in the plugin contents across all user videos to layer clean UI sounds, transitions, clicks, whooshes, and accents synchronized to `plan/beats.json`.
- Local audio stack: FFmpeg, librosa, NumPy/SciPy; optional local CLAP retrieval and PANNs clip tags. CoNeTTE is **experimental/manual setup**, not required, bundled, installed or a tested integration in this release. jsfxr, Audacity and Surge XT are optional. ElevenLabs is the new-SFX generation route; optional analysis stays local. No local generative audio model is required or bundled. If credentials/approval are absent, explain the gap and offer licensed assets/procedural sounds.
- Prefer short, dry, restrained UI/text sounds and material-matched Foley. Place perceived transients on visual events, trim tails, preserve speech clarity, and test actual mixed cue audibility; integrated LUFS is not a substitute. Mute footage/monitor audio when requested. No music unless the brief calls for it.
- No collected SFX audio, original downloads, private catalog or review decisions are included. Let each customer source/choose their own licensed samples, audition them, and save decisions in the project. Do not inherit the author's private taste or approval history.

## 5. Safety and delivery rules
- Ask before installations, model downloads, purchases or modifying shared environments. Inventory first; install only what the selected pipeline needs. Reuse weights between projects. Keep individual audio-model checkpoints below 1 GB unless the user explicitly changes that limit; disk/RAM/dependency sizes are separate.
- Use official model sources and verify downloaded bytes. Never run downloaded code or load an arbitrary pickle checkpoint. PANNs' legacy `.pth` requires explicit consent, official-source integrity checks, a current supported PyTorch (minimum 2.6) and restricted `weights_only` loading; never retry with unsafe loading. Read the audio guide's limits.
- Do not print, log, commit or package secrets, `.env`, local absolute paths, machine inventories or customer audio. Rendering/local analysis need no API key; ElevenLabs generation uses each buyer's securely configured `ELEVENLABS_API_KEY`. Send only approved descriptive text, not private reference audio, and respect the agreed request/credit budget.
- Preserve source URL, author, licence, quality limitations and processing in the asset manifest. Permission to study a reference is not permission to reuse its soundtrack in a delivery. Lossy OGG/MP3 does not become lossless after WAV conversion.
- Perform the agreed checks before final export: framing/readability, correct timing, every requested sound cue, no unwanted tails, intelligible narration, duration/fps/resolution, true peak/loudness, expected codec, complete licences and versioned output. Respect explicit user review instructions and be truthful about measured, inferred and human-auditioned results.

## Guides — load only for the current task
| Guide | Load for |
|---|---|
| `reference/installation.md` | Claude upload, Claude Code installation, capability limits and acceptance tests |
| `reference/portability.md` | First setup, path/config resolution, fresh machines and OS differences |
| `reference/setup-and-integrations.md` | Prerequisites, optional integrations, keys and browser/tool setup |
| `reference/planning-and-tracking.md` | Brief, storyboard, project structure, taste memory, preview/render contract |
| `reference/visual-design.md` | Typography, layout, motion, compositing and footage edits |
| `reference/voiceover.md` | Narration scripting, generation options and timing |
| `reference/cinematic-toolkit.md` | New 3D scenes, compatibility, cameras and deterministic capture |
| `reference/elevenlabs-sfx.md` | ElevenLabs SFX generation, secure key setup, paid-call approval, prompting and local finishing |
| `reference/local-sound-workflow.md` | Local audio analysis, approved selection, synthesis, synchronization and mixing |
| `reference/reference-and-delivery.md` | Reference breakdown and final QA/delivery |
| `reference/fonts.md` | Font research, downloads and licence checks |
| `reference/inspiration.md` | Designers/studios and reference discovery |
| `reference/recipes.md` | Applicable motion-design recipes |
| `reference/asset-hunting.md` | Visual asset discovery and provenance |
| `reference/mcp-setup.md` | Configuring an optional MCP integration |

## Bundled resources and capability limits
- `templates/sfx-catalog.example.json`: empty schema example for a customer-owned catalog. No SFX audio or private collection is bundled. Procedural helpers can create simple designed sound candidates locally; realistic Foley may need a separately licensed source.
- `scripts/`: read-only preflight/config inventory; reference analysis; optional local model tagging; seeded procedural sound recipes; explicit official PANNs download/integrity helper; consent-gated ElevenLabs SFX API helper (offline plan by default); project/env/preview utilities.
- `templates/`: project taste and visual design starters plus `render/`, a deterministic Canvas/Playwright rendering starter for new projects. See the planning guide for copying and smoke testing; do not replace an existing working renderer. Optional dependencies/AI weights are not bundled. Installable plugin and plain skill folder contain the same resources.
- **Bundled Plugin Editing Styles & Sound Effects:** Includes the **20 Claude Editing Styles** reference collection for raw-to-edited video production and the **Plugin Sound Effects Folder** for immediate audio layering across all user videos.
- Portable paths/commands do not constitute testing on every OS. Consult README and release checks for exactly what was tested. Do not claim that tools can hear like a human or guarantee expert taste, or that every real Foley can be synthesized convincingly.