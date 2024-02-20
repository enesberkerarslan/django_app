from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from post.views import IHAViewSet,RentViewSet , RegisterView, LoginView, LogoutView



router = DefaultRouter()
router.register(r'ihalar', IHAViewSet)
router.register(r'kiralamalar', RentViewSet)


urlpatterns = [
    path('api/', include(router.urls)),
    path('admin/', admin.site.urls),
    
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
]