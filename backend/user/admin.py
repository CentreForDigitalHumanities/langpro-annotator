from typing import Any
from django.contrib import admin
from django.contrib.auth import admin as auth_admin
from django.http import HttpRequest
from . import models
from django.utils.translation import gettext_lazy as _


@admin.register(models.User)
class UserAdmin(auth_admin.UserAdmin):
    list_display = ("username", "first_name", "email", "last_name", "role", "is_staff")

    def get_fieldsets(
        self, request: HttpRequest, obj: models.User | None = None
    ) -> list[tuple[str | None, dict[str, Any]]]:
        user = request.user
        if user.is_superuser:
            admin_fieldset = super().get_fieldsets(request, obj)
            if len(admin_fieldset) >= 3:
                # Add the 'role' field to the admin fieldset for superusers.
                admin_fieldset[2][1]["fields"] = (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "role",
                    "groups",
                    "user_permissions",
                )
            return admin_fieldset

        # Non-superusers should not be able to edit password, is_superuser and groups through Django Admin.
        return [
            (None, {"fields": ("username",)}),
            (_("Personal info"), {"fields": ("first_name", "last_name", "email")}),
            (
                _("Permissions"),
                {
                    "fields": (
                        "is_active",
                        "is_staff",
                        "role",
                    ),
                },
            ),
        ]
