from django.urls import path

from annotation.views import LabelsView


urlpatterns = [
    path("", LabelsView.as_view(), name="labels"),
]
