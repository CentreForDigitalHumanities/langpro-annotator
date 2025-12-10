from django.urls import path

from problem.views.parse import ParseView

urlpatterns = [
    path("parse", ParseView.as_view(), name="parse_view"),
]
