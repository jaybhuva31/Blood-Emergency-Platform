from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import CustomUser
from .serializers import (
    UserRegisterSerializer,
    OtpVerificationSerializer,
    ResendOtpSerializer,
    UserLoginSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    UserDetailSerializer
)

# Helper function to generate JWT tokens for user
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    # Add custom claims
    refresh['role'] = user.role
    refresh['username'] = user.username
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

# Helper function to send OTP email (SMTP + Console Fallback)
def send_otp_email(user, otp):
    subject = 'Blood Donor Emergency System - OTP Verification'
    message = f"""
    Hello {user.username},

    Thank you for registering on the Blood Donor Emergency System.
    Your OTP for verification is: {otp}

    This OTP will expire in 10 minutes.

    Best regards,
    The Blood Donor Emergency Team
    """
    
    # 1. Print OTP to console for easy testing (very helpful for college demo)
    print("\n" + "="*50)
    print(f"  [OTP EMAIL SENT TO: {user.email}]")
    print(f"  YOUR 6-DIGIT OTP IS: {otp}")
    print("="*50 + "\n")
    
    # 2. Try to send real email
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)} (Using console OTP fallback)")
        return False


class UserRegisterView(APIView):
    """API endpoint for signing up a new user."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Generate OTP code
            otp = user.generate_otp()
            # Send OTP email
            send_otp_email(user, otp)
            
            return Response({
                "message": "Registration successful. Please verify the OTP sent to your email.",
                "email": user.email,
                "role": user.role
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OtpVerificationView(APIView):
    """API endpoint to verify account registration via OTP."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OtpVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp_code = serializer.validated_data['otp_code']
            
            user = CustomUser.objects.get(email=email)
            if user.verify_otp_code(otp_code):
                return Response({
                    "message": "Account verified successfully. You can now log in."
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "otp_code": ["Invalid or expired OTP code."]
                }, status=status.HTTP_400_BAD_REQUEST)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResendOtpView(APIView):
    """API endpoint to regenerate and resend OTP."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResendOtpSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = CustomUser.objects.get(email=email)
            
            # Generate new OTP
            otp = user.generate_otp()
            # Send OTP
            send_otp_email(user, otp)
            
            return Response({
                "message": "A new OTP has been sent to your email."
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    """API endpoint to log in a user and return JWT tokens."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = get_tokens_for_user(user)
            
            # Add user details to response
            user_serializer = UserDetailSerializer(user)
            
            return Response({
                "message": "Login successful.",
                "tokens": tokens,
                "user": user_serializer.data
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    """API endpoint to request password reset OTP."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = CustomUser.objects.get(email=email)
            
            # Generate OTP code
            otp = user.generate_otp()
            # Send OTP email
            send_otp_email(user, otp)
            
            return Response({
                "message": "Password reset OTP has been sent to your email.",
                "email": email
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    """API endpoint to reset password using the OTP."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            new_password = serializer.validated_data['new_password']
            
            # Set new password
            user.set_password(new_password)
            user.otp_code = None
            user.otp_expiry = None
            user.save()
            
            return Response({
                "message": "Password reset successful. You can now log in with your new password."
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(APIView):
    """API endpoint to get the authenticated user's details."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
