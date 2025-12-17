from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LicensePlateScanView, CustomerViewSet, ServiceAppointmentViewSet, ServiceVehicleViewSet, ServiceRecordViewSet

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'vehicles', ServiceVehicleViewSet)
router.register(r'records', ServiceRecordViewSet)
router.register(r'appointments', ServiceAppointmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('scan-plate/', LicensePlateScanView.as_view(), name='scan-plate'),
]