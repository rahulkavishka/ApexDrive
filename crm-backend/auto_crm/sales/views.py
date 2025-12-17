from rest_framework import viewsets
from .models import Lead
from .serializers import LeadSerializer
from auto_crm.sms import send_sms_notification

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all().order_by('-created_at')
    serializer_class = LeadSerializer

    def perform_update(self, serializer):
        instance = self.get_object()
        old_status = instance.status
        
        updated_lead = serializer.save()

        # FIX: Check for 'SOLD' (matching your frontend dropdown) instead of 'WON'
        if old_status != 'SOLD' and updated_lead.status == 'SOLD':
            
            # Construct the Message
            vehicle_name = "new car"
            if updated_lead.vehicle:
                # Use vehicle_details logic or access relationship directly
                v = updated_lead.vehicle
                vehicle_name = f"{v.year} {v.make} {v.model}"

            message = (
                f"Congratulations {updated_lead.first_name}! 🚗💨 \n"
                f"Thank you for purchasing your {vehicle_name} from ApexDrive. \n"
                f"🎁 BONUS: Your 5k, 10k, and 15k mile services are on us!"
            )
            
            # Send the SMS
            send_sms_notification(updated_lead.phone, message)