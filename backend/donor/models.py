from django.db import models
from django.conf import settings

class Donor(models.Model):
    """
    Donor Model
    Stores detailed profile information for registered blood donors.
    Links to the CustomUser auth model via a OneToOne relationship.
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

    GENDERS = (
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    )

    STATUS_CHOICES = (
        ('AVAILABLE', 'Available'),
        ('ON_LEAVE', 'On Leave'),
        ('BUSY', 'Busy'),
    )

    # 1-to-1 link to user credentials
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='donor_profile')
    
    # Biological details
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUPS)
    weight = models.FloatField(help_text="Weight in kilograms")
    age = models.IntegerField()
    gender = models.CharField(max_length=10, choices=GENDERS)
    
    # Location/Contact details
    address = models.TextField()
    city = models.CharField(max_length=100)
    latitude = models.FloatField(null=True, blank=True, help_text="Latitude for distance calculations")
    longitude = models.FloatField(null=True, blank=True, help_text="Longitude for distance calculations")
    phone = models.CharField(max_length=15, null=True, blank=True, help_text="Fallback contact number")
    
    # Medical records
    medical_disease = models.TextField(null=True, blank=True, help_text="Any past or chronic medical illnesses")
    profile_picture = models.FileField(upload_to='profiles/', null=True, blank=True)
    blood_report = models.FileField(upload_to='reports/', null=True, blank=True, help_text="Recent pathology test files")
    
    # Donation statistics
    last_donation_date = models.DateField(null=True, blank=True)
    donation_count = models.IntegerField(default=0)
    
    # Availability toggles
    availability = models.BooleanField(default=True, help_text="Is the donor ready to donate now?")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Donor Profile"
        verbose_name_plural = "Donor Profiles"

    def __str__(self):
        return f"{self.user.username} - {self.blood_group}"
