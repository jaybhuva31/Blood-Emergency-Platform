from django.urls import path
from .views import ReportsStatsView, ExportReportView

urlpatterns = [
    path('stats/', ReportsStatsView.as_view(), name='report_stats'),
    path('export/', ExportReportView.as_view(), name='report_export'),
]
