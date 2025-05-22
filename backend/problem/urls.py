from django.urls import path
from problem.views import ProblemView

urlpatterns = [
    path("<int:problem_id>", ProblemView.as_view(), name="problem_view"),
]
