#!/usr/bin/env python3
import os
import signal
import subprocess
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

processes: list[subprocess.Popen] = []


def start_process(command: list[str], cwd: Path) -> subprocess.Popen:
    return subprocess.Popen(command, cwd=str(cwd))


def shutdown() -> None:
    for proc in processes:
        if proc.poll() is None:
            proc.send_signal(signal.SIGTERM)
    for proc in processes:
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()


def main() -> int:
    try:
        print("Starting backend...")
        processes.append(
            start_process(
                [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--port", "8000"],
                BACKEND_DIR,
            )
        )

        print("Starting frontend...")
        processes.append(start_process(["npm", "run", "dev"], FRONTEND_DIR))

        print("Frontend: http://localhost:5173")
        print("Backend:  http://localhost:8000")

        while True:
            for proc in processes:
                if proc.poll() is not None:
                    return proc.returncode or 0
    except KeyboardInterrupt:
        return 0
    finally:
        shutdown()


if __name__ == "__main__":
    raise SystemExit(main())
