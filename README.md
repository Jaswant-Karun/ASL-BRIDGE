# ASL Bridge

ASL Bridge connects speech, text, and presentation content with American Sign Language resources.

## Structure

- `frontend/` React + Vite client
- `backend/` Express API
- `docs/` architecture and API documentation

## Setup

```bash
npm run install:all
npm run dev
```

## Local gesture model

The project includes a local KNN classifier trained from `Dataset/American`; it does not require an AI API key.

```bash
python backend/scripts/train_asl_model.py
```

The trained artifact is used by `POST /api/asl/predict` with an image field named `image`. The frontend client helper is `predictDatasetGesture`.
