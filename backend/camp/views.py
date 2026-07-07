from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import DonationCamp, CampRegistration
from .serializers import DonationCampSerializer, CampRegistrationSerializer
from requests.views import create_app_notification

class CampListView(APIView):
    """
    Camp List API
    GET: Returns all donation camps.
    Filters: Optional 'status' parameter ('UPCOMING' or 'COMPLETED').
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        status_param = request.query_params.get('status')
        camps = DonationCamp.objects.all()
        
        if status_param:
            camps = camps.filter(status=status_param)
            
        serializer = DonationCampSerializer(camps, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CampDetailsView(APIView):
    """
    Camp Details API
    GET: Returns details of a specific donation camp.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            camp = DonationCamp.objects.get(pk=pk)
        except DonationCamp.DoesNotExist:
            return Response({"detail": "Camp not found."}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = DonationCampSerializer(camp)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RegisterCampView(APIView):
    """
    Register Camp API
    POST: Registers the logged-in user to attend a donation camp.
    Creates a confirmation notification.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, camp_id):
        try:
            camp = DonationCamp.objects.get(pk=camp_id)
        except DonationCamp.DoesNotExist:
            return Response({"detail": "Camp not found."}, status=status.HTTP_404_NOT_FOUND)

        if camp.status == 'COMPLETED':
            return Response({"detail": "Cannot register for a completed camp."}, status=status.HTTP_400_BAD_REQUEST)

        # Check for existing registration
        if CampRegistration.objects.filter(camp=camp, user=request.user).exists():
            return Response({"detail": "You are already registered for this camp."}, status=status.HTTP_400_BAD_REQUEST)

        registration = CampRegistration.objects.create(camp=camp, user=request.user)

        # Notify user with their check-in details (viva winner feature!)
        create_app_notification(
            user=request.user,
            title="Camp Registration Confirmed",
            message=f"You successfully registered for '{camp.name}' on {camp.date}. Save your QR code for rapid check-in: {camp.qr_code_data}",
            n_type='CAMP'
        )

        serializer = CampRegistrationSerializer(registration, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CampRegistrationCheckInView(APIView):
    """
    Camp Registration Check-In API
    PATCH: Allows admins or camp coordinators to scan and check in users.
    Takes 'qr_code_data' and marks 'attended = True'.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        qr_data = request.data.get('qr_code_data')
        username = request.data.get('username')

        if not qr_data or not username:
            return Response({"detail": "Both qr_code_data and username are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            camp = DonationCamp.objects.get(qr_code_data=qr_data)
        except DonationCamp.DoesNotExist:
            return Response({"detail": "Invalid QR code data."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            registration = CampRegistration.objects.get(camp=camp, user__username=username)
        except CampRegistration.DoesNotExist:
            return Response({"detail": "No registration found for this user at this camp."}, status=status.HTTP_404_NOT_FOUND)

        if registration.attended:
            return Response({"detail": "User already checked in."}, status=status.HTTP_400_BAD_REQUEST)

        # Mark attended
        registration.attended = True
        registration.save()

        # Generate thank-you notification
        create_app_notification(
            user=registration.user,
            title="Thank You for Donating!",
            message=f"Your attendance has been confirmed at '{camp.name}'. Thank you for your contribution to saving lives!",
            n_type='CAMP'
        )

        return Response({
            "message": f"Successfully checked in {username} at {camp.name}.",
            "attended": True
        }, status=status.HTTP_200_OK)
