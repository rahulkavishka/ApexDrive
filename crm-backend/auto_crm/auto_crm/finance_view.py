from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from inventory.models import Vehicle
from service.models import ServiceRecord
from django.db.models import Sum, F
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta

class FinancialSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # --- A. KPI CARDS ---
        inventory_value = Vehicle.objects.filter(status__in=['AVAILABLE', 'RESERVED']).aggregate(total=Sum('cost_price'))['total'] or 0
        total_sales = Vehicle.objects.filter(status='SOLD').aggregate(total=Sum('selling_price'))['total'] or 0
        
        # Calculate Service Revenue (Parts + Labor)
        total_service = ServiceRecord.objects.filter(status='COMPLETED').aggregate(
            total=Sum(F('parts_cost') + F('labor_cost'))
        )['total'] or 0
        
        sold_cars = Vehicle.objects.filter(status='SOLD')
        sales_profit = 0
        for car in sold_cars:
            if car.selling_price and car.cost_price:
                sales_profit += (car.selling_price - car.cost_price)

        # --- B. MONTHLY DATA (MERGED) ---
        six_months_ago = timezone.now() - timedelta(days=180)
        
        # 1. Get Monthly Sales
        sales_data = (
            Vehicle.objects.filter(status='SOLD', created_at__gte=six_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(revenue=Sum('selling_price'), cost=Sum('cost_price'))
            .order_by('month')
        )

        # 2. Get Monthly Service
        service_data = (
            ServiceRecord.objects.filter(status='COMPLETED', date__gte=six_months_ago)
            .annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(revenue=Sum(F('parts_cost') + F('labor_cost')))
            .order_by('month')
        )

        # 3. Merge Them
        merged_data = {}

        # Process Sales
        for entry in sales_data:
            month_key = entry['month'].strftime("%b") # e.g., "Dec"
            if month_key not in merged_data:
                merged_data[month_key] = {"name": month_key, "Revenue": 0, "Cost": 0, "Profit": 0}
            
            merged_data[month_key]["Revenue"] += (entry['revenue'] or 0)
            merged_data[month_key]["Cost"] += (entry['cost'] or 0)
            merged_data[month_key]["Profit"] += (entry['revenue'] or 0) - (entry['cost'] or 0)

        # Process Service (Add to existing months or create new)
        for entry in service_data:
            month_key = entry['month'].strftime("%b")
            if month_key not in merged_data:
                merged_data[month_key] = {"name": month_key, "Revenue": 0, "Cost": 0, "Profit": 0}
            
            svc_rev = (entry['revenue'] or 0)
            # Service Profit is roughly Revenue - Parts (We treat Labor as profit for this simple view, or strict Revenue)
            # For this chart, let's add it purely to Revenue and Profit to match KPI
            merged_data[month_key]["Revenue"] += svc_rev
            merged_data[month_key]["Profit"] += svc_rev 

        # Convert back to list and sort (roughly)
        chart_data = list(merged_data.values())

        # --- C. RECENT TRANSACTIONS ---
        recent_sales = []
        for car in sold_cars.order_by('-updated_at')[:5]:
            profit = (car.selling_price or 0) - (car.cost_price or 0)
            margin = 0
            if car.selling_price and car.selling_price > 0:
                margin = (profit / car.selling_price) * 100
                
            recent_sales.append({
                "vehicle": f"{car.year} {car.make} {car.model}",
                "sold_for": car.selling_price,
                "cost": car.cost_price,
                "profit": profit,
                "margin": round(margin, 1)
            })

        return Response({
            "kpi": {
                "inventory_value": inventory_value,
                "total_revenue": total_sales + total_service,
                "sales_profit": sales_profit,
                "service_revenue": total_service
            },
            "chart_data": chart_data,
            "recent_sales": recent_sales
        })