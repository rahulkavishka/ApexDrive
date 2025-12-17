from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VehicleViewSet, VINDecodeView

router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('decode-vin/', VINDecodeView.as_view(), name='decode-vin'),
]