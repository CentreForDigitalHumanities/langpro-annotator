# Django permissions are uniquely identified by their combination of a `content_type__app_label` and a `codename`.
annotator_permissions = [
    ("problem", "view_silver_problems"),
    ("problem", "add_knowledgebase"),
    ("problem", "change_knowledgebase"),
    ("problem", "delete_knowledgebase"),
    ("problem", "view_knowledgebase"),
]

master_annotator_permissions = annotator_permissions + [
    ("problem", "copy_problems"),
    ("problem", "view_hidden_problems"),
    ("problem", "change_problem_status"),
    ("problem", "change_problem_visibility"),
    ("problem", "add_problem"),
    ("problem", "change_problem"),
    ("problem", "delete_problem"),
    ("problem", "view_problem"),
]
