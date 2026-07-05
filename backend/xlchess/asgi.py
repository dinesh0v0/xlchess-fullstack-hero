"""
ASGI config for XLChess project.

Prepared for future WebSocket support via Django Channels
for real-time chess game communication.
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "xlchess.settings")

application = get_asgi_application()
