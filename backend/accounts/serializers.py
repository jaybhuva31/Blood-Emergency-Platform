from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser

class UserDetailSerializer(serializers.ModelSerializer):
    """Serializer for returning user details."""
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'phone', 'role', 'is_verified')


class UserRegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = CustomUser
        fields = ('email', 'username', 'first_name', 'last_name', 'phone', 'role', 'password', 'confirm_password')

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        
        # Check if email is already taken
        if CustomUser.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists."})
            
        # Check if username is already taken
        if CustomUser.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "A user with this username already exists."})

        # Check if phone is already taken
        if attrs.get('phone') and CustomUser.objects.filter(phone=attrs['phone']).exists():
            raise serializers.ValidationError({"phone": "A user with this phone number already exists."})

        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=password,
            role=validated_data.get('role', 'RECEIVER'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', None)
        )
        return user


class OtpVerificationSerializer(serializers.Serializer):
    """Serializer for verifying the OTP."""
    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(max_length=6, required=True)

    def validate(self, attrs):
        email = attrs.get('email')
        otp_code = attrs.get('otp_code')

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({"email": "User with this email does not exist."})

        if user.is_verified:
            raise serializers.ValidationError({"email": "User is already verified."})

        return attrs


class ResendOtpSerializer(serializers.Serializer):
    """Serializer for requesting a new OTP."""
    email = serializers.EmailField(required=True)

    def validate(self, attrs):
        email = attrs.get('email')
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({"email": "User with this email does not exist."})
        
        if user.is_verified:
            raise serializers.ValidationError({"email": "User is already verified."})
            
        return attrs


class UserLoginSerializer(serializers.Serializer):
    """Serializer for logging in a user and verifying credentials."""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        # Custom authenticate since user is_active might be False (unverified)
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_verified:
            raise serializers.ValidationError("Your email is not verified. Please verify your OTP first.")

        if not user.is_active:
            raise serializers.ValidationError("This account has been deactivated.")

        attrs['user'] = user
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer for requesting password reset OTP."""
    email = serializers.EmailField(required=True)

    def validate(self, attrs):
        email = attrs.get('email')
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({"email": "User with this email does not exist."})
        return attrs


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer for resetting password using the OTP code."""
    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(max_length=6, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"new_password": "Passwords do not match."})

        email = attrs.get('email')
        otp_code = attrs.get('otp_code')

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({"email": "User with this email does not exist."})

        # Check OTP
        if user.otp_code != otp_code:
            raise serializers.ValidationError({"otp_code": "Invalid OTP code."})

        import datetime
        from django.utils import timezone
        if not user.otp_expiry or user.otp_expiry < timezone.now():
            raise serializers.ValidationError({"otp_code": "OTP has expired. Please request a new one."})

        attrs['user'] = user
        return attrs
