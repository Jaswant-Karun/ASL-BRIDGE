#!/usr/bin/env python3
"""Transcribe one audio file with the local faster-whisper runtime."""
import argparse
import json
import os
from pathlib import Path

from faster_whisper import WhisperModel

parser = argparse.ArgumentParser()
parser.add_argument('--audio', type=Path, required=True)
parser.add_argument('--model', default=os.getenv('WHISPER_MODEL', 'tiny'))
args = parser.parse_args()

model = WhisperModel(args.model, device=os.getenv('WHISPER_DEVICE', 'cpu'), compute_type=os.getenv('WHISPER_COMPUTE_TYPE', 'int8'))
segments, info = model.transcribe(str(args.audio), beam_size=5, vad_filter=True)
items = list(segments)
print(json.dumps({
    'text': ' '.join(segment.text.strip() for segment in items).strip(),
    'language': info.language,
    'languageProbability': float(info.language_probability),
    'model': args.model
}))
