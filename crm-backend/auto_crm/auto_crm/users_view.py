from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import Group

User = get_user_model()

class UserManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def is_manager(self, user):
        # Check if Superuser OR belongs to 'Manager' group
        return user.is_superuser or user.groups.filter(name='Manager').exists()

    def get(self, request):
        # 1. SECURITY CHECK
        if not self.is_manager(request.user):
            return Response({"error": "Access Denied"}, status=403)

        users = User.objects.all().order_by('-date_joined')
        data = []
        for u in users:
            # Determine Role Label based on Group
            role = "Staff/Service"
            if u.is_superuser or u.groups.filter(name='Manager').exists():
                role = "Manager"
            elif u.groups.filter(name='Sales').exists():
                role = "Sales"

            data.append({
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "role": role,
                "date_joined": u.date_joined
            })

        return Response(data)

    def post(self, request):
        # 1. SECURITY CHECK
        if not self.is_manager(request.user):
            return Response({"error": "Access Denied"}, status=403)

        data = request.data
        username = data.get('username')
        password = data.get('password')
        role_name = data.get('role') # 'MANAGER', 'SALES', 'SERVICE'

        if not username or not password:
            return Response({"error": "Username and Password required"}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken"}, status=400)

        # 2. CREATE USER
        try:
            user = User.objects.create_user(username=username, password=password)
            
            # 3. ASSIGN GROUPS
            # Ensure groups exist first
            manager_group, _ = Group.objects.get_or_create(name='Manager')
            sales_group, _ = Group.objects.get_or_create(name='Sales')
            
            if role_name == 'MANAGER':
                user.groups.add(manager_group)
                user.groups.add(sales_group) # Managers can do sales too
                user.is_staff = True # Optional: gives admin panel access
            elif role_name == 'SALES':
                user.groups.add(sales_group)
            # Service/Staff users just don't get a special group for now, or you can create a 'Service' group
            
            user.save()
            return Response({"message": "User created successfully"}, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        # 1. SECURITY CHECK
        # Re-use the logic: is_superuser or in Manager group
        is_manager = request.user.is_superuser or request.user.groups.filter(name='Manager').exists()
        
        if not is_manager:
            return Response({"error": "Access Denied"}, status=403)

        user = get_object_or_404(User, pk=pk)
        
        if user.id == request.user.id:
            return Response({"error": "You cannot delete your own account."}, status=400)

        user.delete()
        return Response({"message": "User deleted"}, status=204)