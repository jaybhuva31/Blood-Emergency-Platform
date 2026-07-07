from rest_framework import serializers
from .models import Receiver
from accounts.models import CustomUser
from donor.serializers import CustomUserMiniSerializer

class ReceiverProfileSerializer(serializers.ModelSerializer):
    """
    Receiver Profile Serializer
    Serializes hospital context, target patient requirements, and timing details.
    Includes custom update triggers for nested first_name and last_name elements.
    """
    user = CustomUserMiniSerializer(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Receiver
        fields = '__all__'
        read_only_fields = ('user',)

    def update(self, instance, validated_data):
        # Retrieve context request to access input details
        request = self.context.get('request')
        if request:
            user_data = request.data
            user = instance.user
            
            # Extract and update user attributes
            if 'first_name' in user_data:
                user.first_name = user_data.get('first_name')
            if 'last_name' in user_data:
                user.last_name = user_data.get('last_name')
            if 'phone' in user_data:
                user.phone = user_data.get('phone')
            user.save()

        # Update Receiver fields
        return super().update(instance, validated_data)
