# Scratch voice from the built-in Windows voices, for testing timing before the real voiceover exists. Never publish it.
# Usage: powershell -File tools/placeholder_voice.ps1 <video folder>     writes voice_en.wav
param([string]$Ep)
Add-Type -AssemblyName System.Speech
$Ep = (Resolve-Path $Ep).Path
$e = Get-Content (Join-Path $Ep 'episode.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$tmp = Join-Path $Ep '_lines'; New-Item -ItemType Directory -Force $tmp | Out-Null
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $list = @(); $i = 0
foreach ($l in $e.lines) {
  $s.SelectVoice($(if ($l.who -eq 'human') { 'Microsoft David Desktop' } else { 'Microsoft Zira Desktop' }))
  $f = Join-Path $tmp ('{0:d3}.wav' -f $i); $s.SetOutputToWaveFile($f); $s.Speak(($l.text -replace '<[^>]*>', ' ')); $s.SetOutputToNull(); $list += "file '$($f -replace '\\','/')'"; $i++
}
$lf = Join-Path $tmp 'list.txt'; [IO.File]::WriteAllLines($lf, $list)
ffmpeg -v error -y -f concat -safe 0 -i $lf -ar 24000 -ac 1 (Join-Path $Ep 'voice_en.wav')
Remove-Item -Recurse -Force $tmp
