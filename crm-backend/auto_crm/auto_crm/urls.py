from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from auto_crm.customers_view import Customer360View           
from sales.models import Lead
from service.models import ServiceRecord
from inventory.models import Vehicle
from collections import defaultdict
from django.conf import settings
from django.conf.urls.static import static
from auto_crm.finance_view import FinancialSummaryView
from auto_crm.dashboard_view import DashboardStatsView
from auto_crm.users_view import UserManagementView, UserDetailView

# --- THE MISSING "WHO AM I" VIEW ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    return Response({
        'username': request.user.username,
        # Check if user is Superuser OR in Manager group
        'is_manager': request.user.is_superuser or request.user.groups.filter(name='Manager').exists(),
        'is_sales': request.user.groups.filter(name='Sales').exists(),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_analytics(request):
    # 1. LEAD SOURCES (Pie Chart)
    lead_sources = Lead.objects.values('source').annotate(value=Count('id')).order_by('-value')
    
    # 2. COMBINED REVENUE/PROFIT (Bar Chart)
    six_months_ago = timezone.now() - timedelta(days=180)
    monthly_totals = defaultdict(float)

    # --- A. Service Revenue (Parts + Labor) ---
    service_jobs = ServiceRecord.objects.filter(
        status='COMPLETED', 
        date__gte=six_months_ago
    ).values('date', 'parts_cost', 'labor_cost')

    for job in service_jobs:
        d = job['date']
        if isinstance(d, str): # Handle SQLite string dates
            try: d = timezone.datetime.strptime(d[:10], "%Y-%m-%d")
            except: continue
        
        key = (d.year, d.month)
        monthly_totals[key] += float(job['parts_cost'] or 0) + float(job['labor_cost'] or 0)

    # --- B. Car Sales Profit (Selling - Cost) ---
    sold_cars = Vehicle.objects.filter(
        status='SOLD',
        sold_date__gte=six_months_ago  # Uses the new field
    ).values('sold_date', 'selling_price', 'cost_price')

    for car in sold_cars:
        d = car['sold_date']
        if not d: continue # Skip if no date recorded
        
        if isinstance(d, str): 
            try: d = timezone.datetime.strptime(d[:10], "%Y-%m-%d")
            except: continue

        key = (d.year, d.month)
        
        # PROFIT FORMULA
        profit = float(car['selling_price'] or 0) - float(car['cost_price'] or 0)
        
        # Only add positive profit (optional)
        if profit > 0:
            monthly_totals[key] += profit

    # Format for Frontend
    chart_data = []
    for key in sorted(monthly_totals.keys()):
        dummy_date = timezone.datetime(key[0], key[1], 1)
        chart_data.append({
            'name': dummy_date.strftime('%b'), # "Jan", "Feb"
            'total': monthly_totals[key]
        })

    return Response({
        'lead_sources': list(lead_sources),
        'revenue_chart': chart_data
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/inventory/', include('inventory.urls')),
    path('api/sales/', include('sales.urls')),
    path('api/service/', include('service.urls')),
    
    # Login Token Endpoint
    path('api-token-auth/', obtain_auth_token),
    
    # User Profile Endpoint (This was missing/404)
    path('api/me/', current_user_view),

    path('api/analytics/', dashboard_analytics),

    path('api/customers/360/', Customer360View.as_view()),
    path('api/financials/', FinancialSummaryView.as_view()),
    path('api/dashboard/stats/', DashboardStatsView.as_view()),
    path('api/users/', UserManagementView.as_view()),
    path('api/users/<int:pk>/', UserDetailView.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)