from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from rest_framework import generics, permissions, status,viewsets
from rest_framework.views import APIView


from .permissions import IsLoggedInUser,IsAuthenticatedAndTokenValid
from .models import IHA, Rent,CustomUser
from .serializers import IHASerializer, RentSerializer , CustomUserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import action
from rest_framework.authtoken.models import Token


# Create your views here.
class IHAViewSet(viewsets.ModelViewSet):
    queryset = IHA.objects.all()
    serializer_class = IHASerializer
    permission_classes = [IsAuthenticatedAndTokenValid]
  
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        print(request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'isCreated': 'True','data' : serializer.data}, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"message": "Kayıt başarıyla silindi."}, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['GET'])
    def get_iha_info_by_id(self, request, pk=None):
        try:
            # Verilen id'ye sahip IHA'yı getir
            iha = IHA.objects.get(pk=pk)
            serializer = IHASerializer(iha)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except IHA.DoesNotExist:
            return Response({'detail': 'IHA not found.'}, status=status.HTTP_404_NOT_FOUND)

class RentViewSet(viewsets.ModelViewSet):
    queryset = Rent.objects.all()
    serializer_class = RentSerializer

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.AllowAny]
    def perform_create(self, serializer):
        from django.contrib.auth.hashers import make_password
        password = make_password(self.request.data.get('password'))
        serializer.save(password=password)

class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            print(username + " " + password)
            user = authenticate(request, username=username, password=password) # username password kontrolü yapılıyor
            if user is not None: # None dönerse doğru değil
                login(request, user)
                serializer = CustomUserSerializer(user)
                refresh = RefreshToken.for_user(user)
                access_token = refresh.access_token
                return Response({'user': serializer.data, 'access_token': str(access_token), 'refresh_token': str(refresh), 'isLogin': 'True'})
            else:
                return Response({'error': 'Invalid login credentials', 'isLogin': 'False'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            print("hata")
            return Response({"error": str(e)})

class LogoutView(APIView):
    def post(self, request, *args, **kwargs):
        logout(request)

        return Response({'message': 'Successfully logged out'})
    
class VerifyTokenView(APIView):
    permission_classes = [IsLoggedInUser]
    print(permission_classes)
    def post(self, request, *args, **kwargs):
        # Gerekli işlemleri gerçekleştirin
        return Response({"message": "Token doğrulama başarılı."}, status=status.HTTP_200_OK)