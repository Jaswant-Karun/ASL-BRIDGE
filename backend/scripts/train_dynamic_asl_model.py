#!/usr/bin/env python3
"""Train a GRU classifier from temporal MediaPipe hand landmarks.

Expected input is an .npz file with:
  sequences: float32 array [samples, frames, 21, 3]
  labels: string/integer array [samples]

The camera currently uses the static image model. This script is the upgrade path
for continuous ASL words once labeled landmark sequences are collected.
"""

import argparse
import json
from pathlib import Path

import numpy as np


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', type=Path, required=True, help='NPZ with sequences and labels')
    parser.add_argument('--output', type=Path, default=Path('backend/models/asl-gru.keras'))
    parser.add_argument('--epochs', type=int, default=30)
    args = parser.parse_args()

    try:
        import tensorflow as tf
    except ImportError as error:
        raise SystemExit('Dynamic training requires TensorFlow. Install it with: pip install tensorflow') from error

    dataset = np.load(args.data, allow_pickle=True)
    sequences = np.asarray(dataset['sequences'], dtype='float32')
    labels = np.asarray(dataset['labels'])
    if sequences.ndim != 4 or sequences.shape[2:] != (21, 3):
        raise ValueError('sequences must have shape [samples, frames, 21, 3]')
    if len(sequences) != len(labels):
        raise ValueError('sequences and labels must contain the same number of samples')

    classes, encoded = np.unique(labels, return_inverse=True)
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(sequences.shape[1], 63)),
        tf.keras.layers.Masking(),
        tf.keras.layers.GRU(128, return_sequences=True),
        tf.keras.layers.Dropout(0.25),
        tf.keras.layers.GRU(64),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(len(classes), activation='softmax')
    ])
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    flattened = sequences.reshape(len(sequences), sequences.shape[1], 63)
    history = model.fit(flattened, encoded, validation_split=0.2, epochs=args.epochs, batch_size=32, verbose=1)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    model.save(args.output)
    print(json.dumps({'model': 'GRU', 'classes': classes.tolist(), 'samples': len(labels), 'validationAccuracy': float(max(history.history.get('val_accuracy', [0]))), 'artifact': str(args.output)}))


if __name__ == '__main__':
    main()
