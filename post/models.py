from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class IHA(models.Model):
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    weight = models.FloatField()
    category = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.brand} - {self.model}"

class Rent(models.Model):
    iha = models.ForeignKey(IHA, on_delete=models.CASCADE)
    date_hour_ranges = models.CharField(max_length=200)
    renting_member = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.iha} - {self.date_hour_ranges}"


from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)
    
class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=30, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()
    
    groups = models.ManyToManyField('auth.Group', verbose_name=_('groups'), blank=True, related_name='custom_user_set')
    user_permissions = models.ManyToManyField('auth.Permission', verbose_name=_('user permissions'), blank=True, related_name='custom_user_set')   
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email