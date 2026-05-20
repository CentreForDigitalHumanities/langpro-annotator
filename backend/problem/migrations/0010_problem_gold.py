from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("problem", "0009_problem_hidden"),
    ]

    operations = [
        migrations.AddField(
            model_name="problem",
            name="gold",
            field=models.BooleanField(default=False),
        ),
    ]
