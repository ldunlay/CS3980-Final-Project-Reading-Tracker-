from pathlib import Path
import sys

BOOK_NOOK_DIR = Path(__file__).resolve().parent / "book_nook"

if str(BOOK_NOOK_DIR) not in sys.path:
    sys.path.insert(0, str(BOOK_NOOK_DIR))

from book_nook.main import app  # noqa: E402

