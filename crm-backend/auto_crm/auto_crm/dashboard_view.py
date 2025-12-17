from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from inventory.models import Vehicle
from sales.models import Lead
from service.models import ServiceRecord
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1. TOTAL INVENTORY VALUE (The Fix)
        # Old Logic: status='AVAILABLE', Sum('selling_price')
        # New Logic: status=['AVAILABLE', 'RESERVED'], Sum('cost_price')
        inventory_value = Vehicle.objects.filter(
            status__in=['AVAILABLE', 'RESERVED']
        ).aggregate(total=Sum('cost_price'))['total'] or 0

        # 2. ACTIVE LEADS (Negotiation phase)
        active_leads = Lead.objects.filter(status='NEGOTIATION').count()

        # 3. SALES THIS MONTH
        first_day_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        sales_this_month = Vehicle.objects.filter(
            status='SOLD', 
            updated_at__gte=first_day_month
        ).count()

        # 4. RECENT ACTIVITY LOG
        # (Simple combined list of recent actions)
        recent_activity = []
        
        # New Leads
        for lead in Lead.objects.order_by('-created_at')[:3]:
            recent_activity.append({
                "type": "LEAD",
                "message": f"New Lead: {lead.first_name} interested in {lead.vehicle or 'Inventory'}",
                "time": lead.created_at
            })
            
        # Recent Sales
        for sale in Vehicle.objects.filter(status='SOLD').order_by('-updated_at')[:3]:
            recent_activity.append({
                "type": "SALE",
                "message": f"Vehicle Sold: {sale.year} {sale.make} {sale.model}",
                "time": sale.updated_at
            })

        # Sort combined activity by time
        recent_activity.sort(key=lambda x: x['time'], reverse=True)

        return Response({
            "stats": {
                "inventory_value": inventory_value,
                "active_leads": active_leads,
                "monthly_sales": sales_this_month,
            },
            "activity": recent_activity[:5]
        })