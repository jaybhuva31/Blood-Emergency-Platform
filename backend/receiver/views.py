from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Receiver
from .serializers import ReceiverProfileSerializer

class IsReceiverUser(permissions.BasePermission):
    """
    Custom Permission
    Ensures that only users registered with the 'RECEIVER' role can access these endpoints.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'RECEIVER'


class ReceiverProfileView(APIView):
    """
    Receiver Profile API
    GET: Retrieves the logged-in user's receiver profile.
    POST: Creates a receiver profile for the logged-in user.
    PUT: Updates receiver/hospital requirements parameters.
    """
    permission_classes = [permissions.IsAuthenticated, IsReceiverUser]

    def get(self, request):
        try:
            receiver = request.user.receiver_profile
            serializer = ReceiverProfileSerializer(receiver, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Receiver.DoesNotExist:
            return Response({
                "detail": "Receiver profile not found.",
                "has_profile": False
            }, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        # Prevent duplicate profiles
        if hasattr(request.user, 'receiver_profile'):
            return Response({
                "detail": "Profile already exists. Use PUT endpoint to update."
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = ReceiverProfileSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        try:
            receiver = request.user.receiver_profile
        except Receiver.DoesNotExist:
            return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReceiverProfileSerializer(receiver, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
