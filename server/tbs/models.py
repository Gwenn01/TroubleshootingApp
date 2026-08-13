from django.db import models


class Category(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["name"]


class Subcategory(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="subcategories"
    )

    name = models.CharField(
        max_length=150
    )

    def __str__(self):
        return f"{self.category.name} → {self.name}"

    class Meta:
        ordering = ["name"]

        constraints = [
            models.UniqueConstraint(
                fields=["category", "name"],
                name="unique_subcategory_per_category"
            )
        ]


class Problem(models.Model):

    # Example: SHARE-049
    problem_id = models.CharField(
        max_length=50,
        unique=True
    )

    subcategory = models.ForeignKey(
        Subcategory,
        on_delete=models.CASCADE,
        related_name="problems"
    )

    # Example: Shared folder not visible
    problem = models.CharField(
        max_length=255
    )

    description = models.TextField()

    symptoms = models.JSONField(
        default=list,
        blank=True
    )

    possible_causes = models.JSONField(
        default=list,
        blank=True
    )

    diagnostic_questions = models.JSONField(
        default=list,
        blank=True
    )

    commands = models.JSONField(
        default=list,
        blank=True
    )

    troubleshooting_steps = models.JSONField(
        default=list,
        blank=True
    )

    possible_solutions = models.JSONField(
        default=list,
        blank=True
    )

    prevention = models.JSONField(
        default=list,
        blank=True
    )

    keywords = models.JSONField(
        default=list,
        blank=True
    )

    difficulty = models.CharField(
        max_length=50,
        blank=True
    )

    estimated_fix_time = models.CharField(
        max_length=100,
        blank=True
    )

    related_problems = models.JSONField(
        default=list,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.problem_id} - {self.problem}"

    class Meta:
        ordering = ["problem_id"]