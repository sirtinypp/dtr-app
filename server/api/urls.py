from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, OfficeViewSet, TimeLogViewSet

router = DefaultRouter()
router.register(r'offices', OfficeViewSet)
router.register(r'logs', TimeLogViewSet)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('', include(router.urls)),
]
