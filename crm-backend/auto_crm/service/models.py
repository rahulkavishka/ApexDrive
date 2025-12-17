from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ServiceVehicle(models.Model):
    # This links the car to the customer
    owner = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='vehicles')
    license_plate = models.CharField(max_length=20, unique=True)
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.IntegerField(null=True)

    def __str__(self):
        return f"{self.license_plate} - {self.owner.name}"

class ServiceRecord(models.Model):
    vehicle = models.ForeignKey(ServiceVehicle, on_delete=models.CASCADE, related_name='history')
    description = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='PENDING', choices=[
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed')
    ])
    
    # --- NEW BILLING FIELDS ---
    parts_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    labor_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # Helper to calculate total
    @property
    def total_cost(self):
        return self.parts_cost + self.labor_cost

    def __str__(self):
        return f"{self.vehicle.license_plate} - {self.description}"
    

class ServiceAppointment(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    vehicle = models.ForeignKey(ServiceVehicle, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=200, help_text="e.g. Oil Change for John")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, default='SCHEDULED', choices=[
        ('SCHEDULED', 'Scheduled'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled')
    ])

    def __str__(self):
        return f"{self.title} ({self.start_time})"