"""
URL routing for the core app API endpoints.
"""

from django.urls import path
from . import views

app_name = "core"

urlpatterns = [
    # Authentication
    path("auth/register/", views.register_view, name="register"),
    path("auth/login/", views.login_view, name="login"),
    path("auth/logout/", views.logout_view, name="logout"),
    path("auth/me/", views.current_user_view, name="current-user"),

    # Game state
    path("game/", views.game_state_view, name="game-list"),
    path("game/<int:game_id>/", views.game_state_view, name="game-detail"),
    path("game/create/", views.create_game_view, name="game-create"),
]
