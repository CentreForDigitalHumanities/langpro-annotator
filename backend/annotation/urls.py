from django.urls import path

from annotation.views import AnnotationsView

urlpatterns = [
    path("", AnnotationsView.as_view(), name="annotations"),
]
