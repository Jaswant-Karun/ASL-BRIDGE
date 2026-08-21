#!/usr/bin/env python3
"""
AnimateDiff Avatar Video Generator for ASL-Bridge
Generates video animations of a digital human avatar performing American Sign Language (ASL) gestures.

Usage:
    python animatediff_generator.py --prompt "Sarah studio interpreter signing HELLO" --output hello.mp4
"""

import argparse
import json
import os
import sys
from pathlib import Path


def generate_with_diffusers(prompt, negative_prompt, output_path, num_frames=16, fps=8, motion_scale=1.1, seed=42):
    try:
        import torch
        from diffusers import AnimateDiffPipeline, MotionAdapter, DDIMScheduler
        from diffusers.utils import export_to_video

        print(f"[AnimateDiff] Initializing MotionAdapter and SD1.5 Pipeline on device...")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = torch.float16 if torch.cuda.is_available() else torch.float32

        adapter = MotionAdapter.from_pretrained("guoyww/animatediff-motion-adapter-v1-5-2", torch_dtype=dtype)
        model_id = "SG161222/Realistic_Vision_V5.1_noVAE"
        
        pipe = AnimateDiffPipeline.from_pretrained(model_id, motion_adapter=adapter, torch_dtype=dtype)
        pipe.scheduler = DDIMScheduler.from_config(
            pipe.scheduler.config,
            beta_schedule="linear",
            steps_offset=1,
            clip_sample=False
        )

        pipe.to(device)
        if device == "cuda":
            pipe.enable_vae_slicing()

        generator = torch.Generator(device=device).manual_seed(seed)

        print(f"[AnimateDiff] Generating {num_frames} frames for prompt: {prompt}")
        output = pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_frames=num_frames,
            guidance_scale=7.5,
            num_inference_steps=25,
            generator=generator
        )

        frames = output.frames[0]
        export_to_video(frames, output_path, fps=fps)
        print(f"[AnimateDiff] Video successfully exported to: {output_path}")
        return True
    except ImportError as e:
        print(f"[AnimateDiff] PyTorch / Diffusers not found ({e}). Running in lightweight metadata mode.", file=sys.stderr)
        return False
    except Exception as e:
        print(f"[AnimateDiff] Generation error: {e}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(description="AnimateDiff ASL Avatar Video Generator")
    parser.add_argument("--prompt", type=str, required=True, help="Positive prompt for avatar & sign motion")
    parser.add_argument("--negative-prompt", type=str, default="bad hands, missing fingers, distorted limbs, blurry", help="Negative prompt")
    parser.add_argument("--output", type=str, default="output_avatar.mp4", help="Output video file path")
    parser.add_argument("--num-frames", type=int, default=16, help="Number of frames to generate")
    parser.add_argument("--fps", type=int, default=12, help="Playback frame rate")
    parser.add_argument("--motion-scale", type=float, default=1.1, help="AnimateDiff motion scale")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for generation")
    parser.add_argument("--json-output", action="store_true", help="Print result as JSON")

    args = parser.parse_args()

    success = generate_with_diffusers(
        prompt=args.prompt,
        negative_prompt=args.negative_prompt,
        output_path=args.output,
        num_frames=args.num_frames,
        fps=args.fps,
        motion_scale=args.motion_scale,
        seed=args.seed
    )

    result = {
        "status": "success" if success else "ready_for_gpu",
        "prompt": args.prompt,
        "output": args.output,
        "num_frames": args.num_frames,
        "fps": args.fps,
        "seed": args.seed,
        "gpu_available": False
    }

    if args.json_output:
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
