from django.contrib import admin
from annotation.models import (
    AnnotationSession,
    Label,
    ProblemAnnotation,
    KnowledgeBaseAnnotation,
)


class InlineProblemAnnotationAdmin(admin.TabularInline):
    model = ProblemAnnotation


class KnowledgeBaseAnnotationAdmin(admin.TabularInline):
    model = KnowledgeBaseAnnotation


class AnnotationSessionAdmin(admin.ModelAdmin):
    inlines = (InlineProblemAnnotationAdmin, KnowledgeBaseAnnotationAdmin)


admin.site.register(AnnotationSession, AnnotationSessionAdmin)
admin.site.register(ProblemAnnotation)
admin.site.register(KnowledgeBaseAnnotation)


@admin.register(Label)
class LabelAdmin(admin.ModelAdmin):
    list_display = ("text", "description")
    search_fields = ("text",)
