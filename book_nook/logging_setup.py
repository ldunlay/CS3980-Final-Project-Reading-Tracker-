from logging.handlers import TimedRotatingFileHandler
from logging import StreamHandler, basicConfig, INFO
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
LOGS_DIR = BASE_DIR / "logs"


def setup_logging():
    LOGS_DIR.mkdir(exist_ok=True)
    console_log = StreamHandler()
    file_log = TimedRotatingFileHandler(LOGS_DIR / "app.log", when="d", interval=1)
    basicConfig(
        level=INFO,
        format="%(asctime)s %(levelname).4s %(name)s:%(lineno)d %(message)s",
        handlers=[console_log, file_log],
    )
