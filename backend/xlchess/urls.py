"""
XLChess URL Configuration.

Routes API requests to the core app and provides a health-check
endpoint for UptimeRobot monitoring.
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health_check(request):
    """Lightweight health-check endpoint for UptimeRobot / uptime monitoring."""
    return JsonResponse({"status": "ok", "service": "xlchess-api"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("core.urls")),
    path("health/", health_check, name="health-check"),
]
