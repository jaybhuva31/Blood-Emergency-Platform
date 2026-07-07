from rest_framework import serializers
from .models import Donor
from accounts.models import CustomUser

class CustomUserMiniSerializer(serializers.ModelSerializer):
    """
    Sub-serializer for nested CustomUser profile fields.
    Allows returning and updating first_name, last_name, and phone via the profile endpoint.
    """
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_verified')
        read_only_fields = ('id', 'username', 'email', 'role', 'is_verified')


class DonorProfileSerializer(serializers.ModelSerializer):
    """
    Donor Profile Serializer
    Serializes all attributes of the Donor model.
    Handles nested user details and maps them to JSON output.
    """
    user = CustomUserMiniSerializer(read_only=True)
    
    # Read-only fields derived from timestamps
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Donor
        fields = '__all__'
        read_only_fields = ('user',)

    def update(self, instance, validated_data):
        # Retrieve context request to access nested JSON input
        request = self.context.get('request')
        if request:
            # Check for nested user parameters
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

        # Update the Donor model fields
        return super().update(instance, validated_data)
