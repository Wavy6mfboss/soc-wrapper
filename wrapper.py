#!/usr/bin/env python3
"""
CLI wrapper for Self-Operating Computer.
Usage: python wrapper.py "your goal here"
"""
import argparse
import subprocess
from datetime import datetime
from pathlib import Path

# Ensure the library folder exists
LIB_DIR = Path(__file__).parent / "library"
LIB_DIR.mkdir(exist_ok=True)

def main():
    # 1) Read the goal from CLI args
    parser = argparse.ArgumentParser(
        description="Send a goal to SOC and save its plan."
    )
    parser.add_argument("goal", nargs="+", help="Your objective")
    args = parser.parse_args()
    goal_txt = " ".join(args.goal)

    # 2) Call SOC by passing the goal as a prompt
    proc = subprocess.run(
        ["operate", "--prompt", goal_txt],
        text=True,
        capture_output=True,
        check=True
    )
    plan = proc.stdout.strip()

    # 3) Save JSON to library with a timestamped filename
    stamp = datetime.now().strftime("%Y-%m-%dT%H-%M-%S")
    out_file = LIB_DIR / f"{stamp}.json"
    out_file.write_text(plan)

    # ASCII‑only print
    print(f"Plan saved to {out_file}")

if __name__ == "__main__":
    main()
