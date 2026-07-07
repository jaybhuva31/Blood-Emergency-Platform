from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import BloodRequest
from .serializers import BloodRequestSerializer
from donor.models import Donor
from accounts.models import CustomUser

# Utility function to create a notification records atomically
def create_app_notification(user, title, message, n_type='ALERT'):
    from notification.models import Notification
    try:
        Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=n_type
        )
    except Exception as e:
        print(f"Error creating notification: {e}")


class BloodRequestCreateView(APIView):
    """
    Create Blood Request API
    POST: Allows receivers to create an emergency blood request.
    Automatically logs notifications to all matching available donors in the patient's city.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != 'RECEIVER':
            return Response({"detail": "Only receivers can submit blood requests."}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = BloodRequestSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            blood_request = serializer.save(receiver=request.user)
            
            # 1. Alert the receiver of successful submission
            create_app_notification(
                user=request.user,
                title="Blood Request Created",
                message=f"Your emergency request {blood_request.request_id} has been posted successfully. We are searching for matching donors.",
                n_type='ALERT'
            )

            # 2. Alert nearby compatible available donors (Matching Engine trigger)
            target_group = blood_request.blood_group
            target_city = blood_request.hospital_address  # Look in hospital address
            
            # Fetch donors matching group, availability, and city
            donors = Donor.objects.filter(
                blood_group=target_group,
                availability=True
            )
            # Find donors in the same city
            matching_donors = [d for d in donors if d.city.lower() in blood_request.hospital_address.lower() or d.city.lower() in blood_request.hospital_name.lower()]
            
            for d in matching_donors:
                create_app_notification(
                    user=d.user,
                    title="EMERGENCY: Blood Request Nearby!",
                    message=f"An emergency request ({blood_request.request_id}) for blood group {target_group} was posted at {blood_request.hospital_name}.",
                    n_type='ALERT'
                )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RequestHistoryListView(APIView):
    """
    Request History List API
    GET: Returns a list of requests.
    - For Receivers: Returns requests they created.
    - For Donors: Returns requests they accepted.
    - If query parameter 'pending=true' is set: Returns all open 'PENDING' requests in the system.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        role = request.user.role
        pending_only = request.query_params.get('pending') == 'true'

        if pending_only:
            # Open requests ready to be claimed
            requests = BloodRequest.objects.filter(status='PENDING')
        elif role == 'RECEIVER':
            requests = BloodRequest.objects.filter(receiver=request.user)
        elif role == 'DONOR':
            requests = BloodRequest.objects.filter(assigned_donor=request.user)
        else:
            requests = BloodRequest.objects.all()

        serializer = BloodRequestSerializer(requests, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class AcceptBloodRequestView(APIView):
    """
    Accept Blood Request API
    PATCH: Allows a donor to accept an active request.
    Binds the request to the donor and changes status to 'ACCEPTED'.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, request_id):
        if request.user.role != 'DONOR':
            return Response({"detail": "Only donors can accept blood requests."}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            blood_request = BloodRequest.objects.get(request_id=request_id)
        except BloodRequest.DoesNotExist:
            return Response({"detail": "Request not found."}, status=status.HTTP_404_NOT_FOUND)

        if blood_request.status != 'PENDING':
            return Response({"detail": "This request is no longer open."}, status=status.HTTP_400_BAD_REQUEST)

        # Assign donor and set status to ACCEPTED
        blood_request.assigned_donor = request.user
        blood_request.status = 'ACCEPTED'
        blood_request.save()

        # Send notifications
        # 1. Notify Receiver
        create_app_notification(
            user=blood_request.receiver,
            title="Donor Found!",
            message=f"Donor '{request.user.first_name or request.user.username}' has accepted your request {blood_request.request_id}. Contact: {request.user.phone}.",
            n_type='ALERT'
        )
        # 2. Notify Donor
        create_app_notification(
            user=request.user,
            title="Request Claimed",
            message=f"You have accepted request {blood_request.request_id}. Please coordinate with the hospital.",
            n_type='ALERT'
        )

        serializer = BloodRequestSerializer(blood_request, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class RejectBloodRequestView(APIView):
    """
    Reject/Cancel Claim API
    PATCH: Allows a donor to cancel their acceptance, returning the request status to 'PENDING'.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, request_id):
        try:
            blood_request = BloodRequest.objects.get(request_id=request_id)
        except BloodRequest.DoesNotExist:
            return Response({"detail": "Request not found."}, status=status.HTTP_404_NOT_FOUND)

        if blood_request.assigned_donor != request.user:
            return Response({"detail": "You are not assigned to this request."}, status=status.HTTP_403_FORBIDDEN)

        # Release assignment
        blood_request.assigned_donor = None
        blood_request.status = 'PENDING'
        blood_request.save()

        # Notify receiver
        create_app_notification(
            user=blood_request.receiver,
            title="Donor Cancelled",
            message=f"The assigned donor has released request {blood_request.request_id}. The status has been returned to Pending.",
            n_type='ALERT'
        )

        return Response({"message": "Request released successfully. Status returned to Pending."}, status=status.HTTP_200_OK)


