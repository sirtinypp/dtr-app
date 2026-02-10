import os
import django
import random
from django.utils import timezone
from datetime import timedelta

# Allow running standalone
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Office, UserProfile, TimeLog

OFFICES = [
    ('Office of the Vice President for Administration Central', 'OVPA'),
    ('System Human Resources Development Office', 'SHRDO'),
    ('System Supply and Property Management Office', 'SSPMO'),
    ('System Cash Office', 'SCO'),
]

USERS_PER_OFFICE = 3

def create_offices():
    print("Creating Offices...")
    office_objs = []
    for name, code in OFFICES:
        office, created = Office.objects.get_or_create(name=name, defaults={'code': code})
        office_objs.append(office)
        if created:
            print(f"Created Office: {name}")
        else:
            print(f"Office exists: {name}")
    return office_objs

def create_users(offices):
    print("Creating Users...")
    first_names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Kevin', 'Liam']
    last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez']

    # We need 12 users total
    
    idx = 0
    for office in offices:
        print(f"Adding users to {office.name}...")
        for _ in range(USERS_PER_OFFICE):
            if idx >= len(first_names): break # safeguard
            
            fname = first_names[idx]
            lname = last_names[idx]
            username = f"{fname.lower()}.{lname.lower()}"
            email = f"{username}@example.com"
            
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(username=username, email=email, password='password123', first_name=fname, last_name=lname)
                UserProfile.objects.create(user=user, office=office, designation='Staff')
                print(f"Created User: {username} ({office.name})")
                
                # Create some random logs for this user
                create_logs(user)
            else:
                print(f"User exists: {username}")
                user = User.objects.get(username=username)
                if not hasattr(user, 'profile'):
                     UserProfile.objects.create(user=user, office=office, designation='Staff')

            idx += 1

def create_logs(user):
    # Create logs for last 3 days
    print(f"  Generating logs for {user.username}...")
    today = timezone.now().date()
    for i in range(3):
        date = today - timedelta(days=i)
        
        # Randomize time in/out
        hour_in = random.randint(7, 9)
        minute_in = random.randint(0, 59)
        time_in = timezone.now().replace(year=date.year, month=date.month, day=date.day, hour=hour_in, minute=minute_in, second=0)
        
        hour_out = random.randint(16, 18)
        minute_out = random.randint(0, 59)
        time_out = timezone.now().replace(year=date.year, month=date.month, day=date.day, hour=hour_out, minute=minute_out, second=0)
        
        setup = random.choice(['ONSITE', 'WFH', 'FIELD'])
        
        TimeLog.objects.create(
            user=user,
            date=date,
            time_in=time_in,
            time_out=time_out,
            work_setup=setup,
            notes='Generated log'
        )

if __name__ == '__main__':
    offices = create_offices()
    create_users(offices)
    print("Data generation complete!")
