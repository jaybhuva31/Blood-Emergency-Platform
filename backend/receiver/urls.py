from django.urls import path
from .views import ReceiverProfileView

urlpatterns = [
    path('profile/', ReceiverProfileView.as_view(), name='receiver_profile'),
]
