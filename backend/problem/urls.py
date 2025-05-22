from django.urls import path
from problem.views import ProblemView, ProofBankStatsView

urlpatterns = [
    path("<int:problem_id>", ProblemView.as_view(), name="problem_view"),
    path("proofbank-stats", ProofBankStatsView.as_view(), name="proofbank_stats"),
]
