"""
API views for user authentication and game state management.
"""

from django.contrib.auth import authenticate, login, logout
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import UserProfile, GameSession
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserProfileSerializer,
    GameSessionSerializer,
)


@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    """
    Register a new user account.

    POST /api/auth/register/
    Body: { "username": "...", "email": "...", "password": "...", "display_name": "..." }
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)
        profile = user.profile
        return Response(
            {
                "message": "Account created successfully.",
                "user": UserProfileSerializer(profile).data,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    Log in with existing credentials.

    POST /api/auth/login/
    Body: { "username": "...", "password": "..." }
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = authenticate(
            request,
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )
        if user is not None:
            login(request, user)
            profile = user.profile
            return Response(
                {
                    "message": "Login successful.",
                    "user": UserProfileSerializer(profile).data,
                }
            )
        return Response(
            {"error": "Invalid credentials."},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Log out the current user.

    POST /api/auth/logout/
    """
    logout(request)
    return Response({"message": "Logged out successfully."})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    Get the currently authenticated user's profile.

    GET /api/auth/me/
    """
    profile = request.user.profile
    return Response(UserProfileSerializer(profile).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def game_state_view(request, game_id=None):
    """
    Retrieve game session state.

    GET /api/game/              — list active games
    GET /api/game/<game_id>/    — get specific game state
    """
    if game_id:
        try:
            game = GameSession.objects.get(id=game_id)
            return Response(GameSessionSerializer(game).data)
        except GameSession.DoesNotExist:
            return Response(
                {"error": "Game not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    games = GameSession.objects.filter(status__in=["waiting", "active"])[:20]
    return Response(GameSessionSerializer(games, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_game_view(request):
    """
    Create a new game session.

    POST /api/game/create/
    Body: { "time_control": 600 }
    """
    time_control = request.data.get("time_control", 600)
    game = GameSession.objects.create(
        white_player=request.user,
        time_control=time_control,
    )
    return Response(
        GameSessionSerializer(game).data,
        status=status.HTTP_201_CREATED,
    )
