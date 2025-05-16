import sys
import os
import subprocess
from datetime import datetime

def base_dir() -> str:
    """Return the folder that really contains bin/ and library/"""
    if getattr(sys, "_MEIPASS", None):          # running from PyInstaller temp
        return os.path.join(sys._MEIPASS)       # e.g. …\_MEI12345
    # running from unpacked resources folder during development / electron start
    return os.path.dirname(os.path.abspath(__file__))

def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: wrapper.py \"<goal>\"")
        sys.exit(1)

    goal = sys.argv[1]
    root = base_dir()

    exe_path = os.path.join(root, "bin", "operate_runner.exe")
    library_dir = os.path.join(root, "library")
    os.makedirs(library_dir, exist_ok=True)

    plan_file = datetime.now().isoformat(timespec="seconds").replace(":", "-") + ".json"
    out_file = os.path.join(library_dir, plan_file)

    if not os.path.exists(exe_path):
        print(f"❌ Binary not found at: {exe_path}", file=sys.stderr)
        sys.exit(1)

    # show exactly what we will run
    print("Launching:", exe_path, "--prompt", goal, flush=True)

    try:
        proc = subprocess.run(
            [exe_path, "--prompt", goal],
            capture_output=True,
            text=True,
            check=True,
        )
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(proc.stdout)

        print(f"✅ Plan saved to {out_file}")

    except subprocess.CalledProcessError as e:
        print("❌ Error:", e, file=sys.stderr)
        print(e.stderr, file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