class CompleteBloodRequestView(APIView):
    """
    Complete Blood Request API
    PATCH: Marks request as 'COMPLETED'.
    Increments the donor's donation count and logs the date.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, request_id):
        try:
            blood_request = BloodRequest.objects.get(request_id=request_id)
        except BloodRequest.DoesNotExist:
            return Response({"detail": "Request not found."}, status=status.HTTP_404_NOT_FOUND)

        # Either receiver or the assigned donor can mark completed
        if request.user != blood_request.receiver and request.user != blood_request.assigned_donor:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        if blood_request.status not in ['ACCEPTED', 'DONOR_ON_THE_WAY']:
            return Response({"detail": "Request cannot be completed from its current state."}, status=status.HTTP_400_BAD_REQUEST)

        blood_request.status = 'COMPLETED'
        blood_request.save()

        # Increment Donor statistics
        if blood_request.assigned_donor:
            try:
                donor_prof = blood_request.assigned_donor.donor_profile
                donor_prof.donation_count += 1
                donor_prof.last_donation_date = timezone.now().date()
                donor_prof.save()
            except Donor.DoesNotExist:
                pass  # Skip if donor profile not fully set up in database

            # Notify donor
            create_app_notification(
                user=blood_request.assigned_donor,
                title="Donation Completed!",
                message=f"Thank you! Request {blood_request.request_id} has been marked completed. You saved a life!",
                n_type='REMINDER'
            )

        # Notify receiver
        create_app_notification(
            user=blood_request.receiver,
            title="Blood Request Completed",
            message=f"Your request {blood_request.request_id} has been marked completed successfully.",
            n_type='ALERT'
        )

        serializer = BloodRequestSerializer(blood_request, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class CancelBloodRequestView(APIView):
    """
    Cancel Blood Request API
    PATCH: Allows the receiver to cancel their request.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, request_id):
        try:
            blood_request = BloodRequest.objects.get(request_id=request_id)
        except BloodRequest.DoesNotExist:
            return Response({"detail": "Request not found."}, status=status.HTTP_404_NOT_FOUND)

        if blood_request.receiver != request.user:
            return Response({"detail": "You do not own this request."}, status=status.HTTP_403_FORBIDDEN)

        blood_request.status = 'CANCELLED'
        blood_request.save()

        # Notify donor if assigned
        if blood_request.assigned_donor:
            create_app_notification(
                user=blood_request.assigned_donor,
                title="Request Cancelled",
                message=f"The patient has cancelled blood request {blood_request.request_id}.",
                n_type='ALERT'
            )

        return Response({"message": "Request cancelled successfully."}, status=status.HTTP_200_OK)


class TrackBloodRequestView(APIView):
    """
    Track Blood Request API
    GET: Returns a single blood request's full workflow status path.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, request_id):
        try:
            blood_request = BloodRequest.objects.get(request_id=request_id)
            serializer = BloodRequestSerializer(blood_request, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except BloodRequest.DoesNotExist:
            return Response({"detail": "Request not found."}, status=status.HTTP_404_NOT_FOUND)
