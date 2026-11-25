from django.urls import path

from annotation.views import AnnotationEventsView

urlpatterns = [
    path("", AnnotationEventsView.as_view({"get": "list"}), name="annotations"),
]
