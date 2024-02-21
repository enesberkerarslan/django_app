from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from post.views import IHAViewSet,RentViewSet , RegisterView, LoginView, LogoutView,VerifyTokenView
from rest_framework_simplejwt.views import TokenRefreshView



router = DefaultRouter()
router.register(r'ihalar', IHAViewSet)
router.register(r'kiralamalar', RentViewSet)


urlpatterns = [
    path('api/', include(router.urls)),
    path('admin/', admin.site.urls),
    
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify-token/', VerifyTokenView.as_view(), name='verify-token'),

]