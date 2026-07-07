from django.urls import path
from .views import (
    DonorProfileView,
    ToggleAvailabilityView,
    DonationHistoryView,
    NearbyDonorsView
)

urlpatterns = [
    path('profile/', DonorProfileView.as_view(), name='donor_profile'),
    path('profile/availability/', ToggleAvailabilityView.as_view(), name='donor_toggle_availability'),
    path('history/', DonationHistoryView.as_view(), name='donor_history'),
    path('nearby/', NearbyDonorsView.as_view(), name='donor_nearby_search'),
]
