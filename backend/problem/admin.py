from django.contrib import admin

from problem.models import Problem, Sentence


@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    search_fields = ("entailment_label", "dataset")
    list_display = ("__str__", "dataset", "entailment_label", "base", "get_hypothesis_text")

    @admin.display(description="hypothesis text")
    def get_hypothesis_text(self, obj):
        return obj.hypothesis.text if obj.hypothesis else None


@admin.register(Sentence)
class SentenceAdmin(admin.ModelAdmin):
    search_fields = ("text",)
