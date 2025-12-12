from django.contrib import admin
from django.contrib.auth import admin as auth_admin
from . import models
from django.utils.translation import gettext_lazy as _


@admin.register(models.User)
class UserAdmin(auth_admin.UserAdmin):
    list_display = ("username", "first_name", "email", "last_name", "is_staff")
