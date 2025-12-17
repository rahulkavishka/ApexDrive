import cv2
import easyocr
import numpy as np
from rest_framework import viewsets, views, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Customer, ServiceVehicle, ServiceRecord, ServiceAppointment
from .serializers import (
    CustomerSerializer, 
    ServiceVehicleSerializer, 
    ServiceRecordSerializer, 
    ServiceAppointmentSerializer
)
from auto_crm.sms import send_sms_notification

# --- 1. STANDARD CRUD VIEWSETS ---

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class ServiceVehicleViewSet(viewsets.ModelViewSet):
    queryset = ServiceVehicle.objects.all()
    serializer_class = ServiceVehicleSerializer

class ServiceRecordViewSet(viewsets.ModelViewSet):
    queryset = ServiceRecord.objects.all()
    serializer_class = ServiceRecordSerializer

    # This handles AUTOMATIC SMS when status changes to 'COMPLETED'
    def perform_update(self, serializer):
        instance = self.get_object()
        old_status = instance.status
        updated_record = serializer.save()

        if old_status != 'COMPLETED' and updated_record.status == 'COMPLETED':
            
            phone = None
            name = "Valued Customer"

            # --- 1. FIND PHONE NUMBER (The Detective Logic) ---
            
            # A. Check ServiceRecord directly
            for field in ['customer_phone', 'phone', 'mobile']:
                if hasattr(updated_record, field) and getattr(updated_record, field):
                    phone = getattr(updated_record, field)
                    break
            
            # B. Check Linked Vehicle Owner (The most likely place!)
            if not phone and updated_record.vehicle and hasattr(updated_record.vehicle, 'owner') and updated_record.vehicle.owner:
                owner = updated_record.vehicle.owner
                # Try common names for phone field on the User/Customer model
                for field in ['phone', 'phone_number', 'mobile', 'contact_number']:
                    if hasattr(owner, field) and getattr(owner, field):
                        phone = getattr(owner, field)
                        # Grab name while we are here
                        name = str(owner)
                        if hasattr(owner, 'first_name') and owner.first_name:
                             name = f"{owner.first_name} {owner.last_name or ''}"
                        break
            
            # --- 2. SEND SMS ---
            if phone:
                # Get Vehicle Name
                vehicle_info = "your vehicle"
                if updated_record.vehicle:
                    ma = updated_record.vehicle.make or ""
                    m = updated_record.vehicle.model or "Car"
                    vehicle_info = f"{ma} {m}"

                message = (
                    f"Hi {name}, \n"
                    f"✅ Good news! The service for {vehicle_info} is completed. \n"
                    f"Total Due: ${updated_record.total_cost}"
                )
                send_sms_notification(phone, message)
            else:
                print("❌ SMS FAILED: Found the Owner, but they have no phone number saved.")

class ServiceAppointmentViewSet(viewsets.ModelViewSet):
    queryset = ServiceAppointment.objects.all()
    serializer_class = ServiceAppointmentSerializer


# --- 2. MANUAL SMS TRIGGER (For the "Send SMS" Button) ---
@api_view(['POST'])
def send_service_sms(request, pk):
    try:
        service = ServiceRecord.objects.get(pk=pk)
        
        # --- 1. FIND PHONE NUMBER ---
        phone = None
        
        # A. Direct field
        if service.customer_phone:
            phone = service.customer_phone
            
        # B. Owner field
        elif service.vehicle and hasattr(service.vehicle, 'owner') and service.vehicle.owner:
            owner = service.vehicle.owner
            for field in ['phone', 'phone_number', 'mobile', 'contact_number']:
                if hasattr(owner, field) and getattr(owner, field):
                    phone = getattr(owner, field)
                    break

        if not phone:
            return Response({"error": "No phone number found for this customer."}, status=400)

        # --- 2. PREPARE MESSAGE ---
        customer_name = service.customer_name or "Valued Customer"
        if service.vehicle and hasattr(service.vehicle, 'owner') and service.vehicle.owner:
             customer_name = str(service.vehicle.owner)

        # Build Vehicle Name
        vehicle_name = "your vehicle"
        if service.vehicle:
            vehicle_name = f"{service.vehicle.make or ''} {service.vehicle.model or ''}"

        message = (
            f"Hi {customer_name},\n"
            f"✅ Good news! The service for {vehicle_name} is completed.\n"
            f"Total Due: ${service.total_cost}"
        )

        # --- 3. SEND ---
        send_sms_notification(phone, message)
        return Response({"status": "SMS Sent", "to": phone})

    except ServiceRecord.DoesNotExist:
        return Response({"error": "Service Record not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# --- 3. AI SCANNER LOGIC ---
class LicensePlateScanView(views.APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        file_obj = request.FILES.get('image')
        if not file_obj:
            return Response({"error": "No image provided"}, status=400)

        try:
            # A. Read Image
            file_bytes = np.frombuffer(file_obj.read(), np.uint8)
            img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
            
            # B. Run AI
            reader = easyocr.Reader(['en'], gpu=False) 
            results = reader.readtext(img)
            
            detected_text = "UNKNOWN"
            candidates = []

            # C. Smart Filtering
            for (bbox, text, prob) in results:
                clean_text = "".join(c for c in text if c.isalnum()).upper()
                if len(clean_text) >= 3:
                    candidates.append(clean_text)

            if candidates:
                candidates.sort(key=len, reverse=True)
                detected_text = candidates[0]

            # D. Search Database
            vehicle_data = None
            try:
                vehicle = ServiceVehicle.objects.get(license_plate=detected_text)
                vehicle_data = ServiceVehicleSerializer(vehicle).data
            except ServiceVehicle.DoesNotExist:
                vehicle_data = None

            return Response({
                "plate": detected_text,
                "existing_vehicle": vehicle_data
            })

        except Exception as e:
            print("AI Error:", e)
            return Response({"error": "Failed to process image"}, status=500)