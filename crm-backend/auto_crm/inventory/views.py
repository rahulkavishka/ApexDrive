from rest_framework import viewsets, views, status
from rest_framework.response import Response
from .models import Vehicle
from .serializers import VehicleSerializer
from .vin_decoder import decode_vin # Import your function from Step 3
from django.utils import timezone

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer

    def perform_update(self, serializer):
        # Check if status is changing to 'SOLD'
        if self.request.data.get('status') == 'SOLD':
            serializer.save(sold_date=timezone.now())
        else:
            serializer.save()

class VINDecodeView(views.APIView):
    """
    Endpoint: POST /api/inventory/decode-vin/
    Body: { "vin": "1HGCM..." }
    """
    def post(self, request):
        vin = request.data.get('vin')
        if not vin:
            return Response({"error": "VIN is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Call your "Cool Factor #1" function
        vehicle_data = decode_vin(vin)
        
        # Return the data to React so it can auto-fill the form
        return Response(vehicle_data)