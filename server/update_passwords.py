import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

def reset_passwords():
    users = User.objects.all()
    count = 0
    for user in users:
        # consistent password for testing
        user.set_password('iamgroot')
        user.save()
        count += 1
        print(f"Updated password for {user.username}")
    
    print(f"Successfully updated passwords for {count} users to 'iamgroot'.")

if __name__ == '__main__':
    reset_passwords()
