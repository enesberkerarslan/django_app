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
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': 'Kiralama kaydı bulunamadı'}, status=status.HTTP_404_NOT_FOUND)
    
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
    permission_classes = [IsAuthenticatedAndTokenValid]

    def create(self, request, *args, **kwargs):
        iha_id = request.data.get('iha_id')
        date_hour_ranges = request.data.get('date_hour_ranges')
        renting_member = request.user  # kullanıcı bilgisi
        # IHA'nın mevcut olup olmadığını kontrol et
        try:
            iha = IHA.objects.get(id=iha_id)
        except IHA.DoesNotExist:
            return Response({'error': 'IHA not found'}, status=status.HTTP_404_NOT_FOUND)

        # Rent modelini oluştur ve veritabanına kaydet
        rent = Rent.objects.create(iha=iha, date_hour_ranges=date_hour_ranges, renting_member=renting_member)

        # Oluşturulan Rent modelini serializer kullanarak JSON formatına çevir
        serializer = RentSerializer(rent)

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['GET'])
    def user_rents(self, request):
        user_rents = Rent.objects.filter(renting_member=request.user)
        serializer = RentSerializer(user_rents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

    # delete 
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': 'kiralama kaydı bulunamadı'}, status=status.HTTP_404_NOT_FOUND)

    # Belirli bir kiralama kaydını ID ile güncelleme view fonksiyonu
    def  update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['GET'])
    def get_rent_info_by_id(self, request, pk=None):
        try:
            # Verilen id'ye sahip IHA'yı getir
            iha = Rent.objects.get(pk=pk)
            serializer = RentSerializer(iha)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Rent.DoesNotExist:
            return Response({'detail': 'Rent not found.'}, status=status.HTTP_404_NOT_FOUND)

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