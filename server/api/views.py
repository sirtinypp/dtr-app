from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.utils import timezone
from django.http import HttpResponse
from .models import Office, TimeLog
from .serializers import OfficeSerializer, TimeLogSerializer, UserSerializer

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

class OfficeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Office.objects.all()
    serializer_class = OfficeSerializer
    permission_classes = [permissions.AllowAny] # Or Authenticated if preferred

class TimeLogViewSet(viewsets.ModelViewSet):
    queryset = TimeLog.objects.all().order_by('-date', '-time_in')
    serializer_class = TimeLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == 'download_dtr':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = TimeLog.objects.all().order_by('-date', '-time_in')
        
        if not user.is_staff:
             queryset = queryset.filter(user=user)

        # Filters
        office_id = self.request.query_params.get('office')
        date_str = self.request.query_params.get('date')

        if office_id:
            queryset = queryset.filter(user__profile__office_id=office_id)
        if date_str:
            queryset = queryset.filter(date=date_str)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def clock_in(self, request):
        # Check if already clocked in today without clock out?
        # For simplicity, just create new log
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def clock_out(self, request, pk=None):
        log = self.get_object()
        if log.time_out:
            return Response({'error': 'Already clocked out!'}, status=status.HTTP_400_BAD_REQUEST)
        
        log.time_out = timezone.now()
        
        if 'latitude_out' in request.data:
            log.latitude_out = request.data['latitude_out']
        if 'longitude_out' in request.data:
            log.longitude_out = request.data['longitude_out']

        # Handle update logic for work_setup or notes if passed
        if 'image_out' in request.data:
            log.image_out = request.data['image_out']
        
        log.save()
        return Response(self.get_serializer(log).data)

    @action(detail=False, methods=['get'])
    def download_dtr(self, request):
        # Get parameters
        user_id = request.query_params.get('user_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        token_key = request.query_params.get('token')

        if not start_date or not end_date:
            return Response({'error': 'start_date and end_date are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate via Token Param if header is missing
        target_user = request.user
        if not target_user.is_authenticated and token_key:
            try:
                token = Token.objects.get(key=token_key)
                target_user = token.user
            except Token.DoesNotExist:
                return Response({'error': 'Invalid Token'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if not target_user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

        # Target User (Admin looking at someone else)
        if user_id and target_user.is_staff:
            try:
                from django.contrib.auth.models import User
                target_user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Filter Logs
        logs = TimeLog.objects.filter(
            user=target_user,
            date__range=[start_date, end_date]
        ).order_by('date')

        # Process logs into a dictionary by day for the template
        # We need to handle multiple logs per day? Or just first/last?
        # DTR usually creates one row per day.
        # Let's map dates to logs.
        
        from datetime import datetime, timedelta
        
        # Parse dates
        start = datetime.strptime(start_date, '%Y-%m-%d').date()
        end = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        days_data = []
        current = start
        while current <= end:
            day_logs = logs.filter(date=current)
            day_info = {
                'day': current.strftime('%d'),
                'date': current,
                'am_in': None, 'am_out': None,
                'pm_in': None, 'pm_out': None,
                'setup': None
            }
            
            # Simple logic: First entry is AM In, Last is PM Out?
            # Or just grab the first log's in/out.
            # DTR is often broken into AM/PM.
            # For this app, we have simple Time In / Time Out pairs per log.
            # If a user logs in multiple times, we might have multiple rows.
            # Let's try to fit them.
            
            if day_logs.exists():
                # Take the first log as the main one for now (or combine)
                # Ideally, we should detect morning/afternoon.
                # Let's just list the first log's IN and last log's OUT for simplicity if multiple.
                
                first_log = day_logs.first()
                last_log = day_logs.last()
                
                day_info['setup'] = first_log.work_setup
                
                # Naive AM/PM split based on time?
                # If time_in < 12:00 -> AM In.
                # If time_out < 13:00 -> AM Out?
                # This is complex. Let's just put the times in AM_IN / PM_OUT columns for now or generic columns.
                # The template has AM In/Out, PM In/Out.
                
                # Let's just fill AM In and PM Out with the day's total range.
                if first_log.time_in:
                    # Convert to local time
                    local_in = timezone.localtime(first_log.time_in)
                    day_info['am_in'] = local_in.strftime('%H:%M')
                
                # If there's a break? 
                # Let's just put the OUT time of the last log in PM Out.
                if last_log.time_out:
                    # Convert to local time
                    local_out = timezone.localtime(last_log.time_out)
                    day_info['pm_out'] = local_out.strftime('%H:%M')
                    
            days_data.append(day_info)
            current += timedelta(days=1)

        # Signarories Mapping
        signatories = {
            'OVPA': {'name': 'Dr. Augustus Resurreccion', 'position': 'Vice President for Administration'},
            'SSPMO': {'name': 'Isagani L. Bagus', 'position': 'Chief, SSPMO'},
            'SHRDO': {'name': 'Dr. Richard S. Javier', 'position': 'Director, SHRDO'},
            'SCO': {'name': 'Jen Matiz', 'position': 'Chief, SCO'},
        }
        
        # Default to OVPA if not found or no office
        office_code = 'OVPA'
        try:
            if hasattr(target_user, 'profile') and target_user.profile.office:
                office_code = target_user.profile.office.code
        except Exception:
            pass
            
        signatory = signatories.get(office_code, signatories['OVPA'])

        context = {
            'user': target_user,
            'start_date': start_date,
            'end_date': end_date,
            'period': f"{start.strftime('%B %d, %Y')} - {end.strftime('%B %d, %Y')}",
            'days': days_data,
            'signatory': signatory,
        }
        
        from .utils import render_to_pdf
        pdf = render_to_pdf('dtr_pdf.html', context)
        if pdf:
            response = HttpResponse(pdf, content_type='application/pdf')
            filename = f"DTR_{target_user.username}_{start_date}_{end_date}.pdf"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        return Response({'error': 'PDF generation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
