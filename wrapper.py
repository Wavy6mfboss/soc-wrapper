#!/usr/bin/env python3
"""
Call the Self‑Operating Computer tool and save its JSON plan.
Usage: python wrapper.py "open google.com"
"""
import argparse
import subprocess
from datetime import datetime
from pathlib import Path
import shutil
import sys

ROOT_DIR = Path(__file__).parent           # .../soc-wrapper or resources/
LIB_DIR  = ROOT_DIR / "library"
LIB_DIR.mkdir(exist_ok=True)

def build_operate_cmd(goal: str) -> list[str]:
    """Return a command list that invokes the SOC CLI in any environment."""
    # 1) try the venv's operate.exe
    exe = ROOT_DIR / ".venv" / "Scripts" / "operate.exe"
    if exe.exists():
        return [str(exe), "--prompt", goal]

    # 2) if 'operate' is on PATH
    if shutil.which("operate"):
        return ["operate", "--prompt", goal]

    # 3) fall back: python -m operate
    return [sys.executable, "-m", "operate", "--prompt", goal]

def main() -> None:
    parser = argparse.ArgumentParser(description="Get SOC plan for a goal")
    parser.add_argument("goal", nargs="+", help="Your objective")
    args = parser.parse_args()
    goal_txt = " ".join(args.goal)

    cmd = build_operate_cmd(goal_txt)

    proc = subprocess.run(
        cmd,
        text=True,
        capture_output=True,
        check=True,
    )
    plan = proc.stdout.strip()

    stamp = datetime.now().strftime("%Y-%m-%dT%H-%M-%S")
    out_file = LIB_DIR / f"{stamp}.json"
    out_file.write_text(plan)
    print(f"Plan saved to {out_file}")

if __name__ == "__main__":
    main()
