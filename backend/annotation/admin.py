from django.contrib import admin

from annotation.models import Label


# Register your models here.
@admin.register(Label)
class LabelAdmin(admin.ModelAdmin):
    list_display = ("text", "description")
    search_fields = ("text",)
