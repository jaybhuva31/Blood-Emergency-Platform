from django.db import models
from django.conf import settings

class Receiver(models.Model):
    """
    Receiver Model
    Stores detailed profile information for registered receivers/hospitals.
    Tracks default blood request criteria, including hospital context, patient details, and urgency levels.
    """
    BLOOD_GROUPS = (
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    )

    EMERGENCY_LEVELS = (
        ('CRITICAL', 'Critical (Immediate)'),
        ('HIGH', 'High'),
        ('NORMAL', 'Normal'),
    )

    # 1-to-1 link to user credentials
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='receiver_profile')
    
    # Institution details
    hospital_name = models.CharField(max_length=200)
    hospital_address = models.TextField()
    
    # Patient details
    patient_name = models.CharField(max_length=150)
    
    # Blood Request criteria
    blood_group_needed = models.CharField(max_length=5, choices=BLOOD_GROUPS)
    units_required = models.IntegerField(default=1)
    emergency_level = models.CharField(max_length=15, choices=EMERGENCY_LEVELS, default='NORMAL')
    
    # Timing details
    required_date = models.DateField()
    required_time = models.TimeField()
    
    # Additional context
    remarks = models.TextField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Receiver Profile"
        verbose_name_plural = "Receiver Profiles"

    def __str__(self):
        return f"{self.patient_name} - {self.blood_group_needed} needed at {self.hospital_name}"
