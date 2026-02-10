from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Office, UserProfile, TimeLog

class OfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Office
        fields = ['id', 'name', 'code']

class UserProfileSerializer(serializers.ModelSerializer):
    office = OfficeSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['office', 'designation']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'is_staff', 'profile']

class TimeLogSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    office_name = serializers.CharField(source='user.profile.office.name', read_only=True)

    class Meta:
        model = TimeLog
        fields = [
            'id', 'user', 'user_details', 'office_name', 
            'date', 'time_in', 'time_out', 
            'work_setup', 'image_in', 'image_out', 'notes',
            'latitude_in', 'longitude_in', 'latitude_out', 'longitude_out'
        ]
        read_only_fields = ['user', 'date', 'time_in']
