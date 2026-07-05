"""
DRF Serializers for user authentication and game state.
"""

from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile, GameSession


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for the UserProfile model."""

    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    win_rate = serializers.FloatField(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "id", "username", "email", "display_name",
            "elo_rating", "games_played", "games_won",
            "win_rate", "avatar_url", "created_at",
        ]
        read_only_fields = ["id", "elo_rating", "games_played", "games_won", "created_at"]


class RegisterSerializer(serializers.Serializer):
    """Serializer for user registration."""

    username = serializers.CharField(max_length=150, min_length=3)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    display_name = serializers.CharField(max_length=50, required=False, default="")

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def create(self, validated_data):
        display_name = validated_data.pop("display_name", "")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        UserProfile.objects.create(user=user, display_name=display_name)
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class GameSessionSerializer(serializers.ModelSerializer):
    """Serializer for game session data."""

    white_player_name = serializers.CharField(source="white_player.username", read_only=True)
    black_player_name = serializers.SerializerMethodField()

    class Meta:
        model = GameSession
        fields = [
            "id", "white_player_name", "black_player_name",
            "status", "result", "fen", "pgn",
            "time_control", "created_at", "updated_at",
        ]

    def get_black_player_name(self, obj):
        return obj.black_player.username if obj.black_player else None
