from django.urls import path
from .views import (
    CampListView,
    CampDetailsView,
    RegisterCampView,
    CampRegistrationCheckInView
)

urlpatterns = [
    path('list/', CampListView.as_view(), name='camp_list'),
    path('details/<int:pk>/', CampDetailsView.as_view(), name='camp_details'),
    path('register/<int:camp_id>/', RegisterCampView.as_view(), name='camp_register'),
    path('check-in/', CampRegistrationCheckInView.as_view(), name='camp_check_in'),
]
