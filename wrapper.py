#!/usr/bin/env python3
"""
Call the Self‑Operating Computer tool and save its JSON plan.
Usage: python wrapper.py "open google.com"
"""
import argparse
import subprocess
from datetime import datetime
from pathlib import Path
import sys
import shutil

ROOT_DIR = Path(__file__).parent           # .../soc-wrapper
LIB_DIR  = ROOT_DIR / "library"
LIB_DIR.mkdir(exist_ok=True)

def find_operate_cli() -> str:
    """
    Return the absolute path to .venv/Scripts/operate.exe if it exists,
    otherwise just 'operate' (hoping it's on the PATH).
    """
    venv_cli = ROOT_DIR / ".venv" / "Scripts" / "operate.exe"
    return str(venv_cli) if venv_cli.exists() else "operate"

def main() -> None:
    parser = argparse.ArgumentParser(description="Get SOC plan for a goal")
    parser.add_argument("goal", nargs="+", help="Your objective")
    args = parser.parse_args()
    goal_txt = " ".join(args.goal)

    operate_cmd = [find_operate_cli(), "--prompt", goal_txt]

    # On Windows, CreateProcess needs the .exe to exist
    if not shutil.which(operate_cmd[0]):
        sys.exit(f"ERROR: cannot find {operate_cmd[0]}")

    proc = subprocess.run(
        operate_cmd,
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
