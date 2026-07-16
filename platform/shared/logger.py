# --- Shared Platform Logger Setup ---
import logging
import sys

def get_platform_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    
    # Avoid duplicate handlers if logger already initialized
    if logger.hasHandlers():
        return logger
        
    logger.setLevel(logging.INFO)
    
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s] - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    
    # Console stream handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    return logger
