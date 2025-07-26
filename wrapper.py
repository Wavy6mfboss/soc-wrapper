"""
Tiny shim that lets us bundle the Self-Operating-Computer CLI with PyInstaller.

Usage (inside PyInstaller bundle):
    operate_runner.exe <SOC arguments…>

All command-line arguments are passed straight through to the real CLI.
"""

import runpy
import sys


def main() -> None:  # pragma: no cover
    # Delegate to `python -m self_operating_computer.cli`
    runpy.run_module("self_operating_computer.cli", run_name="__main__")


if __name__ == "__main__":
    main()
