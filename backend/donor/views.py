from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Donor
from .serializers import DonorProfileSerializer
from accounts.models import CustomUser

class IsDonorUser(permissions.BasePermission):
    """
    Custom Permission
    Ensures that only users registered with the 'DONOR' role can access these endpoints.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'DONOR'


class DonorProfileView(APIView):
    """
    Donor Profile API
    GET: Retrieves the logged-in user's donor profile.
    POST: Creates a donor profile for the logged-in user if it doesn't exist.
    PUT/PATCH: Updates profile parameters including medical reports and coordinates.
    """
    permission_classes = [permissions.IsAuthenticated, IsDonorUser]

    def get(self, request):
        try:
            donor = request.user.donor_profile
            serializer = DonorProfileSerializer(donor, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Donor.DoesNotExist:
            return Response({
                "detail": "Profile not found.",
                "has_profile": False
            }, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        # Prevent duplicate profiles
        if hasattr(request.user, 'donor_profile'):
            return Response({
                "detail": "Profile already exists. Use PUT endpoint to update."
            }, status=status.HTTP_400_BAD_REQUEST)
            
        serializer = DonorProfileSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        try:
            donor = request.user.donor_profile
        except Donor.DoesNotExist:
            return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = DonorProfileSerializer(donor, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ToggleAvailabilityView(APIView):
    """
    Toggle Availability API
    PATCH: Inverts the active availability boolean and status choice for the logged-in donor.
    """
    permission_classes = [permissions.IsAuthenticated, IsDonorUser]

    def patch(self, request):
        try:
            donor = request.user.donor_profile
        except Donor.DoesNotExist:
            return Response({"detail": "Donor profile not found."}, status=status.HTTP_404_NOT_FOUND)

        # Toggle state
        donor.availability = not donor.availability
        donor.status = 'AVAILABLE' if donor.availability else 'ON_LEAVE'
        donor.save()

        return Response({
            "message": "Availability status updated successfully.",
            "availability": donor.availability,
            "status": donor.status
        }, status=status.HTTP_200_OK)


class DonationHistoryView(APIView):
    """
    Donation History API
    GET: Returns a history of past donations for the logged-in donor.
    Includes mock/empty data as a placeholder for Part 3 models.
    """
    permission_classes = [permissions.IsAuthenticated, IsDonorUser]

    def get(self, request):
        # Placeholder data - actual history records will link to DonationHistory table in Part 3
        history = [
            {
                "id": 1,
                "date": "2026-05-15",
                "units": 1,
                "hospital": "City Hospital",
                "patient_name": "Rohan Sharma",
                "status": "COMPLETED"
            },
            {
                "id": 2,
                "date": "2026-02-10",
                "units": 1,
                "hospital": "Red Cross Blood Camp",
                "patient_name": "Camp Donation",
                "status": "COMPLETED"
            }
        ]
        # Return mock list for now to populate components, can return empty list [] if preferred
        return Response(history, status=status.HTTP_200_OK)


class NearbyDonorsView(APIView):
    """
    Nearby Donors API
    GET: Searches for available donors.
    Filters: Optional 'blood_group' and 'city' query parameters.
    Allows receivers to search compatible donors.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        blood_group = request.query_params.get('blood_group')
        city = request.query_params.get('city')

        # Filter active available donors
        donors = Donor.objects.filter(availability=True)

        if blood_group:
            donors = donors.filter(blood_group=blood_group)
        if city:
            donors = donors.filter(city__icontains=city)

        serializer = DonorProfileSerializer(donors, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
