from rest_framework import serializers
from .models import Lead
from inventory.serializers import VehicleSerializer

class LeadSerializer(serializers.ModelSerializer):
    vehicle_details = VehicleSerializer(source='vehicle', read_only=True)
    class Meta:
        model = Lead
        fields = '__all__'