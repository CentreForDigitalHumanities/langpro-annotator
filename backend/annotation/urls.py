from django.urls import path

from annotation.views import LabelListView


urlpatterns = [
    path("", LabelListView.as_view(), name="label_list"),
]
