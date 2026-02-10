from django.db import models
from django.contrib.auth.models import User

class Office(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True, help_text="e.g. OVPA, SSPMO")

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    office = models.ForeignKey(Office, on_delete=models.SET_NULL, null=True, blank=True)
    designation = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.office}"

class TimeLog(models.Model):
    WORK_SETUP_CHOICES = [
        ('ONSITE', 'Onsite'),
        ('WFH', 'Work From Home'),
        ('FIELD', 'Field Work'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='logs')
    date = models.DateField(auto_now_add=True)
    time_in = models.DateTimeField(auto_now_add=True)
    time_out = models.DateTimeField(null=True, blank=True)
    work_setup = models.CharField(max_length=10, choices=WORK_SETUP_CHOICES, default='ONSITE')
    image_in = models.ImageField(upload_to='logs/images/', null=True, blank=True)
    image_out = models.ImageField(upload_to='logs/images/', null=True, blank=True)
    latitude_in = models.FloatField(null=True, blank=True)
    longitude_in = models.FloatField(null=True, blank=True)
    latitude_out = models.FloatField(null=True, blank=True)
    longitude_out = models.FloatField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.date}"
