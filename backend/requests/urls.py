from django.urls import path
from .views import (
    BloodRequestCreateView,
    RequestHistoryListView,
    AcceptBloodRequestView,
    RejectBloodRequestView,
    CompleteBloodRequestView,
    CancelBloodRequestView,
    TrackBloodRequestView
)

urlpatterns = [
    path('create/', BloodRequestCreateView.as_view(), name='request_create'),
    path('list/', RequestHistoryListView.as_view(), name='request_list'),
    path('accept/<str:request_id>/', AcceptBloodRequestView.as_view(), name='request_accept'),
    path('reject/<str:request_id>/', RejectBloodRequestView.as_view(), name='request_reject'),
    path('complete/<str:request_id>/', CompleteBloodRequestView.as_view(), name='request_complete'),
    path('cancel/<str:request_id>/', CancelBloodRequestView.as_view(), name='request_cancel'),
    path('track/<str:request_id>/', TrackBloodRequestView.as_view(), name='request_track'),
]
