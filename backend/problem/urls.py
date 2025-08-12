from django.urls import path

from problem.views.parse import ParseView
from problem.views.problem import ProblemView


urlpatterns = [
    path("<int:problem_id>", ProblemView.as_view(), name="problem_view"),
    path("parse", ParseView.as_view(), name="parse_view"),
]
