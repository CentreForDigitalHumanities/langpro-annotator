from django.urls import path

from problem.views.parse import ParseView
from problem.views.problem import ProblemView
from problem.views.proof_bank_stats import ProofBankStatsView


urlpatterns = [
    path("<int:problem_id>", ProblemView.as_view(), name="problem_view"),
    path("proofbank-stats", ProofBankStatsView.as_view(), name="proofbank_stats"),
    path("parse", ParseView.as_view(), name="parse_view"),
]
