from django.contrib import admin
from annotation.models import AnnotationSession, ProblemAnnotation, KnowledgeBaseAnnotation

class InlineProblemAnnotationAdmin(admin.TabularInline):
    model = ProblemAnnotation

class KnowledgeBaseAnnotationAdmin(admin.TabularInline):
    model = KnowledgeBaseAnnotation

class AnnotationSessionAdmin(admin.ModelAdmin):
    inlines = (InlineProblemAnnotationAdmin, KnowledgeBaseAnnotationAdmin)

admin.site.register(AnnotationSession, AnnotationSessionAdmin)
admin.site.register(ProblemAnnotation)
admin.site.register(KnowledgeBaseAnnotation)
