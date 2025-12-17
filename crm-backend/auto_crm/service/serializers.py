from rest_framework import serializers
from .models import Customer, ServiceVehicle, ServiceRecord
from .models import ServiceAppointment

# 1. SIMPLE SERIALIZER (Avoids circular errors)
class SimpleVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceVehicle
        fields = ['id', 'license_plate', 'make', 'model', 'year']

# 2. RECORD SERIALIZER (Uses the Simple Vehicle)
class ServiceRecordSerializer(serializers.ModelSerializer):
    # This allows the Activity Log to see the Plate Number
    vehicle_details = SimpleVehicleSerializer(source='vehicle', read_only=True)
    customer_name = serializers.CharField(source='vehicle.owner.name', read_only=True)
    customer_phone = serializers.CharField(source='vehicle.owner.phone', read_only=True)

    total_cost = serializers.ReadOnlyField()

    class Meta:
        model = ServiceRecord
        fields = '__all__'

# 3. MAIN VEHICLE SERIALIZER (Uses the Record)
class ServiceVehicleSerializer(serializers.ModelSerializer):
    # Include history so we see past jobs when we scan a car
    history = ServiceRecordSerializer(many=True, read_only=True)

    class Meta:
        model = ServiceVehicle
        fields = '__all__'

# 4. CUSTOMER SERIALIZER
class CustomerSerializer(serializers.ModelSerializer):
    vehicles = ServiceVehicleSerializer(many=True, read_only=True)

    class Meta:
        model = Customer
        fields = '__all__'

class ServiceAppointmentSerializer(serializers.ModelSerializer):
    # Optional: Nested details if you want to show names in the calendar JSON
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = ServiceAppointment
        fields = '__all__'