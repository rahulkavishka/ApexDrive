from rest_framework.views import APIView
from rest_framework.response import Response
from sales.models import Lead
from service.models import ServiceRecord
from django.db.models import Sum

class Customer360View(APIView):
    def get(self, request):
        customers = {}

        # --- 1. PROCESS SALES (LEADS) ---
        leads = Lead.objects.all()
        for lead in leads:
            raw_phone = lead.phone
            if not raw_phone: continue
            
            # Use phone as the unique key
            phone_key = raw_phone

            if phone_key not in customers:
                customers[phone_key] = {
                    'name': f"{lead.first_name} {lead.last_name}",
                    'phone': raw_phone,
                    'lifetime_value': 0,
                    'history': []
                }
            
            # Add to History
            customers[phone_key]['history'].append({
                'type': 'SALE',
                'date': lead.created_at,
                'status': lead.status,
                'description': f"Interest in {lead.vehicle}" if lead.vehicle else "General Inquiry",
                'amount': 0
            })

            # Calculate Value (If Sold)
            if lead.status == 'SOLD' and lead.vehicle:
                price = float(lead.vehicle.selling_price)
                customers[phone_key]['lifetime_value'] += price
                customers[phone_key]['history'][-1]['amount'] = price
                customers[phone_key]['history'][-1]['description'] = f"Purchased {lead.vehicle.year} {lead.vehicle.model}"


        # --- 2. PROCESS SERVICE RECORDS ---
        services = ServiceRecord.objects.all()
        for svc in services:
            phone = None
            
            # A. Check for phone directly on ServiceRecord (Safe Check)
            if hasattr(svc, 'customer_phone') and svc.customer_phone:
                phone = svc.customer_phone
            
            # B. Check Linked Vehicle Owner
            elif svc.vehicle and hasattr(svc.vehicle, 'owner') and svc.vehicle.owner:
                owner = svc.vehicle.owner
                for field in ['phone', 'phone_number', 'mobile', 'contact_number']:
                    if hasattr(owner, field) and getattr(owner, field):
                        phone = getattr(owner, field)
                        break
            
            if not phone: continue

            phone_key = phone

            # Initialize if this customer only has service (no leads)
            if phone_key not in customers:
                name = "Service Customer"
                
                # FIX: Check for customer_name safely
                if hasattr(svc, 'customer_name') and svc.customer_name:
                    name = svc.customer_name
                # Check owner name safely
                elif svc.vehicle and hasattr(svc.vehicle, 'owner') and svc.vehicle.owner:
                    name = str(svc.vehicle.owner)
                    # Optional: try to make it prettier
                    owner = svc.vehicle.owner
                    if hasattr(owner, 'first_name') and owner.first_name:
                        name = f"{owner.first_name} {owner.last_name or ''}"

                customers[phone_key] = {
                    'name': name,
                    'phone': phone,
                    'lifetime_value': 0,
                    'history': []
                }

            # Add Value
            cost = float(svc.total_cost) if svc.total_cost else 0
            
            if svc.status == 'COMPLETED':
                customers[phone_key]['lifetime_value'] += cost

            # Add to History
            customers[phone_key]['history'].append({
                'type': 'SERVICE',
                'date': svc.date,
                'status': svc.status,
                'description': f"Service: {svc.description}",
                'amount': cost
            })

        # --- 3. CONVERT TO LIST AND SORT ---
        customer_list = list(customers.values())
        
        # Sort history for each customer by date (newest first)
        for c in customer_list:
            c['history'].sort(key=lambda x: x['date'], reverse=True)

        return Response(customer_list)