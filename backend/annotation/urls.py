from django.urls import path

from annotation.views import AnnotationEventsView

urlpatterns = [
    path("", AnnotationEventsView.as_view(), name="annotations"),
]
