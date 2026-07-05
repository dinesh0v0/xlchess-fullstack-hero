"""
Models for XLChess core app.

Defines UserProfile (extending Django auth) and GameSession
for persisting game state — designed for future WebSocket integration.
"""

from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """Extended user profile for chess-specific data."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    display_name = models.CharField(max_length=50, blank=True)
    elo_rating = models.IntegerField(default=1200)
    games_played = models.IntegerField(default=0)
    games_won = models.IntegerField(default=0)
    avatar_url = models.URLField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-elo_rating"]

    def __str__(self):
        return f"{self.display_name or self.user.username} ({self.elo_rating})"

    @property
    def win_rate(self) -> float:
        """Calculate win rate as a percentage."""
        if self.games_played == 0:
            return 0.0
        return round((self.games_won / self.games_played) * 100, 1)


class GameSession(models.Model):
    """Represents a chess game session between two players."""

    STATUS_CHOICES = [
        ("waiting", "Waiting for opponent"),
        ("active", "In progress"),
        ("completed", "Completed"),
        ("abandoned", "Abandoned"),
    ]

    RESULT_CHOICES = [
        ("white", "White wins"),
        ("black", "Black wins"),
        ("draw", "Draw"),
        ("none", "No result"),
    ]

    white_player = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="white_games"
    )
    black_player = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="black_games",
        null=True, blank=True,
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="waiting")
    result = models.CharField(max_length=10, choices=RESULT_CHOICES, default="none")
    fen = models.CharField(
        max_length=100,
        default="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        help_text="Current board state in FEN notation",
    )
    pgn = models.TextField(blank=True, default="", help_text="Full game notation in PGN format")
    time_control = models.IntegerField(default=600, help_text="Time control in seconds")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        white = self.white_player.username
        black = self.black_player.username if self.black_player else "???"
        return f"{white} vs {black} ({self.status})"
