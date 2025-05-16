import sys
import os
import subprocess
from datetime import datetime

def main():
    if len(sys.argv) < 2:
        print("Usage: wrapper.py \"<goal>\"")
        sys.exit(1)

    goal = sys.argv[1]

    base_dir = os.path.dirname(os.path.abspath(__file__))  # → resources/
    exe_path = os.path.join(base_dir, "bin", "operate_runner.exe")
    library_dir = os.path.join(base_dir, "library")
    os.makedirs(library_dir, exist_ok=True)

    plan_file = datetime.now().isoformat(timespec="seconds").replace(":", "-") + ".json"
    out_file = os.path.join(library_dir, plan_file)

    try:
        if not os.path.exists(exe_path):
            raise FileNotFoundError(f"Binary not found at: {exe_path}")

        print("Launching subprocess with:", [exe_path, "--prompt", goal])

        proc = subprocess.run(
            [exe_path, "--prompt", goal],
            capture_output=True,
            text=True,
            check=True,
        )

        with open(out_file, "w", encoding="utf-8") as f:
            f.write(proc.stdout)

        print(f"Plan saved to {out_file}")

    except subprocess.CalledProcessError as e:
        print("Error during execution:", e, file=sys.stderr)
        print(e.stderr, file=sys.stderr)
        sys.exit(1)

    except FileNotFoundError as fe:
        print(str(fe), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
