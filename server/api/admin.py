from django.contrib import admin
from .models import Office, UserProfile, TimeLog

@admin.register(Office)
class OfficeAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'office', 'designation')
    list_filter = ('office',)

@admin.register(TimeLog)
class TimeLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'time_in', 'time_out', 'work_setup')
    list_filter = ('date', 'work_setup', 'user__profile__office')
    search_fields = ('user__username', 'user__first_name', 'user__last_name')
    date_hierarchy = 'date'
