from rest_framework import serializers
from .models import BloodRequest
from donor.serializers import CustomUserMiniSerializer

class BloodRequestSerializer(serializers.ModelSerializer):
    """
    BloodRequest Serializer
    Serializes all request parameters.
    Embeds sub-serializers for detailed profiles of the patient/receiver and the helper/donor.
    """
    receiver_details = CustomUserMiniSerializer(source='receiver', read_only=True)
    donor_details = CustomUserMiniSerializer(source='assigned_donor', read_only=True)
    
    # Read-only fields
    request_id = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = BloodRequest
        fields = '__all__'
        read_only_fields = ('receiver', 'assigned_donor', 'request_id')
