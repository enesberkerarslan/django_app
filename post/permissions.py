from rest_framework import permissions
from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.tokens import AccessToken

class IsLoggedInUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

class IsAuthenticatedAndTokenValid(BasePermission):
    message = 'Invalid or expired token.'

    def has_permission(self, request, view):
        # Token'ı al
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

            # Token'ın geçerliliğini kontrol et
            try:
                AccessToken(token).check_exp()
                return True
            except Exception as e:
                print(f'Token validation failed: {e}')

        return False