from logging.handlers import TimedRotatingFileHandler
from logging import StreamHandler, basicConfig, INFO
import os


# same code as professsor, added check to see if logs folder exists, create if it doesn't
def setup_logging():
    os.makedirs("./logs", exist_ok=True)
    console_log = StreamHandler()
    file_log = TimedRotatingFileHandler("./logs/app.log", when="d", interval=1)
    basicConfig(
        level=INFO,
        format="%(asctime)s %(levelname).4s %(name)s:%(lineno)d %(message)s",
        handlers=[console_log, file_log],
    )
