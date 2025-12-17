from django.db import models

class Vehicle(models.Model):
    STATUS_CHOICES = (
        ('AVAILABLE', 'Available'),
        ('RESERVED', 'Reserved'),
        ('SOLD', 'Sold'),
        ('SERVICE', 'In Service'), # For cars in the shop
    )

    vin = models.CharField(max_length=17, unique=True)
    stock_number = models.CharField(max_length=50, unique=True)
    
    # These fields will be Auto-Filled by your VIN Decoder
    make = models.CharField(max_length=50, blank=True)
    model = models.CharField(max_length=50, blank=True)
    year = models.IntegerField(null=True, blank=True)
    trim = models.CharField(max_length=100, blank=True)
    body_style = models.CharField(max_length=50, blank=True) # SUV, Sedan
    
    # Physical Details
    color = models.CharField(max_length=30)
    mileage = models.IntegerField(help_text="Current mileage in km")
    license_plate = models.CharField(max_length=20, blank=True, null=True) # For AI Recognition
    
    # Financials
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    sold_date = models.DateTimeField(null=True, blank=True) # To track WHEN it was sold
    
    status = models.CharField(max_length=20, default='AVAILABLE', choices=[
        ('AVAILABLE', 'Available'),
        ('SOLD', 'Sold'),
        ('RESERVED', 'Reserved')
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    photo = models.ImageField(upload_to='vehicles/', blank=True)

    def __str__(self):
        return f"{self.year} {self.make} {self.model} ({self.stock_number})"