"""
Portable entry-point for the Self-Operating-Computer CLI.

We import the real console-script target (`self_operating_computer.cli:main`)
and just delegate to it.  PyInstaller will freeze *this* file as a single,
self-contained EXE that Electron calls at runtime.
"""
import sys

try:
    # SOC ≥ 1.5.x
    from self_operating_computer.cli import main
except ImportError:                       # very old versions
    from self_operating_computer import main  # type: ignore

if __name__ == "__main__":
    sys.exit(main())          # forward user args & propagate exit-code
