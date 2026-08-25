#!/usr/bin/env python3
"""Train a local ASL alphabet/number classifier from Dataset/American.

The model uses deterministic grayscale image features and K-nearest neighbours.
It is intentionally local and requires no hosted AI service or API key.
"""

import argparse
import json
from pathlib import Path

import joblib
import numpy as np
from PIL import Image, UnidentifiedImageError
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score

IMAGE_SIZE = (24, 24)
VALID_EXTENSIONS = {'.jpg', '.jpeg', '.png'}


def extract_feature(image_path: Path) -> np.ndarray:
    image = Image.open(image_path).convert('L').resize(IMAGE_SIZE)
    pixels = np.asarray(image, dtype=np.float32) / 255.0
    return pixels.reshape(-1)


def load_dataset(dataset_dir: Path, max_per_class: int = 0):
    features = []
    labels = []
    for label_dir in sorted(dataset_dir.iterdir()):
        if not label_dir.is_dir() or len(label_dir.name) != 1:
            continue
        image_paths = sorted(label_dir.iterdir())
        if max_per_class > 0:
            image_paths = image_paths[:max_per_class]
        for image_path in image_paths:
            if image_path.suffix.lower() not in VALID_EXTENSIONS:
                continue
            try:
                features.append(extract_feature(image_path))
                labels.append(label_dir.name)
            except (OSError, UnidentifiedImageError):
                continue
    if not features:
        raise ValueError(f'No supported images found in {dataset_dir}')
    return np.asarray(features), np.asarray(labels)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dataset', default='Dataset/American', type=Path)
    parser.add_argument('--output', default='backend/models/asl-knn.joblib', type=Path)
    parser.add_argument('--predict', type=Path, help='Predict one image with an existing model')
    parser.add_argument('--max-per-class', default=0, type=int, help='Optional cap for quick local smoke training')
    parser.add_argument('--neighbors', default=3, type=int, help='Number of nearest examples used during prediction')
    parser.add_argument('--algorithm', choices=['knn', 'random-forest', 'mlp'], default='knn', help='Static classifier to train')
    args = parser.parse_args()

    if args.predict:
        classifier = joblib.load(args.output)
        features = [extract_feature(args.predict)]
        prediction = classifier.predict(features)[0]
        probabilities = classifier.predict_proba(features)[0]
        ranked = sorted(zip(classifier.classes_, probabilities), key=lambda item: item[1], reverse=True)
        print(json.dumps({'prediction': prediction, 'confidence': float(ranked[0][1]), 'topMatches': [
            {'label': label, 'confidence': float(score)} for label, score in ranked[:3]
        ]}, indent=2))
        return

    features, labels = load_dataset(args.dataset, args.max_per_class)
    if args.algorithm == 'random-forest':
        classifier = RandomForestClassifier(n_estimators=160, max_features='sqrt', n_jobs=-1, random_state=42)
    elif args.algorithm == 'mlp':
        classifier = Pipeline([
            ('scale', StandardScaler()),
            ('mlp', MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=35, early_stopping=True, random_state=42)),
        ])
    else:
        classifier = Pipeline([
            ('scale', StandardScaler()),
            ('knn', KNeighborsClassifier(n_neighbors=args.neighbors, weights='distance', n_jobs=-1)),
        ])

    test_size = 0.2 if len(features) >= 10 else 0.0
    if test_size:
        train_x, test_x, train_y, test_y = train_test_split(
            features, labels, test_size=test_size, random_state=42, stratify=labels
        )
        classifier.fit(train_x, train_y)
        accuracy = float(accuracy_score(test_y, classifier.predict(test_x)))
    else:
        classifier.fit(features, labels)
        accuracy = None

    args.output.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(classifier, args.output)
    metadata = {
        'model': args.algorithm,
        'feature': '24x24 grayscale pixels',
        'classes': sorted(set(labels.tolist())),
        'samples': int(len(labels)),
        'validationAccuracy': accuracy,
        'artifact': str(args.output),
    }
    print(json.dumps(metadata, indent=2))


if __name__ == '__main__':
    main()
