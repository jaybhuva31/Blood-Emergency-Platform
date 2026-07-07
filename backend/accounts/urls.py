from django.urls import path
from .views import (
    UserRegisterView,
    OtpVerificationView,
    ResendOtpView,
    UserLoginView,
    ForgotPasswordView,
    ResetPasswordView,
    UserDetailView
)

urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='auth_register'),
    path('verify-otp/', OtpVerificationView.as_view(), name='auth_verify_otp'),
    path('resend-otp/', ResendOtpView.as_view(), name='auth_resend_otp'),
    path('login/', UserLoginView.as_view(), name='auth_login'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='auth_forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='auth_reset_password'),
    path('profile/', UserDetailView.as_view(), name='auth_profile'),
]
