from rest_framework import serializers
from .models import IHA,Rent,User

class IHASerializer(serializers.ModelSerializer):
    class Meta:
        model = IHA
        fields = '__all__'

class RentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rent
        fields = '__all__'


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username']
        extra_kwargs = {'password': {'write_only': True}}