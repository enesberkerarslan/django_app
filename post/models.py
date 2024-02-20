from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class IHA(models.Model):
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    weight = models.FloatField()
    category = models.CharField(max_length=50)

class Rent(models.Model):
    iha = models.ForeignKey(IHA, on_delete=models.CASCADE)
    date_hour_ranges = models.CharField(max_length=200)
    renting_member = models.ForeignKey(User, on_delete=models.CASCADE)