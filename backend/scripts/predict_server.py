#!/usr/bin/env python3
"""Persistent ASL prediction server.

Loads the trained model once at startup and serves predictions over HTTP so the
Node backend can call it without spawning a new Python process per frame.

Usage:
    python backend/scripts/predict_server.py
    python backend/scripts/predict_server.py --model backend/models/asl-knn.joblib --port 5001
"""

import argparse
import io
import json
import logging
import os
from pathlib import Path

import joblib
import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError

# ---------------------------------------------------------------------------
# Flask import — lightweight WSGI server, no heavy dependencies needed.
# ---------------------------------------------------------------------------
try:
    from flask import Flask, jsonify, request as flask_request
except ImportError:
    raise SystemExit(
        "Flask is required. Install it with:  pip install flask"
    )

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
IMAGE_SIZE = (24, 24)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [predict_server] %(message)s")
log = logging.getLogger(__name__)

app = Flask(__name__)

# Loaded once at startup — shared across all requests.
_classifier = None
_model_path: Path | None = None


# ---------------------------------------------------------------------------
# Feature extraction (mirrors train_asl_model.py exactly)
# ---------------------------------------------------------------------------

def _extract_feature(img_bytes: bytes) -> np.ndarray:
    image = Image.open(io.BytesIO(img_bytes)).convert("L")
    image = ImageOps.autocontrast(image).resize(IMAGE_SIZE)
    pixels = np.asarray(image, dtype=np.float32) / 255.0
    return pixels.reshape(1, -1)  # shape (1, 576) for sklearn


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": str(_model_path)})


@app.route("/predict", methods=["POST"])
def predict():
    if _classifier is None:
        return jsonify({"error": "Model not loaded"}), 503

    file = flask_request.files.get("image")
    if file is None:
        return jsonify({"error": "No image provided"}), 400

    try:
        img_bytes = file.read()
        features = _extract_feature(img_bytes)
    except (OSError, UnidentifiedImageError) as exc:
        return jsonify({"error": f"Could not read image: {exc}"}), 422

    try:
        prediction = _classifier.predict(features)[0]
        probabilities = _classifier.predict_proba(features)[0]
    except Exception as exc:  # noqa: BLE001
        log.exception("Prediction failed")
        return jsonify({"error": f"Prediction failed: {exc}"}), 500

    ranked = sorted(
        zip(_classifier.classes_, probabilities),
        key=lambda item: item[1],
        reverse=True,
    )
    top_matches = [
        {"label": label, "confidence": float(score)} for label, score in ranked[:5]
    ]

    return jsonify(
        {
            "prediction": str(prediction),
            "confidence": float(ranked[0][1]),
            "topMatches": top_matches,
        }
    )


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    global _classifier, _model_path

    parser = argparse.ArgumentParser(description="ASL persistent prediction server")
    parser.add_argument(
        "--model",
        default=os.environ.get(
            "ASL_MODEL_PATH",
            str(Path(__file__).resolve().parents[2] / "backend" / "models" / "asl-knn.joblib"),
        ),
        type=Path,
        help="Path to the trained .joblib model file",
    )
    parser.add_argument(
        "--port",
        default=int(os.environ.get("ASL_PREDICT_PORT", "5001")),
        type=int,
        help="Port to listen on (default: 5001)",
    )
    parser.add_argument(
        "--host",
        default=os.environ.get("ASL_PREDICT_HOST", "127.0.0.1"),
        help="Host to bind to (default: 127.0.0.1)",
    )
    args = parser.parse_args()

    _model_path = args.model.resolve()
    if not _model_path.exists():
        raise SystemExit(
            f"Model file not found: {_model_path}\n"
            "Train the model first:\n"
            "  python backend/scripts/train_asl_model.py"
        )

    log.info("Loading model from %s …", _model_path)
    _classifier = joblib.load(_model_path)
    log.info("Model loaded. Classes: %s", list(_classifier.classes_))
    log.info("Starting prediction server on %s:%s", args.host, args.port)

    # Use threaded=True so multiple concurrent requests don't block each other.
    app.run(host=args.host, port=args.port, threaded=True, debug=False)


if __name__ == "__main__":
    main()
