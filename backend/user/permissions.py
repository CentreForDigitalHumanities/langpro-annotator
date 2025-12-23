# Django permissions are uniquely identified by their combination of a `content_type__app_label` and a `codename`.
ANNOTATOR_PERMISSIONS = [
    ("problem", "view_silver_problems"),
]

MASTER_ANNOTATOR_PERMISSIONS = ANNOTATOR_PERMISSIONS + [
    ("problem", "copy_problems"),
    ("problem", "view_hidden_problems"),
    ("problem", "change_problem_status"),
    ("problem", "change_problem_visibility"),
    ("problem", "add_problem"),
    ("problem", "change_problem"),
    ("problem", "delete_problem"),
    ("problem", "view_problem"),
]
