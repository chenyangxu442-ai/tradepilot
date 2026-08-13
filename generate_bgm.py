"""
Generate ambient BGM for "长安语痕" - version 2
Gentle pad + sparse bell-like notes, no plucked strings
"""
import math
import struct
import wave

SR = 22050
BPM = 60
BEAT = 60.0 / BPM

def freq(note):
    return 440.0 * (2 ** ((note - 69) / 12.0))

# --- Warm pad: sustained chords with slow LFO ---
def make_pad(duration, notes, vol=0.06):
    s = int(duration * SR)
    out = [0.0] * s
    for note in notes:
        f = freq(note)
        for i in range(s):
            t = i / SR
            # Slow swell
            env = 0.3 + 0.7 * (0.5 + 0.5 * math.sin(2 * math.pi * 0.08 * t))
            # Gentle vibrato
            v = math.sin(2 * math.pi * f * t + 0.005 * math.sin(2 * math.pi * 3.0 * t))
            # Second detuned voice for warmth
            v2 = math.sin(2 * math.pi * f * 1.002 * t)
            out[i] += (v + v2 * 0.7) * env * vol * 0.5
    return out

# --- Bell tone: pure sine with long decay ---
def bell(midi_note, dur, vol=0.15):
    s = int(dur * SR)
    f = freq(midi_note)
    out = [0.0] * s
    for i in range(s):
        t = i / SR
        env = math.exp(-t * 2.5)  # long exponential decay
        v = math.sin(2 * math.pi * f * t)
        # Add 3rd harmonic softly
        v += 0.3 * math.sin(2 * math.pi * f * 3 * t) * math.exp(-t * 5)
        out[i] += v * env * vol
    return out

# --- Wind noise: filtered noise ---
def wind(dur, vol=0.008):
    s = int(dur * SR)
    out = [0.0] * s
    # Low-pass by averaging
    prev = 0.0
    for i in range(s):
        raw = (hash(i * 137 + 42) & 0xFFFF) / 65536.0 * 2 - 1
        sm = prev * 0.99 + raw * 0.01
        prev = sm
        env = 0.5 + 0.5 * math.sin(2 * math.pi * 0.05 * (i / SR))
        out[i] = sm * env * vol
    return out

# Song structure: 4 phrases in D minor pentatonic (D F G A C)
# Phrase 1
p1_notes = [43, 48, 55]  # D2, D3, G3
p1_bells = [(60, 2.5), (62, 2.0), (65, 3.0), (67, 2.5)]  # D4 E4 F4 G4
# Phrase 2
p2_notes = [41, 48, 53]  # A1, D3, F3
p2_bells = [(67, 2.5), (65, 2.0), (62, 3.0), (60, 2.5)]  # G4 F4 E4 D4
# Phrase 3
p3_notes = [43, 50, 57]  # D2, A2, D4
p3_bells = [(62, 2.5), (60, 2.0), (55, 3.0), (53, 2.5)]  # E4 D4 G3 F3
# Phrase 4
p4_notes = [41, 48, 55]  # A1, D3, G3
p4_bells = [(55, 2.5), (53, 2.0), (50, 3.0), (48, 2.5)]  # G3 F3 A2 D3

phrases = [
    (p1_notes, p1_bells),
    (p2_notes, p2_bells),
    (p3_notes, p3_bells),
    (p4_notes, p4_bells),
]

total_duration = 60.0
total_samples = int(total_duration * SR)
audio = [0.0] * total_samples

# Build
pos = 0
beat_dur = BEAT  # 1 sec at 60 BPM

for phrase_idx, (pad_notes, bell_notes) in enumerate(phrases):
    phrase_dur = 15.0
    # Pad chord
    pad = make_pad(phrase_dur, pad_notes, vol=0.05)
    ps = len(pad)
    for i in range(ps):
        if pos + i < total_samples:
            audio[pos + i] += pad[i]

    # Wind layer
    w = wind(phrase_dur, vol=0.006)
    for i in range(len(w)):
        if pos + i < total_samples:
            audio[pos + i] += w[i]

    # Bells spread across the phrase
    bell_pos = 0
    for midi_note, dur in bell_notes:
        b = bell(midi_note, dur, vol=0.12)
        bs = len(b)
        for i in range(bs):
            if pos + bell_pos + i < total_samples:
                audio[pos + bell_pos + i] += b[i]
        bell_pos += int(dur * SR)

    pos += int(phrase_dur * SR)

# Normalize
mx = max(abs(v) for v in audio)
if mx > 0:
    scale = 0.75 / mx
else:
    scale = 1.0

wav_path = r'F:\长安\assets\music\changan_bgm.wav'
with wave.open(wav_path, 'w') as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    for v in audio:
        s = max(-32768, min(32767, int(v * scale * 32767)))
        wf.writeframes(struct.pack('<h', s))

print(f'Saved: {wav_path}')
print(f'{total_duration:.0f}s, mono, {SR}Hz, 16-bit')
