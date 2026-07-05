from django.contrib import admin
from .models import UserProfile, GameSession


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "display_name", "elo_rating", "games_played", "games_won"]
    search_fields = ["user__username", "display_name"]
    list_filter = ["elo_rating"]


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ["id", "white_player", "black_player", "status", "result", "created_at"]
    list_filter = ["status", "result"]
    search_fields = ["white_player__username", "black_player__username"]
