from pathlib import Path
import sys

import uvicorn


BASE_DIR = Path(__file__).resolve().parent
sys.stdout = (BASE_DIR / "server.log").open("a", buffering=1, encoding="utf-8")
sys.stderr = (BASE_DIR / "server.err.log").open("a", buffering=1, encoding="utf-8")

uvicorn.run("main:app", host="127.0.0.1", port=8000)
