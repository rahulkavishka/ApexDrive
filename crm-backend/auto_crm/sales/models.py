from django.db import models
from inventory.models import Vehicle

class Lead(models.Model):
    STATUS_CHOICES = [
        ('NEW', 'New Lead'),
        ('CONTACTED', 'Contacted'),
        ('TEST_DRIVE', 'Test Drive'),
        ('NEGOTIATION', 'Negotiation'),
        ('SOLD', 'Sold'),
        ('LOST', 'Lost'),
    ]

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)

    source = models.CharField(max_length=50, default='Walk-in', choices=[
        ('Walk-in', 'Walk-in'),
        ('Facebook', 'Facebook'),
        ('Google', 'Google'),
        ('Referral', 'Referral'),
        ('Website', 'Website')
    ])
    
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, related_name='leads')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    
    quoted_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    down_payment = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    monthly_payment = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    term_months = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    # --- THE NEW AUTOMATION LOGIC ---
    def save(self, *args, **kwargs):
        # 1. If we mark this Lead as SOLD...
        if self.status == 'SOLD' and self.vehicle:
            # ...Find the car and mark it SOLD too
            self.vehicle.status = 'SOLD'
            self.vehicle.save()
            
        # 2. If we move a Lead OUT of SOLD (e.g. back to Negotiation)...
        elif self.status != 'SOLD' and self.vehicle and self.vehicle.status == 'SOLD':
            # ...Mark the car AVAILABLE again
            self.vehicle.status = 'AVAILABLE'
            self.vehicle.save()

        super().save(*args, **kwargs)
