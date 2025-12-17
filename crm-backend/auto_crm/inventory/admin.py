from django.contrib import admin
from .models import Vehicle

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    # This controls what columns you see in the list
    list_display = ('stock_number', 'year', 'make', 'model', 'selling_price', 'status')
    
    # This adds a search bar to the top of the page
    search_fields = ('vin', 'stock_number', 'make', 'model')
    
    # This adds filters to the right sidebar
    list_filter = ('status', 'make')